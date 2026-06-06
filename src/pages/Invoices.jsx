import React, { useEffect, useState } from 'react';
import { api, useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, Receipt, Trash2, DollarSign, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';
import { downloadPDF } from '../utils/download';

import { useLocation, useNavigate } from 'react-router-dom';

const Invoices = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [pos, setPos] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    poId: '',
    items: [{ itemName: '', quantity: 1, unitPrice: 0, tax: 18 }]
  });

  const fetchData = async () => {
    try {
      const [invRes, poRes, payRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/pos'),
        api.get('/payments')
      ]);
      setInvoices(invRes.data);
      setPos(poRes.data.filter((p) => p.status === 'Approved'));
      setPayments(payRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (location.state?.poId) {
      setShowForm(true);
      handlePOChange(location.state.poId);
    }
  }, [location.state]);

  const handlePOChange = async (poId) => {
    if (!poId) {
      setFormData({ poId: '', items: [{ itemName: '', quantity: 1, unitPrice: 0, tax: 18 }] });
      return;
    }

    try {
      const { data: po } = await api.get(`/pos/${poId}`);
      setFormData({
        poId,
        items: po.lineItems.map((item) => ({
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          tax: item.tax
        }))
      });
    } catch (error) {
      toast.error('Failed to fetch PO details');
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemName: '', quantity: 1, unitPrice: 0, tax: 18 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/invoices', formData);
      toast.success('Invoice created successfully');
      setShowForm(false);
      setFormData({
        poId: '',
        items: [{ itemName: '', quantity: 1, unitPrice: 0, tax: 18 }]
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      if (invoiceId) {
        await downloadPDF(`/pdf/invoice/${invoiceId}`, `invoice-${invoiceId}.pdf`);
      } else {
        await downloadPDF('/pdf/download-invoice', 'invoice-sample.pdf');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let tax = 0;
    formData.items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;
      tax += itemSubtotal * item.tax / 100;
    });
    return { subtotal, tax, grandTotal: subtotal + tax };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
        <div className="flex space-x-3">
          {user?.role === 'USER' &&
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition-all font-bold">
              <Plus size={20} />
              <span>{showForm ? 'Cancel' : 'Create Invoice'}</span>
            </button>
          }
        </div>
      </div>

      {showForm &&
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-6">New Invoice</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Select Purchase Order</label>
              <select
                required
                value={formData.poId}
                onChange={(e) => handlePOChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">

                <option value="">Choose an approved PO...</option>
                {pos.map((p) =>
                  <option key={p._id} value={p._id}>{p.poNumber} - {p.vendorId?.vendorName} ({formatCurrency(p.grandTotal)})</option>

                )}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Invoice Items</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-blue-600 text-sm font-bold hover:underline">

                  + Add Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) =>
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-500">Item Name</label>
                      <input
                        type="text"
                        required
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                        placeholder="Item name" />

                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Qty</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" />

                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Unit Price</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" />

                    </div>
                    <div className="flex items-end justify-center pb-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={formData.items.length === 1}>

                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2 border-t border-slate-100 pt-6">
              <div className="flex justify-between w-64 text-sm">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-bold text-slate-900">{formatCurrency(totals.subtotal)}</span>

              </div>
              <div className="flex justify-between w-64 text-sm">
                <span className="text-slate-500">Tax:</span>
                <span className="font-bold text-slate-900">{formatCurrency(totals.tax)}</span>

              </div>
              <div className="flex justify-between w-64 text-lg border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-900">Invoice Total:</span>
                <span className="font-bold text-blue-600">{formatCurrency(totals.grandTotal)}</span>

              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all">

              Generate Invoice
            </button>
          </form>
        </div>
      }

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Invoice History</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
              placeholder="Search invoices..." />

          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">PO Ref</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Balance Due</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ?
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading invoices...</td></tr> :
                invoices.length === 0 ?
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No invoices found.</td></tr> :
                  invoices.map((i) => {
                    const invoicePayments = payments.filter((p) => p.invoiceId?._id === i._id || p.invoiceId === i._id);
                    const totalPaid = invoicePayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
                    const balanceDue = i.grandTotal - totalPaid;

                    return (
                    <tr key={i._id} className={i.status === 'Paid' ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50 transition-colors'}>
                      <td className="px-6 py-4 font-bold text-slate-900">{i.invoiceNumber}</td>
                      <td className="px-6 py-4 text-slate-600">{i.poId?.poNumber}</td>
                      <td className="px-6 py-4 text-slate-600">{i.vendorId?.vendorName}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(i.grandTotal)}</td>

                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${i.status === 'Paid' ? 'bg-green-100 text-green-700' :
                            i.status === 'Partially Paid' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`
                        }>
                          {i.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {i.status === 'Paid' || balanceDue <= 0.01 ? (
                          <span className="text-green-600 font-semibold">{formatCurrency(0)}</span>
                        ) : (
                          <span className={i.status === 'Partially Paid' ? 'text-orange-600 font-semibold' : ''}>
                            {formatCurrency(balanceDue)}
                          </span>
                        )}

                      </td>
                      <td className="px-6 py-4 text-slate-600">{i.createdBy?.name}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {i.status !== 'Paid' && (user?.role === 'MANAGER' || user?.role === 'ADMIN') &&
                          <button
                            onClick={() => navigate('/payments', { state: { invoiceId: i._id } })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Record Payment">

                            <DollarSign size={18} />
                          </button>
                        }
                        <button
                          onClick={() => handleDownloadPDF(i._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download PDF">
                          <FileText size={18} />
                        </button>
                      </td>
                    </tr>
                    );
                  }
                  )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

};

export default Invoices;