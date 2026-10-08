'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings2,
    Globe,
    Phone,
    Volume2,
    Sparkles,
    Check,
    Mic,
    Plus,
    X,
    ChevronDown,
    Zap
} from 'lucide-react';
import { buildSystemPrompt } from '@/lib/darija_prompt_builder';

export interface LanguageOption {
    id: string;
    label: string;
    nativeName: string;
    flag: string;
    region: 'algerian' | 'international';
    scriptExample: string;
}

export const COMPREHENSIVE_LANGUAGES: LanguageOption[] = [
    // Algerian Dialects & Regional
    { id: 'darija_latin', label: 'Algerian Darija (Arabizi 3, 7, 9)', nativeName: 'الدارجة باللاتينية', flag: '🇩🇿', region: 'algerian', scriptExample: 'Salam khoya, chhal hada?' },
    { id: 'darija_arabic', label: 'Algerian Darija (Arabic script)', nativeName: 'الدارجة الجزائرية بالعربية', flag: '🇩🇿', region: 'algerian', scriptExample: 'سلام خويا، شحال هادا؟' },
    { id: 'darija_algiers', label: 'Central Algiers (Algérois / العاصمة)', nativeName: 'لهجة العاصمة والوسط', flag: '🇩🇿', region: 'algerian', scriptExample: 'واش راك خو، كاش جديد ف السلعة؟' },
    { id: 'darija_oran', label: 'Western Oran (Oranais / وهران)', nativeName: 'لهجة الغرب الوهراني', flag: '🇩🇿', region: 'algerian', scriptExample: 'شا راك خويا، كاش سومات شابة؟' },
    { id: 'darija_constantine', label: 'Eastern Constantine (Constantinois / قسنطينة)', nativeName: 'لهجة الشرق القسنطيني', flag: '🇩🇿', region: 'algerian', scriptExample: 'واش حوالك، قداه يسوى هذا؟' },
    { id: 'tamazight_kabyle', label: 'Tamazight (Kabyle / Taqbaylit)', nativeName: 'Taqbaylit / تاقبايليث', flag: 'ⵣ', region: 'algerian', scriptExample: 'Azul fell-awen, amek thellid?' },
    { id: 'tamazight_chaoui', label: 'Tamazight (Chaoui / Tachawit)', nativeName: 'Tachawit / تاشاويت', flag: 'ⵣ', region: 'algerian', scriptExample: 'Azul, mamk thellid?' },
    { id: 'tamazight_mzab', label: 'Tamazight (Mozabite / Tumzabt)', nativeName: 'Tumzabt / تومزابت', flag: 'ⵣ', region: 'algerian', scriptExample: 'Salam, manchi thellid?' },

    // International Commercial Languages
    { id: 'french', label: 'Français Commercial (Algerian Business French)', nativeName: 'Français', flag: '🇫🇷', region: 'international', scriptExample: 'Bonjour, quel est le prix et le délai de livraison ?' },
    { id: 'standard_arabic', label: 'Modern Standard Arabic (الفصحى)', nativeName: 'العربية الفصحى', flag: '🇸🇦', region: 'international', scriptExample: 'مرحباً بك، كيف يمكننا مساعدتك اليوم؟' },
    { id: 'english', label: 'English (International Business)', nativeName: 'English', flag: '🇬🇧', region: 'international', scriptExample: 'Hello, what is the price and delivery time?' },
    { id: 'spanish', label: 'Español (Spanish)', nativeName: 'Español', flag: '🇪🇸', region: 'international', scriptExample: 'Hola, ¿cuál es el precio de este producto?' },
    { id: 'italian', label: 'Italiano (Italian)', nativeName: 'Italiano', flag: '🇮🇹', region: 'international', scriptExample: 'Ciao, quanto costa questo articolo?' },
    { id: 'german', label: 'Deutsch (German)', nativeName: 'Deutsch', flag: '🇩🇪', region: 'international', scriptExample: 'Hallo, was kostet dieser Artikel mit Lieferung?' },
    { id: 'turkish', label: 'Türkçe (Turkish)', nativeName: 'Türkçe', flag: '🇹🇷', region: 'international', scriptExample: 'Merhaba, bu ürünün fiyatı nedir?' },
    { id: 'chinese', label: '中文 / Mandarin (Chinese)', nativeName: '中文 (普通话)', flag: '🇨🇳', region: 'international', scriptExample: '您好，请问这个产品的价格是多少？' },
    { id: 'russian', label: 'Русский (Russian)', nativeName: 'Русский', flag: '🇷🇺', region: 'international', scriptExample: 'Здравствуйте, какая цена этого товара?' },
];

interface PromptCustomizerProps {
    botId?: string;
    onSaveSuccess?: (data: any) => void;
}

