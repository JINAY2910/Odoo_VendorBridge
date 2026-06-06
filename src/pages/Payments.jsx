import React, { useEffect, useState } from 'react';
import { api, useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, CreditCard, Receipt, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';

import { useLocation } from 'react-router-dom';

const Payments = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    invoiceId: '',
    amountPaid: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    remarks: ''
  });

  const fetchData = async () => {
    try {
      const [payRes, invRes] = await Promise.all([
      api.get('/payments'),
      api.get('/invoices')]
      );
      setPayments(payRes.data);
      setInvoices(invRes.data.filter((i) => i.status !== 'Paid'));
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (location.state?.invoiceId) {
      setShowForm(true);
      handleInvoiceChange(location.state.invoiceId);
    }
  }, [location.state]);

  const handleInvoiceChange = async (invoiceId) => {
    if (!invoiceId) {
      setFormData({ ...formData, invoiceId: '', amountPaid: 0 });
      return;
    }

    try {
      const { data: invoice } = await api.get(`/invoices/${invoiceId}`);
      // Calculate remaining balance based on actual payments
      const invoicePayments = payments.filter((p) => p.invoiceId?._id === invoiceId || p.invoiceId === invoiceId);
      const totalPaid = invoicePayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
      const remaining = invoice.grandTotal - totalPaid;
      
      setFormData({
        ...formData,
        invoiceId,
        amountPaid: remaining > 0 ? Number(remaining.toFixed(2)) : 0
      });
    } catch (error) {
      toast.error('Failed to fetch invoice details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', formData);
      toast.success('Payment recorded successfully');
      setShowForm(false);
      setFormData({
        invoiceId: '',
        amountPaid: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer',
        remarks: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        {(user?.role === 'MANAGER' || user?.role === 'ADMIN') &&
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition-all font-bold">
          
            <Plus size={20} />
            <span>{showForm ? 'Cancel' : 'Record Payment'}</span>
          </button>
        }
      </div>

      {showForm &&
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Record New Payment</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Select Invoice</label>
              <div className="relative">
                <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                required
                value={formData.invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                
                  <option value="">Choose an unpaid invoice...</option>
                  {invoices.map((i) => {
                    const invoicePayments = payments.filter((p) => p.invoiceId?._id === i._id || p.invoiceId === i._id);
                    const totalPaid = invoicePayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
                    const remainingAmount = i.grandTotal - totalPaid;

                    if (remainingAmount <= 0.01) {
                      return (
                        <option key={i._id} value={i._id} disabled className="opacity-50 cursor-not-allowed">
                          {i.invoiceNumber} - Invoice Fully Paid
                        </option>
                      );
                    }
                    return (
                      <option key={i._id} value={i._id}>
                        {i.invoiceNumber} - {i.vendorId?.vendorName} ({formatCurrency(remainingAmount)})

                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Amount Paid</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0.00" />
              
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Payment Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Payment Method</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Check">Check</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Remarks</label>
              <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              placeholder="Add any payment notes..." />
            
            </div>
            <div className="md:col-span-2">
              <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all">
              
                Record Payment
              </button>
            </div>
          </form>
        </div>
      }

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Payment History</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
              placeholder="Search payments..." />
            
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Payment Date</th>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ?
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading payments...</td></tr> :
              payments.length === 0 ?
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No payments found.</td></tr> :
              payments.map((p) =>
              <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{p.invoiceId?.invoiceNumber}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(p.amountPaid)}</td>

                  <td className="px-6 py-4 text-slate-600">{p.paymentMethod}</td>
                  <td className="px-6 py-4 text-slate-600">{p.createdBy?.name}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

};

export default Payments;