import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Home from './pages/Home';
import DashboardOverview from './pages/Dashboard/DashboardOverview';
import NotebookDashboard from './pages/Notebook/NotebookDashboard';
import NotebookTimeline from './pages/Notebook/NotebookTimeline';
import CommunityHub from './pages/Community/CommunityHub';
import AIIntelligence from './pages/AI/AIIntelligence';
import AdminDashboard from './pages/Admin/AdminDashboard';

// Auth Pages
import Welcome from './pages/Auth/Welcome';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Onboarding from './pages/Auth/Onboarding';

import Settings from './pages/Dashboard/Settings';

// Wrapper for Dashboard Layout
const DashboardLayout = ({ children, theme, toggleTheme }) => {
  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-20 md:pb-0 bg-[#f9fafb]">
          {children}
        </main>
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/10 blur-[150px]" />
        </div>
      </div>
    </div>
  );
};

function App() {
  const [theme, setTheme] = React.useState('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <AuthProvider>
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300 font-sans`}>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Home />} />
            
            {/* Auth Routes */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout theme={theme} toggleTheme={toggleTheme}><DashboardOverview /></DashboardLayout></ProtectedRoute>} />
            <Route path="/notebook" element={<ProtectedRoute><DashboardLayout theme={theme} toggleTheme={toggleTheme}><NotebookDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/notebook/:day" element={<ProtectedRoute><DashboardLayout theme={theme} toggleTheme={toggleTheme}><NotebookTimeline /></DashboardLayout></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><DashboardLayout theme={theme} toggleTheme={toggleTheme}><CommunityHub /></DashboardLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><DashboardLayout theme={theme} toggleTheme={toggleTheme}><Settings /></DashboardLayout></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
