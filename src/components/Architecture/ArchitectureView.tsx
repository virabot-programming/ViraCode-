import React, { useState } from 'react';
import { C4ArchitectureModel, C4Component } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';
import { Building2, GitFork, Activity, ArrowRight, Copy, Check } from 'lucide-react';

interface ArchitectureViewProps {
  architecture: C4ArchitectureModel;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ architecture }) => {
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<'c4' | 'stateMachine' | 'mermaid'>('c4');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedComponent, setSelectedComponent] = useState<C4Component | null>(null);

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(architecture.mermaidDiagram);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-[#080a0e] border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-zinc-200">{t.architectureTitle}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 font-mono">
            {language === 'tr' ? 'BAŞ MİMAR İŞ PARÇACIĞI' : 'PRINCIPAL ARCHITECT THREAD'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab('c4')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'c4' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              C4 Containers
            </button>
            <button
              onClick={() => setActiveTab('stateMachine')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'stateMachine' ? 'bg-indigo-500/20 text-indigo-300 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {language === 'tr' ? 'Durum Makinesi' : 'State Machine'}
            </button>
            <button
              onClick={() => setActiveTab('mermaid')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'mermaid' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mermaid.js Spec
            </button>
          </div>

          <button
            onClick={handleCopyMermaid}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors flex items-center space-x-1"
            title="Copy Mermaid.js"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-mono">{language === 'tr' ? 'Dışa Aktar' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Content Viewport */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#0a0c10]">
        {activeTab === 'c4' && (
          <div className="space-y-6">
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <div className="text-sm font-bold text-zinc-100">{architecture.systemName}</div>
              <p className="text-xs text-zinc-400 mt-1">{architecture.description}</p>
            </div>

            {/* Architecture Layers */}
            <div className="space-y-5">
              {architecture.layers.map((layer, lIdx) => (
                <div key={layer.id} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">
                        {lIdx + 1}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">{layer.name}</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">{layer.description}</span>
                  </div>

                  {/* Components within this layer */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {layer.components.map((comp) => (
                      <div
                        key={comp.id}
                        onClick={() => setSelectedComponent(comp)}
                        className={`p-3.5 rounded-lg border transition-all cursor-pointer space-y-2 relative ${
                          selectedComponent?.id === comp.id
                            ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/50'
                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-cyan-300">{comp.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-purple-300">
                            {comp.tech}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-300 font-sans">{comp.role}</div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/50">
                          <span>Protocol: <strong className="text-zinc-300">{comp.protocol}</strong></span>
                          {comp.metrics && (
                            <span className="text-emerald-400 font-semibold">{comp.metrics.latencyMs}ms / {comp.metrics.rps} RPS</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stateMachine' && (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800">
              {t.stateTransitions} & Invariant Guards
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {architecture.stateMachine.map((trans, i) => (
                <div key={i} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="px-2 py-0.5 bg-zinc-800 rounded text-cyan-300 font-semibold">{trans.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="px-2 py-0.5 bg-zinc-800 rounded text-purple-300 font-semibold">{trans.to}</span>
                  </div>
                  <div className="text-xs text-zinc-300 font-mono">
                    Event: <span className="text-amber-300 font-semibold">{trans.event}</span>
                  </div>
                  {trans.guard && (
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Guard: <span className="text-emerald-300">{trans.guard}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mermaid' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800">
              Declarative Mermaid.js Topology Spec
            </div>
            <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
              {architecture.mermaidDiagram}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
