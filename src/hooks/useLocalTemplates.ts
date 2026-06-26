import { useState, useEffect, useCallback } from 'react';
import { parseDocBookXml } from '../lib/parser';

export interface LocalTemplate {
  id: string;
  name: string;
  xml: string;
  fileHandle: FileSystemFileHandle;
}

const DB_NAME = 'docbook-tool';
const DB_STORE = 'fs-handles';
const FOLDER_KEY = 'local-folder';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getStoredHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).get(FOLDER_KEY);
      req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function storeHandle(handle: FileSystemDirectoryHandle | null): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      if (handle) {
        tx.objectStore(DB_STORE).put(handle, FOLDER_KEY);
      } else {
        tx.objectStore(DB_STORE).delete(FOLDER_KEY);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

async function scanFolder(
  dirHandle: FileSystemDirectoryHandle
): Promise<{ templates: LocalTemplate[]; skippedCount: number }> {
  const templates: LocalTemplate[] = [];
  let skippedCount = 0;

  // FileSystemDirectoryHandle is async iterable over [name, handle] entries
  for await (const [name, handle] of dirHandle as unknown as AsyncIterable<
    [string, FileSystemHandle]
  >) {
    if (handle.kind !== 'file' || !name.toLowerCase().endsWith('.xml')) continue;
    const fileHandle = handle as FileSystemFileHandle;
    try {
      const file = await fileHandle.getFile();
      const xml = await file.text();
      const doc = parseDocBookXml(xml);
      if (doc) {
        templates.push({
          id: name,
          name: name.replace(/\.xml$/i, ''),
          xml,
          fileHandle,
        });
      } else {
        skippedCount++;
      }
    } catch {
      skippedCount++;
    }
  }

  templates.sort((a, b) => a.name.localeCompare(b.name, 'sv'));
  return { templates, skippedCount };
}

export interface LocalTemplatesState {
  isSupported: boolean;
  isLoading: boolean;
  templates: LocalTemplate[];
  folderName: string | null;
  skippedCount: number;
  openFolderPicker: () => Promise<void>;
  rescan: () => Promise<void>;
  clearFolder: () => void;
}

export function useLocalTemplates(): LocalTemplatesState {
  const isSupported = 'showDirectoryPicker' in window;

  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<LocalTemplate[]>([]);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);

  const applyHandle = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setIsLoading(true);
    setFolderName(handle.name);
    try {
      const result = await scanFolder(handle);
      setTemplates(result.templates);
      setSkippedCount(result.skippedCount);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Restore persisted handle on mount
  useEffect(() => {
    if (!isSupported) return;
    let cancelled = false;
    getStoredHandle().then(async (handle) => {
      if (!handle || cancelled) return;
      try {
        const perm = await handle.queryPermission({ mode: 'readwrite' });
        if (perm === 'granted' && !cancelled) {
          setDirHandle(handle);
          await applyHandle(handle);
        }
        // If 'prompt', we wait for the user to explicitly re-open the picker
      } catch {
        storeHandle(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isSupported, applyHandle]);

  const openFolderPicker = useCallback(async () => {
    if (!isSupported) return;
    try {
      const handle = await (
        window as Window & { showDirectoryPicker: (opts?: object) => Promise<FileSystemDirectoryHandle> }
      ).showDirectoryPicker({ mode: 'readwrite' });
      setDirHandle(handle);
      await storeHandle(handle);
      await applyHandle(handle);
    } catch {
      // User cancelled — do nothing
    }
  }, [isSupported, applyHandle]);

  const rescan = useCallback(async () => {
    if (!dirHandle) return;
    await applyHandle(dirHandle);
  }, [dirHandle, applyHandle]);

  const clearFolder = useCallback(() => {
    setDirHandle(null);
    setTemplates([]);
    setFolderName(null);
    setSkippedCount(0);
    storeHandle(null);
  }, []);

  return {
    isSupported,
    isLoading,
    templates,
    folderName,
    skippedCount,
    openFolderPicker,
    rescan,
    clearFolder,
  };
}
