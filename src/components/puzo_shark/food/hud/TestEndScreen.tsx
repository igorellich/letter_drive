import type { AnswerResult } from "./ProgressScale"

export const TestEndScreen = (props:{
    onBack:()=>void,
    results:AnswerResult[]
})=>{
    const {onBack, results} = props
    return  <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(0,0,0,0.95)',
                            padding: '40px',
                            borderRadius: '30px',
                            textAlign: 'center',
                            color: 'white',
                            border: '4px solid #4ade80',
                            pointerEvents: 'auto',
                            boxShadow: '0 0 30px rgba(0,0,0,0.5)'
                        }}>
                            <h2 style={{ fontSize: '36px', marginBottom: '10px' }}>ИТОГ</h2>
                            <p style={{ fontSize: '28px', color: '#4ade80', marginBottom: '30px' }}>
                                Результат: {results.filter(r => r === 'correct').length} / 10
                            </p>
                            <button 
                                onClick={onBack}
                                style={{
                                    padding: '15px 40px',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    background: '#4ade80',
                                    border: 'none',
                                    borderRadius: '15px',
                                    cursor: 'pointer'
                                }}
                            >
                                К ВЫБОРУ ТЕСТА
                            </button>
                        </div>
}