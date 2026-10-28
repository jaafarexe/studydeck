import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Flip active flashcard to reveal front or back' },
    { key: '1  or  ←', desc: 'Mark card as "Still Learning" (moves to Box 1)' },
    { key: '2  or  →', desc: 'Mark card as "Mastered" (advances to next Box)' },
    { key: 'H', desc: 'Toggle hint / mnemonic notes' },
    { key: 'S', desc: 'Listen to card pronunciation (Text-to-Speech)' },
    { key: 'F', desc: 'Toggle star / favorite status on card' },
    { key: 'Esc', desc: 'Exit study session or close modal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">Study Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-xs text-slate-500 mb-4">
            Accelerate your study sessions using rapid keyboard navigation during flashcard review:
          </p>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
            {shortcuts.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 text-xs bg-white hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">{item.desc}</span>
                <kbd className="px-2 py-1 font-mono text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded shadow-2xs whitespace-nowrap">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
