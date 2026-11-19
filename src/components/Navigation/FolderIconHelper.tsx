/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Folder,
  FolderOpen,
  Box,
  Cpu,
  Code2,
  Database,
  Globe,
  Terminal,
  Layers,
  Zap,
  Atom,
  Flame,
  Shield
} from 'lucide-react';

export interface FolderIconOption {
  id: string;
  labelTr: string;
  labelEn: string;
  colorClass: string;
}

export const FOLDER_ICON_OPTIONS: FolderIconOption[] = [
  { id: 'folder', labelTr: 'Klasik Klasör', labelEn: 'Default Folder', colorClass: 'text-[#dcb67a]' },
  { id: 'box', labelTr: 'Paket / Modül', labelEn: 'Package / Box', colorClass: 'text-red-400' },
  { id: 'cpu', labelTr: 'Çekirdek / Sistem', labelEn: 'Core / CPU', colorClass: 'text-cyan-400' },
  { id: 'code', labelTr: 'Kaynak Kod', labelEn: 'Source Code', colorClass: 'text-blue-400' },
  { id: 'database', labelTr: 'Veritabanı', labelEn: 'Database', colorClass: 'text-amber-400' },
  { id: 'globe', labelTr: 'Ağ / Web', labelEn: 'Web / Network', colorClass: 'text-emerald-400' },
  { id: 'terminal', labelTr: 'Terminal / CLI', labelEn: 'Terminal / CLI', colorClass: 'text-zinc-300' },
  { id: 'layers', labelTr: 'Katmanlar', labelEn: 'Layers', colorClass: 'text-purple-400' },
  { id: 'zap', labelTr: 'Hızlı / Motor', labelEn: 'Fast / Engine', colorClass: 'text-yellow-400' },
  { id: 'atom', labelTr: 'Kuantum', labelEn: 'Quantum', colorClass: 'text-sky-400' },
  { id: 'flame', labelTr: 'ViraCore Ateşi', labelEn: 'Flame', colorClass: 'text-rose-500' },
  { id: 'shield', labelTr: 'Güvenlik', labelEn: 'Security', colorClass: 'text-emerald-300' },
];

export const renderFolderOrProjectIcon = (
  iconId?: string,
  isOpen: boolean = false,
  className: string = 'w-3.5 h-3.5'
) => {
  switch (iconId) {
    case 'box':
      return <Box className={`${className} text-red-400 shrink-0`} />;
    case 'cpu':
      return <Cpu className={`${className} text-cyan-400 shrink-0`} />;
    case 'code':
      return <Code2 className={`${className} text-blue-400 shrink-0`} />;
    case 'database':
      return <Database className={`${className} text-amber-400 shrink-0`} />;
    case 'globe':
      return <Globe className={`${className} text-emerald-400 shrink-0`} />;
    case 'terminal':
      return <Terminal className={`${className} text-zinc-300 shrink-0`} />;
    case 'layers':
      return <Layers className={`${className} text-purple-400 shrink-0`} />;
    case 'zap':
      return <Zap className={`${className} text-yellow-400 shrink-0`} />;
    case 'atom':
      return <Atom className={`${className} text-sky-400 shrink-0`} />;
    case 'flame':
      return <Flame className={`${className} text-rose-500 shrink-0`} />;
    case 'shield':
      return <Shield className={`${className} text-emerald-300 shrink-0`} />;
    case 'folder':
    default:
      return isOpen ? (
        <FolderOpen className={`${className} text-[#dcb67a] fill-[#dcb67a]/20 shrink-0`} />
      ) : (
        <Folder className={`${className} text-[#dcb67a] fill-[#dcb67a]/20 shrink-0`} />
      );
  }
};
