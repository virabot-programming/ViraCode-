import React, { useState, useRef } from 'react';
import { HelpCircle, BookOpen, Compass } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface HelpWidgetProps {
  onOpenHelp: () => void;
  isOpen?: boolean;
}

export const HelpWidget: React.FC<HelpWidgetProps> = ({ onOpenHelp, isOpen = false }) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  const [showSpeech, setShowSpeech] = useState<boolean>(false);
  const [bubbleText, setBubbleText] = useState<string>('');
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const HELP_TIPS = isTr
    ? [
        'Arayüz turunu başlatmak için tıklayabilirsin! 🧭',
        'Klavye kısayolları için "?" tuşuna bas! ⌨️',
        'Patron tuşu: Esc ile anında oyundan koda dön! 🚨',
        'Terminalde `help` yazarak CLI komutlarını gör! 💻',
        'SAST açıklarını "Otomatik Onar" ile çözebilirsin. 🛡️',
        '10 farklı stüdyo görünümü üst çubukta! 🚀'
      ]
    : [
        'Click to start the interactive workstation tour! 🧭',
        'Press "?" anytime for keyboard hotkeys! ⌨️',
        'Boss Key: Hit Esc to instantly escape from games to code! 🚨',
        'Type `help` in terminal for CLI commands! 💻',
        'Use "Self-Heal Project" to auto-patch SAST issues. 🛡️',
        'Explore 10 studio views in the top navigation! 🚀'
      ];

  const playChime = () => {
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

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(990, now + 0.1);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Audio fallback
    }
  };

  const handleSqueeze = (e: React.MouseEvent) => {
    e.stopPropagation();
    playChime();
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 300);

    const randomTip = HELP_TIPS[Math.floor(Math.random() * HELP_TIPS.length)];
    setBubbleText(randomTip);
    setShowSpeech(true);
    setTimeout(() => setShowSpeech(false), 3200);
  };

  return (
    <div className="flex flex-col items-end select-none relative">
      {/* Speech Bubble */}
      {showSpeech && (
        <div className="mb-1.5 max-w-[190px] px-2.5 py-1.5 bg-[#0e0f17] text-zinc-200 font-mono text-[9px] rounded-xl shadow-2xl border border-red-500/50 animate-in fade-in slide-in-from-bottom-2 duration-150 relative">
          <div className="flex items-center space-x-1 text-red-400 font-bold mb-0.5">
            <Compass className="w-2.5 h-2.5" />
            <span>{isTr ? 'Yardım İpucu:' : 'Help Tip:'}</span>
          </div>
          <span className="leading-tight">{bubbleText}</span>
          <div className="absolute -bottom-1 right-5 w-2 h-2 bg-[#0e0f17] border-r border-b border-red-500/50 rotate-45" />
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
          title={isTr ? 'Hızlı Yardım İpucu (Tıkla)!' : 'Quick Help Tip (Click)!'}
        >
          <span className="relative flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-red-400 drop-shadow-sm" />
          </span>
          <span className="text-[10px] font-mono font-bold">
            {isTr ? 'Yardım' : 'Help'}
          </span>
          <span className="text-[8px] font-mono bg-red-950/80 text-red-400 px-1 py-0.2 rounded-full border border-red-500/40 font-bold">
            ?
          </span>
        </button>

        {/* Vertical Separator */}
        <div className="w-[1px] h-3 bg-zinc-700/80 mx-0.5" />

        {/* Open Full Help Center Modal */}
        <button
          onClick={onOpenHelp}
          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded hover:bg-red-500/20 text-red-300 hover:text-white transition-colors cursor-pointer flex items-center space-x-0.5"
          title={isTr ? 'Kapsamlı Yardım & Rehber Merkezini Aç' : 'Open Comprehensive Help Center'}
        >
          <BookOpen className="w-2.5 h-2.5 text-red-400" />
          <span>{isTr ? 'Rehber' : 'Guide'}</span>
        </button>
      </div>
    </div>
  );
};
