import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, BufferGeometry, Group } from "three";
import * as THREE from "three";

interface HabitCrystal3DProps {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  glowIntensity?: number;
  quality?: 'high' | 'medium' | 'low';
}

const HabitCrystal3D: React.FC<HabitCrystal3DProps> = ({ 
  position = [0, 0, 0], 
  scale = 1, 
  color = "#4F46E5",
  glowIntensity = 0.5,
  quality = 'high'
}) => {
  const groupRef = useRef<Group>(null);
  const crystalRef = useRef<Mesh>(null);
  const innerCoreRef = useRef<Mesh>(null);
  const orbitingParticlesRef = useRef<Group>(null);

  // Create main crystal geometry - irregular icosahedron
  const crystalGeometry = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Add some irregularity to make it more organic
    for (let i = 0; i < positions.length; i += 3) {
      const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      vertex.normalize();
      const noise = (Math.random() - 0.5) * 0.1;
      vertex.multiplyScalar(1 + noise);
      positions[i] = vertex.x;
      positions[i + 1] = vertex.y;
      positions[i + 2] = vertex.z;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  // Create orbiting particles - adjust count based on quality
  const particlePositions = useMemo(() => {
    const particleCount = quality === 'high' ? 20 : quality === 'medium' ? 12 : 6;
    const positions = [];
    for (let i = 0; i < particleCount; i++) {
      const radius = 2 + Math.random() * 1;
      const theta = (i / particleCount) * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      positions.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        speed: 0.5 + Math.random() * 0.5,
        size: 0.02 + Math.random() * 0.03
      });
    }
    return positions;
  }, [quality]);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    
    // Rotate main crystal slowly
    if (crystalRef.current) {
      crystalRef.current.rotation.x = time * 0.2;
      crystalRef.current.rotation.y = time * 0.3;
      crystalRef.current.rotation.z = time * 0.1;
    }

    // Rotate inner core opposite direction
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.x = -time * 0.3;
      innerCoreRef.current.rotation.y = -time * 0.2;
      innerCoreRef.current.rotation.z = -time * 0.15;
    }

    // Animate orbiting particles
    if (orbitingParticlesRef.current) {
      orbitingParticlesRef.current.children.forEach((particle, index) => {
        const particleData = particlePositions[index];
        const angle = time * particleData.speed + index;
        particle.position.x = Math.cos(angle) * 2.5 + Math.sin(time + index) * 0.5;
        particle.position.y = Math.sin(angle) * 2.5 + Math.cos(time + index) * 0.3;
        particle.position.z = Math.sin(angle * 0.5) * 1.5;
      });
    }

    // Pulse the whole group
    if (groupRef.current) {
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      groupRef.current.scale.setScalar(scale * pulse);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main crystal */}
      <mesh ref={crystalRef} geometry={crystalGeometry}>
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.1}
          transmission={0.9}
          thickness={0.5}
          ior={1.5}
          chromaticAberration={0.02}
          envMapIntensity={1}
        />
      </mesh>

      {/* Inner glowing core */}
      <mesh ref={innerCoreRef} scale={0.3}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          emissive={color}
          emissiveIntensity={glowIntensity}
        />
      </mesh>

      {/* Orbiting particles - simplified geometry for lower quality */}
      <group ref={orbitingParticlesRef}>
        {particlePositions.map((_, index) => (
          <mesh key={index}>
            <sphereGeometry args={[0.02, quality === 'low' ? 4 : 8, quality === 'low' ? 4 : 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.6}
              emissive={color}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* Outer glow effect - disabled on low quality */}
      {quality !== 'low' && (
        <mesh scale={1.2}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
      )}

      {/* Point light for illumination */}
      <pointLight
        color={color}
        intensity={glowIntensity * 2}
        distance={10}
        decay={2}
      />
    </group>
  );
};

export default HabitCrystal3D;