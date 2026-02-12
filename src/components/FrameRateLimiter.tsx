import { useFrameRateLimiter } from '../hooks/useFrameRateLimiter';

/**
 * A component that limits the frame rate of the entire scene
 * @param targetFPS - Target frames per second (default: 25)
 */
export const FrameRateLimiter = ({ targetFPS = 25 }: { targetFPS?: number }) => {
  useFrameRateLimiter(targetFPS);
  return null; // This component doesn't render anything
};