---
name: strict-cost-optimizer
description: Enforces token-efficient outputs and prevents the AI from printing massive JSON blocks.
always_on: true
---

# ⚠️ TOKEN EFFICIENCY MANDATE ⚠️
1. **Never print full JSON files:** When modifying an n8n workflow, DO NOT output the entire file in the chat.
2. **Output only the diff:** Only output the specific `node` object or `connections` block you are modifying. 
3. **Silent File Writes:** Use your file system tools to write the changes directly to the `.json` file silently. 
4. **Read On-Demand:** Only open a `.json` file if the user's prompt specifically requires modifying it based on the `WORKFLOW_INDEX.md`.
