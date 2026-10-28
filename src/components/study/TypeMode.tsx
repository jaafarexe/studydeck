import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, X, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Flashcard } from '../../types';
import { soundManager } from '../../utils/sound';

interface TypeModeProps {
  card: Flashcard;
  onAnswer: (isCorrect: boolean) => void;
}

// Clean text for similarity checking
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalize(str1);
  const norm2 = normalize(str2);
  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;

  // Check word containment
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  const matched = words1.filter((w) => words2.includes(w)).length;
  return matched / Math.max(words1.length, words2.length);
}

export const TypeMode: React.FC<TypeModeProps> = ({ card, onAnswer }) => {
  const [typedAnswer, setTypedAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [isMatch, setIsMatch] = useState(false);

  useEffect(() => {
    setTypedAnswer('');
    setChecked(false);
    setIsMatch(false);
  }, [card.id]);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim()) return;

    const similarity = calculateSimilarity(typedAnswer, card.back);
    // If similarity >= 0.65 or exact match
    const correct = similarity >= 0.65;
    setIsMatch(correct);
    setChecked(true);

    if (correct) {
      soundManager.playMastered();
    } else {
      soundManager.playLearning();
    }
  };

  const handleProceed = (overrideCorrect?: boolean) => {
    const finalCorrect = overrideCorrect !== undefined ? overrideCorrect : isMatch;
    onAnswer(finalCorrect);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Active Recall · Type Answer
          </span>
          {card.hint && (
            <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
              Hint: {card.hint}
            </span>
          )}
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug mb-5">
          {card.front}
        </h2>

        {!checked ? (
          <form onSubmit={handleCheck} className="space-y-4">
            <textarea
              rows={4}
              required
              autoFocus
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type your answer from memory..."
              className="w-full p-4 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Press Submit or Enter to verify</span>
              <button
                type="submit"
                disabled={!typedAnswer.trim()}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Check Answer
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* User Input Feedback */}
            <div>
              <span className="block text-xs font-semibold text-slate-500 mb-1">Your Answer:</span>
              <div
                className={`p-3.5 rounded-xl border text-sm leading-relaxed ${
                  isMatch
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {typedAnswer}
              </div>
            </div>

            {/* Expected Answer */}
            <div>
              <span className="block text-xs font-semibold text-slate-500 mb-1">Target Answer:</span>
              <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50 text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                {card.back}
              </div>
            </div>

            {/* Results / Override Strip */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isMatch ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" /> Well Done!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1 rounded-full">
                    <X className="w-3.5 h-3.5" /> Needs Practice
                  </span>
                )}
                {!isMatch && (
                  <button
                    type="button"
                    onClick={() => handleProceed(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
                  >
                    I was close enough (Count as Correct)
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleProceed()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <span>Next Card</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
