import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';

const AnalyticsSection = () => {
  return (
    <section className="py-24 w-full relative bg-[#f9fafb] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold mb-4 border border-emerald-500/20">
            <BarChart3 className="w-4 h-4 mr-2" />
            Growth Analytics
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Visualize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Progress.</span></h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Turn your daily learning logs into beautiful, actionable data. Know exactly where your strengths lie before your placement interviews.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
            <h3 className="text-xl font-bold text-[#111827] mb-6">Learning Consistency</h3>
            
            {/* Fake Chart Graphics */}
            <div className="h-64 flex items-end justify-between gap-2 border-b border-gray-200 pb-4 relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="w-full h-px bg-white/20" />
                <div className="w-full h-px bg-white/20" />
                <div className="w-full h-px bg-white/20" />
                <div className="w-full h-px bg-white/20" />
              </div>
              
              {/* Bars */}
              {[30, 45, 60, 40, 80, 65, 90, 75, 100, 85, 95, 60].map((h, i) => (
                <div key={i} className="w-full relative group">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h} hrs
                  </div>
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className="w-full bg-gradient-to-t from-emerald-600/50 to-teal-400 rounded-t-sm hover:brightness-125 transition-all cursor-pointer"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500 font-mono">
              <span>Week 1</span>
              <span>Week 4</span>
              <span>Week 8</span>
              <span>Week 12</span>
            </div>
          </motion.div>

          {/* Side Stats */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 border border-gray-200 flex flex-col h-[calc(50%-12px)]"
            >
              <h4 className="text-sm font-medium text-gray-600 mb-2">Current Streak</h4>
              <div className="text-4xl font-black text-orange-400 flex items-center mb-2">
                42 <span className="text-lg ml-2">Days</span>
              </div>
              <p className="text-xs text-gray-500 mt-auto">Top 5% of your community</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 border border-gray-200 flex flex-col h-[calc(50%-12px)] relative overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 p-4 opacity-10">
                <Activity className="w-24 h-24 text-blue-500" />
              </div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Strongest Topic</h4>
              <div className="text-2xl font-bold text-blue-400 mb-2">
                Data Structures
              </div>
              <p className="text-xs text-gray-500 mt-auto">Based on 14 recent notes</p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;
