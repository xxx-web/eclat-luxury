import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { BlurText } from './BlurText';
import { useLazyVideo } from '../hooks/useLazyVideo';

export function HeroSection() {
  const videoRef = useLazyVideo();

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-18">
      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="max-w-3xl" style={{ paddingLeft: '5%' }}>
          {/* Left accent line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 rounded-full" style={{
            background: 'linear-gradient(180deg, transparent, #9B7FFF, #D4A84B, transparent)',
          }} />

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-6"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '0.5rem 1rem',
              borderRadius: '50px',
            }}
          >
            <span className="text-xs tracking-[0.3em] uppercase" style={{ color: '#D4A84B' }}>
              甄选臻品 · New
            </span>
          </motion.div>

          {/* Heading */}
          <BlurText
            text="臻选全球奢品"
            className="font-heading italic text-5xl md:text-7xl lg:text-[5.5rem] text-foreground tracking-[-2px] leading-[0.85] mb-6"
            delay={0.4}
          />

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg md:text-xl text-foreground/60 font-light leading-relaxed mb-12 max-w-2xl"
          >
            甄选全球奢品，匠心独运，为每一位鉴赏家呈现卓越品质与永恒之美。
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <button
              className="luxury-glass px-8 py-4 rounded-full text-foreground hover:text-primary transition-all duration-500 group"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,127,255,0.25), rgba(212,168,75,0.2))';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(155,127,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <span className="flex items-center gap-3">
                探索臻品
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </button>

            <button
              className="luxury-glass px-8 py-4 rounded-full text-foreground/60 hover:text-foreground transition-all duration-500 group"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
            >
              <span className="flex items-center gap-3">
                <Play size={18} />
                预约鉴赏
              </span>
            </button>
          </motion.div>

          {/* Prestige Line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="mt-16 text-sm tracking-[0.2em] uppercase text-foreground/40"
          >
            珠宝 · 香水 · 奢华手袋 · 永恒之美
          </motion.p>
        </div>
      </div>
    </section>
  );
}
