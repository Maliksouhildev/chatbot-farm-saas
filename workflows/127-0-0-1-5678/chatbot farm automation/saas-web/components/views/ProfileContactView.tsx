import React from 'react';
import { User, Phone, MapPin, Mail, MessageSquare, ShieldCheck, CheckCircle2, Server, Database, Truck, Volume2, Bell } from 'lucide-react';
import { SoundManager } from '@/lib/SoundManager';

export const ProfileContactView: React.FC = () => {
  const [userProfile, setUserProfile] = React.useState<{ name: string; email: string; avatar: string }>({
    name: 'Malik Souhil',
    email: 'malik@chatbotfarm.dz',
    avatar: 'MS'
  });

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('cf_user_session');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.name) {
          setUserProfile({
            name: p.name,
            email: p.email || `${p.name.toLowerCase().replace(/\s+/g, '')}@chatbotfarm.dz`,
            avatar: p.avatar || p.name.slice(0, 2).toUpperCase()
          });
          return;
        }
      }
      const ig = localStorage.getItem('cf_ig_account');
      if (ig) {
        const p = JSON.parse(ig);
        if (p.username) {
          setUserProfile({
            name: p.name || `@${p.username}`,
            email: `${p.username}@instagram.com`,
            avatar: p.username.slice(0, 2).toUpperCase()
          });
        }
      }
    } catch {}
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-8 space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-1">
        <h2 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white">
          Merchant Profile & WhatsApp Support
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs">
          Manage your account details and contact our Algerian developer team directly on WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Merchant Profile */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#DFDFD4] dark:border-[#2E333D]">
            <div className="w-12 h-12 rounded-full bg-[#1B6648] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {userProfile.avatar}
            </div>
            <div>
              <h4 className="font-bold text-base text-[#1B1B1B] dark:text-white">{userProfile.name}</h4>
              <p className="text-xs text-gray-500 font-mono">{userProfile.email}</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Registered Phone:</span>
              <span className="font-bold font-mono">+213 550 12 34 56</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Business Wilaya:</span>
              <span className="font-bold">16 - Alger</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Active Bot Plan:</span>
              <span className="font-bold text-[#1B6648] dark:text-emerald-400">Pro Omnichannel Bot</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Monthly Quota:</span>
              <span className="font-bold">1,840 / 4,000 msgs</span>
            </div>
          </div>
        </div>

        {/* Card 2: Contact WhatsApp */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#DFDFD4] dark:border-[#2E333D]">
            <div className="w-12 h-12 rounded-2xl bg-[#1B6648]/10 text-[#1B6648] dark:text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-[#1B6648] dark:text-emerald-400">Direct WhatsApp Support</h4>
              <p className="text-xs text-gray-500">Algerian Technical Team (24/7)</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Need help setting up your WhatsApp multi-device gateway, Yalidine API, or custom Darija prompts? Message us directly.
          </p>

          <a
            href="https://wa.me/213551671229?text=Salam,%203andi%20so2al%203la%20Chatbot%20Farm"
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 bg-[#1B6648] hover:bg-[#1B6648]/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span>Chat on WhatsApp (+213 551 67 12 29)</span>
          </a>
        </div>

        {/* Card 3: Platform Infrastructure & Yalidine Logistics */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#DFDFD4] dark:border-[#2E333D]">
            <div className="w-12 h-12 rounded-2xl bg-[#EB6708]/10 text-[#EB6708] flex items-center justify-center font-bold">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-[#EB6708]">Infrastructure & Sync</h4>
              <p className="text-xs text-gray-500">Local Docker & n8n Router</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Evolution Gateway:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Port 8080 (Online)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Yalidine API Express:</span>
              <span className="font-bold text-[#1B6648] dark:text-emerald-400">Connected (58 Wilayas)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Redis Session Cache:</span>
              <span className="font-mono text-emerald-600">6379 (Healthy)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Auto Human Handover:</span>
              <span className="font-bold text-blue-600">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Notification Settings */}
      <div className="p-6 rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-sm mt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-[#EB6708] flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">Global Notification Settings</h3>
            <p className="text-[11px] text-gray-500">Configure audio cues for incoming messages across all connected channels.</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 max-w-lg">
          <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-[#1E222A] rounded-2xl border border-gray-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-500" />
                Master Volume
              </span>
              <input 
                type="range" 
                min="0" max="100" 
                defaultValue="100"
                onChange={(e) => SoundManager.setVolume(Number(e.target.value) / 100)}
                className="w-32 accent-emerald-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1E222A] rounded-2xl border border-gray-100 dark:border-neutral-800">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Mute All Notifications
            </span>
            <input 
              type="checkbox" 
              onChange={(e) => SoundManager.setMuted(e.target.checked)}
              className="w-5 h-5 accent-[#EB6708] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
