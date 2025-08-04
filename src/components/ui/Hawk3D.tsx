import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, BufferGeometry, Vector3 } from "three";
import * as THREE from "three";

interface Hawk3DProps {
  position?: [number, number, number];
  scale?: number;
}

const Hawk3D: React.FC<Hawk3DProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const hawkRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<Mesh>(null);
  const rightWingRef = useRef<Mesh>(null);

  // Create refined hawk geometry with better proportions
  const hawkGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    
    // More refined hawk body with smoother curves
    const vertices = new Float32Array([
      // Main body (streamlined)
      0, 0.4, 0,      // 0: neck base
      -0.25, 0.2, 0.05, // 1: left chest
      0.25, 0.2, 0.05,  // 2: right chest
      -0.3, -0.1, 0,    // 3: left belly
      0.3, -0.1, 0,     // 4: right belly
      0, -0.6, 0.05,    // 5: tail base
      0, -0.9, 0,       // 6: tail tip
      0, 0.1, -0.25,    // 7: back center
      
      // Head and beak (more proportional)
      0, 0.6, 0.08,     // 8: head base
      -0.12, 0.65, 0.12, // 9: left head
      0.12, 0.65, 0.12,  // 10: right head
      0, 0.8, 0.1,      // 11: head top
      0, 0.85, 0.15,    // 12: beak base
      0, 0.95, 0.18,    // 13: beak tip
    ]);

    const indices = [
      // Body triangles (more refined)
      0, 1, 7,  0, 7, 2,   // neck to back
      1, 3, 7,  7, 3, 5,   // left side
      2, 7, 4,  7, 5, 4,   // right side
      3, 5, 6,  3, 6, 4,   // belly to tail
      4, 6, 5,             // tail
      0, 2, 1,  1, 2, 3,   // front faces
      2, 4, 3,             // chest
      
      // Head triangles (refined)
      0, 8, 9,  0, 9, 1,   // neck to head left
      0, 2, 10, 0, 10, 8,  // neck to head right
      8, 11, 9, 8, 10, 11, // head sides
      9, 11, 12, 10, 12, 11, // head to beak
      9, 12, 13, 10, 13, 12, // beak
    ];

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  // Create more elegant wing geometries
  const wingGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    
    const vertices = new Float32Array([
      // Wing shape (more elegant and bird-like)
      0, 0, 0,          // 0: wing root
      0.8, 0.15, 0.08,  // 1: wing tip (longer)
      0.6, -0.1, 0.05,  // 2: wing trailing edge
      0.3, -0.05, 0.02, // 3: wing middle
      0.45, 0.25, 0.1,  // 4: wing leading edge
      0.2, 0.1, 0.03,   // 5: wing base
    ]);

    const indices = [
      0, 5, 3,  // root section
      5, 4, 1,  // leading edge
      5, 1, 3,  // middle section
      3, 1, 2,  // tip section
      0, 3, 2,  // trailing edge
      0, 2, 5,  // base connection (reversed for proper winding)
    ];

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  // Animation loop
  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    
    if (hawkRef.current) {
      // Gentle floating motion
      hawkRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.1;
      hawkRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
    }
    
    // Wing flapping animation
    if (leftWingRef.current && rightWingRef.current) {
      const wingFlap = Math.sin(time * 4) * 0.3;
      leftWingRef.current.rotation.z = wingFlap;
      rightWingRef.current.rotation.z = -wingFlap;
    }
  });

  return (
    <group ref={hawkRef} position={position} scale={scale}>
      {/* Main body */}
      <mesh geometry={hawkGeometry}>
        <meshPhongMaterial 
          color="#4a3f36" 
          shininess={80} 
          transparent 
          opacity={0.98}
          emissive="#2d1810"
          emissiveIntensity={0.05}
          specular="#8b7355"
        />
      </mesh>
      
      {/* Left wing */}
      <mesh 
        ref={leftWingRef} 
        geometry={wingGeometry} 
        position={[-0.2, 0.1, 0]}
        rotation={[0, 0, 0.2]}
      >
        <meshPhongMaterial 
          color="#3d332a" 
          shininess={40}
          transparent
          opacity={0.92}
          emissive="#1a0f08"
          emissiveIntensity={0.03}
          specular="#6b5742"
        />
      </mesh>
      
      {/* Right wing */}
      <mesh 
        ref={rightWingRef} 
        geometry={wingGeometry} 
        position={[0.2, 0.1, 0]}
        rotation={[0, Math.PI, -0.2]}
      >
        <meshPhongMaterial 
          color="#3d332a" 
          shininess={40}
          transparent
          opacity={0.92}
          emissive="#1a0f08"
          emissiveIntensity={0.03}
          specular="#6b5742"
        />
      </mesh>
      
      {/* Eye details */}
      <mesh position={[-0.08, 0.65, 0.12]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshPhongMaterial 
          color="#d4af37" 
          emissive="#b8860b" 
          emissiveIntensity={0.3}
          shininess={100}
        />
      </mesh>
      
      <mesh position={[0.08, 0.65, 0.12]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshPhongMaterial 
          color="#d4af37" 
          emissive="#b8860b" 
          emissiveIntensity={0.3}
          shininess={100}
        />
      </mesh>
      
      {/* Beak detail */}
      <mesh position={[0, 0.9, 0.17]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshPhongMaterial 
          color="#2c1810" 
          shininess={60}
        />
      </mesh>
    </group>
  );
};

export default Hawk3D;
