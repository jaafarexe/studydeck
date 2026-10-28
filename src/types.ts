export type CardStatus = 'unstudied' | 'learning' | 'mastered';

export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  codeSnippet?: string;
  isStarred?: boolean;
  status: CardStatus;
  box: LeitnerBox;
  timesReviewed: number;
  timesCorrect: number;
  lastReviewedAt?: string;
  createdAt: string;
}

export type DeckThemeColor = 'emerald' | 'amber' | 'indigo' | 'rose' | 'sky' | 'violet';

export interface Deck {
  id: string;
  title: string;
  description: string;
  category: string;
  color: DeckThemeColor;
  iconName: string;
  cards: Flashcard[];
  createdAt: string;
  lastStudiedAt?: string;
}

export type StudyMode = 'flip' | 'quiz' | 'type' | 'match';

export interface SessionResult {
  deckId: string;
  deckTitle: string;
  mode: StudyMode;
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  accuracy: number;
  durationSeconds: number;
  completedAt: string;
  hardCardIds: string[];
}

export interface UserStats {
  dailyStreak: number;
  lastActiveDate: string;
  totalCardsReviewed: number;
  sessionsCompleted: number;
  recentSessions: SessionResult[];
}
