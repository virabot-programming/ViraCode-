import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';

interface PromptBarProps {
  onOrchestrate: (prompt: string) => void;
  isOrchestrating: boolean;
}

export const PromptBar: React.FC<PromptBarProps> = ({ onOrchestrate, isOrchestrating }) => {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState<string>('');

  const presetPrompts = [
    t.preset1,
    t.preset2,
    t.preset3,
    t.preset4,
    t.preset5
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isOrchestrating) return;
    onOrchestrate(prompt);
  };

  const handleSelectPreset = (p: string) => {
    setPrompt(p);
    onOrchestrate(p);
  };

  return (
    <div className="px-2 py-0.5 bg-[#080a0e] border-t border-zinc-800/80 flex items-center justify-between gap-1.5 text-[10px] select-none">
      {/* Directive Form - Compact */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-1 flex-1 min-w-0">
        <div className="relative flex-1">
          <div className="absolute left-2 top-1 text-red-500">
            <Sparkles className="w-3 h-3 animate-pulse" />
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.promptPlaceholder}
            disabled={isOrchestrating}
            className="w-full bg-[#0d1017] border border-zinc-800 rounded pl-6 pr-2 py-0.5 text-[10px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/80 font-mono shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isOrchestrating}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono flex items-center space-x-1 shadow transition-all shrink-0 ${
            !prompt.trim() || isOrchestrating
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
              : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950/40 cursor-pointer'
          }`}
        >
          <span>{isOrchestrating ? t.synthesizingBtn : t.synthesizeBtn}</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </button>
      </form>

      {/* Preset Directives - Compact inline badges */}
      <div className="hidden lg:flex items-center space-x-1 overflow-x-auto scrollbar-none font-mono shrink-0">
        <span className="text-zinc-500 text-[9px] shrink-0">{t.quickDirectives}:</span>
        {presetPrompts.slice(0, 3).map((p, i) => (
          <button
            key={i}
            onClick={() => handleSelectPreset(p)}
            disabled={isOrchestrating}
            className="px-1.5 py-0 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-200 hover:border-red-500/50 transition-colors shrink-0 hover:bg-zinc-800 text-[9px] cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};
