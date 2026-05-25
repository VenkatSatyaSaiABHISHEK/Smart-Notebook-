import React, { useState, useEffect, useRef } from 'react';
import { detectTopic } from '../services/notebookService';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Play, 
  Pause, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  ArrowDownLeft,
  ChevronRight,
  X,
  Code2,
  Terminal,
  Activity,
  Loader2
} from 'lucide-react';

// Custom Markdown Code block highlighter to show line-by-line execution trace
const CodeBlockHighlighter = ({ value, stepTitle }) => {
  // Strip out any accidental "id = ..." line if it is present at the beginning of the code block
  const lines = value.split('\n').filter(line => !line.trim().startsWith('id =') && !line.trim().startsWith('id='));
  const title = stepTitle.toLowerCase();
  
  // Heuristically decide which lines of code to highlight based on current step context
  let highlightIndices = [];
  if (title.includes('base')) {
    highlightIndices = [2, 3];
  } else if (title.includes('recursive') || title.includes('call') || title.includes('initial')) {
    highlightIndices = [4];
  } else if (title.includes('backtracking') || title.includes('return')) {
    highlightIndices = [4, 5];
  }

  return (
    <pre className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto text-[12.5px] font-mono shadow-inner text-slate-350 w-full select-none custom-scrollbar">
      <code className="block whitespace-pre">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const isHighlighted = highlightIndices.includes(lineNum);
          
          return (
            <div 
              key={idx} 
              className={`py-0.5 px-3 rounded transition-all duration-300 flex items-center gap-2 ${
                isHighlighted 
                  ? 'bg-indigo-500/15 border-l-4 border-indigo-500 text-white font-bold scale-[1.01]' 
                  : 'text-slate-400'
              }`}
            >
              <span className="w-4 text-right text-slate-655 select-none mr-2 font-mono text-[10px]">{lineNum}</span>
              <span>{line}</span>
            </div>
          );
        })}
      </code>
    </pre>
  );
};

