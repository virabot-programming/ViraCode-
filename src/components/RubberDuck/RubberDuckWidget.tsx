import React, { useState, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface RubberDuckWidgetProps {
  onOpenStation: () => void;
  className?: string;
}

export const RubberDuckWidget: React.FC<RubberDuckWidgetProps> = ({ onOpenStation, className = '' }) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  const [quackCount, setQuackCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('viracode_duck_quacks') || '0', 10);
    } catch (e) {
      return 0;
    }
  });

  const [isWiggling, setIsWiggling] = useState<boolean>(false);
  const [showSpeech, setShowSpeech] = useState<boolean>(false);
  const [bubbleText, setBubbleText] = useState<string>('Vak! 🦆');
  const audioCtxRef = useRef<AudioContext | null>(null);

  const QUICK_QUACKS = isTr
    ? ['Vak! 🦆', 'Sıkma beni! 🐥', 'Kodu baştan yaz! 💻', 'Semikolon nerede?! 🧐', 'Kahve iç! ☕', 'VAK VAK! 📢', 'Bence haklısın! 💛']
    : ['Quack! 🦆', 'Squeeze me! 🐥', 'Restart your PC! 💻', 'Where is the semicolon?! 🧐', 'Drink coffee! ☕', 'QUACK QUACK! 📢', 'I agree with you! 💛'];

  const playQuickSqueak = () => {
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
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc2.type = 'triangle';

      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.16);

      osc2.frequency.setValueAtTime(455, now);
      osc2.frequency.exponentialRampToValueAtTime(810, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(365, now + 0.16);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.7, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.22);
      osc2.stop(now + 0.22);
    } catch (e) {
      // Audio fallback
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playQuickSqueak();

    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 250);

    const newCount = quackCount + 1;
    setQuackCount(newCount);
    try {
      localStorage.setItem('viracode_duck_quacks', newCount.toString());
    } catch (e) {}

    const randomBubble = QUICK_QUACKS[Math.floor(Math.random() * QUICK_QUACKS.length)];
    setBubbleText(randomBubble);
    setShowSpeech(true);
    setTimeout(() => setShowSpeech(false), 1800);
  };

  return (
    <div className={`flex flex-col items-end select-none relative ${className}`}>
      {/* Speech Bubble */}
      {showSpeech && (
        <div className="mb-1.5 px-2 py-1 bg-amber-400 text-black font-mono font-bold text-[9px] rounded-lg shadow-xl border border-amber-300 animate-in fade-in slide-in-from-bottom-2 duration-150 relative">
          <span>{bubbleText}</span>
          <div className="absolute -bottom-1 right-3 w-2 h-2 bg-amber-400 rotate-45" />
        </div>
      )}

      {/* Duck Floating Pill Button */}
      <div className="flex items-center space-x-1 bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/50 hover:border-amber-400 rounded-full px-2 py-1 shadow-lg shadow-amber-950/40 backdrop-blur-xs transition-all group">
        {/* Click to Squeak & Quack */}
        <button
          onClick={handleClick}
          className={`flex items-center space-x-1 cursor-pointer transition-transform ${
            isWiggling ? 'scale-125 rotate-12' : 'hover:scale-110 active:scale-95'
          }`}
          title={isTr ? 'Lastik Ördeği Sık & Vaklat (Tek Tık)!' : 'Squeeze Rubber Duck (Click)!'}
        >
          <span className="text-base select-none">🦆</span>
          <span className="text-[10px] font-mono font-bold text-amber-300 group-hover:text-amber-200">
            {isTr ? 'Vak!' : 'Quack!'}
          </span>
          <span className="text-[8px] font-mono bg-amber-950 text-amber-400 px-1 py-0.2 rounded-full border border-amber-500/40 font-bold">
            {quackCount}
          </span>
        </button>

        {/* Vertical Separator */}
        <div className="w-[1px] h-3 bg-zinc-700 mx-0.5" />

        {/* Open Full Station Button */}
        <button
          onClick={onOpenStation}
          className="text-[9px] font-mono text-zinc-400 hover:text-amber-300 px-1 py-0.5 rounded hover:bg-zinc-700/60 transition-colors cursor-pointer"
          title={isTr ? 'Lastik Ördek Saçmalık İstasyonunu Aç' : 'Open Duck Absurdity Station'}
        >
          💬 {isTr ? 'Danış' : 'Ask'}
        </button>
      </div>
    </div>
  );
};
