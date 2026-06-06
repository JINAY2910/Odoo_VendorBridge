import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      // For local demo, we'll just show the link directly in toast (since we are not actually emailing)
      if (res.data.resetUrl) {
        toast.info(`Demo Link generated (Check console).`, { autoClose: false });
        console.log(`Demo Reset Link: ${res.data.resetUrl}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error generating reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 w-full max-w-md rounded-3xl p-8 relative z-10 shadow-2xl">
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-blue-400 mb-6 transition-colors">
            <ArrowLeft size={14} className="mr-1" /> Back to Login
          </Link>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Forgot Password?</h2>
          <p className="text-slate-400 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Check your email</h3>
              <p className="text-sm text-slate-400">
                We've sent a password reset link to <span className="text-slate-200 font-semibold">{email}</span>.
                <br /><br />
                <span className="text-xs text-amber-400/80 italic">(Demo: Check your terminal/console for the link)</span>
              </p>
            </div>
            <button
              onClick={() => { setSuccess(false); setEmail(''); }}
              className="mt-2 text-sm font-bold text-emerald-400 hover:text-emerald-300">
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  placeholder="Enter your registered email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
