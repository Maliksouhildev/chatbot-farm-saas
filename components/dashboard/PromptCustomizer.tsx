'use client';

import React, { useState } from 'react';
import { Settings2, Globe, MessageSquare, Phone, Volume2, Sparkles, Check } from 'lucide-react';
import { buildSystemPrompt } from '@/lib/darija_prompt_builder';

export const PromptCustomizer: React.FC = () => {
    const [botName, setBotName] = useState('Amira Support');
    const [businessName, setBusinessName] = useState('Boutique El Bahdja');
    const [primaryLanguage, setPrimaryLanguage] = useState<'darija_latin' | 'darija_arabic' | 'french'>('darija_latin');
    const [enabledLanguages, setEnabledLanguages] = useState<string[]>(['darija_latin', 'darija_arabic', 'french']);
    const [basePersona, setBasePersona] = useState('Magasin de vêtements et accessoires mode à Alger. On vend des robes, vestes et sacs.');
    const [customInstructions, setCustomInstructions] = useState('Livraison gratuite à partir de 8000 DA d\'achat. Les retours sont acceptés sous 48h.');
    const [contactHumanNumber, setContactHumanNumber] = useState('0555 12 34 56');
    const [voiceNotesEnabled, setVoiceNotesEnabled] = useState(true);
    const [saved, setSaved] = useState(false);
    const [showPromptModal, setShowPromptModal] = useState(false);

    const toggleLanguage = (lang: string) => {
        setEnabledLanguages(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        );
    };

    const handleSave = async () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const previewPrompt = buildSystemPrompt({
        botName,
        businessName,
        primaryLanguage,
        enabledLanguages,
        basePersona,
        customInstructions,
        contactHumanNumber,
    });

    return (
        <div className="grid grid-cols-1 max-w-2xl mx-auto gap-6">
            {/* Settings Form */}
            <div className="bg-white dark:bg-[#1A1D23] dark:bg-[#1A1D23] rounded-2xl border border-gray-100 dark:border-[#2E333D] shadow-sm p-6 space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Settings2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bot Persona & Dialect Setup</h2>
                        <p className="text-xs text-gray-500">Customize how your AI interacts with your Algerian customers</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bot Name</label>
                        <input
                            type="text"
                            value={botName}
                            onChange={(e) => setBotName(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent dark:bg-[#2A2D35] dark:text-white"
                            placeholder="e.g. Amira, Yacine..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Business Name</label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent dark:bg-[#2A2D35] dark:text-white"
                            placeholder="e.g. Pizzeria Milano, Boutique..."
                        />
                    </div>
                </div>

                {/* Primary Script Selection */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Primary Algerian Dialect Script</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'darija_latin', title: 'Darija Arabizi', desc: 'Salam khoya, chhal hada?' },
                            { id: 'darija_arabic', title: 'Arabic Darija', desc: 'سلام خويا، شحال هادا؟' },
                            { id: 'french', title: 'French', desc: 'Bonjour, quel est le prix ?' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setPrimaryLanguage(item.id as any)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                    primaryLanguage === item.id
                                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-900/20 ring-2 ring-indigo-600/20'
                                        : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                                }`}
                            >
                                <p className="text-xs font-bold text-gray-900 dark:text-white">{item.title}</p>
                                <p className="text-[10px] text-gray-500 mt-1 truncate">{item.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Multi-language Toggles */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Supported Customer Languages</label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'darija_latin', label: 'Algerian Arabizi (3, 7, 9)' },
                            { id: 'darija_arabic', label: 'الدارجة الجزائرية بالعربية' },
                            { id: 'french', label: 'Français Commercial' },
                            { id: 'standard_arabic', label: 'العربية الفصحى' },
                            { id: 'english', label: 'English' },
                        ].map((lang) => (
                            <button
                                key={lang.id}
                                type="button"
                                onClick={() => toggleLanguage(lang.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                    enabledLanguages.includes(lang.id)
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-gray-600 border-gray-200 dark:border-neutral-700 hover:bg-gray-100'
                                }`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Persona & Rules */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">What does your business do?</label>
                    <textarea
                        rows={2}
                        value={basePersona}
                        onChange={(e) => setBasePersona(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent dark:bg-[#2A2D35] dark:text-white"
                        placeholder="Explain your products, location, services..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Special Store Rules & Policies</label>
                    <textarea
                        rows={2}
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent dark:bg-[#2A2D35] dark:text-white"
                        placeholder="e.g. Opening hours, delivery time, return conditions..."
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Human Handover Phone Number</label>
                        <div className="relative">
                            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                value={contactHumanNumber}
                                onChange={(e) => setContactHumanNumber(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent dark:bg-[#2A2D35] dark:text-white"
                                placeholder="0550 00 00 00"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 pt-6">
                        <input
                            type="checkbox"
                            id="voiceNotes"
                            checked={voiceNotesEnabled}
                            onChange={(e) => setVoiceNotesEnabled(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <label htmlFor="voiceNotes" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Transcribe Voice Notes (Vocaux)
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                >
                    {saved ? (
                        <>
                            <Check className="w-4 h-4 text-white" />
                            <span>Saved to Bot!</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-indigo-200" />
                            <span>Save & Apply Settings</span>
                        </>
                    )}
                </button>
            </div>

            {/* Live System Prompt Inspector Button */}
            <button
                onClick={() => setShowPromptModal(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-900 dark:text-white text-sm font-semibold rounded-xl transition-all shadow-sm mt-4"
            >
                <MessageSquare className="w-4 h-4" />
                <span>View Generated Master Prompt</span>
            </button>

            {/* Modal */}
            {showPromptModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 dark:bg-[#1A1D23] rounded-2xl border border-gray-800 p-6 flex flex-col justify-between w-full max-w-3xl relative">
                        <button onClick={() => setShowPromptModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
                                <div className="flex items-center space-x-2">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                    <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">
                                        Generated Master AI Persona
                                    </h3>
                                </div>
                                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-800">
                                    Darija v2.5 Engine
                                </span>
                            </div>
                            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed h-[480px] overflow-y-auto pr-2 bg-gray-950/60 p-4 rounded-xl border border-gray-800/80">
                                {previewPrompt}
                            </pre>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-4 text-center">
                            This compiled prompt is injected into your n8n LLM agent in real-time along with any retrieved RAG document chunks.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
