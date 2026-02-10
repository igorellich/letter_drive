import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useItemSpawner } from './useItemSpawner'
import type { ItemSpawnerConfig } from './useItemSpawner'

describe('useItemSpawner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should seed initial items', async () => {
    const { result } = renderHook(() =>
      useItemSpawner({ seedCount: 4, spawnRadius: 80 })
    )

    await waitFor(() => {
      expect(result.current.items.length).toBe(4)
    })
  })

  it('should include origin item in seed', async () => {
    const { result } = renderHook(() => useItemSpawner({ seedCount: 2 }))

    await waitFor(() => {
      const originItem = result.current.items.find(i => i.x === 0 && i.z === 0)
      expect(originItem).toBeDefined()
    })
  })

  it('should spawn new items at intervals', async () => {
    const { result } = renderHook(() =>
      useItemSpawner({ maxItems: 10, spawnInterval: 1000, seedCount: 2 })
    )

    await waitFor(() => {
      expect(result.current.items.length).toBe(2)
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(result.current.items.length).toBe(3)
    })
  })

  it('should not exceed maxItems', async () => {
    const { result } = renderHook(() =>
      useItemSpawner({ maxItems: 3, spawnInterval: 100, seedCount: 3 })
    )

    await waitFor(() => {
      expect(result.current.items.length).toBe(3)
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current.items.length).toBeLessThanOrEqual(3)
  })

  it('should remove item on pickup', async () => {
    const { result } = renderHook(() => useItemSpawner({ seedCount: 2 }))

    await waitFor(() => {
      expect(result.current.items.length).toBe(2)
    })

    const itemToRemove = result.current.items[0]

    act(() => {
      result.current.handlePickup(itemToRemove.id)
    })

    await waitFor(() => {
      expect(result.current.items.length).toBe(1)
      expect(result.current.items.find(i => i.id === itemToRemove.id)).toBeUndefined()
    })
  })

  it('should respect custom config', async () => {
    const config: ItemSpawnerConfig = {
      seedCount: 5,
      spawnRadius: 100,
      maxItems: 20,
    }

    const { result } = renderHook(() => useItemSpawner(config))

    await waitFor(() => {
      expect(result.current.items.length).toBe(5)
      // Check that items are within spawn radius
      result.current.items.forEach(item => {
        const distance = Math.sqrt(item.x ** 2 + item.z ** 2)
        expect(distance).toBeLessThanOrEqual(100)
      })
    })
  })
})
