import type { CSSProperties } from "react"
import type { AnswerResult } from "./ProgressScale"
import { GRAD_TESTS, panelCard, pill } from "./kidStyle"
import { TEST_TIME_REWARD_GOOD, TEST_TIME_REWARD_PERFECT } from "../food/economy"

export const TestEndScreen = (props:{
    onBack:()=>void,
    results:AnswerResult[]
})=>{
    const {onBack, results} = props
    const right = results.filter(r => r === 'correct').length
    const perfect = right === 10
    const good = right > 7
    const emoji = perfect ? '🏆' : good ? '🎉' : '💪'
    const title = perfect ? 'ОТЛИЧНО!' : good ? 'МОЛОДЕЦ!' : 'ТРЕНИРУЙСЯ!'
    const reward = perfect ? TEST_TIME_REWARD_PERFECT : TEST_TIME_REWARD_GOOD
    const borderColor = good ? '#4ade80' : '#f87171'

    const panel: CSSProperties = {
        ...panelCard,
        borderColor,
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(90vw, 480px)',
        padding: 'clamp(20px, 5.5vh, 40px) clamp(18px, 4.5vw, 40px)',
        textAlign: 'center', color: 'white', pointerEvents: 'auto',
        boxShadow: `0 0 40px rgba(0,0,0,0.6), 0 0 50px ${good ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}`
    }

    return <div style={panel}>
        <div style={{ fontSize: 'clamp(2.4rem, 8vh, 4rem)', marginBottom: '6px' }}>{emoji}</div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 5.5vh, 2.6rem)', margin: 0, marginBottom: '8px', lineHeight: 1.1 }}>{title}</h2>
        <p style={{ fontSize: 'clamp(1.3rem, 4vh, 1.9rem)', color: good ? '#4ade80' : '#f87171', margin: '6px 0', fontWeight: 900 }}>
            Результат: {right} / 10
        </p>
        <p style={{ fontSize: 'clamp(0.95rem, 2.8vh, 1.2rem)', color: 'rgba(255,255,255,0.85)', margin: '4px 0' }}>
            {good ? `🎁 Награда: +${reward} сек дайверов!` : 'Прочитай ещё разку и попробуй снова!'}
        </p>
        <button onClick={onBack} style={{
            ...pill(GRAD_TESTS),
            marginTop: 'clamp(10px, 2.6vh, 18px)',
            padding: 'clamp(12px, 3vh, 16px) clamp(24px, 6vw, 44px)',
            fontSize: 'clamp(1rem, 3.2vh, 1.4rem)',
            borderRadius: 18
        }}>
            📚 К тестам
        </button>
    </div>
}