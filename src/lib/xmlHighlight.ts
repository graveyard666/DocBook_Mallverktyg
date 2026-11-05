export function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlightXml(xml: string): string {
  return xml
    .split('\n')
    .map((line) => {
      if (line.trimStart().startsWith('<?')) {
        return `<span class="text-gray-400">${escHtml(line)}</span>`;
      }

      let result = '';
      let pos = 0;
      while (pos < line.length) {
        if (line[pos] === '<') {
          const end = line.indexOf('>', pos);
          if (end === -1) {
            result += escHtml(line.slice(pos));
            break;
          }
          result += highlightTag(line.slice(pos, end + 1));
          pos = end + 1;
        } else {
          const next = line.indexOf('<', pos);
          const text = next === -1 ? line.slice(pos) : line.slice(pos, next);
          result += `<span class="text-gray-200">${escHtml(text)}</span>`;
          pos = next === -1 ? line.length : next;
        }
      }
      return result;
    })
    .join('\n');
}

function highlightTag(tag: string): string {
  if (tag.startsWith('</')) {
    const name = tag.slice(2, -1).trim();
    return `<span class="text-[#7EC8C8]">&lt;/</span><span class="text-[#7EC8C8] font-semibold">${escHtml(name)}</span><span class="text-[#7EC8C8]">&gt;</span>`;
  }
  const selfClose = tag.endsWith('/>');
  const inner = selfClose ? tag.slice(1, -2) : tag.slice(1, -1);
  const spaceIdx = inner.search(/\s/);
  const tagName = spaceIdx === -1 ? inner : inner.slice(0, spaceIdx);
  const rest = spaceIdx === -1 ? '' : inner.slice(spaceIdx);

  const attrHtml = escHtml(rest).replace(
    /([\w:-]+)(=)("([^"]*)")/g,
    `<span class="text-[#FFC87A]">$1</span><span class="text-gray-400">$2</span><span class="text-[#CE9178]">"$4"</span>`
  );

  const bracket = selfClose ? '/&gt;' : '&gt;';
  return (
    `<span class="text-[#7EC8C8]">&lt;</span>` +
    `<span class="text-[#7EC8C8] font-semibold">${escHtml(tagName)}</span>` +
    `${attrHtml}` +
    `<span class="text-[#7EC8C8]">${bracket}</span>`
  );
}
