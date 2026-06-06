import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext.jsx';
import { ArrowLeft, FileText, Calendar, Building2, Hash, ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';
import { downloadPDF } from '../utils/download';


const PODetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPO] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPO = async () => {
      try {
        const { data } = await api.get(`/pos/${id}`);
        setPO(data);
      } catch (error) {
        toast.error('Failed to fetch Purchase Order details');
        navigate('/pos');
      } finally {
        setLoading(false);
      }
    };
    fetchPO();
  }, [id, navigate]);

  if (loading) return <div className="p-8 text-center">Loading Purchase Order details...</div>;
  if (!po) return <div className="p-8 text-center text-red-500 font-bold">Purchase Order not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/pos')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
          
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Purchase Order Detail</h1>
          <p className="text-slate-500">View full details of {po.poNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">{po.poNumber}</h2>
                <div className="flex items-center text-slate-500 text-sm">
                  <Calendar size={14} className="mr-1" />
                  {new Date(po.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <span className={`text-xs uppercase font-bold px-3 py-1.5 rounded-full ${
              po.status === 'Approved' ? 'bg-green-100 text-green-700' :
              po.status === 'Rejected' ? 'bg-red-100 text-red-700' :
              po.status === 'Closed' ? 'bg-slate-100 text-slate-700' : 'bg-orange-100 text-orange-700'}`
              }>
                {po.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-400">
                  <Building2 size={18} />
                  <h4 className="text-xs uppercase font-bold tracking-wider">Vendor Information</h4>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-lg">{po.vendorId?.vendorName}</p>
                  <p className="text-slate-600">{po.vendorId?.contactDetails}</p>
                  <p className="text-slate-600">{po.vendorId?.address}</p>
                  <p className="text-slate-600 font-medium">GST: {po.vendorId?.gstNumber}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-400">
                  <Hash size={18} />
                  <h4 className="text-xs uppercase font-bold tracking-wider">References</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-600">Quotation Ref: <span className="font-bold text-slate-900">{po.quotationId?.quotationNumber || 'N/A'}</span></p>
                  <p className="text-slate-600">Created By: <span className="font-bold text-slate-900">{po.createdBy?.name}</span></p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <h4 className="text-xs uppercase font-bold text-slate-400 mb-4 tracking-wider">Line Items</h4>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold">
                    <tr>
                      <th className="px-4 py-4">Item Name</th>
                      <th className="px-4 py-4 text-center">Quantity</th>
                      <th className="px-4 py-4 text-right">Unit Price</th>
                      <th className="px-4 py-4 text-right">Tax (%)</th>
                      <th className="px-4 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {po.lineItems.map((item, idx) => {
                      const itemTotal = item.quantity * item.unitPrice * (1 + (item.tax || 0) / 100);
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 text-slate-900 font-medium">{item.itemName}</td>
                          <td className="px-4 py-4 text-center text-slate-600">{item.quantity}</td>
                          <td className="px-4 py-4 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>

                          <td className="px-4 py-4 text-right text-slate-600">{item.tax}%</td>
                          <td className="px-4 py-4 text-right font-bold text-slate-900">{formatCurrency(itemTotal)}</td>

                        </tr>);

                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(po.subtotal)}</span>

              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span className="font-medium">{formatCurrency(po.tax)}</span>

              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span className="font-medium">-{formatCurrency(po.discount)}</span>

              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-900">Grand Total</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(po.grandTotal)}</span>

              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  try {
                    await downloadPDF(`/pdf/po/${po._id}`, `po-${po.poNumber}.pdf`);
                  } catch (err) {
                    toast.error(err.message);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-all font-bold shadow-sm">
                
                <FileText size={18} />
                Download PDF
              </button>
              {po.status === 'Approved' &&
              <button
                onClick={() => navigate('/invoices', { state: { poId: po._id } })}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-sm">
                
                  <ShoppingCart size={18} />
                  Create Invoice
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default PODetail;