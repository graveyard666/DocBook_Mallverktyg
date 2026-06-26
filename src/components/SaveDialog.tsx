import { useState } from 'react';
import { Save, X, Download } from 'lucide-react';
import { serializeDocument } from '../lib/serializer';
import type { DocBookDocument } from '../types/docbook';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  doc: DocBookDocument;
  onSaved: () => void;
}

export function SaveDialog({ isOpen, onClose, doc, onSaved }: Props) {
  const defaultName = `${doc.name || 'dokument'}.xml`;
  const [fileName, setFileName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  function resolvedName(): string {
    const name = fileName.trim() || defaultName;
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
    const xml = serializeDocument(doc);
    const name = resolvedName();

    try {
      if (typeof window.showSaveFilePicker === 'function') {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: name,
            types: [{ description: 'DocBook XML', accept: { 'application/xml': ['.xml'] } }],
          });
          const writable = await handle.createWritable();
          await writable.write(xml);
          await writable.close();
        } catch (err: any) {
          // User cancelled the picker — fall back to Downloads silently
          if (err?.name === 'AbortError') {
            fallbackDownload(xml, name);
          } else {
            throw err;
          }
        }
      } else {
        fallbackDownload(xml, name);
      }
      onSaved();
      onClose();
    } finally {
      setIsSaving(false);
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
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            En dialogruta öppnas där du väljer var filen ska sparas. Om du stänger dialogen sparas
            filen i din{' '}
            <span className="font-semibold text-gray-700">Hämtningar</span>-mapp automatiskt.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Filnamn
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isSaving && handleSave()}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C0002E]/30 focus:border-[#C0002E] font-mono"
              placeholder="filnamn.xml"
              spellCheck={false}
              autoFocus
            />
          </div>
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
            {isSaving ? 'Sparar...' : 'Spara'}
          </button>
        </div>
      </div>
    </div>
  );
}
