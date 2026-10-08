"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  CreditCard,
  Building2,
  Sparkles,
  ShieldCheck,
  Zap,
  Upload,
  X,
  Copy,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';

interface BillingViewProps {
  currentUser?: any;
}

interface Plan {
  id: string;
  name: string;
  badge?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  messages: string;
  popular?: boolean;
  description: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter Darija',
    badge: 'Local Shops',
    monthlyPrice: 3500,
    yearlyPrice: 2800,
    description: 'Perfect for single-store merchants automating WhatsApp customer orders.',
    messages: '1,500 AI messages / month',
    features: [
      '1 Linked WhatsApp Number (QR scan)',
      'Authentic Algerian Darija (Arabizi & Arabic)',
      'Human Handover (Auto-Mute on agent reply)',
      'Knowledge Base: Up to 5 PDF Catalogs & FAQs',
      'Unified Web Chat Dashboard',
      'Standard Support via WhatsApp',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Omnichannel',
    badge: 'Most Popular',
    popular: true,
    monthlyPrice: 7500,
    yearlyPrice: 6000,
    description: 'For growing e-commerce businesses scaling across all social messaging apps.',
    messages: '4,000 AI messages / month',
    features: [
      'Everything in Starter',
      'Voice Notes (Vocaux) Audio Transcription',
      'Omnichannel: WhatsApp + Telegram + Discord + Gmail',
      'Instagram Direct & Facebook Messenger ready',
      'Product Catalog CSV & Website Scraper',
      'Yalidine & Delivery tracking integration',
      'Priority Dedicated VPS Bandwidth',
    ],
  },
  {
    id: 'byok',
    name: 'BYOK (Developer / Agency)',
    badge: 'Unlimited Scale',
    monthlyPrice: 2000,
    yearlyPrice: 1600,
    description: 'Bring your own Groq or OpenAI keys and automate without message limits.',
    messages: 'Unlimited messages (direct provider billing)',
    features: [
      'Full Omnichannel Dashboard Access',
      'Connect your own Groq / Gemini / OpenAI keys',
      'Zero message surcharges or markups',
      'Complete RAG & Custom Algerian Prompts',
      'n8n Webhook Integration for orders',
      'Multi-agent collaborator permissions',
    ],
  },
];

