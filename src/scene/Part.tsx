import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, MeshStandardMaterial, Euler, Quaternion } from 'three';
import { useGameStore } from '../state/game.store';
import { PartState } from '../types';

interface PartProps {
  partState: PartState;
  isSelected: boolean;
  onLoaded?: (group: Group) => void;
}

export function Part({ partState, isSelected, onLoaded }: PartProps) {
  const groupRef = useRef<Group>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load the GLTF model
  const { scene } = useGLTF(partState.config.file);

  useEffect(() => {
    if (!groupRef.current) return;

    // Clone the scene to avoid modifying the cached original
    const clonedScene = scene.clone(true);

    // Clear previous children
    groupRef.current.clear();
    groupRef.current.add(clonedScene);

    setIsLoaded(true);

    // Notify parent that model is loaded
    if (onLoaded) {
      onLoaded(groupRef.current);
    }
  }, [scene, onLoaded]);

  // Update position and rotation from state
  useFrame(() => {
    if (!groupRef.current || !isLoaded) return;

    // Update position
    groupRef.current.position.copy(partState.position);

    // Update rotation
    const euler = new Euler(
      partState.rotation.x,
      partState.rotation.y,
      partState.rotation.z
    );
    groupRef.current.quaternion.setFromEuler(euler);
  });

  // Apply visual effects based on state
  useEffect(() => {
    if (!groupRef.current || !isLoaded) return;

    groupRef.current.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        const mesh = child as any;
        if (mesh.material) {
          const material = mesh.material.clone();
          if (material instanceof MeshStandardMaterial) {
            // Reset to default
            material.emissive.setHex(0x000000);
            material.emissiveIntensity = 0;

            // Apply effects
            if (isSelected) {
              material.emissive.setHex(0xffff00);
              material.emissiveIntensity = 0.3;
            }

            if (partState.isSnapped) {
              material.emissive.setHex(0x00ff00);
              material.emissiveIntensity = 0.5;
            }

            if (partState.isGrabbed) {
              material.emissive.setHex(0x00aaff);
              material.emissiveIntensity = 0.2;
            }
          }
          mesh.material = material;
        }
      }
    });
  }, [isSelected, partState.isGrabbed, partState.isSnapped, isLoaded]);

  return <group ref={groupRef} />;
}
