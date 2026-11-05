import { useState } from 'react';
import { Eye, Code2, Save, Database, Check } from 'lucide-react';
import type { DocBookDocument } from './types/docbook';
import { createBlankDocument, loadExampleDocument } from './data/examples';
import { parseDocBookXml } from './lib/parser';
import { serializeDocument } from './lib/serializer';
import { Sidebar } from './components/Sidebar';
import { DocumentEditor } from './components/editor/DocumentEditor';
import { CodeEditor } from './components/editor/CodeEditor';
import { EditorModeBar } from './components/editor/EditorModeBar';
import { InboxPreview } from './components/InboxPreview';
import { CodeView } from './components/CodeView';
import { LocalFolderDialog } from './components/LocalFolderDialog';
import { SaveDialog } from './components/SaveDialog';
import { useLocalTemplates } from './hooks/useLocalTemplates';
import { useCodeMode } from './hooks/useCodeMode';
import { useSavedMessages } from './hooks/useSavedMessages';

type RightPanel = 'preview' | 'code';
type DbSaveState = 'idle' | 'saving' | 'saved';

function errorText(err: unknown): string {
  return err instanceof Error ? err.message : 'Något gick fel. Försök igen.';
}

export default function App() {
  const [doc, setDoc] = useState<DocBookDocument>(createBlankDocument);
  const [isDirty, setIsDirty] = useState(false);
  const [activeExampleId, setActiveExampleId] = useState<string | null>(null);
  const [activeLocalId, setActiveLocalId] = useState<string | null>(null);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanel>('preview');
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [dbSaveState, setDbSaveState] = useState<DbSaveState>('idle');
  const [notice, setNotice] = useState<string | null>(null);

  const localTemplates = useLocalTemplates();
  const savedMessages = useSavedMessages();

  function handleDocUpdate(updated: DocBookDocument) {
    setDoc(updated);
    setIsDirty(true);
  }

  const codeMode = useCodeMode(doc, handleDocUpdate);

  function showDocument(next: DocBookDocument) {
    setDoc(next);
    setIsDirty(false);
    setActiveExampleId(null);
    setActiveLocalId(null);
    setActiveSavedId(null);
    codeMode.resetCode(next);
  }

  function handleLoadExample(id: string) {
    const loaded = loadExampleDocument(id);
    if (!loaded) return;
    showDocument(loaded);
    setActiveExampleId(id);
  }

  function handleNewBlank() {
    showDocument(createBlankDocument());
  }

  function handleLoadLocal(id: string) {
    const tmpl = localTemplates.templates.find((t) => t.id === id);
    if (!tmpl) return;
    const parsed = parseDocBookXml(tmpl.xml);
    if (!parsed) return;
    showDocument(parsed);
    setActiveLocalId(id);
  }

  async function handleLoadSaved(id: string) {
    try {
      const record = await savedMessages.load(id);
      const parsed = parseDocBookXml(record.xml);
      if (!parsed) {
        setNotice('Det sparade meddelandet kunde inte läsas.');
        return;
      }
      showDocument({ ...parsed, name: record.name });
      setActiveSavedId(id);
      setNotice(null);
    } catch (err) {
      setNotice(errorText(err));
    }
  }

  async function handleDeleteSaved(id: string) {
    const item = savedMessages.messages.find((m) => m.id === id);
    if (!window.confirm(`Ta bort "${item?.name ?? 'meddelandet'}" från de sparade meddelandena?`)) return;
    try {
      await savedMessages.remove(id);
      if (activeSavedId === id) setActiveSavedId(null);
      setNotice(null);
    } catch (err) {
      setNotice(errorText(err));
    }
  }

  async function handleSaveToDatabase() {
    setDbSaveState('saving');
    try {
      const name = doc.name.trim() || 'Namnlöst meddelande';
      const id = await savedMessages.save(name, serializeDocument(doc), activeSavedId);
      setActiveSavedId(id);
      setNotice(null);
      setDbSaveState('saved');
      setTimeout(() => setDbSaveState('idle'), 2000);
    } catch (err) {
      setDbSaveState('idle');
      setNotice(errorText(err));
    }
  }

  function handleSaved(fileName: string, xml: string) {
    setIsDirty(false);
    localTemplates.updateTemplate(fileName, xml);
    localTemplates.rescanFolder();
  }

  const saveBlocked = codeMode.mode === 'code' && codeMode.codeStatus?.ok === false;

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
          {/* Save button — only shown when there are unsaved changes */}
          {isDirty && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-[#C0002E] rounded-lg hover:bg-[#A00025] transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              Spara
            </button>
          )}

          <button
            onClick={handleSaveToDatabase}
            disabled={dbSaveState === 'saving' || saveBlocked}
            title={saveBlocked ? 'Rätta felet i koden först' : undefined}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-[#C0002E] bg-white border border-[#C0002E]/30 rounded-lg hover:bg-[#C0002E]/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {dbSaveState === 'saved' ? <Check className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
            {dbSaveState === 'saving' ? 'Sparar...' : dbSaveState === 'saved' ? 'Sparat' : 'Spara i databas'}
          </button>

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

      {notice && (
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2 bg-red-50 border-b border-red-100 text-sm text-red-700">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-xs font-semibold text-red-700 hover:underline">
            Stäng
          </button>
        </div>
      )}

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
            isLocalLoading={localTemplates.isLoading}
            onLoadLocal={handleLoadLocal}
            onOpenFolderDialog={() => setShowFolderDialog(true)}
            onPickFolder={localTemplates.pickFolder}
            onRescanFolder={localTemplates.rescanFolder}
            savedMessages={savedMessages.messages}
            savedLoading={savedMessages.isLoading}
            savedError={savedMessages.error}
            activeSavedId={activeSavedId}
            onLoadSaved={handleLoadSaved}
            onDeleteSaved={handleDeleteSaved}
          />
        </aside>

        {/* Center: editor */}
        <main className="flex-1 flex flex-col overflow-hidden border-x border-gray-200">
          <EditorModeBar mode={codeMode.mode} onModeChange={codeMode.switchMode} />
          {codeMode.mode === 'visual' ? (
            <DocumentEditor doc={doc} onUpdate={handleDocUpdate} />
          ) : (
            <CodeEditor
              value={codeMode.codeText}
              onChange={codeMode.editCode}
              status={codeMode.codeStatus}
            />
          )}
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
        folderName={localTemplates.folderName}
        templateCount={localTemplates.templates.length}
        skippedCount={localTemplates.skippedCount}
        onPickFolder={localTemplates.pickFolder}
        onClear={localTemplates.clearFolder}
      />

      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        doc={doc}
        onSaved={handleSaved}
      />

    </div>
  );
}
