import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, scanAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authAPI.getCurrentUser());
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (authAPI.isLoggedIn()) {
      try {
        const res = await authAPI.getMe();
        if (res.user) {
          setUser(res.user);
          localStorage.setItem('leafscan_user', JSON.stringify(res.user));
          // Attempt offline queue sync
          scanAPI.processSyncQueue();
        }
      } catch (err) {
        console.warn('Could not refresh user profile:', err.message);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();

    const handleAuthChange = () => {
      setUser(authAPI.getCurrentUser());
    };

    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    setUser(res.user);
    scanAPI.processSyncQueue();
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register(name, email, password);
    setUser(res.user);
    scanAPI.processSyncQueue();
    return res;
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
