import React, { useEffect, useState } from 'react';
import { api, useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, FileText, Calendar, Trash2, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';
import { downloadPDF } from '../utils/download';


const Quotations = () => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '',
    code: '',
    codeType: 'HSN',
    gstRate: 18,
    defaultPrice: 0
  });
  const [formData, setFormData] = useState({
    vendorId: '',
    validUntil: '',
    lineItems: [{ productId: '', itemName: '', quantity: 1, unitPrice: 0, tax: 18, discount: 0, hsnCode: '' }]
  });
  const [filters, setFilters] = useState({
    search: '',
    vendorId: '',
    createdBy: '',
    status: '',
    dateRange: 'All Time',
    amountRange: 'All'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  const calculateTotals = () => {
    let subtotal = 0;
    let tax = 0;
    let discount = 0;
    formData.lineItems.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;
      tax += itemSubtotal * item.tax / 100;
      discount += itemSubtotal * item.discount / 100;
    });
    return { subtotal, tax, discount, grandTotal: subtotal + tax - discount };
  };

  const totals = calculateTotals();



  const fetchData = async () => {
    try {
      const [quoRes, venRes, prodRes] = await Promise.all([
      api.get('/quotations'),
      api.get('/vendors'),
      api.get('/products')]
      );
      setQuotations(quoRes.data);
      setVendors(venRes.data);
      setProducts(prodRes.data);

    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);


  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { productId: '', itemName: '', quantity: 1, unitPrice: 0, tax: 18, discount: 0, hsnCode: '' }]
    });

  };

  const handleRemoveItem = (index) => {
    const newItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData({ ...formData, lineItems: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.lineItems];
    
    if (field === 'productId') {
      if (value === 'ADD_NEW') {
        setShowProductModal(true);
        return;
      }
      
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index] = { 
          ...newItems[index], 
          productId: value,
          itemName: product.name,
          tax: product.gstRate,
          unitPrice: product.defaultPrice,
          hsnCode: product.code
        };
      } else {
        newItems[index] = { ...newItems[index], productId: '', itemName: '', hsnCode: '' };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    
    setFormData({ ...formData, lineItems: newItems });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/quotations', formData);
      toast.success('Quotation created successfully');
      setShowForm(false);
      setFormData({
        vendorId: '',
        validUntil: '',
        lineItems: [{ productId: '', itemName: '', quantity: 1, unitPrice: 0, tax: 18, discount: 0, hsnCode: '' }]
      });

      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quotation');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/products', productFormData);
      setProducts([...products, data]);
      toast.success('Product added successfully');
      setShowProductModal(false);
      setProductFormData({
        name: '',
        code: '',
        codeType: 'HSN',
        gstRate: 18,
        defaultPrice: 0
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };


  const handleApproveReject = async (id, action) => {
    try {
      await api.put(`/quotations/${id}/approve-reject`, { action, remarks: `${action}d from Quotation list` });
      toast.success(`Quotation ${action}d successfully`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} Quotation`);
    }
  };

  const handleConvertToPO = async (id) => {
    if (!window.confirm('Are you sure you want to convert this quotation to a Purchase Order?')) return;
    try {
      await api.post(`/quotations/${id}/convert-to-po`);
      toast.success('Converted to Purchase Order successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to convert to PO');
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    // Search filter
    const searchMatch = !filters.search || 
      q.quotationNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      q.vendorId?.vendorName.toLowerCase().includes(filters.search.toLowerCase());
    
    // Vendor filter
    const vendorMatch = !filters.vendorId || q.vendorId?._id === filters.vendorId;
    
    // Created By filter
    const createdByMatch = !filters.createdBy || q.createdBy?._id === filters.createdBy;
    
    // Status filter
    const statusMatch = !filters.status || q.status === filters.status;
    
    // Date filter
    let dateMatch = true;
    const qDate = new Date(q.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filters.dateRange === 'Today') {
      dateMatch = qDate >= today;
    } else if (filters.dateRange === 'This Week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      dateMatch = qDate >= weekAgo;
    } else if (filters.dateRange === 'This Month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      dateMatch = qDate >= monthAgo;
    }
    
    // Amount filter
    let amountMatch = true;
    if (filters.amountRange === '0-10000') {
      amountMatch = q.grandTotal <= 10000;
    } else if (filters.amountRange === '10000-50000') {
      amountMatch = q.grandTotal > 10000 && q.grandTotal <= 50000;
    } else if (filters.amountRange === '50000+') {
      amountMatch = q.grandTotal > 50000;
    }
    
    return searchMatch && vendorMatch && createdByMatch && statusMatch && dateMatch && amountMatch;
  });

  const uniqueCreators = Array.from(new Set(quotations.map(q => JSON.stringify({id: q.createdBy?._id, name: q.createdBy?.name}))))
    .map(s => JSON.parse(s))
    .filter(u => u.id);

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const pagedQuotations = filteredQuotations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Quotations</h1>
        {user?.role === 'USER' &&
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition-all font-bold">
          
            <Plus size={20} />
            <span>{showForm ? 'Cancel' : 'Create Quotation'}</span>
          </button>
        }
      </div>

      {showForm &&
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-6">New Quotation</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Select Vendor</label>
                <select
                required
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                
                  <option value="">Choose a vendor...</option>
                  {vendors.map((v) =>
                <option key={v._id} value={v._id}>{v.vendorName}</option>
                )}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Valid Until</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                  type="date"
                  required
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Line Items</h3>
                <button
                type="button"
                onClick={handleAddItem}
                className="text-blue-600 text-sm font-bold hover:underline">
                
                  + Add Item
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.lineItems.map((item, index) =>
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-500">Item Name</label>
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Product...</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} - {p.codeType} {p.code} ({p.gstRate}%)
                          </option>
                        ))}
                        <option value="ADD_NEW" className="text-blue-600 font-bold">➕ Add New Product</option>
                      </select>
                      {item.hsnCode && (
                        <p className="text-[10px] text-slate-400 mt-0.5 ml-1">
                          {item.hsnCode}
                        </p>
                      )}

                  
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
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Tax %</label>
                      <input
                    type="number"
                    required
                    min="0"
                    value={item.tax}
                    onChange={(e) => handleItemChange(index, 'tax', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
                  
                    </div>
                    <div className="flex items-end justify-center pb-1">
                      <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={formData.lineItems.length === 1}>
                    
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
              <div className="flex justify-between w-64 text-sm">
                <span className="text-slate-500">Discount:</span>
                <span className="font-bold text-slate-900">-{formatCurrency(totals.discount)}</span>

              </div>
              <div className="flex justify-between w-64 text-lg border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-900">Grand Total:</span>
                <span className="font-bold text-blue-600">{formatCurrency(totals.grandTotal)}</span>

              </div>
            </div>

            <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all">
            
              Submit Quotation for Approval
            </button>
          </form>
        </div>
      }

      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Add New Product</h3>
              <button 
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Product Name</label>
                <input
                  type="text"
                  required
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Dell Latitude 5420"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Code Type</label>
                  <select
                    value={productFormData.codeType}
                    onChange={(e) => setProductFormData({ ...productFormData, codeType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HSN">HSN</option>
                    <option value="SAC">SAC</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">HSN/SAC Code</label>
                  <input
                    type="text"
                    required
                    value={productFormData.code}
                    onChange={(e) => setProductFormData({ ...productFormData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="8471"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">GST Rate (%)</label>
                  <input
                    type="number"
                    required
                    value={productFormData.gstRate}
                    onChange={(e) => setProductFormData({ ...productFormData, gstRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Default Price</label>
                  <input
                    type="number"
                    required
                    value={productFormData.defaultPrice}
                    onChange={(e) => setProductFormData({ ...productFormData, defaultPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Quotation History</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search code or vendor..." />
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
                <option value="Converted to PO">Converted to PO</option>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Quotation #</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Valid Until</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ?
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading quotations...</td></tr> :
              pagedQuotations.length === 0 ?
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No quotations found match the filters.</td></tr> :
              pagedQuotations.map((q) =>


              <tr key={q._id} className={q.status === 'Converted to PO' || q.status === 'Completed' ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50 transition-colors'}>
                  <td className="px-6 py-4 font-bold text-slate-900">{q.quotationNumber}</td>
                  <td className="px-6 py-4 text-slate-600">{q.vendorId?.vendorName}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(q.grandTotal)}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(q.validUntil).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                  q.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  q.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  q.status === 'Converted to PO' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`
                  }>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{q.createdBy?.name}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {q.status === 'Pending Approval' && (user?.role === 'MANAGER' || user?.role === 'ADMIN') &&
                  <>
                        <button
                      onClick={() => handleApproveReject(q._id, 'Approve')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve">
                      
                          <CheckCircle size={20} />
                        </button>
                        <button
                      onClick={() => handleApproveReject(q._id, 'Reject')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Reject">
                      
                          <XCircle size={20} />
                        </button>
                      </>
                  }
                    {q.status === 'Approved' && (user?.role === 'MANAGER' || user?.role === 'ADMIN') &&
                  <button
                    onClick={() => handleConvertToPO(q._id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Convert to PO">
                    
                        <ShoppingCart size={18} />
                      </button>
                  }
                    <button
                    onClick={async () => {
                      try {
                        await downloadPDF(`/pdf/quotation/${q._id}`, `quotation-${q.quotationNumber}.pdf`);
                      } catch (err) {
                        toast.error(err.message);
                      }
                    }}
                    className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Download PDF">
                    
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredQuotations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> – <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredQuotations.length)}</span> of <span className="font-bold text-slate-900">{filteredQuotations.length}</span> quotations
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentPage === totalPages || totalPages === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </div>);

};

export default Quotations;