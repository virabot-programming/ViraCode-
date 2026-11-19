/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Cloud,
  CheckCircle2,
  Code2,
  LayoutGrid,
  LogOut,
  Mail,
  MessageSquare,
  ShieldCheck,
  UserPlus,
  Video,
} from 'lucide-react';
import { VirtualFile } from '../../types/engine';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { ViraCodeLogo } from '../Branding/ViraCodeLogo';
import { GoogleChatPanel } from './GoogleChatPanel';
import { GmailPanel } from './GmailPanel';
import { GoogleDrivePanel } from './GoogleDrivePanel';
import { GoogleMeetPanel } from './GoogleMeetPanel';

export type DevFeedTab = 'overview' | 'googlechat' | 'gmail' | 'googledrive' | 'googlemeet';

interface VbpDevFeedWorkspaceProps {
  activeFile: VirtualFile | null;
  initialTab?: DevFeedTab;
  onReturnToEditor: () => void;
  onOpenFileInEditor: (file: { name: string; content: string }) => void;
}

export const VbpDevFeedWorkspace: React.FC<VbpDevFeedWorkspaceProps> = ({
  activeFile,
  initialTab = 'overview',
  onReturnToEditor,
  onOpenFileInEditor,
}) => {
  const { language } = useI18n();
  const isTr = language === 'tr';

  const {
    user,
    googleAccessToken,
    googleGmailAccessToken,
    googleDriveAccessToken,
    googleMeetAccessToken,
    keepSignedInOnDevice,
    setKeepSignedInOnDevice,
    differentAccountMode,
    setDifferentAccountMode,
    authError,
    signInWithDevFeed,
    signInWithGoogleChat,
    signInWithGmail,
    signInWithGoogleDrive,
    signInWithGoogleMeet,
    clearGoogleAccessToken,
    clearGoogleGmailAccessToken,
    clearGoogleDriveAccessToken,
    clearGoogleMeetAccessToken,
    signOutUser,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<DevFeedTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSelectTab = (tab: DevFeedTab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('viracode_devfeed_active_tab', tab);
    } catch {
      // Ignore storage errors
    }
  };

  const navTabs: Array<{ id: DevFeedTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'overview',
      label: isTr ? 'Genel Bakış' : 'Overview',
      icon: <LayoutGrid className="w-3.5 h-3.5" />,
    },
    {
      id: 'googlechat',
      label: 'Google Chat',
      icon: <MessageSquare className="w-3.5 h-3.5" />,
    },
    {
      id: 'gmail',
      label: 'Gmail',
      icon: <Mail className="w-3.5 h-3.5" />,
    },
    {
      id: 'googledrive',
      label: 'Google Drive',
      icon: <Cloud className="w-3.5 h-3.5" />,
    },
    {
      id: 'googlemeet',
      label: 'Google Meet',
      icon: <Video className="w-3.5 h-3.5" />,
    },
  ];

  const workspaceApps = [
    {
      id: 'googlechat' as const,
      name: 'Google Chat',
      icon: <MessageSquare className="w-5 h-5 text-red-400" />,
      connected: Boolean(googleAccessToken),
      onConnect: () => signInWithGoogleChat(),
      onDisconnect: clearGoogleAccessToken,
      summary: isTr
        ? 'Ekip sohbet alanlarını yönetin, yeni oda açın ve aktif kodunuzdan doğrudan kod parçacıkları gönderin.'
        : 'Manage team spaces, create channels, and send active code snippets straight to collaborators.',
      capabilities: isTr
        ? ['Alan listeleme ve oluşturma', 'Mesaj akışı ve yanıt', 'Editör kodu paylaşımı']
        : ['Browse & create spaces', 'Real-time message feed', 'IDE snippet sharing'],
    },
    {
      id: 'gmail' as const,
      name: 'Gmail',
      icon: <Mail className="w-5 h-5 text-red-400" />,
      connected: Boolean(googleGmailAccessToken),
      onConnect: () => signInWithGmail(),
      onDisconnect: clearGoogleGmailAccessToken,
      summary: isTr
        ? 'Gelen, giden, taslak ve yıldızlı kutularını tam ekran 3 panelli düzende okuyun ve yanıtlayın.'
        : 'Read, filter, search, draft, and reply across your mailbox in a full-screen 3-pane layout.',
      capabilities: isTr
        ? ['Etiket filtreleme & arama', 'Tam ekran okuma paneli', 'Taslak & kod ekli e-posta']
        : ['Label filtering & search', 'Full-screen reader', 'Drafts & code attachments'],
    },
    {
      id: 'googledrive' as const,
      name: 'Google Drive',
      icon: <Cloud className="w-5 h-5 text-red-400" />,
      connected: Boolean(googleDriveAccessToken),
      onConnect: () => signInWithGoogleDrive(),
      onDisconnect: clearGoogleDriveAccessToken,
      summary: isTr
        ? 'Dosya ve klasörlerinizi tablo görünümünde inceleyin, içerikleri önizleyip editörde açın veya yükleyin.'
        : 'Browse Drive files in a structured table, preview text inline, open in editor, or upload workspace code.',
      capabilities: isTr
        ? ['Klasör & dosya filtreleme', 'Satır içi içerik önizleme', 'Tek tıkla editöre aktarma']
        : ['Type filtering & search', 'Inline file preview', '1-click open in ViraCode'],
    },
    {
      id: 'googlemeet' as const,
      name: 'Google Meet',
      icon: <Video className="w-5 h-5 text-red-400" />,
      connected: Boolean(googleMeetAccessToken),
      onConnect: () => signInWithGoogleMeet(),
      onDisconnect: clearGoogleMeetAccessToken,
      summary: isTr
        ? 'Anında toplantı alanları oluşturun, erişim politikalarını düzenleyin ve konferans geçmişini denetleyin.'
        : 'Create instant meeting spaces, configure access policies, and inspect conference records.',
      capabilities: isTr
        ? ['OPEN / TRUSTED / RESTRICTED', 'Toplantı kodu ile bulma', 'Konferans kayıt geçmişi']
        : ['OPEN / TRUSTED / RESTRICTED', 'Code lookup & copy link', 'Conference records table'],
    },
  ];

  const connectedCount = workspaceApps.filter((a) => a.connected).length;

  return (
    <div className="h-full w-full flex flex-col bg-[#09090b] text-zinc-200 font-showcase-body antialiased overflow-hidden">
      {/* Three-Zone Full-Screen Studio Header Bar */}
      <header className="h-16 shrink-0 bg-[#09090b]/95 border-b border-white/[0.06] px-6 sm:px-10 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Title */}
        <button
          type="button"
          onClick={() => handleSelectTab('overview')}
          className="font-showcase-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2.5 hover:text-red-400 transition-colors"
        >
          <ViraCodeLogo decorative className="!h-3.5 sm:!h-4" />
          <span>VBP DevFeed</span>
        </button>

        {/* Zone 2: Single-line Navigation Tabs */}
        <nav
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar"
          aria-label="VBP DevFeed Workspace Navigation"
        >
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-red-600/15 text-white border border-red-500/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-red-400' : 'text-zinc-500'}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Device Session Badge, Switch Account & Return to Editor */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user && (
            <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400 pr-2 border-r border-zinc-800">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google Account'}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <span className="max-w-[150px] truncate text-zinc-200 font-medium">
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={() => signInWithDevFeed({ forceSelectAccount: true })}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title={isTr ? 'Farklı Hesapla Giriş Yap' : 'Switch Google Account'}
                aria-label={isTr ? 'Farklı Hesapla Giriş Yap' : 'Switch Google Account'}
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onReturnToEditor}
            className="viracode-sheen-btn px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isTr ? 'Editöre Dön' : 'Open Editor'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && (
          <div className="h-full overflow-y-auto px-6 sm:px-10 py-10">
            <div className="max-w-[1180px] mx-auto space-y-10">
              {/* Hero Summary */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/[0.06] pb-8">
                <div className="space-y-2.5 max-w-2xl">
                  <p className="text-xs font-medium text-red-400 tracking-wide">
                    {isTr
                      ? 'VBP DevFeed · Güvenli Google Workspace Kontrol Merkezi'
                      : 'VBP DevFeed · Secure Google Workspace Control Center'}
                  </p>
                  <h1
                    style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', textWrap: 'balance' }}
                    className="font-showcase-display font-bold tracking-tight text-white leading-tight"
                  >
                    {isTr
                      ? 'Chat, Gmail, Drive ve Meet tek merkezde.'
                      : 'Control Chat, Gmail, Drive, and Meet from one place.'}
                  </h1>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {isTr
                      ? 'Tüm Google Workspace uygulamalarını güvenli, bellek içi OAuth doğrulamasıyla yönetin. Oturumunuz yalnızca "Oturumu açık tut" seçeneği işaretlendiğinde cihazda kalıcı olarak hatırlanır; istediğiniz zaman farklı bir Google hesabına geçebilirsiniz.'
                      : 'Manage every Google Workspace app with verified, memory-only OAuth tokens. Your session only stays persisted across restarts when "Keep session open" is checked, and you can switch Google accounts anytime.'}
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-xs font-mono text-zinc-400">
                  <div className="space-y-1">
                    <div className="text-zinc-500">
                      {isTr ? 'Bağlı Uygulama' : 'Connected Apps'}
                    </div>
                    <div className="text-lg font-bold text-white tabular-nums">
                      {connectedCount} / 4
                    </div>
                  </div>
                  <div className="h-8 w-px bg-zinc-800" />
                  <div className="space-y-1">
                    <div className="text-zinc-500">
                      {isTr ? 'Oturum Modu' : 'Session Mode'}
                    </div>
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {user
                          ? keepSignedInOnDevice
                            ? isTr
                              ? 'Kalıcı (Açık)'
                              : 'Persistent (On)'
                            : isTr
                            ? 'Geçici Sekme'
                            : 'Session Only'
                          : isTr
                          ? 'Bellek İçi OAuth'
                          : 'In-Memory OAuth'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Session & Different Account Mode Strip */}
              <div className="bg-[#111115] border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-sm font-semibold text-white">
                        {user
                          ? isTr
                            ? `Aktif Hesap: ${user.displayName || user.email}`
                            : `Signed in as ${user.displayName || user.email}`
                          : isTr
                          ? 'Google Workspace Oturumu'
                          : 'Google Workspace Session'}
                      </span>

                      <label className="inline-flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={keepSignedInOnDevice}
                          onChange={(e) => setKeepSignedInOnDevice(e.target.checked)}
                          className="rounded accent-red-500 cursor-pointer"
                        />
                        <span>
                          {isTr
                            ? 'Oturumu açık tut'
                            : 'Keep session open'}
                        </span>
                      </label>

                      <label className="inline-flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={differentAccountMode}
                          onChange={(e) => setDifferentAccountMode(e.target.checked)}
                          className="rounded accent-red-500 cursor-pointer"
                        />
                        <span>
                          {isTr
                            ? 'Farklı bir hesapla giriş modu'
                            : 'Sign in with different account mode'}
                        </span>
                      </label>
                    </div>

                    <p className="text-xs text-zinc-400">
                      {keepSignedInOnDevice
                        ? isTr
                          ? 'Oturumu açık tut işaretli: Google hesabınız bu cihazda hatırlanır; tarayıcı yenilense de tekrar hesap seçmeden devam edebilirsiniz.'
                          : 'Keep session open is enabled: your Google account is remembered on this device.'
                        : isTr
                        ? 'Oturumu açık tut kapalı: Tarayıcı/sekme kapatıldığında hesap oturumu otomatik temizlenir, aynı hesap kalıcı olarak kilitlenmez.'
                        : 'Keep session open is off: your account is only kept for this browser tab session and clears when closed.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {connectedCount < 4 && (
                      <button
                        type="button"
                        onClick={() => signInWithDevFeed()}
                        className="gsi-material-button"
                        aria-label={isTr ? 'Google ile Bağlan' : 'Sign in with Google'}
                      >
                        <div className="gsi-material-button-state" />
                        <div className="gsi-material-button-content-wrapper">
                          <div className="gsi-material-button-icon">
                            <svg
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 48 48"
                              style={{ display: 'block' }}
                            >
                              <path
                                fill="#EA4335"
                                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                              />
                              <path
                                fill="#4285F4"
                                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                              />
                              <path
                                fill="#34A853"
                                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                              />
                              <path fill="none" d="M0 0h48v48H0z" />
                            </svg>
                          </div>
                          <span className="gsi-material-button-contents">
                            {user && keepSignedInOnDevice && !differentAccountMode
                              ? isTr
                                ? 'Oturumu Devam Ettir'
                                : 'Resume Session'
                              : 'Sign in with Google'}
                          </span>
                        </div>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => signInWithDevFeed({ forceSelectAccount: true })}
                      className="px-3.5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-200 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-red-400" />
                      <span>{isTr ? 'Farklı Hesapla Giriş' : 'Use Another Account'}</span>
                    </button>

                    {user && (
                      <button
                        type="button"
                        onClick={signOutUser}
                        className="px-3.5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{isTr ? 'Çıkış Yap' : 'Sign Out'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs font-mono text-red-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="break-words">{authError}</span>
                  </div>
                )}
              </div>

              {/* Active IDE File Quick Context Strip */}
              {activeFile && (
                <div className="bg-[#111115] border border-zinc-800/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <Code2 className="w-5 h-5 text-red-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {isTr ? 'Aktif Editör Dosyası:' : 'Active Editor File:'}{' '}
                        <span className="font-mono text-red-300">{activeFile.path}</span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        {isTr
                          ? 'Bu dosyayı doğrudan Gmail iletisinde paylaşabilir, Google Chat alanına ekleyebilir veya Google Drive hesabınıza yükleyebilirsiniz.'
                          : 'Attach this file directly in Gmail, share snippets in Google Chat, or upload it to Google Drive.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelectTab('googlechat')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 cursor-pointer whitespace-nowrap"
                    >
                      Google Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectTab('gmail')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 cursor-pointer whitespace-nowrap"
                    >
                      Gmail
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectTab('googledrive')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
                    >
                      {isTr ? 'Drive\'a Aktar' : 'Open in Drive'}
                    </button>
                  </div>
                </div>
              )}

              {/* Four Google Workspace Application Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workspaceApps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-[#111115] border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-colors"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-[#09090b] border border-zinc-800 flex items-center justify-center shrink-0">
                            {app.icon}
                          </div>
                          <div>
                            <h2 className="font-showcase-display text-lg font-bold text-white">
                              {app.name}
                            </h2>
                            <div className="text-xs font-mono flex items-center space-x-1.5 mt-0.5">
                              {app.connected ? (
                                <span className="text-emerald-400 inline-flex items-center space-x-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{isTr ? 'Oturum Açık' : 'Connected'}</span>
                                </span>
                              ) : (
                                <span className="text-zinc-500">
                                  {isTr ? 'Bağlantı Bekleniyor' : 'Not Connected'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {app.connected && (
                          <button
                            type="button"
                            onClick={app.onDisconnect}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
                            title={isTr ? 'Oturumu Kapat' : 'Disconnect'}
                            aria-label={`Disconnect ${app.name}`}
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-zinc-400 leading-relaxed">{app.summary}</p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        {app.capabilities.map((cap, idx) => (
                          <React.Fragment key={cap}>
                            <span>{cap}</span>
                            {idx < app.capabilities.length - 1 && (
                              <span aria-hidden="true">·</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                      {!app.connected ? (
                        <button
                          type="button"
                          onClick={app.onConnect}
                          className="gsi-material-button"
                          aria-label={`Sign in with Google for ${app.name}`}
                        >
                          <div className="gsi-material-button-state" />
                          <div className="gsi-material-button-content-wrapper">
                            <div className="gsi-material-button-icon">
                              <svg
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 48 48"
                                style={{ display: 'block' }}
                              >
                                <path
                                  fill="#EA4335"
                                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                                />
                                <path
                                  fill="#4285F4"
                                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                                />
                                <path fill="none" d="M0 0h48v48H0z" />
                              </svg>
                            </div>
                            <span className="gsi-material-button-contents">Sign in with Google</span>
                          </div>
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-zinc-400">
                          {isTr ? 'Yetkilendirme aktif' : 'Authorization active'}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSelectTab(app.id)}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold inline-flex items-center space-x-2 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>{isTr ? 'Tam Ekranda Aç' : 'Open Workspace'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'googlechat' && <GoogleChatPanel activeFile={activeFile} />}
        {activeTab === 'gmail' && <GmailPanel activeFile={activeFile} />}
        {activeTab === 'googledrive' && (
          <GoogleDrivePanel activeFile={activeFile} onOpenFileInEditor={onOpenFileInEditor} />
        )}
        {activeTab === 'googlemeet' && <GoogleMeetPanel />}
      </div>
    </div>
  );
};
