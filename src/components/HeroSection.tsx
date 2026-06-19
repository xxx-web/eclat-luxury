import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BlurText } from './BlurText';

export function HeroSection() {
  // Generate stars once (v29 style: 8 big + 10 medium + 10 small = 28 stars)
  const stars = useMemo(() => {
    const list: Array<{ top: number; left: number; size: 'big' | 'medium' | 'small'; dur: number; delay: number; minOp?: number; maxOp?: number }> = [];
    const types: Array<{ size: 'big' | 'medium' | 'small'; count: number }> = [
      { size: 'big', count: 8 },
      { size: 'medium', count: 10 },
      { size: 'small', count: 10 },
    ];
    types.forEach(({ size, count }) => {
      for (let i = 0; i < count; i++) {
        const dur = 2 + Math.random() * 3;
        const delay = Math.random() * 4;
        const star: typeof list[number] = {
          top: Math.random() * 100,
          left: Math.random() * 100,
          size,
          dur,
          delay,
        };
        if (size === 'big') {
          star.minOp = 0.3 + Math.random() * 0.15;
          star.maxOp = 0.9 + Math.random() * 0.1;
        }
        list.push(star);
      }
    });
    return list;
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden pt-18"
      style={{
        background:
          'radial-gradient(ellipse 70% 60% at 10% 50%, rgba(155,127,255,0.07) 0%, transparent 70%),' +
          'radial-gradient(ellipse 50% 70% at 35% 50%, rgba(155,127,255,0.04) 0%, transparent 60%),' +
          'radial-gradient(ellipse 60% 80% at 85% 50%, rgba(212,168,75,0.05) 0%, transparent 70%),' +
          '#0d0521',
      }}
    >
      {/* Top divider line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(155,127,255,0.12), rgba(212,168,75,0.12), transparent)',
        }}
      />

      {/* Background stars (v29 style: 28 stars) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
        {stars.map((star, i) => {
          const sizeClass =
            star.size === 'big' ? 'w-[3px] h-[3px]' :
            star.size === 'medium' ? 'w-[2px] h-[2px]' :
            'w-px h-px';
          const shadow =
            star.size === 'big'
              ? '0 0 4px rgba(255,255,255,0.8), 0 0 8px rgba(155,127,255,0.4)'
              : 'none';
          return (
            <div
              key={i}
              className={`absolute rounded-full bg-white ${sizeClass}`}
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                boxShadow: shadow,
                ['--dur' as string]: `${star.dur.toFixed(1)}s`,
                ['--delay' as string]: `${star.delay.toFixed(1)}s`,
                ['--min-op' as string]: star.minOp ? star.minOp.toFixed(2) : '0.2',
                ['--max-op' as string]: star.maxOp ? star.maxOp.toFixed(2) : '0.9',
                animation: `starTwinkle ${star.dur.toFixed(1)}s ease-in-out infinite`,
                animationDelay: `${star.delay.toFixed(1)}s`,
              }}
            />
          );
        })}
      </div>

      {/* Left decorative shapes (v29 style) */}
      <div
        className="hidden md:block absolute pointer-events-none z-[1]"
        style={{
          top: '15%',
          left: '4%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(155,127,255,0.08) 0%, transparent 60%)',
          border: '1px solid rgba(155,127,255,0.06)',
        }}
      />
      <div
        className="hidden md:block absolute pointer-events-none z-[1]"
        style={{
          top: '40%',
          left: '0%',
          width: '180px',
          height: '420px',
          background: 'linear-gradient(135deg, rgba(155,127,255,0.06) 0%, rgba(212,168,75,0.03) 100%)',
          border: '1px solid rgba(155,127,255,0.05)',
          borderRadius: '2px',
        }}
      />

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="max-w-3xl" style={{ paddingLeft: '5%' }}>
          {/* Left accent line */}
          <div
            className="absolute left-6 top-0 bottom-0 w-0.5 rounded-full"
            style={{
              background:
                'linear-gradient(180deg, transparent, #9B7FFF, #D4A84B, transparent)',
            }}
          />

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[0.7rem] tracking-[0.3em] uppercase mb-5 flex items-center gap-3"
            style={{ color: '#D4A84B', fontFamily: 'var(--font-sans)' }}
          >
            <span
              className="inline-block"
              style={{ width: '32px', height: '1px', background: '#D4A84B', opacity: 0.6 }}
            />
            Haute Joaillerie & Parfum
          </motion.p>

          {/* Title */}
          <BlurText
            text="臻选全球奢品"
            className="font-serif text-[clamp(2.2rem,5vw,4.5rem)] font-light leading-[1.15] mb-2 text-foreground"
            delay={0.4}
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="font-serif italic text-[clamp(2rem,4.5vw,4rem)] font-light leading-[1.15] mb-2"
            style={{
              background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ÉCLAT · 光芒自在
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-[0.85rem] tracking-[0.18em] uppercase text-foreground/60 mb-10"
          >
            首饰 · 香水 · 包包
          </motion.p>

          {/* CTA */}
          <motion.a
            href="#products"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-foreground text-[0.8rem] tracking-[0.15em] uppercase transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background:
                'linear-gradient(135deg, rgba(155,127,255,0.15), rgba(212,168,75,0.1))',
              border: '1px solid rgba(155,127,255,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(155,127,255,0.25), rgba(212,168,75,0.2))';
              e.currentTarget.style.borderColor = 'rgba(155,127,255,0.5)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(155,127,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(155,127,255,0.15), rgba(212,168,75,0.1))';
              e.currentTarget.style.borderColor = 'rgba(155,127,255,0.3)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            探索精选
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </motion.a>
        </div>
      </div>

      {/* Diamond Crystal (right side) */}
      <div
        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-[72%] items-center justify-center pointer-events-none z-10"
      >
        <div className="relative w-[500px] h-[500px] flex items-center justify-center">
          {/* Ambient glow */}
          <div
            className="absolute w-full h-full rounded-full"
            style={{
              background:
                'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(155,127,255,0.12) 0%, rgba(212,168,75,0.05) 40%, transparent 70%)',
              animation: 'crystalFloat 7s ease-in-out infinite',
            }}
          />

          {/* Floor shadow */}
          <div
            className="absolute w-[200px] h-[30px]"
            style={{
              bottom: '60px',
              background:
                'radial-gradient(ellipse, rgba(155,127,255,0.18) 0%, transparent 70%)',
              filter: 'blur(12px)',
              animation: 'crystalFloat 7s ease-in-out infinite',
            }}
          />

          {/* Main Diamond SVG */}
          <svg
            className="relative z-10 w-[420px] h-[420px]"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="diamondGrad2" x1="30%" y1="0%" x2="70%" y2="100%">
                <stop offset="0%" stopColor="rgba(230,220,255,0.5)" />
                <stop offset="25%" stopColor="rgba(200,185,255,0.35)" />
                <stop offset="50%" stopColor="rgba(155,127,255,0.25)" />
                <stop offset="75%" stopColor="rgba(130,100,200,0.2)" />
                <stop offset="100%" stopColor="rgba(80,60,160,0.15)" />
              </linearGradient>
              <filter id="glow2" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Main diamond body */}
            <polygon
              points="100,30 160,78 100,175 40,78"
              fill="url(#diamondGrad2)"
              stroke="rgba(200,180,255,0.5)"
              strokeWidth="0.6"
            />

            {/* Crown facets */}
            <polygon points="100,30 130,54 100,65 70,54" fill="rgba(255,255,255,0.2)" />
            <polygon points="130,54 160,78 100,65" fill="rgba(255,255,255,0.1)" />
            <polygon points="70,54 100,65 40,78" fill="rgba(200,180,255,0.08)" />

            {/* Pavilion facets */}
            <polygon points="100,65 130,54 100,100" fill="rgba(255,255,255,0.15)" />
            <polygon points="100,65 70,54 100,100" fill="rgba(200,180,255,0.12)" />
            <polygon points="100,100 130,54 160,78" fill="rgba(180,160,255,0.08)" />
            <polygon points="100,100 70,54 40,78" fill="rgba(155,127,255,0.1)" />

            {/* Lower pavilion */}
            <polygon points="100,100 160,78 100,175" fill="rgba(180,160,255,0.15)" />
            <polygon points="100,100 40,78 100,175" fill="rgba(155,127,255,0.12)" />
            <polygon points="100,100 130,54 100,175" fill="rgba(200,180,255,0.1)" />
            <polygon points="100,100 70,54 100,175" fill="rgba(170,150,255,0.1)" />

            {/* Center glow spot */}
            <circle cx="100" cy="85" r="5" fill="rgba(255,255,255,0.9)" filter="url(#glow2)" />
            <circle cx="95" cy="80" r="2" fill="rgba(255,255,255,1)" />

            {/* Sparkle highlights */}
            <circle cx="120" cy="55" r="1.5" fill="rgba(255,255,255,0.9)" />
            <circle cx="75" cy="62" r="1" fill="rgba(255,255,255,0.7)" />
            <circle cx="140" cy="90" r="1" fill="rgba(255,255,255,0.5)" />
          </svg>

          {/* Orbiting sparkles */}
          {[
            { top: '5%', left: '15%', size: '5px', dur: '6s', delay: '0s', color: 'rgba(255,255,255,0.7)' },
            { top: '20%', right: '10%', size: '4px', dur: '8s', delay: '-2s', color: 'rgba(155,127,255,0.6)' },
            { bottom: '15%', left: '10%', size: '6px', dur: '7s', delay: '-4s', color: 'rgba(212,168,75,0.5)' },
            { bottom: '25%', right: '15%', size: '4px', dur: '5s', delay: '-1s', color: 'rgba(255,255,255,0.6)' },
            { top: '35%', left: '5%', size: '3px', dur: '9s', delay: '-3s', color: 'rgba(200,180,255,0.5)' },
          ].map((star, i) => (
            <svg
              key={i}
              className="absolute pointer-events-none"
              style={{
                top: star.top,
                left: star.left,
                right: star.right,
                bottom: star.bottom,
                width: star.size,
                height: star.size,
                animation: `orbitFloat ${star.dur} ease-in-out infinite, starTwinkle 3s ease-in-out infinite`,
                animationDelay: star.delay,
              }}
              viewBox="0 0 20 20"
              fill={star.color}
            >
              <polygon points="10,0 12,8 20,10 12,12 10,20 8,12 0,10 8,8" />
            </svg>
          ))}
        </div>
      </div>

      {/* Decorative gem: top-right (hexagon cut) */}
      <div
        className="hidden md:block absolute z-[5] pointer-events-none"
        style={{
          right: '2%',
          top: '6%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          border: '1px solid rgba(155,127,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'gemFloat 6s ease-in-out infinite',
        }}
      >
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
          <polygon
            points="20,1 36,10 36,30 20,39 4,30 4,10"
            fill="rgba(155,127,255,0.22)"
            stroke="rgba(180,160,255,0.5)"
            strokeWidth="0.6"
          />
          <polygon points="20,1 36,10 24,15 12,10" fill="rgba(200,185,255,0.35)" />
          <polygon points="20,1 12,10 4,10" fill="rgba(170,150,255,0.25)" />
          <polygon points="36,10 36,30 24,25 24,15" fill="rgba(160,140,255,0.2)" />
          <polygon points="4,10 4,30 16,25 16,15" fill="rgba(140,120,220,0.18)" />
          <polygon points="36,30 20,39 24,25" fill="rgba(130,110,200,0.15)" />
          <polygon points="4,30 20,39 16,25" fill="rgba(120,100,190,0.12)" />
          <polygon
            points="20,15 24,18 24,22 20,25 16,22 16,18"
            fill="rgba(255,255,255,0.25)"
          />
          <circle cx="20" cy="4" r="1.2" fill="rgba(255,255,255,0.9)" />
          <circle cx="18" cy="3" r="0.6" fill="rgba(255,255,255,0.5)" />
        </svg>
      </div>

      {/* Decorative gem: bottom-right (pear/teardrop shape) */}
      <div
        className="hidden md:block absolute z-[5] pointer-events-none"
        style={{
          right: '3%',
          bottom: '12%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '1px solid rgba(212,168,75,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'gemFloat 7s ease-in-out infinite reverse',
        }}
      >
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
          <path
            d="M20 2 C26 2, 30 8, 30 14 C30 22, 24 30, 20 36 C16 30, 10 22, 10 14 C10 8, 14 2, 20 2 Z"
            fill="rgba(212,168,75,0.2)"
            stroke="rgba(230,200,120,0.45)"
            strokeWidth="0.6"
          />
          <path
            d="M20 2 C24 2, 27 6, 27 10 L20 14 L13 10 C13 6, 16 2, 20 2 Z"
            fill="rgba(240,220,160,0.3)"
          />
          <path d="M13 10 L20 14 L20 25 L13 10 Z" fill="rgba(220,190,120,0.2)" />
          <path d="M27 10 L20 14 L20 25 L27 10 Z" fill="rgba(200,170,100,0.15)" />
          <path d="M13 10 L20 25 L16 32 L13 10 Z" fill="rgba(180,150,90,0.15)" />
          <path d="M27 10 L20 25 L24 32 L27 10 Z" fill="rgba(160,130,80,0.12)" />
          <path
            d="M20 14 L20 36"
            stroke="rgba(250,230,180,0.25)"
            strokeWidth="0.8"
          />
          <circle cx="20" cy="6" r="1" fill="rgba(255,255,255,0.9)" />
          <circle cx="18" cy="5" r="0.5" fill="rgba(255,255,255,0.6)" />
        </svg>
      </div>

      {/* Bottom divider line (v29 style) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none z-[1]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(240,236,230,0.12), transparent)',
        }}
      />

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div
          className="w-px h-16"
          style={{
            background:
              'linear-gradient(180deg, rgba(155,127,255,0.6), transparent)',
          }}
        />
      </motion.div>
    </section>
  );
}
