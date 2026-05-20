import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Brain, Book } from 'lucide-react';
import gsap from 'gsap';
import { ThreeBackground } from '../ThreeBackground';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Parallax effect on mouse move
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      
      gsap.to('.hero-parallax-element', {
        x: x,
        y: y,
        duration: 1,
        ease: 'power2.out',
      });
      
      gsap.to('.hero-parallax-element-reverse', {
        x: -x * 1.5,
        y: -y * 1.5,
        duration: 1.5,
        ease: 'power2.out',
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative w-full min-h-[100vh] flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden" ref={containerRef}>
      <ThreeBackground />
      
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side: Content */}
        <div className="flex flex-col items-start text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium text-sm mb-8 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
          >
            <Sparkles className="w-4 h-4" />
            <span className="flex">LearnLoop v2.0 <span className="hidden sm:inline">&nbsp;is now in Public Beta</span></span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.1] mb-6"
          >
            Your Daily <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Learning Brain.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 mb-10 max-w-lg leading-relaxed"
          >
            Track your CRT learning journey, organize notes with AI, and grow faster with collaborative student communities.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link to="/notebook" className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg flex items-center justify-center hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all">
              Start Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button className="px-8 py-4 bg-gray-50 border border-gray-200 text-[#111827] rounded-2xl font-bold text-lg flex items-center justify-center hover:bg-gray-100 backdrop-blur-md transition-all group">
              <Play className="w-5 h-5 mr-2 text-indigo-400 group-hover:scale-110 transition-transform" />
              Watch Demo
            </button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-12 flex items-center gap-6"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-12 h-12 rounded-full border-2 border-[#0a0a0f]" />
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-yellow-500">
                {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
              </div>
              <span className="text-sm text-gray-600 font-medium">Joined by 10,000+ CRT Students</span>
            </div>
          </motion.div>
        </div>
        
        {/* Right Side: Visuals */}
        <div className="relative w-full h-[600px] hidden lg:block">
          {/* Main Dashboard UI Mock */}
          <motion.div 
            initial={{ opacity: 0, x: 100, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2, type: 'spring' }}
            className="absolute top-10 right-0 w-[550px] h-[400px] bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 hero-parallax-element transform perspective-1000"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="text-xs font-bold text-gray-400">Notebook.app</div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[#111827]">Recent Processing</h3>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md uppercase tracking-wider">All Synced</span>
              </div>
              
              {/* Active Processing Card */}
              <div className="w-full bg-indigo-50 border border-indigo-100 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div>
                    <h4 className="font-bold text-indigo-900 text-sm">React Context API</h4>
                    <p className="text-xs text-indigo-600 mt-1">Extracting concepts from 2 images...</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                </div>
                <div className="w-full h-1.5 bg-indigo-200 rounded-full overflow-hidden relative z-10">
                  <div className="w-[60%] h-full bg-indigo-500 rounded-full" />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="bg-blue-50 text-blue-700 w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2">Day 41</div>
                  <h4 className="font-bold text-[#111827] text-xs mb-1">State Management</h4>
                  <p className="text-[10px] text-gray-500">4 raw files • Processed</p>
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="bg-purple-50 text-purple-700 w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2">Day 40</div>
                  <h4 className="font-bold text-[#111827] text-xs mb-1">Advanced Hooks</h4>
                  <p className="text-[10px] text-gray-500">2 raw files • Processed</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Floating Elements */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute -bottom-10 left-10 w-64 p-5 bg-black/60 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl hero-parallax-element-reverse"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Brain className="w-5 h-5" /></div>
              <h4 className="font-bold text-sm">AI Insight</h4>
            </div>
            <p className="text-xs text-gray-700">Your understanding of <strong>React Hooks</strong> improved by 40% this week!</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8, type: 'spring' }}
            className="absolute top-0 left-20 w-48 p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-2xl hero-parallax-element"
          >
            <div className="flex items-center gap-3">
              <Book className="w-6 h-6 text-[#111827]" />
              <div>
                <h4 className="font-bold text-[#111827] text-sm">Day 42</h4>
                <p className="text-indigo-200 text-xs">Streak Active 🔥</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
