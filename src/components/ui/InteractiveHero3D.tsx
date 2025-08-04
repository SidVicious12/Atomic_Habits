import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, OrbitControls, Stars, Environment, Float } from "@react-three/drei";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Vector3 } from "three";
import HabitCrystal3D from "./HabitCrystal3D";
import FierceHawk3D from "./FierceHawk3D";
import ParticleField3D from "./ParticleField3D";
import { useToast } from "./toast";
import { useMousePosition } from "../../hooks/useMousePosition";
import { usePerformanceMonitor } from "../../hooks/usePerformanceMonitor";

// Floating habit symbols
function HabitOrbs() {
  const orbs = [
    { emoji: "☕", position: [-3, 2, -1], color: "#8B4513" },
    { emoji: "🏃‍♂️", position: [3, 1, -2], color: "#10B981" },
    { emoji: "📚", position: [-2, -1, 1], color: "#F59E0B" },
    { emoji: "💧", position: [2, -2, 0], color: "#3B82F6" },
    { emoji: "🧘‍♂️", position: [0, 3, -3], color: "#8B5CF6" },
  ];

  return (
    <>
      {orbs.map((orb, index) => (
        <Float
          key={index}
          speed={1 + Math.random()}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <Text
            position={orb.position}
            fontSize={0.8}
            color={orb.color}
            anchorX="center"
            anchorY="middle"
          >
            {orb.emoji}
          </Text>
        </Float>
      ))}
    </>
  );
}

// Interactive camera that follows mouse
function MouseFollowCamera() {
  const { camera } = useThree();
  const mousePosition = useMousePosition();
  
  useFrame(() => {
    // Smoothly move camera based on mouse position
    const targetX = mousePosition.normalizedX * 2;
    const targetY = mousePosition.normalizedY * 1;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Animated background elements with mouse interaction
function BackgroundElements({ quality }: { quality: 'high' | 'medium' | 'low' }) {
  const groupRef = useRef<any>();
  const mousePosition = useMousePosition();
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.05 + mousePosition.normalizedX * 0.1;
      groupRef.current.rotation.x = mousePosition.normalizedY * 0.05;
    }
  });

  // Adjust particle count and star count based on performance
  const getQualitySettings = () => {
    switch (quality) {
      case 'high':
        return { stars: 1500, particles: 500, particleSize: 1.5 };
      case 'medium':
        return { stars: 800, particles: 250, particleSize: 2 };
      case 'low':
        return { stars: 300, particles: 100, particleSize: 2.5 };
      default:
        return { stars: 1500, particles: 500, particleSize: 1.5 };
    }
  };

  const settings = getQualitySettings();

  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={50} count={settings.stars} factor={4} saturation={0} fade />
      <ParticleField3D 
        count={settings.particles} 
        color="#4F46E5" 
        size={settings.particleSize} 
        opacity={0.4} 
        speed={0.3} 
      />
      <Environment preset="night" />
    </group>
  );
}

// Main hero title with 3D text
function HeroTitle() {
  const textRef = useRef<any>();
  
  useFrame(({ clock }) => {
    if (textRef.current) {
      textRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
      <Text
        ref={textRef}
        position={[0, 0, 0]}
        fontSize={1.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.02}
        outlineColor="#4F46E5"
      >
        ATOMIC HABITS
      </Text>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.4}
        color="#a0a0a0"
        anchorX="center"
        anchorY="middle"
      >
        Build better habits, one day at a time
      </Text>
    </Float>
  );
}

interface InteractiveHero3DProps {
  onGetStarted?: () => void;
}

const InteractiveHero3D: React.FC<InteractiveHero3DProps> = ({ onGetStarted }) => {
  const navigate = useNavigate();
  const { success } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const performance = usePerformanceMonitor();

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGetStarted = () => {
    success("Welcome to Atomic Habits!", "Let's start building better habits together.");
    if (onGetStarted) {
      onGetStarted();
    } else {
      navigate('/log');
    }
  };

  const handleExplore = () => {
    navigate('/');
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ 
          position: isMobile ? [0, 0, 12] : [0, 0, 8], 
          fov: isMobile ? 75 : 60 
        }}
        className={`absolute inset-0 hero-3d-canvas hero-3d-${performance.quality}-quality`}
        dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
        performance={{ min: 0.1 }}
      >
        <Suspense fallback={null}>
          <BackgroundElements quality={performance.quality} />
          
          {/* Interactive mouse follow camera - disabled on mobile for performance */}
          {!isMobile && <MouseFollowCamera />}
          
          {/* Main habit crystal */}
          <HabitCrystal3D 
            position={[0, -2, 0]} 
            scale={isMobile ? 0.6 : 0.8}
            color="#4F46E5"
            glowIntensity={performance.quality === 'low' ? 0.4 : 0.8}
            quality={performance.quality}
          />
          
          {/* Fierce hawk companion - simplified on mobile */}
          {(!isMobile || performance.quality !== 'low') && (
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
              <FierceHawk3D 
                position={isMobile ? [3, 0.5, 1] : [4, 1, 2]} 
                scale={isMobile ? 0.2 : 0.3} 
              />
            </Float>
          )}
          
          {/* Hero title */}
          <HeroTitle />
          
          {/* Floating habit orbs - reduced on mobile */}
          {(!isMobile || performance.quality !== 'low') && <HabitOrbs />}
          
          {/* Interactive controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
            autoRotate={!isHovered && !isMobile}
            autoRotateSpeed={0.3}
            enableRotate={!isMobile}
            touches={{
              ONE: isMobile ? 0 : 1, // Disable touch rotation on mobile
              TWO: 0
            }}
          />
          
          {/* Dynamic lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          {performance.quality !== 'low' && (
            <pointLight position={[-10, -10, -5]} color="#8B5CF6" intensity={0.5} />
          )}
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none hero-ui-overlay">
        <div className="pointer-events-auto mt-auto mb-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-center space-y-6"
          >
            <p className={`hero-description ${isMobile ? 'text-base' : 'text-lg'} text-gray-300 max-w-md mx-auto px-4`}>
              Transform your life through the power of small, consistent actions
            </p>
            
            <div className={`hero-buttons flex ${isMobile ? 'flex-col space-y-3' : 'flex-row gap-4'} justify-center`}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(79, 70, 229, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`hero-button ${isMobile ? 'px-6 py-3 text-base' : 'px-8 py-4 text-base'} bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                Get Started
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExplore}
                className={`hero-button ${isMobile ? 'px-6 py-3 text-base' : 'px-8 py-4 text-base'} bg-transparent border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300`}
              >
                Explore
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Animated background particles - reduced on mobile */}
      {(!isMobile || performance.quality !== 'low') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none hero-particles">
          {[...Array(isMobile ? 20 : 50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Performance indicator */}
      <div className="absolute top-4 left-4 space-y-2 performance-indicators">
        {performance.fps < 30 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-xs text-yellow-300 hero-performance-indicator"
          >
            Performance Mode: {performance.quality.toUpperCase()}
          </motion.div>
        )}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300 hero-performance-indicator"
          >
            Mobile Optimized
          </motion.div>
        )}
      </div>

      {isHovered && !isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 text-xs text-white/60"
        >
          Interactive 3D Scene Active • {performance.fps} FPS
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveHero3D;