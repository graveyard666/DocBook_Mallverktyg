import { useState } from 'react';
import { Eye, Code2 } from 'lucide-react';
import type { DocBookDocument } from './types/docbook';
import { createBlankDocument, loadExampleDocument } from './data/examples';
import { Sidebar } from './components/Sidebar';
import { DocumentEditor } from './components/editor/DocumentEditor';
import { InboxPreview } from './components/InboxPreview';
import { CodeView } from './components/CodeView';

type RightPanel = 'preview' | 'code';

export default function App() {
  const [doc, setDoc] = useState<DocBookDocument>(createBlankDocument);
  const [activeExampleId, setActiveExampleId] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanel>('preview');

  function handleLoadExample(id: string) {
    const loaded = loadExampleDocument(id);
    if (loaded) {
      setDoc(loaded);
      setActiveExampleId(id);
    }
  }

  function handleNewBlank() {
    setDoc(createBlankDocument());
    setActiveExampleId(null);
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Top bar */}
      <header className="flex-shrink-0 h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[#C0002E] rounded flex items-center justify-center">
              <span className="text-white font-black text-[8px]">1177</span>
            </div>
            <span className="font-bold text-gray-800 text-sm">Inkorg DocBook Mallverktyg</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-sm text-gray-400 truncate max-w-xs">{doc.name}</span>
        </div>

        {/* Right panel toggle */}
        <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <button
            onClick={() => setRightPanel('preview')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${
              rightPanel === 'preview'
                ? 'bg-[#C0002E] text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            Förhandsgranskning
          </button>
          <div className="w-px h-7 bg-gray-200 flex-shrink-0" />
          <button
            onClick={() => setRightPanel('code')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${
              rightPanel === 'code'
                ? 'bg-[#C0002E] text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            DocBook XML
          </button>
        </div>
      </header>

      {/* Main three-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-60 flex-shrink-0 overflow-hidden">
          <Sidebar
            onLoadExample={handleLoadExample}
            onNewBlank={handleNewBlank}
            activeExampleId={activeExampleId}
          />
        </aside>

        {/* Center: editor */}
        <main className="flex-1 flex flex-col overflow-hidden border-x border-gray-200">
          <DocumentEditor doc={doc} onUpdate={setDoc} />
        </main>

        {/* Right: preview or code */}
        <aside className="w-[520px] flex-shrink-0 overflow-hidden">
          {rightPanel === 'preview' ? (
            <InboxPreview doc={doc} />
          ) : (
            <CodeView doc={doc} />
          )}
        </aside>
      </div>
    </div>
  );
}
