import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Layers, 
  Cpu, 
  Sparkles,
  Terminal,
  Code2,
  GitCommit
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CodeVisualizer = () => {
  const { userData } = useAuth();
  const accentColor = userData?.accentColor || '#6366f1';
  
  const [activeTab, setActiveTab] = useState('factorial'); // 'factorial', 'binary_search', 'bubble_sort'
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1500); // ms per step
  const timerRef = useRef(null);

  // Reset steps on tab change
  useEffect(() => {
    setStep(0);
    setIsPlaying(false);
  }, [activeTab]);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStep(prev => {
          const maxSteps = presets[activeTab].steps.length;
          if (prev >= maxSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activeTab, playSpeed]);

  const handleNext = () => {
    const maxSteps = presets[activeTab].steps.length;
    if (step < maxSteps - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  // Preset Configurations & Data Traces
  const presets = {
    factorial: {
      name: "Factorial Recursion",
      desc: "Traces fact(5). Illustrates recursion calls stacking up on the Call Stack, and then unwinding (popping) back to compute the final value.",
      code: [
        "def fact(n):",
        "    if n == 1:",
        "        return 1",
        "    res = n * fact(n - 1)",
        "    return res"
      ],
      steps: [
        { line: 1, log: "Initial call: fact(5) triggered.", stack: [{ n: 5, status: "Active" }], vars: { n: 5 } },
        { line: 2, log: "Checking base case: is 5 == 1? No.", stack: [{ n: 5, status: "Active" }], vars: { n: 5 } },
        { line: 4, log: "Evaluating fact(5): Needs fact(4) result. Suspending fact(5).", stack: [{ n: 5, status: "Suspended" }], vars: { n: 5 } },
        { line: 1, log: "New recursive frame: fact(4) called.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Active" }], vars: { n: 4 } },
        { line: 2, log: "Checking base case: is 4 == 1? No.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Active" }], vars: { n: 4 } },
        { line: 4, log: "Evaluating fact(4): Needs fact(3) result. Suspending fact(4).", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }], vars: { n: 4 } },
        { line: 1, log: "New recursive frame: fact(3) called.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Active" }], vars: { n: 3 } },
        { line: 2, log: "Checking base case: is 3 == 1? No.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Active" }], vars: { n: 3 } },
        { line: 4, log: "Evaluating fact(3): Needs fact(2) result. Suspending fact(3).", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }], vars: { n: 3 } },
        { line: 1, log: "New recursive frame: fact(2) called.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Active" }], vars: { n: 2 } },
        { line: 2, log: "Checking base case: is 2 == 1? No.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Active" }], vars: { n: 2 } },
        { line: 4, log: "Evaluating fact(2): Needs fact(1) result. Suspending fact(2).", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Suspended" }], vars: { n: 2 } },
        { line: 1, log: "New recursive frame: fact(1) called.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Suspended" }, { n: 1, status: "Active" }], vars: { n: 1 } },
        { line: 2, log: "Checking base case: is 1 == 1? Yes!", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Suspended" }, { n: 1, status: "Active" }], vars: { n: 1 } },
        { line: 3, log: "Base case matched. Returning 1.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Suspended" }, { n: 1, status: "Base Return: 1" }], vars: { n: 1, returnVal: 1 } },
        { line: 4, log: "Resuming fact(2). Received 1 from fact(1). Calculating res = 2 * 1 = 2.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Active: 2 * 1" }], vars: { n: 2, res: 2 } },
        { line: 5, log: "fact(2) returning 2.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Returning: 2" }], vars: { n: 2, res: 2, returnVal: 2 } },
        { line: 4, log: "Resuming fact(3). Received 2 from fact(2). Calculating res = 3 * 2 = 6.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Active: 3 * 2" }], vars: { n: 3, res: 6 } },
        { line: 5, log: "fact(3) returning 6.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Returning: 6" }], vars: { n: 3, res: 6, returnVal: 6 } },
        { line: 4, log: "Resuming fact(4). Received 6 from fact(3). Calculating res = 4 * 6 = 24.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Active: 4 * 6" }], vars: { n: 4, res: 24 } },
        { line: 5, log: "fact(4) returning 24.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Returning: 24" }], vars: { n: 4, res: 24, returnVal: 24 } },
        { line: 4, log: "Resuming fact(5). Received 24 from fact(4). Calculating res = 5 * 24 = 120.", stack: [{ n: 5, status: "Active: 5 * 24" }], vars: { n: 5, res: 120 } },
        { line: 5, log: "fact(5) returning 120. Recursion completed!", stack: [{ n: 5, status: "Returning: 120" }], vars: { n: 5, res: 120, returnVal: 120 } },
        { line: 0, log: "Recursion finished. Output is 120.", stack: [], vars: { result: 120 } }
      ]
    },
    binary_search: {
      name: "Binary Search",
      desc: "Traces searching for target 23 in a sorted array. Visualizes the pointers low (blue), high (red), and mid (green) dividing the array.",
      array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
      code: [
        "def binary_search(arr, target):",
        "    low = 0",
        "    high = len(arr) - 1",
        "    while low <= high:",
        "        mid = (low + high) // 2",
        "        if arr[mid] == target:",
        "            return mid",
        "        elif arr[mid] < target:",
        "            low = mid + 1",
        "        else:",
        "            high = mid - 1",
        "    return -1"
      ],
      steps: [
        { line: 1, log: "Searching for target 23 in sorted array.", low: null, high: null, mid: null, vars: { target: 23 } },
        { line: 2, log: "Setting low index to 0.", low: 0, high: null, mid: null, vars: { low: 0, target: 23 } },
        { line: 3, log: "Setting high index to array end (9).", low: 0, high: 9, mid: null, vars: { low: 0, high: 9, target: 23 } },
        { line: 4, log: "Loop condition: is low <= high? (0 <= 9) -> Yes.", low: 0, high: 9, mid: null, vars: { low: 0, high: 9, target: 23 } },
        { line: 5, log: "Calculated mid index: (0+9)//2 = 4. arr[4] = 16.", low: 0, high: 9, mid: 4, vars: { low: 0, high: 9, mid: 4, "arr[mid]": 16, target: 23 } },
        { line: 6, log: "Comparing: is arr[mid] == target? (16 == 23) -> No.", low: 0, high: 9, mid: 4, vars: { low: 0, high: 9, mid: 4, "arr[mid]": 16, target: 23 } },
        { line: 8, log: "Comparing: is arr[mid] < target? (16 < 23) -> Yes.", low: 0, high: 9, mid: 4, vars: { low: 0, high: 9, mid: 4, "arr[mid]": 16, target: 23 } },
        { line: 9, log: "Updating low pointer: mid + 1 = 5. Discarding left half.", low: 5, high: 9, mid: 4, vars: { low: 5, high: 9, target: 23 } },
        { line: 4, log: "Loop condition: is low <= high? (5 <= 9) -> Yes.", low: 5, high: 9, mid: null, vars: { low: 5, high: 9, target: 23 } },
        { line: 5, log: "Calculated mid index: (5+9)//2 = 7. arr[7] = 56.", low: 5, high: 9, mid: 7, vars: { low: 5, high: 9, mid: 7, "arr[mid]": 56, target: 23 } },
        { line: 6, log: "Comparing: is arr[mid] == target? (56 == 23) -> No.", low: 5, high: 9, mid: 7, vars: { low: 5, high: 9, mid: 7, "arr[mid]": 56, target: 23 } },
        { line: 8, log: "Comparing: is arr[mid] < target? (56 < 23) -> No.", low: 5, high: 9, mid: 7, vars: { low: 5, high: 9, mid: 7, "arr[mid]": 56, target: 23 } },
        { line: 11, log: "Updating high pointer: mid - 1 = 6. Discarding right half.", low: 5, high: 6, mid: 7, vars: { low: 5, high: 6, target: 23 } },
        { line: 4, log: "Loop condition: is low <= high? (5 <= 6) -> Yes.", low: 5, high: 6, mid: null, vars: { low: 5, high: 6, target: 23 } },
        { line: 5, log: "Calculated mid index: (5+6)//2 = 5. arr[5] = 23.", low: 5, high: 6, mid: 5, vars: { low: 5, high: 6, mid: 5, "arr[mid]": 23, target: 23 } },
        { line: 6, log: "Comparing: is arr[mid] == target? (23 == 23) -> MATCH FOUND!", low: 5, high: 6, mid: 5, vars: { low: 5, high: 6, mid: 5, "arr[mid]": 23, target: 23 } },
        { line: 7, log: "Returning matched mid index (5).", low: 5, high: 6, mid: 5, vars: { low: 5, high: 6, mid: 5, returnVal: 5 } },
        { line: 0, log: "Search complete. Target 23 found at index 5.", low: 5, high: 6, mid: 5, vars: { result: 5 } }
      ]
    },
    bubble_sort: {
      name: "Bubble Sort",
      desc: "Traces sorting a small unsorted array. Highlights compared indices and shows swaps occurring in real-time.",
      code: [
        "def bubble_sort(arr):",
        "    n = len(arr)",
        "    for i in range(n):",
        "        for j in range(0, n - i - 1):",
        "            if arr[j] > arr[j + 1]:",
        "                arr[j], arr[j+1] = arr[j+1], arr[j]"
      ],
      steps: [
        { line: 1, log: "Initial state of unsorted array.", arr: [23, 8, 56, 12, 38], comp: [], vars: {} },
        { line: 2, log: "Setting n = 5.", arr: [23, 8, 56, 12, 38], comp: [], vars: { n: 5 } },
        { line: 3, log: "Outer Loop: i = 0.", arr: [23, 8, 56, 12, 38], comp: [], vars: { n: 5, i: 0 } },
        { line: 4, log: "Inner Loop: j = 0.", arr: [23, 8, 56, 12, 38], comp: [0, 1], vars: { n: 5, i: 0, j: 0 } },
        { line: 5, log: "Comparing arr[0] and arr[1]: is 23 > 8? Yes.", arr: [23, 8, 56, 12, 38], comp: [0, 1], vars: { n: 5, i: 0, j: 0 } },
        { line: 6, log: "Swapping elements at index 0 and 1.", arr: [8, 23, 56, 12, 38], comp: [0, 1], vars: { n: 5, i: 0, j: 0 } },
        { line: 4, log: "Inner Loop increment: j = 1.", arr: [8, 23, 56, 12, 38], comp: [1, 2], vars: { n: 5, i: 0, j: 1 } },
        { line: 5, log: "Comparing arr[1] and arr[2]: is 23 > 56? No.", arr: [8, 23, 56, 12, 38], comp: [1, 2], vars: { n: 5, i: 0, j: 1 } },
        { line: 4, log: "Inner Loop increment: j = 2.", arr: [8, 23, 56, 12, 38], comp: [2, 3], vars: { n: 5, i: 0, j: 2 } },
        { line: 5, log: "Comparing arr[2] and arr[3]: is 56 > 12? Yes.", arr: [8, 23, 56, 12, 38], comp: [2, 3], vars: { n: 5, i: 0, j: 2 } },
        { line: 6, log: "Swapping elements at index 2 and 3.", arr: [8, 23, 12, 56, 38], comp: [2, 3], vars: { n: 5, i: 0, j: 2 } },
        { line: 4, log: "Inner Loop increment: j = 3.", arr: [8, 23, 12, 56, 38], comp: [3, 4], vars: { n: 5, i: 0, j: 3 } },
        { line: 5, log: "Comparing arr[3] and arr[4]: is 56 > 38? Yes.", arr: [8, 23, 12, 56, 38], comp: [3, 4], vars: { n: 5, i: 0, j: 3 } },
        { line: 6, log: "Swapping elements at index 3 and 4.", arr: [8, 23, 12, 38, 56], comp: [3, 4], vars: { n: 5, i: 0, j: 3 } },
        { line: 3, log: "Outer Loop increment: i = 1 (Pass 2).", arr: [8, 23, 12, 38, 56], comp: [], vars: { n: 5, i: 1 } },
        { line: 4, log: "Inner Loop reset: j = 0.", arr: [8, 23, 12, 38, 56], comp: [0, 1], vars: { n: 5, i: 1, j: 0 } },
        { line: 5, log: "Comparing arr[0] and arr[1]: is 8 > 23? No.", arr: [8, 23, 12, 38, 56], comp: [0, 1], vars: { n: 5, i: 1, j: 0 } },
        { line: 4, log: "Inner Loop increment: j = 1.", arr: [8, 23, 12, 38, 56], comp: [1, 2], vars: { n: 5, i: 1, j: 1 } },
        { line: 5, log: "Comparing arr[1] and arr[2]: is 23 > 12? Yes.", arr: [8, 23, 12, 38, 56], comp: [1, 2], vars: { n: 5, i: 1, j: 1 } },
        { line: 6, log: "Swapping elements at index 1 and 2.", arr: [8, 12, 23, 38, 56], comp: [1, 2], vars: { n: 5, i: 1, j: 1 } },
        { line: 4, log: "Inner Loop increment: j = 2.", arr: [8, 12, 23, 38, 56], comp: [2, 3], vars: { n: 5, i: 1, j: 2 } },
        { line: 5, log: "Comparing arr[2] and arr[3]: is 23 > 38? No.", arr: [8, 12, 23, 38, 56], comp: [2, 3], vars: { n: 5, i: 1, j: 2 } },
        { line: 0, log: "Array sorted successfully!", arr: [8, 12, 23, 38, 56], comp: [], vars: {} }
      ]
    }
  };

  const currentPreset = presets[activeTab];
  const currentStepData = currentPreset.steps[step];

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto min-h-full font-sans bg-[#f9fafb]">
      
      {/* Header Info */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span 
            className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            CRT Study Tools
          </span>
          <span className="text-sm font-bold text-gray-400">Step-by-Step Visualization</span>
        </div>
        <h1 className="text-[40px] font-medium text-[#111827] tracking-tight leading-tight">
          Algorithm Visualizer
        </h1>
        <p className="text-[17px] text-[#6b7280] font-medium mt-1">Interact with and understand complex coding topics visually.</p>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-3 mb-8 bg-white border border-[#e5e7eb] p-1.5 rounded-2xl w-fit shadow-sm">
        {Object.keys(presets).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === key 
                ? 'text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
            style={{ backgroundColor: activeTab === key ? accentColor : undefined }}
          >
            {presets[key].name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CODE VIEWER & STATE VARIABLES (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Syntax Highlighted Code Viewer with Active Line Indicator */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-slate-400 font-mono">Python Code snippet</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Interactive</span>
            </div>
            
            <div className="font-mono text-xs text-slate-300 space-y-1.5 flex-1 relative z-10 select-none">
              {currentPreset.code.map((line, idx) => {
                const lineNum = idx + 1;
                const isActive = currentStepData.line === lineNum;
                
                return (
                  <div 
                    key={idx}
                    className={`flex items-center w-full py-1.5 px-3 rounded-lg transition-all relative ${
                      isActive ? 'bg-indigo-500/10 border-l-4 border-indigo-500 text-white font-bold' : ''
                    }`}
                  >
                    <span className="w-6 text-slate-600 text-right mr-4 select-none font-semibold">{lineNum}</span>
                    <pre className="whitespace-pre">{line}</pre>
                  </div>
                );
              })}
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
          </div>

          {/* Variables and Call Stack values */}
          <div className="bg-white border border-[#e5e7eb] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-indigo-500" /> Local Variables
            </h3>
            <div className="divide-y divide-gray-100 font-mono text-[13px]">
              {Object.keys(currentStepData.vars).length > 0 ? (
                Object.entries(currentStepData.vars).map(([name, val], i) => (
                  <div key={i} className="flex justify-between py-2.5">
                    <span className="text-gray-500 font-semibold">{name}</span>
                    <span className="text-[#111827] font-bold bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-lg shadow-sm">{JSON.stringify(val)}</span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-gray-400 italic text-center text-xs">No variables active in current scope</div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: VISUALIZATION ARENA (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Visualizer Player Panel */}
          <div className="bg-white border border-[#e5e7eb] rounded-3xl p-8 shadow-sm flex flex-col justify-between min-h-[380px] relative overflow-hidden">
            
            {/* Arena Header */}
            <div className="flex justify-between items-center shrink-0 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center" style={{ color: accentColor }}>
                  <Layers className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">{currentPreset.name} Arena</h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Visual state representation</p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full">
                Step {step + 1} of {currentPreset.steps.length}
              </span>
            </div>

            {/* RENDER DYNAMIC ARENA BY TAB */}
            <div className="flex-1 flex flex-col justify-center items-center py-6 w-full">
              
              {/* Preset 1: FACTORIAL (Recursion stack pile) */}
              {activeTab === 'factorial' && (
                <div className="flex flex-col-reverse w-full max-w-[240px] gap-3">
                  {currentStepData.stack && currentStepData.stack.length > 0 ? (
                    <AnimatePresence initial={false}>
                      {currentStepData.stack.map((frame, i) => {
                        const isTop = i === currentStepData.stack.length - 1;
                        const isBase = frame.status.toLowerCase().includes('base');
                        const isReturning = frame.status.toLowerCase().includes('return');
                        
                        return (
                          <motion.div
                            key={frame.n + '-' + i}
                            initial={{ opacity: 0, scale: 0.8, y: -25 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 25 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                            className={`border rounded-xl p-4 text-center flex flex-col justify-center relative overflow-hidden shadow-sm ${
                              isBase 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-extrabold shadow-emerald-100/50' 
                                : isReturning
                                ? 'bg-amber-50 border-amber-200 text-amber-950 font-extrabold shadow-amber-100/50'
                                : isTop
                                ? 'bg-indigo-650 text-white font-extrabold shadow-indigo-100/30'
                                : 'bg-white border-gray-200 text-gray-700'
                            }`}
                            style={{ backgroundColor: isTop && !isBase && !isReturning ? accentColor : undefined }}
                          >
                            <span className="text-sm font-mono font-bold">fact({frame.n})</span>
                            <span className={`text-[10px] mt-1 block truncate font-medium ${isTop && !isBase && !isReturning ? 'text-indigo-200' : 'text-gray-400'}`}>
                              {frame.status}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center text-center space-y-3 py-6"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shadow-inner animate-bounce">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-800 text-sm">Execution Completed</h4>
                        <p className="text-xs text-gray-500 max-w-[200px] mt-0.5">Stack resolved successfully. Output value returned: 120.</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Preset 2: BINARY SEARCH (Array Horizontal sequence) */}
              {activeTab === 'binary_search' && (
                <div className="w-full space-y-12">
                  <div className="flex justify-center items-center gap-2 overflow-x-auto py-4 px-2 custom-scrollbar">
                    {currentPreset.array.map((num, i) => {
                      const isLow = i === currentStepData.low;
                      const isHigh = i === currentStepData.high;
                      const isMid = i === currentStepData.mid;
                      const inRange = currentStepData.low !== null && currentStepData.high !== null && i >= currentStepData.low && i <= currentStepData.high;
                      
                      return (
                        <div key={i} className="flex flex-col items-center shrink-0 gap-2">
                          {/* Array box */}
                          <div 
                            className={`w-12 h-12 rounded-xl border flex items-center justify-center font-mono font-bold text-sm shadow-sm transition-all duration-300 ${
                              isMid 
                                ? 'bg-emerald-500 border-emerald-600 text-white scale-110 shadow-emerald-100 ring-4 ring-emerald-100' 
                                : isLow 
                                ? 'bg-blue-500 border-blue-600 text-white scale-105' 
                                : isHigh 
                                ? 'bg-red-500 border-red-600 text-white scale-105'
                                : inRange
                                ? 'bg-white border-indigo-300 text-indigo-950 font-extrabold'
                                : 'bg-gray-50 border-gray-150 text-gray-400 opacity-40'
                            }`}
                          >
                            {num}
                          </div>
                          
                          {/* Pointer indicators */}
                          <div className="h-6 flex flex-col items-center">
                            {isMid && <span className="text-[10px] font-black text-emerald-600 uppercase">Mid</span>}
                            {isLow && <span className="text-[10px] font-black text-blue-600 uppercase">Low</span>}
                            {isHigh && <span className="text-[10px] font-black text-red-600 uppercase">High</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Legend explanation */}
                  <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-blue-500"></span> Low index</span>
                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-red-500"></span> High index</span>
                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-emerald-500"></span> Midpoint (check)</span>
                  </div>
                </div>
              )}

              {/* Preset 3: BUBBLE SORT (Bar Charts swapping) */}
              {activeTab === 'bubble_sort' && (
                <div className="w-full max-w-lg space-y-8">
                  <div className="flex justify-around items-end h-[160px] border-b border-gray-250 pb-2 relative">
                    {currentStepData.arr.map((val, i) => {
                      const isCompared = currentStepData.comp.includes(i);
                      // Percent height for rendering bars
                      const percentHeight = (val / 56) * 100;
                      
                      return (
                        <div key={i} className="flex flex-col items-center w-16 gap-3">
                          <span className="text-[11px] font-mono font-bold text-gray-500">{val}</span>
                          <motion.div
                            layout
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className={`w-10 rounded-t-xl transition-colors shadow-sm ${
                              isCompared 
                                ? 'bg-amber-400 border border-amber-500 animate-pulse' 
                                : 'bg-indigo-500 border border-indigo-600/50'
                            }`}
                            style={{ 
                              height: `${percentHeight}px`,
                              backgroundColor: !isCompared ? accentColor : undefined,
                              borderColor: !isCompared ? accentColor : undefined
                            }}
                          />
                          <span className="text-[10px] font-black text-gray-400 font-mono">idx {i}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center text-xs font-bold uppercase tracking-wider text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-amber-400"></span> Currently comparing</span>
                  </div>
                </div>
              )}

            </div>

            {/* Stepper Control Actions Bar */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
              {/* Play / Stepper controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={step === 0}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Step Backward"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-6 py-3 rounded-xl font-bold text-white shadow-md flex items-center gap-2 transition-all cursor-pointer hover:brightness-95 text-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  {isPlaying ? 'Pause' : 'Auto Play'}
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={step === currentPreset.steps.length - 1}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Step Forward"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                  title="Reset Algorithm"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Speed Slider */}
              {isPlaying && (
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Delay:</span>
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="250"
                    value={playSpeed}
                    onChange={(e) => setPlaySpeed(parseInt(e.target.value))}
                    className="w-24 accent-indigo-650 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-gray-500 w-12 text-right">{playSpeed}ms</span>
                </div>
              )}
            </div>

          </div>

          {/* Terminal Console Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3">
              <Terminal className="w-4.5 h-4.5 text-emerald-400" /> Execution Console
            </h3>
            <div className="font-mono text-xs text-emerald-400 space-y-2 h-20 overflow-y-auto custom-scrollbar select-none pr-1">
              <div className="text-slate-500">&gt; python code_simulator.py</div>
              <div className="text-white font-bold leading-relaxed">
                &gt; {currentStepData.log}
              </div>
              {step === currentPreset.steps.length - 1 && (
                <div className="text-emerald-500 font-extrabold animate-pulse">&gt; Done. Process finished with exit code 0.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CodeVisualizer;
