import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Shuffle,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Deck, Flashcard, StudyMode, SessionResult } from '../../types';
import { FlashcardMode } from './FlashcardMode';
import { QuizMode } from './QuizMode';
import { TypeMode } from './TypeMode';
import { SpeedMatchMode } from './SpeedMatchMode';
import { SessionSummary } from './SessionSummary';
import { recordSessionCompletion } from '../../utils/storage';

interface StudySessionViewProps {
  deck: Deck;
  initialMode?: StudyMode;
  onExit: () => void;
  onUpdateCardStatus: (
    deckId: string,
    cardId: string,
    isMastered: boolean,
    newBox: 1 | 2 | 3 | 4 | 5
  ) => void;
  onToggleStar: (deckId: string, cardId: string) => void;
  onOpenKeyboardHelp: () => void;
}

export const StudySessionView: React.FC<StudySessionViewProps> = ({
  deck,
  initialMode = 'flip',
  onExit,
  onUpdateCardStatus,
  onToggleStar,
  onOpenKeyboardHelp,
}) => {
  const [mode, setMode] = useState<StudyMode>(initialMode);
  const [isShuffled, setIsShuffled] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'learning' | 'starred'>('all');

  // Study progress tracking
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);
  const [sessionHardCardIds, setSessionHardCardIds] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

  // Filter cards based on user selection
  const studyCards = useMemo(() => {
    let pool = [...deck.cards];
    if (filterMode === 'learning') {
      pool = pool.filter((c) => c.status === 'learning' || c.status === 'unstudied');
    } else if (filterMode === 'starred') {
      pool = pool.filter((c) => c.isStarred);
    }

    if (isShuffled) {
      pool = [...pool].sort(() => Math.random() - 0.5);
    }
    return pool;
  }, [deck.cards, filterMode, isShuffled]);

  // Reset when filter or shuffle changes
  const resetSession = (filter?: 'all' | 'learning' | 'starred') => {
    if (filter) setFilterMode(filter);
    setCurrentIndex(0);
    setMasteredCount(0);
    setLearningCount(0);
    setSessionHardCardIds([]);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
  };

  const currentCard: Flashcard | undefined = studyCards[currentIndex];

  const handleCardRate = (isMastered: boolean) => {
    if (!currentCard) return;

    // Calculate new Leitner box:
    // If mastered: box advances by 1 (max 5)
    // If learning: box resets to 1
    const currentBox = currentCard.box || 1;
    const newBox = isMastered
      ? ((Math.min(5, currentBox + 1)) as 1 | 2 | 3 | 4 | 5)
      : (1 as 1 | 2 | 3 | 4 | 5);

    onUpdateCardStatus(deck.id, currentCard.id, isMastered, newBox);

    if (isMastered) {
      setMasteredCount((m) => m + 1);
    } else {
      setLearningCount((l) => l + 1);
      setSessionHardCardIds((prev) => Array.from(new Set([...prev, currentCard.id])));
    }

    // Move to next card or finish session
    if (currentIndex + 1 < studyCards.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishSession(masteredCount + (isMastered ? 1 : 0), learningCount + (isMastered ? 0 : 1));
    }
  };

  const finishSession = (finalMastered: number, finalLearning: number) => {
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const total = studyCards.length;
    const accuracy = total > 0 ? Math.round((finalMastered / total) * 100) : 0;

    const result: SessionResult = {
      deckId: deck.id,
      deckTitle: deck.title,
      mode,
      totalCards: total,
      masteredCards: finalMastered,
      learningCards: finalLearning,
      accuracy,
      durationSeconds,
      completedAt: new Date().toISOString(),
      hardCardIds: sessionHardCardIds,
    };

    recordSessionCompletion(result);
    setIsCompleted(true);
  };

  // Hard cards objects
  const hardCardsList = useMemo(() => {
    return deck.cards.filter((c) => sessionHardCardIds.includes(c.id));
  }, [deck.cards, sessionHardCardIds]);

  const progressPercent =
    studyCards.length > 0 ? Math.round(((currentIndex) / studyCards.length) * 100) : 0;

  if (studyCards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <p className="text-base text-slate-700 font-semibold mb-2">No cards matching this filter</p>
          <p className="text-xs text-slate-500 mb-6">
            There are currently no cards marked as {filterMode} in this deck.
          </p>
          <button
            type="button"
            onClick={() => resetSession('all')}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Study All Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Session Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Exit Session"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 line-clamp-1">{deck.title}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{deck.category}</span>
              <span>·</span>
              <span>
                {studyCards.length} {studyCards.length === 1 ? 'card' : 'cards'}
              </span>
            </div>
          </div>
        </div>

        {/* Study Mode Switcher (Interactive Segmented Control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setMode('flip');
              resetSession();
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'flip'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flashcards
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('quiz');
              resetSession();
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'quiz'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quiz
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('type');
              resetSession();
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'type'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Type Recall
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('match');
              resetSession();
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'match'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Speed Match
          </button>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {mode !== 'match' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsShuffled((s) => !s);
                  resetSession();
                }}
                title={isShuffled ? 'Shuffle Enabled' : 'Shuffle Cards'}
                className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isShuffled
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>

              <select
                value={filterMode}
                onChange={(e) => resetSession(e.target.value as 'all' | 'learning' | 'starred')}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Cards</option>
                <option value="learning">Needs Practice</option>
                <option value="starred">Starred Only</option>
              </select>
            </>
          )}

          <button
            type="button"
            onClick={onOpenKeyboardHelp}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Keyboard shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar (for linear modes) */}
      {mode !== 'match' && !isCompleted && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 tabular-nums">
                Card {currentIndex + 1} of {studyCards.length}
              </span>
              <span>·</span>
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="tabular-nums">{masteredCount}</span>
              </span>
              <span>·</span>
              <span className="text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="tabular-nums">{learningCount}</span>
              </span>
            </div>

            <span className="font-mono text-slate-400 tabular-nums">{progressPercent}%</span>
          </div>

          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex + 1) / studyCards.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Study Arena */}
      {isCompleted ? (
        <SessionSummary
          deckTitle={deck.title}
          mode={mode}
          totalCards={studyCards.length}
          masteredCount={masteredCount}
          learningCount={learningCount}
          hardCards={hardCardsList}
          onRestartAll={() => resetSession('all')}
          onStudyHardCards={() => resetSession('learning')}
          onExit={onExit}
        />
      ) : mode === 'flip' && currentCard ? (
        <FlashcardMode
          card={currentCard}
          onRate={handleCardRate}
          onToggleStar={(id) => onToggleStar(deck.id, id)}
        />
      ) : mode === 'quiz' && currentCard ? (
        <QuizMode
          card={currentCard}
          allCards={deck.cards}
          onAnswer={handleCardRate}
        />
      ) : mode === 'type' && currentCard ? (
        <TypeMode
          card={currentCard}
          onAnswer={handleCardRate}
        />
      ) : mode === 'match' ? (
        <SpeedMatchMode
          cards={deck.cards}
          onFinish={(duration) => {
            // Record match session
            recordSessionCompletion({
              deckId: deck.id,
              deckTitle: deck.title,
              mode: 'match',
              totalCards: Math.min(6, deck.cards.length),
              masteredCards: Math.min(6, deck.cards.length),
              learningCards: 0,
              accuracy: 100,
              durationSeconds: duration,
              completedAt: new Date().toISOString(),
              hardCardIds: [],
            });
          }}
        />
      ) : null}

    </div>
  );
};
