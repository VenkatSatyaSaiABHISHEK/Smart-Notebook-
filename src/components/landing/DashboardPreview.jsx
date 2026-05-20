import React, { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Activity, Clock, Users, Brain } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DashboardPreview = () => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    gsap.fromTo('.dashboard-preview-card',
      { y: 100, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 1, 
        stagger: 0.2, 
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        }
      }
    );
  }, []);

  return (
    <section className="py-20 w-full relative z-10" ref={containerRef}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Inside the Workspace</h2>
          <p className="text-gray-600 text-lg">A sneak peek into your beautifully organized learning ecosystem.</p>
        </div>

        <div className="relative w-full rounded-3xl p-2 bg-gradient-to-b from-white/10 to-transparent dashboard-preview-card">
          <div className="bg-[#f9fafb] rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Sidebar Mock */}
            {/* Sidebar Mock */}
            <div className="w-full md:w-64 bg-white border-r border-gray-100 p-6 hidden md:flex flex-col">
              <div className="flex gap-2 mb-10">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3 text-[#111827] font-bold bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <Activity className="w-5 h-5 text-indigo-500" /> Dashboard
                </div>
                <div className="flex items-center gap-3 text-gray-500 font-medium p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <Clock className="w-5 h-5" /> Notebook
                </div>
                <div className="flex items-center gap-3 text-gray-500 font-medium p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <Users className="w-5 h-5" /> Community
                </div>
              </div>
            </div>

            {/* Main Area Mock */}
            <div className="flex-1 p-6 md:p-8 bg-[#f9fafb]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-[#111827]">Welcome back, Abhishek 👋</h3>
                  <p className="text-sm text-gray-500">You have 3 raw notes waiting to be processed.</p>
                </div>
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                    A
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Upload Zone */}
                <div className="md:col-span-1">
                  <div className="border-2 border-dashed border-[#d1d5db] bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                    <div className="w-12 h-12 bg-[#f3f4f6] rounded-full flex items-center justify-center mb-3 text-[#111827]">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <h3 className="text-[16px] font-bold text-[#111827] mb-1">Upload Notes</h3>
                    <p className="text-[12px] text-gray-500">PDFs, Images, or Text.</p>
                  </div>
                </div>

                {/* Day Folders Grid */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Folder 1 */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        Day 12
                      </div>
                      <span className="text-[11px] font-bold text-gray-400">Today</span>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#111827] mb-3 leading-tight">
                      Object Oriented Programming
                    </h3>
                    <div className="flex items-center text-[12px] font-medium text-gray-500 border-t border-gray-100 pt-3">
                      3 raw files synced
                    </div>
                  </div>
                  
                  {/* Folder 2 */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        Day 11
                      </div>
                      <span className="text-[11px] font-bold text-gray-400">Yesterday</span>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#111827] mb-3 leading-tight">
                      Advanced Data Structures
                    </h3>
                    <div className="flex items-center text-[12px] font-medium text-gray-500 border-t border-gray-100 pt-3">
                      2 raw files synced
                    </div>
                  </div>

                  {/* Wide Stats Card */}
                  <div className="sm:col-span-2 bg-[#111827] rounded-2xl p-5 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
                    <div className="relative z-10">
                      <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Learning Streak</h4>
                      <div className="text-2xl font-bold flex items-center gap-2">
                        12 Days <span className="text-orange-400 text-lg">🔥</span>
                      </div>
                    </div>
                    <div className="relative z-10 w-24 h-12 flex items-end justify-between gap-1">
                      {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                        <div key={i} className="w-2 bg-indigo-500 rounded-t-sm" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
