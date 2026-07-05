import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/notebook');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/notebook');
    } catch (err) {
      setError('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col md:flex-row">
      {/* Left Side Visuals */}
      <div className="hidden md:flex flex-col justify-center w-1/2 p-12 relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-r border-white/5">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px]" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-white">VidyaSetu Ai</span>
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">Welcome back to your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">learning ecosystem.</span></h1>
            <p className="text-lg text-gray-400 max-w-md">Your AI mentor and community are waiting for you.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 relative"
          >
            {/* Abstract floating UI cards */}
            <div className="w-72 h-32 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-xl transform -rotate-6">
              <div className="w-1/2 h-4 bg-white/10 rounded mb-3" />
              <div className="w-full h-2 bg-white/5 rounded mb-2" />
              <div className="w-4/5 h-2 bg-white/5 rounded" />
            </div>
            <div className="w-64 h-24 bg-indigo-500/10 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-4 shadow-xl absolute -bottom-10 right-10 transform rotate-3">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-400/20" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="w-full h-2 bg-indigo-400/20 rounded" />
                  <div className="w-2/3 h-2 bg-indigo-400/20 rounded" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Log In</h2>
            <p className="text-gray-400">Enter your credentials to access your account.</p>
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

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1 relative group">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/5 transition-all group-hover:border-white/20"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1 relative group">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/5 transition-all group-hover:border-white/20"
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-[#12121a] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-gray-500 font-medium">OR</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <div className="mt-6 flex gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"/>
              </svg>
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account? <Link to="/signup" className="text-white font-medium hover:text-indigo-400 transition-colors">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
