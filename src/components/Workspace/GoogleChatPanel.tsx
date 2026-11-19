/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  MessageSquare,
  RefreshCw,
  Plus,
  Send,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Code2,
  Hash,
  Search,
  X,
  Users,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { VirtualFile } from '../../types/engine';
import firebaseConfig from '../../../firebase-applet-config.json';
import {
  ChatMessage,
  ChatSpace,
  GoogleChatApiError,
  createChatSpace,
  deleteSpaceMessage,
  listChatSpaces,
  listSpaceMessages,
  sendSpaceMessage,
} from '../../services/googleChat';

interface GoogleChatPanelProps {
  activeFile?: VirtualFile | null;
}

type PendingAction =
  | { type: 'sendMessage'; spaceName: string; spaceTitle: string; text: string }
  | { type: 'deleteMessage'; messageName: string; preview: string }
  | { type: 'createSpace'; displayName: string };

const CHAT_CONFIG_URL = `https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=${firebaseConfig.projectId}`;

export const GoogleChatPanel: React.FC<GoogleChatPanelProps> = ({ activeFile }) => {
  const { language } = useI18n();
  const isTr = language === 'tr';
  const {
    user,
    keepSignedInOnDevice,
    setKeepSignedInOnDevice,
    googleAccessToken,
    authError,
    signInWithGoogleChat,
    clearGoogleAccessToken,
  } = useAuth();

  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [spaceFilter, setSpaceFilter] = useState<string>('');
  const [selectedSpace, setSelectedSpace] = useState<ChatSpace | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<{ message: string; status?: number } | null>(null);

  const [draftMessage, setDraftMessage] = useState<string>('');
  const [isAddingSpace, setIsAddingSpace] = useState<boolean>(false);
  const [newSpaceName, setNewSpaceName] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof GoogleChatApiError) {
        if (err.status === 401) {
          clearGoogleAccessToken();
        } else if (err.status === 403) {
          const lower = err.message.toLowerCase();
          if (lower.includes('insufficient') || lower.includes('scope')) {
            clearGoogleAccessToken();
          }
          setApiError({
            status: 403,
            message: isTr
              ? 'Google Chat erişimi reddedildi (403). Bireysel @gmail.com hesaplarında Google Chat API desteklenmez; kurumsal bir Google Workspace hesabıyla "Farklı Hesapla Giriş" yapabilirsiniz.'
              : 'Google Chat access denied (403). Google Chat API requires a Business or Enterprise Google Workspace account; switch to a Workspace account to continue.',
          });
          return;
        }
        setApiError({ message: err.message, status: err.status });
      } else if (err instanceof Error) {
        setApiError({ message: err.message });
      } else {
        setApiError({
          message: isTr ? 'Google Chat isteği başarısız oldu.' : 'Google Chat request failed.',
        });
      }
    },
    [clearGoogleAccessToken, isTr]
  );

  const loadSpaces = useCallback(async () => {
    if (!googleAccessToken) return;
    setIsLoadingSpaces(true);
    setApiError(null);
    try {
      const list = await listChatSpaces(googleAccessToken);
      setSpaces(list);
      setSelectedSpace((prev) => {
        if (prev && list.some((s) => s.name === prev.name)) {
          return prev;
        }
        return list[0] ?? null;
      });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoadingSpaces(false);
    }
  }, [googleAccessToken, handleApiError]);

  const loadMessages = useCallback(
    async (spaceName: string) => {
      if (!googleAccessToken) return;
      setIsLoadingMessages(true);
      setApiError(null);
      try {
        const list = await listSpaceMessages(googleAccessToken, spaceName);
        setMessages(list);
      } catch (err) {
        handleApiError(err);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [googleAccessToken, handleApiError]
  );

  useEffect(() => {
    if (googleAccessToken) {
      loadSpaces();
    } else {
      setSpaces([]);
      setSelectedSpace(null);
      setMessages([]);
    }
  }, [googleAccessToken, loadSpaces]);

  useEffect(() => {
    if (googleAccessToken && selectedSpace?.name) {
      loadMessages(selectedSpace.name);
    } else {
      setMessages([]);
    }
  }, [googleAccessToken, selectedSpace, loadMessages]);

  const executePendingAction = async () => {
    if (!pendingAction || !googleAccessToken) return;
    setIsMutating(true);
    setApiError(null);
    try {
      if (pendingAction.type === 'sendMessage') {
        const created = await sendSpaceMessage(
          googleAccessToken,
          pendingAction.spaceName,
          pendingAction.text
        );
        setMessages((prev) => [...prev, created]);
        setDraftMessage('');
      } else if (pendingAction.type === 'deleteMessage') {
        await deleteSpaceMessage(googleAccessToken, pendingAction.messageName);
        setMessages((prev) => prev.filter((m) => m.name !== pendingAction.messageName));
      } else if (pendingAction.type === 'createSpace') {
        const createdSpace = await createChatSpace(
          googleAccessToken,
          pendingAction.displayName
        );
        setSpaces((prev) => [createdSpace, ...prev]);
        setSelectedSpace(createdSpace);
        setIsAddingSpace(false);
        setNewSpaceName('');
      }
      setPendingAction(null);
    } catch (err) {
      handleApiError(err);
      setPendingAction(null);
    } finally {
      setIsMutating(false);
    }
  };

  const formatSpaceLabel = (space: ChatSpace) => {
    if (space.displayName) return space.displayName;
    if (space.spaceType === 'DIRECT_MESSAGE' || space.type === 'DM') {
      return isTr ? 'Doğrudan Mesaj' : 'Direct Message';
    }
    return space.name;
  };

  const formatSpaceKind = (space: ChatSpace) => {
    const t = space.spaceType || space.type || 'SPACE';
    if (t === 'DIRECT_MESSAGE' || t === 'DM') return isTr ? 'Doğrudan Mesaj' : 'Direct Message';
    if (t === 'GROUP_CHAT') return isTr ? 'Grup Sohbeti' : 'Group Chat';
    return isTr ? 'Ekip Alanı' : 'Team Space';
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleString(isTr ? 'tr-TR' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const filteredSpaces = spaces.filter((s) =>
    formatSpaceLabel(s).toLowerCase().includes(spaceFilter.trim().toLowerCase())
  );

  const isNotConfiguredError =
    apiError?.status === 404 ||
    apiError?.message?.toLowerCase().includes('chat app not found') ||
    apiError?.message?.toLowerCase().includes('hangouts-chat');

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-200 font-showcase-body select-none overflow-hidden relative">
      {!googleAccessToken ? (
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
          <div className="max-w-lg w-full bg-[#111115] border border-zinc-800/80 rounded-2xl p-8 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="font-showcase-display text-xl font-bold text-white">
                {isTr ? 'Google Chat Çalışma Alanı' : 'Google Chat Workspace'}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {user && keepSignedInOnDevice
                  ? isTr
                    ? `Bu cihazda ${user.email || user.displayName} hesabı açık. DevFeed hizmetlerine erişimi sürdürmek için tek tıkla doğrulayın.`
                    : `Signed in on this device as ${user.email || user.displayName}. Resume Workspace access in one click.`
                  : isTr
                  ? 'Ekip alanlarınızı görüntülemek, yeni sohbet odaları açmak ve aktif kodunuzdan doğrudan ekip arkadaşlarınıza mesaj göndermek için oturum açın.'
                  : 'Sign in with your Google Workspace account to browse spaces, create rooms, and share code snippets directly with your team.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => signInWithGoogleChat()}
                className="gsi-material-button"
                aria-label="Sign in with Google"
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

              <button
                type="button"
                onClick={() => signInWithGoogleChat({ forceSelectAccount: true })}
                className="px-3.5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-200 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-red-400" />
                <span>{isTr ? 'Farklı Hesapla Giriş' : 'Use Another Account'}</span>
              </button>
            </div>

            <div className="flex justify-center">
              <label className="inline-flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepSignedInOnDevice}
                  onChange={(e) => setKeepSignedInOnDevice(e.target.checked)}
                  className="rounded accent-red-500 cursor-pointer"
                />
                <span>{isTr ? 'Bu cihazda oturumu açık tut' : 'Keep session open on this device'}</span>
              </label>
            </div>

            {(authError || apiError) && (
              <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-lg text-left text-xs font-mono text-red-200">
                {authError || apiError?.message}
              </div>
            )}

            <div className="bg-[#09090b] border border-zinc-800/80 rounded-xl p-4 text-left text-xs text-zinc-400 space-y-2.5">
              <div className="font-semibold text-zinc-200">
                {isTr ? 'Google Chat API Gereksinimleri' : 'Google Chat API Prerequisites'}
              </div>
              <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                <li>
                  {isTr
                    ? 'Google Chat erişimine sahip bir Business veya Enterprise Google Workspace hesabı gerekir (bireysel @gmail.com hesapları desteklenmez).'
                    : 'Requires a Business or Enterprise Google Workspace account (consumer @gmail.com accounts are not supported).'}
                </li>
                <li>
                  {isTr
                    ? 'Google Cloud Console üzerinden Google Chat App yapılandırmasının tamamlanmış olması gerekir.'
                    : 'The Google Chat app must be configured once under Google Chat API > Configuration in Google Cloud Console.'}
                </li>
              </ul>
              <a
                href={CHAT_CONFIG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 underline underline-offset-4 font-mono text-[11px]"
              >
                <span>{isTr ? 'Cloud Console Chat Ayarlarını Aç' : 'Open Chat API Configuration'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] overflow-hidden">
          {/* Left Spaces Directory Column */}
          <aside className="border-b lg:border-b-0 lg:border-r border-zinc-800/80 bg-[#0c0c0f] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-800/80 space-y-3 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <Users className="w-4 h-4 text-red-400 shrink-0" />
                  <h3 className="font-showcase-display text-sm font-semibold text-white truncate">
                    {isTr ? 'Sohbet Alanları' : 'Chat Spaces'}
                  </h3>
                  <span className="font-mono text-xs text-zinc-500 tabular-nums">
                    {spaces.length}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddingSpace((prev) => !prev)}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
                    title={isTr ? 'Yeni Alan Oluştur' : 'Create New Space'}
                    aria-label={isTr ? 'Yeni Alan Oluştur' : 'Create New Space'}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={loadSpaces}
                    disabled={isLoadingSpaces}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
                    title={isTr ? 'Alanları Yenile' : 'Refresh Spaces'}
                    aria-label={isTr ? 'Alanları Yenile' : 'Refresh Spaces'}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {isAddingSpace && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newSpaceName.trim()) return;
                    setPendingAction({
                      type: 'createSpace',
                      displayName: newSpaceName.trim(),
                    });
                  }}
                  className="flex items-center space-x-1.5 pt-1"
                >
                  <input
                    type="text"
                    autoFocus
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    placeholder={isTr ? 'Yeni alan adı...' : 'New space name...'}
                    className="flex-1 bg-[#09090b] border border-zinc-700 focus:border-red-500 rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {isTr ? 'Oluştur' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSpace(false);
                      setNewSpaceName('');
                    }}
                    className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                    aria-label="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              )}

              <div className="flex items-center bg-[#09090b] border border-zinc-800 focus-within:border-red-500 rounded-lg px-3 py-2">
                <Search className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
                <input
                  type="text"
                  value={spaceFilter}
                  onChange={(e) => setSpaceFilter(e.target.value)}
                  placeholder={isTr ? 'Alanlarda ara...' : 'Filter spaces...'}
                  className="bg-transparent border-none outline-none text-xs text-white w-full"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingSpaces ? (
                <div className="p-4 text-xs text-zinc-500 font-mono text-center">
                  {isTr ? 'Alanlar yükleniyor...' : 'Loading spaces...'}
                </div>
              ) : filteredSpaces.length === 0 ? (
                <div className="p-6 text-xs text-zinc-500 text-center">
                  {isTr ? 'Eşleşen alan bulunamadı.' : 'No spaces found.'}
                </div>
              ) : (
                filteredSpaces.map((space) => {
                  const isSelected = selectedSpace?.name === space.name;
                  return (
                    <button
                      key={space.name}
                      type="button"
                      onClick={() => setSelectedSpace(space)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start space-x-2.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-red-600/15 border border-red-500/40 text-white'
                          : 'border border-transparent text-zinc-300 hover:bg-zinc-900/90 hover:text-white'
                      }`}
                    >
                      <Hash
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isSelected ? 'text-red-400' : 'text-zinc-500'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {formatSpaceLabel(space)}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {formatSpaceKind(space)}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Conversation Stream & Composer */}
          <section className="flex flex-col h-full overflow-hidden bg-[#09090b]">
            {/* Conversation Header */}
            <div className="px-6 py-3.5 bg-[#0e0e12] border-b border-zinc-800/80 flex items-center justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <h2 className="font-showcase-display text-base font-bold text-white truncate">
                  {selectedSpace
                    ? formatSpaceLabel(selectedSpace)
                    : isTr
                      ? 'Sohbet Seçin'
                      : 'Select a Space'}
                </h2>
                {selectedSpace && (
                  <p className="text-xs font-mono text-zinc-500 truncate mt-0.5">
                    {formatSpaceKind(selectedSpace)} · {selectedSpace.name} ·{' '}
                    <span className="tabular-nums">{messages.length}</span>{' '}
                    {isTr ? 'mesaj' : 'messages'}
                  </p>
                )}
              </div>

              {selectedSpace && (
                <button
                  type="button"
                  onClick={() => loadMessages(selectedSpace.name)}
                  disabled={isLoadingMessages}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center space-x-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                  <span>{isTr ? 'Mesajları Yenile' : 'Refresh Messages'}</span>
                </button>
              )}
            </div>

            {apiError && (
              <div className="mx-6 mt-4 p-4 bg-red-950/60 border border-red-700/60 rounded-xl text-xs space-y-2.5 shrink-0">
                <div className="flex items-start space-x-2.5 text-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 font-mono break-words flex-1">
                    <div className="font-bold">
                      {apiError.status ? `HTTP ${apiError.status}` : 'Error'}
                    </div>
                    <div>{apiError.message}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => signInWithGoogleChat({ forceSelectAccount: true })}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-200 hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-red-400" />
                    <span>{isTr ? 'Farklı Hesapla Giriş Yap' : 'Use Another Account'}</span>
                  </button>
                  {isNotConfiguredError && (
                    <a
                      href={CHAT_CONFIG_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-red-300 hover:text-white underline underline-offset-4"
                    >
                      <span>
                        {isTr
                          ? 'Google Cloud Console > Chat API Yapılandırmasına Git'
                          : 'Configure Chat App in Google Cloud Console'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {!selectedSpace ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-sm text-zinc-500 space-y-3">
                  <MessageSquare className="w-8 h-8 text-zinc-700" />
                  <p className="max-w-sm">
                    {isTr
                      ? 'Mesajları görüntülemek ve ekip arkadaşlarınızla iletişim kurmak için soldaki listeden bir alan seçin.'
                      : 'Select a Google Chat space from the directory on the left to view messages.'}
                  </p>
                </div>
              ) : isLoadingMessages ? (
                <div className="py-12 text-center text-xs font-mono text-zinc-500">
                  {isTr ? 'Mesajlar yükleniyor...' : 'Loading messages...'}
                </div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-500">
                  {isTr
                    ? 'Bu alanda henüz mesaj yok. İlk mesajı aşağıdan gönderebilirsiniz.'
                    : 'No messages in this space yet. Start the conversation below.'}
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.name}
                    className="bg-[#111115] border border-zinc-800/80 rounded-xl p-4 space-y-2 group hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200 shrink-0">
                          {(msg.sender?.displayName || msg.sender?.name || 'M')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-white truncate block">
                            {msg.sender?.displayName || msg.sender?.name || 'Member'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0 text-xs font-mono text-zinc-500 tabular-nums">
                        <span>{formatDateTime(msg.createTime)}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAction({
                              type: 'deleteMessage',
                              messageName: msg.name,
                              preview: msg.text || '(attachment)',
                            })
                          }
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title={isTr ? 'Mesajı Sil' : 'Delete Message'}
                          aria-label={isTr ? 'Mesajı Sil' : 'Delete Message'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-200 whitespace-pre-wrap break-words leading-relaxed pl-9">
                      {msg.text || (isTr ? '[Metin içeriği yok]' : '[No text content]')}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Composer */}
            {selectedSpace && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draftMessage.trim()) return;
                  setPendingAction({
                    type: 'sendMessage',
                    spaceName: selectedSpace.name,
                    spaceTitle: formatSpaceLabel(selectedSpace),
                    text: draftMessage.trim(),
                  });
                }}
                className="p-4 px-6 bg-[#0e0e12] border-t border-zinc-800/80 space-y-3 shrink-0"
              >
                <textarea
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && draftMessage.trim()) {
                      e.preventDefault();
                      setPendingAction({
                        type: 'sendMessage',
                        spaceName: selectedSpace.name,
                        spaceTitle: formatSpaceLabel(selectedSpace),
                        text: draftMessage.trim(),
                      });
                    }
                  }}
                  rows={3}
                  placeholder={
                    isTr
                      ? `${formatSpaceLabel(selectedSpace)} alanına mesaj yazın... (Ctrl+Enter ile onayla)`
                      : `Message ${formatSpaceLabel(selectedSpace)}... (Ctrl+Enter to review & send)`
                  }
                  className="w-full bg-[#09090b] border border-zinc-800 focus:border-red-500 rounded-xl p-3 text-sm text-white outline-none resize-none"
                />
                <div className="flex items-center justify-between gap-3">
                  {activeFile ? (
                    <button
                      type="button"
                      onClick={() =>
                        setDraftMessage((prev) =>
                          `${prev ? `${prev}\n` : ''}\`\`\`${activeFile.language}\n${activeFile.content.slice(0, 800)}\n\`\`\``
                        )
                      }
                      className="px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg flex items-center space-x-2 cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5 text-red-400" />
                      <span>
                        {isTr ? 'Editörden Ekle:' : 'Attach Code:'} {activeFile.name}
                      </span>
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500">
                      {isTr ? 'Göndermeden önce onay istenir.' : 'Confirmation requested before sending.'}
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={!draftMessage.trim() || isMutating}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTr ? 'Mesajı Gönder' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      {/* Mandatory Confirmation Dialog */}
      {pendingAction && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111115] border border-zinc-700 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="text-sm font-semibold text-white">
              {pendingAction.type === 'sendMessage' &&
                (isTr
                  ? `Mesaj "${pendingAction.spaceTitle}" alanına gönderilsin mi?`
                  : `Send message to "${pendingAction.spaceTitle}"?`)}
              {pendingAction.type === 'deleteMessage' &&
                (isTr
                  ? 'Bu mesaj Google Chat alanından silinsin mi? Bu işlem geri alınamaz.'
                  : 'Delete this message from Google Chat? This action cannot be undone.')}
              {pendingAction.type === 'createSpace' &&
                (isTr
                  ? `"${pendingAction.displayName}" adlı yeni Google Chat alanı oluşturulsun mu?`
                  : `Create new Google Chat space "${pendingAction.displayName}"?`)}
            </div>

            {pendingAction.type === 'sendMessage' && (
              <div className="p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                {pendingAction.text}
              </div>
            )}

            {pendingAction.type === 'deleteMessage' && (
              <div className="p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400 max-h-24 overflow-y-auto truncate">
                {pendingAction.preview}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2.5 pt-1">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={isMutating}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
              >
                {isTr ? 'İptal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executePendingAction}
                disabled={isMutating}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                {isMutating
                  ? isTr
                    ? 'İşleniyor...'
                    : 'Working...'
                  : pendingAction.type === 'deleteMessage'
                    ? isTr
                      ? 'Sil'
                      : 'Delete'
                    : isTr
                      ? 'Onayla'
                      : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
