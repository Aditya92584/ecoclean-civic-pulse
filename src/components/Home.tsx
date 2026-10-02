import React from 'react';
import {
  ArrowRight,
  MapPin,
  Camera,
  Layers,
  Shield,
  LogIn,
  CheckCircle2,
  Sparkles,
  Bot,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HomeProps {
  onNavigate: (tab: 'report' | 'feed' | 'admin') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center overflow-hidden bg-slate-950 text-white selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Ambient Glow Animations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse duration-1000"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Visual Image Background with High-End Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=2000&q=85"
          alt="Clean Sustainable Modern City"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-15"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center flex flex-col items-center">
        
        {/* Animated Live Status Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md mb-8 shadow-lg shadow-emerald-500/5 animate-bounce">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide uppercase text-[11px] font-bold">
            Real-Time Civic Cleanliness Network Active
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-4 leading-[1.1]">
          Eco<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">Pulse</span>
        </h1>

        {/* Short Punchy Subtitle */}
        <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-medium">
          Detect, pinpoint, and resolve urban waste with live GPS tracking and computer vision AI dispatch.
        </p>

        {/* Primary Action Buttons Matrix (Only Buttons & Animations) */}
        <div className="w-full max-w-2xl space-y-4">
          
          {/* Main Hero Button with Animated Glow */}
          <button
            onClick={() => onNavigate('report')}
            className="group relative w-full py-4 sm:py-5 px-8 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none"></div>
            <Zap className="w-5 h-5 text-emerald-200 fill-emerald-200 animate-pulse" />
            <span>Report Waste Issue Now</span>
            <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <button
              onClick={() => onNavigate('feed')}
              className="py-3.5 px-6 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500/50 text-slate-100 hover:text-white font-bold text-sm rounded-xl transition-all duration-200 backdrop-blur-md flex items-center justify-center gap-2.5 shadow-md hover:shadow-emerald-500/10 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Explore Live GPS Map</span>
            </button>

            <button
              onClick={() => onNavigate('feed')}
              className="py-3.5 px-6 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500/50 text-slate-100 hover:text-white font-bold text-sm rounded-xl transition-all duration-200 backdrop-blur-md flex items-center justify-center gap-2.5 shadow-md hover:shadow-emerald-500/10 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Public Incident Feed</span>
            </button>
          </div>

          {/* Tertiary Interactive Quick Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={() => onNavigate('report')}
              className="py-3 px-4 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 hover:border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Vision Scan</span>
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className="py-3 px-4 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Dispatch Console</span>
            </button>

            {!isAuthenticated ? (
              <button
                onClick={openLoginModal}
                className="col-span-2 sm:col-span-1 py-3 px-4 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Civic Login</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('report')}
                className="col-span-2 sm:col-span-1 py-3 px-4 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{user?.name?.split(' ')[0]} (Active)</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Home;
