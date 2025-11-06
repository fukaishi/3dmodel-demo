import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Grid } from '@react-three/drei';
import { Group } from 'three';
import { Ghost } from './Ghost';
import { Part } from './Part';
import { useGameStore } from '../state/game.store';
import { SnapSystem } from '../systems/SnapSystem';
import { SocketPoint } from '../types';

export function Scene() {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const parts = useGameStore((state) => state.parts);
  const selectedPartId = useGameStore((state) => state.selectedPartId);
  const showGrid = useGameStore((state) => state.showGrid);
  const zoomLevel = useGameStore((state) => state.zoomLevel);

  const [snapSystem] = useState(() => new SnapSystem());
  const [sockets, setSockets] = useState<SocketPoint[]>([]);
  const ghostRef = useRef<Group>(null);

  // Extract sockets when ghost model loads
  const handleGhostLoaded = (group: Group) => {
    ghostRef.current = group;
    const extractedSockets = snapSystem.extractSockets(group);
    setSockets(extractedSockets);
    console.log(`Extracted ${extractedSockets.length} sockets from ghost model`);
  };

  // Extract attach points when part loads
  const handlePartLoaded = (partId: string) => (group: Group) => {
    const part = parts.get(partId);
    if (!part) return;

    const attachPoints = snapSystem.extractAttachPoints(group);

    // Update part state with attach points
    const newParts = new Map(parts);
    newParts.set(partId, { ...part, attachPoints });
    useGameStore.setState({ parts: newParts });

    console.log(`Extracted ${attachPoints.length} attach points from part ${partId}`);
  };

  if (!currentLevel) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No level loaded</p>
      </div>
    );
  }

  return (
    <Canvas
      style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}
      tabIndex={0}
      onKeyDown={(e) => e.preventDefault()}
    >
      {/* Isometric camera */}
      <OrthographicCamera
        makeDefault
        position={[10, 10, 10]}
        zoom={50 * zoomLevel}
        near={0.1}
        far={1000}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      {/* Grid */}
      {showGrid && (
        <Grid
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6b6b6b"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#9d9d9d"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
        />
      )}

      {/* Ghost model */}
      <Ghost modelPath={currentLevel.target} onLoaded={handleGhostLoaded} />

      {/* Parts */}
      {Array.from(parts.values()).map((partState) => (
        <Part
          key={partState.id}
          partState={partState}
          isSelected={partState.id === selectedPartId}
          onLoaded={handlePartLoaded(partState.id)}
        />
      ))}
    </Canvas>
  );
}
