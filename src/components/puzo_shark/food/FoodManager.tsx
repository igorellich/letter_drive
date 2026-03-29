import React from 'react'
import * as THREE from 'three'

import { useCollision } from './useCollision'


export interface FoodItem {
  id: string
  position: THREE.Vector3
  // Добавляем ref, чтобы коллизии видели реальное положение меша, а не стейт
  ref?: React.RefObject<THREE.Group>
  eaten?: boolean
  label?: string

  right:boolean
}

interface FoodManagerProps {
  foodItems: FoodItem[]
  sharkRef: React.RefObject<THREE.Mesh>
  handleEat: (id: string) => void
  // Компонент, который будет отрисован для каждой еды
  FoodComponent: React.ComponentType<{ item: FoodItem }>
}


export const FoodManager = ({
  foodItems,
  sharkRef,
  handleEat,
  FoodComponent
}: FoodManagerProps) => {


  // Логика коллизий (использует ref-ы объектов для точности)
  useCollision(sharkRef, foodItems, handleEat, 0.6)

  return (
    <>
      {foodItems.map(item => (
        <FoodComponent key={item.id} item={item} />
      ))}
    </>
  )
}
