import React, { useState, useEffect } from 'react';
import { ProjectWorkspace, VirtualFile } from '../../types/engine';
import { useLanguage } from '../../i18n/LanguageContext';
import { Box, GitFork, Star, Share2, Plus, Terminal, Code2, Check, X, Globe, User, Clock, ArrowRight } from 'lucide-react';
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

interface GitBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWorkspace: ProjectWorkspace;
  onForkWorkspace: (repo: GitBoxRepo) => void;
}

export const GitBoxModal: React.FC<GitBoxModalProps> = ({
  isOpen,
  onClose,
  currentWorkspace,
  onForkWorkspace,
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
    if (isOpen) {
      fetchRepos();
    }
  }, [isOpen]);

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
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
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


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-4xl bg-[#090c13] border-2 border-red-500/60 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.25)] overflow-hidden flex flex-col h-[85vh] text-zinc-100 font-sans">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950/80 via-[#0e121a] to-zinc-950 p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 ring-2 ring-red-400/50">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black tracking-wider bg-gradient-to-r from-red-500 via-rose-400 to-red-400 bg-clip-text text-transparent font-mono">
                  GitBox by VBP
                </span>
                <span className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded font-semibold border border-red-500/40 font-mono">
                  v5.0 Share Hub
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {isTr ? 'Başkalarıyla kod paylaşın, depoları fork edin ve topluluk projelerini inceleyin.' : 'Share code with others, fork repositories, and explore community projects.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-4 bg-[#06080c] border-b border-zinc-800 shrink-0">
          <div className="flex space-x-2 py-2">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
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
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'publish'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isTr ? 'GitBox\'a Yayınla (Publish)' : 'Publish to GitBox'}</span>
            </button>
          </div>

          {publishedUrl && (
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-mono">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isTr ? 'Yayınlandı:' : 'Published:'} <strong className="underline">{publishedUrl}</strong></span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {activeTab === 'explore' ? (
            <>
              {/* Repo List Sidebar */}
              <div className="w-full md:w-1/3 bg-[#07090f] border-r border-zinc-800 overflow-y-auto p-3 space-y-2">
                <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  {isTr ? 'Açık Kaynak GitBox\'lar' : 'Public GitBoxes'} ({repos.length})
                </div>

                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => setSelectedRepo(repo)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedRepo?.id === repo.id
                        ? 'bg-red-950/30 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-red-300 font-mono flex items-center space-x-1.5">
                        <Box className="w-3.5 h-3.5 text-red-400" />
                        <span>{repo.name}</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
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
                ))}
              </div>

              {/* Repo Detail & Viewer */}
              <div className="flex-1 bg-[#06080e] overflow-y-auto p-4 flex flex-col justify-between">
                {selectedRepo ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
                      <div>
                        <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
                          <Box className="w-5 h-5 text-red-500" />
                          <span>{selectedRepo.name}</span>
                        </h2>
                        <p className="text-xs text-zinc-400 mt-1">{selectedRepo.description}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            onForkWorkspace(selectedRepo);
                            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-all"
                        >
                          <GitFork className="w-3.5 h-3.5" />
                          <span>{isTr ? 'Çalışma Alanına Fork Et' : 'Fork to Workspace'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px]">{isTr ? 'Yazar' : 'Author'}</span>
                        <strong className="text-red-300">{selectedRepo.author}</strong>
                      </div>
                      <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px]">{isTr ? 'Dil / Çerçeve' : 'Language'}</span>
                        <strong className="text-purple-300 uppercase">{selectedRepo.primaryLanguage}</strong>
                      </div>
                      <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px]">Stars & Forks</span>
                        <strong className="text-amber-300">⭐ {selectedRepo.stars} | 🍴 {selectedRepo.forks}</strong>
                      </div>
                      <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px]">{isTr ? 'Dosya Sayısı' : 'Files'}</span>
                        <strong className="text-emerald-300">{selectedRepo.files.length} Modules</strong>
                      </div>
                    </div>

                    {/* File Explorer Preview */}
                    <div className="space-y-2">
                      <div className="text-xs font-mono font-bold text-zinc-300 flex items-center space-x-1">
                        <Code2 className="w-3.5 h-3.5 text-red-400" />
                        <span>{isTr ? 'GitBox Paket İçeriği' : 'Package Contents'}</span>
                      </div>

                      {selectedRepo.files.map((file, idx) => (
                        <div key={idx} className="bg-[#04060a] border border-zinc-800 rounded-xl overflow-hidden">
                          <div className="bg-zinc-900 px-3 py-1.5 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
                            <span className="text-red-300">{file.path}</span>
                            <span className="text-zinc-500 text-[10px]">{file.language}</span>
                          </div>
                          <pre className="p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48">
                            {file.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500">
                    <Box className="w-10 h-10 mb-2 opacity-40 text-red-500" />
                    <p className="text-xs">{isTr ? 'İncelemek için sol menüden bir depo seçin.' : 'Select a repository from the left sidebar to inspect.'}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Publish Form */
            <div className="flex-1 bg-[#06080e] p-6 overflow-y-auto flex items-center justify-center">
              <form onSubmit={handlePublish} className="w-full max-w-lg space-y-4 bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl shadow-xl">
                <div className="text-base font-bold text-white font-mono flex items-center space-x-2">
                  <Share2 className="w-5 h-5 text-red-500" />
                  <span>{isTr ? 'Aktif Çalışma Alanını GitBox\'a Yükle' : 'Publish Active Workspace to GitBox'}</span>
                </div>
                <p className="text-xs text-zinc-400">
                  {isTr ? 'Bu çalışma alanını anında güvenli bir GitBox bağlantısı ile paketleyip diğer geliştiricilerin erişimine açın.' : 'Package this workspace into a secure GitBox link instantly for other developers.'}
                </p>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1">{isTr ? 'Depo Adı' : 'Repository Name'}</label>
                    <input
                      type="text"
                      value={pubName}
                      onChange={(e) => setPubName(e.target.value)}
                      className="w-full bg-[#04060a] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">{isTr ? 'Açıklama' : 'Description'}</label>
                    <textarea
                      value={pubDesc}
                      onChange={(e) => setPubDesc(e.target.value)}
                      className="w-full bg-[#04060a] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-red-500 h-20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">{isTr ? 'Yazar Adı' : 'Author'}</label>
                    <input
                      type="text"
                      value={pubAuthor}
                      onChange={(e) => setPubAuthor(e.target.value)}
                      className="w-full bg-[#04060a] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                    <div>📦 {isTr ? 'Paketlenecek Dosyalar' : 'Included Files'}: <strong className="text-red-300">{currentWorkspace.files.length} modules</strong></div>
                    <div>⚡ {isTr ? 'Birincil Dil' : 'Primary Language'}: <strong className="text-purple-300 uppercase">{currentWorkspace.primaryLanguage}</strong></div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPublishing}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/60 hover:from-red-500 hover:to-rose-500 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isPublishing ? (isTr ? 'Yayınlanıyor...' : 'Publishing...') : (isTr ? 'GitBox\'ı Oluştur ve Yayınla' : 'Create & Publish GitBox')}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
