import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { ExternalLink, Pencil, X, Link, Bold, Italic } from 'lucide-react';
import type { InlineNode, InlineLink } from '../../types/docbook';

// ---------- Link editor modal ----------

interface ModalProps {
  initial?: InlineLink;
  onSave: (link: InlineLink) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function LinkEditorModal({ initial, onSave, onDelete, onClose }: ModalProps) {
  const [text, setText] = useState(
    initial ? initial.children.map((n) => (n.type === 'text' ? n.content : '')).join('') : ''
  );
  const [url, setUrl] = useState(initial?.url ?? '');
  const [target, setTarget] = useState(initial?.target ?? '_blank');
  const textRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    textRef.current?.focus();
  }, []);

  function handleSave() {
    const trimmedUrl = url.trim();
    const trimmedText = text.trim();
    if (!trimmedUrl || !trimmedText) return;
    onSave({
      type: 'link',
      url: trimmedUrl,
      target,
      children: [{ type: 'text', content: trimmedText }],
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Link className="w-4 h-4 text-[#0066A1]" />
            {initial ? 'Redigera lank' : 'Lagg till lank'}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Lanktext
            </label>
            <input
              ref={textRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Synlig text for lanken"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#0066A1] focus:ring-1 focus:ring-[#0066A1]/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#0066A1] focus:ring-1 focus:ring-[#0066A1]/20 transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Oppnas i
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTarget('_blank')}
                className={`flex-1 text-sm py-2 rounded-lg border transition-colors font-medium ${
                  target === '_blank'
                    ? 'border-[#0066A1] bg-[#0066A1]/5 text-[#0066A1]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Ny flik
              </button>
              <button
                type="button"
                onClick={() => setTarget('_self')}
                className={`flex-1 text-sm py-2 rounded-lg border transition-colors font-medium ${
                  target === '_self'
                    ? 'border-[#0066A1] bg-[#0066A1]/5 text-[#0066A1]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Samma flik
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50">
          {initial && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Ta bort lank
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors font-medium"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!url.trim() || !text.trim()}
              className="text-sm px-4 py-2 rounded-lg bg-[#0066A1] text-white font-medium hover:bg-[#004F8A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {initial ? 'Spara' : 'Lagg till'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Inline node <-> HTML helpers ----------

export function inlineNodesToText(nodes: InlineNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === 'text') return n.content;
      if (n.type === 'emphasis') return inlineNodesToText(n.children);
      if (n.type === 'link') return inlineNodesToText(n.children);
      return '';
    })
    .join('');
}

export function textToInlineNodes(text: string): InlineNode[] {
  if (!text) return [{ type: 'text', content: '' }];
  return [{ type: 'text', content: text }];
}

function inlineNodesToHtml(nodes: InlineNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === 'text') {
        return n.content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>');
      }
      if (n.type === 'emphasis') {
        const inner = inlineNodesToHtml(n.children);
        if (n.role === 'bold') return `<strong>${inner}</strong>`;
        if (n.role === 'italic') return `<em>${inner}</em>`;
        return inner;
      }
      if (n.type === 'link') {
        return inlineNodesToHtml(n.children);
      }
      return '';
    })
    .join('');
}

function htmlToInlineNodes(el: Node): InlineNode[] {
  const nodes: InlineNode[] = [];
  el.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? '';
      if (text) nodes.push({ type: 'text', content: text });
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const c = child as Element;
      const tag = c.tagName.toLowerCase();
      if (tag === 'strong') {
        const children = htmlToInlineNodes(c);
        if (children.length > 0) {
          nodes.push({ type: 'emphasis', role: 'bold', children });
        }
      } else if (tag === 'em') {
        const children = htmlToInlineNodes(c);
        if (children.length > 0) {
          nodes.push({ type: 'emphasis', role: 'italic', children });
        }
      } else if (tag === 'br') {
        nodes.push({ type: 'text', content: '\n' });
      } else if (tag === 'div' || tag === 'p') {
        const children = htmlToInlineNodes(c);
        if (nodes.length > 0 && children.length > 0) {
          nodes.push({ type: 'text', content: '\n' });
        }
        nodes.push(...children);
      } else {
        nodes.push(...htmlToInlineNodes(c));
      }
    }
  });
  return nodes;
}

function mergeAdjacentText(nodes: InlineNode[]): InlineNode[] {
  const result: InlineNode[] = [];
  for (const node of nodes) {
    const last = result[result.length - 1];
    if (node.type === 'text' && last?.type === 'text') {
      result[result.length - 1] = { type: 'text', content: last.content + node.content };
    } else if (node.type === 'emphasis') {
      result.push({ ...node, children: mergeAdjacentText(node.children) });
    } else {
      result.push(node);
    }
  }
  return result;
}

// ---------- Formatting logic ----------

type Segment = { text: string; bold: boolean; italic: boolean };

