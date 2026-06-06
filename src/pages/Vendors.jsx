import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext.jsx';
import { Plus, Search, MapPin, Phone, CreditCard, User, Edit, Trash2, Mail, X, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  
  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gstNumber: '',
    category: 'Services',
    address: '',
    status: 'active'
  });

  const fetchVendors = async () => {
    try {
      const { data } = await api.get('/vendors');
      setVendors(data);
    } catch (error) {
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      gstNumber: '',
      category: 'Services',
      address: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.vendorName || vendor.name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      gstNumber: vendor.gstNumber || '',
      category: vendor.category || 'Services',
      address: vendor.address || '',
      status: vendor.status || 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await api.put(`/vendors/${editingVendor.id || editingVendor._id}`, formData);
        toast.success('Vendor updated successfully');
      } else {
        await api.post('/vendors', formData);
        toast.success('Vendor added successfully');
      }
      setShowModal(false);
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save vendor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await api.delete(`/vendors/${id}`);
      toast.success('Vendor deleted successfully');
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete vendor');
    }
  };

  // Filtering Logic
  const filteredVendors = vendors.filter(vendor => {
    const vName = (vendor.vendorName || vendor.name || '').toLowerCase();
    const vGst = (vendor.gstNumber || '').toLowerCase();
    const vEmail = (vendor.email || '').toLowerCase();
    const matchesSearch = vName.includes(searchTerm.toLowerCase()) || 
                          vGst.includes(searchTerm.toLowerCase()) ||
                          vEmail.includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || vendor.category === categoryFilter;
    const matchesStatus = !statusFilter || vendor.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vendors</h1>
          <p className="text-slate-500 mt-1">Manage partner registry, classifications, and operational status.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all font-bold cursor-pointer">
          <Plus size={20} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Search by name, GST, or email..." />
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold">
            <Filter size={16} />
            <span>Filters:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
            <option value="">All Categories</option>
            <option value="IT">IT</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Services">Services</option>
            <option value="Logistics">Logistics</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Vendor Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">GST Number</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading vendors list...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No vendors match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.id || v._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 font-bold flex items-center justify-center rounded-xl">
                          {(v.vendorName || v.name || 'V').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{v.vendorName || v.name}</p>
                          <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                            {v.email && (
                              <span className="flex items-center">
                                <Mail size={12} className="mr-1" />
                                {v.email}
                              </span>
                            )}
                            {v.phone && (
                              <span className="flex items-center">
                                <Phone size={12} className="mr-1" />
                                {v.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        {v.category || 'Services'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                      {v.gstNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
                        v.status === 'active' 
                          ? 'bg-green-50 text-green-700 border border-green-200/50' 
                          : 'bg-red-50 text-red-700 border border-red-200/50'
                      }`}>
                        {v.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate">
                      {v.address}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Vendor">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id || v._id)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Vendor">
                          <Trash2 size={16} />
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingVendor ? 'Edit Vendor Details' : 'Register New Vendor'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Vendor Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="Acme Corporation" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">GST Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="22AAAAA0000A1Z5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="contact@acme.com" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="+1 (555) 000-0000" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                    <option value="IT">IT</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Services">Services</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Office / Billing Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="123 Industrial Parkway, Bldg 4" />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-all cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/10 transition-all cursor-pointer">
                  {editingVendor ? 'Save Changes' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;