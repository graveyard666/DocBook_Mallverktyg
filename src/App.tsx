import { useState } from 'react';
import { Eye, Code2, Save } from 'lucide-react';
import type { DocBookDocument } from './types/docbook';
import { createBlankDocument, loadExampleDocument } from './data/examples';
import { parseDocBookXml } from './lib/parser';
import { Sidebar } from './components/Sidebar';
import { DocumentEditor } from './components/editor/DocumentEditor';
import { InboxPreview } from './components/InboxPreview';
import { CodeView } from './components/CodeView';
import { LocalFolderDialog } from './components/LocalFolderDialog';
import { SaveDialog } from './components/SaveDialog';
import { useLocalTemplates } from './hooks/useLocalTemplates';

type RightPanel = 'preview' | 'code';

export default function App() {
  const [doc, setDoc] = useState<DocBookDocument>(createBlankDocument);
  const [activeExampleId, setActiveExampleId] = useState<string | null>(null);
  const [activeLocalId, setActiveLocalId] = useState<string | null>(null);
  const [activeFileHandle, setActiveFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanel>('preview');
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const localTemplates = useLocalTemplates();

  function handleLoadExample(id: string) {
    const loaded = loadExampleDocument(id);
    if (loaded) {
      setDoc(loaded);
      setActiveExampleId(id);
      setActiveLocalId(null);
      setActiveFileHandle(null);
    }
  }

  function handleNewBlank() {
    setDoc(createBlankDocument());
    setActiveExampleId(null);
    setActiveLocalId(null);
    setActiveFileHandle(null);
  }

  function handleLoadLocal(id: string) {
    const tmpl = localTemplates.templates.find((t) => t.id === id);
    if (!tmpl) return;
    const parsed = parseDocBookXml(tmpl.xml);
    if (!parsed) return;
    setDoc({ ...parsed, name: tmpl.name });
    setActiveLocalId(id);
    setActiveExampleId(null);
    setActiveFileHandle(tmpl.fileHandle);
  }

  function handleSavedAs(newHandle: FileSystemFileHandle) {
    setActiveFileHandle(newHandle);
    localTemplates.rescan();
  }

  const isFileApiSupported = 'showSaveFilePicker' in window;

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

        <div className="flex items-center gap-3">
          {/* Save button — shown in supporting browsers */}
          {isFileApiSupported && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              Spara
            </button>
          )}

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
            localTemplates={localTemplates.templates}
            activeLocalId={activeLocalId}
            folderName={localTemplates.folderName}
            isLocalSupported={localTemplates.isSupported}
            isLocalLoading={localTemplates.isLoading}
            onLoadLocal={handleLoadLocal}
            onOpenFolderDialog={() => setShowFolderDialog(true)}
            onDirectFolderPick={localTemplates.openFolderPicker}
            onRescan={localTemplates.rescan}
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

      {/* Dialogs */}
      <LocalFolderDialog
        isOpen={showFolderDialog}
        onClose={() => setShowFolderDialog(false)}
        isLoading={localTemplates.isLoading}
        isSupported={localTemplates.isSupported}
        folderName={localTemplates.folderName}
        templateCount={localTemplates.templates.length}
        skippedCount={localTemplates.skippedCount}
        onOpenPicker={localTemplates.openFolderPicker}
        onClear={localTemplates.clearFolder}
      />

      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        doc={doc}
        activeFileHandle={activeFileHandle}
        onSavedAs={handleSavedAs}
      />
    </div>
  );
}
