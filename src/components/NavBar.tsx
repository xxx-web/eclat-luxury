import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Heart, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'New Arrivals', href: '#new' },
    { label: 'Collections', href: '#collections' },
    { label: 'Maison', href: '#brand-story' },
    { label: 'Craft', href: '#craft' },
    { label: 'Appointment', href: '#appointment' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0d0521]/95 backdrop-blur-md py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 flex items-center justify-between">
        {/* Logo */}
        <div className="luxury-glass rounded-full px-4 py-2">
          <span className="font-heading italic text-2xl text-primary">ÉCLAT</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm tracking-[0.12em] uppercase text-foreground/60 hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="luxury-glass w-10 h-10 rounded-full flex items-center justify-center text-foreground/60 hover:text-primary transition-colors">
            <Search size={18} />
          </button>
          
          <button className="luxury-glass w-10 h-10 rounded-full flex items-center justify-center text-foreground/60 hover:text-red-400 transition-colors relative">
            <Heart size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
              0
            </span>
          </button>
          
          <button className="luxury-glass w-10 h-10 rounded-full flex items-center justify-center text-foreground/60 hover:text-primary transition-colors relative">
            <ShoppingCart size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-primary-foreground">
              0
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden luxury-glass w-10 h-10 rounded-full flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#0d0521]/98 backdrop-blur-md border-b border-border"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-lg tracking-[0.1em] uppercase text-foreground/60 hover:text-foreground transition-colors border-b border-border pb-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
