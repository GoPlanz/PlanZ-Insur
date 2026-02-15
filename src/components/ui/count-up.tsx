'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number | string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function CountUp({ 
  value, 
  duration = 400, 
  prefix = '', 
  suffix = '', 
  decimals = 0,
  className 
}: CountUpProps) {
  const displayValue = typeof value === 'string' ? value : value;
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;

  const [display, setDisplay] = useState<number | string>(displayValue);
  const previousValue = useRef<number | string>(displayValue);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === previousValue.current) return;

    const oldValue = typeof previousValue.current === 'number' ? previousValue.current : numericValue;
    const newValue = numericValue;

    previousValue.current = value;

    if (typeof value === 'string') {
      setDisplay(value);
      return;
    }

    const startAnimation = (timestamp: number) => {
      startTimeRef.current = timestamp;
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current!;
        const progress = Math.min(elapsed / duration, 1);

        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        const current = oldValue + (newValue - oldValue) * easeOutQuad;

        setDisplay(current);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(startAnimation);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, numericValue]);

  const formatted = typeof display === 'number' 
    ? `${prefix}${display.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
    : display;

  return <span className={className}>{formatted}</span>;
}
