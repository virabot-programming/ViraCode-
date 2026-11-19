/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Network, 
  RefreshCw, 
  Zap,
  Gauge
} from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';

export const SystemMonitorView: React.FC = () => {
  const { language } = useI18n();
  const isTr = language === 'tr';

  const [fps, setFps] = useState<number>(60.0);
  const [cpuLoad, setCpuLoad] = useState<number>(24);
  const [memoryMb, setMemoryMb] = useState<number>(342);
  const [netRxKb, setNetRxKb] = useState<number>(128.4);
  const [netTxKb, setNetTxKb] = useState<number>(44.1);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setFps(Number((58.5 + Math.random() * 3.0).toFixed(1)));
      setCpuLoad(Math.min(99, Math.max(10, Math.round(20 + Math.random() * 25))));
      setMemoryMb((prev) => Math.min(1024, Math.max(180, prev + Math.floor((Math.random() - 0.49) * 12))));
      setNetRxKb(Number((90 + Math.random() * 60).toFixed(1)));
      setNetTxKb(Number((30 + Math.random() * 30).toFixed(1)));
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const handleCleanMemory = () => {
    const freed = Math.round(memoryMb * 0.35);
    setMemoryMb((prev) => Math.max(140, prev - freed));
    setNotice(isTr ? `🧹 ${freed} MB bellek temizlendi` : `🧹 Cleared ${freed} MB`);
    setTimeout(() => setNotice(null), 2500);
  };

  return (
    <div className="h-full flex flex-col bg-[#09090b] text-zinc-300 font-sans p-2 overflow-y-auto space-y-2 text-xs select-none">
      {/* Compact Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 font-mono text-[11px]">
        <div className="flex items-center space-x-1 font-bold text-zinc-200">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isTr ? 'Sistem Monitörü' : 'System Monitor'}</span>
        </div>
        <button
          type="button"
          onClick={handleCleanMemory}
          className="p-1 bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-500/30 rounded transition-colors cursor-pointer"
          title={isTr ? 'Belleği Temizle (GC)' : 'Purge Memory'}
          aria-label="Clean Memory"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {notice && (
        <div className="p-1 bg-purple-950/60 border border-purple-800/60 text-purple-200 text-[10px] font-mono rounded text-center">
          {notice}
        </div>
      )}

      {/* Metric Cards - 4 Key Gauges (FPS, CPU, RAM, NET) */}
      <div className="space-y-1.5 font-mono">
        {/* 1. FPS */}
        <div className="p-2 bg-[#111115] border border-zinc-800/80 rounded flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1.5 text-zinc-400">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span>FPS:</span>
          </div>
          <span className="font-bold text-emerald-400">{fps}</span>
        </div>

        {/* 2. CPU */}
        <div className="p-2 bg-[#111115] border border-zinc-800/80 rounded space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isTr ? 'İşlemci' : 'CPU'}:</span>
            </div>
            <span className="font-bold text-cyan-400">{cpuLoad}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                cpuLoad > 75 ? 'bg-rose-500' : cpuLoad > 45 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${cpuLoad}%` }}
            />
          </div>
        </div>

        {/* 3. Memory */}
        <div className="p-2 bg-[#111115] border border-zinc-800/80 rounded space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <div className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>{isTr ? 'Hafıza' : 'Memory'}:</span>
            </div>
            <span className="font-bold text-purple-300">{memoryMb} MB</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${(memoryMb / 1024) * 100}%` }}
            />
          </div>
        </div>

        {/* 4. Network */}
        <div className="p-2 bg-[#111115] border border-zinc-800/80 rounded flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1.5 text-zinc-400">
            <Network className="w-3.5 h-3.5 text-sky-400" />
            <span>{isTr ? 'Ağ (Rx / Tx)' : 'Network'}:</span>
          </div>
          <span className="font-mono text-sky-300 text-[10px]">
            {netRxKb} / {netTxKb} KB/s
          </span>
        </div>
      </div>
    </div>
  );
};
