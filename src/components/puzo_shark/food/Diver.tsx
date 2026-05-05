import { act, useEffect, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Center, Environment, Html, useAnimations, useGLTF } from "@react-three/drei"
import type { FoodItem } from "./FoodManager"
import * as THREE from 'three'
//@ts-ignore
 import {clone} from 'three/examples/jsm/utils/SkeletonUtils'
export const Diver: React.ComponentType<{ item: FoodItem, onSelectAnswer:(item: FoodItem)=>void }> = (props: { item: FoodItem, onSelectAnswer:(item: FoodItem)=>void }) => {
  const { item } = props
  
  const { scene, animations } = useGLTF('/models/diver.glb', '/draco/');
   const steakClone = useMemo(() => clone(scene), [scene])  
    const { actions, names } = useAnimations(animations, steakClone)
  
 
  useEffect(()=>{
    if (names.length > 0) {
         
          // Запускаем основную анимацию (обычно плавание)
          const action = actions[names[0]]
          if(action && action.timeScale){
          action.timeScale = 3;
          action?.reset().fadeIn(2).play()
          }
        }

  },[])
  
  // useFrame(()=>{
  //   setPosition(item.position);
  // })

  return (
    <group ref={item.ref} position={item.position}>   
    
       <Html style={{color:"white"}} position={[0,0,0]}>
   Help!
       </Html>
          <primitive
            object={steakClone}
            scale={0.21}
            rotation={[-Math.PI/5,0, 0 ]}
           
          />          
       
    </group>
  )
}

useGLTF.preload('/models/diver.glb', '/draco/')

