import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardPaste, X, XCircle } from 'lucide-react';
import { validateDocBookXml } from '../lib/parser';
import type { DocBookDocument } from '../types/docbook';
import type { ImportMode } from '../hooks/useCodeMode';

interface Props {
  onClose: () => void;
  onImport: (doc: DocBookDocument, how: ImportMode) => void;
}

const importOptions: { value: ImportMode; label: string; hint: string }[] = [
  { value: 'append', label: 'Lägg till i slutet', hint: 'Behåller det som redan finns i meddelandet.' },
  { value: 'replace', label: 'Ersätt hela meddelandet', hint: 'Tar bort nuvarande innehåll.' },
];

export function PasteCodeDialog({ onClose, onImport }: Props) {
  const [text, setText] = useState('');
  const [how, setHow] = useState<ImportMode>('append');

  const result = useMemo(() => (text.trim() ? validateDocBookXml(text) : null), [text]);
  const canImport = result?.ok === true;

  function handleImport() {
    if (result?.ok) onImport(result.doc, how);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#C0002E]/10 rounded-lg flex items-center justify-center">
              <ClipboardPaste className="w-4 h-4 text-[#C0002E]" />
            </div>
            <h2 className="font-bold text-gray-900 text-base">Klistra in kod</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <p className="text-sm text-gray-500 leading-relaxed">
            Klistra in färdig DocBook-kod. Den kontrolleras direkt, och du ser hur meddelandet
            blir innan du importerar.
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            autoFocus
            placeholder="<article> ... </article>"
            className="w-full h-56 px-3 py-2.5 text-xs font-mono leading-relaxed border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#C0002E]/30 focus:border-[#C0002E] resize-y"
          />

          {result && !result.ok && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{result.error}</span>
            </div>
          )}

          {result?.ok && (
            <>
              <div className="flex items-start gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Koden är giltig. Hittade {result.doc.sections.length} sektioner,{' '}
                  {(result.doc.rootParas ?? []).length} fristående textblock och{' '}
                  {(result.doc.buttons ?? []).length} knappar.
                </span>
              </div>
              {result.warnings.length > 0 && (
                <ul className="flex flex-col gap-1.5 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                  {result.warnings.map((w) => (
                    <li key={w} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Så importeras koden
            </legend>
            {importOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                  how === opt.value ? 'border-[#C0002E] bg-[#C0002E]/5' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="import-mode"
                  value={opt.value}
                  checked={how === opt.value}
                  onChange={() => setHow(opt.value)}
                  className="mt-1 accent-[#C0002E]"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-800">{opt.label}</span>
                  <span className="block text-xs text-gray-500">{opt.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handleImport}
            disabled={!canImport}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#C0002E] rounded-lg hover:bg-[#A00025] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Importera
          </button>
        </div>
      </div>
    </div>
  );
}
