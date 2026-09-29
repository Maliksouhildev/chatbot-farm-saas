const fs = require('fs');
let code = fs.readFileSync('components/dashboard/PromptCustomizer.tsx', 'utf8');

// I will just use regex to replace everything after {/* Live System Prompt Inspector */}
const splitPoint = '{/* Live System Prompt Inspector Button */}';
if (code.includes(splitPoint)) {
    code = code.substring(0, code.indexOf(splitPoint));
    code += `{/* Live System Prompt Inspector Button */}
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
`;
}

fs.writeFileSync('components/dashboard/PromptCustomizer.tsx', code);
console.log("Completely overwrote the end of PromptCustomizer");
