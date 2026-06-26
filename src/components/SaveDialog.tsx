import { Save, X, Download, CheckCircle } from 'lucide-react';
import { serializeDocument } from '../lib/serializer';
import type { DocBookDocument } from '../types/docbook';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  doc: DocBookDocument;
}

export function SaveDialog({ isOpen, onClose, doc }: Props) {
  if (!isOpen) return null;

  function handleDownload() {
    const xml = serializeDocument(doc);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name || 'dokument'}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
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
            <h2 className="font-bold text-gray-900 text-base">Ladda ned fil</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {doc.name || 'dokument'}.xml
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Filen laddas ned som DocBook XML
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#C0002E] rounded-lg hover:bg-[#A00025] transition-colors"
          >
            <Download className="w-4 h-4" />
            Ladda ned
          </button>
        </div>
      </div>
    </div>
  );
}