function flattenToSegments(nodes: InlineNode[]): Segment[] {
  const segs: Segment[] = [];
  function walk(ns: InlineNode[], bold: boolean, italic: boolean) {
    for (const n of ns) {
      if (n.type === 'text') {
        segs.push({ text: n.content, bold, italic });
      } else if (n.type === 'emphasis') {
        walk(n.children, bold || n.role === 'bold', italic || n.role === 'italic');
      } else if (n.type === 'link') {
        walk(n.children, bold, italic);
      }
    }
  }
  walk(nodes, false, false);
  return segs;
}

function segmentsToNodes(segs: Segment[]): InlineNode[] {
  const nodes: InlineNode[] = [];
  for (const seg of segs) {
    if (!seg.text) continue;
    const textNode: InlineNode = { type: 'text', content: seg.text };
    if (seg.bold && seg.italic) {
      nodes.push({
        type: 'emphasis',
        role: 'bold',
        children: [{ type: 'emphasis', role: 'italic', children: [textNode] }],
      });
    } else if (seg.bold) {
      nodes.push({ type: 'emphasis', role: 'bold', children: [textNode] });
    } else if (seg.italic) {
      nodes.push({ type: 'emphasis', role: 'italic', children: [textNode] });
    } else {
      nodes.push(textNode);
    }
  }
  return nodes;
}

export function applyFormat(
  nodes: InlineNode[],
  role: 'bold' | 'italic',
  start: number,
  end: number
): InlineNode[] {
  if (start >= end) return nodes;

  const segs = flattenToSegments(nodes);
  type CharEntry = { char: string; bold: boolean; italic: boolean };
  const chars: CharEntry[] = [];
  for (const seg of segs) {
    for (const ch of seg.text) {
      chars.push({ char: ch, bold: seg.bold, italic: seg.italic });
    }
  }

  if (chars.length === 0) return nodes;

  const clampedEnd = Math.min(end, chars.length);
  const allHaveRole = chars
    .slice(start, clampedEnd)
    .every((c) => (role === 'bold' ? c.bold : c.italic));

  for (let i = start; i < clampedEnd; i++) {
    if (role === 'bold') chars[i].bold = !allHaveRole;
    else chars[i].italic = !allHaveRole;
  }

  const newSegs: Segment[] = [];
  for (const c of chars) {
    const last = newSegs[newSegs.length - 1];
    if (last && last.bold === c.bold && last.italic === c.italic) {
      last.text += c.char;
    } else {
      newSegs.push({ text: c.char, bold: c.bold, italic: c.italic });
    }
  }

  return segmentsToNodes(newSegs);
}

function getActiveFormats(
  nodes: InlineNode[],
  start: number,
  end: number
): { bold: boolean; italic: boolean } {
  if (start >= end) return { bold: false, italic: false };

  const segs = flattenToSegments(nodes);
  const chars: { bold: boolean; italic: boolean }[] = [];
  for (const seg of segs) {
    for (let i = 0; i < seg.text.length; i++) {
      chars.push({ bold: seg.bold, italic: seg.italic });
    }
  }

  const slice = chars.slice(start, Math.min(end, chars.length));
  if (slice.length === 0) return { bold: false, italic: false };

  return {
    bold: slice.every((c) => c.bold),
    italic: slice.every((c) => c.italic),
  };
}

function getCharOffset(root: HTMLElement, targetNode: Node, targetOffset: number): number {
  let count = 0;

  function walk(node: Node): boolean {
    // Text node: if this is the target, add offset and stop; otherwise count all chars
    if (node.nodeType === Node.TEXT_NODE) {
      if (node === targetNode) {
        count += targetOffset;
        return true;
      }
      count += node.textContent?.length ?? 0;
      return false;
    }

    const el = node as Element;
    const tag = el.tagName?.toLowerCase();

    // <br> counts as one character
    if (tag === 'br') {
      count += 1;
      return false;
    }

    // Element node as the selection anchor: the offset is a child index.
    // Count chars of all children before that index, then stop.
    if (node === targetNode) {
      const children = Array.from(node.childNodes);
      for (let i = 0; i < targetOffset && i < children.length; i++) {
        walk(children[i]);
      }
      return true;
    }

    // Otherwise recurse into children
    for (const child of Array.from(node.childNodes)) {
      if (walk(child)) return true;
    }
    return false;
  }

  walk(root);
  return count;
}

// ---------- Inline editor ----------

interface Props {
  nodes: InlineNode[];
  onChange: (nodes: InlineNode[]) => void;
  placeholder?: string;
  className?: string;
  onEnter?: () => void;
  multiline?: boolean;
  showFormattingToolbar?: boolean;
}

