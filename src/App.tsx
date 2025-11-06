import { useEffect } from 'react';
import { Scene } from './scene/Scene';
import { HUD } from './ui/HUD';
import { TitleScreen } from './ui/TitleScreen';
import { useGameStore } from './state/game.store';
import { KeyboardControls } from './systems/KeyboardControls';
import type { Level } from './types';
import './App.css';

// Level data
const levels: Record<number, Level> = {
  1: {
    id: 'level_01',
    name: 'チュートリアル - 基本の組み立て',
    target: '/models/target.glb',
    parts: [
      {
        id: 'part1',
        file: '/models/part1.glb',
        snapTo: 'socket1',
        rotStep: 15,
        start: {
          pos: [-2, 0.5, 0],
          rot: [0, 0, 0],
        },
      },
      {
        id: 'part2',
        file: '/models/part2.glb',
        snapTo: 'socket2',
        rotStep: 15,
        start: {
          pos: [2, 0.5, 0],
          rot: [0, 0, 0],
        },
      },
      {
        id: 'part3',
        file: '/models/part3.glb',
        snapTo: 'socket3',
        rotStep: 15,
        start: {
          pos: [0, 0.5, 2],
          rot: [0, 0, 0],
        },
      },
    ],
    tolerance: {
      pos: 0.05,
      deg: 25,
    },
    timeLimitSec: 180,
    hints: 3,
  },
  2: {
    id: 'level_02',
    name: 'ステップアップ - 回転パズル',
    target: '/models/target.glb',
    parts: [
      {
        id: 'part1',
        file: '/models/part1.glb',
        snapTo: 'socket1',
        rotStep: 15,
        start: {
          pos: [-2.5, 0.5, -1],
          rot: [0, Math.PI / 2, 0], // 90度回転
        },
      },
      {
        id: 'part2',
        file: '/models/part2.glb',
        snapTo: 'socket2',
        rotStep: 15,
        start: {
          pos: [2.5, 0.5, 1],
          rot: [0, -Math.PI / 2, 0],
        },
      },
      {
        id: 'part3',
        file: '/models/part3.glb',
        snapTo: 'socket3',
        rotStep: 15,
        start: {
          pos: [0, 0.5, 2.5],
          rot: [0, Math.PI, 0],
        },
      },
    ],
    tolerance: {
      pos: 0.04,
      deg: 20,
    },
    timeLimitSec: 150,
    hints: 2,
  },
  3: {
    id: 'level_03',
    name: 'チャレンジ - マスターへの道',
    target: '/models/target.glb',
    parts: [
      {
        id: 'part1',
        file: '/models/part1.glb',
        snapTo: 'socket1',
        rotStep: 15,
        start: {
          pos: [-3, 0.5, -2],
          rot: [0, Math.PI / 4, 0],
        },
      },
      {
        id: 'part2',
        file: '/models/part2.glb',
        snapTo: 'socket2',
        rotStep: 15,
        start: {
          pos: [3, 0.5, 2],
          rot: [0, -Math.PI / 4, 0],
        },
      },
      {
        id: 'part3',
        file: '/models/part3.glb',
        snapTo: 'socket3',
        rotStep: 15,
        start: {
          pos: [0, 0.5, 3],
          rot: [0, Math.PI * 3 / 4, 0],
        },
      },
    ],
    tolerance: {
      pos: 0.03,
      deg: 15,
    },
    timeLimitSec: 120,
    hints: 1,
  },
};

function App() {
  const gameState = useGameStore((state) => state.gameState);
  const loadLevel = useGameStore((state) => state.loadLevel);

  useEffect(() => {
    // Initialize keyboard controls
    const controls = new KeyboardControls();

    return () => {
      controls.destroy();
    };
  }, []);

  const handleLevelSelect = (levelNumber: number) => {
    const level = levels[levelNumber];
    if (level) {
      loadLevel(level);
    }
  };

  return (
    <div className="app">
      {gameState === 'title' ? (
        <TitleScreen onLevelSelect={handleLevelSelect} />
      ) : (
        <>
          <Scene />
          <HUD />
        </>
      )}
    </div>
  );
}

export default App;
