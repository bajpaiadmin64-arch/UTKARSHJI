import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  uid: string;
  email: string;
  displayName: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  whatsApp?: string;
  companyName?: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, profile: Omit<UserProfile, 'uid' | 'createdAt'>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Exchange or validate stored token on application mount
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('ub_auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser({
              uid: data.user.uid,
              email: data.user.email,
              displayName: data.user.fullName
            });
            setUserProfile(data.user);
          } else {
            localStorage.removeItem('ub_auth_token');
          }
        } else {
          localStorage.removeItem('ub_auth_token');
        }
      } catch (err) {
        console.error('Session validation connection failed:', err);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (email: string, pass: string) => {
    if (!email || !pass) {
      throw new Error('Please enter both your email and password.');
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password: pass })
    });

    const data = await res.json();

    if (!res.ok) {
      // Throw exact backend messages like "Email not found." or "Incorrect password."
      throw new Error(data.error || 'Authentication failed.');
    }

    localStorage.setItem('ub_auth_token', data.token);
    setCurrentUser({
      uid: data.user.uid,
      email: data.user.email,
      displayName: data.user.fullName
    });
    setUserProfile(data.user);
  };

  const register = async (email: string, pass: string, profile: Omit<UserProfile, 'uid' | 'createdAt'>) => {
    if (!email || !pass || !profile.fullName || !profile.phone) {
      throw new Error('All mandatory fields must be filled.');
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password: pass,
        fullName: profile.fullName,
        phone: profile.phone,
        whatsApp: profile.whatsApp || '',
        companyName: profile.companyName || ''
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }

    localStorage.setItem('ub_auth_token', data.token);
    setCurrentUser({
      uid: data.user.uid,
      email: data.user.email,
      displayName: data.user.fullName
    });
    setUserProfile(data.user);
  };

  const signInWithGoogle = async () => {
    throw new Error('Google Sign-In is not configured. Please register with email & password.');
  };

  const logout = async () => {
    localStorage.removeItem('ub_auth_token');
    setCurrentUser(null);
    setUserProfile(null);
  };

  const activeUser = currentUser;

  const value = {
    currentUser: activeUser,
    userProfile,
    loading,
    isAdmin: activeUser?.email === 'bajpaiadmin64@gmail.com',
    login,
    register,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
