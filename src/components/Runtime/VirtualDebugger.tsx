import React, { useState, useEffect, useRef } from 'react';
import { ExecutionState, ProjectWorkspace } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';
import { 
  Play, 
  RotateCcw, 
  StepForward, 
  Terminal as TerminalIcon, 
  Trash2,
  Send,
  Cpu,
  Database,
  Layers
} from 'lucide-react';

interface VirtualDebuggerProps {
  workspace: ProjectWorkspace;
  onExecuteCommand: (cmd: string) => void;
  terminalLogs: string[];
  onClearLogs: () => void;
}

export const VirtualDebugger: React.FC<VirtualDebuggerProps> = ({
  workspace,
  onExecuteCommand,
  terminalLogs,
  onClearLogs
}) => {
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<'terminal' | 'registers' | 'heap' | 'stack'>('terminal');
  const [cliInput, setCliInput] = useState<string>('');
  const [execState, setExecState] = useState<ExecutionState>({
    isRunning: false,
    isPaused: true,
    currentStep: 1,
    maxSteps: 8,
    instructionPointer: '0x7fff5fbff840 <_start+0x24>',
    registers: {
      RAX: '0x0000000000000001',
      RBX: '0x00007ffd2e9b0420',
      RCX: '0x000000000000003f',
      RDX: '0x000055c91f034000',
      RSI: '0x0000000000000400',
      RDI: '0x00007f3c1a2e8000',
      RSP: '0x00007ffd2e9b03f0',
      RIP: '0x000055c91ef20184',
    },
    callStack: [
      { frame: 'main::entry()', file: '/src/main.rs', line: 18, args: { config: 'EngineConfig{...}' } },
      { frame: 'SlabArena::allocate_aligned()', file: '/src/storage/arena.rs', line: 34, args: { size: '64', align: '64' } },
      { frame: 'ConcurrentSkipList::insert_atomic()', file: '/src/storage/skiplist.rs', line: 64, args: { key: 'b"user:1001"', value: 'b"session_payload"' } },
    ],
    heapObjects: [
      { addr: '0x55c91f034000', type: 'SlabArena [64-byte aligned]', value: '536,870,912 bytes allocated', sizeBytes: 536870912, refs: 3, isEscaped: false },
      { addr: '0x55c91f034040', type: 'SkipList::Node<u8, u8>', value: '{ key_len: 9, height: 4 }', sizeBytes: 128, refs: 1, isEscaped: false },
      { addr: '0x55c91f0340c0', type: 'RaftState::TermVector', value: '[ term: 1, vote_count: 3 ]', sizeBytes: 64, refs: 2, isEscaped: false },
    ],
    stdout: [
      '🚀 [ViraCode IDE] Live Execution Runtime Ready (JS / TS / Python / Polyglot)',
    ],
    exitCode: null,
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs, execState.stdout]);

  const handleStep = () => {
    setExecState((prev) => {
      const nextStep = (prev.currentStep % prev.maxSteps) + 1;
      const stepLogs = [
        ...prev.stdout,
        `[STEP ${nextStep}] Executed instruction: MOVQ %rax, (%rdi) | Arena Offset += 64B`,
      ];
      return {
        ...prev,
        currentStep: nextStep,
        instructionPointer: `0x7fff5fbff8${40 + nextStep * 8} <worker_thread+0x${nextStep * 4}>`,
        stdout: stepLogs,
        registers: {
          ...prev.registers,
          RAX: `0x000000000000000${nextStep}`,
          RSP: `0x00007ffd2e9b03${(240 - nextStep * 8).toString(16)}`,
        },
      };
    });
  };

  const handleRun = () => {
    setExecState((prev) => ({ ...prev, isRunning: true, isPaused: false }));
    const interval = setInterval(() => {
      handleStep();
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      setExecState((prev) => ({
        ...prev,
        isRunning: false,
        isPaused: true,
      }));
    }, 2000);
  };

  const handleReset = () => {
    setExecState((prev) => ({
      ...prev,
      currentStep: 1,
      isPaused: true,
      isRunning: false,
      stdout: ['[Runtime reset to initial state]'],
    }));
  };

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    onExecuteCommand(cliInput.trim());
    setCliInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#080a0e] border border-red-950/80 rounded-lg overflow-hidden font-mono text-[10px]">
      {/* Top Toolbar - Icon Only Buttons */}
      <div className="px-1.5 py-0.5 bg-[#06080c] border-b border-red-950/80 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <TerminalIcon className="w-3.5 h-3.5 text-[#007acc]" />
          <span className="font-bold text-zinc-200 text-[10px] hidden sm:inline">{t.virtualDebuggerTitle}</span>
        </div>

        {/* Step Controls - Icon Only */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleRun}
            disabled={execState.isRunning}
            className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors cursor-pointer"
            title={execState.isRunning ? t.runningCodeBtn : t.runBtn}
            aria-label="Run"
          >
            <Play className={`w-3 h-3 ${execState.isRunning ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleStep}
            disabled={execState.isRunning}
            className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors cursor-pointer"
            title={t.stepOverBtn}
            aria-label="Step"
          >
            <StepForward className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors cursor-pointer"
            title={t.resetBtn}
            aria-label="Reset"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <div className="h-3 w-px bg-red-950 mx-0.5" />

          {/* Tab selector - Icon Only Buttons */}
          <div className="flex items-center bg-zinc-900 p-0.2 rounded border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('terminal')}
              className={`p-1 rounded transition-colors ${activeTab === 'terminal' ? 'bg-[#007acc] text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
              title={t.terminalTab}
              aria-label="Terminal"
            >
              <TerminalIcon className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('registers')}
              className={`p-1 rounded transition-colors ${activeTab === 'registers' ? 'bg-purple-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
              title={t.registersTab}
              aria-label="Registers"
            >
              <Cpu className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('heap')}
              className={`p-1 rounded transition-colors ${activeTab === 'heap' ? 'bg-amber-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
              title={t.heapTab}
              aria-label="Heap"
            >
              <Database className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stack')}
              className={`p-1 rounded transition-colors ${activeTab === 'stack' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
              title={t.callStackTab}
              aria-label="Stack"
            >
              <Layers className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Debugger Viewport */}
      <div className="flex-1 overflow-y-auto p-1.5 bg-[#06080c]">
        {activeTab === 'terminal' && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-1 overflow-y-auto flex-1 pr-1 text-[10px]">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="text-zinc-300 leading-snug font-mono">
                  {log.startsWith('>') ? (
                    <span className="text-[#007acc] font-bold">{log}</span>
                  ) : log.includes('ERR') || log.includes('error') || log.includes('❌') ? (
                    <span className="text-rose-400 font-bold">{log}</span>
                  ) : log.includes('SUCCESS') || log.includes('✨') || log.includes('pass') || log.includes('✅') ? (
                    <span className="text-emerald-400">{log}</span>
                  ) : log.includes('⚡') || log.includes('🚀') ? (
                    <span className="text-purple-300">{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))}
              {execState.stdout.map((out, idx) => (
                <div key={`out-${idx}`} className="text-zinc-400 font-mono leading-snug">
                  {out}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>

            {/* CLI REPL Input Bar - Icon Only Submit */}
            <form onSubmit={handleCliSubmit} className="mt-1 flex items-center space-x-1.5 pt-1 border-t border-red-950/80">
              <span className="text-red-400 font-bold select-none text-[10px]">vira-sh&gt;</span>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder={t.terminalPlaceholder}
                className="flex-1 bg-transparent text-zinc-200 outline-none text-[10px] font-mono placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={onClearLogs}
                className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title={t.clearLogsBtn}
                aria-label="Clear Logs"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <button
                type="submit"
                className="p-1 bg-[#007acc] hover:bg-blue-600 text-white rounded cursor-pointer"
                title={t.sendBtn}
                aria-label="Send Command"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}

        {activeTab === 'registers' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 text-[10px] font-mono">
            {Object.entries(execState.registers).map(([reg, val]) => (
              <div key={reg} className="p-1.5 bg-[#0e131f] border border-zinc-800 rounded flex flex-col">
                <span className="text-cyan-400 font-bold">{reg}</span>
                <span className="text-zinc-300 truncate">{val}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'heap' && (
          <div className="space-y-1 p-1 text-[10px] font-mono">
            {execState.heapObjects.map((obj, i) => (
              <div key={i} className="p-1.5 bg-[#0e131f] border border-zinc-800 rounded flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-purple-400 font-bold">{obj.type} @ {obj.addr}</span>
                  <span className="text-zinc-400">{obj.value}</span>
                </div>
                <span className="text-emerald-400 font-bold">{obj.sizeBytes} B</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stack' && (
          <div className="space-y-1 p-1 text-[10px] font-mono">
            {execState.callStack.map((frame, i) => (
              <div key={i} className="p-1.5 bg-[#0e131f] border border-zinc-800 rounded flex justify-between items-center">
                <span className="text-emerald-400 font-bold">#{i} {frame.frame}</span>
                <span className="text-zinc-500">{frame.file}:{frame.line}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
