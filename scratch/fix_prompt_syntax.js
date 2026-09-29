const fs = require('fs');
let code = fs.readFileSync('components/dashboard/PromptCustomizer.tsx', 'utf8');

// The closing tags are currently messed up:
const messedUpClose = `This compiled prompt is injected into your n8n LLM agent in real-time along with any retrieved RAG document chunks.
                        </p>
                    </div>
                </div>
            )}`;

const originalClose = `This compiled prompt is injected into your n8n LLM agent in real-time along with any retrieved RAG document chunks.
                </p>
            </div>`;

code = code.replace(messedUpClose, originalClose);

// Now, let's properly wrap the inspector in the modal:
const oldInspector = `{/* Live System Prompt Inspector */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col justify-between">`;

const newInspector = `{/* Live System Prompt Inspector Button */}
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
                        </button>`;

code = code.replace(oldInspector, newInspector);

// Now wrap the ending
const finalClose = `This compiled prompt is injected into your n8n LLM agent in real-time along with any retrieved RAG document chunks.
                </p>
            </div>`;

const newFinalClose = `This compiled prompt is injected into your n8n LLM agent in real-time along with any retrieved RAG document chunks.
                        </p>
                    </div>
                </div>
            )}`;

code = code.replace(finalClose, newFinalClose);

// Make sure `MessageSquare` is imported
if (!code.includes('MessageSquare')) {
    code = code.replace(/import { Settings2, Globe/, "import { Settings2, Globe, MessageSquare");
}

fs.writeFileSync('components/dashboard/PromptCustomizer.tsx', code);
console.log("Fixed PromptCustomizer syntax");
