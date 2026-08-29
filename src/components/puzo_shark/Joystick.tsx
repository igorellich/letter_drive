import { useEffect, useRef, type CSSProperties } from 'react'
import nipplejs from 'nipplejs'

export type JoystickData = {
  x:number,
  y: number,
  active: boolean
}

const hintRing: CSSProperties = {
  position: 'absolute',
  boxSizing: 'border-box',
  left: '34px', bottom: '14px',
  width: '132px', height: '132px',
  borderRadius: '50%',
  border: '4px dashed rgba(0,210,255,0.45)',
  pointerEvents: 'none'
}

export const Joystick = (props: {joystickData:JoystickData}) => {
  const {joystickData} = props;
  const containerRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const manager = nipplejs.create({
      zone: containerRef.current,
      mode: 'static',
      position: { left: '100px', bottom: '80px' },
      color: '#00d2ff',
      size: 110
    })

    manager.on('move', (_, data) => {
      // data.vector содержит x и y от -1 до 1
      joystickData.x = data.vector.x
      joystickData.y = data.vector.y
      joystickData.active = true
    })

    manager.on('end', () => {
      joystickData.x = 0
      joystickData.y = 0
      joystickData.active = false
    })

    return () => manager.destroy()
  }, [])

  return <div ref={containerRef} style={{ pointerEvents:'auto', overflow:'hidden', position: 'absolute', bottom: 0, right: 0, width: '200px', height: '200px', zIndex: 1000 }}>
    <div style={hintRing} />
  </div>
}