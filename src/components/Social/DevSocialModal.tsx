import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MessageSquare, Heart, Send, Sparkles, X, Code2, User, Globe, Share2, Plus, ThumbsUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SocialPost {
  id: string;
  author: string;
  avatar: string;
  handle: string;
  timestamp: string;
  content: string;
  codeSnippet?: { language: string; code: string };
  likes: number;
  comments: Array<{ id: string; author: string; text: string; timestamp: string }>;
}

interface DevSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevSocialModal: React.FC<DevSocialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('Atabey VBP');
  const [newSnippet, setNewSnippet] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/social/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      console.error('Failed to fetch social posts:', e);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setIsPosting(true);

    try {
      const payload = {
        author: newAuthor,
        handle: `@${newAuthor.toLowerCase().replace(/\s+/g, '_')}`,
        avatar: '🚀',
        content: newContent,
        codeSnippet: newSnippet.trim() ? { language: 'rust', code: newSnippet } : undefined
      };

      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setNewContent('');
        setNewSnippet('');
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        await fetchPosts();
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/social/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        await fetchPosts();
      }
    } catch (e) {
      console.error('Like failed:', e);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`/api/social/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: newAuthor, text })
      });

      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        await fetchPosts();
      }
    } catch (e) {
      console.error('Comment failed:', e);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-3xl bg-[#090c13] border-2 border-red-500/60 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.25)] overflow-hidden flex flex-col h-[85vh] text-zinc-100 font-sans">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950/80 via-[#0e121a] to-zinc-950 p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 ring-2 ring-red-400/50">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black tracking-wider bg-gradient-to-r from-red-500 via-rose-400 to-red-400 bg-clip-text text-transparent font-mono">
                  ViraSocial • DevFeed
                </span>
                <span className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded font-semibold border border-red-500/40 font-mono">
                  v5.0 Community
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {isTr ? 'Geliştiriciler arası iletişim, kod paylaşımı ve mimari tartışmalar.' : 'Programmer social feed for code updates and architectural discussions.'}
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

        {/* Content Stream */}
        <div className="flex-1 bg-[#06080e] overflow-y-auto p-4 space-y-4">
          
          {/* New Post Creator */}
          <form onSubmit={handleCreatePost} className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl shadow-lg space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-zinc-300">
              <span className="text-lg">👑</span>
              <input
                type="text"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-red-300 font-bold outline-none w-44"
                placeholder="Adınız / Handle"
                required
              />
              <span className="text-zinc-500">{isTr ? 'olarak düşüncelerini paylaş...' : 'share what you are building...'}</span>
            </div>

            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={isTr ? 'Yeni bir kod güncellemesi, mimari fikir veya duyuru yaz...' : 'Post a code update, architectural insight, or announcement...'}
              className="w-full bg-[#04060a] border border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-200 outline-none focus:border-red-500 h-20 resize-none font-sans"
              required
            />

            <input
              type="text"
              value={newSnippet}
              onChange={(e) => setNewSnippet(e.target.value)}
              placeholder={isTr ? 'İsteğe bağlı kod parçacığı (Örn: fn main() { ... })' : 'Optional code snippet (e.g. fn main() { ... })'}
              className="w-full bg-[#04060a] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-purple-300 font-mono outline-none focus:border-red-500"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPosting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-950/50 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPosting ? (isTr ? 'Gönderiliyor...' : 'Posting...') : (isTr ? 'DevFeed\'de Yayınla' : 'Publish to Feed')}</span>
              </button>
            </div>
          </form>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center text-lg">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-white font-mono">{post.author}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{post.handle}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">{post.timestamp}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed">{post.content}</p>

                {post.codeSnippet && (
                  <div className="bg-[#04060a] border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="bg-zinc-950 px-3 py-1 border-b border-zinc-800 text-[10px] font-mono text-purple-300 flex items-center space-x-1">
                      <Code2 className="w-3 h-3 text-red-400" />
                      <span>{post.codeSnippet.language.toUpperCase()} Snippet</span>
                    </div>
                    <pre className="p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto">
                      {post.codeSnippet.code}
                    </pre>
                  </div>
                )}

                {/* Actions & Likes */}
                <div className="flex items-center space-x-4 pt-2 border-t border-zinc-800/60 text-xs">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-red-500/20 text-red-500" />
                    <span className="font-mono font-semibold">{post.likes}</span>
                  </button>

                  <span className="flex items-center space-x-1 text-zinc-400 font-mono">
                    <MessageSquare className="w-4 h-4 text-zinc-500" />
                    <span>{post.comments.length} {isTr ? 'Yorum' : 'Comments'}</span>
                  </span>
                </div>

                {/* Comments List */}
                {post.comments.length > 0 && (
                  <div className="space-y-2 pl-4 border-l-2 border-zinc-800 pt-2">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800 text-xs">
                        <div className="flex items-center justify-between mb-0.5 font-mono">
                          <strong className="text-red-300 text-[11px]">{comment.author}</strong>
                          <span className="text-[9px] text-zinc-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-zinc-300">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    placeholder={isTr ? 'Bir yorum yaz...' : 'Write a comment...'}
                    className="flex-1 bg-[#04060a] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-red-500 font-sans"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-red-300 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {isTr ? 'Gönder' : 'Reply'}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
