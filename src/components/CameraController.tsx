import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { Item } from '../hooks/useItemSpawner'

/**
 * Viewport bounds in world coordinates
 */
export interface ViewportBounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  width: number
  height: number
}

/**
 * Props for CameraController
 */
export interface CameraControllerProps {
  items: Item[]
  defaultHeight?: number
  fov?: number
  onViewportChange?: (bounds: ViewportBounds) => void
}

/**
 * Calculate visible viewport bounds in world space based on camera position and projection
 */
export const calculateViewportBounds = (camera: any, cameraHeight: number): ViewportBounds => {
  const vFOV = camera.fov * Math.PI / 180 // convert vertical FOV to radians
  const height = 2 * Math.tan(vFOV / 2) * cameraHeight // visible height
  const width = height * (camera.aspect || window.innerWidth / window.innerHeight)
  
  const cameraPos = camera.position
  const minX = cameraPos.x - width / 2
  const maxX = cameraPos.x + width / 2
  const minZ = cameraPos.z - height / 2
  const maxZ = cameraPos.z + height / 2
  
  return { minX, maxX, minZ, maxZ, width, height }
}

/**
 * Camera controller that manages top-down view orientation
 * 
 * Positions camera directly above the scene looking down, and provides
 * a function to focus on spawned items. Tracks viewport bounds for constraint.
 * 
 * @param props Configuration for camera behavior
 * @returns null (side-effects only)
 */
export const CameraController = ({
  items,
  defaultHeight = 80,
  onViewportChange,
 }: CameraControllerProps) => {
  const { camera } = useThree()

  // Initialize camera to top-down view on mount
  useEffect(() => {
    camera.position.set(0, defaultHeight, 0)
    camera.up.set(0, 0, -1)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    
    // Calculate and emit initial viewport bounds
    const bounds = calculateViewportBounds(camera, defaultHeight)
    if (onViewportChange) {
      onViewportChange(bounds)
    }
  }, [camera, defaultHeight, onViewportChange])

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
      const newHeight = Math.max(30, span * 1.5)
      camera.position.set(centerX, newHeight, centerZ)
      camera.up.set(0, 0, -1)
      camera.lookAt(centerX, 0, centerZ)
      camera.updateProjectionMatrix()
      
      // Emit updated viewport bounds
      const bounds = calculateViewportBounds(camera, newHeight)
      if (onViewportChange) {
        onViewportChange(bounds)
      }
    }

    // Expose for debugging/manual control
    ;(window as any).__focusItems = focusOnItems
  }, [items, camera, onViewportChange])

  return null
}