export const PromptCustomizer: React.FC<PromptCustomizerProps> = ({ botId, onSaveSuccess }) => {
    const [botName, setBotName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [primaryLanguage, setPrimaryLanguage] = useState<string>('darija_latin');
    const [enabledLanguages, setEnabledLanguages] = useState<string[]>(['darija_latin', 'darija_arabic', 'french', 'english']);
    const [basePersona, setBasePersona] = useState('');
    const [customInstructions, setCustomInstructions] = useState('');
    const [contactHumanNumber, setContactHumanNumber] = useState('');
    const [voiceNotesEnabled, setVoiceNotesEnabled] = useState(true); // Voice notes active by default
    const [saved, setSaved] = useState(false);
    const [showPromptModal, setShowPromptModal] = useState(false);

    useEffect(() => {
        try {
            const storageKey = botId ? `cf_bot_persona_${botId}` : 'cf_prompt_config';
            const saved = localStorage.getItem(storageKey) || localStorage.getItem('cf_prompt_config');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.botName !== undefined) setBotName(data.botName);
                if (data.businessName !== undefined) setBusinessName(data.businessName);
                if (data.primaryLanguage) setPrimaryLanguage(data.primaryLanguage);
                if (data.enabledLanguages && Array.isArray(data.enabledLanguages)) setEnabledLanguages(data.enabledLanguages);
                if (data.basePersona !== undefined) setBasePersona(data.basePersona);
                if (data.customInstructions !== undefined) setCustomInstructions(data.customInstructions);
                if (data.contactHumanNumber !== undefined) setContactHumanNumber(data.contactHumanNumber);
                // Make voice notes work by default if undefined
                setVoiceNotesEnabled(data.voiceNotesEnabled !== undefined ? data.voiceNotesEnabled : true);
            } else {
                setBotName('');
                setBusinessName('');
                setBasePersona('');
                setCustomInstructions('');
                setContactHumanNumber('');
                setVoiceNotesEnabled(true);
            }
        } catch {}
    }, [botId]);

    const handleAddLanguage = (langId: string) => {
        if (!langId) return;
        if (!enabledLanguages.includes(langId)) {
            setEnabledLanguages(prev => [...prev, langId]);
        }
    };

    const handleRemoveLanguage = (langId: string) => {
        if (enabledLanguages.length <= 1) return; // Keep at least one language
        setEnabledLanguages(prev => prev.filter(l => l !== langId));
    };

    const setPreset = (preset: 'algerian' | 'all') => {
        if (preset === 'algerian') {
            setEnabledLanguages(['darija_latin', 'darija_arabic', 'french', 'standard_arabic']);
        } else if (preset === 'all') {
            setEnabledLanguages(COMPREHENSIVE_LANGUAGES.map(l => l.id));
        }
    };

    const handleSave = async () => {
        try {
            const config = {
                botName,
                businessName,
                primaryLanguage,
                enabledLanguages,
                basePersona,
                customInstructions,
                contactHumanNumber,
                voiceNotesEnabled,
            };
            if (botId) {
                localStorage.setItem(`cf_bot_persona_${botId}`, JSON.stringify(config));
            }
            localStorage.setItem('cf_prompt_config', JSON.stringify(config));
            if (onSaveSuccess) onSaveSuccess(config);
        } catch {}
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const activeLanguageDef = COMPREHENSIVE_LANGUAGES.find(l => l.id === primaryLanguage) || COMPREHENSIVE_LANGUAGES[0];

    const previewPrompt = buildSystemPrompt({
        botName: botName || 'AI Assistant',
        businessName: businessName || 'Your Business',
        primaryLanguage,
        enabledLanguages,
        basePersona: basePersona || 'Professional customer service assistant.',
        customInstructions,
        contactHumanNumber,
        voiceNotesEnabled,
    });

    // Languages not yet enabled (available in dropdown)
    const availableToAdd = COMPREHENSIVE_LANGUAGES.filter(l => !enabledLanguages.includes(l.id));

    return (
        <div className="grid grid-cols-1 max-w-2xl mx-auto gap-6">
            {/* Settings Form */}
            <div className="bg-white dark:bg-[#1A1D23] rounded-2xl border border-gray-100 dark:border-[#2E333D] shadow-sm p-6 space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-100 dark:border-neutral-800">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Settings2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bot Persona & Dialect Setup</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Configure your real store AI personality, Darija dialect rules, and voice note intelligence</p>
                    </div>
                </div>

                {/* Identity Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bot Name</label>
                        <input
                            type="text"
                            value={botName}
                            onChange={(e) => setBotName(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent dark:bg-[#2A2D35] dark:text-white"
                            placeholder="Enter assistant name..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Business Name</label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent dark:bg-[#2A2D35] dark:text-white"
                            placeholder="Enter business / brand name..."
                        />
                    </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PRIMARY DIALECT & SCRIPT (DROPDOWN SELECTOR) */}
                {/* ------------------------------------------------------------- */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Primary Algerian Dialect Script & Default Tone
                    </label>
                    <div className="relative">
                        <select
                            value={primaryLanguage}
                            onChange={(e) => setPrimaryLanguage(e.target.value)}
                            className="w-full appearance-none px-3.5 py-2.5 text-xs font-bold border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#2A2D35] dark:text-white cursor-pointer pr-10 shadow-xs"
                        >
                            <optgroup label="🇩🇿 Algerian Regional Dialects & Scripts">
                                {COMPREHENSIVE_LANGUAGES.filter(l => l.region === 'algerian').map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.flag} {item.label} — ({item.nativeName})
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="🌍 International & Commercial Languages">
                                {COMPREHENSIVE_LANGUAGES.filter(l => l.region === 'international').map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.flag} {item.label} — ({item.nativeName})
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                    </div>

                    {/* Preview Dialect Example */}
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                        <span className="text-gray-500 text-[11px]">Dialect Sample:</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">
                            "{activeLanguageDef.scriptExample}"
                        </span>
                    </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* MULTI-LANGUAGE COMPATIBILITY (DROPDOWN + TAGS) */}
                {/* ------------------------------------------------------------- */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Supported Customer Languages & Code-Switching ({enabledLanguages.length})
                        </label>
                        <div className="flex items-center gap-1.5 text-[10px]">
                            <button
                                type="button"
                                onClick={() => setPreset('algerian')}
                                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                            >
                                Algerian Core
                            </button>
                            <span className="text-gray-300 dark:text-neutral-700">•</span>
                            <button
                                type="button"
                                onClick={() => setPreset('all')}
                                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                            >
                                All Languages
                            </button>
                        </div>
                    </div>

                    {/* Active Language Chips */}
                    <div className="flex flex-wrap gap-2">
                        {enabledLanguages.map((langId) => {
                            const def = COMPREHENSIVE_LANGUAGES.find(l => l.id === langId);
                            if (!def) return null;
                            return (
                                <span
                                    key={langId}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40"
                                >
                                    <span>{def.flag}</span>
                                    <span>{def.label.split('(')[0].trim()}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveLanguage(langId)}
                                        className="hover:text-red-500 rounded p-0.5 ml-0.5"
                                        title={`Remove ${def.label}`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })}
                    </div>

                    {/* Dropdown to Add More Languages */}
                    {availableToAdd.length > 0 && (
                        <div className="relative pt-1">
                            <select
                                value=""
                                onChange={(e) => handleAddLanguage(e.target.value)}
                                className="w-full appearance-none px-3 py-2 text-xs font-medium border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl bg-gray-50/50 dark:bg-black/20 dark:text-gray-200 hover:border-indigo-400 cursor-pointer pr-8 text-gray-600 outline-none"
                            >
                                <option value="" disabled>+ Add another language or dialect from dropdown...</option>
                                <optgroup label="🇩🇿 Algerian Regional Dialects">
                                    {availableToAdd.filter(l => l.region === 'algerian').map((item) => (
                                        <option key={item.id} value={item.id}>
                                            + {item.flag} {item.label} ({item.nativeName})
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="🌍 International Commercial Languages">
                                    {availableToAdd.filter(l => l.region === 'international').map((item) => (
                                        <option key={item.id} value={item.id}>
                                            + {item.flag} {item.label} ({item.nativeName})
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                            <Plus className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-4 pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* VOICE NOTES (VOCAUX) CARD - ACTIVE BY DEFAULT */}
                {/* ------------------------------------------------------------- */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 dark:border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-xs">
                                <Mic className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white flex items-center gap-2">
                                    <span>Voice Notes (Vocaux) Transcription</span>
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                        Active By Default
                                    </span>
                                </h4>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Auto-transcribes incoming audio on WhatsApp, Telegram & Instagram via Whisper AI
                                </p>
                            </div>
                        </div>

                        {/* Voice Notes Toggle */}
                        <button
                            type="button"
                            onClick={() => setVoiceNotesEnabled(!voiceNotesEnabled)}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                                voiceNotesEnabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                    voiceNotesEnabled ? 'translate-x-4.5' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Persona & Business Context */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">What does your business do?</label>
                    <textarea
                        rows={2}
                        value={basePersona}
                        onChange={(e) => setBasePersona(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent dark:bg-[#2A2D35] dark:text-white"
                        placeholder="Describe your real products, store location, services..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Special Store Rules & Policies</label>
                    <textarea
                        rows={2}
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent dark:bg-[#2A2D35] dark:text-white"
                        placeholder="e.g. Delivery terms, return policy, business hours..."
                    />
                </div>

                {/* Human Handover Phone */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Human Handover Phone Number</label>
                    <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={contactHumanNumber}
                            onChange={(e) => setContactHumanNumber(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent dark:bg-[#2A2D35] dark:text-white"
                            placeholder="05XX XX XX XX"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-neutral-800">
                    <button
                        type="button"
                        onClick={() => setShowPromptModal(true)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                        Preview Generated System Prompt
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                        {saved ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Saved!</span>
                            </>
                        ) : (
                            <span>Save Persona & Instructions</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Prompt Preview Modal */}
            {showPromptModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1A1D23] rounded-2xl max-w-lg w-full p-6 border border-gray-100 dark:border-neutral-800 shadow-xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800 mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Generated System Prompt Preview</h3>
                            <button
                                onClick={() => setShowPromptModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <pre className="text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-black/40 p-4 rounded-xl border border-gray-100 dark:border-neutral-800">
                                {previewPrompt}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
