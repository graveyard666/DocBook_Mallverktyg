import { useRef } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { highlightXml } from '../../lib/xmlHighlight';

interface Props {
  value: string;
  onChange: (text: string) => void;
  error: string | null;
  warnings: string[];
}

export function CodeEditor({ value, onChange, error, warnings }: Props) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  function syncScroll() {
    if (!textRef.current || !highlightRef.current) return;
    highlightRef.current.scrollTop = textRef.current.scrollTop;
    highlightRef.current.scrollLeft = textRef.current.scrollLeft;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
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

  return (
    <div className="h-full flex flex-col bg-[#1E1E2E]">
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-white/10 min-h-[44px] flex items-center">
        {error ? (
          <div className="flex items-start gap-2 text-xs text-red-300">
            <XCircle className="w-4 h-4 flex-shrink-0 mt-px" />
            <span>
              {error} Rätta felet innan du går tillbaka till grafiskt läge.
            </span>
          </div>
        ) : warnings.length > 0 ? (
          <div className="flex items-start gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-px" />
            <ul className="space-y-0.5">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
            <span>Koden är giltig och förhandsgranskningen är uppdaterad.</span>
          </div>
        )}
      </div>

      <div className="relative flex-1 overflow-hidden">
        <pre
          ref={highlightRef}
          aria-hidden
          className="absolute inset-0 m-0 p-4 font-mono text-xs leading-relaxed whitespace-pre overflow-hidden pointer-events-none"
          dangerouslySetInnerHTML={{ __html: `${highlightXml(value)}\n` }}
        />
        <textarea
          ref={textRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          aria-label="DocBook-kod"
          className="absolute inset-0 w-full h-full m-0 p-4 font-mono text-xs leading-relaxed whitespace-pre bg-transparent text-transparent caret-white resize-none outline-none overflow-auto"
        />
      </div>
    </div>
  );
}
