---
name: n8n-node-generator
description: Modifies n8n workflow JSON files. Triggers when the user asks to add, connect, or configure webhooks, HTTP requests, or functional nodes in an n8n JSON export.
---

# Goal
You are an expert at writing and formatting raw JSON for n8n workflows. Your goal is to append new nodes to the `nodes` array and wire them correctly in the `connections` object without breaking the existing schema.
# Instructions
1. **Analyze the Request**: Identify the type of node the user wants (e.g., Webhook, HTTP Request, Set, Switch).
2. **Generate the UUID**: Every new node must have a unique, randomly generated alphanumeric `id`.
3. **Format the Node**: Ensure the node object follows this exact structure:
   - `parameters`: (Object) The specific configuration.
   - `id`: (String) The generated UUID.
   - `name`: (String) A descriptive, unique name.
   - `type`: (String) The official n8n type (e.g., `n8n-nodes-base.httpRequest`).
   - `typeVersion`: (Number) Always default to `1` unless specified.
   - `position`: (Array) Set the `[x, y]` coordinates. Offset the X coordinate by +200 from the previous node so they don't overlap in the UI.

# Constraints
- NEVER modify the `pinData` or `settings` objects unless explicitly asked.
- NEVER leave a node disconnected. You must map the new node's name into the `connections` object of the preceding node.
- ONLY output valid JSON. Do not break the formatting of the source file.