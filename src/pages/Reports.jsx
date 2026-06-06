import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShoppingCart, DollarSign, AlertCircle, Download, BarChart3, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/summary');
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // KPI summary
    csvContent += "KPI SUMMARY\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Vendors,${data.totalVendors}\n`;
    csvContent += `Total POs,${data.totalPOs}\n`;
    csvContent += `Total Invoiced,${data.totalInvoiced}\n`;
    csvContent += `Pending Approvals,${data.pendingApprovals}\n`;
    csvContent += `Total POs This Month,${data.totalPOsThisMonth}\n`;
    csvContent += `Total Invoice Value,${data.totalInvoiceValue}\n\n`;

    // Monthly Spend
    csvContent += "MONTHLY SPEND (LAST 6 MONTHS)\n";
    csvContent += "Month,Spend\n";
    data.monthlySpend.forEach(item => {
      csvContent += `"${item.month}",${item.spend}\n`;
    });
    csvContent += "\n";

    // Top Vendors
    csvContent += "TOP VENDORS BY SPEND\n";
    csvContent += "Vendor Name,PO Count,Total Spend\n";
    data.topVendors.forEach(vendor => {
      csvContent += `"${vendor.vendorName}",${vendor.poCount},${vendor.totalSpent}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `procurement_summary_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV report exported successfully');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-500 font-medium">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={28} /> Reports & Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review system metrics, financial summaries, vendor performance, and exports</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/10 transition-all flex items-center gap-1.5 cursor-pointer text-sm">
          <Download size={16} /> Export Summary CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Vendors */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Vendors</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.totalVendors}</h3>
          </div>
        </div>

        {/* Total POs */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total POs</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.totalPOs}</h3>
          </div>
        </div>

        {/* Total Invoiced */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Invoiced</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(data?.totalInvoiced)}</h3>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.pendingApprovals}</h3>
          </div>
        </div>
      </div>

      {/* Main Charts & Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Spend Bar Chart */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-slate-900">Monthly Spend (Last 6 Months)</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlySpend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [formatCurrency(value), 'Spend']}
                />
                <Bar dataKey="spend" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Vendors Table */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-slate-900">Top Vendors by spend</h3>
          </div>
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Vendor Name</th>
                  <th className="px-4 py-3 text-center">PO Count</th>
                  <th className="px-4 py-3 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {data?.topVendors?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic">No vendor spends logged yet</td>
                  </tr>
                ) : (
                  data?.topVendors?.map((vendor, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{vendor.vendorName}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-500">{vendor.poCount}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-blue-600">{formatCurrency(vendor.totalSpent)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;