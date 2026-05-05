import { useEffect, useRef, useState } from "react"
import { AppStateController } from "../food/AppStateController";

export const TimerScreen = (props: { onTimeEnd?: () => void }) => {
    const [seconds, setSeconds] = useState<number>(AppStateController.getState().diversTimeLeftSec);
    const secondsRef = useRef<number>(1000); //useRef<number>(AppStateController.getState().diversTimeLeftSec);
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

    return <div style={{ textAlign: 'center', color: 'white', fontSize: 20 }}>{seconds > 0 ? seconds : 'Время закончилось!'}</div>
}