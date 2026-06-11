import { FileText, Plus, BookOpen } from 'lucide-react';
import { exampleTemplates } from '../data/examples';

interface Props {
  onLoadExample: (id: string) => void;
  onNewBlank: () => void;
  activeExampleId: string | null;
}

export function Sidebar({ onLoadExample, onNewBlank, activeExampleId }: Props) {
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

      {/* New blank */}
      <div className="px-3 py-3 border-b border-gray-100">
        <button
          onClick={onNewBlank}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors ${
            activeExampleId === null
              ? 'bg-[#C0002E]/10 text-[#C0002E] font-semibold'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          Nytt tomt meddelande
        </button>
      </div>

      {/* Examples */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Inera-exempel
          </span>
        </div>
        <div className="px-3 space-y-1 pb-4">
          {exampleTemplates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => onLoadExample(tmpl.id)}
              className={`w-full flex flex-col gap-0.5 px-3 py-2.5 rounded text-left transition-colors ${
                activeExampleId === tmpl.id
                  ? 'bg-[#C0002E]/10 text-[#C0002E]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-sm font-semibold leading-tight">{tmpl.name}</span>
              </span>
              <span className="text-xs text-gray-400 pl-5 leading-tight">
                {tmpl.description}
              </span>
            </button>
          ))}
        </div>
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
