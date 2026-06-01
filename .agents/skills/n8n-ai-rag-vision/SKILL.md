---
name: n8n-ai-rag-vision
description: Triggered when building workflows with advanced AI, linking OpenAI models (gpt-4o), vector stores, embeddings, and vision processing.
---

# Goal
To correctly configure `n8n-nodes-base.advancedAi` nodes for RAG (Retrieval-Augmented Generation) and Vision processing pipelines.

# Instructions
1. AI Agent Nodes: Use `n8n-nodes-langchain.agent` or `n8n-nodes-base.advancedAi` correctly. 
2. Connections: AI nodes have specific input types: `ai_languageModel`, `ai_memory`, `ai_tool`. 
3. Wire the model (e.g., `n8n-nodes-langchain.lmChatOpenAi`) to the Agent's `ai_languageModel` input (usually index 0 or defined by `type`).
4. Vector Store: Wire an Embedding model (`n8n-nodes-langchain.embeddingsOpenAi`) to the Vector Store's `ai_embedding` input.
5. Vision: When passing images to GPT-4o, ensure the binary property containing the image (e.g., `data`) is specified in the vision/image property field of the node.

# Constraints
- NEVER wire an embedding model into a language model input. Only use embedding models for vector stores/embeddings.
- Ensure the connection type in the JSON matches the AI specific pins (e.g., `"ai_languageModel"` instead of `"main"` for AI specific sub-node connections).

# Examples
```json
{
  "parameters": {
    "model": "gpt-4o",
    "options": {
      "vision": {
        "binaryPropertyName": "data"
      }
    }
  },
  "id": "3a7b1c4e-5d6e-4f8a-9b1c-2d3e4f5a6b7c",
  "name": "OpenAI Chat Model",
  "type": "n8n-nodes-langchain.lmChatOpenAi",
  "typeVersion": 1,
  "position": [ 600, 450 ]
}
```
