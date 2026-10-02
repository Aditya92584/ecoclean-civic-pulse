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
  Radio,
  Clock,
  Compass,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HomeProps {
  onNavigate: (tab: 'report' | 'feed' | 'admin') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-emerald-50/20 text-slate-900 selection:bg-emerald-500 selection:text-white px-3 sm:px-6">
      
      {/* Soft Ambient Glow (Light Emerald & Mint) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[650px] h-[400px] sm:h-[650px] bg-gradient-to-tr from-emerald-200/40 via-teal-100/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Clean Dotted Architectural Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#10b981_1.2px,transparent_1.2px)] [background-size:24px_24px] sm:[background-size:32px_32px] opacity-20 pointer-events-none"></div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl w-full mx-auto py-8 sm:py-16 text-center flex flex-col items-center">
        
        {/* Animated Live Status Badge (Light Emerald Pill) */}
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] sm:text-xs font-bold backdrop-blur-md mb-6 sm:mb-8 shadow-xs max-w-[95%]">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="tracking-wide uppercase font-bold truncate">
            Real-Time Civic Cleanliness Network Active
          </span>
        </div>

        {/* Main Headline (Crisp Dark & Vibrant Emerald) */}
        <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-3 sm:mb-4 leading-[1.12]">
          Eco<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">Pulse</span>
        </h1>

        {/* Short Punchy Subtitle */}
        <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium px-2">
          Detect, pinpoint, and resolve urban waste with live GPS satellite tracking and computer vision AI municipal dispatch.
        </p>

        {/* Primary Action Buttons Matrix */}
        <div className="w-full max-w-2xl space-y-3 sm:space-y-4">
          
          {/* Main Hero Button with Vibrant Gradient */}
          <button
            onClick={() => onNavigate('report')}
            className="group relative w-full py-3.5 sm:py-5 px-6 sm:px-8 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm sm:text-lg rounded-2xl shadow-xl shadow-emerald-700/25 hover:shadow-emerald-600/35 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none"></div>
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200 fill-emerald-200 animate-pulse shrink-0" />
            <span className="truncate">Report Waste Issue Now</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Secondary Action Buttons Grid (Clean White Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 pt-1">
            <button
              onClick={() => onNavigate('report')}
              className="py-3 sm:py-3.5 px-4 sm:px-6 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs hover:shadow-sm cursor-pointer min-h-[44px]"
            >
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pinpoint Waste on GPS</span>
            </button>

            <button
              onClick={() => onNavigate('feed')}
              className="py-3 sm:py-3.5 px-4 sm:px-6 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs hover:shadow-sm cursor-pointer min-h-[44px]"
            >
              <Layers className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Public Incident Feed</span>
            </button>
          </div>

          {/* Tertiary Interactive Quick Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1">
            <button
              onClick={() => onNavigate('report')}
              className="py-2.5 sm:py-3 px-3 sm:px-4 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 text-emerald-900 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer min-h-[40px] shadow-xs"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">AI Vision Scan</span>
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className="py-2.5 sm:py-3 px-3 sm:px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer min-h-[40px] shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">Dispatch Console</span>
            </button>

            {!isAuthenticated ? (
              <button
                onClick={openLoginModal}
                className="col-span-2 sm:col-span-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer min-h-[40px] shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Account Login</span>
              </button>
            ) : (
              <div className="col-span-2 sm:col-span-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{user?.name}</span>
              </div>
            )}
          </div>

        </div>

        {/* Feature Highlights Grid (Clean White Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl mt-10 pt-6 border-t border-slate-200/80 text-left">
          <div className="bg-white/80 backdrop-blur-xs border border-slate-200/80 p-3.5 rounded-xl shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
              <Compass className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Pinpoint GPS Accuracy</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Fine-tune incident markers with satellite mapping and colony search.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs border border-slate-200/80 p-3.5 rounded-xl shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-2">
              <Bot className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">AI Hazard Diagnosis</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Automatic photo classification, priority scoring, and crew dispatch advice.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs border border-slate-200/80 p-3.5 rounded-xl shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Municipal Verification</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Public tracking ticket lifecycle from triage to completed resolution.
            </p>
          </div>
        </div>

        {/* Subtle Creator Credit */}
        <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium">
          <span>Developed by</span>
          <span className="font-bold text-slate-700">Aditya Srivastava</span>
        </div>

      </div>
    </div>
  );
};

export default Home;
