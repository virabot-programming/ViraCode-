import React, { useState, useRef } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ViraBotWidgetProps {
  onToggle: () => void;
  isOpen: boolean;
}

export const ViraBotWidget: React.FC<ViraBotWidgetProps> = ({ onToggle, isOpen }) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  const [showSpeech, setShowSpeech] = useState<boolean>(false);
  const [bubbleText, setBubbleText] = useState<string>('');
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const AI_TIPS = isTr
    ? [
        'Kodunda SAST güvenlik taraması yapmamı ister misin? 🛡️',
        'O(1) zaman ve bellek optimizasyonu önerileri hazırlayabilirim! ⚡',
        'Tüm test senaryolarını ve sınır değerlerini test edebilirim. 🧪',
        'Clean Architecture & DDD katmanlarını inceleyelim mi? 🏛️',
        'Bana /audit, /refactor veya /heal diyebilirsin! 🤖',
        'Aktif dosyan için eksiksiz patch kodu üretebilirim. ✨'
      ]
    : [
        'Want me to run a SAST security audit on your file? 🛡️',
        'I can synthesize O(1) space/time optimizations! ⚡',
        'Need comprehensive proptests and fuzzing coverage? 🧪',
        'Shall we enforce clean DDD architectural invariants? 🏛️',
        'Try typing /audit, /refactor, or /heal to me! 🤖',
        'I can synthesize complete unit patches directly into code. ✨'
      ];

  const playChirp = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio fallback
    }
  };

  const handleSqueeze = (e: React.MouseEvent) => {
    e.stopPropagation();
    playChirp();
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 300);

    const randomTip = AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)];
    setBubbleText(randomTip);
    setShowSpeech(true);
    setTimeout(() => setShowSpeech(false), 3200);
  };

  return (
    <div className="flex flex-col items-end select-none relative">
      {/* Speech Bubble */}
      {showSpeech && (
        <div className="mb-1.5 max-w-[200px] px-2.5 py-1.5 bg-[#140b0f] text-red-200 font-mono text-[9px] rounded-xl shadow-2xl border border-red-500/60 animate-in fade-in slide-in-from-bottom-2 duration-150 relative">
          <div className="flex items-center space-x-1 text-red-400 font-bold mb-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            <span>ViraBot AI:</span>
          </div>
          <span className="leading-tight">{bubbleText}</span>
          <div className="absolute -bottom-1 right-5 w-2 h-2 bg-[#140b0f] border-r border-b border-red-500/60 rotate-45" />
        </div>
      )}

      {/* Floating Pill Button */}
      <div
        className={`flex items-center space-x-1.5 rounded-full px-2 py-1 shadow-lg backdrop-blur-xs transition-all border cursor-pointer ${
          isOpen
            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-400 shadow-red-950/60 ring-1 ring-red-400'
            : 'bg-zinc-900/90 hover:bg-zinc-800 text-red-300 border-red-500/50 hover:border-red-400 shadow-red-950/40'
        }`}
      >
        {/* Squeeze / Tip button */}
        <button
          onClick={handleSqueeze}
          className={`flex items-center space-x-1 cursor-pointer transition-transform ${
            isPulsing ? 'scale-125' : 'hover:scale-110 active:scale-95'
          }`}
          title={isTr ? 'ViraBot İpucu İste (Tıkla)!' : 'Ask ViraBot for Tip (Click)!'}
        >
          <span className="relative flex items-center justify-center">
            <Bot className="w-4 h-4 text-white drop-shadow-sm" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </span>
          <span className="text-[10px] font-mono font-bold truncate max-w-[65px]">
            ViraBot
          </span>
          <span className="text-[8px] font-mono bg-red-950/80 text-red-400 px-1 py-0.2 rounded-full border border-red-500/40 font-bold">
            AI
          </span>
        </button>

        {/* Vertical Separator */}
        <div className="w-[1px] h-3 bg-zinc-700/80 mx-0.5" />

        {/* Toggle Panel Button */}
        <button
          onClick={onToggle}
          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded hover:bg-red-500/20 text-red-300 hover:text-white transition-colors cursor-pointer flex items-center space-x-0.5"
          title={isOpen ? (isTr ? 'ViraBot Panelini Kapat' : 'Close ViraBot') : (isTr ? 'ViraBot Asistanı Aç' : 'Open ViraBot Assistant')}
        >
          {isOpen ? (
            <>
              <X className="w-2.5 h-2.5" />
              <span>{isTr ? 'Kapat' : 'Close'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-2.5 h-2.5 text-red-400 animate-pulse" />
              <span>{isTr ? 'Sohbet' : 'Chat'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
