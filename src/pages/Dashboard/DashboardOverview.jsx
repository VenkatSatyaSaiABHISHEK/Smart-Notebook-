import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowRight, 
  Brain, 
  AlertCircle, 
  Target,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  Save,
  X,
  Flame
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getTasks, addTask, updateTask, deleteTask } from '../../services/notebookService';

const DashboardOverview = () => {
  const { currentUser, userData } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTime, setTaskTime] = useState("Due in 2 hours");
  const [taskType, setTaskType] = useState("");

  // Default values if user skipped onboarding or in demo
  const accentColor = userData?.accentColor || '#6366f1';
  const interests = userData?.interests || ['General Programming'];
  const startDate = userData?.startDate || new Date().toISOString().split('T')[0];

  // Set default task type on mount/interests update
  useEffect(() => {
    if (interests && interests.length > 0) {
      setTaskType(interests[0]);
    } else {
      setTaskType("General");
    }
  }, [interests]);

  // Calculate CRT Day
  useEffect(() => {
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

  // Load Tasks from Firestore or LocalStorage Fallback
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser?.uid) return;
      setLoadingTasks(true);
      try {
        const dbTasks = await getTasks(currentUser.uid);
        if (dbTasks.length > 0) {
          // Sort active tasks first, completed last
          const sorted = dbTasks.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return new Date(b.createdAt?.seconds * 1000 || b.createdAt) - new Date(a.createdAt?.seconds * 1000 || a.createdAt);
          });
          setTodayTasks(sorted);
          localStorage.setItem(`learnloop_tasks_${currentUser.uid}`, JSON.stringify(sorted));
        } else {
          // Try local storage fallback
          const local = localStorage.getItem(`learnloop_tasks_${currentUser.uid}`);
          if (local) {
            setTodayTasks(JSON.parse(local));
          }
        }
      } catch (err) {
        console.error("Firestore tasks fetch error, loading from local storage:", err);
        const local = localStorage.getItem(`learnloop_tasks_${currentUser.uid}`);
        if (local) {
          setTodayTasks(JSON.parse(local));
        }
      } finally {
        setLoadingTasks(false);
      }
    };

    loadTasks();
  }, [currentUser]);

  // Typewriter placeholders for Add Manual Task modal
  const placeholders = [
    "Solve 3 LeetCode problems...",
    "Revise React Context API...",
    "Write SQL queries for Joins...",
    "Prepare Resume project details...",
    "Revise Binary Search algorithm...",
    "Read Operating Systems notes..."
  ];
  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;
    let timer;
    const currentFullText = placeholders[placeholderIdx];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setPlaceholderText(currentFullText.substring(0, charIdx - 1));
        setCharIdx(prev => prev - 1);
      }, 30);
    } else {
      timer = setTimeout(() => {
        setPlaceholderText(currentFullText.substring(0, charIdx + 1));
        setCharIdx(prev => prev + 1);
      }, 70);
    }

    if (!isDeleting && charIdx === currentFullText.length) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setPlaceholderIdx(prev => (prev + 1) % placeholders.length);
    }

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, placeholderIdx, isModalOpen]);

  // Task Handlers
  const handleToggleTask = async (taskId) => {
    const task = todayTasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedCompleted = !task.completed;
    
    // Optimistic state update
    const updatedTasks = todayTasks.map(t => t.id === taskId ? { ...t, completed: updatedCompleted } : t)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return 0;
      });
    setTodayTasks(updatedTasks);
    if (currentUser?.uid) {
      localStorage.setItem(`learnloop_tasks_${currentUser.uid}`, JSON.stringify(updatedTasks));
    }

    try {
      if (currentUser?.uid && !taskId.startsWith('local-')) {
        await updateTask(currentUser.uid, taskId, { completed: updatedCompleted });
      }
    } catch (err) {
      console.error("Error updating task in Firestore:", err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTaskData = {
      title: taskTitle.trim(),
      time: taskTime || 'Today',
      type: taskType || 'General',
      completed: false,
      createdAt: new Date().toISOString()
    };

    const tempId = `local-${Date.now()}`;
    const localTask = { id: tempId, ...newTaskData };
    
    // Add locally immediately
    const updatedTasks = [localTask, ...todayTasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return 0;
    });
    setTodayTasks(updatedTasks);
    if (currentUser?.uid) {
      localStorage.setItem(`learnloop_tasks_${currentUser.uid}`, JSON.stringify(updatedTasks));
    }

    // Reset Form
    setTaskTitle("");
    setTaskTime("Due in 2 hours");
    setTaskType(interests[0] || "General");
    setIsModalOpen(false);

    try {
      if (currentUser?.uid) {
        const newId = await addTask(currentUser.uid, newTaskData);
        setTodayTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: newId } : t));
        // Update local storage with the synced task list
        const refreshedTasks = updatedTasks.map(t => t.id === tempId ? { ...t, id: newId } : t);
        localStorage.setItem(`learnloop_tasks_${currentUser.uid}`, JSON.stringify(refreshedTasks));
      }
    } catch (err) {
      console.error("Error saving task in Firestore, kept locally:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const updatedTasks = todayTasks.filter(t => t.id !== taskId);
    setTodayTasks(updatedTasks);
    if (currentUser?.uid) {
      localStorage.setItem(`learnloop_tasks_${currentUser.uid}`, JSON.stringify(updatedTasks));
    }

    try {
      if (currentUser?.uid && !taskId.startsWith('local-')) {
        await deleteTask(currentUser.uid, taskId);
      }
    } catch (err) {
      console.error("Error deleting task in Firestore:", err);
    }
  };

  // 1. Pomodoro Timer State & Logic
  const [timerMode, setTimerMode] = useState('focus'); // 'focus', 'short', 'long'
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const presets = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  useEffect(() => {
    setSecondsLeft(presets[timerMode]);
    setIsActive(false);
  }, [timerMode]);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      // Play system alert notification sound or display alert
      alert(`🔔 ${timerMode === 'focus' ? 'Focus time over! Time to rest.' : 'Break over! Let\'s get back to work.'}`);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, timerMode]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getProgressPercent = () => {
    const total = presets[timerMode];
    return ((total - secondsLeft) / total) * 100;
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (getProgressPercent() / 100) * circumference;

  // 2. Flashcards Data & Flip Logic
  const flashcards = [
    {
      topic: "Algorithms",
      question: "What is the Time Complexity of Quick Sort in average vs worst case?",
      answer: "Average case: O(N log N) when pivots partition arrays relatively evenly. Worst case: O(N²) when the pivot chosen is always the smallest or largest element (e.g. sorted arrays with naive pivot choice).",
      code: `// Quick Sort average partition complexity
T(N) = 2T(N/2) + O(N) => O(N log N)`
    },
    {
      topic: "JavaScript",
      question: "What is closure in JavaScript and what is its primary use case?",
      answer: "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). Useful for data privacy, currying, and creating factory functions.",
      code: `function counterFactory() {
  let count = 0; // Private state
  return () => ++count;
}
const count = counterFactory();
count(); // 1
count(); // 2`
    },
    {
      topic: "SQL / Placement",
      question: "Explain the difference between INNER JOIN, LEFT JOIN, and FULL JOIN.",
      answer: "INNER JOIN: Returns matching rows in both tables. LEFT JOIN: Returns all rows from left table + matches from right. FULL JOIN: Returns all records when there is a match in left OR right table.",
      code: `SELECT u.name, n.title 
FROM users u
LEFT JOIN notes n ON u.uid = n.userId;
-- Outputs all users even if they have no notes.`
    },
    {
      topic: "Python Coding",
      question: "What is list comprehension in Python and how does it optimize code?",
      answer: "A syntactic way to generate lists. It is faster than standard for-loops since it executes at C-speed inside the Python interpreter instead of bytecode evaluation cycles.",
      code: `# Traditional loop vs List Comprehension
evens = [x for x in range(20) if x % 2 == 0]
# Result: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]`
    },
    {
      topic: "React Concept",
      question: "How does React fiber architecture optimize page rendering?",
      answer: "Fiber enables incremental rendering: breaking work into chunks and spreading it over multiple frames. It allows pausing, aborting, or reusing rendering work to keep animations and typing fluid.",
      code: `// React schedules updates behind the scenes
// avoiding main thread blocking.
ReactDOM.createRoot(rootEl).render(<App />);`
    }
  ];

  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex(prev => (prev + 1) % flashcards.length);
    }, 150);
  };

  // 3. Scratchpad State & Auto-save
  const [scratchpadText, setScratchpadText] = useState("");
  const [isSavingScratch, setIsSavingScratch] = useState(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (currentUser?.uid) {
      const saved = localStorage.getItem(`learnloop_scratchpad_${currentUser.uid}`);
      if (saved) setScratchpadText(saved);
    }
  }, [currentUser]);

  const handleScratchpadChange = (e) => {
    const text = e.target.value;
    setScratchpadText(text);
    if (!currentUser?.uid) return;

    setIsSavingScratch(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(`learnloop_scratchpad_${currentUser.uid}`, text);
      setIsSavingScratch(false);
    }, 600);
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="p-8 md:p-12 max-w-[1500px] mx-auto min-h-full font-sans bg-[#f9fafb]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
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
          <h1 className="text-[40px] font-medium text-[#111827] tracking-tight leading-tight">
            Welcome back, {userData?.fullName?.split(' ')[0] || 'Learner'}
          </h1>
          <p className="text-[17px] text-[#6b7280] font-medium mt-1">Here is what you need to focus on today.</p>
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
            className="ml-4 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors text-white shadow-sm hover:brightness-95"
            style={{ backgroundColor: accentColor }}
          >
            View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (7 cols): Tasks & Scratchpad */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Daily Action Plan */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-bold text-[#111827] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gray-400" /> Daily Action Plan
            </h2>
            
            {loadingTasks ? (
              <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-10 text-center text-gray-500 shadow-sm animate-pulse">
                Loading tasks...
              </div>
            ) : todayTasks.length > 0 ? (
              <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-2 shadow-sm overflow-hidden">
                <AnimatePresence initial={false}>
                  {todayTasks.map((task, idx) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: 10 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`group flex items-center justify-between p-5 rounded-[18px] transition-all ${
                        task.completed ? 'opacity-65 bg-transparent' : 'bg-white hover:bg-gray-50/70'
                      } ${idx !== todayTasks.length - 1 ? 'border-b border-[#f3f4f6]' : ''}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <button 
                          onClick={() => handleToggleTask(task.id)}
                          className="focus:outline-none shrink-0"
                        >
                          {task.completed ? (
                            <motion.div whileTap={{ scale: 0.8 }} className="rounded-full bg-emerald-50 p-0.5">
                              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                            </motion.div>
                          ) : (
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Circle className="w-7 h-7 text-[#d1d5db] group-hover:text-gray-400 transition-colors" />
                            </motion.div>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-[16px] font-bold transition-all truncate ${task.completed ? 'text-[#9ca3af] line-through' : 'text-[#111827]'}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Clock className="w-3.5 h-3.5 text-[#9ca3af]" />
                            <span className="text-[13px] font-medium text-[#6b7280]">{task.time}</span>
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                              {task.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {!task.completed && (
                          <ArrowRight className="w-5 h-5 text-[#d1d5db] group-hover:text-[#111827] transition-colors group-hover:translate-x-1" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-10 shadow-sm flex flex-col items-center justify-center text-center min-h-[220px]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                  <CheckCircle2 className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">No Tasks Scheduled</h3>
                <p className="text-gray-500 text-sm max-w-[280px]">
                  You have no pending tasks. Start by uploading notes or creating a manual task.
                </p>
              </div>
            )}

            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 border-2 border-dashed border-[#d1d5db] hover:border-indigo-500 text-[#6b7280] hover:text-indigo-600 font-bold rounded-[20px] hover:bg-indigo-50/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Add Manual Task
            </button>
          </div>

          {/* Quick Study Scratchpad */}
          <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-bold text-[#111827] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Quick Scribble Pad
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                {isSavingScratch ? (
                  <span className="flex items-center gap-1.5 text-indigo-500">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                    Auto-saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Saved to local
                  </span>
                )}
              </div>
            </div>
            <textarea
              value={scratchpadText}
              onChange={handleScratchpadChange}
              placeholder="Jot down quick study code, placement ideas, paste links or formulas here... This clipboard auto-saves as you type."
              className="w-full h-44 p-4 rounded-2xl border border-[#e5e7eb] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-gray-800 font-sans text-sm resize-none placeholder-gray-400 bg-gray-50/30"
            />
          </div>

        </div>

        {/* RIGHT COLUMN (5 cols): Pomodoro, Flashcard, & Highlights */}
        <div className="lg:col-span-5 space-y-8">

          {/* 1. Pomodoro Focus Timer */}
          <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 shadow-sm space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> Focus Arena
              </h3>
              <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-bold text-gray-500">
                {['focus', 'short', 'long'].map(mode => (
                  <button 
                    key={mode}
                    onClick={() => setTimerMode(mode)}
                    className={`px-2.5 py-1 rounded-md transition-colors capitalize cursor-pointer ${
                      timerMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'
                    }`}
                  >
                    {mode === 'focus' ? 'Focus' : mode === 'short' ? 'Short' : 'Long'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-around gap-6">
              {/* Animated Progress Circle */}
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r={radius} className="stroke-gray-100" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r={radius} 
                    className="transition-all duration-300" 
                    stroke={accentColor} 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-900 font-mono tracking-tight">
                    {formatTime(secondsLeft)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {timerMode === 'focus' ? 'Study' : 'Break'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-2.5 w-1/2">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:brightness-95"
                  style={{ backgroundColor: accentColor }}
                >
                  {isActive ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  {isActive ? 'Pause Session' : 'Start Focus'}
                </button>
                <button
                  onClick={() => {
                    setIsActive(false);
                    setSecondsLeft(presets[timerMode]);
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#e5e7eb] font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Timer
                </button>
              </div>
            </div>
          </div>

          {/* 2. AI daily coding flashcard */}
          <div className="space-y-4">
            <h3 className="text-[20px] font-bold text-[#111827] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" /> Placement Flashcards
            </h3>
            
            <div className="perspective-1000 w-full h-[280px]">
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative w-full h-full duration-500 preserve-3d cursor-pointer ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 w-full h-full bg-white border border-[#e5e7eb] rounded-[24px] p-6 shadow-sm backface-hidden flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {flashcards[cardIndex].topic}
                    </span>
                    <h4 className="text-lg font-bold text-gray-900 mt-4 leading-snug">
                      {flashcards[cardIndex].question}
                    </h4>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider border-t border-gray-150 pt-4">
                    <span>💡 Click card to flip</span>
                    <span onClick={(e) => { e.stopPropagation(); handleNextCard(); }} className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer">
                      Next Concept &rarr;
                    </span>
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 w-full h-full bg-slate-900 rounded-[24px] p-6 shadow-xl backface-hidden rotate-y-180 flex flex-col justify-between text-white">
                  <div className="overflow-y-auto max-h-[190px] custom-scrollbar pr-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                      Explanation
                    </span>
                    <p className="text-xs text-gray-300 mt-3 leading-relaxed">
                      {flashcards[cardIndex].answer}
                    </p>
                    <pre className="bg-black/40 rounded-xl p-3 text-[11px] font-mono text-indigo-300 border border-white/5 mt-3 overflow-x-auto">
                      <code>{flashcards[cardIndex].code}</code>
                    </pre>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider border-t border-white/10 pt-3 mt-1">
                    <span>🔄 Click to flip back</span>
                    <span onClick={(e) => { e.stopPropagation(); handleNextCard(); }} className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer text-[11px]">
                      Next Concept &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Required & Target Insight (Original widgets) */}
          <div className="space-y-4">
            {/* Upload Day Notes */}
            <div 
              className="text-white rounded-[24px] p-8 shadow-lg relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all duration-300"
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

      {/* CREATION MODAL FOR MANUAL TASK */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white rounded-[28px] border border-gray-200 shadow-2xl p-8 max-w-md w-full relative z-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" /> New Manual Task
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-5">
                <div className="space-y-1 relative">
                  <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider block">Task Title</label>
                  <div className="relative">
                    <input 
                      type="text"
                      autoFocus
                      required
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder={placeholderText}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/50 text-sm placeholder-gray-400 bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider block">Due Time</label>
                    <input 
                      type="text"
                      value={taskTime}
                      onChange={(e) => setTaskTime(e.target.value)}
                      placeholder="e.g. Due in 2 hours"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/50 text-sm bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider block">Subject / Tag</label>
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/50 text-sm bg-gray-50/50 cursor-pointer"
                    >
                      <option value="General">General</option>
                      {interests.map((interest, i) => (
                        <option key={i} value={interest}>{interest}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tag Quick Select */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Quick Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {['General', 'DSA', 'Web Dev', 'Python', 'Interview Prep'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setTaskType(tag)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          taskType === tag 
                            ? 'bg-indigo-650 border-indigo-600 text-white shadow-sm' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                        style={{
                          backgroundColor: taskType === tag ? accentColor : undefined,
                          borderColor: taskType === tag ? accentColor : undefined
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded-xl font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all hover:brightness-95 text-sm cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardOverview;
