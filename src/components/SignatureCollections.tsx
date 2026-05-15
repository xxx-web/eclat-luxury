import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const collections = [
  {
    name: 'Pearls',
    description: 'Round, luminous, and quietly commanding.',
    image: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Pearls%20Collection.png',
    href: '#pearls',
    cta: 'Explore Pearls',
  },
  {
    name: 'Fine Jewelry',
    description: 'Diamond fire, rendered with discipline.',
    image: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Fine%20Jewelry%20Collection.png',
    href: '#fine-jewelry',
    cta: 'View Fine Jewelry',
  },
  {
    name: 'High Jewelry',
    description: 'Collector pieces for evening, memory, and ceremony.',
    image: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/High%20Jewelry%20Collection.png',
    href: '#high-jewelry',
    cta: 'Enter High Jewelry',
  },
];

export function SignatureCollections() {
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
              Collections
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading italic text-4xl md:text-5xl lg:text-6xl text-foreground mb-6"
          >
            Signature Collections
          </motion.h2>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="luxury-glass group cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="font-heading italic text-2xl text-foreground mb-3">
                  {collection.name}
                </h3>
                <p className="text-sm text-foreground/60 font-light leading-relaxed mb-6">
                  {collection.description}
                </p>
                <button className="text-primary hover:text-primary/80 transition-colors duration-300 flex items-center gap-2 group/btn">
                  <span>{collection.cta}</span>
                  <ArrowRight 
                    size={16} 
                    className="group-hover/btn:translate-x-2 transition-transform duration-300" 
                  />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
