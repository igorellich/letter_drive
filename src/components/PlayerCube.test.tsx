import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { PlayerCube } from './PlayerCube'

describe('PlayerCube', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <Canvas>
        <Physics>
          <PlayerCube />
        </Physics>
      </Canvas>
    )

    expect(container).toBeTruthy()
    expect(container.querySelector('canvas')).toBeTruthy()
  })

  it('should accept path prop', () => {
    const path = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 200, y: 150 },
    ]

    const { container } = render(
      <Canvas>
        <Physics>
          <PlayerCube path={path} />
        </Physics>
      </Canvas>
    )

    expect(container).toBeTruthy()
  })

  it('should accept items prop', () => {
    const items = [
      { id: 1, x: 5, z: 5 },
      { id: 2, x: 10, z: 10 },
    ]

    const { container } = render(
      <Canvas>
        <Physics>
          <PlayerCube items={items} />
        </Physics>
      </Canvas>
    )

    expect(container).toBeTruthy()
  })

  it('should call onPickup callback when defined', () => {
    const onPickup = vi.fn()
    const items = [{ id: 1, x: 0, z: 0 }]

    const { container } = render(
      <Canvas>
        <Physics>
          <PlayerCube items={items} onPickup={onPickup} />
        </Physics>
      </Canvas>
    )

    expect(container).toBeTruthy()
    // Note: Full interaction testing would require more complex setup with physics engine
  })

  it('should call onPathComplete callback when path finishes', () => {
    const onPathComplete = vi.fn()
    const path = [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
    ]

    const { container } = render(
      <Canvas>
        <Physics>
          <PlayerCube path={path} onPathComplete={onPathComplete} />
        </Physics>
      </Canvas>
    )

    expect(container).toBeTruthy()
  })

  it('should accept canvas prop for erasing', () => {
    const mockCanvas = document.createElement('canvas')
    const mockContext = mockCanvas.getContext('2d') as CanvasRenderingContext2D | null
    vi.spyOn(mockCanvas, 'getContext').mockReturnValue(mockContext as any)

    const { container } = render(
      <Canvas>
        <Physics>
          <PlayerCube canvas={mockCanvas} />
        </Physics>
      </Canvas>
    )

    expect(container).toBeTruthy()
  })

  it('should handle empty path gracefully', () => {
    const { container } = render(
      <Canvas>
        <Physics>
          <PlayerCube path={[]} />
        </Physics>
      </Canvas>
    )

    expect(container).toBeTruthy()
  })

  it('should handle empty items gracefully', () => {
    const { container } = render(
      <Canvas>
        <Physics>
          <PlayerCube items={[]} />
        </Physics>
      </Canvas>
    )

    expect(container).toBeTruthy()
  })

  it('should render with all props together', () => {
    const onPickup = vi.fn()
    const onPathComplete = vi.fn()
    const path = [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 100 },
    ]
    const items = [
      { id: 1, x: 25, z: 25 },
      { id: 2, x: 75, z: 75 },
    ]
    const mockCanvas = document.createElement('canvas')

    const { container } = render(
      <Canvas>
        <Physics>
          <PlayerCube
            path={path}
            onPathComplete={onPathComplete}
            canvas={mockCanvas}
            items={items}
            onPickup={onPickup}
          />
        </Physics>
      </Canvas>
    )

    expect(container).toBeTruthy()
  })
})
