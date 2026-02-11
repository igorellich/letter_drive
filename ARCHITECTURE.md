# Letter Drive - Game Architecture

A React Three.js game where players draw paths on screen and a cube follows them while erasing the drawn line. Spawned items can be collected.

## Project Structure

```
src/
├── App.tsx                      # Main app component
│
├── components/
│   ├── CameraController.tsx      # Top-down camera management
│   ├── CameraController.test.tsx # CameraController tests
│   ├── ItemSpawner.tsx           # Item rendering system
│   ├── ItemSpawner.test.tsx      # ItemSpawner tests
│   ├── PlayerCube.tsx            # 3D cube component with path following & pickup
│   ├── PlayerCube.test.tsx       # PlayerCube tests
│   ├── DrawingCanvas.tsx         # 2D canvas drawing interface
│   └── DrawingCanvas.test.tsx    # DrawingCanvas tests
│
└── hooks/
    ├── useItemSpawner.ts         # Item spawn/pickup logic hook
    └── useItemSpawner.test.ts    # Hook tests
```

## Component Organization

All reusable UI components are consolidated in the `components/` folder:

- **DrawingCanvas**: 2D touch drawing layer
- **PlayerCube**: Interactive 3D cube for game logic
- **ItemSpawner**: Item rendering and visualization
- **CameraController**: Camera management and viewport control

This unified structure improves code organization and makes component dependencies clearer.

---

## Key Components

### `App.tsx`
**Main Application Container**

Orchestrates the 3D scene and drawing canvas. Manages global state:
- Drawing path (`path` state)
- Spawned items (via `useItemSpawner` hook)
- Viewport bounds (from camera controller)

**Key Props/State:**
- `path`: Point[] - drawn line waypoints
- `items`: Item[] - currently spawned collectibles
- `viewportBounds`: ViewportBounds - visible camera area
- `handlePickup`: callback when cube collects an item

---

### `components/PlayerCube.tsx`
**3D Cube Component**

Renders the interactive cube that:
1. **Follows drawn paths** - moves through path waypoints
2. **Erases lines** - clears canvas pixels as it passes
3. **Collects items** - detects nearby spawned items and triggers pickup
4. **Default behavior** - follows mouse/pointer when no path is active

**Key Props:**
```typescript
interface PlayerCubeProps {
  path?: Point[]                    // Path waypoints to follow
  onPathComplete?: () => void       // Called when path is finished
  canvas?: HTMLCanvasElement | null // For erasing
  items?: Item[]                    // Spawned items to pickup
  onPickup?: (id: number) => void   // Item pickup callback
}
```

**Pickup Logic:**
- Checks every frame if cube is within `pickupRadius` (1.5 units) of any item
- Tracks picked items to avoid double-pickup via `pickedRef`
- Calls `onPickup(id)` to remove item from state

---

### `components/DrawingCanvas.tsx`
**2D Canvas Drawing Layer**

Touch-based drawing interface that:
- Records touch points as drawn path
- Renders lines as cyan dots (Pac-Man style)
- Applies glow effects for visual appeal
- Notifies parent via callbacks
- Provides clear button to erase drawing

**Key Callbacks:**
- `onPathUpdate`: fires as drawing happens
- `onPathComplete`: fires when touch ends

**Ref Methods:**
- `clearDrawing()`: Programmatically clear canvas content

---

### `components/CameraController.tsx`
**Top-Down Camera Management**

Manages orthogonal top-down view with viewport awareness:
- Default height: 80 units
- Always looks down at origin
- Auto-focuses on item boundaries via `__focusItems()` global function
- Emits viewport bounds for constraining game field

**Key Props:**
```typescript
interface CameraControllerProps {
  items: Item[]                              // Spawned items for focusing
  defaultHeight?: number                     // Camera height (default: 80)
  fov?: number                               // Field of view
  onViewportChange?: (bounds: ViewportBounds) => void  // Viewport change callback
}
```

**Viewport Bounds:**
Calculates visible world space boundaries based on camera position and FOV:
```typescript
interface ViewportBounds {
  minX: number   // Left boundary
  maxX: number   // Right boundary
  minZ: number   // Back boundary
  maxZ: number   // Front boundary
  width: number  // Viewport width in world units
  height: number // Viewport height in world units
}
```

---

### `components/ItemSpawner.tsx`
**Item Visualization**

Renders all spawned items as:
1. **Yellow sphere** (physics-enabled, at y=0.6)
2. **Red debug marker** (visual aid, at y=1.0)
3. **Origin marker** (green, for reference)

**Usage:**
```tsx
<ItemSpawner items={items} />
```

