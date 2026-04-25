import { Html } from "@react-three/drei";
import type { FoodItem } from "../food/FoodManager"
import { menuButtonStyle, testButtonStyle } from "./TestSelectionMenu";
import { useEffect, useState } from "react";

export const QuestionLabel = (props: { foodItem: FoodItem, onSelectAnswer: (item: FoodItem) => void }) => {
    const [givenAnswer, setGivenAnswer] = useState<string | null>(null);
    const onSelectAnswer = (answer: string) => {
        setGivenAnswer(answer);
    }
    useEffect(() => {
        if (givenAnswer) {
            const correct = props.foodItem.question.answer.includes(givenAnswer);

            props.foodItem.right = correct;
            setTimeout(() => {
                props.onSelectAnswer(props.foodItem)
            }, 1000)

        }
    }, [givenAnswer])
    return <Html fullscreen calculatePosition={() => [0, 0]} style={{
        pointerEvents: 'auto', position: 'absolute', top: 0, left: 0,

        zIndex: 5,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        fontSize: '28px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        background: 'rgba(0,0,0,0.4)',
        padding: '0',
        borderRadius: '15px',
        height: "100vw",
        width: "100vW"
    }}>

        <div style={{ ...menuButtonStyle, width: '80%', textAlign: 'center', flex: '0 0 auto', marginTop:'5px' }}>
            {props.foodItem.question.question}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', flex: '1 1 auto', justifyContent: 'start' }}>
            {props.foodItem.question.variants.map((v) => {
                let color = 'white';
                if (givenAnswer) {
                    const correct = props.foodItem.question.answer.includes(v);
                    color = correct ? 'green' : 'red';
                    if (!correct && v === givenAnswer) {
                        color = 'gray'
                    }
                }
                return <div key={v} style={{ ...testButtonStyle, pointerEvents: 'auto', textAlign: 'center', color, width: "100%", backgroundColor:'gray'}} onClick={() => onSelectAnswer(v)}>{v}</div>
            })}
        </div>

    </Html>


}