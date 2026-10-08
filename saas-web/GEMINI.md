# Import Safety & Dev Server Stability

When editing React/Next.js files in this workspace (especially using regex replacements or automated scripts):
1. **NEVER inject new imports blindly.** 
2. Always read the top of the file first to check if the module (e.g., `lucide-react`) is already being imported.
3. If it is already imported, carefully inject the new named export into the existing import block instead of creating a duplicate `import` statement.
4. Duplicate imports crash the Webpack compiler and bring down the user`s live Next.js dev server with 500 errors. You must treat syntax validity as critical to the dev server`s uptime.


# Agent Execution & Token Efficiency Guidelines

## 1. Incremental Delivery (Anti-Loop Rule)
- Do NOT attempt to complete large batches of multi-part requests in a single autonomous turn.
- Work on ONE focused task or bug fix per turn. Once completed and verified, stop and summarize your changes to the user to get feedback.
- Limit continuous autonomous tool calls in a single turn.

## 2. No Unrequested Multi-Agent Swarms
- Do NOT invoke subagents (`invoke_subagent`) or spawn background workers unless the user explicitly requests multi-agent orchestration.
- Perform edits directly as the primary agent.

## 3. Prevent Infinite Self-Verification Loops
- Avoid repetitive circular checks. Verify code edits once, report results, and yield the turn.
- Do not run continuous audit cycles unless explicitly instructed.

## 4. Search & Token Economy
- Target specific files and line ranges. Avoid dumping huge files into context.
- Always exclude `node_modules`, `.next`, `dist`, `.git`, and build artifact folders when listing files or searching code.
