import { useEffect, useRef, forwardRef } from 'react'

interface Point {
  x: number
  y: number
}

interface DrawingCanvasProps {
  onPathComplete?: (points: Point[]) => void
  onPathUpdate?: (points: Point[]) => void
}

export const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(
  ({ onPathComplete, onPathUpdate }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawingRef = useRef(false)
    const lastPointRef = useRef<Point | null>(null)
    const contextRef = useRef<CanvasRenderingContext2D | null>(null)
    const pointsRef = useRef<Point[]>([])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Set canvas size to window size
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const context = canvas.getContext('2d')
      if (!context) return

      // Configure drawing settings
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.lineWidth = 6
      context.strokeStyle = '#3a3a3a'

      contextRef.current = context

      // Expose clearCanvas to parent via ref
      if (ref && typeof ref === 'object') {
        (ref as any).current = canvasRef.current
        ;(canvasRef.current as any).clearDrawing = clearCanvas
      }

      // Handle window resize
      const handleResize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      window.addEventListener('resize', handleResize)

      return () => window.removeEventListener('resize', handleResize)
    }, [])

    const drawLineWithGlow = (x1: number, y1: number, x2: number, y2: number) => {
      if (!contextRef.current) return
      const context = contextRef.current

      const dotRadius = 8
      const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
      const dotSpacing = 12
      const dotCount = Math.ceil(distance / dotSpacing)

      for (let i = 0; i <= dotCount; i++) {
        const t = dotCount === 0 ? 0 : i / dotCount
        const x = x1 + (x2 - x1) * t
        const y = y1 + (y2 - y1) * t

        // Draw subtle shadow effect around track
        for (let g = 6; g > 0; g--) {
          context.fillStyle = `rgba(58, 58, 58, ${0.04 * (1 - g / 6)})`
          context.beginPath()
          context.arc(x, y, dotRadius + g * 1.5, 0, Math.PI * 2)
          context.fill()
        }

        // Draw main tire track (dark gray/brown)
        context.fillStyle = '#3a3a3a'
        context.beginPath()
        context.arc(x, y, dotRadius, 0, Math.PI * 2)
        context.fill()

        // Draw inner track detail (slightly lighter)
        context.fillStyle = '#555555'
        context.beginPath()
        context.arc(x, y, dotRadius * 0.6, 0, Math.PI * 2)
        context.fill()
      }
    }

    const startDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
      const touch = e.touches[0]
      const point = {
        x: touch.clientX,
        y: touch.clientY,
      }
      lastPointRef.current = point
      pointsRef.current = [point]
      isDrawingRef.current = true
    }

    const draw = (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || !contextRef.current || !lastPointRef.current) return

      const touch = e.touches[0]
      const currentPoint = {
        x: touch.clientX,
        y: touch.clientY,
      }

      // Only add point if it's at least 5px away from the last point (reduces lag)
      const lastPoint = lastPointRef.current
      const distance = Math.sqrt(
        (currentPoint.x - lastPoint.x) ** 2 + (currentPoint.y - lastPoint.y) ** 2
      )
      if (distance < 5) return

      drawLineWithGlow(lastPoint.x, lastPoint.y, currentPoint.x, currentPoint.y)

      lastPointRef.current = currentPoint
      pointsRef.current.push(currentPoint)
      
      // Update path in real-time
      if (onPathUpdate) {
        onPathUpdate(pointsRef.current)
      }
    }

    const stopDrawing = () => {
      isDrawingRef.current = false
      lastPointRef.current = null
      
      // Notify parent about the completed path
      if (pointsRef.current.length > 1 && onPathComplete) {
        onPathComplete(pointsRef.current)
      }
      pointsRef.current = []
    }

    const clearCanvas = () => {
      if (contextRef.current && canvasRef.current) {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }

    // Expose clearCanvas to parent via ref
    useEffect(() => {
      if (canvasRef.current) {
        (canvasRef.current as any).clearDrawing = clearCanvas
      }
    }, [])

    return (
      <>
        <canvas
          ref={canvasRef}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            touchAction: 'none',
            zIndex: 10,
            WebkitTouchCallout: 'none',
          }}
        />
        <button
          onClick={clearCanvas}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 11,
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Clear
        </button>
      </>
    )
  }
)

DrawingCanvas.displayName = 'DrawingCanvas'
