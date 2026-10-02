import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, DEMO_USERS } from '../types/auth';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole, name?: string) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerAccount: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  loginAsDemo: (demoKey: 'citizen' | 'admin' | 'staff') => Promise<void>;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AUTH_STORAGE_KEY = 'ecoclean_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start as null (Guest / Public Viewer mode) so newly arrived users start with a clean slate
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Strict login with email and password verified against backend database
  const loginWithCredentials = async (email: string, password: string) => {
    const res = await api.loginUser({ email, password, loginMethod: 'Password' });
    if (res.user) {
      setUser(res.user);
      setIsLoginModalOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ecoclean:login-activity'));
      }
    }
  };

  // Strict registration that creates user in database
  const registerAccount = async (name: string, email: string, password: string, role: UserRole = 'Citizen') => {
    const res = await api.registerUser({ name, email, password, role });
    if (res.user) {
      setUser(res.user);
      setIsLoginModalOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ecoclean:login-activity'));
      }
    }
  };

  // Backwards compatible login
  const login = (email: string, role: UserRole, name?: string) => {
    const resolvedName = name || email.split('@')[0];
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: resolvedName,
      email,
      role
    };
    setUser(newUser);
    setIsLoginModalOpen(false);
  };

  // Demo login - ensures registered or logs into pre-registered demo account
  const loginAsDemo = async (demoKey: 'citizen' | 'admin' | 'staff') => {
    const demo = DEMO_USERS[demoKey];
    if (demo) {
      const demoPassword = demoKey === 'admin' ? 'admin123' : 'password123';
      try {
        // Attempt strict login first
        await loginWithCredentials(demo.email, demoPassword);
      } catch (err: any) {
        // If not registered yet in MongoDB, register it automatically
        try {
          await registerAccount(demo.name, demo.email, demoPassword, demo.role);
        } catch (regErr) {
          // Fallback to local session
          setUser(demo);
          setIsLoginModalOpen(false);
        }
      }
    }
  };

  const logout = () => {
    setUser(null);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithCredentials,
        registerAccount,
        loginAsDemo,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
