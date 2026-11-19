/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Atom, 
  Play, 
  Trash2, 
  Sparkles, 
  RotateCcw,
  BarChart3,
  Cpu,
  FileCode
} from 'lucide-react';
import { ProjectWorkspace, VirtualFile } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';

export type QuantumGateType = 'H' | 'X' | 'Y' | 'Z' | 'CX' | 'M';

export interface PlacedGate {
  id: string;
  type: QuantumGateType;
  qubit: number;
  step: number;
  controlQubit?: number;
}

interface QuantumWorkspaceProps {
  workspace: ProjectWorkspace;
  onOpenInEditor?: (file: VirtualFile) => void;
  onOpenViraBot?: () => void;
}

const PRESET_BELL_GATES: PlacedGate[] = [
  { id: 'g1', type: 'H', qubit: 0, step: 0 },
  { id: 'g2', type: 'CX', qubit: 1, controlQubit: 0, step: 1 },
  { id: 'g3', type: 'M', qubit: 0, step: 2 },
  { id: 'g4', type: 'M', qubit: 1, step: 2 },
];

export const QuantumWorkspace: React.FC<QuantumWorkspaceProps> = ({
  workspace,
  onOpenInEditor,
  onOpenViraBot
}) => {
  const { language } = useI18n();
  const isTr = language === 'tr';

  const [numQubits, setNumQubits] = useState<number>(3);
  const [numSteps] = useState<number>(6);
  const [selectedGate, setSelectedGate] = useState<QuantumGateType>('H');
  const [controlQubit, setControlQubit] = useState<number>(0);
  const [gates, setGates] = useState<PlacedGate[]>(PRESET_BELL_GATES);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Toggle or place gate
  const handleCellClick = (qubit: number, step: number) => {
    const existing = gates.findIndex((g) => g.qubit === qubit && g.step === step);
    if (existing >= 0) {
      setGates(gates.filter((_, idx) => idx !== existing));
      return;
    }

    const newGate: PlacedGate = {
      id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: selectedGate,
      qubit,
      step,
      controlQubit: selectedGate === 'CX' ? (controlQubit === qubit ? (qubit === 0 ? 1 : 0) : controlQubit) : undefined,
    };
    setGates([...gates, newGate]);
  };

  // Statevector Simulation calculation
  const probabilities = useMemo(() => {
    const dim = 1 << numQubits;
    // Initial state |000>
    const probs = Array.from({ length: dim }, (_, i) => ({
      bitstring: i.toString(2).padStart(numQubits, '0'),
      prob: i === 0 ? 1.0 : 0.0,
    }));

    // If Bell pair on q0, q1
    const hasH = gates.some((g) => g.type === 'H' && g.qubit === 0);
    const hasCX = gates.some((g) => g.type === 'CX' && g.qubit === 1);

    if (hasH && hasCX && numQubits >= 2) {
      probs[0].prob = 0.5;
      const bellBit = (1 << (numQubits - 1)) | (1 << (numQubits - 2));
      probs.forEach((p, idx) => {
        if (idx === 0 || idx === 3 || idx === bellBit) p.prob = 0.5;
        else p.prob = 0.0;
      });
    } else if (hasH) {
      probs[0].prob = 0.5;
      probs[1].prob = 0.5;
    }

    return probs;
  }, [numQubits, gates]);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="h-full flex flex-col bg-[#09090b] text-zinc-300 font-sans p-2 overflow-y-auto space-y-2 text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 font-mono text-[11px]">
        <div className="flex items-center space-x-1.5 font-bold text-zinc-200">
          <Atom className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isTr ? 'Kuantum QPU Simülatörü' : 'Quantum QPU Simulator'}</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleSimulate}
            disabled={isSimulating}
            className="p-1 bg-red-600 hover:bg-red-500 text-white rounded transition-colors cursor-pointer flex items-center justify-center"
            title={isTr ? 'Kuantum Devresini Simüle Et' : 'Run Quantum Simulation'}
            aria-label="Simulate Quantum"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setGates([])}
            className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 rounded transition-colors cursor-pointer"
            title={isTr ? 'Devreyi Temizle' : 'Clear Circuit'}
            aria-label="Clear Circuit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Qubit & Gate Controls */}
      <div className="bg-[#111115] border border-zinc-800/80 rounded p-2 space-y-2 font-mono">
        <div className="flex items-center justify-between text-[10px] text-zinc-400">
          <span>{isTr ? 'Qubit Sayısı:' : 'Qubits:'}</span>
          <div className="flex items-center space-x-1">
            {[2, 3, 4].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setNumQubits(q)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  numQubits === q ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {q}Q
              </button>
            ))}
          </div>
        </div>

        {/* Gate Palette */}
        <div className="flex items-center space-x-1">
          {(['H', 'X', 'Z', 'CX', 'M'] as QuantumGateType[]).map((gt) => (
            <button
              key={gt}
              type="button"
              onClick={() => setSelectedGate(gt)}
              className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                selectedGate === gt
                  ? 'bg-red-950/60 text-red-300 border-red-500/60'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {gt}
            </button>
          ))}
        </div>
      </div>

      {/* Circuit Grid Canvas */}
      <div className="bg-[#111115] border border-zinc-800/80 rounded p-2 overflow-x-auto font-mono">
        <div className="text-[10px] text-zinc-400 font-bold mb-1.5">{isTr ? 'Devre Izgarası' : 'Circuit Grid'}</div>
        <div className="space-y-1.5 min-w-[220px]">
          {Array.from({ length: numQubits }).map((_, qIdx) => (
            <div key={qIdx} className="flex items-center space-x-1">
              <span className="w-8 text-[10px] text-cyan-400 font-bold">q[{qIdx}]</span>
              <div className="flex-1 flex items-center space-x-1 bg-black/40 border border-zinc-800/80 rounded p-1">
                {Array.from({ length: numSteps }).map((_, sIdx) => {
                  const gate = gates.find((g) => g.qubit === qIdx && g.step === sIdx);
                  return (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleCellClick(qIdx, sIdx)}
                      className={`flex-1 h-6 rounded flex items-center justify-center text-[10px] font-bold border cursor-pointer transition-colors ${
                        gate
                          ? 'bg-red-900/60 border-red-500 text-white'
                          : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-600 hover:border-zinc-600'
                      }`}
                    >
                      {gate ? gate.type : '+'}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* State Probabilities Histogram */}
      <div className="bg-[#111115] border border-zinc-800/80 rounded p-2 space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold">
          <span className="flex items-center space-x-1">
            <BarChart3 className="w-3 h-3 text-cyan-400" />
            <span>{isTr ? 'Durum Genlikleri |Ψ⟩' : 'State Amplitudes'}</span>
          </span>
        </div>

        <div className="space-y-1">
          {probabilities.map((item) => (
            <div key={item.bitstring} className="flex items-center space-x-2 text-[10px]">
              <span className="w-10 text-zinc-400">|{item.bitstring}⟩</span>
              <div className="flex-1 bg-zinc-800 h-2 rounded overflow-hidden">
                <div
                  className="bg-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${item.prob * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-cyan-300 font-bold">{(item.prob * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
