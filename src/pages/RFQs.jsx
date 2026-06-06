import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext.jsx';
import { Plus, Search, Calendar, FileText, User, Users, X, ChevronRight, ChevronLeft, PlusCircle, Trash, Check, Eye, FileSpreadsheet, Paperclip } from 'lucide-react';
import { toast } from 'react-toastify';
import CustomSelect from '../components/CustomSelect.jsx';

const RFQs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  
  // Multi-step form step state
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    items: [{ name: '', quantity: 1, unit: 'Pcs' }],
    assignedVendors: [],
    attachments: []
  });

  const fetchRFQsAndVendors = async () => {
    try {
      const [rfqRes, vendorRes] = await Promise.all([
        api.get('/rfqs'),
        api.get('/vendors')
      ]);
      setRfqs(rfqRes.data);
      setVendors(vendorRes.data.filter(v => v.status === 'active'));
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQsAndVendors();
  }, []);

  const handleOpenCreate = () => {
    setStep(1);
    setFormData({
      title: '',
      description: '',
      deadline: '',
      items: [{ name: '', quantity: 1, unit: 'Pcs' }],
      assignedVendors: [],
      attachments: []
    });
    setShowCreateModal(true);
  };

  const handleNextStep = () => {
    if (step === 1 && (!formData.title || !formData.deadline)) {
      toast.warning('Please enter title and deadline');
      return;
    }
    if (step === 2) {
      const invalidItem = formData.items.some(item => !item.name || item.quantity <= 0);
      if (invalidItem) {
        toast.warning('Please fill in all item names and valid quantities');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  // Line Items Handlers
  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, unit: 'Pcs' }]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
        reader.onerror = error => reject(error);
      });
    })).then(base64Files => {
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...base64Files]
      }));
    }).catch(error => {
      toast.error('Error reading files');
    });
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Assigned Vendors Handlers
  const toggleVendorSelection = (vendorId) => {
    const isSelected = formData.assignedVendors.includes(vendorId);
    let newAssigned;
    if (isSelected) {
      newAssigned = formData.assignedVendors.filter(id => id !== vendorId);
    } else {
      newAssigned = [...formData.assignedVendors, vendorId];
    }
    setFormData({ ...formData, assignedVendors: newAssigned });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.assignedVendors.length === 0) {
      toast.warning('Please assign at least one vendor');
      return;
    }
    try {
      await api.post('/rfqs', formData);
      toast.success('RFQ created successfully');
      setShowCreateModal(false);
      fetchRFQsAndVendors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create RFQ');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-50 text-blue-700 border-blue-200/50';
      case 'closed':
        return 'bg-red-50 text-red-700 border-red-200/50';
      case 'awarded':
        return 'bg-green-50 text-green-700 border-green-200/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Request for Quotation (RFQs)</h1>
          <p className="text-slate-500 mt-1">Initiate and manage procurement requests, track vendor bids, and deadlines.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all font-bold cursor-pointer">
          <Plus size={20} />
          <span>New RFQ</span>
        </button>
      </div>

      {/* RFQs List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">RFQ Registry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">RFQ Number</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Items Count</th>
                <th className="px-6 py-4">Assigned Vendors</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading RFQs...</span>
                    </div>
                  </td>
                </tr>
              ) : rfqs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No RFQs found. Click 'New RFQ' to create one.
                  </td>
                </tr>
              ) : (
                rfqs.map((rfq) => (
                  <tr key={rfq.id || rfq._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 font-mono">
                      {rfq.rfqNumber}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {rfq.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      <div className="flex items-center space-x-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{new Date(rfq.deadline).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border ${getStatusColor(rfq.status)}`}>
                        {rfq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold text-sm">
                      {rfq.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      <div className="flex items-center space-x-1.5">
                        <Users size={14} className="text-slate-400" />
                        <span>{rfq.assignedVendors?.length || 0} vendors</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <Link
                        to={`/rfqs/${rfq.id || rfq._id}/compare`}
                        className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                        title="Compare Bids">
                        <FileSpreadsheet size={18} />
                      </Link>
                      <button
                        onClick={() => setSelectedRfq(rfq)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="View Details">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-step Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Initiate RFQ</h2>
                <p className="text-slate-400 text-xs mt-0.5">Step {step} of 3</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</div>
                <span className={`text-xs font-bold ${step >= 1 ? 'text-blue-600' : 'text-slate-500'}`}>Basic Info</span>
              </div>
              <div className="h-px bg-slate-200 flex-1 mx-4"></div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</div>
                <span className={`text-xs font-bold ${step >= 2 ? 'text-blue-600' : 'text-slate-500'}`}>Line Items</span>
              </div>
              <div className="h-px bg-slate-200 flex-1 mx-4"></div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</div>
                <span className={`text-xs font-bold ${step >= 3 ? 'text-blue-600' : 'text-slate-500'}`}>Assign Vendors</span>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">RFQ Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g., Procurement of Office Laptops" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                      placeholder="Specify requirements, details, or other specifications..." />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Response Deadline</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Attachments (Optional)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl relative hover:bg-slate-50 transition-colors">
                      <div className="space-y-1 text-center">
                        <Paperclip className="mx-auto h-8 w-8 text-slate-400" />
                        <div className="flex text-sm text-slate-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileUpload} />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">PDF, DOC, XLS up to 10MB</p>
                      </div>
                    </div>
                    {formData.attachments?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {formData.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                            <span className="text-xs font-medium text-slate-700 truncate mr-2 flex-1">{file.name}</span>
                            <button type="button" onClick={() => removeAttachment(idx)} className="text-red-500 hover:text-red-700 cursor-pointer p-1"><X size={14}/></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Line Items */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700">Requested Items</label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1 cursor-pointer">
                      <PlusCircle size={14} />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in duration-200">
                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                            placeholder="Item Name / Specification" />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            required
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none text-center"
                            placeholder="Qty" />
                        </div>
                        <div className="w-28">
                          <CustomSelect
                            value={item.unit}
                            onChange={(val) => handleItemChange(index, 'unit', val)}
                            options={[
                              { value: 'Pcs', label: 'Pcs' },
                              { value: 'Kg', label: 'Kg' },
                              { value: 'Liters', label: 'Liters' },
                              { value: 'Meters', label: 'Meters' },
                              { value: 'Boxes', label: 'Boxes' }
                            ]}
                          />
                        </div>
                        <button
                          type="button"
                          disabled={formData.items.length === 1}
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded-lg cursor-pointer">
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Assign Vendors */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700">Assign Vendors to RFQ</label>
                    <span className="text-xs text-slate-500 font-semibold">{formData.assignedVendors.length} selected</span>
                  </div>

                  {vendors.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-2xl">
                      No active vendors available in database. Create a vendor first!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {vendors.map((vendor) => {
                        const isSelected = formData.assignedVendors.includes(vendor.id || vendor._id);
                        return (
                          <div
                            key={vendor.id || vendor._id}
                            onClick={() => toggleVendorSelection(vendor.id || vendor._id)}
                            className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                                : 'border-slate-200 hover:border-slate-300'
                            }`}>
                            <div>
                              <p className="font-bold text-sm text-slate-900">{vendor.vendorName || vendor.name}</p>
                              <p className="text-xs text-slate-500">{vendor.category} | {vendor.gstNumber}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check size={12} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                disabled={step === 1}
                onClick={handlePrevStep}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-600 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center space-x-1">
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/10 transition-all cursor-pointer flex items-center space-x-1">
                  <span>Continue</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/10 transition-all cursor-pointer">
                  Submit & Send RFQ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RFQ Details Modal */}
      {selectedRfq && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-blue-400 font-mono">{selectedRfq.rfqNumber}</span>
                <h2 className="text-xl font-bold">{selectedRfq.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedRfq(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Description</h4>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">{selectedRfq.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Status</h4>
                  <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border ${getStatusColor(selectedRfq.status)}`}>
                    {selectedRfq.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Deadline</h4>
                  <p className="text-slate-700 text-sm font-semibold flex items-center">
                    <Calendar size={14} className="mr-1.5 text-slate-500" />
                    {new Date(selectedRfq.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Items Requested</h4>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                      <tr>
                        <th className="px-4 py-2">Item Name</th>
                        <th className="px-4 py-2 text-right">Qty</th>
                        <th className="px-4 py-2 text-right">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {selectedRfq.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2.5 font-medium">{item.name}</td>
                          <td className="px-4 py-2.5 text-right font-semibold">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-right text-slate-500">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attachments List */}
              {selectedRfq.attachments?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRfq.attachments.map((file, idx) => (
                      <a 
                        key={idx} 
                        href={file.data} 
                        download={file.name}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Paperclip size={12} />
                        <span className="truncate max-w-[150px]">{file.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned Vendors */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Assigned Vendors</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRfq.assignedVendors?.length > 0 ? (
                    selectedRfq.assignedVendors.map((vendorId) => {
                      const v = vendors.find(vend => (vend.id || vend._id) == vendorId);
                      return (
                        <span key={vendorId} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                          {v ? v.vendorName || v.name : `Vendor #${vendorId}`}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-500 italic">No vendors assigned.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRfq(null)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm transition-all cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQs;
