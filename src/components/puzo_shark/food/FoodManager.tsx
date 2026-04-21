import React, { useCallback } from 'react'
import * as THREE from 'three'

import { useCollision } from './useCollision'
import { useFoodItemsGridSpawner } from '../hooks/useFoodItemsGridSpawner'
import type { IQuestion } from './tests/interfaces'


export interface FoodItem {
  id: string
  position: THREE.Vector3
  // Добавляем ref, чтобы коллизии видели реальное положение меша, а не стейт
  ref?: React.RefObject<THREE.Group>
  eaten?: boolean
  label: string
  right: boolean
}

interface FoodManagerProps {
  question?: IQuestion
  sharkRef: React.RefObject<THREE.Mesh>
  handleEat: (eatenItem: FoodItem) => void
  // Компонент, который будет отрисован для каждой еды
  FoodComponent: React.ComponentType<{ item: FoodItem }>,
  sceneWidth: number,
  sceneHeight: number
}


export const useFoodManager = ({
  sharkRef,
  handleEat,
  FoodComponent,
  question,
  sceneWidth,
  sceneHeight
}: FoodManagerProps) => {

  const [foodItems, setFoodItems] = useFoodItemsGridSpawner(sharkRef, sceneWidth, sceneHeight, question)
  const onEat = useCallback((id: string) => {
    if (!question) return;
    const canEat = foodItems.filter(i => i.eaten === true).length === 0
    if (canEat) {
      const eatenItem = foodItems.filter(i => i.id === id)[0];
      if (eatenItem && eatenItem.label) {
        eatenItem.eaten = true;
        handleEat(eatenItem);

        setFoodItems(prev => prev.map(item => item.id === id ? { ...item, eaten: true } : item));
        setTimeout(() => {
          setFoodItems(prev => prev.map(item => item.id !== id ? { ...item, eaten: true } : item));
        }, 1000);

      }
    }
  }, [foodItems, question, handleEat]);
  // Логика коллизий (использует ref-ы объектов для точности)
  useCollision(sharkRef, foodItems, onEat, 0.6)

  return foodItems.map(item => (
        <FoodComponent key={item.id} item={item} />
      ))
  
}
