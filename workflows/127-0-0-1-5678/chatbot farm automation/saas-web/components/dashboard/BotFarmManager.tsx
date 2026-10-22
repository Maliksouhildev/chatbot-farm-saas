"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  Check,
  Settings,
  Sparkles,
  Share2,
  BookOpen,
  Layers,
  Key,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  Info,
  CheckSquare,
  Square,
  Zap,
  Phone,
  ShoppingBag,
  Building2,
  Utensils,
  Headphones,
  MessageSquare,
  BrainCircuit,
  UploadCloud,
  Globe,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  Mic,
  Smile,
  Clock,
  MessageSquareQuote,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Database,
  Search,
  RotateCcw,
  Play,
  ArrowRight
} from 'lucide-react';
import {
  WhatsAppIcon,
  InstagramIcon,
  TelegramIcon,
  DiscordIcon,
  MessengerIcon,
  GmailIcon,
  SignalIcon,
  SlackIcon,
  ViberIcon,
  SnapchatIcon,
  GoogleChatIcon,
  GoogleMessagesIcon,
  GoogleVoiceIcon,
  XIcon,
  LinkedInIcon,
  IrcIcon,
  MatrixIcon
} from '@/components/icons/BrandIcons';
import { buildSystemPrompt } from '@/lib/darija_prompt_builder';
import { BOT_TEST_AVATAR } from '@/lib/whatsapp_avatars';

export interface BotInstance {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  assignedApps: string[];
  createdAt: string;
}

export interface KnowledgeSource {
  id: string;
  type: 'pdf' | 'url' | 'faq' | 'csv';
  title: string;
  chunkCount: number;
  status: 'indexed' | 'processing';
}

