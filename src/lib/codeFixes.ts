import { validateDocBookXml } from './parser';

export interface CodeFix {
  label: string;
  text: string;
}

interface Edit {
  start: number;
  end: number;
  text: string;
}

const TAG_PATTERN = /<(\/?)([A-Za-z_][\w.:-]*)(?:\s[^<>]*)?(\/?)>/g;
const TAG_START_PATTERN = /<\/?[A-Za-z_][\w.:-]*/g;
const COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const BARE_AMPERSAND_PATTERN = /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g;

const TEXT_TAGS = new Set(['para', 'title', 'term', 'listitem']);
const BLOCK_TAGS = new Set(['para', 'section', 'itemizedlist', 'variablelist', 'buttons']);

function maskComments(text: string): string {
  return text.replace(COMMENT_PATTERN, (m) => ' '.repeat(m.length));
}

function applyEdits(text: string, edits: Edit[]): string {
  const ordered = [...edits].reverse().sort((a, b) => b.start - a.start);
  let result = text;
  for (const e of ordered) {
    result = result.slice(0, e.start) + e.text + result.slice(e.end);
  }
  return result;
}

function escapeBareAmpersands(text: string): string {
  return text.replace(BARE_AMPERSAND_PATTERN, '&amp;');
}

function closeUnterminatedTags(text: string): string {
  const masked = maskComments(text);
  const edits: Edit[] = [];
  for (const match of masked.matchAll(TAG_START_PATTERN)) {
    const nameEnd = (match.index ?? 0) + match[0].length;
    let quote: string | null = null;
    let terminated = false;
    let i = nameEnd;
    for (; i < masked.length; i++) {
      const ch = masked[i];
      if (ch === '<' || ch === '\n') break;
      if (quote) {
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (ch === '>') {
        terminated = true;
        break;
      }
    }
    if (terminated) continue;
    let at = i;
    while (at > nameEnd && /\s/.test(masked[at - 1])) at--;
    edits.push({ start: at, end: at, text: '>' });
  }
  return applyEdits(text, edits);
}

function opensNewBlock(open: string, name: string): boolean {
  if (open === name && TEXT_TAGS.has(name)) return true;
  return (open === 'para' || open === 'title') && BLOCK_TAGS.has(name);
}

function repairTags(text: string): string | null {
  const masked = maskComments(text);
  const stack: string[] = [];
  const edits: Edit[] = [];

  function closeDownTo(length: number, at: number) {
    while (stack.length > length) {
      edits.push({ start: at, end: at, text: `</${stack.pop()}>` });
    }
  }

  for (const match of masked.matchAll(TAG_PATTERN)) {
    const [, slash, name, selfClosing] = match;
    const index = match.index ?? 0;
    if (selfClosing) continue;
    const top = stack[stack.length - 1];
    if (!slash) {
      if (top !== undefined && opensNewBlock(top, name)) closeDownTo(stack.length - 1, index);
      stack.push(name);
      continue;
    }
    const depth = stack.lastIndexOf(name);
    if (depth !== -1) {
      closeDownTo(depth + 1, index);
      stack.pop();
      continue;
    }
    if (top === undefined) return null;
    const start = index + 1 + slash.length;
    edits.push({ start, end: start + name.length, text: top });
    stack.pop();
  }
  closeDownTo(0, text.length);
  return applyEdits(text, edits);
}

const STEPS: { label: string; run: (text: string) => string | null }[] = [
  { label: 'byt ut & mot &amp;', run: (text) => escapeBareAmpersands(text) },
  { label: 'sätt tillbaka saknade >', run: (text) => closeUnterminatedTags(text) },
  { label: 'stäng taggar där de saknas', run: repairTags },
];

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} och ${labels[labels.length - 1]}`;
}

export function suggestFix(text: string): CodeFix | null {
  let fixed = text;
  const applied: string[] = [];
  for (const step of STEPS) {
    const next = step.run(fixed);
    if (next === null || next === fixed) continue;
    fixed = next;
    applied.push(step.label);
  }
  if (applied.length === 0 || !validateDocBookXml(fixed).ok) return null;
  return { label: joinLabels(applied), text: fixed };
}
