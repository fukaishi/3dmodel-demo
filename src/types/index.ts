import { Vector3, Quaternion } from 'three';

export type GameState = 'title' | 'idle' | 'playing' | 'paused' | 'success' | 'fail';

export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface PartConfig {
  id: string;
  file: string;
  snapTo: string;
  rotStep?: number;
  start?: {
    pos: [number, number, number];
    rot: [number, number, number];
  };
}

export interface Level {
  id: string;
  name: string;
  target: string;
  parts: PartConfig[];
  tolerance: {
    pos: number;
    deg: number;
  };
  timeLimitSec?: number;
  hints?: number;
}

export interface AttachPoint {
  name: string;
  position: Vector3;
  quaternion: Quaternion;
}

export interface SocketPoint {
  name: string;
  position: Vector3;
  quaternion: Quaternion;
}

export interface PartState {
  id: string;
  config: PartConfig;
  position: Vector3;
  rotation: Vector3;
  isGrabbed: boolean;
  isSnapped: boolean;
  attachPoints: AttachPoint[];
}

export interface GameStats {
  stars: number;
  time: number;
  hintsUsed: number;
  mistakes: number;
}

export interface LevelProgress {
  levelId: string;
  bestTime?: number;
  bestStars?: number;
  completed: boolean;
}
