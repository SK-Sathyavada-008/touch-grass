import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ClayButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'forest' | 'sun' | 'cream' | 'sage';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const ClayButton: React.FC<ClayButtonProps> = ({
  variant = 'forest',
  size = 'md',
  fullWidth = false,
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const variantClass = {
    forest: 'clay-btn-forest',
    sun: 'clay-btn-sun',
    cream: 'clay-btn-cream',
    sage: 'bg-[#89AF87] text-[#163321] border border-white/70 shadow-[inset_1.5px_2px_3px_rgba(255,255,255,0.7),inset_-1.5px_-2px_4px_rgba(26,56,38,0.12),0_6px_14px_-2px_rgba(26,56,38,0.12)]',
  }[variant];

  const sizeClass = {
    sm: 'py-2 px-3.5 text-xs gap-1.5 rounded-2xl',
    md: 'py-3 px-5 text-sm gap-2 rounded-2xl font-bold',
    lg: 'py-4 px-7 text-base gap-2.5 rounded-3xl font-extrabold tracking-wide',
  }[size];

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.015, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.975, y: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      disabled={disabled}
      className={`clay-button ${variantClass} ${sizeClass} ${
        fullWidth ? 'w-full' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};
