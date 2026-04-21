import { WaterLayer } from './WaterLayer'
import { Bubbles } from './Bubles'

export const WaterPlane = (props:{width: number, height: number}) => {
  const {height, width} = props;
  return <>
    <Bubbles count={1000} />
    <WaterLayer position={[0, 0, -1]} speed={0.4} opacity={0.4} zoom={5.0} height={height} width={width} />
    <WaterLayer position={[0, 0, 0]} speed={0.8} opacity={0.5} zoom={10.0} height={height} width={width}/>

  </>
}