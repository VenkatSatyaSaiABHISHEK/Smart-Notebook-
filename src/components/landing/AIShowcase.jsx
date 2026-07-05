import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, ArrowRight } from 'lucide-react';

const AIShowcase = () => {
  return (
    <section id="ai" className="py-24 w-full bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-purple-900/10 to-[#0a0a0f] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Content */}
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold mb-6 border border-purple-500/20">
              <Brain className="w-4 h-4 mr-2" />
              Powered by Gemini AI
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Your Personal <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AI Learning Mentor.</span></h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Upload rough notes or code snippets, and watch the AI instantly transform them into beautifully formatted explanations, complete with analogies, examples, and practice quizzes.
            </p>
            
            <ul className="space-y-4 mb-10">
              {['Transforms messy notes into structured guides', 'Generates topic-specific quizzes instantly', 'Recommends next learning steps'].map((item, i) => (
                <li key={i} className="flex items-start">
                  <div className="mt-1 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mr-3 shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-gray-300 font-medium">{item}</span>
                </li>
              ))}
            </ul>
            
            <button className="px-6 py-3 rounded-xl bg-white hover:bg-gray-100 text-black font-extrabold transition-all hover:scale-105 shadow-md flex items-center select-none cursor-pointer">
              Explore AI Features <ArrowRight className="w-4 h-4 ml-2 text-indigo-600" />
            </button>
          </div>
          
          {/* Interactive Animation Showcase */}
          <div className="relative h-[500px] w-full rounded-3xl border border-gray-800 bg-[#12121a] backdrop-blur-md p-6 flex flex-col justify-center shadow-2xl overflow-hidden">
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            
            {/* Fake Raw Note */}
            <motion.div 
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: [1, 1, 0, 0], y: [0, 0, -20, -20], scale: [1, 1, 0.9, 0.9] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-6 right-6 top-1/2 -translate-y-1/2 p-6 rounded-2xl bg-[#1a1a24] font-mono text-sm text-gray-400 border border-gray-800"
            >
              <div className="flex items-center text-xs text-gray-500 mb-3 border-b border-gray-800 pb-2">RAW NOTE INPUT</div>
              "hooks in react are confusing. useState is like variables? useEffect is for api calls I think..."
            </motion.div>
            
            {/* Processing State */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0, 1, 0], scale: [0.8, 0.8, 1, 1.2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            >
              <Sparkles className="w-12 h-12 text-purple-400 animate-spin-slow mb-2" />
              <span className="text-xs font-bold text-purple-400 tracking-widest">AI EXPLAINING...</span>
            </motion.div>
            
            {/* AI Output */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 0, 0, 1], y: [20, 20, 20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-6 right-6 top-1/2 -translate-y-1/2 p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
            >
              <div className="flex items-center text-xs text-purple-300 font-bold mb-3 border-b border-purple-500/20 pb-2">
                <Brain className="w-4 h-4 mr-2" /> AI EXPLANATION
              </div>
              <h3 className="text-lg font-bold text-white mb-2">React Hooks: Demystified 🚀</h3>
              <p className="text-sm text-purple-100 mb-3">
                <strong className="text-purple-300">useState</strong> is indeed like a variable, but it's a <em>memory box</em> for your component. When it changes, React knows to re-draw the screen!
              </p>
              <p className="text-sm text-purple-100">
                <strong className="text-purple-300">useEffect</strong> is like an alarm clock. It triggers actions (like API calls) when specific things in your component change.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AIShowcase;
