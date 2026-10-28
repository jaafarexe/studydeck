import React, { useState } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { parseBulkCards } from '../../utils/storage';
import { Flashcard } from '../../types';

interface BulkImportModalProps {
  isOpen: boolean;
  deckId: string;
  deckTitle: string;
  onClose: () => void;
  onImport: (newCards: Flashcard[]) => void;
}

const TEMPLATE_QA = `Q: What is the mitochondria?
A: The powerhouse of the cell generating ATP through oxidative phosphorylation.

Q: What is Osmosis?
A: The passive diffusion of water molecules across a semipermeable membrane from lower to higher solute concentration.

Q: What is Ribosome function?
A: Translates mRNA genetic transcripts into functional polypeptide protein chains.`;

const TEMPLATE_DASH = `Photosynthesis - The process converting solar light energy into biochemical glucose.
Enzyme - A biological protein catalyst lowering the activation energy of metabolic reactions.
Homeostasis - Maintenance of a stable internal physiological state despite external changes.`;

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  deckId,
  deckTitle,
  onClose,
  onImport,
}) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const previewCards = text.trim() ? parseBulkCards(deckId, text) : [];

  const handleImport = () => {
    if (previewCards.length === 0) {
      setError('No valid flashcards found. Check format and try again.');
      return;
    }
    onImport(previewCards);
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Import Cards in Bulk</h3>
            <span className="text-xs text-slate-500">Adding to {deckTitle}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Paste your questions & answers:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Load sample:</span>
              <button
                type="button"
                onClick={() => setText(TEMPLATE_QA)}
                className="text-xs text-indigo-600 hover:underline cursor-pointer"
              >
                Q & A format
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setText(TEMPLATE_DASH)}
                className="text-xs text-indigo-600 hover:underline cursor-pointer"
              >
                Term - Def format
              </button>
            </div>
          </div>

          <textarea
            rows={8}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError('');
            }}
            placeholder={`Supported formats:\n1. Q: Question\n   A: Answer\n\n2. Term - Definition\n\n3. Tab-delimited (Anki / Google Sheets copy-paste)`}
            className="w-full px-3 py-2 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />

          {error && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Parsed Cards: <strong className="font-semibold text-slate-900 tabular-nums">{previewCards.length}</strong></span>
            </div>
            {previewCards.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready to add
              </span>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={previewCards.length === 0}
              onClick={handleImport}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Import {previewCards.length > 0 ? `${previewCards.length} Cards` : 'Cards'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
