import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../context/AuthContext.jsx';
import { ArrowLeft, ArrowUpDown, Clock, DollarSign, Award, CheckCircle, HelpCircle, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';

const QuotationComparison = () => {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price'); // 'price' or 'delivery'

  const fetchData = async () => {
    try {
      const [rfqRes, quoRes] = await Promise.all([
        api.get(`/rfqs/${rfqId}`),
        api.get(`/rfqs/${rfqId}/quotations`)
      ]);
      setRfq(rfqRes.data);
      setQuotations(quoRes.data);
    } catch (error) {
      toast.error('Failed to fetch comparison details');
      navigate('/rfqs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [rfqId]);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this quotation and close the bidding?')) return;
    try {
      // 1. Approve the quotation
      await api.put(`/quotations/${id}/approve-reject`, {
        action: 'Approve',
        remarks: 'Approved via side-by-side Quotation Comparison screen.'
      });
      
      // 2. Automatically reject other pending quotations for this RFQ
      const otherQuotes = quotations.filter(q => (q.id || q._id) !== id && q.status === 'Pending Approval');
      for (const other of otherQuotes) {
        await api.put(`/quotations/${other.id || other._id}/approve-reject`, {
          action: 'Reject',
          remarks: 'Rejected because another quotation was selected.'
        });
      }

      // 3. Mark the RFQ as "awarded"
      await api.put(`/rfqs/${rfqId}`, { status: 'awarded' });

      toast.success('Quotation approved & RFQ awarded successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve quotation');
    }
  };

  // Helper to parse delivery timeline into days for sorting
  const getDeliveryDays = (timelineText) => {
    if (!timelineText) return 999;
    const match = timelineText.match(/\d+/);
    return match ? parseInt(match[0], 10) : 999;
  };

  const getSortedQuotations = () => {
    const sorted = [...quotations];
    if (sortBy === 'price') {
      return sorted.sort((a, b) => a.grandTotal - b.grandTotal);
    } else if (sortBy === 'delivery') {
      return sorted.sort((a, b) => getDeliveryDays(a.timeline) - getDeliveryDays(b.timeline));
    }
    return sorted;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-500 font-medium">Analyzing quotations...</span>
      </div>
    );
  }

  const sortedQuotes = getSortedQuotations();
  
  // Find the overall lowest price quotation to highlight
  const lowestPriceQuoteId = quotations.length > 0 
    ? quotations.reduce((lowest, current) => current.grandTotal < lowest.grandTotal ? current : lowest, quotations[0])?._id || quotations.reduce((lowest, current) => current.grandTotal < lowest.grandTotal ? current : lowest, quotations[0])?.id
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/rfqs" className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-500">
                {rfq?.rfqNumber}
              </span>
              <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                rfq?.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                {rfq?.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Compare Bids: {rfq?.title}</h1>
          </div>
        </div>

        {/* Sorting controls */}
        {quotations.length > 0 && (
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm self-start">
            <span className="text-xs text-slate-500 font-bold px-2 flex items-center gap-1">
              <ArrowUpDown size={14} /> Sort By:
            </span>
            <button
              onClick={() => setSortBy('price')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'price' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}>
              Lowest Price
            </button>
            <button
              onClick={() => setSortBy('delivery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'delivery' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}>
              Fastest Delivery
            </button>
          </div>
        )}
      </div>

      {/* RFQ Requirements Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">Target Requirements</h3>
        <p className="text-slate-300 text-sm">{rfq?.description || 'No description provided.'}</p>
        
        <div className="border border-slate-800 rounded-xl overflow-hidden max-w-2xl bg-slate-950/30">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase">
              <tr>
                <th className="px-4 py-2">Item Name</th>
                <th className="px-4 py-2 text-right">Target Qty</th>
                <th className="px-4 py-2 text-right">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {rfq?.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 font-medium">{item.name}</td>
                  <td className="px-4 py-2 text-right font-semibold">{item.quantity}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotations Grid */}
      {quotations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <HelpCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Bids Received Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Assigned vendors have not submitted any quotations for this request yet. We will display them side-by-side once they respond.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedQuotes.map((q) => {
            const isBestPrice = (q.id || q._id) === lowestPriceQuoteId;
            return (
              <div 
                key={q.id || q._id} 
                className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden flex flex-col relative transition-all ${
                  isBestPrice 
                    ? 'border-green-500 ring-4 ring-green-500/10' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}>
                
                {/* Best Price Badge */}
                {isBestPrice && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <Award size={12} />
                    <span>Best Price</span>
                  </div>
                )}

                <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-1 pr-24">
                  <span className="text-xs font-bold font-mono text-slate-400">{q.quotationNumber}</span>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">
                    {q.vendorId?.vendorName || q.vendor?.vendorName || 'Unknown Vendor'}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-slate-500">
                    <span>Submitted by {q.createdBy?.name || 'Vendor Portal'}</span>
                  </div>
                </div>

                <div className="p-6 flex-1 space-y-5">
                  {/* Line Items */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line Items & Pricing</h4>
                    <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/20">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                          <tr>
                            <th className="px-3 py-2">Item</th>
                            <th className="px-3 py-2 text-right">Qty</th>
                            <th className="px-3 py-2 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                          {q.lineItems?.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 font-medium truncate max-w-[120px]">{item.itemName}</td>
                              <td className="px-3 py-2 text-right">{item.quantity}</td>
                              <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatCurrency(item.unitPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Operational Details */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Clock size={12} /> Delivery Time
                      </h5>
                      <p className="text-sm font-bold text-slate-800 mt-1">{q.timeline || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <DollarSign size={12} /> Grand Total
                      </h5>
                      <p className="text-sm font-extrabold text-blue-600 mt-1">{formatCurrency(q.grandTotal)}</p>
                    </div>
                  </div>

                  {/* Vendor Notes */}
                  {q.notes && (
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor Remarks</h4>
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                        "{q.notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  {q.status === 'Pending Approval' ? (
                    <button
                      onClick={() => handleApprove(q.id || q._id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-blue-600/10 transition-all flex items-center justify-center space-x-1.5 cursor-pointer">
                      <CheckCircle size={16} />
                      <span>Select & Approve Bid</span>
                    </button>
                  ) : (
                    <div className="text-center py-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        q.status === 'Approved' || q.status === 'Converted to PO'
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {q.status === 'Converted to PO' ? 'Awarded & Converted to PO' : q.status}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuotationComparison;
