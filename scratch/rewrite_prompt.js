const fs = require('fs');
let code = fs.readFileSync('scratch/PromptCustomizer_orig.tsx', 'utf8');

// Fix dark mode backgrounds in PromptCustomizer
code = code.replace(/className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6"/g, 
  'className="bg-white dark:bg-[#1A1D23] rounded-2xl border border-gray-100 dark:border-[#2E333D] shadow-sm p-6 space-y-6"');

// Fix text colors inside the card for dark mode
code = code.replace(/text-gray-900/g, 'text-gray-900 dark:text-white');
code = code.replace(/text-gray-700/g, 'text-gray-700 dark:text-gray-300');
code = code.replace(/bg-gray-50/g, 'bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white');
code = code.replace(/border-gray-200/g, 'border-gray-200 dark:border-neutral-700');
code = code.replace(/hover:border-gray-300/g, 'hover:border-gray-300 dark:hover:border-neutral-600');
code = code.replace(/bg-indigo-50\/40/g, 'bg-indigo-50/40 dark:bg-indigo-900/20');
code = code.replace(/bg-white/g, 'bg-white dark:bg-[#1A1D23]'); // general inputs
code = code.replace(/grid-cols-1 lg:grid-cols-2/g, 'grid-cols-1 max-w-2xl mx-auto');

// Change the live inspector to be a modal
const inspectorTarget = `{/* Live System Prompt Inspector */}
            <div className="bg-gray-900 dark:bg-[#1A1D23] rounded-2xl border border-gray-800 p-6 flex flex-col justify-between">`;
const modalCode = `{/* Live System Prompt Inspector Button */}
            <button
                onClick={() => setShowPromptModal(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-900 dark:text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
                <MessageSquare className="w-4 h-4" />
                <span>View Generated Master Prompt</span>
            </button>

            {/* Modal */}
            {showPromptModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col justify-between w-full max-w-3xl relative">
                        <button onClick={() => setShowPromptModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>`;
code = code.replace(inspectorTarget, modalCode);

const closeTarget = `This compiled prompt is injected into your n8n LLM agent in real-time along with any retrieved RAG document chunks.
                </p>
            </div>`;
const closeReplace = `This compiled prompt is injected into your n8n LLM agent in real-time along with any retrieved RAG document chunks.
                        </p>
                    </div>
                </div>
            )}`;
code = code.replace(closeTarget, closeReplace);

// Add useState for modal
code = code.replace(/const \[saved, setSaved\] = useState\(false\);/, 'const [saved, setSaved] = useState(false);\n    const [showPromptModal, setShowPromptModal] = useState(false);');

fs.writeFileSync('components/dashboard/PromptCustomizer.tsx', code);
console.log("Rewrote PromptCustomizer");
