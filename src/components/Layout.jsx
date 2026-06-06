import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import TopNavbar from './TopNavbar.jsx';

// Protected Route Component
export const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-50">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    if (user.role === 'VENDOR') {
      return <Navigate to="/vendor-portal" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Layout Component
export const Layout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Absolute dark/blue gradient background for the header area */}
      <div className="absolute top-0 left-0 right-0 h-[340px] bg-slate-950 overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950"></div>
        {/* Abstract glowing shapes */}
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[140%] bg-blue-600/20 blur-[120px] rounded-full transform rotate-12"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[100%] bg-cyan-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute top-[20%] left-[20%] w-[100%] h-[5px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.5)] transform -rotate-6"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <TopNavbar />
        <main className="flex-1 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};