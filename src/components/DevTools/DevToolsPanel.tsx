import React, { useState } from 'react';
import { ProjectWorkspace } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';
import { 
  Terminal, 
  Activity, 
  Key, 
  Cpu, 
  Send, 
  Trash2, 
  Eye, 
  EyeOff, 
  Plus, 
  Check, 
  RefreshCw,
  HardDrive,
  Network,
  Zap,
  Sliders
} from 'lucide-react';

interface DevToolsPanelProps {
  workspace: ProjectWorkspace;
}

interface EnvVar {
  key: string;
  value: string;
  isSecret: boolean;
  showSecret: boolean;
}

interface NetworkCall {
  id: string;
  method: string;
  endpoint: string;
  status: number;
  durationMs: number;
  sizeKb: number;
  protocol: string;
  timestamp: string;
}

export const DevToolsPanel: React.FC<DevToolsPanelProps> = ({ workspace }) => {
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<'console' | 'network' | 'env' | 'metrics'>('console');
  
  // Console state
  const [consoleInput, setConsoleInput] = useState<string>('');
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: 'input' | 'output' | 'error'; text: string; time: string }>>([
    { type: 'output', text: 'ViraCode DevTools Kernel initialized v5.0.0 Enterprise.', time: '01:50:00' },
    { type: 'output', text: `Loaded workspace: ${workspace.name} (${workspace.files.length} active files)`, time: '01:50:02' },
    { type: 'output', text: 'Tip: Type JavaScript expressions or workspace inspect commands (e.g., 2 + 2, workspace.primaryLanguage, Math.PI)', time: '01:50:05' },
  ]);

  // Env variables state
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { key: 'GEMINI_API_KEY', value: 'AIzaSyA8...SAMPLE_INJECTED_KEY', isSecret: true, showSecret: false },
    { key: 'APP_URL', value: 'https://ais-dev-viracode-ide.run.app', isSecret: false, showSecret: true },
    { key: 'ENGINE_TARGET_ARCH', value: workspace.targetArch, isSecret: false, showSecret: true },
    { key: 'PORT', value: '3000', isSecret: false, showSecret: true },
    { key: 'NODE_ENV', value: 'development', isSecret: false, showSecret: true },
    { key: 'ZERO_TRUST_SPIFFE', value: 'spiffe://viracode.internal/ns/core', isSecret: true, showSecret: false },
  ]);
  const [newKey, setNewKey] = useState<string>('');
  const [newVal, setNewVal] = useState<string>('');

  // Simulated Network calls
  const [networkCalls, setNetworkCalls] = useState<NetworkCall[]>([
    { id: '1', method: 'TCP/RESP3', endpoint: 'stream://io-uring-listener:6379', status: 200, durationMs: 0.12, sizeKb: 1.4, protocol: 'RESP3', timestamp: '01:51:12' },
    { id: '2', method: 'gRPC', endpoint: '/raft.ConsensusService/AppendEntries', status: 200, durationMs: 1.45, sizeKb: 8.2, protocol: 'HTTP/2', timestamp: '01:51:14' },
    { id: '3', method: 'WAL', endpoint: 'disk://mmap-journal/segment-004', status: 200, durationMs: 0.08, sizeKb: 64.0, protocol: 'DirectIO', timestamp: '01:51:16' },
    { id: '4', method: 'HTTPS', endpoint: 'https://generativelanguage.googleapis.com/v1beta/models', status: 200, durationMs: 240, sizeKb: 14.8, protocol: 'HTTP/2 TLS', timestamp: '01:51:20' },
  ]);

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    const input = consoleInput.trim();
    const now = new Date().toLocaleTimeString();

    let output = '';
    let isErr = false;

    try {
      if (input === 'clear') {
        setConsoleLogs([]);
        setConsoleInput('');
        return;
      }

      if (input.startsWith('workspace.')) {
        const prop = input.replace('workspace.', '');
        output = JSON.stringify((workspace as any)[prop], null, 2) || 'undefined';
      } else {
        // Safe eval expression
        const fn = new Function('workspace', `try { return (${input}); } catch(e) { return e.toString(); }`);
        const res = fn(workspace);
        output = typeof res === 'object' ? JSON.stringify(res, null, 2) : String(res);
      }
    } catch (err: any) {
      isErr = true;
      output = err.message || 'Evaluation error';
    }

    setConsoleLogs((prev) => [
      ...prev,
      { type: 'input', text: `> ${input}`, time: now },
      { type: isErr ? 'error' : 'output', text: output, time: now },
    ]);
    setConsoleInput('');
  };

  const handleAddEnv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    setEnvVars((prev) => [
      ...prev,
      {
        key: newKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
        value: newVal.trim(),
        isSecret: newKey.includes('KEY') || newKey.includes('SECRET') || newKey.includes('TOKEN'),
        showSecret: false,
      },
    ]);
    setNewKey('');
    setNewVal('');
  };

  const handleDeleteEnv = (key: string) => {
    setEnvVars((prev) => prev.filter((ev) => ev.key !== key));
  };

  const toggleShowSecret = (key: string) => {
    setEnvVars((prev) =>
      prev.map((ev) => (ev.key === key ? { ...ev, showSecret: !ev.showSecret } : ev))
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] border border-zinc-800 rounded-lg overflow-hidden font-mono text-[10px]">
      {/* Header - Compact */}
      <div className="p-1.5 px-2 bg-[#080a0e] border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-zinc-100 text-[11px]">{t.devToolsTitle}</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950/40 text-red-300 border border-red-800/40">
            KERNEL v5.0.0
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-zinc-900 p-0.2 rounded border border-zinc-800 text-[10px]">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-2 py-0.5 rounded transition-colors flex items-center space-x-1 cursor-pointer ${
              activeTab === 'console' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-2.5 h-2.5" />
            <span>{t.consoleTab}</span>
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-2 py-0.5 rounded transition-colors flex items-center space-x-1 cursor-pointer ${
              activeTab === 'network' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Network className="w-2.5 h-2.5" />
            <span>{t.networkProfilerTab}</span>
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`px-2 py-0.5 rounded transition-colors flex items-center space-x-1 cursor-pointer ${
              activeTab === 'env' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key className="w-2.5 h-2.5" />
            <span>{t.envEditorTab}</span>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-2 py-0.5 rounded transition-colors flex items-center space-x-1 cursor-pointer ${
              activeTab === 'metrics' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-2.5 h-2.5" />
            <span>{t.codeMetricsTab}</span>
          </button>
        </div>
      </div>

      {/* Main DevTools Viewport */}
      <div className="flex-1 overflow-auto p-2 bg-[#06080c]">
        {/* CONSOLE (REPL) TAB */}
        {activeTab === 'console' && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 font-mono">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-2 leading-relaxed">
                  <span className="text-[10px] text-zinc-500 select-none">[{log.time}]</span>
                  <div className={`flex-1 whitespace-pre-wrap ${
                    log.type === 'input'
                      ? 'text-cyan-300 font-bold'
                      : log.type === 'error'
                      ? 'text-rose-400'
                      : 'text-zinc-300'
                  }`}>
                    {log.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleConsoleSubmit} className="mt-2 pt-2 border-t border-zinc-800 flex items-center space-x-2">
              <span className="text-cyan-400 font-bold select-none">js&gt;</span>
              <input
                type="text"
                value={consoleInput}
                onChange={(e) => setConsoleInput(e.target.value)}
                placeholder="2 + 2, workspace.files.length, Math.random()..."
                className="flex-1 bg-transparent text-zinc-100 outline-none text-xs font-mono placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => setConsoleLogs([])}
                className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                title="Clear"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold cursor-pointer"
              >
                Eval
              </button>
            </form>
          </div>
        )}

        {/* NETWORK PROFILER TAB */}
        {activeTab === 'network' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800 text-[11px] text-zinc-400">
              <span>ACTIVE RPC & SOCKET TELEMETRY</span>
              <span className="text-emerald-400">STATUS 200 OK</span>
            </div>

            <div className="space-y-2">
              {networkCalls.map((call) => (
                <div key={call.id} className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-purple-300 font-bold text-[10px]">
                      {call.method}
                    </span>
                    <span className="text-cyan-300 font-semibold">{call.endpoint}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-[11px] text-zinc-400">
                    <span className="text-emerald-400 font-bold">{call.status}</span>
                    <span>{call.durationMs}ms</span>
                    <span>{call.sizeKb} KB</span>
                    <span className="text-zinc-500">{call.protocol}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENV VARIABLES TAB */}
        {activeTab === 'env' && (
          <div className="space-y-4">
            <div className="text-[11px] text-zinc-400 pb-1 border-b border-zinc-800 flex items-center justify-between">
              <span>ENVIRONMENT SECRETS & RUNTIME CONFIG (.env)</span>
              <span className="text-amber-400">{envVars.length} Variables Loaded</span>
            </div>

            {/* Existing env vars */}
            <div className="space-y-2">
              {envVars.map((ev) => (
                <div key={ev.key} className="p-2 bg-zinc-900/70 border border-zinc-800 rounded flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-mono flex-1">
                    <span className="text-purple-400 font-bold">{ev.key}</span>
                    <span className="text-zinc-600">=</span>
                    <span className="text-emerald-300 truncate max-w-md">
                      {ev.isSecret && !ev.showSecret ? '••••••••••••••••••••••••' : ev.value}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {ev.isSecret && (
                      <button
                        onClick={() => toggleShowSecret(ev.key)}
                        className="p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                        title={ev.showSecret ? 'Hide' : 'Show'}
                      >
                        {ev.showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteEnv(ev.key)}
                      className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new env form */}
            <form onSubmit={handleAddEnv} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg flex items-center space-x-2">
              <input
                type="text"
                placeholder="VARIABLE_NAME"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-1/3 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 font-mono"
              />
              <span className="text-zinc-500">=</span>
              <input
                type="text"
                placeholder="value_or_secret"
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold cursor-pointer flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </form>
          </div>
        )}

        {/* SYSTEM METRICS TAB */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-lg space-y-1">
                <div className="text-zinc-500 text-[10px]">VIRTUAL HEAP</div>
                <div className="text-sm font-bold text-emerald-400">{workspace.memoryMetrics.heapMb} MB</div>
                <div className="text-[10px] text-zinc-400">0 Leaks Detected</div>
              </div>
              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-lg space-y-1">
                <div className="text-zinc-500 text-[10px]">ALLOCTS / SEC</div>
                <div className="text-sm font-bold text-amber-400">{workspace.memoryMetrics.allocsPerSec.toLocaleString()}</div>
                <div className="text-[10px] text-zinc-400">AVX-512 SIMD Arena</div>
              </div>
              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-lg space-y-1">
                <div className="text-zinc-500 text-[10px]">GC PAUSE DURATION</div>
                <div className="text-sm font-bold text-cyan-400">{workspace.memoryMetrics.gcPauseMs} ms</div>
                <div className="text-[10px] text-zinc-400">Real-Time Invariants</div>
              </div>
              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-lg space-y-1">
                <div className="text-zinc-500 text-[10px]">ACTIVE MODULES</div>
                <div className="text-sm font-bold text-purple-400">{workspace.files.length} Files</div>
                <div className="text-[10px] text-zinc-400">AST Synchronized</div>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg space-y-2 text-xs">
              <div className="text-zinc-400 font-semibold uppercase text-[11px]">System Invariants & Hardening State</div>
              <div className="grid grid-cols-2 gap-2 text-zinc-300">
                <div className="flex justify-between p-2 bg-zinc-900/80 rounded">
                  <span>Architecture Paradigm:</span>
                  <strong className="text-cyan-300">{workspace.paradigm}</strong>
                </div>
                <div className="flex justify-between p-2 bg-zinc-900/80 rounded">
                  <span>Target CPU Platform:</span>
                  <strong className="text-emerald-300">{workspace.targetArch}</strong>
                </div>
                <div className="flex justify-between p-2 bg-zinc-900/80 rounded">
                  <span>Primary Compiler:</span>
                  <strong className="text-purple-300">{workspace.primaryLanguage.toUpperCase()}</strong>
                </div>
                <div className="flex justify-between p-2 bg-zinc-900/80 rounded">
                  <span>Package Manifest:</span>
                  <strong className="text-amber-300">{workspace.manifestFile}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
