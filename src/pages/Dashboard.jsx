import React, { useEffect, useState, useRef } from 'react';
import { useAuth, api } from '../context/AuthContext.jsx';
import { 
  Wallet, 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  MoreHorizontal, 
  ArrowUpRight, 
  Check, 
  Search, 
  ChevronDown,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Dropdown states & refs
  const [currency, setCurrency] = useState('INR');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef(null);

  const [timeframe, setTimeframe] = useState('Monthly');
  const [timeframeOpen, setTimeframeOpen] = useState(false);
  const timeframeRef = useRef(null);
  
  // Search state for activity logs
  const [searchQuery, setSearchQuery] = useState('');

  // Click outside detection for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setCurrencyOpen(false);
      }
      if (timeframeRef.current && !timeframeRef.current.contains(event.target)) {
        setTimeframeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStats = async () => {
    try {
      const safeGet = (url) => api.get(url).catch(err => {
        console.warn(`Failed to fetch ${url}:`, err.message);
        return { data: [] };
      });

      const [quo, inv, pos, pay, logs] = await Promise.all([
        safeGet('/quotations'),
        safeGet('/invoices'),
        safeGet('/pos'),
        safeGet('/payments'),
        safeGet('/activity-logs?limit=10')
      ]);

      const pendingPOs = pos.data.filter((p) => p.status === 'Pending Approval').length;
      const totalPoValue = pos.data.reduce((sum, p) => sum + (p.grandTotal || 0), 0);
      const pendingPaymentAmount = inv.data.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + (i.grandTotal || 0), 0);

      setStats({
        quotations: quo.data.length,
        pendingPOs,
        totalPoValue,
        pendingPaymentAmount,
        recentActivity: logs.data,
        payments: pay.data,
        invoices: inv.data,
        pos: pos.data
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

  const payments = stats.payments || [];
  const invoices = stats.invoices || [];
  const pos = stats.pos || [];

  // Safe date parser
  const parseDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  // Helper: Get local date string YYYY-MM-DD
  const getLocalDateString = (dateVal) => {
    const d = parseDate(dateVal);
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Helper: Get local year-month string YYYY-MM
  const getYearMonthString = (dateVal) => {
    const d = parseDate(dateVal);
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  // Helper: Get dynamic reference date based on latest payment
  const getReferenceDate = (payList) => {
    let referenceDate = new Date();
    if (payList && payList.length > 0) {
      const times = payList
        .map(p => {
          const d = parseDate(p.paymentDate || p.createdAt);
          return d ? d.getTime() : null;
        })
        .filter(t => t !== null);
      if (times.length > 0) {
        referenceDate = new Date(Math.max(...times));
      }
    }
    return referenceDate;
  };

  // Helper: Format values based on dynamic currency state
  const formatValue = (val) => {
    if (currency === 'USD') {
      return `$${Number((val || 0) / 83).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return `₹${Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // 1. Calculate Spending Overview Categories from Payments
  const getCategorySpending = (payList, invList, poList) => {
    const invoiceMap = new Map(invList.map(i => [i.id || i._id, i]));
    const poMap = new Map(poList.map(p => [p.id || p._id, p]));

    const spending = {
      IT: 0,
      Manufacturing: 0,
      Services: 0,
      Logistics: 0
    };

    payList.forEach(p => {
      const invoice = invoiceMap.get(p.invoiceId);
      const po = invoice ? poMap.get(invoice.poId) : null;
      const category = po?.vendor?.category || 'Services';
      
      if (spending[category] !== undefined) {
        spending[category] += (p.amountPaid || 0);
      } else {
        spending['Services'] += (p.amountPaid || 0);
      }
    });

    const total = Object.values(spending).reduce((sum, v) => sum + v, 0);

    return { spending, total };
  };

  const { spending: categorySpend, total: categoryTotal } = getCategorySpending(payments, invoices, pos);
  
  // Percentages and width styles
  const itPct = categoryTotal > 0 ? Math.round((categorySpend.IT / categoryTotal) * 100) : 0;
  const mfgPct = categoryTotal > 0 ? Math.round((categorySpend.Manufacturing / categoryTotal) * 100) : 0;
  const svcPct = categoryTotal > 0 ? Math.round((categorySpend.Services / categoryTotal) * 100) : 0;
  const logPct = categoryTotal > 0 ? Math.round((categorySpend.Logistics / categoryTotal) * 100) : 0;

  const itWidth = categoryTotal > 0 ? `${(categorySpend.IT / categoryTotal) * 100}%` : '0%';
  const mfgWidth = categoryTotal > 0 ? `${(categorySpend.Manufacturing / categoryTotal) * 100}%` : '0%';
  const svcWidth = categoryTotal > 0 ? `${(categorySpend.Services / categoryTotal) * 100}%` : '0%';
  const logWidth = categoryTotal > 0 ? `${(categorySpend.Logistics / categoryTotal) * 100}%` : '0%';

  // 2. Aggregate Payment Chart Data
  const aggregatePayments = (payList, timeframeMode) => {
    const refDate = getReferenceDate(payList);
    const refMidnight = new Date(refDate);
    refMidnight.setHours(23, 59, 59, 999);

    if (timeframeMode === 'Weekly') {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(refMidnight);
        d.setDate(d.getDate() - i);
        
        const dateStr = getLocalDateString(d);
        const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const value = payList
          .filter(p => getLocalDateString(p.paymentDate || p.createdAt) === dateStr)
          .reduce((sum, p) => sum + (p.amountPaid || 0), 0);

        data.push({ name: label, value });
      }
      return data;
    } else if (timeframeMode === 'Monthly') {
      const data = [];
      for (let i = 4; i >= 0; i--) {
        const start = new Date(refMidnight);
        start.setDate(start.getDate() - (i * 6 + 5));
        start.setHours(0, 0, 0, 0);

        const end = new Date(refMidnight);
        end.setDate(end.getDate() - (i * 6));
        end.setHours(23, 59, 59, 999);

        const label = `${start.getDate()} ${start.toLocaleString('default', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('default', { month: 'short' })}`;
        const startTime = start.getTime();
        const endTime = end.getTime();

        const value = payList
          .filter(p => {
            const pDate = parseDate(p.paymentDate || p.createdAt);
            if (!pDate) return false;
            const t = pDate.getTime();
            return t >= startTime && t <= endTime;
          })
          .reduce((sum, p) => sum + (p.amountPaid || 0), 0);

        data.push({ name: label, value });
      }
      return data;
    } else if (timeframeMode === 'Yearly') {
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(refMidnight);
        d.setMonth(d.getMonth() - i);
        
        const yearMonth = getYearMonthString(d);
        const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        const value = payList
          .filter(p => getYearMonthString(p.paymentDate || p.createdAt) === yearMonth)
          .reduce((sum, p) => sum + (p.amountPaid || 0), 0);

        data.push({ name: label, value });
      }
      return data;
    } else {
      // All
      const monthlyGroups = {};
      payList.forEach(p => {
        const d = parseDate(p.paymentDate || p.createdAt);
        if (!d) return;
        const key = getYearMonthString(d);
        monthlyGroups[key] = (monthlyGroups[key] || 0) + (p.amountPaid || 0);
      });

      if (Object.keys(monthlyGroups).length === 0) {
        return [{ name: 'No Payments', value: 0 }];
      }

      const sortedKeys = Object.keys(monthlyGroups).sort();
      return sortedKeys.map(key => {
        const [year, month] = key.split('-');
        const d = new Date(parseInt(year), parseInt(month) - 1, 1);
        const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        return { name: label, value: monthlyGroups[key] };
      });
    }
  };

  const rawChartData = aggregatePayments(payments, timeframe);
  
  // Convert chart values on the fly to selected currency
  const chartData = rawChartData.map(item => ({
    name: item.name,
    value: currency === 'USD' ? item.value / 83 : item.value
  }));

  // 3. Total Payment in Selected Timeframe
  const getFilteredTotalPayment = (payList, timeframeMode) => {
    const refDate = getReferenceDate(payList);
    const refMidnight = new Date(refDate);
    refMidnight.setHours(23, 59, 59, 999);
    const refTime = refMidnight.getTime();

    if (timeframeMode === 'All') {
      return payList.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    }

    let startDate = new Date(refMidnight);
    if (timeframeMode === 'Weekly') {
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframeMode === 'Monthly') {
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframeMode === 'Yearly') {
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
    }

    const startTime = startDate.getTime();

    return payList
      .filter(p => {
        const d = parseDate(p.paymentDate || p.createdAt);
        if (!d) return false;
        const t = d.getTime();
        return t >= startTime && t <= refTime;
      })
      .reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  };

  const totalPaymentInTimeframe = getFilteredTotalPayment(payments, timeframe);

  // Previous period total payment (for growth calculation)
  const getPreviousPeriodPayment = (payList, timeframeMode) => {
    const refDate = getReferenceDate(payList);
    const refMidnight = new Date(refDate);
    refMidnight.setHours(23, 59, 59, 999);

    let startDate, endDate;
    if (timeframeMode === 'Weekly') {
      endDate = new Date(refMidnight);
      endDate.setDate(endDate.getDate() - 7);
      
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframeMode === 'Monthly') {
      endDate = new Date(refMidnight);
      endDate.setDate(endDate.getDate() - 30);
      
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframeMode === 'Yearly') {
      endDate = new Date(refMidnight);
      endDate.setFullYear(endDate.getFullYear() - 1);
      
      startDate = new Date(endDate);
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
    } else {
      return 0;
    }

    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return payList
      .filter(p => {
        const d = parseDate(p.paymentDate || p.createdAt);
        if (!d) return false;
        const t = d.getTime();
        return t >= startTime && t <= endTime;
      })
      .reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  };

  const prevTotal = getPreviousPeriodPayment(payments, timeframe);
  let pctChange = 0;
  if (prevTotal > 0) {
    pctChange = ((totalPaymentInTimeframe - prevTotal) / prevTotal) * 100;
  }

  // 4. Balance Increase / PO value change calculation
  const getPOChangePercentage = (poList) => {
    let referenceDate = new Date();
    if (poList && poList.length > 0) {
      const dates = poList
        .map(p => {
          const d = parseDate(p.createdAt);
          return d ? d.getTime() : null;
        })
        .filter(t => t !== null);
      if (dates.length > 0) {
        referenceDate = new Date(Math.max(...dates));
      }
    }
    const refMidnight = new Date(referenceDate);
    refMidnight.setHours(23, 59, 59, 999);

    const startCurrent = new Date(refMidnight);
    startCurrent.setDate(startCurrent.getDate() - 29);
    startCurrent.setHours(0, 0, 0, 0);

    const endPrev = new Date(startCurrent);
    endPrev.setDate(endPrev.getDate() - 1);
    endPrev.setHours(23, 59, 59, 999);

    const startPrev = new Date(endPrev);
    startPrev.setDate(startPrev.getDate() - 29);
    startPrev.setHours(0, 0, 0, 0);

    const currentPOs = poList.filter(p => {
      const pDate = parseDate(p.createdAt);
      if (!pDate) return false;
      const t = pDate.getTime();
      return t >= startCurrent.getTime() && t <= refMidnight.getTime();
    }).reduce((sum, p) => sum + (p.grandTotal || 0), 0);

    const prevPOs = poList.filter(p => {
      const pDate = parseDate(p.createdAt);
      if (!pDate) return false;
      const t = pDate.getTime();
      return t >= startPrev.getTime() && t <= endPrev.getTime();
    }).reduce((sum, p) => sum + (p.grandTotal || 0), 0);

    if (prevPOs === 0) return 12.4; // Fallback value if no comparison is possible
    return ((currentPOs - prevPOs) / prevPOs) * 100;
  };

  const balanceIncreasePct = getPOChangePercentage(pos);

  // Chart Tooltip Formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const formatted = currency === 'USD' 
        ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      return (
        <div className="bg-slate-900 text-white text-xs py-2 px-3.5 rounded-xl shadow-xl border border-slate-800 animate-in fade-in zoom-in-95 duration-100">
          <p className="font-semibold text-slate-400">{label}</p>
          <p className="text-blue-400 font-bold text-sm mt-0.5">{formatted}</p>
        </div>
      );
    }
    return null;
  };

  // Y-axis tick formatter
  const tickFormatter = (val) => {
    if (currency === 'USD') {
      return `$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`;
    }
    return `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`;
  };

  // Filter activity logs by search query
  const filteredLogs = (stats.recentActivity || []).filter(log => {
    const query = searchQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(query) ||
      log.entity?.toLowerCase().includes(query) ||
      log.entityId?.toString().includes(query) ||
      log.performer?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Header */}
      <div className="pt-6 pb-2 text-white">
        <p className="text-[11px] text-blue-200/70 mb-2 tracking-[0.2em] font-semibold uppercase">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 className="text-4xl md:text-[44px] font-display font-light tracking-tight text-white/95">
          Welcome back, <span className="font-medium text-white">{user?.name || 'Oripio'}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Total Portfolio & Spending Overview) */}
        <div className="space-y-6">
          
          {/* Balance Card ("Total Portfolio") */}
          <div className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/60 relative overflow-visible group">
            {/* Header row containing currency dropdown - raised to z-30 relative to stay above the visual grid */}
            <div className="flex justify-between items-start mb-6 z-30 relative" ref={currencyRef}>
              <div className="flex items-center space-x-2.5 text-slate-500">
                <div className="p-1.5 bg-blue-50/50 rounded-lg"><Wallet size={16} className="text-blue-500" /></div>
                <span className="font-semibold text-[11px] uppercase tracking-widest text-slate-400">Total Portfolio</span>
              </div>
              
              {/* Currency Dropdown Selector */}
              <div className="relative">
                <button 
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className="bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 border border-slate-200/60 flex items-center transition-colors focus:outline-none"
                >
                  <span className="w-4 h-4 rounded-full bg-blue-500 mr-1.5 flex items-center justify-center text-[10px] text-white">
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  {currency} <ChevronDown size={12} className={`ml-1 transition-transform duration-200 ${currencyOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {currencyOpen && (
                  <div className="absolute right-0 mt-1.5 w-28 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <button 
                      onClick={() => { setCurrency('INR'); setCurrencyOpen(false); }}
                      className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between ${currency === 'INR' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                    >
                      INR (₹)
                      {currency === 'INR' && <Check size={12} className="text-blue-600" />}
                    </button>
                    <button 
                      onClick={() => { setCurrency('USD'); setCurrencyOpen(false); }}
                      className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between ${currency === 'USD' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                    >
                      USD ($)
                      {currency === 'USD' && <Check size={12} className="text-blue-600" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Value Row - Removed z-10 relative to avoid creating stacking context overriding header */}
            <div className="mb-8 flex justify-between items-end relative z-0">
              <div>
                <h2 className="text-[38px] font-display font-semibold text-slate-900 tracking-tight leading-none mb-3">
                  {formatValue(stats.totalPoValue)}
                </h2>
                <div className="flex items-center text-[11px] font-medium">
                  <div className={`flex items-center px-2 py-0.5 rounded-full mr-2.5 ${balanceIncreasePct >= 0 ? 'text-emerald-600 bg-emerald-50/80' : 'text-rose-600 bg-rose-50/80'}`}>
                    {balanceIncreasePct >= 0 ? <TrendingUp size={10} className="mr-1" strokeWidth={3} /> : <TrendingDown size={10} className="mr-1" strokeWidth={3} />}
                    {balanceIncreasePct >= 0 ? '+' : ''}{balanceIncreasePct.toFixed(1)}%
                  </div>
                  <span className="text-slate-400 tracking-wide">Balance increase</span>
                </div>
              </div>
              
              {/* Mini visual grid */}
              <div className="grid grid-cols-4 gap-1 opacity-80 shrink-0">
                 {[...Array(16)].map((_, i) => (
                   <div key={i} className={`w-3 h-3 rounded-sm transition-all duration-300 ${i % 3 === 0 ? 'bg-blue-500' : i % 5 === 0 ? 'bg-cyan-400' : i % 7 === 0 ? 'bg-emerald-400' : 'bg-slate-100'}`}></div>
                 ))}
              </div>
            </div>

            <div className="flex space-x-3 relative z-0">
              <Link to="/pos" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold text-xs tracking-wide flex justify-center items-center transition-all shadow-lg shadow-blue-500/25">
                <ShoppingCart size={14} className="mr-2" /> View POs
              </Link>
              <Link to="/invoices" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl font-semibold text-xs tracking-wide flex justify-center items-center transition-all shadow-lg shadow-slate-900/20">
                <ArrowUpRight size={14} className="mr-2" /> Invoices
              </Link>
            </div>
          </div>

          {/* Spending Overview Card */}
          <div className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/60">
            <div className="flex items-center space-x-2.5 text-slate-500 mb-6">
              <div className="p-1.5 bg-indigo-50/50 rounded-lg"><FileText size={16} className="text-indigo-500" /></div>
              <span className="font-semibold text-[11px] uppercase tracking-widest text-slate-400">Spending Overview</span>
            </div>
            
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">Total Disbursed</span>
                <h3 className="text-2xl font-display font-semibold text-slate-900 leading-none">{formatValue(categoryTotal)}</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Limit: <span className="font-semibold text-slate-700">{formatValue(stats.totalPoValue)}</span>
              </p>
            </div>
            
            {/* Multi-colored Progress Bar */}
            <div className="flex h-3 mb-6 bg-slate-50 rounded-full overflow-hidden p-[2px] border border-slate-100">
              {categoryTotal > 0 ? (
                <>
                  {categorySpend.IT > 0 && <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: itWidth }}></div>}
                  {categorySpend.Manufacturing > 0 && <div className="bg-purple-400 h-full transition-all duration-500" style={{ width: mfgWidth }}></div>}
                  {categorySpend.Services > 0 && <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: svcWidth }}></div>}
                  {categorySpend.Logistics > 0 && <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: logWidth }}></div>}
                </>
              ) : (
                <div className="bg-slate-200 h-full w-full rounded-full"></div>
              )}
            </div>
            
            {/* Legend with Dynamic Values and Percentages */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-semibold text-slate-600">
              <div className="flex items-start space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1"></div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">IT</span>
                  <span className="text-slate-800 font-bold truncate block">{formatValue(categorySpend.IT)}</span>
                  <span className="text-slate-400 font-medium text-[10px]">({itPct}%)</span>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0 mt-1"></div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Manufacturing</span>
                  <span className="text-slate-800 font-bold truncate block">{formatValue(categorySpend.Manufacturing)}</span>
                  <span className="text-slate-400 font-medium text-[10px]">({mfgPct}%)</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 mt-1"></div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Services</span>
                  <span className="text-slate-800 font-bold truncate block">{formatValue(categorySpend.Services)}</span>
                  <span className="text-slate-400 font-medium text-[10px]">({svcPct}%)</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 mt-1"></div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Logistics</span>
                  <span className="text-slate-800 font-bold truncate block">{formatValue(categorySpend.Logistics)}</span>
                  <span className="text-slate-400 font-medium text-[10px]">({logPct}%)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Middle/Right Columns (Chart) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/60 h-full flex flex-col relative overflow-visible">
            {/* Header row containing timeframe dropdown - raised to z-30 relative to stay above the chart */}
            <div className="flex justify-between items-start mb-6 z-30 relative" ref={timeframeRef}>
               <div className="flex items-center space-x-2.5 text-slate-500">
                <div className="p-1.5 bg-blue-50/50 rounded-lg"><TrendingUp size={16} className="text-blue-500" /></div>
                <span className="font-semibold text-[11px] uppercase tracking-widest text-slate-400">Payment Overview</span>
              </div>
              
              {/* Timeframe Dropdown Selector */}
              <div className="relative">
                <button 
                  onClick={() => setTimeframeOpen(!timeframeOpen)}
                  className="bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-slate-600 border border-slate-200/60 flex items-center transition-colors focus:outline-none"
                >
                  {timeframe} <ChevronDown size={12} className={`ml-1 transition-transform duration-200 ${timeframeOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {timeframeOpen && (
                  <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {['Weekly', 'Monthly', 'Yearly', 'All'].map((t) => (
                      <button 
                        key={t}
                        onClick={() => { setTimeframe(t); setTimeframeOpen(false); }}
                        className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between ${timeframe === t ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-slate-600 font-medium'}`}
                      >
                        {t}
                        {timeframe === t && <Check size={12} className="text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6 relative z-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Total Payment</p>
              <div className="flex items-center">
                <h2 className="text-[38px] font-display font-semibold text-slate-900 mr-4 leading-none">
                  {formatValue(totalPaymentInTimeframe)}
                </h2>
                
                {timeframe !== 'All' && prevTotal > 0 && (
                  <div className={`flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full mr-3 ${pctChange >= 0 ? 'text-emerald-600 bg-emerald-50/80' : 'text-rose-600 bg-rose-50/80'}`}>
                    {pctChange >= 0 ? <TrendingUp size={10} className="mr-1" strokeWidth={3} /> : <TrendingDown size={10} className="mr-1" strokeWidth={3} />}
                    {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}%
                  </div>
                )}
                
                {timeframe !== 'All' && prevTotal > 0 && (
                  <span className="text-[11px] font-medium text-slate-400 tracking-wide">
                    vs previous {timeframe === 'Weekly' ? 'week' : timeframe === 'Monthly' ? 'month' : 'year'}
                  </span>
                )}
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="flex-1 min-h-[220px] w-full mt-auto relative z-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    tickFormatter={tickFormatter}
                  />
                  <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="url(#colorValue)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Full-Width Activity Logs */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Activity Logs Table */}
        <div className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/60">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-blue-50/50 rounded-lg"><Layers size={16} className="text-blue-500" /></div>
              <h3 className="font-display font-semibold text-slate-900 text-lg">Recent Activity Logs</h3>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-full py-2 px-4 pl-9 text-xs font-semibold text-slate-600 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 w-full sm:w-60 transition-all placeholder-slate-400"
              />
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {filteredLogs.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100/80">
                  <tr>
                    <th className="pb-4 font-bold">Action</th>
                    <th className="pb-4 font-bold">Entity</th>
                    <th className="pb-4 font-bold">Date</th>
                    <th className="pb-4 font-bold text-right">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map((t) => (
                    <tr key={t.id || t._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 flex items-center font-semibold text-slate-950">
                        <div className="w-8 h-8 rounded-lg mr-3 flex items-center justify-center bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors shrink-0">
                          <FileText size={14} />
                        </div>
                        {t.action}
                      </td>
                      <td className="py-4 text-slate-600 font-medium">
                        {t.entity} <span className="text-slate-400 font-normal">#{t.entityId}</span>
                      </td>
                      <td className="py-4 text-slate-400 font-medium">
                        {new Date(t.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 text-right">
                        <span className="bg-slate-50 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-600 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-colors">
                          {t.performer?.name || 'System'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-slate-400 font-medium text-xs">
                No activity logs found.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;