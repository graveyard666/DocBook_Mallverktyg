import { useState } from 'react';
import { Save, X, Download, FolderOpen, FileOutput } from 'lucide-react';
import { serializeDocument } from '../lib/serializer';
import type { DocBookDocument } from '../types/docbook';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  doc: DocBookDocument;
  folderName: string | null;
  originalFileName: string | null;
  onSaved: () => void;
}

type SaveMode = 'folder' | 'new';

export function SaveDialog({ isOpen, onClose, doc, folderName, originalFileName, onSaved }: Props) {
  const [mode, setMode] = useState<SaveMode>(() => (folderName && originalFileName ? 'folder' : 'new'));
  const [fileName, setFileName] = useState(() => originalFileName ?? `${doc.name || 'dokument'}.xml`);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasFolderMode = !!(folderName && originalFileName);
  const supportsFilePicker = typeof window.showSaveFilePicker === 'function';

  function resolvedName(): string {
    const name = fileName.trim() || `${doc.name || 'dokument'}.xml`;
    return name.endsWith('.xml') ? name : `${name}.xml`;
  }

  function fallbackDownload(xml: string, name: string) {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleSave() {
    setIsSaving(true);
    setErrorMsg(null);
    const xml = serializeDocument(doc);
    const name = resolvedName();

    try {
      if (mode === 'folder' && supportsFilePicker) {
        // Open the native OS save dialog — browser remembers last-used folder
        const handle = await window.showSaveFilePicker!({
          suggestedName: name,
          types: [{ description: 'DocBook XML', accept: { 'application/xml': ['.xml'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(xml);
        await writable.close();
      } else {
        fallbackDownload(xml, name);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      // AbortError means user dismissed the picker — not a real error
      if (err?.name !== 'AbortError') {
        setErrorMsg('Något gick fel. Försök igen eller välj "Ladda ned som ny fil".');
      }
    } finally {
      setIsSaving(false);
    }
  }

  function handleModeChange(m: SaveMode) {
    setMode(m);
    setErrorMsg(null);
    if (m === 'folder' && originalFileName) {
      setFileName(originalFileName);
    } else if (m === 'new') {
      setFileName(`${doc.name || 'dokument'}.xml`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#C0002E]/10 rounded-lg flex items-center justify-center">
              <Save className="w-4 h-4 text-[#C0002E]" />
            </div>
            <h2 className="font-bold text-gray-900 text-base">Spara fil</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          {/* Mode selector — only shown when a folder template is active */}
          {hasFolderMode && (
            <div className="space-y-2">
              <button
                onClick={() => handleModeChange('folder')}
                className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                  mode === 'folder'
                    ? 'border-[#C0002E] bg-[#C0002E]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                    mode === 'folder' ? 'border-[#C0002E]' : 'border-gray-300'
                  }`}
                >
                  {mode === 'folder' && <div className="w-2 h-2 rounded-full bg-[#C0002E]" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <p className="text-sm font-semibold text-gray-900">Spara i mapp</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate" title={folderName!}>
                    {folderName}
                    {!supportsFilePicker && (
                      <span className="ml-1 text-amber-500">(sparar i Hämtningar)</span>
                    )}
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleModeChange('new')}
                className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                  mode === 'new'
                    ? 'border-[#C0002E] bg-[#C0002E]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                    mode === 'new' ? 'border-[#C0002E]' : 'border-gray-300'
                  }`}
                >
                  {mode === 'new' && <div className="w-2 h-2 rounded-full bg-[#C0002E]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <FileOutput className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <p className="text-sm font-semibold text-gray-900">Ladda ned som ny fil</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Välj eget filnamn</p>
                </div>
              </button>
            </div>
          )}

          {/* Filename input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Filnamn
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C0002E]/30 focus:border-[#C0002E] font-mono"
              placeholder="filnamn.xml"
              spellCheck={false}
            />
            {mode === 'folder' && supportsFilePicker && (
              <p className="text-xs text-gray-400 leading-snug">
                En dialogruta öppnas där du kan navigera till mappen{' '}
                <span className="font-semibold text-gray-600">{folderName}</span> och spara direkt.
              </p>
            )}
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Avbryt
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#C0002E] rounded-lg hover:bg-[#A00025] transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isSaving ? 'Sparar...' : mode === 'folder' && supportsFilePicker ? 'Spara' : 'Ladda ned'}
          </button>
        </div>
      </div>
    </div>
  );
}
