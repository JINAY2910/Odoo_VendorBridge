import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, ShoppingCart, Receipt, CreditCard, UserCircle, LogOut, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['USER', 'MANAGER', 'ADMIN'] },
  { name: 'Vendors', path: '/vendors', icon: Users, roles: ['USER', 'ADMIN'] },
  { name: 'Quotations', path: '/quotations', icon: FileText, roles: ['USER', 'MANAGER', 'ADMIN'] },
  { name: 'Purchase Orders', path: '/pos', icon: ShoppingCart, roles: ['USER', 'MANAGER', 'ADMIN'] },
  { name: 'Invoices', path: '/invoices', icon: Receipt, roles: ['USER', 'MANAGER', 'ADMIN'] },
  { name: 'Payments', path: '/payments', icon: CreditCard, roles: ['USER', 'MANAGER', 'ADMIN'] },
  { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['MANAGER', 'ADMIN'] },
  { name: 'User Management', path: '/users', icon: Settings, roles: ['ADMIN'] },
  { name: 'Profile', path: '/profile', icon: UserCircle, roles: ['USER', 'MANAGER', 'ADMIN'] }];


  const filteredItems = menuItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="w-64 bg-slate-900 text-white h-full flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white">Procurement MS</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{user?.role} Portal</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
              }>
              
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>);

        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-red-400 rounded-lg transition-colors">
          
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>);

};

export default Sidebar;