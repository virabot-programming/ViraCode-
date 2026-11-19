import React from 'react';
import { Language } from '../../types/engine';

interface SyntaxHighlighterProps {
  code: string;
  language: Language;
  onLineClick?: (line: number) => void;
  activeLine?: number;
  highlightLines?: number[];
  errorLines?: number[];
  warningLines?: number[];
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  code,
  language,
  onLineClick,
  activeLine,
  highlightLines = [],
  errorLines = [],
  warningLines = [],
}) => {
  const lines = code.split('\n');

  const tokenizeLine = (line: string, lang: Language): React.ReactNode[] => {
    if (!line) return [<span key="empty">&nbsp;</span>];

    // Comments
    if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('--')) {
      return [<span key="comm" className="text-zinc-500 italic font-mono">{line}</span>];
    }

    // High-speed regex tokenization
    const tokens: React.ReactNode[] = [];
    const tokenRegex = /(\b(?:fn|pub|struct|impl|async|await|const|let|mut|match|if|else|loop|while|return|use|mod|type|interface|class|enum|package|import|func|var|def|class|lambda|template|constexpr|virtual)\b)|(\b(?:true|false|null|nil|None|Some|Ok|Err|Self|self|this)\b)|(\b(?:u8|u16|u32|u64|usize|i32|i64|f32|f64|bool|str|String|Vec|Arc|AtomicUsize|NonNull|Layout|int|string|error|uint64|int64|bigint|any)\b)|(".*?"|'.*?'|`.*?`)|(\b\d+(?:\.\d+)?(?:ns|ms|MB|GB|KB)?\b)|(\/\/.*$|#.*$)|([{}()[\];,.:&|!<>+\-*/=^%]+)|([a-zA-Z_][a-zA-Z0-9_]*)/g;

    let match: RegExpExecArray | null;
    let lastIndex = 0;
    let keyIdx = 0;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(
          <span key={`txt-${keyIdx++}`} className="text-zinc-300">
            {line.substring(lastIndex, match.index)}
          </span>
        );
      }

      const [full, keyword, boolNull, typeName, strLit, numLit, comment, punct, identifier] = match;

      if (keyword) {
        tokens.push(
          <span key={`kw-${keyIdx++}`} className="text-purple-400 font-semibold">
            {keyword}
          </span>
        );
      } else if (boolNull) {
        tokens.push(
          <span key={`bn-${keyIdx++}`} className="text-amber-400 font-semibold">
            {boolNull}
          </span>
        );
      } else if (typeName) {
        tokens.push(
          <span key={`ty-${keyIdx++}`} className="text-cyan-300 font-medium">
            {typeName}
          </span>
        );
      } else if (strLit) {
        tokens.push(
          <span key={`str-${keyIdx++}`} className="text-emerald-300">
            {strLit}
          </span>
        );
      } else if (numLit) {
        tokens.push(
          <span key={`num-${keyIdx++}`} className="text-amber-300">
            {numLit}
          </span>
        );
      } else if (comment) {
        tokens.push(
          <span key={`cm-${keyIdx++}`} className="text-zinc-500 italic">
            {comment}
          </span>
        );
      } else if (punct) {
        tokens.push(
          <span key={`pu-${keyIdx++}`} className="text-zinc-400">
            {punct}
          </span>
        );
      } else if (identifier) {
        // Method / Function call check
        const isFn = line.slice(match.index + identifier.length).trim().startsWith('(');
        tokens.push(
          <span
            key={`id-${keyIdx++}`}
            className={isFn ? 'text-blue-300 font-medium' : 'text-slate-200'}
          >
            {identifier}
          </span>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push(
        <span key={`tail-${keyIdx++}`} className="text-zinc-300">
          {line.substring(lastIndex)}
        </span>
      );
    }

    return tokens.length > 0 ? tokens : [<span key="plain">{line}</span>];
  };

  return (
    <div className="font-mono text-[13px] leading-[21px] select-text">
      {lines.map((lineText, idx) => {
        const lineNum = idx + 1;
        const isActive = activeLine === lineNum;
        const isHighlight = highlightLines.includes(lineNum);
        const isError = errorLines.includes(lineNum);
        const isWarning = warningLines.includes(lineNum);

        let rowBg = 'hover:bg-zinc-800/40';
        if (isActive) rowBg = 'bg-cyan-950/40 border-l-2 border-cyan-400';
        else if (isError) rowBg = 'bg-rose-950/30 border-l-2 border-rose-500';
        else if (isWarning) rowBg = 'bg-amber-950/30 border-l-2 border-amber-500';
        else if (isHighlight) rowBg = 'bg-indigo-950/40 border-l-2 border-indigo-400';

        return (
          <div
            key={lineNum}
            onClick={() => onLineClick?.(lineNum)}
            className={`flex items-start group px-2 py-[1px] transition-colors cursor-pointer ${rowBg}`}
          >
            {/* Line Number */}
            <span
              className={`w-10 text-right pr-4 shrink-0 select-none text-xs transition-colors ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : isError
                  ? 'text-rose-400 font-bold'
                  : isWarning
                  ? 'text-amber-400 font-bold'
                  : 'text-zinc-600 group-hover:text-zinc-400'
              }`}
            >
              {lineNum}
            </span>

            {/* Diagnostics gutter icon */}
            <span className="w-4 shrink-0 flex items-center justify-center text-[10px] select-none">
              {isError && <span className="text-rose-400 font-bold" title="SAST / Compiler Error">●</span>}
              {!isError && isWarning && <span className="text-amber-400 font-bold" title="Warning">▲</span>}
              {!isError && !isWarning && isHighlight && <span className="text-indigo-400 font-bold">▶</span>}
            </span>

            {/* Line Content */}
            <div className="flex-1 overflow-x-auto whitespace-pre pl-2">
              {tokenizeLine(lineText, language)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
