import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../context/AuthContext.jsx';
import { FileText, ShoppingCart, Receipt, CreditCard, Users, CheckCircle, XCircle, ArrowRight, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';


const StatCard = ({ title, value, icon: Icon, color }) =>
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>;


const UserDashboard = ({ stats }) =>
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Quotations" value={stats.quotations || 0} icon={FileText} color="bg-blue-500" />
      <StatCard title="Total Purchase Orders" value={stats.pos || 0} icon={ShoppingCart} color="bg-indigo-500" />
      <StatCard title="Total Invoices" value={stats.invoices || 0} icon={Receipt} color="bg-green-500" />
      <StatCard title="Pending Payments" value={stats.pendingPayments || 0} icon={CreditCard} color="bg-orange-500" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Recent Quotations</h3>
          <Link to="/quotations" className="text-blue-600 text-sm font-medium hover:underline flex items-center">
            View All <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        <div className="space-y-4">
          {stats.recentQuotations?.map((q) =>
            <div key={q._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">{q.quotationNumber}</p>
                <p className="text-xs text-slate-500">{q.vendorId?.vendorName}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{formatCurrency(q.grandTotal)}</p>

                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${q.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    q.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      q.status === 'Converted to PO' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`
                }>
                  {q.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Recent Purchase Orders</h3>
          <Link to="/pos" className="text-blue-600 text-sm font-medium hover:underline flex items-center">
            View All <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        <div className="space-y-4">
          {stats.recentPOs?.map((p) =>
            <div key={p._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">{p.poNumber}</p>
                <p className="text-xs text-slate-500">{p.vendorId?.vendorName}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{formatCurrency(p.grandTotal)}</p>

                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${p.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    p.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`
                }>
                  {p.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>;


const ManagerDashboard = ({ stats, onApprove, onReject, onConvertToPO }) =>
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Pending Quotations" value={stats.pendingQuotations?.length || 0} icon={FileText} color="bg-orange-500" />
      <StatCard title="Pending POs" value={stats.pendingPOs?.length || 0} icon={ShoppingCart} color="bg-blue-500" />
      <StatCard title="Pending Payments" value={formatCurrency(stats.pendingPaymentAmount)} icon={CreditCard} color="bg-red-500" />
      <StatCard title="Monthly Spending" value={formatCurrency(stats.monthlySpending)} icon={BarChart3} color="bg-green-500" />

    </div>

    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Quotation Management</h3>
        <Link to="/quotations" className="text-blue-600 text-sm font-medium hover:underline">View All</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Quotation #</th>
              <th className="px-6 py-4">Vendor</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...(stats.pendingQuotations || []), ...(stats.approvedQuotations || [])].map((q) =>
              <tr key={q._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{q.quotationNumber}</td>
                <td className="px-6 py-4 text-slate-600">{q.vendorId?.vendorName}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(q.grandTotal)}</td>

                <td className="px-6 py-4">
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${q.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`
                  }>
                    {q.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {q.status === 'Pending Approval' ?
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => onApprove(q._id, 'Quotation')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                        <CheckCircle size={20} />
                      </button>
                      <button onClick={() => onReject(q._id, 'Quotation')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                        <XCircle size={20} />
                      </button>
                    </div> :
                    q.status === 'Approved' ?
                      <button
                        onClick={() => onConvertToPO(q._id)}
                        className="flex items-center space-x-1 ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">

                        <ShoppingCart size={14} />
                        <span>Convert to PO</span>
                      </button> :

                      <span className="text-xs text-slate-400 font-medium italic">No actions</span>
                  }
                </td>
              </tr>
            )}
            {!stats.pendingQuotations?.length && !stats.approvedQuotations?.length &&
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No quotations to manage</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900">Pending PO Approvals</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">PO #</th>
              <th className="px-6 py-4">Vendor</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Created By</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.pendingPOs?.map((p) =>
              <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{p.poNumber}</td>
                <td className="px-6 py-4 text-slate-600">{p.vendorId?.vendorName}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(p.grandTotal)}</td>

                <td className="px-6 py-4 text-slate-600">{p.createdBy?.name}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => onApprove(p._id, 'PO')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                    <CheckCircle size={20} />
                  </button>
                  <button onClick={() => onReject(p._id, 'PO')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                    <XCircle size={20} />
                  </button>
                </td>
              </tr>
            )}
            {stats.pendingPOs?.length === 0 &&
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No pending purchase orders</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  </div>;


const AdminDashboard = ({ stats, onApprove, onReject, onConvertToPO }) =>
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Users" value={stats.users || 0} icon={Users} color="bg-blue-500" />
      <StatCard title="Total Quotations" value={stats.quotations || 0} icon={FileText} color="bg-purple-500" />
      <StatCard title="Total PO Value" value={formatCurrency(stats.poValue)} icon={ShoppingCart} color="bg-green-500" />

      <StatCard title="Pending Approvals" value={stats.pendingApprovals || 0} icon={CheckCircle} color="bg-orange-500" />
    </div>
    <ManagerDashboard stats={stats} onApprove={onApprove} onReject={onReject} onConvertToPO={onConvertToPO} />
  </div>;


const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const safeGet = (url) => api.get(url).catch(err => {
        console.warn(`Failed to fetch ${url}:`, err.message);
        return { data: [] };
      });

      const [quo, inv, ven, pos, users, pay] = await Promise.all([
        safeGet('/quotations'),
        safeGet('/invoices'),
        safeGet('/vendors'),
        safeGet('/pos'),
        safeGet('/users'),
        safeGet('/payments')
      ]);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlySpending = pay.data
        .filter(p => {
          const d = new Date(p.paymentDate || p.createdAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + (p.amountPaid || 0), 0);

      let pendingPaymentAmount = 0;
      inv.data.forEach(invoice => {
        const invoicePayments = pay.data.filter(p => p.invoiceId?._id === invoice._id || p.invoiceId === invoice._id);
        const paidForThisInvoice = invoicePayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
        const balanceDue = (invoice.grandTotal || 0) - paidForThisInvoice;
        if (balanceDue > 0) {
          pendingPaymentAmount += balanceDue;
        }
      });

      const data = {
        quotations: quo.data.length,
        pos: pos.data.length,
        invoices: inv.data.length,
        vendors: ven.data.length,
        users: users.data.length,
        pendingPayments: inv.data.filter((i) => i.status !== 'Paid').length,
        pendingPaymentAmount: pendingPaymentAmount,
        monthlySpending: monthlySpending,
        recentQuotations: quo.data.slice(-5).reverse(),
        recentPOs: pos.data.slice(-5).reverse(),
        pendingQuotations: quo.data.filter((q) => q.status === 'Pending Approval'),
        approvedQuotations: quo.data.filter((q) => q.status === 'Approved'),
        pendingPOs: pos.data.filter((p) => p.status === 'Pending Approval'),
        poValue: pos.data.reduce((sum, p) => sum + (p.grandTotal || 0), 0),
        pendingApprovals: quo.data.filter((q) => q.status === 'Pending Approval').length +
          pos.data.filter((p) => p.status === 'Pending Approval').length
      };
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApprove = async (id, type) => {
    try {
      const endpoint = type === 'Quotation' ? `/quotations/${id}/approve-reject` : `/pos/${id}/approve-reject`;
      await api.put(endpoint, { action: 'Approve', remarks: 'Approved from dashboard' });
      toast.success(`${type} Approved Successfully`);
      fetchStats();
    } catch (error) {
      console.error('Approval failed', error);
      toast.error('Approval failed');
    }
  };

  const handleReject = async (id, type) => {
    const remarks = window.prompt('Enter rejection remarks:');
    if (remarks === null) return;
    try {
      const endpoint = type === 'Quotation' ? `/quotations/${id}/approve-reject` : `/pos/${id}/approve-reject`;
      await api.put(endpoint, { action: 'Reject', remarks });
      toast.info(`${type} Rejected`);
      fetchStats();
    } catch (error) {
      console.error('Rejection failed', error);
      toast.error('Rejection failed');
    }
  };

  const handleConvertToPO = async (id) => {
    if (!window.confirm('Are you sure you want to convert this quotation to a Purchase Order?')) return;
    try {
      await api.post(`/quotations/${id}/convert-to-po`);
      toast.success('Purchase Order Created Successfully');
      fetchStats();
    } catch (error) {
      console.error('Conversion failed', error);
      toast.error('Failed to convert quotation to Purchase Order');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.name}</h1>
          <p className="text-slate-500">Here's what's happening in your procurement portal today.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-sm font-medium text-slate-600">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {user?.role === 'USER' && <UserDashboard stats={stats} />}
      {user?.role === 'MANAGER' && <ManagerDashboard stats={stats} onApprove={handleApprove} onReject={handleReject} onConvertToPO={handleConvertToPO} />}
      {user?.role === 'ADMIN' && <AdminDashboard stats={stats} onApprove={handleApprove} onReject={handleReject} onConvertToPO={handleConvertToPO} />}
    </div>);

};

export default Dashboard;