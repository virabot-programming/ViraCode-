import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  auth,
  applyAuthPersistence,
  CHAT_SCOPES,
  GMAIL_SCOPES,
  DRIVE_SCOPES,
  MEET_SCOPES,
  createBasicGoogleAuthProvider,
  createDevFeedAuthProvider,
  createScopedGoogleAuthProvider,
  verifyGoogleTokenScopes,
} from '../lib/firebase';

const KEEP_SIGNED_IN_KEY = 'viracode_devfeed_keep_signed_in';
const TAB_SESSION_MARKER = 'viracode_tab_session_active';

export interface SignInOptions {
  forceSelectAccount?: boolean;
}

interface AuthContextValue {
  user: User | null;
  idToken: string | null;
  googleAccessToken: string | null;
  googleGmailAccessToken: string | null;
  googleDriveAccessToken: string | null;
  googleMeetAccessToken: string | null;
  keepSignedInOnDevice: boolean;
  setKeepSignedInOnDevice: (enabled: boolean) => Promise<void>;
  differentAccountMode: boolean;
  setDifferentAccountMode: (enabled: boolean) => void;
  isAuthLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: (options?: SignInOptions) => Promise<void>;
  signInWithDevFeed: (options?: SignInOptions) => Promise<string | null>;
  signInWithGoogleChat: (options?: SignInOptions) => Promise<string | null>;
  signInWithGmail: (options?: SignInOptions) => Promise<string | null>;
  signInWithGoogleDrive: (options?: SignInOptions) => Promise<string | null>;
  signInWithGoogleMeet: (options?: SignInOptions) => Promise<string | null>;
  clearGoogleAccessToken: () => void;
  clearGoogleGmailAccessToken: () => void;
  clearGoogleDriveAccessToken: () => void;
  clearGoogleMeetAccessToken: () => void;
  disconnectAllDevFeedTokens: () => void;
  signOutUser: () => Promise<void>;
  getFreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function markTabSessionActive() {
  try {
    sessionStorage.setItem(TAB_SESSION_MARKER, '1');
  } catch {
    // ignore storage errors
  }
}

function isTabSessionActive(): boolean {
  try {
    return sessionStorage.getItem(TAB_SESSION_MARKER) === '1';
  } catch {
    return false;
  }
}

function clearTabSessionMarker() {
  try {
    sessionStorage.removeItem(TAB_SESSION_MARKER);
  } catch {
    // ignore storage errors
  }
}

function formatReadableAuthError(err: any): string {
  const code = String(err?.code || '');
  const message = String(err?.message || '');
  const combined = `${code} ${message}`.toLowerCase();

  if (combined.includes('403') || combined.includes('access_denied')) {
    return 'Google erişim izni reddedildi (403). Lütfen "Farklı Hesapla Giriş" seçeneğini kullanarak yetkili bir Google hesabıyla tekrar deneyin.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Açılır pencere (popup) tarayıcı tarafından engellendi. Lütfen bu site için pop-up izni verip tekrar deneyin.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Bu alan adı kimlik doğrulama için yetkilendirilmemiş görünüyor. Farklı bir tarayıcı sekmesinde veya yetkili adres üzerinden deneyin.';
  }
  if (code === 'auth/cancelled-popup-request') {
    return 'Önceki giriş penceresi iptal edildi. Lütfen tekrar deneyin.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Ağ bağlantısı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.';
  }
  return message || 'Kimlik doğrulama tamamlanamadı.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  // Access tokens are cached strictly in memory (never localStorage or sessionStorage)
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [googleGmailAccessToken, setGoogleGmailAccessToken] = useState<string | null>(null);
  const [googleDriveAccessToken, setGoogleDriveAccessToken] = useState<string | null>(null);
  const [googleMeetAccessToken, setGoogleMeetAccessToken] = useState<string | null>(null);

  // Default is false: session only stays open across browser restarts when explicitly checked
  const [keepSignedInOnDevice, setKeepSignedInOnDeviceState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(KEEP_SIGNED_IN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [differentAccountMode, setDifferentAccountMode] = useState<boolean>(false);

  const cachedAccessTokenRef = useRef<string | null>(null);
  const cachedGmailAccessTokenRef = useRef<string | null>(null);
  const cachedDriveAccessTokenRef = useRef<string | null>(null);
  const cachedMeetAccessTokenRef = useRef<string | null>(null);
  const isSigningInRef = useRef<boolean>(false);

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const initSession = async () => {
      await applyAuthPersistence(keepSignedInOnDevice);
      // If "Keep signed in" is NOT checked and this is a fresh session (no active tab marker),
      // clear any stale local user left over from an earlier session so the same account never stays forever.
      if (!keepSignedInOnDevice && !isTabSessionActive() && auth.currentUser) {
        try {
          await signOut(auth);
        } catch {
          // ignore
        }
      }
      if (!active) return;
    };
    initSession();
    return () => {
      active = false;
    };
  }, [keepSignedInOnDevice]);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (
        firebaseUser &&
        !keepSignedInOnDevice &&
        !isTabSessionActive() &&
        !isSigningInRef.current
      ) {
        // Stale user from earlier browser session while Keep Signed In is unchecked
        try {
          await signOut(auth);
        } catch {
          // ignore
        }
        return;
      }

      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
        } catch {
          setIdToken(null);
        }
      } else {
        setIdToken(null);
        cachedAccessTokenRef.current = null;
        cachedGmailAccessTokenRef.current = null;
        cachedDriveAccessTokenRef.current = null;
        cachedMeetAccessTokenRef.current = null;
        setGoogleAccessToken(null);
        setGoogleGmailAccessToken(null);
        setGoogleDriveAccessToken(null);
        setGoogleMeetAccessToken(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [keepSignedInOnDevice]);

  const clearAuthError = () => setAuthError(null);

  const setKeepSignedInOnDevice = async (enabled: boolean) => {
    setKeepSignedInOnDeviceState(enabled);
    try {
      localStorage.setItem(KEEP_SIGNED_IN_KEY, String(enabled));
    } catch {
      // Ignore storage quota errors
    }
    if (!enabled && auth.currentUser) {
      markTabSessionActive();
    }
    await applyAuthPersistence(enabled);
  };

  const clearAllTokens = () => {
    cachedAccessTokenRef.current = null;
    cachedGmailAccessTokenRef.current = null;
    cachedDriveAccessTokenRef.current = null;
    cachedMeetAccessTokenRef.current = null;
    setGoogleAccessToken(null);
    setGoogleGmailAccessToken(null);
    setGoogleDriveAccessToken(null);
    setGoogleMeetAccessToken(null);
  };

  const populateVerifiedTokens = async (
    accessToken: string,
    requestedFallback: { chat?: boolean; gmail?: boolean; drive?: boolean; meet?: boolean }
  ) => {
    const info = await verifyGoogleTokenScopes(accessToken);

    const hasChat = info
      ? Array.from(info.scopes).some((s) => s.includes('chat.'))
      : Boolean(requestedFallback.chat);
    const hasGmail = info
      ? Array.from(info.scopes).some((s) => s.includes('gmail.'))
      : Boolean(requestedFallback.gmail);
    const hasDrive = info
      ? Array.from(info.scopes).some((s) => s.includes('drive'))
      : Boolean(requestedFallback.drive);
    const hasMeet = info
      ? Array.from(info.scopes).some((s) => s.includes('meetings.space'))
      : Boolean(requestedFallback.meet);

    if (hasChat) {
      cachedAccessTokenRef.current = accessToken;
      setGoogleAccessToken(accessToken);
    }
    if (hasGmail) {
      cachedGmailAccessTokenRef.current = accessToken;
      setGoogleGmailAccessToken(accessToken);
    }
    if (hasDrive) {
      cachedDriveAccessTokenRef.current = accessToken;
      setGoogleDriveAccessToken(accessToken);
    }
    if (hasMeet) {
      cachedMeetAccessTokenRef.current = accessToken;
      setGoogleMeetAccessToken(accessToken);
    }
  };

  const resolveProviderOptions = (options?: SignInOptions) => {
    const forceSelect = Boolean(options?.forceSelectAccount || differentAccountMode);
    const loginHint =
      !forceSelect && keepSignedInOnDevice && user?.email ? user.email : null;
    return { forceSelectAccount: forceSelect, loginHint };
  };

  const signInWithGoogle = async (options?: SignInOptions) => {
    setAuthError(null);
    const providerOpts = resolveProviderOptions(options);
    isSigningInRef.current = true;
    try {
      await applyAuthPersistence(keepSignedInOnDevice);
      if (providerOpts.forceSelectAccount) {
        clearAllTokens();
      }
      const provider = createBasicGoogleAuthProvider(providerOpts);
      const result = await signInWithPopup(auth, provider);
      markTabSessionActive();
      const token = await result.user.getIdToken();
      setIdToken(token);
      if (options?.forceSelectAccount) {
        setDifferentAccountMode(false);
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(formatReadableAuthError(err));
      }
    } finally {
      isSigningInRef.current = false;
    }
  };

  const signInWithDevFeed = async (options?: SignInOptions): Promise<string | null> => {
    setAuthError(null);
    const providerOpts = resolveProviderOptions(options);
    isSigningInRef.current = true;
    try {
      await applyAuthPersistence(keepSignedInOnDevice);
      if (providerOpts.forceSelectAccount) {
        clearAllTokens();
      }
      const provider = createDevFeedAuthProvider(providerOpts);
      const result = await signInWithPopup(auth, provider);
      markTabSessionActive();
      const idTok = await result.user.getIdToken();
      setIdToken(idTok);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Google OAuth erişim anahtarı alınamadı.');
      }
      await populateVerifiedTokens(credential.accessToken, {
        chat: true,
        gmail: true,
        drive: true,
        meet: true,
      });
      if (options?.forceSelectAccount) {
        setDifferentAccountMode(false);
      }
      return credential.accessToken;
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(formatReadableAuthError(err));
      }
      return null;
    } finally {
      isSigningInRef.current = false;
    }
  };

  const signInWithScopedProvider = async (
    scopes: readonly string[],
    targetService: 'chat' | 'gmail' | 'drive' | 'meet',
    ref: React.MutableRefObject<string | null>,
    setter: React.Dispatch<React.SetStateAction<string | null>>,
    options?: SignInOptions
  ): Promise<string | null> => {
    setAuthError(null);
    const providerOpts = resolveProviderOptions(options);
    isSigningInRef.current = true;
    try {
      await applyAuthPersistence(keepSignedInOnDevice);
      if (providerOpts.forceSelectAccount) {
        clearAllTokens();
      }

      // Request only the target service's scoped provider first to avoid unnecessary OAuth 403s
      const scopedProvider = createScopedGoogleAuthProvider(scopes, providerOpts);
      const result = await signInWithPopup(auth, scopedProvider);
      markTabSessionActive();
      const idTok = await result.user.getIdToken();
      setIdToken(idTok);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Google OAuth erişim anahtarı alınamadı.');
      }

      await populateVerifiedTokens(credential.accessToken, {
        [targetService]: true,
      });

      // Ensure the requested service ref/state is set if tokeninfo didn't block it
      if (!ref.current) {
        ref.current = credential.accessToken;
        setter(credential.accessToken);
      }

      if (options?.forceSelectAccount) {
        setDifferentAccountMode(false);
      }
      return credential.accessToken;
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(formatReadableAuthError(err));
      }
      return null;
    } finally {
      isSigningInRef.current = false;
    }
  };

  const signInWithGoogleChat = (options?: SignInOptions) =>
    signInWithScopedProvider(
      CHAT_SCOPES,
      'chat',
      cachedAccessTokenRef,
      setGoogleAccessToken,
      options
    );

  const signInWithGmail = (options?: SignInOptions) =>
    signInWithScopedProvider(
      GMAIL_SCOPES,
      'gmail',
      cachedGmailAccessTokenRef,
      setGoogleGmailAccessToken,
      options
    );

  const signInWithGoogleDrive = (options?: SignInOptions) =>
    signInWithScopedProvider(
      DRIVE_SCOPES,
      'drive',
      cachedDriveAccessTokenRef,
      setGoogleDriveAccessToken,
      options
    );

  const signInWithGoogleMeet = (options?: SignInOptions) =>
    signInWithScopedProvider(
      MEET_SCOPES,
      'meet',
      cachedMeetAccessTokenRef,
      setGoogleMeetAccessToken,
      options
    );

  const clearGoogleAccessToken = () => {
    cachedAccessTokenRef.current = null;
    setGoogleAccessToken(null);
  };

  const clearGoogleGmailAccessToken = () => {
    cachedGmailAccessTokenRef.current = null;
    setGoogleGmailAccessToken(null);
  };

  const clearGoogleDriveAccessToken = () => {
    cachedDriveAccessTokenRef.current = null;
    setGoogleDriveAccessToken(null);
  };

  const clearGoogleMeetAccessToken = () => {
    cachedMeetAccessTokenRef.current = null;
    setGoogleMeetAccessToken(null);
  };

  const disconnectAllDevFeedTokens = () => {
    clearAllTokens();
  };

  const signOutUser = async () => {
    setAuthError(null);
    clearTabSessionMarker();
    try {
      await signOut(auth);
      setIdToken(null);
      clearAllTokens();
    } catch (err: any) {
      setAuthError(formatReadableAuthError(err));
    }
  };

  const getFreshToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      const token = await auth.currentUser.getIdToken();
      setIdToken(token);
      return token;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        idToken,
        googleAccessToken,
        googleGmailAccessToken,
        googleDriveAccessToken,
        googleMeetAccessToken,
        keepSignedInOnDevice,
        setKeepSignedInOnDevice,
        differentAccountMode,
        setDifferentAccountMode,
        isAuthLoading,
        authError,
        clearAuthError,
        signInWithGoogle,
        signInWithDevFeed,
        signInWithGoogleChat,
        signInWithGmail,
        signInWithGoogleDrive,
        signInWithGoogleMeet,
        clearGoogleAccessToken,
        clearGoogleGmailAccessToken,
        clearGoogleDriveAccessToken,
        clearGoogleMeetAccessToken,
        disconnectAllDevFeedTokens,
        signOutUser,
        getFreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
