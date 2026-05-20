import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Map, Star, Target, Zap, ChevronRight, MessageSquare, Code } from 'lucide-react';

const AIIntelligence = () => {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto font-sans h-full flex flex-col">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-50 border border-indigo-100 shadow-sm text-indigo-600 mb-6 rotate-3">
          <Brain className="w-10 h-10 -rotate-3" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">AI Learning Intelligence</h1>
        <p className="text-gray-500 text-lg font-medium leading-relaxed">Your personal AI mentor that analyzes your learning patterns, builds custom roadmaps, and helps you master complex topics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Left Column: AI Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="font-extrabold text-xl mb-6 flex items-center text-gray-900 tracking-tight">
              <Zap className="w-6 h-6 mr-3 text-amber-500" />
              Quick AI Tools
            </h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-gray-200 group">
                <span className="flex items-center text-[15px] font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                  <Map className="w-5 h-5 mr-4 text-blue-500" />
                  Generate Roadmap
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-gray-200 group">
                <span className="flex items-center text-[15px] font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                  <Target className="w-5 h-5 mr-4 text-rose-500" />
                  Create Custom Quiz
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-gray-200 group">
                <span className="flex items-center text-[15px] font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                  <Star className="w-5 h-5 mr-4 text-amber-500" />
                  Generate Flashcards
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-[2rem] border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/50 rounded-full blur-[40px] pointer-events-none" />
            <h3 className="font-extrabold text-xl mb-3 text-indigo-950 tracking-tight relative z-10">Weekly AI Summary</h3>
            <p className="text-[15px] font-medium text-indigo-800/80 mb-6 relative z-10 leading-relaxed">You've focused heavily on React hooks this week. Your understanding of useEffect seems solid based on your notes.</p>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-indigo-900">Retention Score</span>
                <span className="text-emerald-600 font-black">85%</span>
              </div>
              <div className="w-full h-2.5 bg-indigo-200/50 rounded-full overflow-hidden border border-indigo-200">
                <div className="w-[85%] h-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Chat/Mentor */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[700px] overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white rounded-full"></div>
              </div>
              <div className="ml-4">
                <h3 className="font-extrabold text-gray-900 text-[16px]">LearnLoop Mentor AI</h3>
                <p className="text-[12px] font-bold text-emerald-600 mt-0.5">Online & Ready</p>
              </div>
            </div>
            <button className="p-3 bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl transition-all shadow-sm">
              <Code className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/30 bg-blend-overlay">
            
            <div className="flex items-start max-w-[85%]">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mr-4 shadow-sm shadow-indigo-500/20">
                <Brain className="w-5 h-5" />
              </div>
              <div className="bg-white p-5 rounded-3xl rounded-tl-sm border border-gray-200 shadow-sm">
                <p className="text-[15px] font-medium text-gray-800 leading-relaxed">Hi there! I noticed you were struggling with the concept of <span className="text-indigo-600 font-extrabold bg-indigo-50 px-1.5 py-0.5 rounded">Closures in JavaScript</span> in your last note. Would you like me to explain it with a simple analogy?</p>
              </div>
            </div>

            <div className="flex items-start max-w-[85%] ml-auto justify-end">
              <div className="bg-indigo-600 p-5 rounded-3xl rounded-tr-sm shadow-md shadow-indigo-500/20">
                <p className="text-[15px] font-semibold text-white leading-relaxed">Yes please! I don't get how the inner function remembers variables.</p>
              </div>
            </div>

            <div className="flex items-start max-w-[85%]">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mr-4 shadow-sm shadow-indigo-500/20">
                <Brain className="w-5 h-5" />
              </div>
              <div className="bg-white p-5 rounded-3xl rounded-tl-sm border border-gray-200 shadow-sm space-y-4 w-full">
                <p className="text-[15px] font-bold text-gray-900">Imagine a closure like a backpack 🎒</p>
                <p className="text-[15px] font-medium text-gray-600 leading-relaxed">When a function is created inside another function, it gets a "backpack" that stores all the variables from its parent function.</p>
                <div className="bg-gray-900 p-4 rounded-2xl font-mono text-[13px] text-gray-300 border border-gray-800 shadow-inner">
                  <span className="text-pink-400">function</span> <span className="text-blue-400">outer</span>() {'{\n'}
                  {'  '}<span className="text-purple-400">let</span> secret = <span className="text-amber-300">"backpack content"</span>;{'\n'}
                  {'  '}<span className="text-pink-400">return function</span> <span className="text-blue-400">inner</span>() {'{\n'}
                  {'    '}console.log(secret); <span className="text-gray-500">// Can still access it!</span>{'\n'}
                  {'  }\n'}
                  {'}'}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-5 border-t border-gray-100 bg-white">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Ask about any topic, request a quiz, or paste code..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-6 pr-16 py-4 text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
              />
              <button className="absolute right-2 p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIIntelligence;
