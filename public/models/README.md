# 3D Models Directory

This directory should contain the GLB/GLTF models for the SnapFit Workshop game.

## Required Models

For the tutorial level (level_01), you need:

1. **target.glb** - The complete assembled model (ghost)
2. **part1.glb** - First part to assemble
3. **part2.glb** - Second part to assemble
4. **part3.glb** - Third part to assemble

## Model Requirements

### Attach Points and Sockets

Each part model should include Empty objects (empties) with specific naming:

- **Parts**: Add Empty objects with prefix `_AP_` followed by the socket name
  - Example: `_AP_socket1`, `_AP_socket2`, `_AP_socket3`

- **Target/Ghost**: Add Empty objects with prefix `_SOCKET_` or `_AP_` followed by the socket name
  - Example: `_SOCKET_socket1`, `_SOCKET_socket2`, `_SOCKET_socket3`

### Export Settings (Blender)

When exporting from Blender:

1. File → Export → glTF 2.0 (.glb)
2. Enable these options:
   - Format: GLB (binary file)
   - Include: Selected Objects (or all if needed)
   - Transform: +Y Up
   - Geometry: Apply Modifiers
   - Compression: Draco (optional, for smaller file size)
3. Make sure Empty objects are included in the export

### Coordinate System

- Use Y-Up orientation
- Scale in meters
- Keep models centered around origin (0, 0, 0)

### Low-Poly Guidelines

For optimal performance:
- Target: 50,000 - 120,000 triangles per scene
- Textures: 512px - 1024px max
- Materials: Use PBR materials (Metallic-Roughness workflow)

## Creating Test Models

If you don't have models yet, you can create simple placeholder models:

1. Open Blender
2. Create simple geometric shapes (cubes, cylinders, etc.)
3. Add Empty objects for attach points
4. Export each part separately as GLB
5. Export the complete assembly as the target model

## Example Structure

```
public/models/
  ├── target.glb (complete assembly)
  ├── part1.glb (base)
  ├── part2.glb (middle section)
  ├── part3.glb (top piece)
  └── README.md (this file)
```
