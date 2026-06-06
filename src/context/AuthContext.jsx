import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  // AUTH BYPASSED — mock admin user always logged in (re-enable later)
  const [user, setUser] = useState({
    _id: 'mock-admin-id',
    name: 'Admin User',
    email: 'admin@procurement.com',
    role: 'ADMIN',
    token: 'mock-token'
  });
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { /* auth bypass active */ }, []);

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
    // AUTH BYPASSED — 401 redirect disabled
    // if (error.response && error.response.status === 401) {
    //   localStorage.removeItem('procurement_user');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);