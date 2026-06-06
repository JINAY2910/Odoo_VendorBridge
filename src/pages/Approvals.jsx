import React, { useEffect, useState } from 'react';
import { api, useAuth } from '../context/AuthContext.jsx';
import { FileText, ShoppingCart, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';

const Approvals = () => {
  const { user } = useAuth();
  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [pendingPOs, setPendingPOs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const [quoRes, poRes] = await Promise.all([
        api.get('/quotations'),
        api.get('/pos')
      ]);

      const quotes = quoRes.data.filter(q => q.status === 'Pending Approval');
      const pos = poRes.data.filter(p => p.status === 'Pending Approval');

      setPendingQuotes(quotes);
      setPendingPOs(pos);
    } catch (error) {
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id, type) => {
    try {
      const endpoint = type === 'Quotation' ? `/quotations/${id}/approve-reject` : `/pos/${id}/approve-reject`;
      await api.put(endpoint, { action: 'Approve', remarks: 'Approved from Approvals page' });
      toast.success(`${type} Approved successfully`);
      fetchApprovals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id, type) => {
    const remarks = window.prompt('Enter rejection remarks:');
    if (remarks === null) return;
    try {
      const endpoint = type === 'Quotation' ? `/quotations/${id}/approve-reject` : `/pos/${id}/approve-reject`;
      await api.put(endpoint, { action: 'Reject', remarks });
      toast.info(`${type} Rejected`);
      fetchApprovals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-500 font-medium">Loading pending approvals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={28} /> Pending Approvals
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review, approve, or reject vendor quotations and purchase orders</p>
        </div>
        <button
          onClick={fetchApprovals}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all text-slate-600 cursor-pointer flex items-center gap-1.5 font-bold text-xs shadow-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Quotations Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
          <FileText className="text-blue-600" size={20} />
          <h3 className="text-lg font-bold text-slate-900">Quotation Approvals ({pendingQuotes.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Quotation #</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {pendingQuotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic font-medium">
                    No quotations pending approval
                  </td>
                </tr>
              ) : (
                pendingQuotes.map((q) => (
                  <tr key={q.id || q._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{q.quotationNumber}</td>
                    <td className="px-6 py-4">{q.vendor?.vendorName || q.vendorName || 'Unknown Vendor'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(q.grandTotal)}</td>
                    <td className="px-6 py-4">{q.creator?.name || 'System'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleApprove(q.id || q._id, 'Quotation')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                          title="Approve">
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleReject(q.id || q._id, 'Quotation')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Reject">
                          <XCircle size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
          <ShoppingCart className="text-blue-600" size={20} />
          <h3 className="text-lg font-bold text-slate-900">Purchase Order Approvals ({pendingPOs.length})</h3>
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
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {pendingPOs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic font-medium">
                    No purchase orders pending approval
                  </td>
                </tr>
              ) : (
                pendingPOs.map((p) => (
                  <tr key={p.id || p._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{p.poNumber}</td>
                    <td className="px-6 py-4">{p.vendor?.vendorName || p.vendorName || 'Unknown Vendor'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(p.grandTotal)}</td>
                    <td className="px-6 py-4">{p.creator?.name || 'System'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleApprove(p.id || p._id, 'PO')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                          title="Approve">
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleReject(p.id || p._id, 'PO')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Reject">
                          <XCircle size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Approvals;
