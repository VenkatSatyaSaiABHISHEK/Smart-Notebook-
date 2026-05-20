import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ArrowRight, Brain, AlertCircle, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardOverview = () => {
  const { userData } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);
  
  // Default values if user skipped onboarding or in demo
  const accentColor = userData?.accentColor || '#6366f1';
  const interests = userData?.interests || ['General Programming'];
  const startDate = userData?.startDate || new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Calculate what day of the CRT the user is on
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let dayCount = 1;
      let current = new Date(start);
      if (today < start) {
         setCurrentDay(1);
      } else {
         while (current < today) {
           current.setDate(current.getDate() + 1);
           if (current.getDay() !== 0) dayCount++;
         }
         setCurrentDay(dayCount);
      }
    }
  }, [startDate]);

  const [todayTasks, setTodayTasks] = useState([]); // Empty for a new user

  const currentDateFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="p-10 md:p-16 max-w-[1400px] mx-auto min-h-full font-sans bg-[#f9fafb]">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span 
              className="px-3 py-1 rounded-lg text-sm font-bold text-white shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              Day {currentDay} of CRT
            </span>
            <span className="text-sm font-bold text-gray-400">{currentDateFormatted}</span>
          </div>
          <h1 className="text-[44px] font-medium text-[#111827] tracking-tight leading-tight">
            Welcome back, {userData?.fullName?.split(' ')[0] || 'Learner'}
          </h1>
          <p className="text-[18px] text-[#6b7280] font-medium mt-1">Here is what you need to focus on today.</p>
        </div>
        
        {/* Compact Top Notification/Action */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
            <Brain className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-[14px] font-bold text-[#111827]">AI Sync Complete</p>
            <p className="text-[12px] text-[#6b7280]">Your recent notes were processed.</p>
          </div>
          <button 
            className="ml-4 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors text-white shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Daily Task List */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-[20px] font-bold text-[#111827] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-gray-400" /> Daily Action Plan
          </h2>
          
          {todayTasks.length > 0 ? (
            <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-2 shadow-sm">
              {todayTasks.map((task, idx) => (
                <div 
                  key={task.id} 
                  className={`group flex items-center justify-between p-5 rounded-[18px] transition-all cursor-pointer ${
                    task.completed ? 'opacity-60 bg-transparent' : 'bg-white hover:bg-[#f9fafb]'
                  } ${idx !== todayTasks.length - 1 && !task.completed ? 'border-b border-[#f3f4f6]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <button className="focus:outline-none">
                      {task.completed ? (
                        <CheckCircle2 className="w-7 h-7" style={{ color: accentColor }} />
                      ) : (
                        <Circle className="w-7 h-7 text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors" />
                      )}
                    </button>
                    <div>
                      <h3 className={`text-[16px] font-bold transition-all ${task.completed ? 'text-[#9ca3af] line-through' : 'text-[#111827]'}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3.5 h-3.5 text-[#9ca3af]" />
                        <span className="text-[13px] font-medium text-[#6b7280]">{task.time}</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ml-2 bg-gray-100 text-gray-600">
                          {task.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!task.completed && (
                    <ArrowRight className="w-5 h-5 text-[#d1d5db] group-hover:text-[#111827] transition-colors group-hover:translate-x-1" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-10 shadow-sm flex flex-col items-center justify-center text-center min-h-[250px]">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <CheckCircle2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Tasks Scheduled</h3>
              <p className="text-gray-500 text-sm max-w-[280px]">
                You have no pending tasks. Start by uploading notes or creating a manual task.
              </p>
            </div>
          )}

          <button className="w-full py-4 border-2 border-dashed border-[#d1d5db] text-[#6b7280] font-bold rounded-[20px] hover:border-[#111827] hover:text-[#111827] transition-all flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Add Manual Task
          </button>
        </div>

        {/* Priority Notifications / Highlights */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-[20px] font-bold text-[#111827] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-400" /> Need Attention
          </h2>
          
          <div className="space-y-4">
            
            {/* Action Required: Upload Notebook */}
            <div 
              className="text-white rounded-[24px] p-8 shadow-lg relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform"
              style={{ backgroundColor: accentColor }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-[40px] pointer-events-none" />
              <h3 className="text-[22px] font-bold leading-snug mb-2">Upload Day {currentDay} Notes</h3>
              <p className="text-[15px] text-white/80 font-medium mb-8">AI is waiting to process your {interests[0]} lectures.</p>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-white bg-black/20 px-3 py-1.5 rounded-lg border border-black/10">Due in 4 hours</span>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <ArrowRight className="w-5 h-5" style={{ color: accentColor }} />
                </div>
              </div>
            </div>

            {/* Personalized Goal Insight */}
            <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Target className="w-3 h-3" /> {userData?.goal === 'placement' ? 'Placement Insight' : 'Goal Update'}
                </span>
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              </div>
              <h3 className="text-[18px] font-bold text-[#111827] mb-2">{interests[0]} Masterclass Ready</h3>
              <p className="text-[14px] text-[#6b7280] leading-relaxed mb-4">
                The AI has aggregated notes from your community based on your focus on {interests.join(', ')}.
              </p>
              <div className="text-[14px] font-bold flex items-center transition-colors" style={{ color: accentColor }}>
                Read Master Note <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

// Dummy Plus icon
const Plus = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

export default DashboardOverview;
