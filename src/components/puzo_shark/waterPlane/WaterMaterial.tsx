import * as THREE from 'three'
export const WaterMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uDepthColor: { value: new THREE.Color('#007da1') },
    uSurfaceColor: { value: new THREE.Color('#7df9ff') },
    uScale: { value: 8.0 },
    uOpacity: { value: 0.6 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uDepthColor;
    uniform vec3 uSurfaceColor;
    uniform float uScale;
    uniform float uOpacity;
    varying vec2 vUv;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), f.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }

    void main() {
      vec2 uv1 = vUv * uScale + vec2(uTime * 0.5, uTime * 0.3);
      vec2 uv2 = vUv * (uScale * 1.2) - vec2(uTime * 0.4, -uTime * 0.2);
      float n1 = noise(uv1);
      float n2 = noise(uv2);
      float finalNoise = (n1 + n2 * 0.5) / 1.5;
      float wave = pow(finalNoise, 1.5);
      vec3 color = mix(uDepthColor, uSurfaceColor, wave);
      float caustics = smoothstep(0.45, 0.55, n1 * n2);
      color += caustics * 0.4;
      gl_FragColor = vec4(color, uOpacity + caustics * 0.2);
    }
  `
}
