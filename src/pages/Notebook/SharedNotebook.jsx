import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getNotebookEntries, getCompletedNotebookDays, detectTopic } from '../../services/notebookService';
import { Brain, ArrowLeft, RotateCw, Calendar, FileText, Code, User, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Shimmering Skeletons to prevent layout shifts
const SkeletonProfile = () => (
  <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4 animate-pulse">
    <div className="flex items-center gap-3.5">
      <div className="w-12 h-12 rounded-2xl bg-gray-200"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="h-px bg-gray-100" />
    <div className="grid grid-cols-2 gap-3">
      <div className="h-10 bg-gray-100 rounded-xl"></div>
      <div className="h-10 bg-gray-100 rounded-xl"></div>
    </div>
  </div>
);

const SkeletonDays = () => (
  <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 animate-pulse whitespace-nowrap -mx-2 px-2 md:mx-0 md:px-0">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-10 bg-gray-200 rounded-xl w-24 md:w-full shrink-0"></div>
    ))}
  </div>
);

const SkeletonEntryCard = () => (
  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-150 rounded w-12"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3.5 bg-gray-200 rounded w-5/6"></div>
      <div className="h-3.5 bg-gray-200 rounded w-2/3"></div>
    </div>
    <div className="h-24 bg-gray-100 rounded-xl"></div>
  </div>
);

