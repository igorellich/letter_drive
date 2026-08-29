import { Html } from "@react-three/drei";
import type { FoodItem } from "../food/FoodManager"
import { useEffect, useState, type CSSProperties } from "react";
import { ANSWERS_COLORS, GRAD_GOOD, GRAD_RED, panelCard } from "./kidStyle";

const overlayStyle: CSSProperties = {
    pointerEvents: 'auto', position: 'absolute', top: 0, left: 0,
    zIndex: 5,
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 'clamp(8px, 2vh, 16px)',
    background: 'rgba(0, 15, 25, 0.55)',
    padding: 0,
    width: '100vw',
    height: '100vh'
}

const questionCard: CSSProperties = {
    ...panelCard,
    background: 'linear-gradient(180deg, rgba(5,36,58,0.98) 0%, rgba(1,13,22,0.99) 100%)',
    width: 'min(88vw, 560px)',
    padding: 'clamp(14px, 3.6vh, 26px) clamp(18px, 4.5vw, 32px)',
    fontSize: 'clamp(1.25rem, 4.2vh, 1.8rem)',
    fontWeight: 900,
    lineHeight: 1.25,
    textAlign: 'center',
    color: '#ffffff',
    textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.6)'
}

const answerButton = (fill: string, dimmed: boolean): CSSProperties => ({
    width: '100%',
    padding: 'clamp(12px, 2.6vh, 18px)',
    borderRadius: 18,
    border: '2px solid rgba(255,255,255,0.4)',
    background: fill,
    color: 'white',
    fontSize: 'clamp(1.05rem, 3.2vh, 1.5rem)',
    fontWeight: 800,
    boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
    textShadow: '0 2px 4px rgba(0,0,0,0.55)',
    opacity: dimmed ? 0.45 : 1,
    cursor: 'pointer',
    transition: 'transform 0.15s'
})

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
    const answered = givenAnswer !== null
    const isCorrect = answered && props.foodItem.question.answer.includes(givenAnswer!)
    const answerFill = (v: string, i: number): string => {
        if (!answered) return ANSWERS_COLORS[i % ANSWERS_COLORS.length]
        const correct = props.foodItem.question.answer.includes(v)
        if (correct) return GRAD_GOOD
        if (v === givenAnswer) return GRAD_RED
        return 'rgba(255,255,255,0.1)'
    }
    return <Html fullscreen calculatePosition={() => [0, 0]} style={overlayStyle}>

        <div style={questionCard}>
            🤔 {props.foodItem.question.question}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vh, 14px)', alignItems: 'center', width: 'min(80vw, 520px)' }}>
            {props.foodItem.question.variants.map((v, i) => (
                <div key={v} onClick={() => !answered && onSelectAnswer(v)}
                    style={answerButton(answerFill(v, i), answered && props.foodItem.question.answer.includes(v) === false && v !== givenAnswer)}>
                    {answered && props.foodItem.question.answer.includes(v) ? '✅ ' : ''}{answered && v === givenAnswer && !props.foodItem.question.answer.includes(v) ? '❌ ' : ''}{v}
                </div>
            ))}
            {answered && (
                <div style={{
                    fontSize: 'clamp(1rem, 3.2vh, 1.4rem)', fontWeight: 900,
                    color: isCorrect ? '#4ade80' : '#f87171',
                    textShadow: '0 0 14px rgba(0,0,0,0.8)'
                }}>
                    {isCorrect ? 'Верно! 🎉' : 'Ой! 😢'}
                </div>
            )}
        </div>

    </Html>


}