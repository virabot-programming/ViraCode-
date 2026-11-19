import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  MessageSquare,
  Flame,
  Smile,
  Search,
  RefreshCw,
  Copy,
  Check,
  X,
  Award,
  Sliders,
  HelpCircle,
  ArrowRightLeft,
  BookOpen,
  ArrowDownToLine
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import confetti from 'canvas-confetti';

export interface DuckWordMapping {
  human: string;
  duckTr: string;
  duckEn: string;
  regexHuman: RegExp;
  regexDuck: RegExp;
}

export type DuckMood = 'zen' | 'rage' | 'detective' | 'quantum' | 'philosopher';

interface RubberDuckStationProps {
  isOpen: boolean;
  onClose: () => void;
  activeFileContent?: string;
  onApplyCodeToEditor?: (code: string) => void;
}

// Hilarious absurdity quotes for Rubber Duck Debugging (Turkish & English)
const ABSURD_QUOTES_TR = [
  "Sence de o div'i ortalamak yerine evrenin geri kalanını onun etrafında döndürmek daha az CPU tüketmez miydi? Vak!",
  "Hata kodda değil canım, derleyicinin burcu bugün seninle uyumlu değil. Vak!",
  "Değişken adını 'temp2_final_SON_v4' koyduğun için değişken varoluşsal bunalıma girmiş. Vak!",
  "CSS dosyana 'display: flex;' yazıp monitöre 3 kez üfledin mi? Bazen pikseller tıkanır. Vak!",
  "Kuantum fiziğinde şu an bu bug hem var hem yok. Testleri çalıştırmayı bırakırsan sorun çözülür! Vak!",
  "Semikolon unutmadın, semikolon özgürlüğünü ilan edip tatile çıktı. Vak!",
  "O fonksiyona 16 parametre geçtiğin için işlemci sana küsmüş, tepki vermiyor. Vak!",
  "Git commit mesajına 'ufak düzeltmeler' yazdın değil mi? Evren bu yalana dayanamadı işte. Vak!",
  "Bir fincan kahve dök bakalım klavyeye, belki devrelerin gözü açılır. Vak!",
  "Sorun sende değil, mimaride... Şaka şaka, kesinlikle 42. satırdaki o garip döngüde. Vak!",
  "10x Developer olmanın sırrı: Kodu düzeltme, sadece kafanı salla ve 'büyük bir teknik borç devraldık' de. Vak!",
  "useEffect bağımlılık dizisine 'window', 'document' ve tüm Samanyolu galaksisini yazarsan kesin çözülür. Vak!",
  "O kütüphaneyi 2 yıl önce bırakan Rus geliştiriciye telepatik teşekkür ettin mi? Ondan çalışmıyor olabilir. Vak!",
  "Kodu silip baştan yazma, projeyi silip şehri terk et. Ormanda arıcılık yapacak yaşa geldin. Vak!",
  "Bana anlatırken fark ettin değil mi? Evet, o '==' yerine '===' yazman gerekiyordu. Ördek asla yanılmaz! Vak!",
  "Bence o if bloğu sadece sevilmek istiyor. Bir sarıl bakalım, belki return eder. Vak!"
];

const ABSURD_QUOTES_EN = [
  "Instead of centering that div, wouldn't it use less CPU to just rotate the universe around it? Quack!",
  "The bug isn't in your code, the compiler's horoscope is simply misaligned with Mercury today. Quack!",
  "Naming that variable 'temp2_final_LAST_v4' gave it an existential crisis. Quack!",
  "Have you tried putting '!important' on everything and blowing on your monitor? Pixels get clogged. Quack!",
  "In quantum mechanics, this bug both exists and doesn't. Stop running the tests and it's fixed! Quack!",
  "You didn't forget a semicolon; the semicolon declared independence and moved abroad. Quack!",
  "Passing 16 arguments into a single function made the CPU emotionally detached from you. Quack!",
  "You committed with 'minor fixes', didn't you? The cosmic fabric rejected that audacity. Quack!",
  "Have you tried turning the laptop upside down so the memory leaks drain out? Quack!",
  "It's not a bug, it's an undocumented surprise feature with high entertainment value. Quack!",
  "To be a 10x engineer: don't fix the bug, just sigh deeply and murmur 'legacy technical debt'. Quack!",
  "You realized the mistake while explaining it to me, didn't you? That missing bracket. Duck always knows. Quack!"
];

// Pre-set programmer problems for the duck to roast/diagnose
const BUG_PRESETS_TR = [
  { id: 'css-center', label: 'CSS Ortalanmıyor', problem: 'CSS div bir türlü dikey ve yatay ortalanmıyor, ekranın sol üstünde inatla duruyor!' },
  { id: 'memory-leak', label: 'Bellek Sızıntısı', problem: 'Heap boyutu 4GB oldu, garbage collector greve gitti, RAM alev alıyor!' },
  { id: 'undefined-is-not', label: 'undefined is not a function', problem: 'Console sürekli "TypeError: Cannot read properties of undefined" fırlatıyor!' },
  { id: 'infinite-loop', label: 'Sonsuz Döngü', problem: 'Tarayıcı sekmesi dondu, fan jet motoru gibi çalışıyor, while (true) yaptım galiba!' },
  { id: 'async-await', label: 'Promise Pending', problem: 'Veri gelmeden sayfa render oluyor, ekranda [object Promise] yazıyor!' }
];

