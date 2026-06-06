import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../context/AuthContext.jsx';
import { ArrowRight, Wallet, FileText, ShoppingCart, TrendingUp, MoreHorizontal, ArrowUpRight, Check, Car, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs py-1 px-3 rounded-lg shadow-xl border border-slate-800">
        <p className="font-medium">{`${label} : ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const safeGet = (url) => api.get(url).catch(err => {
        console.warn(`Failed to fetch ${url}:`, err.message);
        return { data: [] };
      });

      const [quo, inv, pos, pay] = await Promise.all([
        safeGet('/quotations'),
        safeGet('/invoices'),
        safeGet('/pos'),
        safeGet('/payments')
      ]);

      const pendingPOs = pos.data.filter((p) => p.status === 'Pending Approval').length;
      const totalPoValue = pos.data.reduce((sum, p) => sum + (p.grandTotal || 0), 0);
      const pendingPaymentAmount = inv.data.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + (i.grandTotal || 0), 0);
      
      const chartData = [
        { name: '1 May - 6 May', value: 45000 },
        { name: '7 May - 12 May', value: 38000 },
        { name: '13 May - 18 May', value: 65000 },
        { name: '19 May - 24 May', value: 25000 },
        { name: '25 May - 30 May', value: 55000 },
      ]; // Mocked chart data for visual effect

      const recentTransactions = [
        { id: 1, desc: 'Vendor Payment - TechCorp', date: 'Mar 12, 2026', method: 'Bank Transfer', category: 'Hardware', amount: -4500, status: 'Completed' },
        { id: 2, desc: 'Client Payment Received', date: 'Mar 12, 2026', method: 'PayPal', category: 'Income', amount: 1550, status: 'Completed' },
        { id: 3, desc: 'Software License Renew', date: 'Mar 11, 2026', method: 'Credit Card', category: 'Software', amount: -120, status: 'Completed' }
      ];

      setStats({
        quotations: quo.data.length,
        pendingPOs,
        totalPoValue,
        pendingPaymentAmount,
        chartData,
        recentTransactions
      });
    } catch (error) {
      console.error('Error fetching stats', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading your workspace...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Header */}
      <div className="pt-6 pb-10 text-white">
        <p className="text-[11px] text-blue-200/70 mb-2 tracking-[0.2em] font-semibold uppercase">Monday, 11 May 2026</p>
        <h1 className="text-4xl md:text-[44px] font-display font-light tracking-tight text-white/95">
          Welcome back, <span className="font-medium text-white">{user?.name || 'Oripio'}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Balance & Spending) */}
        <div className="space-y-6">
          
          {/* Balance Card */}
          <div className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/60">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-2.5 text-slate-500">
                <div className="p-1.5 bg-blue-50/50 rounded-lg"><Wallet size={16} className="text-blue-500" /></div>
                <span className="font-semibold text-[11px] uppercase tracking-widest text-slate-400">Total Portfolio</span>
              </div>
              <div className="bg-slate-50 px-3 py-1 rounded-full text-xs font-bold text-slate-600 border border-slate-100 flex items-center">
                <span className="w-4 h-4 rounded-full bg-blue-500 mr-2 flex items-center justify-center text-[10px] text-white">₹</span>
                INR <ChevronDown size={12} className="ml-1" />
              </div>
            </div>
            
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-[40px] font-display font-medium text-slate-900 tracking-tight leading-none mb-3">{formatCurrency(stats.totalPoValue || 105435)}</h2>
                <div className="flex items-center text-[11px] font-medium">
                  <div className="flex items-center text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded-full mr-2.5">
                    <TrendingUp size={10} className="mr-1" strokeWidth={3} /> +12.4%
                  </div>
                  <span className="text-slate-400 tracking-wide">Balance increase</span>
                </div>
              </div>
              {/* Mini visual grid */}
              <div className="grid grid-cols-4 gap-1 opacity-80">
                 {[...Array(16)].map((_, i) => (
                   <div key={i} className={`w-3 h-3 rounded-sm ${i % 3 === 0 ? 'bg-blue-500' : i % 5 === 0 ? 'bg-cyan-400' : i % 7 === 0 ? 'bg-emerald-400' : 'bg-slate-100'}`}></div>
                 ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Link to="/pos" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold text-xs tracking-wide flex justify-center items-center transition-all shadow-lg shadow-blue-500/25">
                <ShoppingCart size={14} className="mr-2" /> View POs
              </Link>
              <Link to="/payments" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl font-semibold text-xs tracking-wide flex justify-center items-center transition-all shadow-lg shadow-slate-900/20">
                <ArrowUpRight size={14} className="mr-2" /> Make Payment
              </Link>
              <button className="bg-slate-50 hover:bg-slate-100 p-3 rounded-2xl border border-slate-200 transition-colors">
                <MoreHorizontal size={18} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Spending Overview Card */}
          <div className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/60">
            <div className="flex items-center space-x-2.5 text-slate-500 mb-6">
              <div className="p-1.5 bg-indigo-50/50 rounded-lg"><FileText size={16} className="text-indigo-500" /></div>
              <span className="font-semibold text-[11px] uppercase tracking-widest text-slate-400">Spending Overview</span>
            </div>
            <div className="flex justify-between items-end mb-5">
              <h3 className="text-[26px] font-display font-medium text-slate-900 leading-none">{formatCurrency(24678)}</h3>
              <p className="text-[11px] text-slate-400 font-medium">From <span className="font-semibold text-slate-700">{formatCurrency(30000)}</span></p>
            </div>
            
            {/* Progress Bars */}
            <div className="flex h-6 mb-4 space-x-1">
              <div className="bg-blue-500 h-full rounded-l-md" style={{ width: '40%' }}></div>
              <div className="bg-purple-400 h-full" style={{ width: '25%' }}></div>
              <div className="bg-cyan-400 h-full" style={{ width: '20%' }}></div>
              <div className="bg-emerald-400 h-full rounded-r-md" style={{ width: '15%' }}></div>
            </div>
            
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>Hardware <span className="text-slate-800 ml-1 font-bold">40%</span></div>
              <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-purple-400 mr-1.5"></div>Services <span className="text-slate-800 ml-1 font-bold">25%</span></div>
              <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-cyan-400 mr-1.5"></div>Software <span className="text-slate-800 ml-1 font-bold">20%</span></div>
            </div>
          </div>

        </div>

        {/* Middle Column (Chart) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/60 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
               <div className="flex items-center space-x-2.5 text-slate-500">
                <div className="p-1.5 bg-blue-50/50 rounded-lg"><TrendingUp size={16} className="text-blue-500" /></div>
                <span className="font-semibold text-[11px] uppercase tracking-widest text-slate-400">Payment Overview</span>
              </div>
              <button className="bg-slate-50 px-3 py-1.5 rounded-full text-[11px] font-semibold text-slate-600 border border-slate-200/60 flex items-center hover:bg-slate-100 transition-colors">
                Monthly <ChevronDown size={12} className="ml-1" />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Total Payment</p>
              <div className="flex items-center">
                <h2 className="text-[40px] font-display font-medium text-slate-900 mr-4 leading-none">{formatCurrency(stats.totalPoValue || 105435)}</h2>
                <div className="flex items-center text-[11px] font-medium text-emerald-600 bg-emerald-50/80 px-2.5 py-1 rounded-full mr-3">
                  <TrendingUp size={10} className="mr-1.5" strokeWidth={3} /> +8.9%
                </div>
                <span className="text-[11px] font-medium text-slate-400 tracking-wide">vs last month</span>
              </div>
            </div>

            <div className="flex-1 min-h-[200px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="url(#colorValue)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/60">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-medium text-slate-900 text-[17px]">Transactions History</h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-slate-50 border border-slate-200/60 rounded-full py-2 px-4 pl-9 text-xs font-medium text-slate-600 focus:outline-none focus:border-blue-300 w-56 transition-colors"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100/80">
                <tr>
                  <th className="pb-4 font-semibold">Description</th>
                  <th className="pb-4 font-semibold">Date</th>
                  <th className="pb-4 font-semibold">Method</th>
                  <th className="pb-4 font-semibold text-right">Amount</th>
                  <th className="pb-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentTransactions?.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 flex items-center font-medium text-slate-900">
                      <div className={`w-8 h-8 rounded-lg mr-3 flex items-center justify-center ${t.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {t.amount > 0 ? <ArrowRight size={14} /> : <ShoppingCart size={14} />}
                      </div>
                      {t.desc}
                    </td>
                    <td className="py-4 text-slate-500">{t.date}</td>
                    <td className="py-4 text-slate-500">{t.method}</td>
                    <td className={`py-4 text-right font-display font-medium ${t.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                      {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                    </td>
                    <td className="py-4 text-center">
                      <span className="bg-emerald-50/50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold border border-emerald-100/50">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Savings Goals */}
        <div className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/60">
          <div className="flex justify-between items-center mb-7">
            <div className="flex items-center space-x-2.5 text-slate-900">
              <div className="p-1.5 bg-blue-50/50 rounded-lg"><Wallet size={16} className="text-blue-500" /></div>
              <span className="font-display font-medium text-[17px]">Savings goals</span>
            </div>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18} /></button>
          </div>
          
          <div className="border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Car size={18} className="text-slate-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Procurement Fund</h4>
                  <p className="text-xs text-slate-500">Monthly savings: {formatCurrency(1000)}</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
            </div>
            
            <div className="flex justify-between items-end mt-4 mb-2">
              <h3 className="font-bold text-lg text-slate-900">{formatCurrency(15600)}</h3>
              <span className="text-xs text-slate-500">Target: {formatCurrency(25000)}</span>
            </div>
            
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '62%' }}></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper chevron
const ChevronDown = ({size, className}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>
);

export default Dashboard;