import { motion } from 'framer-motion';

const marqueeItems = [
  'Haute Joaillerie',
  "Parfum d'Exception",
  'Maroquinerie de Luxe',
  'Art de Vivre',
  'Savoir-Faire',
];

export function Marquee() {
  // Duplicate items to create seamless infinite scroll
  const items = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div
      className="overflow-hidden border-y"
      style={{
        padding: '1.2rem 0',
        background: 'rgba(155,127,255,0.03)',
        borderColor: 'rgba(240,236,230,0.08)',
      }}
    >
      <motion.div
        className="flex"
        style={{
          gap: '3rem',
          whiteSpace: 'nowrap',
          width: 'max-content',
        }}
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{
          duration: 22,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center"
            style={{
              gap: '3rem',
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(240,236,230,0.6)',
            }}
          >
            <span>{item}</span>
            <span style={{ color: '#D4A84B', opacity: 0.5, fontSize: '0.5rem' }}>◆</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
