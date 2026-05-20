import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Simple password strength calculation
    let strength = 0;
    if (formData.password.length >= 8) strength += 1;
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    
    if (passwordStrength < 2) {
      return setError('Password is too weak.');
    }

    try {
      setError('');
      setLoading(true);
      await signup(formData.email, formData.password, formData.fullName, formData.username);
      // Wait for AuthContext to update, then navigate to onboarding
      setTimeout(() => navigate('/onboarding'), 1000);
    } catch (err) {
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-emerald-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col md:flex-row-reverse relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[150px]" />
      </div>

      {/* Right Side Visuals (now on left in desktop due to flex-row-reverse) */}
      <div className="hidden md:flex flex-col justify-center w-1/2 p-12 relative z-10 border-l border-white/5 bg-black/20 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-sm font-bold mb-6 border border-pink-500/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Join 10,000+ Students
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">Start building your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">career today.</span></h1>
          
          <ul className="space-y-6 mt-12">
            {[
              { title: "Smart Notebook", desc: "Organize notes automatically." },
              { title: "AI Explain", desc: "Understand any topic instantly." },
              { title: "Live Communities", desc: "Learn with your entire batch." }
            ].map((feature, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-400">{feature.desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Form Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Join LearnLoop to unlock your AI mentor.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 flex items-center text-sm"
              >
                <AlertCircle className="w-4 h-4 mr-2" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:bg-white/5 transition-all group-hover:border-white/20"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1 group relative">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</label>
                <input 
                  type="text" 
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:bg-white/5 transition-all group-hover:border-white/20"
                  placeholder="johndoe123"
                />
                {/* AI Suggestion fake button */}
                <button type="button" className="absolute right-2 top-8 p-1.5 bg-white/5 rounded-lg text-pink-400 hover:bg-white/10" title="AI Suggestion">
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1 group">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:bg-white/5 transition-all group-hover:border-white/20"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1 group">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:border-pink-500 focus:bg-white/5 transition-all group-hover:border-white/20"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password Strength Meter */}
              {formData.password.length > 0 && (
                <div className="pt-2">
                  <div className="flex gap-1 h-1.5 mb-1">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength] : 'bg-white/10'} transition-all duration-300`} />
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold ${strengthColors[passwordStrength].replace('bg-', 'text-')}`}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1 group">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confirm Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:bg-white/5 transition-all group-hover:border-white/20"
                placeholder="••••••••"
              />
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all flex items-center justify-center"
            >
              {loading ? 'Creating Account...' : (
                <>Create Account <ChevronRight className="w-5 h-5 ml-1" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account? <Link to="/login" className="text-white font-medium hover:text-pink-400 transition-colors">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
