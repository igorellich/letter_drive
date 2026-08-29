import type { CSSProperties } from "react"
import { panelCard } from "./kidStyle"

export type AnswerResult = 'correct' | 'wrong' | 'pending';
export interface ProgressScaleProps {
    currentIndex: number
    results: AnswerResult[]
}
export const ProgressScale = ({ currentIndex, results }: ProgressScaleProps) => {
    const container: CSSProperties = {
        ...panelCard,
        position: 'absolute',
        right: 'clamp(8px, 1.5vw, 16px)',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column-reverse', // Чтобы 1-й вопрос был снизу или сверху (по вкусу)
        gap: 'clamp(6px, 1.5vh, 10px)',
        padding: 'clamp(10px, 2.4vh, 16px)',
        borderRadius: 999,
        height: '70%',
        border: '2px solid rgba(0,210,255,0.3)'
    }
    return <div style={container}>
        {results.map((res, i) => {
            const isCurrent = i === currentIndex
            const dot: CSSProperties = {
                width: 'clamp(12px, 3vw, 16px)',
                flex: 1,
                borderRadius: 999,
                border: isCurrent ? '3px solid #00d2ff' : '1px solid rgba(255,255,255,0.2)',
                backgroundColor:
                    res === 'correct' ? '#4ade80' :
                        res === 'wrong' ? '#f87171' :
                            'rgba(255,255,255,0.15)',
                transition: 'all 0.3s ease',
                transform: isCurrent ? 'scale(1.25)' : 'scale(1)',
                boxShadow: isCurrent ? '0 0 12px rgba(0,210,255,0.9)' : (res === 'correct' ? '0 0 8px rgba(74,222,128,0.7)' : (res === 'wrong' ? '0 0 8px rgba(248,113,113,0.7)' : 'none'))
            }
            return <div key={i} style={dot} />
        })}
    </div>
}