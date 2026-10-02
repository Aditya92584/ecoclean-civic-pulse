export type IssueCategory =
  | 'Illegal Dumping'
  | 'Overflowing Bin'
  | 'Hazardous Chemical Waste'
  | 'Biohazard / Medical Waste'
  | 'Construction Debris'
  | 'Plastic Accumulation'
  | 'Blocked Drainage'
  | 'Electronic E-Waste';

export type IssueStatus = 'Pending' | 'Assigned' | 'In-Progress' | 'Resolved';

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TimelineEntry {
  phase: string;
  timestamp: string;
  note?: string;
  actor?: string;
}

export interface IssueLocation {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
}

export interface Issue {
  _id?: string;
  id: string;
  category: IssueCategory;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  location: IssueLocation;
  photoUrl?: string;
  assignedWorker?: string;
  reporterName?: string;
  reporterPhone?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  timeline: TimelineEntry[];
}

export interface WorkerSquad {
  id: string;
  name: string;
  role: string;
  zone: string;
  status: 'Active' | 'On Route' | 'Off Duty';
  contact: string;
}
