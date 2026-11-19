export type Language = 
  | 'rust' 
  | 'typescript' 
  | 'python' 
  | 'go' 
  | 'cpp' 
  | 'zig' 
  | 'elixir' 
  | 'verilog' 
  | 'json' 
  | 'yaml' 
  | 'dockerfile' 
  | 'hcl' 
  | 'markdown'
  | 'assembly'
  | 'qasm';

export type AgentRole = 'architect' | 'security' | 'performance' | 'qa';

export interface ASTNode {
  id: string;
  type: 'Program' | 'Module' | 'Struct' | 'Class' | 'Function' | 'Method' | 'Interface' | 'Trait' | 'Variable' | 'Match' | 'Loop' | 'MemoryAlloc' | 'UnsafeBlock';
  name: string;
  lineStart: number;
  lineEnd: number;
  colStart: number;
  colEnd: number;
  scope: string;
  children?: ASTNode[];
  symbolRef?: string;
  complexity?: 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)' | 'O(2ⁿ)' | 'O(√N)' | 'O(N)' | string;
  memoryImpact?: string;
  safetyLevel?: 'verified_safe' | 'taint_monitored' | 'unsafe_memory' | 'unbounded_buffer';
}

export interface VirtualFile {
  path: string;
  name: string;
  language: Language;
  content: string;
  isManifest?: boolean;
  size: number;
  modifiedAt: string;
  astNodes: ASTNode[];
  symbolCount: number;
  complexityScore: string;
  testCoverage: number;
  isDirty?: boolean;
}

export interface SASTVulnerability {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  owaspCategory: string;
  ruleName: string;
  file: string;
  line: number;
  description: string;
  exploitVector: string;
  remediation: string;
  autoFixAvailable: boolean;
  status: 'OPEN' | 'PATCHED' | 'SUPPRESSED';
  patchCode?: string;
}

export interface PerformanceMetric {
  id: string;
  functionName: string;
  file: string;
  line: number;
  timeComplexity: string;
  spaceComplexity: string;
  latencyEstimateNs: number;
  memoryAllocBytes: number;
  hotSpotRating: 'OPTIMAL' | 'MODERATE' | 'CRITICAL';
  recommendation: string;
  allocPerCall: string;
}

export interface TestCase {
  id: string;
  name: string;
  type: 'unit' | 'property' | 'fuzz' | 'integration' | 'benchmark';
  status: 'pass' | 'fail' | 'running' | 'idle';
  durationMs: number;
  edgeCaseCovered: string;
  errorMsg?: string;
  expectedOutput?: string;
  actualOutput?: string;
}

export interface TestSuiteRun {
  id: string;
  suiteName: string;
  file: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  coveragePct: number;
  tests: TestCase[];
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'patch';
  message: string;
  detail?: string;
  targetFile?: string;
}

export interface AgentThreadState {
  role: AgentRole;
  name: string;
  title: string;
  avatarIcon: string;
  status: 'idle' | 'analyzing' | 'optimizing' | 'reviewing' | 'healed' | 'error';
  currentTask: string;
  progress: number;
  logHistory: AgentLogEntry[];
  metrics: {
    score: number;
    checksPassed: number;
    issuesFlagged: number;
    patchesApplied: number;
  };
}

export interface C4Component {
  id: string;
  name: string;
  tech: string;
  role: string;
  protocol: string;
  downstreamIds: string[];
  metrics?: { rps: number; latencyMs: number; errorRate: string };
}

export interface C4Layer {
  id: string;
  name: string;
  description: string;
  components: C4Component[];
}

export interface StateMachineTransition {
  from: string;
  to: string;
  event: string;
  guard?: string;
}

export interface C4ArchitectureModel {
  systemName: string;
  description: string;
  layers: C4Layer[];
  stateMachine: StateMachineTransition[];
  mermaidDiagram: string;
}

export interface DeploymentIaC {
  dockerfile: string;
  kubernetesYaml: string;
  helmValues: string;
  terraformHcl: string;
  githubActionsYaml: string;
  lspManifestJson: string;
}

export interface ExecutionFrame {
  frame: string;
  file: string;
  line: number;
  args: Record<string, string>;
}

export interface HeapObject {
  addr: string;
  type: string;
  value: string;
  sizeBytes: number;
  refs: number;
  isEscaped: boolean;
}

export interface ExecutionState {
  isRunning: boolean;
  isPaused: boolean;
  currentStep: number;
  maxSteps: number;
  instructionPointer: string;
  registers: Record<string, string>;
  callStack: ExecutionFrame[];
  heapObjects: HeapObject[];
  stdout: string[];
  exitCode: number | null;
}

export interface ProjectWorkspace {
  id: string;
  name: string;
  icon?: string;
  folderIcons?: Record<string, string>;
  tagline: string;
  paradigm: string;
  rootPath: string;
  primaryLanguage: Language;
  targetArch: string;
  files: VirtualFile[];
  folders?: string[];
  isLocalDisk?: boolean;
  dirHandle?: any;
  manifestFile: string;
  dependencies: Record<string, string>;
  architecture: C4ArchitectureModel;
  sastIssues: SASTVulnerability[];
  perfMetrics: PerformanceMetric[];
  testSuites: TestSuiteRun[];
  deployment: DeploymentIaC;
  memoryMetrics: {
    heapMb: number;
    stackKb: number;
    allocsPerSec: number;
    leaksDetected: number;
    gcPauseMs: number;
  };
}
