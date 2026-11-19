import React, { useState } from 'react';
import { TestSuiteRun } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';
import { FlaskConical, CheckCircle, Play, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TestRunnerProps {
  testSuites: TestSuiteRun[];
  onTriggerFixTests?: () => void;
}

export const TestRunner: React.FC<TestRunnerProps> = ({ testSuites }) => {
  const { t, language } = useI18n();
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [suites] = useState<TestSuiteRun[]>(testSuites);

  const totalTests = suites.reduce((acc, s) => acc + s.totalTests, 0);
  const passedTests = suites.reduce((acc, s) => acc + s.passed, 0);
  const failedTests = suites.reduce((acc, s) => acc + s.failed, 0);
  const avgCoverage = Math.round(suites.reduce((acc, s) => acc + s.coveragePct, 0) / (suites.length || 1));

  const handleRunAll = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-[#080a0e] border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-zinc-200">{t.qaRunnerTitle}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 font-mono">
            {t.qaTargetSubtitle}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunAll}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isRunning
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
            }`}
          >
            {isRunning ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? (language === 'tr' ? 'Paketler Koşuluyor...' : 'Running Suites...') : t.runAllTestsBtn}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-[#090b10] border-b border-zinc-800 font-mono text-xs">
        <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
          <div className="text-zinc-500 text-[10px]">{t.totalTestsLabel.toUpperCase()}</div>
          <div className="text-base font-bold text-zinc-100">{totalTests} Tests</div>
        </div>
        <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-lg">
          <div className="text-emerald-400 text-[10px]">{t.passedLabel.toUpperCase()} ASSERTIONS</div>
          <div className="text-base font-bold text-emerald-300">{passedTests} (100%)</div>
        </div>
        <div className="p-2.5 bg-rose-950/20 border border-rose-800/30 rounded-lg">
          <div className="text-rose-400 text-[10px]">{t.failedLabel.toUpperCase()} REGRESSIONS</div>
          <div className="text-base font-bold text-rose-300">{failedTests}</div>
        </div>
        <div className="p-2.5 bg-indigo-950/30 border border-indigo-800/40 rounded-lg">
          <div className="text-indigo-400 text-[10px]">{t.coverageLabel.toUpperCase()}</div>
          <div className="text-base font-bold text-indigo-300">{avgCoverage}%</div>
        </div>
      </div>

      {/* Suites List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0c10]">
        {suites.map((suite) => (
          <div key={suite.id} className="p-4 bg-zinc-950/80 border border-zinc-800/90 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-zinc-200 font-mono">{suite.suiteName}</span>
                <span className="text-[10px] text-zinc-500 font-mono">{suite.file}</span>
              </div>
              <div className="flex items-center space-x-2 font-mono text-[11px]">
                <span className="text-emerald-400">{suite.passed}/{suite.totalTests} passed</span>
                <span className="text-zinc-500">({suite.durationMs}ms)</span>
              </div>
            </div>

            {/* Test Cases inside suite */}
            <div className="space-y-2 pt-1">
              {suite.tests.map((test) => (
                <div
                  key={test.id}
                  className="p-2.5 bg-zinc-900/50 border border-zinc-800/80 rounded-lg space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span className="text-zinc-200 font-semibold">{test.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-purple-300 uppercase">
                        {test.type}
                      </span>
                      <span className="text-zinc-400">{test.durationMs}ms</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-400 font-sans pl-4">
                    <span className="text-zinc-500 font-semibold">Boundary Verified:</span> {test.edgeCaseCovered}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
