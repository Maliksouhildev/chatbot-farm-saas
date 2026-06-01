---
name: clean-workspace
description: Enforces strict folder structures for all generated files so the root directory doesn't get messy.
always_on: true
---

# ⚠️ FOLDER STRUCTURE MANDATE ⚠️
Never output generated files directly into the root directory. You must organize files into specific subfolders. If the folder does not exist, create it.

1. **Source Code** (`.js`, `.py`, `.ts`): Must go into `/src` or `/scripts`.
2. **n8n Workflows / JSON**: Must go into `/workflows` or `/n8n-exports`.
3. **Logs/Data**: Must go into `/output`.
4. **Documentation**: Must go into `/docs` (except for `PROGRESS.md` which stays in the root).