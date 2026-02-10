import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { Item } from '../hooks/useItemSpawner'

/**
 * Props for CameraController
 */
export interface CameraControllerProps {
  items: Item[]
  defaultHeight?: number
  fov?: number
}

/**
 * Camera controller that manages top-down view orientation
 * 
 * Positions camera directly above the scene looking down, and provides
 * a function to focus on spawned items
 * 
 * @param props Configuration for camera behavior
 * @returns null (side-effects only)
 */
export const CameraController = ({
  items,
  defaultHeight = 80,
  fov = 50,
}: CameraControllerProps) => {
  const { camera } = useThree()

  // Initialize camera to top-down view on mount
  useEffect(() => {
    camera.position.set(0, defaultHeight, 0)
    camera.up.set(0, 0, -1)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera, defaultHeight])

  /**
   * Focus camera on all spawned items
   * Dynamically computes bounding box and positions camera accordingly
   */
  useEffect(() => {
    const focusOnItems = () => {
      if (!items || items.length === 0) return

      let minX = Infinity,
        maxX = -Infinity,
        minZ = Infinity,
        maxZ = -Infinity
      for (const it of items) {
        minX = Math.min(minX, it.x)
        maxX = Math.max(maxX, it.x)
        minZ = Math.min(minZ, it.z)
        maxZ = Math.max(maxZ, it.z)
      }

      const centerX = (minX + maxX) / 2
      const centerZ = (minZ + maxZ) / 2
      const spanX = maxX - minX
      const spanZ = maxZ - minZ
      const span = Math.max(spanX, spanZ, 10)

      // Position camera directly above and centered on items
      camera.position.set(centerX, Math.max(30, span * 1.5), centerZ)
      camera.up.set(0, 0, -1)
      camera.lookAt(centerX, 0, centerZ)
      camera.updateProjectionMatrix()
    }

    // Expose for debugging/manual control
    ;(window as any).__focusItems = focusOnItems
  }, [items, camera])

  return null
}
