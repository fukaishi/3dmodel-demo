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
   * Get all extracted sockets
   */
  getSockets(): SocketPoint[] {
    return this.sockets;
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
   * Returns LOCAL coordinates relative to the part model
   */
  extractAttachPoints(partModel: Object3D): AttachPoint[] {
    const points: AttachPoint[] = [];

    partModel.traverse((child) => {
      if (child.name.startsWith('_AP_')) {
        const pointName = child.name.replace(/^_AP_/, '');

        // Get local position relative to the part model
        const localPos = child.position.clone();
        const localQuat = child.quaternion.clone();

        points.push({
          name: pointName,
          position: localPos,
          quaternion: localQuat,
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
    targetSocketName: string,
    symmetryType?: 'box' | 'cylinder' | 'sphere' | 'none'
  ): SnapResult {
    if (attachPoints.length === 0) {
      return { success: false };
    }

    // Use the first attach point for simplicity
    const attachPoint = attachPoints[0];

    console.log(`  📍 Attach point "${attachPoint.name}" world position:`, attachPoint.position);

    // Find candidate sockets within proximity
    const proximityLimit = this.tolerance.pos * 6;
    console.log(`  🔍 Checking distances to all sockets (proximity limit: ${proximityLimit.toFixed(4)}m):`);

    const candidates = this.sockets.filter((socket) => {
      const distance = attachPoint.position.distanceTo(socket.position);
      console.log(`    - "${socket.name}": ${distance.toFixed(4)}m ${distance < proximityLimit ? '✓' : '✗ (too far)'}`);
      return distance < proximityLimit;
    });

    console.log(`  📊 Found ${candidates.length} candidate sockets within proximity`);

    if (candidates.length === 0) {
      console.log(`  ❌ No sockets within ${proximityLimit.toFixed(4)}m - part is too far!`);
      return { success: false };
    }

    // Prioritize correct socket name: check target socket first
    const correctSocketCandidates = candidates.filter((s) => s.name === targetSocketName);
    const otherCandidates = candidates.filter((s) => s.name !== targetSocketName);

    console.log(`  🎯 Target socket: "${targetSocketName}"`);
    console.log(`  📍 Found ${correctSocketCandidates.length} correct candidates:`, correctSocketCandidates.map(s => s.name));
    console.log(`  📍 Found ${otherCandidates.length} other candidates:`, otherCandidates.map(s => s.name));

    // Try correct sockets first, then others
    const orderedCandidates = [...correctSocketCandidates, ...otherCandidates];

    let bestSocket: SocketPoint | null = null;
    let bestScore = Infinity;

    console.log('  🔍 Evaluating candidates:');
    for (const socket of orderedCandidates) {
      // Check name match
      const isCorrect = socket.name === targetSocketName;

      // Calculate position difference
      const posDiff = attachPoint.position.distanceTo(socket.position);

      // Calculate angle difference (considering symmetry)
      const baseAngleDiff = this.quaternionAngleDegrees(
        attachPoint.quaternion,
        socket.quaternion
      );
      const angleDiff = this.calculateSymmetricAngleDiff(
        attachPoint.quaternion,
        socket.quaternion,
        symmetryType
      );

      console.log(`    - Socket "${socket.name}": posDiff=${posDiff.toFixed(4)}, angleDiff=${baseAngleDiff.toFixed(2)}° (${symmetryType ? `adjusted: ${angleDiff.toFixed(2)}°` : 'no symmetry'}), isCorrect=${isCorrect}, tolerance=(pos<${this.tolerance.pos}, angle<${this.tolerance.deg}°)`);

      // Check if within tolerance
      if (posDiff < this.tolerance.pos && angleDiff < this.tolerance.deg) {
        const score = posDiff + angleDiff * 0.01;
        console.log(`      ✓ Within tolerance! score=${score.toFixed(4)}`);
        if (score < bestScore) {
          bestSocket = socket;
          bestScore = score;

          // For correct socket name, accept immediately
          if (isCorrect) {
            console.log(`      ✓✓ Correct socket found, accepting immediately`);
            break;
          }
        }
      } else {
        if (posDiff >= this.tolerance.pos) {
          console.log(`      ✗ Position too far: ${posDiff.toFixed(4)} >= ${this.tolerance.pos}`);
        }
        if (angleDiff >= this.tolerance.deg) {
          console.log(`      ✗ Angle too large: ${angleDiff.toFixed(2)}° >= ${this.tolerance.deg}°`);
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
    targetSocketName: string,
    symmetryType?: 'box' | 'cylinder' | 'sphere' | 'none'
  ): SnapResult {
    console.log('🔧 trySnap called with:', {
      partPosition,
      partRotation,
      attachPointsCount: attachPoints.length,
      attachPointNames: attachPoints.map(ap => ap.name),
      targetSocketName,
      symmetryType: symmetryType || 'none',
      availableSockets: this.sockets.length
    });

    // Update attach point positions based on current part transform
    const updatedAttachPoints = this.updateAttachPoints(
      attachPoints,
      partPosition,
      partRotation
    );

    console.log('🔄 Updated attach points:', updatedAttachPoints.map(ap => ({ name: ap.name, position: ap.position })));

    const result = this.findBestSocket(updatedAttachPoints, targetSocketName, symmetryType);
    console.log('📊 findBestSocket result:', result);

    return result;
  }

  /**
   * Update attach point transforms based on part position/rotation
   * Converts local attach points to world coordinates
   */
  private updateAttachPoints(
    attachPoints: AttachPoint[],
    position: Vector3,
    rotation: Euler
  ): AttachPoint[] {
    const partQuat = new Quaternion().setFromEuler(rotation);

    return attachPoints.map((point) => {
      // Calculate world position: rotate local position, then add part position
      const worldPos = point.position.clone().applyQuaternion(partQuat).add(position);

      // Calculate world rotation: apply part rotation first, then local rotation
      // In Three.js, q1.multiply(q2) means "apply q2 first, then q1"
      const worldQuat = partQuat.clone().multiply(point.quaternion);

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
   * Calculate angle difference considering symmetry
   * Returns the minimum angle difference considering the part's symmetry
   */
  private calculateSymmetricAngleDiff(
    q1: Quaternion,
    q2: Quaternion,
    symmetryType?: 'box' | 'cylinder' | 'sphere' | 'none'
  ): number {
    const baseDiff = this.quaternionAngleDegrees(q1, q2);

    if (!symmetryType || symmetryType === 'none') {
      return baseDiff;
    }

    // Sphere: any rotation is acceptable
    if (symmetryType === 'sphere') {
      return 0;
    }

    // Cylinder: Y-axis rotation doesn't matter
    // For simplicity, if angle diff is mostly around Y-axis, reduce it significantly
    if (symmetryType === 'cylinder') {
      // If the angle is less than tolerance already, keep it
      if (baseDiff < this.tolerance.deg) return baseDiff;
      // Otherwise, be very lenient (assume Y-axis rotation)
      return baseDiff * 0.1; // Reduce impact of rotation
    }

    // Box: 90-degree rotational symmetry
    if (symmetryType === 'box') {
      // Find the nearest 90-degree multiple
      const mod90 = baseDiff % 90;
      const diff = Math.min(mod90, 90 - mod90);
      return diff;
    }

    return baseDiff;
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
