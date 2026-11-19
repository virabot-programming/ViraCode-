export type PluginCategory = 'system' | 'math' | 'explorer' | 'terminal' | 'runner' | 'custom' | 'devtools' | 'database';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  category: PluginCategory;
  author: string;
  icon: string; // Lucide icon name or emoji
  isEnabled: boolean;
  isBuiltin: boolean;
  isPinned?: boolean;
  tags: string[];
  installedAt: string;
  config?: Record<string, any>;
  customScript?: string;
  stats?: {
    runsCount: number;
    memoryMb: number;
    lastActive: string;
  };
}

export interface SystemProcess {
  pid: number;
  name: string;
  type: 'kernel' | 'agent' | 'runner' | 'ast' | 'ui';
  cpuPercent: number;
  memoryMb: number;
  threads: number;
  priority: 'low' | 'normal' | 'high' | 'realtime';
  status: 'RUNNING' | 'SLEEPING' | 'IDLE' | 'ZOMBIE';
}

export interface CoreMetric {
  coreId: number;
  load: number;
  frequencyGhz: number;
  temperatureC: number;
  cacheMisses: number;
}

export interface SystemMonitorState {
  cores: CoreMetric[];
  cpuTotal: number;
  ramUsedMb: number;
  ramTotalMb: number;
  ramHeapMb: number;
  ramWasmMb: number;
  ramBuffersMb: number;
  gcPauseMs: number;
  eventLoopLagMs: number;
  contextSwitchesPerSec: number;
  ioReadMbPerSec: number;
  ioWriteMbPerSec: number;
  netRxKbPerSec: number;
  netTxKbPerSec: number;
  processes: SystemProcess[];
}

export interface MathVariable {
  name: string;
  value: number | string;
  type: 'scalar' | 'vector' | 'matrix' | 'function';
}

export interface MathPlotPoint {
  x: number;
  y: number;
}

export interface PolyglotRunnerConfig {
  id: string;
  name: string;
  language: string;
  runtimeVersion: string;
  icon: string;
  extension: string;
  defaultCode: string;
  compilerFlags: string;
  sampleArgs: string;
  description: string;
}
