
import { Html, useProgress } from "@react-three/drei" // Добавили useProgress

export const Loader = () => {
    const { progress } = useProgress()
    return (
        <Html center>
            <div style={{
                color: 'white',
                background: 'rgba(0,0,0,0.7)',
                padding: '20px',
                borderRadius: '10px',
                fontFamily: 'sans-serif',
                textAlign: 'center',
                minWidth: '150px'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                    Загрузка...
                </div>
                <div style={{ 
                    width: '100%', 
                    height: '10px', 
                    background: '#333', 
                    borderRadius: '5px' 
                }}>
                    <div style={{ 
                        width: `${progress}%`, 
                        height: '100%', 
                        background: '#00ffcc', 
                        borderRadius: '5px',
                        transition: 'width 0.2s' 
                    }} />
                </div>
                <div style={{ marginTop: '5px' }}>{Math.round(progress)}%</div>
            </div>
        </Html>
    )
}
