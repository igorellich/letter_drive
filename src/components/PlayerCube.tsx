import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useThrottledFrame } from '../hooks/useThrottledFrame'

interface Point {
  x: number
  y: number
}

interface Item {
  id: number
  x: number
  z: number
}

interface PlayerCubeProps {
  path?: Point[]
  onPathComplete?: () => void
  canvas?: HTMLCanvasElement | null
  items?: Item[]
  onPickup?: (id: number) => void
}

/**
 * PlayerCube component that follows drawn paths and collects items
 * 
 * The cube follows specified waypoints on a path drawn by the user,
 * erases the drawn line as it travels, and detects collisions with items.
 * When no path is active, it follows the user's pointer position.
 */
export const PlayerCube = ({ path = [], onPathComplete, canvas, items = [], onPickup }: PlayerCubeProps) => {
  const rb = useRef<RapierRigidBody>(null)
  const { camera } = useThree()
  const [pathIndex, setPathIndex] = useState(0)
  const [isFollowingPath, setIsFollowingPath] = useState(false)
  
  // Helper objects for raycasting
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) // Ground plane
  const raycaster = new THREE.Raycaster()
  const point = new THREE.Vector3()

  // Detect when path changes
  const prevPathLengthRef = useRef(0)

  // Eraser settings
  const eraserRadius = 25 // Radius of eraser in pixels
  const lastErasedIndexRef = useRef(0)
  const pickedRef = useRef<Set<number>>(new Set())
  const pickupRadius = 6 // world units (increased for larger scaled objects)

  /**
   * Check if any items are within pickup radius and trigger pickup callback
   */
  const checkPickups = (current: { x: number; y: number; z: number }) => {
    if (!items || !onPickup) return
    for (const item of items) {
      if (pickedRef.current.has(item.id)) continue
      const dx = current.x - item.x
      const dz = current.z - item.z
      const d = Math.hypot(dx, dz)
      if (d < pickupRadius) {
        pickedRef.current.add(item.id)
        onPickup(item.id)
      }
    }
  }

  /**
   * Erase canvas at a specific screen point
   */
  const eraseAtPoint = (screenX: number, screenY: number) => {
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    // Create circular eraser - using a more efficient approach
    context.clearRect(
      Math.floor(screenX - eraserRadius),
      Math.floor(screenY - eraserRadius),
      Math.ceil(eraserRadius * 2),
      Math.ceil(eraserRadius * 2)
    )
  }

  /**
   * Erase along a line between two screen points
   */
  const eraseAlongLine = (x1: number, y1: number, x2: number, y2: number) => {
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    // Calculate distance and steps
    const distance = Math.hypot(x2 - x1, y2 - y1)
    const steps = Math.ceil(distance / 10) // Erase every 10 pixels along the line

    // Batch the erasing operations for better performance
    context.save();
    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps
      const x = x1 + (x2 - x1) * t
      const y = y1 + (y2 - y1) * t
      eraseAtPoint(x, y)
    }
    context.restore();
  }

  const { shouldUpdate } = useThrottledFrame(25); // Throttle to ~25 FPS effective rate

  useFrame((state) => {
    if (!rb.current) return

    // Start following when path has points (only on first point)
    if (path.length > 0 && prevPathLengthRef.current === 0) {
      setPathIndex(0)
      setIsFollowingPath(true)
    }
    prevPathLengthRef.current = path.length

    if (isFollowingPath && path.length > 0 && pathIndex < path.length) {
      // Following the drawn path
      const targetPoint = path[pathIndex]

      // Convert screen coordinates to world coordinates
      const vector = new THREE.Vector3(
        (targetPoint.x / window.innerWidth) * 2 - 1,
        -((targetPoint.y / window.innerHeight) * 2 - 1),
        0.5
      )
      vector.unproject(camera)

      raycaster.ray.origin.copy(camera.position)
      raycaster.ray.direction.copy(vector.sub(camera.position).normalize())

      const targetWorld = new THREE.Vector3()
      if (raycaster.ray.intersectPlane(plane, targetWorld)) {
        const currentPos = rb.current.translation()
        const currentVector = new THREE.Vector3(currentPos.x, 0.5, currentPos.z)
        const distance = currentVector.distanceTo(targetWorld)

        // Move towards the waypoint
        const lerpFactor = 0.3 // Increased from 0.15 to make movement faster
        const newPos = {
          x: THREE.MathUtils.lerp(currentPos.x, targetWorld.x, lerpFactor),
          y: 0.5,
          z: THREE.MathUtils.lerp(currentPos.z, targetWorld.z, lerpFactor)
        }
        rb.current.setNextKinematicTranslation(newPos)

        // Only perform erasing at throttled intervals to improve performance
        if (shouldUpdate()) {
          // Erase along the actual path waypoints - optimize by batching erasures
          if (pathIndex > lastErasedIndexRef.current) {
            // Erase from the last erased waypoint to the current one
            const startIdx = lastErasedIndexRef.current
            const endIdx = Math.min(pathIndex, path.length - 1)

            // Batch the erasing operations for better performance
            if (canvas) {
              const context = canvas.getContext('2d');
              if (context) {
                context.save(); // Save context state before batch operations
                
                for (let i = startIdx; i < endIdx; i++) {
                  const p1 = path[i]
                  const p2 = path[i + 1]
                  eraseAlongLine(p1.x, p1.y, p2.x, p2.y)
                }
                
                context.restore(); // Restore context state after batch operations
              }
            }

            lastErasedIndexRef.current = endIdx
          }
        }

        // Pickup detection using helper
        checkPickups(rb.current.translation())

        // If close enough, move to next waypoint
        if (distance < 3) { // Increased from 2 to make transitions faster
          const nextIndex = pathIndex + 1
          if (nextIndex < path.length) {
            setPathIndex(nextIndex)
          } else {
            // Path complete
            setIsFollowingPath(false)
            setPathIndex(0)
            prevPathLengthRef.current = 0
            lastErasedIndexRef.current = 0
            if (onPathComplete) {
              onPathComplete()
            }
          }
        }
      }
    } else if (!isFollowingPath) {
      // Default behavior: follow mouse/pointer
      raycaster.setFromCamera(state.pointer, state.camera)

      if (raycaster.ray.intersectPlane(plane, point)) {
        const currentPos = rb.current.translation()

        rb.current.setNextKinematicTranslation({
          x: THREE.MathUtils.lerp(currentPos.x, point.x, 0.3), // Increased from 0.15
          y: 0.5,
          z: THREE.MathUtils.lerp(currentPos.z, point.z, 0.3)  // Increased from 0.15
        })
        // Check pickups while following pointer
        checkPickups(rb.current.translation())
      }
    }
  })

  return (
    <RigidBody ref={rb} type="kinematicPosition" colliders="cuboid">
      <group scale={[4, 4, 4]}>
        {/* Car body */}
        <mesh castShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[0.8, 0.5, 1.2]} />
          <meshStandardMaterial color="#c41e3a" roughness={0.6} metalness={0.3} />
        </mesh>
        
        {/* Car roof/cabin */}
        <mesh castShadow position={[0, 0.65, -0.1]}>
          <boxGeometry args={[0.6, 0.35, 0.6]} />
          <meshStandardMaterial color="#b01830" roughness={0.6} metalness={0.3} />
        </mesh>
        
        {/* Front windshield */}
        <mesh castShadow position={[0, 0.6, -0.5]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshStandardMaterial color="#87ceeb" roughness={0.2} metalness={0.8} />
        </mesh>
        
        {/* Left wheel */}
        <mesh castShadow position={[-0.5, 0.15, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
        </mesh>
        
        {/* Right wheel */}
        <mesh castShadow position={[0.5, 0.15, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
        </mesh>
        
        {/* Back left wheel */}
        <mesh castShadow position={[-0.5, 0.15, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
        </mesh>
        
        {/* Back right wheel */}
        <mesh castShadow position={[0.5, 0.15, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
        </mesh>
      </group>
    </RigidBody>
  )
}
