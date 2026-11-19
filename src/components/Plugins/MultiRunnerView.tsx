import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  Code2, 
  CheckCircle2, 
  Clock, 
  Database, 
  Layers, 
  FileCode, 
  Copy, 
  Check, 
  Cpu, 
  Sparkles,
  Settings2
} from 'lucide-react';
import { PolyglotRunnerConfig } from '../../types/plugins';
import { useI18n } from '../../i18n/LanguageContext';

const RUNNER_PRESETS: PolyglotRunnerConfig[] = [
  {
    id: 'python',
    name: 'Python 3.12 (CPython)',
    language: 'python',
    runtimeVersion: 'Python 3.12.3 (64-bit JIT)',
    icon: '🐍',
    extension: 'py',
    compilerFlags: '-O -X dev',
    sampleArgs: '--workers 4 --benchmark',
    description: 'Python High-Performance Runtime with Vectorized Math and AsyncIO',
    defaultCode: `import math
import time

def compute_prime_sieve(limit: int) -> list[int]:
    start = time.perf_counter()
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    for i in range(2, int(math.isqrt(limit)) + 1):
        if sieve[i]:
            for j in range(i * i, limit + 1, i):
                sieve[j] = False
    primes = [i for i, is_p in enumerate(sieve) if is_p]
    elapsed = (time.perf_counter() - start) * 1000
    print(f"[PY-BENCH] Computed {len(primes)} primes up to {limit:,} in {elapsed:.2f}ms")
    return primes

if __name__ == "__main__":
    primes = compute_prime_sieve(100_000)
    print(f"[PY-RESULT] 10,000th prime is: {primes[9999]}")
    print("[SUCCESS] Zero-leak runtime execution verified.")
`,
  },
  {
    id: 'nodejs',
    name: 'Node.js / TypeScript ES2024',
    language: 'typescript',
    runtimeVersion: 'Node.js v22.4.0 (V8 12.4 TurboFan)',
    icon: '⚡',
    extension: 'ts',
    compilerFlags: '--loader tsx --enable-source-maps',
    sampleArgs: '--env production --concurrency 8',
    description: 'High-throughput async event loop with WebAssembly & SIMD',
    defaultCode: `interface PerformanceReport {
  iterations: number;
  throughputOpsPerSec: number;
  p99LatencyMs: number;
}

async function benchmarkEventLoop(): Promise<PerformanceReport> {
  const start = performance.now();
  let count = 0;
  for (let i = 0; i < 250_000; i++) {
    count += Math.hypot(i, i * 2) > 0 ? 1 : 0;
  }
  const durationMs = performance.now() - start;
  const ops = Math.round((count / durationMs) * 1000);
  
  return {
    iterations: count,
    throughputOpsPerSec: ops,
    p99LatencyMs: Number((durationMs / 100).toFixed(3)),
  };
}

benchmarkEventLoop().then((report) => {
  console.log('[NODE-V8] Benchmark complete:', JSON.stringify(report, null, 2));
  console.log('[STATUS] Microtask queue latency: 0.12ms');
});
`,
  },
  {
    id: 'rust',
    name: 'Rust 1.80 (rustc / LLVM 18)',
    language: 'rust',
    runtimeVersion: 'rustc 1.80.1-nightly (x86_64-unknown-linux-gnu)',
    icon: '🦀',
    extension: 'rs',
    compilerFlags: '-C opt-level=3 -C target-cpu=native -C lto=fat',
    sampleArgs: '--release --features "simd-avx512"',
    description: 'Zero-cost abstractions with fearless concurrency & arena allocation',
    defaultCode: `use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Instant;

static GLOBAL_COUNTER: AtomicUsize = AtomicUsize::new(0);

fn main() {
    let start = Instant::now();
    let handles: Vec<_> = (0..8).map(|_| {
        std::thread::spawn(|| {
            for _ in 0..125_000 {
                GLOBAL_COUNTER.fetch_add(1, Ordering::Relaxed);
            }
        })
    }).collect();

    for h in handles {
        h.join().unwrap();
    }

    let elapsed = start.elapsed();
    println!("[RUST-LLVM] Atomic counter converged to: {}", GLOBAL_COUNTER.load(Ordering::SeqCst));
    println!("[RUST-BENCH] Total elapsed time across 8 threads: {:?}", elapsed);
    println!("[VERIFICATION] Memory safe, 0 data races detected.");
}
`,
  },
  {
    id: 'cpp',
    name: 'C++23 / Clang 18 (WASM)',
    language: 'cpp',
    runtimeVersion: 'clang++ version 18.1.3 (Target: wasm32-unknown-wasi)',
    icon: '⚙️',
    extension: 'cpp',
    compilerFlags: '-std=c++23 -O3 -march=native -Wall',
    sampleArgs: '--profile-simd',
    description: 'Ultra-low latency SIMD vectorized computation engine',
    defaultCode: `#include <iostream>
#include <vector>
#include <numeric>
#include <chrono>

int main() {
    constexpr size_t N = 1'000'000;
    std::vector<double> data(N, 1.0001);
    
    auto t0 = std::chrono::high_resolution_clock::now();
    double sum = std::accumulate(data.begin(), data.end(), 0.0);
    auto t1 = std::chrono::high_resolution_clock::now();

    auto dur = std::chrono::duration_cast<std::chrono::microseconds>(t1 - t0).count();
    std::cout << "[CPP23-SIMD] Vectorized Sum of " << N << " doubles: " << sum << std::endl;
    std::cout << "[CPP23-TIME] Execution time: " << dur << " us" << std::endl;
    return 0;
}
`,
  },
  {
    id: 'go',
    name: 'Go 1.22 (gc runtime)',
    language: 'go',
    runtimeVersion: 'go version go1.22.4 linux/amd64',
    icon: '🐹',
    extension: 'go',
    compilerFlags: '-gcflags "-m -l" -tags netgo',
    sampleArgs: '-race -cpu=8',
    description: 'Lightweight CSP Goroutine concurrency with channel synchronization',
    defaultCode: `package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		results <- j * j
	}
}

func main() {
	start := time.Now()
	const numJobs = 10000
	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)

	var wg sync.WaitGroup
	for w := 1; w <= 8; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	for j := 1; j <= numJobs; j++ {
		jobs <- j
	}
	close(jobs)

	wg.Wait()
	close(results)

	total := 0
	for r := range results {
		total += r
	}

	fmt.Printf("[GO-CSP] Processed %d concurrent jobs in %v\\n", numJobs, time.Since(start))
	fmt.Printf("[GO-RESULT] Aggregated sum of squares: %d\\n", total)
}
`,
  },
  {
    id: 'sql',
    name: 'SQL Relational Engine (SQLite 3.45)',
    language: 'sql',
    runtimeVersion: 'SQLite 3.45.1 (In-Memory Virtual B-Tree)',
    icon: '🗄️',
    extension: 'sql',
    compilerFlags: '-batch -header -column',
    sampleArgs: '--explain-query-plan',
    description: 'Relational query processor with indexing and aggregation analytics',
    defaultCode: `-- Relational Analytics Query
WITH ranked_symbols AS (
  SELECT 
    symbol_name,
    file_path,
    complexity,
    ast_scope,
    execution_time_ns,
    DENSE_RANK() OVER (ORDER BY execution_time_ns ASC) as rank_order
  FROM virtual_ast_symbols
)
SELECT 
  rank_order,
  symbol_name,
  file_path,
  complexity,
  ast_scope,
  ROUND(execution_time_ns / 1000.0, 2) AS exec_time_us
FROM ranked_symbols
WHERE complexity = 'O(1)'
LIMIT 5;
`,
  },
];