export function InlineEditor({
  nodes,
  onChange,
  placeholder = '',
  className = '',
  onEnter,
  multiline = false,
  showFormattingToolbar = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const internalChange = useRef(false);
  const [editingLink, setEditingLink] = useState<{ index: number; link: InlineLink } | null>(null);
  const [addingLink, setAddingLink] = useState(false);
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [activeFormats, setActiveFormats] = useState<{ bold: boolean; italic: boolean }>({ bold: false, italic: false });

  const linkNodes = nodes
    .map((n, i) => (n.type === 'link' ? { node: n as InlineLink, index: i } : null))
    .filter(Boolean) as { node: InlineLink; index: number }[];

  const textOnlyNodes = nodes.filter((n) => n.type !== 'link');
  const htmlFromNodes = inlineNodesToHtml(textOnlyNodes);

  useEffect(() => {
    if (!ref.current || internalChange.current) return;
    if (ref.current.innerHTML !== htmlFromNodes) {
      ref.current.innerHTML = htmlFromNodes;
    }
  }, [htmlFromNodes]);

  function readNodesFromDom(): InlineNode[] {
    if (!ref.current) return [];
    const parsed = htmlToInlineNodes(ref.current);
    const merged = mergeAdjacentText(parsed);
    return [...merged, ...nodes.filter((n) => n.type === 'link')];
  }

  function handleInput() {
    internalChange.current = true;
    onChange(readNodesFromDom());
    setTimeout(() => { internalChange.current = false; }, 0);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter') {
      if (e.shiftKey && multiline) return;
      e.preventDefault();
      onEnter?.();
    }
    if (showFormattingToolbar && (e.ctrlKey || e.metaKey)) {
      if (e.key === 'b') { e.preventDefault(); applyFormatFromSelection('bold'); }
      if (e.key === 'i') { e.preventDefault(); applyFormatFromSelection('italic'); }
    }
  }

  function updateSelectionState() {
    if (!ref.current || !showFormattingToolbar) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return;

    const start = getCharOffset(ref.current, range.startContainer, range.startOffset);
    const end = getCharOffset(ref.current, range.endContainer, range.endOffset);
    setSelectionRange({ start, end });
    setActiveFormats(getActiveFormats(textOnlyNodes, start, end));
  }

  const applyFormatFromSelection = useCallback((role: 'bold' | 'italic') => {
    if (!ref.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return;

    const start = getCharOffset(ref.current, range.startContainer, range.startOffset);
    const end = getCharOffset(ref.current, range.endContainer, range.endOffset);
    if (start === end) return;

    const currentTextNodes = nodes.filter((n) => n.type !== 'link') as InlineNode[];
    const newTextNodes = applyFormat(currentTextNodes, role, start, end);
    const newNodes = [...newTextNodes, ...nodes.filter((n) => n.type === 'link')];

    // Write formatted HTML directly so the DOM reflects the new state immediately.
    // Then mark as internal so the useEffect sync skips this render cycle.
    const newHtml = inlineNodesToHtml(newNodes.filter((n) => n.type !== 'link'));
    ref.current.innerHTML = newHtml;
    internalChange.current = true;
    onChange(newNodes);
    setTimeout(() => { internalChange.current = false; }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, onChange]);

  function handleSaveLink(link: InlineLink) {
    if (editingLink !== null) {
      onChange(nodes.map((n, i) => (i === editingLink.index ? link : n)));
    } else {
      onChange([...nodes, link]);
    }
    setEditingLink(null);
    setAddingLink(false);
  }

  function handleDeleteLink(index: number) {
    onChange(nodes.filter((_, i) => i !== index));
    setEditingLink(null);
  }

  const hasSelection = selectionRange.start < selectionRange.end;

  return (
    <div className="w-full">
      {showFormattingToolbar && (
        <div className="flex items-center gap-0.5 mb-1.5">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); applyFormatFromSelection('bold'); }}
            title="Fetstil (Ctrl+B)"
            className={`p-1.5 rounded transition-colors ${
              activeFormats.bold && hasSelection
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); applyFormatFromSelection('italic'); }}
            title="Kursiv (Ctrl+I)"
            className={`p-1.5 rounded transition-colors ${
              activeFormats.italic && hasSelection
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          {!hasSelection && (
            <span className="text-[10px] text-gray-300 ml-1 select-none">
              Markera text för att formatera
            </span>
          )}
        </div>
      )}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={updateSelectionState}
        onKeyUp={updateSelectionState}
        data-placeholder={placeholder}
        className={`outline-none min-w-[1px] whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 ${className}`}
      />

      {linkNodes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {linkNodes.map(({ node, index }) => (
            <button
              key={index}
              type="button"
              onClick={() => setEditingLink({ index, link: node })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0066A1]/10 text-[#0066A1] text-xs font-medium border border-[#0066A1]/20 hover:bg-[#0066A1]/20 transition-colors group"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="max-w-[160px] truncate">{inlineNodesToText(node.children)}</span>
              <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setAddingLink(true)}
        className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#0066A1] transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        Lagg till lank
      </button>

      {addingLink && (
        <LinkEditorModal
          onSave={handleSaveLink}
          onClose={() => setAddingLink(false)}
        />
      )}
      {editingLink && (
        <LinkEditorModal
          initial={editingLink.link}
          onSave={handleSaveLink}
          onDelete={() => handleDeleteLink(editingLink.index)}
          onClose={() => setEditingLink(null)}
        />
      )}
    </div>
  );
}
