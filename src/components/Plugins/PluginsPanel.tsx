/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Puzzle,
  Plus,
  Search,
  Power,
  Trash2,
  Pin,
  PinOff,
  PanelLeftClose,
} from 'lucide-react';
import { PluginManifest } from '../../types/plugins';
import { useI18n } from '../../i18n/LanguageContext';
import { PluginManagerModal } from './PluginManagerModal';
import { renderPluginIcon } from './PluginIconHelper';

export const DEFAULT_BUILTIN_PLUGINS: PluginManifest[] = [
  {
    id: 'system-monitor',
    name: 'Sistem & Donanım Monitörü',
    version: '3.2.0',
    description: 'FPS, CPU, RAM bellek ve ağ akış izleme.',
    category: 'system',
    author: 'ViraCode Core',
    icon: 'Activity',
    isEnabled: true,
    isBuiltin: true,
    isPinned: false,
    tags: ['cpu', 'ram', 'fps'],
    installedAt: '2026-10-01',
  },
  {
    id: 'database-editor',
    name: 'Veritabanı Düzenleyici',
    version: '2.0.0',
    description: 'SQLite & SQL tablo, satır düzenleme ve sorgu çalıştırma.',
    category: 'database',
    author: 'ViraCode DB',
    icon: 'Database',
    isEnabled: true,
    isBuiltin: true,
    isPinned: false,
    tags: ['sql', 'sqlite', 'db'],
    installedAt: '2026-10-01',
  },
  {
    id: 'math-programming',
    name: 'Matematik & Fonksiyon Çizici',
    version: '2.5.1',
    description: 'Kartezyen eğri çizici ve bilimsel REPL.',
    category: 'math',
    author: 'ViraCode Sci',
    icon: 'Calculator',
    isEnabled: true,
    isBuiltin: true,
    isPinned: false,
    tags: ['math', 'calculus'],
    installedAt: '2026-10-01',
  },
  {
    id: 'advanced-terminal',
    name: 'POSIX Sanal Shell Terminal',
    version: '2.8.0',
    description: 'Sanal CLI ve süreç denetimi.',
    category: 'terminal',
    author: 'ViraCode CLI',
    icon: 'Terminal',
    isEnabled: true,
    isBuiltin: true,
    isPinned: false,
    tags: ['shell', 'cli'],
    installedAt: '2026-10-01',
  },
];

interface PluginsPanelProps {
  plugins: PluginManifest[];
  onPluginsChange: (plugins: PluginManifest[]) => void;
  onOpenPlugin?: (pluginId: string) => void;
  onCollapse?: () => void;
}

