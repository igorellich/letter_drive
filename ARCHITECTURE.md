# Letter Drive - Game Architecture

A React Three.js game where players draw paths on screen and a cube follows them while erasing the drawn line. Spawned items can be collected.

## Project Structure

```
src/
├── App.tsx                      # Main app component
├── PlayerCube.tsx               # 3D cube component with path following & pickup
├── DrawingCanvas.tsx            # 2D canvas drawing interface
│
├── components/
│   ├── CameraController.tsx      # Top-down camera management
│   ├── ItemSpawner.tsx           # Item rendering system
│   ├── ItemSpawner.test.tsx      # ItemSpawner tests
│   └── CameraController.test.tsx # CameraController tests
│
└── hooks/
    ├── useItemSpawner.ts         # Item spawn/pickup logic hook
    └── useItemSpawner.test.ts    # Hook tests
```

## Key Components

### `App.tsx`
**Main Application Container**

Orchestrates the 3D scene and drawing canvas. Manages global state:
- Drawing path (`path` state)
- Spawned items (via `useItemSpawner` hook)

**Key Props/State:**
- `path`: Point[] - drawn line waypoints
- `items`: Item[] - currently spawned collectibles
- `handlePickup`: callback when cube collects an item

---

### `PlayerCube.tsx`
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

### `DrawingCanvas.tsx`
**2D Canvas Drawing Layer**

Touch-based drawing interface that:
- Records touch points as drawn path
- Renders lines as cyan dots (Pac-Man style)
- Applies glow effects for visual appeal
- Notifies parent via callbacks

**Key Callbacks:**
- `onPathUpdate`: fires as drawing happens
- `onPathComplete`: fires when touch ends

---

### `CameraController` Component
**Top-Down Camera Management**

Manages orthogonal top-down view:
- Default height: 80 units
- Always looks down at origin
- Auto-focuses on item boundaries via `__focusItems()` global function

**Usage:**
```tsx
<CameraController items={items} defaultHeight={80} />
```

---

### `ItemSpawner` Component
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

### `useItemSpawner` Hook
**Item Spawning & Pickup Logic**

Manages spawn timing and item collection. Provides:
- Initial item seeding (guaranteed origin item)
- Periodic spawn interval (default 2s)
- Pickup handling (removes items from state)

**Configuration:**
```typescript
interface ItemSpawnerConfig {
  maxItems?: number       // max concurrent items (default: 12)
  spawnInterval?: number  // spawn rate in ms (default: 2000)
  spawnRadius?: number    // spawn area radius (default: 80)
  seedCount?: number      // initial items to generate (default: 4)
}
```

**Usage:**
```tsx
const { items, handlePickup } = useItemSpawner({
  maxItems: 10,
  spawnInterval: 2000,
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
5. Cube detects nearby items
   ↓
6. Cube calls onPickup → item removed from items array
   ↓
7. ItemSpawner re-renders with updated items
   ↓
8. Loop continues: new items spawn periodically
```

---

## Testing

### Unit Tests

**useItemSpawner Hook Tests** (`hooks/useItemSpawner.test.ts`)
- Seeding behavior
- Spawn interval timing
- Max items enforcement
- Pickup removal
- Config respects spawn radius

**ItemSpawner Component Tests** (`components/ItemSpawner.test.tsx`)
- Renders without crashing
- Creates meshes per item
- Handles empty item list

### Running Tests
```bash
npm run test
```

---

## Key Concepts

### Coordinate System
- **X-axis**: left/right (screen horizontal)
- **Z-axis**: forward/back (screen depth)
- **Y-axis**: up/down (height)
- **Camera**: positioned at (0, 80, 0), looking down at origin

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
npm build
```

---

## Architecture Notes

**Component Separation Rationale:**
- **useItemSpawner**: Isolated spawn/pickup logic (testable, reusable)
- **CameraController**: Dedicated camera management (easy to modify view)
- **ItemSpawner**: Rendering only (decoupled from spawn logic)
- **App.tsx**: Orchestration (minimal, clear data flow)

This separation makes the codebase maintainable, testable, and easy to extend.
