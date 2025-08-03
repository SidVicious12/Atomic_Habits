import React, { useRef, Suspense, useEffect } from 'react';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

// This component loads and displays the GLB model with a toon material
const Model = () => {
  const { scene } = useGLTF('/assets/Skull.glb');

  // Apply a new toon material to the skull model to create a cartoon look
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Use MeshToonMaterial for a high-contrast, cel-shaded look
        child.material = new THREE.MeshToonMaterial({
          color: '#ffffff', // A clean white base color
        });
      }
    });
  }, [scene]);

  // Give it a slight default rotation so it doesn't look flat
  return <primitive object={scene} scale={0.05} rotation-y={Math.PI / 8} />;
};

// This is the main component that sets up the 3D scene
const Magnet3D = () => {
  return (
    <Canvas camera={{ position: [0, 0.5, 8], fov: 50 }}>
      {/* A single, strong light to create harsh shadows for the toon effect */}
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <ambientLight intensity={0.7} />

      <Suspense fallback={null}>
        <Model />
      </Suspense>

      {/* Add orbit controls to make the model interactive */}
      <OrbitControls enableZoom={true} enablePan={false} />
    </Canvas>
  );
};

// Preload the model so it's ready when the component mounts
useGLTF.preload('/assets/Skull.glb');

export default Magnet3D;
