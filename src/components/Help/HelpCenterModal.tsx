import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Bot,
  Code2,
  Tv,
  Sparkles,
  Shield,
  Cpu,
  Layers,
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Keyboard,
  Compass,
  Zap,
  BookOpen,
  ArrowRight,
  Eye,
  Server,
  Atom,
  Gamepad2,
  Check
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenViraBot?: () => void;
  onSwitchView?: (view: string) => void;
  onRunTour?: () => void;
}

export type HelpTab = 'tour' | 'ai' | 'code' | 'shortcuts';

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenViraBot,
  onSwitchView,
  onRunTour
}) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  const [activeTab, setActiveTab] = useState<HelpTab>('tour');
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(() => {
    return localStorage.getItem('viracode_help_seen') === 'true';
  });
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('viracode_help_seen', 'true');
    }
    onClose();
  };

  const handleToggleDontShow = (checked: boolean) => {
    setDontShowAgain(checked);
    if (checked) {
      localStorage.setItem('viracode_help_seen', 'true');
    } else {
      localStorage.removeItem('viracode_help_seen');
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(prompt);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-4xl bg-[#0a0d14] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-zinc-100 font-sans">
        {/* Header */}
        <div className="h-14 bg-[#0c1018] border-b border-zinc-800/90 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 ring-1 ring-red-400/50">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black tracking-wider bg-gradient-to-r from-red-500 via-rose-400 to-red-400 bg-clip-text text-transparent font-mono">
                  {isTr ? 'VIRACODE YARDIM & REHBER MERKEZİ' : 'VIRACODE HELP & ONBOARDING CENTER'}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 bg-red-950/80 text-red-400 border border-red-800/60 rounded font-mono font-bold">
                  v5.0.0 Enterprise
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono">
                {isTr
                  ? 'Arayüz Tanıtımı, Yapay Zeka Desteği ve Kod Yardımı Rehberi'
                  : 'Interface Walkthrough, AI Copilot Guidance & Code Assistance'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isTr ? 'Kapat' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="bg-[#080b11] border-b border-zinc-800/80 px-4 flex items-center space-x-1 shrink-0 overflow-x-auto scrollbar-none text-xs font-mono">
          <button
            onClick={() => setActiveTab('tour')}
            className={`px-3 py-2.5 border-b-2 font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'tour'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>{isTr ? '1. Arayüz Tanıtımı (UI Tour)' : '1. UI Walkthrough'}</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-2.5 border-b-2 font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{isTr ? '2. Yapay Zeka Yardımı (AI)' : '2. AI Assistance'}</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-2.5 border-b-2 font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{isTr ? '3. Kod Yardımı & Derleyici' : '3. Code Assistance'}</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-3 py-2.5 border-b-2 font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'shortcuts'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>{isTr ? '4. Kısayollar & CLI' : '4. Shortcuts & CLI'}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-zinc-300 leading-relaxed">
          {/* ================================================================ */}
          {/* TAB 1: ARAYÜZ TANITIMI (UI TOUR & LAYOUT)                       */}
          {/* ================================================================ */}
          {activeTab === 'tour' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-950/40 via-[#0e121a] to-zinc-900/40 p-4 rounded-xl border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-red-300 flex items-center space-x-1.5 font-mono">
                    <Compass className="w-4 h-4 text-red-400" />
                    <span>{isTr ? 'ViraCode IDE Arayüz Yapısı' : 'ViraCode IDE Layout Overview'}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {isTr
                      ? 'Ultra kompakt, yüksek performanslı ve otonom yazılım geliştirme ortamına hoş geldiniz. Temel çalışma bölgelerini aşağıda keşfedin.'
                      : 'Welcome to the ultra-compact, high-fidelity autonomous development platform. Explore core workstation zones below.'}
                  </p>
                </div>
                {onRunTour && (
                  <button
                    onClick={() => {
                      handleClose();
                      onRunTour();
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-red-900/40 cursor-pointer shrink-0"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>{isTr ? 'Canlı Turu Başlat' : 'Start Live Tour'}</span>
                  </button>
                )}
              </div>

              {/* 5 Core UI Zones Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Zone 1: Header & Workspaces */}
                <div className="p-3.5 rounded-xl bg-[#090d15] border border-zinc-800 space-y-2 hover:border-red-500/40 transition-colors">
                  <div className="flex items-center space-x-2 text-red-400 font-mono font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-red-950 border border-red-500/40 flex items-center justify-center text-[10px]">1</span>
                    <span>{isTr ? 'Üst Başlık & 10 Ana Görünüm' : 'Top Header & 10 Main Views'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {isTr
                      ? 'Çalışma alanları arasında geçiş yapın (Rust, Go, TypeScript). 10 özel stüdyo tabı içerir: Editör, Sunucu Modelleme, Kuantum Simülatörü, Oyun Menüsü, Sanal AST, C4 Mimarisi, Testler, 4 Ajan ve IaC Dağıtım.'
                      : 'Switch workspaces (Rust, Go, TS). 10 dedicated views: Editor, Server Modeler, Quantum QPU, Dev Arcade, Virtual AST, C4 Architecture, QA Tests, 4 Agents, and IaC Deployment.'}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['Editör', 'Sunucu', 'Kuantum', 'Oyunlar', 'AST', 'C4'].map((name) => (
                      <span key={name} className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[9px] font-mono">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Zone 2: File Explorer */}
                <div className="p-3.5 rounded-xl bg-[#090d15] border border-zinc-800 space-y-2 hover:border-red-500/40 transition-colors">
                  <div className="flex items-center space-x-2 text-red-400 font-mono font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-red-950 border border-red-500/40 flex items-center justify-center text-[10px]">2</span>
                    <span>{isTr ? 'Sol Dosya Gezgini & Bellek Göstergesi' : 'Left Explorer & Memory Footprint'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {isTr
                      ? 'Proje dosyalarını, sembol sayılarını ve algoritmik karmaşıklık ($O(1)$) puanlarını görüntüler. Yeni dosya ekleyebilir, kopyalayabilir veya içe/dışa aktarabilirsiniz.'
                      : 'Displays virtual source files, AST symbol count, and algorithmic complexity ($O(1)$). Supports file creation, duplication, import, and export.'}
                  </p>
                  <div className="text-[9px] font-mono text-zinc-500">
                    📁 Heap Alloc • Stack • GC Pause • Symbol Indexer
                  </div>
                </div>

                {/* Zone 3: Code Editor & SAST Analyzer */}
                <div className="p-3.5 rounded-xl bg-[#090d15] border border-zinc-800 space-y-2 hover:border-red-500/40 transition-colors">
                  <div className="flex items-center space-x-2 text-red-400 font-mono font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-red-950 border border-red-500/40 flex items-center justify-center text-[10px]">3</span>
                    <span>{isTr ? 'Kod Editörü & Statik Güvenlik (SAST)' : 'Code Editor & Static Security (SAST)'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {isTr
                      ? 'Sözdizimi vurgulayıcı, inline hata satırları, güvenlik zafiyetleri (SAST) ve bellek sızıntısı uyarılarını anlık olarak gösterir. Tek tıkla otomatik onarım (patch) uygular.'
                      : 'Syntax highlighting, inline diagnostic errors, SAST security vulnerabilities, and memory profiling. Applies one-click autonomous patches directly.'}
                  </p>
                  <div className="text-[9px] font-mono text-zinc-500">
                    🛡️ Zero-Day Scanner • Invariant Checking • Hot Reload
                  </div>
                </div>

                {/* Zone 4: Virtual Runtime & Terminal */}
                <div className="p-3.5 rounded-xl bg-[#090d15] border border-zinc-800 space-y-2 hover:border-red-500/40 transition-colors">
                  <div className="flex items-center space-x-2 text-red-400 font-mono font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-red-950 border border-red-500/40 flex items-center justify-center text-[10px]">4</span>
                    <span>{isTr ? 'Alt Sanal Terminal & Runtime Derleyici' : 'Bottom Terminal & Virtual Runtime'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {isTr
                      ? 'Aktif dosyayı derler (`run`), AVX-512 hedefini tetikler (`compile`), testleri koşar (`test`) ve terminal komutlarını yürütür. CLI komutları için `help` yazabilirsiniz.'
                      : 'Compiles active file (`run`), triggers AVX-512 target (`compile`), runs tests (`test`), and executes CLI commands. Type `help` in terminal anytime.'}
                  </p>
                  <div className="text-[9px] font-mono text-zinc-500">
                    ⚙️ Virtual Kernel v5.0.0 • DDD Domain Enforcer
                  </div>
                </div>
              </div>

              {/* Zone 5: Absurdity & Fun System */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-300 font-mono font-bold text-xs">
                    <span>🦆 {isTr ? 'Lastik Ördek & Çeviri Aracı & Dev Arcade' : 'Rubber Duck, Translator & Dev Arcade'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {onSwitchView && (
                      <button
                        onClick={() => {
                          handleClose();
                          onSwitchView('games');
                        }}
                        className="px-2 py-0.5 bg-red-600/40 hover:bg-red-600 text-red-200 border border-red-500/40 rounded text-[9px] font-mono cursor-pointer"
                      >
                        🎮 {isTr ? 'Oyun Menüsüne Git' : 'Open Arcade'}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {isTr
                    ? 'Programcıların zihnini tazelemek için: Kodunuzu Lastik Ördeğe anlatabilir, çift yönlü Vakça (DuckSpeak) çeviri aracını kullanabilir veya Bug Invaders / Cyber Snake gibi mini oyunlarda soluklanabilirsiniz!'
                    : 'To reset programmer focus: Explain bugs to the interactive Rubber Duck, utilize the bidirectional DuckSpeak translator, or take a quick break in the Dev Arcade!'}
                </p>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: YAPAY ZEKA YARDIMI (AI COPILOT & 4 AGENTS)               */}
          {/* ================================================================ */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* ViraBot Introduction */}
              <div className="bg-gradient-to-r from-red-950/40 via-[#0e121a] to-zinc-900/40 p-4 rounded-xl border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-red-300 font-mono font-bold text-sm">
                    <Bot className="w-4 h-4 text-red-400" />
                    <span>{isTr ? 'ViraBot AI & Otonom Mühendislik Ekosistemi' : 'ViraBot AI & Autonomous Ecosystem'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {isTr
                      ? 'ViraBot, kod tabanınızı gerçek zamanlı analiz eder, mimari refactor önerileri sunar, testler üretir ve otomatik onarım döngüleri çalıştırır.'
                      : 'ViraBot analyzes your codebase in real time, provides architectural refactoring, generates comprehensive tests, and runs self-healing cycles.'}
                  </p>
                </div>
                {onOpenViraBot && (
                  <button
                    onClick={() => {
                      handleClose();
                      onOpenViraBot();
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-red-900/40 cursor-pointer shrink-0"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{isTr ? 'ViraBot Panelini Aç' : 'Open ViraBot'}</span>
                  </button>
                )}
              </div>

              {/* 4 Autonomous Threads Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                  {isTr ? '4 Paralel Otonom Ajan Alt Sistemi:' : '4 Parallel Autonomous Agent Threads:'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#090d15] border border-zinc-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-rose-400 font-mono font-bold text-[11px]">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{isTr ? 'İş Parçacığı 1: Mimar (Architect)' : 'Thread 1: Architect Agent'}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      {isTr
                        ? 'DDD (Domain-Driven Design) katman değişmezlerini denetler. Modüller arası bağımlılık grafiklerini temiz ve ayrık tutar.'
                        : 'Enforces Domain-Driven Design invariants and clean boundaries. Prevents leaky domain abstractions.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d15] border border-zinc-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-red-400 font-mono font-bold text-[11px]">
                      <Shield className="w-3.5 h-3.5" />
                      <span>{isTr ? 'İş Parçacığı 2: Güvenlik (Security)' : 'Thread 2: Security Agent'}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      {isTr
                        ? 'Statik kod analizi (SAST) yaparak bellek taşmaları, yetkisiz erişim ve enjeksiyon zafiyetlerini anında tespit eder.'
                        : 'Executes static security scans (SAST) to detect buffer vulnerabilities, injection flaws, and auth breaches.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d15] border border-zinc-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-mono font-bold text-[11px]">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isTr ? 'İş Parçacığı 3: Performans (Perf)' : 'Thread 3: Performance Agent'}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      {isTr
                        ? 'Algoritmik zaman ve bellek karmaşıklığını hesaplar ($O(1)$ hedefi). Sıfır-tahsis (zero-alloc) optimizasyonları sağlar.'
                        : 'Profiles algorithmic time/space complexity ($O(1)$ target). Mitigates excessive allocations and GC stalls.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d15] border border-zinc-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-mono font-bold text-[11px]">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>{isTr ? 'İş Parçacığı 4: Kalite Güvencesi (QA)' : 'Thread 4: QA Engine Agent'}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      {isTr
                        ? 'Otonom property-based ve fuzzing test senaryoları kurgular. Kod değişikliklerinde regresyonları önler.'
                        : 'Generates property-based test suites and boundary fuzzing tests. Guarantees behavioral invariants.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ready-to-Use AI Prompts */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                  {isTr ? 'Doğrudan Deneyebileceğiniz Örnek Yapay Zeka Yönergeleri:' : 'Ready-to-Use Directives for PromptBar / ViraBot:'}
                </h4>

                <div className="space-y-1.5">
                  {[
                    isTr
                      ? 'Aktif dosyadaki tüm bellek sızıntılarını ve SAST zafiyetlerini onar'
                      : 'Audit all memory allocations and resolve SAST vulnerabilities in active file',
                    isTr
                      ? 'Bu veri yapısı için O(1) lock-free eşzamanlı bir algoritma sentezle'
                      : 'Synthesize an O(1) lock-free concurrent algorithm for this data structure',
                    isTr
                      ? 'Modül için kapsamlı property-based ve sınır değeri test paketi yaz'
                      : 'Generate comprehensive property-based and boundary invariant tests',
                    isTr
                      ? 'Kubernetes deployment manifesti ve Terraform modülü oluştur'
                      : 'Generate multi-region production Kubernetes yaml and Terraform HCL'
                  ].map((prompt, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-[#06080d] border border-zinc-800 flex items-center justify-between gap-2 group hover:border-red-500/40 transition-colors"
                    >
                      <span className="font-mono text-[11px] text-zinc-300 truncate">
                        💡 {prompt}
                      </span>
                      <button
                        onClick={() => handleCopyPrompt(prompt)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono flex items-center space-x-1 cursor-pointer shrink-0"
                        title={isTr ? 'Kopyala' : 'Copy'}
                      >
                        {copiedPrompt === prompt ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">{isTr ? 'Kopyalandı' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <span>{isTr ? 'Kopyala' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: KOD YARDIMI & DERLEYİCİ (CODE ASSISTANCE & RUNTIME)       */}
          {/* ================================================================ */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-950/40 via-[#0e121a] to-zinc-900/40 p-4 rounded-xl border border-red-500/30">
                <div className="flex items-center space-x-2 text-red-300 font-mono font-bold text-sm">
                  <Code2 className="w-4 h-4 text-red-400" />
                  <span>{isTr ? 'Çok Dilli (Polyglot) Sanal Derleyici & Çalışma Zamanı' : 'Polyglot Virtual Runtime & Compiler'}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {isTr
                    ? 'ViraCode sanal çekirdeği, Rust (AVX-512 hedefli), Go, TypeScript, Python ve Qiskit kodlarını tarayıcı içi simülasyonda çalıştırır.'
                    : 'The ViraCode virtual kernel simulates high-performance execution for Rust (AVX-512 target), Go, TypeScript, Python, and Qiskit in-browser.'}
                </p>
              </div>

              {/* Code Assistance Features */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#090d15] border border-zinc-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-red-400">
                    {isTr ? '⚡ Kod Çalıştırma & Derleme Akışı' : '⚡ How to Run & Compile Code'}
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-zinc-400 list-disc list-inside">
                    <li>
                      <strong className="text-zinc-200">{isTr ? 'Tek Tıkla Çalıştırma:' : 'One-Click Run:'}</strong>{' '}
                      {isTr
                        ? 'Üst araç çubuğundaki yeşil "Çalıştır" butonuna basarak aktif dosyayı sanal çekirdeğe yükleyip çalıştırabilirsiniz.'
                        : 'Click the green "Run" button in the top toolbar to compile and execute the active file immediately.'}
                    </li>
                    <li>
                      <strong className="text-zinc-200">{isTr ? 'Terminalden Çalıştırma:' : 'CLI Run:'}</strong>{' '}
                      {isTr
                        ? 'Alt terminale `run` veya `compile` yazarak çıktıları, bellek kullanımını ve dönüş kodlarını inceleyebilirsiniz.'
                        : 'Type `run` or `compile` in the bottom terminal to observe execution stdout, memory cycles, and exit codes.'}
                    </li>
                    <li>
                      <strong className="text-zinc-200">{isTr ? 'Otomatik Kod İyileştirme:' : 'Self-Healing:'}</strong>{' '}
                      {isTr
                        ? '"Projeyi Otomatik Onar" (Self-Heal) butonu ile SAST açıklarını ve sözdizimi anomalilerini tek hamlede yamayabilirsiniz.'
                        : 'Use the "Self-Heal Project" button to automatically patch syntax anomalies and security vulnerabilities.'}
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090d15] border border-zinc-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-red-400">
                    {isTr ? '📁 Desteklenen Dosya Biçimleri ve Şablonlar' : '📁 Supported Formats & Workspaces'}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <div className="text-red-400 font-bold">Rust (.rs)</div>
                      <div className="text-zinc-500">AVX-512, SIMD, Tokio</div>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <div className="text-rose-400 font-bold">Go (.go)</div>
                      <div className="text-zinc-500">Goroutine, Channels</div>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <div className="text-amber-400 font-bold">TypeScript (.ts)</div>
                      <div className="text-zinc-500">Strict Types, Node.js</div>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-zinc-800">
                      <div className="text-emerald-400 font-bold">IaC / Cloud</div>
                      <div className="text-zinc-500">Docker, K8s, Terraform</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: KISAYOLLAR & CLI (CHEAT SHEET & TERMINAL COMMANDS)        */}
          {/* ================================================================ */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                  {isTr ? 'Terminal CLI Komut Listesi (Alt Terminal)' : 'Virtual Terminal CLI Commands:'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { cmd: 'run', descTr: 'Aktif kaynak kod dosyasını derle ve çalıştır', descEn: 'Compile and run active source file' },
                    { cmd: 'compile', descTr: 'Sanal derleyiciyi AVX-512 hedefiyle tetikle', descEn: 'Trigger virtual polyglot compiler' },
                    { cmd: 'test', descTr: 'Otonom test paketlerini ve invariantları koş', descEn: 'Execute automated test suites' },
                    { cmd: 'audit', descTr: 'Statik uygulama güvenlik testini (SAST) başlat', descEn: 'Run static application security audit' },
                    { cmd: 'heal', descTr: 'Açık invariantları otomatik onarım döngüsüyle düzelt', descEn: 'Execute autonomous self-healing patch loop' },
                    { cmd: 'games', descTr: 'Geliştirici Oyun Menüsünü (Arcade) aç', descEn: 'Launch Developer Games Arcade' },
                    { cmd: 'export', descTr: '5-Bölümlü Kurumsal Teslimat Planını dışa aktar', descEn: 'Export comprehensive 5-section Blueprint' },
                    { cmd: 'clear', descTr: 'Terminal çıktı geçmişini temizle', descEn: 'Clear terminal output history' },
                  ].map((item) => (
                    <div
                      key={item.cmd}
                      className="p-2 rounded-lg bg-[#06080d] border border-zinc-800 flex items-center justify-between"
                    >
                      <span className="text-red-400 font-bold">{item.cmd}</span>
                      <span className="text-zinc-400 text-[10px]">{isTr ? item.descTr : item.descEn}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                  {isTr ? 'Klavye Kısayolları (Hotkeys):' : 'Workstation Hotkeys:'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-[#06080d] border border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-200">{isTr ? 'Patron Tuşu (Oyundan Koda Kaçış)' : 'Boss Panic Key'}</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-red-300 text-[10px]">Esc</kbd>
                  </div>

                  <div className="p-2 rounded-lg bg-[#06080d] border border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-200">{isTr ? 'Bug Invaders Ateş' : 'Bug Invaders Shoot'}</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-red-300 text-[10px]">Space</kbd>
                  </div>

                  <div className="p-2 rounded-lg bg-[#06080d] border border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-200">{isTr ? 'Gizli Konami Kodu' : 'Secret Konami Code'}</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-purple-300 text-[10px]">↑↑↓↓←→←→BA</kbd>
                  </div>

                  <div className="p-2 rounded-lg bg-[#06080d] border border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-200">{isTr ? 'Yardım & Kılavuz Aç' : 'Open Help Center'}</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-red-300 text-[10px]">?</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 bg-[#0c1018] border-t border-zinc-800/90 px-4 sm:px-6 flex items-center justify-between shrink-0 text-xs font-mono">
          <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer hover:text-zinc-200">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => handleToggleDontShow(e.target.checked)}
              className="rounded accent-red-500 cursor-pointer"
            />
            <span className="text-[11px]">
              {isTr ? 'Bir daha açılışta gösterme' : "Don't show again on startup"}
            </span>
          </label>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClose}
              className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-lg transition-all shadow-md shadow-red-900/40 cursor-pointer text-xs"
            >
              {isTr ? 'Anladım, Kapat' : 'Got it, Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
