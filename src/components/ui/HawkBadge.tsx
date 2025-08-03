import React from "react";

interface HawkBadgeProps {
  size?: number;
  className?: string;
}

const HawkBadge: React.FC<HawkBadgeProps> = ({ size = 300, className = "" }) => {
  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer border ring */}
        <circle
          cx="200"
          cy="200"
          r="195"
          fill="url(#outerGradient)"
          stroke="#1a1a1a"
          strokeWidth="6"
        />
        
        {/* Inner background circle with gradient */}
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="url(#backgroundGradient)"
        />
        
        {/* Eagle head - white/cream colored */}
        <path
          d="M200 80 C240 80, 280 110, 280 150 C280 180, 260 200, 240 210 L240 230 C240 240, 230 250, 220 250 L180 250 C170 250, 160 240, 160 230 L160 210 C140 200, 120 180, 120 150 C120 110, 160 80, 200 80 Z"
          fill="#f8f9fa"
          stroke="#2d3748"
          strokeWidth="2"
        />
        
        {/* Beak */}
        <path
          d="M200 200 L220 220 L200 240 L180 220 Z"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        
        {/* Eyes */}
        <circle cx="175" cy="160" r="12" fill="#1a1a1a" />
        <circle cx="225" cy="160" r="12" fill="#1a1a1a" />
        <circle cx="175" cy="160" r="8" fill="#fbbf24" />
        <circle cx="225" cy="160" r="8" fill="#fbbf24" />
        <circle cx="175" cy="158" r="3" fill="#000000" />
        <circle cx="225" cy="158" r="3" fill="#000000" />
        
        {/* Body feathers - dark colors */}
        <ellipse
          cx="200"
          cy="280"
          rx="120"
          ry="80"
          fill="url(#bodyGradient)"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
        
        {/* Wing details - left wing */}
        <path
          d="M120 250 C100 260, 80 280, 70 310 C60 340, 80 360, 110 350 C140 340, 160 320, 170 290 L150 270 Z"
          fill="url(#wingGradient1)"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
        
        {/* Wing details - right wing */}
        <path
          d="M280 250 C300 260, 320 280, 330 310 C340 340, 320 360, 290 350 C260 340, 240 320, 230 290 L250 270 Z"
          fill="url(#wingGradient2)"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
        
        {/* Feather texture lines */}
        <g stroke="#374151" strokeWidth="1.5" fill="none">
          {/* Head feathers */}
          <path d="M160 120 Q180 130, 200 120" />
          <path d="M200 120 Q220 130, 240 120" />
          <path d="M170 140 Q190 150, 210 140" />
          <path d="M210 140 Q230 150, 250 140" />
          
          {/* Body feathers */}
          <path d="M140 280 Q160 290, 180 280" />
          <path d="M180 280 Q200 290, 220 280" />
          <path d="M220 280 Q240 290, 260 280" />
          <path d="M150 310 Q170 320, 190 310" />
          <path d="M190 310 Q210 320, 230 310" />
          <path d="M230 310 Q250 320, 270 310" />
          
          {/* Wing feathers */}
          <path d="M90 290 Q110 300, 130 290" />
          <path d="M100 320 Q120 330, 140 320" />
          <path d="M270 290 Q290 300, 310 290" />
          <path d="M260 320 Q280 330, 300 320" />
        </g>
        
        {/* Highlight details */}
        <ellipse cx="185" cy="140" rx="8" ry="4" fill="#ffffff" opacity="0.6" />
        <ellipse cx="215" cy="140" rx="8" ry="4" fill="#ffffff" opacity="0.6" />
        
        {/* Gradients */}
        <defs>
          <radialGradient id="outerGradient" cx="0.5" cy="0.3">
            <stop offset="0%" stopColor="#4b5563" />
            <stop offset="100%" stopColor="#1f2937" />
          </radialGradient>
          
          <radialGradient id="backgroundGradient" cx="0.5" cy="0.3">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="50%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#9ca3af" />
          </radialGradient>
          
          <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="50%" stopColor="#1f2937" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
          
          <linearGradient id="wingGradient1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4b5563" />
            <stop offset="50%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>
          
          <linearGradient id="wingGradient2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4b5563" />
            <stop offset="50%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default HawkBadge;
