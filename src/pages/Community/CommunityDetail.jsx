import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, BookOpen, MessageSquare, Settings, Upload, Check, X, ShieldAlert, ArrowRight, Plus } from 'lucide-react';
import { handleJoinRequest, getPendingRequests, getCommunityContent, shareContent, getAutomaticDayNotes, getCurriculum, addCurriculumDay } from '../../services/communityService';
import { useAuth } from '../../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

const CurriculumDayItem = ({ item, isLast, communityId, onOpenNotebooks }) => {
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    const fetchInitialCount = async () => {
      try {
        const fetchedNotes = await getAutomaticDayNotes(communityId, item.day.toString());
        setMemberCount(fetchedNotes.length);
      } catch (e) { console.error(e); }
    };
    fetchInitialCount();
  }, [communityId, item.day]);

  return (
    <div className="relative pl-8 group">
      {/* Timeline Dot */}
      <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${isLast ? 'bg-indigo-600' : 'bg-indigo-300'}`}>
        {isLast && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
      </div>

      <div 
        onClick={() => onOpenNotebooks(item)}
        className="bg-white border border-gray-200 rounded-[20px] p-6 hover:shadow-lg transition-all hover:border-indigo-200 cursor-pointer group/card"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                Day {item.day}
              </span>
              <span className="text-[13px] font-bold text-gray-500">
                {item.date}
              </span>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-1">{item.topic}</h4>
            <div className="text-sm font-bold text-indigo-500 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> {item.tech}
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
              {(item.instructor || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="text-xs font-bold text-gray-700">Taught by {item.instructor || 'Unknown'}</div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          {item.description || `Comprehensive notes and materials compiled from the community for Day ${item.day}'s session on ${item.tech}. Includes code snippets, exercises, and Q&A summaries.`}
        </p>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400">{memberCount === 0 ? "No notebooks yet" : `${memberCount} member${memberCount === 1 ? '' : 's'} shared notebooks`}</span>
          </div>
          <button className="text-sm font-bold text-indigo-600 group-hover/card:text-indigo-700 flex items-center group-hover/card:translate-x-1 transition-transform">
            View Full Member Notebooks <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

const FullScreenNotebookView = ({ dayItem, communityId, onClose }) => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemberNote, setSelectedMemberNote] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const fetchedNotes = await getAutomaticDayNotes(communityId, dayItem.day.toString());
        setNotes(fetchedNotes);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, [communityId, dayItem.day]);

  return createPortal(
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto font-sans flex flex-col">
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 p-4 px-6 md:px-12 flex justify-between items-center z-10 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            {selectedMemberNote && (
              <button 
                onClick={() => setSelectedMemberNote(null)} 
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors mr-1"
                title="Back to Folders"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-2xl font-black text-gray-900">
              {selectedMemberNote ? `${selectedMemberNote.userName}'s Notebook` : `Day ${dayItem.day} Notebooks`}
            </h2>
          </div>
          <p className="text-sm text-gray-500 font-bold mt-1">
            {selectedMemberNote ? `Day ${dayItem.day} Session` : `${notes.length} member${notes.length === 1 ? '' : 's'} shared notebooks`}
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>
      
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Notebooks Found</h3>
            <p>No community members have started taking notes for Day {dayItem.day} yet.</p>
          </div>
        ) : !selectedMemberNote ? (
          // FOLDER VIEW
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-32 animate-in fade-in slide-in-from-bottom-4">
            {notes.map(memberNote => (
              <div 
                key={memberNote.id} 
                onClick={() => setSelectedMemberNote(memberNote)}
                className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all cursor-pointer group flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                    {(memberNote.userName || 'U').charAt(0).toUpperCase()}
                  </div>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {memberNote.userName}
                </h3>
                <p className="text-sm font-bold text-gray-400 flex items-center gap-1.5 mt-2">
                  <BookOpen className="w-4 h-4" /> View Notebook
                </p>
              </div>
            ))}
          </div>
        ) : (
          // NOTEBOOK DETAIL VIEW
          <div className="pb-32 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm overflow-hidden">
              <div className="p-6 md:p-10 space-y-8 bg-white">
                {selectedMemberNote.entries?.length === 0 ? (
                  <p className="text-gray-500 italic">Empty notebook</p>
                ) : (
                  selectedMemberNote.entries.map((entry, idx) => (
                    <div key={idx} className="w-full">
                      {entry.type === 'text' && (
                        <div className="prose prose-indigo prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed font-medium">
                          <ReactMarkdown>{entry.content}</ReactMarkdown>
                        </div>
                      )}

                      {entry.type === 'code' && (
                        <div className="space-y-4 mt-1">
                          <div className="flex flex-col lg:flex-row gap-4">
                            <div className="bg-[#0f172a] rounded-xl p-4 overflow-x-auto text-[14px] leading-relaxed font-mono text-blue-300 shadow-lg flex-1">
                              <div className="flex items-center justify-between mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-700 pb-2">
                                <span>{entry.language || 'Code'}</span>
                              </div>
                              <pre><code>{entry.content}</code></pre>
                            </div>
                            
                            {entry.output && (
                              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-x-auto text-[14px] leading-relaxed font-mono text-gray-700 shadow-inner flex-1 max-h-[400px] custom-scrollbar">
                                <div className="flex items-center justify-between mb-2 text-xs font-black text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2">
                                  <span>Output</span>
                                </div>
                                <pre><code>{entry.output}</code></pre>
                              </div>
                            )}
                          </div>
                          
                          {entry.aiExample && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 relative shadow-sm">
                              <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
                                <span className="text-xs uppercase tracking-wider">AI Explanation</span>
                              </div>
                              <div className="prose prose-sm prose-indigo max-w-none font-medium text-gray-700">
                                <ReactMarkdown>{entry.aiExample}</ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

const CommunityDetail = ({ community, onBack }) => {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState('curriculum');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [feedPosts, setFeedPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Curriculum State
  const [curriculumDays, setCurriculumDays] = useState([]);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ day: '', tech: '', topic: '', description: '' });
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [activeNotebookDay, setActiveNotebookDay] = useState(null);

  useEffect(() => {
    if (community) {
      loadCurriculum();
    }
  }, [community]);

  const startDateStr = userData?.startDate || new Date().toISOString().split('T')[0];

  const currentDay = useMemo(() => {
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
    return (today < start) ? 1 : tempCount;
  }, [startDateStr]);

  const loadCurriculum = async () => {
    setIsLoadingCurriculum(true);
    try {
      const data = await getCurriculum(community.id);
      
      const autoDays = [];
      for (let i = 1; i <= currentDay; i++) {
         const existing = data.find(d => Number(d.day) === i);
         if (existing) {
            autoDays.push(existing);
         } else {
            autoDays.push({
               id: `auto-day-${i}`,
               day: i,
               date: `Day ${i} of CRT`,
               topic: `Day ${i} Notebooks`,
               tech: 'Daily Sync',
               description: `Community notebooks and notes for Day ${i}.`,
               instructor: 'Community'
            });
         }
      }
      
      const futureDays = data.filter(d => Number(d.day) > currentDay);
      const combined = [...autoDays, ...futureDays];
      
      combined.sort((a, b) => (Number(a.day) || 0) - (Number(b.day) || 0));
      setCurriculumDays(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCurriculum(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed') {
      const fetchFeed = async () => {
        setIsLoadingFeed(true);
        try {
          const posts = await getCommunityContent(community.id);
          // sort by createdAt desc
          posts.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          setFeedPosts(posts);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingFeed(false);
        }
      };
      fetchFeed();
    }
  }, [community.id, activeTab]);

  const handleApprove = async (reqId, userId) => {
    try { 
      await handleJoinRequest(community.id, userId, 'approve'); 
      setPendingRequests(prev => prev.filter(r => r.id !== reqId));
    } catch(e) {
      alert('Failed to approve request: ' + e.message);
    }
  };

  const handleReject = async (reqId, userId) => {
    try { 
      await handleJoinRequest(community.id, userId, 'reject'); 
      setPendingRequests(prev => prev.filter(r => r.id !== reqId));
    } catch(e) {
      alert('Failed to reject request: ' + e.message);
    }
  };

  useEffect(() => {
    if (community.isAdmin && activeTab === 'admin') {
      const fetchReqs = async () => {
        setIsLoadingRequests(true);
        try {
          const reqs = await getPendingRequests(community.id);
          setPendingRequests(reqs);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingRequests(false);
        }
      };
      fetchReqs();
    }
  }, [community.id, community.isAdmin, activeTab]);

  const handlePostSubmit = async () => {
    if (!newPostText.trim()) return;
    setIsPosting(true);
    try {
      const postData = {
        type: 'note',
        text: newPostText,
        userName: currentUser.displayName || currentUser.email || 'User'
      };
      await shareContent(community.id, currentUser.uid, postData);
      setNewPostText('');
      // Refetch feed or append locally
      const posts = await getCommunityContent(community.id);
      posts.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setFeedPosts(posts);
    } catch (error) {
      alert("Failed to post: " + error.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic.day || !newTopic.topic || !newTopic.tech) {
      return alert("Please fill the required fields: Day, Topic, and Technology.");
    }
    setIsAddingTopic(true);
    try {
      const dayData = {
        day: Number(newTopic.day),
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        tech: newTopic.tech,
        topic: newTopic.topic,
        description: newTopic.description,
        instructor: currentUser.displayName || currentUser.email || 'Admin',
        notes: 0
      };
      
      await addCurriculumDay(community.id, dayData);
      
      const data = await getCurriculum(community.id);
      data.sort((a, b) => (Number(a.day) || 0) - (Number(b.day) || 0));
      setCurriculumDays(data);
      
      setShowAddTopic(false);
      setNewTopic({ day: '', tech: '', topic: '', description: '' });
    } catch (error) {
      alert("Failed to add topic: " + error.message);
    } finally {
      setIsAddingTopic(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[24px] border border-gray-200 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-20 -mt-20 z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors self-start md:self-auto"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0">
            {community.name.charAt(0)}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{community.name}</h1>
            <p className="text-gray-500 max-w-2xl">{community.settings?.description || 'A collaborative learning space.'}</p>
          </div>
          
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700">
              {community.memberCount || 1} Members
            </div>
            {community.isAdmin && (
              <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-sm font-bold text-amber-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Admin
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button 
          onClick={() => setActiveTab('curriculum')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'curriculum' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <BookOpen className="w-4 h-4" /> Learning Timeline
        </button>
        <button 
          onClick={() => setActiveTab('feed')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'feed' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <MessageSquare className="w-4 h-4" /> Community Feed
        </button>
        {community.isAdmin && (
          <button 
            onClick={() => setActiveTab('admin')}
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'admin' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Settings className="w-4 h-4" /> Manage Members
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="py-4">
        
        {/* Shared Curriculum / Notebook Tab */}
        {activeTab === 'curriculum' && (
          <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-center mb-6">
              {community.isAdmin && (
                <button 
                  onClick={() => setShowAddTopic(!showAddTopic)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  {showAddTopic ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showAddTopic ? 'Cancel' : "Add Day's Topic"}
                </button>
              )}
            </div>

            {/* Add Topic Form */}
            {showAddTopic && community.isAdmin && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-[20px] p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                <h4 className="font-bold text-indigo-900 mb-4">Create New Topic Session</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-indigo-700 mb-1">Day Number</label>
                    <input type="number" value={newTopic.day} onChange={e => setNewTopic({...newTopic, day: e.target.value})} placeholder="e.g. 1" className="w-full px-3 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-700 mb-1">Technology / Module</label>
                    <input type="text" value={newTopic.tech} onChange={e => setNewTopic({...newTopic, tech: e.target.value})} placeholder="e.g. React Basics" className="w-full px-3 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-indigo-700 mb-1">Main Topic</label>
                    <input type="text" value={newTopic.topic} onChange={e => setNewTopic({...newTopic, topic: e.target.value})} placeholder="e.g. Setup & Introduction to React" className="w-full px-3 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-indigo-700 mb-1">Description (Optional)</label>
                    <textarea value={newTopic.description} onChange={e => setNewTopic({...newTopic, description: e.target.value})} placeholder="What will be covered?" rows="2" className="w-full px-3 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"></textarea>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleAddTopic} disabled={isAddingTopic} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                    {isAddingTopic ? 'Adding...' : 'Publish Topic'}
                  </button>
                </div>
              </div>
            )}
            
            <div className="max-w-3xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Learning Timeline</h3>
                  <p className="text-gray-500 font-medium">Auto-syncing personal notebooks from all members.</p>
                </div>
              </div>

              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-indigo-200 before:to-transparent">
                {curriculumDays.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-[24px] border border-gray-200">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-gray-900">No Curriculum Yet</h4>
                  </div>
                ) : (
                  curriculumDays.map((item, idx) => (
                    <CurriculumDayItem 
                      key={item.id} 
                      item={item} 
                      idx={idx} 
                      isLast={idx === curriculumDays.length - 1} 
                      communityId={community.id}
                      onOpenNotebooks={() => setActiveNotebookDay(item)}
                    />
                  ))
                )}
                
                {activeNotebookDay && (
                  <FullScreenNotebookView 
                    dayItem={activeNotebookDay} 
                    communityId={community.id} 
                    onClose={() => setActiveNotebookDay(null)} 
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Community Feed Tab */}
        {activeTab === 'feed' && (
          <div className="max-w-3xl space-y-6">
            {/* Input Box */}
            <div className="bg-white border border-gray-200 rounded-[20px] p-4 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostSubmit()}
                  placeholder={community.settings?.allowFilesOnly ? "Share a link or file..." : "Share a thought, note, or file..."} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium mb-3" 
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-colors"><Upload className="w-5 h-5" /></button>
                  </div>
                  <button 
                    onClick={handlePostSubmit}
                    disabled={isPosting || !newPostText.trim()}
                    className="bg-[#111827] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-black transition-colors"
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>

            {/* Posts */}
            {isLoadingFeed ? (
              <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : feedPosts.length === 0 ? (
              <div className="py-12 text-center text-gray-500 bg-white border border-gray-200 border-dashed rounded-[20px]">
                No posts yet. Be the first to start a discussion!
              </div>
            ) : (
              feedPosts.map(post => (
                <div key={post.id} className="bg-white border border-gray-200 rounded-[20px] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                      {(post.userName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{post.userName || 'Unknown User'}</div>
                      <div className="text-xs text-gray-500">{post.createdAt?.toDate ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(post.createdAt.toDate()) : 'Just now'}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{post.text}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && community.isAdmin && (
          <div className="max-w-4xl space-y-8">
            <div className="bg-white border border-gray-200 rounded-[24px] p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Pending Join Requests</h3>
              
              {isLoadingRequests ? (
                <div className="text-center py-8 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No pending requests right now.</div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 border border-gray-100 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{(req.userName || 'U').charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{req.userName || 'Unknown User'}</div>
                          <div className="text-xs text-gray-500">Requested to join</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(req.id, req.userId)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => handleReject(req.id, req.userId)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-[24px] p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Community Settings</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div>
                      <div className="text-sm font-bold text-gray-900">Private Community</div>
                      <div className="text-xs text-gray-500">Only approved members can join</div>
                    </div>
                    <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div>
                      <div className="text-sm font-bold text-gray-900">Allow Text Messages</div>
                      <div className="text-xs text-gray-500">Enable chat in the community feed</div>
                    </div>
                    <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CommunityDetail;
