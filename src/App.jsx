import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Layout, ProtectedRoute } from './components/Layout.jsx';

// Pages
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Vendors from './pages/Vendors.jsx';
import RFQs from './pages/RFQs.jsx';
import QuotationComparison from './pages/QuotationComparison.jsx';
import Quotations from './pages/Quotations.jsx';
import PurchaseOrders from './pages/PurchaseOrders.jsx';
import PODetail from './pages/PODetail.jsx';
import Invoices from './pages/Invoices.jsx';
import Payments from './pages/Payments.jsx';
import Reports from './pages/Reports.jsx';
import Register from './pages/Register.jsx';
import UserManagement from './pages/UserManagement.jsx';
import VendorPortal from './pages/VendorPortal.jsx';
import ActivityLogs from './pages/ActivityLogs.jsx';
import Approvals from './pages/Approvals.jsx';

const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
    <p className="text-slate-500 mt-2">This module is coming soon in Phase 5.</p>
  </div>
);

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'VENDOR') return <Navigate to="/vendor-portal" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const IndexRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'VENDOR') return <Navigate to="/vendor-portal" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            
            {/* Procurement Staff / Admin Routes */}
            <Route element={<ProtectedRoute roles={['USER', 'MANAGER', 'ADMIN']} />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/rfqs" element={<RFQs />} />
                <Route path="/rfqs/:rfqId/compare" element={<QuotationComparison />} />
                <Route path="/quotations" element={<Quotations />} />
                <Route path="/approvals" element={<Approvals />} />
                <Route path="/pos" element={<PurchaseOrders />} />
                <Route path="/pos/:id" element={<PODetail />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/activity-logs" element={<ActivityLogs />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/profile" element={<Placeholder title="User Profile" />} />
              </Route>
            </Route>

            {/* Vendor Portal Routes */}
            <Route element={<ProtectedRoute roles={['VENDOR']} />}>
              <Route path="/vendor-portal" element={<VendorPortal />} />
            </Route>

            <Route path="/" element={<IndexRedirect />} />
            <Route path="*" element={<IndexRedirect />} />
          </Routes>
          <ToastContainer position="bottom-right" aria-label="Toast Notifications" />
        </div>
      </Router>
    </AuthProvider>
  );
}