"use client";
import React from "react";
import { motion } from "framer-motion";

export const InfinityLoop: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 400 200"
        className="w-full h-full"
        style={{ filter: "blur(1px)" }}
      >
        <defs>
          {/* Gradient for the main glow */}
          <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="25%" stopColor="#06B6D4" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="75%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          
          {/* Animated gradient */}
          <linearGradient id="infinityGradientAnimated" x1="0%" y1="0%" x2="100%" y2="0%">
            <motion.stop
              offset="0%"
              animate={{
                stopColor: ["#8B5CF6", "#06B6D4", "#8B5CF6"],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.stop
              offset="50%"
              animate={{
                stopColor: ["#06B6D4", "#8B5CF6", "#06B6D4"],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.stop
              offset="100%"
              animate={{
                stopColor: ["#8B5CF6", "#06B6D4", "#8B5CF6"],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </linearGradient>

          {/* Outer glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Stronger glow */}
          <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow layer */}
        <motion.path
          d="M100,100 C100,50 150,50 200,100 C250,150 300,150 300,100 C300,50 250,50 200,100 C150,150 100,150 100,100"
          fill="none"
          stroke="url(#infinityGradient)"
          strokeWidth="30"
          strokeLinecap="round"
          filter="url(#strongGlow)"
          opacity="0.4"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main infinity loop */}
        <motion.path
          d="M100,100 C100,50 150,50 200,100 C250,150 300,150 300,100 C300,50 250,50 200,100 C150,150 100,150 100,100"
          fill="none"
          stroke="url(#infinityGradientAnimated)"
          strokeWidth="8"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 2,
            ease: "easeInOut",
          }}
        />

        {/* Inner glow line */}
        <motion.path
          d="M100,100 C100,50 150,50 200,100 C250,150 300,150 300,100 C300,50 250,50 200,100 C150,150 100,150 100,100"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 2,
            ease: "easeInOut",
          }}
        />

        {/* Traveling light effect */}
        <motion.circle
          r="4"
          fill="white"
          filter="url(#glow)"
          animate={{
            offsetDistance: ["0%", "100%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            offsetPath: `path("M100,100 C100,50 150,50 200,100 C250,150 300,150 300,100 C300,50 250,50 200,100 C150,150 100,150 100,100")`,
          }}
        />
      </svg>
    </div>
  );
};

export default InfinityLoop;