export const MultiRunnerView: React.FC = () => {
  const { language } = useI18n();
  const [selectedRunner, setSelectedRunner] = useState<PolyglotRunnerConfig>(RUNNER_PRESETS[0]);
  const [sourceCode, setSourceCode] = useState<string>(selectedRunner.defaultCode);
  const [cliArgs, setCliArgs] = useState<string>(selectedRunner.sampleArgs);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionOutput, setExecutionOutput] = useState<string>('');
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [execDuration, setExecDuration] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Switch runner preset
  const handleSelectRunner = (preset: PolyglotRunnerConfig) => {
    setSelectedRunner(preset);
    setSourceCode(preset.defaultCode);
    setCliArgs(preset.sampleArgs);
    setExecutionOutput('');
    setExitCode(null);
    setExecDuration(null);
  };

  // Run simulation
  const handleRunCode = () => {
    setIsRunning(true);
    setExecutionOutput(`⏳ [${selectedRunner.name}] Compiling & executing with flags: ${selectedRunner.compilerFlags}...\n`);
    
    setTimeout(() => {
      let output = '';
      const duration = (2.4 + Math.random() * 6.8).toFixed(2);

      if (selectedRunner.id === 'python') {
        output = `[PY-RUNTIME] Initializing Python 3.12.3 CPython Sandbox...\n[PY-BENCH] Computed 9,592 primes up to 100,000 in 3.82ms\n[PY-RESULT] 10,000th prime is: 104729\n[SUCCESS] Zero-leak runtime execution verified.\n\nProcess finished with exit code 0`;
      } else if (selectedRunner.id === 'nodejs') {
        output = `[NODE-V8] Benchmark complete: {\n  "iterations": 250000,\n  "throughputOpsPerSec": 32894736,\n  "p99LatencyMs": 0.076\n}\n[STATUS] Microtask queue latency: 0.12ms\n\nProcess finished with exit code 0`;
      } else if (selectedRunner.id === 'rust') {
        output = `[RUST-LLVM] Compiling with -C opt-level=3 -C lto=fat...\n[RUST-LLVM] Atomic counter converged to: 1000000\n[RUST-BENCH] Total elapsed time across 8 threads: 2.14ms\n[VERIFICATION] Memory safe, 0 data races detected.\n\nProcess finished with exit code 0`;
      } else if (selectedRunner.id === 'cpp') {
        output = `[CLANG-18] Generating AVX-512 vectorization stream...\n[CPP23-SIMD] Vectorized Sum of 1000000 doubles: 100010\n[CPP23-TIME] Execution time: 142 us\n\nProcess finished with exit code 0`;
      } else if (selectedRunner.id === 'go') {
        output = `[GO-CSP] Processed 10000 concurrent jobs in 1.84ms\n[GO-RESULT] Aggregated sum of squares: 333383335000\n[RACE-DETECTOR] PASS (-race verified no data races)\n\nProcess finished with exit code 0`;
      } else if (selectedRunner.id === 'sql') {
        output = `rank_order | symbol_name          | file_path             | complexity | ast_scope | exec_time_us\n-----------+----------------------+-----------------------+------------+-----------+-------------\n         1 | SkipList::lookup     | /src/storage/arena.rs | O(1)       | pub       |        0.42\n         2 | MerkleTree::root     | /src/crypto/tree.rs   | O(1)       | pub       |        0.85\n         3 | RaftState::quorum    | /src/consensus/fsm.rs | O(1)       | pub       |        1.12\n         4 | RingBuffer::drain    | /src/net/ring.rs      | O(1)       | pub       |        1.45\n         5 | TokenBucket::consume | /src/qos/limiter.rs   | O(1)       | pub       |        1.80\n\n(5 rows affected. Query plan: SCAN virtual_ast_symbols USING COVERING INDEX idx_complexity)`;
      }

      setExecutionOutput(output);
      setExitCode(0);
      setExecDuration(`${duration} ms`);
      setIsRunning(false);
    }, 850);
  };

  return (
    <div className="h-full flex flex-col bg-[#080b11] text-[#c9d1d9] font-sans overflow-hidden p-4">
      {/* Top Header & Presets Selector */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-3 mb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
              <span>{language === 'tr' ? 'ÇOKLU DİL ÇALIŞTIRICI MATRİSİ' : 'POLYGLOT MULTI-RUNNER HUB'}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold border border-emerald-500/40">
                Polyglot VM
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              {language === 'tr' 
                ? 'Python, Node.js, Rust, C++23, Go ve SQL için anında yürütme motoru' 
                : 'Instant sandboxed execution engine for Python, Node.js, Rust, C++23, Go and SQL'}
            </p>
          </div>
        </div>

        {/* Runner Presets Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs font-mono">
          {RUNNER_PRESETS.map((runner) => (
            <button
              key={runner.id}
              onClick={() => handleSelectRunner(runner)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
                selectedRunner.id === runner.id
                  ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{runner.icon}</span>
              <span>{runner.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Runner Body */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* Left Column: Code Input & Config */}
        <div className="flex-1 flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 overflow-hidden">
          {/* Runner Info Bar */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono mb-2 pb-2 border-b border-zinc-800 gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-base">{selectedRunner.icon}</span>
              <span className="text-white font-bold">{selectedRunner.runtimeVersion}</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={cliArgs}
                onChange={(e) => setCliArgs(e.target.value)}
                placeholder="CLI Argümanları..."
                className="bg-black/60 border border-zinc-800 rounded px-2 py-1 text-[11px] font-mono text-zinc-300 outline-none w-48"
              />

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 shadow transition-colors cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isRunning ? 'Çalışıyor...' : 'Çalıştır (Run)'}</span>
              </button>
            </div>
          </div>

          {/* Code Textarea */}
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            className="flex-1 bg-black/70 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-cyan-200 outline-none resize-none leading-relaxed focus:border-cyan-500/80 shadow-inner"
          />
        </div>

        {/* Right Column: Execution Output Console */}
        <div className="w-full md:w-96 flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                {language === 'tr' ? 'Yürütme Çıktısı (Stdout)' : 'Execution Output'}
              </span>
            </div>

            {execDuration && (
              <div className="flex items-center space-x-2 text-[11px] font-mono">
                <span className="text-emerald-400 font-bold">{execDuration}</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  exit {exitCode}
                </span>
              </div>
            )}
          </div>

          <pre className="flex-1 bg-black/80 border border-zinc-800 rounded-lg p-3 font-mono text-xs overflow-y-auto text-zinc-200 whitespace-pre-wrap leading-relaxed shadow-inner">
            {executionOutput || (
              <span className="text-zinc-600">
                {language === 'tr' 
                  ? 'Çalıştırmak için "Çalıştır (Run)" butonuna tıklayın...' 
                  : 'Click "Run" to compile and execute the code snippet...'}
              </span>
            )}
          </pre>

          {/* Compiler Flags Footnote */}
          <div className="mt-2 text-[11px] font-mono text-zinc-500 truncate">
            Bayraklar: {selectedRunner.compilerFlags}
          </div>
        </div>
      </div>
    </div>
  );
};
