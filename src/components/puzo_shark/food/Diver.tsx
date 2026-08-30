import { useEffect, useMemo, useState } from "react"

import { Html, useAnimations, useGLTF } from "@react-three/drei"
import type { FoodItem } from "./FoodManager"

//@ts-ignore
 import {clone} from 'three/examples/jsm/utils/SkeletonUtils'

// Реплики, которые дайверы время от времени «выкрикивают» над головой.
const SHOUTS = [
  'Помогите!',
  'Спасите!',
  'Ай!',
  'На помощь!',
  'Не ешь меня!',
  'Буль-буль!!',
  'Ой-ой-ой!',
  'Эй, сюда!',
  'Мама!',
  'Помоги!',
  'Отстань!',
  'Фу-у-у!',
  'Я не стейк!',
  'Хищна-а-ая!',
]

// Периодически включает случайную реплику на ~1с, затем пауза (1–4с).
function useShout() {
  const [shout, setShout] = useState<string | null>(null)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout>

    const hide = () => {
      if (!alive) return
      setShout(null)
      timer = setTimeout(show, 1000 + Math.random() * 3200)
    }
    const show = () => {
      if (!alive) return
      setPulse(p => p + 1)
      setShout(SHOUTS[Math.floor(Math.random() * SHOUTS.length)])
      timer = setTimeout(hide, 2300 + Math.random() * 600)
    }

    timer = setTimeout(show, 800 + Math.random() * 2000)
    return () => { alive = false; clearTimeout(timer) }
  }, [])

  return { shout, pulse }
}

export const Diver: React.ComponentType<{ item: FoodItem, onSelectAnswer:(item: FoodItem)=>void }> = (props: { item: FoodItem, onSelectAnswer:(item: FoodItem)=>void }) => {
  const { item } = props
  const { shout, pulse } = useShout()

  const { scene, animations } = useGLTF('/models/diver.glb', '/draco/');
   const steakClone = useMemo(() => clone(scene), [scene])  
    const { actions, names } = useAnimations(animations, steakClone)
  

useEffect(()=>{
    if (names.length > 0) {
      // Запускаем основную анимацию (обычно плавание)
      // timeScale=1: цикл 1.96s идёт в реальном времени, без частых рестартов
      const action = actions[names[0]]
      if (action) {
        action.reset().fadeIn(1.2).play()
        action.timeScale = 1
      }
    }

  },[names])
  
  return (
    <group ref={item.ref} position={item.position}>   
    
       {shout && <Html style={{color:"white"}} position={[0, 0, 0.65]} center zIndexRange={[10, 0]}>
         <span key={pulse} className="diver-shout">{shout}</span>
       </Html>}
          <primitive
            object={steakClone}
            scale={0.21}
            rotation={[Math.PI/2,-Math.PI, 0 ]}
           
          />          
       
    </group>
  )
}

useGLTF.preload('/models/diver.glb', '/draco/')
