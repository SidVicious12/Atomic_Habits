import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Stars } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Hawk3D from "./Hawk3D";
import WatercolorBackground from "./WatercolorBackground";

// Floating text component
function FloatingText() {
  const ref = useRef<any>();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.2;
      ref.current.position.y = Math.sin(clock.elapsedTime) * 0.2;
    }
  });
  return (
    <Text
      ref={ref}
      fontSize={2}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
    >
      Atomic Habits
    </Text>
  );
}

const IntroScene: React.FC = () => {
  const navigate = useNavigate();
  const handleEnter = () => {
    navigate("/login");
  };

  return (
    <div className="relative h-screen w-full">
      {/* Three.js Canvas */}
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={["#0f172a"]} /> {/* slate-900 */}
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <WatercolorBackground />
          <Hawk3D position={[2, 1, 0]} scale={1.5} />
          <FloatingText />
        </Suspense>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>

      {/* Enter button */}
      <AnimatePresence>
        <motion.button
          key="enter"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur px-8 py-3 rounded-lg text-white font-semibold tracking-wide border border-white/30 hover:bg-white/20"
          onClick={handleEnter}
        >
          ENTER
        </motion.button>
      </AnimatePresence>
    </div>
  );
};

export default IntroScene;
