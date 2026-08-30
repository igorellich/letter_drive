import { useEffect, useRef, type CSSProperties } from 'react'
import nipplejs from 'nipplejs'

export type JoystickData = {
  x:number,
  y: number,
  active: boolean
}

export const Joystick = (props: {joystickData:JoystickData}) => {
  const {joystickData} = props;
  const containerRef = useRef<HTMLDivElement>(null!)

  // Размер зоны джойстика подстраивается под экран, чтобы стик+кольцо
  // не вылезали за край (телефоны, особенно ландшафт с малой высотой).
  const base = Math.min(window.innerWidth, window.innerHeight)
  const zone = Math.max(120, Math.min(220, Math.round(base * 0.55)))
  const stick = Math.round(zone * 0.55)
  const ring = Math.round(zone * 0.68)
  const center = Math.round(zone / 2)

  const hintRing: CSSProperties = {
    position: 'absolute',
    boxSizing: 'border-box',
    left: center - ring / 2, bottom: center - ring / 2,
    width: ring, height: ring,
    borderRadius: '50%',
    border: '4px dashed rgba(0,210,255,0.45)',
    pointerEvents: 'none'
  }

  useEffect(() => {
    const manager = nipplejs.create({
      zone: containerRef.current,
      mode: 'static',
      position: { left: center + 'px', bottom: center + 'px' },
      color: '#00d2ff',
      size: stick
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} style={{ pointerEvents:'auto', overflow:'hidden', position: 'absolute', bottom: 0, right: 0, width: zone + 'px', height: zone + 'px', zIndex: 1000, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
    <div style={hintRing} />
  </div>
}
