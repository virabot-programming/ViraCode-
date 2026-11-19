import React from 'react';
import { Language } from '../../types/engine';

export function tokenizeCodeToNodes(code: string, language: Language): React.ReactNode {
  const lines = code.split('\n');

  return lines.map((line, lineIdx) => {
    if (!line) {
      return (
        <div key={`line-${lineIdx}`} className="h-[19px] leading-[19px]">
          &nbsp;
        </div>
      );
    }

    // Comment check
    const trimmed = line.trimStart();
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('--')) {
      const leadingSpaces = line.length - trimmed.length;
      return (
        <div key={`line-${lineIdx}`} className="h-[19px] leading-[19px]">
          <span>{line.slice(0, leadingSpaces)}</span>
          <span className="text-zinc-500 italic">{trimmed}</span>
        </div>
      );
    }

    const tokens: React.ReactNode[] = [];
    // Token regex detecting keywords, types, strings, numbers, comments, identifiers, punctuation including QASM/Quantum
    const tokenRegex = /(\b(?:fn|pub|struct|impl|async|await|const|let|mut|match|if|else|loop|while|return|use|mod|type|interface|class|enum|package|import|func|var|def|lambda|template|constexpr|virtual|export|default|from|qubit|qreg|creg|gate|measure|barrier|reset|include|OPENQASM)\b)|(\b(?:true|false|null|nil|None|Some|Ok|Err|Self|self|this)\b)|(\b(?:u8|u16|u32|u64|usize|i32|i64|f32|f64|bool|str|String|Vec|Arc|AtomicUsize|AtomicBool|NonNull|Layout|int|string|error|uint64|int64|bigint|any|Result|Option|Promise|Record|QuantumCircuit|Statevector|Qubit|QuantumRegister|ClassicalRegister|Complex|Matrix|ndarray)\b)|(".*?"|'.*?'|`.*?`)|(\b\d+(?:\.\d+)?(?:ns|ms|s|MB|GB|KB|B|pi|rad|deg)?\b)|(\/\/.*$|#.*$)|([{}()[\];,.:&|!<>+\-*/=^%]+)|([a-zA-Z_][a-zA-Z0-9_]*)/g;

    let match: RegExpExecArray | null;
    let lastIndex = 0;
    let tokenKey = 0;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(
          <span key={`txt-${lineIdx}-${tokenKey++}`} className="text-zinc-300">
            {line.substring(lastIndex, match.index)}
          </span>
        );
      }

      const [full, keyword, boolNull, typeName, strLit, numLit, inlineComment, punct, identifier] = match;

      if (keyword) {
        tokens.push(
          <span key={`kw-${lineIdx}-${tokenKey++}`} className="text-purple-400 font-semibold">
            {keyword}
          </span>
        );
      } else if (boolNull) {
        tokens.push(
          <span key={`bn-${lineIdx}-${tokenKey++}`} className="text-amber-400 font-semibold">
            {boolNull}
          </span>
        );
      } else if (typeName) {
        tokens.push(
          <span key={`ty-${lineIdx}-${tokenKey++}`} className="text-teal-300 font-medium">
            {typeName}
          </span>
        );
      } else if (strLit) {
        tokens.push(
          <span key={`str-${lineIdx}-${tokenKey++}`} className="text-emerald-300">
            {strLit}
          </span>
        );
      } else if (numLit) {
        tokens.push(
          <span key={`num-${lineIdx}-${tokenKey++}`} className="text-amber-300 font-mono">
            {numLit}
          </span>
        );
      } else if (inlineComment) {
        tokens.push(
          <span key={`cm-${lineIdx}-${tokenKey++}`} className="text-zinc-500 italic">
            {inlineComment}
          </span>
        );
      } else if (punct) {
        tokens.push(
          <span key={`pu-${lineIdx}-${tokenKey++}`} className="text-zinc-400">
            {punct}
          </span>
        );
      } else if (identifier) {
        // Specifically detect function calls or declarations:
        const following = line.slice(match.index + identifier.length).trimStart();
        const isFunctionCall = following.startsWith('(') || following.startsWith('!(');
        
        // Also check if preceding word in line is `fn`, `func`, `def`, `function`, `gate`
        const preceding = line.slice(0, match.index).trimEnd();
        const isFunctionDef = /\b(?:fn|func|def|function|gate)\b$/.test(preceding);

        if (isFunctionDef) {
          tokens.push(
            <span key={`fnDef-${lineIdx}-${tokenKey++}`} className="text-sky-300 font-bold tracking-wide">
              {identifier}
            </span>
          );
        } else if (isFunctionCall) {
          tokens.push(
            <span key={`fnCall-${lineIdx}-${tokenKey++}`} className="text-blue-300 font-semibold">
              {identifier}
            </span>
          );
        } else {
          tokens.push(
            <span key={`id-${lineIdx}-${tokenKey++}`} className="text-zinc-200">
              {identifier}
            </span>
          );
        }
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push(
        <span key={`tail-${lineIdx}-${tokenKey++}`} className="text-zinc-300">
          {line.substring(lastIndex)}
        </span>
      );
    }

    return (
      <div key={`line-${lineIdx}`} className="h-[19px] leading-[19px] whitespace-pre">
        {tokens}
      </div>
    );
  });
}
