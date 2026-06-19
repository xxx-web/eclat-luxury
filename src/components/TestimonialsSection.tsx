import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';
import { useRef } from 'react';

const testimonials = [
  {
    name: '陈女士',
    date: '2026年3月',
    rating: 5,
    text: '包装精美，品质超乎预期，非常满意！ÉCLAT 的匠心工艺令人赞叹。',
    avatar: '陈',
  },
  {
    name: '李先生',
    date: '2026年2月',
    rating: 5,
    text: '匠心独运，细节之处见真章。月光之泪项链是我收到过最精美的礼物。',
    avatar: '李',
  },
  {
    name: '王女士',
    date: '2026年1月',
    rating: 4,
    text: '非常喜欢，物流迅速，包装精美。珍珠手链的日常佩戴感非常舒适。',
    avatar: '王',
  },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="testimonials" className="py-28 px-6 md:px-16 lg:px-24" style={{ background: '#0d0521' }}>
      {/* Section Header */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4A84B)' }} />
          <span className="text-xs tracking-[0.3em] uppercase" style={{ color: '#D4A84B' }}>鉴赏者说</span>
          <div className="w-10 h-px" style={{ background: 'linear-gradient(90deg, #D4A84B, transparent)' }} />
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-light leading-[1.2]">
          鉴赏者的 <em className="not-italic" style={{
            background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>真心话</em>
        </h2>
      </motion.div>

      {/* Testimonial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="p-8 rounded-xl border border-[rgba(240,236,230,0.08)]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(28px)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Stars */}
            <div className="flex gap-1 mb-4" style={{ color: '#D4A84B' }}>
              {Array.from({ length: t.rating }, (_, j) => (
                <Star key={j} size={14} fill="#D4A84B" />
              ))}
              {Array.from({ length: 5 - t.rating }, (_, j) => (
                <Star key={`e${j}`} size={14} style={{ color: 'rgba(240,236,230,0.2)' }} />
              ))}
            </div>

            {/* Text */}
            <p className="font-heading italic text-foreground/60 leading-[1.7] mb-6" style={{ fontSize: '0.95rem' }}>
              "{t.text}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-heading italic"
                style={{
                  background: 'linear-gradient(135deg, rgba(155,127,255,0.12), rgba(212,168,75,0.08))',
                  border: '1px solid rgba(240,236,230,0.08)',
                }}
              >
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-normal" style={{ color: 'var(--text)' }}>{t.name}</p>
                <p className="text-xs" style={{ color: 'rgba(240,236,230,0.25)' }}>{t.date}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
