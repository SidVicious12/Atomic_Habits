import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

const WatercolorBackground: React.FC = () => {
  const meshRef = useRef<Mesh>(null);

  // Create a custom shader material for watercolor effect
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;

        // Noise function for organic watercolor texture
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for(int i = 0; i < 6; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec2 uv = vUv;
          
          // Create flowing watercolor patterns
          float noise1 = fbm(uv * 3.0 + time * 0.1);
          float noise2 = fbm(uv * 2.0 - time * 0.05);
          float noise3 = fbm(uv * 4.0 + time * 0.08);
          
          // Blue watercolor base
          vec3 color1 = vec3(0.2, 0.4, 0.8); // Deep blue
          vec3 color2 = vec3(0.4, 0.6, 0.9); // Light blue
          vec3 color3 = vec3(0.1, 0.2, 0.6); // Navy blue
          
          // Mix colors based on noise
          vec3 finalColor = mix(color1, color2, noise1);
          finalColor = mix(finalColor, color3, noise2 * 0.5);
          
          // Add some white highlights for watercolor effect
          float highlight = smoothstep(0.7, 1.0, noise3);
          finalColor = mix(finalColor, vec3(0.9, 0.95, 1.0), highlight * 0.3);
          
          // Add transparency for layered effect
          float alpha = 0.6 + noise1 * 0.3;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame(({ clock }) => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <planeGeometry args={[20, 20]} />
      <primitive object={shaderMaterial} />
    </mesh>
  );
};

export default WatercolorBackground;
