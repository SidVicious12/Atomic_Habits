import React from "react";

/**
 * HawkPatchBadge – embroidery-style eagle patch SVG
 * Scales via `size` prop while maintaining crisp edges.
 */
interface HawkPatchBadgeProps {
  size?: number;
  className?: string;
}

const HawkPatchBadge: React.FC<HawkPatchBadgeProps> = ({ size = 320, className = "" }) => (
  <div style={{ width: size, height: size }} className={className}>
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* OUTER RING */}
      <circle cx="400" cy="400" r="390" fill="#000" />

      {/* INNER RING (slight bevel) */}
      <circle cx="400" cy="400" r="370" fill="#0d1117" />

      {/* RAINBOW BACKGROUND WEDGES */}
      <g filter="url(#stitch)">
        <path d="M400 30 A370 370 0 0 1 695 175 L400 400 Z" fill="#0080FF" />
        <path d="M695 175 A370 370 0 0 1 770 400 L400 400 Z" fill="#00a651" />
        <path d="M770 400 A370 370 0 0 1 695 625 L400 400 Z" fill="#ffd500" />
        <path d="M695 625 A370 370 0 0 1 400 770 L400 400 Z" fill="#ff7f00" />
        <path d="M400 770 A370 370 0 0 1 105 625 L400 400 Z" fill="#ff0000" />
        <path d="M105 625 A370 370 0 0 1 30 400 L400 400 Z" fill="#8e24aa" />
        <path d="M30 400 A370 370 0 0 1 105 175 L400 400 Z" fill="#0047ab" />
        <path d="M105 175 A370 370 0 0 1 400 30 L400 400 Z" fill="#002366" />
      </g>

      {/* EAGLE HEAD GROUP (REDRAWN) */}
      <g filter="url(#stitch)" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        
        {/* Colored Feathers (Bottom Layer) */}
        <path d="M300 500 L350 650 L450 650 L500 500 Z" fill="#ff0000" />
        <path d="M320 480 L360 630 L440 630 L480 480 Z" fill="#ff7f00" />
        <path d="M340 460 L370 610 L430 610 L460 460 Z" fill="#ffd500" />
        <path d="M360 440 L380 590 L420 590 L440 440 Z" fill="#00a651" />
        <path d="M380 420 L390 570 L410 570 L420 420 Z" fill="#0080FF" />

        {/* White Head */}
        <path
          d="M380 250 C 420 220, 500 240, 540 300 C 570 350, 560 420, 510 450 L 490 480 L 350 480 L 330 450 C 280 420, 270 350, 310 300 C 340 260, 360 250, 380 250 Z"
          fill="#f3f4f6"
        />

        {/* Head Feather Stitching */}
        <g stroke="#d1d5db" strokeWidth="2" fill="none">
          <path d="M380 280 Q420 290 460 280" />
          <path d="M370 310 Q420 320 470 310" />
          <path d="M360 340 Q420 350 480 340" />
          <path d="M350 370 Q420 380 490 370" />
          <path d="M340 400 Q420 410 500 400" />
          <path d="M330 430 Q420 440 510 430" />
        </g>

        {/* Eye */}
        <path d="M470 320 C 490 315, 510 330, 505 350 C 500 370, 480 375, 460 370 C 440 365, 450 325, 470 320 Z" fill="#000" />
        <circle cx="480" cy="345" r="15" fill="#fbbf24" />
        <circle cx="480" cy="345" r="8" fill="#000" />
        <circle cx="475" cy="340" r="4" fill="#fff" opacity="0.8" />

        {/* Beak */}
        <path
          d="M510 350 C 550 360, 580 390, 570 420 C 550 415, 520 380, 510 350 Z"
          fill="#f59e0b"
          stroke="#b45309"
        />
        <path
          d="M515 380 L550 405" stroke="#7c2d12" strokeWidth="3" />

      </g>

      {/* DEFINITIONS */}
      <defs>
        {/* faux embroidery texture */}
        <filter id="stitch" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="8" result="turb" />
          <feDisplacementMap in="SourceGraphic" in2="turb" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        <linearGradient id="neckGradient2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>

        <linearGradient id="featherGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id="featherGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="featherGrad3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>

        <linearGradient id="neckGradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="50%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0d47a1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export default HawkPatchBadge;
