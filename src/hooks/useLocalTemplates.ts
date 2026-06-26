import { useState, useCallback } from 'react';
import { parseDocBookXml } from '../lib/parser';

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
  loadFromFileList: (files: FileList) => Promise<void>;
  clearFolder: () => void;
}

export function useLocalTemplates(): LocalTemplatesState {
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<LocalTemplate[]>([]);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);

  const loadFromFileList = useCallback(async (files: FileList) => {
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
          // Use webkitRelativePath when available; fall back to index+name for uniqueness
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

  const clearFolder = useCallback(() => {
    setTemplates([]);
    setFolderName(null);
    setSkippedCount(0);
  }, []);

  return { isLoading, templates, folderName, skippedCount, loadFromFileList, clearFolder };
}
