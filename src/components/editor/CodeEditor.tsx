import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { highlightXml } from '../../lib/xmlHighlight';
import { validateDocBookXml } from '../../lib/parser';
import type { CodeStatus } from '../../hooks/useCodeMode';

interface Props {
  value: string;
  onChange: (text: string) => void;
  status: CodeStatus | null;
}

interface PendingReplace {
  text: string;
  sections: number;
  textBlocks: number;
  buttons: number;
}

export function CodeEditor({ value, onChange, status }: Props) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [pending, setPending] = useState<PendingReplace | null>(null);

  const errorLine = status?.ok === false ? status.line : null;

  function syncScroll() {
    if (!textRef.current || !highlightRef.current) return;
    highlightRef.current.scrollTop = textRef.current.scrollTop;
    highlightRef.current.scrollLeft = textRef.current.scrollLeft;
  }

  function jumpToLine(line: number) {
    const el = textRef.current;
    if (!el) return;
    const lines = value.split('\n');
    const offset = lines.slice(0, line - 1).reduce((sum, l) => sum + l.length + 1, 0);
    el.focus();
    el.setSelectionRange(offset, offset + (lines[line - 1]?.length ?? 0));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart, selectionEnd } = el;
    const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = selectionStart + 2;
    });
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    if (!value.trim()) return;
    const text = e.clipboardData.getData('text/plain');
    if (!/<article[\s>]/.test(text)) return;
    const result = validateDocBookXml(text);
    if (!result.ok) return;
    e.preventDefault();
    setPending({
      text,
      sections: result.doc.sections.length,
      textBlocks: (result.doc.rootParas ?? []).length,
      buttons: (result.doc.buttons ?? []).length,
    });
  }

  function confirmReplace() {
    if (!pending) return;
    onChange(pending.text);
    setPending(null);
  }

  function renderStatus() {
    if (pending) {
      return (
        <div className="flex flex-wrap items-center gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            Ersätt hela meddelandet med det inklistrade ({pending.sections} sektioner,{' '}
            {pending.textBlocks} textblock, {pending.buttons} knappar)?
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setPending(null)}
              className="px-2.5 py-1 rounded-md text-gray-200 border border-white/20 hover:bg-white/10 transition-colors"
            >
              Avbryt
            </button>
            <button
              onClick={confirmReplace}
              className="px-2.5 py-1 rounded-md font-semibold text-white bg-[#C0002E] hover:bg-[#A00025] transition-colors"
            >
              Ersätt
            </button>
          </div>
        </div>
      );
    }
    if (!status) return null;
    if (!status.ok) {
      const errorLine = status.line;
      return (
        <div className="flex items-start gap-2 text-xs text-red-300">
          <XCircle className="w-4 h-4 flex-shrink-0 mt-px" />
          <span>
            {status.message} Rätta felet innan du går tillbaka till grafiskt läge.
            {errorLine !== null && (
              <>
                {' '}
                <button
                  onClick={() => jumpToLine(errorLine)}
                  className="font-semibold underline underline-offset-2 hover:text-red-200"
                >
                  Visa rad {errorLine}
                </button>
              </>
            )}
          </span>
        </div>
      );
    }
    if (status.warnings.length > 0) {
      return (
        <div className="flex items-start gap-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-px" />
          <ul className="space-y-0.5">
            {status.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-300">
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        <span>
          Koden är giltig: {status.sections} sektioner, {status.textBlocks} textblock och{' '}
          {status.buttons} knappar.
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1E1E2E]">
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-white/10 min-h-[44px] flex items-center">
        {renderStatus()}
      </div>

      <div className="relative flex-1 overflow-hidden">
        <pre
          ref={highlightRef}
          aria-hidden
          className="absolute inset-0 m-0 p-4 font-mono text-xs leading-relaxed whitespace-pre overflow-hidden pointer-events-none"
          dangerouslySetInnerHTML={{ __html: `${highlightXml(value, errorLine)}\n` }}
        />
        <textarea
          ref={textRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          spellCheck={false}
          aria-label="DocBook-kod"
          className="absolute inset-0 w-full h-full m-0 p-4 font-mono text-xs leading-relaxed whitespace-pre bg-transparent text-transparent caret-white resize-none outline-none overflow-auto"
        />
      </div>
    </div>
  );
}
