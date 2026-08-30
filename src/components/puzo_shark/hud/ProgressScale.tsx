import type { CSSProperties } from "react"

export type AnswerResult = 'correct' | 'wrong' | 'pending';
export interface ProgressScaleProps {
    currentIndex: number
    results: AnswerResult[]
}

const TOTAL = 10;

export const ProgressScale = ({ currentIndex, results }: ProgressScaleProps) => {
    const container: CSSProperties = {
        position: 'absolute',
        top: 'clamp(8px, 2.5vh, 14px)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'row',
        gap: 'clamp(4px, 1.4vw, 8px)',
        alignItems: 'center',
        padding: 'clamp(6px, 1.6vh, 10px) clamp(10px, 2.4vw, 16px)',
        borderRadius: 999,
        background: 'rgba(0, 20, 35, 0.55)',
        border: '2px solid rgba(0,210,255,0.35)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
        zIndex: 10,
        maxWidth: '92vw',
        flexWrap: 'nowrap',
        overflowX: 'auto'
    }
    // Иконка-«рыбка», которая заполняется в зависимости от результата
    const fish = (res: AnswerResult, isCurrent: boolean): CSSProperties => {
        const filled =
            res === 'correct' ? 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)' :
            res === 'wrong' ? 'linear-gradient(180deg, #f87171 0%, #dc2626 100%)' :
            'rgba(255,255,255,0.18)';
        return {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'clamp(22px, 5.6vw, 30px)',
            height: 'clamp(22px, 5.6vw, 30px)',
            borderRadius: '50%',
            fontSize: 'clamp(12px, 3.4vw, 17px)',
            background: filled,
            border: isCurrent ? '3px solid #00d2ff' : '2px solid rgba(255,255,255,0.35)',
            boxShadow: isCurrent ? '0 0 12px rgba(0,210,255,0.9)' : (res === 'correct' ? '0 0 8px rgba(74,222,128,0.7)' : (res === 'wrong' ? '0 0 8px rgba(248,113,113,0.7)' : 'inset 0 0 6px rgba(0,0,0,0.4)')),
            transform: isCurrent ? 'scale(1.25)' : 'scale(1)',
            transition: 'all 0.3s ease'
        };
    };
    return (
        <div style={container}>
            {results.slice(0, TOTAL).map((res, i) => {
                const isCurrent = i === currentIndex
                return <div key={i} style={fish(res, isCurrent)}>{res === 'pending' && !isCurrent ? '•' : '🐟'}</div>
            })}
        </div>
    )
}
