import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Target, Book, Users, Upload, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const { currentUser, userData, setUserData, logout } = useAuth();
  const navigate = useNavigate();

  // Step 1: Interests
  const [selectedInterests, setSelectedInterests] = useState([]);
  const interestsList = ['Python', 'Java', 'AI/ML', 'DSA', 'Web Development', 'Cloud', 'DevOps', 'Data Science'];

  // Step 2: Goals
  const [selectedGoal, setSelectedGoal] = useState('');
  const goalsList = [
    { id: 'placement', title: 'Placement Preparation', icon: Target },
    { id: 'crt', title: 'CRT Training', icon: Book },
    { id: 'hackathon', title: 'Hackathons', icon: Sparkles }
  ];

  // Step 3: Level & Personalization
  const [level, setLevel] = useState('');
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const [startDate, setStartDate] = useState('');
  const [accentColor, setAccentColor] = useState('#6366f1');

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleFinish = async () => {
    // Save onboarding data to Firestore
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        interests: selectedInterests,
        goal: selectedGoal,
        level: level,
        startDate: startDate,
        accentColor: accentColor,
        onboardingCompleted: true
      };
      
      await updateDoc(userRef, updateData);
      setUserData({ ...userData, ...updateData });
      
      // Move to cinematic dashboard entry
      setStep(4);
      setTimeout(() => {
        navigate('/notebook');
      }, 4000);
    }
  };

  const variants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  // Cinematic Entry Screen
  if (step === 4) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center relative z-10"
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.6)]">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            Welcome, {userData?.fullName?.split(' ')[0] || 'Learner'}.
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-xl text-indigo-300"
          >
            Your AI dashboard is ready.
          </motion.p>
        </motion.div>
        
        {/* Cinematic sweeping light */}
        <motion.div 
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: 0.3 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="absolute top-0 bottom-0 w-[500px] bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-45deg] z-20 pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-10 w-full max-w-3xl flex justify-between px-6">
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 w-16 rounded-full transition-colors ${i <= step ? 'bg-indigo-500' : 'bg-white/10'}`} />
          ))}
        </div>
        <button onClick={() => logout()} className="text-sm text-gray-500 hover:text-white">Cancel Setup</button>
      </div>

      <div className="w-full max-w-2xl mt-12 relative h-[500px]">
        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col"
            >
              <h2 className="text-4xl font-extrabold mb-4 text-white">What are you learning?</h2>
              <p className="text-gray-400 mb-8">Select your main interests to help AI personalize your feed.</p>
              
              <div className="flex flex-wrap gap-4 mb-auto">
                {interestsList.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedInterests.includes(interest)
                        ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-105'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  disabled={selectedInterests.length === 0}
                  onClick={handleNext} 
                  className="px-8 py-3 bg-white text-black font-bold rounded-xl disabled:opacity-50 flex items-center"
                >
                  Continue <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col"
            >
              <h2 className="text-4xl font-extrabold mb-4 text-white">What's your main goal?</h2>
              <p className="text-gray-400 mb-8">This tailors your daily timeline and quiz generation.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-auto">
                {goalsList.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-6 rounded-2xl border text-left transition-all duration-300 flex flex-col items-start ${
                      selectedGoal === goal.id
                        ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`p-3 rounded-xl mb-4 ${selectedGoal === goal.id ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-gray-400'}`}>
                      <goal.icon className="w-6 h-6" />
                    </div>
                    <h3 className={`font-bold ${selectedGoal === goal.id ? 'text-white' : 'text-gray-300'}`}>{goal.title}</h3>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={handlePrev} className="px-8 py-3 text-gray-400 hover:text-white font-bold rounded-xl">Back</button>
                <button 
                  disabled={!selectedGoal}
                  onClick={handleNext} 
                  className="px-8 py-3 bg-white text-black font-bold rounded-xl disabled:opacity-50 flex items-center"
                >
                  Continue <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col"
            >
              <h2 className="text-4xl font-extrabold mb-4 text-white">Setup your profile</h2>
              <p className="text-gray-400 mb-8">Choose your settings to complete the setup.</p>
              
              <div className="flex flex-col md:flex-row gap-8 mb-auto">
                {/* Avatar & Color */}
                <div className="flex flex-col items-center gap-6">
                  <div className={`w-32 h-32 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group`} style={{ borderColor: accentColor || '#6366f1', backgroundColor: `${accentColor || '#6366f1'}20` }}>
                    <img src={`https://ui-avatars.com/api/?name=${userData?.fullName?.replace(' ', '+') || 'User'}&background=${(accentColor || '#6366f1').replace('#', '')}&color=fff&size=128`} alt="Avatar" className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity" />
                    <Upload className="w-6 h-6 text-white absolute opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="w-full">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block text-center">Theme Color</label>
                    <div className="flex gap-2 justify-center">
                      {['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'].map(color => (
                        <button 
                          key={color} 
                          onClick={() => setAccentColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Level Selection & Start Date */}
                <div className="flex-1 space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Skill Level</label>
                    <div className="grid grid-cols-1 gap-2">
                      {levels.map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setLevel(lvl)}
                          className={`w-full p-3 rounded-xl text-left font-medium transition-all flex items-center justify-between ${
                            level === lvl 
                              ? 'text-white border' 
                              : 'bg-[#12121a] border border-white/10 text-gray-300 hover:border-white/30'
                          }`}
                          style={level === lvl ? { backgroundColor: accentColor || '#6366f1', borderColor: accentColor || '#6366f1' } : {}}
                        >
                          {lvl}
                          {level === lvl && <Check className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 block">CRT / Semester Start Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#12121a] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between pt-4 border-t border-white/10">
                <button onClick={handlePrev} className="px-8 py-3 text-gray-400 hover:text-white font-bold rounded-xl">Back</button>
                <button 
                  disabled={!level || !startDate}
                  onClick={handleFinish} 
                  className="px-8 py-3 text-white font-bold rounded-xl disabled:opacity-50 flex items-center transition-all"
                  style={{ backgroundColor: accentColor || '#6366f1', boxShadow: `0 0 20px ${(accentColor || '#6366f1')}60` }}
                >
                  Enter Platform <Sparkles className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
