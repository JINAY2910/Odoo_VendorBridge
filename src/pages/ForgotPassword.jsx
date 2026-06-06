import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      if (res.data.resetUrl) {
        setResetUrl(res.data.resetUrl);
        toast.info(`Demo Link generated.`, { autoClose: false });
        console.log(`Demo Reset Link: ${res.data.resetUrl}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error generating reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200 overflow-hidden border border-slate-100">
        <div className="p-8 bg-slate-900 text-white text-center relative">
          <Link to="/login" className="absolute left-4 top-4 inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={14} className="mr-1" /> Back
          </Link>
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password?</h1>
          <p className="text-slate-400 text-sm mt-1">Get a link to reset your password</p>
        </div>

        {success ? (
          <div className="p-8 space-y-6">
            <div className="bg-emerald-550/10 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 bg-emerald-50">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Check your email</h3>
                <p className="text-sm text-slate-600">
                  We've sent a password reset link to <span className="text-slate-900 font-semibold">{email}</span>.
                </p>
                {resetUrl && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2">
                    <span className="text-xs text-amber-600 font-semibold block">Demo Mode Reset Link:</span>
                    <a href={resetUrl} className="text-sm text-blue-600 hover:text-blue-500 font-semibold break-all underline block">
                      {resetUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => { setSuccess(false); setEmail(''); setResetUrl(''); }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all">
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]">
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Remembered your password?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline decoration-2 underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
