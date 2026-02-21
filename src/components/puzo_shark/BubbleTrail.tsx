import { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Bubble {
  position: THREE.Vector3
  baseY: number
  size: number
  life: number
  maxLife: number
  speed: number
  spread: number
  wobblePhase: number
}

interface TopDownBubbleTrailProps {
  sharkRef: React.RefObject<THREE.Object3D | null>
  count?: number
  bubbleColor?: string
  bubbleSize?: number
  riseSpeed?: number
  trailWidth?: number
  trailDensity?: number
  maxHeight?: number
}

export function TopDownBubbleTrail({ 
  sharkRef,
  count = 300,
  bubbleColor = '#ffffff',
  bubbleSize = 0.004,
  riseSpeed = 0.05,
  trailWidth = 0.03,
  trailDensity = 0.02,
  maxHeight = 0.01
}: TopDownBubbleTrailProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const bubblesRef = useRef<Bubble[]>([])
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const materialRef = useRef<THREE.PointsMaterial | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Создаем текстуру пузырька
  const bubbleTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.3, 'rgba(200, 230, 255, 0.9)')
    gradient.addColorStop(0.6, 'rgba(150, 200, 255, 0.5)')
    gradient.addColorStop(0.8, 'rgba(100, 150, 255, 0.2)')
    gradient.addColorStop(1, 'rgba(100, 150, 255, 0)')
    
    ctx.clearRect(0, 0, 64, 64)
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(32, 32, 32, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.beginPath()
    ctx.arc(20, 20, 8, 0, Math.PI * 2)
    ctx.fill()
    
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Инициализация геометрии и пузырьков
  useEffect(() => {
    // Создаем геометрию
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    
    // Заполняем начальными позициями (глубоко внизу, чтобы не было видно)
    for (let i = 0; i < count; i++) {
      positions[i*3] = 0
      positions[i*3+1] = -1000  // очень глубоко
      positions[i*3+2] = 0
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    // Важно! Устанавливаем bounding sphere, чтобы избежать ошибок
    geometry.computeBoundingSphere()
    
    geometryRef.current = geometry
    
    // Создаем пузырьки
    const newBubbles: Bubble[] = []
    for (let i = 0; i < count; i++) {
      newBubbles.push({
        position: new THREE.Vector3(0, -1000, 0),
        baseY: -1000,
        size: bubbleSize * (0.5 + Math.random()),
        life: 2.0, // сразу "мертвые" для ресайкла
        maxLife: 0.5 + Math.random(),
        speed: riseSpeed * (0.7 + Math.random() * 0.6),
        spread: (Math.random() - 0.5) * trailWidth,
        wobblePhase: Math.random() * Math.PI * 2
      })
    }
    bubblesRef.current = newBubbles
    
    setIsReady(true)
    
    // Cleanup
    return () => {
      geometry.dispose()
    }
  }, [count, bubbleSize, riseSpeed, trailWidth])

  // Обновление позиций пузырьков
  useFrame((_, delta) => {
    // Проверяем, что все необходимые ссылки существуют
    if (!isReady || !pointsRef.current || !geometryRef.current || !sharkRef.current) {
      return
    }
    
    const geometry = geometryRef.current
    const positionAttribute = geometry.attributes.position
    
    if (!positionAttribute) return
    
    const positions = positionAttribute.array as Float32Array
    const sharkPos = sharkRef.current.position
    
    // Обновляем каждый пузырек
    for (let i = 0; i < bubblesRef.current.length; i++) {
      const bubble = bubblesRef.current[i]
      
      // Увеличиваем возраст
      bubble.life += delta
      
      // Если пузырек "умер" или поднялся слишком высоко
      if (bubble.life > bubble.maxLife || bubble.position.y > sharkPos.y + maxHeight) {
        // С вероятностью trailDensity создаем новый пузырек
        if (Math.random() < trailDensity * delta * 5) {
          // Направление акулы
          const dir = new THREE.Vector3(0, 0, -1)
          if (sharkRef.current.rotation) {
            dir.applyEuler(sharkRef.current.rotation)
          }
          
          // Позиция позади акулы
          const trailOffset = -2.0
          
          bubble.position.set(
            sharkPos.x + dir.x * trailOffset + (Math.random() - 0.05) * trailWidth,
            sharkPos.y + dir.y * trailOffset + (Math.random() - 0.05) * trailWidth,
            sharkPos.z 
          )
          
          bubble.baseY = bubble.position.y
          bubble.life = 0
          bubble.maxLife = 2 + Math.random() * 2
          bubble.speed = riseSpeed * (0.7 + Math.random() * 0.6)
          bubble.size = bubbleSize * (0.5 + Math.random())
          bubble.spread = (Math.random() - 0.5) * trailWidth * 0.5
        }
      } 
      // Проверяем, что пузырек не в "спящем" режиме (не глубоко внизу)
      else if (bubble.position.y > -100) {
        // Живой пузырек - поднимаем и добавляем покачивание
        bubble.position.y += bubble.speed * delta * 3
        
        // Покачивание
        const wobbleX = Math.sin(bubble.life * 3 + bubble.wobblePhase) * 0.1
        const wobbleZ = Math.cos(bubble.life * 2.5 + bubble.wobblePhase) * 0.1
        
        bubble.position.x += wobbleX * delta * 2
        bubble.position.z += wobbleZ * delta * 2
      }
      
      // Записываем позицию в геометрию
      positions[i*3] = bubble.position.x
      positions[i*3+1] = bubble.position.y
      positions[i*3+2] = bubble.position.z
    }
    
    // Обновляем геометрию
    positionAttribute.needsUpdate = true
    
    // Важно! Обновляем bounding sphere после изменения позиций
    geometry.computeBoundingSphere()
  })

  // Если не готовы, не рендерим
  if (!isReady) return null

  return (
    //@ts-ignore
    <points ref={pointsRef} geometry={geometryRef.current}>
      <pointsMaterial
        ref={materialRef}
        color={bubbleColor}
        map={bubbleTexture}
        size={bubbleSize * 2} // Увеличиваем размер для видимости сверху
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  )
}