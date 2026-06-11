import type {
  DocBookDocument,
  Section,
  SectionBlock,
  SectionTitle,
  InlineNode,
  ParaBlock,
  VarListBlock,
  ItemizedListBlock,
  ListItem,
} from '../types/docbook';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function serializeInlineNodes(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') return escapeXml(node.content);
      if (node.type === 'emphasis') {
        return `<emphasis role="${node.role}">${serializeInlineNodes(node.children)}</emphasis>`;
      }
      if (node.type === 'link') {
        return `<link url="${escapeXml(node.url)}" type="${escapeXml(node.target)}">${serializeInlineNodes(node.children)}</link>`;
      }
      return '';
    })
    .join('');
}

function serializeSectionTitle(title: SectionTitle): string {
  return `<title>${serializeInlineNodes(title.children)}</title>`;
}

function serializePara(para: ParaBlock): string {
  return `<para>${serializeInlineNodes(para.children)}</para>`;
}

function serializeVarList(vl: VarListBlock): string {
  const titleStr = vl.title ? `<title>${escapeXml(vl.title)}</title>\n` : '';
  const entries = vl.entries
    .map(
      (e) =>
        `      <varlistentry>\n        <term>${escapeXml(e.term)}</term>\n        <listitem>${escapeXml(e.value)}</listitem>\n      </varlistentry>`
    )
    .join('\n');
  return `<variablelist>\n${titleStr}${entries}\n    </variablelist>`;
}

function serializeListItem(item: ListItem): string {
  return `      <listitem>${serializeInlineNodes(item.children)}</listitem>`;
}

function serializeItemizedList(il: ItemizedListBlock): string {
  const items = il.items.map(serializeListItem).join('\n');
  return `<itemizedlist mark="${il.mark}">\n${items}\n    </itemizedlist>`;
}

function serializeBlock(block: SectionBlock, indent = '    '): string {
  let xml = '';
  if (block.type === 'para') xml = serializePara(block);
  else if (block.type === 'variablelist') xml = serializeVarList(block);
  else if (block.type === 'itemizedlist') xml = serializeItemizedList(block);
  return indent + xml;
}

function serializeSection(section: Section): string {
  const titleStr = section.title
    ? `    ${serializeSectionTitle(section.title)}\n`
    : '';
  const blocks = section.blocks.map((b) => serializeBlock(b)).join('\n');
  return `  <section>\n${titleStr}${blocks}\n  </section>`;
}

export function serializeDocument(doc: DocBookDocument): string {
  const sections = doc.sections.map(serializeSection).join('\n');
  const rootParas = (doc.rootParas ?? [])
    .map((p) => '  ' + serializePara(p))
    .join('\n');
  const body = [sections, rootParas].filter(Boolean).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<article>\n${body}\n</article>`;
}

export function entityEncodeDocBook(xml: string): string {
  return xml
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
