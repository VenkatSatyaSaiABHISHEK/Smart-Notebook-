import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      desc: 'Perfect for getting started with smart note-taking.',
      features: ['Up to 50 Notebooks', 'Basic Text & Code Editor', 'Join 2 Communities', 'Community Support'],
      buttonText: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/mo',
      desc: 'Unlock the full power of AI for your CRT preparation.',
      features: ['Unlimited Notebooks', 'Advanced AI Explanations', 'AI Quizzes & Flashcards', 'OCR Image Scanning', 'Priority Support'],
      buttonText: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Community Plus',
      price: '$24',
      period: '/mo',
      desc: 'For power users and study group leaders.',
      features: ['Everything in Pro', 'Create Unlimited Communities', 'Advanced Analytics Dashboard', 'Custom Branding', 'API Access'],
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 w-full bg-[#f9fafb] relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Simple, Transparent Pricing.</h2>
          <p className="text-gray-600">Invest in your learning. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-3xl bg-white flex flex-col hover:-translate-y-2 transition-transform duration-300 ${plan.popular ? 'border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'border border-gray-200'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-[#111827] px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-6 h-10">{plan.desc}</p>
              
              <div className="flex items-baseline mb-8">
                <span className="text-5xl font-black">{plan.price}</span>
                {plan.period && <span className="text-gray-500 ml-1">{plan.period}</span>}
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-start">
                    <Check className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
                    <span className="text-gray-700 text-sm">{feat}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-[#111827]' : 'bg-gray-50 hover:bg-gray-100 text-[#111827] border border-gray-200'}`}>
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
