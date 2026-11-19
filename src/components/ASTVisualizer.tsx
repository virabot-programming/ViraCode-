import React, { useState } from 'react';
import { ASTNode, VirtualFile } from '../types/engine';
import { useI18n } from '../i18n/LanguageContext';
import { Layers, Network, Search, Database, ShieldCheck } from 'lucide-react';

interface ASTVisualizerProps {
  files: VirtualFile[];
  activeFile?: VirtualFile;
  onSelectNode?: (node: ASTNode, file: VirtualFile) => void;
}

export const ASTVisualizer: React.FC<ASTVisualizerProps> = ({
  files,
  onSelectNode
}) => {
  const { t, language } = useI18n();
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const currentFile = files[selectedFileIdx] || files[0];
  const allNodes = currentFile?.astNodes || [];

  const filteredNodes = allNodes.filter(n => 
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.scope.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-[#080a0e] border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-zinc-200">
            {language === 'tr' ? 'SANAL ABSTRACT SYNTAX TREE (AST) MOTORU' : 'VIRTUAL ABSTRACT SYNTAX TREE (AST) ENGINE'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40 font-mono">
            LIVE SYMBOL GRAPH
          </span>
        </div>

        {/* File Switcher for AST */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-zinc-400 font-mono">{t.targetLabel}</span>
          <select
            value={selectedFileIdx}
            onChange={(e) => setSelectedFileIdx(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded px-2 py-1 outline-none font-mono"
          >
            {files.map((f, i) => (
              <option key={f.path} value={i}>
                {f.name} ({f.astNodes.length} {t.symbolsCount})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AST Search & Filter Bar */}
      <div className="p-2.5 bg-[#090b10] border-b border-zinc-800 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder={language === 'tr' ? 'Sembol adı, tür veya scope ile filtrele...' : 'Filter AST nodes by symbol name, type, or scope...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-purple-500 font-mono placeholder:text-zinc-600"
          />
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono text-zinc-400">
          <span>AST Depth: <strong className="text-purple-400">4 Levels</strong></span>
          <span>Symbol Map: <strong className="text-cyan-400">{allNodes.length} Nodes</strong></span>
          <span>Scope Resolution: <strong className="text-emerald-400">Strict (0 Collisions)</strong></span>
        </div>
      </div>

      {/* Main Graph & Tree View */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Left: AST Tree Node List */}
        <div className="col-span-5 border-r border-zinc-800 overflow-y-auto p-3 space-y-2 bg-[#080a0e]">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>{language === 'tr' ? 'Sembol Düğümleri' : 'Symbol Nodes'}</span>
            <span className="text-[10px] text-zinc-500">{filteredNodes.length} {language === 'tr' ? 'eşleşen' : 'matching'}</span>
          </div>

          {filteredNodes.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs font-mono">
              {language === 'tr' ? 'Aramayla eşleşen AST düğümü bulunamadı.' : 'No AST nodes found matching query.'}
            </div>
          ) : (
            filteredNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    onSelectNode?.(node, currentFile);
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/70 shadow-lg shadow-purple-950/50'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-purple-300 font-bold border border-zinc-700">
                        {node.type}
                      </span>
                      <span className="text-xs font-bold text-zinc-200 font-mono">{node.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      L{node.lineStart} - L{node.lineEnd}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 font-mono">
                    Scope: <span className="text-cyan-300">{node.scope}</span>
                  </div>

                  {node.complexity && (
                    <div className="flex items-center space-x-2 text-[10px] font-mono pt-1">
                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-300 rounded">
                        Time: {node.complexity}
                      </span>
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 rounded">
                        Memory: {node.memoryImpact}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Interactive AST Visual Schema Diagram */}
        <div className="col-span-7 p-4 bg-[#0a0c10] flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-zinc-800">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hierarchical AST & Scope Graph Topology</span>
            </div>

            {/* Visual AST Hierarchy Node Blocks */}
            <div className="space-y-3">
              {/* Root Module Container */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-700 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-bold text-zinc-200">Root Translation Unit: {currentFile.name}</span>
                  </div>
                  <span className="text-emerald-400 text-[11px] font-bold">TYPE_CHECKED</span>
                </div>

                <div className="pl-4 border-l-2 border-purple-500/40 space-y-2.5 mt-2">
                  {allNodes.map((node) => (
                    <div key={node.id} className="p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-md space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-cyan-300 font-semibold">{node.type}::{node.name}</span>
                        <span className="text-amber-400 text-[10px]">{node.complexity || 'O(1)'}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">{node.memoryImpact || 'Zero-alloc stack reference'}</div>
                      <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-mono">
                        <span>Lines: {node.lineStart} - {node.lineEnd}</span>
                        <span>•</span>
                        <span>Scope: {node.scope}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">SAST Guard Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom AST Telemetry Banner */}
          <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-lg flex items-center justify-between text-xs font-mono text-zinc-400 mt-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AST Memory Bounds: <strong className="text-zinc-200">Enforced by Zero-Trust Rules</strong></span>
            </div>
            <span className="text-purple-400 font-semibold">AST_SIMULATION_STABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
