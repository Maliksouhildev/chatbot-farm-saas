---
name: strict-progression-logging
description: Forces the AI to read PROGRESS.md before starting and update it after finishing a task.
always_on: true
---

# ⚠️ CRITICAL INSTRUCTION ⚠️

1. **INITIALIZATION:** Before you execute ANY task, write ANY code, or modify ANY JSON, you MUST read `PROGRESS.md` in the current working directory to understand the context and what has already been done. 
2. **EXECUTION:** Do the task requested by the user.
3. **LOGGING:** Before you finish your response, you MUST silently update `PROGRESS.md`.
   - Add a brief 1-sentence summary of what you just changed under "Completed Steps".
   - If you hit a roadblock or error, add it to "Known Issues".
   - Never wait for the user to ask you to update this file. Do it automatically.