const InteractiveAiExplanation = ({ aiExample, codeContent, isGenerating, accentColor = "#6366f1", onFeedback, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2000);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const timerRef = useRef(null);
  const terminalScrollRef = useRef(null);
  const [visTab, setVisTab] = useState('stack'); // 'stack' | 'code' | 'guide' for mobile view tabs

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Extract and clean topic from explanation text
  const extractTopic = (text) => {
    if (!text) return null;
    const match = text.match(/(?:^|\n)(?:#\s*)?Topic:\s*([^\n]+)/i);
    return match ? match[1].trim() : null;
  };

  const cleanTopicFromText = (text) => {
    if (!text) return '';
    return text.replace(/(?:^|\n)(?:#\s*)?Topic:\s*[^\n]+/i, '').trim();
  };

  const rawTopic = extractTopic(aiExample);
  const cleanedAiExample = cleanTopicFromText(aiExample);

  // Discover function name, operator, and recursion status dynamically
  const parseCodeMetadata = (text) => {
    let name = "fact";
    let isAddition = false;
    let isRecursive = false;
    
    if (text) {
      const defMatch = text.match(/def\s+([a-zA-Z_]\w*)\s*\(/);
      if (defMatch) {
        name = defMatch[1];
        
        // Verify recursion: function name is called at least once inside itself
        const nameEscaped = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const selfCallRegex = new RegExp(`\\b${nameEscaped}\\s*\\(`, 'gi');
        const matches = text.match(selfCallRegex);
        if (matches && matches.length > 1) {
          isRecursive = true;
        }
      } else {
        const callMatch = text.match(/([a-zA-Z_]\w*)\((\d+)\)/);
        if (callMatch && !['print', 'fact', 'if', 'for', 'return'].includes(callMatch[1].toLowerCase())) {
          name = callMatch[1];
        }
      }
      isAddition = text.includes('+') || name.toLowerCase().includes('sum') || name.toLowerCase().includes('add') || text.includes('summ');
    }
    return { name, isAddition, isRecursive };
  };

  const { name: funcName, isAddition, isRecursive } = parseCodeMetadata(cleanedAiExample || '');

  // Parse steps first
  const parseSteps = (text) => {
    if (!text) return { intro: "", steps: [] };
    
    const sections = text.split(/\n(?=###\s)/g);
    const steps = [];
    let intro = "";
    
    sections.forEach((section) => {
      const trimmed = section.trim();
      if (!trimmed) return;
      
      if (trimmed.startsWith("###")) {
        const firstLineEnd = trimmed.indexOf('\n');
        const title = trimmed.substring(3, firstLineEnd === -1 ? trimmed.length : firstLineEnd).trim();
        const content = firstLineEnd === -1 ? "" : trimmed.substring(firstLineEnd + 1).trim();
        steps.push({ title, content });
      } else {
        intro += section + '\n';
      }
    });
    
    return { intro: intro.trim(), steps };
  };

  const { intro, steps } = parseSteps(cleanedAiExample || '');
  const topic = rawTopic || detectTopic(codeContent, 'python', aiExample);

  // Scroll debugger terminal when step changes
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentStep]);

  // Terminal log generator
  const generateTerminalLogs = () => {
    const logs = [];
    logs.push({ type: 'sys', text: `[SYSTEM] Initializing debugger for ${isRecursive ? `recursive function "${funcName}"` : 'program execution'}...` });
    logs.push({ type: 'sys', text: `[SYSTEM] Loaded original source snippet. Ready to execute.` });

    for (let i = 0; i <= currentStep; i++) {
      const step = steps[i];
      if (!step) continue;
      
      logs.push({ type: 'step', text: `> STEP ${i + 1}: ${step.title}` });
      
      const stateMatch = step.content.match(/(?:State|Variables):\s*([^\n]+)/i);
      if (stateMatch) {
        logs.push({ type: 'state', text: `  └─> [STATE] ${stateMatch[1].trim()}` });
      }

      const titleLower = (step.title || '').toLowerCase();
      const contentLower = (step.content || '').toLowerCase();
      if (titleLower.includes('return') || contentLower.includes('returning') || contentLower.includes('returns')) {
        const retMatch = contentLower.match(/return(?:ing)?\s*([0-9a-zA-Z_()\s+*-/%]+)/i);
        if (retMatch) {
          logs.push({ type: 'return', text: `  └─> [RETURN] Resolved to ${retMatch[1].trim()}` });
        }
      }
    }
    
    if (currentStep === steps.length - 1 && steps.length > 0) {
      logs.push({ type: 'sys', text: `[SYSTEM] Execution complete. Stack unwound successfully.` });
    }
    
    return logs;
  };


  // Discover starting parameter N
  const discoverMaxN = () => {
    let maxN = 5;
    for (let i = 0; i < steps.length; i++) {
      const text = (steps[i].title + " " + steps[i].content).toLowerCase();
      const m = text.match(new RegExp(`${funcName}\\((\\d+)\\)`, 'i')) || text.match(/argument\s*(\d+)/) || text.match(/n\s*==?\s*(\d+)/) || text.match(/n\s*=\s*(\d+)/);
      if (m) {
        maxN = parseInt(m[1]);
        if (maxN > 1) break;
      }
    }
    return maxN;
  };

  const maxN = discoverMaxN();

  // Recursive math evaluator
  const getStepVal = (n, isAdd) => {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    if (isAdd) {
      return (n * (n + 1)) / 2; // Sum of first n numbers
    } else {
      let temp = 1;
      for (let k = 2; k <= n; k++) temp *= k; // Factorial
      return temp;
    }
  };

  // Stack state compiler that dynamically parses execution stack frames from AI output
  const generateStackStates = (allSteps) => {
    const states = [];
    
    if (!isRecursive) {
      allSteps.forEach(() => states.push([]));
      return states;
    }

    let currentStack = [];

    allSteps.forEach((step, idx) => {
      const title = step.title || '';
      const content = step.content || '';
      const combinedText = (title + '\n' + content);
      const combinedTextLower = combinedText.toLowerCase();

      // 1. Try to parse from "Call Stack:" line first
      const stackLineMatch = content.match(/Call\s+Stack:\s*(.+)/i) || title.match(/Call\s+Stack:\s*(.+)/i);
      if (stackLineMatch) {
        const stackStr = stackLineMatch[1].trim();
        if (stackStr.toLowerCase() === 'empty' || stackStr === '[]') {
          currentStack = [];
        } else {
          const parts = stackStr.split(/->/);
          currentStack = parts.map((partStr, pIdx) => {
            const part = partStr.trim();
            // Match status inside brackets [...] at the end of the string
            const statusMatch = part.match(/\[([^\]]+)\]\s*$/);
            let label = part;
            let status = pIdx === parts.length - 1 ? 'Active' : 'Suspended';
            
            if (statusMatch) {
              status = statusMatch[1].trim();
              label = part.replace(/\[([^\]]+)\]\s*$/, '').trim();
            }
            
            return {
              n: label,
              label: label,
              status: status
            };
          });
        }
        states.push([...currentStack]);
        return;
      }

      // 2. Fallback heuristic parsing if no "Call Stack:" line exists
      // Find all matches of funcName(...) in the text
      const nameEscaped = funcName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const callRegex = new RegExp(`\\b${nameEscaped}\\s*\\(([^)]*)\\)`, 'gi');
      
      let match;
      const callsFound = [];
      while ((match = callRegex.exec(combinedText)) !== null) {
        callsFound.push({
          label: match[0].trim(),
          args: match[1].trim()
        });
      }

      if (callsFound.length > 0) {
        // Look at calls found in this step
        callsFound.forEach(call => {
          const existingIdx = currentStack.findIndex(f => f.label === call.label);
          if (existingIdx !== -1) {
            // If already in stack, truncate stack to this call (we returned/backtracked to it)
            currentStack = currentStack.slice(0, existingIdx + 1);
            currentStack = currentStack.map((f, i) => 
              i === currentStack.length - 1 ? { ...f, status: 'Active' } : f
            );
          } else {
            // New call: push to stack
            currentStack = currentStack.map(f => ({ ...f, status: 'Suspended' }));
            currentStack.push({
              n: call.label,
              label: call.label,
              status: 'Active'
            });
          }
        });
      }

      // If step mentions return/returning/base, update top frame status
      if (currentStack.length > 0) {
        const titleLower = title.toLowerCase();
        const contentLower = content.toLowerCase();
        
        // Base case is active if the title or a specific content pattern mentions base case reached
        const isBase = titleLower.includes('base');
        
        // Return is active if the title mentions return/backtrack, or if content specifically says "returning" (but not talking about base case rules in step 1)
        const isReturn = titleLower.includes('return') || titleLower.includes('backtrack') || titleLower.includes('unwound') || (contentLower.includes('returning') && !titleLower.includes('call') && idx > 0);
        
        if (isBase || isReturn) {
          // Try to extract return value
          let retVal = '';
          const retMatch = content.match(/returns?\s+([^\n.]+)/i) || title.match(/returns?\s+([^\n.]+)/i);
          if (retMatch) {
            retVal = retMatch[1].trim();
            retVal = retVal.replace(/[`*]/g, '');
          }
          
          currentStack = currentStack.map((f, i) => {
            if (i === currentStack.length - 1) {
              let status = 'Active';
              if (isBase) {
                status = `Base case reached` + (retVal ? `: returns ${retVal}` : '');
              } else {
                status = `Returning` + (retVal ? ` ${retVal}` : '');
              }
              return { ...f, status };
            }
            return f;
          });
        }
      }

      // If it's the final step, make sure we show the completed state
      if (idx === allSteps.length - 1) {
        if (combinedTextLower.includes('final result') || combinedTextLower.includes('print')) {
          currentStack = [];
        }
      }

      states.push([...currentStack]);
    });

    return states;
  };

  const stackStates = generateStackStates(steps);

  // Parse State: var1 = val1, var2 = val2 from content
  const parseVariables = (content) => {
    if (!content) return [];
    const match = content.match(/(?:State|Variables):\s*([^\n]+)/i);
    if (!match) return [];
    
    const varsStr = match[1];
    const parts = varsStr.split(/,\s*/);
    const vars = [];
    parts.forEach(part => {
      const eqIdx = part.indexOf('=');
      if (eqIdx !== -1) {
        const name = part.substring(0, eqIdx).trim();
        const val = part.substring(eqIdx + 1).trim();
        if (name && val) {
          vars.push({ name, val });
        }
      }
    });
    return vars;
  };

  // Compile variable states across all steps
  const generateVariableStates = (allSteps) => {
    const states = [];
    let currentVars = {};
    
    allSteps.forEach((step) => {
      const vars = parseVariables(step.content);
      vars.forEach(v => {
        currentVars[v.name] = v.val;
      });
      states.push({ ...currentVars });
    });
    
    return states;
  };

  const variableStates = generateVariableStates(steps);

  // Auto-play timer (stops at the end, does NOT auto-close anymore)
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsPlaying(false);
            return prev;
          }
        });
      }, playSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length, playSpeed]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() || !onFeedback) return;
    setIsFeedbackOpen(false);
    await onFeedback(feedbackText);
    setFeedbackText('');
  };

  // 1. Rendering full screen loader if isGenerating is true
  if (isGenerating) {
    return (
      <div className="bg-white rounded-[24px] overflow-hidden flex flex-col justify-center items-center font-sans w-full h-[85vh] md:h-[78vh] gap-4 shadow-sm border border-[#e2e8f0]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" style={{ color: accentColor }} />
        <div className="text-center">
          <h4 className="font-extrabold text-gray-800 text-sm">Analyzing & Structuring Visual Trace</h4>
          <p className="text-xs text-gray-450 mt-1">Generating dynamic steps, highlighting indices, and caching to Storebase...</p>
        </div>
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="prose prose-sm max-w-none text-indigo-950 p-6">
        <ReactMarkdown>{aiExample}</ReactMarkdown>
      </div>
    );
  }

  const activeStack = stackStates[currentStep] || [];
  const currentStepData = steps[currentStep];

  // Helper to compile backtracking equations dynamically up to maxN
  const getMathEquations = (activeStepIdx) => {
    const isSimpleArithmetic = ['fact', 'factorial', 'sum', 'add', 'fib', 'fibonacci'].includes(funcName.toLowerCase());
    if (!isSimpleArithmetic) return [];

    const equations = [];
    const baseVal = isAddition ? 0 : 1;
    const op = isAddition ? '+' : '*';
    
    // Find if we are in the backtracking phase or final step
    let firstBacktrackIdx = -1;
    let totalBacktracks = 0;
    
    for (let i = 0; i < steps.length; i++) {
      const stepTitle = steps[i].title.toLowerCase();
      const content = steps[i].content.toLowerCase();
      const isBack = stepTitle.includes('backtracking') || stepTitle.includes('return') || stepTitle.includes('back') || (stepTitle.includes('step') && i >= steps.length * 0.55 && i < steps.length - 1);
      
      if (isBack) {
        if (firstBacktrackIdx === -1) firstBacktrackIdx = i;
        totalBacktracks++;
      }
    }
    
    const isFinal = activeStepIdx === steps.length - 1;
    const hasStartedBacktrack = firstBacktrackIdx !== -1 && activeStepIdx >= firstBacktrackIdx;
    
    if (hasStartedBacktrack || isFinal) {
      equations.push({ label: `${funcName}(0) = ${baseVal}`, active: false });
      
      let currentLimit = 0;
      if (isFinal) {
        currentLimit = maxN; // Show full path on completion
      } else {
        const currentBacktrackStep = activeStepIdx - firstBacktrackIdx + 1;
        currentLimit = Math.min(maxN, Math.round(currentBacktrackStep * (maxN / totalBacktracks)));
      }
      
      for (let k = 1; k <= currentLimit; k++) {
        const prevVal = getStepVal(k - 1, isAddition);
        const currentVal = getStepVal(k, isAddition);
        equations.push({
          label: `${funcName}(${k}) = ${k} ${op} ${funcName}(${k - 1}) = ${k} ${op} ${prevVal} = ${currentVal}`,
          active: k === currentLimit && !isFinal
        });
      }
    }
    
    return equations;
  };

  const mathEquations = getMathEquations(currentStep);

  const getFormulaText = () => {
    const fName = funcName || 'func';
    const fNameLower = fName.toLowerCase();
    if (fNameLower.startsWith('fib') || fNameLower === 'fin') {
      return `${fName}(n) = ${fName}(n-1) + ${fName}(n-2)`;
    }
    if (fNameLower.startsWith('fact')) {
      return `${fName}(n) = n * ${fName}(n-1)`;
    }
    if (fNameLower.startsWith('sum')) {
      return `${fName}(n) = n + ${fName}(n-1)`;
    }
    return `${fName}(n) = ${fName}(n-1) + ...`;
  };

  const getFinalResult = () => {
    if (!steps || steps.length === 0) return null;
    const finalStepContent = steps[steps.length - 1]?.content || "";
    const match = finalStepContent.match(/returns?\s+(\d+)/i) || 
                  finalStepContent.match(/answer\s+is\s+(\d+)/i) ||
                  finalStepContent.match(/result(?:\s+is)?\s+(\d+)/i);
    return match ? match[1] : null;
  };

  // Extract highlight line numbers from the current step data
  const getHighlightLinesForStep = (stepData) => {
    if (!stepData) return [];
    const title = stepData.title || "";
    const content = stepData.content || "";
    
    // Look for "(Line X)" or "(Lines X-Y)" in the title or content
    let match = title.match(/\(lines?\s*(\d+)(?:\s*-\s*(\d+))?\)/i);
    if (!match) {
      match = content.match(/\(lines?\s*(\d+)(?:\s*-\s*(\d+))?\)/i);
    }
    
    if (match) {
      const start = parseInt(match[1]);
      const end = match[2] ? parseInt(match[2]) : start;
      const lines = [];
      for (let l = start; l <= end; l++) {
        lines.push(l);
      }
      return lines;
    }
    
    // Heuristic fallbacks if the AI didn't output line numbers explicitly
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    if (lowerTitle.includes('base') || lowerContent.includes('base case')) {
      return [2, 3];
    }
    if (lowerTitle.includes('recursive') || lowerTitle.includes('call') || lowerTitle.includes('initial')) {
      return [4];
    }
    if (lowerTitle.includes('backtracking') || lowerTitle.includes('return')) {
      return [4, 5];
    }
    
    return [];
  };

  const highlightLines = getHighlightLinesForStep(currentStepData);

  return (
    <div className="bg-white rounded-[24px] overflow-hidden flex flex-col font-sans transition-all duration-300 w-full h-[85vh] md:h-[78vh] relative">
      {/* Title Bar */}
      <div className="px-6 py-4 bg-indigo-50/50 border-b border-[#e2e8f0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center text-white" style={{ backgroundColor: accentColor }}>
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-gray-900 leading-tight">Interactive Execution Player</h4>
              {/* Notebook & Storebase Indicators */}
              <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase select-none">Notebook</span>
              {topic && (
                <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-750 text-[9px] font-black uppercase select-none">
                  #{topic}
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-black uppercase flex items-center gap-0.5 select-none">
                <CheckCircle2 className="w-2.5 h-2.5" /> Stored in Storebase
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 text-left">
              {isRecursive ? `Recursive Function: ${funcName}` : 'Standard Execution Flow'}
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Correct AI / Feedback action button */}
          {onFeedback && (
            <button 
              onClick={() => setIsFeedbackOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-650 hover:bg-indigo-50 transition-colors cursor-pointer text-xs font-black flex items-center gap-1 mr-1.5 shrink-0"
              title="Report execution error / correct trace"
            >
              <Sparkles className="w-3.5 h-3.5" /> Correct AI
            </button>
          )}

          <button 
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="p-1.5 rounded-lg border border-[#e2e8f0] text-gray-555 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
            title="Previous Step"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:brightness-95"
            style={{ backgroundColor: accentColor }}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            {isPlaying ? 'Pause' : 'Auto Play'}
          </button>
          
          <button 
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="p-1.5 rounded-lg border border-[#e2e8f0] text-gray-555 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
            title="Next Step"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
            className="p-1.5 rounded-lg border border-[#e2e8f0] text-gray-400 hover:text-gray-650 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Reset Visualizer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          {onClose && (
            <button 
              onClick={() => { setIsPlaying(false); onClose(); }}
              className="p-1.5 rounded-lg border border-red-200 text-red-505 text-red-500 hover:bg-red-50 hover:text-red-650 transition-colors cursor-pointer ml-1.5"
              title="Close Visualizer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {intro && currentStep === 0 && (
        <div className="px-6 py-3.5 bg-gradient-to-r from-indigo-50/30 to-purple-50/20 border-b border-gray-100 text-xs font-semibold text-indigo-900/80 leading-relaxed italic flex items-center gap-2 shrink-0 select-none">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <ReactMarkdown>{intro}</ReactMarkdown>
        </div>
      )}

      {/* Mobile-only Segmented Control Arena Tabs */}
      <div className="lg:hidden flex bg-slate-50 border-b border-slate-200 shrink-0 select-none p-1.5 gap-1.5">
        <button
          onClick={() => setVisTab('stack')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            visTab === 'stack'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 bg-transparent'
          }`}
          style={{ backgroundColor: visTab === 'stack' ? accentColor : undefined }}
        >
          <Layers className="w-3.5 h-3.5" /> Stack
        </button>
        <button
          onClick={() => setVisTab('code')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            visTab === 'code'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 bg-transparent'
          }`}
          style={{ backgroundColor: visTab === 'code' ? accentColor : undefined }}
        >
          <Code2 className="w-3.5 h-3.5" /> Code
        </button>
        <button
          onClick={() => setVisTab('guide')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            visTab === 'guide'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 bg-transparent'
          }`}
          style={{ backgroundColor: visTab === 'guide' ? accentColor : undefined }}
        >
          <Sparkles className="w-3.5 h-3.5" /> Explain
        </button>
      </div>

      {/* 3-Column Arena: Visualizer, Code Tracing, step text */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden">
        
        {/* Column 1: Visual Arena (Left) */}
        <div className={`lg:col-span-4 bg-slate-50 border-r border-gray-100 p-6 flex-col justify-between items-center relative min-h-0 h-full overflow-hidden ${visTab === 'stack' ? 'flex' : 'hidden lg:flex'}`}>
          
          {isRecursive ? (
            activeStack.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full flex flex-col justify-between items-center py-6 px-4 text-center select-none min-h-0 overflow-y-auto custom-scrollbar"
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-150 px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Lesson Complete
                </div>

                {/* Teacher Vector Animation SVG */}
                <div className="w-full flex-1 flex items-center justify-center min-h-[200px] max-h-[320px] my-4 relative">
                  <svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-h-[300px]">
                    <defs>
                      <linearGradient id="chalkboardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#142c16" />
                        <stop offset="100%" stopColor="#1f4422" />
                      </linearGradient>
                      <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8b5a2b" />
                        <stop offset="100%" stopColor="#5c3a1a" />
                      </linearGradient>
                      <linearGradient id="blazerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                      <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    <style>{`
                      @keyframes wave {
                        0%, 100% { transform: rotate(0deg); }
                        50% { transform: rotate(15deg); }
                      }
                      @keyframes pointer-tap {
                        0%, 100% { transform: rotate(0deg); }
                        50% { transform: rotate(-3deg); }
                      }
                      @keyframes bob {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-4px); }
                      }
                      @keyframes float-sparkle {
                        0% { transform: translateY(10px) scale(0.8); opacity: 0; }
                        50% { opacity: 0.8; }
                        100% { transform: translateY(-20px) scale(1.1); opacity: 0; }
                      }
                      @keyframes draw-path {
                        to { stroke-dashoffset: 0; }
                      }
                      .waving-arm {
                        animation: wave 2s ease-in-out infinite;
                        transform-origin: 305px 145px;
                      }
                      .pointer-arm {
                        animation: pointer-tap 3s ease-in-out infinite;
                        transform-origin: 185px 150px;
                      }
                      .teacher-head {
                        animation: bob 4s ease-in-out infinite;
                        transform-origin: 250px 100px;
                      }
                      .chalk-checkmark {
                        stroke-dasharray: 100;
                        stroke-dashoffset: 100;
                        animation: draw-path 1.5s ease-out forwards;
                        animation-delay: 0.5s;
                      }
                      .sparkle-1 {
                        animation: float-sparkle 3s ease-in-out infinite;
                      }
                      .sparkle-2 {
                        animation: float-sparkle 2.5s ease-in-out infinite;
                        animation-delay: 1s;
                      }
                      .sparkle-3 {
                        animation: float-sparkle 3.5s ease-in-out infinite;
                        animation-delay: 0.5s;
                      }
                    `}</style>

                    {/* Background / Classroom environment */}
                    <rect width="400" height="300" rx="16" fill="#f8fafc" />

                    {/* Chalkboard Frame (wood) */}
                    <rect x="20" y="20" width="360" height="150" rx="8" fill="url(#woodGrad)" stroke="#4a2e15" strokeWidth="2" />
                    {/* Chalkboard Inner */}
                    <rect x="28" y="28" width="344" height="134" rx="4" fill="url(#chalkboardGrad)" />

                    {/* Chalkboard Stand/Tray */}
                    <rect x="15" y="170" width="370" height="6" fill="#5c3a1a" />
                    {/* Small Chalk pieces on tray */}
                    <rect x="100" y="167" width="10" height="3" fill="#ffffff" rx="1" />
                    <rect x="115" y="168" width="8" height="3" fill="#fef08a" rx="1" transform="rotate(5, 115, 168)" />

                    {/* Blackboard Formulas & Content */}
                    <text x="45" y="65" fill="#fef08a" fontFamily="'Courier New', Courier, monospace" fontSize="13" fontWeight="bold" opacity="0.9" filter="url(#glow)">
                      {getFormulaText()}
                    </text>
                    <text x="45" y="90" fill="#ffffff" fontFamily="'Courier New', Courier, monospace" fontSize="12" fontWeight="bold" opacity="0.8">
                      Stack Level: 0 (Resolved)
                    </text>
                    <text x="45" y="115" fill="#a7f3d0" fontFamily="'Courier New', Courier, monospace" fontSize="12" fontStyle="italic" opacity="0.8">
                      {getFinalResult() ? `result = ${getFinalResult()}` : "Recursion complete!"}
                    </text>

                    {/* Chalk checkmark */}
                    <path d="M 270 70 L 285 90 L 320 50" fill="none" stroke="#34d399" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="chalk-checkmark" filter="url(#glow)" />
                    <text x="260" y="120" fill="#34d399" fontFamily="'Courier New', Courier, monospace" fontSize="14" fontWeight="bold" filter="url(#glow)">
                      Success!
                    </text>

                    {/* Sparkles around chalkboard */}
                    <g className="sparkle-1" transform="translate(180, 50)">
                      <polygon points="0,-5 2,-2 5,0 2,2 0,5 -2,2 -5,0 -2,-2" fill="#fde047" />
                    </g>
                    <g className="sparkle-2" transform="translate(310, 40)">
                      <polygon points="0,-4 1,-1 4,0 1,1 0,4 -1,1 -4,0 -1,-1" fill="#67e8f9" />
                    </g>
                    <g className="sparkle-3" transform="translate(80, 130)">
                      <polygon points="0,-4 1,-1 4,0 1,1 0,4 -1,1 -4,0 -1,-1" fill="#f472b6" />
                    </g>

                    {/* Teacher Character Group */}
                    <g transform="translate(5, 50)">
                      {/* Teacher Body/Suit */}
                      <path d="M 210 250 L 290 250 L 280 180 L 220 180 Z" fill="url(#blazerGrad)" />
                      {/* Collared shirt */}
                      <polygon points="240,180 250,195 260,180 250,180" fill="#ffffff" />
                      <polygon points="245,180 250,190 255,180" fill="#e2e8f0" />
                      
                      {/* Neck */}
                      <rect x="245" y="170" width="10" height="12" fill="#ffd1b3" />
                      
                      {/* Head group with bob animation */}
                      <g className="teacher-head">
                        {/* Hair Back */}
                        <path d="M 220 120 C 220 90, 280 90, 280 120 Z" fill="#4b3621" />
                        {/* Face */}
                        <circle cx="250" cy="140" r="24" fill="#ffd1b3" />
                        {/* Glasses */}
                        <circle cx="240" cy="138" r="7" fill="none" stroke="#312e81" strokeWidth="2" />
                        <circle cx="260" cy="138" r="7" fill="none" stroke="#312e81" strokeWidth="2" />
                        <path d="M 247 138 L 253 138" stroke="#312e81" strokeWidth="2" />
                        {/* Eyes */}
                        <circle cx="240" cy="138" r="2" fill="#1e293b" />
                        <circle cx="260" cy="138" r="2" fill="#1e293b" />
                        
                        {/* Cheeks/Blush */}
                        <circle cx="232" cy="146" r="3" fill="#f43f5e" opacity="0.4" />
                        <circle cx="268" cy="146" r="3" fill="#f43f5e" opacity="0.4" />
                        
                        {/* Mouth (Smile!) */}
                        <path d="M 245 152 Q 250 158 255 152" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
                        
                        {/* Hair Front / Bangs */}
                        <path d="M 223 125 C 230 115, 245 120, 250 122 C 255 120, 270 115, 277 125 C 283 115, 277 105, 250 105 C 223 105, 217 115, 223 125 Z" fill="#362517" />
                      </g>

                      {/* Waving Arm */}
                      <g className="waving-arm">
                        <path d="M 275 185 L 305 145 C 310 140, 315 145, 310 150 L 285 195 Z" fill="url(#blazerGrad)" />
                        <circle cx="310" cy="142" r="7" fill="#ffd1b3" />
                        <path d="M 306 138 C 304 135, 310 132, 312 135" stroke="#ffd1b3" strokeWidth="2" strokeLinecap="round" />
                      </g>

                      {/* Pointer Arm */}
                      <g className="pointer-arm">
                        <path d="M 225 185 L 185 150 C 180 145, 175 150, 180 155 L 215 195 Z" fill="url(#blazerGrad)" />
                        <circle cx="180" cy="148" r="6" fill="#ffd1b3" />
                        <line x1="180" y1="148" x2="115" y2="105" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="115" cy="105" r="2.5" fill="#f59e0b" />
                      </g>
                    </g>
                  </svg>
                </div>

                {/* Result Summary */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm w-full max-w-[280px] shrink-0 mt-auto">
                  <h5 className="font-extrabold text-gray-800 text-sm">Execution Completed</h5>
                  <p className="text-xs text-gray-500 mt-1 leading-normal">
                    All recursive frames have resolved and the stack has successfully unwound!
                  </p>
                  {getFinalResult() && (
                    <div className="mt-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl py-2 px-3 flex justify-between items-center shadow-md">
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-90">Final Output</span>
                      <span className="font-mono text-sm font-black tracking-wide">{funcName}({maxN}) = {getFinalResult()}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-450 flex items-center gap-1.5 absolute top-4 left-4 shrink-0">
                  <Layers className="w-3.5 h-3.5 text-gray-400" /> Call Stack Trace
                </div>
                
                <div className="absolute top-4 right-4 text-xs font-bold text-gray-400 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-sm shrink-0">
                  Step {currentStep + 1} of {steps.length}
                </div>

                {/* Call Stack Frame Stack */}
                <div 
                  className="w-full flex-1 flex flex-col justify-start items-center py-2 min-h-0 overflow-y-auto custom-scrollbar mt-10"
                  style={{ maxHeight: mathEquations.length > 0 ? '38%' : '48%' }}
                >
                  {activeStack.length > 0 ? (
                    <div className="flex flex-col-reverse w-full max-w-[210px] gap-2 py-4 mt-auto">
                      <AnimatePresence initial={false}>
                        {(() => {
                          const isReturningPhase = activeStack.some(f => 
                            f.status.toLowerCase().includes('return') || 
                            f.status.toLowerCase().includes('base') || 
                            f.status.toLowerCase().includes('unwound')
                          );
                          
                          return activeStack.map((frame, i) => {
                            const isTop = i === activeStack.length - 1;
                            const isBase = frame.status.toLowerCase().includes('base');
                            const isParentActive = frame.status.toLowerCase().includes('calculating') || frame.status.toLowerCase().includes('active');
                            
                            return (
                              <React.Fragment key={(frame.label || frame.n) + '-' + i}>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8, y: -25 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 25 }}
                                  transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                                  className={`border rounded-xl p-3.5 text-center flex flex-col justify-center relative overflow-hidden shadow-sm ${
                                    isBase 
                                      ? 'bg-emerald-50 border-emerald-250 text-emerald-950 font-extrabold shadow-emerald-100/50' 
                                      : isParentActive
                                      ? 'bg-amber-50 border-amber-250 text-amber-950 font-extrabold shadow-amber-100/30'
                                      : isTop
                                      ? 'bg-indigo-650 text-white font-extrabold shadow-indigo-100/30'
                                      : 'bg-white border-gray-200 text-gray-700'
                                  }`}
                                  style={{ 
                                    backgroundColor: isTop && !isBase && !isParentActive ? accentColor : undefined,
                                    marginLeft: `${i * 10}px` 
                                  }}
                                >
                                  {isTop && !isBase && !isParentActive && (
                                    <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-full blur-md pointer-events-none" />
                                  )}
                                  <span className="text-[13px] font-mono font-bold">
                                    {frame.label || `${funcName}(${frame.n})`}
                                  </span>
                                  <span className={`text-[9.5px] mt-1 block leading-tight break-words whitespace-pre-wrap text-left ${
                                    isTop && !isBase && !isParentActive ? 'text-indigo-200' : 'text-gray-400'
                                  }`}>
                                    {frame.status}
                                  </span>
                                </motion.div>

                                {/* Flow Connector Arrow between this card and the one below it */}
                                {i > 0 && (
                                  <div 
                                    className="flex flex-col items-center justify-center shrink-0 my-0.5 select-none"
                                    style={{ marginLeft: `${(i - 0.5) * 10}px` }}
                                  >
                                    {isReturningPhase ? (
                                      <motion.div
                                        animate={{ y: [1, -1, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="flex flex-col items-center text-emerald-500 font-extrabold text-[9px] gap-0.5"
                                        title="Returning value down the stack"
                                      >
                                        <span className="font-sans text-[8px]">▼</span>
                                        <span className="text-[8px] tracking-tighter uppercase opacity-80">return</span>
                                      </motion.div>
                                    ) : (
                                      <motion.div
                                        animate={{ y: [-1, 1, -1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="flex flex-col items-center text-indigo-550 font-extrabold text-[9px] gap-0.5"
                                        title="Calling recursive helper up the stack"
                                      >
                                        <span className="text-[8px] tracking-tighter uppercase opacity-80">call</span>
                                        <span className="font-sans text-[8px]">▲</span>
                                      </motion.div>
                                    )}
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          });
                        })()}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center text-center space-y-3"
                    >
                      <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shadow-inner animate-bounce">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-gray-800 text-sm">Execution Completed</h5>
                        <p className="text-xs text-gray-500 max-w-[200px] mt-0.5">Stack unwound. Result resolved successfully.</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Frame Variables (Local Scope) for Recursive calls */}
                <div 
                  className="w-full border-t border-gray-200/60 pt-3 flex flex-col min-h-[100px] overflow-y-auto custom-scrollbar text-left flex-1"
                  style={{ maxHeight: mathEquations.length > 0 ? '28%' : '40%' }}
                >
                  <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mb-2 shrink-0">
                    <Activity className="w-3.5 h-3.5 text-gray-400" /> Frame Variables
                  </div>
                  {Object.keys(variableStates[currentStep] || {}).length > 0 ? (
                    <div className="w-full space-y-1.5 pb-2">
                      {Object.entries(variableStates[currentStep] || {}).map(([name, val]) => {
                        const prevVal = currentStep > 0 ? (variableStates[currentStep - 1]?.[name]) : undefined;
                        const isChanged = prevVal !== undefined && prevVal !== val;
                        
                        return (
                          <motion.div
                            key={name}
                            animate={isChanged ? { scale: [1, 1.02, 1], borderColor: ['#e2e8f0', '#f59e0b', '#e2e8f0'] } : {}}
                            transition={{ duration: 0.5 }}
                            className={`w-full rounded-xl border p-2 flex justify-between items-center shadow-sm hover:translate-x-0.5 hover:shadow-md transition-all duration-200 bg-white text-[10.5px] ${
                              isChanged ? 'border-amber-350 ring-2 ring-amber-50/40' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`font-mono font-black px-2 py-0.5 rounded border ${
                                isChanged 
                                  ? 'bg-amber-50 border-amber-200 text-amber-700' 
                                  : 'bg-indigo-50 border-indigo-100 text-indigo-750'
                              }`}>
                                {name}
                              </span>
                              {isChanged && (
                                <span className="text-[7.5px] font-black text-amber-600 bg-amber-50 border border-amber-205 px-1 py-0.5 rounded uppercase animate-pulse">Updated</span>
                              )}
                            </div>
                            
                            {/* Dotted Line Divider Connector */}
                            <div className="flex-1 border-b border-dashed border-gray-200/80 mx-2.5 h-0 mt-0.5" />
                            
                            <span className={`font-mono font-bold px-2 py-0.5 rounded-lg border shrink-0 ${
                              isChanged 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-sm font-black' 
                                : 'bg-slate-50 text-slate-750 border-slate-200/60 shadow-xs'
                            }`}>
                              {val}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-center py-4 opacity-50">
                      <p className="text-[10.5px] text-gray-400 italic">No variables active in scope</p>
                    </div>
                  )}
                </div>
                
                {/* Backtracking math calculations resolution panel */}
                {mathEquations.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-2 mt-2 shrink-0 select-none max-h-[140px] overflow-hidden flex flex-col"
                  >
                    <div className="text-[9.5px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-1 shrink-0">
                      <ArrowDownLeft className="w-3.5 h-3.5" /> Backtracking Resolution
                    </div>
                    <div className="font-mono text-[11.5px] space-y-1.5 pt-1 overflow-y-auto flex-1 custom-scrollbar">
                      {mathEquations.map((eq, i) => (
                        <div 
                          key={i} 
                          className={`flex items-center gap-1 py-1 px-2.5 rounded-lg transition-all ${
                            eq.active 
                              ? 'bg-amber-50 border border-amber-200 text-amber-950 font-bold scale-[1.01]' 
                              : 'text-gray-400'
                          }`}
                        >
                          <ChevronRight className={`w-3.5 h-3.5 ${eq.active ? 'text-amber-500' : 'text-gray-300'}`} />
                          <span>{eq.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )
          ) : (
            // Variable Scope Tracker for non-recursive code execution (e.g. standard variables, loops)
            <>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 absolute top-4 left-4 shrink-0">
                <Activity className="w-3.5 h-3.5 text-gray-400" /> Variable Scope
              </div>
              
              <div className="absolute top-4 right-4 text-xs font-bold text-gray-400 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-sm shrink-0">
                Step {currentStep + 1} of {steps.length}
              </div>

              <div className="w-full flex-1 flex flex-col justify-start py-10 px-2 gap-3 overflow-y-auto custom-scrollbar select-none mt-6 min-h-0">
                {Object.keys(variableStates[currentStep] || {}).length > 0 ? (
                  <div className="w-full space-y-2.5">
                    {Object.entries(variableStates[currentStep] || {}).map(([name, val]) => {
                      const prevVal = currentStep > 0 ? (variableStates[currentStep - 1]?.[name]) : undefined;
                      const isChanged = prevVal !== undefined && prevVal !== val;
                      
                      return (
                        <motion.div
                          key={name}
                          animate={isChanged ? { scale: [1, 1.03, 1], borderColor: ['#e2e8f0', '#f59e0b', '#e2e8f0'] } : {}}
                          transition={{ duration: 0.5 }}
                          className={`w-full rounded-xl border p-3 flex justify-between items-center shadow-sm hover:translate-x-0.5 hover:shadow-md transition-all duration-200 bg-white ${
                            isChanged ? 'border-amber-350 ring-2 ring-amber-50/40' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`font-mono text-xs font-black px-2.5 py-1 rounded border ${
                              isChanged 
                                ? 'bg-amber-50 border-amber-200 text-amber-750' 
                                : 'bg-indigo-50 border-indigo-150 text-indigo-800'
                            }`}>
                              {name}
                            </span>
                            {isChanged && (
                              <span className="text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-205 px-1.5 py-0.5 rounded uppercase animate-pulse">Updated</span>
                            )}
                          </div>
                          
                          {/* Dotted Line Divider Connector */}
                          <div className="flex-1 border-b border-dashed border-gray-200 mx-3 h-0 mt-0.5" />
                          
                          <span className={`font-mono text-xs font-bold px-3 py-1 rounded-lg border shrink-0 ${
                            isChanged 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-md font-black' 
                              : 'bg-slate-50 text-slate-850 border-slate-250/70 shadow-sm'
                          }`}>
                            {val}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-10 space-y-2 opacity-50 flex-1">
                    <Terminal className="w-8 h-8 text-gray-400" />
                    <p className="text-xs text-gray-455 italic">No variables active in scope</p>
                  </div>
                )}
              </div>
            </>
          )}

          {isPlaying && (
            <div className="w-full flex items-center justify-center gap-2 mt-4 shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Speed:</span>
              <input 
                type="range"
                min="1000"
                max="4000"
                step="500"
                value={5000 - playSpeed}
                onChange={(e) => setPlaySpeed(5000 - parseInt(e.target.value))}
                className="w-20 h-1 rounded-lg bg-gray-200 appearance-none cursor-pointer accent-indigo-650"
              />
            </div>
          )}
        </div>

        {/* Column 2: Code Tracing (Middle) - Now wraps long code lines correctly */}
        <div className={`lg:col-span-4 bg-slate-950 border-r border-slate-900 p-5 flex-col relative select-none h-full overflow-hidden ${visTab === 'code' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-4 shrink-0">
            <Code2 className="w-3.5 h-3.5 text-slate-400" /> Code Execution Trace
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[12.5px] text-slate-350 space-y-2.5 py-2 min-h-0 pr-1">
            {codeContent ? (
              codeContent.split('\n').map((line, idx) => {
                const lineNum = idx + 1;
                const isHighlighted = highlightLines.includes(lineNum);
                return (
                  <div
                    key={idx}
                    className={`py-1 px-2 rounded transition-all duration-200 flex items-start gap-2 ${
                      isHighlighted
                        ? 'bg-indigo-500/20 border-l-4 text-white font-bold scale-[1.01]'
                        : 'text-slate-400 opacity-60'
                    }`}
                    style={isHighlighted ? { borderLeftColor: accentColor } : undefined}
                  >
                    <span className="w-5 text-right text-slate-600 select-none mr-2 font-mono text-[10px] shrink-0 mt-0.5">{lineNum}</span>
                    <pre className="whitespace-pre-wrap break-all leading-relaxed flex-1 font-mono text-[12.5px] select-text">{line}</pre>
                  </div>
                );
              })
            ) : (
              <div className="text-slate-500 italic text-xs text-center py-10">No code snippet available</div>
            )}
          </div>
          
          {/* Simulated Debugger Terminal (Stdout Log) */}
          <div className="mt-4 pt-3 border-t border-slate-900 flex flex-col h-[130px] shrink-0 text-left select-text">
            <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-2 shrink-0 select-none">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" /> Debugger Console
            </div>
            <div className="flex-1 bg-black/40 rounded-xl border border-slate-900/60 p-3 font-mono text-[10.5px] overflow-y-auto custom-scrollbar flex flex-col gap-1 select-text">
              {generateTerminalLogs().map((log, i) => (
                <div key={i} className="leading-normal break-all">
                  {log.type === 'sys' && <span className="text-cyan-400 font-bold">{log.text}</span>}
                  {log.type === 'step' && <span className="text-white font-bold">{log.text}</span>}
                  {log.type === 'state' && <span className="text-emerald-450 font-semibold">{log.text}</span>}
                  {log.type === 'return' && <span className="text-amber-400 font-bold">{log.text}</span>}
                </div>
              ))}
              <div ref={terminalScrollRef} />
            </div>
          </div>

          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-[30px] pointer-events-none" />
        </div>

        {/* Column 3: Step Details & Explanations (Right) */}
        <div className={`lg:col-span-4 p-5 flex-col justify-between h-full overflow-hidden bg-white ${visTab === 'guide' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 min-h-0 pb-4 text-left">
            <h5 className="text-[14.5px] font-extrabold text-gray-900 flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }}></span>
              <span className="truncate">{currentStepData.title}</span>
            </h5>
            
            {/* React Markdown override */}
            <div className="text-[13.5px] leading-relaxed text-gray-600 prose prose-sm max-w-none custom-scrollbar">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeVal = String(children).replace(/\n$/, '');
                    return !inline && match ? (
                      <CodeBlockHighlighter 
                        value={codeVal} 
                        stepTitle={currentStepData.title} 
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  blockquote({ children }) {
                    return (
                      <div className="bg-amber-50/75 border-l-4 border-amber-500 rounded-r-xl p-3 my-3 text-[12.5px] text-amber-950 font-medium shadow-sm flex gap-2.5 items-start leading-relaxed">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold block text-amber-800 text-[10px] uppercase tracking-wider mb-0.5">Teacher's Tip</span>
                          {children}
                        </div>
                      </div>
                    );
                  },
                  li({ children }) {
                    return (
                      <li className="flex items-start gap-2 my-1.5 text-[13px] text-gray-655 leading-relaxed font-sans">
                        <span className="text-indigo-500 mt-1 select-none text-[10px] shrink-0">✦</span>
                        <div className="flex-1">{children}</div>
                      </li>
                    );
                  },
                  p({ children }) {
                    let isTip = false;
                    let prefix = "";
                    
                    const getChildrenText = (nodes) => {
                      if (!nodes) return "";
                      if (typeof nodes === "string") return nodes;
                      if (Array.isArray(nodes)) {
                        return nodes.map(n => typeof n === "string" ? n : (n?.props?.children ? getChildrenText(n.props.children) : "")).join("");
                      }
                      return "";
                    };

                    const textVal = getChildrenText(children);
                    const textValTrim = textVal.trim();

                    if (textValTrim.toLowerCase().startsWith('tip:') || textValTrim.toLowerCase().startsWith('note:')) {
                      isTip = true;
                      prefix = textValTrim.match(/^(?:tip|note):\s*/i)[0];
                    }

                    if (isTip) {
                      const modifiedChildren = React.Children.map(children, (child, idx) => {
                        if (idx === 0 && typeof child === 'string') {
                          return child.substring(prefix.length);
                        }
                        return child;
                      });

                      return (
                        <div className="bg-amber-50/75 border-l-4 border-amber-500 rounded-r-xl p-3 my-3 text-[12.5px] text-amber-950 font-medium shadow-sm flex gap-2.5 items-start leading-relaxed">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold block text-amber-800 text-[10px] uppercase tracking-wider mb-0.5">Teacher's Tip</span>
                            {modifiedChildren}
                          </div>
                        </div>
                      );
                    }

                    if (textValTrim.startsWith('State:')) {
                      const cleanStr = textValTrim.replace(/^State:\s*/i, '').trim();
                      const pairs = cleanStr.split(/,\s*/);
                      const stateItems = [];
                      pairs.forEach(pair => {
                        const eqIdx = pair.indexOf('=');
                        if (eqIdx !== -1) {
                          const name = pair.substring(0, eqIdx).trim();
                          const val = pair.substring(eqIdx + 1).trim();
                          if (name && val) {
                            stateItems.push({ name, val });
                          }
                        }
                      });

                      if (stateItems.length > 0) {
                        return (
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 my-3 text-[12.5px] shadow-sm text-left">
                            <span className="font-black block text-indigo-700 text-[9px] uppercase tracking-widest mb-2.5 flex items-center gap-1.5 select-none">
                              <Activity className="w-3.5 h-3.5 text-indigo-500" /> Active Local Variables
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {stateItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white border border-slate-100 rounded-xl p-2 shadow-xs">
                                  <span className="font-mono font-black text-indigo-900 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded text-[11px]">
                                    {item.name}
                                  </span>
                                  <span className="font-mono font-bold text-slate-750 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-lg text-[11px]">
                                    {item.val}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    }

                    if (textValTrim.toLowerCase().includes('final answer is')) {
                      return (
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-4 my-3 shadow-md flex gap-3 items-center justify-between">
                          <div className="flex gap-2.5 items-start">
                            <Sparkles className="w-5 h-5 text-emerald-100 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <span className="font-black block text-emerald-100 text-[9px] uppercase tracking-wider mb-0.5">Success Resolution</span>
                              <p className="text-[13px] font-semibold leading-relaxed text-emerald-50">
                                {textVal}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return <p className="mb-2.5 text-gray-650 leading-relaxed font-sans">{children}</p>;
                  }
                }}
              >
                {currentStepData.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Nav dots */}
          <div className="pt-4 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto py-1 custom-scrollbar shrink-0">
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentStep(idx); setIsPlaying(false); }}
                className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[8px] font-black transition-all cursor-pointer ${
                  idx === currentStep 
                    ? 'text-white shadow-sm ring-4 ring-indigo-50 scale-110' 
                    : idx < currentStep
                    ? 'bg-indigo-50 text-indigo-650 hover:bg-indigo-100 font-bold'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-250'
                }`}
                style={{
                  backgroundColor: idx === currentStep ? accentColor : undefined
                }}
                title={step.title}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* AI Error Feedback Modal Popup */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col gap-4 text-left"
          >
            <div className="flex justify-between items-center">
              <h5 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" /> Correct AI Explanation
              </h5>
              <button 
                onClick={() => setIsFeedbackOpen(false)}
                className="text-gray-450 hover:text-gray-650 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              If the AI made an error in tracing, code formatting, or math (e.g. including system metadata like `id="random_id"` inside Python blocks), tell the AI what to correct. The visual trace will be updated and stored.
            </p>
            
            <textarea
              className="w-full h-24 border border-gray-250 rounded-xl p-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 focus:outline-none font-sans"
              placeholder="E.g., Please clean up the Python code blocks by removing the accidental random_id variable lines."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim()}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: accentColor }}
              >
                Submit Feedback
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InteractiveAiExplanation;
