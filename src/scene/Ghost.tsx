import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, MeshStandardMaterial } from 'three';
import { useGameStore } from '../state/game.store';

interface GhostProps {
  modelPath: string;
  onLoaded?: (group: Group) => void;
}

export function Ghost({ modelPath, onLoaded }: GhostProps) {
  const groupRef = useRef<Group>(null);
  const showGhost = useGameStore((state) => state.showGhost);

  // Load the GLTF model
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    if (!groupRef.current) return;

    // Clone the scene to avoid modifying the cached original
    const clonedScene = scene.clone(true);

    // Make all meshes semi-transparent
    clonedScene.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        const mesh = child as any;
        if (mesh.material) {
          // Clone material to avoid modifying cached material
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
    groupRef.current.clear();
    groupRef.current.add(clonedScene);

    // Notify parent that model is loaded
    if (onLoaded) {
      onLoaded(groupRef.current);
    }
  }, [scene, onLoaded]);

  if (!showGhost) return null;

  return <group ref={groupRef} />;
}
