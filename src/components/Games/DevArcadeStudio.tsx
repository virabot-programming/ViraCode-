import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Flame,
  Shield,
  Coffee,
  Terminal,
  Crosshair,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Eye,
  AlertTriangle,
  Code2,
  CheckCircle2,
  Tv
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../i18n/LanguageContext';

// ============================================================================
// Retro Chiptune Sound Synthesizer via Web Audio API (No external assets)
// ============================================================================
class ArcadeAudioSynth {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio fallback
    }
  }

  playExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Fallback
    }
  }

  playPowerup() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [330, 440, 550, 660, 880];
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const now = this.ctx.currentTime + i * 0.05;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      });
    } catch {
      // Fallback
    }
  }

  playGameOver() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [440, 370, 311, 260, 220];
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const now = this.ctx.currentTime + i * 0.12;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      });
    } catch {
      // Fallback
    }
  }

  playBlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(587, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Fallback
    }
  }

  playKeypress() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(700 + Math.random() * 200, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Fallback
    }
  }
}

const synth = new ArcadeAudioSynth();

// ============================================================================
// Types & Interfaces
// ============================================================================
export type ArcadeGameId = 'invaders' | 'snake' | '2048' | 'vimdojo';

interface DevArcadeStudioProps {
  onBackToEditor?: () => void;
  className?: string;
}

// ----------------------------------------------------------------------------
// Game 1 Types: Bug Invaders
// ----------------------------------------------------------------------------
interface BugEnemy {
  id: number;
  x: number;
  y: number;
  type: 'null_pointer' | 'memory_leak' | 'merge_conflict' | 'syntax_error' | 'boss';
  label: string;
  hp: number;
  maxHp: number;
  speed: number;
  points: number;
  icon: string;
}

interface SemicolonBullet {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'gc' | 'hot_reload' | 'shield';
  label: string;
  icon: string;
}

// ----------------------------------------------------------------------------
// Game 4 Snippets: Vim Dojo Speed Typer
// ----------------------------------------------------------------------------
const DEV_TYPING_SNIPPETS = [
  'git commit -m "fix(core): resolve null pointer exception in thread pool"',
  'pub fn handle_request(ctx: &mut Context) -> Result<Response, KernelError>',
  'docker compose up -d --build --remove-orphans',
  'const [memoryMap, setMemoryMap] = useState<Map<string, Block>>(new Map());',
  'SELECT id, username, role FROM users WHERE is_active = true LIMIT 50;',
  'npm run test:e2e -- --reporter=spec --timeout=5000',
  'kubectl scale deployment vira-api --replicas=8 -n production',
  'cargo test --release -- --nocapture --test-threads=16',
  'chmod +x ./scripts/deploy_autonomous_kernel.sh',
  'export const useKernel = () => useContext(VirtualKernelContext);'
];

