import { useFrame } from "@react-three/fiber"
import { Center, useGLTF } from "@react-three/drei" // Импортируем загрузчик
import type { FoodItem } from "./FoodManager"

export const Steak = (props: { item: FoodItem }) => {
  const { item } = props

  // const meshRef = useRef<THREE.Group>(null!) // GLTF обычно возвращает Group

  // Загружаем модель. Путь к файлу в папке public
  const { scene } = useGLTF('/models/toon_steak.glb')

  // Клонируем сцену, чтобы каждый Steak имел свою уникальную модель
  // (важно, если стейков много на сцене)
  const clone = scene.clone()

  useFrame((_) => {
    // Вращение
    if (item.ref && item.ref.current) {
        item.ref.current.rotation.z += 0.04
    }
  })

  return (
    <Center ref={item.ref} top position={item.position}>
      <primitive
      position={[0,-0.4,0]}
      
        object={clone}
        scale={0.005}
        // Важно: поворот внутри primitive оставляем статичным, 
        // чтобы "нос" смотрел вперед по оси движения группы
        rotation={[Math.PI/2, Math.PI, 0]}
      />
    </Center>
  )
}

// Предзагрузка модели (ускоряет отображение)
useGLTF.preload('/models/toon_steak.glb')
