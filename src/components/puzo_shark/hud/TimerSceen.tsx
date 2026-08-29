import { useEffect, useRef, useState, type CSSProperties } from "react"
import { AppStateController } from "../food/AppStateController";

const clockStyle = (over: boolean): CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: 'clamp(6px, 1.6vh, 10px) clamp(14px, 3.5vw, 24px)',
    borderRadius: 999,
    color: over ? '#f9a8a8' : 'white',
    background: 'rgba(0, 15, 25, 0.6)',
    border: over ? '2px solid rgba(248,113,113,0.7)' : '2px solid rgba(0,210,255,0.5)',
    fontSize: 'clamp(1rem, 3vh, 1.35rem)', fontWeight: 'bold',
    boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
    textShadow: '0 1px 4px rgba(0,0,0,0.6)'
})

const clockWrap: CSSProperties = {
    display: 'flex', justifyContent: 'center', paddingTop: 'clamp(8px, 2vh, 14px)'
}

export const TimerScreen = (props: { onTimeEnd?: () => void }) => {
    const [seconds, setSeconds] = useState<number>(AppStateController.getState().diversTimeLeftSec);
    const secondsRef = useRef<number>(AppStateController.getState().diversTimeLeftSec);
    useEffect(() => {
        const intervalId = setInterval(() => {
            secondsRef.current -= 1;
            setSeconds(secondsRef.current);
        }, 1000)
        return () => clearInterval(intervalId)
    }, [])
    useEffect(()=>{
        if(seconds>=0){
            const state = AppStateController.getState();
            state.diversTimeLeftSec = seconds;
            AppStateController.setState(state);
        }
    }, [seconds])
    useEffect(() => {
        if (seconds <= 0) {

            setTimeout(() => {
                if (props.onTimeEnd) {
                    props.onTimeEnd();
                }
            }, 2000)

        }
    }, [seconds])

    if (seconds <= 0) {
        return <div style={clockWrap}><div style={clockStyle(true)}>🕐 Время вышло!</div></div>
    }
    const fmt = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
    return <div style={clockWrap}><div style={clockStyle(false)}>⏰ {fmt}</div></div>
}