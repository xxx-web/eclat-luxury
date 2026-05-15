import { motion } from 'framer-motion';
import { useLazyVideo } from '../hooks/useLazyVideo';
import { BlurText } from './BlurText';

export function BrandStorySection() {
  const videoRef = useLazyVideo();
  
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden py-32">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source 
            src="https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Maison%20Story.mp4" 
            type="video/mp4" 
          />
        </video>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0521]/70 via-[#0d0521]/80 to-[#0d0521]/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="luxury-glass inline-block px-3 py-1 rounded-full mb-6">
            <span className="text-xs tracking-[0.3em] uppercase text-primary/80">
              Our Maison
            </span>
          </div>

          {/* Heading */}
          <BlurText
            text="A study in light, rarity, and restraint."
            className="font-heading italic text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-[1.1]"
            delay={0.2}
          />

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-lg font-light text-foreground/60 leading-relaxed mb-12"
          >
            Born from the poetry of old-master portraiture, each piece is designed 
            to feel collected, not consumed — treasured not for trend, but for 
            atmosphere, memory, and permanence.
          </motion.p>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="luxury-glass px-8 py-4 rounded-full text-foreground hover:text-primary transition-all duration-500"
          >
            <span className="flex items-center gap-3">
              Discover the Story
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"
      />
    </section>
  );
}
