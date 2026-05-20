import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Share2, TrendingUp, Users } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CommunityShowcase = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo('.community-card',
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8, 
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        }
      }
    );
  }, []);

  const posts = [
    {
      user: 'Priya Sharma',
      avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=ec4899&color=fff',
      role: 'Top Learner',
      title: 'Graph Algorithms Master Guide',
      content: 'I compiled all my notes on BFS, DFS, Dijkstra, and A* into one visual guide. Saved me so much time in interviews!',
      likes: 342,
      comments: 56,
      tags: ['DSA', 'Graphs', 'Interviews']
    },
    {
      user: 'Rahul Verma',
      avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=3b82f6&color=fff',
      role: 'Student',
      title: 'Fullstack Authentication Flow',
      content: 'Here is a diagram explaining JWT vs Sessions, and how I implemented it in my latest MERN project.',
      likes: 289,
      comments: 41,
      tags: ['Backend', 'Security', 'MERN']
    }
  ];

  return (
    <section id="community" className="py-24 w-full relative bg-[#f9fafb]" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Feed UI */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-pink-500/20 to-orange-500/20 blur-2xl rounded-full opacity-50 pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            {posts.map((post, i) => (
              <div key={i} className="community-card bg-white border border-gray-200 rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="font-bold text-[#111827] text-sm">{post.user}</h4>
                    <p className="text-xs text-gray-500">{post.role}</p>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-2">{post.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{post.content}</p>
                <div className="flex gap-2 mb-4">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded-md border border-gray-100">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-6 pt-4 border-t border-gray-100 text-gray-500 text-sm">
                  <button className="flex items-center gap-1.5 hover:text-pink-500 transition-colors"><Heart className="w-4 h-4" /> {post.likes}</button>
                  <button className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"><MessageSquare className="w-4 h-4" /> {post.comments}</button>
                  <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors ml-auto"><Share2 className="w-4 h-4" /> Share</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Content */}
        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Learn Together in <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">Live Communities.</span></h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Don't learn in isolation. Join cohorts, share your smartest notes, and see what topics are trending in your batch. The community hub is your collaborative study room.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#111827]">Trending Topics Leaderboard</h4>
                <p className="text-sm text-gray-600">See what technologies others are focusing on right now.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#111827]">Private Study Groups</h4>
                <p className="text-sm text-gray-600">Create locked communities for your specific friend circle or project team.</p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default CommunityShowcase;
