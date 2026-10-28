import React, { useEffect } from 'react';
import { Award, RotateCcw, ArrowLeft, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard, StudyMode } from '../../types';
import { soundManager } from '../../utils/sound';

interface SessionSummaryProps {
  deckTitle: string;
  mode: StudyMode;
  totalCards: number;
  masteredCount: number;
  learningCount: number;
  hardCards: Flashcard[];
  onRestartAll: () => void;
  onStudyHardCards: () => void;
  onExit: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  deckTitle,
  mode,
  totalCards,
  masteredCount,
  learningCount,
  hardCards,
  onRestartAll,
  onStudyHardCards,
  onExit,
}) => {
  const accuracy = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  useEffect(() => {
    soundManager.playCelebration();
    if (accuracy >= 60) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  }, [accuracy]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-lg p-7 sm:p-9 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
          {accuracy >= 80 ? (
            <Sparkles className="w-8 h-8 text-amber-500" />
          ) : (
            <Award className="w-8 h-8 text-indigo-600" />
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 font-display">
          Session Complete!
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Great work studying <strong className="text-slate-800 font-semibold">{deckTitle}</strong>
        </p>

        {/* Metrics Box */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6">
          <div>
            <span className="block text-2xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Accuracy
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tabular-nums">
              {accuracy}%
            </span>
          </div>

          <div>
            <span className="block text-2xs uppercase tracking-wider font-semibold text-emerald-600 mb-1">
              Mastered
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-display tabular-nums">
              {masteredCount}
            </span>
          </div>

          <div>
            <span className="block text-2xs uppercase tracking-wider font-semibold text-rose-600 mb-1">
              Needs Review
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-display tabular-nums">
              {learningCount}
            </span>
          </div>
        </div>

        {/* Hard Cards List if any */}
        {hardCards.length > 0 && (
          <div className="text-left mb-6">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Cards marked for review ({hardCards.length}):</span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
              {hardCards.map((c) => (
                <div key={c.id} className="p-3 text-xs flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 line-clamp-1">{c.front}</p>
                    <p className="text-slate-500 line-clamp-1 mt-0.5">{c.back}</p>
                  </div>
                  <span className="text-2xs font-mono text-slate-400 whitespace-nowrap">
                    Box {c.box}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {hardCards.length > 0 && (
            <button
              type="button"
              onClick={onStudyHardCards}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Review Hard Cards ({hardCards.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRestartAll}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Full Deck</span>
          </button>

          <button
            type="button"
            onClick={onExit}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Deck</span>
          </button>
        </div>

      </div>
    </div>
  );
};
