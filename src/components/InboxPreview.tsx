import { useState } from 'react';
import { ChevronDown, ChevronRight, Smartphone, Monitor } from 'lucide-react';
import type {
  DocBookDocument,
  Section,
  SectionBlock,
  InlineNode,
  ParaBlock,
  VarListBlock,
  ItemizedListBlock,
} from '../types/docbook';

// 1177 brand colors from the reference screenshot
const LINK_COLOR = '#0066A1';
const HEADING_COLOR = '#C0002E';

function InlineRenderer({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.type === 'text') return <span key={i}>{node.content}</span>;
        if (node.type === 'link') {
          return (
            <a
              key={i}
              href={node.url}
              target={node.target}
              rel="noopener noreferrer"
              style={{ color: LINK_COLOR }}
              className="underline hover:opacity-80 transition-opacity"
            >
              <InlineRenderer nodes={node.children} />
            </a>
          );
        }
        if (node.type === 'emphasis') {
          if (node.role === 'bold')
            return (
              <strong key={i}>
                <InlineRenderer nodes={node.children} />
              </strong>
            );
          if (node.role === 'italic')
            return (
              <em key={i}>
                <InlineRenderer nodes={node.children} />
              </em>
            );
          if (node.role === 'underline')
            return (
              <u key={i}>
                <InlineRenderer nodes={node.children} />
              </u>
            );
          return (
            <span key={i}>
              <InlineRenderer nodes={node.children} />
            </span>
          );
        }
        return null;
      })}
    </>
  );
}

function getTitleEmphasisRole(section: Section) {
  if (!section.title) return null;
  for (const node of section.title.children) {
    if (node.type === 'emphasis') return node.role;
  }
  return null;
}

function getTitleText(section: Section): InlineNode[] {
  if (!section.title) return [];
  return section.title.children;
}

function CollapsibleSection({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);
  const titleNodes = getTitleText(section);
  const emphasis = section.title?.children.find((n) => n.type === 'emphasis');
  const labelNodes =
    emphasis && emphasis.type === 'emphasis' ? emphasis.children : titleNodes;

  return (
    <div className="border border-gray-300 rounded mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors rounded"
      >
        <span className="font-semibold text-[#1A1A1A] text-sm">
          <InlineRenderer nodes={labelNodes} />
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 py-3 space-y-2">
          {section.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      )}
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0 mt-0.5">
      <circle cx="9" cy="9" r="8.5" stroke="#4A5568" strokeWidth="1" fill="none"/>
      <text x="9" y="13" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#4A5568">i</text>
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0 mt-0.5">
      <path d="M9 1.5L16.5 15H1.5L9 1.5Z" stroke="#B07000" strokeWidth="1.2" fill="none"/>
      <text x="9" y="13" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#B07000">!</text>
    </svg>
  );
}

