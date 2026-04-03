import * as THREE from 'three'

export const WaterMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uDepthColor: { value: new THREE.Color('#005a75') },
    uSurfaceColor: { value: new THREE.Color('#31d7ff') },
    uScale: { value: 6.0 },
    uOpacity: { value: 0.8 },
    uWaveHeight: { value: 0.15 }, // Высота волн
    uRippleDensity: { value: 4.0 } // Плотность ряби
  },
  vertexShader: `
    uniform float uTime;
    uniform float uWaveHeight;
    uniform float uRippleDensity;
    varying vec2 vUv;
    varying float vElevation;
    
    // Функция для мультяшной ряби
    float ripple(vec2 pos, float time) {
      float d = length(pos);
      float ripple1 = sin(d * uRippleDensity - time * 3.0) * 0.5 + 0.5;
      float ripple2 = cos(d * uRippleDensity * 1.5 + time * 2.0) * 0.3;
      return (ripple1 + ripple2) * 0.5;
    }
    
    void main() {
      vUv = uv;
      
      // Создаем несколько слоев ряби для мультяшного эффекта
      vec2 centerPos1 = vec2(0.5, 0.5); // Центр для расходящихся кругов
      vec2 centerPos2 = vec2(0.2, 0.7);
      vec2 centerPos3 = vec2(0.8, 0.3);
      
      // Координаты относительно центров ряби
      vec2 pos1 = position.xy - centerPos1;
      vec2 pos2 = position.xy - centerPos2;
      vec2 pos3 = position.xy - centerPos3;
      
      // Вычисляем рябь от каждого центра
      float ripple1 = ripple(pos1, uTime);
      float ripple2 = ripple(pos2, uTime * 1.3);
      float ripple3 = ripple(pos3, uTime * 0.8);
      
      // Комбинируем рябь
      float combinedRipple = (ripple1 + ripple2 + ripple3) / 3.0;
      
      // Добавляем направленные волны для разнообразия
      float wave1 = sin(position.x * 3.0 + uTime * 2.0) * cos(position.y * 2.0 + uTime * 1.5);
      float wave2 = sin(position.y * 4.0 - uTime * 2.5) * 0.5;
      
      // Смешиваем все эффекты для мультяшной поверхности
      float elevation = (combinedRipple * 0.7 + wave1 * 0.2 + wave2 * 0.1) * uWaveHeight;
      
      // Сохраняем высоту для фрагментного шейдера (для цвета)
      vElevation = elevation;
      
      // Смещаем вершины по Z (или Y в зависимости от ориентации)
      vec3 newPosition = position;
      newPosition.z += elevation;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uDepthColor;
    uniform vec3 uSurfaceColor;
    uniform float uScale;
    uniform float uOpacity;
    varying vec2 vUv;
    varying float vElevation;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), f.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }

    void main() {
      // Смешиваем два слоя шума для динамики
      vec2 uv = vUv * uScale;
      float n1 = noise(uv + vec2(uTime * 0.2, uTime * 0.1));
      float n2 = noise(uv * 1.5 - vec2(uTime * 0.15, -uTime * 0.1));
      
      float finalNoise = (n1 + n2) * 0.5;

      // Используем высоту из вершинного шейдера для цвета
      float heightFactor = (vElevation * 2.0 + 0.5);
      
      // Стилизация цвета с учетом высоты
      float level = floor((finalNoise * heightFactor) * 3.0) / 3.0;
      vec3 color = mix(uDepthColor, uSurfaceColor, level);

      // Мультяшная пена (белые контуры)
      float foamThreshold = 0.65;
      float foam = smoothstep(foamThreshold, foamThreshold + 0.05, finalNoise * heightFactor);
      color = mix(color, vec3(1.0), foam);

      // Добавляем блики на пиках волн
      float highlight = smoothstep(0.5, 0.8, vElevation + 0.3);
      color += vec3(0.8, 0.9, 1.0) * highlight * 0.3;

      gl_FragColor = vec4(color, uOpacity);
    }
  `
}