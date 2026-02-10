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
 * Configuration for item spawning behavior
 */
export interface ItemSpawnerConfig {
  maxItems?: number
  spawnInterval?: number
  spawnRadius?: number
  seedCount?: number
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
  } = config

  const [items, setItems] = useState<Item[]>([])

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
        const id = Date.now() + i
        const x = (Math.random() - 0.5) * spawnRadius
        const z = (Math.random() - 0.5) * spawnRadius
        seeded.push({ id, x, z })
      }
      console.log('[useItemSpawner] seeded items', seeded)
      return seeded
    })
  }, [seedCount, spawnRadius])

  // Periodically spawn new items
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        if (prev.length >= maxItems) return prev
        const id = Date.now() + Math.floor(Math.random() * 10000)
        const x = (Math.random() - 0.5) * spawnRadius
        const z = (Math.random() - 0.5) * spawnRadius
        const next = [...prev, { id, x, z }]
        console.log('[useItemSpawner] spawned item', next[next.length - 1])
        return next
      })
    }, spawnInterval)

    return () => clearInterval(interval)
  }, [maxItems, spawnInterval, spawnRadius])

  /**
   * Remove a picked-up item by ID
   */
  const handlePickup = (id: number) => {
    console.log('[useItemSpawner] picked up', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return { items, handlePickup }
}
