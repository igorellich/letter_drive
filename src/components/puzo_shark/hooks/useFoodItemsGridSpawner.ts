import { useCallback, useEffect, useState, type RefObject } from "react";
import * as THREE from 'three'
import type { IQuestion } from "../food/tests/interfaces";
import React from "react";
import type { FoodItem } from "../food/FoodManager";
// Константы сетки
const GRID_X = 38;
const GRID_Y = 18;
const MIN_CELL_DIST = 3;
// Отступ справа (в ячейках сетки), чтобы еда не попадала под прогресс-бар
const RIGHT_MARGIN_CELLS = 2;
export const useFoodItemsGridSpawner = (controlledMeshRef: RefObject<THREE.Mesh>,
    sceneWidth: number,
    sceneHeight: number,
    questions?: IQuestion[]

): [FoodItem[], React.Dispatch<React.SetStateAction<FoodItem[]>>] => {

    
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
    const generateGridPositions = useCallback((count: number): THREE.Vector3[] => {
        const cellW = sceneWidth / GRID_X;
        const cellH = sceneHeight / GRID_Y;
        const occupiedCells: THREE.Vector2[] = [];
        const positions: THREE.Vector3[] = [];

        const sharkGridPos = controlledMeshRef.current
            ? new THREE.Vector2(
                Math.round((controlledMeshRef.current.position.x / cellW) + (GRID_X / 2)),
                Math.round((controlledMeshRef.current.position.y / cellH) + (GRID_Y / 2))
            )
            : new THREE.Vector2(GRID_X / 2, GRID_Y / 2);

        for (let i = 0; i < count; i++) {
            let found = false;
            let attempts = 0;
            while (!found && attempts < 2000) {
                // ОГРАНИЧЕНИЕ: gx генерируется от 1 до GRID_X - RIGHT_MARGIN_CELLS (отступ справа)
                const gx = Math.floor(Math.random() * (GRID_X - 2 - RIGHT_MARGIN_CELLS)) + 1;
                const gy = Math.floor(Math.random() * (GRID_Y - 4)) + 1;

                const currentCell = new THREE.Vector2(gx, gy);
                if (currentCell.distanceTo(sharkGridPos) >= MIN_CELL_DIST &&
                    occupiedCells.every(c => currentCell.distanceTo(c) >= MIN_CELL_DIST)) {
                    occupiedCells.push(currentCell);
                    positions.push(new THREE.Vector3(
                        (gx - GRID_X / 2) * cellW + cellW / 2,
                        (gy - GRID_Y / 2) * cellH + cellH / 2,
                        -0.01
                    ));
                    found = true;
                }
                attempts++;
            }
            if(attempts==2000){
                throw new Error('!!!')
            }
        }
        return positions;
    }, []);

    useEffect(() => {
        if (questions && questions.length > 0) {
            const positions = generateGridPositions(questions.length);
            const newItems: FoodItem[] = [];
            let index = 0;
            for (const question of questions) {
                if (question) {
                    newItems.push({
                        id: `${question.question}`,
                        label: question.question,
                        position: positions[index] || new THREE.Vector3(0, 0, -10),
                        ref: React.createRef() as React.RefObject<THREE.Group>,
                        eaten: false,
                        question
                    })
                }
                index++;
            }
            setFoodItems(newItems);
        }

    }, [questions, generateGridPositions]);
  
    return [foodItems, setFoodItems];
}