function InfoBox({
  role,
  section,
}: {
  role: 'information' | 'observe' | 'frame';
  section: Section;
}) {
  const emphasis = section.title?.children.find(
    (n) => n.type === 'emphasis' && n.role === role
  );
  const labelNodes =
    emphasis && emphasis.type === 'emphasis' ? emphasis.children : [];

  // Colors matching the 1177 reference screenshot
  const styles: Record<string, string> = {
    information: 'bg-[#F0F4F8] border border-[#C5CDD6] rounded',
    observe: 'bg-[#FEF9EC] border border-[#E8D5A0] rounded',
    frame: 'bg-white border border-gray-300 rounded',
  };

  const iconMap: Record<string, React.ReactNode> = {
    information: <InfoIcon />,
    observe: <WarnIcon />,
    frame: null,
  };

  const headingColor: Record<string, string> = {
    information: '#1A1A1A',
    observe: '#1A1A1A',
    frame: '#1A1A1A',
  };

  return (
    <div className={`p-4 mb-3 ${styles[role]}`}>
      {labelNodes.length > 0 && (
        <div className="flex items-start gap-2 mb-2">
          {iconMap[role]}
          <span className="font-bold text-sm" style={{ color: headingColor[role] }}>
            <InlineRenderer nodes={labelNodes} />
          </span>
        </div>
      )}
      {section.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

function ParaInlineRenderer({ nodes }: { nodes: InlineNode[] }) {
  // Render inline nodes, splitting on \n to produce <br> for soft line breaks
  const parts: React.ReactNode[] = [];
  nodes.forEach((node, ni) => {
    if (node.type === 'text') {
      const lines = node.content.split('\n');
      lines.forEach((line, li) => {
        if (li > 0) parts.push(<br key={`${ni}-br-${li}`} />);
        if (line) parts.push(<span key={`${ni}-${li}`}>{line}</span>);
      });
    } else {
      parts.push(<InlineRenderer key={ni} nodes={[node]} />);
    }
  });
  return <>{parts}</>;
}

function BlockRenderer({ block }: { block: SectionBlock }) {
  if (block.type === 'para') {
    const paraBlock = block as ParaBlock;
    const visibleParas = paraBlock.paragraphs.filter((p) =>
      p.nodes.some((n) => {
        if (n.type === 'text') return n.content.trim().length > 0;
        return true;
      })
    );
    if (visibleParas.length === 0) return <div className="h-4" />;
    return (
      <>
        {visibleParas.map((p) => (
          <p key={p.id} className="text-sm text-[#1A1A1A] leading-relaxed mb-2">
            <ParaInlineRenderer nodes={p.nodes} />
          </p>
        ))}
      </>
    );
  }

  if (block.type === 'variablelist') {
    const vl = block as VarListBlock;
    return (
      <div className="mb-3">
        {vl.title && (
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">{vl.title}</p>
        )}
        <dl className="space-y-3">
          {vl.entries.map((entry) => (
            <div key={entry.id}>
              <dt className="text-sm font-bold text-[#1A1A1A]">{entry.term}</dt>
              <dd className="text-sm text-[#1A1A1A]">{entry.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  if (block.type === 'itemizedlist') {
    const il = block as ItemizedListBlock;
    const bullet = il.mark === 'bullet' ? '•' : '–';
    return (
      <ul className="mb-3 space-y-1">
        {il.items.map((item) => (
          <li key={item.id} className="flex gap-2 text-sm text-[#1A1A1A]">
            <span className="flex-shrink-0 font-bold mt-0.5 text-[#C0002E]">
              {bullet}
            </span>
            <span className="leading-relaxed">
              <InlineRenderer nodes={item.children} />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}

function SectionRenderer({ section }: { section: Section }) {
  const role = getTitleEmphasisRole(section);

  if (role === 'collapsible') return <CollapsibleSection section={section} />;
  if (role === 'information')
    return <InfoBox role="information" section={section} />;
  if (role === 'observe') return <InfoBox role="observe" section={section} />;
  if (role === 'frame') return <InfoBox role="frame" section={section} />;

  const titleNodes = getTitleText(section);

  return (
    <div className="mb-5">
      {titleNodes.length > 0 && (
        <h2 className="text-base font-bold mb-2 leading-snug text-[#1A1A1A]">
          <InlineRenderer nodes={titleNodes} />
        </h2>
      )}
      {section.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

type ViewMode = 'mobile' | 'desktop';

export function InboxPreview({ doc }: { doc: DocBookDocument }) {
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');

  const messageContent = (
    <>
      {/* 1177 header bar */}
      <div className="bg-[#C0002E] px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="text-white font-bold text-xl tracking-tight">1177</div>
        <div className="text-white/70 text-sm">Inkorgen</div>
      </div>

      {/* Message meta */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <p className="text-xs text-gray-500 mb-1">FRÅN VÅRDGIVAREN</p>
        <h1 className="text-lg font-bold text-[#C0002E]">{doc.name}</h1>
      </div>

      {/* Message body */}
      <div className="px-6 py-6 flex-1 overflow-y-auto break-words">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {doc.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
          {(doc.rootParas ?? []).map((para) => (
            <BlockRenderer key={para.id} block={para} />
          ))}
          {(doc.buttons ?? []).filter((b) => b.label.trim()).length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              {(doc.buttons ?? [])
                .filter((b) => b.label.trim())
                .map((btn) => (
                  <button
                    key={btn.id}
                    className="w-full py-3.5 px-6 rounded-full text-white text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ backgroundColor: '#3D6080' }}
                  >
                    {btn.label}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#E8ECEC]">
      {/* View mode toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-center">
        <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <button
            onClick={() => setViewMode('desktop')}
            title="Datorvy"
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-150 ${
              viewMode === 'desktop'
                ? 'bg-[#C0002E] text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Dator
          </button>
          <div className="w-px h-7 bg-gray-200 flex-shrink-0" />
          <button
            onClick={() => setViewMode('mobile')}
            title="Mobilvy"
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-150 ${
              viewMode === 'mobile'
                ? 'bg-[#C0002E] text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobil
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'desktop' ? (
          <div className="h-full flex flex-col bg-[#F0F4F4]">
            {messageContent}
          </div>
        ) : (
          <div className="min-h-full flex items-start justify-center py-6 px-4 bg-[#E8ECEC]">
            {/* Phone frame */}
            <div
              className="relative bg-gray-900 rounded-[2.5rem] shadow-2xl flex-shrink-0"
              style={{ width: 375, padding: '12px 6px' }}
            >
              {/* Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-full z-10" />
              {/* Screen */}
              <div
                className="bg-[#F0F4F4] rounded-[2rem] overflow-hidden flex flex-col"
                style={{ height: 667 }}
              >
                <div className="flex-1 overflow-y-auto flex flex-col">
                  {messageContent}
                </div>
              </div>
              {/* Home indicator */}
              <div className="mt-2 flex justify-center">
                <div className="w-24 h-1 bg-gray-600 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}