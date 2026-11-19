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

interface DevSocialStudioProps {
  onBackToEditor: () => void;
}

export const DevSocialStudio: React.FC<DevSocialStudioProps> = ({
  onBackToEditor,
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
    fetchPosts();
  }, []);

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
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
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


  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090f] text-zinc-100 font-sans overflow-hidden select-none">
      {/* Studio Top Header */}
      <div className="h-11 bg-[#06080c] border-b border-zinc-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black tracking-wider bg-gradient-to-r from-red-500 via-rose-400 to-red-400 bg-clip-text text-transparent font-mono">
                ViraSocial • DevFeed Studio
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-red-500/20 text-red-300 rounded font-semibold border border-red-500/40 font-mono">
                v5.0 Full-Screen Community
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

      {/* Main Feed Stream */}
      <div className="flex-1 bg-[#05070b] overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
        
        {/* New Post Creator Form */}
        <form onSubmit={handleCreatePost} className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-300">
            <span className="text-xl">👑</span>
            <input
              type="text"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-red-300 font-bold outline-none w-48"
              placeholder="Adınız / Handle"
              required
            />
            <span className="text-zinc-500">{isTr ? 'olarak toplulukla fikirlerini paylaş...' : 'share insights with the community...'}</span>
          </div>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={isTr ? 'Yeni bir kod güncellemesi, mimari tartışma veya duyuru yaz...' : 'Post a code update, architectural insight, or community announcement...'}
            className="w-full bg-[#030508] border border-zinc-700/80 rounded-2xl p-4 text-xs text-zinc-200 outline-none focus:border-red-500 h-28 resize-none font-sans"
            required
          />

          <input
            type="text"
            value={newSnippet}
            onChange={(e) => setNewSnippet(e.target.value)}
            placeholder={isTr ? 'İsteğe bağlı kod parçacığı (Örn: pub fn benchmark() { ... })' : 'Optional code snippet (e.g. pub fn benchmark() { ... })'}
            className="w-full bg-[#030508] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-purple-300 font-mono outline-none focus:border-red-500"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPosting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 flex items-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isPosting ? (isTr ? 'Gönderiliyor...' : 'Posting...') : (isTr ? 'DevFeed\'de Paylaş' : 'Publish to DevFeed')}</span>
            </button>
          </div>
        </form>

        {/* Posts Stream */}
        <div className="space-y-5">
          {posts.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-xs font-mono">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30 text-red-500" />
              {isTr ? 'Henüz gönderi yok. İlk geliştirici mesajını siz paylaşın!' : 'No posts yet. Be the first developer to post!'}
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-950/80 border border-red-500/40 flex items-center justify-center text-xl">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white font-mono">{post.author}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{post.handle}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">{post.timestamp}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed font-sans">{post.content}</p>

                {post.codeSnippet && (
                  <div className="bg-[#030508] border border-zinc-800 rounded-2xl overflow-hidden shadow-inner">
                    <div className="bg-zinc-950 px-4 py-1.5 border-b border-zinc-800 text-[11px] font-mono text-purple-300 flex items-center space-x-1.5">
                      <Code2 className="w-3.5 h-3.5 text-red-400" />
                      <span>{post.codeSnippet.language.toUpperCase()} Snippet</span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto">
                      {post.codeSnippet.code}
                    </pre>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-6 pt-2 border-t border-zinc-800/60 text-xs font-mono">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-1.5 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-red-500/20 text-red-500" />
                    <span>{post.likes} {isTr ? 'Beğeni' : 'Likes'}</span>
                  </button>

                  <span className="flex items-center space-x-1.5 text-zinc-400">
                    <MessageSquare className="w-4 h-4 text-zinc-500" />
                    <span>{post.comments.length} {isTr ? 'Yorum' : 'Comments'}</span>
                  </span>
                </div>

                {/* Comments List */}
                {post.comments.length > 0 && (
                  <div className="space-y-2.5 pl-4 border-l-2 border-zinc-800 pt-2">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 text-xs">
                        <div className="flex items-center justify-between mb-1 font-mono">
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
                    placeholder={isTr ? 'Bir yanıt yazın...' : 'Write a reply...'}
                    className="flex-1 bg-[#030508] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-red-500 font-sans"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-red-300 text-xs font-semibold font-mono cursor-pointer transition-colors"
                  >
                    {isTr ? 'Gönder' : 'Reply'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
