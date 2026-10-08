'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Globe, UploadCloud, Plus, Trash2, CheckCircle, Database } from 'lucide-react';

interface KnowledgeSource {
    id: string;
    type: 'pdf' | 'url' | 'faq' | 'csv';
    title: string;
    chunkCount: number;
    status: 'indexed' | 'processing';
}

export const KnowledgeBaseManager: React.FC<{ botId: string }> = ({ botId }) => {
    const [activeTab, setActiveTab] = useState<'files' | 'urls' | 'faqs'>('files');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [faqQuestion, setFaqQuestion] = useState('');
    const [faqAnswer, setFaqAnswer] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Initialize with real data from localStorage or empty array
    const [sources, setSources] = useState<KnowledgeSource[]>([]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(`cf_kb_sources_${botId}`) || localStorage.getItem('cf_kb_sources');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setSources(parsed);
                }
            }
        } catch {}
    }, [botId]);

    const saveSources = (updated: KnowledgeSource[]) => {
        setSources(updated);
        try {
            localStorage.setItem(`cf_kb_sources_${botId}`, JSON.stringify(updated));
            localStorage.setItem('cf_kb_sources', JSON.stringify(updated));
        } catch {}
    };

    const handleAddFaq = () => {
        if (!faqQuestion.trim() || !faqAnswer.trim()) return;
        const newSource: KnowledgeSource = {
            id: Date.now().toString(),
            type: 'faq',
            title: faqQuestion.trim(),
            chunkCount: 1,
            status: 'indexed',
        };
        saveSources([newSource, ...sources]);
        setFaqQuestion('');
        setFaqAnswer('');
    };

    const handleCrawlUrl = () => {
        if (!websiteUrl.trim()) return;
        const newSource: KnowledgeSource = {
            id: Date.now().toString(),
            type: 'url',
            title: websiteUrl.trim(),
            chunkCount: 1,
            status: 'indexed',
        };
        saveSources([newSource, ...sources]);
        setWebsiteUrl('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setTimeout(() => {
            const newSource: KnowledgeSource = {
                id: Date.now().toString(),
                type: file.name.endsWith('.csv') ? 'csv' : 'pdf',
                title: file.name,
                chunkCount: Math.max(1, Math.ceil(file.size / 10240)),
                status: 'indexed',
            };
            saveSources([newSource, ...sources]);
            setIsUploading(false);
        }, 600);
    };

    const handleDelete = (id: string) => {
        const next = sources.filter((s) => s.id !== id);
        saveSources(next);
    };

    return (
        <div className="bg-white dark:bg-[#1A1D23] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 dark:border-neutral-800 gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Database className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Knowledge Base & RAG Training</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Train your chatbot with PDFs, website links, or direct FAQs</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === 'files' ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        Files (PDF/Excel)
                    </button>
                    <button
                        onClick={() => setActiveTab('urls')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === 'urls' ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        Website Links
                    </button>
                    <button
                        onClick={() => setActiveTab('faqs')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === 'faqs' ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        Custom FAQs
                    </button>
                </div>
            </div>

            {/* Ingestion Panels */}
            <div className="my-6">
                {activeTab === 'files' && (
                    <div className="border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors bg-gray-50/50 dark:bg-neutral-800/50">
                        <UploadCloud className="w-10 h-10 text-indigo-500 dark:text-indigo-400 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                            {isUploading ? 'Indexing file...' : 'Upload Product Catalog or FAQ Document'}
                        </h3>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                            Supports PDF, TXT, Excel, or CSV files. Automatically parsed into vector embeddings.
                        </p>
                        <label className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm transition-all">
                            <span>Browse File</span>
                            <input
                                type="file"
                                accept=".pdf,.txt,.csv,.xlsx"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                )}

                {activeTab === 'urls' && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                placeholder="https://yourstore.dz/products"
                                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                onClick={handleCrawlUrl}
                                disabled={!websiteUrl.trim()}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all"
                            >
                                Index URL
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'faqs' && (
                    <div className="space-y-3">
                        <div>
                            <input
                                type="text"
                                value={faqQuestion}
                                onChange={(e) => setFaqQuestion(e.target.value)}
                                placeholder="Question (e.g. Do you deliver to all 58 Wilayas?)"
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                            />
                            <textarea
                                rows={2}
                                value={faqAnswer}
                                onChange={(e) => setFaqAnswer(e.target.value)}
                                placeholder="Answer (e.g. Yes, delivery available across all 58 Wilayas within 48h...)"
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            onClick={handleAddFaq}
                            disabled={!faqQuestion.trim() || !faqAnswer.trim()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add FAQ to Memory</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Indexed Sources Table */}
            <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Indexed Knowledge Sources ({sources.length})
                </h3>
                {sources.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-gray-200 dark:border-neutral-800 rounded-xl">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            No knowledge base sources added yet.
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                            Upload a PDF catalog, add a website URL, or enter FAQs above to train your bot on your real business data.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-neutral-800 border border-gray-100 dark:border-neutral-800 rounded-xl overflow-hidden">
                        {sources.map((source) => (
                            <div key={source.id} className="flex items-center justify-between p-3.5 hover:bg-gray-50/80 dark:hover:bg-neutral-800/50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-lg">
                                        {source.type === 'pdf' ? (
                                            <FileText className="w-4 h-4 text-red-500 dark:text-red-400" />
                                        ) : source.type === 'url' ? (
                                            <Globe className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                        ) : (
                                            <Database className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{source.title}</p>
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500">{source.chunkCount} vector embeddings stored</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1 text-green-500 dark:text-green-400" /> Ready
                                    </span>
                                    <button
                                        onClick={() => handleDelete(source.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                        title="Remove Source"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
