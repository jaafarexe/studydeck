import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Star, Lightbulb, RotateCw, Check, AlertCircle } from 'lucide-react';
import { Flashcard } from '../../types';
import { soundManager } from '../../utils/sound';

interface FlashcardModeProps {
  card: Flashcard;
  onRate: (isMastered: boolean) => void;
  onToggleStar: (cardId: string) => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  card,
  onRate,
  onToggleStar,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset flip and hint whenever active card changes
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
    soundManager.stopSpeaking();
  }, [card.id]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      soundManager.playFlip();
      return !prev;
    });
  }, []);

  const handleRate = useCallback(
    (isMastered: boolean) => {
      if (isMastered) {
        soundManager.playMastered();
      } else {
        soundManager.playLearning();
      }
      onRate(isMastered);
    },
    [onRate]
  );

  const handleSpeak = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const textToSpeak = isFlipped ? card.back : card.front;
    soundManager.speak(textToSpeak);
  }, [isFlipped, card.front, card.back]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleRate(false);
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleRate(true);
      } else if (e.key.toLowerCase() === 'h' && card.hint) {
        e.preventDefault();
        setShowHint((h) => !h);
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        const textToSpeak = isFlipped ? card.back : card.front;
        soundManager.speak(textToSpeak);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        onToggleStar(card.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, card, isFlipped, onToggleStar]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* 3D Card Container */}
      <div
        className="w-full h-96 sm:h-[420px] perspective-1000 cursor-pointer select-none"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label="Click or press Space to flip flashcard"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-preserve-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front (Question) */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl border border-slate-200/90 shadow-lg p-7 sm:p-9 flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                Question
              </span>
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={handleSpeak}
                  title="Listen (S)"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Pronounce question"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(card.id);
                  }}
                  title="Star Card (F)"
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Toggle star"
                >
                  <Star
                    className={`w-4 h-4 ${
                      card.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-300 hover:text-amber-500'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="my-auto py-4 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug tracking-tight">
                {card.front}
              </h2>

              {card.codeSnippet && !isFlipped && (
                <div className="mt-4 p-3 bg-slate-900 text-slate-100 rounded-lg text-left text-xs font-mono overflow-x-auto shadow-inner">
                  <pre className="whitespace-pre-wrap">{card.codeSnippet}</pre>
                </div>
              )}

              {card.hint && (
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  {showHint ? (
                    <div className="inline-block p-3 text-xs bg-amber-50 text-amber-900 border border-amber-200/70 rounded-lg max-w-md animate-in fade-in duration-150">
                      <span className="font-semibold block mb-0.5">Hint:</span>
                      {card.hint}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowHint(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-amber-600 hover:bg-amber-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Show Hint (H)</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
              <span>Leitner Box {card.box}</span>
              <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Tap or press Space to flip</span>
              </span>
              <span>Reviewed {card.timesReviewed}x</span>
            </div>
          </div>

          {/* Card Back (Answer) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white rounded-2xl border border-indigo-200 shadow-xl p-7 sm:p-9 flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">
                Answer
              </span>
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={handleSpeak}
                  title="Listen (S)"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Pronounce answer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(card.id);
                  }}
                  title="Star Card (F)"
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Toggle star"
                >
                  <Star
                    className={`w-4 h-4 ${
                      card.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-300 hover:text-amber-500'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="my-auto py-4 text-center">
              <div className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal whitespace-pre-line text-left sm:text-center">
                {card.back}
              </div>

              {card.codeSnippet && isFlipped && (
                <div className="mt-4 p-3 bg-slate-900 text-slate-100 rounded-lg text-left text-xs font-mono overflow-x-auto shadow-inner">
                  <pre className="whitespace-pre-wrap">{card.codeSnippet}</pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
              <span>Leitner Box {card.box}</span>
              <span className="text-indigo-600 font-medium">Click card to see question</span>
              <span>Correct {card.timesCorrect}/{card.timesReviewed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Rating Buttons */}
      <div className="w-full mt-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleRate(false)}
          className="flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-xs group"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          <span>Still Learning</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-2xs font-mono bg-white text-rose-700 border border-rose-200 rounded">
            1
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => handleRate(true)}
          className="flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-300 rounded-xl transition-all cursor-pointer shadow-xs group"
        >
          <Check className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span>Got It / Mastered</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-2xs font-mono bg-white text-emerald-700 border border-emerald-200 rounded">
            2
          </kbd>
        </button>
      </div>
    </div>
  );
};
