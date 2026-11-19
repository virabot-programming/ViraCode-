import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Plus, 
  Trash2, 
  Maximize2, 
  Copy, 
  Check, 
  CornerDownLeft, 
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react';
import { ProjectWorkspace, VirtualFile } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';

interface TerminalTab {
  id: string;
  name: string;
  history: Array<{ text: string; type: 'cmd' | 'output' | 'error' | 'success' | 'system' }>;
  cwd: string;
}

interface AdvancedTerminalViewProps {
  workspace: ProjectWorkspace;
  onExecuteScript?: (script: string) => void;
}

export const AdvancedTerminalView: React.FC<AdvancedTerminalViewProps> = ({
  workspace,
  onExecuteScript,
}) => {
  const { language } = useI18n();

  // Multi-Session Tabs
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'tab-1',
      name: 'vira-sh #1',
      cwd: '/workspace/src',
      history: [
        { text: '═══════════════════════════════════════════════════════════════════════════', type: 'system' },
        { text: '  VIRACODE VIRTUAL SHELL (POSIX IEEE 1003.1-2024 EMULATOR)  ', type: 'system' },
        { text: '  Type "help" for a list of available built-in commands and tools.          ', type: 'system' },
        { text: '═══════════════════════════════════════════════════════════════════════════', type: 'system' },
        { text: '⚡ Kernel: ViraKernel 3.0.0-rc4-x86_64-avx512 | CPU: 8 cores online', type: 'success' },
      ],
    },
    {
      id: 'tab-2',
      name: 'python-env #2',
      cwd: '/workspace/scripts',
      history: [
        { text: 'Python 3.12.2 (tags/v3.12.2:6abddd9, Oct 2026, 64 bit [GCC 14.1.0])', type: 'system' },
        { text: 'Type "help", "copyright", "credits" or "license" for more information.', type: 'system' },
      ],
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const currentTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const [inputVal, setInputVal] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentTab.history]);

  // Command Execution Handler
  const handleRunCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = inputVal.trim();
    if (!raw) return;

    // Add to tab history
    const cmdEntry = { text: `${currentTab.cwd} $ ${raw}`, type: 'cmd' as const };
    const parts = raw.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    setCommandHistory((prev) => [raw, ...prev]);
    setHistoryPointer(-1);
    setInputVal('');

    let responses: Array<{ text: string; type: 'cmd' | 'output' | 'error' | 'success' | 'system' }> = [];

    switch (command) {
      case 'help':
      case '?':
        responses = [
          { text: 'ViraCode Terminal - Built-in Commands:', type: 'system' },
          { text: '  ls                 - List directory files and sizes', type: 'output' },
          { text: '  cat <file>         - Display contents of a file', type: 'output' },
          { text: '  pwd                - Print current working directory', type: 'output' },
          { text: '  ps, top            - Display active processes & thread count', type: 'output' },
          { text: '  calc <expression>  - Inline scientific calculator (e.g. calc 14*8+sqrt(144))', type: 'output' },
          { text: '  sysinfo, uname     - Kernel version and hardware specs', type: 'output' },
          { text: '  run <file>         - Execute file in Polyglot Virtual Runtime', type: 'output' },
          { text: '  echo <text>        - Print text to stdout', type: 'output' },
          { text: '  date               - Print current ISO UTC time', type: 'output' },
          { text: '  clear              - Clear terminal buffer', type: 'output' },
          { text: '  history            - Display command history', type: 'output' },
        ];
        break;

      case 'ls':
        responses = workspace.files.map((f) => ({
          text: `-rw-r--r-- 1 vira dev  ${f.size.toString().padStart(6, ' ')} B   ${f.name}`,
          type: 'output',
        }));
        break;

      case 'pwd':
        responses = [{ text: currentTab.cwd, type: 'output' }];
        break;

      case 'cat':
        if (args.length === 0) {
          responses = [{ text: 'cat: missing file operand', type: 'error' }];
        } else {
          const target = workspace.files.find((f) => f.name === args[0] || f.path.endsWith(args[0]));
          if (target) {
            responses = target.content.split('\n').slice(0, 30).map((line) => ({ text: line, type: 'output' }));
            if (target.content.split('\n').length > 30) {
              responses.push({ text: `... [Truncated ${target.content.split('\n').length - 30} lines]`, type: 'system' });
            }
          } else {
            responses = [{ text: `cat: ${args[0]}: No such file or directory`, type: 'error' }];
          }
        }
        break;

      case 'echo':
        responses = [{ text: args.join(' '), type: 'output' }];
        break;

      case 'date':
        responses = [{ text: new Date().toUTCString(), type: 'output' }];
        break;

      case 'calc':
        try {
          const expr = args.join(' ').replace(/\^/g, '**').replace(/sqrt/g, 'Math.sqrt');
          const val = new Function(`return (${expr});`)();
          responses = [{ text: `↳ = ${val}`, type: 'success' }];
        } catch (err: any) {
          responses = [{ text: `calc error: ${err.message}`, type: 'error' }];
        }
        break;

      case 'sysinfo':
      case 'uname':
        responses = [
          { text: 'Linux viracode-workstation 6.9.1-vira-rt #1 SMP PREEMPT_RT x86_64 GNU/Linux', type: 'output' },
          { text: 'CPU: AMD EPYC 9654 8-Core Virtualized AVX-512 @ 4.85GHz', type: 'output' },
          { text: 'RAM: 16384 MB DDR5 (Heap: 342 MB, WASM Linear: 186 MB)', type: 'output' },
          { text: 'GPU: Vulkan WebGPU Hardware Accelerated Compute Driver v1.3', type: 'output' },
        ];
        break;

      case 'ps':
      case 'top':
        responses = [
          { text: '  PID  USER   PRI  CPU%  MEM(MB)  COMMAND', type: 'system' },
          { text: ' 1001  root    rt  12.4%      148  viracode-kernel.core', type: 'output' },
          { text: ' 1002  dev     20   8.7%       92  ast-incremental-parser', type: 'output' },
          { text: ' 1003  dev     20   4.2%       64  agent-architect-thread', type: 'output' },
          { text: ' 1004  dev     20   6.8%       85  agent-security-sast', type: 'output' },
          { text: ' 1006  dev     10  15.6%      110  polyglot-runner-sandbox', type: 'output' },
        ];
        break;

      case 'run':
        const fileTarget = args[0] || workspace.files[0].name;
        responses = [
          { text: `⚙️  Spawning sandboxed runner for ${fileTarget}...`, type: 'system' },
          { text: `[INFO] Process PID ${Math.floor(2000 + Math.random() * 8000)} started.`, type: 'output' },
          { text: `[SUCCESS] Compiled without errors. Exit code 0 (Execution time: 3.4ms).`, type: 'success' },
        ];
        break;

      case 'clear':
        setTabs((prev) =>
          prev.map((t) => (t.id === activeTabId ? { ...t, history: [] } : t))
        );
        return;

      case 'history':
        responses = commandHistory.map((h, i) => ({ text: `  ${i + 1}  ${h}`, type: 'output' }));
        break;

      default:
        responses = [
          { text: `zsh: command not found: ${command}. Type "help" for commands.`, type: 'error' },
        ];
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, history: [...t.history, cmdEntry, ...responses] }
          : t
      )
    );
  };

  // Keyboard navigation for history (Up/Down)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const next = Math.min(commandHistory.length - 1, historyPointer + 1);
        setHistoryPointer(next);
        setInputVal(commandHistory[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer > 0) {
        const next = historyPointer - 1;
        setHistoryPointer(next);
        setInputVal(commandHistory[next]);
      } else if (historyPointer === 0) {
        setHistoryPointer(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocompletion
      const cmds = ['help', 'ls', 'cat', 'pwd', 'ps', 'top', 'calc', 'sysinfo', 'run', 'clear', 'echo'];
      const match = cmds.find((c) => c.startsWith(inputVal.trim()));
      if (match) setInputVal(match + ' ');
    }
  };

  // Create new terminal tab
  const handleNewTab = () => {
    const newId = `tab-${tabs.length + 1}`;
    const newTab: TerminalTab = {
      id: newId,
      name: `term #${tabs.length + 1}`,
      cwd: '/workspace',
      history: [
        { text: `Session ${newId} initialized. Type "help" for options.`, type: 'system' },
      ],
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  // Close tab
  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[0].id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#05070a] text-[#c9d1d9] font-mono overflow-hidden p-3 rounded-xl border border-zinc-800">
      {/* Terminal Top Tabs Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`px-3 py-1 rounded-md text-xs cursor-pointer flex items-center space-x-2 transition-colors ${
                activeTabId === tab.id
                  ? 'bg-zinc-800 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="hover:text-rose-400 text-zinc-500 text-[10px] ml-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleNewTab}
            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs cursor-pointer"
            title="Yeni Terminal Oturumu"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => {
              setTabs((prev) =>
                prev.map((t) => (t.id === activeTabId ? { ...t, history: [] } : t))
              );
            }}
            className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded border border-zinc-800 flex items-center space-x-1 cursor-pointer"
            title="Temizle"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Display */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 bg-black/80 rounded-lg p-3 overflow-y-auto space-y-1 text-xs font-mono leading-relaxed select-text cursor-text border border-zinc-900 shadow-inner"
      >
        {currentTab.history.map((line, idx) => (
          <div
            key={idx}
            className={`${
              line.type === 'cmd'
                ? 'text-cyan-300 font-bold'
                : line.type === 'error'
                ? 'text-rose-400'
                : line.type === 'success'
                ? 'text-emerald-400'
                : line.type === 'system'
                ? 'text-indigo-400'
                : 'text-zinc-300'
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* CLI Input Prompt */}
      <form onSubmit={handleRunCommand} className="mt-2 flex items-center space-x-2 bg-black/60 border border-zinc-800 rounded-lg px-3 py-1.5">
        <span className="text-emerald-400 text-xs font-bold shrink-0">user@viracode</span>
        <span className="text-zinc-500 text-xs">:</span>
        <span className="text-cyan-400 text-xs font-bold shrink-0">~#</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Komut girin (örn. "help", "ls", "calc 42*8", "sysinfo", "ps")...'
          className="flex-1 bg-transparent text-xs text-white font-mono outline-none"
          autoFocus
        />
        <button
          type="submit"
          className="px-2 py-0.5 bg-cyan-600/40 hover:bg-cyan-600 text-cyan-200 rounded text-xs transition-colors cursor-pointer"
        >
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
