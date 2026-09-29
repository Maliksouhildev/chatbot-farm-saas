const fs = require('fs');
let code = fs.readFileSync('components/dashboard/PricingPlans.tsx', 'utf8');

// Fix dark mode for pricing cards
code = code.replace(/bg-white rounded-2xl p-6/g, 'bg-white dark:bg-[#1A1D23] rounded-2xl p-6');
code = code.replace(/text-gray-900/g, 'text-gray-900 dark:text-white');
code = code.replace(/text-gray-700/g, 'text-gray-700 dark:text-gray-300');
code = code.replace(/border-gray-100/g, 'border-gray-100 dark:border-neutral-800');
code = code.replace(/border-gray-200/g, 'border-gray-200 dark:border-neutral-700');
code = code.replace(/hover:border-gray-300/g, 'hover:border-gray-300 dark:hover:border-neutral-600');
code = code.replace(/bg-white text-gray-900 shadow-xs/g, 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-xs');
code = code.replace(/bg-gray-50/g, 'bg-gray-50 dark:bg-neutral-900');
code = code.replace(/ring-indigo-50/g, 'ring-indigo-50 dark:ring-indigo-500/20');
code = code.replace(/bg-gray-100/g, 'bg-gray-100 dark:bg-neutral-800');
code = code.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
code = code.replace(/text-gray-800/g, 'text-gray-800 dark:text-gray-200');
code = code.replace(/bg-white rounded-2xl max-w-md/g, 'bg-white dark:bg-[#1A1D23] rounded-2xl max-w-md');

fs.writeFileSync('components/dashboard/PricingPlans.tsx', code);
console.log("Fixed PricingPlans dark mode");
