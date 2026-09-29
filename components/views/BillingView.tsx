"use client";

import React from 'react';
import { PricingPlans } from '@/components/dashboard/PricingPlans';

export const BillingView: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-8 space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1B6648] bg-[#1B6648]/10 px-3 py-1 rounded-full border border-[#1B6648]/20">
          Algerian Subscription Plans
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-[#1B1B1B] dark:text-white">
          Billing & Payments (DZD)
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs max-w-xl mx-auto">
          Free manual messaging forever. Upgrade anytime to unlock automated 24/7 Algerian Darija AI sales bots with Yalidine integration.
        </p>
      </div>

      <PricingPlans userId="merchant_user" userEmail="merchant@store.dz" />
    </div>
  );
};
