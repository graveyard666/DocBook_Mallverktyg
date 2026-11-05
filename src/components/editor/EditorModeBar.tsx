import { LayoutGrid, Code2 } from 'lucide-react';
import type { EditorMode } from '../../hooks/useCodeMode';

interface Props {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

export function EditorModeBar({ mode, onModeChange }: Props) {
  const tabClass = (active: boolean) =>
    `flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold transition-colors ${
      active ? 'bg-[#C0002E] text-white' : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <div className="flex-shrink-0 px-6 py-2.5 bg-white border-b border-gray-200 flex items-center">
      <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <button onClick={() => onModeChange('visual')} className={tabClass(mode === 'visual')}>
          <LayoutGrid className="w-3.5 h-3.5" />
          Grafiskt
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <button onClick={() => onModeChange('code')} className={tabClass(mode === 'code')}>
          <Code2 className="w-3.5 h-3.5" />
          Kod
        </button>
      </div>
    </div>
  );
}
