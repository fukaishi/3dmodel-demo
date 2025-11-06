# SnapFit Workshop - 3D Puzzle Game

A web-based low-poly 3D puzzle game built with React, Vite, and react-three-fiber. Assemble 3D models by rotating and positioning parts until they snap together!

🎮 **[Play Live Demo](https://fukaishi.github.io/3dmodel-demo/)**

[![Deploy to GitHub Pages](https://github.com/fukaishi/3dmodel-demo/actions/workflows/deploy.yml/badge.svg)](https://github.com/fukaishi/3dmodel-demo/actions/workflows/deploy.yml)

## Features

- **Keyboard-Only Controls**: Mac/Windows compatible keyboard controls (no mouse required for gameplay)
- **Snap System**: Intelligent magnetic snap system for precise part assembly
- **Visual Feedback**: Color-coded highlights for selected, grabbed, and snapped parts
- **Isometric View**: Fixed isometric camera with zoom controls
- **Progress Tracking**: Timer, star rating, and hints system
- **Level System**: JSON-based level configuration for easy expansion

## Technology Stack

- **React 18** + **TypeScript**
- **Vite** - Fast build tool and dev server
- **react-three-fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **zustand** - Lightweight state management
- **Three.js** - 3D graphics library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

**Note**: The game currently uses fallback 3D models (simple geometric primitives) so you can test it immediately without GLB files. To use custom models, place your GLB files in `public/models/` and follow the instructions in `public/models/README.md`.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Keyboard Controls

### Part Selection
- **Tab**: Select next part
- **Shift+Tab**: Select previous part
- **1-9**: Direct part selection

### Part Manipulation
- **Enter**: Grab/Release selected part
- **Arrow Keys**: Move part in XZ plane (0.05m step)
- **Shift+Arrows**: Fine movement (0.01m step)
- **U/O**: Move part up/down (Y axis)

### Rotation
- **Q/E**: Rotate yaw ±15° (Shift for ±90°)
- **[/]**: Rotate roll ±15°
- **;/'**: Rotate pitch ±15°

### Actions
- **S**: Attempt to snap part to nearest socket
- **H**: Use hint (show guide to nearest socket)
- **Backspace**: Reset current part
- **R (hold 0.7s)**: Reset entire level

### View Controls
- **+/-**: Zoom in/out
- **V**: Toggle ghost model visibility
- **G**: Toggle grid visibility

## Project Structure

```
src/
  ├── App.tsx                  # Main application component
  ├── scene/
  │   ├── Scene.tsx            # 3D scene setup
  │   ├── Ghost.tsx            # Target model (semi-transparent)
  │   └── Part.tsx             # Individual part component
  ├── systems/
  │   ├── SnapSystem.ts        # Snap detection and validation
  │   └── KeyboardControls.ts  # Keyboard input handler
  ├── state/
  │   └── game.store.ts        # Zustand game state store
  ├── ui/
  │   ├── HUD.tsx              # Heads-up display
  │   └── HUD.css              # HUD styles
  ├── levels/
  │   └── level_01.json        # Level configuration
  └── types/
      └── index.ts             # TypeScript type definitions
```

## Creating Levels

Levels are defined in JSON format. See `src/levels/level_01.json` for an example.

### Level Configuration

```json
{
  "id": "level_01",
  "name": "Tutorial - Simple Assembly",
  "target": "/models/target.glb",
  "parts": [
    {
      "id": "part1",
      "file": "/models/part1.glb",
      "snapTo": "socket1",
      "rotStep": 15,
      "start": {
        "pos": [-2, 0, 0],
        "rot": [0, 0, 0]
      }
    }
  ],
  "tolerance": {
    "pos": 0.05,
    "deg": 25
  },
  "timeLimitSec": 120,
  "hints": 3
}
```

## 3D Model Requirements

### Format
- **glTF 2.0** (.glb binary format)
- **Y-Up** coordinate system
- **Meters** as units

### Attach Points
Parts and target models must include Empty objects with specific naming:

- **Parts**: `_AP_socketName` (e.g., `_AP_socket1`)
- **Target**: `_SOCKET_socketName` or `_AP_socketName`

### Export from Blender

1. Add Empty objects at attachment points
2. Name them with `_AP_` or `_SOCKET_` prefix
3. File → Export → glTF 2.0 (.glb)
4. Enable: +Y Up, Apply Modifiers, Include Empties
5. Optional: Enable Draco compression

See `public/models/README.md` for detailed instructions.

## Performance Guidelines

- **Total triangles**: 50k - 120k per scene
- **Textures**: 512px - 1024px maximum
- **Materials**: PBR (Metallic-Roughness)
- **Lights**: 1-2 with shadows
- **Post-processing**: Minimal (outline only)

## Game Mechanics

### Snap System

Parts automatically snap to sockets when:
1. **Position** is within tolerance (default: 0.05m)
2. **Rotation** is within tolerance (default: 25°)
3. **Socket name** matches the part's target

### Scoring

- **3 Stars**: Fast completion, no hints, no mistakes
- **2 Stars**: Moderate time or few hints/mistakes
- **1 Star**: Completion with many hints/mistakes

### Win Condition

All parts correctly snapped to their designated sockets.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires WebGL 2.0 support.

## Deployment

This project is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

### GitHub Pages Setup

The repository is configured with GitHub Actions for automatic deployment:

1. **Workflow**: `.github/workflows/deploy.yml` handles the build and deployment
2. **Build**: Runs `npm ci` and `npm run build`
3. **Deploy**: Deploys the `dist` folder to GitHub Pages

### Manual Deployment

To deploy manually:

```bash
npm run build
```

The built files will be in the `dist` directory, which can be deployed to any static hosting service.

### Configuration

The `vite.config.ts` is configured to use the correct base path for GitHub Pages:
- Development: `/` (localhost)
- Production: `/3dmodel-demo/` (GitHub Pages)

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add your levels and models
4. Submit a pull request

## Future Enhancements

- [ ] Sound effects and background music
- [ ] More levels with increasing difficulty
- [ ] Mobile touch controls
- [ ] Multiplayer mode
- [ ] Level editor
- [ ] Achievement system
- [ ] Leaderboards