export const DevArcadeStudio: React.FC<DevArcadeStudioProps> = ({
  onBackToEditor,
  className = ''
}) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  // Active Game State
  const [activeGame, setActiveGame] = useState<ArcadeGameId>('invaders');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [crtFilter, setCrtFilter] = useState<boolean>(true);
  const [coffeeCount, setCoffeeCount] = useState<number>(3);
  const [godMode, setGodMode] = useState<boolean>(false);
  const [showBossAlert, setShowBossAlert] = useState<boolean>(false);

  // High Scores Stored in LocalStorage
  const [highScores, setHighScores] = useState<Record<ArcadeGameId, number>>(() => {
    try {
      const saved = localStorage.getItem('viracode_arcade_highscores');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return { invaders: 1420, snake: 180, '2048': 2048, vimdojo: 78 };
  });

  const saveHighScore = useCallback((game: ArcadeGameId, score: number) => {
    setHighScores((prev) => {
      const best = Math.max(prev[game] || 0, score);
      const updated = { ...prev, [game]: best };
      try {
        localStorage.setItem('viracode_arcade_highscores', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  // Konami Code Easter Egg (`↑ ↑ ↓ ↓ ← → ← → B A`)
  useEffect(() => {
    const konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Panic / Boss Key (Escape)
      if (e.key === 'Escape' && onBackToEditor) {
        onBackToEditor();
        return;
      }

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expected = konamiSequence[konamiIndex].toLowerCase();
      if (key === expected) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
          setGodMode(true);
          synth.playPowerup();
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.6 }
          });
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToEditor]);

  // Sync sound
  useEffect(() => {
    synth.enabled = soundEnabled;
  }, [soundEnabled]);

  // --------------------------------------------------------------------------
  // GAME 1: BUG INVADERS (Syntax Blaster)
  // --------------------------------------------------------------------------
  const [invadersScore, setInvadersScore] = useState<number>(0);
  const [invadersWave, setInvadersWave] = useState<number>(1);
  const [cannonX, setCannonX] = useState<number>(50); // percentage 0 - 100
  const [bullets, setBullets] = useState<SemicolonBullet[]>([]);
  const [bugs, setBugs] = useState<BugEnemy[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [invadersGameOver, setInvadersGameOver] = useState<boolean>(false);
  const [invadersRunning, setInvadersRunning] = useState<boolean>(false);
  const [playerHp, setPlayerHp] = useState<number>(3);
  const [tripleShotTimer, setTripleShotTimer] = useState<number>(0);

  const invadersRef = useRef<HTMLDivElement>(null);

  // Spawn a wave of bugs
  const spawnBugWave = useCallback((waveNum: number) => {
    const newBugs: BugEnemy[] = [];
    const bugTypes: { type: BugEnemy['type']; label: string; hp: number; pts: number; icon: string }[] = [
      { type: 'null_pointer', label: 'NullPointer', hp: 1, pts: 50, icon: '🐛' },
      { type: 'syntax_error', label: 'SyntaxError', hp: 1, pts: 40, icon: '⚠️' },
      { type: 'memory_leak', label: 'MemoryLeak', hp: 2, pts: 100, icon: '🪲' },
      { type: 'merge_conflict', label: 'MergeConflict', hp: 3, pts: 150, icon: '💥' },
    ];

    const rows = Math.min(4, 2 + Math.floor(waveNum / 2));
    const cols = 6;
    let idCounter = Date.now();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const template = bugTypes[(r + c) % bugTypes.length];
        newBugs.push({
          id: idCounter++,
          x: 10 + c * 14,
          y: 8 + r * 10,
          type: template.type,
          label: template.label,
          hp: template.hp,
          maxHp: template.hp,
          speed: 0.15 + waveNum * 0.05,
          points: template.pts,
          icon: template.icon
        });
      }
    }

    // Add Boss on wave 3, 6, 9...
    if (waveNum % 3 === 0) {
      newBugs.push({
        id: idCounter++,
        x: 45,
        y: 4,
        type: 'boss',
        label: isTr ? '🔥 Prodüktif Çöküş (Boss)' : '🔥 Production Outage (Boss)',
        hp: 12 + waveNum * 4,
        maxHp: 12 + waveNum * 4,
        speed: 0.1,
        points: 1000,
        icon: '👾'
      });
    }

    setBugs(newBugs);
  }, [isTr]);

  // Start / Reset Bug Invaders
  const startBugInvaders = () => {
    setInvadersScore(0);
    setInvadersWave(1);
    setCannonX(50);
    setBullets([]);
    setPowerUps([]);
    setPlayerHp(godMode ? 99 : 3);
    setTripleShotTimer(0);
    setInvadersGameOver(false);
    setInvadersRunning(true);
    spawnBugWave(1);
    synth.playBlip();
  };

  // Shoot semicolon
  const shootSemicolon = useCallback(() => {
    if (!invadersRunning || invadersGameOver) return;
    synth.playLaser();
    const now = Date.now();
    if (tripleShotTimer > 0 || godMode) {
      setBullets((prev) => [
        ...prev,
        { id: now, x: cannonX, y: 88, dx: 0, dy: -2.8 },
        { id: now + 1, x: cannonX - 3, y: 88, dx: -0.4, dy: -2.8 },
        { id: now + 2, x: cannonX + 3, y: 88, dx: 0.4, dy: -2.8 }
      ]);
    } else {
      setBullets((prev) => [...prev, { id: now, x: cannonX, y: 88, dx: 0, dy: -2.8 }]);
    }
  }, [invadersRunning, invadersGameOver, cannonX, tripleShotTimer, godMode]);

  // Keyboard controls for active game
  useEffect(() => {
    if (activeGame !== 'invaders' || !invadersRunning || invadersGameOver) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setCannonX((x) => Math.max(4, x - 4));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setCannonX((x) => Math.min(96, x + 4));
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        shootSemicolon();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeGame, invadersRunning, invadersGameOver, shootSemicolon]);

  // Bug Invaders Game Loop
  useEffect(() => {
    if (activeGame !== 'invaders' || !invadersRunning || invadersGameOver) return;

    const interval = setInterval(() => {
      // 1. Update Triple Shot timer
      setTripleShotTimer((t) => Math.max(0, t - 1));

      // 2. Move Bullets
      setBullets((prev) =>
        prev
          .map((b) => ({ ...b, x: b.x + b.dx, y: b.y + b.dy }))
          .filter((b) => b.y > 0 && b.x > 0 && b.x < 100)
      );

      // 3. Move PowerUps
      setPowerUps((prev) =>
        prev
          .map((p) => ({ ...p, y: p.y + 0.8 }))
          .filter((p) => p.y < 100)
      );

      // Check Powerup collection
      setPowerUps((prev) => {
        const remaining: PowerUp[] = [];
        prev.forEach((pu) => {
          if (pu.y >= 84 && pu.y <= 92 && Math.abs(pu.x - cannonX) < 6) {
            synth.playPowerup();
            if (pu.type === 'hot_reload') {
              setTripleShotTimer(150); // ~7.5 seconds
            } else if (pu.type === 'shield') {
              setPlayerHp((hp) => hp + 1);
            } else if (pu.type === 'gc') {
              // Destroy all standard bugs on screen
              synth.playExplosion();
              setBugs((currentBugs) => {
                const survivors = currentBugs.filter((b) => b.type === 'boss');
                setInvadersScore((s) => s + (currentBugs.length - survivors.length) * 50);
                return survivors;
              });
            }
          } else {
            remaining.push(pu);
          }
        });
        return remaining;
      });

      // 4. Move Bugs Down & Check Collisions
      setBugs((prevBugs) => {
        let reachedBottom = false;

        const moved = prevBugs.map((bug) => {
          const newY = bug.y + bug.speed * 0.12;
          if (newY >= 88) reachedBottom = true;
          return { ...bug, y: newY };
        });

        if (reachedBottom && !godMode) {
          setPlayerHp((hp) => {
            const nextHp = hp - 1;
            synth.playExplosion();
            if (nextHp <= 0) {
              setInvadersGameOver(true);
              setInvadersRunning(false);
              synth.playGameOver();
            }
            return Math.max(0, nextHp);
          });
          // Push bugs back up a bit
          return moved.map((b) => ({ ...b, y: Math.max(6, b.y - 12) }));
        }

        return moved;
      });

      // 5. Bullet & Bug Hit Detection
      setBullets((currentBullets) => {
        const survivingBullets: SemicolonBullet[] = [];

        currentBullets.forEach((bullet) => {
          let hitBugId: number | null = null;

          setBugs((currentBugs) => {
            return currentBugs
              .map((bug) => {
                const hitWidth = bug.type === 'boss' ? 12 : 7;
                const hitHeight = bug.type === 'boss' ? 8 : 6;
                const isHit =
                  Math.abs(bug.x - bullet.x) < hitWidth / 2 &&
                  Math.abs(bug.y - bullet.y) < hitHeight / 2;

                if (isHit && hitBugId === null) {
                  hitBugId = bug.id;
                  const nextHp = bug.hp - 1;
                  synth.playBlip();

                  if (nextHp <= 0) {
                    synth.playExplosion();
                    setInvadersScore((s) => {
                      const updated = s + bug.points;
                      saveHighScore('invaders', updated);
                      return updated;
                    });

                    // Random powerup drop (20% chance)
                    if (Math.random() < 0.22 || bug.type === 'boss') {
                      const types: PowerUp['type'][] = ['gc', 'hot_reload', 'shield'];
                      const chosen = types[Math.floor(Math.random() * types.length)];
                      setPowerUps((pu) => [
                        ...pu,
                        {
                          id: Date.now() + Math.random(),
                          x: bug.x,
                          y: bug.y,
                          type: chosen,
                          label: chosen === 'gc' ? 'GC' : chosen === 'hot_reload' ? 'HotReload' : 'Shield',
                          icon: chosen === 'gc' ? '🧹' : chosen === 'hot_reload' ? '⚡' : '🛡️'
                        }
                      ]);
                    }
                    return null;
                  }
                  return { ...bug, hp: nextHp };
                }
                return bug;
              })
              .filter(Boolean) as BugEnemy[];
          });

          if (!hitBugId) {
            survivingBullets.push(bullet);
          }
        });

        return survivingBullets;
      });

      // 6. Check if wave cleared
      setBugs((currentBugs) => {
        if (currentBugs.length === 0 && invadersRunning && !invadersGameOver) {
          synth.playPowerup();
          confetti({ particleCount: 30, spread: 60, origin: { y: 0.4 } });
          setInvadersWave((w) => {
            const nextW = w + 1;
            setTimeout(() => spawnBugWave(nextW), 600);
            return nextW;
          });
        }
        return currentBugs;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [activeGame, invadersRunning, invadersGameOver, cannonX, godMode, saveHighScore, spawnBugWave]);

  // --------------------------------------------------------------------------
  // GAME 2: BYTE RUNNER (Cyber Snake)
  // --------------------------------------------------------------------------
  const GRID_SIZE = 20;
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ]);
  const [snakeDir, setSnakeDir] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
  const [food, setFood] = useState<{ x: number; y: number; type: string; icon: string; pts: number }>({
    x: 14,
    y: 10,
    type: 'RAM',
    icon: '💾',
    pts: 10
  });
  const [segfaults, setSegfaults] = useState<{ x: number; y: number }[]>([]);
  const [snakeScore, setSnakeScore] = useState<number>(0);
  const [snakeRunning, setSnakeRunning] = useState<boolean>(false);
  const [snakeGameOver, setSnakeGameOver] = useState<boolean>(false);

  const spawnSnakeFood = useCallback((currentSnake: { x: number; y: number }[], currentObstacles: { x: number; y: number }[]) => {
    let newX = Math.floor(Math.random() * GRID_SIZE);
    let newY = Math.floor(Math.random() * GRID_SIZE);
    while (
      currentSnake.some((s) => s.x === newX && s.y === newY) ||
      currentObstacles.some((o) => o.x === newX && o.y === newY)
    ) {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
    }

    const items = [
      { type: 'RAM', icon: '💾', pts: 10 },
      { type: 'CPU', icon: '⚡', pts: 25 },
      { type: 'Coffee', icon: '☕', pts: 40 },
      { type: 'Patch', icon: '🛡️', pts: 60 }
    ];
    const picked = items[Math.floor(Math.random() * items.length)];
    setFood({ x: newX, y: newY, ...picked });
  }, []);

  const startSnake = () => {
    const initSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    setSnake(initSnake);
    setSnakeDir({ x: 1, y: 0 });
    setSnakeScore(0);
    setSegfaults([]);
    setSnakeGameOver(false);
    setSnakeRunning(true);
    spawnSnakeFood(initSnake, []);
    synth.playBlip();
  };

  // Snake Keyboard
  useEffect(() => {
    if (activeGame !== 'snake' || !snakeRunning || snakeGameOver) return;

    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && snakeDir.y === 0) {
        setSnakeDir({ x: 0, y: -1 });
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && snakeDir.y === 0) {
        setSnakeDir({ x: 0, y: 1 });
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && snakeDir.x === 0) {
        setSnakeDir({ x: -1, y: 0 });
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && snakeDir.x === 0) {
        setSnakeDir({ x: 1, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeGame, snakeRunning, snakeGameOver, snakeDir]);

  // Snake loop
  useEffect(() => {
    if (activeGame !== 'snake' || !snakeRunning || snakeGameOver) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { x: prevSnake[0].x + snakeDir.x, y: prevSnake[0].y + snakeDir.y };

        // Wall hit or wrap
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          synth.playGameOver();
          setSnakeGameOver(true);
          setSnakeRunning(false);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
          synth.playGameOver();
          setSnakeGameOver(true);
          setSnakeRunning(false);
          return prevSnake;
        }

        // Segfault obstacle hit
        if (segfaults.some((obs) => obs.x === head.x && obs.y === head.y)) {
          synth.playGameOver();
          setSnakeGameOver(true);
          setSnakeRunning(false);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat Food
        if (head.x === food.x && head.y === food.y) {
          synth.playPowerup();
          setSnakeScore((s) => {
            const nextScore = s + food.pts;
            saveHighScore('snake', nextScore);

            // Add an obstacle every 50 points
            if (nextScore % 50 === 0 && nextScore > 0) {
              setSegfaults((obs) => [
                ...obs,
                {
                  x: Math.floor(Math.random() * GRID_SIZE),
                  y: Math.floor(Math.random() * GRID_SIZE)
                }
              ]);
            }
            return nextScore;
          });
          spawnSnakeFood(newSnake, segfaults);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [activeGame, snakeRunning, snakeGameOver, snakeDir, food, segfaults, saveHighScore, spawnSnakeFood]);

  // --------------------------------------------------------------------------
  // GAME 3: BINARY 2048 (Memory Allocator)
  // --------------------------------------------------------------------------
  const [grid2048, setGrid2048] = useState<number[][]>([
    [0, 2, 0, 0],
    [0, 0, 4, 0],
    [0, 0, 0, 0],
    [0, 0, 2, 0]
  ]);
  const [score2048, setScore2048] = useState<number>(0);
  const [gameOver2048, setGameOver2048] = useState<boolean>(false);

  const getTileLabel = (val: number) => {
    if (val === 0) return '';
    if (val < 1024) return `${val}B`;
    if (val === 1024) return '1KB';
    if (val === 2048) return '2KB';
    if (val === 4096) return '4KB';
    if (val === 8192) return '8KB';
    return `${val / 1024}KB`;
  };

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-zinc-800 text-zinc-200 border-zinc-700';
      case 4: return 'bg-zinc-700 text-zinc-100 border-zinc-600 font-bold';
      case 8: return 'bg-amber-900/80 text-amber-200 border-amber-600';
      case 16: return 'bg-orange-900/80 text-orange-200 border-orange-600';
      case 32: return 'bg-rose-900/80 text-rose-200 border-rose-500';
      case 64: return 'bg-red-900/80 text-red-100 border-red-500';
      case 128: return 'bg-purple-900/80 text-purple-200 border-purple-500 shadow-sm shadow-purple-500/30';
      case 256: return 'bg-indigo-900/80 text-indigo-200 border-indigo-500 shadow-sm shadow-indigo-500/30';
      case 512: return 'bg-blue-900/80 text-blue-200 border-blue-500 shadow-sm shadow-blue-500/30';
      case 1024: return 'bg-emerald-900/80 text-emerald-200 border-emerald-400 shadow-sm shadow-emerald-500/40 font-black';
      case 2048: return 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400 text-white border-amber-300 shadow-lg shadow-red-500/50 font-black animate-pulse';
      default: return 'bg-zinc-900/50 border-zinc-800/80';
    }
  };

  const addRandomTile2048 = (board: number[][]) => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return board;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[r][c] = Math.random() < 0.85 ? 2 : 4;
    return board;
  };

  const start2048 = () => {
    let board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    board = addRandomTile2048(board);
    board = addRandomTile2048(board);
    setGrid2048(board);
    setScore2048(0);
    setGameOver2048(false);
    synth.playBlip();
  };

  const slideRow2048 = (row: number[]) => {
    const nonZero = row.filter((v) => v !== 0);
    const newRow: number[] = [];
    let addedScore = 0;
    for (let i = 0; i < nonZero.length; i++) {
      if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
        const mergedVal = nonZero[i] * 2;
        newRow.push(mergedVal);
        addedScore += mergedVal;
        i++; // skip next
      } else {
        newRow.push(nonZero[i]);
      }
    }
    while (newRow.length < 4) newRow.push(0);
    return { newRow, addedScore };
  };

  const move2048 = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    let board = grid2048.map((r) => [...r]);
    let totalAdded = 0;
    let changed = false;

    if (dir === 'left' || dir === 'right') {
      for (let r = 0; r < 4; r++) {
        const original = [...board[r]];
        let target = dir === 'right' ? [...original].reverse() : original;
        const { newRow, addedScore } = slideRow2048(target);
        const finalRow = dir === 'right' ? newRow.reverse() : newRow;
        totalAdded += addedScore;
        board[r] = finalRow;
        if (finalRow.some((val, idx) => val !== original[idx])) changed = true;
      }
    } else {
      // Rotate columns to rows
      for (let c = 0; c < 4; c++) {
        const column = [board[0][c], board[1][c], board[2][c], board[3][c]];
        let target = dir === 'down' ? [...column].reverse() : column;
        const { newRow, addedScore } = slideRow2048(target);
        const finalCol = dir === 'down' ? newRow.reverse() : newRow;
        totalAdded += addedScore;
        for (let r = 0; r < 4; r++) {
          if (board[r][c] !== finalCol[r]) changed = true;
          board[r][c] = finalCol[r];
        }
      }
    }

    if (changed) {
      synth.playBlip();
      board = addRandomTile2048(board);
      setGrid2048(board);
      setScore2048((s) => {
        const nextScore = s + totalAdded;
        saveHighScore('2048', nextScore);
        return nextScore;
      });

      // Win celebration on 2048!
      if (board.some((r) => r.some((v) => v === 2048))) {
        confetti({ particleCount: 50, spread: 80, origin: { y: 0.5 } });
      }
    }
  }, [grid2048, saveHighScore]);

  // 2048 Keyboard Controls
  useEffect(() => {
    if (activeGame !== '2048') return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        move2048('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        move2048('right');
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        move2048('up');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        move2048('down');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeGame, move2048]);

  // --------------------------------------------------------------------------
  // GAME 4: VIM DOJO (Speed Typer)
  // --------------------------------------------------------------------------
  const [snippetIndex, setSnippetIndex] = useState<number>(0);
  const [typeInput, setTypeInput] = useState<string>('');
  const [typerTimeLeft, setTyperTimeLeft] = useState<number>(30);
  const [typerRunning, setTyperRunning] = useState<boolean>(false);
  const [typerGameOver, setTyperGameOver] = useState<boolean>(false);
  const [completedSnippets, setCompletedSnippets] = useState<number>(0);
  const [totalCharsTyped, setTotalCharsTyped] = useState<number>(0);

  const currentSnippet = DEV_TYPING_SNIPPETS[snippetIndex % DEV_TYPING_SNIPPETS.length];

  const startVimDojo = () => {
    setSnippetIndex(0);
    setTypeInput('');
    setTyperTimeLeft(30);
    setTyperRunning(true);
    setTyperGameOver(false);
    setCompletedSnippets(0);
    setTotalCharsTyped(0);
    synth.playBlip();
  };

  const handleTypeChange = (val: string) => {
    if (!typerRunning || typerGameOver) return;
    synth.playKeypress();
    setTypeInput(val);

    // Check complete
    if (val === currentSnippet) {
      synth.playPowerup();
      setCompletedSnippets((c) => c + 1);
      setTotalCharsTyped((t) => t + currentSnippet.length);
      setSnippetIndex((i) => (i + 1) % DEV_TYPING_SNIPPETS.length);
      setTypeInput('');
    }
  };

  // Typer Countdown Timer
  useEffect(() => {
    if (activeGame !== 'vimdojo' || !typerRunning || typerGameOver) return;

    const timer = setInterval(() => {
      setTyperTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setTyperGameOver(true);
          setTyperRunning(false);
          synth.playGameOver();
          const wpm = Math.round((totalCharsTyped / 5) * (60 / 30));
          saveHighScore('vimdojo', wpm);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeGame, typerRunning, typerGameOver, totalCharsTyped, saveHighScore]);

  const currentWpm = typerTimeLeft < 30
    ? Math.round((totalCharsTyped / 5) * (60 / Math.max(1, 30 - typerTimeLeft)))
    : 0;

  return (
    <div className={`h-full flex flex-col bg-[#07090e] text-zinc-100 overflow-hidden font-sans select-none relative ${className}`}>
      {/* Optional CRT Scanlines Filter Overlay */}
      {crtFilter && (
        <div className="absolute inset-0 pointer-events-none z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40" />
      )}

      {/* Top Arcade Navigation & Status Bar */}
      <div className="h-10 bg-[#0c0f16] border-b border-zinc-800/80 px-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center shadow-md shadow-red-500/20 ring-1 ring-red-400/50">
            <Gamepad2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-black tracking-wider bg-gradient-to-r from-red-500 via-rose-400 to-red-400 bg-clip-text text-transparent font-mono">
                {isTr ? 'VIRACODE GELİŞTİRİCİ ARCADE' : 'VIRACODE DEV ARCADE'}
              </span>
              <span className="text-[8px] px-1.5 py-0.2 bg-red-950/80 text-red-400 border border-red-800/60 rounded font-mono font-bold">
                {isTr ? 'Programcılar da Oynar' : 'Devs Play Too!'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Game Selection Tabs */}
        <div className="flex items-center bg-[#090d14] border border-zinc-800 rounded p-0.5 space-x-0.5 text-[10px] font-mono">
          <button
            onClick={() => setActiveGame('invaders')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer flex items-center space-x-1 ${
              activeGame === 'invaders'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>👾</span>
            <span>{isTr ? 'Bug Avcısı' : 'Bug Invaders'}</span>
          </button>

          <button
            onClick={() => setActiveGame('snake')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer flex items-center space-x-1 ${
              activeGame === 'snake'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🐍</span>
            <span>{isTr ? 'Byte Yılanı' : 'Byte Runner'}</span>
          </button>

          <button
            onClick={() => setActiveGame('2048')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer flex items-center space-x-1 ${
              activeGame === '2048'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🔢</span>
            <span>{isTr ? 'İkili 2048' : 'Binary 2048'}</span>
          </button>

          <button
            onClick={() => setActiveGame('vimdojo')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer flex items-center space-x-1 ${
              activeGame === 'vimdojo'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>⚡</span>
            <span>{isTr ? 'Vim Hız Yazıcısı' : 'Vim Dojo'}</span>
          </button>
        </div>

        {/* Right Tools: Panic Boss Key, Sound, CRT Scanlines, High Score */}
        <div className="flex items-center space-x-1.5">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1 rounded text-[9px] font-mono transition-colors cursor-pointer border ${
              soundEnabled
                ? 'bg-zinc-800 text-red-300 border-zinc-700'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
            title={soundEnabled ? 'Mute 8-bit Synth' : 'Enable 8-bit Synth'}
          >
            {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>

          {/* CRT Filter Toggle */}
          <button
            onClick={() => setCrtFilter(!crtFilter)}
            className={`p-1 rounded text-[9px] font-mono transition-colors cursor-pointer border ${
              crtFilter
                ? 'bg-zinc-800 text-red-300 border-zinc-700'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
            title="Toggle CRT Scanline Overlay"
          >
            <Tv className="w-3 h-3" />
          </button>

          {/* Coffee Sip Break */}
          <button
            onClick={() => {
              setCoffeeCount((c) => c + 1);
              synth.playBlip();
            }}
            className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-300 text-[9px] font-mono flex items-center space-x-1 border border-zinc-800 cursor-pointer"
            title={isTr ? 'Kahve Molası Ver' : 'Take Coffee Sip'}
          >
            <Coffee className="w-2.5 h-2.5" />
            <span>{coffeeCount} {isTr ? 'Fincan' : 'Cups'}</span>
          </button>

          {/* Panic / Boss Key (Instantly Return to Code Editor) */}
          {onBackToEditor && (
            <button
              onClick={onBackToEditor}
              onMouseEnter={() => setShowBossAlert(true)}
              onMouseLeave={() => setShowBossAlert(false)}
              className="px-2 py-0.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded text-[9px] font-mono font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-xs shadow-red-900/40"
              title={isTr ? 'Patron Tuşu (Esc) - Hızlıca Koda Dön' : 'Boss Key (Esc) - Instantly Return to Code'}
            >
              <Eye className="w-2.5 h-2.5 animate-pulse" />
              <span>{isTr ? 'Patron Tuşu (Esc)' : 'Boss Key (Esc)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Arcade Stage */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Game Canvas Viewport */}
        <div className="flex-1 flex flex-col p-2 overflow-hidden bg-[#05070c] relative">
          {/* ================================================================ */}
          {/* GAME 1: BUG INVADERS (Syntax Blaster)                            */}
          {/* ================================================================ */}
          {activeGame === 'invaders' && (
            <div className="flex-1 flex flex-col rounded-xl border border-zinc-800 bg-[#06080d] overflow-hidden relative shadow-inner">
              {/* Header HUD */}
              <div className="h-8 bg-[#090d15] border-b border-zinc-800/80 px-3 flex items-center justify-between text-[10px] font-mono text-zinc-300">
                <div className="flex items-center space-x-3">
                  <span>
                    {isTr ? 'SKOR:' : 'SCORE:'}{' '}
                    <strong className="text-red-400 font-bold">{invadersScore}</strong>
                  </span>
                  <span>
                    {isTr ? 'DALGA:' : 'WAVE:'}{' '}
                    <strong className="text-amber-400 font-bold">{invadersWave}</strong>
                  </span>
                  <span>
                    {isTr ? 'CAN:' : 'HP:'}{' '}
                    <span className="text-rose-400 font-bold">
                      {Array.from({ length: Math.min(6, playerHp) })
                        .map(() => '❤️')
                        .join('')}
                    </span>
                  </span>
                  {tripleShotTimer > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[8px] animate-pulse">
                      ⚡ HOT RELOAD (TRIPLE SHOT)
                    </span>
                  )}
                  {godMode && (
                    <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[8px] animate-pulse">
                      🌟 GOD MODE (KONAMI)
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-zinc-500 text-[9px]">
                    {isTr ? 'EN İYİ:' : 'BEST:'} <strong className="text-zinc-200">{highScores.invaders}</strong>
                  </span>
                  {!invadersRunning ? (
                    <button
                      onClick={startBugInvaders}
                      className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[9px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs shadow-red-900/40"
                    >
                      <Play className="w-2.5 h-2.5 fill-white" />
                      <span>{invadersGameOver ? (isTr ? 'Yeniden Başla' : 'Restart') : (isTr ? 'Başla' : 'Start')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setInvadersRunning(false)}
                      className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Pause className="w-2.5 h-2.5" />
                      <span>{isTr ? 'Duraklat' : 'Pause'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Game Field */}
              <div
                ref={invadersRef}
                className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-950 via-[#06080d] to-[#040609]"
              >
                {/* Compiler Laser Cannon */}
                <div
                  style={{ left: `${cannonX}%` }}
                  className="absolute bottom-4 -translate-x-1/2 flex flex-col items-center transition-all duration-75 select-none"
                >
                  <div className="w-1.5 h-3 bg-red-400 rounded-t shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <div className="px-2 py-0.5 rounded bg-gradient-to-r from-red-600 via-rose-600 to-red-500 border border-red-400/80 shadow-md shadow-red-500/40 text-[9px] font-mono font-black text-white flex items-center space-x-1">
                    <span>[⚡ gcc]</span>
                  </div>
                </div>

                {/* Semicolon Bullets */}
                {bullets.map((b) => (
                  <div
                    key={b.id}
                    style={{ left: `${b.x}%`, top: `${b.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-red-400 font-mono font-black text-[13px] drop-shadow-[0_0_6px_rgba(239,68,68,0.9)] select-none pointer-events-none"
                  >
                    ;
                  </div>
                ))}

                {/* Dropping PowerUps */}
                {powerUps.map((pu) => (
                  <div
                    key={pu.id}
                    style={{ left: `${pu.x}%`, top: `${pu.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center space-x-0.5 px-1.5 py-0.5 bg-black/80 border border-amber-400 text-amber-300 rounded-full text-[8px] font-mono shadow-md animate-bounce"
                  >
                    <span>{pu.icon}</span>
                    <span>{pu.label}</span>
                  </div>
                ))}

                {/* Enemies (Bugs) */}
                {bugs.map((bug) => (
                  <div
                    key={bug.id}
                    style={{ left: `${bug.x}%`, top: `${bug.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-transform select-none ${
                      bug.type === 'boss'
                        ? 'p-2 bg-rose-950/80 border-2 border-red-500 rounded-xl shadow-lg shadow-red-500/30'
                        : 'p-1 rounded bg-zinc-900/70 border border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <span className={bug.type === 'boss' ? 'text-xl' : 'text-sm'}>
                        {bug.icon}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-zinc-300 truncate max-w-[80px]">
                        {bug.label}
                      </span>
                    </div>

                    {/* Boss or multi-hp health bar */}
                    {bug.maxHp > 1 && (
                      <div className="w-full bg-zinc-800 rounded-full h-1 mt-0.5 overflow-hidden">
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${(bug.hp / bug.maxHp) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Game Over Splash Overlay */}
                {invadersGameOver && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-20 backdrop-blur-xs">
                    <div className="text-3xl font-black font-mono text-red-500 mb-1 drop-shadow-[0_2px_12px_rgba(239,68,68,0.7)]">
                      💥 SEGMENTATION FAULT
                    </div>
                    <div className="text-xs font-mono text-zinc-400 mb-4 text-center max-w-sm">
                      {isTr
                        ? 'Hata ayıklayıcı çöktü! Kod derleme sınırlarını aştı.'
                        : 'Bugs overwhelmed the compiler! Semicolons depleted.'}
                    </div>
                    <div className="text-lg font-mono text-zinc-200 mb-4">
                      {isTr ? 'Toplam Skor:' : 'Final Score:'}{' '}
                      <strong className="text-red-400">{invadersScore}</strong>
                    </div>
                    <button
                      onClick={startBugInvaders}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg font-mono font-bold text-xs flex items-center space-x-2 shadow-lg shadow-red-900/50 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isTr ? 'Tekrar Dene (Retry)' : 'Retry Compilation'}</span>
                    </button>
                  </div>
                )}

                {/* Welcome / Idle Screen */}
                {!invadersRunning && !invadersGameOver && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 text-center">
                    <div className="text-xl font-black font-mono text-red-400 mb-1">
                      👾 BUG INVADERS (SYNTAX BLASTER)
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400 mb-4 max-w-md">
                      {isTr
                        ? 'Compiler topuyla inen kod hatalarını noktalı virgül (;) ile patlatın! GC ve HotReload güçlendirmelerini toplayın.'
                        : 'Blast descending bugs with your compiler cannon using semicolons (;)! Collect Garbage Collectors & Hot Reload powerups.'}
                    </p>
                    <div className="flex items-center space-x-2 text-[9px] font-mono text-zinc-400 mb-4 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
                      <span>🕹️ Sol/Sağ Ok veya A/D: Hareket</span>
                      <span>•</span>
                      <span>Space: Ateş Et (;)</span>
                    </div>
                    <button
                      onClick={startBugInvaders}
                      className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg font-mono font-bold text-xs flex items-center space-x-2 shadow-lg shadow-red-900/50 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isTr ? 'Oyunu Başlat (Enter)' : 'Start Game'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Quick Controls for Touch / Mouse Users */}
              <div className="h-9 bg-[#080b11] border-t border-zinc-800/80 px-3 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setCannonX((x) => Math.max(4, x - 8))}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded font-mono text-[9px] cursor-pointer"
                  >
                    ◀ Sol
                  </button>
                  <button
                    onClick={() => setCannonX((x) => Math.min(96, x + 8))}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded font-mono text-[9px] cursor-pointer"
                  >
                    Sağ ▶
                  </button>
                  <button
                    onClick={shootSemicolon}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-[9px] rounded cursor-pointer shadow-xs shadow-red-900/40"
                  >
                    Ateş Et (;)
                  </button>
                </div>
                <div className="text-[9px] font-mono text-zinc-500 hidden sm:block">
                  💡 {isTr ? 'İpucu: Konami kodunu (↑ ↑ ↓ ↓ ← → ← → B A) girerek Gizli Modu açın!' : 'Tip: Enter Konami code for God Mode!'}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* GAME 2: BYTE RUNNER (Cyber Snake)                                */}
          {/* ================================================================ */}
          {activeGame === 'snake' && (
            <div className="flex-1 flex flex-col rounded-xl border border-zinc-800 bg-[#06080d] overflow-hidden relative shadow-inner">
              {/* Header HUD */}
              <div className="h-8 bg-[#090d15] border-b border-zinc-800/80 px-3 flex items-center justify-between text-[10px] font-mono text-zinc-300">
                <div className="flex items-center space-x-3">
                  <span>
                    {isTr ? 'BELLEK:' : 'MEMORY:'}{' '}
                    <strong className="text-red-400 font-bold">{snakeScore} MB</strong>
                  </span>
                  <span>
                    {isTr ? 'UZUNLUK:' : 'LENGTH:'}{' '}
                    <strong className="text-emerald-400 font-bold">{snake.length} pkts</strong>
                  </span>
                  <span>
                    {isTr ? 'ENGELLER:' : 'SEGFAULTS:'}{' '}
                    <strong className="text-rose-400 font-bold">{segfaults.length}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-zinc-500 text-[9px]">
                    {isTr ? 'EN İYİ:' : 'BEST:'} <strong className="text-zinc-200">{highScores.snake} MB</strong>
                  </span>
                  {!snakeRunning ? (
                    <button
                      onClick={startSnake}
                      className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[9px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs shadow-red-900/40"
                    >
                      <Play className="w-2.5 h-2.5 fill-white" />
                      <span>{snakeGameOver ? (isTr ? 'Yeniden Başla' : 'Restart') : (isTr ? 'Başla' : 'Start')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSnakeRunning(false)}
                      className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Pause className="w-2.5 h-2.5" />
                      <span>{isTr ? 'Duraklat' : 'Pause'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Snake Grid Canvas */}
              <div className="flex-1 flex items-center justify-center p-2 bg-[#040609]">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                    aspectRatio: '1/1',
                    maxHeight: '100%'
                  }}
                  className="w-full max-w-[380px] bg-black/60 border border-zinc-800/80 rounded-lg p-1 relative gap-0.5"
                >
                  {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
                    const x = idx % GRID_SIZE;
                    const y = Math.floor(idx / GRID_SIZE);
                    const isHead = snake[0]?.x === x && snake[0]?.y === y;
                    const isBody = snake.slice(1).some((s) => s.x === x && s.y === y);
                    const isFood = food.x === x && food.y === y;
                    const isObs = segfaults.some((o) => o.x === x && o.y === y);

                    let cellStyle = 'bg-zinc-900/30';
                    if (isHead) cellStyle = 'bg-red-500 shadow-sm shadow-red-500 rounded-sm';
                    else if (isBody) cellStyle = 'bg-rose-700/80 rounded-xs';
                    else if (isObs) cellStyle = 'bg-rose-950 border border-rose-600 rounded-xs text-[7px] font-bold text-rose-300 flex items-center justify-center';
                    else if (isFood) cellStyle = 'bg-amber-950/80 border border-amber-400 rounded flex items-center justify-center text-[9px] animate-pulse';

                    return (
                      <div
                        key={idx}
                        className={`transition-colors flex items-center justify-center ${cellStyle}`}
                      >
                        {isFood && food.icon}
                        {isObs && '❌'}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick Controls */}
              <div className="h-9 bg-[#080b11] border-t border-zinc-800/80 px-3 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => snakeDir.x === 0 && setSnakeDir({ x: -1, y: 0 })}
                    className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded font-mono text-[9px] cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => snakeDir.y === 0 && setSnakeDir({ x: 0, y: -1 })}
                    className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded font-mono text-[9px] cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => snakeDir.y === 0 && setSnakeDir({ x: 0, y: 1 })}
                    className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded font-mono text-[9px] cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => snakeDir.x === 0 && setSnakeDir({ x: 1, y: 0 })}
                    className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded font-mono text-[9px] cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-[9px] font-mono text-zinc-400">
                  {isTr ? 'Ok Tuşları veya WASD ile kontrol edin' : 'Use Arrow Keys or WASD'}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* GAME 3: BINARY 2048 (Memory Allocator)                           */}
          {/* ================================================================ */}
          {activeGame === '2048' && (
            <div className="flex-1 flex flex-col rounded-xl border border-zinc-800 bg-[#06080d] overflow-hidden relative shadow-inner">
              {/* Header HUD */}
              <div className="h-8 bg-[#090d15] border-b border-zinc-800/80 px-3 flex items-center justify-between text-[10px] font-mono text-zinc-300">
                <div className="flex items-center space-x-3">
                  <span>
                    {isTr ? 'TAHSİS EDİLEN:' : 'ALLOCATED:'}{' '}
                    <strong className="text-red-400 font-bold">{score2048} B</strong>
                  </span>
                  <span>
                    {isTr ? 'HEDEF:' : 'TARGET:'}{' '}
                    <strong className="text-amber-400 font-bold">2048 (2KB)</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-zinc-500 text-[9px]">
                    {isTr ? 'EN İYİ:' : 'BEST:'} <strong className="text-zinc-200">{highScores['2048']} B</strong>
                  </span>
                  <button
                    onClick={start2048}
                    className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[9px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs shadow-red-900/40"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>{isTr ? 'Yeni Oyun' : 'New Game'}</span>
                  </button>
                </div>
              </div>

              {/* 2048 Grid Canvas */}
              <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#040609]">
                <div className="grid grid-cols-4 gap-2 w-full max-w-[340px] aspect-square bg-[#0b0e14] p-3 rounded-2xl border border-zinc-800 shadow-2xl">
                  {grid2048.map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`rounded-xl border flex items-center justify-center text-xs font-mono font-bold transition-all duration-150 ${getTileColor(
                          val
                        )}`}
                      >
                        {getTileLabel(val)}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Quick Controls */}
              <div className="h-9 bg-[#080b11] border-t border-zinc-800/80 px-3 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => move2048('left')}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded font-mono text-[9px] cursor-pointer"
                  >
                    ◀ Sol
                  </button>
                  <button
                    onClick={() => move2048('up')}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded font-mono text-[9px] cursor-pointer"
                  >
                    ▲ Yukarı
                  </button>
                  <button
                    onClick={() => move2048('down')}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded font-mono text-[9px] cursor-pointer"
                  >
                    ▼ Aşağı
                  </button>
                  <button
                    onClick={() => move2048('right')}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded font-mono text-[9px] cursor-pointer"
                  >
                    Sağ ▶
                  </button>
                </div>
                <div className="text-[9px] font-mono text-zinc-400">
                  {isTr ? 'Ok tuşlarıyla kaydırarak blokları birleştirin' : 'Merge tiles using Arrow Keys'}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* GAME 4: VIM DOJO (Speed Typer)                                   */}
          {/* ================================================================ */}
          {activeGame === 'vimdojo' && (
            <div className="flex-1 flex flex-col rounded-xl border border-zinc-800 bg-[#06080d] overflow-hidden relative shadow-inner">
              {/* Header HUD */}
              <div className="h-8 bg-[#090d15] border-b border-zinc-800/80 px-3 flex items-center justify-between text-[10px] font-mono text-zinc-300">
                <div className="flex items-center space-x-3">
                  <span>
                    {isTr ? 'SÜRE:' : 'TIME:'}{' '}
                    <strong className="text-amber-400 font-bold">{typerTimeLeft}s</strong>
                  </span>
                  <span>
                    {isTr ? 'HIZ (WPM):' : 'SPEED:'}{' '}
                    <strong className="text-red-400 font-bold">{currentWpm} WPM</strong>
                  </span>
                  <span>
                    {isTr ? 'TAMAMLANAN:' : 'SOLVED:'}{' '}
                    <strong className="text-emerald-400 font-bold">{completedSnippets}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-zinc-500 text-[9px]">
                    {isTr ? 'EN İYİ:' : 'BEST:'} <strong className="text-zinc-200">{highScores.vimdojo} WPM</strong>
                  </span>
                  {!typerRunning ? (
                    <button
                      onClick={startVimDojo}
                      className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[9px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs shadow-red-900/40"
                    >
                      <Play className="w-2.5 h-2.5 fill-white" />
                      <span>{typerGameOver ? (isTr ? 'Yeniden Dene' : 'Retry Sprint') : (isTr ? 'Başla (30s)' : 'Start (30s)')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setTyperRunning(false)}
                      className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Pause className="w-2.5 h-2.5" />
                      <span>{isTr ? 'Duraklat' : 'Pause'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Typing Arena */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#040609] font-mono">
                {typerRunning ? (
                  <div className="w-full max-w-xl space-y-4">
                    {/* Target Code Snippet Display with Character-by-Character Highlight */}
                    <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 text-sm leading-relaxed tracking-wide select-none">
                      {currentSnippet.split('').map((char, i) => {
                        let color = 'text-zinc-500';
                        if (i < typeInput.length) {
                          color = typeInput[i] === char ? 'text-emerald-400 font-bold' : 'text-rose-500 bg-rose-950/60 font-bold';
                        } else if (i === typeInput.length) {
                          color = 'text-red-400 underline animate-pulse font-bold';
                        }
                        return (
                          <span key={i} className={color}>
                            {char}
                          </span>
                        );
                      })}
                    </div>

                    {/* Input Field */}
                    <input
                      type="text"
                      autoFocus
                      value={typeInput}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      placeholder={isTr ? 'Yukarıdaki kodu eksiksiz ve hızlıca yazın...' : 'Type the exact code above as fast as possible...'}
                      className="w-full px-3 py-2.5 rounded-lg bg-[#090d15] border border-red-500/60 text-zinc-100 text-sm outline-none focus:ring-1 focus:ring-red-400 shadow-inner"
                    />
                  </div>
                ) : typerGameOver ? (
                  <div className="text-center space-y-3">
                    <div className="text-2xl font-black text-red-400 font-mono">
                      ⏱️ {isTr ? '30 SANİYE SÜRE DOLDU!' : '30s SPRINT COMPLETE!'}
                    </div>
                    <div className="text-sm text-zinc-300">
                      {isTr ? 'Yazma Hızınız:' : 'Your Typing Speed:'}{' '}
                      <strong className="text-xl text-emerald-400 font-black">{currentWpm} WPM</strong>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {isTr ? 'Eksiksiz Tamamlanan Modül:' : 'Completed Snippets:'}{' '}
                      <strong className="text-zinc-100">{completedSnippets}</strong>
                    </div>
                    <button
                      onClick={startVimDojo}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg font-mono font-bold text-xs flex items-center space-x-2 shadow-lg shadow-red-900/50 cursor-pointer mx-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isTr ? 'Tekrar Sprint At (30s)' : 'Try Again'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-3 max-w-md">
                    <div className="text-lg font-black text-red-400">
                      ⚡ VIM DOJO (KOD HIZ YAZICISI)
                    </div>
                    <p className="text-xs text-zinc-400">
                      {isTr
                        ? 'Programcı kod yazarken hızlı olmalıdır! 30 saniye içinde terminal komutlarını ve kod parçacıklarını ne kadar hızlı yazabileceğinizi test edin.'
                        : 'Real programmers type code at speed! Test your WPM on genuine terminal commands, Rust, Docker, and SQL code snippets.'}
                    </p>
                    <button
                      onClick={startVimDojo}
                      className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg font-mono font-bold text-xs flex items-center space-x-2 shadow-lg shadow-red-900/50 cursor-pointer mx-auto"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isTr ? 'Sprinti Başlat (Start)' : 'Start 30s Sprint'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Dev Arcade Cabinet Details & Achievements */}
        <div className="w-72 bg-[#090d14] border-l border-zinc-800/80 p-3 flex flex-col justify-between shrink-0 overflow-y-auto font-mono text-[9px]">
          <div className="space-y-3">
            {/* Cabinet Branding */}
            <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-red-400 font-bold">
                <Trophy className="w-3.5 h-3.5" />
                <span>{isTr ? 'LİDERLİK & REKORLAR' : 'ARCADE LEADERBOARD'}</span>
              </div>
              <div className="space-y-1 pt-1 text-zinc-400">
                <div className="flex justify-between items-center py-0.5 border-b border-zinc-900">
                  <span>👾 Bug Invaders</span>
                  <span className="font-bold text-red-300">{highScores.invaders} pts</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-zinc-900">
                  <span>🐍 Byte Runner</span>
                  <span className="font-bold text-emerald-300">{highScores.snake} MB</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-zinc-900">
                  <span>🔢 Binary 2048</span>
                  <span className="font-bold text-amber-300">{highScores['2048']} B</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span>⚡ Vim Dojo</span>
                  <span className="font-bold text-rose-300">{highScores.vimdojo} WPM</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800 space-y-1.5">
              <div className="flex items-center space-x-1 text-amber-400 font-bold">
                <Sparkles className="w-3 h-3" />
                <span>{isTr ? 'BAŞARIMLAR (ACHIEVEMENTS)' : 'DEV ACHIEVEMENTS'}</span>
              </div>

              <div className="space-y-1 text-zinc-400">
                <div className="flex items-center space-x-1.5 p-1 rounded bg-zinc-900/60 border border-zinc-800/60">
                  <CheckCircle2 className={`w-3 h-3 ${highScores.invaders >= 1000 ? 'text-emerald-400' : 'text-zinc-600'}`} />
                  <div>
                    <div className="font-bold text-zinc-200">Semicolon Sniper</div>
                    <div className="text-[7.5px] text-zinc-500">Bug Invaders &gt; 1000 puan</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 p-1 rounded bg-zinc-900/60 border border-zinc-800/60">
                  <CheckCircle2 className={`w-3 h-3 ${highScores['2048'] >= 2048 ? 'text-emerald-400' : 'text-zinc-600'}`} />
                  <div>
                    <div className="font-bold text-zinc-200">Memory Master</div>
                    <div className="text-[7.5px] text-zinc-500">Binary 2048 bloğuna ulaş</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 p-1 rounded bg-zinc-900/60 border border-zinc-800/60">
                  <CheckCircle2 className={`w-3 h-3 ${godMode ? 'text-emerald-400' : 'text-zinc-600'}`} />
                  <div>
                    <div className="font-bold text-zinc-200">Konami Hacker</div>
                    <div className="text-[7.5px] text-zinc-500">{godMode ? 'Aktif!' : '↑↑↓↓←→←→BA kodunu tuşla'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Gamer Dev Fact */}
            <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 text-zinc-400 leading-relaxed">
              <div className="font-bold text-red-300 mb-1 flex items-center space-x-1">
                <Coffee className="w-3 h-3" />
                <span>{isTr ? 'Biliyor muydunuz?' : 'Did you know?'}</span>
              </div>
              <p className="text-[8px] text-zinc-400">
                {isTr
                  ? 'Geliştiricilerin %87si zorlu bir hatayı (bug) çözmeye çalışırken kısa bir oyun molasının beyni tazelediğini ve yaratıcı çözümler getirdiğini söylüyor.'
                  : '87% of engineers report that a brief 5-minute retro game break resets focus and triggers breakthrough debugging insights!'}
              </p>
            </div>
          </div>

          {/* Bottom Boss Panic Hint */}
          <div className="pt-2 border-t border-zinc-800/80 text-[8px] text-zinc-500 flex items-center justify-between">
            <span>🚨 {isTr ? 'Esc tuşu: Koda ani dönüş' : 'Esc: Instant code return'}</span>
            <span className="text-red-400 font-bold">ViraCode Arcade</span>
          </div>
        </div>
      </div>
    </div>
  );
};
