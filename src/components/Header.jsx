import React, { useState } from 'react';
import { Search, Bell, Calendar, Sun, Moon, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ theme, toggleTheme }) => {
  const [showAI, setShowAI] = useState(false);

  return (
    <header className={`h-24 flex items-center justify-between px-8 border-b z-20 backdrop-blur-2xl transition-colors ${
      theme === 'dark' ? 'bg-[#0a0a0f]/80 border-white/5' : 'bg-white/80 border-gray-100 shadow-sm'
    }`}>
      
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl relative group">
        <Search className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
          theme === 'dark' ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-600'
        }`} />
        <input
          type="text"
          placeholder="Search topics, notes, or ask AI..."
          className={`w-full pl-12 pr-16 py-3.5 rounded-2xl text-[15px] outline-none transition-all font-medium ${
            theme === 'dark' 
              ? 'bg-[#12121a] border border-white/5 text-white focus:bg-[#1a1a24] focus:border-indigo-500/50 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:shadow-sm'
          }`}
        />
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md border text-xs font-bold hidden sm:block ${
          theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-500 shadow-sm'
        }`}>
          Ctrl K
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4 ml-8">
        
        {/* AI Assistant Toggle */}
        <button 
          onClick={() => setShowAI(!showAI)}
          className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all border font-bold ${
            theme === 'dark'
              ? showAI 
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
              : showAI
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-700 shadow-sm'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm hover:text-indigo-600'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${showAI ? (theme === 'dark' ? 'animate-pulse text-purple-400' : 'animate-pulse text-indigo-600') : ''}`} />
          <span className="text-sm">Ask AI</span>
        </button>

        <div className={`w-px h-8 hidden sm:block ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`} />

        {/* Calendar */}
        <button className={`p-3 rounded-2xl transition-all hidden sm:block ${
          theme === 'dark' 
            ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
            : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-indigo-600 shadow-sm'
        }`}>
          <Calendar className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-2xl transition-all ${
            theme === 'dark' 
              ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-yellow-400'
              : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-indigo-600 shadow-sm'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className={`p-3 rounded-2xl transition-all relative ${
          theme === 'dark' 
            ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
            : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-indigo-600 shadow-sm'
        }`}>
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* AI Quick Chat Modal */}
      <AnimatePresence>
        {showAI && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute top-28 right-8 w-96 rounded-3xl shadow-2xl p-5 z-50 flex flex-col ${
              theme === 'dark' 
                ? 'bg-[#12121a] border border-purple-500/30'
                : 'bg-white border border-indigo-100 shadow-indigo-500/10'
            }`}
          >
            <div className={`flex justify-between items-center mb-5 border-b pb-4 ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
              <div className={`flex items-center gap-2 font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-indigo-600'}`}>
                <Sparkles className="w-5 h-5" /> Gemini Mentor
              </div>
              <button onClick={() => setShowAI(false)} className={`transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="flex-1 min-h-[220px] mb-4 text-[15px] space-y-4">
              <div className={`p-4 rounded-2xl w-[85%] font-medium ${
                theme === 'dark' ? 'bg-white/5 border border-white/5 text-gray-300' : 'bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-bl-none'
              }`}>
                Hello! Need help understanding a specific topic or summarizing today's notes?
              </div>
            </div>
            
            <div className="relative mt-2">
              <input 
                type="text" 
                placeholder="Ask anything..." 
                className={`w-full rounded-2xl px-5 py-3.5 text-sm outline-none transition-all font-medium ${
                  theme === 'dark' 
                    ? 'bg-white/5 border border-white/10 text-white focus:border-purple-500'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                }`} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
