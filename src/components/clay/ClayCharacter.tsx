import React from 'react';
import { motion, type Variants } from 'framer-motion';

interface ClayCharacterProps {
  mood?: 'idle' | 'walking' | 'happy' | 'curious';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const ClayCharacter: React.FC<ClayCharacterProps> = ({
  mood = 'idle',
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: { width: 56, height: 64 },
    md: { width: 88, height: 98 },
    lg: { width: 120, height: 132 },
  };

  const { width, height } = sizeMap[size];

  const characterVariants: Variants = {
    idle: {
      y: [0, -3, 0],
      rotate: [0, 1, 0, -1, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    walking: {
      y: [0, -5, 0],
      rotate: [-2, 2, -2],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    happy: {
      y: [0, -8, 0],
      scale: [1, 1.04, 1],
      transition: {
        duration: 0.9,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    curious: {
      rotate: [0, 4, 0],
      y: [0, -2, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      className={`inline-block relative cursor-pointer select-none ${className}`}
      variants={characterVariants}
      animate={mood}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      role="img"
      aria-label="Pebble, your tiny clay companion"
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_6px_12px_rgba(26,56,38,0.09)]"
      >
        <defs>
          {/* Main Soft Warm Clay Body */}
          <radialGradient id="pebbleGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F7F2EB" />
            <stop offset="60%" stopColor="#EADBCA" />
            <stop offset="100%" stopColor="#D2BFAB" />
          </radialGradient>

          {/* Clay Sprout Leaf */}
          <radialGradient id="sproutLeafGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#96CF8F" />
            <stop offset="60%" stopColor="#5B9E5A" />
            <stop offset="100%" stopColor="#356A35" />
          </radialGradient>

          {/* Cheeks */}
          <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5A38C" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#F5A38C" stopOpacity="0" />
          </radialGradient>

          {/* Soft Ground Shadow */}
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1A3826" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1A3826" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft shadow */}
        <ellipse cx="50" cy="103" rx="28" ry="5.5" fill="url(#groundShadow)" />

        {/* Clay Feet */}
        <ellipse cx="38" cy="95" rx="7" ry="4" fill="#C5B19C" />
        <ellipse cx="62" cy="95" rx="7" ry="4" fill="#C5B19C" />

        {/* Main Clay Body */}
        <path
          d="M 50 25 C 75 25, 84 45, 84 68 C 84 88, 72 96, 50 96 C 28 96, 16 88, 16 68 C 16 45, 25 25, 50 25 Z"
          fill="url(#pebbleGrad)"
        />

        {/* Clay 3D Highlight Curve */}
        <path
          d="M 32 34 C 42 29, 58 29, 68 34"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />

        {/* Cheeks */}
        <ellipse cx="32" cy="65" rx="6" ry="4" fill="url(#blushGrad)" />
        <ellipse cx="68" cy="65" rx="6" ry="4" fill="url(#blushGrad)" />

        {/* Eyes */}
        {mood === 'happy' ? (
          <>
            <path d="M 37 57 Q 42 52 47 57" stroke="#1A3826" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M 53 57 Q 58 52 63 57" stroke="#1A3826" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx="41" cy="56" r="3.2" fill="#1A3826" />
            <circle cx="40" cy="54.5" r="1.1" fill="#FFFFFF" />
            <circle cx="59" cy="56" r="3.2" fill="#1A3826" />
            <circle cx="58" cy="54.5" r="1.1" fill="#FFFFFF" />
          </>
        )}

        {/* Cute Smile */}
        <path
          d="M 47 64 Q 50 67 53 64"
          stroke="#1A3826"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Little Clay Sprout on Head */}
        <g transform="translate(50, 25)">
          <path
            d="M 0 0 Q -2 -11 2 -17"
            stroke="#5B9E5A"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 2 -17 C -9 -21, -11 -12, -2 -10 Z"
            fill="url(#sproutLeafGrad)"
          />
          <path
            d="M 2 -17 C 13 -21, 15 -12, 4 -10 Z"
            fill="url(#sproutLeafGrad)"
          />
          <circle cx="0" cy="-13" r="1" fill="#FFFFFF" opacity="0.8" />
        </g>
      </svg>
    </motion.div>
  );
};
