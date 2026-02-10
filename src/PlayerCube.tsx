import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

interface Point {
  x: number
  y: number
}

interface PlayerCubeProps {
  path?: Point[]
  onPathComplete?: () => void
  canvas?: HTMLCanvasElement | null
  items?: Item[]
  onPickup?: (id: number) => void
}

interface Item {
  id: number
  x: number
  z: number
}

export const PlayerCube = ({ path = [], onPathComplete, canvas, items = [], onPickup }: PlayerCubeProps) => {
  const rb = useRef<RapierRigidBody>(null)
  const { camera } = useThree()
  const [pathIndex, setPathIndex] = useState(0)
  const [isFollowingPath, setIsFollowingPath] = useState(false)
  
  // Вспомогательные объекты
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) // Плоскость на уровне пола
  const raycaster = new THREE.Raycaster()
  const point = new THREE.Vector3()

  // Detect when path changes
  const prevPathLengthRef = useRef(0)

  // Eraser settings
  const eraserRadius = 25 // Radius of eraser in pixels
  const lastErasedIndexRef = useRef(0)
  const pickedRef = useRef<Set<number>>(new Set())
  const pickupRadius = 1.5 // world units

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

  const eraseAtPoint = (screenX: number, screenY: number) => {
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    // Create circular eraser
    context.clearRect(
      screenX - eraserRadius,
      screenY - eraserRadius,
      eraserRadius * 2,
      eraserRadius * 2
    )
  }

  const eraseAlongLine = (x1: number, y1: number, x2: number, y2: number) => {
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    // Calculate distance and steps
    const distance = Math.hypot(x2 - x1, y2 - y1)
    const steps = Math.ceil(distance / 10) // Erase every 10 pixels along the line
    
    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps
      const x = x1 + (x2 - x1) * t
      const y = y1 + (y2 - y1) * t
      eraseAtPoint(x, y)
    }
  }

  const worldToScreen = (worldPos: THREE.Vector3): { x: number; y: number } | null => {
    const screenPos = worldPos.clone()
    screenPos.project(camera)

    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight

    return { x, y }
  }

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
        const lerpFactor = 0.15
        const newPos = {
          x: THREE.MathUtils.lerp(currentPos.x, targetWorld.x, lerpFactor),
          y: 0.5,
          z: THREE.MathUtils.lerp(currentPos.z, targetWorld.z, lerpFactor)
        }
        rb.current.setNextKinematicTranslation(newPos)

        // Erase along the actual path waypoints
        if (pathIndex > lastErasedIndexRef.current) {
          // Erase from the last erased waypoint to the current one
          const startIdx = lastErasedIndexRef.current
          const endIdx = Math.min(pathIndex, path.length - 1)
          
          for (let i = startIdx; i < endIdx; i++) {
            const p1 = path[i]
            const p2 = path[i + 1]
            eraseAlongLine(p1.x, p1.y, p2.x, p2.y)
          }
          
          lastErasedIndexRef.current = endIdx
        }

        // Pickup detection using helper
        checkPickups(rb.current.translation())
        
        // If close enough, move to next waypoint
        if (distance < 2) {
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
          x: THREE.MathUtils.lerp(currentPos.x, point.x, 0.15),
          y: 0.5,
          z: THREE.MathUtils.lerp(currentPos.z, point.z, 0.15)
        })
        // Check pickups while following pointer
        checkPickups(rb.current.translation())
      }
    }
  })

  return (
    <RigidBody ref={rb} type="kinematicPosition" colliders="cuboid">
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </RigidBody>
  )
}
