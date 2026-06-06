import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { Layout, ProtectedRoute } from './components/Layout.jsx';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Vendors from './pages/Vendors.jsx';
import RFQs from './pages/RFQs.jsx';
import Quotations from './pages/Quotations.jsx';
import PurchaseOrders from './pages/PurchaseOrders.jsx';
import PODetail from './pages/PODetail.jsx';
import Invoices from './pages/Invoices.jsx';
import Payments from './pages/Payments.jsx';
import Reports from './pages/Reports.jsx';
import Register from './pages/Register.jsx';

const Placeholder = ({ title }) =>
<div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
    <p className="text-slate-500 mt-2">This module is coming soon in Phase 5.</p>
  </div>;


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            {/* AUTH BYPASSED — login/register redirect to dashboard */}
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/dashboard" replace />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/rfqs" element={<RFQs />} />
                <Route path="/quotations" element={<Quotations />} />
                <Route path="/pos" element={<PurchaseOrders />} />
                <Route path="/pos/:id" element={<PODetail />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<Placeholder title="User Management" />} />
                <Route path="/profile" element={<Placeholder title="User Profile" />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ToastContainer position="bottom-right" aria-label="Toast Notifications" />
        </div>
      </Router>
    </AuthProvider>);

}