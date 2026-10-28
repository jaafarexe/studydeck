import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { Flashcard } from '../../types';
import { soundManager } from '../../utils/sound';

interface QuizModeProps {
  card: Flashcard;
  allCards: Flashcard[];
  onAnswer: (isCorrect: boolean) => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ card, allCards, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Generate 4 randomized options (1 correct + up to 3 distractors from other cards in deck)
  const options = useMemo(() => {
    const correct = card.back;
    const otherBacks = allCards
      .filter((c) => c.id !== card.id && c.back.trim() !== correct.trim())
      .map((c) => c.back);

    // Shuffle other backs and pick up to 3
    const shuffledOthers = [...otherBacks].sort(() => Math.random() - 0.5).slice(0, 3);

    // If deck has fewer than 4 cards, add fallback generic distractors
    const fallbackDistractors = [
      'Inversely proportional to standard cellular kinetic equilibrium',
      'Occurs strictly within anaerobic prokaryotic cytoplasm',
      'Requires enzymatic activation without ATP hydrolysis',
    ];

    let pool = [...shuffledOthers];
    let fallbackIdx = 0;
    while (pool.length < 3) {
      pool.push(fallbackDistractors[fallbackIdx % fallbackDistractors.length]);
      fallbackIdx++;
    }

    const allOptions = [correct, ...pool.slice(0, 3)];
    return allOptions.sort(() => Math.random() - 0.5);
  }, [card.id, card.back, allCards]);

  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
  }, [card.id]);

  const handleSelect = (option: string) => {
    if (hasAnswered) return;
    setSelectedOption(option);
    setHasAnswered(true);

    const isCorrect = option === card.back;
    if (isCorrect) {
      soundManager.playMastered();
    } else {
      soundManager.playLearning();
    }
  };

  const handleNext = () => {
    if (!hasAnswered) return;
    onAnswer(selectedOption === card.back);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Multiple Choice Quiz
          </span>
          {card.hint && (
            <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hint: {card.hint}</span>
            </div>
          )}
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug mb-6">
          {card.front}
        </h2>

        {/* Options Grid */}
        <div className="space-y-3">
          {options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === card.back;

            let buttonStyle = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300';
            if (hasAnswered) {
              if (isCorrect) {
                buttonStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-medium';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-rose-50 border-rose-300 text-rose-900';
              } else {
                buttonStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={hasAnswered}
                onClick={() => handleSelect(option)}
                className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3 cursor-pointer ${buttonStyle}`}
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 font-mono text-xs font-semibold text-slate-600 shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 leading-relaxed whitespace-pre-line">{option}</span>

                {hasAnswered && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Answer Feedback Callout */}
        {hasAnswered && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between animate-in fade-in">
            <div>
              {selectedOption === card.back ? (
                <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Correct answer!
                </span>
              ) : (
                <span className="text-sm font-semibold text-rose-600 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Incorrect
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
