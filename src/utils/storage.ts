import { Deck, Flashcard, UserStats, SessionResult } from '../types';
import { INITIAL_DECKS } from '../data/initialDecks';

const STORAGE_KEYS = {
  DECKS: 'studydeck_flashcards_decks_v1',
  STATS: 'studydeck_flashcards_stats_v1',
};

export function getStoredDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DECKS);
    if (!raw) {
      saveStoredDecks(INITIAL_DECKS);
      return INITIAL_DECKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveStoredDecks(INITIAL_DECKS);
    return INITIAL_DECKS;
  } catch (err) {
    console.error('Failed to load decks from storage:', err);
    return INITIAL_DECKS;
  }
}

export function saveStoredDecks(decks: Deck[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
  } catch (err) {
    console.error('Failed to save decks to storage:', err);
  }
}

export function getStoredStats(): UserStats {
  const defaultStats: UserStats = {
    dailyStreak: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalCardsReviewed: 34,
    sessionsCompleted: 8,
    recentSessions: [],
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      saveStoredStats(defaultStats);
      return defaultStats;
    }
    return { ...defaultStats, ...JSON.parse(raw) };
  } catch {
    return defaultStats;
  }
}

export function saveStoredStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save stats to storage:', err);
  }
}

export function recordSessionCompletion(session: SessionResult): UserStats {
  const current = getStoredStats();
  const today = new Date().toISOString().split('T')[0];
  
  let newStreak = current.dailyStreak;
  if (current.lastActiveDate !== today) {
    const lastDate = new Date(current.lastActiveDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const updated: UserStats = {
    dailyStreak: newStreak,
    lastActiveDate: today,
    totalCardsReviewed: current.totalCardsReviewed + session.totalCards,
    sessionsCompleted: current.sessionsCompleted + 1,
    recentSessions: [session, ...(current.recentSessions || [])].slice(0, 20),
  };

  saveStoredStats(updated);
  return updated;
}

export function resetToDefaults(): Deck[] {
  saveStoredDecks(INITIAL_DECKS);
  return INITIAL_DECKS;
}

// Compute deck metrics
export function computeDeckStats(deck: Deck) {
  const total = deck.cards.length;
  if (total === 0) {
    return {
      total: 0,
      mastered: 0,
      learning: 0,
      unstudied: 0,
      masteryPercent: 0,
      starredCount: 0,
      boxCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const mastered = deck.cards.filter((c) => c.status === 'mastered').length;
  const learning = deck.cards.filter((c) => c.status === 'learning').length;
  const unstudied = deck.cards.filter((c) => c.status === 'unstudied').length;
  const starredCount = deck.cards.filter((c) => c.isStarred).length;

  const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  deck.cards.forEach((c) => {
    const box = c.box || 1;
    boxCounts[box] = (boxCounts[box] || 0) + 1;
  });

  const masteryPercent = Math.round((mastered / total) * 100);

  return {
    total,
    mastered,
    learning,
    unstudied,
    masteryPercent,
    starredCount,
    boxCounts,
  };
}

export function computeGlobalStats(decks: Deck[]) {
  let totalCards = 0;
  let totalMastered = 0;
  let totalLearning = 0;
  let totalUnstudied = 0;

  decks.forEach((deck) => {
    totalCards += deck.cards.length;
    deck.cards.forEach((c) => {
      if (c.status === 'mastered') totalMastered++;
      else if (c.status === 'learning') totalLearning++;
      else totalUnstudied++;
    });
  });

  const overallMasteryPercent = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

  return {
    totalCards,
    totalMastered,
    totalLearning,
    totalUnstudied,
    overallMasteryPercent,
    totalDecks: decks.length,
  };
}

// Export as JSON
export function exportDeckAsJSON(deck: Deck): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deck, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_deck.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Export as CSV
export function exportDeckAsCSV(deck: Deck): void {
  const headers = ['Question', 'Answer', 'Hint', 'Status', 'Box'];
  const rows = deck.cards.map((c) => [
    `"${c.front.replace(/"/g, '""')}"`,
    `"${c.back.replace(/"/g, '""')}"`,
    `"${(c.hint || '').replace(/"/g, '""')}"`,
    c.status,
    c.box,
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', encodedUri);
  downloadAnchor.setAttribute('download', `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Parse quick plain text cards (lines with "Q: ... A: ..." or "term - def" or tab separated)
export function parseBulkCards(deckId: string, rawText: string): Flashcard[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const cards: Flashcard[] = [];
  const now = new Date().toISOString();

  let currentFront = '';
  let currentBack = '';

  for (const line of lines) {
    // Format 1: Q: question / A: answer
    if (line.toLowerCase().startsWith('q:') || line.toLowerCase().startsWith('question:')) {
      if (currentFront && currentBack) {
        cards.push({
          id: `card-${Date.now()}-${cards.length}`,
          deckId,
          front: currentFront,
          back: currentBack,
          status: 'unstudied',
          box: 1,
          timesReviewed: 0,
          timesCorrect: 0,
          createdAt: now,
        });
        currentBack = '';
      }
      currentFront = line.replace(/^(q:|question:)\s*/i, '').trim();
    } else if (line.toLowerCase().startsWith('a:') || line.toLowerCase().startsWith('answer:')) {
      currentBack = line.replace(/^(a:|answer:)\s*/i, '').trim();
    } else if (line.includes('\t')) {
      // Format 2: Tab separated
      const [front, back, hint] = line.split('\t');
      if (front && back) {
        cards.push({
          id: `card-${Date.now()}-${cards.length}`,
          deckId,
          front: front.trim(),
          back: back.trim(),
          hint: hint?.trim() || undefined,
          status: 'unstudied',
          box: 1,
          timesReviewed: 0,
          timesCorrect: 0,
          createdAt: now,
        });
      }
    } else if (line.includes(' - ') || line.includes(' — ') || line.includes('::')) {
      // Format 3: Term - Definition or Term :: Definition
      const sep = line.includes('::') ? '::' : line.includes(' — ') ? ' — ' : ' - ';
      const parts = line.split(sep);
      if (parts.length >= 2) {
        cards.push({
          id: `card-${Date.now()}-${cards.length}`,
          deckId,
          front: parts[0].trim(),
          back: parts.slice(1).join(sep).trim(),
          status: 'unstudied',
          box: 1,
          timesReviewed: 0,
          timesCorrect: 0,
          createdAt: now,
        });
      }
    }
  }

  // Push remaining Q&A if any
  if (currentFront && currentBack) {
    cards.push({
      id: `card-${Date.now()}-${cards.length}`,
      deckId,
      front: currentFront,
      back: currentBack,
      status: 'unstudied',
      box: 1,
      timesReviewed: 0,
      timesCorrect: 0,
      createdAt: now,
    });
  }

  return cards;
}
