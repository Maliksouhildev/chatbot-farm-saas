---
name: auto-git-commit-push
description: Automatically commits and pushes verified changes to Git repositories across all chats and projects while enforcing zero-leakage security.
always_on: true
---

# Universal Auto-Commit & Push Protocol

## Scope & Purpose
Applies globally across all projects, workspaces, and chats. Whenever code, scripts, workflows, or documentation are completed and verified to work, Antigravity must automatically stage, commit, and push the changes to GitHub so the user's GitHub activity reflects active development.

## Core Rules

### 1. Trigger Timing
- Run automatically at the conclusion of every successful task, bug fix, feature addition, or refactor.
- Ensure the code/script compiles, runs, or passes basic validation before committing.
- Do NOT commit broken intermediate code that causes syntax errors or runtime crashes.

### 2. Zero-Leakage Security Firewall (MANDATORY)
- **NEVER** stage or commit sensitive data or secrets:
  - Environment variables: `.env`, `.env.*`, `*.env`
  - Secrets & Tokens: API keys, bearer tokens, OAuth credentials, JWTs, password files
  - Credential files: `*creds*`, `*credentials*`, `*secret*`, `keys.json`, `creds_dump.json`
  - Databases: `database.sqlite`, `*.db`, `*.sqlite`
  - Private Keys: `id_rsa`, `*.pem`, `*.key`
- Before staging, inspect `git status`. Stage only the specific files modified or created for the task, or ensure all sensitive files are excluded via `.gitignore`.

### 3. Author Attribution
- Ensure commits are attributed to the user's verified GitHub identity:
  - **Name**: `Maliksouhildev`
  - **Email**: `mlkmehdid@gmail.com`
- This ensures commits properly populate GitHub profile activity, contribution green squares, and repository traffic.

### 4. Commit Messages & Workflow
- Use professional Conventional Commits syntax:
  - `feat: <description>` for new features or capabilities
  - `fix: <description>` for bug fixes or patches
  - `refactor: <description>` for code cleanup or restructuring
  - `docs: <description>` for documentation updates
  - `chore: <description>` for maintenance or configuration updates
- Execute:
  1. `git add <safe-files>`
  2. `git commit -m "<type>: <concise description of changes>"`
  3. `git push origin <current-branch>` (default: `main` or `master`)
  4. If remote is ahead, use `git pull --rebase` before pushing.
