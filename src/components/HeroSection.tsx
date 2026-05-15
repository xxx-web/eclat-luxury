import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useLazyVideo } from '../hooks/useLazyVideo';
import { BlurText } from './BlurText';

export function HeroSection() {
  const videoRef = useLazyVideo();
  
  return (
    <section className="relative min-h-[1000px] flex items-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source 
            src="https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/hero.mp4" 
            type="video/mp4" 
          />
        </video>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Animated Background Decorations */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-gold/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block luxary-glass px-4 py-2 rounded-full mb-8"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-primary/80">
              New + The Pearl Reimagined
            </span>
          </motion.div>

          {/* Heading */}
          <BlurText
            text="Where Masterpiece Meets Desire"
            className="font-heading italic text-6xl md:text-7xl lg:text-[6.5rem] text-foreground tracking-[-2px] leading-[0.85] mb-8"
            delay={0.4}
          />

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg md:text-xl text-foreground/60 font-light leading-relaxed mb-12 max-w-2xl"
          >
            A maison of pearls, diamonds, and sculpted light — inspired by silence, 
            devotion, and the unforgettable magnetism of the gaze.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <button className="luxury-glass px-8 py-4 rounded-full text-foreground hover:text-primary transition-all duration-500 group">
              <span className="flex items-center gap-3">
                Shop High Jewelry
                <ArrowRight 
                  size={18} 
                  className="group-hover:translate-x-2 transition-transform duration-300" 
                />
              </span>
            </button>
            
            <button className="luxury-glass px-8 py-4 rounded-full text-foreground/60 hover:text-foreground transition-all duration-500 group">
              <span className="flex items-center gap-3">
                <Play size={18} />
                Book a Private Appointment
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
            Pearls. Diamonds. Objects of devotion.
          </motion.p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-primary/60 to-transparent" />
      </motion.div>
    </section>
  );
}
