import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Community', href: '#community' },
    { name: 'AI Intelligence', href: '#ai' },
    { name: 'Docs', href: '#docs' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-4' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-center justify-between rounded-2xl transition-all duration-300 ${
          scrolled ? 'bg-gray-50 backdrop-blur-md border border-gray-200 p-3 shadow-xl' : 'bg-transparent border-transparent p-0'
        }`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group ml-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 overflow-hidden">
              <Sparkles className="w-5 h-5 text-[#111827] relative z-10" />
              <div className="absolute inset-0 bg-white/20 blur-md group-hover:opacity-100 opacity-0 transition-opacity" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#111827]">VidyaSetu Ai</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="px-4 py-2 text-sm text-gray-700 hover:text-[#111827] transition-colors relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-4 right-4 h-px bg-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-3 mr-2">
            <Link to="/try" className="px-4 py-2 text-sm font-semibold text-indigo-650 hover:text-indigo-850 transition-colors">
              Try Demo
            </Link>
            <Link to="/notebook" className="px-4 py-2 text-sm font-medium text-[#111827] hover:text-indigo-300 transition-colors">
              Log in
            </Link>
            <Link to="/notebook" className="px-5 py-2 text-sm font-semibold bg-white text-black rounded-xl hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-[#111827]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-4 right-4 mt-2 p-4 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl md:hidden"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map(link => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-gray-700 hover:text-[#111827] px-2 py-2 text-lg font-medium border-b border-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <Link to="/try" className="w-full py-3 text-center rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-755 font-bold" onClick={() => setMobileMenuOpen(false)}>Try Demo</Link>
                <Link to="/notebook" className="w-full py-3 text-center rounded-xl bg-gray-50 text-[#111827] font-medium border border-gray-200">Log in</Link>
                <Link to="/notebook" className="w-full py-3 text-center rounded-xl bg-white text-black font-semibold">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
