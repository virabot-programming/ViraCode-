import React from 'react';
import { AgentThreadState, AgentRole } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';
import { 
  Building2, 
  ShieldCheck, 
  Zap, 
  FlaskConical, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  Terminal,
  ArrowRight
} from 'lucide-react';

interface MultiAgentHUDProps {
  agents: Record<AgentRole, AgentThreadState>;
  onTriggerSelfHealing: (role?: AgentRole) => void;
  isOrchestrating: boolean;
  onSelectAgent?: (role: AgentRole) => void;
  selectedAgent?: AgentRole;
}

export const MultiAgentHUD: React.FC<MultiAgentHUDProps> = ({
  agents,
  onTriggerSelfHealing,
  isOrchestrating,
  onSelectAgent,
  selectedAgent = 'architect'
}) => {
  const { t, language } = useI18n();

  const getAgentIcon = (role: AgentRole) => {
    switch (role) {
      case 'architect':
        return <Building2 className="w-4 h-4 text-cyan-400" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-rose-400" />;
      case 'performance':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'qa':
        return <FlaskConical className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getAgentColor = (role: AgentRole) => {
    switch (role) {
      case 'architect': return 'border-cyan-500/40 bg-cyan-950/20';
      case 'security': return 'border-rose-500/40 bg-rose-950/20';
      case 'performance': return 'border-amber-500/40 bg-amber-950/20';
      case 'qa': return 'border-emerald-500/40 bg-emerald-950/20';
    }
  };

  const getAgentLocalizedName = (role: AgentRole) => {
    switch (role) {
      case 'architect': return t.agentArchitect;
      case 'security': return t.agentSecurity;
      case 'performance': return t.agentPerformance;
      case 'qa': return t.agentQa;
    }
  };

  const getAgentLocalizedTitle = (role: AgentRole) => {
    switch (role) {
      case 'architect': return t.architectTitle;
      case 'security': return t.securityTitle;
      case 'performance': return t.performanceTitle;
      case 'qa': return t.qaTitle;
    }
  };

  const activeAgentData = agents[selectedAgent];

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-zinc-800 rounded-lg overflow-hidden">
      {/* HUD Header */}
      <div className="p-3 bg-[#080a0e] border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/40 rounded text-indigo-300 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>{language === 'tr' ? '4-İŞ PARÇACIKLI OTONOM KONSENSÜS ÇALIŞMA ZAMANI' : '4-THREAD AUTONOMOUS CONSENSUS RUNTIME'}</span>
          </div>
          <span className="text-zinc-500 text-xs font-mono">ViraCode IDE Core</span>
        </div>

        <button
          onClick={() => onTriggerSelfHealing()}
          disabled={isOrchestrating}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-lg transition-all ${
            isOrchestrating
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-indigo-900/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{isOrchestrating ? (language === 'tr' ? 'Ajanlar Müzakere Ediyor...' : 'Agents Deliberating...') : t.runConsensusBtn}</span>
        </button>
      </div>

      {/* 4 Agent Cards Grid */}
      <div className="grid grid-cols-4 gap-2 p-2 bg-[#090b10] border-b border-zinc-800">
        {(['architect', 'security', 'performance', 'qa'] as AgentRole[]).map((role) => {
          const agent = agents[role];
          const isSelected = selectedAgent === role;

          return (
            <button
              key={role}
              onClick={() => onSelectAgent?.(role)}
              className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected ? `${getAgentColor(role)} ring-1 ring-white/20` : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center space-x-1.5">
                  {getAgentIcon(role)}
                  <span className="text-xs font-bold text-zinc-200">{getAgentLocalizedName(role)}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {agent.metrics.score}%
                </span>
              </div>

              <div className="text-[11px] text-zinc-400 truncate mb-1">{getAgentLocalizedTitle(role)}</div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-300 ${
                    role === 'architect'
                      ? 'bg-cyan-400'
                      : role === 'security'
                      ? 'bg-rose-400'
                      : role === 'performance'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Agent Detail & Execution Stream */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Agent Invariants & Metrics */}
        <div className="w-72 border-r border-zinc-800 p-3 space-y-3 bg-[#0a0c10] overflow-y-auto">
          <div className="flex items-center space-x-2">
            {getAgentIcon(selectedAgent)}
            <div>
              <div className="text-xs font-bold text-zinc-200">{getAgentLocalizedName(selectedAgent)}</div>
              <div className="text-[10px] text-zinc-400">{getAgentLocalizedTitle(selectedAgent)}</div>
            </div>
          </div>

          <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-2 text-xs font-mono">
            <div className="text-zinc-400 font-sans text-[11px] uppercase font-semibold">
              {language === 'tr' ? 'Aktif Ajan Metrikleri' : 'Active Agent Metrics'}
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{language === 'tr' ? 'Sağlık Skoru:' : 'Health Score:'}</span>
              <span className="text-emerald-400 font-bold">{activeAgentData.metrics.score}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{t.checksPassed}:</span>
              <span className="text-cyan-400">{activeAgentData.metrics.checksPassed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{t.issuesFlagged}:</span>
              <span className="text-amber-400">{activeAgentData.metrics.issuesFlagged}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{t.patchesApplied}:</span>
              <span className="text-purple-400">{activeAgentData.metrics.patchesApplied}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-sans font-semibold uppercase text-zinc-400">
              {language === 'tr' ? 'Ajan Görevi' : 'Agent Mandate'}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {selectedAgent === 'architect' && (language === 'tr' ? 'SOLID prensiplerini, Hekzagonal etki alanı ayrımını ve C4 sistem sınırı senkronizasyonunu denetler.' : 'Enforces SOLID invariants, Hexagonal domain decoupling, and C4 system boundary synchronization.')}
              {selectedAgent === 'security' && (language === 'tr' ? 'Sürekli SAST taint analizi, zero-trust token doğrulaması ve bellek güvenliği denetimleri yürütür.' : 'Executes continuous SAST taint analysis, zero-trust token attestation, and memory safety audits.')}
              {selectedAgent === 'performance' && (language === 'tr' ? 'Zaman/alan karmaşıklığını O(1) hedefine doğru optimize eder ve false-sharing önbellek duraklamalarını ortadan kaldırır.' : 'Optimizes space/time complexity toward O(1) and eliminates false sharing cacheline stalls.')}
              {selectedAgent === 'qa' && (language === 'tr' ? 'Değişmezlik property testlerini, fuzz mutasyonlarını sentezler ve kendini onaran regresyon paketlerini otomatik çalıştırır.' : 'Synthesizes invariant proptests, fuzz mutations, and auto-executes self-healing regression suites.')}
            </p>
          </div>

          <button
            onClick={() => onTriggerSelfHealing(selectedAgent)}
            className="w-full py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-medium flex items-center justify-center space-x-1 transition-colors border border-zinc-700"
          >
            <span>{language === 'tr' ? `${getAgentLocalizedName(selectedAgent)} Rutinini Koş` : `Run ${getAgentLocalizedName(selectedAgent)} Routine`}</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
          </button>
        </div>

        {/* Right Side: Agent Live Thought & Thought-Log Stream */}
        <div className="flex-1 flex flex-col bg-[#090b10] overflow-hidden">
          <div className="p-2.5 bg-[#080a0e] border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'tr' ? 'CANLI OTONOM YÜRÜTME GÜNLÜĞÜ' : 'LIVE AUTONOMOUS EXECUTION LOGS'}</span>
            </div>
            <span className="text-[10px] text-emerald-400">{language === 'tr' ? 'AKIŞ AKTİF' : 'STREAMING ACTIVE'}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
            {activeAgentData.logHistory.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded border flex items-start space-x-2 ${
                  log.level === 'patch'
                    ? 'bg-purple-950/30 border-purple-800/40 text-purple-200'
                    : log.level === 'success'
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                    : log.level === 'warn'
                    ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                    : log.level === 'error'
                    ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                    : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-300'
                }`}
              >
                <span className="text-[10px] text-zinc-500 shrink-0 select-none">[{log.timestamp}]</span>
                <span className="shrink-0">
                  {log.level === 'patch' && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                  {log.level === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {log.level === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  {log.level === 'info' && <span className="text-cyan-400">ℹ</span>}
                </span>
                <div className="flex-1">
                  <div>{log.message}</div>
                  {log.detail && <div className="text-[11px] text-zinc-400 mt-1">{log.detail}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
