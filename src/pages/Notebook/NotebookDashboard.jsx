import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Brain, Folder, Loader2, AlertCircle, Plus, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCompletedNotebookDays } from '../../services/notebookService';

const NotebookDashboard = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completedDaysList, setCompletedDaysList] = useState([]);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const startDateStr = userData?.startDate || new Date().toISOString().split('T')[0];

  const { currentDay, windowDates, windowDays } = useMemo(() => {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let temp = new Date(start);
    let tempCount = 1;
    while (temp < today) {
      temp.setDate(temp.getDate() + 1);
      if (temp.getDay() !== 0) tempCount++;
    }
    const todayDayNumber = (today < start) ? 1 : tempCount;

    let startDayNumber = 1;
    if (todayDayNumber > 100) {
      startDayNumber = todayDayNumber - 90;
    }

    let winDates = [];
    let winDays = [];
    
    let current = new Date(start);
    let iterDay = 1;
    
    // Fast forward to startDayNumber
    while (iterDay < startDayNumber) {
      if (current.getDay() !== 0) {
        iterDay++;
      }
      current.setDate(current.getDate() + 1);
    }

    let targetLength = Math.max(todayDayNumber + 2 - startDayNumber + 1, 7);
    if (targetLength > 100) targetLength = 100;

    while (winDates.length < targetLength) {
      if (current.getDay() !== 0) {
        winDates.push(new Date(current));
        winDays.push(iterDay);
        iterDay++;
      }
      current.setDate(current.getDate() + 1);
    }

    return { currentDay: todayDayNumber, windowDates: winDates, windowDays: winDays };
  }, [startDateStr]);

  useEffect(() => {
    if (userData?.uid && windowDays.length > 0) {
      const fetchCompleted = async () => {
        setIsLoadingCompleted(true);
        const completed = await getCompletedNotebookDays(userData.uid, windowDays);
        setCompletedDaysList(completed);
        setIsLoadingCompleted(false);
      };
      fetchCompleted();
    } else if (userData === null) {
        setIsLoadingCompleted(false);
    }
  }, [userData?.uid, windowDays]);

  const actionPlan = useMemo(() => {
    return windowDays.map((dayNum) => {
      let status = 'future';
      if (dayNum === currentDay) status = 'today';
      else if (dayNum < currentDay) {
         status = completedDaysList.includes(dayNum) ? 'completed' : 'missed';
      }
      return { day: dayNum, status };
    });
  }, [windowDays, currentDay, completedDaysList]);

  const missedCount = actionPlan.filter(a => a.status === 'missed').length;

  return (
    <div className="p-6 md:p-10 lg:p-16 max-w-[1200px] mx-auto min-h-full font-sans bg-[#f9fafb]">
      
      <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-[36px] font-bold text-[#111827] tracking-tight mb-2">My Notebook.</h1>
          <p className="text-[16px] text-[#6b7280] font-medium max-w-2xl">
            Your AI-powered daily learning journal. Complete your daily actions to maintain your streak and process new knowledge.
          </p>
        </div>
        <div className="text-right text-[#6b7280] bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-200 min-w-[200px] flex flex-col items-end">
          <div className="text-sm font-bold text-[#111827] mb-0.5">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="text-xs font-medium text-green-500 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Daily Action Plan */}
      <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm mb-10 min-h-[260px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Daily Action Plan</h2>
            <p className="text-sm text-gray-500 mt-1">Track your daily uploads. Don't break the chain!</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-sm" /> Missed</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-400 rounded-sm" /> Today</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-gray-300 rounded-sm" /> Completed</div>
          </div>
        </div>

        {isLoadingCompleted ? (
          <div className="flex flex-wrap gap-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="w-20 h-20 rounded-2xl bg-gray-200 flex flex-col items-center justify-center gap-1.5">
                <div className="w-6 h-2 bg-gray-300 rounded"></div>
                <div className="w-10 h-3 bg-gray-300 rounded"></div>
                <div className="w-8 h-2 bg-gray-300 rounded"></div>
              </div>
            ))}
            <div className="w-full mt-6 h-[74px] bg-gray-100 rounded-xl"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              {actionPlan.map((action, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => action.status !== 'future' && navigate(`/notebook/${action.day}`)}
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold text-sm shadow-sm transition-all ${
                    action.status !== 'future' ? 'cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed opacity-60'
                  } ${
                    action.status === 'missed' ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' :
                    action.status === 'today' ? 'bg-green-400 text-white shadow-green-400/40 ring-4 ring-green-100 animate-pulse hover:bg-green-500' :
                    action.status === 'completed' ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300' :
                    'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  <span className={`text-[10px] uppercase tracking-wider mb-1 ${action.status === 'missed' || action.status === 'today' ? 'text-white/80' : 'text-gray-400'}`}>
                    {windowDates[idx] ? windowDates[idx].toLocaleDateString('en-US', { weekday: 'short' }) : ''}
                  </span>
                  <span className="text-base">Day {action.day}</span>
                  <span className={`text-[10px] mt-1 ${action.status === 'missed' || action.status === 'today' ? 'text-white/80' : 'text-gray-400'}`}>
                    {windowDates[idx] ? windowDates[idx].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                  </span>
                </motion.div>
              ))}
            </div>

            {missedCount > 0 && (
              <div className="mt-6 p-4 bg-red-50 rounded-xl flex items-start gap-3 border border-red-100">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-800">You missed {missedCount} days!</h4>
                  <p className="text-xs text-red-600 mt-1">Upload your notes today (Day {currentDay}) to get back on track and maintain your learning streak.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Community Empty State Prompt */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[24px] p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <h4 className="font-bold text-lg">Community is not there</h4>
            <p className="text-sm text-indigo-200 mt-1">You haven't joined or created a community yet. Share notes and grow together!</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/community')}
          className="relative z-10 px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl font-bold text-sm whitespace-nowrap transition-colors shadow-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create One Now
        </button>
      </div>
    </div>
  );
};

export default NotebookDashboard;
