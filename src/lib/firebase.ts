import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export const applyAuthPersistence = async (keepSignedIn: boolean): Promise<void> => {
  try {
    await setPersistence(
      auth,
      keepSignedIn ? browserLocalPersistence : browserSessionPersistence
    );
  } catch (err) {
    console.warn('Failed to apply Firebase auth persistence:', err);
  }
};

export const CHAT_SCOPES = [
  'https://www.googleapis.com/auth/chat.memberships.readonly',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.messages.create',
  'https://www.googleapis.com/auth/chat.messages.readonly',
  'https://www.googleapis.com/auth/chat.spaces',
  'https://www.googleapis.com/auth/chat.spaces.create',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
] as const;

export const googleChatAuthProvider = new GoogleAuthProvider();
CHAT_SCOPES.forEach((scope) => {
  googleChatAuthProvider.addScope(scope);
});

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
] as const;

export const googleGmailAuthProvider = new GoogleAuthProvider();
GMAIL_SCOPES.forEach((scope) => {
  googleGmailAuthProvider.addScope(scope);
});

export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
] as const;

export const googleDriveAuthProvider = new GoogleAuthProvider();
DRIVE_SCOPES.forEach((scope) => {
  googleDriveAuthProvider.addScope(scope);
});

export const MEET_SCOPES = [
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly',
  'https://www.googleapis.com/auth/meetings.space.settings',
] as const;

export const googleMeetAuthProvider = new GoogleAuthProvider();
MEET_SCOPES.forEach((scope) => {
  googleMeetAuthProvider.addScope(scope);
});

export const DEVFEED_COMBINED_SCOPES = [
  ...GMAIL_SCOPES,
  ...DRIVE_SCOPES,
  ...MEET_SCOPES,
  ...CHAT_SCOPES,
] as const;

export interface ProviderAuthOptions {
  loginHint?: string | null;
  forceSelectAccount?: boolean;
}

export const createBasicGoogleAuthProvider = (
  options?: ProviderAuthOptions
): GoogleAuthProvider => {
  const provider = new GoogleAuthProvider();
  if (options?.forceSelectAccount || !options?.loginHint) {
    provider.setCustomParameters({ prompt: 'select_account' });
  } else {
    provider.setCustomParameters({ login_hint: options.loginHint });
  }
  return provider;
};

export const createScopedGoogleAuthProvider = (
  scopes: readonly string[],
  options?: ProviderAuthOptions
): GoogleAuthProvider => {
  const provider = new GoogleAuthProvider();
  scopes.forEach((scope) => {
    provider.addScope(scope);
  });
  if (options?.forceSelectAccount || !options?.loginHint) {
    provider.setCustomParameters({ prompt: 'select_account' });
  } else {
    provider.setCustomParameters({ login_hint: options.loginHint });
  }
  return provider;
};

export const createDevFeedAuthProvider = (
  options?: ProviderAuthOptions
): GoogleAuthProvider => {
  return createScopedGoogleAuthProvider(DEVFEED_COMBINED_SCOPES, options);
};

export interface VerifiedTokenInfo {
  scopes: Set<string>;
  email?: string;
  emailVerified: boolean;
}

/**
 * Verifies an OAuth access token via Google's tokeninfo endpoint using POST
 * body (so the token is never placed in URL query strings) and returns the
 * actually granted scopes.
 */
export const verifyGoogleTokenScopes = async (
  accessToken: string
): Promise<VerifiedTokenInfo | null> => {
  try {
    const res = await fetch('https://oauth2.googleapis.com/tokeninfo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ access_token: accessToken }).toString(),
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const rawScope = typeof data.scope === 'string' ? data.scope : '';
    const scopes = new Set<string>(
      rawScope
        .split(/\s+/)
        .map((s: string) => s.trim())
        .filter(Boolean)
    );
    return {
      scopes,
      email: typeof data.email === 'string' ? data.email : undefined,
      emailVerified: data.email_verified === 'true' || data.email_verified === true,
    };
  } catch {
    return null;
  }
};
