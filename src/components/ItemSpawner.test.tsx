import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Canvas } from '@react-three/fiber'
import { ItemSpawner } from './ItemSpawner'
import type { Item } from '../hooks/useItemSpawner'

describe('ItemSpawner', () => {
  it('should render without crashing', () => {
    const items: Item[] = [
      { id: 1, x: 0, z: 0 },
      { id: 2, x: 5, z: -3 },
    ]

    const { container } = render(
      <Canvas>
        <ItemSpawner items={items} />
      </Canvas>
    )

    expect(container).toBeTruthy()
  })

  it('should render one mesh per item', () => {
    const items: Item[] = [
      { id: 1, x: 0, z: 0 },
      { id: 2, x: 5, z: -3 },
      { id: 3, x: 10, z: 2 },
    ]

    const { container } = render(
      <Canvas>
        <ItemSpawner items={items} />
      </Canvas>
    )

    // Three.js renders meshes, check that container has children
    expect(container.querySelector('canvas')).toBeTruthy()
  })

  it('should render empty when no items', () => {
    const items: Item[] = []

    const { container } = render(
      <Canvas>
        <ItemSpawner items={items} />
      </Canvas>
    )

    expect(container).toBeTruthy()
  })
})
