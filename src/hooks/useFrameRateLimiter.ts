import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * A hook that limits the frame rate of the entire scene
 * @param targetFPS - Target frames per second (default: 25)
 */
export const useFrameRateLimiter = (targetFPS: number = 25) => {
  const { invalidate } = useThree();
  const lastFrameTimeRef = useRef<number>(0);
  const frameInterval = 1000 / targetFPS; // ms per frame

  useEffect(() => {
    let animationFrameId: number;
    
    const frameRateLimitedLoop = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastFrameTimeRef.current;
      
      if (deltaTime >= frameInterval) {
        // Enough time has passed, trigger a render
        lastFrameTimeRef.current = currentTime;
        invalidate(); // This will render the scene once
      }
      
      // Continue the loop
      animationFrameId = requestAnimationFrame(frameRateLimitedLoop);
    };
    
    // Start the frame rate limited animation loop
    animationFrameId = requestAnimationFrame(frameRateLimitedLoop);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [invalidate, frameInterval]);
};