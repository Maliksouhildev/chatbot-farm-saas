"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ArrowLeft, 
  Bot, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for recovery session from Supabase URL hash / params
  useEffect(() => {
    async function checkRecoverySession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        } else {
          // Check if there is an access_token in the hash
          if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = params.get('access_token');
            if (accessToken) {
              const { data: userData } = await supabase.auth.getUser(accessToken);
              if (userData?.user?.email) {
                setUserEmail(userData.user.email);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Recovery session check notice:', e);
      } finally {
        setIsVerifyingSession(false);
      }
    }

    checkRecoverySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. First attempt Supabase client updateUser if recovery session is active
      let clientSuccess = false;
      try {
        const { error: sbErr } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (!sbErr) {
          clientSuccess = true;
        }
      } catch {}

      // 2. Also ensure backend persistence and sync via /api/auth/reset-password if email known
      if (userEmail) {
        await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reset',
            email: userEmail,
            newPassword,
          }),
        });
      }

      setSuccessMessage('Your password has been reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      console.error('Password reset submit error:', err);
      setErrorMessage(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#ECECE2] dark:bg-[#0F1115] flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 selection:bg-[#EB6708] selection:text-white transition-colors">
      {/* Top Back Link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Sign In</span>
        </Link>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-300 dark:border-orange-800/60">
          Security Center
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#1A1D23] rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] shadow-xl p-6 sm:p-8 relative overflow-hidden">
        {/* Ambient Gradient */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#EB6708]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#EB6708] to-[#FF8C38] flex items-center justify-center shadow-lg shadow-[#EB6708]/25 text-white mb-3 ring-4 ring-orange-100 dark:ring-orange-950/50">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
            {userEmail ? (
              <>Resetting password for <span className="font-bold text-neutral-800 dark:text-neutral-200">{userEmail}</span></>
            ) : (
              'Enter and confirm your new secure password below.'
            )}
          </p>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* Password Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {/* Hidden decoy fields to defeat aggressive browser autofill */}
          <input type="text" style={{ display: 'none' }} tabIndex={-1} readOnly />
          <input type="password" style={{ display: 'none' }} tabIndex={-1} readOnly />

          {/* If userEmail is not set, allow typing email */}
          {!userEmail && (
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Your Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-[#EB6708] focus:ring-2 focus:ring-[#EB6708]/20 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              New Password (min. 6 characters)
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-neutral-400 dark:text-neutral-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-[#EB6708] focus:ring-2 focus:ring-[#EB6708]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-neutral-400 dark:text-neutral-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-[#EB6708] focus:ring-2 focus:ring-[#EB6708]/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#EB6708] to-[#FF8C38] hover:opacity-95 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-[#EB6708]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Update Password & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Remembered your credentials?{' '}
            <Link 
              href="/login" 
              className="font-bold text-[#EB6708] hover:underline cursor-pointer ml-1"
            >
              Sign in now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
