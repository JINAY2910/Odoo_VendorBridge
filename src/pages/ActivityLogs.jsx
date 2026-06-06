import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext.jsx';
import { Clock, FileText, ShoppingCart, Receipt, Users, Activity, User, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/activity-logs?limit=50');
      setLogs(data);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  const getEntityIcon = (entity) => {
    switch (entity) {
      case 'Quotation':
        return { icon: FileText, bg: 'bg-blue-50 text-blue-600 border-blue-100', text: 'Quotation' };
      case 'PurchaseOrder':
        return { icon: ShoppingCart, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100', text: 'Purchase Order' };
      case 'Invoice':
        return { icon: Receipt, bg: 'bg-green-50 text-green-600 border-green-100', text: 'Invoice' };
      case 'Vendor':
        return { icon: Users, bg: 'bg-purple-50 text-purple-600 border-purple-100', text: 'Vendor' };
      default:
        return { icon: Activity, bg: 'bg-slate-50 text-slate-600 border-slate-100', text: entity };
    }
  };

  const getActionText = (action, entity, entityId) => {
    const prefix = action === 'Create' ? 'created new' : action.toLowerCase() === 'approve' ? 'approved' : action.toLowerCase() === 'reject' ? 'rejected' : action;
    const entityType = entity === 'PurchaseOrder' ? 'Purchase Order' : entity;
    return `${prefix} ${entityType} #${entityId}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-500 font-medium">Loading system activities...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-blue-600" size={28} /> Activity Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time system audit logs tracking document flows, approvals, and actions</p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all text-slate-600 cursor-pointer flex items-center gap-1.5 font-bold text-xs shadow-sm">
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm text-center py-16 px-6 space-y-4">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
            <Clock size={30} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Activities Logged</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">System events and workflow actions will populate here automatically as they occur.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="relative border-l border-slate-200 ml-4 md:ml-6 space-y-8 py-2">
            {logs.map((log) => {
              const { icon: Icon, bg, text: entityText } = getEntityIcon(log.entity);
              return (
                <div key={log.id || log._id} className="relative pl-8 md:pl-10 animate-fade-in">
                  {/* Bullet point icon */}
                  <span className={`absolute -left-[18px] md:-left-[20px] top-0.5 w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm ${bg}`}>
                    <Icon size={16} />
                  </span>

                  {/* Content card */}
                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">
                          {getActionText(log.action, log.entity, log.entityId)}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                          {entityText}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock size={12} /> {formatTimeAgo(log.createdAt || log.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                      <User size={13} className="text-slate-400" />
                      <span>Performed by: <span className="font-semibold text-slate-700">{log.performer?.name || 'System'}</span></span>
                      <span className="text-slate-300">|</span>
                      <span className="text-[10px] font-mono text-slate-400">{log.performer?.email || 'system@internal'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
