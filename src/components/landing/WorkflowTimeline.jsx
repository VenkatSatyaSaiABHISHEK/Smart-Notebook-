import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Brain, Folders, Share2, TrendingUp } from 'lucide-react';

const WorkflowTimeline = () => {
  const steps = [
    { icon: Upload, title: "Upload Notes", desc: "Paste text, code, or use OCR to scan handwritten notes.", color: "bg-blue-500" },
    { icon: Brain, title: "AI Analyzes Learning", desc: "Gemini AI processes the raw data into structured knowledge.", color: "bg-purple-500" },
    { icon: Folders, title: "Organize Topics", desc: "Notes are auto-tagged and placed in your daily timeline.", color: "bg-pink-500" },
    { icon: Share2, title: "Share With Community", desc: "Publish to your batch's feed to help others and get feedback.", color: "bg-orange-500" },
    { icon: TrendingUp, title: "Track Growth", desc: "Watch your analytics soar as you master new skills daily.", color: "bg-emerald-500" }
  ];

  return (
    <section className="py-24 w-full relative z-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">How VidyaSetu Ai Works</h2>
          <p className="text-gray-600">A seamless workflow designed for peak productivity.</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-1 bg-gray-100 -translate-x-1/2 rounded-full" />

          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex items-center mb-12 last:mb-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
            >
              {/* Desktop Empty Half */}
              <div className="hidden md:block md:w-1/2" />
              
              {/* Center Node */}
              <div className="absolute left-[28px] md:left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#f9fafb] border-4 border-[#12121a] flex items-center justify-center z-10">
                <div className={`w-8 h-8 rounded-full ${step.color} flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]`}>
                  <step.icon className="w-4 h-4 text-[#111827]" />
                </div>
              </div>

              {/* Content Card */}
              <div className={`w-full pl-20 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 text-left md:text-right' : 'md:pl-12 text-left'}`}>
                <div className="bg-white border border-gray-100 p-6 rounded-2xl hover:border-white/20 transition-colors shadow-lg group">
                  <h3 className="text-xl font-bold text-[#111827] mb-2 group-hover:text-indigo-400 transition-colors">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowTimeline;
