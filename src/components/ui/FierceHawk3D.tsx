import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, BufferGeometry } from "three";
import * as THREE from "three";

interface FierceHawk3DProps {
  position?: [number, number, number];
  scale?: number;
}

const FierceHawk3D: React.FC<FierceHawk3DProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const hawkRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<Mesh>(null);
  const rightWingRef = useRef<Mesh>(null);
  const tailRef = useRef<Mesh>(null);

  // Create fierce hawk body geometry
  const hawkBodyGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    
    const vertices = new Float32Array([
      // Head and beak (more aggressive)
      0, 0.8, 0.1,      // 0: beak tip
      -0.08, 0.75, 0.15, // 1: beak left
      0.08, 0.75, 0.15,  // 2: beak right
      -0.15, 0.6, 0.2,   // 3: head left
      0.15, 0.6, 0.2,    // 4: head right
      0, 0.5, 0.25,      // 5: head back
      0, 0.65, 0.05,     // 6: beak base
      
      // Neck and chest (powerful)
      -0.2, 0.3, 0.15,   // 7: neck left
      0.2, 0.3, 0.15,    // 8: neck right
      -0.3, 0.1, 0.1,    // 9: chest left
      0.3, 0.1, 0.1,     // 10: chest right
      0, 0.2, -0.1,      // 11: back
      
      // Body (robust)
      -0.35, -0.2, 0.05, // 12: body left
      0.35, -0.2, 0.05,  // 13: body right
      0, -0.3, -0.15,    // 14: back center
      -0.25, -0.5, 0,    // 15: lower body left
      0.25, -0.5, 0,     // 16: lower body right
      
      // Tail base
      0, -0.7, -0.1,     // 17: tail connection
    ]);

    const indices = [
      // Beak
      0, 1, 6, 0, 6, 2, 1, 2, 6,
      // Head
      1, 3, 5, 2, 5, 4, 3, 4, 5, 1, 5, 3,
      6, 3, 7, 6, 8, 4, 3, 8, 7, 4, 8, 3,
      // Neck to chest
      7, 9, 11, 8, 11, 10, 7, 11, 8, 9, 10, 11,
      // Body
      9, 12, 14, 10, 14, 13, 9, 14, 10, 12, 13, 14,
      12, 15, 17, 13, 17, 16, 12, 17, 13, 15, 16, 17,
      // Connections
      9, 15, 12, 10, 13, 16,
    ];

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  // Create large, spread wing geometry
  const wingGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    
    const vertices = new Float32Array([
      // Wing root and structure
      0, 0, 0,           // 0: wing root
      0.3, 0.1, 0.05,    // 1: inner wing
      0.8, 0.3, 0.1,     // 2: mid wing
      1.4, 0.2, 0.15,    // 3: outer wing
      1.8, -0.1, 0.1,    // 4: wing tip
      
      // Wing trailing edge
      0.2, -0.2, 0,      // 5: inner trailing
      0.6, -0.4, 0.05,   // 6: mid trailing
      1.2, -0.6, 0.1,    // 7: outer trailing
      1.6, -0.8, 0.05,   // 8: tip trailing
      
      // Wing feather details
      0.9, 0.1, 0.2,     // 9: primary feather base
      1.5, -0.3, 0.2,    // 10: primary feather tip
      0.5, -0.1, 0.15,   // 11: secondary feather
    ]);

    const indices = [
      // Main wing surface
      0, 1, 5, 1, 2, 6, 2, 3, 7, 3, 4, 8,
      1, 6, 5, 2, 7, 6, 3, 8, 7, 4, 10, 8,
      // Wing structure
      0, 2, 1, 1, 3, 2, 2, 4, 3,
      5, 6, 11, 6, 7, 11, 7, 8, 10,
      // Feather details
      2, 9, 11, 3, 10, 9, 9, 10, 11,
    ];

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  // Create tail feather geometry
  const tailGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    
    const vertices = new Float32Array([
      // Tail fan shape
      0, 0, 0,           // 0: base center
      -0.3, -0.8, 0.1,   // 1: left tail
      -0.15, -0.9, 0.05, // 2: left-center
      0, -1.0, 0,        // 3: center tail
      0.15, -0.9, 0.05,  // 4: right-center
      0.3, -0.8, 0.1,    // 5: right tail
      -0.2, -0.6, 0.05,  // 6: inner left
      0.2, -0.6, 0.05,   // 7: inner right
    ]);

    const indices = [
      0, 1, 6, 0, 6, 2, 0, 2, 3, 0, 3, 4, 0, 4, 7, 0, 7, 5,
      6, 1, 2, 2, 1, 3, 3, 4, 2, 4, 5, 7, 7, 4, 3,
    ];

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  // Create talon geometry
  const talonGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    
    const vertices = new Float32Array([
      // Sharp curved talons
      0, 0, 0,           // 0: base
      0.05, -0.15, -0.05, // 1: middle
      0.02, -0.25, -0.1,  // 2: tip
      -0.05, -0.15, -0.05, // 3: side
    ]);

    const indices = [
      0, 1, 3, 1, 2, 3, 0, 3, 1, 1, 3, 2,
    ];

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  // Animation with fierce movement
  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    
    if (hawkRef.current) {
      // Powerful soaring motion
      hawkRef.current.position.y = position[1] + Math.sin(time * 0.4) * 0.08;
      hawkRef.current.rotation.z = Math.sin(time * 0.3) * 0.05;
      hawkRef.current.rotation.x = Math.sin(time * 0.2) * 0.03;
    }
    
    // Subtle wing movement (soaring, not flapping)
    if (leftWingRef.current && rightWingRef.current) {
      const wingTilt = Math.sin(time * 0.5) * 0.1;
      leftWingRef.current.rotation.z = wingTilt;
      rightWingRef.current.rotation.z = -wingTilt;
      leftWingRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;
      rightWingRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;
    }
    
    // Tail movement
    if (tailRef.current) {
      tailRef.current.rotation.x = Math.sin(time * 0.6) * 0.08;
    }
  });

  return (
    <group ref={hawkRef} position={position} scale={scale}>
      {/* Main body with enhanced materials */}
      <mesh geometry={hawkBodyGeometry}>
        <meshStandardMaterial 
          color="#1a202c"
          metalness={0.3}
          roughness={0.4}
          emissive="#0f1419"
          emissiveIntensity={0.15}
        />
      </mesh>
      
      {/* Left wing - spread wide with enhanced materials */}
      <mesh 
        ref={leftWingRef} 
        geometry={wingGeometry} 
        position={[-0.3, 0.05, 0]}
        rotation={[0.2, 0, 0.3]}
      >
        <meshStandardMaterial 
          color="#374151"
          metalness={0.1}
          roughness={0.6}
          emissive="#1f2937"
          emissiveIntensity={0.08}
        />
      </mesh>
      
      {/* Right wing - spread wide with enhanced materials */}
      <mesh 
        ref={rightWingRef} 
        geometry={wingGeometry} 
        position={[0.3, 0.05, 0]}
        rotation={[0.2, Math.PI, -0.3]}
      >
        <meshStandardMaterial 
          color="#374151"
          metalness={0.1}
          roughness={0.6}
          emissive="#1f2937"
          emissiveIntensity={0.08}
        />
      </mesh>
      
      {/* Tail feathers with enhanced materials */}
      <mesh 
        ref={tailRef}
        geometry={tailGeometry}
        position={[0, -0.7, -0.1]}
      >
        <meshStandardMaterial 
          color="#374151"
          metalness={0.05}
          roughness={0.7}
          emissive="#1f2937"
          emissiveIntensity={0.05}
        />
      </mesh>
      
      {/* Fierce glowing eyes with enhanced realism */}
      <mesh position={[-0.08, 0.6, 0.2]}>
        <sphereGeometry args={[0.035, 16, 12]} />
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#059669"
          emissiveIntensity={1.2}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>
      
      <mesh position={[0.08, 0.6, 0.2]}>
        <sphereGeometry args={[0.035, 16, 12]} />
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#059669"
          emissiveIntensity={1.2}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>
      
      {/* Eye pupils for more realism */}
      <mesh position={[-0.08, 0.6, 0.22]}>
        <sphereGeometry args={[0.015, 8, 6]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      <mesh position={[0.08, 0.6, 0.22]}>
        <sphereGeometry args={[0.015, 8, 6]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Sharp metallic talons with enhanced realism */}
      <group position={[-0.15, -0.5, 0.1]}>
        <mesh geometry={talonGeometry}>
          <meshStandardMaterial 
            color="#0f0f0f" 
            metalness={0.9}
            roughness={0.2}
            emissive="#1a1a1a"
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh geometry={talonGeometry} position={[0.1, 0, 0]} rotation={[0, 0.3, 0]}>
          <meshStandardMaterial 
            color="#0f0f0f" 
            metalness={0.9}
            roughness={0.2}
            emissive="#1a1a1a"
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh geometry={talonGeometry} position={[-0.1, 0, 0]} rotation={[0, -0.3, 0]}>
          <meshStandardMaterial 
            color="#0f0f0f" 
            metalness={0.9}
            roughness={0.2}
            emissive="#1a1a1a"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>
      
      <group position={[0.15, -0.5, 0.1]}>
        <mesh geometry={talonGeometry}>
          <meshStandardMaterial 
            color="#0f0f0f" 
            metalness={0.9}
            roughness={0.2}
            emissive="#1a1a1a"
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh geometry={talonGeometry} position={[0.1, 0, 0]} rotation={[0, 0.3, 0]}>
          <meshStandardMaterial 
            color="#0f0f0f" 
            metalness={0.9}
            roughness={0.2}
            emissive="#1a1a1a"
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh geometry={talonGeometry} position={[-0.1, 0, 0]} rotation={[0, -0.3, 0]}>
          <meshStandardMaterial 
            color="#0f0f0f" 
            metalness={0.9}
            roughness={0.2}
            emissive="#1a1a1a"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>
      
      {/* Wing tips accent with enhanced detail */}
      <mesh position={[-1.8, 0.1, 0.1]}>
        <sphereGeometry args={[0.025, 12, 8]} />
        <meshStandardMaterial 
          color="#4b5563" 
          metalness={0.2}
          roughness={0.5}
          emissive="#374151"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh position={[1.8, 0.1, 0.1]}>
        <sphereGeometry args={[0.025, 12, 8]} />
        <meshStandardMaterial 
          color="#4b5563" 
          metalness={0.2}
          roughness={0.5}
          emissive="#374151"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Additional feather detail accents */}
      <mesh position={[-1.2, 0.2, 0.05]}>
        <sphereGeometry args={[0.015, 8, 6]} />
        <meshStandardMaterial 
          color="#374151" 
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      <mesh position={[1.2, 0.2, 0.05]}>
        <sphereGeometry args={[0.015, 8, 6]} />
        <meshStandardMaterial 
          color="#374151" 
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
};

export default FierceHawk3D;
