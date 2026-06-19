import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const craftStats = [
  { num: '15+', label: '全球甄选' },
  { num: '50+', label: '匠心工艺' },
  { num: '99%', label: '鉴赏满意' },
];

export function CraftSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="craft" className="py-28 px-6 md:px-16 lg:px-24" style={{ background: 'linear-gradient(135deg, rgba(26,26,46,0.4), rgba(13,5,33,0.8))' }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto"
      >
        {/* Static Background */}
        <div className="relative rounded-2xl overflow-hidden aspect-video mb-16 border border-border/50" style={{ background: 'linear-gradient(135deg, rgba(155,127,255,0.08), rgba(212,168,75,0.05))' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4" style={{ color: 'rgba(155,127,255,0.15)' }}>◆</div>
              <div className="text-sm tracking-[0.2em] uppercase" style={{ color: 'rgba(240,236,230,0.3)' }}>匠心工艺</div>
            </div>
          </div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent, rgba(13,5,33,0.9) 100%)' }} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {craftStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="text-center p-8 rounded-xl border border-border/50"
              style={{ background: 'rgba(26,26,46,0.6)', backdropFilter: 'blur(12px)' }}
            >
              <div
                className="font-heading text-4xl mb-2"
                style={{
                  background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {s.num}
              </div>
              <div className="text-sm tracking-[0.2em] uppercase" style={{ color: 'rgba(240,236,230,0.5)' }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
