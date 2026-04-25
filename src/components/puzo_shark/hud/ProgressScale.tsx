export type AnswerResult = 'correct' | 'wrong' | 'pending';
export interface ProgressScaleProps {
    currentIndex: number
    results: AnswerResult[]
}
export const ProgressScale = ({ currentIndex, results }: ProgressScaleProps) => {
    return <div style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column-reverse', // Чтобы 1-й вопрос был снизу или сверху (по вкусу)
        gap: '10px',
        background: 'rgba(0,0,0,0.4)',
        padding: '15px 10px',
        borderRadius: '20px',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255,255,255,0.1)',
        height:'90%'
    }}>
        {results.map((res, i) => (
            <div key={i} style={{
                width: '14px',
                flex:1,
                borderRadius: '4px',
                border: i === currentIndex ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                backgroundColor:
                    res === 'correct' ? '#4ade80' :
                        res === 'wrong' ? '#f87171' :
                            '#374151',
                transition: 'all 0.3s ease',
                transform: i === currentIndex ? 'scale(1.2)' : 'scale(1)',
                boxShadow: i === currentIndex ? '0 0 10px white' : 'none'
            }} />
        ))}
    </div>
}