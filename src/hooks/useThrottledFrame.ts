import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * A hook that throttles updates to achieve effective frame rate limiting
 * This doesn't limit the actual rendering frame rate but limits how often
 * intensive operations are performed, achieving a similar effect
 * @param targetFPS - Target effective frames per second (default: 25)
 * @returns boolean indicating whether the current frame should process intensive operations
 */
export const useThrottledFrame = (targetFPS: number = 25) => {
  const lastUpdateRef = useRef<number>(0);
  const frameInterval = 1000 / targetFPS; // ms per frame

  const shouldUpdate = (): boolean => {
    const now = performance.now();
    const delta = now - lastUpdateRef.current;
    
    if (delta >= frameInterval) {
      lastUpdateRef.current = now;
      return true;
    }
    return false;
  };

  return { shouldUpdate };
};