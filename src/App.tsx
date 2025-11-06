import { useEffect } from 'react';
import { Scene } from './scene/Scene';
import { HUD } from './ui/HUD';
import { useGameStore } from './state/game.store';
import { KeyboardControls } from './systems/KeyboardControls';
import { Level } from './types';
import './App.css';

// Sample level data
const sampleLevel: Level = {
  id: 'level_01',
  name: 'Tutorial - Simple Assembly',
  target: '/models/target.glb',
  parts: [
    {
      id: 'part1',
      file: '/models/part1.glb',
      snapTo: 'socket1',
      rotStep: 15,
      start: {
        pos: [-2, 0, 0],
        rot: [0, 0, 0],
      },
    },
    {
      id: 'part2',
      file: '/models/part2.glb',
      snapTo: 'socket2',
      rotStep: 15,
      start: {
        pos: [2, 0, 0],
        rot: [0, 0, 0],
      },
    },
    {
      id: 'part3',
      file: '/models/part3.glb',
      snapTo: 'socket3',
      rotStep: 15,
      start: {
        pos: [0, 0, 2],
        rot: [0, 0, 0],
      },
    },
  ],
  tolerance: {
    pos: 0.05,
    deg: 25,
  },
  timeLimitSec: 120,
  hints: 3,
};

function App() {
  const loadLevel = useGameStore((state) => state.loadLevel);

  useEffect(() => {
    // Initialize keyboard controls
    const controls = new KeyboardControls();

    // Load the first level
    loadLevel(sampleLevel);

    return () => {
      controls.destroy();
    };
  }, [loadLevel]);

  return (
    <div className="app">
      <Scene />
      <HUD />
    </div>
  );
}

export default App;
