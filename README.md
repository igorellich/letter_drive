# Letter Drive

An interactive 3D drawing game built with React, Three.js, and Rapier physics.

## Features

✨ **Draw Paths** - Touch-based path drawing with glowing cyan dots  
🎮 **Cube Following** - Orange cube follows your drawn paths  
✂️ **Line Erasing** - Cube erases the path as it travels  
🟡 **Item Collection** - Yellow spheres spawn randomly; cube picks them up automatically  
📹 **Top-Down View** - Bird's-eye camera perspective  

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173` (or your configured port)

### Building

```bash
npm run build
```

## How to Play

1. **Draw**: Touch/click on the screen to draw a path with glowing dots
2. **Watch**: The orange cube automatically follows your path
3. **Erase**: The drawn line disappears as the cube passes over it
4. **Collect**: The cube picks up yellow items that spawn on the plane
5. **Repeat**: Draw new paths to guide the cube to more items

## Project Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Detailed component breakdown
- Data flow diagrams
- Design rationale
- Testing strategy

### File Structure

```
src/
├── App.tsx                    # Main orchestrator
├── PlayerCube.tsx             # 3D cube with path following & pickup
├── DrawingCanvas.tsx          # 2D touch drawing interface
├── components/
│   ├── CameraController.tsx    # Top-down camera management
│   ├── CameraController.test.tsx
│   ├── ItemSpawner.tsx         # Item rendering
│   └── ItemSpawner.test.tsx
└── hooks/
    ├── useItemSpawner.ts       # Spawn & pickup business logic
    └── useItemSpawner.test.ts
```

## Key Components

### `PlayerCube`
- Follows drawn path waypoints via lerp interpolation
- Erases canvas pixels along path segments
- Detects and collects nearby items
- Falls back to mouse/pointer following when idle

### `DrawingCanvas`
- Records touch points as path waypoints
- Renders glowing cyan dots with glow effects
- Paints on top of 3D scene via z-index layering

### `useItemSpawner` Hook
- Manages item spawn timing and limits
- Tracks item positions (x, z coordinates only)
- Provides pickup removal callback
- Configurable spawn rate and max items

### `CameraController`
- Maintains top-down orthographic view
- Positions camera at (0, 80, 0) looking at origin
- Provides `window.__focusItems()` for debugging

### `ItemSpawner`
- Renders spawned items as physics-enabled yellow spheres
- Includes debug markers (red) for visualization
- Origin marker (green) for reference

## Testing

### Run Tests

```bash
npm run test
```

### Test Coverage

- ✅ Item spawning logic (timing, limits, config)
- ✅ Pickup removal (state management)
- ✅ Component rendering (ItemSpawner, CameraController)

## Tech Stack

| Library | Purpose |
|---------|---------|
| React 18 | UI framework |
| Three.js | 3D graphics |
| @react-three/fiber | React renderer for Three.js |
| @react-three/rapier | Physics engine integration |
| Rapier | 3D physics simulation |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Vitest | Unit testing |

## License

MIT
