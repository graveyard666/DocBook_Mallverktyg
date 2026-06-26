import { useState } from 'react';
import { Save, X, FileOutput, FilePen, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { serializeDocument } from '../lib/serializer';
import type { DocBookDocument } from '../types/docbook';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  doc: DocBookDocument;
  activeFileHandle: FileSystemFileHandle | null;
  onSavedAs: (newHandle: FileSystemFileHandle) => void;
}

type SaveMode = 'overwrite' | 'new';
type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export function SaveDialog({ isOpen, onClose, doc, activeFileHandle, onSavedAs }: Props) {
  const [mode, setMode] = useState<SaveMode>(activeFileHandle ? 'overwrite' : 'new');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isFileApiSupported = 'showSaveFilePicker' in window;

  async function handleSave() {
    setStatus('saving');
    setErrorMsg('');
    const xml = serializeDocument(doc);

    try {
      if (mode === 'overwrite' && activeFileHandle) {
        const perm = await activeFileHandle.requestPermission({ mode: 'readwrite' });
        if (perm !== 'granted') throw new Error('Åtkomst nekad');
        const writable = await activeFileHandle.createWritable();
        await writable.write(xml);
        await writable.close();
        setStatus('success');
      } else {
        const handle = await (
          window as Window & {
            showSaveFilePicker: (opts?: object) => Promise<FileSystemFileHandle>;
          }
        ).showSaveFilePicker({
          suggestedName: `${doc.name}.xml`,
          types: [{ description: 'DocBook XML', accept: { 'application/xml': ['.xml'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(xml);
        await writable.close();
        onSavedAs(handle);
        setStatus('success');
      }
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      if (err?.name === 'AbortError') {
        setStatus('idle');
      } else {
        setStatus('error');
        setErrorMsg(err?.message ?? 'Okänt fel');
      }
    }
  }

  function handleClose() {
    setStatus('idle');
    setErrorMsg('');
    // Reset mode to prefer overwrite if handle available
    setMode(activeFileHandle ? 'overwrite' : 'new');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#C0002E]/10 rounded-lg flex items-center justify-center">
              <Save className="w-4 h-4 text-[#C0002E]" />
            </div>
            <h2 className="font-bold text-gray-900 text-base">Spara fil</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          {status === 'success' ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-green-800">Filen sparades!</p>
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div className="flex gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl mb-1">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errorMsg || 'Kunde inte spara filen.'}</p>
                </div>
              )}

              {/* Option: overwrite */}
              {activeFileHandle && (
                <button
                  onClick={() => setMode('overwrite')}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    mode === 'overwrite'
                      ? 'border-[#C0002E] bg-[#C0002E]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors ${
                      mode === 'overwrite' ? 'border-[#C0002E]' : 'border-gray-300'
                    }`}
                  >
                    {mode === 'overwrite' && (
                      <div className="w-2 h-2 rounded-full bg-[#C0002E]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FilePen className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <p className="text-sm font-semibold text-gray-900">Skriv över originalfilen</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                      {activeFileHandle.name}
                    </p>
                  </div>
                </button>
              )}

              {/* Option: save as new */}
              <button
                onClick={() => setMode('new')}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  mode === 'new'
                    ? 'border-[#C0002E] bg-[#C0002E]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors ${
                    mode === 'new' ? 'border-[#C0002E]' : 'border-gray-300'
                  }`}
                >
                  {mode === 'new' && <div className="w-2 h-2 rounded-full bg-[#C0002E]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <FileOutput className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <p className="text-sm font-semibold text-gray-900">Spara som ny fil</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Välj plats och filnamn via ett dialogfönster
                  </p>
                </div>
              </button>

              {!isFileApiSupported && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                  Filsparning kräver Chrome eller Edge — stöds ej i Firefox och Safari.
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          {status === 'success' ? (
            <button
              onClick={handleClose}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#C0002E] rounded-lg hover:bg-[#A00025] transition-colors"
            >
              Stäng
            </button>
          ) : (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleSave}
                disabled={status === 'saving' || !isFileApiSupported}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#C0002E] rounded-lg hover:bg-[#A00025] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'saving' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sparar...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Spara
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
