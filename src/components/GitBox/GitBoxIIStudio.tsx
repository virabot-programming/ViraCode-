/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ProjectWorkspace } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Box, GitFork, Share2, Plus, LogIn } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface GitBoxIIRepo {
  id: string;
  name: string;
  description: string;
  author: string;
  primaryLanguage: string;
  files: Array<{ path: string; name: string; language: string; content: string }>;
  createdAt: string;
  stars: number;
  forks: number;
}

interface GitBoxIIStudioProps {
  currentWorkspace: ProjectWorkspace;
  onForkWorkspace: (repo: GitBoxIIRepo) => void;
  onBackToEditor: () => void;
}

export const GitBoxIIStudio: React.FC<GitBoxIIStudioProps> = ({
  currentWorkspace,
  onForkWorkspace,
}) => {
  const { language } = useI18n();
  const isTr = language === 'tr';
  const { user, isAuthLoading, authError, signInWithGoogle, getFreshToken } = useAuth();

  const [activeTab, setActiveTab] = useState<'repos' | 'publish'>('repos');
  const [repos, setRepos] = useState<GitBoxIIRepo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Publish Form State
  const [pubName, setPubName] = useState(currentWorkspace.name);
  const [pubDesc, setPubDesc] = useState(currentWorkspace.tagline || 'Shared via GitBox II');
  const [pubAuthor, setPubAuthor] = useState(
    user?.displayName || user?.email || 'ViraCode Developer'
  );
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (user) {
      setPubAuthor(user.displayName || user.email || 'ViraCode Developer');
    }
  }, [user]);

  const loadReposFromServer = useCallback(async () => {
    if (!user) {
      setRepos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setServerError(null);
    try {
      const token = await getFreshToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/gitbox', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setRepos(Array.isArray(data) ? data : []);
    } catch {
      setServerError(isTr ? 'Sunucudan depolar alınamadı.' : 'Failed to load repositories from server.');
    } finally {
      setIsLoading(false);
    }
  }, [user, getFreshToken, isTr]);

  useEffect(() => {
    loadReposFromServer();
  }, [loadReposFromServer]);

  const handleFork = async (repo: GitBoxIIRepo) => {
    onForkWorkspace(repo);
    try {
      const token = await getFreshToken();
      if (!token) return;
      const res = await fetch(`/api/gitbox/${encodeURIComponent(repo.id)}/fork`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const updatedRepo: GitBoxIIRepo = await res.json();
        setRepos((prev) => prev.map((r) => (r.id === updatedRepo.id ? updatedRepo : r)));
      }
    } catch {
      // Non-fatal fork count update
    }
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const handlePublishRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubName.trim()) return;
    setIsPublishing(true);
    setServerError(null);

    try {
      const token = await getFreshToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const payload = {
        name: pubName.trim(),
        description: pubDesc.trim() || 'Shared via GitBox II',
        author: pubAuthor.trim() || user?.displayName || 'ViraCode Developer',
        primaryLanguage: currentWorkspace.primaryLanguage,
        files: currentWorkspace.files.map((f) => ({
          path: f.path,
          name: f.name,
          language: f.language,
          content: f.content,
        })),
      };

      const res = await fetch('/api/gitbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to publish repository to server.');
      }

      const savedRepo: GitBoxIIRepo = await res.json();
      setRepos((prev) => [savedRepo, ...prev]);
      setActiveTab('repos');

      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } catch {
      setServerError(isTr ? 'Depo sunucuya kaydedilemedi.' : 'Could not save repository to server.');
    } finally {
      setIsPublishing(false);
    }
  };

  const formatTimestamp = (iso: string) => {
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
    <div className="flex flex-col h-full bg-[#0a0709] text-zinc-200 font-sans select-none overflow-hidden">
      {/* GitBox II Header */}
      <div className="px-3 py-2 bg-[#170c0f] border-b border-red-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center shadow-xs shadow-red-600/50">
            <Box className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-xs text-white tracking-wide font-mono">
                GITBOX II
              </span>
              <span className="text-[9px] px-1 py-0.2 bg-red-500/20 text-red-300 border border-red-500/40 rounded font-mono font-bold">
                REPO HUB
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              {isTr
                ? 'Kalıcı Sunucu Depoları ve Fork Yönetimi'
                : 'Persistent Server Repositories & Fork Engine'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Single-Icon Buttons) */}
        {user && (
          <div className="flex items-center space-x-1 bg-black/40 p-0.5 rounded border border-red-900/40">
            <button
              type="button"
              onClick={() => setActiveTab('repos')}
              title={isTr ? 'Depolar' : 'Repos'}
              aria-label={isTr ? 'Depolar' : 'Repos'}
              className={`p-1.5 rounded transition-colors cursor-pointer flex items-center justify-center ${
                activeTab === 'repos'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('publish')}
              title={isTr ? 'Depo Yayınla' : 'Publish Repo'}
              aria-label={isTr ? 'Depo Yayınla' : 'Publish Repo'}
              className={`p-1.5 rounded transition-colors cursor-pointer flex items-center justify-center ${
                activeTab === 'publish'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {(serverError || authError) && (
          <div className="p-2 bg-red-950/70 border border-red-700/60 rounded text-[11px] font-mono text-red-200">
            {serverError || authError}
          </div>
        )}

        {isAuthLoading ? (
          <div className="text-center py-8 text-[11px] font-mono text-zinc-500">
            {isTr ? 'Oturum kontrol ediliyor...' : 'Checking session...'}
          </div>
        ) : !user ? (
          <div className="bg-[#12080a] border border-red-900/40 rounded p-5 text-center space-y-3">
            <Box className="w-7 h-7 mx-auto text-red-500/60" />
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-white">
                {isTr ? 'GitBox II Hesap Doğrulaması' : 'GitBox II Account Sign-In'}
              </div>
              <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                {isTr
                  ? 'Depolarınızı güvenle saklamak ve fork işlemlerini senkronize etmek için Google ile oturum açın.'
                  : 'Sign in with Google to save repositories securely and sync forks.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="mx-auto px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-mono font-bold flex items-center space-x-2 cursor-pointer transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isTr ? 'Google ile Giriş Yap' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          <>
            {/* Tab 1: Real Server Repositories & Forking */}
            {activeTab === 'repos' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>
                    {repos.length} {isTr ? 'kayıtlı depo' : 'saved repositories'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('publish')}
                    title={isTr ? 'Yeni Depo Yayınla' : 'Publish New Repo'}
                    aria-label={isTr ? 'Yeni Depo Yayınla' : 'Publish New Repo'}
                    className="p-1.5 rounded bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/50 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isLoading ? (
                  <div className="text-center py-8 text-[11px] font-mono text-zinc-500">
                    {isTr ? 'Sunucudan depolar yükleniyor...' : 'Loading repositories from server...'}
                  </div>
                ) : repos.length === 0 ? (
                  <div className="bg-[#12080a] border border-red-900/30 rounded p-5 text-center space-y-3">
                    <Box className="w-7 h-7 mx-auto text-red-500/40" />
                    <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                      {isTr
                        ? 'Henüz sunucuda yayınlanmış gerçek bir depo bulunmuyor. İlk deponuzu yayınlamak için yukarıdaki + simgesine tıklayın.'
                        : 'No repositories have been published to the server yet. Click + above to publish your workspace.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {repos.map((repo) => (
                      <div
                        key={repo.id}
                        className="bg-[#12080a] border border-red-900/40 hover:border-red-600/70 rounded p-3 transition-colors space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-white font-mono hover:text-red-400 transition-colors truncate">
                                {repo.name}
                              </span>
                              <span className="text-[9px] px-1 py-0.2 bg-red-950/80 text-red-300 rounded border border-red-800 uppercase font-mono shrink-0">
                                {repo.primaryLanguage}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                              {repo.description}
                            </p>
                          </div>

                          {/* Fork Button (Single-Icon) */}
                          <button
                            type="button"
                            onClick={() => handleFork(repo)}
                            className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ml-2"
                            title={isTr ? 'Bu projeyi çatalla ve çalışma alanına al' : 'Fork to workspace'}
                            aria-label={isTr ? 'Çatalla' : 'Fork'}
                          >
                            <GitFork className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Metadata footer */}
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-red-950/60">
                          <div className="flex items-center space-x-3">
                            <span>👤 {repo.author}</span>
                            <span>⭐ {repo.stars}</span>
                            <span>🍴 {repo.forks}</span>
                          </div>
                          <span>{formatTimestamp(repo.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Publish to GitBox II Server */}
            {activeTab === 'publish' && (
              <form
                onSubmit={handlePublishRepo}
                className="bg-[#12080a] border border-red-900/40 rounded p-3 space-y-3 font-mono text-xs"
              >
                <div className="border-b border-red-900/50 pb-2">
                  <span className="font-bold text-white text-xs block">
                    {isTr ? 'Aktif Projeyi Sunucuya Yayınla' : 'Publish Workspace to Server'}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {isTr
                      ? 'Projeniz kalıcı olarak gerçek sunucuda saklanır ve silinmez.'
                      : 'Your repository is saved permanently on the server.'}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] block">{isTr ? 'Depo Adı:' : 'Repository Name:'}</label>
                  <input
                    type="text"
                    value={pubName}
                    onChange={(e) => setPubName(e.target.value)}
                    className="w-full bg-black/60 border border-red-900/40 p-1.5 rounded text-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] block">{isTr ? 'Açıklama:' : 'Description:'}</label>
                  <textarea
                    value={pubDesc}
                    onChange={(e) => setPubDesc(e.target.value)}
                    className="w-full bg-black/60 border border-red-900/40 p-1.5 rounded text-white outline-none min-h-[60px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] block">{isTr ? 'Geliştirici / Yazar:' : 'Author Name:'}</label>
                  <input
                    type="text"
                    value={pubAuthor}
                    onChange={(e) => setPubAuthor(e.target.value)}
                    className="w-full bg-black/60 border border-red-900/40 p-1.5 rounded text-white outline-none"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isPublishing}
                    title={isPublishing ? (isTr ? 'Yayınlanıyor...' : 'Publishing...') : (isTr ? 'GitBox II\'de Yayınla' : 'Publish to GitBox II')}
                    aria-label={isTr ? 'GitBox II\'de Yayınla' : 'Publish to GitBox II'}
                    className="p-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Share2 className={`w-4 h-4 ${isPublishing ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
