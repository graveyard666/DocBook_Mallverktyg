import { useState, useCallback, useRef } from 'react';
import { parseDocBookXml } from '../lib/parser';
import { openFolderPicker } from '../lib/openFolder';

export interface LocalTemplate {
  id: string;
  name: string;
  xml: string;
}

export interface LocalTemplatesState {
  isLoading: boolean;
  templates: LocalTemplate[];
  folderName: string | null;
  skippedCount: number;
  pickFolder: () => void;
  rescanFolder: () => Promise<void>;
  clearFolder: () => void;
  updateTemplate: (fileName: string, xml: string) => void;
}

export function useLocalTemplates(): LocalTemplatesState {
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<LocalTemplate[]>([]);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);
  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const lastFileListRef = useRef<FileList | null>(null);

  const loadFromDirectory = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setIsLoading(true);
    const loaded: LocalTemplate[] = [];
    let skipped = 0;

    for await (const entry of handle.values()) {
      if (entry.kind !== 'file') continue;
      if (!entry.name.toLowerCase().endsWith('.xml')) continue;
      const fileHandle = entry as FileSystemFileHandle;
      try {
        const file = await fileHandle.getFile();
        const xml = await file.text();
        const doc = parseDocBookXml(xml);
        if (doc) {
          loaded.push({ id: entry.name, name: entry.name.replace(/\.xml$/i, ''), xml });
        } else {
          skipped++;
        }
      } catch {
        skipped++;
      }
    }

    loaded.sort((a, b) => a.name.localeCompare(b.name, 'sv'));
    setTemplates(loaded);
    setFolderName(handle.name);
    setSkippedCount(skipped);
    setIsLoading(false);
  }, []);

  const loadFromFileList = useCallback(async (files: FileList) => {
    lastFileListRef.current = files;
    dirHandleRef.current = null;
    setIsLoading(true);
    const loaded: LocalTemplate[] = [];
    let skipped = 0;

    let folder: string | null = null;
    if (files.length > 0) {
      const rel = files[0].webkitRelativePath;
      folder = rel ? rel.split('/')[0] : files[0].name.replace(/\.xml$/i, '');
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith('.xml')) continue;
      try {
        const xml = await file.text();
        const doc = parseDocBookXml(xml);
        if (doc) {
          const id = file.webkitRelativePath || `${i}_${file.name}`;
          loaded.push({ id, name: file.name.replace(/\.xml$/i, ''), xml });
        } else {
          skipped++;
        }
      } catch {
        skipped++;
      }
    }

    loaded.sort((a, b) => a.name.localeCompare(b.name, 'sv'));
    setTemplates(loaded);
    setFolderName(folder);
    setSkippedCount(skipped);
    setIsLoading(false);
  }, []);

  const pickFolder = useCallback(() => {
    if (typeof window.showDirectoryPicker === 'function') {
      window
        .showDirectoryPicker()
        .then(async (handle) => {
          dirHandleRef.current = handle;
          await loadFromDirectory(handle);
        })
        .catch((err: any) => {
          if (err?.name === 'AbortError') return;
          openFolderPicker(loadFromFileList);
        });
    } else {
      openFolderPicker(loadFromFileList);
    }
  }, [loadFromDirectory, loadFromFileList]);

  const rescanFolder = useCallback(async () => {
    if (dirHandleRef.current) {
      await loadFromDirectory(dirHandleRef.current);
    } else if (lastFileListRef.current) {
      await loadFromFileList(lastFileListRef.current);
    }
  }, [loadFromDirectory, loadFromFileList]);

  const clearFolder = useCallback(() => {
    dirHandleRef.current = null;
    lastFileListRef.current = null;
    setTemplates([]);
    setFolderName(null);
    setSkippedCount(0);
  }, []);

  const updateTemplate = useCallback((fileName: string, xml: string) => {
    setTemplates((prev) => {
      const id = fileName.replace(/\.xml$/i, '');
      const name = id;
      const idx = prev.findIndex((t) => t.name === name || t.id === fileName);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], xml };
        return updated;
      }
      return [...prev, { id: fileName, name, xml }].sort((a, b) =>
        a.name.localeCompare(b.name, 'sv')
      );
    });
  }, []);

  return { isLoading, templates, folderName, skippedCount, pickFolder, rescanFolder, clearFolder, updateTemplate };
}
