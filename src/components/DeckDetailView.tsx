import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Plus,
  Upload,
  Download,
  Edit,
  Trash2,
  Search,
  Star,
  RotateCw,
  Code2,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { Deck, Flashcard, StudyMode } from '../types';
import { computeDeckStats, exportDeckAsJSON, exportDeckAsCSV } from '../utils/storage';

interface DeckDetailViewProps {
  deck: Deck;
  onBack: () => void;
  onStartStudy: (mode: StudyMode) => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onOpenBulkImport: (deckId: string) => void;
  onAddCard: (cardData: Omit<Flashcard, 'id' | 'deckId' | 'status' | 'box' | 'timesReviewed' | 'timesCorrect' | 'createdAt'>) => void;
  onUpdateCard: (card: Flashcard) => void;
  onDeleteCard: (deckId: string, cardId: string) => void;
  onToggleStar: (deckId: string, cardId: string) => void;
}

export const DeckDetailView: React.FC<DeckDetailViewProps> = ({
  deck,
  onBack,
  onStartStudy,
  onEditDeck,
  onDeleteDeck,
  onOpenBulkImport,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onToggleStar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'mastered' | 'learning' | 'unstudied' | 'starred'>('all');
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [flippedCardIds, setFlippedCardIds] = useState<Set<string>>(new Set());

  // Form states for new/edit card
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [hint, setHint] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  const stats = computeDeckStats(deck);

  const resetForm = () => {
    setFront('');
    setBack('');
    setHint('');
    setCodeSnippet('');
    setShowCodeInput(false);
    setShowAddCard(false);
    setEditingCardId(null);
  };

  const handleStartEditCard = (card: Flashcard) => {
    setEditingCardId(card.id);
    setFront(card.front);
    setBack(card.back);
    setHint(card.hint || '');
    setCodeSnippet(card.codeSnippet || '');
    setShowCodeInput(!!card.codeSnippet);
    setShowAddCard(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    if (editingCardId) {
      const existing = deck.cards.find((c) => c.id === editingCardId);
      if (existing) {
        onUpdateCard({
          ...existing,
          front: front.trim(),
          back: back.trim(),
          hint: hint.trim() || undefined,
          codeSnippet: codeSnippet.trim() || undefined,
        });
      }
    } else {
      onAddCard({
        front: front.trim(),
        back: back.trim(),
        hint: hint.trim() || undefined,
        codeSnippet: codeSnippet.trim() || undefined,
        isStarred: false,
      });
    }

    resetForm();
  };

  const toggleCardFlip = (cardId: string) => {
    setFlippedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  // Filtered cards list
  const filteredCards = deck.cards.filter((card) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        card.front.toLowerCase().includes(q) ||
        card.back.toLowerCase().includes(q) ||
        (card.hint && card.hint.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (statusFilter === 'mastered') return card.status === 'mastered';
    if (statusFilter === 'learning') return card.status === 'learning';
    if (statusFilter === 'unstudied') return card.status === 'unstudied';
    if (statusFilter === 'starred') return !!card.isStarred;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation Strip */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Decks</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportDeckAsJSON(deck)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="Export as JSON"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>
          <button
            type="button"
            onClick={() => exportDeckAsCSV(deck)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="Export as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenBulkImport(deck.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Cards</span>
          </button>
          <button
            type="button"
            onClick={() => onEditDeck(deck)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Deck Info"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${deck.title}"?`)) {
                onDeleteDeck(deck.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Deck"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deck Hero Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-indigo-600">{deck.category}</span>
              <span>·</span>
              <span>{deck.cards.length} flashcards</span>
              {stats.starredCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-amber-600 font-medium">{stats.starredCount} starred</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
              {deck.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">{deck.description}</p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={deck.cards.length === 0}
              onClick={() => onStartStudy('flip')}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Study Deck</span>
            </button>
            <button
              type="button"
              disabled={deck.cards.length === 0}
              onClick={() => onStartStudy('quiz')}
              className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-colors cursor-pointer"
            >
              <span>Take Quiz</span>
            </button>
            <button
              type="button"
              disabled={deck.cards.length === 0}
              onClick={() => onStartStudy('match')}
              className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-colors cursor-pointer"
            >
              <span>Speed Match</span>
            </button>
          </div>
        </div>

        {/* Deck Progress Metrics Strip */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="block text-2xs uppercase tracking-wider font-semibold text-slate-400 mb-0.5">
              Mastery Rate
            </span>
            <span className="text-2xl font-bold text-slate-900 font-display tabular-nums">
              {stats.masteryPercent}%
            </span>
          </div>

          <div>
            <span className="block text-2xs uppercase tracking-wider font-semibold text-emerald-600 mb-0.5">
              Mastered
            </span>
            <span className="text-2xl font-bold text-emerald-700 font-display tabular-nums">
              {stats.mastered}
            </span>
          </div>

          <div>
            <span className="block text-2xs uppercase tracking-wider font-semibold text-amber-600 mb-0.5">
              Learning
            </span>
            <span className="text-2xl font-bold text-amber-600 font-display tabular-nums">
              {stats.learning}
            </span>
          </div>

          <div>
            <span className="block text-2xs uppercase tracking-wider font-semibold text-slate-400 mb-0.5">
              Unstudied
            </span>
            <span className="text-2xl font-bold text-slate-500 font-display tabular-nums">
              {stats.unstudied}
            </span>
          </div>
        </div>
      </div>

      {/* Cards Section Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              Cards in this Deck ({filteredCards.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (showAddCard && !editingCardId) {
                  setShowAddCard(false);
                } else {
                  resetForm();
                  setShowAddCard(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Card</span>
            </button>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards by question or answer..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
            {(['all', 'mastered', 'learning', 'unstudied', 'starred'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setStatusFilter(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize cursor-pointer ${
                  statusFilter === mode
                    ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'all' ? 'All' : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Add / Edit Card Inline Drawer */}
        {showAddCard && (
          <form
            onSubmit={handleSaveCard}
            className="bg-indigo-50/40 border border-indigo-200 rounded-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCardId ? 'Edit Flashcard' : 'Add New Flashcard'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question / Front *
                </label>
                <textarea
                  rows={3}
                  required
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="e.g. What is the role of ribosomes in the cell?"
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Answer / Back *
                </label>
                <textarea
                  rows={3}
                  required
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="e.g. Ribosomes synthesize proteins by translating messenger RNA."
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Hint or Mnemonic
                </label>
                <input
                  type="text"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  placeholder="e.g. Protein factory of the cell"
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Code Snippet / Formula (Optional)
                  </label>
                  {!showCodeInput && (
                    <button
                      type="button"
                      onClick={() => setShowCodeInput(true)}
                      className="text-xs text-indigo-600 hover:underline cursor-pointer"
                    >
                      + Add code
                    </button>
                  )}
                </div>
                {showCodeInput && (
                  <textarea
                    rows={2}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="e.g. def binary_search(arr, target): ..."
                    className="w-full p-2 text-xs font-mono bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:outline-none resize-none"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {editingCardId ? 'Save Updates' : 'Add Flashcard'}
              </button>
            </div>
          </form>
        )}

        {/* Cards Grid / List */}
        {filteredCards.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">No cards found</p>
            <p className="text-xs text-slate-500 mb-4">
              {searchQuery ? 'Try adjusting your search query.' : 'Add your first card to this deck!'}
            </p>
            <button
              type="button"
              onClick={() => setShowAddCard(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Create Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card) => {
              const isFlipped = flippedCardIds.has(card.id);

              return (
                <div
                  key={card.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-2xs text-slate-400">
                        <span className="font-semibold text-indigo-600 uppercase tracking-wider">
                          {isFlipped ? 'Answer' : 'Question'}
                        </span>
                        <span>·</span>
                        <span>Box {card.box}</span>
                        <span>·</span>
                        <span>Reviewed {card.timesReviewed}x</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onToggleStar(deck.id, card.id)}
                          className="p-1 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                          title="Star card"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              card.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEditCard(card)}
                          className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Edit card"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this card?')) {
                              onDeleteCard(deck.id, card.id);
                            }
                          }}
                          className="p-1 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div
                      onClick={() => toggleCardFlip(card.id)}
                      className="cursor-pointer min-h-[70px] select-none"
                    >
                      <p className="text-sm font-medium text-slate-900 leading-relaxed whitespace-pre-line">
                        {isFlipped ? card.back : card.front}
                      </p>

                      {card.codeSnippet && (
                        <div className="mt-2 p-2 bg-slate-900 text-slate-100 rounded text-2xs font-mono overflow-x-auto">
                          <pre className="whitespace-pre-wrap">{card.codeSnippet}</pre>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => toggleCardFlip(card.id)}
                      className="inline-flex items-center gap-1 text-indigo-600 font-medium hover:underline cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
                    </button>

                    <span
                      className={`font-semibold capitalize ${
                        card.status === 'mastered'
                          ? 'text-emerald-700'
                          : card.status === 'learning'
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {card.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
