import { useEffect, useRef, useState, type CSSProperties } from 'react'
import nipplejs from 'nipplejs'

export type JoystickData = {
  x:number,
  y: number,
  active: boolean
}

// Размеры джойстика подстраиваются под экран и пересчитываются при изменении
// размера/ориентации, чтобы стик+кольцо гарантированно влезали в видимую область
// (в т.ч. ландшафт с малой высотой и safe-area снизу).
interface Size {
  zone: number;  // сторона зоны (px)
  stick: number; // диаметр стика nipplejs
  ring: number;  // диаметр кольца-подсказки
  center: number;
}

function computeSize(w: number, h: number): Size {
  const safeBottom = 12; // запас под safe-area / скругления
  const avail = Math.max(1, Math.min(w, h - safeBottom));
  // Кольцо занимает до 0.8*zone от угла — берём запас, чтобы не вылезало за край.
  const byRing = Math.round(avail / 0.8);
  const zone = Math.round(Math.max(120, Math.min(220, byRing, avail * 0.55)));
  const stick = Math.round(zone * 0.5);
  const ring = Math.round(zone * 0.62);
  const center = Math.round(zone / 2);
  return { zone, stick, ring, center };
}

export const Joystick = (props: {joystickData:JoystickData}) => {
  const {joystickData} = props;
  const containerRef = useRef<HTMLDivElement>(null!)

  const [size, setSize] = useState<Size>(() => computeSize(window.innerWidth, window.innerHeight));
  const { zone, stick, ring, center } = size;

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
    const onResize = () => setSize(computeSize(window.innerWidth, window.innerHeight));
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [])

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
  }, [center, stick])

  return <div ref={containerRef} style={{ pointerEvents:'auto', overflow:'hidden', position: 'absolute', bottom: 0, right: 0, width: zone + 'px', height: zone + 'px', zIndex: 1000, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
    <div style={hintRing} />
  </div>
}
