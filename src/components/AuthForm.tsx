import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, Briefcase, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';

interface AuthFormProps {
  onSuccess?: () => void;
  embedMode?: boolean;
}

export default function AuthForm({ onSuccess, embedMode = false }: AuthFormProps) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!fullName || !phone) {
          setErrorMsg('Full Name and Phone Number are required.');
          setLoading(false);
          return;
        }
        await register(email, password, {
          fullName,
          email,
          phone,
          whatsApp,
          companyName
        });
      }
      onSuccess?.();
    } catch (err: any) {
      console.error('Authentication failure:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${!embedMode ? 'bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl' : ''}`} id="auth-form-container">
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800 mb-6" id="auth-tab-selectors">
        <button
          onClick={() => {
            setIsLogin(true);
            setErrorMsg('');
          }}
          className={`flex-1 pb-3 text-sm font-semibold transition-all ${
            isLogin ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-350'
          }`}
          id="tab-login-btn"
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setIsLogin(false);
            setErrorMsg('');
          }}
          className={`flex-1 pb-3 text-sm font-semibold transition-all ${
            !isLogin ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-500 hover:text-slate-350'
          }`}
          id="tab-register-btn"
        >
          Create Account
        </button>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-100">
          {isLogin ? 'Welcome Back!' : 'Start Your Project'}
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-light">
          {isLogin 
            ? 'Sign in to configure design requirements and track active orders.' 
            : 'Register your development profile to collaborate and secure blueprints.'
          }
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 bg-red-950/40 border border-red-800/40 p-3.5 rounded-xl text-red-400 text-xs font-mono flex items-start gap-2 animate-shake" id="auth-error-banner">
          <span className="font-bold">⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" id="auth-inputs-form">
        {/* Register Fields */}
        {!isLogin && (
          <>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                Full Name <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Utkarsh Bajpai"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-purple-500"
                  id="auth-fullName"
                />
              </div>
            </div>

            {/* Phone & WhatsApp Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                  Phone Number <span className="text-purple-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 7706929484"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-purple-500"
                    id="auth-phone"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                  WhatsApp (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="e.g. 7706929484"
                    value={whatsApp}
                    onChange={(e) => setWhatsApp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-purple-500"
                    id="auth-whatsApp"
                  />
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                Company Name (Optional)
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Sharma Logistics"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-purple-500"
                  id="auth-companyName"
                />
              </div>
            </div>
          </>
        )}

        {/* Common Fields: Email */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">
            Email Address <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              placeholder="e.g. client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
              id="auth-email"
            />
          </div>
        </div>

        {/* Common Fields: Password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">
            Secure Password <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
              id="auth-password"
            />
          </div>
          {!isLogin && (
            <span className="text-[10px] text-slate-550 font-mono block">
              Min 6 characters to align with security guidelines.
            </span>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-950 transition-all active:scale-95 ${
              isLogin 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400' 
                : 'bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-300 hover:to-pink-400'
            }`}
            id="auth-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
                <span>Synchronizing Token...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>{isLogin ? 'Sign In' : 'Create Client Profile'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
