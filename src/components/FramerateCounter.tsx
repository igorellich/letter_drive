import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Html } from '@react-three/drei'

export const FramerateCounter = ({ limit = 25 }) => {
  const fpsTextRef = useRef<HTMLDivElement>(null)
  const stats = useRef({
    frameCount: 0,
    lastTime: performance.now(),
    lastFrameTime: 0,
  })

  useFrame((state) => {
    const now = performance.now()
    const delta = now - stats.current.lastFrameTime
    const interval = 1000 / limit

    // Ограничение частоты кадров
    if (delta < interval) return 
    
    stats.current.lastFrameTime = now - (delta % interval)
    stats.current.frameCount++

    // Обновление счетчика раз в секунду
    if (now - stats.current.lastTime >= 1000) {
      if (fpsTextRef.current) {
        fpsTextRef.current.innerText = `FPS: ${stats.current.frameCount}`
      }
      stats.current.frameCount = 0
      stats.current.lastTime = now
    }
  })

  return (
    <Html
      calculatePosition={() => [0, 0, 0]} // Фиксируем в пространстве экрана
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        pointerEvents: 'none', // Чтобы клики проходили сквозь текст
        userSelect: 'none',
      }}
    >
      <div
      className='frameCounter'
        ref={fpsTextRef}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: '#00ff00',
          padding: '4px 8px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'nowrap'
        }}
      >
        FPS: 0
      </div>
    </Html>
  )
}
