import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface Props {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function BlockControls({ onMoveUp, onMoveDown, onDelete, isFirst, isLast }: Props) {
  return (
    <div className="absolute right-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded shadow-sm border border-gray-200 p-0.5">
      <button
        onClick={onMoveUp}
        disabled={isFirst}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
        title="Flytta upp"
      >
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onMoveDown}
        disabled={isLast}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
        title="Flytta ner"
      >
        <ArrowDown className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-0.5" />
      <button
        onClick={onDelete}
        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        title="Ta bort"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
