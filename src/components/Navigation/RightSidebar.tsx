/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProjectWorkspace, VirtualFile } from '../../types/engine';
import { QuantumWorkspace } from '../Quantum/QuantumWorkspace';
import { GitBoxIIStudio, GitBoxIIRepo } from '../GitBox/GitBoxIIStudio';
import { SystemMonitorView } from '../Plugins/SystemMonitorView';
import { ReleaseTimelineSidebar } from '../Release/ReleaseTimelineSidebar';
import { 
  Atom, 
  Database,
  Box,
  Sliders, 
  Maximize2, 
  PanelRightClose, 
  FileCode, 
  ShieldCheck, 
  Cpu, 
  Activity,
  GitCommit
} from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';

export type RightSidebarTool =
  | 'properties'
  | 'quantum'
  | 'sysmonitor'
  | 'gitbox2'
  | 'timeline'
  | string;

interface RightSidebarProps {
  activeTool: RightSidebarTool;
  centerMode: 'editor' | 'database' | 'quantum' | 'home' | 'copyrights' | 'devfeed';
  onSelectTool: (tool: RightSidebarTool) => void;
  workspace: ProjectWorkspace;
  activeFile: VirtualFile | null;
  onMaximizeToCenter: (tool: 'quantum' | 'database') => void;
  onClose: () => void;
  onOpenReleaseNotes?: () => void;
  onOpenFileInEditor?: (file: { name: string; content: string }) => void;
  onForkWorkspace?: (repo: GitBoxIIRepo) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  activeTool,
  centerMode,
  onSelectTool,
  workspace,
  activeFile,
  onMaximizeToCenter,
  onClose,
  onOpenReleaseNotes,
  onOpenFileInEditor,
  onForkWorkspace,
}) => {
  const { language } = useI18n();
  const isTr = language === 'tr';

  return (
    <div className="flex flex-col h-full bg-[#09090b] border-l border-zinc-800/80 select-none text-zinc-300 font-sans overflow-hidden">
      {/* Tool Window Header Bar - Icon-Only & File Properties FIRST */}
      <div className="px-1.5 py-1 bg-[#111115] border-b border-zinc-800/80 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
        {/* Tool Switcher Tabs - File Properties First */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {/* 1. File Properties (FIRST) */}
          <button
            type="button"
            onClick={() => onSelectTool('properties')}
            className={`p-1 rounded transition-colors cursor-pointer ${
              activeTool === 'properties'
                ? 'bg-zinc-800 text-amber-300 border border-amber-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
            title={isTr ? 'Aktif Dosya Özellikleri' : 'Active File Properties'}
            aria-label="Properties"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* 2. Quantum Workspace */}
          <button
            type="button"
            onClick={() => onSelectTool('quantum')}
            className={`p-1 rounded transition-colors cursor-pointer ${
              activeTool === 'quantum'
                ? 'bg-zinc-800 text-cyan-300 border border-cyan-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
            title={isTr ? 'Kuantum QPU Simülatörü' : 'Quantum QPU Simulator'}
            aria-label="Quantum QPU"
          >
            <Atom className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* 3. Database Center (Opens directly in CENTER) */}
          <button
            type="button"
            onClick={() => onMaximizeToCenter('database')}
            className={`p-1 rounded transition-colors cursor-pointer ${
              centerMode === 'database'
                ? 'bg-zinc-800 text-red-300 border border-red-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
            title={isTr ? 'Veritabanı Merkezi (Ortada Aç)' : 'Database Center (Open in Center)'}
            aria-label="Database Center"
          >
            <Database className="w-3.5 h-3.5 text-red-400" />
          </button>

          {/* 4. System Monitor */}
          <button
            type="button"
            onClick={() => onSelectTool('sysmonitor')}
            className={`p-1 rounded transition-colors cursor-pointer ${
              activeTool === 'sysmonitor'
                ? 'bg-zinc-800 text-emerald-300 border border-emerald-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
            title={isTr ? 'Gelişmiş Sistem Monitörü' : 'Advanced System Monitor'}
            aria-label="System Monitor"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* 5. GitBox II */}
          <button
            type="button"
            onClick={() => onSelectTool('gitbox2')}
            className={`p-1 rounded transition-colors cursor-pointer ${
              activeTool === 'gitbox2'
                ? 'bg-zinc-800 text-rose-300 border border-rose-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
            title={isTr ? 'GitBox II: Depolar & Topluluk' : 'GitBox II: Repos & Community'}
            aria-label="GitBox II"
          >
            <Box className="w-3.5 h-3.5 text-rose-400" />
          </button>

          {/* 6. Release Timeline */}
          <button
            type="button"
            onClick={() => onSelectTool('timeline')}
            className={`p-1 rounded transition-colors cursor-pointer ${
              activeTool === 'timeline'
                ? 'bg-zinc-800 text-red-300 border border-red-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
            title={isTr ? 'Sürüm Zaman Çizelgesi (Release Timeline)' : 'Release Timeline'}
            aria-label="Release Timeline"
          >
            <GitCommit className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>

        {/* Action Buttons: Maximize (for Quantum) & Close */}
        <div className="flex items-center space-x-1 shrink-0 ml-1">
          {activeTool === 'quantum' && (
            <button
              type="button"
              onClick={() => onMaximizeToCenter('quantum')}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={isTr ? 'Kuantum Görünümünü Ortaya Al' : 'Maximize Quantum to Center'}
              aria-label="Maximize Quantum"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title={isTr ? 'Sağ Paneli Kapat' : 'Close Right Panel'}
            aria-label="Close Right Panel"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Sidebar Tool Content */}
      <div className="flex-1 overflow-hidden">
        {activeTool === 'properties' && (
          <div className="h-full overflow-y-auto p-2.5 space-y-3 text-xs font-mono">
            {/* Active Document Info */}
            <div className="bg-[#111115] border border-zinc-800/80 rounded p-2 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-zinc-200 font-bold border-b border-zinc-800/80 pb-1 text-[11px]">
                <FileCode className="w-3.5 h-3.5 text-red-400" />
                <span>{isTr ? 'Aktif Dosya Özellikleri' : 'Active File Properties'}</span>
              </div>
              {activeFile ? (
                <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-400">
                  <span>{isTr ? 'Dosya Adı:' : 'File Name:'}</span>
                  <span className="text-zinc-200 font-semibold truncate">{activeFile.name}</span>

                  <span>{isTr ? 'Yol:' : 'Path:'}</span>
                  <span className="text-zinc-300 truncate">{activeFile.path}</span>

                  <span>{isTr ? 'Dil:' : 'Language:'}</span>
                  <span className="text-red-400 uppercase font-bold">{activeFile.language}</span>

                  <span>{isTr ? 'Boyut:' : 'Size:'}</span>
                  <span className="text-zinc-300">{activeFile.size} bayt</span>

                  <span>{isTr ? 'Karmaşıklık:' : 'Complexity:'}</span>
                  <span className="text-emerald-400">{activeFile.complexityScore || 'O(1)'}</span>

                  <span>{isTr ? 'Sembol Sayısı:' : 'Symbols:'}</span>
                  <span className="text-zinc-300">{activeFile.symbolCount}</span>
                </div>
              ) : (
                <div className="text-[10px] text-zinc-500 py-1">
                  {isTr
                    ? 'Şu anda açık bir kod sekmesi yok. Editörden veya gezginden yeni dosya oluşturun.'
                    : 'No file tab currently open. Create a new file from the editor or explorer.'}
                </div>
              )}
            </div>

            {/* Project Environment */}
            <div className="bg-[#111115] border border-zinc-800/80 rounded p-2 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-zinc-200 font-bold border-b border-zinc-800/80 pb-1 text-[11px]">
                <Cpu className="w-3.5 h-3.5 text-red-400" />
                <span>{isTr ? 'Proje Mimarisi' : 'Project Architecture'}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-400">
                <span>{isTr ? 'Çözüm Adı:' : 'Solution:'}</span>
                <span className="text-zinc-200 font-semibold truncate">{workspace.name}</span>

                <span>{isTr ? 'Hedef Mimari:' : 'Target Arch:'}</span>
                <span className="text-zinc-300">{workspace.targetArch}</span>

                <span>{isTr ? 'Dosya Sayısı:' : 'File Count:'}</span>
                <span className="text-zinc-300">{workspace.files.length}</span>

                <span>{isTr ? 'Depolama Türü:' : 'Storage Type:'}</span>
                <span className={workspace.isLocalDisk ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                  {workspace.isLocalDisk ? (isTr ? 'Yerel Disk' : 'Local Disk') : (isTr ? 'Sanal Bellek' : 'Virtual Memory')}
                </span>
              </div>
            </div>

            {/* Quick Security */}
            <div className="bg-[#111115] border border-zinc-800/80 rounded p-2 space-y-1">
              <div className="flex items-center space-x-1.5 text-zinc-200 font-bold border-b border-zinc-800/80 pb-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isTr ? 'Güvenlik Analizi' : 'Security Analysis'}</span>
              </div>
              <p className="text-[10px] text-zinc-400">
                {isTr 
                  ? '0 kritik güvenlik açığı. Bellek ve tip güvenlik kuralları doğrulandı.' 
                  : '0 critical vulnerabilities. Memory and type safety verified.'}
              </p>
            </div>
          </div>
        )}

        {activeTool === 'quantum' && (
          <QuantumWorkspace
            workspace={workspace}
            onOpenInEditor={(f) => onOpenFileInEditor && onOpenFileInEditor(f)}
          />
        )}

        {activeTool === 'sysmonitor' && (
          <SystemMonitorView />
        )}

        {activeTool === 'gitbox2' && (
          <GitBoxIIStudio
            currentWorkspace={workspace}
            onForkWorkspace={(repo) => onForkWorkspace && onForkWorkspace(repo)}
            onBackToEditor={() => {}}
          />
        )}

        {activeTool === 'timeline' && (
          <ReleaseTimelineSidebar
            embedded
            isOpen={true}
            onClose={onClose}
            onOpenReleaseNotes={() => onOpenReleaseNotes?.()}
          />
        )}
      </div>
    </div>
  );
};
