import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, ShoppingCart, Receipt, CreditCard, UserCircle, LogOut, Settings, BarChart3, Bell, Search, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const TopNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, roles: ['USER', 'MANAGER', 'ADMIN'] },
    { name: 'Vendors', path: '/vendors', icon: Users, roles: ['USER', 'ADMIN'] },
    { name: 'RFQs', path: '/rfqs', icon: ClipboardList, roles: ['USER', 'MANAGER', 'ADMIN'] },
    { name: 'Quotations', path: '/quotations', icon: FileText, roles: ['USER', 'MANAGER', 'ADMIN'] },
    { name: 'POs', path: '/pos', icon: ShoppingCart, roles: ['USER', 'MANAGER', 'ADMIN'] },
    { name: 'Invoices', path: '/invoices', icon: Receipt, roles: ['USER', 'MANAGER', 'ADMIN'] },
    { name: 'Payments', path: '/payments', icon: CreditCard, roles: ['USER', 'MANAGER', 'ADMIN'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['MANAGER', 'ADMIN'] },
    { name: 'Users', path: '/users', icon: Settings, roles: ['ADMIN'] }
  ];

  const filteredItems = menuItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="w-full text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="VendorBridge Logo" className="w-8 h-8 object-contain drop-shadow-md rounded-md" />
          <h1 className="text-xl font-display font-medium tracking-tight text-white">VendorBridge</h1>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-6">
          <button className="text-slate-300 hover:text-white transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
          </button>
          
          <div className="flex items-center space-x-3 border-l border-slate-700/50 pl-6 cursor-pointer hover:opacity-80 transition-opacity group">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-semibold text-white tracking-wide">{user?.name || 'Oripio'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">{user?.role || 'Admin'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
               <UserCircle size={24} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
            </div>
            <button onClick={handleLogout} className="ml-2 text-slate-500 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-2 flex items-center space-x-1 overflow-x-auto hide-scrollbar border-b border-white/5">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-white text-slate-900 shadow-md' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {isActive && <item.icon size={16} />}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default TopNavbar;
