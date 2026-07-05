import React from 'react';
import { Sparkles, Code, Share, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-[#050508] relative overflow-hidden pt-20 pb-10 border-t border-white/10">
      {/* Decorative Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-white">VidyaSetu Ai</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Empowering students to learn smarter, together. The ultimate AI-powered workspace for CRT preparation.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/10">
                <Share className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/10">
                <Code className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/10">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#ai" className="hover:text-white transition-colors">AI Intelligence</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#community" className="hover:text-white transition-colors">Community</a></li>
              <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-sm text-gray-500">
          <p>© 2026 VidyaSetu Ai Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span>Built with</span>
            <span className="text-red-500 animate-pulse">♥</span>
            <span>for students.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
