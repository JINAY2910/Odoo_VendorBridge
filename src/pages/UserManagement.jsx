import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext.jsx';
import { Users, UserPlus, Edit2, Trash2, Key, Mail, Shield, AlertCircle, Check, X, User } from 'lucide-react';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [vendorId, setVendorId] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, vendorsRes] = await Promise.all([
        api.get('/users'),
        api.get('/vendors')
      ]);
      setUsers(usersRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      toast.error('Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setModalType('create');
    setSelectedUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('USER');
    setVendorId('');
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setModalType('edit');
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // leave blank for no change
    setRole(user.role);
    setVendorId(user.vendorId || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === 'VENDOR' && !vendorId) {
      toast.error('Please assign a Vendor to this vendor user account');
      return;
    }

    const payload = {
      name,
      email,
      role,
      vendorId: role === 'VENDOR' ? parseInt(vendorId, 10) : null
    };

    if (password) {
      payload.password = password;
    } else if (modalType === 'create') {
      toast.error('Password is required for new users');
      return;
    }

    try {
      if (modalType === 'create') {
        await api.post('/users', payload);
        toast.success('User account created successfully');
      } else {
        await api.put(`/users/${selectedUser.id || selectedUser._id}`, payload);
        toast.success('User account updated successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user account');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.name}?`)) return;
    try {
      await api.delete(`/users/${user.id || user._id}`);
      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-500 font-medium">Loading user accounts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-blue-600" size={28} /> User Administration
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage user authentication profiles, application roles, and vendor mapping</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/10 transition-all flex items-center gap-1.5 cursor-pointer">
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Linked Vendor</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {users.map((user) => (
                <tr key={user.id || user._id} className="hover:bg-slate-50/30 transition-all">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-bold border border-slate-200">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {user.id || user._id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                        : user.role === 'MANAGER'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : user.role === 'VENDOR'
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-100'
                    }`}>
                      <Shield size={12} />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'VENDOR' ? (
                      user.vendor?.vendorName || user.vendorName ? (
                        <span className="font-semibold text-slate-800">{user.vendor?.vendorName || user.vendorName}</span>
                      ) : (
                        <span className="text-red-500 font-semibold text-xs flex items-center gap-1">
                          <AlertCircle size={14} /> Unassigned Vendor
                        </span>
                      )
                    ) : (
                      <span className="text-slate-400 italic text-xs">N/A (Internal User)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded-lg transition-all text-slate-600 cursor-pointer"
                        title="Edit User">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={user.role === 'ADMIN' && users.filter(u => u.role === 'ADMIN').length <= 1}
                        className="p-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 rounded-lg transition-all text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden transform transition-all">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{modalType === 'create' ? 'Add User Account' : 'Edit User Account'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define access permissions & configurations</p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                    placeholder="e.g. user@company.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password {modalType === 'edit' && <span className="text-[10px] text-slate-400 lowercase">(Leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    required={modalType === 'create'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Role</label>
                <select
                  value={role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setRole(newRole);
                    if (newRole !== 'VENDOR') setVendorId('');
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm font-medium text-slate-700">
                  <option value="USER">USER (Procurement Officer)</option>
                  <option value="MANAGER">MANAGER (Procurement Manager)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                  <option value="VENDOR">VENDOR (External Supplier)</option>
                </select>
              </div>

              {role === 'VENDOR' && (
                <div className="space-y-1 bg-blue-50/50 p-3.5 border border-blue-100 rounded-xl animate-fade-in">
                  <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">Map to Vendor Entity</label>
                  <p className="text-[10px] text-slate-500 mb-2">Associate this user profile with a specific vendor company database record</p>
                  <select
                    required
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm font-semibold text-slate-700">
                    <option value="" disabled>-- Select Vendor --</option>
                    {vendors.map((v) => (
                      <option key={v.id || v._id} value={v.id || v._id}>
                        {v.vendorName || v.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md shadow-blue-600/10 transition-all flex items-center justify-center gap-1 cursor-pointer">
                  <Check size={16} /> Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
