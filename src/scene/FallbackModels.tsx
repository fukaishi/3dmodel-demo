import { useRef } from 'react';
import { Group, BoxGeometry, CylinderGeometry, MeshStandardMaterial, Mesh, Object3D } from 'three';

/**
 * Fallback models using Three.js primitives when GLB files are not available
 */

export function createFallbackPart1(): Group {
  const group = new Group();

  // Base cube
  const geometry = new BoxGeometry(0.5, 0.5, 0.5);
  const material = new MeshStandardMaterial({ color: 0xff6b6b });
  const mesh = new Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  group.add(mesh);

  // Add attach point marker (invisible, just for position reference)
  const attachPoint = new Object3D();
  attachPoint.name = '_AP_socket1';
  attachPoint.position.set(0, 0.25, 0);
  group.add(attachPoint);

  return group;
}

export function createFallbackPart2(): Group {
  const group = new Group();

  // Cylinder
  const geometry = new CylinderGeometry(0.2, 0.2, 0.6, 16);
  const material = new MeshStandardMaterial({ color: 0x4ecdc4 });
  const mesh = new Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  group.add(mesh);

  // Add attach point marker
  const attachPoint = new Object3D();
  attachPoint.name = '_AP_socket2';
  attachPoint.position.set(0, -0.3, 0);
  group.add(attachPoint);

  return group;
}

export function createFallbackPart3(): Group {
  const group = new Group();

  // Small cube
  const geometry = new BoxGeometry(0.4, 0.3, 0.4);
  const material = new MeshStandardMaterial({ color: 0xffe66d });
  const mesh = new Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  group.add(mesh);

  // Add attach point marker
  const attachPoint = new Object3D();
  attachPoint.name = '_AP_socket3';
  attachPoint.position.set(0, -0.15, 0);
  group.add(attachPoint);

  return group;
}

export function createFallbackTarget(): Group {
  const group = new Group();

  // Base - matches part1 position
  const baseGeometry = new BoxGeometry(0.5, 0.5, 0.5);
  const baseMaterial = new MeshStandardMaterial({ color: 0x888888, transparent: true, opacity: 0.5 });
  const base = new Mesh(baseGeometry, baseMaterial);
  base.position.set(0, 0.25, 0); // Elevated so bottom is at y=0
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Socket 1 marker (on top of base)
  const socket1 = new Object3D();
  socket1.name = '_SOCKET_socket1';
  socket1.position.set(0, 0.5, 0); // 0.25 + 0.25
  group.add(socket1);

  // Middle cylinder - matches part2
  const cylinderGeometry = new CylinderGeometry(0.2, 0.2, 0.6, 16);
  const cylinderMaterial = new MeshStandardMaterial({ color: 0x888888, transparent: true, opacity: 0.5 });
  const cylinder = new Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.set(0, 0.8, 0); // 0.5 + 0.3
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  group.add(cylinder);

  // Socket 2 marker (bottom of cylinder, connects to socket1)
  const socket2 = new Object3D();
  socket2.name = '_SOCKET_socket2';
  socket2.position.set(0, 0.5, 0); // same as socket1
  group.add(socket2);

  // Top cube - matches part3
  const topGeometry = new BoxGeometry(0.4, 0.3, 0.4);
  const topMaterial = new MeshStandardMaterial({ color: 0x888888, transparent: true, opacity: 0.5 });
  const top = new Mesh(topGeometry, topMaterial);
  top.position.set(0, 1.25, 0); // 0.8 + 0.3 + 0.15
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // Socket 3 marker (bottom of top cube, connects to top of cylinder)
  const socket3 = new Object3D();
  socket3.name = '_SOCKET_socket3';
  socket3.position.set(0, 1.1, 0); // 0.8 + 0.3
  group.add(socket3);

  return group;
}

interface FallbackModelProps {
  modelType: 'target' | 'part1' | 'part2' | 'part3';
}

export function FallbackModel({ modelType }: FallbackModelProps) {
  const groupRef = useRef<Group>(null);

  // Create the appropriate fallback model
  const createModel = () => {
    switch (modelType) {
      case 'target':
        return createFallbackTarget();
      case 'part1':
        return createFallbackPart1();
      case 'part2':
        return createFallbackPart2();
      case 'part3':
        return createFallbackPart3();
      default:
        return new Group();
    }
  };

  return (
    <primitive object={createModel()} ref={groupRef} />
  );
}
