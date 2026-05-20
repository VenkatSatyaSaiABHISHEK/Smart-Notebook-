import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Check, User, Palette, Target, Book, Sparkles, Loader2, Save } from 'lucide-react';

const Settings = () => {
  const { currentUser, userData, setUserData } = useAuth();
  
  // Local state for forms
  const [fullName, setFullName] = useState(userData?.fullName || '');
  const [startDate, setStartDate] = useState(userData?.startDate || '');
  const [goal, setGoal] = useState(userData?.goal || '');
  const [accentColor, setAccentColor] = useState(userData?.accentColor || '#6366f1');
  const [level, setLevel] = useState(userData?.level || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#f43f5e'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const goalsList = [
    { id: 'placement', title: 'Placement Preparation', icon: Target },
    { id: 'crt', title: 'CRT Training', icon: Book },
    { id: 'hackathon', title: 'Hackathons', icon: Sparkles }
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const updateData = {
        fullName,
        startDate,
        goal,
        accentColor,
        level
      };

      if (currentUser && currentUser.uid !== 'demo-user') {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, updateData);
      } else if (currentUser && currentUser.uid === 'demo-user') {
        // Save to localStorage for demo persistence
        localStorage.setItem('demoUserData', JSON.stringify({ ...userData, ...updateData }));
      }
      
      // Update local context
      setUserData({ ...userData, ...updateData });
      
      setSaveMessage('Settings saved successfully!');
    } catch (error) {
      console.error("Error saving settings", error);
      setSaveMessage('Failed to save settings.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="p-10 md:p-16 max-w-[1000px] mx-auto min-h-full font-sans bg-[#f9fafb]">
      
      <div className="mb-12">
        <h1 className="text-[36px] font-bold text-[#111827] tracking-tight mb-2">Settings.</h1>
        <p className="text-[16px] text-[#6b7280] font-medium max-w-2xl">
          Manage your profile, customize your UI, and adjust your learning goals.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Profile & Course Info */}
        <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#111827] mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" /> Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all font-medium"
                style={{ focusRing: accentColor }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">CRT / Semester Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all font-medium text-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1.5">Used to calculate your current timeline (e.g. Day 4).</p>
            </div>
          </div>
        </div>

        {/* UI Customization */}
        <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#111827] mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5 text-gray-400" /> UI Customization
          </h2>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-4">Dashboard Accent Color</label>
            <div className="flex flex-wrap gap-4">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccentColor(color)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${accentColor === color ? 'ring-4 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color, ringColor: color }}
                >
                  {accentColor === color && <Check className="w-5 h-5 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Goals */}
        <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#111827] mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-400" /> Learning Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">Primary Goal</label>
              <div className="space-y-3">
                {goalsList.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`w-full p-4 rounded-xl text-left font-bold transition-all flex items-center justify-between border ${
                      goal === g.id 
                        ? 'text-white shadow-md' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                    style={goal === g.id ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <g.icon className="w-5 h-5" /> {g.title}
                    </div>
                    {goal === g.id && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">Skill Level</label>
              <div className="space-y-3">
                {levels.map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`w-full p-4 rounded-xl text-left font-bold transition-all flex items-center justify-between border ${
                      level === lvl 
                        ? 'text-white shadow-md' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                    style={level === lvl ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                  >
                    {lvl}
                    {level === lvl && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-emerald-600">
            {saveMessage}
          </div>
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-8 py-3.5 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-70"
            style={{ backgroundColor: accentColor }}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>

      </form>

    </div>
  );
};

export default Settings;
