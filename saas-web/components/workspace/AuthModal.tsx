"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  ArrowLeft, 
  Check, 
  RefreshCw,
  Lock,
  User,
  AlertCircle,
  Building2,
  ExternalLink,
  Bot,
  KeyRound
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { signIn } from 'next-auth/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  notice?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, notice }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'verify'>('signin');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preserve and merge all currently connected apps from the browser session
  const preserveConnectedApps = (userId: string, serverApps: string[] = []) => {
    const userAppsKey = `cf_connected_apps_${userId}`;
    const allFoundApps = new Set<string>();

    try {
      const globalApps = JSON.parse(localStorage.getItem('cf_connected_apps') || '[]');
      if (Array.isArray(globalApps)) globalApps.forEach((a: string) => allFoundApps.add(a));
    } catch {}

    try {
      const localApps = JSON.parse(localStorage.getItem('cf_connected_apps_admin_local') || '[]');
      if (Array.isArray(localApps)) localApps.forEach((a: string) => allFoundApps.add(a));
    } catch {}

    if (Array.isArray(serverApps)) {
      serverApps.forEach((a: string) => allFoundApps.add(a));
    }

    // Check credentials in localStorage
    if (localStorage.getItem('cf_telegram_session') || localStorage.getItem('cf_telegram_token')) allFoundApps.add('telegram');
    if (localStorage.getItem('cf_discord_token') || localStorage.getItem('cf_discord_account')) allFoundApps.add('discord');
    if (localStorage.getItem('cf_whatsapp_number') || localStorage.getItem('cf_whatsapp_linked')) allFoundApps.add('whatsapp');
    if (localStorage.getItem('cf_gmail_account')) allFoundApps.add('gmail');
    if (localStorage.getItem('cf_viber_account')) allFoundApps.add('viber');
    if (localStorage.getItem('cf_snapchat_account')) allFoundApps.add('snapchat');

    const merged = Array.from(allFoundApps);
    try {
      localStorage.setItem('cf_connected_apps', JSON.stringify(merged));
      localStorage.setItem(userAppsKey, JSON.stringify(merged));
    } catch {}
    return merged;
  };

  // Official Google OAuth Sign-In via Supabase & NextAuth
  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    setOauthNotice(null);
    setErrorMsg(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/`,
        },
      });
      if (!error && data?.url) {
        window.location.href = data.url;
        return;
      }
      await signIn('google', { callbackUrl: origin });
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setIsProcessing(false);
      setErrorMsg(err.message || 'Unable to connect to Google sign-in. Please try again.');
    }
  };

  // Dedicated email signin / signup handler
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const endpoint = authMode === 'signin' ? '/api/auth/login' : '/api/auth/signup';
      const payload = authMode === 'signin'
        ? { email, password }
        : { email, password, fullName, companyName };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.requiresVerification) {
          setAuthMode('verify');
          setErrorMsg(data.error || 'Please enter the 6-digit verification code sent to your email.');
          setIsProcessing(false);
          return;
        }
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      // If signup requires verification, transition to verification screen
      if (authMode === 'signup' && data.requiresVerification) {
        setAuthMode('verify');
        setSuccessMsg(data.message || 'Verification code sent to your email! Please check your inbox.');
        setIsProcessing(false);
        return;
      }

      // Save user session & preserve all connected channels
      localStorage.setItem('cf_user_session', JSON.stringify(data.user));
      preserveConnectedApps(data.user.id, data.user.connectedApps);

      onSuccess(data.user);
      onClose();
      resetState();
    } catch (err: any) {
      console.error('Email auth error:', err);
      setErrorMsg(err.message || 'Authentication error.');
      setIsProcessing(false);
    }
  };

  // Verification code submission handler
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length < 6) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired verification code.');
      }

      // Now attempt auto-login with credentials if password is present
      if (password) {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData.success) {
          localStorage.setItem('cf_user_session', JSON.stringify(loginData.user));
          preserveConnectedApps(loginData.user.id, loginData.user.connectedApps);
          onSuccess(loginData.user);
          onClose();
          resetState();
          return;
        }
      }

      setAuthMode('signin');
      setSuccessMsg('Email verified successfully! Please sign in with your password.');
      setIsProcessing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed.');
      setIsProcessing(false);
    }
  };

  // Resend verification code handler
  const handleResendCode = async () => {
    if (!email) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to resend code.');
      }
      setSuccessMsg('New verification code sent! Please check your inbox.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not resend verification code.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setIsProcessing(false);
    setOauthNotice(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setCompanyName('');
    setVerificationCode('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            onClose();
            resetState();
          }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="relative w-full max-w-md bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] rounded-3xl p-6 shadow-2xl space-y-4 text-[#1B1B1B] dark:text-white z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => {
              onClose();
              resetState();
            }}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#EB6708] to-[#FB9B3C] flex items-center justify-center text-white font-black text-base shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1B6648] dark:text-emerald-400">
                {authMode === 'verify' 
                  ? 'Verify Your Email' 
                  : authMode === 'signin' 
                  ? 'Sign In to Chatbot Farm' 
                  : 'Create Merchant Account'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {authMode === 'verify'
                  ? `Enter the confirmation code sent to ${email}`
                  : 'Algerian Omnichannel & Darija AI Platform'}
              </p>
            </div>
          </div>

          {/* Mode Tabs (Sign In vs Register) */}
          {authMode !== 'verify' && (
            <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-[#1A1D23] text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-[#1A1D23] text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {notice && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{notice}</span>
            </div>
          )}

          {oauthNotice && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-900 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{oauthNotice}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VERIFY MODE */}
          {authMode === 'verify' ? (
            <form onSubmit={handleVerifyCode} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-[#ECECE2]/50 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-center tracking-widest font-mono font-bold text-base focus:outline-none focus:border-[#EB6708]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 bg-[#EB6708] hover:bg-[#D95D07] text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isProcessing}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 underline cursor-pointer"
                >
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMsg(null);
                  }}
                  className="text-[#EB6708] font-bold hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Official Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-100 text-xs font-bold flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{authMode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}</span>
              </button>

              <div className="relative flex items-center justify-center my-3 h-6">
                <div className="border-t border-[#DFDFD4] dark:border-neutral-700 w-full" />
                <span className="bg-white dark:bg-[#1A1D23] px-3.5 py-0.5 rounded-full border border-[#DFDFD4] dark:border-neutral-700 text-[10px] text-gray-400 dark:text-neutral-400 uppercase tracking-wider font-bold absolute shadow-2xs">
                  Or with email
                </span>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmitEmail} className="space-y-2.5">
                {authMode === 'signup' && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sarah Connor"
                        className="w-full bg-[#ECECE2]/50 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EB6708]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Store / Business Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="El Bahdja Store"
                        className="w-full bg-[#ECECE2]/50 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EB6708]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="store@example.com"
                    className="w-full bg-[#ECECE2]/50 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EB6708]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#ECECE2]/50 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EB6708]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-[#EB6708] hover:bg-[#D95D07] text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>{authMode === 'signin' ? 'Sign In to Workspace' : 'Create Merchant Account'}</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Dedicated page links */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
            <Link 
              href="/login" 
              onClick={onClose}
              className="text-neutral-500 dark:text-neutral-400 hover:text-[#EB6708] flex items-center gap-1 transition-colors"
            >
              <span>Full Login Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link 
              href="/signup" 
              onClick={onClose}
              className="text-[#EB6708] font-semibold hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Full Register Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
