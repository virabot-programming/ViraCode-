/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Video,
  Plus,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Shield,
  PhoneOff,
  Clock,
  AlertTriangle,
  Search,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import {
  ConferenceRecord,
  GoogleMeetApiError,
  MeetAccessType,
  MeetSpace,
  createMeetSpace,
  endActiveMeetConference,
  getMeetSpace,
  listConferenceRecords,
  updateMeetSpaceAccess,
} from '../../services/googleMeet';

type PendingMeetAction =
  | { type: 'createSpace'; accessType: MeetAccessType }
  | { type: 'updateAccess'; spaceName: string; meetingCode?: string; accessType: MeetAccessType }
  | { type: 'endConference'; spaceName: string; meetingCode?: string };

export const GoogleMeetPanel: React.FC = () => {
  const { language } = useI18n();
  const isTr = language === 'tr';
  const {
    user,
    keepSignedInOnDevice,
    setKeepSignedInOnDevice,
    googleMeetAccessToken,
    authError,
    signInWithGoogleMeet,
    clearGoogleMeetAccessToken,
  } = useAuth();

  const [spaces, setSpaces] = useState<MeetSpace[]>([]);
  const [records, setRecords] = useState<ConferenceRecord[]>([]);
  const [newSpaceAccess, setNewSpaceAccess] = useState<MeetAccessType>('TRUSTED');
  const [lookupCode, setLookupCode] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<{ message: string; status?: number } | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingMeetAction | null>(null);

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof GoogleMeetApiError) {
        if (err.status === 401) {
          clearGoogleMeetAccessToken();
        } else if (err.status === 403) {
          const lower = err.message.toLowerCase();
          if (lower.includes('insufficient') || lower.includes('scope')) {
            clearGoogleMeetAccessToken();
          }
          setApiError({
            status: 403,
            message: isTr
              ? 'Google Meet erişim izni reddedildi (403). Lütfen Meet izinlerini yeniden onaylayın veya farklı bir Google hesabıyla giriş yapın.'
              : 'Google Meet access denied (403). Please re-authorize Meet permissions or sign in with another Google account.',
          });
          return;
        }
        setApiError({ message: err.message, status: err.status });
      } else if (err instanceof Error) {
        setApiError({ message: err.message });
      } else {
        setApiError({
          message: isTr ? 'Google Meet isteği başarısız oldu.' : 'Google Meet request failed.',
        });
      }
    },
    [clearGoogleMeetAccessToken, isTr]
  );

  const loadConferenceHistory = useCallback(async () => {
    if (!googleMeetAccessToken) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const list = await listConferenceRecords(googleMeetAccessToken);
      setRecords(list);
    } catch (err) {
      // Conference history requires meetings.space.readonly on eligible accounts;
      // keep space creation usable if only history returns 403.
      if (err instanceof GoogleMeetApiError && err.status === 403) {
        setRecords([]);
        setStatusNotice(
          isTr
            ? 'Bu hesapta geçmiş konferans kayıtları görüntülenemiyor; yine de yeni toplantı alanları oluşturabilirsiniz.'
            : 'Conference history is restricted for this account; you can still create and manage new meeting spaces.'
        );
      } else {
        handleApiError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [googleMeetAccessToken, handleApiError, isTr]);

  useEffect(() => {
    if (googleMeetAccessToken) {
      loadConferenceHistory();
    } else {
      setSpaces([]);
      setRecords([]);
    }
  }, [googleMeetAccessToken, loadConferenceHistory]);

  const handleLookupSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim() || !googleMeetAccessToken) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const found = await getMeetSpace(googleMeetAccessToken, lookupCode.trim());
      setSpaces((prev) => {
        const filtered = prev.filter((s) => s.name !== found.name);
        return [found, ...filtered];
      });
      setLookupCode('');
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const executePendingAction = async () => {
    if (!pendingAction || !googleMeetAccessToken) return;
    setIsMutating(true);
    setApiError(null);
    setStatusNotice(null);
    try {
      if (pendingAction.type === 'createSpace') {
        const created = await createMeetSpace(
          googleMeetAccessToken,
          pendingAction.accessType
        );
        setSpaces((prev) => [created, ...prev]);
        setStatusNotice(
          isTr
            ? `Toplantı alanı oluşturuldu: ${created.meetingCode || created.name}`
            : `Meeting space created: ${created.meetingCode || created.name}`
        );
      } else if (pendingAction.type === 'updateAccess') {
        const updated = await updateMeetSpaceAccess(
          googleMeetAccessToken,
          pendingAction.spaceName,
          pendingAction.accessType
        );
        setSpaces((prev) => prev.map((s) => (s.name === updated.name ? updated : s)));
        setStatusNotice(
          isTr
            ? `Erişim ayarı "${pendingAction.accessType}" olarak güncellendi.`
            : `Access updated to "${pendingAction.accessType}".`
        );
      } else if (pendingAction.type === 'endConference') {
        await endActiveMeetConference(googleMeetAccessToken, pendingAction.spaceName);
        setStatusNotice(
          isTr ? 'Aktif toplantı sonlandırıldı.' : 'Active conference ended.'
        );
        await loadConferenceHistory();
      }
      setPendingAction(null);
    } catch (err) {
      handleApiError(err);
      setPendingAction(null);
    } finally {
      setIsMutating(false);
    }
  };

  const handleCopyUri = async (space: MeetSpace) => {
    if (!space.meetingUri) return;
    try {
      await navigator.clipboard.writeText(space.meetingUri);
      setCopiedId(space.name);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleString(isTr ? 'tr-TR' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-200 font-showcase-body select-none overflow-hidden relative">
      {!googleMeetAccessToken ? (
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
          <div className="max-w-lg w-full bg-[#111115] border border-zinc-800/80 rounded-2xl p-8 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center mx-auto">
              <Video className="w-6 h-6 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="font-showcase-display text-xl font-bold text-white">
                {isTr ? 'Google Meet Çalışma Alanı' : 'Google Meet Workspace'}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {user && keepSignedInOnDevice
                  ? isTr
                    ? `Bu cihazda ${user.email || user.displayName} hesabı açık. DevFeed hizmetlerine erişimi sürdürmek için tek tıkla doğrulayın.`
                    : `Signed in on this device as ${user.email || user.displayName}. Resume Workspace access in one click.`
                  : isTr
                  ? 'Yeni toplantı odaları oluşturun, erişim güvenliği politikalarını yönetin, toplantı bağlantısını paylaşın ve konferans kayıtlarını takip edin.'
                  : 'Sign in with Google to create meeting spaces, manage access policies, share meeting links, and inspect conference history.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => signInWithGoogleMeet()}
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
                onClick={() => signInWithGoogleMeet({ forceSelectAccount: true })}
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
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_1fr] overflow-hidden">
          {/* Left Controls Column: Create Space & Lookup Code */}
          <aside className="border-b lg:border-b-0 lg:border-r border-zinc-800/80 bg-[#0c0c0f] p-6 space-y-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-showcase-display text-sm font-semibold text-white">
                  {isTr ? 'Yeni Toplantı Alanı' : 'Create Meeting Space'}
                </h3>
                <button
                  type="button"
                  onClick={loadConferenceHistory}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer disabled:opacity-50"
                  title={isTr ? 'Geçmişi Yenile' : 'Refresh Conferences'}
                  aria-label="Refresh Conferences"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400 block">
                  {isTr ? 'Katılım Erişim Politikası' : 'Access Policy'}
                </label>
                <div className="space-y-2">
                  {(
                    [
                      {
                        value: 'OPEN' as MeetAccessType,
                        title: 'OPEN',
                        desc: isTr
                          ? 'Bağlantıya sahip herkes doğrudan katılabilir.'
                          : 'Anyone with the meeting link can join without knocking.',
                      },
                      {
                        value: 'TRUSTED' as MeetAccessType,
                        title: 'TRUSTED',
                        desc: isTr
                          ? 'Kuruluş üyeleri ve davet edilen kullanıcılar katılır.'
                          : 'Workspace organization members and invitees join directly.',
                      },
                      {
                        value: 'RESTRICTED' as MeetAccessType,
                        title: 'RESTRICTED',
                        desc: isTr
                          ? 'Yalnızca açıkça davet edilmiş kişiler katılabilir.'
                          : 'Only explicitly invited attendees can join.',
                      },
                    ]
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNewSpaceAccess(opt.value)}
                      className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                        newSpaceAccess === opt.value
                          ? 'bg-red-600/15 border-red-500/50 text-white'
                          : 'bg-[#09090b] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-mono text-xs font-semibold">{opt.title}</div>
                      <div className="text-[11px] text-zinc-400 leading-relaxed">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPendingAction({
                    type: 'createSpace',
                    accessType: newSpaceAccess,
                  })
                }
                disabled={isMutating}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isTr ? 'Toplantı Alanı Oluştur' : 'Create Meeting Space'}</span>
              </button>
            </div>

            <div className="border-t border-zinc-800/80 pt-5 space-y-3">
              <h3 className="font-showcase-display text-sm font-semibold text-white">
                {isTr ? 'Toplantı Kodu ile Bul' : 'Lookup Space by Code'}
              </h3>
              <form onSubmit={handleLookupSpace} className="flex items-center space-x-2">
                <div className="flex-1 flex items-center bg-[#09090b] border border-zinc-800 focus-within:border-red-500 rounded-lg px-3 py-2">
                  <Search className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    placeholder="abc-mnop-xyz"
                    className="bg-transparent border-none outline-none text-xs font-mono text-white w-full"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!lookupCode.trim() || isLoading}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-lg text-xs font-medium cursor-pointer shrink-0"
                >
                  {isTr ? 'Getir' : 'Lookup'}
                </button>
              </form>
            </div>
          </aside>

          {/* Right Main Stage: Active Spaces + Structured Conference Records Table */}
          <section className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#09090b]">
            {apiError && (
              <div className="p-3.5 bg-red-950/60 border border-red-700/60 rounded-xl text-xs font-mono text-red-200 space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="break-words">{apiError.message}</span>
                </div>
                {apiError.status === 403 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => signInWithGoogleMeet()}
                      className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-sans font-semibold cursor-pointer"
                    >
                      {isTr ? 'Yetkileri Yenile' : 'Refresh Permissions'}
                    </button>
                    <button
                      type="button"
                      onClick={() => signInWithGoogleMeet({ forceSelectAccount: true })}
                      className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-sans font-medium cursor-pointer"
                    >
                      {isTr ? 'Farklı Hesapla Giriş' : 'Use Another Account'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {statusNotice && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-700/50 rounded-xl text-xs font-mono text-emerald-300">
                {statusNotice}
              </div>
            )}

            {/* Active / Created Meeting Spaces */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-showcase-display text-base font-bold text-white">
                  {isTr ? 'Aktif ve Oluşturulan Toplantı Alanları' : 'Active & Created Spaces'}
                </h2>
                <span className="font-mono text-xs text-zinc-500 tabular-nums">
                  {spaces.length} {isTr ? 'alan' : 'spaces'}
                </span>
              </div>

              {spaces.length === 0 ? (
                <div className="bg-[#111115] border border-zinc-800/80 rounded-xl p-8 text-center text-sm text-zinc-500">
                  {isTr
                    ? 'Henüz toplantı alanı oluşturulmadı. Soldaki panelden yeni bir Google Meet alanı oluşturabilir veya toplantı kodu ile arayabilirsiniz.'
                    : 'No spaces loaded yet. Create a new Google Meet space from the left panel or look up a meeting code.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {spaces.map((space) => (
                    <div
                      key={space.name}
                      className="bg-[#111115] border border-zinc-800/80 rounded-xl p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="font-mono text-base font-bold text-white tabular-nums truncate">
                            {space.meetingCode || space.name}
                          </div>
                          <div className="font-mono text-xs text-zinc-400 truncate">
                            {space.meetingUri || space.name}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          {space.meetingUri && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCopyUri(space)}
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                                title={isTr ? 'Bağlantıyı Kopyala' : 'Copy Link'}
                                aria-label="Copy Meeting Link"
                              >
                                {copiedId === space.name ? (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              <a
                                href={space.meetingUri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold inline-flex items-center space-x-1.5"
                              >
                                <span>{isTr ? 'Katıl' : 'Join'}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
                        <div className="flex items-center space-x-1.5">
                          <Shield className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          {(['OPEN', 'TRUSTED', 'RESTRICTED'] as MeetAccessType[]).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() =>
                                setPendingAction({
                                  type: 'updateAccess',
                                  spaceName: space.name,
                                  meetingCode: space.meetingCode,
                                  accessType: mode,
                                })
                              }
                              className={`px-2 py-1 rounded-md text-[11px] font-mono cursor-pointer transition-colors ${
                                space.config?.accessType === mode
                                  ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setPendingAction({
                              type: 'endConference',
                              spaceName: space.name,
                              meetingCode: space.meetingCode,
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-600 text-zinc-300 hover:text-white text-xs font-medium inline-flex items-center space-x-1.5 cursor-pointer transition-colors"
                        >
                          <PhoneOff className="w-3.5 h-3.5" />
                          <span>{isTr ? 'Toplantıyı Bitir' : 'End Call'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Structured Conference History Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-showcase-display text-base font-bold text-white">
                  {isTr ? 'Konferans Kayıt Geçmişi' : 'Conference History'}
                </h2>
                <span className="font-mono text-xs text-zinc-500 tabular-nums">
                  {records.length} {isTr ? 'kayıt' : 'records'}
                </span>
              </div>

              {records.length === 0 ? (
                <div className="bg-[#111115] border border-zinc-800/80 rounded-xl p-6 text-xs text-zinc-500 text-center">
                  {isTr ? 'Henüz konferans kaydı bulunmuyor.' : 'No conference records found.'}
                </div>
              ) : (
                <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-[#0e0e12]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#111115] border-b border-zinc-800/80 font-mono text-[11px] text-zinc-400">
                      <tr>
                        <th className="py-2.5 px-4 font-medium">{isTr ? 'Alan / Kayıt' : 'Space / Record'}</th>
                        <th className="py-2.5 px-4 font-medium text-right">{isTr ? 'Başlangıç' : 'Started'}</th>
                        <th className="py-2.5 px-4 font-medium text-right">{isTr ? 'Bitiş' : 'Ended'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {records.map((rec) => (
                        <tr key={rec.name} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono text-zinc-200 truncate max-w-[280px]">
                            {rec.space || rec.name}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-zinc-400 tabular-nums whitespace-nowrap">
                            <span className="inline-flex items-center space-x-1.5 justify-end">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              <span>{formatTime(rec.startTime)}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-zinc-500 tabular-nums whitespace-nowrap">
                            {formatTime(rec.endTime)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Mandatory Confirmation Modal */}
      {pendingAction && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111115] border border-zinc-700 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="text-sm font-semibold text-white">
              {pendingAction.type === 'createSpace' &&
                (isTr
                  ? `"${pendingAction.accessType}" erişim türüyle yeni bir Google Meet alanı oluşturulsun mu?`
                  : `Create a new Google Meet space with "${pendingAction.accessType}" access?`)}
              {pendingAction.type === 'updateAccess' &&
                (isTr
                  ? `"${pendingAction.meetingCode || pendingAction.spaceName}" alanı için erişim ayarı "${pendingAction.accessType}" olarak değiştirilsin mi?`
                  : `Update access setting for "${pendingAction.meetingCode || pendingAction.spaceName}" to "${pendingAction.accessType}"?`)}
              {pendingAction.type === 'endConference' &&
                (isTr
                  ? `"${pendingAction.meetingCode || pendingAction.spaceName}" alanındaki aktif toplantı sonlandırılsın mı?`
                  : `End the active conference in "${pendingAction.meetingCode || pendingAction.spaceName}" for all participants?`)}
            </div>

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
