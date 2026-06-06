import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../context/AuthContext.jsx';
import { ClipboardList, FileText, ShoppingCart, LogOut, CheckCircle, Clock, FileInput, AlertCircle, DollarSign, Calendar, Send, HelpCircle, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';

const VendorPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('rfqs'); // 'rfqs', 'quotes', 'pos'
  const [rfqs, setRfqs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quote Submission Modal State
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [quoteItems, setQuoteItems] = useState([]); // Array of { itemName, quantity, unit, unitPrice }
  const [timeline, setTimeline] = useState('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rfqRes, quoRes, poRes] = await Promise.all([
        api.get('/rfqs'),
        api.get('/quotations'),
        api.get('/pos')
      ]);

      // Filter RFQs assigned to this vendor
      const vendorIdNum = parseInt(user?.vendorId, 10);
      
      const openAssignedRFQs = rfqRes.data.filter(rfq => {
        const isAssigned = rfq.assignedVendors?.includes(vendorIdNum);
        return isAssigned && rfq.status === 'open';
      });

      // Filter quotations submitted by this vendor
      const vendorQuotes = quoRes.data.filter(q => q.vendorId === vendorIdNum);

      // Filter POs issued to this vendor
      const vendorPOs = poRes.data.filter(p => p.vendorId === vendorIdNum);

      setRfqs(openAssignedRFQs);
      setQuotations(vendorQuotes);
      setPos(vendorPOs);
    } catch (error) {
      toast.error('Failed to load portal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'VENDOR' || !user.vendorId) {
      toast.error('Unauthorized access. Redirecting...');
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user]);

  const openQuoteModal = (rfq) => {
    setSelectedRfq(rfq);
    // Initialize items with unit prices set to 0 or empty
    const items = rfq.items.map(item => ({
      itemName: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: ''
    }));
    setQuoteItems(items);
    setTimeline('');
    setNotes('');
    
    // Default valid until date to 30 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setValidUntil(defaultDate.toISOString().split('T')[0]);

    setSubmitModalOpen(true);
  };

  const handleUnitPriceChange = (index, val) => {
    const updated = [...quoteItems];
    updated[index].unitPrice = val;
    setQuoteItems(updated);
  };

  const calculateGrandTotal = () => {
    return quoteItems.reduce((sum, item) => {
      const price = parseFloat(item.unitPrice) || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();

    // Validate prices
    const hasInvalidPrices = quoteItems.some(item => !item.unitPrice || parseFloat(item.unitPrice) <= 0);
    if (hasInvalidPrices) {
      toast.error('Please specify valid unit prices for all items');
      return;
    }

    if (!timeline) {
      toast.error('Please enter a delivery timeline');
      return;
    }

    if (!validUntil) {
      toast.error('Please specify the validity period');
      return;
    }

    setSubmittingQuote(true);

    try {
      const payload = {
        vendorId: parseInt(user.vendorId, 10),
        rfqId: selectedRfq.id || selectedRfq._id,
        lineItems: quoteItems.map(item => ({
          ...item,
          unitPrice: parseFloat(item.unitPrice)
        })),
        validUntil: new Date(validUntil),
        timeline,
        notes
      };

      await api.post('/quotations', payload);
      toast.success('Your quotation has been submitted successfully!');
      setSubmitModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quotation');
    } finally {
      setSubmittingQuote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 space-y-3">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-500 font-bold tracking-wide">Loading Vendor Portal...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header bar */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="VendorBridge Logo" className="w-10 h-10 object-contain drop-shadow-md rounded-lg" />
            <div>
              <h1 className="text-lg font-bold tracking-tight">VendorBridge</h1>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Supplier Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">Linked Vendor ID: {user?.vendorId}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-red-900/40 hover:text-red-200 border border-slate-700 rounded-xl text-xs font-bold transition-all text-slate-300 cursor-pointer">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Partner Dashboard</h2>
            <p className="text-slate-500 text-sm mt-1">Review active RFQs, track quotations, and manage incoming purchase orders</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-50 border border-slate-200/50 p-1 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setActiveTab('rfqs')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'rfqs'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}>
              <ClipboardList size={16} /> Open RFQs ({rfqs.length})
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'quotes'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}>
              <FileText size={16} /> My Quotes ({quotations.length})
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'pos'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}>
              <ShoppingCart size={16} /> My Purchase Orders ({pos.length})
            </button>
          </div>
        </div>

        {/* Tab contents */}
        {activeTab === 'rfqs' && (
          <div className="space-y-6">
            {rfqs.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm text-center py-16 px-6 space-y-4">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                  <ClipboardList size={30} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Open Requests</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">There are no open RFQs assigned to your vendor account at the moment. We will notify you when new requests are created.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rfqs.map(rfq => (
                  <div key={rfq.id || rfq._id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:border-slate-200 transition-all">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 space-y-2 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                          {rfq.rfqNumber}
                        </span>
                        <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                          <Clock size={12} /> Deadline: {new Date(rfq.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{rfq.title}</h3>
                      <p className="text-slate-600 text-xs line-clamp-3">{rfq.description || 'No description provided.'}</p>

                      <div className="pt-3">
                        <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">Requested Items</h4>
                        <div className="border border-slate-100 rounded-lg overflow-hidden text-[11px] bg-white">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase">
                              <tr>
                                <th className="px-3 py-1.5">Item</th>
                                <th className="px-3 py-1.5 text-right">Qty</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                              {rfq.items?.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-1.5 font-medium truncate max-w-[150px]">{item.name}</td>
                                  <td className="px-3 py-1.5 text-right font-semibold">{item.quantity} {item.unit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100/50 flex justify-end">
                      <button
                        onClick={() => openQuoteModal(rfq)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-1.5 transition-all cursor-pointer">
                        <FileInput size={14} /> Submit Bid Quotation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            {quotations.length === 0 ? (
              <div className="text-center py-16 px-6 space-y-4">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                  <FileText size={30} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Bids Submitted</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">You have not submitted any bids yet. Open RFQs to view requests and prepare quotations.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">Quotation #</th>
                      <th className="px-6 py-4">RFQ Number</th>
                      <th className="px-6 py-4">Submitted Date</th>
                      <th className="px-6 py-4">Delivery Timeline</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                    {quotations.map(q => (
                      <tr key={q.id || q._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{q.quotationNumber}</td>
                        <td className="px-6 py-4">
                          {q.rfq?.rfqNumber || (
                            <span className="text-slate-400 font-mono text-xs">Direct / None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">{new Date(q.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium">{q.timeline || 'N/A'}</td>
                        <td className="px-6 py-4 font-extrabold text-slate-900">{formatCurrency(q.grandTotal)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold border ${
                            q.status === 'Approved'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : q.status === 'Rejected'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : q.status === 'Converted to PO'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pos' && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            {pos.length === 0 ? (
              <div className="text-center py-16 px-6 space-y-4">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                  <ShoppingCart size={30} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Purchase Orders</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">No Purchase Orders have been generated for your vendor account yet. Submit competitive quotes to win RFQ awards.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">PO Number</th>
                      <th className="px-6 py-4">Ref Quotation</th>
                      <th className="px-6 py-4">Issued Date</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                    {pos.map(p => (
                      <tr key={p.id || p._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{p.poNumber}</td>
                        <td className="px-6 py-4 font-medium text-slate-500">
                          {p.quotation?.quotationNumber || 'Direct PO'}
                        </td>
                        <td className="px-6 py-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-extrabold text-blue-600">{formatCurrency(p.grandTotal)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold border ${
                            p.status === 'Approved'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : p.status === 'Rejected'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Quote Submission Modal */}
      {submitModalOpen && selectedRfq && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-100 my-8 overflow-hidden transform transition-all">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                  {selectedRfq.rfqNumber}
                </span>
                <h3 className="text-lg font-bold mt-1">Submit Quote: {selectedRfq.title}</h3>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleQuoteSubmit} className="p-6 space-y-6">
              {/* RFQ Info block */}
              <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">RFQ Requirements</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedRfq.description || 'No description provided.'}</p>
                <div className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                  <AlertCircle size={12} /> Bidding deadline is {new Date(selectedRfq.deadline).toLocaleDateString()}
                </div>
              </div>

              {/* Items pricing table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Item Pricing Sheet</h4>
                <div className="border border-slate-150 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-150 text-slate-600 font-bold uppercase">
                      <tr>
                        <th className="px-4 py-3">Item Details</th>
                        <th className="px-4 py-3 text-right">Target Qty</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quoteItems.map((item, idx) => {
                        const price = parseFloat(item.unitPrice) || 0;
                        const sub = price * item.quantity;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/30">
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {item.itemName}
                              <span className="text-[10px] text-slate-400 block font-normal mt-0.5">Unit: {item.unit}</span>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-600">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="relative inline-block w-28">
                                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  required
                                  value={item.unitPrice}
                                  onChange={(e) => handleUnitPriceChange(idx, e.target.value)}
                                  className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-right font-semibold outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
                                  placeholder="0.00"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-extrabold text-slate-800">
                              {formatCurrency(sub)}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Subtotal row */}
                      <tr className="bg-slate-50/50 font-bold">
                        <td colSpan={3} className="px-4 py-3 text-right text-slate-500 uppercase tracking-wider">Grand Total Bid:</td>
                        <td className="px-4 py-3 text-right text-blue-600 text-sm font-black">
                          {formatCurrency(calculateGrandTotal())}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Logistical Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Timeline</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      required
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-xs font-semibold"
                      placeholder="e.g. 7 Days or 2 Weeks"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quote Valid Until</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="date"
                      required
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-xs font-semibold text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks/Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks / Terms (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-xs font-medium resize-none h-20"
                  placeholder="Enter any specific terms, discount details, or delivery notes here..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="flex-grow bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer">
                  Discard Draft
                </button>
                <button
                  type="submit"
                  disabled={submittingQuote}
                  className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send size={14} /> {submittingQuote ? 'Submitting...' : 'Submit Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPortal;
