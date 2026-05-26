import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  Code2, 
  Play, 
  Star, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  Terminal, 
  Zap, 
  Edit3,
  MessageSquare
} from 'lucide-react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { processWithGroq } from '../services/groqService';
import InteractiveAiExplanation from '../components/InteractiveAiExplanation';
import { useAuth } from '../contexts/AuthContext';

const DEMO_CODES = {
  fibonacci: `def fin(n):
    if n < 0:
        return 0
    elif n == 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fin(n-1) + fin(n-2)

print(fin(5))`,
  factorial: `def fact(n):
    if n <= 1:
        return 1
    else:
        return n * fact(n-1)

print(fact(4))`,
  iterativeSum: `def sum_numbers(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total

print(sum_numbers(5))`
};

const DemoTry = () => {
  const navigate = useNavigate();
  const { userData } = useAuth() || {};
  const [code, setCode] = useState(DEMO_CODES.fibonacci);
  const [triesLeft, setTriesLeft] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Feedback state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Mobile layout state: 'code' or 'feedback' tab
  const [activeTab, setActiveTab] = useState('code');

  // Simulated code line numbers
  const [lineNumbers, setLineNumbers] = useState([]);

  useEffect(() => {
    const linesCount = code.split('\n').length;
    setLineNumbers(Array.from({ length: Math.max(12, linesCount) }, (_, i) => i + 1));
  }, [code]);

  // Initialize tries left from LocalStorage
  useEffect(() => {
    const savedTries = localStorage.getItem('demo_tries_left');
    if (savedTries !== null) {
      setTriesLeft(parseInt(savedTries));
    } else {
      localStorage.setItem('demo_tries_left', '3');
      setTriesLeft(3);
    }

    if (!localStorage.getItem('demo_device_id')) {
      const randomId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('demo_device_id', randomId);
    }
  }, []);

  const handleSelectDemo = (type) => {
    setCode(DEMO_CODES[type]);
    setErrorMessage('');
    // Switch to code tab on mobile when a template is clicked
    setActiveTab('code');
  };

  const handleVisualize = async () => {
    if (triesLeft <= 0) {
      setErrorMessage("You've used all 3 free tries on this device. Sign up for free to get unlimited runs!");
      return;
    }

    if (userData && (userData.tokensUsed || 0) >= 50000) {
      const getHoursUntilReset = () => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0); // Next midnight
        const diffMs = midnight.getTime() - now.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60));
      };
      setErrorMessage(`⚠️ Daily Groq Token Limit Reached! You have reached your daily budget of 50,000 tokens. Please wait ${getHoursUntilReset()} hours for this to reset.`);
      setShowVisualizer(false);
      return;
    }

    setErrorMessage('');
    setIsGenerating(true);
    setShowVisualizer(true);

    try {
      const response = await processWithGroq(code, "explain_code");
      setAiExplanation(response.text);
      
      const nextTries = triesLeft - 1;
      setTriesLeft(nextTries);
      localStorage.setItem('demo_tries_left', nextTries.toString());
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Failed to generate visual trace steps. Please try again.");
      setShowVisualizer(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage("Please select a star rating first!");
      return;
    }

    setSubmittingFeedback(true);
    setErrorMessage('');

    try {
      const deviceId = localStorage.getItem('demo_device_id') || 'unknown';
      await addDoc(collection(db, 'sandbox_feedbacks'), {
        rating,
        comment,
        deviceId,
        timestamp: serverTimestamp(),
        codeSample: code
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Error writing feedback: ", err);
      setErrorMessage("Could not submit feedback to database. Please check connection.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 flex flex-col font-sans select-none relative overflow-x-hidden antialiased">
      {/* Background soft pastel radial spots (Light Theme) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-indigo-100/40 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[55%] rounded-full bg-emerald-100/30 blur-[150px]" />
        <div className="absolute top-[30%] right-[20%] w-[35%] h-[35%] rounded-full bg-purple-100/25 blur-[120px]" />
      </div>

      {/* Header bar - Glassmorphism Light */}
      <header className="relative z-10 w-full px-4 py-3 bg-white/65 backdrop-blur-md border-b border-slate-200/65 flex items-center justify-between shadow-xs select-none">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-extrabold text-slate-550 hover:text-slate-900 transition-all cursor-pointer group bg-slate-100/60 hover:bg-slate-100 border border-slate-250/70 px-3 py-2 rounded-xl shadow-xs shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </button>
        
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center justify-center w-7.5 h-7.5 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-indigo-500/10 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-extrabold text-xs sm:text-sm tracking-wide text-slate-900 shrink-0">
            <span className="hidden sm:inline">LearnLoop Try Sandbox</span>
            <span className="sm:hidden">Try Sandbox</span>
          </span>
        </div>
      </header>

      {/* Mobile Tab bar - Fixed at top on small screens only */}
      <div className="lg:hidden relative z-10 w-full bg-white border-b border-slate-200 flex select-none">
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 py-3 text-xs font-extrabold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'code' 
              ? 'border-indigo-650 text-indigo-650 bg-indigo-50/20' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" /> Code Sandbox
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-3 text-xs font-extrabold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'feedback' 
              ? 'border-indigo-650 text-indigo-650 bg-indigo-50/20' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Demos & Feedback
        </button>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 min-h-0 overflow-y-auto">
        
        {/* Banner with Tries Remaining */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-2xl shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 flex flex-wrap items-center gap-2">
                Learn Coding Visually 
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full">
                  Try Sandbox
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                Experience stack frame animation on recursion blocks. Write any Python code or choose a template below, and watch frames push/pop dynamically.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-center gap-4 p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl shrink-0 md:min-w-[150px]">
            <div className="text-left md:text-center">
              <span className="text-[9.5px] font-black text-slate-450 uppercase tracking-widest block">Tries Remaining</span>
              <span className={`text-2xl font-black mt-0.5 block ${triesLeft > 0 ? 'text-indigo-650' : 'text-rose-500'}`}>
                {triesLeft} / 3
              </span>
            </div>
            <div className="px-2.5 py-1.5 bg-indigo-50 rounded-lg text-[9px] font-extrabold text-indigo-700 uppercase tracking-wider md:hidden select-none">
              Free Trial
            </div>
          </div>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4.5 text-xs text-slate-700 shadow-sm flex items-start gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block animate-ping shrink-0 mt-1.5" />
            <div className="flex-1">
              <span className="font-extrabold text-rose-800 block mb-0.5">Alert</span>
              {errorMessage}
              {triesLeft <= 0 && (
                <div className="flex gap-2 mt-2.5">
                  <Link to="/signup" className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg text-[10.5px] font-black transition-colors shadow-sm">
                    Create Free Account
                  </Link>
                  <Link to="/login" className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[10.5px] font-black transition-colors">
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Mobile Layout / Desktop Grid */}
        <div className="flex-1 min-h-0">
          
          {/* 1. Desktop layout (always visible on large screens) */}
          <div className="hidden lg:grid grid-cols-12 gap-6 h-full items-start">
            {/* Left panel: Editor */}
            <div className="col-span-8 flex flex-col gap-4">
              <div className="bg-white border border-slate-200/80 rounded-3xl flex flex-col shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400 shrink-0" />
                    <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-[10px] font-mono text-slate-450 ml-3.5 flex items-center gap-1.5 select-none">
                      <Code2 className="w-3.5 h-3.5 text-slate-400" /> sandbox.py
                    </span>
                  </div>
                </div>

                {/* Unified Quick Demos Bar directly above the editor area */}
                <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest shrink-0 mr-1">Demos:</span>
                    <button
                      onClick={() => handleSelectDemo('fibonacci')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border shrink-0 cursor-pointer ${
                        code === DEMO_CODES.fibonacci
                          ? 'bg-indigo-55 border-indigo-200 text-indigo-700 bg-indigo-50/70 font-black'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      📶 Fibonacci
                    </button>
                    <button
                      onClick={() => handleSelectDemo('factorial')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border shrink-0 cursor-pointer ${
                        code === DEMO_CODES.factorial
                          ? 'bg-indigo-55 border-indigo-200 text-indigo-700 bg-indigo-50/70 font-black'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      🔢 Factorial
                    </button>
                    <button
                      onClick={() => handleSelectDemo('iterativeSum')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border shrink-0 cursor-pointer ${
                        code === DEMO_CODES.iterativeSum
                          ? 'bg-indigo-55 border-indigo-200 text-indigo-700 bg-indigo-50/70 font-black'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ➕ Loop Sum
                    </button>
                  </div>
                  <button
                    onClick={() => setCode(DEMO_CODES.fibonacci)}
                    className="text-[10px] font-black text-slate-500 hover:text-indigo-650 cursor-pointer border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg transition-colors shrink-0"
                  >
                    Reset Code
                  </button>
                </div>

                {/* Helpful editor message tip */}
                <div className="bg-indigo-50/40 border-b border-slate-100 px-5 py-2.5 text-[11px] text-indigo-950 font-medium flex items-center gap-2">
                  <span className="text-[14px]">💡</span>
                  <span><strong>You can enter any Python code</strong> in the editor below, or select a template to see how it works instantly!</span>
                </div>

                <div className="flex font-mono text-[12.5px] bg-[#fdfdfd] p-4.5 overflow-hidden min-h-[300px] border-b border-slate-100">
                  <div className="w-8 select-none text-right text-slate-400 pr-3.5 border-r border-slate-100 flex flex-col gap-1 leading-normal font-sans text-[10px] pt-0.5">
                    {lineNumbers.map(n => (
                      <div key={n}>{n}</div>
                    ))}
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-slate-800 pl-4.5 leading-normal resize-none font-mono text-[12.5px] custom-scrollbar focus:border-0"
                    placeholder="def my_function(n):..."
                    style={{ whiteSpace: 'pre', overflowWrap: 'unset' }}
                  />
                </div>

                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                  <button
                    onClick={handleVisualize}
                    disabled={isGenerating || triesLeft <= 0}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-650 hover:bg-indigo-755 disabled:opacity-40 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-indigo-100 cursor-pointer select-none transition-all active:scale-[0.98]"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Visualize Stack Execution
                  </button>
                </div>
              </div>
            </div>

            {/* Right panel: Templates & Feedback */}
            <div className="col-span-4 flex flex-col gap-6">
              {/* Demos */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest mb-3.5 block select-none">
                  Load Quick Demo Code
                </span>
                <div className="flex flex-col gap-2">
                  {Object.keys(DEMO_CODES).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleSelectDemo(key)}
                      className={`w-full py-3 px-4 border rounded-2xl text-xs font-extrabold text-left transition-all flex justify-between items-center cursor-pointer ${
                        code === DEMO_CODES[key]
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
                      }`}
                    >
                      {key === 'fibonacci' && 'Fibonacci Recursion'}
                      {key === 'factorial' && 'Factorial Recursion'}
                      {key === 'iterativeSum' && 'Iterative Loop Sum'}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback widget */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest mb-3.5 block select-none">
                  Give Sandbox Feedback
                </span>

                {feedbackSubmitted ? (
                  <div className="text-center py-6 flex flex-col items-center gap-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center animate-bounce">
                      <CheckCircle2 className="w-5.5 h-5.5" />
                    </div>
                    <h5 className="font-extrabold text-slate-800 text-xs mt-1">Feedback Logged!</h5>
                    <p className="text-[11px] text-slate-500 max-w-[200px] leading-normal">
                      Thank you! Your feedback helps us build the best visual learning system.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
                    <div className="flex items-center gap-1.5 justify-center py-2.5 bg-slate-50 border border-slate-200/60 rounded-2xl select-none">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-5.5 h-5.5 transition-all ${
                              star <= (hoverRating || rating)
                                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                : 'text-slate-350'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us what you liked or how we can make the visualizer better..."
                      className="w-full h-16 bg-slate-50 border border-slate-205/80 rounded-2xl p-3 text-[11px] focus:border-indigo-500 focus:outline-none text-slate-700 resize-none font-sans leading-normal focus:ring-1 focus:ring-indigo-100/50"
                    />

                    <button
                      type="submit"
                      disabled={rating === 0 || submittingFeedback}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* 2. Mobile Layout (Tab-based, responsive) */}
          <div className="lg:hidden w-full h-full">
            <AnimatePresence mode="wait">
              {activeTab === 'code' ? (
                <motion.div
                  key="codeTab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  <div className="bg-white border border-slate-200/80 rounded-3xl flex flex-col shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5 text-slate-400" /> sandbox.py
                      </span>
                    </div>

                    {/* Unified Quick Demos Bar for mobile */}
                    <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest shrink-0 mr-0.5">Demos:</span>
                        <button
                          onClick={() => handleSelectDemo('fibonacci')}
                          className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold transition-all border shrink-0 cursor-pointer ${
                            code === DEMO_CODES.fibonacci
                              ? 'bg-indigo-55 border-indigo-200 text-indigo-700 bg-indigo-50/70 font-black'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          📶 Fibonacci
                        </button>
                        <button
                          onClick={() => handleSelectDemo('factorial')}
                          className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold transition-all border shrink-0 cursor-pointer ${
                            code === DEMO_CODES.factorial
                              ? 'bg-indigo-55 border-indigo-200 text-indigo-700 bg-indigo-50/70 font-black'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          🔢 Factorial
                        </button>
                        <button
                          onClick={() => handleSelectDemo('iterativeSum')}
                          className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold transition-all border shrink-0 cursor-pointer ${
                            code === DEMO_CODES.iterativeSum
                              ? 'bg-indigo-55 border-indigo-200 text-indigo-700 bg-indigo-50/70 font-black'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          ➕ Loop Sum
                        </button>
                      </div>
                      <button
                        onClick={() => setCode(DEMO_CODES.fibonacci)}
                        className="text-[9.5px] font-black text-slate-500 hover:text-indigo-650 cursor-pointer border border-slate-200 bg-white hover:bg-slate-50 px-2 py-0.5 rounded-lg transition-colors shrink-0"
                      >
                        Reset
                      </button>
                    </div>

                    <div className="bg-indigo-50/40 border-b border-slate-100 px-4 py-2.5 text-[10.5px] text-indigo-950 font-semibold flex items-start gap-2">
                      <span>💡</span>
                      <span><strong>You can enter any code here!</strong> Type your logic below or choose a demo in the second tab.</span>
                    </div>

                    <div className="flex font-mono text-[12.5px] bg-[#fdfdfd] p-4.5 overflow-hidden min-h-[240px] border-b border-slate-100">
                      <div className="w-7 select-none text-right text-slate-400 pr-2 border-r border-slate-100 flex flex-col gap-1 leading-normal font-sans text-[9.5px] pt-0.5">
                        {lineNumbers.map(n => (
                          <div key={n}>{n}</div>
                        ))}
                      </div>
                      <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-slate-800 pl-3 leading-normal resize-none font-mono text-[12.5px] custom-scrollbar focus:border-0"
                        placeholder="def my_function(n):..."
                        style={{ whiteSpace: 'pre', overflowWrap: 'unset' }}
                      />
                    </div>

                    <div className="px-4 py-3.5 bg-slate-50 flex justify-end">
                      <button
                        onClick={handleVisualize}
                        disabled={isGenerating || triesLeft <= 0}
                        className="w-full py-3 bg-indigo-650 hover:bg-indigo-755 disabled:opacity-40 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer select-none active:scale-[0.98]"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Visualize Stack Execution
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="feedbackTab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  {/* Demos scroll row */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm">
                    <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest mb-3 block">
                      Choose A Demo Template
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        onClick={() => handleSelectDemo('fibonacci')}
                        className={`flex-1 py-3 px-4 border rounded-2xl text-xs font-extrabold text-left transition-all flex justify-between items-center cursor-pointer ${
                          code === DEMO_CODES.fibonacci
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-655'
                        }`}
                      >
                        Fibonacci Recursion <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                      <button
                        onClick={() => handleSelectDemo('factorial')}
                        className={`flex-1 py-3 px-4 border rounded-2xl text-xs font-extrabold text-left transition-all flex justify-between items-center cursor-pointer ${
                          code === DEMO_CODES.factorial
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-655'
                        }`}
                      >
                        Factorial Recursion <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                      <button
                        onClick={() => handleSelectDemo('iterativeSum')}
                        className={`flex-1 py-3 px-4 border rounded-2xl text-xs font-extrabold text-left transition-all flex justify-between items-center cursor-pointer ${
                          code === DEMO_CODES.iterativeSum
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-655'
                        }`}
                      >
                        Loop Sum <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm">
                    <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest mb-3 block">
                      Submit Feedback
                    </span>

                    {feedbackSubmitted ? (
                      <div className="text-center py-6 flex flex-col items-center gap-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
                        <h5 className="font-extrabold text-slate-800 text-xs mt-1">Feedback Logged!</h5>
                        <p className="text-[10.5px] text-slate-500 max-w-[200px]">
                          Thank you for helping us make LearnLoop better.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                        <div className="flex items-center gap-1.5 justify-center py-2.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 cursor-pointer"
                            >
                              <Star
                                className={`w-5.5 h-5.5 transition-all ${
                                  star <= (hoverRating || rating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-350'
                                }`}
                              />
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Tell us what you liked or how we can make the visualizer better..."
                          className="w-full h-16 bg-slate-50 border border-slate-205/85 rounded-2xl p-3 text-[11px] focus:outline-none text-slate-700 resize-none font-sans focus:ring-1 focus:ring-indigo-100/50"
                        />

                        <button
                          type="submit"
                          disabled={rating === 0 || submittingFeedback}
                          className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs rounded-xl shadow-sm cursor-pointer"
                        >
                          {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Visualizer Modal Overlay Popup */}
      <AnimatePresence>
        {showVisualizer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm select-none animate-fade-in">
            <div className="w-full max-w-6xl bg-white rounded-[24px] shadow-2xl overflow-hidden border border-slate-200/50 flex flex-col">
              <InteractiveAiExplanation
                aiExample={aiExplanation}
                codeContent={code}
                isGenerating={isGenerating}
                accentColor="#6366f1"
                onClose={() => {
                  setShowVisualizer(false);
                  setAiExplanation(null);
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DemoTry;
