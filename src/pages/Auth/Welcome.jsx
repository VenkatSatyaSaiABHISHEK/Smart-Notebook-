import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../../contexts/AuthContext';

const Welcome = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      const userCred = await loginWithGoogle();
      // If new user, they might need onboarding, but AuthContext takes them to /dashboard naturally
      // Actually protected routes will take over, let's just push to /dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to sign in with Google:", error);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      
      gsap.to('.welcome-parallax', {
        x: x,
        y: y,
        duration: 1,
        ease: 'power2.out',
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center relative overflow-hidden" ref={containerRef}>
      {/* Background Mesh */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[150px] welcome-parallax" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[150px] welcome-parallax" />
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] rounded-full bg-pink-600/10 blur-[100px] welcome-parallax" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 md:p-12 bg-white/80 border border-gray-200/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] backdrop-blur-2xl rounded-3xl text-center mx-4"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_10px_20px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3 text-[#111827]">Welcome to LearnLoop</h1>
        <p className="text-[#6b7280] text-sm mb-10 leading-relaxed font-medium">
          Your AI-powered learning and collaboration ecosystem. Track, organize, and grow.
        </p>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleSignIn}
            className="w-full relative group p-[1px] rounded-xl overflow-hidden shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-100" />
            <div className="relative w-full h-full bg-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-all group-hover:bg-opacity-0 group-hover:text-white">
              <svg className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"/>
              </svg>
              <span className="font-bold text-gray-800 group-hover:text-white transition-colors">Continue with Google</span>
            </div>
          </button>

          <Link to="/login" className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700 font-bold transition-all shadow-sm">
            Continue with Email
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400 font-bold tracking-wider">OR</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <Link to="/" className="mt-8 flex items-center justify-center text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors group">
          Explore as Guest 
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
};

export default Welcome;
