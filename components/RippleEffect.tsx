'use client';

import { useState, useEffect, MouseEvent } from 'react';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  duration?: number;
}

export function RippleEffect({
  children,
  className = '',
  color = 'rgba(255, 255, 255, 0.5)',
  duration = 600
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    if (ripples.length > 0) {
      const timeout = setTimeout(() => {
        setRipples(ripples.slice(1));
      }, duration);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [ripples, duration]);

  const addRipple = (event: MouseEvent<HTMLDivElement>) => {
    const rippleContainer = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rippleContainer.width, rippleContainer.height);
    const x = event.clientX - rippleContainer.left - size / 2;
    const y = event.clientY - rippleContainer.top - size / 2;

    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples([...ripples, newRipple]);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseDown={addRipple}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
            transform: 'scale(0)',
            animation: `ripple ${duration}ms ease-out`,
          }}
        />
      ))}
    </div>
  );
}
