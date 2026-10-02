/**
 * EcoPulse: Smart Civic Waste & Incident Dispatch
 * Built with React, Tailwind CSS, Node.js Express & Authentication
 */

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ReportIssue from './components/ReportIssue';
import IncidentFeed from './components/IncidentFeed';
import AdminDashboard from './components/AdminDashboard';
import LoginModal from './components/LoginModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShieldAlert, Shield, ArrowRight, LogIn } from 'lucide-react';

function MainLayout() {
  const { user, openLoginModal } = useAuth();
  
  // Default to 'home' for the new unique animated homepage!
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedFeedIssueId, setSelectedFeedIssueId] = useState<string | null>(null);

  const handleReportSubmitted = (issueId: string) => {
    setSelectedFeedIssueId(issueId);
  };

  const handleNavigateToFeed = () => {
    setCurrentTab('feed');
  };

  const handleNavigateToReport = () => {
    setCurrentTab('report');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Bar Navigation with Auth controls */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'feed') setSelectedFeedIssueId(null);
        }}
      />

      {/* Main View Container */}
      <main className="flex-1 bg-slate-50/50 text-slate-800">
        {/* Unique Simple Animated Homepage */}
        {currentTab === 'home' && (
          <Home
            onNavigate={(tab) => {
              setCurrentTab(tab);
              if (tab !== 'feed') setSelectedFeedIssueId(null);
            }}
          />
        )}

        {/* Report Issue View */}
        {currentTab === 'report' && (
          <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50">
            <ReportIssue
              onReportSubmitted={handleReportSubmitted}
              onNavigateToFeed={handleNavigateToFeed}
            />
          </div>
        )}

        {/* Incident Feed View */}
        {currentTab === 'feed' && (
          <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50">
            <IncidentFeed
              selectedIdFromNav={selectedFeedIssueId}
              onNavigateToReport={handleNavigateToReport}
            />
          </div>
        )}

        {/* Admin Dashboard (Protected by Role) */}
        {currentTab === 'admin' && (
          <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50">
            {user?.role === 'Admin' ? (
              <AdminDashboard
                onNavigateToFeed={handleNavigateToFeed}
                onNavigateToReport={handleNavigateToReport}
              />
            ) : (
              /* Role Gate if not Admin */
              <div className="max-w-md mx-auto py-20 px-4 text-center">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Admin Access Required
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
                    The municipal dispatch console is restricted to registered city administrators.
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={openLoginModal}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In to Authorized Admin Account
                    </button>

                    <button
                      onClick={() => setCurrentTab('home')}
                      className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Return to Homepage
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Auth Modal */}
      <LoginModal />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
