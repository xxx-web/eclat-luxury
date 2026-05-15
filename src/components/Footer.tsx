import { motion } from 'framer-motion';

export function Footer() {
  const footerLinks = [
    { title: 'Shipping', href: '#' },
    { title: 'Returns', href: '#' },
    { title: 'Care', href: '#' },
    { title: 'Contact', href: '#' },
  ];

  return (
    <footer className="bg-[#0a0a14] border-t border-border py-12 px-6 md:px-16 lg:px-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8"
      >
        {/* Left: Copyright */}
        <div className="text-sm text-foreground/40">
          © 2026 ÉCLAT
        </div>

        {/* Right: Links */}
        <div className="flex items-center gap-8">
          {footerLinks.map((link) => (
            <a
              key={link.title}
              href={link.href}
              className="text-xs uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-colors duration-300"
            >
              {link.title}
            </a>
          ))}
        </div>
      </motion.div>
    </footer>
  );
}
