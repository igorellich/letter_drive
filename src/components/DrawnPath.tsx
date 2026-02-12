import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Point {
  x: number;
  y: number;
}

interface DrawnPathProps {
  path: Point[];
  pathProgress?: number; // Index of the path element the cube has reached
}

export const DrawnPath = ({ path, pathProgress }: DrawnPathProps) => {
  const { camera } = useThree();

  // Convert screen coordinates to 3D world coordinates and create evenly spaced dots
  const points = useMemo(() => {
    if (!path || path.length < 2) {
      // If we have less than 2 points, just return the world coordinates of the points
      if (!path || path.length === 0) return [];

      // Precompute constants outside the map function for better performance
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Ground plane
      const raycaster = new THREE.Raycaster();

      return path.map(point => {
        // Convert screen coordinates to world coordinates (same as PlayerCube)
        const vector = new THREE.Vector3(
          (point.x / screenWidth) * 2 - 1,
          -((point.y / screenHeight) * 2 - 1),
          0.5
        );
        vector.unproject(camera);

        raycaster.ray.origin.copy(camera.position);
        raycaster.ray.direction.copy(vector.sub(camera.position).normalize());

        const targetWorld = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(plane, targetWorld)) {
          return { x: targetWorld.x, z: targetWorld.z };
        } else {
          // Fallback if intersection fails
          return { x: 0, z: 0 };
        }
      });
    }

    // Precompute constants outside the map function for better performance
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Ground plane
    const raycaster = new THREE.Raycaster();

    // First, convert all path points to world coordinates
    const worldPoints = path.map(point => {
      // Convert screen coordinates to world coordinates (same as PlayerCube)
      const vector = new THREE.Vector3(
        (point.x / screenWidth) * 2 - 1,
        -((point.y / screenHeight) * 2 - 1),
        0.5
      );
      vector.unproject(camera);

      raycaster.ray.origin.copy(camera.position);
      raycaster.ray.direction.copy(vector.sub(camera.position).normalize());

      const targetWorld = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, targetWorld)) {
        return { x: targetWorld.x, z: targetWorld.z };
      } else {
        // Fallback if intersection fails
        return { x: 0, z: 0 };
      }
    });

    // Calculate total path length and cumulative segment lengths
    let totalLength = 0;
    const cumulativeLengths = [0]; // Store cumulative lengths at each point
    
    for (let i = 0; i < worldPoints.length - 1; i++) {
      const dx = worldPoints[i + 1].x - worldPoints[i].x;
      const dz = worldPoints[i + 1].z - worldPoints[i].z;
      const segmentLen = Math.sqrt(dx * dx + dz * dz);
      totalLength += segmentLen;
      cumulativeLengths.push(totalLength);
    }

    // Create evenly spaced points along the entire path with consistent distance
    const SPACING_DISTANCE = 3.0; // Increased distance between dots (in world units) to reduce number of dots
    const totalPoints = totalLength > 0 ? Math.min(Math.floor(totalLength / SPACING_DISTANCE), 100) : 0; // Reduced max points for better performance
    const evenlySpacedPoints = [];

    if (totalLength === 0 || worldPoints.length < 2) return worldPoints; // If no length, return original points

    // Distribute points evenly along the path at fixed intervals
    for (let i = 0; i <= totalPoints; i++) {
      const targetDistance = (i / totalPoints) * totalLength;
      
      // Find which segment contains this target distance
      let segmentIndex = 0;
      while (segmentIndex < cumulativeLengths.length - 1 && cumulativeLengths[segmentIndex + 1] < targetDistance) {
        segmentIndex++;
      }

      if (segmentIndex >= worldPoints.length - 1) {
        // Add the last point if we've reached the end
        if (i === totalPoints) {
          evenlySpacedPoints.push(worldPoints[worldPoints.length - 1]);
        }
        continue;
      }

      // Calculate position within the current segment
      const segmentStart = worldPoints[segmentIndex];
      const segmentEnd = worldPoints[segmentIndex + 1];
      const segmentStartDist = cumulativeLengths[segmentIndex];
      const segmentEndDist = cumulativeLengths[segmentIndex + 1];
      const segmentLength = segmentEndDist - segmentStartDist;
      
      if (segmentLength > 0) {
        const segmentFraction = (targetDistance - segmentStartDist) / segmentLength;
        
        evenlySpacedPoints.push({
          x: segmentStart.x + (segmentEnd.x - segmentStart.x) * segmentFraction,
          z: segmentStart.z + (segmentEnd.z - segmentStart.z) * segmentFraction
        });
      } else {
        // If segment length is zero, just use the start point
        evenlySpacedPoints.push(segmentStart);
      }
    }

    return evenlySpacedPoints;
  }, [path]); // Only depend on path to avoid unnecessary recalculations

  // Map the pathProgress (percentage) to an interpolated point index
  const visibleThreshold = useMemo(() => {
    if (typeof pathProgress === 'number' && pathProgress >= 0 && pathProgress <= 100 && points.length > 0) {
      // Calculate the ratio from the percentage
      const progressRatio = pathProgress / 100;
      // Apply that ratio to the interpolated points
      return Math.floor(progressRatio * points.length);
    }
    return -1;
  }, [pathProgress, points.length]);

  // Create mesh elements for each point in the path, but only for unvisited dots
  const filteredPoints = points.filter((_, index) => index > visibleThreshold);
  
  if (filteredPoints.length === 0) return null;
  
  return (
    <>
      {filteredPoints.map((point, index) => (
        <mesh
          key={`dot-${index}`}
          position={[point.x, 0.5, point.z]}
        >
          <sphereGeometry args={[0.25, 6, 6]} /> {/* Even fewer segments for better performance */}
          <meshStandardMaterial
            color="#00FFFF"
            emissive="#00FFFF"
            emissiveIntensity={0.7}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      ))}
    </>
  );
};