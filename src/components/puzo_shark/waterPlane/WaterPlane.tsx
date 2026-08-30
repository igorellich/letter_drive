import { WaterLayer } from './WaterLayer'
import { Bubbles } from './Bubles'

export const WaterPlane = (props:{width: number, height: number}) => {
  const {height, width} = props;
  return <>
    <Bubbles count={1000} />
    {/* Глубокий нижний слой — медленный, тёмный, для параллакс-глубины */}
    <WaterLayer position={[0, 0, -2]} speed={0.2} opacity={0.45} zoom={3.0} height={height} width={width} />
    <WaterLayer position={[0, 0, -1]} speed={0.4} opacity={0.4} zoom={5.0} height={height} width={width} />
    <WaterLayer position={[0, 0, 0]} speed={0.8} opacity={0.5} zoom={10.0} height={height} width={width} />
    {/* Подводная подсветка снизу */}
    <pointLight position={[0, 0, -4]} intensity={2.2} color="#7df9ff" distance={30} decay={1.5} />
  </>
}