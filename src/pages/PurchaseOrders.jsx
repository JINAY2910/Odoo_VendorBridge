import React, { useEffect, useState } from 'react';
import { api, useAuth } from '../context/AuthContext.jsx';
import { ShoppingCart, CheckCircle, XCircle, ArrowRight, Receipt, FileText, Plus, Trash2, X, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { downloadPDF } from '../utils/download';

const PurchaseOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    vendorId: '',
    status: '',
    dateRange: 'All Time',
    amountRange: 'All',
    createdBy: ''
  });


  // Form State
  const [formData, setFormData] = useState({
    vendorId: '',
    quotationId: '',
    lineItems: [{ itemName: '', quantity: 1, unitPrice: 0, tax: 0 }],
    discount: 0
  });

  const fetchPOs = async () => {
    try {
      const { data } = await api.get('/pos');
      setPos(data);
    } catch (error) {
      toast.error('Failed to fetch POs');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const { data } = await api.get('/vendors');
      setVendors(data);
    } catch (error) {
      console.error('Failed to fetch vendors');
    }
  };

  const fetchQuotations = async () => {
    try {
      const { data } = await api.get('/quotations');
      setQuotations(data.filter((q) => q.status === 'Approved'));
    } catch (error) {
      console.error('Failed to fetch quotations');
    }
  };

  useEffect(() => {
    fetchPOs();
    fetchVendors();
    fetchQuotations();
  }, []);

  const handleApproveReject = async (id, action) => {
    try {
      await api.put(`/pos/${id}/approve-reject`, { action, remarks: `${action}d from PO list` });
      toast.success(`PO ${action}d successfully`);
      fetchPOs();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} PO`);
    }
  };

  const handleCreateInvoice = (poId) => {
    navigate('/invoices', { state: { poId } });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { itemName: '', quantity: 1, unitPrice: 0, tax: 0 }]
    });
  };

  const removeItem = (index) => {
    const newList = [...formData.lineItems];
    newList.splice(index, 1);
    setFormData({ ...formData, lineItems: newList });
  };

  const updateItem = (index, field, value) => {
    const newList = [...formData.lineItems];
    newList[index] = { ...newList[index], [field]: value };
    setFormData({ ...formData, lineItems: newList });
  };

  const calculateTotal = () => {
    let subtotal = 0;
    let tax = 0;
    formData.lineItems.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;
      tax += itemSubtotal * (item.tax || 0) / 100;
    });
    return subtotal + tax - formData.discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pos', formData);
      toast.success('Purchase Order created successfully');
      setShowCreateModal(false);
      fetchPOs();
      setFormData({
        vendorId: '',
        quotationId: '',
        lineItems: [{ itemName: '', quantity: 1, unitPrice: 0, tax: 0 }],
        discount: 0
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create PO');
    }
  };

  const filteredPOs = pos.filter((p) => {
    // Search filter
    const searchMatch = !filters.search || 
      p.poNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.vendorId?.vendorName.toLowerCase().includes(filters.search.toLowerCase());
    
    // Vendor filter
    const vendorMatch = !filters.vendorId || p.vendorId?._id === filters.vendorId;
    
    // Status filter
    const statusMatch = !filters.status || p.status === filters.status;
    
    // Date filter
    let dateMatch = true;
    const pDate = new Date(p.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filters.dateRange === 'Today') {
      dateMatch = pDate >= today;
    } else if (filters.dateRange === 'This Week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      dateMatch = pDate >= weekAgo;
    } else if (filters.dateRange === 'This Month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      dateMatch = pDate >= monthAgo;
    }
    
    // Amount filter
    let amountMatch = true;
    if (filters.amountRange === '0-10000') {
      amountMatch = p.grandTotal <= 10000;
    } else if (filters.amountRange === '10000-50000') {
      amountMatch = p.grandTotal > 10000 && p.grandTotal <= 50000;
    } else if (filters.amountRange === '50000+') {
      amountMatch = p.grandTotal > 50000;
    }

    // Created By filter
    const createdByMatch = !filters.createdBy || p.createdBy?._id === filters.createdBy;
    
    return searchMatch && vendorMatch && statusMatch && dateMatch && amountMatch && createdByMatch;
  });

  const uniqueCreators = Array.from(new Set(pos.map(p => JSON.stringify({id: p.createdBy?._id, name: p.createdBy?.name}))))
    .map(s => JSON.parse(s))
    .filter(u => u.id);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Purchase Orders</h1>
        {user?.role !== 'MANAGER' &&
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">

            <Plus size={20} />
            Create PO
          </button>
        }
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-900">PO List</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search PO # or vendor..." />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Vendor</label>
            <select 
              value={filters.vendorId}
              onChange={(e) => setFilters({...filters, vendorId: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Vendors</option>
              {vendors.map(v => <option key={v._id} value={v._id}>{v.vendorName}</option>)}
            </select>
          </div>

          {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Created By</label>
              <select 
                value={filters.createdBy}
                onChange={(e) => setFilters({...filters, createdBy: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Creators</option>
                {uniqueCreators.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Date Range</label>
            <select 
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Amount Range</label>
            <select 
              value={filters.amountRange}
              onChange={(e) => setFilters({...filters, amountRange: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Amounts</option>
              <option value="0-10000">₹0 - ₹10,000</option>
              <option value="10000-50000">₹10,000 - ₹50,000</option>
              <option value="50000+">₹50,000+</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {loading ?
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 text-slate-500">Loading POs...</div> :
          filteredPOs.length === 0 ?
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 text-slate-500">No POs found match the filters.</div> :
            filteredPOs.map((p) =>

              <div key={p._id} className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${p.status === 'Closed' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md transition-shadow'}`}>
                <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                      <ShoppingCart size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{p.poNumber}</h3>
                      <p className="text-xs text-slate-500">Created on {new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${p.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        p.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          p.status === 'Closed' ? 'bg-slate-100 text-slate-700' : 'bg-orange-100 text-orange-700'}`
                    }>
                      {p.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => navigate(`/pos/${p._id}`)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Details">

                        <ArrowRight size={18} />
                      </button>
                      {p.status === 'Approved' && user?.role === 'USER' &&
                        <button
                          onClick={() => handleCreateInvoice(p._id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Create Invoice">

                          <Receipt size={18} />
                        </button>
                      }
                      <button
                        onClick={async () => {
                          try {
                            await downloadPDF(`/pdf/po/${p._id}`, `po-${p.poNumber}.pdf`);
                          } catch (err) {
                            toast.error(err.message);
                          }
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download PDF">

                        <FileText size={18} />
                      </button>
                      {p.status === 'Pending Approval' && (user?.role === 'MANAGER' || user?.role === 'ADMIN') &&
                        <>
                          <button onClick={() => handleApproveReject(p._id, 'Approve')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                            <CheckCircle size={20} />
                          </button>
                          <button onClick={() => handleApproveReject(p._id, 'Reject')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                            <XCircle size={20} />
                          </button>
                        </>
                      }
                    </div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Vendor Details</h4>
                    <p className="font-bold text-slate-900">{p.vendorId?.vendorName}</p>
                    <p className="text-sm text-slate-500">Ref: {p.quotationId?.quotationNumber || 'Direct PO'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Line Items</h4>
                    <div className="space-y-2">
                      {p.lineItems.slice(0, 2).map((item, idx) =>
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-600">{item.itemName} (x{item.quantity})</span>
                          <div className="text-right">
                            <p className="font-medium text-slate-900">{formatCurrency(item.unitPrice * item.quantity)}</p>

                            <p className="text-[10px] text-slate-400">{formatCurrency(item.unitPrice)} ea + {item.tax}% tax</p>

                          </div>
                        </div>
                      )}
                      {p.lineItems.length > 2 &&
                        <p className="text-xs text-blue-600 font-medium">+{p.lineItems.length - 2} more items...</p>
                      }
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">Total Amount</span>
                  <span className="text-xl font-bold text-slate-900">{formatCurrency(p.grandTotal)}</span>

                </div>
              </div>
            )}
      </div>

      {/* Create PO Modal */}
      {showCreateModal &&
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-900">Create Purchase Order</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Vendor</label>
                  <select
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}>

                    <option value="">Select Vendor</option>
                    {vendors.map((v) => <option key={v._id} value={v._id}>{v.vendorName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Quotation Reference (Optional)</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.quotationId}
                    onChange={(e) => setFormData({ ...formData, quotationId: e.target.value })}>

                    <option value="">None</option>
                    {quotations.map((q) => <option key={q._id} value={q._id}>{q.quotationNumber}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Line Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-blue-600 font-bold hover:underline">

                    + Add Item
                  </button>
                </div>
                {formData.lineItems.map((item, index) =>
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-xl">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Item Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                        value={item.itemName}
                        onChange={(e) => updateItem(index, 'itemName', e.target.value)} />

                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Qty</label>
                      <input
                        type="number"
                        required
                        min="1"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))} />

                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Unit Price</label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))} />

                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Tax (%)</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                        value={item.tax}
                        onChange={(e) => updateItem(index, 'tax', parseFloat(e.target.value))} />

                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={formData.lineItems.length === 1}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">

                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end space-y-2 border-t border-slate-100 pt-6">
                <div className="text-slate-600">Total Amount: <span className="text-2xl font-bold text-slate-900 ml-2">{formatCurrency(calculateTotal())}</span></div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">

                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">

                    Submit PO
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }
    </div>);

};

export default PurchaseOrders;