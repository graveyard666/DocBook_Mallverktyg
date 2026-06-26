import { useRef } from 'react';
import { FileText, Plus, BookOpen, Folder, FolderOpen, FolderPlus } from 'lucide-react';
import { exampleTemplates, type ExampleTemplate } from '../data/examples';
import type { LocalTemplate } from '../hooks/useLocalTemplates';

interface Props {
  onLoadExample: (id: string) => void;
  onNewBlank: () => void;
  activeExampleId: string | null;
  localTemplates: LocalTemplate[];
  activeLocalId: string | null;
  folderName: string | null;
  isLocalLoading: boolean;
  onLoadLocal: (id: string) => void;
  onOpenFolderDialog: () => void;
  onLoadFiles: (files: FileList) => Promise<void>;
}

const groups: { id: string; label: string }[] = [
  { id: 'inera', label: 'Inera-exempel' },
  { id: 'region-dalarna', label: 'Region Dalarna' },
  { id: 'vgr', label: 'VGR' },
];

function ExampleButton({
  tmpl,
  active,
  onLoad,
}: {
  tmpl: ExampleTemplate;
  active: boolean;
  onLoad: () => void;
}) {
  return (
    <button
      onClick={onLoad}
      className={`w-full flex flex-col gap-0.5 px-3 py-2.5 rounded text-left transition-colors ${
        active ? 'bg-[#C0002E]/10 text-[#C0002E]' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span className="flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-sm font-semibold leading-tight">{tmpl.name}</span>
      </span>
      <span className="text-xs text-gray-400 pl-5 leading-tight">{tmpl.description}</span>
    </button>
  );
}

function LocalTemplateButton({
  tmpl,
  active,
  onLoad,
}: {
  tmpl: LocalTemplate;
  active: boolean;
  onLoad: () => void;
}) {
  return (
    <button
      onClick={onLoad}
      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded text-left transition-colors ${
        active ? 'bg-[#C0002E]/10 text-[#C0002E]' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <FileText className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-sm font-semibold leading-tight truncate">{tmpl.name}</span>
    </button>
  );
}

export function Sidebar({
  onLoadExample,
  onNewBlank,
  activeExampleId,
  localTemplates,
  activeLocalId,
  folderName,
  isLocalLoading,
  onLoadLocal,
  onOpenFolderDialog,
  onLoadFiles,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) onLoadFiles(files);
    e.target.value = '';
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-200 bg-[#C0002E]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
            <span className="text-[#C0002E] font-black text-xs">1177</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">DocBook</div>
            <div className="text-white/60 text-[10px] leading-none mt-0.5">Mallverktyg</div>
          </div>
        </div>
      </div>

      {/* Hidden folder input */}
      <input
        ref={inputRef}
        type="file"
        // @ts-expect-error webkitdirectory is non-standard but widely supported
        webkitdirectory=""
        className="hidden"
        onChange={handleFiles}
      />

      {/* Top actions */}
      <div className="px-3 py-3 border-b border-gray-200 space-y-1.5">
        {/* Add my templates — shown above new blank when no folder is chosen */}
        {localTemplates.length === 0 && (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#C0002E] hover:bg-[#A00025] transition-colors shadow-sm"
          >
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
            Lägg till mina mallar
          </button>
        )}

        {/* New blank */}
        <button
          onClick={onNewBlank}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors ${
            activeExampleId === null && activeLocalId === null
              ? 'bg-[#C0002E]/10 text-[#C0002E] font-semibold'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          Nytt tomt meddelande
        </button>
      </div>

      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto">
        {/* My templates section */}
        {localTemplates.length > 0 && (
          <div className="border-b border-gray-100">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Folder className="w-3.5 h-3.5 text-[#C0002E] flex-shrink-0" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex-shrink-0">
                  Mina mallar
                </span>
                {folderName && (
                  <span className="text-[10px] text-gray-400 truncate" title={folderName}>
                    {folderName}
                  </span>
                )}
              </div>
              <button
                onClick={onOpenFolderDialog}
                title="Byt mapp"
                className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                disabled={isLocalLoading}
              >
                <FolderPlus className="w-3 h-3" />
              </button>
            </div>
            <div className="px-3 space-y-1 pb-4">
              {localTemplates.map((tmpl) => (
                <LocalTemplateButton
                  key={tmpl.id}
                  tmpl={tmpl}
                  active={activeLocalId === tmpl.id}
                  onLoad={() => onLoadLocal(tmpl.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Grouped built-in examples */}
        {groups.map((group, idx) => {
          const items = exampleTemplates.filter((t) => t.group === group.id);
          if (items.length === 0) return null;
          return (
            <div key={group.id} className={idx > 0 ? 'border-t border-gray-100' : ''}>
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {group.label}
                </span>
              </div>
              <div className="px-3 space-y-1 pb-4">
                {items.map((tmpl) => (
                  <ExampleButton
                    key={tmpl.id}
                    tmpl={tmpl}
                    active={activeExampleId === tmpl.id}
                    onLoad={() => onLoadExample(tmpl.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 leading-snug">
          DocBook 5.0 subset enligt Inera-specifikation för 1177 Inkorg
        </p>
      </div>
    </div>
  );
}
