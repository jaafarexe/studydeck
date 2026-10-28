import React, { useState, useEffect } from 'react';
import { X, Layers } from 'lucide-react';
import { Deck, DeckThemeColor } from '../../types';

interface NewDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deckData: {
    title: string;
    description: string;
    category: string;
    color: DeckThemeColor;
    iconName: string;
  }) => void;
  editingDeck?: Deck | null;
}

const CATEGORIES = [
  'Science',
  'History',
  'Technology',
  'Languages',
  'Medicine',
  'Mathematics',
  'Law & Ethics',
  'General',
];

const COLORS: { value: DeckThemeColor; label: string; bg: string; border: string }[] = [
  { value: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', border: 'border-emerald-600' },
  { value: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', border: 'border-indigo-600' },
  { value: 'amber', label: 'Amber', bg: 'bg-amber-500', border: 'border-amber-600' },
  { value: 'sky', label: 'Sky Blue', bg: 'bg-sky-500', border: 'border-sky-600' },
  { value: 'rose', label: 'Rose', bg: 'bg-rose-500', border: 'border-rose-600' },
  { value: 'violet', label: 'Violet', bg: 'bg-violet-500', border: 'border-violet-600' },
];

const ICONS = ['Layers', 'Dna', 'Landmark', 'Code', 'BookOpen', 'Globe', 'Atom', 'Brain'];

export const NewDeckModal: React.FC<NewDeckModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDeck,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [color, setColor] = useState<DeckThemeColor>('indigo');
  const [iconName, setIconName] = useState('Layers');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingDeck) {
      setTitle(editingDeck.title);
      setDescription(editingDeck.description);
      setCategory(editingDeck.category || CATEGORIES[0]);
      setColor(editingDeck.color || 'indigo');
      setIconName(editingDeck.iconName || 'Layers');
    } else {
      setTitle('');
      setDescription('');
      setCategory(CATEGORIES[0]);
      setColor('indigo');
      setIconName('Layers');
    }
    setError('');
  }, [editingDeck, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Deck title is required');
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      color,
      iconName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            {editingDeck ? 'Edit Flashcard Deck' : 'Create New Deck'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deck Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Molecular Biochemistry, Constitutional Law, Japanese N5"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics or exams is this deck designed for?"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Theme Accent</label>
              <div className="flex items-center gap-2 pt-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-6 h-6 rounded-full ${c.bg} transition-transform ${
                      color === c.value ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Icon Style</label>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIconName(ic)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                    iconName === ic
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {editingDeck ? 'Save Changes' : 'Create Deck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
