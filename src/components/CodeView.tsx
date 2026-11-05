import { useState } from 'react';
import { Copy, Download, Check, Code2 } from 'lucide-react';
import type { DocBookDocument } from '../types/docbook';
import { serializeDocument, entityEncodeDocBook } from '../lib/serializer';
import { highlightXml } from '../lib/xmlHighlight';

interface Props {
  doc: DocBookDocument;
}

// Syntax highlight for entity-encoded output
function highlightEncoded(xml: string): string {
  return xml
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Re-highlight the entity-encoded tags
    .replace(
      /(&amp;lt;\/?)([\w:]+)/g,
      '<span class="text-[#7EC8C8] font-semibold">$1$2</span>'
    )
    .replace(
      /(&amp;gt;)/g,
      '<span class="text-[#7EC8C8]">$1</span>'
    )
    .replace(
      /([\w:-]+)(=)(&quot;[^&]*&quot;)/g,
      '<span class="text-[#FFC87A]">$1</span>$2<span class="text-[#CE9178]">$3</span>'
    );
}

export function CodeView({ doc }: Props) {
  const [tab, setTab] = useState<'pretty' | 'encoded'>('pretty');
  const [copied, setCopied] = useState(false);

  const rawXml = serializeDocument(doc);
  const encodedXml = entityEncodeDocBook(rawXml);
  const displayXml = tab === 'pretty' ? rawXml : encodedXml;
  const highlightedHtml = tab === 'pretty' ? highlightXml(rawXml) : highlightEncoded(encodedXml);

  function copy() {
    navigator.clipboard.writeText(displayXml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function download() {
    const blob = new Blob([displayXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name.replace(/\s+/g, '_')}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="h-full flex flex-col bg-[#1E1E2E]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#7EC8C8]" />
          <span className="text-white text-sm font-semibold">DocBook XML</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Kopierat!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Kopiera
              </>
            )}
          </button>
          <button
            onClick={download}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-[#C0002E] text-white hover:bg-[#A0001E] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Ladda ner .xml
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setTab('pretty')}
          className={`px-4 py-2 text-xs font-semibold transition-colors ${
            tab === 'pretty'
              ? 'text-white border-b-2 border-[#7EC8C8]'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          Formaterad XML
        </button>
        <button
          onClick={() => setTab('encoded')}
          className={`px-4 py-2 text-xs font-semibold transition-colors ${
            tab === 'encoded'
              ? 'text-white border-b-2 border-[#7EC8C8]'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          SOAP-enkodad (AddMessage)
        </button>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto p-4">
        {tab === 'encoded' && (
          <div className="mb-3 text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 rounded px-3 py-2">
            Entity-enkodad version redo att klistras in i{' '}
            <code className="font-mono">AddMessage.Message.text</code>
          </div>
        )}
        <pre
          className="font-mono text-xs leading-relaxed whitespace-pre-wrap break-all"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </div>
    </div>
  );
}
