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
  label: string,
  right?:boolean,
  question:IQuestion
}

interface FoodManagerProps {
  questions?: IQuestion[]
  sharkRef: React.RefObject<THREE.Mesh>  
  // Компонент, который будет отрисован для каждой еды
  FoodComponent: React.ComponentType<{ item: FoodItem, onSelectAnswer:(item: FoodItem)=>void }>,
  sceneWidth: number,
  sceneHeight: number,
  eatenItem?:FoodItem,
  onSelectAnswer:(item:FoodItem)=>void,
  sessionIndexes:number[]
}


export const useFoodManager = ({
  sharkRef,
  
  FoodComponent,
  questions,
  sceneWidth,
  sceneHeight,
  onSelectAnswer,
  sessionIndexes
}: FoodManagerProps) => {

  const [foodItems, setFoodItems] = useFoodItemsGridSpawner(sharkRef, sceneWidth, sceneHeight, questions)
  const onEat = useCallback((id: string) => {
    if (!questions) return;
    const canEat = foodItems.filter(i => i.eaten === true).length === 0
    if (canEat) {
      const eatenItem = foodItems.filter(i => i.id === id)[0];
      if (eatenItem && eatenItem.label) {
        eatenItem.eaten = true;        

      }
    }
  }, [foodItems, sessionIndexes]);
 
  // Логика коллизий (использует ref-ы объектов для точности)
  useCollision(sharkRef, foodItems, onEat, 0.6)
  const onSelectAnswerHandler = (item: FoodItem) => {
    onSelectAnswer(item);
    setTimeout(() => {
      setFoodItems(prev => prev.filter(i => i.id !== item.id));
    }, 2500)
  }
  return foodItems.map(item => (
        <FoodComponent key={item.id} onSelectAnswer={onSelectAnswerHandler} item={item} />
      ))
  
}
