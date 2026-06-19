import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const categories = [
  { name: '珠宝臻品', img: '/images/high_end_jewelry.png', count: '128 件臻品', href: '#jewelry' },
  { name: '香水雅韵', img: '/images/perfumer_perfume.png', count: '86 款香氛', href: '#perfume' },
  { name: '奢华手袋', img: '/images/luxury_handbag.png', count: '64 款手袋', href: '#bag' },
];

export function CategorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      id="categories"
      className="py-28 px-6 md:px-16 lg:px-24"
      style={{ background: 'linear-gradient(180deg, #0d0521, rgba(26,26,46,0.5), #0d0521)' }}
    >
      {/* Section Header */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-gold" />
          <span className="text-xs tracking-[0.3em] uppercase text-gold">臻选分类</span>
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-gold" />
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-light italic">
          探索{' '}
          <em
            className="not-italic"
            style={{
              background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            臻选
          </em>{' '}
          世界
        </h2>
      </motion.div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {categories.map((cat, i) => (
          <motion.a
            key={cat.name}
            href={cat.href}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="group relative rounded-xl overflow-hidden aspect-[3/4] border border-border hover:border-purple/30 transition-all duration-500"
            style={{ background: 'rgba(26,26,46,0.6)' }}
          >
            {/* Background image with zoom on hover */}
            <img
              src={cat.img}
              alt={cat.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#0d0521]/95" />

            {/* Subtle border glow */}
            <div className="absolute inset-0 border border-gold/10 rounded-xl pointer-events-none" />

            {/* Text content */}
            <div className="absolute inset-0 flex flex-col items-center justify-end p-8 z-10">
              <h3 className="font-heading text-2xl font-normal mb-2 text-foreground">
                {cat.name}
              </h3>
              <p className="text-sm text-foreground/70 tracking-[0.15em]">{cat.count}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
