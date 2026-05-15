import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: 'The kind of jewelry that changes the posture of the person wearing it.',
    author: 'Elisa Moreau',
    title: 'Fashion Editor',
  },
  {
    quote: 'Every piece feels less like a purchase and more like an acquisition.',
    author: 'Nina Hart',
    title: 'Collector',
  },
  {
    quote: 'Quiet, exacting, unforgettable — luxury without performance.',
    author: 'Camille Ross',
    title: 'Creative Director',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-32 px-6 md:px-16 lg:px-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto"
      >
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block luxury-glass px-3 py-1 rounded-full mb-6"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-primary/80">
              Editorial Voices
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading italic text-4xl md:text-5xl text-foreground mb-6"
          >
            Admired in private. Remembered in public.
          </motion.h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="luxury-glass p-8 md:p-10"
            >
              {/* Quote Icon */}
              <div className="text-4xl text-primary/30 mb-6 font-serif">"</div>
              
              {/* Quote */}
              <p className="text-lg font-light text-foreground/80 leading-relaxed mb-8 italic">
                {testimonial.quote}
              </p>
              
              {/* Author */}
              <div className="border-t border-border pt-6">
                <p className="text-sm font-medium text-foreground">
                  — {testimonial.author}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-primary/60 mt-1">
                  {testimonial.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
