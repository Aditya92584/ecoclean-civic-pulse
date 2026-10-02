import React, { useState, useEffect } from 'react';
import {
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Shield,
  Truck,
  Leaf,
  Layers,
  MapPin,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const [activeIssueCount, setActiveIssueCount] = useState<number>(0);

  useEffect(() => {
    // Fetch stats to display the badge in "Public Feed"
    api.getStats().then((s) => {
      if (s && typeof s.total === 'number') {
        setActiveIssueCount(s.total);
      }
    });

    const refreshCount = () => {
      api.getStats().then((s) => {
        if (s && typeof s.total === 'number') {
          setActiveIssueCount(s.total);
        }
      });
    };

    window.addEventListener('ecoclean:issue-created', refreshCount);
    return () => window.removeEventListener('ecoclean:issue-created', refreshCount);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand: New Updated Title Name "EcoPulse" with Neon Emerald Accent */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div className="text-left">
            <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              Eco<span className="text-emerald-400">Pulse</span>
            </span>
            <span className="block text-[9px] uppercase tracking-widest font-bold text-slate-400 -mt-1">
              Civic Cleanliness
            </span>
          </div>
        </button>

        {/* Center Navigation Links: Clean Modern Typography with Hover Animations */}
        <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-semibold text-slate-300">
          <button
            onClick={() => onSelectTab('home')}
            className={`transition-all duration-150 relative py-1 cursor-pointer hover:text-white ${
              currentTab === 'home' ? 'text-emerald-400 font-bold' : ''
            }`}
          >
            Home
            {currentTab === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('report')}
            className={`transition-all duration-150 relative py-1 cursor-pointer hover:text-white ${
              currentTab === 'report' ? 'text-emerald-400 font-bold' : ''
            }`}
          >
            Report Waste
            {currentTab === 'report' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('feed')}
            className={`transition-all duration-150 relative py-1 cursor-pointer hover:text-white flex items-center gap-1.5 ${
              currentTab === 'feed' ? 'text-emerald-400 font-bold' : ''
            }`}
          >
            <span>Live Map</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {currentTab === 'feed' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('feed')}
            className={`transition-all duration-150 relative py-1 cursor-pointer hover:text-white flex items-center gap-1.5 ${
              currentTab === 'feed' ? 'text-emerald-400 font-bold' : ''
            }`}
          >
            <span>Public Feed</span>
            {activeIssueCount > 0 && (
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-700/60 px-1.5 py-0.5 rounded-full font-mono-tabular">
                {activeIssueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('admin')}
            className={`transition-all duration-150 relative py-1 cursor-pointer hover:text-white ${
              currentTab === 'admin' ? 'text-emerald-400 font-bold' : ''
            }`}
          >
            Dispatch Impact
            {currentTab === 'admin' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Right Action: Clean Authentication (No demo accounts) */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[110px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] font-medium text-emerald-400">
                    {user.role}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5 duration-150"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden border-t border-slate-800/80 bg-slate-950 px-4 py-2 flex items-center justify-around text-xs font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('home')}
          className={`py-1 cursor-pointer ${currentTab === 'home' ? 'text-emerald-400 font-bold' : ''}`}
        >
          Home
        </button>
        <button
          onClick={() => onSelectTab('report')}
          className={`py-1 cursor-pointer ${currentTab === 'report' ? 'text-emerald-400 font-bold' : ''}`}
        >
          Report
        </button>
        <button
          onClick={() => onSelectTab('feed')}
          className={`py-1 cursor-pointer ${currentTab === 'feed' ? 'text-emerald-400 font-bold' : ''}`}
        >
          Live Map
        </button>
        <button
          onClick={() => onSelectTab('admin')}
          className={`py-1 cursor-pointer ${currentTab === 'admin' ? 'text-emerald-400 font-bold' : ''}`}
        >
          Dispatch
        </button>
      </div>
    </header>
  );
};

export default Navbar;
