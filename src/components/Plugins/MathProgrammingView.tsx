import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Sigma, 
  TrendingUp, 
  Activity, 
  FunctionSquare, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';

export const MathProgrammingView: React.FC = () => {
  const { language } = useI18n();

  // Active subtab: 'plotter' | 'script' | 'matrix' | 'calculus'
  const [activeTab, setActiveTab] = useState<'plotter' | 'script' | 'matrix' | 'calculus'>('plotter');

  // Plotter State
  const [functionExpr, setFunctionExpr] = useState<string>('sin(x) * cos(x/2)');
  const [xMin, setXMin] = useState<number>(-10);
  const [xMax, setXMax] = useState<number>(10);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  // Script REPL State
  const [scriptInput, setScriptInput] = useState<string>(
    `# ViraCode Mathematical Script Engine\nx = 14.5\ny = 8.2\nr = sqrt(x^2 + y^2)\ntheta = atan2(y, x) * (180 / pi)\narea = pi * r^2\nresult = area * log(x)`
  );
  const [evalLogs, setEvalLogs] = useState<Array<{ line: string; result: string; type: 'success' | 'info' | 'error' }>>([
    { line: 'x = 14.5', result: '14.5', type: 'success' },
    { line: 'y = 8.2', result: '8.2', type: 'success' },
    { line: 'r = sqrt(x^2 + y^2)', result: '16.65', type: 'success' },
    { line: 'theta = atan2(y, x) * (180 / pi)', result: '29.49°', type: 'success' },
    { line: 'area = pi * r^2', result: '870.93', type: 'success' },
    { line: 'result = area * log(x)', result: '2328.84', type: 'success' },
  ]);

  // Matrix State
  const [matrixA, setMatrixA] = useState<number[][]>([
    [4, 2],
    [1, 3],
  ]);
  const [matrixB, setMatrixB] = useState<number[][]>([
    [2, -1],
    [0, 5],
  ]);
  const [matrixResult, setMatrixResult] = useState<string>('A x B = [[8, 6], [2, 14]]\ndet(A) = 10\ntr(A) = 7');

  // Calculus State
  const [calcFunc, setCalcFunc] = useState<string>('x^3 - 4*x + 1');
  const [calcPoint, setCalcPoint] = useState<number>(2);
  const [integralA, setIntegralA] = useState<number>(0);
  const [integralB, setIntegralB] = useState<number>(3);
  const [calcResults, setCalcResults] = useState<{ deriv: number; integral: number }>({
    deriv: 8.0,
    integral: 5.25,
  });

  const [copied, setCopied] = useState<boolean>(false);

  // Math Expression Parser helper for plotter
  const evaluateMathExpr = (expr: string, x: number): number => {
    try {
      // Replace safe functions
      const sanitized = expr
        .replace(/\^/g, '**')
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\bexp\b/g, 'Math.exp')
        .replace(/\blog\b/g, 'Math.log')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bpi\b/gi, 'Math.PI')
        .replace(/\be\b/gi, 'Math.E');

      // Simple Function evaluation
      const fn = new Function('x', `return ${sanitized};`);
      const val = fn(x);
      return typeof val === 'number' && !isNaN(val) && isFinite(val) ? val : 0;
    } catch (e) {
      return 0;
    }
  };

  // Draw Function Plot onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#06080d';
    ctx.fillRect(0, 0, width, height);

    // Compute coordinate transforms
    const yMin = -6;
    const yMax = 6;

    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Draw Grid
    ctx.strokeStyle = '#182030';
    ctx.lineWidth = 1;

    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 2) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      ctx.fillStyle = '#4a5568';
      ctx.font = '10px monospace';
      ctx.fillText(`${x}`, sx + 3, height - 6);
    }

    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += 2) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      if (y !== 0) {
        ctx.fillStyle = '#4a5568';
        ctx.font = '10px monospace';
        ctx.fillText(`${y}`, 6, sy - 3);
      }
    }

    // Draw Main Axes
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;

    // X Axis
    const originY = toScreenY(0);
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    const originX = toScreenX(0);
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Plot Curve
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const steps = 400;
    let first = true;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evaluateMathExpr(functionExpr, x);
      const sx = toScreenX(x);
      const sy = toScreenY(y);

      if (first) {
        ctx.moveTo(sx, sy);
        first = false;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();

    // Add glowing shadow curve
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 6;
    ctx.stroke();

  }, [functionExpr, xMin, xMax, activeTab]);

  // Handle Canvas Mouse Move to track coordinates
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const yMin = -6;
    const yMax = 6;

    const mathX = xMin + (px / width) * (xMax - xMin);
    const mathY = yMin + ((height - py) / height) * (yMax - yMin);

    setHoverCoord({
      x: Number(mathX.toFixed(2)),
      y: Number(evaluateMathExpr(functionExpr, mathX).toFixed(3)),
    });
  };

  // Run Script REPL
  const handleRunScript = () => {
    const lines = scriptInput.split('\n');
    const newLogs: Array<{ line: string; result: string; type: 'success' | 'info' | 'error' }> = [];
    const scope: Record<string, number> = {
      pi: Math.PI,
      e: Math.E,
    };

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) {
        if (line) newLogs.push({ line, result: 'Comment', type: 'info' });
        return;
      }

      try {
        if (line.includes('=')) {
          const parts = line.split('=');
          const varName = parts[0].trim();
          let expr = parts.slice(1).join('=').trim();

          // Replace known functions
          expr = expr
            .replace(/\^/g, '**')
            .replace(/\bsqrt\b/g, 'Math.sqrt')
            .replace(/\bsin\b/g, 'Math.sin')
            .replace(/\bcos\b/g, 'Math.cos')
            .replace(/\btan\b/g, 'Math.tan')
            .replace(/\batan2\b/g, 'Math.atan2')
            .replace(/\blog\b/g, 'Math.log')
            .replace(/\bexp\b/g, 'Math.exp')
            .replace(/\babs\b/g, 'Math.abs');

          // Inject scope variables
          const scopeKeys = Object.keys(scope);
          const scopeVals = Object.values(scope);
          const fn = new Function(...scopeKeys, `return (${expr});`);
          const val = fn(...scopeVals);

          scope[varName] = val;
          newLogs.push({
            line,
            result: typeof val === 'number' ? (Number.isInteger(val) ? val.toString() : val.toFixed(4)) : String(val),
            type: 'success',
          });
        } else {
          // Direct eval
          let expr = line
            .replace(/\^/g, '**')
            .replace(/\bsqrt\b/g, 'Math.sqrt')
            .replace(/\bsin\b/g, 'Math.sin')
            .replace(/\bcos\b/g, 'Math.cos')
            .replace(/\blog\b/g, 'Math.log');

          const scopeKeys = Object.keys(scope);
          const scopeVals = Object.values(scope);
          const fn = new Function(...scopeKeys, `return (${expr});`);
          const val = fn(...scopeVals);

          newLogs.push({
            line,
            result: typeof val === 'number' ? (Number.isInteger(val) ? val.toString() : val.toFixed(4)) : String(val),
            type: 'success',
          });
        }
      } catch (err: any) {
        newLogs.push({ line, result: `Error: ${err.message}`, type: 'error' });
      }
    });

    setEvalLogs(newLogs);
  };

  // Calculate Matrix Operations
  const handleMatrixMultiply = () => {
    // 2x2 multiplication
    const a00 = matrixA[0][0], a01 = matrixA[0][1], a10 = matrixA[1][0], a11 = matrixA[1][1];
    const b00 = matrixB[0][0], b01 = matrixB[0][1], b10 = matrixB[1][0], b11 = matrixB[1][1];

    const c00 = a00 * b00 + a01 * b10;
    const c01 = a00 * b01 + a01 * b11;
    const c10 = a10 * b00 + a11 * b10;
    const c11 = a10 * b01 + a11 * b11;

    const detA = a00 * a11 - a01 * a10;
    const trA = a00 + a11;

    setMatrixResult(
      `Matrix Product (A × B) =\n[[${c00}, ${c01}],\n [${c10}, ${c11}]]\n\nDeterminant det(A) = ${detA}\nTrace tr(A) = ${trA}`
    );
  };

  // Calculus Calculation
  const handleCalculateCalculus = () => {
    const h = 0.0001;
    const f = (x: number) => evaluateMathExpr(calcFunc, x);

    // Derivative: (f(x+h) - f(x-h)) / (2h)
    const deriv = (f(calcPoint + h) - f(calcPoint - h)) / (2 * h);

    // Definite integral via Simpson's rule (N=100)
    const n = 100;
    const step = (integralB - integralA) / n;
    let sum = f(integralA) + f(integralB);
    for (let i = 1; i < n; i++) {
      const x = integralA + i * step;
      sum += (i % 2 === 0 ? 2 : 4) * f(x);
    }
    const integral = (step / 3) * sum;

    setCalcResults({
      deriv: Number(deriv.toFixed(4)),
      integral: Number(integral.toFixed(4)),
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#080b11] text-[#c9d1d9] font-sans overflow-hidden p-4">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-3 mb-4 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
              <span>{language === 'tr' ? 'MATEMATİKSEL PROGRAMLAMA & ÇÖZÜCÜ' : 'MATHEMATICAL PROGRAMMING ENGINE'}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-semibold border border-cyan-500/40">
                Scientific REPL
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              {language === 'tr' 
                ? 'Analitik fonksiyon çizici, çok satırlı REPL, matris cebiri ve nümerik kalkülüs stüdyosu' 
                : 'Analytical function curve plotter, multi-line REPL, matrix algebra and numerical calculus studio'}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
          <button
            onClick={() => setActiveTab('plotter')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'plotter' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{language === 'tr' ? 'Grafik Çizici' : 'Plotter'}</span>
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'script' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FunctionSquare className="w-3.5 h-3.5" />
            <span>{language === 'tr' ? 'Matematik REPL' : 'Math REPL'}</span>
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'matrix' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'tr' ? 'Matris Cebiri' : 'Matrix'}</span>
          </button>
          <button
            onClick={() => setActiveTab('calculus')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'calculus' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sigma className="w-3.5 h-3.5" />
            <span>{language === 'tr' ? 'Kalkülüs' : 'Calculus'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Viewports */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* TAB 1: 2D FUNCTION PLOTTER */}
        {activeTab === 'plotter' && (
          <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
            {/* Left Controls */}
            <div className="w-full md:w-80 flex flex-col space-y-3 shrink-0">
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                    {language === 'tr' ? 'Matematiksel Fonksiyon f(x):' : 'Function f(x):'}
                  </label>
                  <div className="flex items-center space-x-1">
                    <span className="text-cyan-400 font-mono text-sm font-bold">f(x) =</span>
                    <input
                      type="text"
                      value={functionExpr}
                      onChange={(e) => setFunctionExpr(e.target.value)}
                      className="flex-1 bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-200 outline-none focus:border-cyan-500"
                      placeholder="sin(x) * cos(x/2)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 block mb-1">X Min:</label>
                    <input
                      type="number"
                      value={xMin}
                      onChange={(e) => setXMin(Number(e.target.value))}
                      className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 block mb-1">X Max:</label>
                    <input
                      type="number"
                      value={xMax}
                      onChange={(e) => setXMax(Number(e.target.value))}
                      className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono text-zinc-200"
                    />
                  </div>
                </div>

                {/* Preset curves */}
                <div>
                  <span className="text-[11px] font-mono text-zinc-400 block mb-1.5">
                    {language === 'tr' ? 'Hazır Fonksiyon Şablonları:' : 'Preset Curves:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Wave', expr: 'sin(x) * cos(x/2)' },
                      { label: 'Polynomial', expr: '0.1 * (x^3 - 3*x)' },
                      { label: 'Gaussian', expr: '3 * exp(-0.2 * x^2)' },
                      { label: 'Damped Sine', expr: 'exp(-0.2*abs(x)) * sin(3*x)' },
                      { label: 'Sigmoid', expr: '4 / (1 + exp(-x)) - 2' },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => setFunctionExpr(p.expr)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] font-mono transition-colors cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hover Coordinates Box */}
                {hoverCoord && (
                  <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-2 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                    <span>X: {hoverCoord.x}</span>
                    <span>Y = f(X): {hoverCoord.y}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Plot View */}
            <div className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between overflow-hidden relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-zinc-400 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2D Kartezyen Koordinat Düzlemi</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-400">f(x) = {functionExpr}</span>
              </div>

              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={680}
                  height={380}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={() => setHoverCoord(null)}
                  className="rounded-lg border border-zinc-800/80 max-w-full max-h-full cursor-crosshair shadow-inner"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MATHEMATICAL SCRIPT REPL */}
        {activeTab === 'script' && (
          <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
            {/* Code Input */}
            <div className="flex-1 flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-zinc-300 font-bold">
                  {language === 'tr' ? 'Matematiksel Betik Editörü' : 'Mathematical Script Editor'}
                </span>
                <button
                  onClick={handleRunScript}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono flex items-center space-x-1.5 shadow transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{language === 'tr' ? 'Hesapla & Çalıştır' : 'Evaluate Script'}</span>
                </button>
              </div>

              <textarea
                value={scriptInput}
                onChange={(e) => setScriptInput(e.target.value)}
                rows={12}
                className="flex-1 bg-black/60 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-cyan-200 outline-none resize-none leading-relaxed focus:border-cyan-500/80"
              />
            </div>

            {/* Evaluated Results Output */}
            <div className="w-full md:w-96 flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-zinc-300 font-bold">
                  {language === 'tr' ? 'Adım Adım Değerlendirme Çıktısı' : 'Step Evaluation Output'}
                </span>
                <button
                  onClick={() => copyToClipboard(evalLogs.map((l) => `${l.line} => ${l.result}`).join('\n'))}
                  className="text-zinc-400 hover:text-white text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex-1 bg-black/60 border border-zinc-800 rounded-lg p-3 font-mono text-xs overflow-y-auto space-y-2">
                {evalLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-zinc-800/60 pb-1.5 last:border-0">
                    <div className="text-zinc-400 text-[11px]">{log.line}</div>
                    <div className={`font-bold mt-0.5 ${log.type === 'error' ? 'text-rose-400' : 'text-cyan-400'}`}>
                      ↳ {log.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MATRIX ALGEBRA */}
        {activeTab === 'matrix' && (
          <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
            <div className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                {language === 'tr' ? '2x2 Matris Parametreleri' : '2x2 Matrix Parameters'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Matrix A */}
                <div className="bg-black/50 border border-zinc-800 rounded-lg p-3">
                  <span className="text-xs font-mono text-cyan-400 font-bold block mb-2">Matris A:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={matrixA[0][0]}
                      onChange={(e) => setMatrixA([[Number(e.target.value), matrixA[0][1]], matrixA[1]])}
                      className="bg-zinc-800 text-center py-1 rounded text-xs font-mono text-white"
                    />
                    <input
                      type="number"
                      value={matrixA[0][1]}
                      onChange={(e) => setMatrixA([[matrixA[0][0], Number(e.target.value)], matrixA[1]])}
                      className="bg-zinc-800 text-center py-1 rounded text-xs font-mono text-white"
                    />
                    <input
                      type="number"
                      value={matrixA[1][0]}
                      onChange={(e) => setMatrixA([matrixA[0], [Number(e.target.value), matrixA[1][1]]])}
                      className="bg-zinc-800 text-center py-1 rounded text-xs font-mono text-white"
                    />
                    <input
                      type="number"
                      value={matrixA[1][1]}
                      onChange={(e) => setMatrixA([matrixA[0], [matrixA[1][0], Number(e.target.value)]])}
                      className="bg-zinc-800 text-center py-1 rounded text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Matrix B */}
                <div className="bg-black/50 border border-zinc-800 rounded-lg p-3">
                  <span className="text-xs font-mono text-purple-400 font-bold block mb-2">Matris B:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={matrixB[0][0]}
                      onChange={(e) => setMatrixB([[Number(e.target.value), matrixB[0][1]], matrixB[1]])}
                      className="bg-zinc-800 text-center py-1 rounded text-xs font-mono text-white"
                    />
                    <input
                      type="number"
                      value={matrixB[0][1]}
                      onChange={(e) => setMatrixB([[matrixB[0][0], Number(e.target.value)], matrixB[1]])}
                      className="bg-zinc-800 text-center py-1 rounded text-xs font-mono text-white"
                    />
                    <input
                      type="number"
                      value={matrixB[1][0]}
                      onChange={(e) => setMatrixB([matrixB[0], [Number(e.target.value), matrixB[1][1]]])}
                      className="bg-zinc-800 text-center py-1 rounded text-xs font-mono text-white"
                    />
                    <input
                      type="number"
                      value={matrixB[1][1]}
                      onChange={(e) => setMatrixB([matrixB[0], [matrixB[1][0], Number(e.target.value)]])}
                      className="bg-zinc-800 text-center py-1 rounded text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleMatrixMultiply}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-lg text-xs font-mono font-bold shadow hover:opacity-95 cursor-pointer"
              >
                {language === 'tr' ? 'Matris Çarpımı (A × B) & Determinant Hesapla' : 'Compute Matrix Product (A × B) & Determinant'}
              </button>
            </div>

            {/* Matrix Output */}
            <div className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col">
              <span className="text-xs font-mono text-zinc-300 font-bold mb-2">
                {language === 'tr' ? 'Lineer Cebir Sonuçları:' : 'Linear Algebra Results:'}
              </span>
              <pre className="flex-1 bg-black/60 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-emerald-300 whitespace-pre-wrap">
                {matrixResult}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: CALCULUS */}
        {activeTab === 'calculus' && (
          <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
            <div className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                {language === 'tr' ? 'Nümerik Türev & Belirli İntegral Çözücü' : 'Numerical Derivative & Definite Integral Solver'}
              </h3>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">f(x):</label>
                <input
                  type="text"
                  value={calcFunc}
                  onChange={(e) => setCalcFunc(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">Türev Noktası (x₀):</label>
                  <input
                    type="number"
                    value={calcPoint}
                    onChange={(e) => setCalcPoint(Number(e.target.value))}
                    className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">İntegral Alt Sınır (a):</label>
                  <input
                    type="number"
                    value={integralA}
                    onChange={(e) => setIntegralA(Number(e.target.value))}
                    className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">İntegral Üst Sınır (b):</label>
                  <input
                    type="number"
                    value={integralB}
                    onChange={(e) => setIntegralB(Number(e.target.value))}
                    className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>

              <button
                onClick={handleCalculateCalculus}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold shadow transition-colors cursor-pointer"
              >
                {language === 'tr' ? 'Nümerik Simpson Kuralı ile Çöz' : 'Solve via Numerical Simpson Rule'}
              </button>
            </div>

            <div className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs font-mono text-zinc-300 font-bold mb-2">
                {language === 'tr' ? 'Hesaplanan Kalkülüs Değerleri:' : 'Calculated Calculus Output:'}
              </span>

              <div className="space-y-4">
                <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-3">
                  <span className="text-[11px] font-mono text-zinc-400 block">Nümerik Türev f'(x₀):</span>
                  <div className="text-lg font-mono font-bold text-cyan-300 mt-1">
                    f'({calcPoint}) ≈ {calcResults.deriv}
                  </div>
                </div>

                <div className="bg-black/60 border border-emerald-500/30 rounded-lg p-3">
                  <span className="text-[11px] font-mono text-zinc-400 block">Belirli İntegral ∫ₐᵇ f(x) dx:</span>
                  <div className="text-lg font-mono font-bold text-emerald-300 mt-1">
                    ∫_{integralA}^{integralB} f(x) dx ≈ {calcResults.integral}
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-zinc-500 mt-4">
                * Simpson Kuralı (N=100 alt aralık) ve Çift Yönlü Sonlu Fark Formülasyonu kullanılmıştır.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
