import { useState } from 'react';
import type { DocBookDocument } from '../types/docbook';
import { serializeDocument } from '../lib/serializer';
import { validateDocBookXml } from '../lib/parser';

export type EditorMode = 'visual' | 'code';

export type CodeStatus =
  | {
      ok: true;
      warnings: string[];
      sections: number;
      textBlocks: number;
      buttons: number;
    }
  | { ok: false; message: string; line: number | null };

function countContent(doc: DocBookDocument) {
  return {
    sections: doc.sections.length,
    textBlocks: (doc.rootParas ?? []).length,
    buttons: (doc.buttons ?? []).length,
  };
}

export function useCodeMode(doc: DocBookDocument, onDocChange: (doc: DocBookDocument) => void) {
  const [mode, setMode] = useState<EditorMode>('visual');
  const [codeText, setCodeText] = useState('');
  const [codeStatus, setCodeStatus] = useState<CodeStatus | null>(null);

  function resetCode(next: DocBookDocument) {
    setCodeText(serializeDocument(next));
    setCodeStatus({ ok: true, warnings: [], ...countContent(next) });
  }

  function editCode(text: string) {
    setCodeText(text);
    const result = validateDocBookXml(text);
    if (result.ok) {
      setCodeStatus({ ok: true, warnings: result.warnings, ...countContent(result.doc) });
      onDocChange({ ...result.doc, id: doc.id, name: doc.name });
    } else {
      setCodeStatus({ ok: false, message: result.error, line: result.line });
    }
  }

  function switchMode(next: EditorMode) {
    if (next === mode) return;
    if (next === 'code') {
      if (codeStatus?.ok === false) {
        setMode('code');
        return;
      }
      resetCode(doc);
      setMode('code');
      return;
    }
    setMode('visual');
  }

  return { mode, codeText, codeStatus, switchMode, editCode, resetCode };
}
