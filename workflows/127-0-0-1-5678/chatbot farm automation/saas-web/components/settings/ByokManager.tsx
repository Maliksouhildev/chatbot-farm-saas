"use client";

import React, { useState, useEffect } from 'react';
import {
  Key,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Eye,
  Mic,
  MessageSquareQuote,
  Activity,
  ArrowRight,
  Layers,
  Copy,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface ByokManagerProps {
  isPro?: boolean;
}

export interface ProviderDef {
  id: 'gemini' | 'openai' | 'groq' | 'openrouter';
  name: string;
  defaultModel: string;
  availableModels: string[];
  keyPlaceholder: string;
  badge: string;
  badgeColor: string;
  hasNativeVision: boolean;
  hasNativeAudio: boolean;
  notes: string;
}

const PROVIDERS: ProviderDef[] = [
  {
    id: 'gemini',
    name: 'Google Gemini (Recommended)',
    defaultModel: 'gemini-2.5-flash',
    availableModels: ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    keyPlaceholder: 'AIzaSy...',
    badge: 'Free Tier Available',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
    hasNativeVision: true,
    hasNativeAudio: true,
    notes: 'All-in-one free engine: Context-Aware Vision, Voice Transcription, and Fast Darija Chat in one key.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    availableModels: ['gpt-4o-mini', 'gpt-4o'],
    keyPlaceholder: 'sk-proj-...',
    badge: 'GPT-4o Multimodal',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300',
    hasNativeVision: true,
    hasNativeAudio: false,
    notes: 'High reasoning accuracy. Audio voice notes are automatically transcribed via Whisper.',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    defaultModel: 'llama-3.3-70b-versatile',
    availableModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    keyPlaceholder: 'gsk_...',
    badge: 'Ultra Fast',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
    hasNativeVision: false,
    hasNativeAudio: true,
    notes: 'Sub-second text generation. Images are automatically analyzed via Gemini Flash vision router.',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    availableModels: ['meta-llama/llama-3.3-70b-instruct', 'qwen/qwen-2.5-72b-instruct', 'deepseek/deepseek-chat'],
    keyPlaceholder: 'sk-or-...',
    badge: 'Multi-Model Hub',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300',
    hasNativeVision: true,
    hasNativeAudio: false,
    notes: 'Unified routing to 100+ open-weights and proprietary models with single pay-as-you-go key.',
  },
];

const SAMPLE_BENCHMARK_PROMPTS = [
  {
    label: 'Apartment & Conciergerie Rules',
    text: "Hello! Yesterday, the plumber came and finally fixed the leak in the bathroom, so the hot water is working perfectly now. However, please do not mess with the air conditioning remote control or the central heating pipes. Last week, a guest tried to fix them and completely broke them. Also, remember that you must keep the room clean, and if you smoke, you must go to the balcony, not inside the living room. Because it will rain a lot tomorrow in Algiers, make sure to close the window tightly before you go out. The key is inside the lockbox near the big door, so you will find it easily. He told me that our old neighbors upstairs are very quiet, so please do not make any loud noise in the evening. If anyone feels sick, there is medicine in the kitchen cabinet, and the nearest pharmacy is located right next to the hospital. Finally, we must sign the rental contract tomorrow, and you have to pay the rent on time. See you later!",
  },
  {
    label: 'E-Commerce Order & Yalidine COD',
    text: "Salam! Is this perfume available in black color and what is the final price with delivery to Oran? Do you accept cash on delivery when the driver arrives at my home?",
  },
  {
    label: 'Hospitality & Dietary Rules',
    text: "Welcome to our home in Algiers! Do not be shy, my mother prepared couscous with fresh lamb for lunch. Please do not drink black coffee on an empty stomach. If you want to take a nap, the guest room is ready with clean blankets.",
  },
];

export const ByokManager: React.FC<ByokManagerProps> = ({ isPro: isProProp }) => {
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai' | 'groq' | 'openrouter'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [isSaved, setIsSaved] = useState(false);
  const [isPro, setIsPro] = useState(isProProp || false);

  // Live Benchmark & Translation Tester state
  const [benchmarkPromptIndex, setBenchmarkPromptIndex] = useState(0);
  const [customPrompt, setCustomPrompt] = useState(SAMPLE_BENCHMARK_PROMPTS[0].text);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [copiedResult, setCopiedResult] = useState(false);

  useEffect(() => {
    if (isProProp !== undefined) {
      setIsPro(isProProp);
      return;
    }
    try {
      const session = localStorage.getItem('cf_user_session');
      if (session) {
        const user = JSON.parse(session);
        if (user?.plan && user.plan.toLowerCase().includes('pro')) {
          setIsPro(true);
        }
      }
    } catch {}
  }, [isProProp]);

  useEffect(() => {
    try {
      const savedProvider = (localStorage.getItem('cf_byok_provider') as any) || 'gemini';
      const savedKey = localStorage.getItem('cf_byok_key');
      const savedModel = localStorage.getItem('cf_byok_model');
      if (savedProvider) setSelectedProvider(savedProvider);
      if (savedKey) setApiKey(savedKey);
      if (savedModel) setModelName(savedModel);
      else {
        const p = PROVIDERS.find((x) => x.id === savedProvider) || PROVIDERS[0];
        setModelName(p.defaultModel);
      }
    } catch {}
  }, []);

  const handleSelectProvider = (provId: 'gemini' | 'openai' | 'groq' | 'openrouter') => {
    setSelectedProvider(provId);
    const prov = PROVIDERS.find((p) => p.id === provId);
    if (prov) {
      setModelName(prov.defaultModel);
    }
  };

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    const trimmed = val.trim();
    // Auto-detect provider if user pastes standard key
    if (trimmed.startsWith('AIza')) {
      setSelectedProvider('gemini');
      setModelName('gemini-2.5-flash');
    } else if (trimmed.startsWith('gsk_')) {
      setSelectedProvider('groq');
      setModelName('llama-3.3-70b-versatile');
    } else if (trimmed.startsWith('sk-or-')) {
      setSelectedProvider('openrouter');
      setModelName('meta-llama/llama-3.3-70b-instruct');
    } else if (trimmed.startsWith('sk-') && !trimmed.startsWith('sk-or-')) {
      setSelectedProvider('openai');
      setModelName('gpt-4o-mini');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('cf_byok_provider', selectedProvider);
      localStorage.setItem('cf_byok_key', apiKey.trim());
      localStorage.setItem('cf_byok_model', modelName.trim());
    } catch {}
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleRunLiveBenchmarkTest = async () => {
    if (!apiKey.trim()) {
      setTestError('Please enter an API key above before running the translation benchmark.');
      return;
    }

    setIsTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
        },
        body: JSON.stringify({
          text: customPrompt,
          provider: selectedProvider,
          model: modelName,
          apiKey: apiKey.trim(),
          benchmark: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Translation benchmark failed with status ${res.status}`);
      }

      setTestResult(data);
    } catch (err: any) {
      setTestError(err.message || 'Network error while contacting translation model');
    } finally {
      setIsTesting(false);
    }
  };

  const activeProvider = PROVIDERS.find((p) => p.id === selectedProvider) || PROVIDERS[0];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#EB6708]" />
          Multi-API Model Engine & Darija Benchmark
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs">
          Connect your API key (Gemini, OpenAI, Groq, OpenRouter). The engine automatically adapts to your chosen model,
          assigns the optimal endpoint, and generates authentic Algiers Arabizi translations synchronized with your n8n workflow.
        </p>
      </div>

      {/* Provider Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {PROVIDERS.map((prov) => {
          const isSelected = selectedProvider === prov.id;
          return (
            <button
              key={prov.id}
              type="button"
              onClick={() => handleSelectProvider(prov.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-[#EB6708] bg-orange-50/50 dark:bg-orange-950/20 ring-2 ring-[#EB6708]/30 shadow-xs'
                  : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1E222A] hover:border-gray-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {prov.name.split(' ')[0]}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${prov.badgeColor}`}>
                    {prov.badge}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2">
                  {prov.notes}
                </p>
              </div>
              <div className="mt-2 text-[10px] font-mono text-gray-400 truncate">
                {prov.defaultModel}
              </div>
            </button>
          );
        })}
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
            <span>{activeProvider.name} API Key</span>
            <span className="text-[10px] font-normal text-gray-400">Auto-detects format</span>
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder={activeProvider.keyPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1E222A] rounded-xl focus:ring-2 focus:ring-[#EB6708] outline-none transition-shadow"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Target Model (Assigned)
            </label>
            <div className="relative">
              <Sparkles className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder={activeProvider.defaultModel}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1E222A] rounded-xl focus:ring-2 focus:ring-[#EB6708] outline-none transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Model Presets for {activeProvider.name.split(' ')[0]}
            </label>
            <select
              value={activeProvider.availableModels.includes(modelName) ? modelName : ''}
              onChange={(e) => {
                if (e.target.value) setModelName(e.target.value);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1E222A] rounded-xl focus:ring-2 focus:ring-[#EB6708] outline-none cursor-pointer"
            >
              <option value="">Custom Model Name</option>
              {activeProvider.availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Capability Indicators & Situation-Aware Badges */}
        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-neutral-800 space-y-2.5">
          <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>Active Model Dynamic Pipeline Capabilities:</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              22 Algiers Dialect Rules Enforced
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span
              className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                activeProvider.hasNativeVision
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
              }`}
            >
              <Eye className="w-3 h-3" />
              {activeProvider.hasNativeVision ? 'Vision: Native Supported' : 'Vision: Auto-Bridged to Gemini Flash'}
            </span>

            <span
              className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                activeProvider.hasNativeAudio
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
              }`}
            >
              <Mic className="w-3 h-3" />
              {activeProvider.hasNativeAudio ? 'Audio: Whisper Audio-First' : 'Audio: Auto-Bridged to Whisper'}
            </span>

            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 font-semibold flex items-center gap-1">
              <MessageSquareQuote className="w-3 h-3" />
              Arabizi Qaf Lock ('9'): Active
            </span>

            <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3" />
              n8n Webhook Sync: Active
            </span>
          </div>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#1B1B1B] dark:bg-white text-white dark:text-black hover:opacity-90 font-bold text-xs rounded-xl shadow-md flex justify-center items-center gap-2 transition-all cursor-pointer"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <ShieldCheck className="w-4 h-4" />}
            {isSaved ? 'Key Saved & Bound to Model' : 'Save & Link to n8n'}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
            Need a key?{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EB6708] font-bold hover:underline"
            >
              Gemini Console
            </a>{' '}
            ·{' '}
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EB6708] font-bold hover:underline"
            >
              Groq Cloud
            </a>{' '}
            ·{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EB6708] font-bold hover:underline"
            >
              OpenRouter
            </a>
          </p>
        </div>
      </form>

      {/* LIVE AI MODEL BENCHMARK & TRANSLATOR TESTER */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#EB6708]" />
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              Live Darija AI Model Benchmark & Translation Verification
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-100 text-[#EB6708] dark:bg-orange-950/40 font-bold">
            Interactive Test
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Verify that your selected model translates correctly according to the strict Algiers dialect rules (Qaf to 9, zero Fus'ha, no Moroccan loanwords).
        </p>

        {/* Preset Prompt Tabs */}
        <div className="flex flex-wrap gap-2">
          {SAMPLE_BENCHMARK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setBenchmarkPromptIndex(idx);
                setCustomPrompt(p.text);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                benchmarkPromptIndex === idx
                  ? 'bg-[#1B1B1B] dark:bg-white text-white dark:text-black shadow-xs'
                  : 'bg-gray-100 dark:bg-[#1E222A] text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Text Area */}
        <div className="space-y-1.5">
          <textarea
            rows={3}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full p-3 text-xs border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1A1D23] rounded-2xl focus:ring-2 focus:ring-[#EB6708] outline-none font-mono"
            placeholder="Type English or French text to translate into Algiers Darija Arabizi..."
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleRunLiveBenchmarkTest}
            disabled={isTesting}
            className="px-5 py-2.5 bg-gradient-to-r from-[#EB6708] to-[#FF8C38] text-white hover:opacity-95 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isTesting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isTesting ? `Benchmarking ${modelName}...` : `Benchmark & Translate with ${activeProvider.name.split(' ')[0]}`}
          </button>

          <span className="text-[11px] font-mono text-gray-400">
            Assigned: {modelName}
          </span>
        </div>

        {/* Error Notification */}
        {testError && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Model Benchmark Error</p>
              <p className="text-[11px]">{testError}</p>
            </div>
          </div>
        )}

        {/* Benchmark Results Display */}
        {testResult && (
          <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 dark:border-emerald-900/60 pb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Translation Generated Successfully
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-black/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
                  Latency: {testResult.latencyMs} ms
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-black/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
                  Model: {testResult.model}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-black/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
                  Regex Corrections: {testResult.regexCorrections ?? 0}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                <span>Algiers Darija Arabizi Output:</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(testResult.translation || '');
                    setCopiedResult(true);
                    setTimeout(() => setCopiedResult(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-emerald-700 dark:text-gray-400 dark:hover:text-emerald-300 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  {copiedResult ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-3 bg-white dark:bg-[#1A1D23] rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-xs text-gray-800 dark:text-gray-100 font-mono leading-relaxed select-all">
                {testResult.translation}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
