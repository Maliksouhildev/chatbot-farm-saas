"use client";

import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles,
  HelpCircle,
  ChevronDown,
  Building2,
  PhoneCall
} from 'lucide-react';
import { WhatsAppIcon, TelegramIcon } from '@/components/icons/BrandIcons';

export const ContactView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    wilaya: '16 - Alger',
    channelNeeded: 'whatsapp',
    message: '',
  });

  const algerianWilayas = [
    '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna', 
    '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira', 
    '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou', 
    '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda', 
    '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine', 
    '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla', 
    '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arréridj', '35 - Boumerdès', 
    '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela', 
    '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma', 
    '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane', '49 - Timimoun', 
    '50 - Bordj Badji Mokhtar', '51 - Ouled Djellal', '52 - Béni Abbès', '53 - In Salah', 
    '54 - In Guezzam', '55 - Touggourt', '56 - Djanet', '57 - El M\'Ghair', '58 - El Meniaa'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 space-y-6 text-[#1B1B1B] dark:text-gray-100">
      {/* Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1B6648] via-[#128C7E] to-[#0D9488] text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>Algiers HQ Support Team • Online 7j/7</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Contactez l'Équipe Chatbot Farm DZ
          </h2>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Besoin d'un déploiement personnalisé, d'une flotte de numéros WhatsApp ou d'une intégration sur mesure avec Yalidine et votre ERP ? Nos ingénieurs à Alger vous répondent sous 15 minutes.
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Quick Contact Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive B2B Contact Form */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1A1D23] rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] p-6 shadow-sm">
          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-[#1B6648] dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[#1B6648] dark:text-emerald-400">Demande Envoyée avec Succès !</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                Merci <strong>{formData.fullName || 'cher client'}</strong>. Votre demande pour <strong>{formData.businessName || 'votre boutique'}</strong> a été transmise à notre équipe technique d'Alger.
                Un conseiller va vous contacter sur le <strong>{formData.phone || '+213'}</strong> d'ici 15 minutes.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-[#1B6648] text-white text-xs font-bold rounded-xl hover:bg-[#155239] transition-all shadow-sm"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="font-extrabold text-base mb-1 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#1B6648] dark:text-emerald-400" />
                  <span>Formulaire de Contact & Devis Express</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Remplissez ce formulaire pour recevoir un devis officiel ou une démonstration en direct.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="ex: Amine Zerrouki"
                    className="w-full bg-[#ECECE2]/40 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B6648]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Nom de l'Entreprise / Boutique *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="ex: El Bahdja Fashion DZ"
                    className="w-full bg-[#ECECE2]/40 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B6648]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Numéro de Téléphone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0551 XX XX XX / 0770 XX XX XX"
                    className="w-full bg-[#ECECE2]/40 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B6648]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@votre-boutique.dz"
                    className="w-full bg-[#ECECE2]/40 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B6648]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Wilaya (Algérie)
                  </label>
                  <select
                    value={formData.wilaya}
                    onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                    className="w-full bg-[#ECECE2]/40 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1B6648]"
                  >
                    {algerianWilayas.map((w) => (
                      <option key={w} value={w} className="dark:bg-neutral-900">{w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Canal Principal Souhaité
                  </label>
                  <select
                    value={formData.channelNeeded}
                    onChange={(e) => setFormData({ ...formData, channelNeeded: e.target.value })}
                    className="w-full bg-[#ECECE2]/40 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1B6648]"
                  >
                    <option value="whatsapp" className="dark:bg-neutral-900">WhatsApp Business Automation</option>
                    <option value="instagram" className="dark:bg-neutral-900">Instagram DMs Auto-Reply</option>
                    <option value="telegram" className="dark:bg-neutral-900">Telegram Sales Bot</option>
                    <option value="omnichannel" className="dark:bg-neutral-900">Pack Omnicanal Complet (Tous les réseaux)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Message / Détails de votre projet
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Décrivez votre volume de commandes mensuelles, votre besoin d'automatisation ou vos questions sur Yalidine et l'IA en Darija..."
                  className="w-full bg-[#ECECE2]/40 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl p-3 text-xs focus:outline-none focus:border-[#1B6648] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-2.5 bg-[#EB6708] hover:bg-[#D95D07] text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer la Demande</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right 1 Col: Direct Communication Channels */}
        <div className="space-y-4">
          {/* WhatsApp Direct Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#128C7E]/10 to-[#25D366]/10 border border-[#128C7E]/30 dark:border-[#25D366]/20 space-y-3">
            <div className="flex items-center gap-3">
              <WhatsAppIcon className="w-9 h-9" />
              <div>
                <h4 className="font-extrabold text-xs">WhatsApp Direct DZ</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Assistance instantanée 24/7</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Discutez directement avec un ingénieur support sur notre ligne officielle WhatsApp algérienne.
            </p>
            <a
              href="https://wa.me/213551671229"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Ouvrir WhatsApp (+213 551 67 12 29)</span>
            </a>
          </div>

          {/* Phone & Office Location */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] space-y-3 shadow-sm text-xs">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Coordonnées & Siège
            </h4>

            <div className="space-y-3 divide-y divide-gray-100 dark:divide-neutral-800">
              <div className="flex items-start gap-3 pt-2">
                <PhoneCall className="w-4 h-4 text-[#1B6648] dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Standard Téléphonique</span>
                  <span className="text-gray-500 font-mono text-[11px]">+213 (0) 23 89 12 44</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Mail className="w-4 h-4 text-[#EB6708] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Email Commercial & B2B</span>
                  <span className="text-gray-500 font-mono text-[11px]">contact@chatbotfarm.dz</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Siège Social</span>
                  <p className="text-gray-500 text-[11px]">
                    Cyberparc de Sidi Abdellah & Centre d'Affaires El Qods, Chéraga, Alger, Algérie.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Clock className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Heures d'Ouverture</span>
                  <p className="text-gray-500 text-[11px]">Dimanche - Jeudi : 08h30 - 17h30 (DZ Time)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
