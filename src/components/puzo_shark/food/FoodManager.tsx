import React, { useCallback, useEffect, useRef, type ReactElement } from 'react'
import * as THREE from 'three'

import { useCollision } from './useCollision'
import { useFoodItemsGridSpawner } from '../hooks/useFoodItemsGridSpawner'
import type { IQuestion } from './tests/interfaces'

// Лишние съедобные «приманки» сверх вопросов раунда: на поле еды больше 10,
// но раунд заканчивается после поедания 10 (числа вопросов).
export const BONUS_FOOD_COUNT = 4
// Передышка в начале раунда: первые секунды можно плавать свободно,
// вопросы/поедание не начинаются (рыбы всё равно далеко из-за сетки спауна).
export const GRACE_MS = 3000

export interface FoodItem {
  id: string
  position: THREE.Vector3
  ref?: React.RefObject<THREE.Group>
  eaten?: boolean
  label: string,
  right?:boolean,
  question: IQuestion | null
}

export type FoodComponentProps = {
  item: FoodItem,
  onSelectAnswer: (item: FoodItem) => void,
  sharkRef: React.RefObject<THREE.Mesh>,
  sceneWidth: number,
  sceneHeight: number
}

interface FoodManagerProps {
  questions?: IQuestion[]
  sharkRef: React.RefObject<THREE.Mesh>
  FoodComponent: React.ComponentType<any>,
  sceneWidth: number,
  sceneHeight: number,
  eatenItem?: FoodItem,
  onSelectAnswer?: (item: FoodItem) => void,
  onEaten?: (item: FoodItem) => void
}


export const useFoodManager = ({
  sharkRef,
  
  FoodComponent,
  questions,
  sceneWidth,
  sceneHeight,
  onSelectAnswer,
  onEaten
}: FoodManagerProps):ReactElement<any>[] => {

  const [foodItems, setFoodItems] = useFoodItemsGridSpawner(sharkRef, sceneWidth, sceneHeight, questions)
  const graceUntilRef = useRef(performance.now() + GRACE_MS)
  // Отслеживаем переход в eaten -> эффект поедания
  useEffect(() => {
    if (!onEaten) return
    const freshly = foodItems.find(i => i.eaten === true && i.right !== true && i.right !== false)
    if (freshly && freshly.ref?.current) {
      onEaten(freshly)
    }
  }, [foodItems])

  const onEat = useCallback((id: string) => {
    if (!questions) return;
    if (performance.now() < graceUntilRef.current) return;
    // Нельзя съесть новую рыбку, пока открыт НЕотвеченный вопрос: иначе
    // наложатся два вопроса разом. Съеденная и УЖЕ отвеченная рыбка (right
    // установлен) не блокирует: её всё равно скоро уберут, и не должно быть
    // «мёртвой зоны» ~1.5 с, когда акула проплывает сквозь рыбок без поедания.
    const canEat = !foodItems.some(i => i.eaten === true && i.right !== true && i.right !== false)
    if (canEat) {
      const eatenItem = foodItems.filter(i => i.id === id)[0];
      if (eatenItem) {
        eatenItem.eaten = true; 
        setFoodItems(prev => prev.map(i => i.id === id ? eatenItem : i));
      }
    }
  }, [foodItems]);
 
  // Логика коллизий (использует ref-ы объектов для точности)
  useCollision(sharkRef, foodItems, onEat, 0.8)
  const onSelectAnswerHandler = (item: FoodItem) => {
    if (onSelectAnswer) {
      onSelectAnswer(item);
    }
    setTimeout(() => {
      setFoodItems(prev => prev.filter(i => i.id !== item.id));
    }, 1500)
  }
  // Съеденные «приманки» (без вопроса) убираем сами: они не дают ответ/прогресс,
  // иначе их eaten-флаг заблокировал бы следующее поедание (canEat).
  useEffect(() => {
    const prizes = foodItems.filter(i => i.eaten === true && !i.question)
    if (prizes.length) {
      const t = setTimeout(() => {
        setFoodItems(prev => prev.filter(i => !(i.eaten === true && !i.question)))
      }, 800)
      return () => clearTimeout(t)
    }
  }, [foodItems])
  return foodItems.map(item => (
        <FoodComponent key={item.id} onSelectAnswer={onSelectAnswerHandler} item={item} sharkRef={sharkRef} sceneWidth={sceneWidth} sceneHeight={sceneHeight} />
      ))
  
}