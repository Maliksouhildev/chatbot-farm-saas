'use client';

import React, { useState } from 'react';
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

    const [sources, setSources] = useState<KnowledgeSource[]>([
        { id: '1', type: 'pdf', title: 'Catalogue_Automne_2026.pdf', chunkCount: 24, status: 'indexed' },
        { id: '2', type: 'url', title: 'https://boutique-elbahdja.dz/livraison', chunkCount: 8, status: 'indexed' },
        { id: '3', type: 'faq', title: 'Tarifs et délais de livraison 58 Wilayas', chunkCount: 3, status: 'indexed' },
    ]);

    const handleAddFaq = () => {
        if (!faqQuestion || !faqAnswer) return;
        const newSource: KnowledgeSource = {
            id: Date.now().toString(),
            type: 'faq',
            title: faqQuestion,
            chunkCount: 1,
            status: 'indexed',
        };
        setSources([newSource, ...sources]);
        setFaqQuestion('');
        setFaqAnswer('');
    };

    const handleCrawlUrl = () => {
        if (!websiteUrl) return;
        const newSource: KnowledgeSource = {
            id: Date.now().toString(),
            type: 'url',
            title: websiteUrl,
            chunkCount: 12,
            status: 'indexed',
        };
        setSources([newSource, ...sources]);
        setWebsiteUrl('');
    };

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-6">
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
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Upload Product Catalogs or Price Lists</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                            Drag & drop PDF brochures, restaurant menus, or Excel CSV product tables here. They will be automatically parsed into AI embeddings.
                        </p>
                        <input type="file" id="fileUpload" className="hidden" accept=".pdf,.doc,.docx,.csv,.xlsx" />
                        <label
                            htmlFor="fileUpload"
                            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm transition-all"
                        >
                            Select File from Computer
                        </label>
                    </div>
                )}

                {activeTab === 'urls' && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            <input
                                type="url"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                placeholder="https://yourstore.dz or Facebook/Instagram page link"
                                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleCrawlUrl}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Crawl & Index</span>
                        </button>
                    </div>
                )}

                {activeTab === 'faqs' && (
                    <div className="space-y-3 bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-gray-200 dark:border-neutral-700">
                        <div>
                            <input
                                type="text"
                                value={faqQuestion}
                                onChange={(e) => setFaqQuestion(e.target.value)}
                                placeholder="Question (e.g. Chhal la livraison l Oran w Constantina?)"
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <textarea
                                rows={2}
                                value={faqAnswer}
                                onChange={(e) => setFaqAnswer(e.target.value)}
                                placeholder="Answer in Darija or French (e.g. Livraison l Oran b 500 DA w sous 48h direct l dar...)"
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            onClick={handleAddFaq}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5"
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
                                    onClick={() => setSources(sources.filter((s) => s.id !== source.id))}
                                    className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
