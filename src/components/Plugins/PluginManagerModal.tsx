/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Puzzle,
  X,
  Check,
  Upload,
  FileCode,
  Code2,
  Pin,
} from 'lucide-react';
import { PluginManifest, PluginCategory } from '../../types/plugins';
import { useI18n } from '../../i18n/LanguageContext';
import { PLUGIN_ICON_OPTIONS, renderPluginIcon } from './PluginIconHelper';

interface PluginManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlugin: (manifest: PluginManifest) => void;
}

export const PluginManagerModal: React.FC<PluginManagerModalProps> = ({
  isOpen,
  onClose,
  onAddPlugin,
}) => {
  const { language } = useI18n();
  const isTr = language === 'tr';

  const [mode, setMode] = useState<'form' | 'json'>('form');
  const [selectedIcon, setSelectedIcon] = useState<string>('Puzzle');
  const [pinOnCreate, setPinOnCreate] = useState<boolean>(true);

  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(
      {
        id: 'custom.my-linter',
        name: 'My Custom Linter Plugin',
        version: '1.0.0',
        description: 'Custom plugin loaded dynamically into ViraCode IDE sidebar',
        category: 'custom',
        author: 'ViraCode Dev',
        icon: 'Puzzle',
        isEnabled: true,
        isPinned: true,
        tags: ['custom', 'linter'],
        customScript: "console.log('Custom JSON Plugin Active!');",
      },
      null,
      2
    )
  );

  // Form State
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<PluginCategory>('custom');
  const [description, setDescription] = useState<string>('');
  const [customScript, setCustomScript] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectIcon = (iconId: string) => {
    setSelectedIcon(iconId);
    try {
      const parsed = JSON.parse(jsonText);
      parsed.icon = iconId;
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch {
      // Ignore if JSON text is mid-edit
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonText(content);
        try {
          const parsed = JSON.parse(content);
          if (parsed.icon) setSelectedIcon(parsed.icon);
          setJsonError(null);
        } catch {
          setJsonError(isTr ? 'Geçersiz JSON formatı!' : 'Invalid JSON format!');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleJsonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.name || !parsed.id) {
        setJsonError(
          isTr
            ? 'JSON objesi "name" ve "id" içermelidir!'
            : 'JSON object must contain "name" and "id"!'
        );
        return;
      }

      const plugin: PluginManifest = {
        id: `${parsed.id}-${Date.now().toString(36).slice(-4)}`,
        name: parsed.name,
        version: parsed.version || '1.0.0',
        description: parsed.description || 'Custom JSON Plugin',
        category: parsed.category || 'custom',
        author: parsed.author || 'Custom Author',
        icon: parsed.icon || selectedIcon || 'Puzzle',
        isEnabled: true,
        isBuiltin: false,
        isPinned: typeof parsed.isPinned === 'boolean' ? parsed.isPinned : pinOnCreate,
        tags: parsed.tags || ['json', 'custom'],
        installedAt: new Date().toLocaleDateString(),
        customScript: parsed.customScript || '',
        stats: { runsCount: 0, memoryMb: 8, lastActive: isTr ? 'Şimdi' : 'Now' },
      };

      onAddPlugin(plugin);
      onClose();
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const generatedId = `custom.${slug || 'plugin'}-${Date.now().toString(36).slice(-4)}`;
    const newPlugin: PluginManifest = {
      id: generatedId,
      name: name.trim(),
      version: '1.0.0',
      description: description.trim() || (isTr ? 'Özel kullanıcı eklentisi' : 'Custom user plugin'),
      category,
      author: 'ViraCode Developer',
      icon: selectedIcon || 'Puzzle',
      isEnabled: true,
      isBuiltin: false,
      isPinned: pinOnCreate,
      tags: ['custom', category],
      installedAt: new Date().toLocaleDateString(),
      customScript: customScript.trim(),
      stats: { runsCount: 0, memoryMb: 10, lastActive: isTr ? 'Şimdi' : 'Now' },
    };

    onAddPlugin(newPlugin);
    setName('');
    setDescription('');
    setCustomScript('');
    setSelectedIcon('Puzzle');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono">
      <div className="bg-[#12080a] border border-red-900/60 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-xs text-zinc-300">
        {/* Header Bar */}
        <div className="px-4 py-3 bg-[#180a0d] border-b border-red-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {renderPluginIcon(selectedIcon, 'w-4 h-4')}
            <span className="font-bold text-white text-xs">
              {isTr ? 'Yeni Eklenti Oluştur / Yükle' : 'Create / Install Plugin'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setMode('form')}
              className={`p-1.5 rounded cursor-pointer transition-colors ${
                mode === 'form' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title={isTr ? 'Form ile Oluştur' : 'Form Builder'}
              aria-label="Form Mode"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMode('json')}
              className={`p-1.5 rounded cursor-pointer transition-colors ${
                mode === 'json' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title={isTr ? 'JSON Manifest' : 'JSON Manifest'}
              aria-label="JSON Mode"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 cursor-pointer"
              title={isTr ? 'Kapat' : 'Close'}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Icon Selector Grid (Shared Across Both Modes) */}
        <div className="px-4 pt-3 pb-2 border-b border-red-950/60 bg-black/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
              {isTr ? 'Eklenti Simgesi Seç' : 'Select Plugin Icon'}
            </span>
            <span className="text-[10px] text-zinc-500">{selectedIcon}</span>
          </div>
          <div className="grid grid-cols-9 gap-1.5">
            {PLUGIN_ICON_OPTIONS.map((opt) => {
              const active = selectedIcon === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectIcon(opt.id)}
                  title={isTr ? opt.labelTr : opt.labelEn}
                  aria-label={isTr ? opt.labelTr : opt.labelEn}
                  className={`p-1.5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                    active
                      ? 'bg-red-600/25 border-red-500 ring-1 ring-red-500/60 scale-105'
                      : 'bg-black/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'
                  }`}
                >
                  {renderPluginIcon(opt.id, 'w-3.5 h-3.5')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Form */}
        {mode === 'form' ? (
          <form onSubmit={handleFormSubmit} className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-zinc-400 text-[10px] block">
                  {isTr ? 'Eklenti Adı:' : 'Plugin Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isTr ? 'Örn. GraphQL Stüdyo' : 'e.g., GraphQL Studio'}
                  className="w-full bg-black/60 border border-red-900/40 focus:border-red-500 p-1.5 rounded text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] block">
                  {isTr ? 'Kategori:' : 'Category:'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PluginCategory)}
                  className="w-full bg-black/60 border border-red-900/40 focus:border-red-500 p-1.5 rounded text-white outline-none"
                >
                  <option value="custom">Custom</option>
                  <option value="devtools">DevTools</option>
                  <option value="system">System</option>
                  <option value="database">Database</option>
                  <option value="terminal">Terminal</option>
                  <option value="math">Math</option>
                  <option value="runner">Runner</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 text-[10px] block">
                {isTr ? 'Açıklama:' : 'Description:'}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isTr ? 'Eklenti açıklaması...' : 'Short plugin description...'}
                className="w-full bg-black/60 border border-red-900/40 focus:border-red-500 p-1.5 rounded text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 text-[10px] block">
                {isTr ? 'Betik / Komut (İsteğe Bağlı):' : 'Script / Command (Optional):'}
              </label>
              <textarea
                rows={3}
                value={customScript}
                onChange={(e) => setCustomScript(e.target.value)}
                placeholder="console.log('ViraCode Plugin Running!');"
                className="w-full bg-black/60 border border-red-900/40 focus:border-red-500 p-1.5 rounded text-purple-300 outline-none resize-none text-[11px]"
              />
            </div>

            <label className="flex items-center space-x-2 text-[11px] text-zinc-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={pinOnCreate}
                onChange={(e) => setPinOnCreate(e.target.checked)}
                className="accent-red-600 rounded cursor-pointer"
              />
              <Pin className="w-3.5 h-3.5 text-red-400" />
              <span>
                {isTr
                  ? 'Oluşturulduğunda sol kenar çubuğuna sabitle'
                  : 'Pin to left activity bar on create'}
              </span>
            </label>

            <div className="flex justify-end space-x-2 pt-2 border-t border-red-950">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded cursor-pointer"
                title={isTr ? 'İptal' : 'Cancel'}
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded cursor-pointer"
                title={isTr ? 'Eklentiyi Oluştur & Ekle' : 'Create & Add Plugin'}
                aria-label="Save"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJsonSubmit} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                {isTr ? 'Eklenti JSON Manifest İçeriği:' : 'Plugin Manifest JSON:'}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleJsonUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 rounded flex items-center cursor-pointer"
                title={isTr ? 'Bilgisayardan JSON Yükle' : 'Upload JSON File'}
                aria-label="Upload JSON File"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>

            {jsonError && (
              <div className="p-2 bg-rose-950/80 border border-rose-600 text-rose-300 rounded text-[11px]">
                {jsonError}
              </div>
            )}

            <textarea
              rows={9}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setJsonError(null);
              }}
              className="w-full bg-black/80 border border-red-900/40 rounded p-2.5 text-purple-300 outline-none resize-none font-mono text-[11px]"
            />

            <div className="flex justify-end space-x-2 pt-2 border-t border-red-950">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded cursor-pointer"
                title={isTr ? 'İptal' : 'Cancel'}
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded cursor-pointer"
                title={isTr ? 'JSON Eklentiyi Ekle' : 'Add JSON Plugin'}
                aria-label="Save Plugin"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
