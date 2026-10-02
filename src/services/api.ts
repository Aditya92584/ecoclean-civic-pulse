import { Issue, IssueCategory, IssueSeverity, IssueStatus } from '../types/issue';
import { INITIAL_ISSUES } from '../data/seedData';

const LOCAL_STORAGE_KEY = 'ecoclean_local_issues_backup';

function getLocalBackup(): Issue[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Storage error', e);
  }
  return INITIAL_ISSUES;
}

function saveLocalBackup(issues: Issue[]) {
  try {
    const existing = getLocalBackup();
    const map = new Map<string, Issue>();
    existing.forEach((i) => map.set(i.id, i));
    issues.forEach((i) => map.set(i.id, i));
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export interface FetchIssuesParams {
  status?: string;
  severity?: string;
  category?: string;
  search?: string;
}

export const api = {
  async getIssues(params: FetchIssuesParams = {}): Promise<{ data: Issue[]; source: string }> {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'All') query.set('status', params.status);
      if (params.severity && params.severity !== 'All') query.set('severity', params.severity);
      if (params.category && params.category !== 'All') query.set('category', params.category);
      if (params.search) query.set('search', params.search);

      const res = await fetch(`/api/issues?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      
      // Save all fetched issues to local cache
      saveLocalBackup(json.data);

      return { data: json.data, source: json.source || 'api' };
    } catch (err) {
      console.warn('API fetch issues error, using local fallback:', err);
      let local = getLocalBackup();
      if (params.status && params.status !== 'All') local = local.filter((i) => i.status === params.status);
      if (params.severity && params.severity !== 'All') local = local.filter((i) => i.severity === params.severity);
      if (params.category && params.category !== 'All') local = local.filter((i) => i.category === params.category);
      if (params.search) {
        const q = params.search.toLowerCase();
        local = local.filter(
          (i) =>
            i.description.toLowerCase().includes(q) ||
            i.id.toLowerCase().includes(q) ||
            i.location.address.toLowerCase().includes(q)
        );
      }
      return { data: local, source: 'client-cache' };
    }
  },

  async createIssue(payload: {
    category: IssueCategory;
    description: string;
    severity: IssueSeverity;
    location: {
      lat: number;
      lng: number;
      address: string;
      landmark?: string;
    };
    photoUrl?: string;
    reporterName?: string;
    reporterPhone?: string;
  }): Promise<{ data: Issue; source: string }> {
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      
      // Immediately push to localStorage
      saveLocalBackup([json.data]);

      // Dispatch global window event so any listeners can refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ecoclean:issue-created', { detail: json.data }));
      }

      return { data: json.data, source: json.source || 'api' };
    } catch (err) {
      console.warn('API create issue error, falling back locally:', err);
      const uniqueId = `WASTE-2026-${Math.floor(100 + Math.random() * 900)}`;
      const nowIso = new Date().toISOString();
      const newIssue: Issue = {
        id: uniqueId,
        category: payload.category,
        description: payload.description,
        severity: payload.severity,
        status: 'Pending',
        location: payload.location,
        photoUrl: payload.photoUrl,
        reporterName: payload.reporterName || 'Anonymous Citizen',
        reporterPhone: payload.reporterPhone || '',
        createdAt: nowIso,
        updatedAt: nowIso,
        timeline: [
          {
            phase: 'Issue Reported',
            timestamp: nowIso,
            note: 'Civic complaint submitted with GPS location and photo evidence.',
            actor: payload.reporterName || 'Citizen'
          }
        ]
      };
      saveLocalBackup([newIssue]);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ecoclean:issue-created', { detail: newIssue }));
      }

      return { data: newIssue, source: 'client-offline' };
    }
  },

  async updateIssue(
    id: string,
    updates: {
      status?: IssueStatus;
      assignedWorker?: string;
      note?: string;
    }
  ): Promise<{ data: Issue; source: string }> {
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();

      saveLocalBackup([json.data]);
      return { data: json.data, source: json.source || 'api' };
    } catch (err) {
      console.warn('API update issue error, falling back locally:', err);
      const current = getLocalBackup();
      const idx = current.findIndex((i) => i.id === id);
      if (idx !== -1) {
        const item = { ...current[idx] };
        if (updates.status) item.status = updates.status;
        if (updates.assignedWorker !== undefined) item.assignedWorker = updates.assignedWorker;
        if (updates.status === 'Resolved') item.resolvedAt = new Date().toISOString();
        item.updatedAt = new Date().toISOString();
        if (updates.status) {
          item.timeline = [
            ...item.timeline,
            {
              phase:
                updates.status === 'Resolved'
                  ? 'Cleared & Resolved'
                  : updates.status === 'In-Progress'
                  ? 'Crew Dispatched'
                  : 'Triaged & Assigned',
              timestamp: new Date().toISOString(),
              note:
                updates.note ||
                (updates.assignedWorker
                  ? `Assigned to ${updates.assignedWorker}`
                  : `Status updated to ${updates.status}`),
              actor: 'Municipal Dispatch'
            }
          ];
        }
        current[idx] = item;
        saveLocalBackup([item]);
        return { data: item, source: 'client-offline' };
      }
      throw err;
    }
  },

  async deleteIssue(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/issues/${id}`, { method: 'DELETE' });
      const current = getLocalBackup().filter((i) => i.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
      return res.ok;
    } catch (e) {
      const current = getLocalBackup().filter((i) => i.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
      return true;
    }
  },

  async getStats() {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const json = await res.json();
        return json.stats;
      }
    } catch (e) {
      // Fallback calculation
    }
    const current = getLocalBackup();
    const total = current.length;
    const pending = current.filter((i) => i.status === 'Pending').length;
    const inProgress = current.filter((i) => i.status === 'In-Progress').length;
    const assigned = current.filter((i) => i.status === 'Assigned').length;
    const resolved = current.filter((i) => i.status === 'Resolved').length;
    return {
      total,
      pending,
      assigned,
      inProgress,
      activeCrewWork: assigned + inProgress,
      resolved,
      resolvedRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      activeWorkers: 8
    };
  },

  async recordLoginLog(entry: {
    email: string;
    name: string;
    role: string;
    loginMethod: string;
  }) {
    try {
      const res = await fetch('/api/auth/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      return await res.json();
    } catch (e) {
      console.warn('Login logging error:', e);
      return null;
    }
  },

  async getLoginLogs() {
    try {
      const res = await fetch('/api/auth/logs');
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.warn('Fetch login logs error:', e);
    }
    return [];
  },

  async registerUser(payload: { name: string; email: string; password: string; role?: string }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to register account.');
    }
    return {
      ...json,
      user: json.user || json.data
    };
  },

  async loginUser(payload: { email: string; password: string; loginMethod?: string }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to log in. Please check your credentials.');
    }
    return {
      ...json,
      user: json.user || json.data
    };
  },

  async analyzeWasteImage(imageBase64: string, mimeType: string = 'image/jpeg') {
    try {
      const res = await fetch('/api/ai/analyze-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType })
      });
      const json = await res.json();
      return json.data;
    } catch (e) {
      console.warn('AI analysis error:', e);
      return {
        waste_category: 'overflowing_bin',
        category_label: 'Overflowing Public Bin',
        severity: 'medium',
        urgency: 'routine',
        confidence_score: 0.9,
        detailed_description: 'Waste receptacle has exceeded volumetric capacity with miscellaneous debris encroaching onto pedestrian passage.',
        suggested_action: 'Dispatch collection crew to clear and disinfect zone.'
      };
    }
  },

  async reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }
    return {
      streetAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      areaLandmark: 'Municipal Zone'
    };
  },

  async getIpLocation() {
    try {
      const res = await fetch('/api/geocode/ip');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('IP location error:', e);
    }
    return {
      lat: 28.6139,
      lng: 77.2090,
      streetAddress: '14 Market Street, Sector 4',
      areaLandmark: 'Central Station Area'
    };
  }
};
