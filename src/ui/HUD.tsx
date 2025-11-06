import { useEffect, useState } from 'react';
import { useGameStore } from '../state/game.store';
import './HUD.css';

export function HUD() {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const stats = useGameStore((state) => state.stats);
  const gameState = useGameStore((state) => state.gameState);
  const parts = useGameStore((state) => state.parts);
  const selectedPartId = useGameStore((state) => state.selectedPartId);
  const resetLevel = useGameStore((state) => state.resetLevel);

  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const snappedCount = Array.from(parts.values()).filter((p) => p.isSnapped).length;
  const totalParts = parts.size;

  return (
    <div className="hud">
      {/* Top bar */}
      <div className="hud-top">
        <div className="hud-section">
          <h2>{currentLevel?.name || 'SnapFit Workshop'}</h2>
        </div>
        <div className="hud-section">
          <span>Time: {formatTime(elapsedTime)}</span>
          <span style={{ marginLeft: '20px' }}>
            Parts: {snappedCount}/{totalParts}
          </span>
          <span style={{ marginLeft: '20px' }}>Stars: {'★'.repeat(stats.stars)}</span>
        </div>
        <div className="hud-section">
          <button onClick={resetLevel} className="hud-button">
            Reset (Hold R)
          </button>
        </div>
      </div>

      {/* Key guide */}
      <div className="hud-bottom">
        <div className="key-guide">
          <div className="key-group">
            <span className="key-label">Select:</span>
            <kbd>Tab</kbd>
            <kbd>1-9</kbd>
          </div>
          <div className="key-group">
            <span className="key-label">Grab:</span>
            <kbd>Enter</kbd>
          </div>
          <div className="key-group">
            <span className="key-label">Move:</span>
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            <kbd>←</kbd>
            <kbd>→</kbd>
            <kbd>U</kbd>
            <kbd>O</kbd>
          </div>
          <div className="key-group">
            <span className="key-label">Rotate:</span>
            <kbd>Q</kbd>
            <kbd>E</kbd>
            <kbd>[</kbd>
            <kbd>]</kbd>
            <kbd>;</kbd>
            <kbd>'</kbd>
          </div>
          <div className="key-group">
            <span className="key-label">Snap:</span>
            <kbd>S</kbd>
          </div>
          <div className="key-group">
            <span className="key-label">Hint:</span>
            <kbd>H</kbd>
          </div>
          <div className="key-group">
            <span className="key-label">Reset Part:</span>
            <kbd>Backspace</kbd>
          </div>
          <div className="key-group">
            <span className="key-label">View:</span>
            <kbd>V</kbd>
            <kbd>G</kbd>
            <kbd>+</kbd>
            <kbd>-</kbd>
          </div>
        </div>
      </div>

      {/* Selected part indicator */}
      {selectedPartId && (
        <div className="selected-indicator">
          Selected: {selectedPartId}
          {parts.get(selectedPartId)?.isGrabbed && ' (Grabbed)'}
        </div>
      )}

      {/* Win screen */}
      {gameState === 'success' && (
        <div className="overlay">
          <div className="win-screen">
            <h1>Level Complete!</h1>
            <p>Time: {formatTime(elapsedTime)}</p>
            <p>Stars: {'★'.repeat(stats.stars)}</p>
            <button onClick={resetLevel} className="hud-button large">
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
