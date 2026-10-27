import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore authenticated session on page refresh
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await api.get('/api/auth/me');
        if (res && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        // Not logged in or session expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res && res.user) {
        setUser(res.user);
        return res;
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
      throw err;
    }
  };

  const signup = async ({ name, email, password, confirmPassword }) => {
    setAuthError(null);
    try {
      const res = await api.post('/api/auth/signup', {
        name,
        email,
        password,
        confirmPassword,
      });
      return res;
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout notification error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (name) => {
    try {
      const res = await api.put('/api/auth/profile', { name });
      if (res && res.user) {
        setUser(res.user);
        return res;
      }
    } catch (err) {
      throw err;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    loading,
    authError,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
