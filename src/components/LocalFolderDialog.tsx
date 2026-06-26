import { Folder, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { openFolderPicker } from '../lib/openFolder';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  folderName: string | null;
  templateCount: number;
  skippedCount: number;
  onLoadFiles: (files: FileList) => Promise<void>;
  onClear: () => void;
}

export function LocalFolderDialog({
  isOpen,
  onClose,
  isLoading,
  folderName,
  templateCount,
  skippedCount,
  onLoadFiles,
  onClear,
}: Props) {
  if (!isOpen) return null;

  function pickFolder() {
    openFolderPicker(onLoadFiles);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#C0002E]/10 rounded-lg flex items-center justify-center">
              <Folder className="w-4 h-4 text-[#C0002E]" />
            </div>
            <h2 className="font-bold text-gray-900 text-base">Mina mallar</h2>
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
          <p className="text-sm text-gray-600 leading-relaxed">
            Välj en lokal mapp på din dator. Alla{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">.xml</code>
            -filer som innehåller giltig DocBook-kod visas som mallar under{' '}
            <strong className="text-gray-800">Mina mallar</strong> i sidopanelen.
          </p>

          {folderName && (
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
              <Folder className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{folderName}</p>
                {isLoading ? (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Skannar filer...
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {templateCount} mall{templateCount !== 1 ? 'ar' : ''} hittade
                    {skippedCount > 0 && (
                      <span className="text-amber-600">
                        {' '}— {skippedCount} fil{skippedCount !== 1 ? 'er' : ''} ignorerade
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}

          {!isLoading && templateCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3.5 py-2.5 rounded-xl border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                {templateCount} giltig{templateCount !== 1 ? 'a' : ''} DocBook-mall
                {templateCount !== 1 ? 'ar' : ''} redo att använda
              </span>
            </div>
          )}

          {!isLoading && skippedCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3.5 py-2.5 rounded-xl border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>
                {skippedCount} fil{skippedCount !== 1 ? 'er' : ''} ignorerade — inte giltig DocBook XML
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          {folderName ? (
            <>
              <button
                onClick={onClear}
                className="text-sm text-gray-400 hover:text-red-600 transition-colors"
              >
                Ta bort mapp
              </button>
              <div className="flex gap-2">
                <button
                  onClick={pickFolder}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Byt mapp
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#C0002E] rounded-lg hover:bg-[#A00025] transition-colors"
                >
                  Klar
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={pickFolder}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#C0002E] rounded-lg hover:bg-[#A00025] transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Folder className="w-4 h-4" />}
                Välj mapp
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
