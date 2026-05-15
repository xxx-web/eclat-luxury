import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { useLazyVideo } from '../hooks/useLazyVideo';
import { BlurText } from './BlurText';

export function ClosingCTASection() {
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
            src="https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Closing%20CTA.mp4" 
            type="video/mp4" 
          />
        </video>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[#0d0521]/70" />
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
          {/* Heading */}
          <BlurText
            text="Enter the maison."
            className="font-heading italic text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-[1.1]"
            delay={0.2}
          />

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-foreground/60 font-light leading-relaxed mb-12"
          >
            Discover the collection, or book a private appointment for a more intimate way to explore the pieces.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <button className="luxury-glass px-8 py-4 rounded-full text-foreground hover:text-primary transition-all duration-500 group">
              <span className="flex items-center gap-3">
                Shop the Collection
                <ArrowRight 
                  size={18} 
                  className="group-hover:translate-x-2 transition-transform duration-300" 
                />
              </span>
            </button>
            
            <button className="luxury-glass px-8 py-4 rounded-full text-foreground hover:text-primary transition-all duration-500 group">
              <span className="flex items-center gap-3">
                <Calendar size={18} />
                Book Appointment
              </span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
