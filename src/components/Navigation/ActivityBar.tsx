/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Home,
  Copyright,
  FolderTree,
  Search,
  GitBranch,
  Puzzle,
  Globe,
  LayoutGrid,
} from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';
import { PluginManifest } from '../../types/plugins';
import { renderPluginIcon } from '../Plugins/PluginIconHelper';

export type LeftSidebarToolType = 'explorer' | 'search' | 'git' | 'plugins' | string;

interface ActivityBarProps {
  activeTool: LeftSidebarToolType;
  isLeftSidebarOpen: boolean;
  isHomeActive?: boolean;
  onOpenHome?: () => void;
  isCopyrightsActive?: boolean;
  onOpenCopyrights?: () => void;
  isDevFeedActive?: boolean;
  onOpenDevFeed?: () => void;
  onSelectLeftTool: (tool: LeftSidebarToolType) => void;
  onToggleLeftSidebar: () => void;
  pinnedPlugins?: PluginManifest[];
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeTool,
  isLeftSidebarOpen,
  isHomeActive = false,
  onOpenHome,
  isCopyrightsActive = false,
  onOpenCopyrights,
  isDevFeedActive = false,
  onOpenDevFeed,
  onSelectLeftTool,
  onToggleLeftSidebar,
  pinnedPlugins = [],
}) => {
  const { language, toggleLanguage } = useI18n();
  const isTr = language === 'tr';

  const leftTools: Array<{
    id: LeftSidebarToolType;
    icon: React.ReactNode;
    title: string;
  }> = [
    {
      id: 'explorer',
      icon: <FolderTree className="w-4 h-4" />,
      title: isTr ? 'Çözüm Gezgini (Ctrl+Shift+E)' : 'Solution Explorer (Ctrl+Shift+E)',
    },
    {
      id: 'search',
      icon: <Search className="w-4 h-4" />,
      title: isTr ? 'Dosyalarda Ara (Ctrl+Shift+F)' : 'Search in Files (Ctrl+Shift+F)',
    },
    {
      id: 'git',
      icon: <GitBranch className="w-4 h-4 text-zinc-300" />,
      title: isTr ? 'Kaynak Denetimi (Git)' : 'Source Control (Git)',
    },
    {
      id: 'plugins',
      icon: <Puzzle className="w-4 h-4 text-purple-400" />,
      title: isTr ? 'Eklentiler Yöneticisi' : 'Plugins Manager',
    },
  ];

  return (
    <aside
      className="w-11 shrink-0 bg-[#09090b] border-r border-zinc-800/80 flex flex-col items-center justify-between py-2 z-30 select-none text-zinc-400"
      aria-label="Activity Bar"
    >
      {/* Top Left Tools: Home, Copyrights, DevFeed, followed by Explorer, Search, Git, Plugins */}
      <div className="flex flex-col items-center space-y-1 w-full overflow-y-auto no-scrollbar">
        {/* Home Button */}
        <div className="relative group w-full flex justify-center">
          <button
            type="button"
            onClick={() => onOpenHome?.()}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all cursor-pointer relative ${
              isHomeActive
                ? 'bg-zinc-800 text-white border border-red-500/60'
                : 'hover:text-white hover:bg-zinc-800/60'
            }`}
            aria-label={isTr ? 'Ana Sayfa — Son Özellikler & Bilgiler' : 'Home — Latest Features & Info'}
            title={isTr ? 'Ana Sayfa — Son Özellikler & Bilgiler' : 'Home — Latest Features & Info'}
          >
            <Home className="w-4 h-4 text-red-400" />
            {isHomeActive && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-red-500 rounded-r shadow-xs shadow-red-500/80" />
            )}
          </button>
        </div>

        {/* Copyrights Button */}
        <div className="relative group w-full flex justify-center">
          <button
            type="button"
            onClick={() => onOpenCopyrights?.()}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all cursor-pointer relative ${
              isCopyrightsActive
                ? 'bg-zinc-800 text-white border border-red-500/60'
                : 'hover:text-white hover:bg-zinc-800/60'
            }`}
            aria-label={isTr ? 'Telif Hakları & Geliştiriciler (Copyrights)' : 'Copyrights & Credits'}
            title={isTr ? 'Telif Hakları & Geliştiriciler (Copyrights)' : 'Copyrights & Credits'}
          >
            <Copyright className="w-4 h-4 text-zinc-300" />
            {isCopyrightsActive && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-red-500 rounded-r shadow-xs shadow-red-500/80" />
            )}
          </button>
        </div>

        {/* VBP DevFeed Button */}
        <div className="relative group w-full flex justify-center">
          <button
            type="button"
            onClick={() => onOpenDevFeed?.()}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all cursor-pointer relative ${
              isDevFeedActive
                ? 'bg-zinc-800 text-white border border-red-500/60'
                : 'hover:text-white hover:bg-zinc-800/60'
            }`}
            aria-label={isTr ? 'VBP DevFeed — Google Workspace (Chat, Gmail, Drive, Meet)' : 'VBP DevFeed — Google Workspace Hub'}
            title={isTr ? 'VBP DevFeed — Chat, Gmail, Drive ve Meet' : 'VBP DevFeed — Chat, Gmail, Drive & Meet'}
          >
            <LayoutGrid className="w-4 h-4 text-red-400" />
            {isDevFeedActive && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-red-500 rounded-r shadow-xs shadow-red-500/80" />
            )}
          </button>
        </div>

        <div className="w-6 h-px bg-zinc-800/80 my-0.5" />

        {leftTools.map((tool) => {
          const isActive = isLeftSidebarOpen && activeTool === tool.id;
          return (
            <div key={tool.id} className="relative group w-full flex justify-center">
              <button
                type="button"
                onClick={() => {
                  if (isLeftSidebarOpen && activeTool === tool.id) {
                    onToggleLeftSidebar();
                  } else {
                    onSelectLeftTool(tool.id);
                  }
                }}
                className={`w-8 h-8 rounded flex items-center justify-center transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-zinc-800 text-white border border-red-500/60'
                    : 'hover:text-white hover:bg-zinc-800/60'
                }`}
                aria-label={tool.title}
                title={tool.title}
              >
                {tool.icon}
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-red-500 rounded-r shadow-xs shadow-red-500/80" />
                )}
              </button>
            </div>
          );
        })}

        {/* Individually Pinned Plugins in Left Activity Bar */}
        {pinnedPlugins.length > 0 && (
          <>
            <div className="w-6 h-px bg-zinc-800/80 my-0.5" />
            {pinnedPlugins.map((plugin) => {
              const pluginToolId = `plugin:${plugin.id}`;
              const isActive = isLeftSidebarOpen && activeTool === pluginToolId;
              return (
                <div key={plugin.id} className="relative group w-full flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (isLeftSidebarOpen && activeTool === pluginToolId) {
                        onToggleLeftSidebar();
                      } else {
                        onSelectLeftTool(pluginToolId);
                      }
                    }}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-zinc-800 text-white border border-red-500/60'
                        : 'hover:text-white hover:bg-zinc-800/60'
                    }`}
                    aria-label={plugin.name}
                    title={plugin.name}
                  >
                    {renderPluginIcon(plugin.icon, 'w-4 h-4')}
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-red-500 rounded-r shadow-xs shadow-red-500/80" />
                    )}
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom Utility: Language Toggle */}
      <div className="flex flex-col items-center space-y-1 w-full pt-1 border-t border-zinc-800/80 shrink-0">
        <div className="relative group w-full flex justify-center">
          <button
            type="button"
            onClick={toggleLanguage}
            className="w-8 h-8 rounded flex flex-col items-center justify-center transition-all cursor-pointer text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
            title={isTr ? 'Switch to English' : 'Türkçe Dilini Seç'}
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-[8px] font-mono font-bold leading-none mt-0.5 text-red-500">
              {language.toUpperCase()}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
