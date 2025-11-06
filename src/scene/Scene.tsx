import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, Html } from '@react-three/drei';
import { Group, Vector3 as ThreeVector3, Euler } from 'three';
import { Ghost } from './Ghost';
import { Part } from './Part';
import { useGameStore } from '../state/game.store';
import { SnapSystem } from '../systems/SnapSystem';

export function Scene() {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const parts = useGameStore((state) => state.parts);
  const selectedPartId = useGameStore((state) => state.selectedPartId);
  const showGrid = useGameStore((state) => state.showGrid);
  const snapFeedback = useGameStore((state) => state.snapFeedback);
  const showHintForPartId = useGameStore((state) => state.showHintForPartId);

  const [snapSystem] = useState(() => new SnapSystem());
  const ghostRef = useRef<Group>(null);
  const [hintSocket, setHintSocket] = useState<ThreeVector3 | null>(null);

  // Extract sockets when ghost model loads
  const handleGhostLoaded = (group: Group) => {
    ghostRef.current = group;
    const extractedSockets = snapSystem.extractSockets(group);
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

  // Handle snap attempts
  useEffect(() => {
    if (!snapFeedback) return;

    const { partId } = snapFeedback;
    const part = parts.get(partId);
    const partConfig = currentLevel?.parts.find((p) => p.id === partId);

    if (!part || !partConfig) {
      useGameStore.getState().clearSnapFeedback();
      return;
    }

    // Try to snap
    const result = snapSystem.trySnap(
      part.position,
      new Euler(part.rotation.x, part.rotation.y, part.rotation.z),
      part.attachPoints,
      partConfig.snapTo
    );

    if (result.success && result.socket && result.isCorrect) {
      // Success! Move part to socket
      const newParts = new Map(parts);
      newParts.set(partId, {
        ...part,
        position: result.socket.position.clone(),
        rotation: new ThreeVector3().setFromEuler(
          new Euler().setFromQuaternion(result.socket.quaternion)
        ),
        isSnapped: true,
        isGrabbed: false,
      });
      useGameStore.setState({
        parts: newParts,
        snapFeedback: { partId, success: true }
      });

      console.log(`✓ Part ${partId} snapped successfully!`);

      // Clear feedback after 1 second
      setTimeout(() => {
        useGameStore.getState().clearSnapFeedback();
      }, 1000);
    } else {
      // Failed - show error feedback
      console.log(`✗ Part ${partId} snap failed - not close enough or wrong orientation`);

      // Clear feedback after 500ms
      setTimeout(() => {
        useGameStore.getState().clearSnapFeedback();
      }, 500);
    }
  }, [snapFeedback, parts, currentLevel, snapSystem]);

  // Handle hint display
  useEffect(() => {
    if (!showHintForPartId) {
      setHintSocket(null);
      return;
    }

    const part = parts.get(showHintForPartId);
    const partConfig = currentLevel?.parts.find((p) => p.id === showHintForPartId);

    if (!part || !partConfig) return;

    // Find the target socket
    const sockets = snapSystem['sockets']; // Access private field for hint
    const targetSocket = sockets.find((s) => s.name === partConfig.snapTo);

    if (targetSocket) {
      setHintSocket(targetSocket.position);
      console.log(`💡 Hint: Target socket for ${showHintForPartId} is at`, targetSocket.position);
    }
  }, [showHintForPartId, parts, currentLevel, snapSystem]);

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
      camera={{ position: [5, 5, 5], fov: 50 }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

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

      {/* Hint indicator */}
      {hintSocket && (
        <>
          <mesh position={hintSocket}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={1}
              transparent
              opacity={0.6}
            />
          </mesh>
          <pointLight position={hintSocket} intensity={2} color="#ffff00" distance={3} />
        </>
      )}

      {/* Snap feedback */}
      {snapFeedback && snapFeedback.success && (
        <Html center>
          <div style={{
            padding: '10px 20px',
            background: 'rgba(0, 255, 0, 0.9)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            pointerEvents: 'none'
          }}>
            ✓ Snapped!
          </div>
        </Html>
      )}
    </Canvas>
  );
}