const BUG_PRESETS_EN = [
  { id: 'css-center', label: 'CSS Won’t Center', problem: 'The div refuses to center vertically and horizontally, stubbornly hugging top-left!' },
  { id: 'memory-leak', label: 'Memory Leak', problem: 'Heap exploded to 4GB, GC went on strike, laptop feels like a hot frying pan!' },
  { id: 'undefined-is-not', label: 'undefined is not a function', problem: 'Console keeps crying: "TypeError: Cannot read properties of undefined"!' },
  { id: 'infinite-loop', label: 'Infinite Loop', problem: 'Browser tab frozen, CPU fan sounds like a Falcon 9 launch, loop won’t terminate!' },
  { id: 'async-await', label: 'Promise Pending', problem: 'Page renders before data arrives, UI literally says [object Promise]!' }
];

export const RubberDuckStation: React.FC<RubberDuckStationProps> = ({
  isOpen,
  onClose,
  activeFileContent,
  onApplyCodeToEditor
}) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  // State
  const [quackCount, setQuackCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('viracode_duck_quacks') || '0', 10);
    } catch (e) {
      return 0;
    }
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);
  const [isWiggling, setIsWiggling] = useState<boolean>(false);
  const [duckMood, setDuckMood] = useState<DuckMood>('zen');
  const [currentQuote, setCurrentQuote] = useState<string>(
    isTr
      ? 'Vak! Ben senin sarı lastik ördeğinim. Bana kodunu anlat, saçmalayarak çözelim!'
      : 'Quack! I am your loyal rubber duck. Explain your code to me and let us solve it with absurd wisdom!'
  );
  const [userProblemInput, setUserProblemInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'quack' | 'explain' | 'transpile' | 'achievements'>('quack');
  
  // Interactive Translation State
  const [transpileInput, setTranspileInput] = useState<string>(
    () => activeFileContent || `function calculateTotal(items) {\n  let sum = 0;\n  for (let item of items) {\n    sum += item.price;\n  }\n  return sum;\n}`
  );
  const [transpileDirection, setTranspileDirection] = useState<'humanToDuck' | 'duckToHuman'>('humanToDuck');
  const [transpileMode, setTranspileMode] = useState<'code' | 'natural'>('code');
  const [transpileStats, setTranspileStats] = useState<{ replacedCount: number; durationMs: number }>({ replacedCount: 0, durationMs: 0 });
  const [appliedToEditor, setAppliedToEditor] = useState<boolean>(false);
  const [showDuckDictionary, setShowDuckDictionary] = useState<boolean>(false);
  const [transpiledCode, setTranspiledCode] = useState<string>('');
  const [copiedTranspile, setCopiedTranspile] = useState<boolean>(false);
  const [stressLevel, setStressLevel] = useState<number>(95); // 0-100%

  // Audio Context Ref for synthetic physical rubber duck squeak
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize or resume audio context
  const getAudioContext = (): AudioContext | null => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch (e) {
      console.warn('Web Audio not available:', e);
      return null;
    }
  };

  // Synthetic Rubber Duck Squeak / Quack sound generator using Web Audio API
  const playQuackSound = (soundType: 'classic' | 'mega' | 'squeak' | 'hysteric' | 'quantum' = 'classic') => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.8, now);
    masterGain.connect(ctx.destination);

    if (soundType === 'classic') {
      // Authentic Bath Rubber Duck: Squeak chirp with resonant formant filter
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc2.type = 'triangle';

      // Pitch sweep: fast squeak up then quack drop
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.18);

      osc2.frequency.setValueAtTime(455, now);
      osc2.frequency.exponentialRampToValueAtTime(790, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(365, now + 0.18);

      // Resonant beak formant filter
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, now);
      filter.Q.setValueAtTime(3.5, now);

      // Amplitude envelope: squeeze in, squeak release
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.9, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.24);
      osc2.stop(now + 0.24);
    } else if (soundType === 'mega') {
      // Deep resonant Bass Mega-Duck Quack
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);

      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (soundType === 'squeak') {
      // Ultra sharp high squeak
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (soundType === 'hysteric') {
      // 3 Rapid Fire Staccato Quacks
      [0, 0.09, 0.18].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600 + idx * 60, now + offset);
        osc.frequency.exponentialRampToValueAtTime(380, now + offset + 0.07);

        gain.gain.setValueAtTime(0.8, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + offset);
        osc.stop(now + offset + 0.08);
      });
    } else if (soundType === 'quantum') {
      // Sci-Fi Quantum Phaser Quack with vibrato
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      lfo.frequency.setValueAtTime(25, now);
      lfoGain.gain.setValueAtTime(80, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.linearRampToValueAtTime(280, now + 0.3);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(masterGain);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.35);
      osc.stop(now + 0.35);
    }
  };

  // Main Quack Trigger Handler
  const handleQuack = (soundType: 'classic' | 'mega' | 'squeak' | 'hysteric' | 'quantum' = 'classic') => {
    // Squeak sound
    playQuackSound(soundType);

    // Visual wobble
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 300);

    // Increment count & save
    const newCount = quackCount + 1;
    setQuackCount(newCount);
    try {
      localStorage.setItem('viracode_duck_quacks', newCount.toString());
    } catch (e) {}

    // Reduce stress level
    setStressLevel((prev) => Math.max(0, prev - 4));

    // Random absurdity quote
    const list = isTr ? ABSURD_QUOTES_TR : ABSURD_QUOTES_EN;
    const randomQuote = list[Math.floor(Math.random() * list.length)];
    setCurrentQuote(randomQuote);

    // Milestone confetti
    if (newCount === 10 || newCount === 25 || newCount === 50 || newCount === 100) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          colors: ['#facc15', '#eab308', '#ca8a04', '#38bdf8']
        });
      } catch (e) {}
    }
  };

  // Duck Language Dictionary for Bidirectional Code Translation
  const DUCK_VOCABULARY: DuckWordMapping[] = useMemo(() => [
    { human: 'function', duckTr: 'vak_fonksiyonu', duckEn: 'quack_func', regexHuman: /\bfunction\b/g, regexDuck: /\b(vak_fonksiyonu|quack_func)\b/g },
    { human: 'return', duckTr: 'vak_dondur', duckEn: 'quack_return', regexHuman: /\breturn\b/g, regexDuck: /\b(vak_dondur|quack_return)\b/g },
    { human: 'const', duckTr: 'sabit_vak', duckEn: 'const_quack', regexHuman: /\bconst\b/g, regexDuck: /\b(sabit_vak|const_quack)\b/g },
    { human: 'let', duckTr: 'degisken_vak', duckEn: 'let_quack', regexHuman: /\blet\b/g, regexDuck: /\b(degisken_vak|let_quack)\b/g },
    { human: 'var', duckTr: 'eski_vak', duckEn: 'legacy_quack', regexHuman: /\bvar\b/g, regexDuck: /\b(eski_vak|legacy_quack)\b/g },
    { human: 'if', duckTr: 'eger_vaksa', duckEn: 'if_quacks', regexHuman: /\bif\b/g, regexDuck: /\b(eger_vaksa|if_quacks)\b/g },
    { human: 'else', duckTr: 'yoksa_vak', duckEn: 'else_quack', regexHuman: /\belse\b/g, regexDuck: /\b(yoksa_vak|else_quack)\b/g },
    { human: 'for', duckTr: 'vak_dongusu', duckEn: 'quack_loop', regexHuman: /\bfor\b/g, regexDuck: /\b(vak_dongusu|quack_loop)\b/g },
    { human: 'while', duckTr: 'vak_oldukca', duckEn: 'while_quacking', regexHuman: /\bwhile\b/g, regexDuck: /\b(vak_oldukca|while_quacking)\b/g },
    { human: 'try', duckTr: 'dene_bakalim', duckEn: 'try_quack', regexHuman: /\btry\b/g, regexDuck: /\b(dene_bakalim|try_quack)\b/g },
    { human: 'catch', duckTr: 'aman_vak', duckEn: 'catch_quack', regexHuman: /\bcatch\b/g, regexDuck: /\b(aman_vak|catch_quack)\b/g },
    { human: 'throw', duckTr: 'havuza_firlat', duckEn: 'throw_to_pond', regexHuman: /\bthrow\b/g, regexDuck: /\b(havuza_firlat|throw_to_pond)\b/g },
    { human: 'async', duckTr: 'yavas_vakla', duckEn: 'async_quack', regexHuman: /\basync\b/g, regexDuck: /\b(yavas_vakla|async_quack)\b/g },
    { human: 'await', duckTr: 'bekle_vak', duckEn: 'await_quack', regexHuman: /\bawait\b/g, regexDuck: /\b(bekle_vak|await_quack)\b/g },
    { human: 'console.log', duckTr: 'havuza_vakla', duckEn: 'quack_to_pond', regexHuman: /\bconsole\.log\b/g, regexDuck: /\b(havuza_vakla|quack_to_pond)\b/g },
    { human: 'class', duckTr: 'ordek_sinifi', duckEn: 'duck_class', regexHuman: /\bclass\b/g, regexDuck: /\b(ordek_sinifi|duck_class)\b/g },
    { human: 'import', duckTr: 'vak_getir', duckEn: 'import_quack', regexHuman: /\bimport\b/g, regexDuck: /\b(vak_getir|import_quack)\b/g },
    { human: 'export', duckTr: 'vak_sun', duckEn: 'export_quack', regexHuman: /\bexport\b/g, regexDuck: /\b(vak_sun|export_quack)\b/g },
    { human: 'true', duckTr: 'VAK_TRUE', duckEn: 'QUACK_TRUE', regexHuman: /\btrue\b/g, regexDuck: /\b(VAK_TRUE|QUACK_TRUE)\b/g },
    { human: 'false', duckTr: 'VAK_FALSE', duckEn: 'QUACK_FALSE', regexHuman: /\bfalse\b/g, regexDuck: /\b(VAK_FALSE|QUACK_FALSE)\b/g },
    { human: 'null', duckTr: 'BOS_HAVUZ', duckEn: 'EMPTY_POND', regexHuman: /\bnull\b/g, regexDuck: /\b(BOS_HAVUZ|EMPTY_POND)\b/g },
    { human: 'undefined', duckTr: 'BELIRSIZ_VAK', duckEn: 'UNKNOWN_QUACK', regexHuman: /\bundefined\b/g, regexDuck: /\b(BELIRSIZ_VAK|UNKNOWN_QUACK)\b/g },
    { human: 'Error', duckTr: 'VakHatasi', duckEn: 'DuckError', regexHuman: /\bError\b/g, regexDuck: /\b(VakHatasi|DuckError)\b/g }
  ], []);

  // Bidirectional Translation Handler
  const handleExecuteTranslation = (customInput?: string, direction?: 'humanToDuck' | 'duckToHuman', mode?: 'code' | 'natural') => {
    const raw = customInput !== undefined ? customInput : transpileInput;
    const dir = direction || transpileDirection;
    const currentMode = mode || transpileMode;

    if (!raw.trim()) {
      setTranspiledCode('');
      return;
    }

    const t0 = performance.now();
    playQuackSound('squeak');
    let result = raw;
    let replacedCount = 0;

    if (dir === 'humanToDuck') {
      if (currentMode === 'code') {
        DUCK_VOCABULARY.forEach((v) => {
          const rep = isTr ? v.duckTr : v.duckEn;
          const matches = (result.match(v.regexHuman) || []).length;
          if (matches > 0) {
            replacedCount += matches;
            result = result.replace(v.regexHuman, rep);
          }
        });

        // Add duck header
        result = `// ============================================================================\n`
          + `// 🦆 VIRACODE VAKÇA / DUCKSPEAK ÇEVİRİ MOTORU v5.0\n`
          + `// Yön: İnsan Dili -> Vakça | Değiştirilen Terim: ${replacedCount}\n`
          + `// ============================================================================\n\n`
          + result
          + `\n\n// 🦆 Vaklama Notu: Kod havuza bırakıldığında su üstünde yüzer!`;
      } else {
        // Natural speech translation: convert words playfully into quacks
        const words = raw.split(/\s+/);
        replacedCount = words.length;
        const quackWords = words.map((w, idx) => {
          if (w.endsWith('?') || w.endsWith('!') || w.endsWith('.')) {
            const punct = w.slice(-1);
            return (idx % 3 === 0 ? 'VAK' : 'vak') + punct;
          }
          return idx === 0 ? 'Vak' : idx % 5 === 0 ? 'VAK' : 'vak';
        });
        result = quackWords.join(' ') + (isTr ? ' 🦆 (Tercüme: "Sorun kodda değil, evrenin hizasında. Vak!")' : ' 🦆 (Translation: "The code is fine, universe is out of sync. Quack!")');
      }
    } else {
      // Duck to Human
      // Clean up headers
      let cleaned = raw.replace(/\/\/\s*={10,}[\s\S]*?\/\/\s*={10,}\n\n/g, '');
      cleaned = cleaned.replace(/\n\n\/\/\s*🦆\s*Vaklama Notu:[\s\S]*$/g, '');

      DUCK_VOCABULARY.forEach((v) => {
        const matches = (cleaned.match(v.regexDuck) || []).length;
        if (matches > 0) {
          replacedCount += matches;
          cleaned = cleaned.replace(v.regexDuck, v.human);
        }
      });
      result = cleaned;
    }

    const t1 = performance.now();
    setTranspileStats({
      replacedCount,
      durationMs: Math.max(1, Math.round(t1 - t0))
    });
    setTranspiledCode(result);
  };

  // Swap translation direction
  const handleSwapDirection = () => {
    const nextDir = transpileDirection === 'humanToDuck' ? 'duckToHuman' : 'humanToDuck';
    setTranspileDirection(nextDir);
    if (transpiledCode.trim()) {
      setTranspileInput(transpiledCode);
      handleExecuteTranslation(transpiledCode, nextDir);
    }
  };

  // Apply to active editor
  const handleApplyToEditor = () => {
    if (!onApplyCodeToEditor || !transpiledCode) return;
    onApplyCodeToEditor(transpiledCode);
    setAppliedToEditor(true);
    setTimeout(() => setAppliedToEditor(false), 2500);
  };

  // Diagnose user problem
  const handleDiagnoseProblem = (problemText?: string) => {
    const query = problemText || userProblemInput;
    if (!query.trim()) return;

    playQuackSound('hysteric');
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 300);

    const diagnosesTr = [
      `Ördek Teşhisi: "${query}" problemi incelendi. Çözüm: Bilgisayarı kapat, balkona çık, gökyüzüne bak ve 3 kere "VAK!" diye bağır. Sorun çözülmeyecek ama sen rahatlayacaksın!`,
      `Ördek Teşhisi: Bu sorun tam olarak 1983 yılında Bell Laboratuvarlarında bir kahve bardağının dökülmesiyle başladı. Çözüm: Koddaki tüm harfleri küçült, belki işlemci utanır.`,
      `Ördek Teşhisi: Kodunda mantıksal bir paradoks var. Sen kodun çalışmasını istiyorsun, ama kod çalışmak istemiyor. Onun sınırlarına saygı duymalısın. Vak!`,
      `Ördek Teşhisi: O dosyayı 'index.ts' yerine 'index_gercekten_calis_artik_lutfen.ts' olarak yeniden adlandırmayı dene. Bazen psikolojik baskı işe yarar. Vak!`
    ];

    const diagnosesEn = [
      `Duck Diagnosis: Analyzed "${query}". Remedy: Close the laptop, walk outside, look at the sky, and shout "QUACK!" 3 times. It won’t fix the bug, but your soul will be cleansed!`,
      `Duck Diagnosis: This exact bug originated in 1983 when a coffee cup fell in Bell Labs. Solution: Turn all variable names into lowercase so the compiler feels less intimidated.`,
      `Duck Diagnosis: Existential conflict detected. You want the code to work, but the code desires personal freedom. Respect its boundaries. Quack!`,
      `Duck Diagnosis: Rename the file to 'index_please_just_work_bro.ts'. Psychological warfare against the compiler is 90% of software engineering.`
    ];

    const pick = isTr
      ? diagnosesTr[Math.floor(Math.random() * diagnosesTr.length)]
      : diagnosesEn[Math.floor(Math.random() * diagnosesEn.length)];

    setCurrentQuote(pick);
    setQuackCount((prev) => prev + 1);
  };

  // Duck rank based on count
  const getDuckRank = () => {
    if (quackCount >= 100) return { title: isTr ? 'Kuantum Ördek İlahı' : 'Quantum Duck Deity', color: 'text-purple-400', badge: 'bg-purple-950/80 border-purple-500' };
    if (quackCount >= 50) return { title: isTr ? 'Sonsuz Döngü Terapisti' : 'Infinite Loop Therapist', color: 'text-rose-400', badge: 'bg-rose-950/80 border-rose-500' };
    if (quackCount >= 25) return { title: isTr ? 'Kıdemli Lastik Ördek Mimarı' : 'Senior Rubber Duck Architect', color: 'text-amber-400', badge: 'bg-amber-950/80 border-amber-500' };
    if (quackCount >= 10) return { title: isTr ? 'Stack Overflow Ciyaklayıcısı' : 'Stack Overflow Squeaker', color: 'text-cyan-400', badge: 'bg-cyan-950/80 border-cyan-500' };
    return { title: isTr ? 'Stajyer Vaklayıcı' : 'Intern Quacker', color: 'text-emerald-400', badge: 'bg-emerald-950/80 border-emerald-500' };
  };

  const rank = getDuckRank();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#090c12] border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-[11px] font-sans">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-amber-950/60 px-3 py-2 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl select-none">🦆</span>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-amber-300 tracking-wide text-xs">
                  {isTr ? 'LASTİK ÖRDEK HATA AYIKLAMA & SAÇMALIK İSTASYONU' : 'RUBBER DUCK DEBUGGING & ABSURDITY CHAMBER'}
                </span>
                <span className={`px-1 py-0.2 rounded border text-[8px] font-mono font-bold ${rank.badge} ${rank.color}`}>
                  {rank.title}
                </span>
              </div>
              <div className="text-[9px] text-amber-200/60 font-mono">
                {isTr ? 'Bana kodunu anlat, saçmalıklarla derdine derman olayım!' : 'Talk to the duck, conquer bugs with surreal quacks!'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Audio Mute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1 rounded border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-red-950/60 border-red-500/40 text-red-400'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
              title={isMuted ? (isTr ? 'Sesi Aç' : 'Unmute') : (isTr ? 'Sessize Al' : 'Mute')}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-[#07090e] border-b border-zinc-800 px-3 py-1 space-x-1 font-mono text-[10px]">
          <button
            onClick={() => setActiveTab('quack')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              activeTab === 'quack'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🦆 {isTr ? 'Vaklama İstasyonu' : 'Quack Blaster'}
          </button>
          <button
            onClick={() => setActiveTab('explain')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              activeTab === 'explain'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            💬 {isTr ? 'Ördeğe Anlat (Teşhis)' : 'Explain Bug'}
          </button>
          <button
            onClick={() => {
              setActiveTab('transpile');
              if (!transpiledCode) handleExecuteTranslation(transpileInput);
            }}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              activeTab === 'transpile'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🔄 {isTr ? 'Çeviri Aracı (Vakça ↔ İnsan)' : 'Translator (Duck ↔ Human)'}
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🏆 {isTr ? 'Kıdem & Rozetler' : 'Ranks & Quacks'}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Main Hero: The Giant Interactive Duck */}
          <div className="bg-gradient-to-b from-[#0e121a] to-[#07090e] border border-amber-500/20 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            {/* Background Water Ripples */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 via-cyan-400 to-transparent pointer-events-none" />

            {/* Giant Duck SVG with bounce/squish animation */}
            <div
              onClick={() => handleQuack('classic')}
              className={`cursor-pointer transform transition-transform select-none relative group ${
                isWiggling ? 'scale-125 rotate-6' : 'hover:scale-110 active:scale-95'
              }`}
              title={isTr ? 'Bana tıkla ve vaklat!' : 'Click me to quack!'}
            >
              {/* Cute SVG Rubber Duck */}
              <svg width="90" height="90" viewBox="0 0 100 100" className="drop-shadow-[0_8px_16px_rgba(245,158,11,0.35)]">
                {/* Water Waves */}
                <path d="M 15 85 Q 30 80 45 85 Q 60 90 75 85 Q 90 80 95 85" fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                <path d="M 5 92 Q 25 88 45 92 Q 65 96 85 92 Q 95 88 100 92" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

                {/* Duck Body */}
                <ellipse cx="48" cy="62" rx="36" ry="24" fill="#facc15" />
                <path d="M 18 56 Q 8 46 16 42 Q 24 45 28 54 Z" fill="#eab308" />

                {/* Duck Wing */}
                <ellipse cx="42" cy="64" rx="16" ry="10" fill="#eab308" transform="rotate(-10 42 64)" />

                {/* Duck Neck & Head */}
                <circle cx="68" cy="38" r="18" fill="#facc15" />

                {/* Duck Beak / Bill */}
                <path d="M 82 36 Q 96 38 88 45 Q 80 46 80 42 Z" fill="#f97316" />

                {/* Duck Eye */}
                <circle cx="73" cy="32" r="3.5" fill="#0f172a" />
                <circle cx="74.5" cy="31" r="1.2" fill="#ffffff" />

                {/* Cute Cheek Blush */}
                <ellipse cx="70" cy="42" rx="4" ry="2.5" fill="#fb923c" opacity="0.5" />
              </svg>

              {/* Floating Quack Badge on Click */}
              {isWiggling && (
                <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-mono font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                  VAK! 🦆💨
                </div>
              )}
            </div>

            {/* Click CTA & Speech Bubble */}
            <div className="mt-2 text-center max-w-md">
              <div className="bg-[#131924] border border-amber-500/30 rounded-lg p-2 text-amber-200 text-[10px] font-mono leading-relaxed relative shadow-md">
                <span className="text-amber-400 font-bold mr-1">🦆 Ördek:</span>
                "{currentQuote}"
              </div>
            </div>

            {/* Stress Relief Meter */}
            <div className="w-full max-w-xs mt-3 flex items-center justify-between gap-2 text-[9px] font-mono">
              <span className="text-zinc-400">{isTr ? 'Geliştirici Stresi:' : 'Dev Stress:'}</span>
              <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700">
                <div
                  style={{ width: `${stressLevel}%` }}
                  className={`h-full transition-all duration-300 ${
                    stressLevel > 60
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : stressLevel > 20
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                      : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                  }`}
                />
              </div>
              <span className="text-amber-300 font-bold">%{stressLevel}</span>
            </div>
          </div>

          {/* Tab 1: Quack Blaster (Different Sound Types) */}
          {activeTab === 'quack' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-zinc-400 text-[9px] uppercase tracking-wider font-bold">
                  {isTr ? 'Ses Paleti & Vak Çeşitleri' : 'Synthesizer Sound Modes'}
                </span>
                <span className="text-amber-400 font-mono text-[9px]">
                  {isTr ? `Toplam Vak: ${quackCount}` : `Total Quacks: ${quackCount}`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px]">
                <button
                  onClick={() => handleQuack('classic')}
                  className="p-2 rounded bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 text-amber-200 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-base">🦆</span>
                  <span className="font-bold">{isTr ? 'Klasik Vak' : 'Classic Quack'}</span>
                  <span className="text-[8px] text-zinc-400">480Hz Resonant</span>
                </button>

                <button
                  onClick={() => handleQuack('mega')}
                  className="p-2 rounded bg-orange-950/40 border border-orange-500/40 hover:bg-orange-900/50 text-orange-200 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-base">📢</span>
                  <span className="font-bold">{isTr ? 'Mega Bas Vak' : 'Mega Bass'}</span>
                  <span className="text-[8px] text-zinc-400">140Hz Deep Boof</span>
                </button>

                <button
                  onClick={() => handleQuack('squeak')}
                  className="p-2 rounded bg-yellow-950/40 border border-yellow-500/40 hover:bg-yellow-900/50 text-yellow-200 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-base">🐥</span>
                  <span className="font-bold">{isTr ? 'Ciyak Sıkıştırma' : 'High Squeak'}</span>
                  <span className="text-[8px] text-zinc-400">1400Hz Sharp Snap</span>
                </button>

                <button
                  onClick={() => handleQuack('quantum')}
                  className="p-2 rounded bg-purple-950/40 border border-purple-500/40 hover:bg-purple-900/50 text-purple-200 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-base">⚛️</span>
                  <span className="font-bold">{isTr ? 'Kuantum Vak' : 'Quantum Quack'}</span>
                  <span className="text-[8px] text-zinc-400">Phase Vibrato</span>
                </button>
              </div>

              {/* Hysterical Blaster Button */}
              <button
                onClick={() => handleQuack('hysteric')}
                className="w-full py-1.5 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-white rounded font-mono font-bold text-[10px] flex items-center justify-center space-x-1 shadow-md transition-all cursor-pointer active:scale-98"
              >
                <Flame className="w-3 h-3 animate-pulse" />
                <span>{isTr ? '🚨 3X SERİ ÇILGIN VAKLAMA PATLAMASI (Histerik)' : '🚨 3X RAPID-FIRE PANIC QUACKS'}</span>
              </button>
            </div>
          )}

          {/* Tab 2: Explain to Duck */}
          {activeTab === 'explain' && (
            <div className="space-y-2.5">
              <div className="text-[9px] text-zinc-400 font-mono">
                {isTr
                  ? 'Lastik Ördek Yöntemi: Problemini ördeğe kelimelere dökerek anlat. Çoğu geliştirici problemi ördeğe anlatırken cevabı kendi bulur!'
                  : 'Rubber Duck Debugging: By articulating the problem in simple words to an inanimate duck, the solution magically appears!'}
              </div>

              {/* Bug Presets */}
              <div className="flex flex-wrap gap-1">
                {(isTr ? BUG_PRESETS_TR : BUG_PRESETS_EN).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setUserProblemInput(preset.problem);
                      handleDiagnoseProblem(preset.problem);
                    }}
                    className="px-2 py-0.5 bg-zinc-900 hover:bg-amber-950/50 border border-zinc-700/80 hover:border-amber-500 text-zinc-300 hover:text-amber-300 rounded text-[9px] font-mono transition-all cursor-pointer"
                  >
                    ⚡ {preset.label}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="space-y-1.5">
                <textarea
                  value={userProblemInput}
                  onChange={(e) => setUserProblemInput(e.target.value)}
                  placeholder={
                    isTr
                      ? 'Derdini ördeğe yaz: Örn. "State güncelleniyor ama buton yeniden render olmuyor..."'
                      : 'Describe your bug to the duck: e.g. "State updates but the component won’t re-render..."'
                  }
                  rows={3}
                  className="w-full bg-[#06080c] border border-zinc-800 rounded p-2 text-[10px] font-mono text-amber-200 placeholder:text-zinc-600 outline-none focus:border-amber-500"
                />

                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => handleDiagnoseProblem()}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded font-mono font-bold text-[10px] flex items-center space-x-1 shadow transition-all cursor-pointer"
                  >
                    <span>🦆 {isTr ? 'Ördekten Saçma Tavsiye Al' : 'Get Duck Advice'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Interactive Bidirectional DuckSpeak Translator */}
          {activeTab === 'transpile' && (
            <div className="space-y-3 font-mono text-[9px]">
              {/* Controls Header: Direction & Mode Selector */}
              <div className="bg-zinc-900/90 border border-zinc-800 p-2 rounded-lg flex flex-wrap items-center justify-between gap-2">
                {/* Direction Switch */}
                <div className="flex items-center space-x-1.5">
                  <span className={`px-2 py-0.5 rounded font-bold border transition-all ${
                    transpileDirection === 'humanToDuck'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {transpileDirection === 'humanToDuck'
                      ? (isTr ? 'İnsan Dili / JS' : 'Human Code')
                      : (isTr ? 'Vakça (Ördekçe)' : 'DuckSpeak')}
                  </span>

                  <button
                    onClick={handleSwapDirection}
                    className="p-1 rounded bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-400 border border-zinc-700 transition-all cursor-pointer"
                    title={isTr ? 'Çeviri Yönünü Tersine Çevir' : 'Reverse Translation Direction'}
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                  </button>

                  <span className={`px-2 py-0.5 rounded font-bold border transition-all ${
                    transpileDirection === 'duckToHuman'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {transpileDirection === 'humanToDuck'
                      ? (isTr ? 'Vakça (Ördekçe)' : 'DuckSpeak')
                      : (isTr ? 'İnsan Dili / JS' : 'Human Code')}
                  </span>
                </div>

                {/* Mode Selector & Dictionary Toggle */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      const next = transpileMode === 'code' ? 'natural' : 'code';
                      setTranspileMode(next);
                      handleExecuteTranslation(transpileInput, transpileDirection, next);
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 cursor-pointer flex items-center space-x-1"
                  >
                    <span>{transpileMode === 'code' ? (isTr ? '💻 Kod Modu' : '💻 Code Mode') : (isTr ? '🗣️ Cümle Modu' : '🗣️ Speech Mode')}</span>
                  </button>

                  <button
                    onClick={() => setShowDuckDictionary(!showDuckDictionary)}
                    className={`px-2 py-0.5 rounded border transition-all flex items-center space-x-1 cursor-pointer ${
                      showDuckDictionary
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <BookOpen className="w-2.5 h-2.5" />
                    <span>{isTr ? 'Sözlük' : 'Dictionary'}</span>
                  </button>
                </div>
              </div>

              {/* Sample Presets Quick Bar */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-0.5">
                <span className="text-zinc-500 shrink-0">{isTr ? 'Örnekler:' : 'Presets:'}</span>
                {[
                  {
                    label: isTr ? 'Toplama Döngüsü' : 'Sum Loop',
                    code: `function calculateTotal(items) {\n  let sum = 0;\n  for (let item of items) {\n    sum += item.price;\n  }\n  return sum;\n}`
                  },
                  {
                    label: isTr ? 'Try/Catch Hatası' : 'Try/Catch',
                    code: `try {\n  const token = await fetchAuth();\n  console.log("Success:", token);\n} catch (err) {\n  throw new Error("Pond overflow!");\n}`
                  },
                  {
                    label: isTr ? 'Ördekçe Kod (Ters Çevir)' : 'Duck Script',
                    code: `vak_fonksiyonu havuzBasi() {\n  sabit_vak suSicakligi = 24;\n  eger_vaksa (suSicakligi > 20) {\n    havuza_vakla("Havuza atla!");\n    vak_dondur VAK_TRUE;\n  }\n  vak_dondur VAK_FALSE;\n}`,
                    forceDir: 'duckToHuman' as const
                  }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTranspileInput(preset.code);
                      const dir = preset.forceDir || transpileDirection;
                      if (preset.forceDir) setTranspileDirection(preset.forceDir);
                      handleExecuteTranslation(preset.code, dir);
                    }}
                    className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-300/80 hover:text-amber-200 border border-zinc-800 shrink-0 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Input & Output Split Panes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Left Pane: Input Text / Code */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="font-bold text-amber-300">
                      {transpileDirection === 'humanToDuck'
                        ? (isTr ? 'Kaynak Metin / Kod:' : 'Source Input:')
                        : (isTr ? 'Vakça (Ördekçe) Metin / Kod:' : 'DuckSpeak Input:')}
                    </span>

                    {activeFileContent && (
                      <button
                        onClick={() => {
                          setTranspileInput(activeFileContent);
                          handleExecuteTranslation(activeFileContent);
                        }}
                        className="text-[8px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      >
                        {isTr ? 'Aktif Dosyayı Yükle' : 'Load Active File'}
                      </button>
                    )}
                  </div>

                  <textarea
                    value={transpileInput}
                    onChange={(e) => {
                      setTranspileInput(e.target.value);
                      handleExecuteTranslation(e.target.value);
                    }}
                    rows={8}
                    placeholder={isTr ? 'Çevrilmesini istediğiniz kodu veya metni buraya yazın...' : 'Enter code or text to translate...'}
                    className="w-full bg-[#05070c] border border-zinc-800 rounded p-2 text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-amber-500 font-mono text-[9px] resize-none leading-relaxed"
                  />
                </div>

                {/* Right Pane: Translated Output */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-zinc-400">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-emerald-400">
                        {isTr ? 'Çeviri Sonucu:' : 'Translated Output:'}
                      </span>
                      {transpileStats.replacedCount > 0 && (
                        <span className="px-1 py-0.2 bg-emerald-950/60 text-emerald-300 rounded border border-emerald-800/40 text-[8px]">
                          {transpileStats.replacedCount} {isTr ? 'terim' : 'tokens'} ({transpileStats.durationMs}ms)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Copy output */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(transpiledCode);
                          setCopiedTranspile(true);
                          setTimeout(() => setCopiedTranspile(false), 2000);
                        }}
                        className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[8px] flex items-center space-x-1 border border-zinc-700 cursor-pointer"
                      >
                        {copiedTranspile ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedTranspile ? (isTr ? 'Kopyalandı' : 'Copied') : (isTr ? 'Kopyala' : 'Copy')}</span>
                      </button>

                      {/* Apply to editor */}
                      {onApplyCodeToEditor && (
                        <button
                          onClick={handleApplyToEditor}
                          className="px-1.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[8px] flex items-center space-x-1 cursor-pointer"
                          title={isTr ? 'Çevrilmiş kodu aktif editöre uygula' : 'Apply translated code to active editor'}
                        >
                          {appliedToEditor ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <ArrowDownToLine className="w-2.5 h-2.5" />}
                          <span>{appliedToEditor ? (isTr ? 'Uygulandı' : 'Applied') : (isTr ? 'Editöre Aktar' : 'To Editor')}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="h-[126px] bg-[#05070c] border border-zinc-800 rounded p-2 overflow-y-auto text-amber-300 leading-relaxed">
                    <pre className="whitespace-pre">{transpiledCode || (isTr ? '// Çeviri çıktısı burada görünecektir...' : '// Translation output will appear here...')}</pre>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[8px] text-zinc-500">
                  🦆 {isTr ? 'Vakça Sözdizimi: İki yönlü deterministik kod transpiler motoru aktif.' : 'DuckSpeak Engine: Bidirectional deterministic AST transpilation active.'}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleExecuteTranslation()}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded font-bold flex items-center space-x-1 cursor-pointer shadow-xs transition-all active:scale-95"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>{isTr ? 'Yeniden Çevir & Vakla' : 'Re-Translate & Quack'}</span>
                  </button>
                </div>
              </div>

              {/* Expandable Duck Dictionary */}
              {showDuckDictionary && (
                <div className="p-2 bg-black/60 border border-zinc-800 rounded-lg space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-zinc-300 font-bold text-[9px] border-b border-zinc-800 pb-1">
                    <span>📖 {isTr ? 'Vakça - İnsan Dili Kod Sözlüğü' : 'DuckSpeak - Human Code Dictionary'}</span>
                    <button
                      onClick={() => setShowDuckDictionary(false)}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-[8px]">
                    {DUCK_VOCABULARY.map((v, i) => (
                      <div key={i} className="p-1 rounded bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between">
                        <span className="text-cyan-300 font-bold">{v.human}</span>
                        <span className="text-zinc-500">↔</span>
                        <span className="text-amber-300 font-bold">{isTr ? v.duckTr : v.duckEn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Achievements & Quack Ranks */}
          {activeTab === 'achievements' && (
            <div className="space-y-2">
              <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between font-mono">
                <div>
                  <div className="text-[10px] text-zinc-400">{isTr ? 'Mevcut Kıdem:' : 'Current Rank:'}</div>
                  <div className={`text-xs font-bold ${rank.color}`}>{rank.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400">{isTr ? 'Vaklama Sayısı:' : 'Total Quacks:'}</div>
                  <div className="text-sm font-black text-amber-400">{quackCount} 🦆</div>
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-[9px]">
                {[
                  { count: 1, titleTr: 'Stajyer Vaklayıcı', titleEn: 'Intern Quacker', desc: 'İlk kez lastik ördeğe vaklattın.' },
                  { count: 10, titleTr: 'Stack Overflow Ciyaklayıcısı', titleEn: 'Stack Overflow Squeaker', desc: '10 kez vaklatıp stres attın.' },
                  { count: 25, titleTr: 'Kıdemli Lastik Ördek Mimarı', titleEn: 'Senior Duck Architect', desc: '25 kez ördeğe danıştın.' },
                  { count: 50, titleTr: 'Sonsuz Döngü Terapisti', titleEn: 'Infinite Loop Therapist', desc: '50 vaklama ile tüm bugları kovdun.' },
                  { count: 100, titleTr: 'Kuantum Ördek İlahı', titleEn: 'Quantum Duck Deity', desc: '100 vaklama ile kodun aydınlanmaya ulaştı!' }
                ].map((item) => {
                  const unlocked = quackCount >= item.count;
                  return (
                    <div
                      key={item.count}
                      className={`p-2 rounded border flex items-center justify-between transition-all ${
                        unlocked
                          ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{unlocked ? '🏆' : '🔒'}</span>
                        <div>
                          <div className={`font-bold ${unlocked ? 'text-amber-300' : 'text-zinc-500'}`}>
                            {isTr ? item.titleTr : item.titleEn}
                          </div>
                          <div className="text-[8px] text-zinc-400">{item.desc}</div>
                        </div>
                      </div>
                      <div className="text-[8px] font-bold">
                        {unlocked ? (isTr ? 'KAZANILDI' : 'UNLOCKED') : `${item.count} vak`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Action Bar */}
        <div className="bg-[#06080c] px-3 py-1.5 border-t border-zinc-800 flex items-center justify-between text-[9px] font-mono text-zinc-400">
          <div className="flex items-center space-x-2">
            <span>🔊 {isTr ? 'Ses Seviyesi:' : 'Volume:'}</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 accent-amber-400 bg-zinc-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuack('classic')}
              className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 rounded font-bold cursor-pointer transition-colors"
            >
              🦆 {isTr ? 'Bir Kere Vakla!' : 'One Fast Quack!'}
            </button>
            <button
              onClick={onClose}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer transition-colors"
            >
              {isTr ? 'Kapat' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
