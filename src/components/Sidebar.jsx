import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, BookText, Network, Sparkles, User, Settings, Bell, LogOut, Cpu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, logout } = useAuth();

  const links = [
    { path: '/dashboard', icon: Home },
    { path: '/notebook', icon: BookText },
    { path: '/visualizer', icon: Cpu },
    { path: '/community', icon: Network },
  ];

  const handleLogout = async () => {
    try {
      // If in demo mode, clear local storage to simulate full logout
      localStorage.removeItem('demoUserData');
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="h-screen w-20 flex flex-col items-center py-8 bg-[#fdfdfd] border-r border-[#ecece8] shrink-0 z-30">
      
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center shadow-md mb-12">
        <Sparkles className="w-5 h-5 text-white" />
      </div>

      {/* Main Navigation */}
      <div className="flex-1 flex flex-col gap-6 w-full px-4">
        {links.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-all mx-auto ${
                isActive 
                  ? 'text-white shadow-lg scale-110' 
                  : 'text-[#8a8a8a] hover:bg-[#f2f2f2] hover:text-[#1a1a1a]'
              }`}
              style={isActive ? { backgroundColor: userData?.accentColor || '#1a1a1a', boxShadow: `0 10px 15px -3px ${(userData?.accentColor || '#1a1a1a')}40` } : {}}
            >
              <Icon className="w-5 h-5" />
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-4 w-full px-4 mt-auto">
        <NavLink 
          to="/settings"
          className={({ isActive }) => `w-12 h-12 rounded-[14px] flex items-center justify-center transition-all mx-auto ${
            isActive 
              ? 'text-white shadow-lg scale-110' 
              : 'text-[#8a8a8a] hover:bg-[#f2f2f2] hover:text-[#1a1a1a]'
          }`}
          style={({ isActive }) => isActive ? { backgroundColor: userData?.accentColor || '#1a1a1a', boxShadow: `0 10px 15px -3px ${(userData?.accentColor || '#1a1a1a')}40` } : {}}
        >
          <Settings className="w-5 h-5" />
        </NavLink>
        
        <button 
          onClick={handleLogout}
          className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[#8a8a8a] hover:bg-red-50 hover:text-red-500 transition-all mx-auto"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>

        <button className="w-12 h-12 rounded-full overflow-hidden mt-2 mx-auto border-2 border-transparent hover:border-[#1a1a1a] transition-all cursor-pointer">
          <img src={`https://ui-avatars.com/api/?name=${userData?.fullName || 'User'}&background=${(userData?.accentColor || '1a1a1a').replace('#', '')}&color=fff`} className="w-full h-full object-cover" />
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
