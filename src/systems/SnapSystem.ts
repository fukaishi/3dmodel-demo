import { Vector3, Quaternion, Object3D, Euler } from 'three';
import type { AttachPoint, SocketPoint } from '../types';

export interface SnapResult {
  success: boolean;
  socket?: SocketPoint;
  score?: number;
  isCorrect?: boolean;
}

export class SnapSystem {
  private sockets: SocketPoint[] = [];
  private tolerance = {
    pos: 0.05,
    deg: 25,
  };

  constructor(tolerance?: { pos: number; deg: number }) {
    if (tolerance) {
      this.tolerance = tolerance;
    }
  }

  /**
   * Extract socket points from a ghost model
   */
  extractSockets(ghostModel: Object3D): SocketPoint[] {
    const sockets: SocketPoint[] = [];

    ghostModel.traverse((child) => {
      if (child.name.startsWith('_SOCKET_') || child.name.startsWith('_AP_')) {
        const socketName = child.name.replace(/^(_SOCKET_|_AP_)/, '');
        const worldPos = new Vector3();
        const worldQuat = new Quaternion();

        child.getWorldPosition(worldPos);
        child.getWorldQuaternion(worldQuat);

        sockets.push({
          name: socketName,
          position: worldPos.clone(),
          quaternion: worldQuat.clone(),
        });
      }
    });

    this.sockets = sockets;
    return sockets;
  }

  /**
   * Extract attach points from a part model
   */
  extractAttachPoints(partModel: Object3D): AttachPoint[] {
    const points: AttachPoint[] = [];

    partModel.traverse((child) => {
      if (child.name.startsWith('_AP_')) {
        const pointName = child.name.replace(/^_AP_/, '');
        const worldPos = new Vector3();
        const worldQuat = new Quaternion();

        child.getWorldPosition(worldPos);
        child.getWorldQuaternion(worldQuat);

        points.push({
          name: pointName,
          position: worldPos.clone(),
          quaternion: worldQuat.clone(),
        });
      }
    });

    return points;
  }

  /**
   * Find the best matching socket for a part's attach points
   */
  findBestSocket(
    attachPoints: AttachPoint[],
    targetSocketName: string
  ): SnapResult {
    if (attachPoints.length === 0) {
      return { success: false };
    }

    // Use the first attach point for simplicity
    const attachPoint = attachPoints[0];

    // Find candidate sockets within proximity
    const candidates = this.sockets.filter((socket) => {
      const distance = attachPoint.position.distanceTo(socket.position);
      return distance < this.tolerance.pos * 6;
    });

    if (candidates.length === 0) {
      return { success: false };
    }

    let bestSocket: SocketPoint | null = null;
    let bestScore = Infinity;

    for (const socket of candidates) {
      // Check name match
      const isCorrect = socket.name === targetSocketName;

      // Calculate position difference
      const posDiff = attachPoint.position.distanceTo(socket.position);

      // Calculate angle difference
      const angleDiff = this.quaternionAngleDegrees(
        attachPoint.quaternion,
        socket.quaternion
      );

      // Check if within tolerance
      if (posDiff < this.tolerance.pos && angleDiff < this.tolerance.deg) {
        const score = posDiff + angleDiff * 0.01;
        if (score < bestScore) {
          bestSocket = socket;
          bestScore = score;

          // For name matching, we only accept the correct socket
          if (isCorrect) {
            break;
          }
        }
      }
    }

    if (!bestSocket) {
      return { success: false };
    }

    const isCorrect = bestSocket.name === targetSocketName;

    return {
      success: true,
      socket: bestSocket,
      score: bestScore,
      isCorrect,
    };
  }

  /**
   * Try to snap a part to a socket
   */
  trySnap(
    partPosition: Vector3,
    partRotation: Euler,
    attachPoints: AttachPoint[],
    targetSocketName: string
  ): SnapResult {
    // Update attach point positions based on current part transform
    const updatedAttachPoints = this.updateAttachPoints(
      attachPoints,
      partPosition,
      partRotation
    );

    return this.findBestSocket(updatedAttachPoints, targetSocketName);
  }

  /**
   * Update attach point transforms based on part position/rotation
   */
  private updateAttachPoints(
    attachPoints: AttachPoint[],
    position: Vector3,
    rotation: Euler
  ): AttachPoint[] {
    const partQuat = new Quaternion().setFromEuler(rotation);

    return attachPoints.map((point) => {
      // Calculate world position
      const worldPos = point.position.clone().applyQuaternion(partQuat).add(position);

      // Calculate world rotation
      const worldQuat = point.quaternion.clone().multiply(partQuat);

      return {
        name: point.name,
        position: worldPos,
        quaternion: worldQuat,
      };
    });
  }

  /**
   * Calculate angle difference between two quaternions in degrees
   */
  private quaternionAngleDegrees(q1: Quaternion, q2: Quaternion): number {
    const dot = Math.abs(q1.dot(q2));
    const clampedDot = Math.min(1, dot);
    const angle = 2 * Math.acos(clampedDot);
    return (angle * 180) / Math.PI;
  }

  /**
   * Get interpolated position and rotation for smooth snapping animation
   */
  interpolateToSocket(
    currentPos: Vector3,
    currentRot: Quaternion,
    targetSocket: SocketPoint,
    alpha: number
  ): { position: Vector3; rotation: Quaternion } {
    const newPos = currentPos.clone().lerp(targetSocket.position, alpha);
    const newRot = currentRot.clone().slerp(targetSocket.quaternion, alpha);

    return {
      position: newPos,
      rotation: newRot,
    };
  }

  /**
   * Check if all parts are correctly snapped
   */
  checkWinCondition(snappedParts: Map<string, boolean>): boolean {
    if (snappedParts.size === 0) return false;

    for (const [, isSnapped] of snappedParts) {
      if (!isSnapped) return false;
    }

    return true;
  }
}
