import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = () => {
  const reviews = [
    { name: 'Karan Rao', role: 'CS Student', text: "This made CRT preparation so much easier. I no longer waste hours organizing my handwritten notes." },
    { name: 'Sneha Patel', role: 'Frontend Developer', text: "The AI explanations saved my time when I was struggling with advanced React patterns. It's like having a 24/7 mentor." },
    { name: 'Arjun Singh', role: 'Placed at Amazon', text: "Community learning helped me grow faster. Seeing what topics my peers were studying kept me motivated." },
    { name: 'Neha Gupta', role: 'Engineering Lead', text: "The UI is so beautiful I actually want to study every day. The dark mode and animations are top tier." }
  ];

  return (
    <section className="py-24 w-full bg-[#050508] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-4xl font-extrabold mb-4">Loved by Students.</h2>
        <p className="text-gray-600">Join thousands of learners achieving their placement goals.</p>
      </div>

      {/* Auto-scrolling carousel logic can be done with CSS animation or Framer Motion */}
      <div className="flex overflow-hidden relative w-full">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          className="flex gap-6 w-max px-6"
        >
          {/* Double the array to create seamless loop */}
          {[...reviews, ...reviews].map((review, i) => (
            <div key={i} className="w-80 md:w-96 p-8 bg-white rounded-3xl border border-gray-100 flex flex-col justify-between shrink-0 hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing">
              <div className="flex text-yellow-500 mb-6">
                {'★★★★★'.split('').map((star, idx) => <span key={idx}>{star}</span>)}
              </div>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">"{review.text}"</p>
              <div className="flex items-center gap-3">
                <img src={`https://ui-avatars.com/api/?name=${review.name.replace(' ', '+')}&background=random&color=fff`} alt={review.name} className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="font-bold text-[#111827] text-sm">{review.name}</h4>
                  <p className="text-xs text-gray-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
