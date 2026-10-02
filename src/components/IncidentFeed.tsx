import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  User,
  ArrowRight,
  ExternalLink,
  X,
  Eye,
  RefreshCw,
  Calendar,
  Phone,
  ShieldCheck,
  ChevronRight,
  Truck,
  Image as ImageIcon,
  Layers,
  Sparkles
} from 'lucide-react';
import { Issue, IssueSeverity, IssueStatus } from '../types/issue';
import { api } from '../services/api';

interface IncidentFeedProps {
  onSelectIssueForAdmin?: (issueId: string) => void;
  onNavigateToReport?: () => void;
  selectedIdFromNav?: string | null;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  onSelectIssueForAdmin,
  onNavigateToReport,
  selectedIdFromNav
}) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Detail Modal State
  const [activeModalIssue, setActiveModalIssue] = useState<Issue | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch issues
  const loadIssues = async (overrideSelectedId?: string) => {
    setLoading(true);
    try {
      const res = await api.getIssues({
        status: selectedStatus,
        severity: selectedSeverity,
        category: selectedCategory,
        search: searchTerm
      });
      setIssues(res.data);

      const targetId = overrideSelectedId || selectedIdFromNav;
      if (targetId) {
        const found = res.data.find((i) => i.id === targetId);
        if (found) setActiveModalIssue(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedIdFromNav) {
      setSelectedStatus('All');
      setSelectedSeverity('All');
      setSelectedCategory('All');
      setSearchTerm('');
      loadIssues(selectedIdFromNav);
    } else {
      loadIssues();
    }
  }, [selectedIdFromNav, selectedStatus, selectedSeverity, selectedCategory]);

  // Listen for live new report creations
  useEffect(() => {
    const handleNewIssue = (e: any) => {
      const newIssue: Issue = e.detail;
      if (newIssue) {
        setIssues((prev) => {
          if (prev.some((i) => i.id === newIssue.id)) return prev;
          return [newIssue, ...prev];
        });
      }
    };

    window.addEventListener('ecoclean:issue-created', handleNewIssue);
    return () => window.removeEventListener('ecoclean:issue-created', handleNewIssue);
  }, []);

  const handleCardClick = (issue: Issue) => {
    setActiveModalIssue(issue);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadIssues();
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Resolved
          </span>
        );
      case 'In-Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            In-Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: IssueSeverity) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
            <Flame className="w-3.5 h-3.5" />
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3.5 h-3.5" />
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            Medium
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            Low
          </span>
        );
    }
  };

  const handleUpdateStatus = async (issueId: string, newStatus: IssueStatus) => {
    setUpdatingStatus(true);
    try {
      const updated = await api.updateIssue(issueId, {
        status: newStatus,
        note: `Status transitioned to ${newStatus} by field dispatch command.`
      });
      setIssues((prev) => prev.map((item) => (item.id === issueId ? updated.data : item)));
      setActiveModalIssue(updated.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full mb-2 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-Time Public Civic Feed
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Public Waste Incidents Feed
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Live public directory of reported municipal waste issues, dispatch progress, and cleanup tickets across city zones.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => loadIssues()}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-xs min-h-[42px] min-w-[42px] flex items-center justify-center"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          
          <button
            onClick={onNavigateToReport}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[42px]"
          >
            + Report New Issue
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-xs mb-8 space-y-3 sm:space-y-4">
        {/* Search Input Row */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Ticket ID, street address, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-xl pl-10 pr-20 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          {/* Status Filter (Scrollable on small mobile) */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl overflow-x-auto scrollbar-none max-w-full">
            {['All', 'Pending', 'In-Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedStatus === st
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            {/* Severity Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">Severity:</span>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="Low">Low / Routine</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer truncate"
              >
                <option value="All">All Types</option>
                <option value="Illegal Dumping">Illegal Dumping</option>
                <option value="Overflowing Bin">Overflowing Bin</option>
                <option value="Hazardous Chemical Waste">Chemical Waste</option>
                <option value="Biohazard / Medical Waste">Biohazard</option>
                <option value="Construction Debris">Construction</option>
                <option value="Plastic Accumulation">Plastic</option>
                <option value="Blocked Drainage">Blocked Drain</option>
                <option value="Electronic E-Waste">E-Waste</option>
              </select>
            </div>

            {(selectedStatus !== 'All' || selectedSeverity !== 'All' || selectedCategory !== 'All' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedStatus('All');
                  setSelectedSeverity('All');
                  setSelectedCategory('All');
                  setSearchTerm('');
                }}
                className="col-span-2 sm:col-span-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer text-center sm:text-left py-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count & Meta */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
        <span>
          Showing <strong className="text-slate-900 font-mono-tabular">{issues.length}</strong> active complaints
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Live GPS synchronized
        </span>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs animate-pulse space-y-4">
              <div className="h-4 bg-slate-100 rounded w-1/3"></div>
              <div className="h-36 bg-slate-100 rounded-xl"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No matching waste reports found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            There are no complaints matching your selected criteria. Try adjusting the search term or status filter, or submit a new report.
          </p>
          <button
            onClick={() => {
              setSelectedStatus('All');
              setSelectedSeverity('All');
              setSelectedCategory('All');
              setSearchTerm('');
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {issues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => handleCardClick(issue)}
              className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {issue.id}
                    </span>
                    {getSeverityBadge(issue.severity)}
                  </div>
                  {getStatusBadge(issue.status)}
                </div>

                {issue.photoUrl && (
                  <div className="relative h-44 rounded-xl overflow-hidden mb-3.5 bg-slate-100">
                    <img
                      src={issue.photoUrl}
                      alt={issue.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      Visual Evidence
                    </div>
                  </div>
                )}

                <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {issue.category}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed">
                  {issue.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">{issue.location.address}</span>
                    {issue.location.landmark && (
                      <span className="block text-[11px] text-slate-400">{issue.location.landmark}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(issue.createdAt).toLocaleDateString()}
                </span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Incident Details &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Incident Detail Modal */}
      {activeModalIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  {activeModalIssue.category.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular text-xs font-bold text-slate-500">{activeModalIssue.id}</span>
                    {getSeverityBadge(activeModalIssue.severity)}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">{activeModalIssue.category}</h2>
                </div>
              </div>
              <button
                onClick={() => setActiveModalIssue(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeModalIssue.photoUrl && (
              <div className="rounded-2xl overflow-hidden max-h-72 bg-slate-100">
                <img
                  src={activeModalIssue.photoUrl}
                  alt={activeModalIssue.category}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Issue Description</span>
              <p className="text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {activeModalIssue.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-semibold block mb-1">Incident Location</span>
                <div className="font-bold text-slate-900">{activeModalIssue.location.address}</div>
                {activeModalIssue.location.landmark && (
                  <div className="text-slate-500 mt-0.5">{activeModalIssue.location.landmark}</div>
                )}
                <div className="text-emerald-700 font-mono text-[11px] mt-1">
                  GPS: {activeModalIssue.location.lat.toFixed(4)}, {activeModalIssue.location.lng.toFixed(4)}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-semibold block mb-1">Reporter & Dispatch Status</span>
                <div className="font-bold text-slate-900">{activeModalIssue.reporterName || 'Anonymous Citizen'}</div>
                <div className="mt-1">{getStatusBadge(activeModalIssue.status)}</div>
              </div>
            </div>

            {/* Transition Status Controls */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500">Update Incident Lifecycle:</span>
              <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
                {(['Pending', 'In-Progress', 'Resolved'] as IssueStatus[]).map((st) => (
                  <button
                    key={st}
                    disabled={updatingStatus || activeModalIssue.status === st}
                    onClick={() => handleUpdateStatus(activeModalIssue.id, st)}
                    className={`py-2 px-2.5 text-center text-xs font-bold rounded-lg transition-colors cursor-pointer min-h-[38px] flex items-center justify-center ${
                      activeModalIssue.status === st
                        ? 'bg-slate-800 text-white opacity-80 cursor-default'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    Set {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentFeed;
