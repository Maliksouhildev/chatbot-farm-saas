/**
 * RAG Knowledge Base Ingestion & Embedding Processor
 * Chunks documents, FAQs, or website content and stores embeddings in Supabase pgvector.
 */

export interface KnowledgeChunk {
    content: string;
    metadata?: Record<string, any>;
}

export class RagProcessor {
    private geminiApiKey: string;
    private supabaseUrl: string;
    private supabaseKey: string;

    constructor() {
        this.geminiApiKey = process.env.GEMINI_API_KEY || '';
        this.supabaseUrl = process.env.SUPABASE_URL || '';
        this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    }

    /**
     * Splits raw text into manageable chunks with overlap
     */
    chunkText(text: string, chunkSize: number = 600, overlap: number = 100): string[] {
        const cleaned = text.replace(/\r\n/g, '\n').replace(/\n+/g, '\n');
        const chunks: string[] = [];
        let start = 0;

        while (start < cleaned.length) {
            const end = Math.min(start + chunkSize, cleaned.length);
            let chunk = cleaned.slice(start, end);
            
            // Try not to split words in half
            if (end < cleaned.length) {
                const lastSpace = chunk.lastIndexOf(' ');
                if (lastSpace > chunkSize * 0.7) {
                    chunk = chunk.slice(0, lastSpace);
                }
            }

            chunks.push(chunk.trim());
            start += Math.max(chunk.length - overlap, 1);
        }

        return chunks.filter(c => c.length > 20);
    }

    /**
     * Generate Google Gemini text embeddings (768 dimensions)
     */
    async generateEmbedding(text: string, customApiKey?: string): Promise<number[]> {
        const apiKey = customApiKey || this.geminiApiKey;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'models/text-embedding-004',
                content: {
                    parts: [{ text }]
                }
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Gemini Embedding error: ${res.statusText} - ${errorText}`);
        }

        const data = await res.json();
        return data.embedding.values;
    }

    /**
     * Ingest full document into Supabase pgvector
     */
    async processAndStoreDocument(
        botId: string,
        sourceId: string,
        rawText: string,
        metadata: Record<string, any> = {},
        customApiKey?: string
    ): Promise<number> {
        const chunks = this.chunkText(rawText);
        let storedCount = 0;

        for (const chunk of chunks) {
            const embedding = await this.generateEmbedding(chunk, customApiKey);

            const res = await fetch(`${this.supabaseUrl}/rest/v1/knowledge_embeddings`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify({
                    bot_id: botId,
                    source_id: sourceId,
                    content: chunk,
                    embedding: embedding,
                    metadata: metadata,
                }),
            });

            if (res.ok) {
                storedCount++;
            }
        }

        return storedCount;
    }
}
