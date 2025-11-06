import { useEffect, useRef } from 'react';
import { Group, MeshStandardMaterial } from 'three';
import { useGameStore } from '../state/game.store';
import { createFallbackTarget } from './FallbackModels';

interface GhostProps {
  modelPath: string;
  onLoaded?: (group: Group) => void;
}

export function Ghost({ modelPath, onLoaded }: GhostProps) {
  const groupRef = useRef<Group>(null);
  const showGhost = useGameStore((state) => state.showGhost);

  useEffect(() => {
    if (!groupRef.current) return;

    // Try to load GLB, but use fallback for now
    // Since we don't have actual GLB files, we'll use the fallback
    const loadModel = () => {
      try {
        // For now, always use fallback since we don't have GLB files
        const fallbackModel = createFallbackTarget();

        // Make all meshes semi-transparent
        fallbackModel.traverse((child) => {
          if ('isMesh' in child && child.isMesh) {
            const mesh = child as any;
            if (mesh.material) {
              const material = mesh.material.clone();
              if (material instanceof MeshStandardMaterial) {
                material.transparent = true;
                material.opacity = 0.3;
                material.wireframe = false;
                material.color.setHex(0x00ff88);
              }
              mesh.material = material;
            }
          }
        });

        // Clear previous children
        if (groupRef.current) {
          groupRef.current.clear();
          groupRef.current.add(fallbackModel);

          // Notify parent that model is loaded
          if (onLoaded) {
            onLoaded(groupRef.current);
          }
        }
      } catch (error) {
        console.error('Failed to load ghost model:', error);
      }
    };

    loadModel();
  }, [modelPath, onLoaded]);

  if (!showGhost) return null;

  return <group ref={groupRef} />;
}
