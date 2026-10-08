# Chatbot Farm SaaS - Collaborator & Developer Setup Guide 🇩🇿

Guide for setting up, running, editing, and deploying both the **Website Frontend** and the **n8n Automation Workflows** on a local development machine.

---

## 🏗 System Architecture & Repository Layout

The repository is structured as a unified monorepo on the **`main`** branch:

```
chatbot-farm-saas/
├── saas-web/                                # Next.js 14 Fullstack Web Dashboard
│   ├── app/                                 # App router (pages, layout, API routes)
│   ├── components/                          # UI Components
│   │   ├── workspace/                       # Workspace UI (AppSwitcher, MiddleChat, RightHub)
│   │   ├── dashboard/                       # Knowledge base, Pricing, QR code pairing
│   │   └── layout/                          # Navbar, Sidebar, Profile dropdown
│   ├── lib/                                 # Bridges (Evolution API, Telegram, Mock chats)
│   ├── package.json                         # Web dependencies & scripts
│   └── .env.example                         # Web environment variables template
├── universal_omnichannel_router.json         # Master n8n Omnichannel Router Workflow
├── universal_omnichannel_router.workflow.ts  # n8n-as-code TypeScript workflow definition
├── docker-compose.yml                       # Turnkey Docker services (Evolution API, Postgres, Redis, n8n)
├── schema.sql                               # PostgreSQL / Supabase pgvector database schema
├── START_ALL.bat                            # 1-Click Windows system launcher
├── STOP_ALL.bat                             # 1-Click Windows system shutdown
├── credentials_guide.md                     # Guide for API credentials
└── README.md                                # General project documentation
```

---

## ⚙️ 1. Prerequisites

Before starting, install the following on your machine:
1. **Git**: [git-scm.com](https://git-scm.com/)
2. **Node.js 18 or 20+**: [nodejs.org](https://nodejs.org/) (check with `node -v` and `npm -v`)
3. **Docker Desktop**: [docker.com](https://www.docker.com/products/docker-desktop/) (ensure Docker Desktop is running with WSL 2 on Windows)
4. **Code Editor**: VS Code, Cursor, or Antigravity

> **Important for Algerian Network / Windows Users:**
> If you experience slow connections or timeouts when interacting with GitHub, run these two commands in PowerShell:
> ```powershell
> git config --global http.sslbackend openssl
> git config --global http.version HTTP/1.1
> ```

---

## 📥 2. Clone the Repository

Clone the repository and explicitly checkout the `main` branch:

```bash
git clone -b main https://github.com/Maliksouhildev/chatbot-farm-saas.git
cd chatbot-farm-saas
```

---

## 💻 3. Setting Up and Running the Website (`saas-web`)

The frontend is a **Next.js 14** application with Tailwind CSS, Framer Motion, and TypeScript.

### Step 3.1: Install Dependencies
```bash
cd saas-web
npm install
```

### Step 3.2: Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
copy .env.example .env.local
```
*(On Linux/macOS use `cp .env.example .env.local`)*

Key variables in `.env.local`:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:3000`)
- `EVOLUTION_API_URL`: Evolution API endpoint (default: `http://localhost:8080`)
- `EVOLUTION_API_KEY`: API Key matching your `.env` Docker configuration
- `NEXTAUTH_SECRET`: Any random 32-character string for NextAuth session encryption
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: (Optional) For Google OAuth login

### Step 3.3: Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. The dashboard will load with live hot-reloading.

### Step 3.4: How to Edit the Website
- **App Switcher & Customizer**: `components/workspace/AppSwitcherColumn.tsx` and `components/workspace/AppCustomizerPopover.tsx`
  - Right-click any app channel to open custom colors, renaming, and pinning.
- **Chat Feed**: `components/workspace/MiddleChatColumn.tsx`
  - Manages message history, quick replies, voice notes, attachments, and Telegram topics.
- **Right Hub (Contacts & Topics)**: `components/workspace/RightHubColumn.tsx`
  - Contains contact list, Telegram topic threads, and channel meta actions.
- **Navbar & Navigation**: `components/layout/Navbar.tsx`
  - Contains workspace switcher, Bot Settings tab, and profile menu dropdown.

### Step 3.5: Verifying Code Quality
Before committing, check TypeScript compilation:
```bash
npx tsc --noEmit
```

---

## ⚡ 4. Setting Up Backend Services & n8n Workflows

### Option A: 1-Click Launch (Windows)
From the project root (`chatbot-farm-saas`), double-click **`START_ALL.bat`**.  
This script will:
1. Verify and start Docker Desktop.
2. Launch Evolution API v2, Postgres, and Redis containers.
3. Launch the Next.js web application.
4. Open `http://localhost:3000` in your browser.

To stop everything, run **`STOP_ALL.bat`**.

---

### Option B: Manual Docker Compose Launch
From the project root:
```bash
docker compose up -d
```

### Port Map:
| Service | URL / Port | Description |
|---|---|---|
| **Web Dashboard** | `http://localhost:3000` | Next.js Frontend |
| **n8n Automation** | `http://localhost:5678` | n8n Visual Workflow Canvas |
| **Evolution API v2** | `http://localhost:8080` | WhatsApp QR Bridge |
| **PostgreSQL** | `localhost:5432` | Database (`evolution`) |
| **Redis** | `localhost:6379` | Queue & Cache |

---

## 🔄 5. How to Edit and Update n8n Workflows

The master workflow is stored as **`universal_omnichannel_router.json`** in the repository root.

### To load and test the workflow in n8n:
1. Open n8n in your browser: **[http://localhost:5678](http://localhost:5678)**.
2. If this is your first time, create your local admin account.
3. In the left navigation, click **Workflows**.
4. Click the **Add Workflow** button (or the `+` icon).
5. Click the **`...` (three dots)** menu in the top-right corner of the canvas and select **Import from File...**.
6. Select `universal_omnichannel_router.json` from your local repo folder.
7. Configure credentials:
   - Evolution API credentials (URL: `http://localhost:8080`, Key: see `.env`)
   - OpenAI / Groq API credentials for AI and Whisper transcription.
8. Click **Save** and toggle the workflow to **Active**.

### To export your changes back to the repository:
1. After editing nodes or routing logic in n8n, click the **`...` (three dots)** menu in n8n.
2. Select **Export** -> **Download**.
3. Replace the file `universal_omnichannel_router.json` in your local project root.

---

## 🚀 6. Git Collaboration Workflow (Pushing Changes)

When you make edits, follow this standard collaboration workflow:

### Step 6.1: Pull Latest Updates
```bash
git pull origin main
```

### Step 6.2: Stage and Commit
```bash
git add .
git commit -m "feat: add feature description"
```

> **Security Warning (GitHub Push Protection):**  
> GitHub automatically rejects commits containing raw secret keys (e.g., Google OAuth secrets, OpenAI keys).  
> **Never** commit secrets directly into code. Always use `process.env.*` and keep actual keys inside `.env` or `.env.local` (which are ignored by `.gitignore`).

### Step 6.3: Push to GitHub
```bash
git push origin main
```
