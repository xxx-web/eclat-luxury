import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * BlurText - Word-by-word blur-to-clear animation
 * Each word animates from blur(10px) → blur(0px)
 * with staggered delay
 */
export function BlurText({ text, className = '', delay = 0, duration = 0.35 }: BlurTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '100px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const words = text.split(' ');

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  return (
    <div ref={ref} className={className}>
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <motion.span
            initial={{
              filter: 'blur(10px)',
              opacity: 0,
              y: 50,
            }}
            animate={
              hasAnimated
                ? {
                    filter: 'blur(0px)',
                    opacity: 1,
                    y: 0,
                  }
                : {}
            }
            transition={{
              duration: duration,
              delay: delay + index * 0.1,
              ease: 'easeOut',
            }}
            style={{ display: 'inline-block', marginRight: '0.3em' }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </div>
  );
}

export default BlurText;
