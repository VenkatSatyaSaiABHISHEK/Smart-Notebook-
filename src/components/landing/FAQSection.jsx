import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
  const faqs = [
    {
      q: "How does the AI explanation work?",
      a: "Our AI uses Google's Gemini models to analyze your raw notes, identify key concepts, and restructure them into easy-to-understand explanations complete with analogies and code examples."
    },
    {
      q: "Can I upload images of handwritten notes?",
      a: "Yes! LearnLoop features a built-in OCR (Optical Character Recognition) scanner. Just upload an image of your whiteboard or notebook, and we'll extract the text for you."
    },
    {
      q: "Is this application available offline?",
      a: "Absolutely. LearnLoop is built as a Progressive Web App (PWA). You can install it on your device and access your notes even without an internet connection."
    },
    {
      q: "Can communities share notes with each other?",
      a: "Yes. You can publish specific notes to your Community Hub. Other students can read, like, comment, and save your notes to their own workspace."
    },
    {
      q: "Is LearnLoop really free?",
      a: "The core notebook features and joining communities are completely free. Advanced AI features and unlimited usage require a Pro subscription."
    }
  ];

  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="docs" className="py-24 w-full bg-[#f9fafb] relative z-10">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Everything you need to know about LearnLoop.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button 
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
              >
                <span className="font-bold text-[#111827] pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
