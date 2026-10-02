import React, { useState, useEffect } from 'react';
import {
  LogIn,
  LogOut,
  User as UserIcon,
  Truck,
  Leaf,
  Layers,
  MapPin,
  Sparkles,
  Zap,
  Home as HomeIcon,
  PlusCircle,
  Shield,
  Activity
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
    // Fetch stats to display the count in Public Feed
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
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 text-white w-full">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-16 flex items-center justify-between gap-2">
          
          {/* Brand: "EcoPulse" with Neon Emerald Accent */}
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2 group cursor-pointer shrink-0 text-left"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                Eco<span className="text-emerald-400">Pulse</span>
              </span>
              <span className="block text-[8px] sm:text-[9px] uppercase tracking-widest font-bold text-slate-400 -mt-0.5 sm:-mt-1">
                Civic Cleanliness
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-xs sm:text-sm font-semibold text-slate-300">
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

          {/* Right Action: Authentication Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <div className="flex items-center gap-1.5 py-1 px-2 sm:py-1.5 sm:px-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-emerald-600 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left max-w-[80px] sm:max-w-[110px]">
                    <div className="text-[11px] sm:text-xs font-bold text-white truncate">
                      {user.name}
                    </div>
                    <div className="hidden xs:block text-[9px] sm:text-[10px] font-medium text-emerald-400 truncate">
                      {user.role}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In / Register</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Top Sub-Navigation (Fast Tab Access) */}
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/98 px-2 py-1.5 flex items-center justify-around text-xs font-medium text-slate-400 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onSelectTab('home')}
            className={`min-h-[38px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'home' ? 'text-emerald-400 font-bold bg-slate-900' : 'hover:text-slate-200'
            }`}
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => onSelectTab('report')}
            className={`min-h-[38px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'report' ? 'text-emerald-400 font-bold bg-slate-900' : 'hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Report</span>
          </button>
          
          <button
            onClick={() => onSelectTab('feed')}
            className={`min-h-[38px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'feed' ? 'text-emerald-400 font-bold bg-slate-900' : 'hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>Live Map</span>
          </button>
          
          <button
            onClick={() => onSelectTab('admin')}
            className={`min-h-[38px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'admin' ? 'text-emerald-400 font-bold bg-slate-900' : 'hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Dispatch</span>
          </button>
        </div>
      </header>
    </>
  );
};

export default Navbar;
