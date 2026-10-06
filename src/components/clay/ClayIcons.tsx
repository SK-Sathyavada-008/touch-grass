import React from 'react';

interface ClayIconProps {
  size?: number;
  className?: string;
}

export const ClayLeaf: React.FC<ClayIconProps> = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_3px_6px_rgba(26,56,38,0.14)] ${className}`}
  >
    <defs>
      <radialGradient id="leafGrad" cx="30%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#A5DBA2" />
        <stop offset="50%" stop-color="#6DAE73" />
        <stop offset="100%" stop-color="#3C7343" />
      </radialGradient>
    </defs>
    {/* Clay Leaf Body */}
    <path
      d="M 6 34 C 6 22, 14 10, 34 6 C 34 26, 22 34, 6 34 Z"
      fill="url(#leafGrad)"
    />
    {/* Highlight spine */}
    <path
      d="M 8 32 C 16 26, 24 18, 32 8"
      stroke="#BCE9B9"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M 18 24 Q 24 23 26 27"
      stroke="#BCE9B9"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const ClayGrass: React.FC<ClayIconProps> = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_3px_6px_rgba(26,56,38,0.12)] ${className}`}
  >
    <defs>
      <radialGradient id="grassGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#99DC97" />
        <stop offset="70%" stop-color="#55995B" />
        <stop offset="100%" stop-color="#2C5B32" />
      </radialGradient>
    </defs>
    {/* Left blade */}
    <path d="M 12 36 C 8 24, 6 12, 4 8 C 12 12, 15 24, 16 36 Z" fill="url(#grassGrad)" />
    {/* Middle tall blade */}
    <path d="M 17 36 C 18 20, 19 8, 21 4 C 23 9, 25 22, 24 36 Z" fill="url(#grassGrad)" />
    {/* Right blade */}
    <path d="M 25 36 C 26 26, 30 16, 36 10 C 33 16, 32 26, 29 36 Z" fill="url(#grassGrad)" />
    {/* Highlight */}
    <path d="M 19 6 Q 20 18 20 32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const ClayButterfly: React.FC<ClayIconProps> = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_4px_8px_rgba(26,56,38,0.15)] ${className}`}
  >
    <defs>
      <radialGradient id="wingGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#FFE082" />
        <stop offset="60%" stop-color="#F5A623" />
        <stop offset="100%" stop-color="#E27D16" />
      </radialGradient>
    </defs>
    {/* Wings left */}
    <path d="M 20 18 C 12 8, 2 10, 4 20 C 5 26, 14 26, 20 22 Z" fill="url(#wingGrad)" />
    <path d="M 20 22 C 14 24, 6 28, 8 34 C 11 38, 17 32, 20 26 Z" fill="url(#wingGrad)" opacity="0.9" />
    {/* Wings right */}
    <path d="M 20 18 C 28 8, 38 10, 36 20 C 35 26, 26 26, 20 22 Z" fill="url(#wingGrad)" />
    <path d="M 20 22 C 26 24, 34 28, 32 34 C 29 38, 23 32, 20 26 Z" fill="url(#wingGrad)" opacity="0.9" />
    {/* Wing dots */}
    <circle cx="11" cy="18" r="2.2" fill="#FFFFFF" opacity="0.8" />
    <circle cx="29" cy="18" r="2.2" fill="#FFFFFF" opacity="0.8" />
    {/* Butterfly clay body */}
    <ellipse cx="20" cy="22" rx="2.5" ry="9" fill="#3E2723" />
    {/* Antennae */}
    <path d="M 19 14 Q 16 10 14 11" stroke="#3E2723" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 21 14 Q 24 10 26 11" stroke="#3E2723" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ClaySun: React.FC<ClayIconProps> = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_4px_12px_rgba(244,208,111,0.5)] ${className}`}
  >
    <defs>
      <radialGradient id="sunPebbleGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#FFF8D6" />
        <stop offset="60%" stop-color="#FCD34D" />
        <stop offset="100%" stop-color="#F59E0B" />
      </radialGradient>
    </defs>
    {/* Soft Sun clay center */}
    <circle cx="20" cy="20" r="11" fill="url(#sunPebbleGrad)" />
    {/* Clay highlight */}
    <ellipse cx="16" cy="16" rx="4" ry="2.5" fill="#FFFFFF" opacity="0.65" />
    {/* Soft rounded rays */}
    <ellipse cx="20" cy="4" rx="2" ry="3" fill="#FCD34D" />
    <ellipse cx="20" cy="36" rx="2" ry="3" fill="#FCD34D" />
    <ellipse cx="4" cy="20" rx="3" ry="2" fill="#FCD34D" />
    <ellipse cx="36" cy="20" rx="3" ry="2" fill="#FCD34D" />
    <ellipse cx="8" cy="8" rx="2.2" ry="2.2" fill="#FCD34D" />
    <ellipse cx="32" cy="8" rx="2.2" ry="2.2" fill="#FCD34D" />
    <ellipse cx="8" cy="32" rx="2.2" ry="2.2" fill="#FCD34D" />
    <ellipse cx="32" cy="32" rx="2.2" ry="2.2" fill="#FCD34D" />
  </svg>
);

export const ClayBackpack: React.FC<ClayIconProps> = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_3px_6px_rgba(26,56,38,0.12)] ${className}`}
  >
    <defs>
      <radialGradient id="packGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#C28C62" />
        <stop offset="70%" stop-color="#9C663C" />
        <stop offset="100%" stop-color="#6F421C" />
      </radialGradient>
      <radialGradient id="pocketGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#7DA282" />
        <stop offset="100%" stop-color="#3D6B49" />
      </radialGradient>
    </defs>
    {/* Top handle loop */}
    <path d="M 15 12 C 15 7, 25 7, 25 12" stroke="#5C3615" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Main backpack body */}
    <rect x="8" y="11" width="24" height="23" rx="7" fill="url(#packGrad)" />
    {/* Highlight edge */}
    <path d="M 12 14 C 18 12, 26 12, 28 14" stroke="#E1B898" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    {/* Front sage pocket */}
    <rect x="11" y="21" width="18" height="11" rx="4" fill="url(#pocketGrad)" />
    {/* Buckle dot */}
    <circle cx="20" cy="23" r="2" fill="#F4D06F" />
  </svg>
);

export const ClayMapPin: React.FC<ClayIconProps> = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_4px_8px_rgba(26,56,38,0.15)] ${className}`}
  >
    <defs>
      <radialGradient id="pinGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#E86E5E" />
        <stop offset="60%" stop-color="#D04230" />
        <stop offset="100%" stop-color="#981F12" />
      </radialGradient>
    </defs>
    {/* Pin shape */}
    <path
      d="M 20 6 C 12 6, 8 12, 8 18 C 8 26, 18 34, 20 36 C 22 34, 32 26, 32 18 C 32 12, 28 6, 20 6 Z"
      fill="url(#pinGrad)"
    />
    {/* Specular highlight */}
    <ellipse cx="16" cy="11" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.6" />
    {/* Center hole */}
    <circle cx="20" cy="17" r="4.5" fill="#FAF7F0" />
  </svg>
);
