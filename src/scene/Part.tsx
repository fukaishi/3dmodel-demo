import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MeshStandardMaterial, Euler } from 'three';
import type { PartState } from '../types';
import { createFallbackPart1, createFallbackPart2, createFallbackPart3 } from './FallbackModels';

interface PartProps {
  partState: PartState;
  isSelected: boolean;
  onLoaded?: (group: Group) => void;
}

export function Part({ partState, isSelected, onLoaded }: PartProps) {
  const groupRef = useRef<Group>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const onLoadedRef = useRef(onLoaded);

  // Keep onLoadedRef up to date
  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  useEffect(() => {
    if (!groupRef.current) return;

    // Use fallback models based on part ID
    const loadModel = () => {
      let fallbackModel: Group;

      switch (partState.id) {
        case 'part1':
          fallbackModel = createFallbackPart1();
          break;
        case 'part2':
          fallbackModel = createFallbackPart2();
          break;
        case 'part3':
          fallbackModel = createFallbackPart3();
          break;
        default:
          fallbackModel = createFallbackPart1();
      }

      // Clear previous children
      if (groupRef.current) {
        groupRef.current.clear();
        groupRef.current.add(fallbackModel);

        setIsLoaded(true);

        // Notify parent that model is loaded - pass the fallbackModel directly
        if (onLoadedRef.current) {
          onLoadedRef.current(fallbackModel);
        }
      }
    };

    loadModel();
  }, [partState.id]); // Only re-run when partState.id changes

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
