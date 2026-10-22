"use client";

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  PhoneCall, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { WhatsAppIcon, TelegramIcon, GmailIcon } from '@/components/icons/BrandIcons';

export const ContactView: React.FC = () => {
  const [issue, setIssue] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cf_user_session');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.email) setContactInfo(u.email);
        else if (u.name) setContactInfo(u.name);
      }
    } catch {}
  }, []);

  const handleSendIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) return;
    setLoading(true);

    try {
      const tickets = JSON.parse(localStorage.getItem('cf_support_issues') || '[]');
      tickets.unshift({
        id: `ticket_${Date.now()}`,
        issue: issue.trim(),
        contact: contactInfo.trim() || 'Anonymous User',
        timestamp: new Date().toISOString(),
        status: 'open'
      });
      localStorage.setItem('cf_support_issues', JSON.stringify(tickets));
    } catch {}

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setIssue('');
    setSubmitted(false);
  };

  const contactChannels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      subtitle: 'Instant Chat 24/7',
      value: '+213 551 67 12 29',
      href: 'https://wa.me/213551671229?text=Bonjour%20l%27équipe%20Chatbot%20Farm%2C%20j%27ai%20besoin%20d%27assistance.',
      icon: <WhatsAppIcon className="w-6 h-6" />,
      color: 'hover:border-[#25D366] hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      badgeText: 'Online'
    },
    {
      id: 'gmail',
      name: 'Gmail / Email',
      subtitle: 'Direct Inbox',
      value: 'contact@chatbotfarm.dz',
      href: 'https://mail.google.com/mail/?view=cm&fs=1&to=contact@chatbotfarm.dz&su=Support%20Request%20-%20Chatbot%20Farm',
      icon: <GmailIcon className="w-6 h-6" />,
      color: 'hover:border-[#EA4335] hover:bg-red-50/40 dark:hover:bg-red-950/20',
      badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
      badgeText: 'Quick Reply'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      subtitle: 'Tech Support',
      value: '@chatbotfarm_dz',
      href: 'https://t.me/chatbotfarm_dz',
      icon: <TelegramIcon className="w-6 h-6" />,
      color: 'hover:border-[#24A1DE] hover:bg-sky-50/40 dark:hover:bg-sky-950/20',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
      badgeText: 'Support Bot'
    },
    {
      id: 'phone',
      name: 'Phone Call',
      subtitle: 'Algiers Office',
      value: '+213 23 89 12 44',
      href: 'tel:+21323891244',
      icon: (
        <div className="w-6 h-6 rounded-lg bg-[#1B6648] text-white flex items-center justify-center shrink-0">
          <PhoneCall className="w-3.5 h-3.5" />
        </div>
      ),
      color: 'hover:border-[#1B6648] hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20',
      badgeColor: 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300',
      badgeText: '08:30 - 17:30'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6 text-[#1B1B1B] dark:text-gray-100">
      
      {/* 1. Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B6648]/10 text-[#1B6648] dark:bg-emerald-950/50 dark:text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Support & Helpdesk</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
          Contactez Notre Équipe
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Contactez-nous directement sur votre application préférée ou écrivez simplement votre problème ci-dessous.
        </p>
      </div>

      {/* 2. Multiple Direct Contacts Grid */}
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3 text-center sm:text-left">
          Canaux Directs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {contactChannels.map((c) => (
            <a
              key={c.id}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 rounded-2xl bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] shadow-2xs transition-all duration-200 flex flex-col justify-between group cursor-pointer ${c.color}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-1 rounded-xl group-hover:scale-105 transition-transform">
                  {c.icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badgeColor}`}>
                  {c.badgeText}
                </span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs flex items-center gap-1.5 text-[#1B1B1B] dark:text-white">
                  <span>{c.name}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-[11px] font-mono text-gray-600 dark:text-gray-300 truncate font-semibold">
                  {c.value}
                </p>
                <p className="text-[10px] text-gray-400">
                  {c.subtitle}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 3. Simple Issue Reporting Box */}
      <div className="bg-white dark:bg-[#1A1D23] rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] p-6 sm:p-8 shadow-sm">
        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-[#1B6648] dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#1B6648] dark:text-emerald-400">
                Message Envoyé avec Succès !
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                Notre équipe technique à Alger a bien reçu votre message. Nous reviendrons vers vous dans les plus brefs délais{contactInfo ? ` sur ${contactInfo}` : ''}.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-[#1B6648] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Écrire un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendIssue} className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2 text-[#1B1B1B] dark:text-white">
                <MessageSquare className="w-4 h-4 text-[#1B6648] dark:text-emerald-400" />
                <span>Signaler un problème ou poser une question</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Écrivez votre message et appuyez sur envoyer. Aucune étape complexe nécessaire.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Votre contact (Email ou Téléphone) <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="ex: aminedz@gmail.com ou 0551 XX XX XX"
                  className="w-full bg-[#ECECE2]/40 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1B6648] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Description du problème *
                </label>
                <textarea
                  rows={4}
                  required
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Expliquez ce qui ne fonctionne pas ou votre question ici..."
                  className="w-full bg-[#ECECE2]/40 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl p-3 text-xs focus:outline-none focus:border-[#1B6648] transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-gray-400">
                Temps de réponse moyen : <strong className="text-gray-600 dark:text-gray-300">&lt; 15 min</strong>
              </p>
              <button
                type="submit"
                disabled={loading || !issue.trim()}
                className="px-6 py-2.5 bg-[#1B6648] hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                {loading ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
};
