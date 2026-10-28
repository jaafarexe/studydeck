import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Timer, RotateCcw, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard } from '../../types';
import { soundManager } from '../../utils/sound';

interface SpeedMatchModeProps {
  cards: Flashcard[];
  onFinish: (durationSeconds: number) => void;
}

interface TileItem {
  id: string; // unique tile id
  cardId: string;
  type: 'front' | 'back';
  text: string;
}

export const SpeedMatchMode: React.FC<SpeedMatchModeProps> = ({ cards, onFinish }) => {
  // Take up to 6 cards for a 12-tile matching round
  const gameCards = useMemo(() => {
    return [...cards].sort(() => Math.random() - 0.5).slice(0, 6);
  }, [cards]);

  const [tiles, setTiles] = useState<TileItem[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [matchedCardIds, setMatchedCardIds] = useState<Set<string>>(new Set());
  const [mismatchedTileIds, setMismatchedTileIds] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [moves, setMoves] = useState(0);

  const timerRef = useRef<number | null>(null);

  // Initialize and shuffle tiles
  const initGame = () => {
    const list: TileItem[] = [];
    gameCards.forEach((c) => {
      list.push({
        id: `tile-front-${c.id}`,
        cardId: c.id,
        type: 'front',
        text: c.front,
      });
      list.push({
        id: `tile-back-${c.id}`,
        cardId: c.id,
        type: 'back',
        text: c.back,
      });
    });

    setTiles(list.sort(() => Math.random() - 0.5));
    setSelectedTileId(null);
    setMatchedCardIds(new Set());
    setMismatchedTileIds([]);
    setElapsedSeconds(0);
    setIsGameOver(false);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, [gameCards]);

  // Timer
  useEffect(() => {
    if (isGameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver]);

  // Check win condition
  useEffect(() => {
    if (gameCards.length > 0 && matchedCardIds.size === gameCards.length && !isGameOver) {
      setIsGameOver(true);
      soundManager.playCelebration();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onFinish(elapsedSeconds);
    }
  }, [matchedCardIds, gameCards, isGameOver, elapsedSeconds, onFinish]);

  const handleTileClick = (tile: TileItem) => {
    if (matchedCardIds.has(tile.cardId) || mismatchedTileIds.length > 0) return;
    if (selectedTileId === tile.id) {
      setSelectedTileId(null);
      return;
    }

    if (!selectedTileId) {
      setSelectedTileId(tile.id);
      soundManager.playFlip();
      return;
    }

    // Second tile selected
    setMoves((m) => m + 1);
    const firstTile = tiles.find((t) => t.id === selectedTileId);
    if (!firstTile) {
      setSelectedTileId(tile.id);
      return;
    }

    if (firstTile.cardId === tile.cardId && firstTile.type !== tile.type) {
      // It's a match!
      soundManager.playMatchSuccess();
      setMatchedCardIds((prev) => new Set(prev).add(tile.cardId));
      setSelectedTileId(null);
    } else {
      // Mismatch
      soundManager.playLearning();
      setMismatchedTileIds([selectedTileId, tile.id]);
      setTimeout(() => {
        setMismatchedTileIds([]);
        setSelectedTileId(null);
      }, 700);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Game Stats Bar */}
      <div className="w-full flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-200 mb-6 shadow-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-700">
            <Timer className="w-4 h-4 text-indigo-600" />
            <span className="font-mono text-sm font-semibold tabular-nums">{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="text-xs text-slate-500">
            Matches:{' '}
            <strong className="font-semibold text-slate-900 tabular-nums">
              {matchedCardIds.size} / {gameCards.length}
            </strong>
          </div>
          <div className="text-xs text-slate-500">
            Moves: <strong className="font-semibold text-slate-900 tabular-nums">{moves}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={initGame}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {isGameOver ? (
        <div className="w-full bg-white rounded-2xl border border-emerald-200 p-8 text-center shadow-lg animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2 font-display">All Pairs Matched!</h3>
          <p className="text-sm text-slate-600 mb-6">
            You cleared the board in <strong className="text-slate-900 font-mono">{formatTime(elapsedSeconds)}</strong> with{' '}
            <strong className="text-slate-900 font-mono">{moves}</strong> moves.
          </p>

          <button
            type="button"
            onClick={initGame}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Play Another Round
          </button>
        </div>
      ) : (
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {tiles.map((tile) => {
            const isMatched = matchedCardIds.has(tile.cardId);
            const isSelected = selectedTileId === tile.id;
            const isMismatched = mismatchedTileIds.includes(tile.id);

            let style = 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:shadow-xs';
            if (isMatched) {
              style = 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-40 pointer-events-none scale-95';
            } else if (isMismatched) {
              style = 'bg-rose-50 border-rose-400 text-rose-900 animate-shake';
            } else if (isSelected) {
              style = 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/20';
            }

            return (
              <button
                key={tile.id}
                type="button"
                disabled={isMatched}
                onClick={() => handleTileClick(tile)}
                className={`min-h-[110px] p-3.5 rounded-xl border text-xs font-medium text-left flex flex-col justify-between transition-all duration-150 cursor-pointer select-none leading-relaxed overflow-hidden ${style}`}
              >
                <span className="line-clamp-4">{tile.text}</span>
                <div className="flex items-center justify-between pt-2 mt-auto text-2xs text-slate-400">
                  <span className="uppercase tracking-wider font-semibold">
                    {tile.type === 'front' ? 'Question' : 'Answer'}
                  </span>
                  {isMatched && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
