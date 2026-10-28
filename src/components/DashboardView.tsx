import React from 'react';
import {
  Flame,
  Award,
  Play,
  RotateCcw,
  Plus,
  ArrowRight,
  Sparkles,
  BarChart3,
  Dna,
  Landmark,
  Code,
  Layers,
  BookOpen,
} from 'lucide-react';
import { Deck, UserStats, StudyMode } from '../types';
import { computeDeckStats, computeGlobalStats } from '../utils/storage';

interface DashboardViewProps {
  decks: Deck[];
  stats: UserStats;
  onSelectDeck: (deck: Deck) => void;
  onStartStudy: (deck: Deck, mode: StudyMode) => void;
  onOpenNewDeck: () => void;
  onResetDefaults: () => void;
  onViewAllDecks: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Dna,
  Landmark,
  Code,
  Layers,
  BookOpen,
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  decks,
  stats,
  onSelectDeck,
  onStartStudy,
  onOpenNewDeck,
  onResetDefaults,
  onViewAllDecks,
}) => {
  const globalMetrics = computeGlobalStats(decks);

  // Compute overall Leitner box distribution
  const totalBoxCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  decks.forEach((deck) => {
    deck.cards.forEach((card) => {
      const box = card.box || 1;
      totalBoxCounts[box] = (totalBoxCounts[box] || 0) + 1;
    });
  });

  // Recent deck to resume
  const featuredDeck = decks.length > 0 ? decks[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Personal Study Dashboard</span>
              <span>·</span>
              <span>Local browser storage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
              Ready to learn today?
            </h1>
            <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
              Active recall and spaced repetition accelerate retention. Flip through your cards,
              test yourself with quizzes, or beat your best time in speed match mode.
            </p>
          </div>

          {/* Quick study jump button */}
          {featuredDeck && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onStartStudy(featuredDeck, 'flip')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume: {featuredDeck.title.split(' ')[0]}</span>
              </button>
            </div>
          )}
        </div>

        {/* 4-Stat Metric Row */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="block text-2xs uppercase tracking-wider font-semibold text-slate-400">
                Daily Streak
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-display tabular-nums">
                {stats.dailyStreak} {stats.dailyStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xs uppercase tracking-wider font-semibold text-slate-400">
                Overall Mastery
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-display tabular-nums">
                {globalMetrics.overallMasteryPercent}%
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xs uppercase tracking-wider font-semibold text-slate-400">
                Cards Studied
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-display tabular-nums">
                {stats.totalCardsReviewed}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xs uppercase tracking-wider font-semibold text-slate-400">
                Total Decks
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-display tabular-nums">
                {decks.length} ({globalMetrics.totalCards} cards)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Stage: Left Leitner System, Right Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leitner Spaced Repetition Box Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Spaced Repetition · Leitner Mastery Stages
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cards advance to higher boxes as you correctly recall them.
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="space-y-3 pt-2">
            {[
              { box: 1, label: 'Box 1: Daily Review', desc: 'New & still learning cards', color: 'bg-rose-500' },
              { box: 2, label: 'Box 2: Review in 2 Days', desc: 'Developing recall', color: 'bg-amber-500' },
              { box: 3, label: 'Box 3: Review in 4 Days', desc: 'Consistent recall', color: 'bg-sky-500' },
              { box: 4, label: 'Box 4: Review Weekly', desc: 'Solid memory retention', color: 'bg-indigo-500' },
              { box: 5, label: 'Box 5: Long-Term Memory', desc: 'Fully mastered concepts', color: 'bg-emerald-600' },
            ].map((b) => {
              const count = totalBoxCounts[b.box] || 0;
              const pct = globalMetrics.totalCards > 0 ? Math.round((count / globalMetrics.totalCards) * 100) : 0;

              return (
                <div key={b.box} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{b.label}</span>
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                      <span>{count} cards</span>
                      <span>·</span>
                      <span className="tabular-nums font-semibold text-slate-800">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${b.color} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Study Modes Quick Access */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">Study Modes</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your favorite way to practice.
            </p>

            <div className="mt-4 space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="block text-xs font-bold text-slate-800">1. Flashcard Flip</span>
                <span className="text-2xs text-slate-500">
                  Interactive 3D card flip with Spacebar and Leitner ratings.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="block text-xs font-bold text-slate-800">2. Multiple Choice Quiz</span>
                <span className="text-2xs text-slate-500">
                  Test your accuracy with generated options and instant feedback.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="block text-xs font-bold text-slate-800">3. Type-In Recall</span>
                <span className="text-2xs text-slate-500">
                  Active recall writing test with smart string similarity checks.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="block text-xs font-bold text-slate-800">4. Speed Match Game</span>
                <span className="text-2xs text-slate-500">
                  Timed memory pairing round matching questions to definitions.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onOpenNewDeck}
              className="w-full py-2.5 px-4 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Deck</span>
            </button>
          </div>
        </div>

      </div>

      {/* Decks Preview Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Active Decks</h2>
            <p className="text-xs text-slate-500">Select any deck to study or manage cards.</p>
          </div>

          <button
            type="button"
            onClick={onViewAllDecks}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            <span>View All Decks ({decks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {decks.slice(0, 3).map((deck) => {
            const stats = computeDeckStats(deck);
            const IconComp = ICON_MAP[deck.iconName] || Layers;

            return (
              <div
                key={deck.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-indigo-700 tabular-nums">
                      {stats.masteryPercent}% Mastery
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-2xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-700">{deck.category}</span>
                    <span>·</span>
                    <span>{deck.cards.length} cards</span>
                  </div>

                  <h3
                    onClick={() => onSelectDeck(deck)}
                    className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1 font-display"
                  >
                    {deck.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {deck.description}
                  </p>

                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${stats.masteryPercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onSelectDeck(deck)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Manage Cards
                  </button>

                  <button
                    type="button"
                    onClick={() => onStartStudy(deck, 'flip')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Study</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer utility row */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div>StudyDeck Flashcards · All data is stored locally in your browser.</div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all decks to default sample content (Biology, History, Computer Science)? Any custom decks will be replaced.')) {
              onResetDefaults();
            }
          }}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Decks</span>
        </button>
      </div>

    </div>
  );
};
