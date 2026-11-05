import { validateDocBookXml } from './parser';

export interface CodeFix {
  label: string;
  text: string;
}

const TAG_PATTERN = /<(\/?)([A-Za-z_][\w.:-]*)(?:\s[^<>]*)?(\/?)>/g;
const COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const BARE_AMPERSAND_PATTERN = /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g;

function escapeBareAmpersands(text: string): string {
  return text.replace(BARE_AMPERSAND_PATTERN, '&amp;');
}

function repairTags(text: string): string | null {
  const masked = text.replace(COMMENT_PATTERN, (m) => ' '.repeat(m.length));
  const stack: string[] = [];
  const renames: { start: number; end: number; name: string }[] = [];

  for (const match of masked.matchAll(TAG_PATTERN)) {
    const [, slash, name, selfClosing] = match;
    if (selfClosing) continue;
    if (!slash) {
      stack.push(name);
      continue;
    }
    const open = stack.pop();
    if (open === undefined) return null;
    if (open !== name) {
      const start = (match.index ?? 0) + 1 + slash.length;
      renames.push({ start, end: start + name.length, name: open });
    }
  }

  let result = text;
  for (const r of renames.reverse()) {
    result = result.slice(0, r.start) + r.name + result.slice(r.end);
  }
  const closers = stack
    .reverse()
    .map((name) => `</${name}>`)
    .join('');
  return result + closers;
}

const CANDIDATES: { label: string; run: (text: string) => string | null }[] = [
  {
    label: 'Byt ut tecknet & mot &amp; så att texten visas korrekt.',
    run: escapeBareAmpersands,
  },
  {
    label: 'Stäng de taggar som är öppna i rätt ordning.',
    run: repairTags,
  },
  {
    label: 'Byt ut tecknet & mot &amp; och stäng taggarna i rätt ordning.',
    run: (text) => repairTags(escapeBareAmpersands(text)),
  },
];

export function suggestFix(text: string): CodeFix | null {
  for (const candidate of CANDIDATES) {
    const fixed = candidate.run(text);
    if (fixed === null || fixed === text) continue;
    if (validateDocBookXml(fixed).ok) return { label: candidate.label, text: fixed };
  }
  return null;
}