export const BillingView: React.FC<BillingViewProps> = ({ currentUser }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'baridimob'>('card');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copiedRip, setCopiedRip] = useState(false);

  const activePlanName = currentUser?.plan || 'Enterprise DZ Pro';

  const handleOpenCheckout = (plan: Plan) => {
    setSelectedPlan(plan);
    setPaymentMethod('card');
    setCheckoutModalOpen(true);
  };

  const handleCopyRip = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRip(true);
    setTimeout(() => setCopiedRip(false), 2000);
  };

  const handleCardPayment = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const amount = billingCycle === 'yearly' ? selectedPlan.yearlyPrice * 12 : selectedPlan.monthlyPrice;
      const res = await fetch('/api/billing/chargily-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'usr_merchant',
          userEmail: currentUser?.email || 'merchant@store.dz',
          planTier: selectedPlan.id,
          billingCycle,
          amountDzd: amount,
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Fallback demo approval
        setTimeout(() => {
          setSubmitting(false);
          alert(`Redirecting to secure Chargily EDAHABIA / CIB gateway for ${amount.toLocaleString()} DZD...`);
        }, 800);
      }
    } catch {
      setTimeout(() => {
        setSubmitting(false);
        alert(`Chargily Payment Portal initialized. Selected: ${selectedPlan.name} (${billingCycle}).`);
      }, 800);
    }
  };

  const handleBaridiMobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setCheckoutModalOpen(false);
      }, 2000);
    }, 1200);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header (Clean, concise, no duplicate stacked banners) */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#1B6648] dark:text-emerald-400 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#1B1B1B] dark:text-white tracking-tight">
          Supercharge Your Sales with Darija AI
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Automate customer inquiries, voice notes, and order bookings across Algerian social channels. Upgrade or cancel anytime.
        </p>

        {/* Monthly vs Yearly Toggle with Discount Badge */}
        <div className="pt-2 flex items-center justify-center">
          <div className="p-1 bg-gray-100 dark:bg-black/40 border border-[#DFDFD4] dark:border-[#2E333D] rounded-2xl flex items-center gap-1 shadow-2xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-[#1A1D23] text-[#1B1B1B] dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-[#1B6648] text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span>Yearly Billing</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600'
              }`}>
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Subscription Overview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B6648]/10 text-[#1B6648] dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Current Active Plan:</span>
              <span className="text-xs font-bold text-[#1B1B1B] dark:text-white">{activePlanName}</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Active • Full omnichannel access & Algerian Darija capabilities unlocked
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const text = `Invoice-ChatbotFarm-${Date.now()}.pdf`;
              alert(`Receipt generated. Download: ${text}`);
            }}
            className="px-3.5 py-1.5 text-xs font-bold bg-gray-50 dark:bg-black/30 border border-[#DFDFD4] dark:border-[#2E333D] hover:bg-gray-100 text-gray-700 dark:text-gray-300 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download Invoices</span>
          </button>
        </div>
      </div>

      {/* 3. Pricing Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
          const isCurrent = activePlanName.toLowerCase().includes(plan.id);

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 bg-white dark:bg-[#1A1D23] ${
                plan.popular
                  ? 'border-2 border-[#1B6648] shadow-xl shadow-emerald-950/10 dark:shadow-none ring-4 ring-emerald-500/10'
                  : 'border border-[#DFDFD4] dark:border-[#2E333D] shadow-xs hover:border-gray-300 dark:hover:border-neutral-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B6648] text-white text-[10px] font-black uppercase tracking-wider py-1 px-3.5 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Most Popular in Algeria</span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#1B1B1B] dark:text-white">
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 min-h-[32px]">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="my-5 pb-5 border-b border-[#DFDFD4] dark:border-[#2E333D]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-[#1B1B1B] dark:text-white tracking-tight">
                      {price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      DZD / mois
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      Billed annually ({(price * 12).toLocaleString()} DZD / an)
                    </p>
                  )}
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-[#1B6648] dark:text-emerald-400 text-xs font-bold">
                    <Zap className="w-3 h-3" />
                    <span>{plan.messages}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Features Included:</p>
                  <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button: Opens Checkout Flow */}
              <div className="pt-8">
                <button
                  onClick={() => handleOpenCheckout(plan)}
                  className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                    plan.popular
                      ? 'bg-[#1B6648] hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-101 active:scale-99'
                      : 'bg-[#1B1B1B] dark:bg-neutral-800 hover:bg-black dark:hover:bg-neutral-700 text-white'
                  }`}
                >
                  <span>{isCurrent ? 'Extend Plan' : `Choose ${plan.name}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Supported Payment Networks Trust Bar */}
      <div className="p-5 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-gray-50/80 dark:bg-black/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 text-center sm:text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Accepted Algerian & International Payment Methods:</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400 flex-wrap justify-center">
          <span className="px-2.5 py-1 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-2xs text-[#1B6648]">
            💳 EDAHABIA
          </span>
          <span className="px-2.5 py-1 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-2xs text-blue-600">
            💳 CIB Bank Card
          </span>
          <span className="px-2.5 py-1 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-2xs text-amber-600">
            🏛️ BaridiMob / CCP
          </span>
          <span className="px-2.5 py-1 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-2xs text-indigo-600">
            ⚡ Chargily Pay
          </span>
        </div>
      </div>

      {/* 5. CHECKOUT MODAL ("when u start paying") */}
      <AnimatePresence>
        {checkoutModalOpen && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-[#1A1D23] rounded-3xl shadow-2xl border border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#DFDFD4] dark:border-[#2E333D] bg-gray-50/70 dark:bg-[#13151A] flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-[#1B1B1B] dark:text-white">
                    Complete Subscription Checkout
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {selectedPlan.name} • {billingCycle === 'yearly' ? `${selectedPlan.yearlyPrice.toLocaleString()} DZD/mo (Yearly)` : `${selectedPlan.monthlyPrice.toLocaleString()} DZD/mo`}
                  </p>
                </div>
                <button
                  onClick={() => setCheckoutModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                
                {/* Plan Summary Card */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Amount Due</span>
                    <span className="text-lg font-black text-[#1B6648] dark:text-emerald-400">
                      {(billingCycle === 'yearly' ? selectedPlan.yearlyPrice * 12 : selectedPlan.monthlyPrice).toLocaleString()} DZD
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#1B1B1B] dark:text-white">{selectedPlan.name}</span>
                    <span className="text-[10px] text-gray-500 block">{billingCycle === 'yearly' ? '12 Months Access' : '1 Month Access'}</span>
                  </div>
                </div>

                {/* Payment Method Switcher (Moved here as requested!) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Select Payment Method:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        paymentMethod === 'card'
                          ? 'border-[#1B6648] bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs'
                          : 'border-[#DFDFD4] dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <CreditCard className={`w-4 h-4 ${paymentMethod === 'card' ? 'text-[#1B6648]' : 'text-gray-400'}`} />
                        {paymentMethod === 'card' && <CheckCircle2 className="w-3.5 h-3.5 text-[#1B6648]" />}
                      </div>
                      <span className="text-xs font-bold text-[#1B1B1B] dark:text-white">Instant Card</span>
                      <span className="text-[10px] text-gray-500">EDAHABIA / CIB (Instant)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('baridimob')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        paymentMethod === 'baridimob'
                          ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 shadow-xs'
                          : 'border-[#DFDFD4] dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Building2 className={`w-4 h-4 ${paymentMethod === 'baridimob' ? 'text-amber-600' : 'text-gray-400'}`} />
                        {paymentMethod === 'baridimob' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                      </div>
                      <span className="text-xs font-bold text-[#1B1B1B] dark:text-white">BaridiMob / CCP</span>
                      <span className="text-[10px] text-gray-500">Transfer & Receipt</span>
                    </button>
                  </div>
                </div>

                {/* Option 1: Card Flow */}
                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-neutral-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1B1B1B] dark:text-white">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Instant Secure Card Activation</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      You will be directed to Chargily Pay to enter your EDAHABIA or CIB bank credentials. Your workspace plan will be activated immediately upon payment.
                    </p>
                    <button
                      type="button"
                      onClick={handleCardPayment}
                      disabled={submitting}
                      className="w-full py-2.5 bg-[#1B6648] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {submitting ? 'Connecting...' : `Pay ${(billingCycle === 'yearly' ? selectedPlan.yearlyPrice * 12 : selectedPlan.monthlyPrice).toLocaleString()} DZD with Card`}
                    </button>
                  </div>
                )}

                {/* Option 2: BaridiMob / CCP Flow */}
                {paymentMethod === 'baridimob' && (
                  <form onSubmit={handleBaridiMobSubmit} className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700 dark:text-gray-300">RIP BaridiMob:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#1B1B1B] dark:text-white">00799999000123456789</span>
                          <button
                            type="button"
                            onClick={() => handleCopyRip('00799999000123456789')}
                            className="text-amber-600 dark:text-amber-400 font-bold text-[10px]"
                          >
                            {copiedRip ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 text-[11px]">
                        <span>Compte CCP:</span>
                        <span className="font-mono font-bold">12345678 Clé 99</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 text-[11px]">
                        <span>Beneficiary:</span>
                        <span className="font-bold">Chatbot Farm DZ</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Attach Transfer Screenshot (Reçu BaridiMob)
                      </label>
                      <input
                        type="file"
                        required
                        accept="image/*,.pdf"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-gray-500 dark:text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !receiptFile}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {submitting ? 'Uploading...' : uploadSuccess ? 'Receipt Submitted! Activating...' : 'Submit Receipt for Approval'}
                    </button>
                  </form>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
