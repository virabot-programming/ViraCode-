import React, { useState, useRef, useEffect } from 'react';
import { VirtualFile, SASTVulnerability, PerformanceMetric, ASTNode } from '../../types/engine';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { tokenizeCodeToNodes } from './SyntaxTokenizer';
import { useI18n } from '../../i18n/LanguageContext';
import { 
  FileCode, 
  ShieldAlert, 
  Zap, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  Split, 
  Code2, 
  Cpu, 
  Search, 
  Save, 
  CheckCircle2, 
  Wand2, 
  X,
  Download,
  Bot,
  Palette,
  PanelRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CodeEditorProps {
  file: VirtualFile;
  sastIssues: SASTVulnerability[];
  perfMetrics: PerformanceMetric[];
  onUpdateContent: (newContent: string) => void;
  onApplyPatch: (patch: string, line: number) => void;
  onSelectASTNode?: (node: ASTNode) => void;
  isHealedPatchAvailable?: boolean;
  healedPatchCode?: string;
  onOpenViraBot?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  sastIssues,
  perfMetrics,
  onUpdateContent,
  onApplyPatch,
  onSelectASTNode,
  healedPatchCode,
  onOpenViraBot,
}) => {
  const { t, language } = useI18n();
  const [activeLine, setActiveLine] = useState<number>(1);
  const [activeCol, setActiveCol] = useState<number>(1);
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'source' | 'ast' | 'security' | 'perf'>('source');
  const [fontSize, setFontSize] = useState<number>(11);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false); // Collapsed by default for maximum code area
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isColorMode, setIsColorMode] = useState<boolean>(true); // Colored functions and syntax while editable
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Filter file-specific diagnostics
  const fileSast = sastIssues.filter(s => s.file === file.path && s.status === 'OPEN');
  const filePerf = perfMetrics.filter(p => p.file === file.path);
  const errorLines = fileSast.map(s => s.line);
  const warningLines = filePerf.filter(p => p.hotSpotRating !== 'OPTIMAL').map(p => p.line);

  const selectedLineSast = fileSast.find(s => s.line === activeLine);
  const selectedLinePerf = filePerf.find(p => p.line === activeLine);

  const lines = file.content.split('\n');
  const totalLines = lines.length;

  // Search match count
  const matchCount = searchQuery.trim() 
    ? (file.content.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length 
    : 0;

  // Reset dirty status on file change
  useEffect(() => {
    setIsDirty(false);
    setActiveLine(1);
    setActiveCol(1);
  }, [file.path]);

  const updateCursorPosition = (el: HTMLTextAreaElement) => {
    const textBefore = el.value.substring(0, el.selectionStart);
    const splitLines = textBefore.split('\n');
    const line = splitLines.length;
    const col = splitLines[splitLines.length - 1].length + 1;
    setActiveLine(line);
    setActiveCol(col);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setIsDirty(true);
    setSaved(false);
    onUpdateContent(val);
    updateCursorPosition(e.target);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;

    // Tab key inserts 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const newVal = val.substring(0, start) + '    ' + val.substring(end);
      setIsDirty(true);
      onUpdateContent(newVal);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
          updateCursorPosition(textareaRef.current);
        }
      }, 0);
      return;
    }

    // Ctrl+S / Cmd+S save
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
      return;
    }

    // Ctrl+F find
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setShowSearch(prev => !prev);
      return;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleSave = () => {
    setIsDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleFormat = () => {
    // Format: trim trailing whitespace and uniform newlines
    const formatted = file.content
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n');
    onUpdateContent(formatted);
    setIsDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } catch (e) {}
  };

  const handleGutterLineClick = (lineNum: number) => {
    setActiveLine(lineNum);
    if (!textareaRef.current) return;
    
    // Calculate index of this line
    let charIdx = 0;
    for (let i = 0; i < lineNum - 1; i++) {
      charIdx += lines[i].length + 1;
    }
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(charIdx, charIdx);
    updateCursorPosition(textareaRef.current);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1017] border border-zinc-800/80 rounded-lg overflow-hidden shadow-2xl">
      {/* Top Editor Toolbar - Compact */}
      <div className="flex items-center justify-between px-1.5 py-0.5 bg-[#090c12] border-b border-zinc-800 select-none">
        <div className="flex items-center space-x-1">
          {/* File Name Tag */}
          <div className="flex items-center space-x-1 px-1.5 py-0.2 bg-zinc-800/60 border border-zinc-700/50 rounded text-[10px] font-mono text-red-300">
            <FileCode className="w-2.5 h-2.5 text-red-400" />
            <span className="font-semibold">{file.name}</span>
            <span className="text-[9px] text-zinc-400">({file.language.toUpperCase()})</span>
            {isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" title={t.unsavedChanges} />
            )}
          </div>

          {/* Navigation Tabs - Icon Only */}
          <div className="flex items-center space-x-0.5 bg-zinc-900/80 p-0.5 rounded border border-zinc-800 text-[10px]">
            <button
              onClick={() => setSelectedTab('source')}
              className={`p-1 rounded transition-colors flex items-center justify-center cursor-pointer ${
                selectedTab === 'source' ? 'bg-red-500/20 text-red-300 font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title={t.sourceCodeTab}
              aria-label="Source Code"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSelectedTab('ast')}
              className={`p-1 rounded transition-colors flex items-center justify-center cursor-pointer ${
                selectedTab === 'ast' ? 'bg-purple-500/20 text-purple-300 font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title={`${t.astSymbolsTab} (${file.astNodes.length})`}
              aria-label="AST Symbols"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSelectedTab('security')}
              className={`p-1 rounded transition-colors flex items-center justify-center cursor-pointer ${
                selectedTab === 'security'
                  ? 'bg-rose-500/20 text-rose-300 font-medium'
                  : fileSast.length > 0
                  ? 'text-rose-400 hover:text-rose-300 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title={`${t.securitySastTab} (${fileSast.length})`}
              aria-label="Security SAST"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSelectedTab('perf')}
              className={`p-1 rounded transition-colors flex items-center justify-center cursor-pointer ${
                selectedTab === 'perf' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title={`${t.performanceTab} (${filePerf.length})`}
              aria-label="Performance Profile"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Editor Actions - Pure Icon-Only */}
        <div className="flex items-center space-x-1 text-[10px]">
          {/* Syntax Color Mode Toggle */}
          <button
            onClick={() => setIsColorMode(!isColorMode)}
            className={`p-1 rounded transition-all cursor-pointer ${
              isColorMode
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title={t.syntaxColorMode}
            aria-label="Syntax Color Mode"
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
          </button>

          {/* Ask ViraBot AI */}
          {onOpenViraBot && (
            <button
              onClick={onOpenViraBot}
              className="p-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded transition-all shadow shadow-red-950/40 cursor-pointer"
              title={t.aiCopilotTitle}
              aria-label="ViraBot AI"
            >
              <Bot className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Toggle Diagnostics Sidebar */}
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className={`p-1 rounded transition-all cursor-pointer ${
              showDiagnostics
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title={language === 'tr' ? 'Teşhis Panelini Aç/Kapat' : 'Toggle Diagnostics'}
            aria-label="Toggle Diagnostics"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>

          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              showSearch ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Ara (Ctrl+F)"
            aria-label="Find in Code"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Format Code */}
          <button
            onClick={handleFormat}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
            title={t.formatBtn}
            aria-label="Format Code"
          >
            <Wand2 className="w-3.5 h-3.5" />
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`p-1 rounded transition-all cursor-pointer ${
              saved
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                : isDirty
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
            title={saved ? t.savedBtn : t.saveBtn}
            aria-label="Save File"
          >
            {saved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
          </button>

          {/* Download Active File */}
          <button
            onClick={handleDownloadFile}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
            title={t.exportFileBtn}
            aria-label="Download File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Diff View Toggle if Patch is available */}
          {healedPatchCode && (
            <button
              onClick={() => setShowDiff(!showDiff)}
              className={`p-1 rounded transition-all cursor-pointer ${
                showDiff ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
              title={showDiff ? 'Fark Görünümünden Çık' : t.diffViewTab}
              aria-label="Toggle Diff View"
            >
              <Split className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}

          {/* Font Size Adjusters */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5 text-[9px] font-mono">
            <button
              onClick={() => setFontSize(Math.max(10, fontSize - 1))}
              className="px-1 py-0 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              title="A-"
            >
              -
            </button>
            <span className="px-0.5 text-zinc-500">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(16, fontSize + 1))}
              className="px-1 py-0 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              title="A+"
            >
              +
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
            title={t.copyCodeBtn}
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* In-Editor Search Bar (Collapsible) */}
      {showSearch && (
        <div className="px-3 py-1.5 bg-[#080b10] border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-red-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchInCode}
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none focus:border-red-400"
            />
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-zinc-400">
            {searchQuery && (
              <span className="text-red-300">
                {matchCount} {t.matches}
              </span>
            )}
            <button
              onClick={() => setShowSearch(false)}
              className="p-1 hover:text-zinc-200 text-zinc-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Code Viewport & Split Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {selectedTab === 'source' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Split Diff View or Direct Editable Code Editor */}
            {showDiff && healedPatchCode ? (
              <div className="flex-1 grid grid-cols-2 gap-2 h-full p-2 bg-[#0a0c10] overflow-auto">
                <div className="border-r border-zinc-800 pr-2">
                  <div className="text-xs font-mono text-zinc-400 pb-1 mb-2 border-b border-zinc-800">
                    ORIGINAL SOURCE
                  </div>
                  <SyntaxHighlighter
                    code={file.content}
                    language={file.language}
                    activeLine={activeLine}
                    onLineClick={setActiveLine}
                    errorLines={errorLines}
                  />
                </div>
                <div className="pl-2">
                  <div className="text-xs font-mono text-emerald-400 pb-1 mb-2 border-b border-emerald-900/50 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>VIRACODE HEALED PATCH</span>
                    </span>
                    <button
                      onClick={() => onApplyPatch(healedPatchCode, 1)}
                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium cursor-pointer"
                    >
                      Accept Patch
                    </button>
                  </div>
                  <SyntaxHighlighter
                    code={healedPatchCode}
                    language={file.language}
                    highlightLines={[1, 2, 3, 4, 5, 6, 7, 8]}
                  />
                </div>
              </div>
            ) : (
              /* LIVE IN-PLACE EDITABLE CODE EDITOR WITH COLORED FUNCTIONS */
              <div className="flex-1 flex overflow-hidden bg-[#07090e]">
                {/* Gutter (Line Numbers & Diagnostic Markers) - Compact */}
                <div
                  ref={gutterRef}
                  className="w-11 shrink-0 bg-[#06080c] border-r border-zinc-800/80 py-1 overflow-hidden select-none font-mono"
                  style={{ fontSize: `${fontSize}px`, lineHeight: '19px' }}
                >
                  {Array.from({ length: totalLines }).map((_, idx) => {
                    const lineNum = idx + 1;
                    const isActive = activeLine === lineNum;
                    const isError = errorLines.includes(lineNum);
                    const isWarning = warningLines.includes(lineNum);

                    return (
                      <div
                        key={lineNum}
                        onClick={() => handleGutterLineClick(lineNum)}
                        className={`h-[19px] flex items-center justify-between px-1 cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-cyan-950/40 text-cyan-400 font-bold border-l-2 border-cyan-400'
                            : isError
                            ? 'bg-rose-950/30 text-rose-400 font-bold border-l-2 border-rose-500'
                            : isWarning
                            ? 'bg-amber-950/20 text-amber-400 font-bold border-l-2 border-amber-500'
                            : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        <span className="w-2.5 flex items-center justify-center text-[9px]">
                          {isError ? (
                            <span className="text-rose-500 animate-pulse">●</span>
                          ) : isWarning ? (
                            <span className="text-amber-500">▲</span>
                          ) : isActive ? (
                            <span className="text-cyan-400">›</span>
                          ) : null}
                        </span>
                        <span className="text-right flex-1 pr-0.5 font-mono text-[10px]">{lineNum}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Direct Editable Area with Colored Function & Syntax Overlay */}
                <div className="flex-1 relative overflow-hidden bg-[#0a0c10]">
                  {/* Layer 1: Background Syntax Highlighted Layer (Functions Colored in Real Time) */}
                  {isColorMode && (
                    <div
                      ref={highlightRef}
                      className="absolute inset-0 p-1.5 font-mono pointer-events-none whitespace-pre overflow-hidden leading-[19px] select-none"
                      style={{
                        fontSize: `${fontSize}px`,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      }}
                    >
                      {tokenizeCodeToNodes(file.content, file.language)}
                    </div>
                  )}

                  {/* Layer 2: Foreground Editable Textarea (Transparent text over colored syntax) */}
                  <textarea
                    ref={textareaRef}
                    value={file.content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onKeyUp={(e) => updateCursorPosition(e.currentTarget)}
                    onClick={(e) => updateCursorPosition(e.currentTarget)}
                    onScroll={handleScroll}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    className={`absolute inset-0 p-1.5 bg-transparent font-mono resize-none outline-none leading-[19px] whitespace-pre overflow-auto cursor-text caret-red-400 tab-4 ${
                      isColorMode
                        ? 'text-transparent selection:bg-red-500/30 selection:text-transparent'
                        : 'text-zinc-100 selection:bg-red-500/30 selection:text-red-100'
                    }`}
                    style={{
                      fontSize: `${fontSize}px`,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Context Diagnostics Sidebar - Collapsible to give full width to code */}
            {showDiagnostics && (
              <div className="w-64 border-l border-zinc-800/80 bg-[#090b10] flex flex-col overflow-y-auto p-2 space-y-2 text-[10px]">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between pb-1 border-b border-zinc-800">
                  <div className="flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-red-400" />
                    <span>L{activeLine} Teşhis</span>
                  </div>
                  <button
                    onClick={() => setShowDiagnostics(false)}
                    className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                    title="Kapat"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Status Notice */}
                <div className="p-1.5 bg-red-950/20 border border-red-800/40 rounded text-[9px] text-red-300 font-mono flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Palette className="w-3 h-3 shrink-0 text-red-400" />
                    <span>{t.syntaxHighlightActive}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* SAST Alert at Line */}
                {selectedLineSast ? (
                  <div className="p-2 bg-rose-950/40 border border-rose-800/60 rounded space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 font-mono text-[9px] rounded font-bold">
                        {selectedLineSast.severity} SAST
                      </span>
                      <span className="text-[9px] text-zinc-400">{selectedLineSast.ruleName}</span>
                    </div>
                    <p className="text-[10px] text-rose-200 leading-snug font-sans">{selectedLineSast.description}</p>
                    <div className="text-[9px] text-zinc-400">
                      <span className="text-zinc-300 font-semibold">OWASP:</span> {selectedLineSast.owaspCategory}
                    </div>
                    {selectedLineSast.autoFixAvailable && selectedLineSast.patchCode && (
                      <button
                        onClick={() => onApplyPatch(selectedLineSast.patchCode!, selectedLineSast.line)}
                        className="w-full py-1 px-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-medium flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{t.applyPatchBtn}</span>
                      </button>
                    )}
                  </div>
                ) : null}

                {/* Performance Profile at Line */}
                {selectedLinePerf ? (
                  <div className="p-2 bg-amber-950/30 border border-amber-800/50 rounded space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 font-mono text-[9px] rounded font-bold">
                        {selectedLinePerf.hotSpotRating} PERF
                      </span>
                      <span className="text-[9px] font-mono text-zinc-300">{selectedLinePerf.timeComplexity}</span>
                    </div>
                    <div className="text-[9px] text-zinc-300 font-mono flex justify-between">
                      <span>Lat: {selectedLinePerf.latencyEstimateNs}ns</span>
                      <span>Alloc: {selectedLinePerf.allocPerCall}</span>
                    </div>
                    <p className="text-[9px] text-zinc-400">{selectedLinePerf.recommendation}</p>
                  </div>
                ) : null}

                {/* AST Node scope info */}
                <div className="p-2 bg-zinc-900/60 border border-zinc-800 rounded space-y-1 text-[9px] font-mono">
                  <div className="text-zinc-400 text-[9px]">SYMBOL & CONTEXT</div>
                  <div className="space-y-0.5">
                    <div className="text-zinc-300 truncate">File: <span className="text-cyan-300">{file.path}</span></div>
                    <div className="text-zinc-300">{t.complexityScore}: <span className="text-emerald-300">{file.complexityScore}</span></div>
                    <div className="text-zinc-300">Lines: <span className="text-cyan-300">{totalLines}</span></div>
                    <div className="text-zinc-300">Coverage: <span className="text-cyan-300">{file.testCoverage}%</span></div>
                  </div>
                </div>

                {/* Keyboard shortcuts helper */}
                <div className="p-1.5 bg-zinc-950/80 border border-zinc-800/60 rounded text-[9px] font-mono text-zinc-400 space-y-0.5">
                  <div className="flex justify-between"><span>Indent:</span> <kbd className="px-1 bg-zinc-800 rounded text-zinc-300">Tab</kbd></div>
                  <div className="flex justify-between"><span>Save:</span> <kbd className="px-1 bg-zinc-800 rounded text-zinc-300">Ctrl+S</kbd></div>
                  <div className="flex justify-between"><span>Find:</span> <kbd className="px-1 bg-zinc-800 rounded text-zinc-300">Ctrl+F</kbd></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AST Tab */}
        {selectedTab === 'ast' && (
          <div className="flex-1 overflow-y-auto p-4 bg-[#0a0c10] space-y-3 font-mono text-xs">
            <div className="text-zinc-400 text-xs uppercase font-sans font-semibold pb-2 border-b border-zinc-800">
              Virtual Abstract Syntax Tree (AST) Map & Symbol Chains
            </div>
            <div className="space-y-2">
              {file.astNodes.length === 0 ? (
                <div className="text-zinc-500 italic p-4">No top-level AST symbols mapped for this file.</div>
              ) : (
                file.astNodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => {
                      setActiveLine(node.lineStart);
                      setSelectedTab('source');
                      handleGutterLineClick(node.lineStart);
                      onSelectASTNode?.(node);
                    }}
                    className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-lg hover:border-purple-500/50 cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded font-semibold text-[11px]">
                          {node.type}
                        </span>
                        <span className="text-cyan-300 font-bold">{node.name}</span>
                      </div>
                      <span className="text-zinc-500 text-[10px]">
                        L{node.lineStart}:{node.colStart} - L{node.lineEnd}:{node.colEnd}
                      </span>
                    </div>
                    <div className="text-zinc-400 text-[11px]">Scope: <span className="text-zinc-200">{node.scope}</span></div>
                    {node.complexity && (
                      <div className="text-zinc-400 text-[11px]">
                        {t.complexityScore} <span className="text-amber-300 font-semibold">{node.complexity}</span> | {t.memoryImpact}{' '}
                        <span className="text-emerald-300">{node.memoryImpact}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {selectedTab === 'security' && (
          <div className="flex-1 overflow-y-auto p-4 bg-[#0a0c10] space-y-3">
            <div className="text-zinc-400 text-xs uppercase font-sans font-semibold pb-2 border-b border-zinc-800">
              Static Application Security Testing (SAST) Invariants
            </div>
            {fileSast.length === 0 ? (
              <div className="p-6 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-emerald-300 font-medium text-sm">{t.noVulnerabilities}</div>
                <div className="text-zinc-400 text-xs">All memory safety boundaries and zero-trust policies verified.</div>
              </div>
            ) : (
              fileSast.map((issue) => (
                <div key={issue.id} className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 font-mono text-xs rounded font-bold">
                      {issue.severity}: {issue.ruleName}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">Line {issue.line}</span>
                  </div>
                  <div className="text-xs text-rose-200 leading-relaxed">{issue.description}</div>
                  <div className="text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-300">Exploit Vector:</span> {issue.exploitVector}
                  </div>
                  <div className="text-xs text-zinc-400">
                    <span className="font-semibold text-emerald-400">Remediation:</span> {issue.remediation}
                  </div>
                  {issue.autoFixAvailable && issue.patchCode && (
                    <button
                      onClick={() => onApplyPatch(issue.patchCode!, issue.line)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 mt-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.applyPatchBtn}</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Perf Tab */}
        {selectedTab === 'perf' && (
          <div className="flex-1 overflow-y-auto p-4 bg-[#0a0c10] space-y-3">
            <div className="text-zinc-400 text-xs uppercase font-sans font-semibold pb-2 border-b border-zinc-800">
              Computational Complexity & Memory Allocation Profile
            </div>
            {filePerf.map((p) => (
              <div key={p.id} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-cyan-300">{p.functionName}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono text-xs">
                    {p.timeComplexity} Time / {p.spaceComplexity} Space
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-300">
                  <div className="p-2 bg-zinc-800/50 rounded">Latency: {p.latencyEstimateNs} ns</div>
                  <div className="p-2 bg-zinc-800/50 rounded">Memory Alloc: {p.allocPerCall}</div>
                </div>
                <div className="text-xs text-zinc-400">{p.recommendation}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Status Bar - Ultra-Compact */}
      <div className="flex items-center justify-between px-2 py-0.5 bg-[#080a0e] border-t border-zinc-800/80 text-[9px] font-mono text-zinc-400 select-none">
        <div className="flex items-center space-x-3">
          <span className="text-red-300 font-semibold">Ln {activeLine}, Col {activeCol}</span>
          <span>{totalLines} lines</span>
          <span>UTF-8</span>
          <span className="text-red-400 font-bold">{file.language.toUpperCase()}</span>
          <span>{file.size}B</span>
          {isDirty && (
            <span className="text-amber-400 font-medium flex items-center space-x-0.5">
              <span>●</span>
              <span>{t.unsavedChanges}</span>
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE</span>
          </span>
          <span className="text-zinc-500 hidden sm:inline">ViraCode Polyglot Core</span>
        </div>
      </div>
    </div>
  );
};
