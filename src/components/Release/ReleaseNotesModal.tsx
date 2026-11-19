import React from 'react';
import {
  Sparkles,
  X,
  Server,
  Atom,
  Gamepad2,
  HelpCircle,
  Bot,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Download,
  Terminal,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../i18n/LanguageContext';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchView?: (view: string) => void;
  onOpenHelp?: () => void;
  onOpenViraBot?: () => void;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({
  isOpen,
  onClose,
  onSwitchView,
  onOpenHelp,
  onOpenViraBot
}) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  if (!isOpen) return null;

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-zinc-100 font-sans">
        {/* Header */}
        <div className="bg-[#111115] p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-black tracking-wider text-white font-mono">
                  {isTr ? 'VIRACODE IDE v5.0.0 YAYINLANDI!' : 'VIRACODE IDE v5.0.0 RELEASED!'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/50 text-[10px] font-mono font-bold">
                  v5.0.0
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {isTr
                  ? 'Modular Autonomous Workstation • Son Güncelleme & Sürüm Notları'
                  : 'Modular Autonomous Workstation • Latest Update & Changelog'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isTr ? 'Kapat' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed font-sans">
          {/* Release Intro Banner */}
          <div className="p-3.5 rounded-xl bg-[#111115] border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-red-400 font-mono flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{isTr ? 'Yeni Nesil Stüdyo Sürümü: v5.0.0 (18.11.2026)' : 'Next-Gen Studio Release: v5.0.0 (18.11.2026)'}</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {isTr
                  ? 'Siyah/gri sade arayüz, Veritabanı Merkezi, Release Timeline, boş başlangıç projeleri ve özelleştirilebilir klasör simgeleri aktif.'
                  : 'Sleek dark/zinc UI, centered Database Center, Release Timeline, clean empty workspace start, and customizable folder icons are live.'}
              </p>
            </div>
            <button
              onClick={handleCelebrate}
              className="px-2.5 py-1 bg-red-600/30 hover:bg-red-600 text-red-200 border border-red-500/50 rounded text-[10px] font-mono font-bold transition-all cursor-pointer shrink-0"
            >
              🎉 {isTr ? 'Kutla!' : 'Celebrate!'}
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
              {isTr ? '🚀 Neler Yeni (v5.0.0 Yenilikleri):' : "🚀 What's New in v5.0.0:"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-[#111115] border border-zinc-800 space-y-1">
                <div className="flex items-center space-x-2 text-red-400 font-mono font-bold text-xs">
                  <Server className="w-3.5 h-3.5 text-red-400" />
                  <span>{isTr ? '1. Veritabanı Merkezi (Ortada)' : '1. Centered Database Center'}</span>
                </div>
                <p className="text-[10.5px] text-zinc-400">
                  {isTr
                    ? 'Tablo, satır düzenleme ve canlı SQL sorgularını doğrudan orta çalışma alanında açın ve SQL çıktısı alın.'
                    : 'Inspect tables, edit rows, and run live SQL queries directly in the center stage.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#111115] border border-zinc-800 space-y-1">
                <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold text-xs">
                  <Atom className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isTr ? '2. Sağ & Sol Panel Ayrımı' : '2. Clean Left & Right Sidebars'}</span>
                </div>
                <p className="text-[10.5px] text-zinc-400">
                  {isTr
                    ? 'Sol tarafta Çözüm Gezgini, Arama ve Git; sağ tarafta Dosya Özellikleri, Kuantum, Sistem Monitörü, GitBox II ve Timeline.'
                    : 'Explorer, Search & Git on the left; File Properties, Quantum, System Monitor, GitBox II & Timeline on the right.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#111115] border border-zinc-800 space-y-1">
                <div className="flex items-center space-x-2 text-amber-400 font-mono font-bold text-xs">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTr ? '3. Temiz Başlangıç & Sekmeler' : '3. Clean Start & Code Tabs'}</span>
                </div>
                <p className="text-[10.5px] text-zinc-400">
                  {isTr
                    ? 'Başlangıçta boş Default Project ve Sources projeleri, sekme yoksa hızlı Yeni Dosya ve Yardım yönlendirmesi.'
                    : 'Starts cleanly with empty Default Project and Sources, plus quick New File & Help guidance when no tabs are open.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#111115] border border-zinc-800 space-y-1">
                <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold text-xs">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isTr ? '4. Simgeler & Canlı Çalıştırma' : '4. Custom Icons & Live Run'}</span>
                </div>
                <p className="text-[10.5px] text-zinc-400">
                  {isTr
                    ? 'Üstten yeni proje açın, proje/klasör simgelerini değiştirin ve kodlarınızı gerçek zamanlı çalıştırın.'
                    : 'Create projects from the header, customize folder/project icons, and run code live.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 bg-[#111115] border-t border-zinc-800 px-4 sm:px-6 flex items-center justify-between shrink-0 font-mono text-xs">
          <div className="flex items-center space-x-2 text-zinc-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{isTr ? 'ViraCode Çekirdek v5.0.0 Aktif' : 'ViraCode Kernel v5.0.0 Active'}</span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenHelp && (
              <button
                onClick={() => {
                  onClose();
                  onOpenHelp();
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors cursor-pointer"
              >
                {isTr ? 'Yardım Merkezini Aç' : 'Open Help Center'}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-lg transition-all shadow-md shadow-red-900/40 cursor-pointer text-xs flex items-center space-x-1"
            >
              <span>{isTr ? 'Harika, Başla!' : 'Awesome, Explore!'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
