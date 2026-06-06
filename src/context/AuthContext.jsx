import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('procurement_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user token is still valid (could fetch /auth/me here if desired)
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('procurement_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('procurement_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>);

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API Utility
export const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('procurement_user');
  if (savedUser) {
    const { token } = JSON.parse(savedUser);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('procurement_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);