import { Plus, Trash2, GripVertical } from 'lucide-react';
import type {
  Section,
  SectionBlock,
  ParaBlock,
  VarListBlock,
  ItemizedListBlock,
  InlineNode,
  VarEntry,
  ListItem,
  EmphasisRole,
} from '../../types/docbook';
import { InlineEditor, inlineNodesToText, textToInlineNodes } from './InlineEditor';
import { BlockControls } from './BlockControls';

function uid() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ---------- Para block ----------
function ParaBlockEditor({
  block,
  onUpdate,
  onEnter,
  onShiftEnter,
}: {
  block: ParaBlock;
  onUpdate: (b: ParaBlock) => void;
  onEnter: () => void;
  onShiftEnter: () => void;
}) {
  return (
    <InlineEditor
      nodes={block.children}
      onChange={(nodes) => onUpdate({ ...block, children: nodes })}
      placeholder="Skriv stycketext… (Enter = nytt stycke, Shift+Enter = nytt stycke)"
      className="text-sm text-gray-800 leading-relaxed w-full"
      multiline
      onEnter={onEnter}
      onShiftEnter={onShiftEnter}
      showFormattingToolbar
    />
  );
}

// ---------- VarList block ----------
function VarListEditor({
  block,
  onUpdate,
}: {
  block: VarListBlock;
  onUpdate: (b: VarListBlock) => void;
}) {
  function updateEntry(id: string, field: keyof VarEntry, value: string) {
    onUpdate({
      ...block,
      entries: block.entries.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  }

  function addEntry() {
    onUpdate({
      ...block,
      entries: [...block.entries, { id: uid(), term: 'Etikett:', value: 'Värde' }],
    });
  }

  function removeEntry(id: string) {
    onUpdate({ ...block, entries: block.entries.filter((e) => e.id !== id) });
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[1fr_1.5fr_auto] gap-2 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        <span>Etikett</span>
        <span>Värde</span>
        <span />
      </div>
      {block.entries.map((entry) => (
        <div key={entry.id} className="grid grid-cols-[1fr_1.5fr_auto] gap-2 items-center">
          <input
            value={entry.term}
            onChange={(e) => updateEntry(entry.id, 'term', e.target.value)}
            className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#0066A1] bg-gray-50"
            placeholder="Etikett:"
          />
          <input
            value={entry.value}
            onChange={(e) => updateEntry(entry.id, 'value', e.target.value)}
            className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#0066A1] bg-gray-50"
            placeholder="Värde"
          />
          <button
            onClick={() => removeEntry(entry.id)}
            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={addEntry}
        className="flex items-center gap-1 text-xs text-[#0066A1] hover:text-[#004F8A] mt-1 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Lägg till rad
      </button>
    </div>
  );
}

// ---------- ItemizedList block ----------
function ItemizedListEditor({
  block,
  onUpdate,
}: {
  block: ItemizedListBlock;
  onUpdate: (b: ItemizedListBlock) => void;
}) {
  const bullet = block.mark === 'bullet' ? '•' : '–';

  function updateItem(id: string, nodes: InlineNode[]) {
    onUpdate({
      ...block,
      items: block.items.map((item) =>
        item.id === id ? { ...item, children: nodes } : item
      ),
    });
  }

  function addItem() {
    onUpdate({
      ...block,
      items: [
        ...block.items,
        { id: uid(), children: [{ type: 'text', content: '' }] },
      ],
    });
  }

  function removeItem(id: string) {
    onUpdate({ ...block, items: block.items.filter((item) => item.id !== id) });
  }

  function toggleMark() {
    onUpdate({ ...block, mark: block.mark === 'bullet' ? 'hyphen' : 'bullet' });
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={toggleMark}
          className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-0.5 hover:bg-gray-50 transition-colors"
        >
          Typ: {block.mark === 'bullet' ? 'Punkt (•)' : 'Streck (–)'}
        </button>
      </div>
      {block.items.map((item) => (
        <div key={item.id} className="flex items-start gap-2">
          <span className="text-[#0066A1] font-bold mt-1 flex-shrink-0 text-sm">
            {bullet}
          </span>
          <InlineEditor
            nodes={item.children}
            onChange={(nodes) => updateItem(item.id, nodes)}
            placeholder="Listpunkt..."
            className="flex-1 text-sm text-gray-800 leading-relaxed"
            multiline
          />
          <button
            onClick={() => removeItem(item.id)}
            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="flex items-center gap-1 text-xs text-[#0066A1] hover:text-[#004F8A] mt-1 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Lägg till punkt
      </button>
    </div>
  );
}

// ---------- Block wrapper ----------
function BlockWrapper({
  label,
  children,
  onMoveUp,
  onMoveDown,
  onDelete,
  isFirst,
  isLast,
  accent,
}: {
  label: string;
  children: React.ReactNode;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
  accent?: string;
}) {
  return (
    <div className="group relative flex gap-2 mb-3">
      <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-2">
        <GripVertical className="w-3.5 h-3.5 text-gray-300" />
      </div>
      <div
        className={`flex-1 border rounded p-3 bg-white ${accent ?? 'border-gray-200'}`}
      >
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </div>
        {children}
        <BlockControls
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          isFirst={isFirst}
          isLast={isLast}
        />
      </div>
    </div>
  );
}

// ---------- Section editor ----------
function getTitleRole(section: Section): EmphasisRole | null {
  if (!section.title) return null;
  for (const n of section.title.children) {
    if (n.type === 'emphasis') return n.role;
  }
  return null;
}

function sectionAccentClass(role: EmphasisRole | null): string {
  if (role === 'information') return 'border-[#0066A1] bg-[#E8F4F4]/30';
  if (role === 'observe') return 'border-[#E6A817] bg-[#FFF8E6]/30';
  if (role === 'collapsible') return 'border-blue-200 bg-blue-50/20';
  return 'border-gray-300';
}

function sectionLabel(role: EmphasisRole | null): string {
  if (role === 'information') return 'Sektion — Grå inforuta';
  if (role === 'observe') return 'Sektion — Gul observationsruta';
  if (role === 'collapsible') return 'Sektion — Nedfällbar';
  if (role === 'frame') return 'Sektion — Ram';
  return 'Sektion';
}

interface SectionEditorProps {
  section: Section;
  onUpdate: (s: Section) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function SectionEditor({
  section,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SectionEditorProps) {
  const role = getTitleRole(section);

  function updateTitleText(text: string) {
    const base: InlineNode[] = role
      ? [{ type: 'emphasis', role, children: [{ type: 'text', content: text }] }]
      : [{ type: 'text', content: text }];
    onUpdate({ ...section, title: { children: base } });
  }

  function getTitleDisplayText(): string {
    if (!section.title) return '';
    for (const n of section.title.children) {
      if (n.type === 'text') return n.content;
      if (n.type === 'emphasis') {
        return n.children.map((c) => (c.type === 'text' ? c.content : '')).join('');
      }
    }
    return '';
  }

  function updateBlock(id: string, updated: SectionBlock) {
    onUpdate({
      ...section,
      blocks: section.blocks.map((b) => (b.id === id ? updated : b)),
    });
  }

  function deleteBlock(id: string) {
    onUpdate({ ...section, blocks: section.blocks.filter((b) => b.id !== id) });
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    const blocks = [...section.blocks];
    const target = idx + dir;
    if (target < 0 || target >= blocks.length) return;
    [blocks[idx], blocks[target]] = [blocks[target], blocks[idx]];
    onUpdate({ ...section, blocks });
  }

  function addBlock(type: 'para' | 'variablelist' | 'itemizedlist-bullet' | 'itemizedlist-hyphen') {
    let newBlock: SectionBlock;
    if (type === 'para') {
      newBlock = { id: uid(), type: 'para', children: [{ type: 'text', content: '' }] };
    } else if (type === 'variablelist') {
      newBlock = {
        id: uid(),
        type: 'variablelist',
        entries: [{ id: uid(), term: 'Etikett:', value: 'Värde' }],
      };
    } else {
      newBlock = {
        id: uid(),
        type: 'itemizedlist',
        mark: type === 'itemizedlist-bullet' ? 'bullet' : 'hyphen',
        items: [{ id: uid(), children: [{ type: 'text', content: '' }] }],
      };
    }
    onUpdate({ ...section, blocks: [...section.blocks, newBlock] });
  }

  return (
    <div
      className={`group relative border rounded-lg p-4 mb-4 bg-white ${sectionAccentClass(role)}`}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
          {sectionLabel(role)}
        </div>
        <BlockControls
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          isFirst={isFirst}
          isLast={isLast}
        />
      </div>

      {/* Title field */}
      <div className="mb-3">
        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
          Rubrik
        </label>
        <input
          value={getTitleDisplayText()}
          onChange={(e) => updateTitleText(e.target.value)}
          placeholder={role ? 'Rubrik för rutan...' : 'Sektionsrubrik...'}
          className="w-full text-sm font-semibold text-[#1A1A1A] border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0066A1] bg-gray-50"
        />
      </div>

      {/* Blocks */}
      <div>
        {section.blocks.map((block, idx) => {
          const blockLabel =
            block.type === 'para'
              ? 'Stycke — Enter eller Shift+Enter = nytt stycke'
              : block.type === 'variablelist'
              ? 'Variabellista'
              : `Lista (${(block as ItemizedListBlock).mark === 'bullet' ? 'punkt' : 'streck'})`;

          return (
            <BlockWrapper
              key={block.id}
              label={blockLabel}
              onMoveUp={() => moveBlock(idx, -1)}
              onMoveDown={() => moveBlock(idx, 1)}
              onDelete={() => deleteBlock(block.id)}
              isFirst={idx === 0}
              isLast={idx === section.blocks.length - 1}
            >
              {block.type === 'para' && (
                <ParaBlockEditor
                  block={block as ParaBlock}
                  onUpdate={(b) => updateBlock(block.id, b)}
                  onEnter={() => {
                    const newBlock: ParaBlock = {
                      id: uid(),
                      type: 'para',
                      children: [{ type: 'text', content: '' }],
                    };
                    const blocks = [...section.blocks];
                    blocks.splice(idx + 1, 0, newBlock);
                    onUpdate({ ...section, blocks });
                  }}
                  onShiftEnter={() => {
                    const newBlock: ParaBlock = {
                      id: uid(),
                      type: 'para',
                      children: [{ type: 'text', content: '' }],
                    };
                    const blocks = [...section.blocks];
                    blocks.splice(idx + 1, 0, newBlock);
                    onUpdate({ ...section, blocks });
                  }}
                />
              )}
              {block.type === 'variablelist' && (
                <VarListEditor
                  block={block as VarListBlock}
                  onUpdate={(b) => updateBlock(block.id, b)}
                />
              )}
              {block.type === 'itemizedlist' && (
                <ItemizedListEditor
                  block={block as ItemizedListBlock}
                  onUpdate={(b) => updateBlock(block.id, b)}
                />
              )}
            </BlockWrapper>
          );
        })}

        {/* Add block row */}
        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-dashed border-gray-200">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider self-center">
            Lägg till:
          </span>
          <button
            onClick={() => addBlock('para')}
            className="text-xs px-2 py-1 rounded border border-gray-200 hover:border-[#0066A1] hover:text-[#0066A1] text-gray-500 transition-colors bg-white"
          >
            Stycke
          </button>
          <button
            onClick={() => addBlock('variablelist')}
            className="text-xs px-2 py-1 rounded border border-gray-200 hover:border-[#0066A1] hover:text-[#0066A1] text-gray-500 transition-colors bg-white"
          >
            Variabellista
          </button>
          <button
            onClick={() => addBlock('itemizedlist-bullet')}
            className="text-xs px-2 py-1 rounded border border-gray-200 hover:border-[#0066A1] hover:text-[#0066A1] text-gray-500 transition-colors bg-white"
          >
            Lista •
          </button>
          <button
            onClick={() => addBlock('itemizedlist-hyphen')}
            className="text-xs px-2 py-1 rounded border border-gray-200 hover:border-[#0066A1] hover:text-[#0066A1] text-gray-500 transition-colors bg-white"
          >
            Lista –
          </button>
        </div>
      </div>
    </div>
  );
}