export const SUPPORTED_CHANNELS = [
  { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Evolution API / Cloud', color: '#25D366', Icon: WhatsAppIcon },
  { id: 'whatsapp_2', name: 'WhatsApp Line 2', desc: 'Secondary Line SIM', color: '#15803d', Icon: WhatsAppIcon },
  { id: 'instagram', name: 'Instagram Direct', desc: 'Meta Graph API', color: '#E1306C', Icon: InstagramIcon },
  { id: 'telegram', name: 'Telegram Bot', desc: '@BotFather Token', color: '#0088cc', Icon: TelegramIcon },
  { id: 'messenger', name: 'Facebook Messenger', desc: 'Meta Page Webhooks', color: '#0084FF', Icon: MessengerIcon },
  { id: 'gmail', name: 'Gmail Integration', desc: 'OAuth 2.0 Inbound', color: '#EA4335', Icon: GmailIcon },
  { id: 'discord', name: 'Discord Guild & DMs', desc: 'Multi-Channel Bot', color: '#5865F2', Icon: DiscordIcon },
  { id: 'signal', name: 'Signal Private', desc: 'Signal Protocol Assistant', color: '#3A76F0', Icon: SignalIcon },
  { id: 'slack', name: 'Slack Workspace', desc: 'Enterprise Bot & Webhooks', color: '#4A154B', Icon: SlackIcon },
  { id: 'viber', name: 'Viber Business', desc: 'Viber Bot API', color: '#7360F2', Icon: ViberIcon },
  { id: 'snapchat', name: 'Snapchat', desc: 'Snap Kit Integration', color: '#FFFC00', Icon: SnapchatIcon },
  { id: 'google_chat', name: 'Google Chat', desc: 'Workspace Webhooks & Spaces', color: '#00AC47', Icon: GoogleChatIcon },
  { id: 'google_messages', name: 'Google Messages', desc: 'RCS / Inbound SMS', color: '#1A73E8', Icon: GoogleMessagesIcon },
  { id: 'google_voice', name: 'Google Voice', desc: 'VoIP Inbound Assistant', color: '#0F9D58', Icon: GoogleVoiceIcon },
  { id: 'x_twitter', name: 'X (Twitter)', desc: 'Direct Messages API', color: '#14171A', Icon: XIcon },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Company Page & InMail', color: '#0A66C2', Icon: LinkedInIcon },
  { id: 'irc', name: 'IRC Network', desc: '#channel Bot Assistant', color: '#1E222A', Icon: IrcIcon },
  { id: 'matrix', name: 'Matrix / Element', desc: 'Decentralized E2EE Rooms', color: '#0DBD8B', Icon: MatrixIcon },
];

export const PROFESSIONAL_BOT_AVATARS = [
  { id: 'bot_core', label: 'Agent IA Core', Icon: Bot, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
  { id: 'ecommerce', label: 'E-Commerce', Icon: ShoppingBag, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  { id: 'support', label: 'Support & SAV', Icon: Headphones, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  { id: 'concierge', label: 'Conciergerie', Icon: Building2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'restaurant', label: 'Restauration', Icon: Utensils, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  { id: 'speed', label: 'Fast Closer', Icon: Zap, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  { id: 'brain', label: 'IA Intelligente', Icon: BrainCircuit, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  { id: 'shield', label: 'VIP Sécurisé', Icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
];

export const PRESET_TEMPLATES = [
  {
    id: 'ecommerce_dz',
    name: 'E-Commerce & Yalidine COD',
    desc: 'Ventes, prix DA, livraison 58 wilayas et encaissement à la livraison',
    Icon: ShoppingBag,
    colorClass: 'emerald',
    botName: 'Bot Test',
    businessName: 'Boutique DZ',
    primaryLanguage: 'darija_latin',
    basePersona: 'Vendeur commercial algérien chaleureux, rapide et accueillant. Renseigne précisément sur les produits et conclut les ventes en Darija naturelle.',
    customInstructions: 'Prix en Dinars (DA / alf). Livraison rapide 58 wilayas via Yalidine (400 DA Alger, 700 DA autres wilayas). Paiement sécurisé à la livraison.',
    contactHumanNumber: '0551671229',
  },
  {
    id: 'conciergerie',
    name: 'Conciergerie & Locations DZ',
    desc: 'Accueil hôtes, appartements meublés et gestion des boîtes à clés',
    Icon: Building2,
    colorClass: 'blue',
    botName: 'Concierge El Djazaïr',
    businessName: 'Appartements & Résidences Alger',
    primaryLanguage: 'darija_latin',
    basePersona: 'Concierge bilingue Darija/Français pour accueil clients, codes d\'accès, gestion des cautions et consignes de vie.',
    customInstructions: 'Boîte à clés à code sur le palier. Silence après 22h. Fumeurs sur le balcon uniquement. Contrat de location signé à l\'arrivée.',
    contactHumanNumber: '0550123456',
  },
  {
    id: 'restaurant_food',
    name: 'Restaurant & Fast Food',
    desc: 'Prise de commande, menus, grillades et livraison repas',
    Icon: Utensils,
    colorClass: 'amber',
    botName: 'Chef Service Client',
    businessName: 'Snack & Grill Alger',
    primaryLanguage: 'darija_latin',
    basePersona: 'Prise de commande rapide et conviviale en Darija pour menus, plats, grillades et boissons.',
    customInstructions: 'Temps de préparation moyen : 20 à 30 minutes. Toujours confirmer l\'adresse complète et un numéro joignable pour le livreur.',
    contactHumanNumber: '0555987654',
  },
  {
    id: 'customer_care',
    name: 'Support Client & SAV',
    desc: 'Assistance technique, garanties et transfert opérateur',
    Icon: Headphones,
    colorClass: 'purple',
    botName: 'Support Technique DZ',
    businessName: 'Service Après-Vente',
    primaryLanguage: 'darija_latin',
    basePersona: 'Agent support technique patient, courtois et orienté résolution pour assister les clients ayant un souci.',
    customInstructions: 'Aider au dépannage, répondre aux garanties, proposer le contact direct avec l\'administrateur si problème bloquant.',
    contactHumanNumber: '0551671229',
  },
  {
    id: 'custom_bot',
    name: 'Configuration Sur-Mesure',
    desc: 'Agent vierge adaptable selon les besoins spécifiques de votre magasin',
    Icon: Sparkles,
    colorClass: 'indigo',
    botName: 'Mon Assistant IA',
    businessName: 'Mon Entreprise',
    primaryLanguage: 'darija_latin',
    basePersona: 'Assistant IA professionnel dédié à l\'accompagnement de nos clients.',
    customInstructions: 'Instructions spécifiques configurées par le responsable.',
    contactHumanNumber: '0550000000',
  },
];

export const DIALECT_OPTIONS = [
  { id: 'darija_latin', label: 'Darija Algérienne', sub: 'Latin / Arabizi (3, 7, 9)', tag: 'DZ', sample: 'Salam khoya, chhal hada m3a livraison?' },
  { id: 'darija_arabic', label: 'Darija Algérienne', sub: 'Alphabet Arabe', tag: 'DZ', sample: 'سلام خويا، شحال هادا مع التوصيل؟' },
  { id: 'french', label: 'Français Commercial', sub: 'Service Client & Business', tag: 'FR', sample: 'Bonjour, quel est le délai de livraison ?' },
  { id: 'english', label: 'Anglais International', sub: 'International Business', tag: 'EN', sample: 'Hello, what is the price and delivery time?' },
];

interface BotFarmManagerProps {
  isProUser?: boolean;
  initialBotId?: string;
}

export const BotFarmManager: React.FC<BotFarmManagerProps> = ({
  isProUser = false,
  initialBotId
}) => {
  // Bots list & selected bot
  const [bots, setBots] = useState<BotInstance[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>('');

  // Persona & Dialect configuration for selected bot
  const [botName, setBotName] = useState('Bot Test');
  const [businessName, setBusinessName] = useState('Boutique DZ');
  const [primaryLanguage, setPrimaryLanguage] = useState<string>('darija_latin');
  const [basePersona, setBasePersona] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [contactHumanNumber, setContactHumanNumber] = useState('0551671229');
  const [voiceNotesEnabled, setVoiceNotesEnabled] = useState(true);
  const [reactionProbability, setReactionProbability] = useState<number>(33);
  const [debounceSeconds, setDebounceSeconds] = useState<number>(3);
  const [realisticTypingSimulation, setRealisticTypingSimulation] = useState<boolean>(true);
  const [typingCadence, setTypingCadence] = useState<'fast' | 'natural' | 'slow'>('natural');

  // Knowledge Base sources
  const [kbSources, setKbSources] = useState<KnowledgeSource[]>([]);
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Technical & Advanced options (Collapsible accordion)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [byokKey, setByokKey] = useState('');
  const [showByokKey, setShowByokKey] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [n8nRouterUrl, setN8nRouterUrl] = useState('http://localhost:5678/webhook/farm-router');
  const [useN8nRouter, setUseN8nRouter] = useState(false);

  // Feedback notice
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Inline rename / avatar edit
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('bot_core');

  // Create Bot Modal
  const [isCreating, setIsCreating] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotBusiness, setNewBotBusiness] = useState('');
  const [newBotAvatar, setNewBotAvatar] = useState('bot_core');
  const [newBotTemplate, setNewBotTemplate] = useState('ecommerce_dz');
  const [newBotApps, setNewBotApps] = useState<string[]>([]);

  // Live Test Bot Simulator Modal
  const [isTestSimulatorOpen, setIsTestSimulatorOpen] = useState(false);
  const [testMessages, setTestMessages] = useState<{ sender: 'user' | 'bot'; text: string; time: string }[]>([]);
  const [testInput, setTestInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load of bots
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cf_bots_list');
      if (saved) {
        const parsed: BotInstance[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize legacy avatars if they contain emojis
          const normalized = parsed.map(b => {
            let av = b.avatar || 'bot_core';
            if (av === '🤖') av = 'bot_core';
            if (av === '🛍️') av = 'ecommerce';
            if (av === '🎧') av = 'support';
            if (av === '🏢' || av === '🔑') av = 'concierge';
            if (av === '🍽️' || av === '🍔') av = 'restaurant';
            if (av === '⚡') av = 'speed';
            if (av === '✨') av = 'brain';
            return { ...b, avatar: av };
          });
          setBots(normalized);
          setSelectedBotId(initialBotId || normalized[0].id);
          return;
        }
      }
    } catch {}

    // Default Initial Bot
    const defaultBot: BotInstance = {
      id: 'bot_primary',
      name: 'Bot Test',
      avatar: 'bot_core',
      description: 'Agent principal omnicanal avec support Yalidine COD',
      assignedApps: ['whatsapp'],
      createdAt: new Date().toISOString(),
    };
    const initialList = [defaultBot];
    setBots(initialList);
    setSelectedBotId(defaultBot.id);
    try {
      localStorage.setItem('cf_bots_list', JSON.stringify(initialList));
      localStorage.setItem('cf_assigned_bot_whatsapp', defaultBot.id);
    } catch {}
  }, [initialBotId]);

  // Selected Bot reference
  const selectedBot = useMemo(() => {
    return bots.find(b => b.id === selectedBotId) || bots[0] || null;
  }, [bots, selectedBotId]);

  // 2. Load configurations for Selected Bot
  useEffect(() => {
    if (!selectedBot) return;

    try {
      // Load Persona
      const personaRaw = localStorage.getItem(`cf_bot_persona_${selectedBot.id}`) || localStorage.getItem('cf_prompt_config');
      if (personaRaw) {
        const p = JSON.parse(personaRaw);
        setBotName(p.botName || selectedBot.name || 'Bot Test');
        setBusinessName(p.businessName || 'Boutique DZ');
        setPrimaryLanguage(p.primaryLanguage || 'darija_latin');
        setBasePersona(p.basePersona || 'Vendeur commercial algérien chaleureux, rapide et accueillant.');
        setCustomInstructions(p.customInstructions || 'Prix en Dinars (DA / alf). Livraison 58 wilayas via Yalidine (400 DA Alger, 700 DA autres wilayas). Paiement à la livraison.');
        setContactHumanNumber(p.contactHumanNumber || '0551671229');
        setVoiceNotesEnabled(p.voiceNotesEnabled !== undefined ? p.voiceNotesEnabled : true);
        setReactionProbability(p.reactionProbability !== undefined ? p.reactionProbability : 33);
        setDebounceSeconds(p.debounceSeconds !== undefined ? p.debounceSeconds : 3);
        setRealisticTypingSimulation(p.realisticTypingSimulation !== undefined ? p.realisticTypingSimulation : true);
        setTypingCadence(p.typingCadence || 'natural');
      } else {
        // Fallback to preset 1
        const defPreset = PRESET_TEMPLATES[0];
        setBotName(selectedBot.name || defPreset.botName);
        setBusinessName(defPreset.businessName);
        setPrimaryLanguage(defPreset.primaryLanguage);
        setBasePersona(defPreset.basePersona);
        setCustomInstructions(defPreset.customInstructions);
        setContactHumanNumber(defPreset.contactHumanNumber);
        setVoiceNotesEnabled(true);
        setReactionProbability(33);
        setDebounceSeconds(3);
        setRealisticTypingSimulation(true);
        setTypingCadence('natural');
      }

      // Load Knowledge Base
      const kbRaw = localStorage.getItem(`cf_kb_sources_${selectedBot.id}`) || localStorage.getItem('cf_kb_sources');
      if (kbRaw) {
        const parsed = JSON.parse(kbRaw);
        if (Array.isArray(parsed)) setKbSources(parsed);
      } else {
        setKbSources([]);
      }

      // Load BYOK & Router
      const savedKey = localStorage.getItem('cf_byok_key') || localStorage.getItem('cf_user_byok_key') || '';
      setByokKey(savedKey);
      const savedRouterUrl = localStorage.getItem('cf_n8n_router_url') || 'http://localhost:5678/webhook/farm-router';
      setN8nRouterUrl(savedRouterUrl);
      const savedUseRouter = localStorage.getItem('cf_use_n8n_router') === 'true';
      setUseN8nRouter(savedUseRouter);

    } catch {}
  }, [selectedBot]);

  // Persist bots list helper
  const persistBots = (updatedList: BotInstance[]) => {
    setBots(updatedList);
    try {
      localStorage.setItem('cf_bots_list', JSON.stringify(updatedList));
      SUPPORTED_CHANNELS.forEach(ch => {
        const assigned = updatedList.find(b => b.assignedApps.includes(ch.id));
        if (assigned) {
          localStorage.setItem(`cf_assigned_bot_${ch.id}`, assigned.id);
        } else {
          localStorage.removeItem(`cf_assigned_bot_${ch.id}`);
        }
      });
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  // 3. Save Selected Bot Settings
  const handleSaveAll = () => {
    if (!selectedBot) return;

    // 1. Update bot in bots list
    const updatedBots = bots.map(b =>
      b.id === selectedBot.id
        ? { ...b, name: botName.trim() || b.name }
        : b
    );
    persistBots(updatedBots);

    // 2. Update persona
    const personaConfig = {
      botName: botName.trim() || 'Bot Test',
      businessName: businessName.trim() || 'Boutique DZ',
      primaryLanguage,
      enabledLanguages: [primaryLanguage, 'french', 'english'],
      basePersona,
      customInstructions,
      contactHumanNumber,
      voiceNotesEnabled,
      reactionProbability,
      debounceSeconds,
      realisticTypingSimulation,
      typingCadence,
    };
    try {
      localStorage.setItem(`cf_bot_persona_${selectedBot.id}`, JSON.stringify(personaConfig));
      localStorage.setItem('cf_prompt_config', JSON.stringify(personaConfig));

      // Also sync to global bot settings
      const globalBotSettings = {
        id: selectedBot.id,
        botName: personaConfig.botName,
        businessName: personaConfig.businessName,
        primaryLanguage,
        basePersona,
        customInstructions,
        contactHumanNumber,
        n8nWebhookUrl: n8nRouterUrl,
        useN8nRouter,
        debounceSeconds,
        realisticTypingSimulation,
        typingCadence,
      };
      localStorage.setItem('cf_bot_settings', JSON.stringify(globalBotSettings));

      if (byokKey.trim()) {
        const cleanKey = byokKey.replace(/^['"]+|['"]+$/g, '').replace(/^Bearer\s+/i, '').trim();
        localStorage.setItem('cf_byok_key', cleanKey);
        localStorage.setItem('cf_user_byok_key', cleanKey);
      }
      localStorage.setItem('cf_n8n_router_url', n8nRouterUrl);
      localStorage.setItem('cf_use_n8n_router', useN8nRouter ? 'true' : 'false');

      window.dispatchEvent(new Event('storage'));
    } catch {}

    setSaveNotice('Configuration enregistrée et synchronisée avec succès !');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  // 4. Apply a Preset Template
  const handleApplyPreset = (templateId: string) => {
    const tmpl = PRESET_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    setBotName(tmpl.botName);
    setBusinessName(tmpl.businessName);
    setPrimaryLanguage(tmpl.primaryLanguage);
    setBasePersona(tmpl.basePersona);
    setCustomInstructions(tmpl.customInstructions);
    setContactHumanNumber(tmpl.contactHumanNumber);

    setSaveNotice(`Modèle "${tmpl.name}" appliqué ! Pensez à enregistrer.`);
    setTimeout(() => setSaveNotice(null), 3500);
  };

  // 5. Toggle Channel Assignment
  const handleToggleApp = (appId: string) => {
    if (!selectedBot) return;

    const isAssigned = selectedBot.assignedApps.includes(appId);
    let updatedList: BotInstance[];

    if (isAssigned) {
      updatedList = bots.map(b =>
        b.id === selectedBot.id
          ? { ...b, assignedApps: b.assignedApps.filter(a => a !== appId) }
          : b
      );
    } else {
      updatedList = bots.map(b => {
        if (b.id === selectedBot.id) {
          return { ...b, assignedApps: [...b.assignedApps, appId] };
        } else {
          return { ...b, assignedApps: b.assignedApps.filter(a => a !== appId) };
        }
      });
    }

    persistBots(updatedList);
  };

  const handleCheckAllApps = () => {
    if (!selectedBot) return;
    const allIds = SUPPORTED_CHANNELS.map(c => c.id);
    const updated = bots.map(b =>
      b.id === selectedBot.id
        ? { ...b, assignedApps: allIds }
        : { ...b, assignedApps: b.assignedApps.filter(a => !allIds.includes(a)) }
    );
    persistBots(updated);
  };

  const handleUncheckAllApps = () => {
    if (!selectedBot) return;
    const updated = bots.map(b =>
      b.id === selectedBot.id
        ? { ...b, assignedApps: [] }
        : b
    );
    persistBots(updated);
  };

  // 6. Delete Bot
  const handleDeleteBot = (botId: string) => {
    if (bots.length <= 1) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet agent ? Ses canaux associés deviendront non assignés.")) return;

    const remaining = bots.filter(b => b.id !== botId);
    persistBots(remaining);
    if (selectedBotId === botId) {
      setSelectedBotId(remaining[0].id);
    }
  };

  // 7. Create New Bot Modal
  const handleCreateBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim()) return;

    const newId = `bot_${Date.now()}`;
    const selectedTemplate = PRESET_TEMPLATES.find(t => t.id === newBotTemplate) || PRESET_TEMPLATES[0];

    const updatedExisting = bots.map(b => ({
      ...b,
      assignedApps: b.assignedApps.filter(app => !newBotApps.includes(app))
    }));

    const createdBot: BotInstance = {
      id: newId,
      name: newBotName.trim(),
      avatar: newBotAvatar,
      description: `Agent IA ${selectedTemplate.name}`,
      assignedApps: newBotApps,
      createdAt: new Date().toISOString(),
    };

    // Save initial persona for new bot
    try {
      const personaConfig = {
        botName: createdBot.name,
        businessName: newBotBusiness.trim() || selectedTemplate.businessName,
        primaryLanguage: selectedTemplate.primaryLanguage,
        enabledLanguages: [selectedTemplate.primaryLanguage, 'french', 'english'],
        basePersona: selectedTemplate.basePersona,
        customInstructions: selectedTemplate.customInstructions,
        contactHumanNumber: selectedTemplate.contactHumanNumber,
        voiceNotesEnabled: true,
        reactionProbability: 33,
        debounceSeconds: 17,
      };
      localStorage.setItem(`cf_bot_persona_${newId}`, JSON.stringify(personaConfig));
    } catch {}

    const finalList = [...updatedExisting, createdBot];
    persistBots(finalList);
    setSelectedBotId(newId);
    setIsCreating(false);
    setNewBotName('');
    setNewBotBusiness('');
    setNewBotApps([]);
    setNewBotAvatar('bot_core');
    setNewBotTemplate('ecommerce_dz');
  };

  // 8. Knowledge Base Handlers
  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim() || !selectedBot) return;
    const newEntry: KnowledgeSource = {
      id: Date.now().toString(),
      type: 'faq',
      title: newFaqQ.trim(),
      chunkCount: 1,
      status: 'indexed',
    };
    const updated = [newEntry, ...kbSources];
    setKbSources(updated);
    try {
      localStorage.setItem(`cf_kb_sources_${selectedBot.id}`, JSON.stringify(updated));
    } catch {}
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleAddUrl = () => {
    if (!newUrl.trim() || !selectedBot) return;
    const newEntry: KnowledgeSource = {
      id: Date.now().toString(),
      type: 'url',
      title: newUrl.trim(),
      chunkCount: 2,
      status: 'indexed',
    };
    const updated = [newEntry, ...kbSources];
    setKbSources(updated);
    try {
      localStorage.setItem(`cf_kb_sources_${selectedBot.id}`, JSON.stringify(updated));
    } catch {}
    setNewUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBot) return;
    setIsUploadingFile(true);
    setTimeout(() => {
      const newEntry: KnowledgeSource = {
        id: Date.now().toString(),
        type: file.name.endsWith('.csv') ? 'csv' : 'pdf',
        title: file.name,
        chunkCount: Math.max(1, Math.ceil(file.size / 10240)),
        status: 'indexed',
      };
      const updated = [newEntry, ...kbSources];
      setKbSources(updated);
      try {
        localStorage.setItem(`cf_kb_sources_${selectedBot.id}`, JSON.stringify(updated));
      } catch {}
      setIsUploadingFile(false);
    }, 600);
  };

  const handleDeleteKb = (id: string) => {
    if (!selectedBot) return;
    const updated = kbSources.filter(s => s.id !== id);
    setKbSources(updated);
    try {
      localStorage.setItem(`cf_kb_sources_${selectedBot.id}`, JSON.stringify(updated));
    } catch {}
  };

  // 9. Live Test Simulator Logic
  const handleOpenTestSimulator = () => {
    setIsTestSimulatorOpen(true);
    if (testMessages.length === 0) {
      setTestMessages([
        {
          sender: 'bot',
          text: `Salam khoya! Marhba bik 3andna f ${businessName || 'Boutique DZ'}. Ana ${botName || 'Bot Test'}, l'assistant commercial. Kifech n9der nsa3dek lyoum?`,
          time: 'À l\'instant',
        }
      ]);
    }
  };

  const handleSendTestMessage = (customText?: string) => {
    const msg = customText || testInput;
    if (!msg.trim()) return;

    const userEntry = {
      sender: 'user' as const,
      text: msg.trim(),
      time: 'À l\'instant',
    };
    setTestMessages(prev => [...prev, userEntry]);
    if (!customText) setTestInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      let botReply = '';
      const lower = msg.toLowerCase();

      if (lower.includes('prix') || lower.includes('chhal') || lower.includes('souma') || lower.includes('combien')) {
        botReply = `Pour les prix, tout est affiché en Dinars algériens (DA). Nos produits sont de première qualité. Est-ce qu'il y a un article particulier qui vous intéresse ?`;
      } else if (lower.includes('livraison') || lower.includes('yalidine') || lower.includes('oran') || lower.includes('alger') || lower.includes('wilaya')) {
        botReply = `Oui khoya, la livraison est disponible sur 58 wilayas via Yalidine Express ! Le délai est généralement de 24h à 48h selon la wilaya, et vous payez directement à la livraison (COD) après avoir vérifié le colis.`;
      } else if (lower.includes('commander') || lower.includes('ncommandi') || lower.includes('achat') || lower.includes('acheter')) {
        botReply = `Parfait khoya ! Pour valider votre commande maintenant, envoyez-moi simplement votre Nom, votre Numéro de téléphone et votre Wilaya/Commune. Je m'occupe de préparer le colis direct.`;
      } else if (lower.includes('numéro') || lower.includes('appel') || lower.includes('vendeur') || lower.includes('contact')) {
        botReply = `Vous pouvez joindre notre responsable directement au ${contactHumanNumber || '0551671229'}. Il est joignable tous les jours pour vous répondre.`;
      } else {
        botReply = `Bien reçu khoya ! ${customInstructions ? `Pour rappel : ${customInstructions.slice(0, 120)}...` : 'Nous restons entièrement à votre disposition.'} Avez-vous une autre question ?`;
      }

      setTestMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: 'À l\'instant',
        }
      ]);
      setIsBotTyping(false);
    }, 600);
  };

  useEffect(() => {
    if (isTestSimulatorOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [testMessages, isBotTyping, isTestSimulatorOpen]);

  // Helper: Render vector bot avatar
  const renderBotAvatar = (avatarId: string, sizeClass = 'w-10 h-10') => {
    const found = PROFESSIONAL_BOT_AVATARS.find(a => a.id === avatarId);
    if (found) {
      const { Icon, color, bg } = found;
      return (
        <div className={`${sizeClass} rounded-2xl flex items-center justify-center border shadow-2xs ${bg} shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      );
    }
    // Fallback vector icon
    return (
      <div className={`${sizeClass} rounded-2xl flex items-center justify-center border border-indigo-500/30 bg-indigo-500/10 shadow-2xs shrink-0`}>
        <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-xs text-gray-800 dark:text-gray-100">
      {/* ------------------------------------------------------------- */}
      {/* HEADER: BOT FARM OVERVIEW & TOP ACTIONS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DFDFD4] dark:border-[#2E333D]">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <span>Studio de Configuration des Agents IA (Bot Farm)</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Gérez vos agents IA autonomes, personnalisez le dialecte Darija, vos tarifs Yalidine et assignez vos canaux de messagerie en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleOpenTestSimulator}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            title="Tester immédiatement l'agent dans un simulateur conversationnel"
          >
            <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
            <span>Tester le Bot en direct</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un Nouvel Agent</span>
          </button>
        </div>
      </div>

      {/* Save Notification Alert */}
      {saveNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* AGENTS CAROUSEL / SELECTOR */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-2">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>Agents IA Actifs ({bots.length})</span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Cliquez sur un agent pour modifier sa configuration</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bots.map((bot) => {
            const isSelected = bot.id === selectedBotId;
            return (
              <div
                key={bot.id}
                onClick={() => setSelectedBotId(bot.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/30'
                    : 'border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] hover:border-gray-400 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {renderBotAvatar(bot.avatar, 'w-10 h-10')}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                          {bot.name}
                        </h4>
                        {isSelected && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-indigo-600 text-white shrink-0">
                            Sélectionné
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {bot.assignedApps.length} canal{bot.assignedApps.length > 1 ? 'aux' : ''} assigné{bot.assignedApps.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {bots.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBot(bot.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer cet agent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Assigned Apps Badges Footer */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 flex-wrap">
                    {bot.assignedApps.length === 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Aucun canal relié
                      </span>
                    ) : (
                      bot.assignedApps.slice(0, 5).map((appKey) => {
                        const channelDef = SUPPORTED_CHANNELS.find(c => c.id === appKey);
                        if (!channelDef) return null;
                        const { Icon } = channelDef;
                        return (
                          <span
                            key={appKey}
                            title={channelDef.name}
                            className="w-5 h-5 rounded-md flex items-center justify-center p-0.5 bg-gray-100 dark:bg-black/40 border border-black/5 dark:border-white/10"
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                        );
                      })
                    )}
                    {bot.assignedApps.length > 5 && (
                      <span className="text-gray-400 font-bold ml-0.5">+{bot.assignedApps.length - 5}</span>
                    )}
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    Configurer →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN UNIFIED CONFIGURATION FORM (NO 3-TAB SWITCHER) */}
      {/* ------------------------------------------------------------- */}
      {selectedBot && (
        <div className="space-y-6">

          {/* ========================================================= */}
          {/* SECTION 1 (EMERALD / TEAL): IDENTITÉ & MODÈLES PRÉCONFIGURÉS */}
          {/* ========================================================= */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 dark:border-emerald-500/20 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <span>1. Identité de l'Agent & Modèle Métier</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                      Étape Principale
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Définissez le nom commercial de l'agent, votre boutique et appliquez un modèle clé en main.
                  </p>
                </div>
              </div>

              {/* Bot Avatar Selection Button */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] text-gray-500">Avatar :</span>
                {renderBotAvatar(selectedBot.avatar, 'w-8 h-8')}
                <button
                  type="button"
                  onClick={() => {
                    setEditName(botName);
                    setEditAvatar(selectedBot.avatar);
                    setIsEditingIdentity(true);
                  }}
                  className="p-1 text-gray-400 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
                  title="Changer le logo vectoriel de cet agent"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inline Avatar / Name Editor Modal or Dropdown */}
            {isEditingIdentity && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1D23] border border-emerald-500/40 shadow-sm space-y-3">
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">Choisir un Avatar Vectoriel Professionnel</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PROFESSIONAL_BOT_AVATARS.map((av) => {
                    const isAvSelected = editAvatar === av.id;
                    const { Icon, label, color, bg } = av;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatar(av.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                          isAvSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/40'
                            : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg} shrink-0`}>
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <span className="text-xs font-bold truncate text-gray-800 dark:text-gray-200">{label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsEditingIdentity(false)}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = bots.map(b =>
                        b.id === selectedBot.id ? { ...b, avatar: editAvatar } : b
                      );
                      persistBots(updated);
                      setIsEditingIdentity(false);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Appliquer le Logo
                  </button>
                </div>
              </div>
            )}

            {/* Presets Selection Grid */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                Modèles Métiers Clé en Main (Algérie)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {PRESET_TEMPLATES.map((tmpl) => {
                  const { Icon } = tmpl;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleApplyPreset(tmpl.id)}
                      className="p-3 rounded-2xl border border-emerald-500/20 bg-white/70 dark:bg-[#1A1D23]/70 hover:bg-white dark:hover:bg-[#1A1D23] hover:border-emerald-500/50 transition-all text-left flex items-start gap-2.5 cursor-pointer shadow-2xs group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">{tmpl.name}</p>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Appliquer
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{tmpl.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Identity Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Nom de l'Agent IA
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="ex: Bot Test, Conseiller Commercial"
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#2A2D35] focus:ring-2 focus:ring-emerald-500/40 outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Nom de la Boutique / Service
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="ex: Boutique DZ, Store Alger"
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#2A2D35] focus:ring-2 focus:ring-emerald-500/40 outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Numéro Vendeur Humain (Escalade)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={contactHumanNumber}
                    onChange={(e) => setContactHumanNumber(e.target.value)}
                    placeholder="0551671229"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#2A2D35] focus:ring-2 focus:ring-emerald-500/40 outline-none font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 2 (INDIGO / SAPPHIRE): DIALECTES & DARIJA RULES */}
          {/* ========================================================= */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent border border-indigo-500/30 dark:border-indigo-500/20 space-y-5 shadow-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-indigo-500/20">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span>2. Dialecte Darija, Règles Yalidine & Comportement de Réponse</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-800 dark:text-indigo-200">
                    Intelligence IA
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Définissez comment le bot s'exprime avec vos clients algériens et ses consignes de commande.
                </p>
              </div>
            </div>

            {/* Primary Dialect Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block">
                Dialecte Principal & Script Prioritaire
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {DIALECT_OPTIONS.map((opt) => {
                  const isSel = primaryLanguage === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPrimaryLanguage(opt.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSel
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30 font-bold'
                          : 'border-gray-200 dark:border-neutral-700 bg-white/70 dark:bg-[#1A1D23]/70 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-black/30 border border-black/5 text-gray-600 dark:text-gray-300">
                          [{opt.tag}]
                        </span>
                        {isSel && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-gray-900 dark:text-white leading-tight">{opt.label}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{opt.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smart Addons: Vocaux Whisper, Human Reactions, Debounce Sliding Window */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Vocaux Whisper */}
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#1A1D23]/80 border border-indigo-500/20 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-gray-900 dark:text-white">Vocaux (Whisper AI)</h5>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Actif par défaut</span>
                    </div>
                  </div>
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
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Transcrit automatiquement les messages audio reçus sur WhatsApp et Telegram.
                </p>
              </div>

              {/* Human Reaction Likelihood */}
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#1A1D23]/80 border border-indigo-500/20 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500 text-white">
                      <Smile className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-gray-900 dark:text-white">Réactions Naturelles</h5>
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">{reactionProbability}% de chance</span>
                    </div>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={reactionProbability}
                  onChange={(e) => setReactionProbability(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg"
                />
              </div>

              {/* Debounce Sliding Window Buffer */}
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#1A1D23]/80 border border-indigo-500/20 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500 text-white">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-gray-900 dark:text-white">Inactivité Client</h5>
                      <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">{debounceSeconds}s d'inactivité</span>
                    </div>
                  </div>
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
                <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">
                  Pause si le client tape, attend {debounceSeconds}s de silence.
                </p>
              </div>
            </div>

            {/* Realistic Bot Typing Simulation Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 dark:border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-2">
                      <span>Simulation de Frappe Réaliste</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                        {realisticTypingSimulation ? 'Actif' : 'Désactivé'}
                      </span>
                    </h5>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Plus le bot écrit un message long, plus il attend et simule la frappe en temps réel.
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

            {/* Persona Description & Specific Instructions */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Rôle & Personnalité du Bot (Comment il accueille les clients)
                </label>
                <textarea
                  rows={2}
                  value={basePersona}
                  onChange={(e) => setBasePersona(e.target.value)}
                  placeholder="Décrivez comment le bot doit s'exprimer..."
                  className="w-full p-3 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#2A2D35] focus:ring-2 focus:ring-indigo-500/40 outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Instructions Spécifiques, Tarifs & Livraison Yalidine COD (Paiement à la livraison)
                </label>
                <textarea
                  rows={3}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Tarifs des produits, frais de livraison par wilaya (ex: 400 DA Alger, 700 DA autres wilayas), conditions de retour..."
                  className="w-full p-3 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#2A2D35] focus:ring-2 focus:ring-indigo-500/40 outline-none resize-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 3 (VIOLET / PURPLE): CANAUX & RÉSEAUX ASSIGNÉS */}
          {/* ========================================================= */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-transparent border border-purple-500/30 dark:border-purple-500/20 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-700 dark:text-purple-300">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <span>3. Canaux de Messagerie & Réseaux Sociaux Assignés</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-800 dark:text-purple-200">
                      {selectedBot.assignedApps.length} / {SUPPORTED_CHANNELS.length} Canaux Actifs
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Sélectionnez les applications que cet agent doit gérer. Les messages entrants sur ces canaux seront traités par ce bot.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleCheckAllApps}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-bold text-xs border border-purple-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Tout Cocher</span>
                </button>
                <button
                  type="button"
                  onClick={handleUncheckAllApps}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:text-red-500 font-bold text-xs border border-gray-200 dark:border-neutral-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Tout Décocher</span>
                </button>
              </div>
            </div>

            {/* Channels Grid with Official Logos and Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {SUPPORTED_CHANNELS.map((ch) => {
                const isAssigned = selectedBot.assignedApps.includes(ch.id);
                const otherOwner = !isAssigned ? bots.find(b => b.assignedApps.includes(ch.id)) : null;
                const { Icon } = ch;

                return (
                  <div
                    key={ch.id}
                    onClick={() => handleToggleApp(ch.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isAssigned
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 shadow-xs ring-1 ring-purple-500/30'
                        : otherOwner
                        ? 'border-gray-200 dark:border-neutral-800 bg-gray-50/40 dark:bg-black/20 opacity-75'
                        : 'border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-[#1A1D23]/70 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-black/40 flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                          {ch.name}
                        </h5>
                        <p className="text-[10px] text-gray-400 truncate">
                          {isAssigned ? 'Géré par cet agent' : otherOwner ? `Géré par ${otherOwner.name}` : 'Non assigné'}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                        isAssigned ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          isAssigned ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 4 (SKY BLUE / CYAN): BASE DE CONNAISSANCES RAG */}
          {/* ========================================================= */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-transparent border border-sky-500/30 dark:border-sky-500/20 space-y-5 shadow-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-sky-500/20">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-700 dark:text-sky-300">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span>4. Base de Connaissances & Catalogue Produits (RAG)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-800 dark:text-sky-200">
                    {kbSources.length} Document{kbSources.length > 1 ? 's' : ''} Indexé{kbSources.length > 1 ? 's' : ''}
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Importez vos catalogues PDF, listes Excel ou ajoutez des questions/réponses spécifiques pour entraîner l'agent.
                </p>
              </div>
            </div>

            {/* Ingestion Options: File Upload & Quick FAQ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Upload Dropzone */}
              <div className="border-2 border-dashed border-sky-500/30 rounded-2xl p-4 text-center hover:border-sky-500 transition-colors bg-white/60 dark:bg-black/20 flex flex-col items-center justify-center">
                <UploadCloud className="w-8 h-8 text-sky-500 mb-2" />
                <h4 className="font-bold text-xs text-gray-800 dark:text-gray-200 mb-0.5">
                  {isUploadingFile ? 'Indexation en cours...' : 'Importer un Catalogue ou Fiche Tarifaire'}
                </h4>
                <p className="text-[10px] text-gray-400 mb-3">
                  Formats acceptés : PDF, Excel (.xlsx), CSV ou TXT
                </p>
                <label className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs">
                  <span>Parcourir un Fichier</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.csv,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Quick FAQ Form */}
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-sky-500/20 space-y-2.5">
                <h4 className="font-bold text-xs text-gray-800 dark:text-gray-200">
                  Ajouter une Question / Réponse Fréquente (FAQ)
                </h4>
                <input
                  type="text"
                  value={newFaqQ}
                  onChange={(e) => setNewFaqQ(e.target.value)}
                  placeholder="Question client (ex: Est-ce que le produit est garanti ?)"
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#2A2D35] outline-none"
                />
                <textarea
                  rows={2}
                  value={newFaqA}
                  onChange={(e) => setNewFaqA(e.target.value)}
                  placeholder="Réponse exacte de la boutique..."
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#2A2D35] outline-none resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    disabled={!newFaqQ.trim() || !newFaqA.trim()}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + Enregistrer la FAQ
                  </button>
                </div>
              </div>
            </div>

            {/* Indexed Sources List */}
            {kbSources.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Documents et Connaissances Actives ({kbSources.length})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {kbSources.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#1A1D23] border border-gray-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{s.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteKb(s.id)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                        title="Supprimer ce document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION 5: OPTIONS AVANCÉES & TECHNIQUE (ACCORDION) */}
          {/* ========================================================= */}
          <div className="rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1A1D23] shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Options Avancées & Paramètres Techniques (BYOK, Webhook Router, Prompt Brut)</span>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-500">
                      Optionnel
                    </span>
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Masqué par défaut pour garder l'interface simple et claire pour les gérants de boutique.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-[10px] font-bold">{showAdvanced ? 'Masquer' : 'Afficher'}</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showAdvanced && (
              <div className="p-5 sm:p-6 border-t border-gray-100 dark:border-neutral-800 space-y-4 bg-gray-50/50 dark:bg-black/20 animate-in fade-in">
                {/* BYOK API Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      <span>Clé API IA Personnalisée (BYOK - Groq, Gemini ou OpenAI)</span>
                    </label>
                    <span className="text-[10px] font-mono text-gray-400">Optionnel si vous avez votre propre clé</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showByokKey ? "text" : "password"}
                      value={byokKey}
                      onChange={(e) => setByokKey(e.target.value)}
                      placeholder="Collez votre clé API : AIzaSy... ou gsk_... ou sk-proj-..."
                      className="w-full px-3 py-2 pr-10 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#2A2D35] outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowByokKey(!showByokKey)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showByokKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* n8n Webhook Router */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                      URL du Routeur Webhook n8n
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useN8nRouter}
                        onChange={(e) => setUseN8nRouter(e.target.checked)}
                        className="rounded accent-indigo-600"
                      />
                      <span className="text-[10px] font-bold text-indigo-600">Activer le routage n8n</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={n8nRouterUrl}
                    onChange={(e) => setN8nRouterUrl(e.target.value)}
                    placeholder="http://localhost:5678/webhook/farm-router"
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#2A2D35] outline-none font-mono text-gray-700 dark:text-gray-300"
                  />
                </div>

                {/* Prompt Preview Modal Button */}
                <div className="pt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setShowPromptPreview(true)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Afficher l'aperçu du System Prompt généré en Darija</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* STICKY BOTTOM SAVE & TEST ACTION BAR */}
          {/* ========================================================= */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Bot className="w-4 h-4 text-emerald-600" />
              <span>Modifications prêtes pour <strong>{botName}</strong></span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenTestSimulator}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Tester en direct</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer & Synchroniser</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: CREATE NEW BOT DIALOG (REVAMPED & SLEEK) */}
      {/* ------------------------------------------------------------- */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1D23] rounded-3xl max-w-lg w-full p-6 border border-gray-200 dark:border-[#2E333D] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Créer un Nouvel Agent IA</h3>
                  <p className="text-[10px] text-gray-500">Ajoutez un nouvel assistant autonome pour votre entreprise</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBotSubmit} className="space-y-4">
              {/* Bot Name & Business */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Nom de l'Agent *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBotName}
                    onChange={(e) => setNewBotName(e.target.value)}
                    placeholder="ex: Commercial Yalidine, SAV Oran"
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#2A2D35] outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Nom de la Boutique
                  </label>
                  <input
                    type="text"
                    value={newBotBusiness}
                    onChange={(e) => setNewBotBusiness(e.target.value)}
                    placeholder="ex: Boutique DZ"
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#2A2D35] outline-none"
                  />
                </div>
              </div>

              {/* Vector Logo Picker */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Choisir un Logo Vectoriel
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PROFESSIONAL_BOT_AVATARS.map((av) => {
                    const isAvSelected = newBotAvatar === av.id;
                    const { Icon, label, color, bg } = av;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setNewBotAvatar(av.id)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                          isAvSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/40'
                            : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg} shrink-0`}>
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <span className="text-[10px] font-bold truncate text-gray-700 dark:text-gray-300 w-full">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preset Model Starter */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Modèle Métier de Départ
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {PRESET_TEMPLATES.map((tmpl) => {
                    const isTmplSelected = newBotTemplate === tmpl.id;
                    const { Icon } = tmpl;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => setNewBotTemplate(tmpl.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isTmplSelected
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500 font-bold'
                            : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs truncate font-bold text-gray-900 dark:text-white leading-tight">{tmpl.name}</p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{tmpl.desc}</p>
                        </div>
                        {isTmplSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Créer l'Agent IA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: LIVE TEST SIMULATOR MODAL (SANDBOX CONVERSATIONNEL) */}
      {/* ------------------------------------------------------------- */}
      {isTestSimulatorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#1A1D23] rounded-3xl max-w-md w-full h-[620px] max-h-[90vh] border border-gray-200 dark:border-[#2E333D] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                {renderBotAvatar(selectedBot?.avatar || 'bot_core', 'w-9 h-9')}
                <div>
                  <h4 className="font-extrabold text-xs leading-tight flex items-center gap-1.5">
                    <span>{botName}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-emerald-100 mt-0.5">
                    En direct • {businessName} ({primaryLanguage === 'darija_arabic' ? 'Darija Arabe' : 'Darija Arabizi'})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    // Seed sandbox test bot into workspace
                    try {
                      const firstApp = selectedBot?.assignedApps[0] || 'whatsapp';
                      const botContactId = `sandbox_bot_${firstApp}`;
                      const rawChats = localStorage.getItem('cf_live_chats_by_app');
                      const parsed = rawChats ? JSON.parse(rawChats) : {};
                      if (!Array.isArray(parsed[firstApp])) parsed[firstApp] = [];
                      const exists = parsed[firstApp].some((c: any) => c.id === botContactId);
                      if (!exists) {
                        parsed[firstApp].unshift({
                          id: botContactId,
                          appId: firstApp,
                          name: 'Bot Test',
                          avatar: BOT_TEST_AVATAR,
                          isAiTestBot: true,
                          isPinned: true,
                          lastMessage: 'Salam khoya! Marhba bik 3andna.',
                          timestamp: Date.now(),
                          unreadCount: 0,
                        });
                        localStorage.setItem('cf_live_chats_by_app', JSON.stringify(parsed));
                        localStorage.setItem('cf_active_chat_id', botContactId);
                        window.dispatchEvent(new Event('storage'));
                      }
                      window.location.href = '/';
                    } catch {}
                  }}
                  className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold cursor-pointer"
                  title="Ouvrir dans le Workspace Principal"
                >
                  Ouvrir Workspace
                </button>
                <button
                  type="button"
                  onClick={() => setIsTestSimulatorOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Test Chips */}
            <div className="p-2 bg-gray-50 dark:bg-black/30 border-b border-black/5 dark:border-white/5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0 text-[10px]">
              <span className="text-gray-400 font-bold shrink-0">Essais rapides :</span>
              <button
                type="button"
                onClick={() => handleSendTestMessage('Salam khoya, chhal hada m3a livraison?')}
                className="px-2 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-emerald-500 shrink-0 font-semibold cursor-pointer"
              >
                Prix & Livraison ?
              </button>
              <button
                type="button"
                onClick={() => handleSendTestMessage('Livraison Yalidine kayen l 58 wilayas?')}
                className="px-2 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-emerald-500 shrink-0 font-semibold cursor-pointer"
              >
                Yalidine 58 wilayas ?
              </button>
              <button
                type="button"
                onClick={() => handleSendTestMessage('Kifech ncommandi doka?')}
                className="px-2 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-emerald-500 shrink-0 font-semibold cursor-pointer"
              >
                Commander ?
              </button>
              <button
                type="button"
                onClick={() => handleSendTestMessage('A3tini numéro ta3 l commerçant')}
                className="px-2 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-emerald-500 shrink-0 font-semibold cursor-pointer"
              >
                Numéro vendeur ?
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 custom-scrollbar bg-slate-50 dark:bg-[#111317]">
              {testMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#1E2026] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-neutral-800 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}

              {isBotTyping && (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-[#1E2026] border border-gray-200 dark:border-neutral-800 text-[11px] text-gray-400 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200" />
                  <span className="ml-1 text-[10px]">{botName} rédige sa réponse en Darija...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-2.5 bg-white dark:bg-[#1A1D23] border-t border-gray-200 dark:border-neutral-800 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendTestMessage();
                }}
                placeholder="Posez une question en Darija (ex: Salam, kayen livraison l Alger?)..."
                className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-gray-50 dark:bg-[#2A2D35] outline-none"
              />
              <button
                type="button"
                onClick={() => handleSendTestMessage()}
                disabled={!testInput.trim()}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl cursor-pointer transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: SYSTEM PROMPT PREVIEW MODAL */}
      {/* ------------------------------------------------------------- */}
      {showPromptPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1D23] rounded-3xl max-w-lg w-full p-6 border border-gray-200 dark:border-[#2E333D] shadow-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800 mb-3">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Aperçu du System Prompt Généré</h3>
              <button
                type="button"
                onClick={() => setShowPromptPreview(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <pre className="text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-black/40 p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
                {buildSystemPrompt({
                  botName,
                  businessName,
                  primaryLanguage,
                  enabledLanguages: [primaryLanguage, 'french', 'english'],
                  basePersona,
                  customInstructions,
                  contactHumanNumber,
                  voiceNotesEnabled,
                })}
              </pre>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPromptPreview(false)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
