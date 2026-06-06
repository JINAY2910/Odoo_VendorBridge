import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext.jsx';
import { Plus, Search, MapPin, Phone, CreditCard, User } from 'lucide-react';
import { toast } from 'react-toastify';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vendorName: '',
    contactDetails: '',
    address: '',
    gstNumber: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vendors', formData);
      toast.success('Vendor added successfully');
      setShowForm(false);
      setFormData({ vendorName: '', contactDetails: '', address: '', gstNumber: '' });
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add vendor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Vendors</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition-all font-bold">
          
          <Plus size={20} />
          <span>{showForm ? 'Cancel' : 'Add Vendor'}</span>
        </button>
      </div>

      {showForm &&
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-6">New Vendor Registration</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Vendor Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                type="text"
                required
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Acme Corp" />
              
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">GST Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                type="text"
                required
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="22AAAAA0000A1Z5" />
              
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Contact Details</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                type="text"
                required
                value={formData.contactDetails}
                onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+1 (555) 000-0000" />
              
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="123 Business Rd, Suite 100" />
              
              </div>
            </div>
            <div className="md:col-span-2">
              <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all">
              
                Register Vendor
              </button>
            </div>
          </form>
        </div>
      }

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Vendor List</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
              placeholder="Search vendors..." />
            
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Vendor Name</th>
                <th className="px-6 py-4">GST Number</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Registered By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ?
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading vendors...</td></tr> :
              vendors.length === 0 ?
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No vendors found.</td></tr> :
              vendors.map((v) =>
              <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{v.vendorName}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{v.gstNumber}</td>
                  <td className="px-6 py-4 text-slate-600">{v.contactDetails}</td>
                  <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{v.address}</td>
                  <td className="px-6 py-4 text-slate-600">{v.createdBy?.name}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

};

export default Vendors;