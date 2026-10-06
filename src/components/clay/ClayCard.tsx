import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ClayCardProps extends HTMLMotionProps<'div'> {
  variant?: 'white' | 'forest' | 'sage' | 'soft';
  interactive?: boolean;
  children: React.ReactNode;
}

export const ClayCard: React.FC<ClayCardProps> = ({
  variant = 'white',
  interactive = false,
  children,
  className = '',
  ...props
}) => {
  const variantClass = {
    white: 'clay-card',
    forest: 'clay-card-forest',
    sage: 'clay-card-sage',
    soft: 'bg-[#F5EFE6] border-2 border-white/80 shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.9),inset_-1.5px_-1.5px_3px_rgba(26,56,38,0.04),6px_8px_18px_-4px_rgba(26,56,38,0.06)] rounded-[26px]',
  }[variant];

  return (
    <motion.div
      whileHover={interactive ? { y: -2, scale: 1.008 } : undefined}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`${variantClass} p-5 relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
