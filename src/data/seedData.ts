import { Issue, WorkerSquad } from '../types/issue';

export const WORKER_SQUADS: WorkerSquad[] = [
  {
    id: 'w-alpha',
    name: 'Eco Squad Alpha (Marcus Vance)',
    role: 'Heavy Mechanical Clearance',
    zone: 'North Riverfront & Metro Hub',
    status: 'Active',
    contact: '+1 (555) 234-8810'
  },
  {
    id: 'w-beta',
    name: 'Green Route 4 (Elena Rostova)',
    role: 'Municipal Bin Operations',
    zone: 'Downtown Commercial Sector',
    status: 'Active',
    contact: '+1 (555) 349-1122'
  },
  {
    id: 'w-gamma',
    name: 'Biohazard & Chem Response (Dr. David Kim)',
    role: 'Hazardous Materials & Containment',
    zone: 'Citywide Rapid Response',
    status: 'Active',
    contact: '+1 (555) 781-4490'
  },
  {
    id: 'w-delta',
    name: 'Rapid Cleanup Patrol (Sofia Morales)',
    role: 'Street Drainage & Plastic Sweep',
    zone: 'South Waterfront & Parks',
    status: 'On Route',
    contact: '+1 (555) 602-9931'
  },
  {
    id: 'w-epsilon',
    name: 'Industrial Debris Unit (Tariq Al-Mansoor)',
    role: 'Construction & Rubble Hauling',
    zone: 'East Industrial Corridor',
    status: 'Off Duty',
    contact: '+1 (555) 418-7729'
  }
];

// Starts empty with ZERO pre-seeded mock complaints so fresh users start with a clean slate
export const INITIAL_ISSUES: Issue[] = [];

// Sample templates for the "Fill Sample Report" quick-fill button
export const SAMPLE_REPORT_TEMPLATES = [
  {
    category: 'Overflowing Public Bin',
    severity: 'Routine',
    description: 'Municipal waste receptacle at capacity or bags spilling onto sidewalk near bus shelter. Strong odor starting to develop.',
    location: {
      address: '14 Market Street, Sector 4',
      landmark: 'Near Metro Gate 2, Central Market',
      lat: 28.6139,
      lng: 77.2090
    },
    reporterName: 'Sunil Verma',
    reporterPhone: '+91 98765 43210'
  },
  {
    category: 'Illegal Dumping',
    severity: 'Moderate',
    description: 'Bulk construction drywall and discarded plastic packaging piled on public sidewalk blocking pedestrian movement.',
    location: {
      address: '88 Ring Road, Near Flyover',
      landmark: 'Beside Community Park Boundary Wall',
      lat: 28.6280,
      lng: 77.2180
    },
    reporterName: 'Priya Sharma',
    reporterPhone: '+91 98111 22334'
  },
  {
    category: 'Hazardous Chemical Waste',
    severity: 'Urgent',
    description: 'Leaking industrial chemical drums with pungent chemical vapors. Spilling into roadside stormwater drain.',
    location: {
      address: 'Plot 42, Industrial Area Phase II',
      landmark: 'Opposite Substation Gate 3',
      lat: 28.5800,
      lng: 77.2300
    },
    reporterName: 'Rajesh Gupta',
    reporterPhone: '+91 99887 66554'
  }
];
