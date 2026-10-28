import React from 'react';
import {
  Award,
  Flame,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Deck, UserStats, StudyMode } from '../types';
import { computeDeckStats, computeGlobalStats } from '../utils/storage';

interface StatsViewProps {
  decks: Deck[];
  stats: UserStats;
  onStudyDeck: (deck: Deck, mode: StudyMode) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ decks, stats, onStudyDeck }) => {
  const globalMetrics = computeGlobalStats(decks);

  // Overall Leitner box breakdown
  const boxCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  decks.forEach((deck) => {
    deck.cards.forEach((card) => {
      const box = card.box || 1;
      boxCounts[box] = (boxCounts[box] || 0) + 1;
    });
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
          Learning Analytics & Mastery
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track your retention across all decks, review history, and spaced repetition progress.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Mastery</span>
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-display tabular-nums">
            {globalMetrics.overallMasteryPercent}%
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {globalMetrics.totalMastered} of {globalMetrics.totalCards} cards mastered
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Study Streak</span>
            <Flame className="w-5 h-5 text-amber-500 fill-current" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-display tabular-nums">
            {stats.dailyStreak} {stats.dailyStreak === 1 ? 'Day' : 'Days'}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Active review habit</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cards Reviewed</span>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-display tabular-nums">
            {stats.totalCardsReviewed}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Total flashcard reviews</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sessions Finished</span>
            <Clock className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-display tabular-nums">
            {stats.sessionsCompleted}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Completed practice runs</span>
        </div>
      </div>

      {/* Deck Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-display">
            Mastery Breakdown by Deck
          </h2>
          <span className="text-xs text-slate-400">{decks.length} total decks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-3">Deck</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Total Cards</th>
                <th className="px-6 py-3">Mastered</th>
                <th className="px-6 py-3">Learning</th>
                <th className="px-6 py-3">Mastery Rate</th>
                <th className="px-6 py-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {decks.map((deck) => {
                const dStats = computeDeckStats(deck);
                return (
                  <tr key={deck.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{deck.title}</td>
                    <td className="px-6 py-4 text-slate-500">{deck.category}</td>
                    <td className="px-6 py-4 font-mono tabular-nums">{deck.cards.length}</td>
                    <td className="px-6 py-4 font-mono text-emerald-700 font-semibold tabular-nums">
                      {dStats.mastered}
                    </td>
                    <td className="px-6 py-4 font-mono text-amber-600 font-semibold tabular-nums">
                      {dStats.learning}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${dStats.masteryPercent}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold tabular-nums">
                          {dStats.masteryPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onStudyDeck(deck, 'flip')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        <span>Study</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Sessions Activity Log */}
      {stats.recentSessions && stats.recentSessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-display">
              Recent Study Sessions
            </h2>
            <span className="text-xs text-slate-400">Past activity</span>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentSessions.slice(0, 8).map((session, idx) => {
              const dateStr = new Date(session.completedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={idx} className="px-6 py-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-2xs uppercase">
                      {session.mode.slice(0, 4)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">{session.deckTitle}</span>
                      <span className="text-2xs text-slate-400">{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-slate-500">
                    <div className="text-right">
                      <span className="block font-semibold text-slate-900 tabular-nums">
                        {session.accuracy}% Accuracy
                      </span>
                      <span className="text-2xs text-slate-400 tabular-nums">
                        {session.masteredCards} / {session.totalCards} cards
                      </span>
                    </div>

                    <div className="text-slate-400 font-mono tabular-nums text-right w-16">
                      {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
