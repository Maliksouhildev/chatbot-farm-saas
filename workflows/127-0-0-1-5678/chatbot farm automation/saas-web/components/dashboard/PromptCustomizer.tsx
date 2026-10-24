'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    Zap,
    Search,
    Smile,
    MessageSquareQuote,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildSystemPrompt } from '@/lib/darija_prompt_builder';

export interface LanguageOption {
    id: string;
    label: string;
    sublabel?: string;
    nativeName: string;
    flag: string;
    region: 'algerian' | 'international';
    scriptExample: string;
}

export const COMPREHENSIVE_LANGUAGES: LanguageOption[] = [
    // Algerian Regional Dialects & Scripts
    { id: 'darija_latin', label: 'Algerian Darija', sublabel: 'Arabizi (Latin 3, 7, 9)', nativeName: 'الدارجة باللاتينية', flag: '🇩🇿', region: 'algerian', scriptExample: 'Salam khoya, chhal hada?' },
    { id: 'darija_arabic', label: 'Algerian Darija', sublabel: 'Arabic script', nativeName: 'الدارجة بالعربية', flag: '🇩🇿', region: 'algerian', scriptExample: 'سلام خويا، شحال هادا؟' },
    { id: 'darija_algiers', label: 'Algiers Dialect', sublabel: 'Algérois & Center', nativeName: 'لهجة العاصمة', flag: '🇩🇿', region: 'algerian', scriptExample: 'واش راك خو، كاش جديد ف السلعة؟' },
    { id: 'darija_oran', label: 'Oran Dialect', sublabel: 'Western Oranais', nativeName: 'لهجة وهران', flag: '🇩🇿', region: 'algerian', scriptExample: 'شا راك خويا، كاش سومات شابة؟' },
    { id: 'darija_constantine', label: 'Constantine Dialect', sublabel: 'Eastern Constantinois', nativeName: 'لهجة قسنطينة', flag: '🇩🇿', region: 'algerian', scriptExample: 'واش حوالك، قداه يسوى هذا؟' },
    { id: 'tamazight_kabyle', label: 'Tamazight', sublabel: 'Kabyle (Taqbaylit)', nativeName: 'Taqbaylit · ثاقبايليث', flag: 'ⵣ', region: 'algerian', scriptExample: 'Azul fell-awen, amek thellid?' },
    { id: 'tamazight_chaoui', label: 'Tamazight', sublabel: 'Chaoui (Tachawit)', nativeName: 'Tachawit · تاشاويت', flag: 'ⵣ', region: 'algerian', scriptExample: 'Azul, mamk thellid?' },
    { id: 'tamazight_mzab', label: 'Tamazight', sublabel: 'Mozabite (Tumzabt)', nativeName: 'Tumzabt · تومزابت', flag: 'ⵣ', region: 'algerian', scriptExample: 'Salam, manchi thellid?' },

    // International Commercial Languages
    { id: 'french', label: 'French', sublabel: 'Business & Commercial', nativeName: 'Français Commercial', flag: '🇫🇷', region: 'international', scriptExample: 'Bonjour, quel est le prix et le délai de livraison ?' },
    { id: 'standard_arabic', label: 'Standard Arabic', sublabel: 'Modern Fusha', nativeName: 'العربية الفصحى', flag: '🇸🇦', region: 'international', scriptExample: 'مرحباً بك، كيف يمكننا مساعدتك اليوم؟' },
    { id: 'english', label: 'English', sublabel: 'International Business', nativeName: 'English', flag: '🇬🇧', region: 'international', scriptExample: 'Hello, what is the price and delivery time?' },
    { id: 'spanish', label: 'Spanish', sublabel: 'Español', nativeName: 'Español', flag: '🇪🇸', region: 'international', scriptExample: 'Hola, ¿cuál es el precio de este producto?' },
    { id: 'italian', label: 'Italian', sublabel: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹', region: 'international', scriptExample: 'Ciao, quanto costa questo articolo?' },
    { id: 'german', label: 'German', sublabel: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪', region: 'international', scriptExample: 'Hallo, was kostet dieser Artikel mit Lieferung?' },
    { id: 'turkish', label: 'Turkish', sublabel: 'Türkçe', nativeName: 'Türkçe', flag: '🇹🇷', region: 'international', scriptExample: 'Merhaba, bu ürünün fiyatı nedir?' },
    { id: 'chinese', label: 'Chinese', sublabel: 'Mandarin', nativeName: '中文 (普通话)', flag: '🇨🇳', region: 'international', scriptExample: '您好，请问这个产品的价格是多少？' },
    { id: 'russian', label: 'Russian', sublabel: 'Русский', nativeName: 'Русский', flag: '🇷🇺', region: 'international', scriptExample: 'Здравствуйте, какая цена этого товара?' },
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
    const [reactionProbability, setReactionProbability] = useState<number>(33); // 33% default chance
    const [debounceSeconds, setDebounceSeconds] = useState<number>(3); // 3 seconds inactivity window
    const [realisticTypingSimulation, setRealisticTypingSimulation] = useState<boolean>(true);
    const [typingCadence, setTypingCadence] = useState<'fast' | 'natural' | 'slow'>('natural');
    const [saved, setSaved] = useState(false);
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [isPrimaryLangOpen, setIsPrimaryLangOpen] = useState(false);
    const [isAddLangOpen, setIsAddLangOpen] = useState(false);
    const [primarySearch, setPrimarySearch] = useState('');
    const [addSearch, setAddSearch] = useState('');
    const primaryDropdownRef = useRef<HTMLDivElement>(null);
    const addDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (primaryDropdownRef.current && !primaryDropdownRef.current.contains(e.target as Node)) {
                setIsPrimaryLangOpen(false);
            }
            if (addDropdownRef.current && !addDropdownRef.current.contains(e.target as Node)) {
                setIsAddLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                if (data.reactionProbability !== undefined) setReactionProbability(data.reactionProbability);
                setDebounceSeconds(data.debounceSeconds !== undefined ? data.debounceSeconds : 3);
                setRealisticTypingSimulation(data.realisticTypingSimulation !== undefined ? data.realisticTypingSimulation : true);
                setTypingCadence(data.typingCadence || 'natural');
            } else {
                setBotName('');
                setBusinessName('');
                setBasePersona('');
                setCustomInstructions('');
                setContactHumanNumber('');
                setVoiceNotesEnabled(true);
                setReactionProbability(33);
                setDebounceSeconds(3);
                setRealisticTypingSimulation(true);
                setTypingCadence('natural');
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
                reactionProbability,
                debounceSeconds,
                realisticTypingSimulation,
                typingCadence,
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

    const searchMatch = (lang: LanguageOption, query: string) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase().trim();
        return (
            lang.label.toLowerCase().includes(q) ||
            (lang.sublabel && lang.sublabel.toLowerCase().includes(q)) ||
            lang.nativeName.toLowerCase().includes(q)
        );
    };

    const filteredAlgerian = COMPREHENSIVE_LANGUAGES.filter(l => l.region === 'algerian' && searchMatch(l, primarySearch));
    const filteredInternational = COMPREHENSIVE_LANGUAGES.filter(l => l.region === 'international' && searchMatch(l, primarySearch));

    const filteredAddAlgerian = availableToAdd.filter(l => l.region === 'algerian' && searchMatch(l, addSearch));
    const filteredAddInternational = availableToAdd.filter(l => l.region === 'international' && searchMatch(l, addSearch));

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
                    <div className="relative" ref={primaryDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsPrimaryLangOpen(!isPrimaryLangOpen)}
                            className="w-full px-3.5 py-2.5 text-xs font-bold border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 outline-none bg-white dark:bg-[#2A2D35] dark:text-white cursor-pointer flex items-center justify-between shadow-xs transition-all hover:border-emerald-500/50"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-base leading-none shrink-0">{activeLanguageDef.flag}</span>
                                <span className="font-bold text-gray-900 dark:text-white truncate">{activeLanguageDef.label}</span>
                                {activeLanguageDef.sublabel && (
                                    <span className="text-[11px] font-normal text-gray-400 dark:text-gray-400 truncate">
                                        • {activeLanguageDef.sublabel}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[#1B6648] dark:text-emerald-400 border border-emerald-500/20 hidden sm:inline-block">
                                    {activeLanguageDef.nativeName}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isPrimaryLangOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`} />
                            </div>
                        </button>

                        <AnimatePresence>
                            {isPrimaryLangOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98, y: 4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: 4 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] shadow-2xl p-2 z-50 text-xs space-y-1 max-h-80 overflow-y-auto custom-scrollbar"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Search Filter Header */}
                                    <div className="px-1.5 pb-1.5">
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={primarySearch}
                                                onChange={(e) => setPrimarySearch(e.target.value)}
                                                placeholder="Filter dialects & languages..."
                                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-neutral-700 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Algerian Dialects Section */}
                                    {filteredAlgerian.length > 0 && (
                                        <div className="space-y-0.5">
                                            <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                                <span>🇩🇿</span>
                                                <span>Algerian Dialects & Scripts</span>
                                            </div>
                                            {filteredAlgerian.map((item) => {
                                                const isSelected = primaryLanguage === item.id;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setPrimaryLanguage(item.id);
                                                            setIsPrimaryLangOpen(false);
                                                            setPrimarySearch('');
                                                        }}
                                                        className={`w-full px-2.5 py-2 rounded-xl text-left transition-colors flex items-center justify-between cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#1B6648] dark:text-emerald-300 font-bold border border-emerald-500/20'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-transparent'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className="text-base shrink-0 leading-none">{item.flag}</span>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-xs font-bold truncate">{item.label}</span>
                                                                    {item.sublabel && (
                                                                        <span className="text-[10px] text-gray-400 dark:text-gray-400 font-normal truncate">
                                                                            • {item.sublabel}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                                            <span className="text-[11px] text-gray-400 dark:text-gray-400 font-medium">
                                                                {item.nativeName}
                                                            </span>
                                                            {isSelected && (
                                                                <Check className="w-3.5 h-3.5 text-[#1B6648] dark:text-emerald-400 shrink-0" />
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* International Languages Section */}
                                    {filteredInternational.length > 0 && (
                                        <div className="space-y-0.5 pt-1 border-t border-gray-100 dark:border-neutral-800">
                                            <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                                <span>🌍</span>
                                                <span>International Languages</span>
                                            </div>
                                            {filteredInternational.map((item) => {
                                                const isSelected = primaryLanguage === item.id;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setPrimaryLanguage(item.id);
                                                            setIsPrimaryLangOpen(false);
                                                            setPrimarySearch('');
                                                        }}
                                                        className={`w-full px-2.5 py-2 rounded-xl text-left transition-colors flex items-center justify-between cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#1B6648] dark:text-emerald-300 font-bold border border-emerald-500/20'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-transparent'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className="text-base shrink-0 leading-none">{item.flag}</span>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-xs font-bold truncate">{item.label}</span>
                                                                    {item.sublabel && (
                                                                        <span className="text-[10px] text-gray-400 dark:text-gray-400 font-normal truncate">
                                                                            • {item.sublabel}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                                            <span className="text-[11px] text-gray-400 dark:text-gray-400 font-medium">
                                                                {item.nativeName}
                                                            </span>
                                                            {isSelected && (
                                                                <Check className="w-3.5 h-3.5 text-[#1B6648] dark:text-emerald-400 shrink-0" />
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {filteredAlgerian.length === 0 && filteredInternational.length === 0 && (
                                        <div className="py-4 text-center text-xs text-gray-400">
                                            No matching languages found
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                        <div className="relative pt-1" ref={addDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsAddLangOpen(!isAddLangOpen)}
                                className="w-full px-3 py-2 text-xs font-semibold border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl bg-gray-50/50 dark:bg-black/20 dark:text-gray-300 hover:border-emerald-500 hover:text-[#1B6648] dark:hover:text-emerald-400 cursor-pointer flex items-center justify-between text-gray-600 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Add another language or dialect...</span>
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isAddLangOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isAddLangOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98, y: 4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, y: 4 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] shadow-2xl p-2 z-50 text-xs space-y-1 max-h-72 overflow-y-auto custom-scrollbar"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Quick Search */}
                                        <div className="px-1.5 pb-1.5">
                                            <div className="relative">
                                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={addSearch}
                                                    onChange={(e) => setAddSearch(e.target.value)}
                                                    placeholder="Search available languages..."
                                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-neutral-700 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        {filteredAddAlgerian.length > 0 && (
                                            <div className="space-y-0.5">
                                                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                                    <span>🇩🇿</span>
                                                    <span>Algerian Dialects</span>
                                                </div>
                                                {filteredAddAlgerian.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => {
                                                            handleAddLanguage(item.id);
                                                            setIsAddLangOpen(false);
                                                            setAddSearch('');
                                                        }}
                                                        className="w-full px-2.5 py-2 rounded-xl text-left transition-colors flex items-center justify-between cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-[#1B6648] dark:hover:text-emerald-300"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className="text-base shrink-0 leading-none">{item.flag}</span>
                                                            <div className="min-w-0">
                                                                <span className="text-xs font-bold truncate">{item.label}</span>
                                                                {item.sublabel && (
                                                                    <span className="text-[10px] text-gray-400 font-normal truncate ml-1.5">
                                                                        • {item.sublabel}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-[11px] text-gray-400 shrink-0 ml-2">{item.nativeName}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {filteredAddInternational.length > 0 && (
                                            <div className="space-y-0.5 pt-1 border-t border-gray-100 dark:border-neutral-800">
                                                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                                    <span>🌍</span>
                                                    <span>International Languages</span>
                                                </div>
                                                {filteredAddInternational.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => {
                                                            handleAddLanguage(item.id);
                                                            setIsAddLangOpen(false);
                                                            setAddSearch('');
                                                        }}
                                                        className="w-full px-2.5 py-2 rounded-xl text-left transition-colors flex items-center justify-between cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className="text-base shrink-0 leading-none">{item.flag}</span>
                                                            <div className="min-w-0">
                                                                <span className="text-xs font-bold truncate">{item.label}</span>
                                                                {item.sublabel && (
                                                                    <span className="text-[10px] text-gray-400 font-normal truncate ml-1.5">
                                                                        • {item.sublabel}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-[11px] text-gray-400 shrink-0 ml-2">{item.nativeName}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {filteredAddAlgerian.length === 0 && filteredAddInternational.length === 0 && (
                                            <div className="py-3 text-center text-xs text-gray-400">
                                                No languages found
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
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

                {/* ------------------------------------------------------------- */}
                {/* RANDOM EMOJI REACTIONS (33% DEFAULT) */}
                {/* ------------------------------------------------------------- */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 dark:border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
                                <Smile className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white flex items-center gap-2">
                                    <span>Random Human Reactions</span>
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                        {reactionProbability}% Chance
                                    </span>
                                </h4>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Naturally reacts with 👍, ❤️, 🔥, 👌 to customer messages before answering
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setReactionProbability(33)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                                    reactionProbability === 33
                                        ? 'bg-amber-500 text-white border-amber-500'
                                        : 'border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                }`}
                            >
                                33% Default
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                            <span>Never (0%)</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">{reactionProbability}% probability</span>
                            <span>Always (100%)</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={reactionProbability}
                            onChange={(e) => setReactionProbability(Number(e.target.value))}
                            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg"
                        />
                    </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SMART TYPING-AWARE DEBOUNCE INACTIVITY BUFFER & QUOTED REPLIES */}
                {/* ------------------------------------------------------------- */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 dark:border-blue-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-500 text-white shadow-xs">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white flex items-center gap-2">
                                    <span>Debounce Intelligent (Détection de Frappe)</span>
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400">
                                        {debounceSeconds}s Inactivité
                                    </span>
                                </h4>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Attend {debounceSeconds}s de silence avant de répondre. Si le client tape, le bot attend.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setDebounceSeconds(3)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                                debounceSeconds === 3
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'border-blue-500/30 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                            }`}
                        >
                            3s Défaut
                        </button>
                    </div>

                    <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                            <span>1s (Ultra rapide)</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{debounceSeconds} secondes de silence</span>
                            <span>20s</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            step="1"
                            value={debounceSeconds}
                            onChange={(e) => setDebounceSeconds(Number(e.target.value))}
                            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg"
                        />
                    </div>

                    {/* Native Quoted Replies Indicator */}
                    <div className="pt-2 border-t border-blue-500/20 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
                            <MessageSquareQuote className="w-3.5 h-3.5 text-blue-500" />
                            <span>Native Quoted Reply to Latest Message</span>
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            WhatsApp • Discord • Telegram
                        </span>
                    </div>
                </div>

                {/* REALISTIC BOT TYPING SIMULATION */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 dark:border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white flex items-center gap-2">
                                    <span>Simulation de Frappe Réaliste</span>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                        {realisticTypingSimulation ? 'Actif' : 'Désactivé'}
                                    </span>
                                </h4>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Plus le bot écrit un message long, plus il attend et simule la saisie en direct.
                                </p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={realisticTypingSimulation}
                                onChange={(e) => setRealisticTypingSimulation(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>

                    {realisticTypingSimulation && (
                        <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                                Cadence de saisie du bot :
                            </span>
                            <div className="inline-flex rounded-lg bg-black/5 dark:bg-white/5 p-1 gap-1">
                                <button
                                    type="button"
                                    onClick={() => setTypingCadence('fast')}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                        typingCadence === 'fast'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-black/5'
                                    }`}
                                >
                                    Rapide (1-3s)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTypingCadence('natural')}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                        typingCadence === 'natural'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-black/5'
                                    }`}
                                >
                                    Naturel (2-5s)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTypingCadence('slow')}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                        typingCadence === 'slow'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-black/5'
                                    }`}
                                >
                                    Humain (4-8s)
                                </button>
                            </div>
                        </div>
                    )}
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
