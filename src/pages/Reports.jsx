import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext.jsx';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, DollarSign, FileText, ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';


const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [spending, setSpending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [statsRes, trendsRes, spendingRes] = await Promise.all([
        api.get('/reports/stats'),
        api.get('/reports/trends'),
        api.get('/reports/spending')]
        );
        setStats(statsRes.data.summary);
        setTrends(trendsRes.data);
        setSpending(spendingRes.data);
      } catch (error) {
        toast.error('Failed to fetch report data');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading reports...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20} /></div>
            <span className="text-sm text-slate-500 font-medium">Quotation Value</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.totalQuotationValue)}</h3>

        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ShoppingCart size={20} /></div>
            <span className="text-sm text-slate-500 font-medium">PO Value</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.totalPOValue)}</h3>

        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><DollarSign size={20} /></div>
            <span className="text-sm text-slate-500 font-medium">Invoice Value</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.totalInvoiceValue)}</h3>

        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingUp size={20} /></div>
            <span className="text-sm text-slate-500 font-medium">Pending Payments</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.pendingPayments)}</h3>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-8">
            <BarChart3 className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-slate-900">Monthly Purchase Trend</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [formatCurrency(value), 'Value']} />

                
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-8">
            <PieIcon className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-slate-900">Vendor-wise Spending</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spending}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {spending.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [formatCurrency(value), 'Spent']} />

                
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>);

};

export default Reports;