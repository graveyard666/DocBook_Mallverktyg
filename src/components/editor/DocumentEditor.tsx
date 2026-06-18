import { Plus, FileText } from 'lucide-react';
import type { DocBookDocument, Section, EmphasisRole, MockButton } from '../../types/docbook';
import { SectionEditor } from './SectionEditor';
import { ButtonsEditor } from './ButtonsEditor';

function uid() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function makeSection(role?: EmphasisRole): Section {
  const titleChildren =
    role
      ? [{ type: 'emphasis' as const, role, children: [{ type: 'text' as const, content: role === 'collapsible' ? 'Nedfällbar rubrik' : 'Rubrik för rutan' }] }]
      : [{ type: 'text' as const, content: 'Ny sektion' }];

  return {
    id: uid(),
    title: { children: titleChildren },
    blocks: [
      {
        id: uid(),
        type: 'para',
        children: [{ type: 'text', content: '' }],
      },
    ],
  };
}

interface Props {
  doc: DocBookDocument;
  onUpdate: (doc: DocBookDocument) => void;
}

export function DocumentEditor({ doc, onUpdate }: Props) {
  function updateSection(id: string, updated: Section) {
    onUpdate({
      ...doc,
      sections: doc.sections.map((s) => (s.id === id ? updated : s)),
    });
  }

  function deleteSection(id: string) {
    onUpdate({ ...doc, sections: doc.sections.filter((s) => s.id !== id) });
  }

  function moveSection(idx: number, dir: -1 | 1) {
    const sections = [...doc.sections];
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    [sections[idx], sections[target]] = [sections[target], sections[idx]];
    onUpdate({ ...doc, sections });
  }

  function addSection(role?: EmphasisRole) {
    onUpdate({ ...doc, sections: [...doc.sections, makeSection(role)] });
  }

  function updateButtons(buttons: MockButton[]) {
    onUpdate({ ...doc, buttons });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Document name */}
      <div className="px-6 pt-5 pb-3 border-b border-gray-200 bg-white">
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Meddelandenamn
        </label>
        <input
          value={doc.name}
          onChange={(e) => onUpdate({ ...doc, name: e.target.value })}
          className="w-full text-base font-bold text-[#1A1A1A] border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-[#0066A1] bg-gray-50"
          placeholder="Meddelandenamn..."
        />
        <div className="mt-2 px-2.5 py-2 bg-amber-50 border border-amber-100 rounded flex items-start gap-2">
          <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 11.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm.75-3.5a.75.75 0 0 1-1.5 0V5.75a.75.75 0 0 1 1.5 0V9z"/>
          </svg>
          <p className="text-[11px] text-amber-700 italic leading-snug">
            Meddelandenamnet ingår <span className="font-semibold not-italic">inte</span> i DocBook-koden. Sätts i addmessage anropet som title.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-2 bg-white border-b border-gray-200 flex flex-wrap gap-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider self-center">
          Lägg till sektion:
        </span>
        <button
          onClick={() => addSection()}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-gray-200 hover:border-[#0066A1] hover:text-[#0066A1] text-gray-600 transition-colors bg-white"
        >
          <Plus className="w-3.5 h-3.5" /> Standard
        </button>
        <button
          onClick={() => addSection('collapsible')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-blue-200 hover:border-blue-400 text-blue-600 transition-colors bg-blue-50/50"
        >
          <Plus className="w-3.5 h-3.5" /> Nedfällbar
        </button>
        <button
          onClick={() => addSection('information')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-[#0066A1]/30 hover:border-[#0066A1] text-[#0066A1] transition-colors bg-[#E8F4F4]/50"
        >
          <Plus className="w-3.5 h-3.5" /> Grå inforuta
        </button>
        <button
          onClick={() => addSection('observe')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-[#E6A817]/40 hover:border-[#E6A817] text-[#B07F10] transition-colors bg-[#FFF8E6]/50"
        >
          <Plus className="w-3.5 h-3.5" /> Gul observationsruta
        </button>
        <button
          onClick={() => addSection('frame')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-gray-300 hover:border-gray-500 text-gray-600 transition-colors bg-white"
        >
          <Plus className="w-3.5 h-3.5" /> Vit informationsruta
        </button>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-[#F7F8F9]">
        {doc.sections.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <FileText className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Inga sektioner ännu. Lägg till en ovan.</p>
          </div>
        )}
        {doc.sections.map((section, idx) => (
          <SectionEditor
            key={section.id}
            section={section}
            onUpdate={(s) => updateSection(section.id, s)}
            onDelete={() => deleteSection(section.id)}
            onMoveUp={() => moveSection(idx, -1)}
            onMoveDown={() => moveSection(idx, 1)}
            isFirst={idx === 0}
            isLast={idx === doc.sections.length - 1}
          />
        ))}
        <ButtonsEditor buttons={doc.buttons ?? []} onUpdate={updateButtons} />
      </div>
    </div>
  );
}
