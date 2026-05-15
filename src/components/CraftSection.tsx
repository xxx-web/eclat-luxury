import { motion } from 'framer-motion';
import { useLazyVideo } from '../hooks/useLazyVideo';
import { BlurText } from './BlurText';

const stats = [
  { value: '18k', label: 'Solid gold craftsmanship' },
  { value: 'VS+', label: 'Selected diamond clarity' },
  { value: '100%', label: 'Certified authenticity' },
  { value: 'Worldwide', label: 'White-glove delivery' },
];

export function CraftSection() {
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
          className="w-full h-full object-cover opacity-50"
        >
          <source 
            src="https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Craftsmanship%20%20Stats.mp4" 
            type="video/mp4" 
          />
        </video>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[#0d0521]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="luxury-glass p-12 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block px-3 py-1 rounded-full mb-8 border border-primary/30"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-primary/80">
              Craft & Trust
            </span>
          </motion.div>

          {/* Heading */}
          <BlurText
            text="Precision you can feel before you can name it."
            className="font-heading italic text-4xl md:text-5xl text-foreground mb-8"
            delay={0.2}
          />

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base font-light text-foreground/60 leading-relaxed mb-16"
          >
            From nacre to setting, every detail is shaped to preserve rarity, comfort, and enduring value.
          </motion.p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="font-heading italic text-4xl md:text-5xl text-primary mb-3">
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-[0.15em] text-foreground/60">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
