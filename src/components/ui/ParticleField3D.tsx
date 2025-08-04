import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointsMaterial } from "three";
import * as THREE from "three";

interface ParticleField3DProps {
  count?: number;
  color?: string;
  size?: number;
  opacity?: number;
  speed?: number;
}

const ParticleField3D: React.FC<ParticleField3DProps> = ({
  count = 1000,
  color = "#ffffff",
  size = 2,
  opacity = 0.6,
  speed = 0.5
}) => {
  const pointsRef = useRef<Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorObj = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Random sphere distribution
      const radius = Math.random() * 25 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Slight color variation
      const colorVariation = 0.3;
      colors[i3] = colorObj.r + (Math.random() - 0.5) * colorVariation;
      colors[i3 + 1] = colorObj.g + (Math.random() - 0.5) * colorVariation;
      colors[i3 + 2] = colorObj.b + (Math.random() - 0.5) * colorVariation;
    }

    return [positions, colors];
  }, [count, color]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const time = clock.elapsedTime * speed;
      pointsRef.current.rotation.x = time * 0.05;
      pointsRef.current.rotation.y = time * 0.1;
      
      // Animate individual particles
      const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const originalY = positionsArray[i3 + 1];
        positionsArray[i3 + 1] = originalY + Math.sin(time + i * 0.01) * 0.1;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        transparent
        opacity={opacity}
        vertexColors
        sizeAttenuation={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleField3D;