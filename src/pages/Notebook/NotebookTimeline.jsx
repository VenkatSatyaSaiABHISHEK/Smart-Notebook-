import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Brain, Plus, Image as ImageIcon, FileText, Link as LinkIcon, 
  Send, Loader2, Code, Play, CheckCircle2, FileCode2, Trash2, Edit2, Save, X,
  Calendar, Terminal, Check, PlayCircle, MoreVertical, ArrowUp, ArrowDown, Sparkles, Cpu
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getNotebookEntries, addNotebookEntry, deleteNotebookEntry, updateNotebookEntry, getCachedExplanation, setCachedExplanation, updateUserTokens, getLocalCachedExplanation, detectTopic } from '../../services/notebookService';
import { processWithGroq } from '../../services/groqService';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';
import InteractiveAiExplanation from '../../components/InteractiveAiExplanation';

let globalCellId = 10000;

const parseInputPrompts = (code, language) => {
  const prompts = [];
  const hasStdin = code.includes('input(') || code.includes('scanf(') || code.includes('cin >>') || code.includes('sys.stdin') || code.includes('getchar(') || code.includes('fgets(');
  if (!hasStdin) return null;

  if (language === 'python') {
    const regex = /input\(\s*(['"])(.*?)\1\s*\)/g;
    let match;
    while ((match = regex.exec(code)) !== null) {
      prompts.push(match[2]);
    }
    const plainInputMatches = code.match(/input\(\s*\)/g) || [];
    const sysStdinMatches = code.match(/sys\.stdin/g) || [];
    const totalPromptsNeeded = plainInputMatches.length + sysStdinMatches.length;
    if (prompts.length === 0 && totalPromptsNeeded === 0) {
      prompts.push("Enter input: ");
    } else {
      const targetLength = prompts.length + totalPromptsNeeded;
      for (let i = prompts.length; i < targetLength; i++) {
        prompts.push("Enter input: ");
      }
    }
  } else if (language === 'c') {
    const scanfCount = (code.match(/scanf\(/g) || []).length;
    const fgetsCount = (code.match(/fgets\(/g) || []).length;
    const getcharCount = (code.match(/getchar\(/g) || []).length;
    const total = scanfCount + fgetsCount + getcharCount;
    for (let i = 0; i < total; i++) {
      prompts.push(`Standard Input (stdin)${total > 1 ? ' [' + (i + 1) + ']' : ''}: `);
    }
    if (prompts.length === 0) {
      prompts.push("Standard Input (stdin): ");
    }
  }
  return prompts.length > 0 ? prompts : ["Enter input: "];
};

const formatExecutionOutput = (stdout, prompts, values) => {
  if (!stdout) return stdout;
  if (!prompts || !values || prompts.length === 0) return stdout;
  
  let formatted = stdout;
  let prependedInputs = "";
  
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    const val = values[i] || "";
    
    const idx = formatted.indexOf(prompt);
    if (idx !== -1) {
      const afterPrompt = formatted.substring(idx + prompt.length);
      const startWithVal = afterPrompt.startsWith(val + "\n") || afterPrompt.startsWith(val + "\r\n");
      if (!startWithVal) {
        formatted = formatted.substring(0, idx + prompt.length) + val + "\n" + afterPrompt;
      }
    } else {
      prependedInputs += `${prompt}${val}\n`;
    }
  }
  
  return prependedInputs + formatted;
};

const NotebookTimeline = () => {
  const { day } = useParams();
  const { currentUser, userData, setUserData } = useAuth();
  const bottomRef = useRef(null);
  const monacoRef = useRef({});
  const editorRefs = useRef({});
  const debounceTimer = useRef({});
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  // Tabs
  const [activeTab, setActiveTab] = useState('notebook');

  // Initial Notebook Data for the Day
  const [entries, setEntries] = useState([]);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Input State
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [activeExplanationId, setActiveExplanationId] = useState(null);
  const [isTokenHubOpen, setIsTokenHubOpen] = useState(false);

  // Close active explanation modal if we switch sub-tabs
  useEffect(() => {
    setActiveExplanationId(null);
  }, [activeTab]);

  const updateUserTokenUsage = async (used, saved = 0) => {
    if (!currentUser?.uid) return;
    if (setUserData) {
      setUserData(prev => {
        const base = prev || {};
        return {
          ...base,
          tokensUsed: (base.tokensUsed || 0) + used,
          tokensSaved: (base.tokensSaved || 0) + saved
        };
      });
    }
    try {
      await updateUserTokens(currentUser.uid, used, saved);
    } catch (e) {
      console.error("Error updating user tokens:", e);
    }
  };

  // Timetable State
  const [timetableTasks, setTimetableTasks] = useState([
    { id: 1, time: '7AM-8AM', title: 'Doubt Clarification', desc: 'TTL Mentoring by Anand PAG Mentors' },
    { id: 2, time: '8AM-9AM', title: 'BREAKFAST', desc: '' },
    { id: 3, time: '9AM-12PM', title: 'Python', desc: '' },
    { id: 4, time: '12PM-1PM', title: 'LUNCH BREAK', desc: '' },
    { id: 5, time: '1PM-4PM', title: 'ai Abhiyaan', desc: '' },
    { id: 6, time: '5PM-7PM', title: 'Daily Assessments', desc: 'Monitoring by Hostel Staff' }
  ]);

  // Code Lab State
  const [codeLabLanguage, setCodeLabLanguage] = useState('python'); // 'python', 'c'
  const [codeCells, setCodeCells] = useState(() => {
    try {
      const saved = localStorage.getItem(`codeLab_${day}`);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [{ id: 1, type: 'code', content: 'print("Hello from Python!")', output: '', aiResult: '', isRunning: false, isCorrecting: false }];
  });

  // Save workspace to local storage on change
  useEffect(() => {
    if (codeCells.length > 0) {
      localStorage.setItem(`codeLab_${day}`, JSON.stringify(codeCells));
    }
  }, [codeCells, day]);

  // Scroll to bottom only when a new entry is added (entries.length changes)
  useEffect(() => {
    if (activeTab === 'notebook' && entries.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries.length, activeTab]);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!currentUser?.uid) return;
      setIsLoading(true);
      try {
        const data = await getNotebookEntries(currentUser.uid, day || '1');
        data.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
        setEntries(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntries();
  }, [currentUser, day]);

  // Timetable Functions
  const handleAddTimetableTask = () => {
    setTimetableTasks([...timetableTasks, { id: Date.now(), time: '', title: '', desc: '' }]);
  };
  const handleUpdateTimetableTask = (id, field, value) => {
    setTimetableTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };
  const handleDeleteTimetableTask = (id) => {
    setTimetableTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateCell = (id, updates) => {
    setCodeCells(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const debouncedLint = (id, code) => {
    if (debounceTimer.current[id]) clearTimeout(debounceTimer.current[id]);
    debounceTimer.current[id] = setTimeout(async () => {
      try {
        const lang = codeLabLanguage === 'python' ? 'python' : 'c';
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/lint`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Bypass-Tunnel-Reminder": "true" },
          body: JSON.stringify({ language: lang, code })
        });
        const data = await res.json();
        
        const monaco = monacoRef.current[id];
        const editor = editorRefs.current[id];
        if (monaco && editor) {
          const model = editor.getModel();
          const markers = data.errors.map(err => ({
            startLineNumber: err.line,
            startColumn: 1,
            endLineNumber: err.line,
            endColumn: 1000,
            message: err.message,
            severity: monaco.MarkerSeverity.Error
          }));
          monaco.editor.setModelMarkers(model, "linting", markers);
        }
      } catch (e) {
        console.error("Linting error:", e);
      }
    }, 500);
  };

  const handleAddCodeCell = (index) => {
    const newCells = [...codeCells];
    newCells.splice(index + 1, 0, { id: Date.now() + Math.random(), type: 'code', content: '', output: '', aiResult: '', isRunning: false, isCorrecting: false });
    setCodeCells(newCells);
  };

  const handleAddTextCell = (index) => {
    const newCells = [...codeCells];
    newCells.splice(index + 1, 0, { id: Date.now() + Math.random(), type: 'text', content: '', isEditing: true });
    setCodeCells(newCells);
  };

  const handleDeleteCodeCell = (id) => {
    if (codeCells.length === 1) return;
    setCodeCells(prev => prev.filter(c => c.id !== id));
  };

  const handleAutoAIErrorExplain = async (id, code, errorMsg) => {
    updateCell(id, { isCorrecting: true });
    try {
      const prompt = `I got an error running this ${codeLabLanguage} code:

\`\`\`${codeLabLanguage}
${code}
\`\`\`

Error:
${errorMsg}

Please briefly explain why this happened and provide the corrected code.

CRITICAL INSTRUCTION FOR CORRECTED CODE:
1. You MUST preserve the original function names, variable names, and line-by-line structure as much as possible. Do NOT rename any functions (e.g. keep 'fin' as 'fin', do NOT rename to 'fib' or 'fibonacci') or variables.
2. Only fix the exact bug causing the error. Do NOT add extra validation checks (such as value errors or negative checks) or rewrite the control flow (e.g., changing 'if' statements to 'elif/else' structures or nesting) unless it is directly causing the error.
3. Keep the corrected code as close as possible to the original line count so that it can be easily traced line-by-line.`;
      const res = await processWithGroq(prompt, "explain_code");
      updateCell(id, { aiResult: "⚠️ **Auto-Error Analysis:**\n\n" + res.text });
      updateUserTokenUsage(res.usage.total_tokens, 0);
    } catch (err) {
      console.error(err);
    } finally {
      updateCell(id, { isCorrecting: false });
    }
  };

  const runCode = async (id, code) => {
    if (!code.trim()) return;
    
    const lang = codeLabLanguage === 'python' ? 'python' : 'c';
    const prompts = parseInputPrompts(code, lang);
    
    if (prompts) {
      updateCell(id, {
        isRunning: true,
        awaitingInput: true,
        inputPrompts: prompts,
        inputValues: Array(prompts.length).fill(''),
        currentPromptIndex: 0,
        output: '',
        aiResult: ''
      });
      return;
    }
    
    await executeCodeRequest(id, code, [], []);
  };

  const submitCodeInput = async (id, code, inputValues) => {
    updateCell(id, { awaitingInput: false, isRunning: true });
    const lang = codeLabLanguage === 'python' ? 'python' : 'c';
    const prompts = parseInputPrompts(code, lang) || [];
    await executeCodeRequest(id, code, inputValues, prompts);
  };

  const executeCodeRequest = async (id, code, inputValues = [], prompts = []) => {
    updateCell(id, { isRunning: true, output: '', aiResult: '' });
    try {
      const lang = codeLabLanguage === 'python' ? 'python' : 'c';
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const cellInput = inputValues.join('\n');
      const response = await fetch(`${API_BASE}/api/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Bypass-Tunnel-Reminder": "true" },
        body: JSON.stringify({ language: lang, code: code, input: cellInput })
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      let outText = result.output || "Executed successfully with no output.";
      
      // Format output to show entered input inline
      outText = formatExecutionOutput(outText, prompts, inputValues);
      
      updateCell(id, { output: outText });
      if (outText.toLowerCase().includes('error') || outText.toLowerCase().includes('traceback') || outText.toLowerCase().includes('exception')) {
        handleAutoAIErrorExplain(id, code, outText);
      }
    } catch (error) {
      updateCell(id, { output: "Error running code: " + error.message });
      handleAutoAIErrorExplain(id, code, error.message);
    } finally {
      updateCell(id, { isRunning: false });
    }
  };

  const handleAskAI = async (id, code) => {
    if (!code.trim()) return;
    updateCell(id, { isCorrecting: true });
    try {
      const prompt = `Here is some ${codeLabLanguage} code:

\`\`\`${codeLabLanguage}
${code}
\`\`\`

Please analyze it. If there are syntax or runtime errors, explain why they happen and provide the corrected code.

CRITICAL INSTRUCTION FOR CORRECTED CODE:
1. You MUST preserve the original function names, variable names, and line-by-line structure as much as possible. Do NOT rename any functions (e.g. keep 'fin' as 'fin', do NOT rename to 'fib' or 'fibonacci') or variables.
2. Only fix the exact bug causing the error. Do NOT add extra validation checks (such as value errors or negative checks) or rewrite the control flow (e.g., changing 'if' statements to 'elif/else' structures or nesting) unless it is directly causing the error.
3. Keep the corrected code as close as possible to the original line count so that it can be easily traced line-by-line.`;
      const res = await processWithGroq(prompt, "explain_code");
      updateCell(id, { aiResult: res.text });
      updateUserTokenUsage(res.usage.total_tokens, 0);
    } catch (err) {
      updateCell(id, { aiResult: "AI Error: " + err.message });
    } finally {
      updateCell(id, { isCorrecting: false });
    }
  };

  const runNotebookEntry = async (id, code, language) => {
    if (!code?.trim()) return;

    const lang = language === 'python' ? 'python' : 'c';
    const prompts = parseInputPrompts(code, lang);

    if (prompts) {
      setEntries(prev => prev.map(entry =>
        entry.id === id ? {
          ...entry,
          isRunning: true,
          awaitingInput: true,
          inputPrompts: prompts,
          inputValues: Array(prompts.length).fill(''),
          currentPromptIndex: 0,
          output: ''
        } : entry
      ));
      return;
    }

    await executeNotebookEntryRequest(id, code, language, [], []);
  };

  const submitNotebookEntryInput = async (id, code, language, inputValues) => {
    setEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, awaitingInput: false, isRunning: true } : entry
    ));
    const lang = language === 'python' ? 'python' : 'c';
    const prompts = parseInputPrompts(code, lang) || [];
    await executeNotebookEntryRequest(id, code, language, inputValues, prompts);
  };

  const executeNotebookEntryRequest = async (id, code, language, inputValues = [], prompts = []) => {
    setEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, isRunning: true, output: '' } : entry
    ));

    try {
      const lang = language === 'python' ? 'python' : 'c';
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const cellInput = inputValues.join('\n');
      const response = await fetch(`${API_BASE}/api/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Bypass-Tunnel-Reminder": "true" },
        body: JSON.stringify({ language: lang, code: code, input: cellInput })
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      let outText = result.output || "Executed successfully with no output.";
      
      // Format output to show entered input inline
      outText = formatExecutionOutput(outText, prompts, inputValues);

      let aiResultUpdate = undefined;
      const lowerOut = outText.toLowerCase();
      if (lowerOut.includes('error') || lowerOut.includes('traceback') || lowerOut.includes('exception')) {
        const prompt = `I got an error running this ${lang} code:

\`\`\`${lang}
${code}
\`\`\`

Error:
${outText}

Please briefly explain why this happened and provide the corrected code.

CRITICAL INSTRUCTION FOR CORRECTED CODE:
1. You MUST preserve the original function names, variable names, and line-by-line structure as much as possible. Do NOT rename any functions (e.g. keep 'fin' as 'fin', do NOT rename to 'fib' or 'fibonacci') or variables.
2. Only fix the exact bug causing the error. Do NOT add extra validation checks (such as value errors or negative checks) or rewrite the control flow (e.g., changing 'if' statements to 'elif/else' structures or nesting) unless it is directly causing the error.
3. Keep the corrected code as close as possible to the original line count so that it can be easily traced line-by-line.`;
        const aiExp = await processWithGroq(prompt, "explain_code");
        aiResultUpdate = "⚠️ **Auto-Error Analysis:**\n\n" + aiExp.text;
        updateUserTokenUsage(aiExp.usage.total_tokens, 0);
      }
      
      setEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, output: outText, aiExample: aiResultUpdate !== undefined ? aiResultUpdate : entry.aiExample, isRunning: false } : entry
      ));
      
      // Save output asynchronously
      const updateData = { output: outText };
      if (aiResultUpdate) updateData.aiExample = aiResultUpdate;
      updateNotebookEntry(currentUser.uid, day || '1', id, updateData).catch(console.error);

    } catch (error) {
      const outText = "Error running code: " + error.message;
      setEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, output: outText, isRunning: false } : entry
      ));
      updateNotebookEntry(currentUser.uid, day || '1', id, { output: outText }).catch(console.error);
      
      // Auto explain error
      const prompt = `I got an error running this code:

\`\`\`
${code}
\`\`\`

Error:
${error.message}

Please briefly explain why this happened and provide the corrected code.

CRITICAL INSTRUCTION FOR CORRECTED CODE:
1. You MUST preserve the original function names, variable names, and line-by-line structure as much as possible. Do NOT rename any functions (e.g. keep 'fin' as 'fin', do NOT rename to 'fib' or 'fibonacci') or variables.
2. Only fix the exact bug causing the error. Do NOT add extra validation checks (such as value errors or negative checks) or rewrite the control flow (e.g., changing 'if' statements to 'elif/else' structures or nesting) unless it is directly causing the error.
3. Keep the corrected code as close as possible to the original line count so that it can be easily traced line-by-line.`;
      processWithGroq(prompt, "explain_code").then(aiExp => {
        const aiResultUpdate = "⚠️ **Auto-Error Analysis:**\n\n" + aiExp.text;
        updateUserTokenUsage(aiExp.usage.total_tokens, 0);
        setEntries(prev => prev.map(entry => 
          entry.id === id ? { ...entry, aiExample: aiResultUpdate } : entry
        ));
        updateNotebookEntry(currentUser.uid, day || '1', id, { aiExample: aiResultUpdate }).catch(console.error);
      }).catch(console.error);
    }
  };

  const handleSubmitCodeToNotebook = async () => {
    setIsAnalyzing(true);
    setAnalysisStatus('Saving your Code Lab workspace...');
    setActiveTab('notebook');
    
    setTimeout(async () => {
      try {
        const newEntriesList = [];
        for (const cell of codeCells) {
          if (!cell.content.trim()) continue;
          const newEntryData = {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: cell.type === 'text' ? 'text' : 'code',
            language: cell.type === 'text' ? null : codeLabLanguage,
            content: cell.content,
            output: cell.output || null,
            aiExample: cell.aiResult || null,
            source: 'Code Lab Workspace'
          };
          const docId = await addNotebookEntry(currentUser.uid, day || '1', newEntryData);
          newEntriesList.push({ id: docId, ...newEntryData });
        }
        if(newEntriesList.length > 0) {
           setEntries(prev => [...prev, ...newEntriesList]);
        }
        
        // Reset Code Lab after successful save
        setCodeCells([{ id: ++globalCellId, type: 'code', content: codeLabLanguage === 'c' ? '#include <stdio.h>\\n\\nint main() {\\n    printf("Hello from C!\\\\n");\\n    return 0;\\n}' : 'print("Hello from Python!")', output: '', aiResult: '', isRunning: false, isCorrecting: false }]);
      } catch (e) {
        alert("Failed to save workspace: " + e.message);
      }
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleAddData('photo', event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (event) => {
            handleAddData('photo', event.target.result);
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsAnalyzing(true);
    setAnalysisStatus('Parsing PDF document structure...');
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const typedarray = new Uint8Array(event.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(" ") + "\\n";
          }
          
          // PDF Chunking Logic
          const chunkSize = 3000;
          const chunks = [];
          for (let i = 0; i < fullText.length; i += chunkSize) {
            chunks.push(fullText.slice(i, i + chunkSize));
          }

          for (let i = 0; i < chunks.length; i++) {
            setAnalysisStatus(`AI is analyzing PDF chunk ${i + 1} of ${chunks.length}...`);
            const chunkText = chunks[i];
            const dataToProcess = "Format and extract the blocks from this PDF part:\\n\\n" + chunkText;
            
            try {
              const resObj = await processWithGroq(dataToProcess, "extract_blocks");
              const aiBlocksStr = resObj.text;
              updateUserTokenUsage(resObj.usage.total_tokens, 0);
              const jsonMatch = aiBlocksStr.match(/\[.*\]/s);
              if (jsonMatch) {
                const blocks = JSON.parse(jsonMatch[0]);
                const newEntriesList = [];
                for (const block of blocks) {
                  const cellEntryData = {
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: block.type || 'text',
                    content: block.content || '',
                    language: block.language || null,
                    output: block.output || null,
                    aiExample: block.aiExample || null,
                    topic: block.topic || null,
                    source: 'PDF Upload'
                  };
                  const docId = await addNotebookEntry(currentUser.uid, day || '1', cellEntryData);
                  newEntriesList.push({ id: docId, ...cellEntryData });
                }
                setEntries(prev => [...prev, ...newEntriesList]);
              } else {
                throw new Error("No JSON array found in response");
              }
            } catch (err) {
              console.error("Groq Chunk Error:", err);
              const cellEntryData = {
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'text',
                content: dataToProcess,
                source: 'PDF Upload (Raw)'
              };
              const docId = await addNotebookEntry(currentUser.uid, day || '1', cellEntryData);
              setEntries(prev => [...prev, { id: docId, ...cellEntryData }]);
            }
          }
          setIsAnalyzing(false);
          setAnalysisStatus('');
        } catch (err) {
          alert("Failed to parse PDF: " + err.message);
          setIsAnalyzing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      alert("Failed to load PDF parser. Are you online?");
      setIsAnalyzing(false);
    }
    e.target.value = null;
  };

  const handleColabClick = () => {
    let url = inputText.trim();
    if (!url.includes('colab.research.google.com')) {
      url = window.prompt("Enter a public Google Colab URL:");
    }
    if (url && url.includes('colab.research.google.com')) {
      handleAddData('colab', url);
    } else if (url) {
      alert("Invalid Colab Link. It must contain 'colab.research.google.com'");
    }
  };

  // Notebook Data Submission
  const handleAddData = async (type, customText = '') => {
    const dataToProcess = customText || inputText;
    if (!dataToProcess && type === 'text') return;

    setIsAnalyzing(true);
    
    if (type === 'colab' || dataToProcess.includes('colab.research.google.com')) setAnalysisStatus('Connecting to Google Colab & extracting code...');
    else if (type === 'pdf') setAnalysisStatus('Parsing PDF document structure...');
    else if (type === 'photo') setAnalysisStatus('Running OCR on image...');
    else setAnalysisStatus('AI is analyzing raw text...');

    setTimeout(async () => {
      const newEntryData = {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const isColab = type === 'colab' || dataToProcess.includes('colab.research.google.com');

      if (isColab) {
        try {
          const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await fetch(`${API_BASE}/api/extract-colab`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Bypass-Tunnel-Reminder": "true" },
            body: JSON.stringify({ url: dataToProcess })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to extract Colab data.');
          
          const newEntriesList = [];
          for (const cell of data.cells) {
            const cellEntryData = {
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: cell.type,
              content: cell.content,
              language: cell.language || null,
              output: cell.output || null,
              source: 'Colab Import'
            };
            const docId = await addNotebookEntry(currentUser.uid, day || '1', cellEntryData);
            newEntriesList.push({ id: docId, ...cellEntryData });
          }
          
          setEntries(prev => [...prev, ...newEntriesList]);
          setInputText('');
          setIsAnalyzing(false);
          return;
          
        } catch (err) {
          newEntryData.type = 'text';
          newEntryData.content = `[Backend Extraction Error] Could not fetch code: ${err.message}\nMake sure your Colab link is public and your Node.js backend is running.`;
        }
      } else if (dataToProcess.includes('def ') || dataToProcess.includes('class ')) {
        newEntryData.type = 'code';
        newEntryData.language = 'python';
        newEntryData.content = dataToProcess;
        newEntryData.source = 'Code Snippet';
      } else {
        try {
          const resObj = await processWithGroq(dataToProcess, "extract_blocks");
          const aiBlocksStr = resObj.text;
          updateUserTokenUsage(resObj.usage.total_tokens, 0);
          const jsonMatch = aiBlocksStr.match(/\[.*\]/s);
          if (jsonMatch) {
            const blocks = JSON.parse(jsonMatch[0]);
            const newEntriesList = [];
            const actionSource = isColab ? 'Colab Import' : type === 'pdf' ? 'PDF Upload' : type === 'photo' ? 'Image OCR' : 'Text Note';
            for (const block of blocks) {
              const cellEntryData = {
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: block.type || 'text',
                content: block.content || '',
                language: block.language || null,
                output: block.output || null,
                aiExample: block.aiExample || null,
                topic: block.topic || null,
                source: actionSource
              };
              const docId = await addNotebookEntry(currentUser.uid, day || '1', cellEntryData);
              newEntriesList.push({ id: docId, ...cellEntryData });
            }
            setEntries(prev => [...prev, ...newEntriesList]);
            setInputText('');
            setIsAnalyzing(false);
            return;
          } else {
            throw new Error("No JSON array found in response");
          }
        } catch (err) {
          console.error("Groq JSON Error:", err);
          newEntryData.type = 'text';
          newEntryData.content = dataToProcess; 
        }
      }

      try {
        const docId = await addNotebookEntry(currentUser.uid, day || '1', newEntryData);
        setEntries(prev => [...prev, { id: docId, ...newEntryData }]);
      } catch (e) {
        alert("Failed to save entry: " + e.message);
      }
      
      setInputText('');
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this notebook entry?")) return;
    try {
      await deleteNotebookEntry(currentUser.uid, day || '1', entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (error) {
      alert("Failed to delete entry: " + error.message);
    }
  };

  const handleEditStart = (entry) => {
    setEditingId(entry.id);
    setEditText(entry.content);
  };

  const handleEditSave = async (entryId) => {
    try {
      await updateNotebookEntry(currentUser.uid, day || '1', entryId, { content: editText });
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, content: editText } : e));
      setEditingId(null);
    } catch (error) {
      alert("Failed to update entry: " + error.message);
    }
  };

  const handleGenerateExample = async (entryId) => {
    const entryToExplain = entries.find(e => e.id === entryId);
    if (!entryToExplain) return;

    // Immediately show the player (loading state or full explanation)
    setActiveExplanationId(entryId);

    // If it's already explained, it will display the completed explanation immediately
    if (entryToExplain.aiExample) {
      return;
    }

    const codeContent = (entryToExplain.content || '').trim();
    
    // 1. Check Local Storage Cache first for instant load!
    const localCached = getLocalCachedExplanation(currentUser?.uid, codeContent);
    if (localCached) {
      const detectedTopic = detectTopic({ content: codeContent, aiExample: localCached });
      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? { ...entry, aiExample: localCached, topic: detectedTopic, isGeneratingExample: false } : entry
      ));
      await updateNotebookEntry(currentUser.uid, day || '1', entryId, { aiExample: localCached, topic: detectedTopic });
      await updateUserTokenUsage(0, 1500); // Record cached token savings!
      return;
    }

    // 2. Check Firestore Explanation Cache (Storebase) next!
    // We check this BEFORE checking user limits because cache hits use 0 Groq tokens!
    try {
      const cachedExplanation = await getCachedExplanation(currentUser?.uid, codeContent);
      if (cachedExplanation) {
        const detectedTopic = detectTopic({ content: codeContent, aiExample: cachedExplanation });
        setEntries(prev => prev.map(entry => 
          entry.id === entryId ? { ...entry, aiExample: cachedExplanation, topic: detectedTopic, isGeneratingExample: false } : entry
        ));
        await updateNotebookEntry(currentUser.uid, day || '1', entryId, { aiExample: cachedExplanation, topic: detectedTopic });
        // Record cached token savings! Let's say an average trace saves 1500 tokens
        await updateUserTokenUsage(0, 1500);
        return;
      }
    } catch (e) {
      console.error("Cache check failed:", e);
    }

    // Check token limit before calling Groq
    const tokenLimit = 50000;
    const currentUsed = userData?.tokensUsed || 0;
    if (currentUsed >= tokenLimit) {
      alert("⚠️ Groq Token Limit Reached! You have reached your daily budget of 50,000 tokens. Caching (Storebase) is still active for previously run snippets, but new snippets cannot be analyzed until tomorrow.");
      setActiveExplanationId(null); // Close modal if blocked
      return;
    }

    setEntries(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, isGeneratingExample: true } : entry
    ));

    try {
      // 2. Cache Miss: generate explanation from Groq API
      const resObj = await processWithGroq(entryToExplain.content, "explain_code");
      const explanation = resObj.text;

      // Update actual token usage in Firestore and context
      await updateUserTokenUsage(resObj.usage.total_tokens, 0);

      // 3. Write to Firestore Cache (Storebase)
      if (codeContent) {
        await setCachedExplanation(currentUser?.uid, codeContent, explanation);
      }

      const detectedTopic = detectTopic({ content: codeContent, aiExample: explanation });
      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? { ...entry, aiExample: explanation, topic: detectedTopic, isGeneratingExample: false } : entry
      ));

      await updateNotebookEntry(currentUser.uid, day || '1', entryId, { aiExample: explanation, topic: detectedTopic });
    } catch (err) {
      alert("Failed to generate AI explanation: " + err.message);
      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? { ...entry, isGeneratingExample: false } : entry
      ));
      setActiveExplanationId(null); // Close modal on error
    }
  };

  const handleRegenerateWithFeedback = async (entryId, feedback) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, isGeneratingExample: true } : entry
    ));

    try {
      const entryToExplain = entries.find(e => e.id === entryId);
      if (!entryToExplain) return;

      const codeContent = (entryToExplain.content || '').trim();
      const previousExplanation = entryToExplain.aiExample || '';
      
      // Truncate previous explanation to avoid Groq's 6,000 TPM limit
      const maxPrevLength = 1000;
      const truncatedPrev = previousExplanation.length > maxPrevLength 
        ? previousExplanation.substring(0, maxPrevLength) + "\n... [truncated to prevent rate limits]"
        : previousExplanation;

      // Prepare AI correction prompt
      const prompt = `You previously analyzed this code but made an error:
\`\`\`python
${codeContent}
\`\`\`

Here is a preview of your previous explanation:
${truncatedPrev}

User feedback on what to correct: "${feedback}"

Please output a corrected step-by-step trace. Follow the exact same formatting rules:
- Format subheadings exactly as '### Step X (Line Y): [Title]' or '### Step X (Lines Y-Z): [Title]'.
- If any variables change, add a new line formatted exactly as: 'State: var1 = val1, var2 = val2'.
- For recursive functions, you MUST also output the exact call stack at the end of each step (on its own line, before or after the State line) formatted exactly as: 'Call Stack: func(args1) [status1] -> func(args2) [status2] -> ...' (e.g., 'Call Stack: GCD(24, 36) [Suspended] -> GCD(24, 12) [Active]'). The status should be one of: 'Active', 'Suspended', or 'Base Case' or 'Returning [value]'. If it is not recursive, you can omit the Call Stack line.
- Clean up any accidental code tags or ID metadata in python blocks (e.g. do NOT put id="..." inside code).`;

      // Call Groq
      const resObj = await processWithGroq(prompt, "explain_code");
      const correctedExplanation = resObj.text;

      // Update tokens
      await updateUserTokenUsage(resObj.usage.total_tokens, 0);

      // Overwrite Firestore Cache (Storebase) with the corrected explanation
      if (codeContent) {
        await setCachedExplanation(currentUser?.uid, codeContent, correctedExplanation);
      }

      // Update local state and Firestore entry
      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? { ...entry, aiExample: correctedExplanation, isGeneratingExample: false } : entry
      ));
      await updateNotebookEntry(currentUser.uid, day || '1', entryId, { aiExample: correctedExplanation });

    } catch (err) {
      alert("Failed to regenerate explanation: " + err.message);
      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? { ...entry, isGeneratingExample: false } : entry
      ));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f9fafb] font-sans">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link to="/notebook" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900">Day {day || 1} Module</span>
          </div>
        </div>
        
        {/* Token stats & auto-saved status */}
        <div className="flex items-center gap-3">
          {/* Caching Savings Badge */}
          {(userData?.tokensSaved || 0) > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-black rounded-lg shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
              <span>Storebase Saved: {(userData.tokensSaved).toLocaleString()} Tokens</span>
            </div>
          )}

          {/* Token Balance Tracker & Hub */}
          <div className="relative">
            <button 
              onClick={() => setIsTokenHubOpen(!isTokenHubOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg text-xs font-mono shadow-sm hover:bg-slate-850 active:scale-[0.98] transition-all cursor-pointer select-none"
              title="Click to view detailed AI token usage & savings stats"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <div className="flex flex-col text-left">
                <div className="flex justify-between gap-3 text-[9px] font-black uppercase text-slate-400">
                  <span>Groq Usage</span>
                  <span className={(userData?.tokensUsed || 0) >= 42500 ? "text-rose-400 animate-pulse font-bold" : (userData?.tokensUsed || 0) >= 30000 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                    {(userData?.tokensUsed || 0).toLocaleString()} / 50k
                  </span>
                </div>
                <div className="w-20 h-0.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      (userData?.tokensUsed || 0) >= 42500 ? "bg-rose-500" : (userData?.tokensUsed || 0) >= 30000 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, ((userData?.tokensUsed || 0) / 50000) * 100)}%` }}
                  />
                </div>
              </div>
            </button>

            {/* Dropdown Popover */}
            {isTokenHubOpen && (
              <>
                {/* Backdrop overlay to close when clicking outside */}
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsTokenHubOpen(false)}
                />
                
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-955/95 backdrop-blur-md border border-slate-800 text-slate-200 rounded-xl p-4 shadow-2xl z-40 flex flex-col space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Usage & Savings Hub
                    </span>
                    <button 
                      onClick={() => setIsTokenHubOpen(false)}
                      className="p-1 hover:bg-slate-850 rounded-md text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Budget Usage */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                      <span>Daily Groq Budget</span>
                      <span>{Math.round(((userData?.tokensUsed || 0) / 50000) * 100)}%</span>
                    </div>
                    <div className="text-lg font-mono font-bold text-slate-100 flex items-baseline gap-1">
                      <span>{(userData?.tokensUsed || 0).toLocaleString()}</span>
                      <span className="text-xs text-slate-500 font-normal">/ 50,000 tokens</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 border border-slate-850 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          (userData?.tokensUsed || 0) >= 42500 ? "bg-rose-500 animate-pulse" : (userData?.tokensUsed || 0) >= 30000 ? "bg-amber-500" : "bg-indigo-500"
                        }`}
                        style={{ width: `${Math.min(100, ((userData?.tokensUsed || 0) / 50000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3 text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Stored Savings
                    </div>
                    <div className="text-xl font-mono font-black text-emerald-300">
                      +{(userData?.tokensSaved || 0).toLocaleString()}
                      <span className="text-xs font-normal text-emerald-500 ml-1">tokens saved</span>
                    </div>
                    <p className="text-[10px] text-emerald-500/80 leading-normal font-medium">
                      Storebase saved these tokens by using local cache & cloud records instead of calling Groq!
                    </p>
                  </div>

                  <p className="text-[9.5px] text-slate-500 leading-normal text-left font-medium">
                    Caching stores AI trace steps. Any identical code blocks run instantly with zero token consumption.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-4 h-4" /> Auto-Saved
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-10 md:px-16 md:py-14 custom-scrollbar bg-white relative">
        <div className="max-w-7xl mx-auto pb-32">
          
          {/* Document Title Header */}
          <div className="mb-10 text-left">
            <div className="inline-block px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black tracking-widest uppercase rounded-lg mb-5">
              Module Overview
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-8">
              Daily Action Plan
            </h1>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-gray-100/80 p-1.5 rounded-2xl w-max border border-gray-200 shadow-inner">
              <button 
                onClick={() => setActiveTab('notebook')} 
                className={`px-5 py-2.5 rounded-xl text-[14px] font-bold flex items-center gap-2.5 transition-all ${activeTab === 'notebook' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}`}
              >
                <FileText className="w-4 h-4" /> Multi-Data Notebook
              </button>
              <button 
                onClick={() => setActiveTab('timetable')} 
                className={`px-5 py-2.5 rounded-xl text-[14px] font-bold flex items-center gap-2.5 transition-all ${activeTab === 'timetable' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}`}
              >
                <Calendar className="w-4 h-4" /> Timetable
              </button>
              <button 
                onClick={() => setActiveTab('code')} 
                className={`px-5 py-2.5 rounded-xl text-[14px] font-bold flex items-center gap-2.5 transition-all ${activeTab === 'code' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}`}
              >
                <Terminal className="w-4 h-4" /> Code Lab (Colab-like)
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            
            {/* TIMETABLE TAB */}
            {activeTab === 'timetable' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 flex items-center gap-4">
                    <Calendar className="w-8 h-8 text-indigo-600" />
                    Daily Timetable & Objectives
                  </h2>
                  <div className="prose prose-indigo prose-lg max-w-none text-gray-700">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl text-gray-900 mt-0">Today's Schedule</h3>
                        <button onClick={handleAddTimetableTask} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"><Plus className="w-4 h-4"/> Add Task</button>
                      </div>
                      
                      {timetableTasks.map((task) => (
                        <div key={task.id} className="flex gap-4 md:gap-6 p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-indigo-200 transition-all group relative">
                          <button onClick={() => handleDeleteTimetableTask(task.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                          
                          <div className="w-24 shrink-0">
                            <input 
                              type="text" 
                              value={task.time} 
                              onChange={(e) => handleUpdateTimetableTask(task.id, 'time', e.target.value)}
                              placeholder="Time (opt)" 
                              className="w-full font-black text-indigo-600 text-lg bg-transparent outline-none placeholder:text-indigo-200 placeholder:font-medium"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <input 
                              type="text" 
                              value={task.title} 
                              onChange={(e) => handleUpdateTimetableTask(task.id, 'title', e.target.value)}
                              placeholder="Task Title"
                              className="w-full font-bold text-gray-900 text-xl mb-2 bg-transparent outline-none placeholder:text-gray-300"
                            />
                            <textarea 
                              value={task.desc}
                              onChange={(e) => handleUpdateTimetableTask(task.id, 'desc', e.target.value)}
                              placeholder="Task Description"
                              className="w-full text-gray-500 leading-relaxed bg-transparent outline-none resize-none custom-scrollbar min-h-[40px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CODE LAB TAB */}
            {activeTab === 'code' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pt-6">
                
                {/* Header Controls (Language Selection) */}
                <div className="flex justify-between items-center mb-6 pl-12 pr-4">
                  <h2 className="text-xl font-bold text-gray-800">18-5-26</h2>
                  <div className="flex items-center gap-4">
                    <select 
                      value={codeLabLanguage}
                      onChange={(e) => {
                        setCodeLabLanguage(e.target.value);
                        if(e.target.value === 'c') setCodeCells([{ id: ++globalCellId, type: 'code', content: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}', output: '', aiResult: '', isRunning: false, isCorrecting: false }]);
                        else setCodeCells([{ id: ++globalCellId, type: 'code', content: 'print("Hello from Python!")', output: '', aiResult: '', isRunning: false, isCorrecting: false }]);
                      }}
                      className="bg-transparent text-gray-500 text-sm outline-none font-bold cursor-pointer hover:text-gray-800 transition-colors"
                    >
                      <option value="python">Python 3</option>
                      <option value="c">C</option>
                    </select>
                    <button 
                      onClick={handleSubmitCodeToNotebook}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <Check className="w-4 h-4" /> Save Workspace
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {codeCells.map((cell, index) => (
                    <div key={cell.id} className="group relative flex flex-col items-center">
                      {cell.type === 'text' ? (
                        <div className="w-full flex items-start gap-2 relative mt-4 mb-2 group/text">
                          <div className="w-10 shrink-0 h-[42px]"></div>
                          <div className="flex-1 bg-white border border-transparent hover:border-gray-300 rounded-lg relative transition-all shadow-sm group-hover/text:shadow-md" onDoubleClick={() => updateCell(cell.id, { isEditing: true })}>
                            <div className="absolute top-2 right-2 opacity-0 group-hover/text:opacity-100 transition-opacity bg-white border border-gray-200 rounded-md shadow-sm flex items-center z-10 text-gray-500">
                               <button onClick={() => updateCell(cell.id, { isEditing: !cell.isEditing })} className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-r border-gray-200" title="Edit text"><Edit2 className="w-4 h-4" /></button>
                               {codeCells.length > 1 && <button onClick={() => handleDeleteCodeCell(cell.id)} className="p-1.5 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete text cell"><Trash2 className="w-4 h-4" /></button>}
                            </div>
                            {cell.isEditing ? (
                               <textarea 
                                 autoFocus
                                 value={cell.content}
                                 onChange={(e) => updateCell(cell.id, { content: e.target.value })}
                                 onBlur={() => updateCell(cell.id, { isEditing: false })}
                                 placeholder="Double-click to edit or write markdown here..."
                                 className="w-full p-4 min-h-[100px] outline-none border-2 border-indigo-300 rounded-lg resize-y font-sans text-gray-800"
                               />
                            ) : (
                               <div className="w-full px-5 py-4 min-h-[50px] prose prose-sm max-w-none cursor-text text-gray-800 bg-gray-50/50 rounded-lg">
                                  {cell.content ? <ReactMarkdown>{cell.content}</ReactMarkdown> : <span className="text-gray-400 italic">Double-click to edit text...</span>}
                               </div>
                            )}
                          </div>
                        </div>
                      ) : (
                      <>
                      <div className="w-full flex items-start gap-2 relative">
                        {/* Left Gutter: [ ] and Play Button */}
                        <div className="w-10 pt-3 flex flex-col items-center justify-start text-gray-500 font-mono text-xs shrink-0 h-[42px]">
                          <div className="hidden group-hover:flex items-center justify-center w-full h-full">
                             <button onClick={() => runCode(cell.id, cell.content)} disabled={cell.isRunning} title="Run cell (Shift+Enter)">
                                {cell.isRunning ? <Loader2 className="w-6 h-6 animate-spin text-gray-700" /> : <PlayCircle className="w-6 h-6 text-gray-800 hover:text-black transition-colors" />}
                             </button>
                          </div>
                          <div className="flex group-hover:hidden items-center justify-center w-full h-full">
                             [ ]
                          </div>
                        </div>

                        {/* Cell Body */}
                        <div className="flex-1 bg-white border border-gray-300 rounded-lg relative focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 shadow-sm transition-all">
                          {/* Floating Toolbar */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-md shadow-sm flex items-center z-10 text-gray-500">
                             <button onClick={() => handleAskAI(cell.id, cell.content)} className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-l border-gray-200" title="Ask AI to Explain/Correct">
                                {cell.isCorrecting ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600"/> : <Brain className="w-4 h-4" />}
                             </button>
                             {codeCells.length > 1 && (
                               <button onClick={() => handleDeleteCodeCell(cell.id)} className="p-1.5 hover:bg-red-50 hover:text-red-500 transition-colors border-l border-gray-200"><Trash2 className="w-4 h-4" /></button>
                             )}
                          </div>

                          <div className="flex w-full py-2">
                            <div id={`monaco-container-${cell.id}`} className="w-full min-h-[40px]">
                              <Editor
                                path={`cell-${cell.id}`}
                                height="100%"
                                defaultLanguage={codeLabLanguage}
                                language={codeLabLanguage}
                                value={cell.content}
                                onChange={(value) => {
                                  updateCell(cell.id, { content: value });
                                  debouncedLint(cell.id, value);
                                }}
                                onMount={(editor, monaco) => {
                                  editorRefs.current[cell.id] = editor;
                                  monacoRef.current[cell.id] = monaco;
                                  
                                  const updateHeight = () => {
                                    const contentHeight = Math.min(1000, Math.max(40, editor.getContentHeight()));
                                    const container = document.getElementById(`monaco-container-${cell.id}`);
                                    if (container) {
                                      container.style.height = `${contentHeight}px`;
                                      editor.layout();
                                    }
                                  };
                                  
                                  editor.onDidContentSizeChange(updateHeight);
                                  updateHeight();
                                  
                                  editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                                    runCode(cell.id, editor.getValue());
                                  });
                                }}
                                options={{
                                  minimap: { enabled: false },
                                  scrollBeyondLastLine: false,
                                  wordWrap: 'on',
                                  lineNumbers: 'off',
                                  folding: false,
                                  overviewRulerLanes: 0,
                                  scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                                  hideCursorInOverviewRuler: true,
                                  renderLineHighlight: 'none',
                                  contextmenu: false,
                                  fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                                  fontSize: 14,
                                  padding: { top: 8, bottom: 8 },
                                  automaticLayout: true,
                                  fixedOverflowWidgets: true
                                }}
                              />
                            </div>
                          </div>

                          {/* Standard Input - Colab-style Dynamic Prompts */}
                          {cell.awaitingInput && (
                            <div className="w-full border-t border-gray-200 bg-gray-50 flex flex-col rounded-b-lg overflow-hidden p-4 gap-3">
                              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                                <Terminal className="w-3.5 h-3.5 text-indigo-500" /> Dynamic Standard Input (stdin)
                              </div>
                              <div className="flex flex-col gap-2.5">
                                {cell.inputPrompts?.map((prompt, promptIdx) => (
                                  <div key={promptIdx} className="flex items-center gap-3 font-mono text-[13.5px] bg-white border border-gray-200 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-all shadow-sm">
                                    <span className="text-gray-600 font-semibold select-none">{prompt}</span>
                                    <input
                                      type="text"
                                      value={cell.inputValues?.[promptIdx] || ''}
                                      autoFocus={promptIdx === (cell.currentPromptIndex || 0)}
                                      disabled={promptIdx !== (cell.currentPromptIndex || 0)}
                                      placeholder={promptIdx === (cell.currentPromptIndex || 0) ? "Type value and press Enter..." : ""}
                                      onChange={(e) => {
                                        const newVals = [...(cell.inputValues || [])];
                                        newVals[promptIdx] = e.target.value;
                                        updateCell(cell.id, { inputValues: newVals });
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const currentIdx = cell.currentPromptIndex || 0;
                                          if (currentIdx < cell.inputPrompts.length - 1) {
                                            updateCell(cell.id, { currentPromptIndex: currentIdx + 1 });
                                          } else {
                                            submitCodeInput(cell.id, cell.content, cell.inputValues || []);
                                          }
                                        }
                                      }}
                                      className="flex-1 bg-transparent border-none outline-none text-gray-900 font-bold"
                                    />
                                    {promptIdx === (cell.currentPromptIndex || 0) && (
                                      <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 shadow-sm animate-pulse">↵ Enter</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Output Area */}
                      {cell.output && (
                         <div className="w-full flex items-start gap-2 mt-1">
                            <div className="w-10 shrink-0 flex justify-end pr-2 pt-2 text-emerald-500">
                               {cell.isRunning ? '' : <Check className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 p-2 font-mono text-[13px] overflow-x-auto text-gray-800">
                               <pre className={cell.output.includes('Error') ? 'text-red-600' : 'text-gray-800'}>{cell.output}</pre>
                            </div>
                         </div>
                      )}

                      {/* AI Explanation Area */}
                      {cell.aiResult && (
                         <div className="w-full flex items-start gap-2 mt-2">
                            <div className="w-10 shrink-0"></div>
                            <div className="flex-1 bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg relative shadow-sm">
                               <button onClick={() => updateCell(cell.id, { aiResult: '' })} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"><X className="w-4 h-4"/></button>
                               <h4 className="text-xs font-bold text-indigo-800 mb-1 uppercase tracking-wider flex items-center gap-2"><Brain className="w-4 h-4"/> AI Assistant</h4>
                               <div className="text-[13px] leading-snug text-gray-700 whitespace-pre-wrap [&>p]:mb-2 [&>h1]:mb-2 [&>h1]:text-sm [&>h2]:mb-2 [&>h2]:text-sm [&>h3]:mb-2 [&>h3]:text-sm [&>ul]:mb-2 [&>ul]:pl-4 [&>ul]:list-disc [&>ol]:mb-2 [&>ol]:pl-4 [&>ol]:list-decimal [&>pre]:mb-2">
                                 <ReactMarkdown>{cell.aiResult}</ReactMarkdown>
                               </div>
                            </div>
                         </div>
                      )}
                      </>
                      )}
                      {/* Add Code / Text Cell Buttons (visible on hover) */}
                      <div className="w-full pl-12 flex justify-start mt-2 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        <button 
                          onClick={() => handleAddCodeCell(index)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Code className="w-4 h-4" /> Code
                        </button>
                        <button 
                          onClick={() => handleAddTextCell(index)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <FileText className="w-4 h-4" /> Text
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
              </div>
            )}

            {/* NOTEBOOK TAB */}
            {activeTab === 'notebook' && (
              <div className="space-y-12 animate-in fade-in">
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                  </div>
                ) : entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-3xl shadow-sm">
                    <motion.div
                      animate={{ y: [0, -15, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="relative w-32 h-32 mb-8"
                    >
                      {/* Character Body */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                        <motion.div
                           animate={{ rotate: [0, 5, -5, 0] }}
                           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                           <Brain className="w-16 h-16 text-white opacity-20" />
                        </motion.div>
                        
                        {/* Eyes */}
                        <div className="absolute top-10 flex gap-6 z-10">
                          <motion.div 
                             animate={{ scaleY: [1, 0.1, 1] }} 
                             transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1] }} 
                             className="w-4 h-6 bg-white rounded-full shadow-inner" 
                          />
                          <motion.div 
                             animate={{ scaleY: [1, 0.1, 1] }} 
                             transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1] }} 
                             className="w-4 h-6 bg-white rounded-full shadow-inner" 
                          />
                        </div>
                        
                        {/* Smile */}
                        <motion.div 
                           className="absolute bottom-6 w-10 h-3 border-b-4 border-white rounded-full"
                        />
                      </div>
                      
                      {/* Floating Elements */}
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                        className="absolute -top-4 -right-4 w-8 h-8 bg-pink-400 rounded-full blur-md opacity-60"
                      />
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                        className="absolute -bottom-2 -left-4 w-10 h-10 bg-indigo-400 rounded-full blur-md opacity-60"
                      />
                    </motion.div>
                    
                    <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">I'm waiting for your notes!</h3>
                    <p className="text-gray-500 max-w-md mx-auto text-center font-medium leading-relaxed">
                      I'm ready to process your raw data. Paste text, write code, or upload files and I'll organize everything for you.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedTopicFilter && (
                      <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-150 rounded-2xl p-4 mb-4 text-xs font-bold text-indigo-900 select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                          <span>Filtering by Topic: </span>
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 font-black uppercase">
                            #{selectedTopicFilter}
                          </span>
                        </div>
                        <button 
                          onClick={() => setSelectedTopicFilter(null)}
                          className="px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-650 hover:bg-indigo-100 bg-white shadow-xs transition-all cursor-pointer font-black"
                        >
                          Clear Filter
                        </button>
                      </div>
                    )}
                    
                    {(() => {
                      const filteredEntries = entries
                        .map((entry, index) => ({ entry, index }))
                        .filter(({ entry }) => {
                          if (!selectedTopicFilter) return true;
                          const topic = detectTopic(entry);
                          return topic.toLowerCase() === selectedTopicFilter.toLowerCase();
                        });

                      if (filteredEntries.length === 0) {
                        return (
                          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-10 text-center select-none shadow-sm">
                            <p className="text-gray-500 text-sm font-semibold">No cells found for topic <strong>#{selectedTopicFilter}</strong>.</p>
                            <button 
                              onClick={() => setSelectedTopicFilter(null)}
                              className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-650 text-white hover:bg-indigo-750 transition-colors cursor-pointer"
                            >
                              Show All Cells
                            </button>
                          </div>
                        );
                      }

                      return filteredEntries.map(({ entry, index }, filteredIdx) => {
                        const prevObj = filteredEntries[filteredIdx - 1];
                        const prevEntry = prevObj ? prevObj.entry : null;
                        const currentSource = entry.source || 'AI Assistant';
                        const prevSource = prevEntry ? (prevEntry.source || 'AI Assistant') : null;
                        const isSameGroup = prevEntry && prevEntry.timestamp === entry.timestamp && prevSource === currentSource;

                        return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={entry.id} 
                        className={`flex gap-4 md:gap-6 w-full ${isSameGroup ? 'mt-2' : 'mt-8'}`}
                      >
                        <div className="w-10 shrink-0 flex justify-center">
                           {!isSameGroup && (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                                <Brain className="w-5 h-5" />
                              </div>
                           )}
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-2 relative group/entry">
                          <div className={`flex items-center justify-between ${isSameGroup ? 'pt-0 h-0' : 'pt-1.5 mb-2'}`}>
                            {!isSameGroup && (
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-900">{currentSource}</span>
                                <span className="text-xs text-gray-400 font-medium">{entry.timestamp || (entry.createdAt?.toDate ? new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(entry.createdAt.toDate()) : 'Just now')}</span>
                              </div>
                            )}
                            <div className="opacity-0 group-hover/entry:opacity-100 transition-opacity flex gap-2 ml-auto z-10 relative">
                              <button onClick={() => handleEditStart(entry)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(entry.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>

                          {editingId === entry.id ? (
                          <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 shadow-sm mt-3">
                            <textarea 
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full text-gray-800 text-[15px] font-mono leading-relaxed outline-none min-h-[150px] resize-y custom-scrollbar"
                            />
                            <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
                              <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 flex items-center gap-2"><X className="w-4 h-4" /> Cancel</button>
                              <button onClick={() => handleEditSave(entry.id)} className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2">
                            {entry.type === 'text' && (() => {
                              const cellTopic = detectTopic(entry);
                              return (
                                <div className="space-y-2 select-text">
                                  <div className="flex flex-wrap items-center gap-2 text-xs select-none">
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200/50 shadow-xs">
                                      #{index + 1}
                                    </span>
                                    <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">
                                      Markdown Note
                                    </span>
                                    {cellTopic && (
                                      <button 
                                        onClick={() => setSelectedTopicFilter(cellTopic)}
                                        className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100/60 text-indigo-700 text-[10px] font-black uppercase hover:bg-indigo-100 transition-colors cursor-pointer"
                                        title={`Filter cells by #${cellTopic}`}
                                      >
                                        #{cellTopic}
                                      </button>
                                    )}
                                  </div>
                                  <div className="prose prose-indigo prose-sm sm:prose-base max-w-4xl prose-pre:overflow-x-auto prose-pre:max-w-full text-gray-800 leading-relaxed font-medium">
                                    <ReactMarkdown>{entry.content}</ReactMarkdown>
                                  </div>
                                </div>
                              );
                            })()}

                            {entry.type === 'code' && (() => {
                              const cellTopic = detectTopic(entry);
                              return (
                                <div className="space-y-4 mt-2">
                                  <div className="bg-white border border-gray-200 rounded-xl relative group/notebook-cell shadow-sm focus-within:border-gray-300 focus-within:shadow-md transition-all">
                                    
                                    {/* Top Bar with Language and Run Button */}
                                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                                      <div className="flex items-center gap-2 select-none">
                                        <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                          #{index + 1}
                                        </span>
                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{entry.language || 'Code'}</span>
                                        {cellTopic && (
                                          <button 
                                            onClick={() => setSelectedTopicFilter(cellTopic)}
                                            className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9.5px] font-black uppercase hover:bg-indigo-100 transition-colors cursor-pointer"
                                            title={`Filter cells by #${cellTopic}`}
                                          >
                                            #{cellTopic}
                                          </button>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        {(() => {
                                          const localCacheData = getLocalCachedExplanation(currentUser?.uid, entry.content);
                                          const isCached = !!entry.aiExample || !!localCacheData;
                                          return (
                                            <button 
                                              onClick={() => handleGenerateExample(entry.id)}
                                              className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded transition-colors shadow-sm ${
                                                isCached
                                                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250'
                                                  : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-transparent'
                                              }`}
                                              title={isCached ? "Cached in Storebase (0 tokens, instant replay)" : "Explain this code step-by-step (uses Groq tokens)"}
                                            >
                                              {isCached ? (
                                                <>
                                                  <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" /> ⚡ Fast Replay
                                                </>
                                              ) : (
                                                <>
                                                  <Brain className="w-3 h-3" /> Explain
                                                </>
                                              )}
                                            </button>
                                          );
                                        })()}
                                        <button 
                                          onClick={() => runNotebookEntry(entry.id, entry.content, entry.language || 'python')}
                                          disabled={entry.isRunning}
                                          className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors animate-pulse"
                                        >
                                          {entry.isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlayCircle className="w-3 h-3" />} Run
                                        </button>
                                      </div>
                                    </div>

                                    {/* Editor */}
                                    <div className="w-full py-2">
                                      <div id={`notebook-monaco-container-${entry.id}`} className="w-full min-h-[40px]">
                                        <Editor
                                          path={`notebook-cell-${entry.id}`}
                                          height="100%"
                                          language={entry.language?.toLowerCase() === 'c' ? 'c' : 'python'}
                                          value={entry.content}
                                          onChange={(val) => {
                                             setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, content: val, aiExample: null } : e));
                                             updateNotebookEntry(currentUser.uid, day || '1', entry.id, { content: val, aiExample: null }).catch(console.error);
                                          }}
                                          onMount={(editor, monaco) => {
                                            const updateHeight = () => {
                                              const contentHeight = Math.min(600, Math.max(40, editor.getContentHeight()));
                                              const container = document.getElementById(`notebook-monaco-container-${entry.id}`);
                                              if (container) {
                                                container.style.height = `${contentHeight}px`;
                                                editor.layout();
                                              }
                                            };
                                            editor.onDidContentSizeChange(updateHeight);
                                            updateHeight();
                                            
                                            editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                                              runNotebookEntry(entry.id, editor.getValue(), entry.language || 'python');
                                            });
                                          }}
                                          options={{
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            fontSize: 14,
                                            lineHeight: 1.6,
                                            padding: { top: 8, bottom: 8 },
                                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                            renderLineHighlight: "none",
                                            hideCursorInOverviewRuler: true,
                                            overviewRulerBorder: false,
                                            scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                                            wordWrap: 'on',
                                            automaticLayout: true,
                                            fixedOverflowWidgets: true
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Standard Input for Notebook Entries - Colab-style Dynamic Prompts */}
                                  {entry.awaitingInput && (
                                    <div className="w-full border border-gray-200 bg-gray-50 flex flex-col rounded-xl overflow-hidden p-4 gap-3 mt-2 shadow-inner">
                                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                                        <Terminal className="w-3.5 h-3.5 text-indigo-500" /> Dynamic Standard Input (stdin)
                                      </div>
                                      <div className="flex flex-col gap-2.5">
                                        {entry.inputPrompts?.map((prompt, promptIdx) => (
                                          <div key={promptIdx} className="flex items-center gap-3 font-mono text-[13.5px] bg-white border border-gray-200 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-all shadow-sm">
                                            <span className="text-gray-600 font-semibold select-none">{prompt}</span>
                                            <input
                                              type="text"
                                              value={entry.inputValues?.[promptIdx] || ''}
                                              autoFocus={promptIdx === (entry.currentPromptIndex || 0)}
                                              disabled={promptIdx !== (entry.currentPromptIndex || 0)}
                                              placeholder={promptIdx === (entry.currentPromptIndex || 0) ? "Type value and press Enter..." : ""}
                                              onChange={(e) => {
                                                const newVals = [...(entry.inputValues || [])];
                                                newVals[promptIdx] = e.target.value;
                                                setEntries(prev => prev.map(ent => ent.id === entry.id ? { ...ent, inputValues: newVals } : ent));
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  e.preventDefault();
                                                  const currentIdx = entry.currentPromptIndex || 0;
                                                  if (currentIdx < entry.inputPrompts.length - 1) {
                                                    setEntries(prev => prev.map(ent => ent.id === entry.id ? { ...ent, currentPromptIndex: currentIdx + 1 } : ent));
                                                  } else {
                                                    submitNotebookEntryInput(entry.id, entry.content, entry.language || 'python', entry.inputValues || []);
                                                  }
                                                }
                                              }}
                                              className="flex-1 bg-transparent border-none outline-none text-gray-900 font-bold"
                                            />
                                            {promptIdx === (entry.currentPromptIndex || 0) && (
                                              <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 shadow-sm animate-pulse">↵ Enter</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Output Box */}
                                  {entry.output && (
                                    <div className={`rounded-xl p-4 overflow-x-auto text-[13px] font-mono shadow-sm flex-1 max-h-[300px] custom-scrollbar border ${
                                      entry.output.toLowerCase().includes('error') || entry.output.toLowerCase().includes('traceback') 
                                        ? 'bg-red-50 text-red-700 border-red-200' 
                                        : 'bg-white text-gray-700 border-gray-200'
                                    }`}>
                                      <pre className="custom-scrollbar whitespace-pre-wrap"><code className="block">{entry.output}</code></pre>
                                    </div>
                                  )}

                                  {activeExplanationId === entry.id && (
                                    <div 
                                      onClick={() => setActiveExplanationId(null)}
                                      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm select-none animate-fade-in"
                                    >
                                      <div 
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full max-w-6xl bg-white rounded-[24px] shadow-2xl overflow-hidden border border-gray-200/50 flex flex-col"
                                      >
                                        <InteractiveAiExplanation 
                                          aiExample={entry.aiExample} 
                                          codeContent={entry.content}
                                          isGenerating={entry.isGeneratingExample}
                                          accentColor={userData?.accentColor || '#6366f1'} 
                                          onFeedback={(feedback) => handleRegenerateWithFeedback(entry.id, feedback)}
                                          onClose={() => {
                                            setActiveExplanationId(null);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {entry.isGeneratingExample && (
                                     <div className="flex items-center gap-3 text-indigo-600 font-bold text-sm py-2">
                                       <Loader2 className="w-4 h-4 animate-spin" /> AI is analyzing the code...
                                     </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </div>
          )}

                {/* Analyzing State indicator (Skeleton Loader) */}
                {isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 md:gap-6 w-full opacity-70"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-gray-200 animate-pulse flex items-center justify-center text-gray-400">
                      <Brain className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 space-y-4 py-1">
                      <div className="flex items-center gap-3">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded w-16 animate-pulse"></div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mt-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                          <span className="text-sm font-bold text-gray-500">{analysisStatus}</span>
                        </div>
                        <div className="h-24 bg-gray-200/50 rounded-xl w-full animate-pulse"></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={bottomRef} className="h-20" />
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Floating Input Area - Only show on Notebook Tab */}
      <AnimatePresence>
        {activeTab === 'notebook' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 md:left-64 pointer-events-none p-4 md:p-8 z-30 flex justify-center pb-10 md:pb-8"
          >
            <div className="w-full max-w-4xl pointer-events-auto">
              <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-200/80 flex flex-col focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all overflow-hidden">
                
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (inputText.trim() && !isAnalyzing) handleAddData('text');
                    }
                  }}
                  onPaste={handlePaste}
                  placeholder="Ask a question, paste code, or drop an image here... (Ctrl+V to paste)"
                  className="w-full bg-transparent px-6 pt-5 pb-3 outline-none resize-none text-gray-800 text-[15px] font-medium min-h-[60px] max-h-[250px] custom-scrollbar placeholder:text-gray-400"
                  rows="1"
                />
                
                <div className="flex justify-between items-center px-4 pb-3 pt-1">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handleColabClick}
                      className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-[#F9AB00] transition-colors"
                      title="Import Google Colab"
                    >
                      <FileCode2 className="w-5 h-5" />
                    </button>
                    
                    <input type="file" accept=".pdf" ref={pdfInputRef} onChange={handlePdfUpload} className="hidden" />
                    <button 
                      onClick={() => pdfInputRef.current?.click()}
                      className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-rose-500 transition-colors"
                      title="Upload PDF"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-blue-500 transition-colors"
                      title="Upload Image"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleAddData('text')}
                    disabled={!inputText.trim() || isAnalyzing}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-300 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} 
                  </button>
                </div>
                
              </div>
              <div className="text-center mt-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest opacity-80 hidden md:block">
                AI can make mistakes. Check important info.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#ffebee', color: '#c62828', height: '100vh', overflow: 'auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>App Crashed!</h2>
          <p>Please send a screenshot of this error to the AI:</p>
          <pre style={{ background: 'white', padding: '20px', marginTop: '20px', borderRadius: '8px', overflow: 'auto' }}>
            {this.state.error && this.state.error.toString()}
            {"\n"}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const NotebookTimelineWithBoundary = (props) => (
  <ErrorBoundary>
    <NotebookTimeline {...props} />
  </ErrorBoundary>
);

export default NotebookTimelineWithBoundary;
