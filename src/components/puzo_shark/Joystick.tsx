import { useEffect, useRef } from 'react'
import nipplejs from 'nipplejs'

export type JoystickData = {
  x:number,
  y: number,
  active: boolean
}

export const Joystick = (props: {joystickData:JoystickData}) => {
  const {joystickData} = props;
  const containerRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const manager = nipplejs.create({
      zone: containerRef.current,
      mode: 'static',
      position: { left: '100px', bottom: '80px' },
      color: 'white',
      size: 120
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

  return <div ref={containerRef} style={{ pointerEvents:'auto', overflow:'hidden', position: 'absolute', bottom: 0, right: 0, width: '200px', height: '200px', zIndex: 1000 }} />
}
