"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Send
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  onSuccess?: () => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  defaultEmail = '',
  onSuccess,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [mode, setMode] = useState<'link' | 'instant'>('link'); // 'link' | 'instant'
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync defaultEmail when modal opens
  React.useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  if (!isOpen) return null;

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send reset link.');
      }

      setSuccessMessage(
        data.message || `Password reset link sent to ${email}! Please check your inbox and spam folder.`
      );
    } catch (err: any) {
      console.error('Send reset link error:', err);
      setErrorMessage(err.message || 'Error requesting password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }
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
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          email,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      // Also attempt direct Supabase sign-in for local tokens
      try {
        await supabase.auth.signInWithPassword({ email, password: newPassword });
      } catch {}

      if (data.user) {
        localStorage.setItem('cf_user_session', JSON.stringify(data.user));
      }

      setSuccessMessage('Password reset successfully! Redirecting...');
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
        window.location.href = '/';
      }, 900);
    } catch (err: any) {
      console.error('Instant reset error:', err);
      setErrorMessage(err.message || 'Error updating password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="relative w-full max-w-md bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 text-neutral-900 dark:text-white z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#EB6708] to-[#FF8C38] flex items-center justify-center text-white font-bold shadow-md shadow-[#EB6708]/20">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                Reset Your Password
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Recover your account access safely and quickly
              </p>
            </div>
          </div>

          {/* Reset Mode Tabs */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('link');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'link'
                  ? 'bg-white dark:bg-[#1A1D23] text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Send Reset Link
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('instant');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'instant'
                  ? 'bg-white dark:bg-[#1A1D23] text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Instant Password Reset
            </button>
          </div>

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Mode 1: Send Reset Link via Email */}
          {mode === 'link' && (
            <form onSubmit={handleSendLink} className="space-y-3.5" autoComplete="off">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-neutral-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-[#EB6708] focus:ring-2 focus:ring-[#EB6708]/20 transition-all"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5">
                  We will send a secure recovery link to your inbox.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#EB6708] to-[#FF8C38] text-white text-xs font-bold hover:opacity-95 shadow-md shadow-[#EB6708]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Mode 2: Instant Password Reset */}
          {mode === 'instant' && (
            <form onSubmit={handleInstantReset} className="space-y-3" autoComplete="off">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-neutral-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-[#EB6708] focus:ring-2 focus:ring-[#EB6708]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  New Password (min. 6 characters)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-neutral-400 pointer-events-none">
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
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-neutral-400 pointer-events-none">
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

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#EB6708] to-[#FF8C38] text-white text-xs font-bold hover:opacity-95 shadow-md shadow-[#EB6708]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Reset & Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