---

### `hooks/useItemSpawner.ts`
**Item Spawning & Pickup Logic**

Manages spawn timing and item collection with viewport awareness. Provides:
- Initial item seeding (guaranteed origin item)
- Periodic spawn interval (default 2s)
- Viewport-constrained spawning (items stay visible)
- Pickup handling (removes items from state)

**Configuration:**
```typescript
interface ItemSpawnerConfig {
  maxItems?: number       // max concurrent items (default: 12)
  spawnInterval?: number  // spawn rate in ms (default: 2000)
  spawnRadius?: number    // spawn area radius (default: 80)
  seedCount?: number      // initial items to generate (default: 4)
  viewportBounds?: ViewportBounds  // Constrain spawning to viewport
}
```

**Usage:**
```tsx
const { items, handlePickup } = useItemSpawner({
  maxItems: 10,
  spawnInterval: 2000,
  viewportBounds: bounds,
})
```

---

## Game Flow

```
1. User draws on canvas (2D touch input)
   ↓
2. DrawingCanvas converts to path waypoints and calls onPathComplete
   ↓
3. App.tsx receives path, updates state
   ↓
4. PlayerCube begins following path, erasing lines
   ↓
5. Cube detects nearby items within viewport bounds
   ↓
6. Cube calls onPickup → item removed from items array
   ↓
7. ItemSpawner re-renders with updated items
   ↓
8. Loop continues: new items spawn periodically within viewport
```

---

## Testing

### Unit Tests

**useItemSpawner Hook Tests** (`hooks/useItemSpawner.test.ts`)
- Seeding behavior
- Spawn interval timing
- Max items enforcement
- Pickup removal
- Viewport-aware spawning

**ItemSpawner Component Tests** (`components/ItemSpawner.test.tsx`)
- Renders without crashing
- Creates meshes per item
- Handles empty item list

**CameraController Component Tests** (`components/CameraController.tsx`)
- Viewport bounds calculation
- Camera positioning
- Item focus functionality

**PlayerCube Component Tests** (`components/PlayerCube.test.tsx`)
- Path following initialization
- Item pickup detection
- Canvas erasing with provided canvas
- State management during path completion
- Empty path/items handling
- Pointer following (default behavior)

**DrawingCanvas Component Tests** (`components/DrawingCanvas.test.tsx`)
- Canvas rendering and sizing
- Touch event handling
- Clear button functionality
- Ref exposure for parent control
- Window resize handling
- Drawing state management

### Running Tests
```bash
npm run test      # Run all tests
npm run test:ui   # Run tests with UI
npm run test:coverage  # Generate coverage report
```

---

## Key Concepts

### Coordinate System
- **X-axis**: left/right (screen horizontal)
- **Z-axis**: forward/back (screen depth)
- **Y-axis**: up/down (height)
- **Camera**: positioned at (0, 80, 0), looking down at origin

### Viewport Constraints
- Game field is limited to visible camera area
- Items spawn only within viewport bounds (with padding)
- Plane size adjusts dynamically based on viewport
- Ensures all gameplay stays within player's view

### Item Pickup
- Cube proximity check: `distance(cube, item) < 1.5`, runs each frame
- Items tracked in Set to prevent duplicate pickups
- Successfully picked items removed from state

### Path Following
- Cube linearly interpolates between path waypoints
- Erases canvas pixels along waypoint segments
- Continues to next waypoint when within 2 units of current

### Line Erasing
- Uses canvas `clearRect()` with circular eraser
- Erases along full path segments (not just cube position)
- Prevents leaving visual artifacts

---

## Future Enhancements

- [ ] Pickup animations (cube absorbs item)
- [ ] Score/UI display
- [ ] Different item types
- [ ] Obstacles/enemies
- [ ] Multiple lives
- [ ] Level progression
- [ ] Sound effects
- [ ] Mobile-optimized controls

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

---

## Architecture Notes

**Component Separation Rationale:**
- **useItemSpawner**: Isolated spawn/pickup logic (testable, reusable)
- **CameraController**: Dedicated camera management (easy to modify view)
- **ItemSpawner**: Rendering only (decoupled from spawn logic)
- **PlayerCube**: Game object with combined path following & pickup
- **DrawingCanvas**: 2D drawing interface (separate from 3D rendering)
- **App.tsx**: Orchestration (minimal, clear data flow)

**Unified Components Folder:**
- All reusable components in single location for easier navigation
- Co-located tests alongside components for better maintainability
- Clear separation between game logic (hooks) and presentation (components)

This structure makes the codebase maintainable, testable, and easy to extend.

