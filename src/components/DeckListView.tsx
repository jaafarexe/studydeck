import React, { useState } from 'react';
import {
  Play,
  Plus,
  BookOpen,
  Search,
  MoreVertical,
  Dna,
  Landmark,
  Code,
  Layers,
  Globe,
  Atom,
  Brain,
  Edit,
  Trash2,
} from 'lucide-react';
import { Deck, StudyMode } from '../types';
import { computeDeckStats } from '../utils/storage';

interface DeckListViewProps {
  decks: Deck[];
  onSelectDeck: (deck: Deck) => void;
  onStartStudy: (deck: Deck, mode: StudyMode) => void;
  onOpenNewDeck: () => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Dna,
  Landmark,
  Code,
  Layers,
  BookOpen,
  Globe,
  Atom,
  Brain,
};

export const DeckListView: React.FC<DeckListViewProps> = ({
  decks,
  onSelectDeck,
  onStartStudy,
  onOpenNewDeck,
  onEditDeck,
  onDeleteDeck,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openMenuDeckId, setOpenMenuDeckId] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(decks.map((d) => d.category)))];

  const filteredDecks = decks.filter((deck) => {
    if (selectedCategory !== 'All' && deck.category !== selectedCategory) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        deck.title.toLowerCase().includes(q) ||
        deck.description.toLowerCase().includes(q) ||
        deck.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header zone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
            Flashcard Decks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose a subject to study, or organize your personal card collections.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewDeck}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Deck</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decks by title or topic..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Categories Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-0.5 bg-slate-100 rounded-lg">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDecks.map((deck) => {
          const stats = computeDeckStats(deck);
          const IconComp = ICON_MAP[deck.iconName] || Layers;

          let accentBg = 'bg-indigo-500';
          let softBg = 'bg-indigo-50';
          let textColor = 'text-indigo-600';
          if (deck.color === 'emerald') {
            accentBg = 'bg-emerald-500';
            softBg = 'bg-emerald-50';
            textColor = 'text-emerald-700';
          } else if (deck.color === 'amber') {
            accentBg = 'bg-amber-500';
            softBg = 'bg-amber-50';
            textColor = 'text-amber-700';
          } else if (deck.color === 'rose') {
            accentBg = 'bg-rose-500';
            softBg = 'bg-rose-50';
            textColor = 'text-rose-700';
          } else if (deck.color === 'sky') {
            accentBg = 'bg-sky-500';
            softBg = 'bg-sky-50';
            textColor = 'text-sky-700';
          } else if (deck.color === 'violet') {
            accentBg = 'bg-violet-500';
            softBg = 'bg-violet-50';
            textColor = 'text-violet-700';
          }

          return (
            <div
              key={deck.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              {/* Deck Card Header Strip */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${softBg} ${textColor} flex items-center justify-center`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuDeckId(openMenuDeckId === deck.id ? null : deck.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuDeckId === deck.id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 animate-in fade-in duration-100">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuDeckId(null);
                            onEditDeck(deck);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit Info</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuDeckId(null);
                            if (window.confirm(`Delete "${deck.title}"?`)) {
                              onDeleteDeck(deck.id);
                            }
                          }}
                          className="w-full px-3 py-1.5 text-xs text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata Line */}
                <div className="flex items-center gap-2 text-2xs text-slate-500">
                  <span className={`font-semibold ${textColor}`}>{deck.category}</span>
                  <span>·</span>
                  <span>{deck.cards.length} cards</span>
                  {stats.mastered > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium">{stats.mastered} mastered</span>
                    </>
                  )}
                </div>

                <div>
                  <h3
                    onClick={() => onSelectDeck(deck)}
                    className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1 font-display"
                  >
                    {deck.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {deck.description}
                  </p>
                </div>

                {/* Mastery Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-2xs text-slate-500">
                    <span>Mastery</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {stats.masteryPercent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${accentBg} rounded-full transition-all duration-300`}
                      style={{ width: `${stats.masteryPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Deck Actions Footer */}
              <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectDeck(deck)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Manage Cards
                </button>

                <button
                  type="button"
                  disabled={deck.cards.length === 0}
                  onClick={() => onStartStudy(deck, 'flip')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Study Now</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Deck Card Slot */}
        <button
          type="button"
          onClick={onOpenNewDeck}
          className="min-h-[260px] border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center group transition-colors cursor-pointer bg-white/50 hover:bg-indigo-50/20"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center transition-colors mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors font-display">
            Create Flashcard Deck
          </span>
          <span className="text-xs text-slate-400 mt-1 max-w-xs">
            Add your own questions, terms, or study topics
          </span>
        </button>
      </div>

    </div>
  );
};
