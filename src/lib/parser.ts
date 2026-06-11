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
  VarEntry,
} from '../types/docbook';

let idCounter = 0;
function uid() {
  return `node-${++idCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

function parseInlineNodes(el: Element | null): InlineNode[] {
  if (!el) return [];
  const nodes: InlineNode[] = [];
  el.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? '';
      if (text) nodes.push({ type: 'text', content: text });
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const c = child as Element;
      if (c.tagName === 'emphasis') {
        nodes.push({
          type: 'emphasis',
          role: (c.getAttribute('role') as any) ?? 'bold',
          children: parseInlineNodes(c),
        });
      } else if (c.tagName === 'link' || c.tagName === 'ulink') {
        nodes.push({
          type: 'link',
          url: c.getAttribute('url') ?? c.getAttribute('href') ?? '',
          target: c.getAttribute('type') ?? '_blank',
          children: parseInlineNodes(c),
        });
      } else {
        const text = c.textContent ?? '';
        if (text) nodes.push({ type: 'text', content: text });
      }
    }
  });
  return nodes;
}

function parseSectionTitle(el: Element | null): SectionTitle | undefined {
  if (!el) return undefined;
  return { children: parseInlineNodes(el) };
}

function parsePara(el: Element): ParaBlock {
  return { id: uid(), type: 'para', children: parseInlineNodes(el) };
}

function parseVarList(el: Element): VarListBlock {
  const titleEl = el.querySelector(':scope > title');
  const entries: VarEntry[] = [];
  el.querySelectorAll(':scope > varlistentry').forEach((entry) => {
    const term = entry.querySelector('term')?.textContent ?? '';
    const value = entry.querySelector('listitem')?.textContent ?? '';
    entries.push({ id: uid(), term, value });
  });
  return {
    id: uid(),
    type: 'variablelist',
    title: titleEl?.textContent ?? undefined,
    entries,
  };
}

function parseItemizedList(el: Element): ItemizedListBlock {
  const mark = (el.getAttribute('mark') as 'bullet' | 'hyphen') ?? 'bullet';
  const items: ListItem[] = [];
  el.querySelectorAll(':scope > listitem').forEach((li) => {
    items.push({ id: uid(), children: parseInlineNodes(li) });
  });
  return { id: uid(), type: 'itemizedlist', mark, items };
}

function parseSection(el: Element): Section {
  const titleEl = el.querySelector(':scope > title') ?? null;
  const title = parseSectionTitle(titleEl);
  const blocks: SectionBlock[] = [];

  el.childNodes.forEach((child) => {
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const c = child as Element;
    if (c.tagName === 'title') return;
    if (c.tagName === 'para') blocks.push(parsePara(c));
    else if (c.tagName === 'variablelist') blocks.push(parseVarList(c));
    else if (c.tagName === 'itemizedlist') blocks.push(parseItemizedList(c));
  });

  return { id: uid(), title, blocks };
}

export function parseDocBookXml(xml: string): DocBookDocument | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) return null;

    const article = doc.querySelector('article');
    if (!article) return null;

    const sections: Section[] = [];
    const rootParas: ParaBlock[] = [];

    article.childNodes.forEach((child) => {
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const el = child as Element;
      if (el.tagName === 'section') sections.push(parseSection(el));
      else if (el.tagName === 'para') rootParas.push(parsePara(el));
    });

    return { id: uid(), name: 'Imported', sections, rootParas };
  } catch {
    return null;
  }
}
