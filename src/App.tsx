/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { DeckListView } from './components/DeckListView';
import { DeckDetailView } from './components/DeckDetailView';
import { StudySessionView } from './components/study/StudySessionView';
import { StatsView } from './components/StatsView';
import { NewDeckModal } from './components/modals/NewDeckModal';
import { BulkImportModal } from './components/modals/BulkImportModal';
import { KeyboardHelpModal } from './components/modals/KeyboardHelpModal';
import { Deck, Flashcard, StudyMode, UserStats, DeckThemeColor } from './types';
import {
  getStoredDecks,
  saveStoredDecks,
  getStoredStats,
  resetToDefaults,
} from './utils/storage';
import { soundManager } from './utils/sound';

type ViewState = 'dashboard' | 'decks' | 'deck-detail' | 'study' | 'stats';

export default function App() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState<UserStats>(getStoredStats());
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [activeStudyMode, setActiveStudyMode] = useState<StudyMode>('flip');

  // Modals state
  const [isNewDeckModalOpen, setIsNewDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [bulkImportDeckId, setBulkImportDeckId] = useState<string | null>(null);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize data on mount
  useEffect(() => {
    const loadedDecks = getStoredDecks();
    setDecks(loadedDecks);
    setStats(getStoredStats());
    setSoundEnabled(soundManager.isEnabled());
  }, []);

  // Update storage whenever decks change
  const updateDecks = useCallback((newDecks: Deck[]) => {
    setDecks(newDecks);
    saveStoredDecks(newDecks);
  }, []);

  // Selected deck lookup
  const selectedDeck = decks.find((d) => d.id === selectedDeckId) || null;

  // Deck Management
  const handleSaveDeck = (deckData: {
    title: string;
    description: string;
    category: string;
    color: DeckThemeColor;
    iconName: string;
  }) => {
    if (editingDeck) {
      // Edit existing
      const updated = decks.map((d) =>
        d.id === editingDeck.id
          ? {
              ...d,
              ...deckData,
            }
          : d
      );
      updateDecks(updated);
      setEditingDeck(null);
    } else {
      // Create new
      const newDeck: Deck = {
        id: `deck-${Date.now()}`,
        ...deckData,
        cards: [],
        createdAt: new Date().toISOString(),
      };
      updateDecks([newDeck, ...decks]);
      setSelectedDeckId(newDeck.id);
      setCurrentView('deck-detail');
    }
  };

  const handleDeleteDeck = (deckId: string) => {
    const updated = decks.filter((d) => d.id !== deckId);
    updateDecks(updated);
    if (selectedDeckId === deckId) {
      setSelectedDeckId(null);
      setCurrentView('decks');
    }
  };

  // Card Management
  const handleAddCard = (
    cardData: Omit<Flashcard, 'id' | 'deckId' | 'status' | 'box' | 'timesReviewed' | 'timesCorrect' | 'createdAt'>
  ) => {
    if (!selectedDeckId) return;
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      deckId: selectedDeckId,
      ...cardData,
      status: 'unstudied',
      box: 1,
      timesReviewed: 0,
      timesCorrect: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = decks.map((d) =>
      d.id === selectedDeckId ? { ...d, cards: [newCard, ...d.cards] } : d
    );
    updateDecks(updated);
  };

  const handleUpdateCard = (updatedCard: Flashcard) => {
    const updated = decks.map((d) =>
      d.id === updatedCard.deckId
        ? {
            ...d,
            cards: d.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
          }
        : d
    );
    updateDecks(updated);
  };

  const handleDeleteCard = (deckId: string, cardId: string) => {
    const updated = decks.map((d) =>
      d.id === deckId ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) } : d
    );
    updateDecks(updated);
  };

  const handleToggleStar = (deckId: string, cardId: string) => {
    const updated = decks.map((d) =>
      d.id === deckId
        ? {
            ...d,
            cards: d.cards.map((c) =>
              c.id === cardId ? { ...c, isStarred: !c.isStarred } : c
            ),
          }
        : d
    );
    updateDecks(updated);
  };

  // Update card rating during study session
  const handleUpdateCardStatus = (
    deckId: string,
    cardId: string,
    isMastered: boolean,
    newBox: 1 | 2 | 3 | 4 | 5
  ) => {
    const now = new Date().toISOString();
    const updated = decks.map((d) => {
      if (d.id !== deckId) return d;
      return {
        ...d,
        lastStudiedAt: now,
        cards: d.cards.map((c) => {
          if (c.id !== cardId) return c;
          return {
            ...c,
            status: isMastered ? ('mastered' as const) : ('learning' as const),
            box: newBox,
            timesReviewed: (c.timesReviewed || 0) + 1,
            timesCorrect: (c.timesCorrect || 0) + (isMastered ? 1 : 0),
            lastReviewedAt: now,
          };
        }),
      };
    });
    updateDecks(updated);
    setStats(getStoredStats());
  };

  // Bulk import
  const handleImportCards = (newCards: Flashcard[]) => {
    if (!bulkImportDeckId) return;
    const updated = decks.map((d) =>
      d.id === bulkImportDeckId ? { ...d, cards: [...d.cards, ...newCards] } : d
    );
    updateDecks(updated);
  };

  const handleResetDefaults = () => {
    const defaultDecks = resetToDefaults();
    setDecks(defaultDecks);
    setSelectedDeckId(null);
    setCurrentView('dashboard');
  };

  const handleStartStudy = (deck: Deck, mode: StudyMode) => {
    setSelectedDeckId(deck.id);
    setActiveStudyMode(mode);
    setCurrentView('study');
  };

  const handleToggleSound = () => {
    const newSoundState = soundManager.toggleSound();
    setSoundEnabled(newSoundState);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 3-Zone Navigation Header */}
      <Navbar
        currentView={currentView === 'deck-detail' ? 'decks' : currentView === 'study' ? 'decks' : currentView}
        onNavigate={(view) => {
          setSelectedDeckId(null);
          setCurrentView(view);
        }}
        onOpenNewDeck={() => {
          setEditingDeck(null);
          setIsNewDeckModalOpen(true);
        }}
        onOpenKeyboardHelp={() => setIsKeyboardHelpOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {currentView === 'dashboard' && (
          <DashboardView
            decks={decks}
            stats={stats}
            onSelectDeck={(deck) => {
              setSelectedDeckId(deck.id);
              setCurrentView('deck-detail');
            }}
            onStartStudy={handleStartStudy}
            onOpenNewDeck={() => {
              setEditingDeck(null);
              setIsNewDeckModalOpen(true);
            }}
            onResetDefaults={handleResetDefaults}
            onViewAllDecks={() => setCurrentView('decks')}
          />
        )}

        {currentView === 'decks' && (
          <DeckListView
            decks={decks}
            onSelectDeck={(deck) => {
              setSelectedDeckId(deck.id);
              setCurrentView('deck-detail');
            }}
            onStartStudy={handleStartStudy}
            onOpenNewDeck={() => {
              setEditingDeck(null);
              setIsNewDeckModalOpen(true);
            }}
            onEditDeck={(deck) => {
              setEditingDeck(deck);
              setIsNewDeckModalOpen(true);
            }}
            onDeleteDeck={handleDeleteDeck}
          />
        )}

        {currentView === 'deck-detail' && selectedDeck && (
          <DeckDetailView
            deck={selectedDeck}
            onBack={() => setCurrentView('decks')}
            onStartStudy={(mode) => handleStartStudy(selectedDeck, mode)}
            onEditDeck={(deck) => {
              setEditingDeck(deck);
              setIsNewDeckModalOpen(true);
            }}
            onDeleteDeck={handleDeleteDeck}
            onOpenBulkImport={(deckId) => setBulkImportDeckId(deckId)}
            onAddCard={handleAddCard}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
            onToggleStar={handleToggleStar}
          />
        )}

        {currentView === 'study' && selectedDeck && (
          <StudySessionView
            deck={selectedDeck}
            initialMode={activeStudyMode}
            onExit={() => setCurrentView('deck-detail')}
            onUpdateCardStatus={handleUpdateCardStatus}
            onToggleStar={handleToggleStar}
            onOpenKeyboardHelp={() => setIsKeyboardHelpOpen(true)}
          />
        )}

        {currentView === 'stats' && (
          <StatsView
            decks={decks}
            stats={stats}
            onStudyDeck={handleStartStudy}
          />
        )}
      </main>

      {/* Modals */}
      <NewDeckModal
        isOpen={isNewDeckModalOpen}
        onClose={() => {
          setIsNewDeckModalOpen(false);
          setEditingDeck(null);
        }}
        onSave={handleSaveDeck}
        editingDeck={editingDeck}
      />

      <BulkImportModal
        isOpen={!!bulkImportDeckId}
        deckId={bulkImportDeckId || ''}
        deckTitle={decks.find((d) => d.id === bulkImportDeckId)?.title || ''}
        onClose={() => setBulkImportDeckId(null)}
        onImport={handleImportCards}
      />

      <KeyboardHelpModal
        isOpen={isKeyboardHelpOpen}
        onClose={() => setIsKeyboardHelpOpen(false)}
      />
    </div>
  );
}
