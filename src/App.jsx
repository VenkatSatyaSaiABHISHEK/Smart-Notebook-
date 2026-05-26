import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Brain } from 'lucide-react';

// Layout components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Home from './pages/Home';
import DashboardOverview from './pages/Dashboard/DashboardOverview';
import NotebookDashboard from './pages/Notebook/NotebookDashboard';
import NotebookTimeline from './pages/Notebook/NotebookTimeline';
import SharedNotebook from './pages/Notebook/SharedNotebook';
import CommunityHub from './pages/Community/CommunityHub';
import AIIntelligence from './pages/AI/AIIntelligence';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CodeVisualizer from './pages/Dashboard/CodeVisualizer';

// Auth Pages
import Welcome from './pages/Auth/Welcome';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Onboarding from './pages/Auth/Onboarding';

import Settings from './pages/Dashboard/Settings';
import DemoTry from './pages/DemoTry';

// Wrapper for Dashboard Layout
const DashboardLayout = ({ children, theme, toggleTheme }) => {
  return (
    <>
      {/* Mobile/Tablet Block Overlay */}
      <div className="flex lg:hidden flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 p-6 text-center z-50 relative font-sans select-none cursor-default">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
          <Brain className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 leading-snug">Desktop Optimized Workspace</h2>
        <p className="text-sm text-gray-500 max-w-[280px] leading-relaxed">
          For the best experience coding, visualizing stack execution, and building batches, please use a laptop or desktop monitor.
        </p>
      </div>

      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative min-h-0">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

function App() {
  const [theme, setTheme] = React.useState('light');

  useEffect(() => {
    // Redirect legacy non-hash shared notebook links to HashRouter-compatible URLs
    const path = window.location.pathname;
    if (path.includes('/shared-notebook/')) {
      const parts = path.split('/shared-notebook/');
      const userId = parts[parts.length - 1];
      if (userId) {
        window.location.replace(`${window.location.origin}/#/shared-notebook/${userId}`);
      }
    }
  }, []);

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
            
            {/* Sandbox Try Page (No Login Required) */}
            <Route path="/try" element={<DemoTry />} />
            <Route path="/demo" element={<DemoTry />} />
            
            {/* Auth Routes */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/shared-notebook/:userId" element={<SharedNotebook />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout theme={theme} toggleTheme={toggleTheme}><DashboardOverview /></DashboardLayout></ProtectedRoute>} />
            <Route path="/notebook" element={<ProtectedRoute><DashboardLayout theme={theme} toggleTheme={toggleTheme}><NotebookDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/notebook/:day" element={<ProtectedRoute><DashboardLayout theme={theme} toggleTheme={toggleTheme}><NotebookTimeline /></DashboardLayout></ProtectedRoute>} />
            <Route path="/visualizer" element={<ProtectedRoute><DashboardLayout theme={theme} toggleTheme={toggleTheme}><CodeVisualizer /></DashboardLayout></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><DashboardLayout theme={theme} toggleTheme={toggleTheme}><CommunityHub /></DashboardLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><DashboardLayout theme={theme} toggleTheme={toggleTheme}><Settings /></DashboardLayout></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
