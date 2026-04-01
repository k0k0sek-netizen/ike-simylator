import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedCounter({
  value,
  isCurrency = true,
  prefix = '',
  suffix = '',
  className = '',
  style = {},
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        let formatted = '';
        if (isCurrency) {
          formatted = new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            maximumFractionDigits: 0,
          }).format(latest);
        } else {
          formatted = Math.round(latest).toString();
        }
        ref.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });
  }, [springValue, isCurrency, prefix, suffix]);

  return <span ref={ref} className={className} style={style} />;
}
