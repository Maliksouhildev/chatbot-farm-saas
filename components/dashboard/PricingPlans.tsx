'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, Upload, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

interface PricingPlansProps {
    userId: string;
    userEmail: string;
    currentPlan?: string;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({
    userId,
    userEmail,
    currentPlan = 'starter',
}) => {
    const [selectedBilling, setSelectedBilling] = useState<'chargily' | 'baridimob'>('chargily');
    const [baridiMobModalOpen, setBaridiMobModalOpen] = useState(false);
    const [selectedPlanForBaridiMob, setSelectedPlanForBaridiMob] = useState<string>('starter');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const plans = [
        {
            id: 'starter',
            name: 'Starter Darija',
            badge: 'Popular for Shops',
            priceDzd: '3,500',
            amount: 3500,
            messagesIncluded: '1,500 messages / month',
            features: [
                '1 Linked WhatsApp Number (QR Code)',
                'Authentic Algerian Darija (Arabizi & Arabic)',
                'Polite Commercial French & English',
                'Knowledge Base: Up to 5 PDF Catalogs & FAQs',
                'Smart Auto-Mute (Human Handover)',
                'Real-time Web Chat Dashboard',
            ],
        },
        {
            id: 'pro',
            name: 'Pro Omnichannel',
            badge: 'High Volume & Vocaux',
            priceDzd: '7,500',
            amount: 7500,
            isPopular: true,
            messagesIncluded: '4,000 messages / month',
            features: [
                'Everything in Starter',
                'Voice Notes (Vocaux) Transcription via Whisper',
                'Omnichannel: WhatsApp + Telegram + Instagram',
                'Website URL Auto-Scraper',
                'Excel & CSV Product Catalog Parser',
                'Priority Dedicated VPS Bandwidth',
            ],
        },
        {
            id: 'byok',
            name: 'BYOK (Bring API Key)',
            badge: 'Tech-Savvy / Agencies',
            priceDzd: '2,000',
            amount: 2000,
            messagesIncluded: 'Unlimited (You pay OpenAI directly)',
            features: [
                'Full Platform & Dashboard Access',
                'Insert your own OpenAI / Groq API Key',
                'All Omnichannel Features Included',
                'Full RAG & Document Embeddings',
                'Smart Human Auto-Mute',
                'Zero message markups',
            ],
        },
    ];

    const handleChargilyCheckout = async (plan: typeof plans[0]) => {
        try {
            const res = await fetch('/api/billing/chargily-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    userEmail,
                    planTier: plan.id,
                    amountDzd: plan.amount,
                }),
            });
            const data = await res.json();
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            }
        } catch (err) {
            console.error('Checkout error:', err);
        }
    };

    const handleBaridiMobSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiptFile) return;
        setSubmitting(true);
        // Simulate upload to Supabase storage & payments table
        setTimeout(() => {
            setSubmitting(false);
            setUploadSuccess(true);
            setTimeout(() => {
                setUploadSuccess(false);
                setBaridiMobModalOpen(false);
            }, 2500);
        }, 1200);
    };

    return (
        <div className="py-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    Algerian Business Pricing (DZD)
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
                    Automate Your Sales in Fluent Darija
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Pay securely in Algerian Dinars with EDAHABIA, CIB card, or BaridiMob transfer.
                </p>

                {/* Payment Method Toggle */}
                <div className="inline-flex relative p-1.5 bg-gray-100 dark:bg-neutral-800/80 rounded-2xl mt-6 border border-gray-200/80 dark:border-neutral-700/80 shadow-inner">
                    <button
                        onClick={() => setSelectedBilling('chargily')}
                        className={`relative z-10 flex items-center space-x-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-colors duration-300 ${
                            selectedBilling === 'chargily'
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                        {selectedBilling === 'chargily' && (
                            <motion.div
                                layoutId="paymentToggle"
                                className="absolute inset-0 bg-white dark:bg-neutral-700 rounded-xl shadow-md border border-gray-200/50 dark:border-neutral-600/50"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <CreditCard className="relative z-10 w-4 h-4 text-emerald-600" />
                        <span className="relative z-10">Instant Card (EDAHABIA / CIB)</span>
                    </button>
                    <button
                        onClick={() => setSelectedBilling('baridimob')}
                        className={`relative z-10 flex items-center space-x-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-colors duration-300 ${
                            selectedBilling === 'baridimob'
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                        {selectedBilling === 'baridimob' && (
                            <motion.div
                                layoutId="paymentToggle"
                                className="absolute inset-0 bg-white dark:bg-neutral-700 rounded-xl shadow-md border border-gray-200/50 dark:border-neutral-600/50"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Building2 className="relative z-10 w-4 h-4 text-amber-600" />
                        <span className="relative z-10">BaridiMob / CCP Receipt</span>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative bg-white dark:bg-[#1A1D23] rounded-2xl p-6 transition-all flex flex-col justify-between ${
                            plan.isPopular
                                ? 'border-2 border-indigo-600 shadow-lg ring-4 ring-indigo-50 dark:ring-indigo-500/20'
                                : 'border border-gray-200 dark:border-neutral-700 shadow-xs hover:border-gray-300 dark:hover:border-neutral-600'
                        }`}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full flex items-center space-x-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Most Popular</span>
                            </div>
                        )}

                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                    <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                        {plan.badge}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 mb-2">
                                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{plan.priceDzd}</span>
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400"> DA / mois</span>
                            </div>
                            <p className="text-xs font-semibold text-emerald-600 mb-6 bg-emerald-50 py-1.5 px-3 rounded-lg inline-block">
                                {plan.messagesIncluded}
                            </p>

                            <ul className="space-y-2.5 text-xs text-gray-600">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start">
                                        <Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8">
                            {selectedBilling === 'chargily' ? (
                                <button
                                    onClick={() => handleChargilyCheckout(plan)}
                                    className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm ${
                                        plan.isPopular
                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                            : 'bg-gray-900 hover:bg-black text-white'
                                    }`}
                                >
                                    Pay {plan.priceDzd} DA with Card
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setSelectedPlanForBaridiMob(plan.id);
                                        setBaridiMobModalOpen(true);
                                    }}
                                    className="w-full py-2.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-sm flex items-center justify-center space-x-1.5"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Upload BaridiMob Receipt</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* BaridiMob Receipt Upload Modal */}
            {baridiMobModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1A1D23] rounded-2xl max-w-md w-full p-6 border border-gray-100 dark:border-neutral-800 shadow-xl">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">BaridiMob / CCP Direct Transfer</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Transfer the fee and attach the receipt screenshot. We will approve within 15 minutes!
                        </p>

                        {/* RIP Details Box */}
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-4 text-xs">
                            <div className="flex justify-between mb-1.5">
                                <span className="text-gray-600 font-medium">RIP BaridiMob:</span>
                                <span className="font-mono font-bold text-gray-900 dark:text-white">00799999000123456789</span>
                            </div>
                            <div className="flex justify-between mb-1.5">
                                <span className="text-gray-600 font-medium">Compte CCP:</span>
                                <span className="font-bold text-gray-900 dark:text-white">12345678 Clé 99</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Nom / Bénéficiaire:</span>
                                <span className="font-bold text-gray-900 dark:text-white">SOUHIL M. (Chatbot Farm)</span>
                            </div>
                        </div>

                        <form onSubmit={handleBaridiMobSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Upload Receipt Screenshot (Capture d'écran)
                                </label>
                                <input
                                    type="file"
                                    required
                                    accept="image/*,.pdf"
                                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                                    className="block w-full text-xs text-gray-500 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                                />
                            </div>

                            <div className="flex space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setBaridiMobModalOpen(false)}
                                    className="flex-1 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center justify-center space-x-1"
                                >
                                    {submitting ? (
                                        <span>Sending...</span>
                                    ) : uploadSuccess ? (
                                        <span>Receipt Uploaded!</span>
                                    ) : (
                                        <span>Submit for Approval</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
