import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { DrawingCanvas } from './DrawingCanvas'

describe('DrawingCanvas', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    })
  })

  it('should render canvas and clear button', () => {
    const { container } = render(<DrawingCanvas />)
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
    expect(canvas?.getAttribute('style')).toContain('touchAction: none')
  })

  it('should render clear button with correct styling', () => {
    const { getByRole } = render(<DrawingCanvas />)
    
    const button = getByRole('button')
    expect(button).toBeTruthy()
    expect(button.textContent).toBe('Clear')
  })

  it('should accept onPathUpdate callback', () => {
    const onPathUpdate = (_points: any[]) => {}
    const { container } = render(<DrawingCanvas onPathUpdate={onPathUpdate} />)
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })

  it('should accept onPathComplete callback', () => {
    const onPathComplete = (_points: any[]) => {}
    const { container } = render(<DrawingCanvas onPathComplete={onPathComplete} />)
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })

  it('should set canvas dimensions to window size', () => {
    const { container } = render(<DrawingCanvas />)
    
    const canvas = container.querySelector('canvas') as HTMLCanvasElement
    expect(canvas).toBeTruthy()
    // Canvas elements should have width and height attributes
    expect(canvas.width).toBe(window.innerWidth)
    expect(canvas.height).toBe(window.innerHeight)
  })

  it('should have absolute positioning', () => {
    const { container } = render(<DrawingCanvas />)
    
    const canvas = container.querySelector('canvas')
    const style = canvas?.getAttribute('style') || ''
    expect(style).toContain('position: absolute')
    expect(style).toContain('top: 0')
    expect(style).toContain('left: 0')
    expect(style).toContain('zIndex: 10')
  })

  it('should expose clearDrawing method via ref', () => {
    const ref = { current: null }
    render(<DrawingCanvas ref={ref} />)
    
    expect(ref.current).toBeTruthy()
    expect((ref.current as any).clearDrawing).toBeDefined()
  })

  it('should handle window resize', () => {
    const { rerender } = render(<DrawingCanvas />)
    
    // Change window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2048,
    })
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'))
    
    rerender(<DrawingCanvas />)
  })
})
