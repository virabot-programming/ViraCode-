/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Puzzle,
  Code2,
  Terminal,
  Cpu,
  Database,
  Activity,
  Calculator,
  Shield,
  Sparkles,
  Zap,
  Wrench,
  Layers,
  Globe,
  Atom,
  Bug,
  Rocket,
  Compass,
  Boxes,
} from 'lucide-react';

export interface PluginIconOption {
  id: string;
  labelTr: string;
  labelEn: string;
  colorClass: string;
}

export const PLUGIN_ICON_OPTIONS: PluginIconOption[] = [
  { id: 'Puzzle', labelTr: 'Eklenti', labelEn: 'Plugin', colorClass: 'text-purple-400' },
  { id: 'Code2', labelTr: 'Kod', labelEn: 'Code', colorClass: 'text-blue-400' },
  { id: 'Terminal', labelTr: 'Terminal', labelEn: 'Terminal', colorClass: 'text-zinc-200' },
  { id: 'Cpu', labelTr: 'Çekirdek / CPU', labelEn: 'CPU / Core', colorClass: 'text-cyan-400' },
  { id: 'Database', labelTr: 'Veritabanı', labelEn: 'Database', colorClass: 'text-amber-400' },
  { id: 'Activity', labelTr: 'Monitör', labelEn: 'Monitor', colorClass: 'text-emerald-400' },
  { id: 'Calculator', labelTr: 'Matematik', labelEn: 'Math', colorClass: 'text-pink-400' },
  { id: 'Shield', labelTr: 'Güvenlik', labelEn: 'Security', colorClass: 'text-emerald-300' },
  { id: 'Sparkles', labelTr: 'Yapay Zeka', labelEn: 'AI / Smart', colorClass: 'text-rose-400' },
  { id: 'Zap', labelTr: 'Hızlı Motor', labelEn: 'Fast Engine', colorClass: 'text-yellow-400' },
  { id: 'Wrench', labelTr: 'Araçlar', labelEn: 'Tools', colorClass: 'text-orange-400' },
  { id: 'Layers', labelTr: 'Katmanlar', labelEn: 'Layers', colorClass: 'text-indigo-400' },
  { id: 'Globe', labelTr: 'Ağ / Web', labelEn: 'Network / Web', colorClass: 'text-sky-400' },
  { id: 'Atom', labelTr: 'Kuantum', labelEn: 'Quantum', colorClass: 'text-cyan-300' },
  { id: 'Bug', labelTr: 'Hata Ayıklama', labelEn: 'Debugger', colorClass: 'text-red-400' },
  { id: 'Rocket', labelTr: 'Dağıtım', labelEn: 'Deploy', colorClass: 'text-rose-500' },
  { id: 'Compass', labelTr: 'Keşif', labelEn: 'Compass', colorClass: 'text-teal-400' },
  { id: 'Boxes', labelTr: 'Paketler', labelEn: 'Packages', colorClass: 'text-amber-300' },
];

export const renderPluginIcon = (
  iconId?: string,
  className: string = 'w-4 h-4'
): React.ReactNode => {
  switch (iconId) {
    case 'Code2':
      return <Code2 className={`${className} text-blue-400 shrink-0`} />;
    case 'Terminal':
      return <Terminal className={`${className} text-zinc-200 shrink-0`} />;
    case 'Cpu':
      return <Cpu className={`${className} text-cyan-400 shrink-0`} />;
    case 'Database':
      return <Database className={`${className} text-amber-400 shrink-0`} />;
    case 'Activity':
      return <Activity className={`${className} text-emerald-400 shrink-0`} />;
    case 'Calculator':
      return <Calculator className={`${className} text-pink-400 shrink-0`} />;
    case 'Shield':
      return <Shield className={`${className} text-emerald-300 shrink-0`} />;
    case 'Sparkles':
      return <Sparkles className={`${className} text-rose-400 shrink-0`} />;
    case 'Zap':
      return <Zap className={`${className} text-yellow-400 shrink-0`} />;
    case 'Wrench':
      return <Wrench className={`${className} text-orange-400 shrink-0`} />;
    case 'Layers':
      return <Layers className={`${className} text-indigo-400 shrink-0`} />;
    case 'Globe':
      return <Globe className={`${className} text-sky-400 shrink-0`} />;
    case 'Atom':
      return <Atom className={`${className} text-cyan-300 shrink-0`} />;
    case 'Bug':
      return <Bug className={`${className} text-red-400 shrink-0`} />;
    case 'Rocket':
      return <Rocket className={`${className} text-rose-500 shrink-0`} />;
    case 'Compass':
      return <Compass className={`${className} text-teal-400 shrink-0`} />;
    case 'Boxes':
      return <Boxes className={`${className} text-amber-300 shrink-0`} />;
    case 'Puzzle':
    default:
      return <Puzzle className={`${className} text-purple-400 shrink-0`} />;
  }
};
