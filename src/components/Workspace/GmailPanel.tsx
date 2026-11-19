/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Mail,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Reply,
  PenSquare,
  FileText,
  Code2,
  AlertTriangle,
  MailOpen,
  MailCheck,
  Inbox,
  SendHorizontal,
  Star,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { VirtualFile } from '../../types/engine';
import {
  GmailApiError,
  GmailMessageItem,
  createGmailDraft,
  listGmailMessages,
  sendGmailMessage,
  setGmailMessageUnread,
  trashGmailMessage,
} from '../../services/gmail';

interface GmailPanelProps {
  activeFile?: VirtualFile | null;
}

type GmailLabelFilter = 'INBOX' | 'SENT' | 'DRAFT' | 'STARRED';

type PendingGmailAction =
  | {
      type: 'send';
      to: string;
      subject: string;
      body: string;
      threadId?: string;
    }
  | {
      type: 'draft';
      to: string;
      subject: string;
      body: string;
    }
  | {
      type: 'trash';
      messageId: string;
      subject: string;
    }
  | {
      type: 'toggleUnread';
      messageId: string;
      subject: string;
      nextUnread: boolean;
    };

export const GmailPanel: React.FC<GmailPanelProps> = ({ activeFile }) => {
  const { language } = useI18n();
  const isTr = language === 'tr';
  const {
    user,
    keepSignedInOnDevice,
    setKeepSignedInOnDevice,
    googleGmailAccessToken,
    authError,
    signInWithGmail,
    clearGoogleGmailAccessToken,
  } = useAuth();

  const [labelFilter, setLabelFilter] = useState<GmailLabelFilter>('INBOX');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [messages, setMessages] = useState<GmailMessageItem[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageItem | null>(null);
  const [isComposing, setIsComposing] = useState<boolean>(false);

  const [composeTo, setComposeTo] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [replyThreadId, setReplyThreadId] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<{ message: string; status?: number } | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingGmailAction | null>(null);

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof GmailApiError) {
        if (err.status === 401) {
          clearGoogleGmailAccessToken();
        } else if (err.status === 403) {
          const lower = err.message.toLowerCase();
          if (lower.includes('insufficient') || lower.includes('scope')) {
            clearGoogleGmailAccessToken();
          }
          setApiError({
            status: 403,
            message: isTr
              ? 'Gmail erişim izni reddedildi (403). Lütfen "Yetkileri Yenile" veya "Farklı Hesapla Giriş" seçeneğini kullanarak Gmail izinlerini onaylayın.'
              : 'Gmail access denied (403). Please re-authorize Gmail permissions or switch to another Google account.',
          });
          return;
        }
        setApiError({ message: err.message, status: err.status });
      } else if (err instanceof Error) {
        setApiError({ message: err.message });
      } else {
        setApiError({
          message: isTr ? 'Gmail isteği başarısız oldu.' : 'Gmail request failed.',
        });
      }
    },
    [clearGoogleGmailAccessToken, isTr]
  );

  const loadMessages = useCallback(
    async (queryOverride?: string) => {
      if (!googleGmailAccessToken) return;
      setIsLoading(true);
      setApiError(null);
      try {
        const q = queryOverride !== undefined ? queryOverride : searchQuery;
        const list = await listGmailMessages(googleGmailAccessToken, {
          labelId: labelFilter,
          q,
          maxResults: 20,
        });
        setMessages(list);
        setSelectedMessage((prev) => {
          if (prev && list.some((m) => m.id === prev.id)) return prev;
          return list[0] ?? null;
        });
      } catch (err) {
        handleApiError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [googleGmailAccessToken, labelFilter, searchQuery, handleApiError]
  );

  useEffect(() => {
    if (googleGmailAccessToken) {
      loadMessages();
    } else {
      setMessages([]);
      setSelectedMessage(null);
      setIsComposing(false);
    }
  }, [googleGmailAccessToken, labelFilter, loadMessages]);

  const executePendingAction = async () => {
    if (!pendingAction || !googleGmailAccessToken) return;
    setIsMutating(true);
    setApiError(null);
    setStatusNotice(null);

    try {
      if (pendingAction.type === 'send') {
        await sendGmailMessage(googleGmailAccessToken, {
          to: pendingAction.to,
          subject: pendingAction.subject,
          body: pendingAction.body,
          threadId: pendingAction.threadId,
        });
        setIsComposing(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setReplyThreadId(undefined);
        setStatusNotice(isTr ? 'E-posta gönderildi.' : 'Email sent successfully.');
        await loadMessages();
      } else if (pendingAction.type === 'draft') {
        await createGmailDraft(googleGmailAccessToken, {
          to: pendingAction.to,
          subject: pendingAction.subject,
          body: pendingAction.body,
        });
        setIsComposing(false);
        setStatusNotice(isTr ? 'Taslak Gmail hesabına kaydedildi.' : 'Draft saved to Gmail.');
      } else if (pendingAction.type === 'trash') {
        await trashGmailMessage(googleGmailAccessToken, pendingAction.messageId);
        setMessages((prev) => prev.filter((m) => m.id !== pendingAction.messageId));
        if (selectedMessage?.id === pendingAction.messageId) {
          setSelectedMessage(null);
        }
        setStatusNotice(isTr ? 'Mesaj çöp kutusuna taşındı.' : 'Message moved to Trash.');
      } else if (pendingAction.type === 'toggleUnread') {
        await setGmailMessageUnread(
          googleGmailAccessToken,
          pendingAction.messageId,
          pendingAction.nextUnread
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingAction.messageId ? { ...m, isUnread: pendingAction.nextUnread } : m
          )
        );
        if (selectedMessage?.id === pendingAction.messageId) {
          setSelectedMessage({ ...selectedMessage, isUnread: pendingAction.nextUnread });
        }
      }
      setPendingAction(null);
    } catch (err) {
      handleApiError(err);
      setPendingAction(null);
    } finally {
      setIsMutating(false);
    }
  };

  const openCompose = (replyToMsg?: GmailMessageItem) => {
    setApiError(null);
    setStatusNotice(null);
    if (replyToMsg) {
      const emailMatch = replyToMsg.from.match(/<([^>]+)>/);
      setComposeTo(emailMatch ? emailMatch[1] : replyToMsg.from);
      setComposeSubject(
        replyToMsg.subject.toLowerCase().startsWith('re:')
          ? replyToMsg.subject
          : `Re: ${replyToMsg.subject}`
      );
      setComposeBody(`\n\n--- ${replyToMsg.from} ---\n${replyToMsg.bodyText.slice(0, 600)}`);
      setReplyThreadId(replyToMsg.threadId);
    } else {
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setReplyThreadId(undefined);
    }
    setIsComposing(true);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr.slice(0, 16);
      return d.toLocaleDateString(isTr ? 'tr-TR' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const labelTabs: Array<{ id: GmailLabelFilter; label: string; icon: React.ReactNode }> = [
    { id: 'INBOX', label: isTr ? 'Gelen Kutusu' : 'Inbox', icon: <Inbox className="w-4 h-4" /> },
    { id: 'SENT', label: isTr ? 'Gönderilmiş' : 'Sent', icon: <SendHorizontal className="w-4 h-4" /> },
    { id: 'DRAFT', label: isTr ? 'Taslaklar' : 'Drafts', icon: <FileText className="w-4 h-4" /> },
    { id: 'STARRED', label: isTr ? 'Yıldızlı' : 'Starred', icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-200 font-showcase-body select-none overflow-hidden relative">
      {!googleGmailAccessToken ? (
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
          <div className="max-w-lg w-full bg-[#111115] border border-zinc-800/80 rounded-2xl p-8 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="font-showcase-display text-xl font-bold text-white">
                {isTr ? 'Gmail Çalışma Alanı' : 'Gmail Workspace'}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {user && keepSignedInOnDevice
                  ? isTr
                    ? `Bu cihazda ${user.email || user.displayName} hesabı açık. DevFeed hizmetlerine erişimi sürdürmek için tek tıkla doğrulayın.`
                    : `Signed in on this device as ${user.email || user.displayName}. Resume Workspace access in one click.`
                  : isTr
                  ? 'Gelen kutunuzu yönetmek, etiketler arasında gezinmek, e-postaları okumak ve IDE içindeki kodlarla yanıt göndermek için oturum açın.'
                  : 'Sign in with Google to search your inbox, switch labels, read threads, and send emails with IDE code context.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => signInWithGmail()}
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
                onClick={() => signInWithGmail({ forceSelectAccount: true })}
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
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[210px_360px_1fr] overflow-hidden">
          {/* Left Labels & Compose Rail */}
          <aside className="border-b lg:border-b-0 lg:border-r border-zinc-800/80 bg-[#0c0c0f] p-4 flex flex-col space-y-4 shrink-0">
            <button
              type="button"
              onClick={() => openCompose()}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-colors"
            >
              <PenSquare className="w-4 h-4" />
              <span>{isTr ? 'Yeni E-Posta Yaz' : 'Compose Email'}</span>
            </button>

            <nav className="space-y-1 flex-1" aria-label={isTr ? 'Gmail Etiketleri' : 'Gmail Labels'}>
              {labelTabs.map((tab) => {
                const isActive = labelFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setIsComposing(false);
                      setLabelFilter(tab.id);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium flex items-center space-x-2.5 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-red-600/15 border border-red-500/40 text-white'
                        : 'border border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <span className={isActive ? 'text-red-400' : 'text-zinc-500'}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => loadMessages()}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isTr ? 'Kutuyu Yenile' : 'Refresh Mailbox'}</span>
            </button>
          </aside>

          {/* Middle Search & Message List */}
          <div className="border-b lg:border-b-0 lg:border-r border-zinc-800/80 bg-[#09090b] flex flex-col overflow-hidden">
            <div className="p-3 border-b border-zinc-800/80 bg-[#0d0d11] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loadMessages();
                }}
                className="flex items-center bg-[#09090b] border border-zinc-800 focus-within:border-red-500 rounded-lg px-3 py-2"
              >
                <Search className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isTr ? 'E-postalarda ara ve Enter...' : 'Search Gmail and press Enter...'}
                  className="bg-transparent border-none outline-none text-xs text-white w-full"
                />
              </form>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60">
              {isLoading ? (
                <div className="text-center py-10 text-xs font-mono text-zinc-500">
                  {isTr ? 'E-postalar yükleniyor...' : 'Loading emails...'}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-zinc-500 px-6">
                  {isTr ? 'Bu görünümde eşleşen e-posta bulunamadı.' : 'No emails found in this view.'}
                </div>
              ) : (
                messages.map((msg) => {
                  const isSelected = !isComposing && selectedMessage?.id === msg.id;
                  return (
                    <button
                      key={msg.id}
                      type="button"
                      onClick={() => {
                        setStatusNotice(null);
                        setIsComposing(false);
                        setSelectedMessage(msg);
                      }}
                      className={`w-full text-left p-3.5 transition-colors cursor-pointer space-y-1.5 block ${
                        isSelected
                          ? 'bg-red-600/10 border-l-0'
                          : 'hover:bg-[#111115]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span
                          className={`truncate ${
                            msg.isUnread ? 'text-white font-bold' : 'text-zinc-400 font-medium'
                          }`}
                        >
                          {msg.from.replace(/<[^>]+>/g, '').trim() || msg.from}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500 tabular-nums shrink-0">
                          {formatDate(msg.date)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`text-xs truncate ${
                            msg.isUnread ? 'text-red-300 font-semibold' : 'text-zinc-200'
                          }`}
                        >
                          {msg.subject}
                        </div>
                        {msg.isUnread && (
                          <span className="text-[10px] font-mono text-red-400 shrink-0">
                            {isTr ? 'Yeni' : 'Unread'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{msg.snippet}</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Reading / Compose Pane */}
          <section className="flex flex-col h-full overflow-hidden bg-[#09090b]">
            {apiError && (
              <div className="mx-6 mt-4 p-3.5 bg-red-950/60 border border-red-700/60 rounded-xl text-xs font-mono text-red-200 space-y-2 shrink-0">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="break-words">{apiError.message}</span>
                </div>
                {apiError.status === 403 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => signInWithGmail()}
                      className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-sans font-semibold cursor-pointer"
                    >
                      {isTr ? 'Yetkileri Yenile' : 'Refresh Permissions'}
                    </button>
                    <button
                      type="button"
                      onClick={() => signInWithGmail({ forceSelectAccount: true })}
                      className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-sans font-medium cursor-pointer"
                    >
                      {isTr ? 'Farklı Hesapla Giriş' : 'Use Another Account'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {statusNotice && (
              <div className="mx-6 mt-4 p-3 bg-emerald-950/50 border border-emerald-700/50 rounded-xl text-xs font-mono text-emerald-300 shrink-0">
                {statusNotice}
              </div>
            )}

            {isComposing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!composeTo.trim()) return;
                  setPendingAction({
                    type: 'send',
                    to: composeTo.trim(),
                    subject: composeSubject.trim() || '(No Subject)',
                    body: composeBody,
                    threadId: replyThreadId,
                  });
                }}
                className="flex-1 flex flex-col overflow-hidden p-6 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 shrink-0">
                  <h2 className="font-showcase-display text-base font-bold text-white">
                    {replyThreadId ? (isTr ? 'İletiyi Yanıtla' : 'Reply to Email') : isTr ? 'Yeni İleti Oluştur' : 'New Email'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {isTr ? 'Vazgeç' : 'Discard'}
                  </button>
                </div>

                <div className="space-y-3 shrink-0">
                  <input
                    type="email"
                    required
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder={isTr ? 'Alıcı (ornek@alan.com)' : 'To (recipient@example.com)'}
                    className="w-full bg-[#111115] border border-zinc-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />

                  <input
                    type="text"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder={isTr ? 'Konu başlığı' : 'Subject'}
                    className="w-full bg-[#111115] border border-zinc-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder={isTr ? 'E-posta içeriğini yazın...' : 'Write your message...'}
                  className="flex-1 w-full bg-[#111115] border border-zinc-800 focus:border-red-500 rounded-xl p-4 text-sm text-white outline-none resize-none leading-relaxed"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 shrink-0">
                  <div className="flex items-center space-x-2">
                    {activeFile && (
                      <button
                        type="button"
                        onClick={() =>
                          setComposeBody((prev) =>
                            `${prev ? `${prev}\n\n` : ''}// ${activeFile.path}\n${activeFile.content.slice(0, 1500)}`
                          )
                        }
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg flex items-center space-x-2 cursor-pointer text-xs font-mono"
                      >
                        <Code2 className="w-3.5 h-3.5 text-red-400" />
                        <span>
                          {isTr ? 'Kod Ekle:' : 'Attach Code:'} {activeFile.name}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setPendingAction({
                          type: 'draft',
                          to: composeTo.trim(),
                          subject: composeSubject.trim() || '(No Subject)',
                          body: composeBody,
                        })
                      }
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg flex items-center space-x-1.5 cursor-pointer text-xs font-medium"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isTr ? 'Taslağa Kaydet' : 'Save Draft'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!composeTo.trim() || isMutating}
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTr ? 'E-Postayı Gönder' : 'Send Email'}</span>
                  </button>
                </div>
              </form>
            ) : selectedMessage ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-4 bg-[#0e0e12] border-b border-zinc-800/80 flex items-center justify-between gap-4 shrink-0">
                  <div className="min-w-0">
                    <h2 className="font-showcase-display text-lg font-bold text-white truncate">
                      {selectedMessage.subject}
                    </h2>
                    <p className="text-xs font-mono text-zinc-400 truncate mt-0.5">
                      {selectedMessage.from}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openCompose(selectedMessage)}
                      className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>{isTr ? 'Yanıtla' : 'Reply'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingAction({
                          type: 'toggleUnread',
                          messageId: selectedMessage.id,
                          subject: selectedMessage.subject,
                          nextUnread: !selectedMessage.isUnread,
                        })
                      }
                      className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center space-x-1.5 cursor-pointer"
                    >
                      {selectedMessage.isUnread ? (
                        <>
                          <MailCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isTr ? 'Okundu İşaretle' : 'Mark Read'}</span>
                        </>
                      ) : (
                        <>
                          <MailOpen className="w-3.5 h-3.5" />
                          <span>{isTr ? 'Okunmadı İşaretle' : 'Mark Unread'}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingAction({
                          type: 'trash',
                          messageId: selectedMessage.id,
                          subject: selectedMessage.subject,
                        })
                      }
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white cursor-pointer transition-colors"
                      title={isTr ? 'Çöp Kutusuna Taşı' : 'Move to Trash'}
                      aria-label={isTr ? 'Çöp Kutusuna Taşı' : 'Move to Trash'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-zinc-400 pb-4 border-b border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500">{isTr ? 'Gönderen:' : 'From:'}</span>{' '}
                      <span className="text-zinc-200 break-all">{selectedMessage.from}</span>
                    </div>
                    {selectedMessage.to && (
                      <div>
                        <span className="text-zinc-500">{isTr ? 'Alıcı:' : 'To:'}</span>{' '}
                        <span className="text-zinc-200 break-all">{selectedMessage.to}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-zinc-500">{isTr ? 'Tarih:' : 'Date:'}</span>{' '}
                      <span className="text-zinc-300 tabular-nums">{selectedMessage.date}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Thread:</span>{' '}
                      <span className="text-zinc-500">{selectedMessage.threadId}</span>
                    </div>
                  </div>

                  <pre className="text-sm text-zinc-200 whitespace-pre-wrap break-words font-showcase-body leading-relaxed">
                    {selectedMessage.bodyText}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-sm text-zinc-500 p-8 space-y-3">
                <Mail className="w-8 h-8 text-zinc-700" />
                <p className="max-w-sm">
                  {isTr
                    ? 'Okumak için listeden bir e-posta seçin veya soldaki düğmeyle yeni ileti oluşturun.'
                    : 'Select an email from the list to read or compose a new message.'}
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Mandatory Confirmation Dialog */}
      {pendingAction && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111115] border border-zinc-700 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="text-sm font-semibold text-white">
              {pendingAction.type === 'send' &&
                (isTr
                  ? `Bu e-posta "${pendingAction.to}" adresine gönderilsin mi?`
                  : `Send this email to "${pendingAction.to}"?`)}
              {pendingAction.type === 'draft' &&
                (isTr
                  ? 'Bu ileti Gmail taslaklarına kaydedilsin mi?'
                  : 'Save this email as a Gmail draft?')}
              {pendingAction.type === 'trash' &&
                (isTr
                  ? `"${pendingAction.subject}" e-postası çöp kutusuna taşınsın mı?`
                  : `Move "${pendingAction.subject}" to Trash?`)}
              {pendingAction.type === 'toggleUnread' &&
                (pendingAction.nextUnread
                  ? isTr
                    ? `"${pendingAction.subject}" okunmadı olarak işaretlensin mi?`
                    : `Mark "${pendingAction.subject}" as unread?`
                  : isTr
                    ? `"${pendingAction.subject}" okundu olarak işaretlensin mi?`
                    : `Mark "${pendingAction.subject}" as read?`)}
            </div>

            {pendingAction.type === 'send' && (
              <div className="p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 space-y-1 max-h-32 overflow-y-auto">
                <div className="text-zinc-400 truncate">
                  {isTr ? 'Konu:' : 'Subject:'} {pendingAction.subject}
                </div>
                <div className="whitespace-pre-wrap">{pendingAction.body}</div>
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
                  : pendingAction.type === 'trash'
                    ? isTr
                      ? 'Çöpe Taşı'
                      : 'Move to Trash'
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