const SharedNotebook = () => {
  const { userId } = useParams();
  const [sharedUser, setSharedUser] = useState(null);
  const [completedDays, setCompletedDays] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [allDaysList, setAllDaysList] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [entries, setEntries] = useState([]);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSharedUserData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const uData = userDoc.data();
        setSharedUser(uData);
        
        const startDateStr = uData.startDate || uData.createdAt || new Date().toISOString().split('T')[0];
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
        const calculatedCurrentDay = (today < start) ? 1 : tempCount;
        setCurrentDay(calculatedCurrentDay);
        
        const maxDayToCheck = Math.min(100, Math.max(15, calculatedCurrentDay + 5));
        const days = Array.from({ length: maxDayToCheck }, (_, i) => i + 1);
        
        const completed = await getCompletedNotebookDays(userId, days);
        setCompletedDays(completed);

        // Build list of all days from Day 1 to currentDay + skipped/completed future days
        const uniqueDaysSet = new Set([
          ...Array.from({ length: calculatedCurrentDay }, (_, i) => i + 1),
          ...completed
        ]);
        const daysToDisplay = Array.from(uniqueDaysSet).sort((a, b) => a - b);
        setAllDaysList(daysToDisplay);
        
        if (daysToDisplay.length > 0 && !selectedDay) {
          setSelectedDay(daysToDisplay[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching shared user data:", error);
    } finally {
      if (showRefreshIndicator) setIsRefreshing(false);
      else setLoading(false);
    }
  };

  const fetchDayEntries = async () => {
    if (!selectedDay) return;
    setLoadingEntries(true);
    try {
      const data = await getNotebookEntries(userId, selectedDay);
      data.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
      setEntries(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchSharedUserData();
  }, [userId]);

  useEffect(() => {
    fetchDayEntries();
  }, [userId, selectedDay]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSharedUserData(true);
    await fetchDayEntries();
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] font-sans pb-20">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center"></div>
              <span className="h-5 bg-gray-200 rounded w-32"></span>
            </div>
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 items-start">
            <div className="col-span-1 space-y-6">
              <SkeletonProfile />
              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <SkeletonDays />
              </div>
            </div>
            <div className="col-span-1 md:col-span-3 space-y-6">
              <div className="h-7 bg-gray-200 rounded w-1/3 mb-6"></div>
              <SkeletonEntryCard />
              <SkeletonEntryCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sharedUser) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-[#f9fafb] p-6 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Notebook Not Found</h2>
        <p className="text-gray-500 max-w-md mb-6">This notebook shared link might be invalid, or the user profile does not exist.</p>
        <Link to="/" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900 text-sm md:text-base hidden sm:inline">LearnLoop Shared Notebook</span>
            <span className="font-bold text-gray-900 text-sm sm:hidden">Shared Notebook</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 shadow-sm select-none">
            @{sharedUser.username}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 items-start">
          
          {/* Left Column: User Profile + Completed Days List */}
          <div className="col-span-1 space-y-6 flex flex-col">
            
            {/* User Profile Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-purple-500/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-black shadow-md shrink-0">
                  {sharedUser.fullName ? sharedUser.fullName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 leading-tight">{sharedUser.fullName || "Active Learner"}</h2>
                  <span className="text-xs text-gray-400 font-medium">@{sharedUser.username}</span>
                </div>
              </div>
              
              <div className="h-px bg-gray-100" />
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-2.5">
                  <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Completed</div>
                  <div className="text-lg font-black text-indigo-900">{completedDays.length} Days</div>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-2.5">
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-0.5">Streak</div>
                  <div className="text-lg font-black text-emerald-900">{completedDays.length > 0 ? completedDays.length * 3 : 0} days</div>
                </div>
              </div>
            </div>

            {/* Completed Days Sidebar / Navigation */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex-1">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm select-none">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Completed Modules</span>
              </h3>
              
              {allDaysList.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-xs italic font-medium">No modules available.</p>
                </div>
              ) : (
                /* Mobile: Horizontal scrolling view; Desktop: Vertical stacked view */
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 custom-scrollbar whitespace-nowrap md:whitespace-normal -mx-2 px-2 md:mx-0 md:px-0">
                  {allDaysList.map((dayNum) => {
                    const isCompleted = completedDays.includes(dayNum);
                    const isToday = dayNum === currentDay;
                    const isSelected = selectedDay === dayNum;
                    
                    let statusLabel = "No Data";
                    let dotColorClass = "bg-red-400";
                    let bgClass = "bg-red-50/20 border-red-100 hover:bg-red-50/40";
                    let textClass = "text-red-700";
                    
                    if (isCompleted) {
                      statusLabel = "Note Written";
                      dotColorClass = "bg-emerald-500";
                      bgClass = "bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50/40";
                      if (isSelected) bgClass = "bg-indigo-600 text-white shadow-indigo-200 border-transparent shadow-md";
                      textClass = isSelected ? "text-white" : "text-emerald-700 font-bold";
                    } else if (isToday) {
                      statusLabel = "Today";
                      dotColorClass = "bg-indigo-500 animate-pulse";
                      bgClass = "bg-indigo-50/30 border-indigo-150 hover:bg-indigo-50";
                      if (isSelected) bgClass = "bg-indigo-600 text-white shadow-indigo-200 border-transparent shadow-md";
                      textClass = isSelected ? "text-white" : "text-indigo-700 font-bold";
                    } else {
                      if (isSelected) bgClass = "bg-indigo-600 text-white shadow-indigo-200 border-transparent shadow-md";
                      textClass = isSelected ? "text-white font-bold" : "text-gray-600";
                    }

                    return (
                      <button
                        key={dayNum}
                        onClick={() => setSelectedDay(dayNum)}
                        className={`px-4 py-2 rounded-xl text-[14px] font-bold text-left transition-all shrink-0 select-none flex flex-col justify-center border ${
                          isSelected 
                            ? 'bg-indigo-600 text-white shadow-md border-transparent shadow-indigo-200' 
                            : `${bgClass} border-gray-100 md:border-gray-200`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-white' : dotColorClass}`} />
                          <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-gray-900'}`}>Day {dayNum}</span>
                        </div>
                        <span className={`text-[10px] ml-4 font-bold select-none uppercase tracking-wider ${isSelected ? 'text-indigo-100' : textClass}`}>
                          {statusLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: List of Entries */}
          <div className="col-span-1 md:col-span-3">
            {loadingEntries ? (
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
                <SkeletonEntryCard />
                <SkeletonEntryCard />
              </div>
            ) : selectedDay ? (
              <div className="space-y-6">
                
                {/* Title */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-2">
                  <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    <span>Day {selectedDay} Module Content</span>
                  </h1>
                  <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-wider select-none">
                    Read Only
                  </span>
                </div>

                {entries.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold text-gray-900 mb-1">No data available</h3>
                    <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
                      There are no notes or code entries recorded for Day {selectedDay} yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedTopicFilter && (
                      <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 mb-4 text-xs font-bold text-indigo-900 select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                          <span>Filtering by Topic: </span>
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 font-black uppercase">
                            #{selectedTopicFilter}
                          </span>
                        </div>
                        <button 
                          onClick={() => setSelectedTopicFilter(null)}
                          className="px-3 py-1.5 rounded-xl border border-indigo-250 text-indigo-650 hover:bg-indigo-100 bg-white shadow-xs transition-all cursor-pointer font-black"
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
                              className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                            >
                              Show All Cells
                            </button>
                          </div>
                        );
                      }

                      return filteredEntries.map(({ entry, index }) => {
                        const cellTopic = detectTopic(entry);
                        return (
                          <div key={entry.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 hover:border-gray-300 transition-colors">
                            
                            {/* Type Icon Gutter */}
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 self-start">
                              {entry.type === 'code' ? <Code className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                            
                            {/* Content Detail */}
                            <div className="flex-1 space-y-4 min-w-0">
                              
                              {/* Entry Metadata */}
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200/50 shadow-xs">
                                  #{index + 1}
                                </span>
                                <span className="font-bold text-gray-900 text-sm capitalize">{entry.source || (entry.type === 'code' ? 'Code snippet' : 'Note')}</span>
                                {entry.timestamp && (
                                  <>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="text-xs text-gray-400 font-bold">{entry.timestamp}</span>
                                  </>
                                )}
                                {cellTopic && (
                                  <button 
                                    onClick={() => setSelectedTopicFilter(cellTopic)}
                                    className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100/60 text-indigo-700 text-[10px] font-black uppercase hover:bg-indigo-100 transition-colors cursor-pointer ml-1"
                                    title={`Filter cells by #${cellTopic}`}
                                  >
                                    #{cellTopic}
                                  </button>
                                )}
                              </div>
                              
                              {/* Markdown Text Entry */}
                              {entry.type === 'text' && (
                                <div className="prose prose-indigo prose-sm text-gray-800 leading-relaxed font-medium max-w-none">
                                  <ReactMarkdown>{entry.content}</ReactMarkdown>
                                </div>
                              )}
                              
                              {/* Code Entry */}
                              {entry.type === 'code' && (
                                <div className="space-y-4">
                                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-x-auto shadow-sm max-h-[400px] custom-scrollbar">
                                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-800 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                      <span>{entry.language || 'Code'}</span>
                                      <span>Editor Mode</span>
                                    </div>
                                    <pre className="font-mono text-[13px] text-gray-300 whitespace-pre-wrap"><code className="block">{entry.content}</code></pre>
                                  </div>
                                  
                                  {/* Output Area */}
                                  {entry.output && (
                                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-inner overflow-x-auto max-h-[300px] custom-scrollbar">
                                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 select-none">Console Output</div>
                                      <pre className={`font-mono text-[13px] whitespace-pre-wrap ${entry.output.toLowerCase().includes('error') ? 'text-red-600' : 'text-gray-700'}`}><code className="block">{entry.output}</code></pre>
                                    </div>
                                  )}
                                  
                                  {/* AI Explanation Section */}
                                  {entry.aiExample && (
                                    <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-5 shadow-sm space-y-2">
                                      <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs uppercase tracking-widest">
                                        <Brain className="w-4 h-4 text-indigo-600 animate-pulse" />
                                        <span>AI Explanation</span>
                                      </div>
                                      <div className="text-[13.5px] text-indigo-950 leading-relaxed prose prose-sm max-w-none">
                                        <ReactMarkdown>{entry.aiExample}</ReactMarkdown>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-1">No shared notebook data</h3>
                <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
                  This user's notebook has no completed modules shared at the moment.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SharedNotebook;
