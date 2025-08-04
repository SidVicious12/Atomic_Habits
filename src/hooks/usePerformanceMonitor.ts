import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  fps: number;
  quality: 'high' | 'medium' | 'low';
  shouldReduceQuality: boolean;
}

export function usePerformanceMonitor(): PerformanceMetrics {
  const [fps, setFps] = useState(60);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) { // Every second
        const currentFPS = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setFps(currentFPS);
        
        // Adjust quality based on performance
        if (currentFPS < 30) {
          setQuality('low');
        } else if (currentFPS < 45) {
          setQuality('medium');
        } else {
          setQuality('high');
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    // Start monitoring after a brief delay
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(measureFPS);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return {
    fps,
    quality,
    shouldReduceQuality: fps < 30
  };
}