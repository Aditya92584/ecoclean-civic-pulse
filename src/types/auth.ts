export type UserRole = 'Citizen' | 'Admin' | 'Sanitation Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  squad?: string;
}

export interface LoginLogEntry {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  loginMethod: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export const DEMO_USERS: Record<string, User> = {
  citizen: {
    id: 'usr-cit-01',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@civic.org',
    role: 'Citizen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
  },
  admin: {
    id: 'usr-adm-01',
    name: 'Elena Rostova',
    email: 'elena.rostova@ecoclean.gov',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
  },
  staff: {
    id: 'usr-stf-01',
    name: 'Marcus Vance',
    email: 'marcus.vance@dispatch.ecoclean.gov',
    role: 'Sanitation Staff',
    squad: 'Eco Squad Alpha',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
  }
};
