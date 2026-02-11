import { useState, useEffect } from 'react'

/**
 * Item interface for spawned collectibles
 */
export interface Item {
  id: number
  x: number
  z: number
}

/**
 * Viewport bounds for constraining item spawning
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
 * Configuration for item spawning behavior
 */
export interface ItemSpawnerConfig {
  maxItems?: number
  spawnInterval?: number
  spawnRadius?: number
  seedCount?: number
  viewportBounds?: ViewportBounds
}

/**
 * Hook to manage item spawning and collection
 * 
 * @param config Configuration options for spawning
 * @returns Items array and pickup handler
 * 
 * @example
 * const { items, handlePickup } = useItemSpawner({ maxItems: 10, spawnInterval: 2000 })
 */
export const useItemSpawner = (config: ItemSpawnerConfig = {}) => {
  const {
    maxItems = 12,
    spawnInterval = 2000,
    spawnRadius = 80,
    seedCount = 4,
    viewportBounds,
  } = config

  const [items, setItems] = useState<Item[]>([])

  // Helper function to spawn items within bounds
  const spawnItemInBounds = (): Item => {
    let x: number, z: number
    
    if (viewportBounds) {
      // Spawn within viewport with some padding
      const padding = 2
      const minX = viewportBounds.minX + padding
      const maxX = viewportBounds.maxX - padding
      const minZ = viewportBounds.minZ + padding
      const maxZ = viewportBounds.maxZ - padding
      
      x = minX + Math.random() * (maxX - minX)
      z = minZ + Math.random() * (maxZ - minZ)
    } else {
      // Spawn within spawn radius (original behavior)
      x = (Math.random() - 0.5) * spawnRadius
      z = (Math.random() - 0.5) * spawnRadius
    }
    
    return {
      id: Date.now() + Math.floor(Math.random() * 10000),
      x,
      z
    }
  }

  // Seed initial items
  useEffect(() => {
    setItems(() => {
      const seeded: Item[] = []
      // guaranteed item at origin
      seeded.push({ id: Date.now(), x: 0, z: 0 })
      // nearby second item
      seeded.push({ id: Date.now() + 1, x: 3, z: -2 })
      // random additional items
      for (let i = 2; i < seedCount; i++) {
        seeded.push(spawnItemInBounds())
      }
      console.log('[useItemSpawner] seeded items', seeded)
      return seeded
    })
  }, [seedCount, spawnRadius, viewportBounds])

  // Periodically spawn new items
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        if (prev.length >= maxItems) return prev
        const next = [...prev, spawnItemInBounds()]
        console.log('[useItemSpawner] spawned item', next[next.length - 1])
        return next
      })
    }, spawnInterval)

    return () => clearInterval(interval)
  }, [maxItems, spawnInterval, spawnRadius, viewportBounds])

  /**
   * Remove a picked-up item by ID
   */
  const handlePickup = (id: number) => {
    console.log('[useItemSpawner] picked up', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return { items, handlePickup }
}
