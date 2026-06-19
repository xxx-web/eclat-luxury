import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function BrandStorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="story" className="py-28 px-6 md:px-16 lg:px-24" style={{ background: 'linear-gradient(135deg, rgba(26,26,46,0.4), rgba(13,5,33,0.8))' }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center"
      >
        {/* Image */}
        <div
          className="relative rounded-xl overflow-hidden aspect-[4/5] border border-border"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 10% 50%, rgba(155,127,255,0.07) 0%, transparent 70%)' }}
        >
          <img
            src="/images/eclat_brand.png"
            alt="ÉCLAT 品牌故事"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(155,127,255,0.08), transparent 60%)', zIndex: 1 }} />
          
          {/* Stats overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-[2] p-5 rounded-xl" style={{ background: 'rgba(13,5,33,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(240,236,230,0.08)' }}>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { num: '15+', label: '全球甄选' },
                { num: '50+', label: '匠心工艺' },
                { num: '99%', label: '鉴赏满意' },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    className="font-heading text-xl"
                    style={{
                      background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {s.num}
                  </div>
                  <div className="text-[0.65rem] tracking-[0.15em] uppercase text-foreground/50 mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px" style={{ background: '#D4A84B', opacity: 0.6 }} />
            <span className="text-[0.7rem] tracking-[0.3em] uppercase" style={{ color: '#D4A84B' }}>品牌故事</span>
          </div>

          <h2 className="font-heading text-3xl md:text-4xl font-light leading-[1.2] mb-6">
            匠心甄选，<br />
            <em className="not-italic" style={{
              background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>永恒之美</em>
          </h2>

          <p className="text-sm leading-[1.9] mb-6" style={{ color: 'rgba(240,236,230,0.5)' }}>
            自创立以来，ÉCLAT 始终致力于甄选全球奢品，将匠心工艺与当代美学完美交融。每一件臻品，皆源自对美的执着追求，为品味独运的鉴赏家呈现永恒之选。
          </p>
          <p className="text-sm leading-[1.9] mb-8" style={{ color: 'rgba(240,236,230,0.5)' }}>
            我们的匠师团队，以数十年匠心独运，甄选全球顶级材质，将每一处细节雕琢至臻美。这不仅是奢品，更是一种生活艺术，一种对永恒之美的虔诚礼赞。
          </p>

          <button
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-xs tracking-[0.15em] uppercase transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(155,127,255,0.15), rgba(212,168,75,0.1))',
              border: '1px solid rgba(155,127,255,0.3)',
              color: 'var(--text)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,127,255,0.25), rgba(212,168,75,0.2))';
              e.currentTarget.style.borderColor = 'rgba(155,127,255,0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(155,127,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,127,255,0.15), rgba(212,168,75,0.1))';
              e.currentTarget.style.borderColor = 'rgba(155,127,255,0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            探索品牌故事
            <span style={{ transition: 'transform 0.3s', display: 'inline-block' }}>→</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}
