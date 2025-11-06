import { Vector3 } from 'three';
import { useGameStore } from '../state/game.store';

export class KeyboardControls {
  private pressedKeys = new Set<string>();
  private enabled = true;

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.enabled) return;

    // Prevent default for navigation keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Backspace'].includes(e.key)) {
      e.preventDefault();
    }

    // Avoid Cmd/Ctrl shortcuts
    if (e.metaKey || e.ctrlKey) {
      return;
    }

    this.pressedKeys.add(e.key);
    this.processInput(e);
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.pressedKeys.delete(e.key);
  }

  private processInput(e: KeyboardEvent) {
    const store = useGameStore.getState();
    const { selectedPartId } = store;

    if (!selectedPartId) {
      // No part selected, handle global controls
      this.handleGlobalInput(e);
      return;
    }

    const part = store.parts.get(selectedPartId);
    if (!part) return;

    const shift = e.shiftKey;

    switch (e.key) {
      // Part selection
      case 'Tab':
        e.preventDefault();
        if (shift) {
          store.selectPrevPart();
        } else {
          store.selectNextPart();
        }
        break;

      // Number keys for direct selection
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9': {
        const partIds = Array.from(store.parts.keys());
        const index = parseInt(e.key) - 1;
        if (index < partIds.length) {
          store.selectPart(partIds[index]);
        }
        break;
      }

      // Grab/Release
      case 'Enter':
        if (part.isGrabbed) {
          console.log('🔓 Releasing part:', selectedPartId);
          store.releasePart(selectedPartId);
        } else {
          console.log('🔒 Grabbing part:', selectedPartId);
          store.grabPart(selectedPartId);
        }
        break;

      // Movement (XZ plane)
      case 'ArrowUp':
        if (part.isGrabbed) {
          const delta = shift ? 0.01 : 0.05;
          store.movePart(selectedPartId, new Vector3(0, 0, -delta));
        }
        break;
      case 'ArrowDown':
        if (part.isGrabbed) {
          const delta = shift ? 0.01 : 0.05;
          store.movePart(selectedPartId, new Vector3(0, 0, delta));
        }
        break;
      case 'ArrowLeft':
        if (part.isGrabbed) {
          const delta = shift ? 0.01 : 0.05;
          store.movePart(selectedPartId, new Vector3(-delta, 0, 0));
        }
        break;
      case 'ArrowRight':
        if (part.isGrabbed) {
          const delta = shift ? 0.01 : 0.05;
          store.movePart(selectedPartId, new Vector3(delta, 0, 0));
        }
        break;

      // Y-axis movement
      case 'u':
      case 'U':
        if (part.isGrabbed) {
          store.movePart(selectedPartId, new Vector3(0, 0.02, 0));
        }
        break;
      case 'o':
      case 'O':
        if (part.isGrabbed) {
          store.movePart(selectedPartId, new Vector3(0, -0.02, 0));
        }
        break;

      // Rotation (Yaw - Y axis)
      case 'q':
      case 'Q':
        if (part.isGrabbed) {
          const degrees = shift ? 90 : 15;
          store.rotatePart(selectedPartId, 'y', -degrees);
        }
        break;
      case 'e':
      case 'E':
        if (part.isGrabbed) {
          const degrees = shift ? 90 : 15;
          store.rotatePart(selectedPartId, 'y', degrees);
        }
        break;

      // Roll (Z axis)
      case '[':
        if (part.isGrabbed) {
          store.rotatePart(selectedPartId, 'z', -15);
        }
        break;
      case ']':
        if (part.isGrabbed) {
          store.rotatePart(selectedPartId, 'z', 15);
        }
        break;

      // Pitch (X axis)
      case ';':
        if (part.isGrabbed) {
          store.rotatePart(selectedPartId, 'x', -15);
        }
        break;
      case "'":
        if (part.isGrabbed) {
          store.rotatePart(selectedPartId, 'x', 15);
        }
        break;

      // Snap
      case 's':
      case 'S':
        console.log('🔑 S key pressed!', {
          selectedPartId,
          isGrabbed: part.isGrabbed,
          isSnapped: part.isSnapped,
          position: part.position,
          rotation: part.rotation,
        });
        if (part.isGrabbed) {
          console.log('✅ Part is grabbed, calling trySnapPart');
          store.trySnapPart(selectedPartId);
        } else {
          console.log('❌ Part is not grabbed, cannot snap');
        }
        break;

      // Hint
      case 'h':
      case 'H':
        store.useHint();
        break;

      // Reset part
      case 'Backspace':
        store.resetPart(selectedPartId);
        break;

      // Reset level (requires hold)
      case 'r':
      case 'R':
        // Hold detection will be implemented in the component
        break;

      // Undo/Redo (custom implementation, not Cmd+Z)
      case 'z':
      case 'Z':
        // if (shift) {
        //   // Redo
        // } else {
        //   // Undo
        // }
        break;

      // Zoom
      case '+':
      case '=':
        store.adjustZoom(0.1);
        break;
      case '-':
      case '_':
        store.adjustZoom(-0.1);
        break;

      // Toggle ghost
      case 'v':
      case 'V':
        store.toggleGhost();
        break;

      // Toggle grid
      case 'g':
      case 'G':
        store.toggleGrid();
        break;
    }
  }

  private handleGlobalInput(e: KeyboardEvent) {
    const store = useGameStore.getState();

    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        store.selectNextPart();
        break;

      case '+':
      case '=':
        store.adjustZoom(0.1);
        break;
      case '-':
      case '_':
        store.adjustZoom(-0.1);
        break;

      case 'v':
      case 'V':
        store.toggleGhost();
        break;

      case 'g':
      case 'G':
        store.toggleGrid();
        break;

      case 'h':
      case 'H':
        store.useHint();
        break;
    }
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}
