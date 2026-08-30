import * as THREE from 'three'

export const WaterMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uDepthColor: { value: new THREE.Color('#00496b') },
    uSurfaceColor: { value: new THREE.Color('#31d7ff') },
    uGlowColor: { value: new THREE.Color('#7df9ff') },
    uScale: { value: 6.0 },
    uOpacity: { value: 0.85 },
    uWaveHeight: { value: 0.18 },
    uRippleDensity: { value: 5.0 }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uWaveHeight;
    uniform float uRippleDensity;
    varying vec2 vUv;
    varying float vElevation;
    varying float vDepthGlow;

    float ripple(vec2 pos, float time) {
      float d = length(pos);
      float ripple1 = sin(d * uRippleDensity - time * 3.0) * 0.5 + 0.5;
      float ripple2 = cos(d * uRippleDensity * 1.5 + time * 2.0) * 0.3;
      return (ripple1 + ripple2) * 0.5;
    }

    void main() {
      vUv = uv;

      vec2 centerPos1 = vec2(0.5, 0.5);
      vec2 centerPos2 = vec2(0.2, 0.7);
      vec2 centerPos3 = vec2(0.8, 0.3);

      vec2 pos1 = position.xy - centerPos1;
      vec2 pos2 = position.xy - centerPos2;
      vec2 pos3 = position.xy - centerPos3;

      float ripple1 = ripple(pos1, uTime);
      float ripple2 = ripple(pos2, uTime * 1.3);
      float ripple3 = ripple(pos3, uTime * 0.8);

      float combinedRipple = (ripple1 + ripple2 + ripple3) / 3.0;

      float wave1 = sin(position.x * 3.0 + uTime * 2.0) * cos(position.y * 2.0 + uTime * 1.5);
      float wave2 = sin(position.y * 4.0 - uTime * 2.5) * 0.5;
      float wave3 = sin((position.x + position.y) * 5.0 + uTime * 3.5) * 0.15;

      float elevation = (combinedRipple * 0.6 + wave1 * 0.2 + wave2 * 0.15 + wave3 * 0.05) * uWaveHeight;

      vElevation = elevation;
      // Свечение на гребнях и впадинах
      vDepthGlow = smoothstep(-0.05, 0.1, elevation);

      vec3 newPosition = position;
      newPosition.z += elevation;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uDepthColor;
    uniform vec3 uSurfaceColor;
    uniform vec3 uGlowColor;
    uniform float uScale;
    uniform float uOpacity;
    varying vec2 vUv;
    varying float vElevation;
    varying float vDepthGlow;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), f.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }

    void main() {
      vec2 uv = vUv * uScale;
      float n1 = noise(uv + vec2(uTime * 0.2, uTime * 0.1));
      float n2 = noise(uv * 1.5 - vec2(uTime * 0.15, -uTime * 0.1));
      float n3 = noise(uv * 0.5 + vec2(-uTime * 0.1, uTime * 0.2));

      float finalNoise = (n1 + n2) * 0.5;
      finalNoise = mix(finalNoise, n3, 0.25);

      float heightFactor = (vElevation * 2.0 + 0.5);

      float level = floor((finalNoise * heightFactor) * 3.0) / 3.0;
      vec3 color = mix(uDepthColor, uSurfaceColor, level);

      // Подводное свечение из глубины
      vec3 glow = uGlowColor * vDepthGlow * 0.35;
      color += glow;

      // Мультяшная пена
      float foamThreshold = 0.62;
      float foam = smoothstep(foamThreshold, foamThreshold + 0.06, finalNoise * heightFactor);
      color = mix(color, vec3(1.0), foam * 0.9);

      // Блики на пиках волн
      float highlight = smoothstep(0.45, 0.8, vElevation + 0.3);
      color += vec3(0.8, 0.95, 1.0) * highlight * 0.4;

      // Мягкая бирюзовая подсветка снизу
      vec3 southernGlow = uGlowColor * smoothstep(0.0, 0.3, vUv.y) * 0.12;
      color += southernGlow;

      gl_FragColor = vec4(color, uOpacity);
    }
  `
}