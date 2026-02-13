import React, { useEffect, useRef } from 'react'
import nipplejs from 'nipplejs'

// Создаем внешний объект для хранения данных джойстика
export const joystickData = { x: 0, y: 0, active: false }

export const Joystick = () => {
  const containerRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const manager = nipplejs.create({
      zone: containerRef.current,
      mode: 'static',
      position: { left: '80px', bottom: '80px' },
      color: 'white',
      size: 120
    })

    manager.on('move', (evt, data) => {
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

  return <div ref={containerRef} style={{ position: 'absolute', bottom: 0, left: 0, width: '200px', height: '200px', zIndex: 1000 }} />
}
