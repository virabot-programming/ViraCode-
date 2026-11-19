import React, { useState, useEffect } from 'react';
import { ProjectWorkspace, VirtualFile } from '../../types/engine';
import { useLanguage } from '../../i18n/LanguageContext';
import { Box, GitFork, Star, Share2, Plus, Terminal, Code2, Check, X, Globe, User, Clock, ArrowRight, Shield, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GitBoxRepo {
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

interface GitBoxStudioProps {
  currentWorkspace: ProjectWorkspace;
  onForkWorkspace: (repo: GitBoxRepo) => void;
  onBackToEditor: () => void;
}

export const GitBoxStudio: React.FC<GitBoxStudioProps> = ({
  currentWorkspace,
  onForkWorkspace,
  onBackToEditor,
}) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  const [repos, setRepos] = useState<GitBoxRepo[]>([]);
  const [activeTab, setActiveTab] = useState<'explore' | 'publish'>('explore');
  const [selectedRepo, setSelectedRepo] = useState<GitBoxRepo | null>(null);

  // Publish form state
  const [pubName, setPubName] = useState(currentWorkspace.name);
  const [pubDesc, setPubDesc] = useState('Shared via GitBox by VBP - Autonomous Enterprise Workspace');
  const [pubAuthor, setPubAuthor] = useState('Atabey VBP');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const res = await fetch('/api/gitbox');
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
        if (data.length > 0 && !selectedRepo) {
          setSelectedRepo(data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch GitBox repositories:', e);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    try {
      const payload = {
        name: pubName,
        description: pubDesc,
        author: pubAuthor,
        primaryLanguage: currentWorkspace.primaryLanguage,
        files: currentWorkspace.files.map(f => ({
          path: f.path,
          name: f.name,
          language: f.language,
          content: f.content
        }))
      };

      const res = await fetch('/api/gitbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newRepo = await res.json();
        setPublishedUrl(`https://gitbox.vbp.io/repo/${newRepo.id}`);
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
        await fetchRepos();
        setSelectedRepo(newRepo);
        setActiveTab('explore');
      }
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setIsPublishing(false);
    }
  };


  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090f] text-zinc-100 font-sans overflow-hidden select-none">
      {/* Studio Top Header */}
      <div className="h-11 bg-[#06080c] border-b border-zinc-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
            <Box className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black tracking-wider bg-gradient-to-r from-red-500 via-rose-400 to-red-400 bg-clip-text text-transparent font-mono">
                GitBox by VBP Studio
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-red-500/20 text-red-300 rounded font-semibold border border-red-500/40 font-mono">
                v5.0 Full-Screen Hub
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onBackToEditor}
            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold font-mono transition-colors cursor-pointer"
          >
            {isTr ? '← Editöre Dön' : '← Back to Editor'}
          </button>
        </div>
      </div>

      {/* Studio Tab Navigation */}
      <div className="flex items-center justify-between px-4 bg-[#06080c]/80 border-b border-zinc-800 shrink-0">
        <div className="flex space-x-2 py-2">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isTr ? 'Topluluk Depoları (Explore)' : 'Community Repositories'}</span>
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'publish'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isTr ? 'Çalışma Alanını Yayınla (Publish)' : 'Publish Workspace'}</span>
          </button>
        </div>

        {publishedUrl && (
          <div className="flex items-center space-x-2 text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 px-3 py-1 rounded-xl font-mono">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isTr ? 'Başarıyla Yayınlandı:' : 'Successfully Published:'} <strong className="underline">{publishedUrl}</strong></span>
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {activeTab === 'explore' ? (
          <>
            {/* Repo List Sidebar */}
            <div className="w-full md:w-80 bg-[#06080c] border-r border-zinc-800 overflow-y-auto p-3 space-y-2">
              <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2 px-1">
                {isTr ? 'Açık Kaynak GitBox Havuzu' : 'Public GitBox Repos'} ({repos.length})
              </div>

              {repos.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                  <Box className="w-8 h-8 mx-auto mb-2 opacity-30 text-red-500" />
                  {isTr ? 'Henüz paylaşılan depo yok. İlk depoyu siz yayınlayın!' : 'No repositories published yet. Be the first to publish!'}
                </div>
              ) : (
                repos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => setSelectedRepo(repo)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedRepo?.id === repo.id
                        ? 'bg-red-950/30 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-red-300 font-mono flex items-center space-x-1.5">
                        <Box className="w-3.5 h-3.5 text-red-400" />
                        <span>{repo.name}</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono uppercase">
                        {repo.primaryLanguage}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{repo.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-red-400" />
                        <span>{repo.author}</span>
                      </span>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-0.5 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{repo.stars}</span>
                        </span>
                        <span className="flex items-center space-x-0.5 text-purple-400">
                          <GitFork className="w-3 h-3" />
                          <span>{repo.forks}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Repo Detail & Code Viewer */}
            <div className="flex-1 bg-[#05070b] overflow-y-auto p-6 flex flex-col justify-between">
              {selectedRepo ? (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-white font-mono flex items-center space-x-2.5">
                        <Box className="w-6 h-6 text-red-500" />
                        <span>{selectedRepo.name}</span>
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">{selectedRepo.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        onForkWorkspace(selectedRepo);
                        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
                        onBackToEditor();
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 flex items-center space-x-2 cursor-pointer active:scale-95 transition-all"
                    >
                      <GitFork className="w-4 h-4" />
                      <span>{isTr ? 'Çalışma Alanına Fork Et (Workspace\'e Aktar)' : 'Fork to Active Workspace'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">{isTr ? 'Yazar / Sahip' : 'Owner'}</span>
                      <strong className="text-red-300">{selectedRepo.author}</strong>
                    </div>
                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">{isTr ? 'Programlama Dili' : 'Language'}</span>
                      <strong className="text-purple-300 uppercase">{selectedRepo.primaryLanguage}</strong>
                    </div>
                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Stars & Forks</span>
                      <strong className="text-amber-300">⭐ {selectedRepo.stars} | 🍴 {selectedRepo.forks}</strong>
                    </div>
                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">{isTr ? 'Toplam Modül' : 'Files Count'}</span>
                      <strong className="text-emerald-300">{selectedRepo.files.length} Files</strong>
                    </div>
                  </div>

                  {/* File Contents Preview */}
                  <div className="space-y-3">
                    <div className="text-xs font-mono font-bold text-zinc-300 flex items-center space-x-1.5">
                      <Code2 className="w-4 h-4 text-red-400" />
                      <span>{isTr ? 'GitBox Paket Kaynak Kodları' : 'Repository Source Files'}</span>
                    </div>

                    {selectedRepo.files.map((file, idx) => (
                      <div key={idx} className="bg-[#030508] border border-zinc-800 rounded-2xl overflow-hidden shadow-md">
                        <div className="bg-zinc-900/90 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
                          <span className="text-red-300 font-bold">{file.path}</span>
                          <span className="text-zinc-500 text-[10px] uppercase">{file.language}</span>
                        </div>
                        <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto max-h-64 leading-relaxed">
                          {file.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500">
                  <Box className="w-12 h-12 mb-3 opacity-30 text-red-500" />
                  <p className="text-xs font-mono">{isTr ? 'İncelemek için sol menüden bir depo seçin.' : 'Select a repository from the sidebar to inspect.'}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Publish Studio Form */
          <div className="flex-1 bg-[#05070b] p-8 overflow-y-auto flex items-center justify-center">
            <form onSubmit={handlePublish} className="w-full max-w-xl space-y-5 bg-zinc-900/70 border border-zinc-800/90 p-8 rounded-3xl shadow-2xl">
              <div className="text-base font-bold text-white font-mono flex items-center space-x-2.5">
                <Share2 className="w-5 h-5 text-red-500" />
                <span>{isTr ? 'Aktif Çalışma Alanını GitBox\'a Yayınla' : 'Publish Active Workspace to GitBox'}</span>
              </div>
              <p className="text-xs text-zinc-400">
                {isTr ? 'Bu çalışma alanını anında güvenli bir GitBox bağlantısı ile paketleyip topluluk geliştiricilerinin erişimine açın.' : 'Package this workspace into a secure GitBox link instantly for community developers.'}
              </p>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">{isTr ? 'Depo Adı' : 'Repository Name'}</label>
                  <input
                    type="text"
                    value={pubName}
                    onChange={(e) => setPubName(e.target.value)}
                    className="w-full bg-[#030508] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-200 outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">{isTr ? 'Açıklama' : 'Description'}</label>
                  <textarea
                    value={pubDesc}
                    onChange={(e) => setPubDesc(e.target.value)}
                    className="w-full bg-[#030508] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-200 outline-none focus:border-red-500 h-24 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">{isTr ? 'Yazar Adı' : 'Author'}</label>
                  <input
                    type="text"
                    value={pubAuthor}
                    onChange={(e) => setPubAuthor(e.target.value)}
                    className="w-full bg-[#030508] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-200 outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-xs text-zinc-400 space-y-1.5 font-mono">
                  <div>📦 {isTr ? 'Paketlenecek Dosyalar' : 'Included Files'}: <strong className="text-red-300">{currentWorkspace.files.length} modules</strong></div>
                  <div>⚡ {isTr ? 'Birincil Dil / Runtime' : 'Primary Language'}: <strong className="text-purple-300 uppercase">{currentWorkspace.primaryLanguage}</strong></div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPublishing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/60 hover:from-red-500 hover:to-rose-500 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                <span>{isPublishing ? (isTr ? 'Yayınlanıyor...' : 'Publishing...') : (isTr ? 'GitBox\'ı Oluştur ve Yayınla' : 'Create & Publish GitBox')}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
