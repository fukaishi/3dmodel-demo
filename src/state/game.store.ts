import { create } from 'zustand';
import { Vector3 } from 'three';
import type { GameState, Level, PartState, PartConfig, GameStats, LevelProgress } from '../types';

interface GameStore {
  // Game state
  gameState: GameState;
  currentLevel: Level | null;
  parts: Map<string, PartState>;
  selectedPartId: string | null;

  // Game stats
  stats: GameStats;
  startTime: number;

  // Settings
  showGhost: boolean;
  showGrid: boolean;
  zoomLevel: number;

  // Hint/Feedback state
  showHintForPartId: string | null;
  snapFeedback: { partId: string; success: boolean; message?: string } | null;

  // Actions
  setGameState: (state: GameState) => void;
  loadLevel: (level: Level) => void;
  selectPart: (partId: string | null) => void;
  selectNextPart: () => void;
  selectPrevPart: () => void;

  // Part manipulation
  grabPart: (partId: string) => void;
  releasePart: (partId: string) => void;
  movePart: (partId: string, delta: Vector3) => void;
  rotatePart: (partId: string, axis: 'x' | 'y' | 'z', degrees: number) => void;
  resetPart: (partId: string) => void;
  snapPart: (partId: string) => void;
  trySnapPart: (partId: string) => void;

  // UI actions
  toggleGhost: () => void;
  toggleGrid: () => void;
  adjustZoom: (delta: number) => void;
  useHint: () => void;
  clearHint: () => void;
  clearSnapFeedback: () => void;
  resetLevel: () => void;

  // Progress tracking
  saveProgress: (levelId: string, progress: LevelProgress) => void;
  loadProgress: (levelId: string) => LevelProgress | null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: 'title',
  currentLevel: null,
  parts: new Map(),
  selectedPartId: null,
  stats: {
    stars: 3,
    time: 0,
    hintsUsed: 0,
    mistakes: 0,
  },
  startTime: 0,
  showGhost: true,
  showGrid: false,
  zoomLevel: 1.0,
  showHintForPartId: null,
  snapFeedback: null,

  // State setters
  setGameState: (state) => set({ gameState: state }),

  loadLevel: (level) => {
    const parts = new Map<string, PartState>();

    level.parts.forEach((partConfig: PartConfig) => {
      const startPos = partConfig.start?.pos || [0, 0, 0];
      const startRot = partConfig.start?.rot || [0, 0, 0];

      parts.set(partConfig.id, {
        id: partConfig.id,
        config: partConfig,
        position: new Vector3(startPos[0], startPos[1], startPos[2]),
        rotation: new Vector3(startRot[0], startRot[1], startRot[2]),
        isGrabbed: false,
        isSnapped: false,
        attachPoints: [],
      });
    });

    set({
      currentLevel: level,
      parts,
      selectedPartId: null,
      gameState: 'playing',
      startTime: Date.now(),
      stats: {
        stars: 3,
        time: 0,
        hintsUsed: 0,
        mistakes: 0,
      },
    });
  },

  selectPart: (partId) => set({ selectedPartId: partId }),

  selectNextPart: () => {
    const { parts, selectedPartId } = get();
    const partIds = Array.from(parts.keys());
    if (partIds.length === 0) return;

    const currentIndex = selectedPartId ? partIds.indexOf(selectedPartId) : -1;
    const nextIndex = (currentIndex + 1) % partIds.length;
    set({ selectedPartId: partIds[nextIndex] });
  },

  selectPrevPart: () => {
    const { parts, selectedPartId } = get();
    const partIds = Array.from(parts.keys());
    if (partIds.length === 0) return;

    const currentIndex = selectedPartId ? partIds.indexOf(selectedPartId) : -1;
    const prevIndex = currentIndex <= 0 ? partIds.length - 1 : currentIndex - 1;
    set({ selectedPartId: partIds[prevIndex] });
  },

  grabPart: (partId) => {
    const { parts } = get();
    const part = parts.get(partId);
    if (!part || part.isSnapped) return;

    const newParts = new Map(parts);
    newParts.set(partId, { ...part, isGrabbed: true });
    set({ parts: newParts });
  },

  releasePart: (partId) => {
    const { parts } = get();
    const part = parts.get(partId);
    if (!part) return;

    const newParts = new Map(parts);
    newParts.set(partId, { ...part, isGrabbed: false });
    set({ parts: newParts });
  },

  movePart: (partId, delta) => {
    const { parts } = get();
    const part = parts.get(partId);
    if (!part || !part.isGrabbed || part.isSnapped) return;

    const newParts = new Map(parts);
    const newPosition = part.position.clone().add(delta);
    newParts.set(partId, { ...part, position: newPosition });
    set({ parts: newParts });
  },

  rotatePart: (partId, axis, degrees) => {
    const { parts } = get();
    const part = parts.get(partId);
    if (!part || !part.isGrabbed || part.isSnapped) return;

    const newParts = new Map(parts);
    const newRotation = part.rotation.clone();
    const radians = (degrees * Math.PI) / 180;

    switch (axis) {
      case 'x':
        newRotation.x += radians;
        break;
      case 'y':
        newRotation.y += radians;
        break;
      case 'z':
        newRotation.z += radians;
        break;
    }

    newParts.set(partId, { ...part, rotation: newRotation });
    set({ parts: newParts });
  },

  resetPart: (partId) => {
    const { parts, currentLevel } = get();
    const part = parts.get(partId);
    if (!part || !currentLevel) return;

    const partConfig = currentLevel.parts.find((p) => p.id === partId);
    if (!partConfig) return;

    const startPos = partConfig.start?.pos || [0, 0, 0];
    const startRot = partConfig.start?.rot || [0, 0, 0];

    const newParts = new Map(parts);
    newParts.set(partId, {
      ...part,
      position: new Vector3(startPos[0], startPos[1], startPos[2]),
      rotation: new Vector3(startRot[0], startRot[1], startRot[2]),
      isGrabbed: false,
      isSnapped: false,
    });
    set({ parts: newParts });
  },

  snapPart: (partId) => {
    const { parts } = get();
    const part = parts.get(partId);
    if (!part) return;

    const newParts = new Map(parts);
    newParts.set(partId, { ...part, isSnapped: true });
    set({ parts: newParts });
  },

  trySnapPart: (partId) => {
    // This will be handled by the Scene component with SnapSystem
    // Just set a flag to trigger the snap attempt
    console.log('🎯 trySnapPart called for:', partId);
    set({ snapFeedback: { partId, success: false } });
  },

  toggleGhost: () => set((state) => ({ showGhost: !state.showGhost })),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  adjustZoom: (delta) =>
    set((state) => ({
      zoomLevel: Math.max(0.5, Math.min(2.0, state.zoomLevel + delta)),
    })),

  useHint: () => {
    const { stats, selectedPartId } = get();
    if (!selectedPartId) return;

    set({
      stats: {
        ...stats,
        hintsUsed: stats.hintsUsed + 1,
      },
      showHintForPartId: selectedPartId,
    });

    // Auto-hide hint after 3 seconds
    setTimeout(() => {
      get().clearHint();
    }, 3000);
  },

  clearHint: () => set({ showHintForPartId: null }),

  clearSnapFeedback: () => set({ snapFeedback: null }),

  resetLevel: () => {
    const { currentLevel } = get();
    if (currentLevel) {
      get().loadLevel(currentLevel);
    }
  },

  saveProgress: (levelId, progress) => {
    const key = `level_progress_${levelId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  },

  loadProgress: (levelId) => {
    const key = `level_progress_${levelId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
}));
