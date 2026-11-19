import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { GitCommit, Sparkles, CheckCircle2, Shield, Cpu, Server, Gamepad2, Atom, X } from 'lucide-react';

interface ReleaseTimelineSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReleaseNotes: () => void;
  embedded?: boolean;
}

export const ReleaseTimelineSidebar: React.FC<ReleaseTimelineSidebarProps> = ({
  isOpen,
  onClose,
  onOpenReleaseNotes,
  embedded = false,
}) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  if (!isOpen) return null;

  const milestones = [
    {
      version: 'v5.0.0',
      title: isTr ? 'VBP DevFeed, Google Apps & Cloud SQL Launch' : 'VBP DevFeed, Google Apps & Cloud SQL Launch',
      date: '2026-11-18',
      badgeColor: 'bg-red-600/20 text-red-300 border-red-500/70',
      description: isTr
        ? 'Google Chat, Gmail, Google Drive ve Google Meet tam ekran VBP DevFeed stüdyosu, Google Cloud SQL uyumluluğu ve v5.0.0 yayını.'
        : 'Full-screen VBP DevFeed studio for Google Chat, Gmail, Drive, and Meet, Google Cloud SQL compatibility, and ViraCode 5 launch.',
      icon: <Sparkles className="w-3.5 h-3.5 text-red-400" />
    },
    {
      version: 'v4.8.0',
      title: isTr ? 'Modular Workstation & Clean Launch' : 'Modular Workstation & Clean Launch',
      date: '2026-11-13',
      badgeColor: 'bg-zinc-800 text-zinc-200 border-zinc-700',
      description: isTr
        ? 'Boş başlangıç (Default Project & Sources), ortada Veritabanı Merkezi, çoklu kod sekmeleri, özelleştirilebilir proje/klasör simgeleri ve Release Timeline geri dönüşü.'
        : 'Clean start (Default Project & Sources), centered Database Center, multi-file code tabs, custom project/folder icons, and restored Release Timeline.',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />
    },
    {
      version: 'v4.2.1',
      title: isTr ? 'Hyper-Scale & Stability Overhaul' : 'Hyper-Scale & Stability Overhaul',
      date: '2026-11-04',
      badgeColor: 'bg-zinc-800 text-zinc-200 border-zinc-700',
      description: isTr 
        ? 'Genel sistem optimizasyonları, UI performans iyileştirmeleri, GitBox II ve sistem monitörü güncellemeleri.'
        : 'Global system optimizations, UI performance tuning, and stability hardening for GitBox II & system monitor.',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />
    },
    {
      version: 'v4.0.0',
      title: isTr ? 'Enterprise Autonomous Edition' : 'Enterprise Autonomous Edition',
      date: '2026-11-04',
      badgeColor: 'bg-red-500/15 text-red-300 border-red-500/40',
      description: isTr 
        ? 'Kuantum QPU, GitBox Paylaşım ve otonom mühendislik stüdyoları eklendi.'
        : 'Quantum QPU, GitBox Sharing, and autonomous engineering studios released.',
      icon: <Atom className="w-3.5 h-3.5 text-cyan-400" />
    },
    {
      version: 'v3.5.0',
      title: isTr ? 'Hybrid Mesh & Security Hardening' : 'Hybrid Mesh & Security Hardening',
      date: '2026-10-18',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
      description: isTr 
        ? 'SAST güvenlik taraması, otomatik 4-ajanlı kendini onarma döngüsü ve bellek havuz optimizasyonu.'
        : 'SAST taint analysis, 4-agent autonomous self-healing loop, and memory arena zero-alloc optimization.',
      icon: <Shield className="w-3.5 h-3.5 text-rose-400" />
    },
    {
      version: 'v3.0.0',
      title: isTr ? 'Multi-Threaded Virtual IDE Core' : 'Multi-Threaded Virtual IDE Core',
      date: '2026-09-12',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      description: isTr 
        ? 'Sanal çok dilli derleyici, AVX-512 target simülasyonu ve AST sembol analizi.'
        : 'Virtual polyglot compiler, AVX-512 target simulation, and stateful AST symbol table.',
      icon: <Cpu className="w-3.5 h-3.5 text-amber-400" />
    },
    {
      version: 'v2.0.0',
      title: isTr ? 'OmniEngine Autonomous Core' : 'OmniEngine Autonomous Core',
      date: '2026-07-30',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
      description: isTr 
        ? 'Yapay zeka yönlendiricisi ve kurumsal teslimat planı oluşturucu.'
        : 'AI directive prompt orchestrator and 5-section enterprise delivery blueprint.',
      icon: <GitCommit className="w-3.5 h-3.5 text-purple-400" />
    }
  ];

  return (
    <div className={embedded ? "w-full bg-[#09090b] flex flex-col h-full select-none text-zinc-100 font-sans overflow-hidden" : "w-72 bg-[#09090b] border-l border-zinc-800 flex flex-col h-full z-20 select-none text-zinc-100 font-sans shadow-2xl animate-in slide-in-from-right duration-200"}>
      {/* Header */}
      <div className="p-2.5 bg-[#111115] border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-3.5 h-3.5 text-red-500" />
          <span className="text-[11px] font-black tracking-wider text-zinc-100 font-mono">
            RELEASE TIMELINE
          </span>
        </div>
        {!embedded && (
          <button
            onClick={onClose}
            className="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title={isTr ? 'Kapat' : 'Close'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Timeline Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          {isTr ? 'Sürüm Geçmişi & Kilometre Taşları' : 'Version History & Milestones'}
        </div>

        <div className="relative pl-4 space-y-3.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className={`absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#09090b] group-hover:scale-125 transition-transform ${idx === 0 ? 'bg-red-500' : 'bg-zinc-600'}`} />

              <div className="bg-[#111115] border border-zinc-800/90 rounded-lg p-2.5 space-y-1 hover:border-red-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${m.badgeColor}`}>
                    {m.version}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">{m.date}</span>
                </div>
                <h4 className="text-[11px] font-bold text-white font-mono flex items-center space-x-1.5">
                  {m.icon}
                  <span>{m.title}</span>
                </h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer trigger */}
      <div className="p-2.5 bg-[#111115] border-t border-zinc-800 shrink-0">
        <button
          onClick={onOpenReleaseNotes}
          className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-mono font-bold shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isTr ? 'v5.0.0 Sürüm Notları' : 'v5.0.0 Release Notes'}</span>
        </button>
      </div>
    </div>
  );
};