export const PluginsPanel: React.FC<PluginsPanelProps> = ({
  plugins,
  onPluginsChange,
  onOpenPlugin,
  onCollapse,
}) => {
  const { language } = useI18n();
  const isTr = language === 'tr';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2400);
  };

  const handleTogglePlugin = (id: string) => {
    const updated = plugins.map((p) =>
      p.id === id
        ? {
            ...p,
            isEnabled: !p.isEnabled,
            isPinned: !p.isEnabled ? p.isPinned : false,
          }
        : p
    );
    onPluginsChange(updated);
  };

  const handleTogglePin = (id: string) => {
    const target = plugins.find((p) => p.id === id);
    if (!target) return;
    const nextPinned = !target.isPinned;
    const updated = plugins.map((p) =>
      p.id === id
        ? {
            ...p,
            isEnabled: nextPinned ? true : p.isEnabled,
            isPinned: nextPinned,
          }
        : p
    );
    onPluginsChange(updated);
    showToast(
      nextPinned
        ? isTr
          ? `📌 Sol kenar çubuğuna sabitlendi: ${target.name}`
          : `📌 Pinned to left bar: ${target.name}`
        : isTr
        ? `Sabitleme kaldırıldı: ${target.name}`
        : `Unpinned: ${target.name}`
    );
  };

  const handleAddCustomPlugin = (newManifest: PluginManifest) => {
    const updated = [newManifest, ...plugins];
    onPluginsChange(updated);
    showToast(
      isTr
        ? `✨ Eklenti yüklendi: ${newManifest.name}`
        : `✨ Plugin installed: ${newManifest.name}`
    );
  };

  const handleDeletePlugin = (id: string) => {
    const updated = plugins.filter((p) => p.id !== id);
    onPluginsChange(updated);
  };

  const filtered = plugins.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#09090b] text-zinc-200 font-sans p-2 overflow-hidden text-xs select-none space-y-2">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 font-mono text-[11px]">
        <div className="flex items-center space-x-1.5 font-bold text-zinc-200 min-w-0">
          <Puzzle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">{isTr ? 'Eklentiler' : 'Plugins'}</span>
          <span className="text-[9px] px-1 bg-zinc-800 text-zinc-400 rounded shrink-0">
            {plugins.filter((p) => p.isEnabled).length}
          </span>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="p-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 rounded cursor-pointer transition-colors"
            title={isTr ? 'Yeni Eklenti Oluştur / Ekle' : 'Create / Add Plugin'}
            aria-label="Add Plugin"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="p-1 text-zinc-500 hover:text-white rounded cursor-pointer transition-colors"
              title={isTr ? 'Kapat' : 'Close'}
              aria-label="Close"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {toastNotice && (
        <div className="p-1.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono rounded truncate">
          {toastNotice}
        </div>
      )}

      {/* Search Input */}
      <div className="flex items-center bg-black/60 border border-zinc-800 rounded px-2 py-1">
        <Search className="w-3 h-3 text-zinc-500 mr-1.5 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isTr ? 'Eklenti ara...' : 'Search plugins...'}
          className="w-full bg-transparent border-none outline-none text-[10px] font-mono text-zinc-200"
        />
      </div>

      {/* Clean Plugins List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 font-mono">
        {filtered.map((plugin) => (
          <div
            key={plugin.id}
            className={`p-2 bg-[#111115] border rounded flex items-center justify-between transition-colors ${
              plugin.isEnabled
                ? plugin.isPinned
                  ? 'border-red-500/40 hover:border-red-500/70'
                  : 'border-zinc-800/80 hover:border-zinc-700'
                : 'border-zinc-800/40 opacity-50'
            }`}
          >
            <div
              onClick={() => plugin.isEnabled && onOpenPlugin?.(plugin.id)}
              className={`min-w-0 flex-1 pr-2 flex items-start space-x-2 ${
                plugin.isEnabled && onOpenPlugin ? 'cursor-pointer' : ''
              }`}
              title={
                plugin.isEnabled && onOpenPlugin
                  ? isTr
                    ? `${plugin.name} eklentisini aç`
                    : `Open ${plugin.name}`
                  : undefined
              }
            >
              <div className="p-1.5 rounded bg-black/60 border border-zinc-800/90 shrink-0 mt-0.5">
                {renderPluginIcon(plugin.icon, 'w-3.5 h-3.5')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-[11px] truncate flex items-center space-x-1">
                  <span className="truncate">{plugin.name}</span>
                  <span className="text-[9px] text-zinc-500 font-normal shrink-0">
                    v{plugin.version}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate">{plugin.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 shrink-0">
              {/* Individual Pin to Left Activity Bar Button */}
              <button
                type="button"
                onClick={() => handleTogglePin(plugin.id)}
                className={`p-1 rounded border cursor-pointer transition-colors ${
                  plugin.isPinned && plugin.isEnabled
                    ? 'bg-red-950/70 border-red-500/60 text-red-400 hover:text-red-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:border-zinc-700'
                }`}
                title={
                  plugin.isPinned && plugin.isEnabled
                    ? isTr
                      ? 'Sol kenar çubuğundan sabitlemeyi kaldır'
                      : 'Unpin from left bar'
                    : isTr
                    ? 'Sol kenar çubuğuna sabitle'
                    : 'Pin to left bar'
                }
                aria-label={plugin.isPinned ? 'Unpin Plugin' : 'Pin Plugin'}
              >
                {plugin.isPinned && plugin.isEnabled ? (
                  <PinOff className="w-3 h-3" />
                ) : (
                  <Pin className="w-3 h-3" />
                )}
              </button>

              {!plugin.isBuiltin && (
                <button
                  type="button"
                  onClick={() => handleDeletePlugin(plugin.id)}
                  className="p-1 text-zinc-500 hover:text-red-400 rounded cursor-pointer transition-colors"
                  title={isTr ? 'Sil' : 'Delete'}
                  aria-label="Delete Plugin"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleTogglePlugin(plugin.id)}
                className={`p-1 rounded border cursor-pointer transition-colors ${
                  plugin.isEnabled
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                }`}
                title={
                  plugin.isEnabled
                    ? isTr
                      ? 'Devre Dışı Bırak'
                      : 'Disable'
                    : isTr
                    ? 'Etkinleştir'
                    : 'Enable'
                }
                aria-label="Toggle Plugin State"
              >
                <Power className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <PluginManagerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPlugin={handleAddCustomPlugin}
      />
    </div>
  );
};
