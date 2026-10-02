import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  MapPin,
  Map as MapIcon,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Truck,
  X,
  FileCheck
} from 'lucide-react';
import { Issue, IssueStatus, IssueSeverity, WorkerSquad } from '../types/issue';
import { LoginLogEntry } from '../types/auth';
import { WORKER_SQUADS } from '../data/seedData';
import { api } from '../services/api';

interface AdminDashboardProps {
  onNavigateToFeed?: () => void;
  onNavigateToReport?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToFeed,
  onNavigateToReport
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'incidents' | 'logins'>('incidents');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [workerFilter, setWorkerFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Login Activity Audit State
  const [loginLogs, setLoginLogs] = useState<LoginLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logRoleFilter, setLogRoleFilter] = useState('All');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Map Preview View state
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedMapPin, setSelectedMapPin] = useState<Issue | null>(null);

  // Detail Modal for quick inspect
  const [inspectIssue, setInspectIssue] = useState<Issue | null>(null);

  // Load issues
  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await api.getIssues({
        status: statusFilter,
        severity: severityFilter,
        search: searchQuery
      });
      setIssues(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load login activity logs from MongoDB
  const fetchLoginLogs = async () => {
    setLoadingLogs(true);
    try {
      const logs = await api.getLoginLogs();
      setLoginLogs(logs);
    } catch (e) {
      console.error('Failed to fetch login logs', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [statusFilter, severityFilter]);

  useEffect(() => {
    fetchLoginLogs();

    // Auto-refresh when login activity event fires
    const handleLoginEvent = () => {
      fetchLoginLogs();
    };

    window.addEventListener('ecoclean:login-activity', handleLoginEvent);
    return () => window.removeEventListener('ecoclean:login-activity', handleLoginEvent);
  }, []);

  // Temporary feedback alert
  const showNotification = (text: string) => {
    setFeedbackMsg({ text, type: 'success' });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Instant Status Update Handler (Requirement in Step 3)
  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    try {
      const res = await api.updateIssue(issueId, { status: newStatus });
      setIssues((prev) =>
        prev.map((item) => (item.id === issueId ? res.data : item))
      );
      showNotification(`Incident ${issueId} status transitioned to "${newStatus}".`);
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  // Instant Worker Assignment Handler (Requirement in Step 3)
  const handleWorkerAssign = async (issueId: string, workerName: string) => {
    try {
      const isUnassigning = workerName === 'Unassigned' || !workerName;
      const res = await api.updateIssue(issueId, {
        assignedWorker: isUnassigning ? '' : workerName,
        status: isUnassigning ? 'Pending' : 'Assigned'
      });
      setIssues((prev) =>
        prev.map((item) => (item.id === issueId ? res.data : item))
      );
      showNotification(
        isUnassigning
          ? `Incident ${issueId} unassigned and returned to Pending.`
          : `Assigned ${workerName} to incident ${issueId}.`
      );
    } catch (err) {
      console.error('Worker assignment failed', err);
    }
  };

  // Delete/Archive handler
  const handleDeleteIssue = async (issueId: string) => {
    if (!window.confirm(`Are you sure you want to remove incident record ${issueId}?`)) return;
    try {
      await api.deleteIssue(issueId);
      setIssues((prev) => prev.filter((i) => i.id !== issueId));
      showNotification(`Incident ${issueId} has been archived.`);
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  // Derived stats
  const totalCount = issues.length;
  const pendingCount = issues.filter((i) => i.status === 'Pending').length;
  const assignedCount = issues.filter((i) => i.status === 'Assigned').length;
  const inProgressCount = issues.filter((i) => i.status === 'In-Progress').length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;
  const activeWorkersCount = WORKER_SQUADS.filter((w) => w.status === 'Active').length;

  // Filtered issues by worker
  const displayedIssues = issues.filter((issue) => {
    if (workerFilter !== 'All') {
      if (workerFilter === 'Unassigned') {
        if (issue.assignedWorker) return false;
      } else if (!issue.assignedWorker?.includes(workerFilter)) {
        return false;
      }
    }
    return true;
  });

  // Filtered login activity logs
  const displayedLoginLogs = loginLogs.filter((log) => {
    if (logRoleFilter !== 'All' && log.role !== logRoleFilter) return false;
    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase();
      return (
        log.name?.toLowerCase().includes(q) ||
        log.email?.toLowerCase().includes(q) ||
        log.role?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Admin Branding Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Municipal Waste Command & Dispatch Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Environmental Operations
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Dispatch triage, field squad allocation, and live municipal waste lifecycle governance.
          </p>
        </div>

        {/* Global Control Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMapModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <MapIcon className="w-4 h-4 text-emerald-600" />
            Spatial Map View ({issues.length})
          </button>
          
          <button
            onClick={() => fetchIssues()}
            className="p-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={onNavigateToReport}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            + New Incident
          </button>
        </div>
      </div>

      {/* Floating Feedback Notification */}
      {feedbackMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Stat Cards (White & Green Theme with trend indicators) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Stat 1: Total Complaints */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Complaints</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono-tabular">
              {totalCount}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +18% this month
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {resolvedCount} resolved · {totalCount - resolvedCount} active in queue
          </p>
        </div>

        {/* Stat 2: Pending Issues */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Pending Issues</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono-tabular">
              {pendingCount}
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              Awaiting Triage
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Requires crew assignment & priority verification
          </p>
        </div>

        {/* Stat 3: Resolved Today */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Resolved Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono-tabular">
              {resolvedCount}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +15% vs yesterday
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}% municipal clearance success rate
          </p>
        </div>

        {/* Stat 4: Active Workers */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Active Field Squads</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono-tabular">
              {activeWorkersCount}
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
              {WORKER_SQUADS.length} Squads Total
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {inProgressCount + assignedCount} operations actively in progress
          </p>
        </div>

      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveAdminTab('incidents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeAdminTab === 'incidents'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Waste Incidents Registry ({issues.length})
        </button>

        <button
          onClick={() => {
            setActiveAdminTab('logins');
            fetchLoginLogs();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeAdminTab === 'logins'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Login & Security Activity ({loginLogs.length})
        </button>
      </div>

      {activeAdminTab === 'incidents' ? (
        <>
          {/* Table Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-6 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search table by ID, category, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchIssues()}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Selectors */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                {/* Severity Filter */}
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                {/* Squad Filter */}
                <select
                  value={workerFilter}
                  onChange={(e) => setWorkerFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="All">All Assigned Crews</option>
                  <option value="Unassigned">Unassigned Only</option>
                  {WORKER_SQUADS.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name.split('(')[0]}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setSeverityFilter('All');
                    setWorkerFilter('All');
                    setSearchQuery('');
                    fetchIssues();
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-medium px-2 py-1 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Main Admin Data Table (Step 3 specification) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Ref ID & Photo</th>
                    <th className="py-3 px-4">Category & Details</th>
                    <th className="py-3 px-4">Location & Map</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Update Status</th>
                    <th className="py-3 px-4">Staff Assignment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-2" />
                        Loading municipal incident registry...
                      </td>
                    </tr>
                  ) : displayedIssues.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        No issues matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    displayedIssues.map((issue) => {
                      return (
                        <tr
                          key={issue.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Column 1: ID & Photo Thumbnail */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {issue.photoUrl ? (
                                <img
                                  src={issue.photoUrl}
                                  alt={issue.category}
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer"
                                  onClick={() => setInspectIssue(issue)}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-[10px]">
                                  GPS
                                </div>
                              )}
                              <div>
                                <span className="font-mono-tabular font-bold text-slate-900 block">
                                  {issue.id}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(issue.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Category & Description */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-slate-900">
                              {issue.category}
                            </div>
                            <p className="text-slate-500 text-[11px] truncate max-w-[240px] mt-0.5">
                              {issue.description}
                            </p>
                          </td>

                          {/* Column 3: Location & Coordinates */}
                          <td className="py-3.5 px-4 max-w-[200px]">
                            <div className="flex items-center gap-1.5 text-slate-800 font-medium truncate">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{issue.location.address}</span>
                            </div>
                            <div className="text-[10px] font-mono-tabular text-slate-400 mt-0.5">
                              {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}
                            </div>
                          </td>

                          {/* Column 4: Severity Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {issue.severity === 'Critical' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Critical
                              </span>
                            )}
                            {issue.severity === 'High' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                                High
                              </span>
                            )}
                            {issue.severity === 'Medium' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                Medium
                              </span>
                            )}
                            {issue.severity === 'Low' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                                Low
                              </span>
                            )}
                          </td>

                          {/* Column 5: Dropdown selector to INSTANTLY update complaint status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="relative inline-block w-36">
                              <select
                                value={issue.status}
                                onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                                className={`w-full appearance-none rounded-lg px-2.5 py-1.5 text-xs font-semibold border cursor-pointer transition-colors pr-6 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                                  issue.status === 'Resolved'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : issue.status === 'In-Progress'
                                    ? 'bg-teal-50 text-teal-800 border-teal-300'
                                    : issue.status === 'Assigned'
                                    ? 'bg-sky-50 text-sky-800 border-sky-300'
                                    : 'bg-amber-50 text-amber-800 border-amber-300'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In-Progress">In-Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                            </div>
                          </td>

                          {/* Column 6: Staff Assignment Dropdown */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="relative inline-block w-48">
                              <select
                                value={issue.assignedWorker || 'Unassigned'}
                                onChange={(e) => handleWorkerAssign(issue.id, e.target.value)}
                                className="w-full appearance-none bg-white border border-slate-300 text-slate-800 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer pr-6"
                              >
                                <option value="Unassigned">Unassigned (Queue)</option>
                                {WORKER_SQUADS.map((squad) => (
                                  <option key={squad.id} value={squad.name}>
                                    {squad.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                            </div>
                          </td>

                          {/* Column 7: Quick Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectIssue(issue)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Inspect Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteIssue(issue.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Archive Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Login & Security Activity Table (User Audit / Tracking) */
        <>
          {/* Audit Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-6 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search user or email */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search audit trail by name, email, or role..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Role filter & Refresh */}
              <div className="flex items-center gap-2">
                <select
                  value={logRoleFilter}
                  onChange={(e) => setLogRoleFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="All">All User Roles</option>
                  <option value="Citizen">Citizen Logins</option>
                  <option value="Admin">Admin Sessions</option>
                  <option value="Sanitation Staff">Staff Logins</option>
                </select>

                <button
                  onClick={() => fetchLoginLogs()}
                  className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer"
                  title="Refresh Audit Logs"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Audit Activity Data Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Live MongoDB Collection: <code className="text-emerald-700 font-mono">LoginLog</code></span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono-tabular">
                {displayedLoginLogs.length} audit records logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">User & Identity</th>
                    <th className="py-3 px-4">Platform Role</th>
                    <th className="py-3 px-4">Authentication Method</th>
                    <th className="py-3 px-4">Login Timestamp</th>
                    <th className="py-3 px-4">Client / IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-2" />
                        Fetching MongoDB LoginLog audit trail...
                      </td>
                    </tr>
                  ) : displayedLoginLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-500">
                        No login activity recorded matching current filters.
                      </td>
                    </tr>
                  ) : (
                    displayedLoginLogs.map((log, idx) => {
                      const logDate = new Date(log.timestamp);
                      const timeAgo = Math.max(0, Math.floor((Date.now() - logDate.getTime()) / 60000));
                      const timeAgoStr =
                        timeAgo < 1
                          ? 'Just now'
                          : timeAgo < 60
                          ? `${timeAgo}m ago`
                          : `${Math.floor(timeAgo / 60)}h ago`;

                      return (
                        <tr key={log._id || log.id || idx} className="hover:bg-slate-50/70 transition-colors">
                          {/* User Name & Email */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                                {log.name ? log.name.charAt(0) : log.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {log.name || 'User'}
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono-tabular">
                                  {log.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {log.role === 'Admin' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Admin
                              </span>
                            ) : log.role === 'Sanitation Staff' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                                Staff
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                Citizen
                              </span>
                            )}
                          </td>

                          {/* Method */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              {log.loginMethod || 'Authentication'}
                            </span>
                          </td>

                          {/* Timestamp */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">
                              {timeAgoStr}
                            </div>
                            <div className="text-[11px] font-mono-tabular text-slate-400">
                              {logDate.toLocaleString()}
                            </div>
                          </td>

                          {/* Client / IP */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono-tabular text-slate-600 text-[11px] block">
                              IP: {log.ipAddress || '127.0.0.1'}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-xs block">
                              {log.userAgent ? log.userAgent.split(' ')[0] : 'Web Client'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Spatial Map View Modal (Requirement in Step 3) */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Map Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <MapIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Municipal Geographic Incident Grid
                  </h3>
                  <p className="text-xs text-slate-500">
                    Interactive coordinate map showing all reported waste hotspots and response status.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMapModal(false);
                  setSelectedMapPin(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Interactive Vector Map Canvas */}
            <div className="relative flex-1 min-h-[420px] bg-slate-100 p-6 overflow-hidden">
              {/* Grid backdrop */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]"></div>
              
              {/* Simulated Map Road Network & River */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <path d="M 0 150 Q 250 180 500 130 T 1000 200" fill="none" stroke="#0ea5e9" strokeWidth="18" />
                <line x1="120" y1="0" x2="120" y2="600" stroke="#94a3b8" strokeWidth="4" />
                <line x1="380" y1="0" x2="380" y2="600" stroke="#94a3b8" strokeWidth="4" />
                <line x1="680" y1="0" x2="680" y2="600" stroke="#94a3b8" strokeWidth="4" />
                <line x1="0" y1="120" x2="1000" y2="120" stroke="#94a3b8" strokeWidth="3" />
                <line x1="0" y1="280" x2="1000" y2="280" stroke="#94a3b8" strokeWidth="4" />
                <line x1="0" y1="420" x2="1000" y2="420" stroke="#94a3b8" strokeWidth="3" />
              </svg>

              {/* Pins Plotted according to Coordinates */}
              <div className="relative w-full h-full">
                {issues.map((issue, idx) => {
                  // Project lat/lng to percentage within container
                  // Seed base roughly centered around 37.77 / -122.41
                  const offsetX = ((issue.location.lng - (-122.45)) / 0.08) * 80 + 10;
                  const offsetY = ((37.80 - issue.location.lat) / 0.06) * 75 + 15;
                  
                  const isCritical = issue.severity === 'Critical';
                  const isResolved = issue.status === 'Resolved';
                  const isSelected = selectedMapPin?.id === issue.id;

                  return (
                    <div
                      key={issue.id}
                      style={{
                        left: `${Math.max(5, Math.min(90, offsetX))}%`,
                        top: `${Math.max(5, Math.min(85, offsetY))}%`
                      }}
                      onClick={() => setSelectedMapPin(issue)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-20 ${
                        isSelected ? 'scale-125 z-30' : ''
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
                          isResolved
                            ? 'bg-emerald-600 text-white'
                            : isCritical
                            ? 'bg-rose-600 text-white animate-bounce'
                            : issue.status === 'In-Progress'
                            ? 'bg-teal-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                        title={`${issue.id} - ${issue.category}`}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Pin Detail Popup */}
              {selectedMapPin && (
                <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-40 animate-in slide-in-from-bottom-2">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {selectedMapPin.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {selectedMapPin.id}
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedMapPin(null)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                    {selectedMapPin.description}
                  </p>

                  <div className="text-[11px] text-slate-500 mb-3 space-y-0.5">
                    <div>
                      <strong>Location:</strong> {selectedMapPin.location.address}
                    </div>
                    <div>
                      <strong>Assigned:</strong> {selectedMapPin.assignedWorker || 'Unassigned'}
                    </div>
                    <div>
                      <strong>Status:</strong> {selectedMapPin.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setInspectIssue(selectedMapPin);
                        setShowMapModal(false);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Inspect Full Record
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Map Legend Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span> Pending Triage
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-teal-600"></span> In-Progress
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Resolved
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span> Critical HAZMAT
                </span>
              </div>
              <span className="font-mono-tabular text-slate-400">
                Lat range: 37.75° – 37.80° N
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Single Issue Modal */}
      {inspectIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {inspectIssue.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Incident Record: {inspectIssue.id}
                </h3>
              </div>
              <button
                onClick={() => setInspectIssue(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inspectIssue.photoUrl && (
              <img
                src={inspectIssue.photoUrl}
                alt={inspectIssue.category}
                className="w-full h-48 object-cover rounded-xl border border-slate-200 mb-4"
              />
            )}

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold block text-slate-900 mb-1">Description</span>
                <p>{inspectIssue.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-500 block">Address</span>
                  <span className="font-medium">{inspectIssue.location.address}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-500 block">Severity</span>
                  <span className="font-bold text-emerald-700">{inspectIssue.severity}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-500 block mb-1">Reporter</span>
                <span>{inspectIssue.reporterName || 'Anonymous'}</span>
                {inspectIssue.reporterPhone && <span className="ml-2 text-slate-400">({inspectIssue.reporterPhone})</span>}
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-2">Timeline Logs</span>
                <div className="space-y-2 border-l-2 border-emerald-300 pl-3">
                  {inspectIssue.timeline.map((t, idx) => (
                    <div key={idx}>
                      <div className="font-bold text-slate-800">{t.phase}</div>
                      <div className="text-[11px] text-slate-500">{t.note}</div>
                      <div className="text-[10px] text-slate-400">{new Date(t.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectIssue(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
