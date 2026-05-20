import React from 'react';
import { BookOpen, Brain, ScanLine, Users, LineChart, Target, Layers, CalendarCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
  const features = [
    {
      title: "Smart Notebook",
      desc: "Rich text editor tailored for students. Embed code, math formulas, and daily learning logs.",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "AI Explanation",
      desc: "Stuck on a concept? One click transforms your raw notes into a beginner-friendly explanation.",
      icon: Brain,
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "OCR Scanner",
      desc: "Upload images of whiteboard notes or textbooks, and instantly extract text to your notebook.",
      icon: ScanLine,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Community Sharing",
      desc: "Share your top notes with the cohort. Learn from others, comment, and grow together.",
      icon: Users,
      color: "from-orange-500 to-amber-500"
    },
    {
      title: "Learning Analytics",
      desc: "Visual heatmaps and daily streaks keep you motivated for placement preparation.",
      icon: LineChart,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "AI Recommendations",
      desc: "Based on what you learn, the AI predicts the next best topic to master.",
      icon: Target,
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "Topic Visualization",
      desc: "See a network graph of topics you've covered, identifying gaps in your knowledge.",
      icon: Layers,
      color: "from-fuchsia-500 to-pink-500"
    },
    {
      title: "Daily Tracking",
      desc: "Auto-organized timeline (Day 1, Day 2) ensures you never lose track of your progress.",
      icon: CalendarCheck,
      color: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <section id="features" className="py-24 w-full relative z-10 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold tracking-widest text-indigo-400 uppercase mb-3">Platform Features</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-[#111827]">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">succeed.</span></h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Hover Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-6 shadow-lg relative z-10`}>
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-[#111827]" />
                </div>
              </div>
              
              <h4 className="text-xl font-bold text-[#111827] mb-2 relative z-10">{feature.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed relative z-10">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
