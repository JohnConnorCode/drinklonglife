'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface AnimatedLogoProps {
  className?: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'header' | 'footer';
}

export function AnimatedLogo({
  className = '',
  logoUrl,
  size = 'md',
  showText = true,
  variant = 'header',
}: AnimatedLogoProps) {
  // Size configurations
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  // Animation variants for the logo image
  const logoVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
      rotate: -180,
    },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 20,
        duration: 0.6,
      },
    },
  };

  // Animation variants for "Long" text
  const longTextVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.3,
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
  };

  // Animation variants for "Life" text
  const lifeTextVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.5,
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
  };

  const containerClasses = variant === 'header'
    ? 'flex items-center gap-0 group'
    : 'flex items-center gap-0';

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* Animated Logo Image */}
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        style={variant === 'header' ? { top: '-0.2rem' } : {}}
        initial="hidden"
        animate="visible"
        variants={logoVariants}
        whileHover={{
          scale: 1.1,
          rotate: 12,
          transition: { duration: 0.3 },
        }}
      >
        <div className="relative w-full h-full text-accent-primary transition-all duration-300 flex items-center">
          <Image
            src={logoUrl || '/long-life-logo.png'}
            alt="Long Life Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </motion.div>

      {/* Animated Text */}
      {showText && (
        <span className={`font-heading font-bold ${textSizeClasses[size]} ${variant === 'footer' ? '' : 'hidden sm:inline'}`}>
          <motion.span
            className="transition-colors group-hover:text-accent-primary"
            initial="hidden"
            animate="visible"
            variants={longTextVariants}
            style={{ display: 'inline-block' }}
          >
            Long
          </motion.span>
          <motion.span
            className="text-accent-primary"
            initial="hidden"
            animate="visible"
            variants={lifeTextVariants}
            style={{ display: 'inline-block' }}
          >
            Life
          </motion.span>
        </span>
      )}
    </div>
  );
}
