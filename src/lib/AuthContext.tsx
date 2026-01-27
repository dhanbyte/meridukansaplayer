"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: any;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      const loginStatus = localStorage.getItem('isLoggedIn');
      const userData = localStorage.getItem('user') || localStorage.getItem('currentUser');
      if (loginStatus === 'true' && userData) {
        try {
          setIsLoggedIn(true);
          setUser(JSON.parse(userData));
        } catch (e) {
          // Invalid JSON in storage, clear it
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          localStorage.removeItem('currentUser');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setUser(data.user);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please check your connection.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
  };

  const updateUser = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
