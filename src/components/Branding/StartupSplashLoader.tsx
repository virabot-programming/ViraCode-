import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';
import { ViraCodeLogo } from './ViraCodeLogo';

interface StartupSplashLoaderProps {
  onFinish: () => void;
  minDurationMs?: number;
}

const BOOT_STEPS_TR = [
  '⚡ ViraCode Sanal Çekirdek (v5.0.0 AVX-512) başlatılıyor...',
  '📁 AST Sembol Tablosu & DDD Çalışma Alanları yükleniyor...',
  '🛡️ 4 Otonom Ajan Alt Sistemi (Mimar, Güvenlik, Performans, QA) bağlanıyor...',
  '🧩 Eklentiler, Sistem Monitörü ve Çoklu Çalıştırıcılar bağdaştırılıyor...',
  '🚀 Sistem değişmezleri kilitlendi. IDE ortamı başlatılıyor...',
];

const BOOT_STEPS_EN = [
  '⚡ Initializing ViraCode Virtual Kernel (v5.0.0 AVX-512)...',
  '📁 Loading AST Symbol Tables & DDD Workspaces...',
  '🛡️ Mounting 4 Autonomous Agent Subsystems (Architect, Security, Perf, QA)...',
  '🧩 Linking Plugins, System Monitor & Polyglot Multi-Runners...',
  '🚀 System invariants locked. Launching IDE workstation...',
];

export const StartupSplashLoader: React.FC<StartupSplashLoaderProps> = ({
  onFinish,
  minDurationMs = 2000,
}) => {
  const { language } = useI18n();
  const [progress, setProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  const bootSteps = language === 'tr' ? BOOT_STEPS_TR : BOOT_STEPS_EN;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawPct = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));
      setProgress(rawPct);

      const stepIdx = Math.min(
        bootSteps.length - 1,
        Math.floor((rawPct / 100) * bootSteps.length)
      );
      setCurrentStepIndex(stepIdx);

      if (rawPct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            onFinish();
          }, 400); // Fadeout duration
        }, 250);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDurationMs, bootSteps, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 150);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#06080c] flex flex-col items-center justify-center p-4 select-none transition-all duration-400 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Cyber Glow & Ambient Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_40%,rgba(239,68,68,0.14),rgba(6,8,12,0.98))] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-red-600/15 via-rose-600/15 to-amber-600/10 blur-3xl pointer-events-none animate-pulse" />

      {/* Center Branding Content */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
        {/* Animated Original Logo with Halo Rings */}
        <div className="relative mb-6 w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-red-500/40 animate-ping opacity-30" />
          <div className="absolute -inset-4 rounded-full border border-rose-500/25 animate-pulse opacity-50" />

          <div className="relative transform transition-transform duration-700 hover:scale-105">
            <ViraCodeLogo size="hero" glow className="!h-14" />
          </div>
        </div>

        {/* Brand Name Typography in Crimson/Rose/Ruby */}
        <div className="space-y-1.5 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-wider flex items-center justify-center space-x-2">
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-red-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_12px_rgba(239,68,68,0.5)]">
              VIRACODE
            </span>
            <span className="text-white font-extrabold">IDE</span>
          </h1>
          <p className="text-xs font-mono tracking-widest text-red-400/90 uppercase">
            v5.0.0 HYPER-IDE • AUTONOMOUS WORKSTATION
          </p>
        </div>

        {/* Boot Progress Bar */}
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-full h-2 p-0.5 mb-3 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full transition-all duration-75 shadow-[0_0_14px_rgba(239,68,68,0.85)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percent & Live Status Text */}
        <div className="w-full flex items-center justify-between text-xs font-mono mb-6 px-1">
          <span className="text-zinc-400 truncate max-w-[80%] text-left">
            {bootSteps[currentStepIndex]}
          </span>
          <span className="text-red-400 font-bold ml-2 shrink-0">
            {progress}%
          </span>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="px-4 py-1.5 rounded-lg text-xs font-mono text-zinc-500 hover:text-red-300 hover:bg-zinc-900/60 border border-transparent hover:border-red-500/40 transition-all cursor-pointer flex items-center space-x-1"
        >
          <span>{language === 'tr' ? 'Yüklemeyi Atla (Skip)' : 'Skip Loading'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Copyright Footnote */}
      <div className="absolute bottom-4 text-[11px] font-mono text-zinc-600">
        © 2026 VBP • High-Fidelity Autonomous Runtime
      </div>
    </div>
  );
};
