import { useState } from 'react';
import type { DocBookDocument } from '../types/docbook';
import { serializeDocument } from '../lib/serializer';
import { validateDocBookXml } from '../lib/parser';

export type EditorMode = 'visual' | 'code';
export type ImportMode = 'append' | 'replace';

export function useCodeMode(doc: DocBookDocument, onDocChange: (doc: DocBookDocument) => void) {
  const [mode, setMode] = useState<EditorMode>('visual');
  const [codeText, setCodeText] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeWarnings, setCodeWarnings] = useState<string[]>([]);

  function resetCode(next: DocBookDocument) {
    setCodeText(serializeDocument(next));
    setCodeError(null);
    setCodeWarnings([]);
  }

  function editCode(text: string) {
    setCodeText(text);
    const result = validateDocBookXml(text);
    if (result.ok) {
      setCodeError(null);
      setCodeWarnings(result.warnings);
      onDocChange({ ...result.doc, id: doc.id, name: doc.name });
    } else {
      setCodeError(result.error);
      setCodeWarnings([]);
    }
  }

  function switchMode(next: EditorMode) {
    if (next === mode) return;
    if (next === 'code') {
      resetCode(doc);
      setMode('code');
      return;
    }
    if (codeError) return;
    setMode('visual');
  }

  function importDocument(imported: DocBookDocument, how: ImportMode) {
    const next: DocBookDocument =
      how === 'replace'
        ? { ...imported, id: doc.id, name: doc.name }
        : {
            ...doc,
            sections: [...doc.sections, ...imported.sections],
            rootParas: [...(doc.rootParas ?? []), ...(imported.rootParas ?? [])],
            buttons: [...(doc.buttons ?? []), ...(imported.buttons ?? [])],
          };
    onDocChange(next);
    resetCode(next);
  }

  return {
    mode,
    codeText,
    codeError,
    codeWarnings,
    switchMode,
    editCode,
    importDocument,
    resetCode,
  };
}
