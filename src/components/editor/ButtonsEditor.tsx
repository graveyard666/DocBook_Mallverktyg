import { Plus, Trash2 } from 'lucide-react';
import type { MockButton } from '../../types/docbook';

function uid() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

interface Props {
  buttons: MockButton[];
  onUpdate: (buttons: MockButton[]) => void;
}

export function ButtonsEditor({ buttons, onUpdate }: Props) {
  function addButton() {
    onUpdate([...buttons, { id: uid(), label: '' }]);
  }

  function updateLabel(id: string, label: string) {
    onUpdate(buttons.map((b) => (b.id === id ? { ...b, label } : b)));
  }

  function deleteButton(id: string) {
    onUpdate(buttons.filter((b) => b.id !== id));
  }

  return (
    <div className="mt-4 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Knappar
        </span>
        <button
          onClick={addButton}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-gray-200 hover:border-[#0066A1] hover:text-[#0066A1] text-gray-500 transition-colors bg-white"
        >
          <Plus className="w-3.5 h-3.5" /> Lägg till knapp
        </button>
      </div>
      <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex items-start gap-2">
        <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 11.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm.75-3.5a.75.75 0 0 1-1.5 0V5.75a.75.75 0 0 1 1.5 0V9z"/>
        </svg>
        <p className="text-[11px] text-amber-700 italic leading-snug">
          Knappar ingår <span className="font-semibold not-italic">inte</span> i DocBook-koden och exporteras ej. Används endast för visuell förhandsgranskning.
        </p>
      </div>

      {buttons.length === 0 ? (
        <div className="px-4 py-4 text-xs text-gray-400 italic">
          Inga knappar. Klicka "Lägg till knapp" för att lägga till.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {buttons.map((btn) => (
            <div key={btn.id} className="flex items-center gap-2 px-4 py-3">
              <div className="flex-1">
                <input
                  value={btn.label}
                  onChange={(e) => updateLabel(btn.id, e.target.value)}
                  placeholder="Knapptext..."
                  className="w-full text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:border-[#0066A1] bg-gray-50 placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => deleteButton(btn.id)}
                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
