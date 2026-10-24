---
name: github-auto-sync
description: >-
  Automatically stage, commit, and push changes to GitHub whenever working in a git repository.
  Use when completing tasks, creating features, fixing bugs, or when the user wants every change
  synced to GitHub to maintain active GitHub contribution activity without manual confirmations.
---

# GitHub Auto-Sync Skill

This skill ensures that code changes are automatically committed and pushed to the upstream GitHub repository safely, reliably, and with descriptive commit messages to keep the user's GitHub activity status active.

## Workflow

### 1. Repository & Identity Verification
Before attempting to commit or push:
1. Check if the project is a Git repository:
   ```powershell
   git rev-parse --is-inside-work-tree
   ```
2. Check if a remote is configured:
   ```powershell
   git remote -v
   ```
3. Verify that `user.name` and `user.email` are configured:
   ```powershell
   git config user.name
   git config user.email
   ```
   *Note: For GitHub to record contributions (green squares) on the user profile, `user.email` must match a verified email on their GitHub account.*

### 2. Safety & Secret Checks
1. Check repository status:
   ```powershell
   git status --short
   ```
2. **CRITICAL**: Ensure sensitive files are NOT staged or tracked:
   - Environment files (`.env`, `.env.local`, `.env.production`)
   - API keys, secrets, tokens, private keys (`*.pem`, `*.key`)
   - Build caches or dependency folders (`node_modules/`, `.next/`, `dist/`)
   If any of these are untracked and not ignored, ensure they are added to `.gitignore` before staging.

### 3. Stage Changes
Stage only the relevant modified and added project files:
```powershell
git add -A
```

### 4. Create Meaningful Commit
Generate a concise, conventional commit message describing the changes:
- `feat: <summary>` for new features
- `fix: <summary>` for bug fixes
- `refactor: <summary>` for refactoring
- `chore: <summary>` for maintenance or config updates

Execute commit:
```powershell
git commit -m "<type>: <brief descriptive message>"
```

### 5. Push to GitHub
Determine the current branch and push to the remote:
```powershell
$branch = (git branch --show-current).Trim()
git push origin $branch
```
If the branch has no upstream tracking set yet:
```powershell
git push -u origin $branch
```

### 6. Conflict Prevention
If push is rejected due to remote changes:
```powershell
git pull --rebase origin $branch
git push origin $branch
```
