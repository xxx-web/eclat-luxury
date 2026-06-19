import { motion, useInView } from 'framer-motion';
import { Play } from 'lucide-react';
import { useRef } from 'react';

export function ClosingCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden py-28 px-6 md:px-16 lg:px-24">
      {/* Background */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, rgba(155,127,255,0.08), rgba(212,168,75,0.05))' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(155,127,255,0.06) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(13,5,33,0.9) 100%)' }} />
      </div>

      {/* Content */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-3xl mx-auto text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-block mb-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '0.5rem 1rem',
            borderRadius: '50px',
          }}
        >
          <span className="text-xs tracking-[0.3em] uppercase" style={{ color: '#D4A84B' }}>
            尊享服务
          </span>
        </motion.div>

        <BlurText
          text="开启您的奢品之旅"
          className="font-heading italic text-5xl md:text-7xl text-foreground mb-8"
          delay={0.4}
        />

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg text-foreground/60 font-light leading-relaxed mb-12 max-w-2xl mx-auto"
        >
          尊享一对一鉴赏服务，感受甄选奢品的永恒之美。我们的匠心团队，静候您的光临。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <button
            className="luxury-glass px-8 py-4 rounded-full text-foreground hover:text-primary transition-all duration-500 group"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            <span className="flex items-center gap-3">
              预约鉴赏
              <span style={{ transition: 'transform 0.3s', display: 'inline-block' }}>→</span>
            </span>
          </button>

          <button
            className="luxury-glass px-8 py-4 rounded-full text-foreground/60 hover:text-foreground transition-all duration-500 group"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            <span className="flex items-center gap-3">
              <Play size={18} />
              观看品牌故事
            </span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}

// BlurText component (inline since it's used here)
function BlurText({ text, className, delay }: { text: string; className?: string; delay?: number }) {
  return (
    <h2 className={className} style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}>
      {text}
    </h2>
  );
}
