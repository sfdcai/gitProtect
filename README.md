# 🛡️ GitProtect

**GitProtect** is an open-source web application that monitors your public GitHub repositories for accidentally committed secrets — API keys, passwords, database credentials, and more.

> **Free for public repositories.** Private repo support coming soon (Pro tier).

---

## ✨ Features

- 🔍 **Deep History Scanning** — Scans up to the last 50 commits per repository
- 🧠 **25+ Secret Patterns** — AWS, GitHub, Stripe, Slack, Google, DB URLs, SSH keys, and more
- 📬 **Real-Time Dashboard** — Live scan progress via Supabase Realtime
- 👤 **User Accounts** — Email/password or GitHub OAuth registration
- 🔒 **Row Level Security** — Data is secured at the database level; users only see their own findings
- 🆓 **Free Tier** — Unlimited public repo scans at no cost

---

## 🏗️ Architecture

```
gitprotect/
├── src/                    # Next.js frontend (Vercel)
│   ├── app/                # App router pages
│   │   ├── page.tsx        # Public landing page
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── auth/callback/  # OAuth callback handler
│   │   └── dashboard/      # Protected dashboard pages
│   │       ├── page.tsx         # Overview
│   │       ├── repositories/    # Add / manage repos
│   │       ├── scans/           # Scan history
│   │       ├── findings/        # All detected secrets
│   │       └── settings/        # Profile & notifications
│   ├── components/         # Shared React components
│   └── lib/
│       ├── supabase/       # Supabase client (browser + server + middleware)
│       └── types.ts        # Shared TypeScript types
└── worker/                 # Background scanner (Node.js — Render/Railway)
    └── src/
        ├── index.js        # Poll loop + job orchestrator
        ├── scanner.js      # File walking + regex matching
        └── rules.js        # Secret pattern catalog
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier)
- A [Vercel](https://vercel.com) account (free tier) for frontend hosting
- A [Render](https://render.com) account (free tier) for the worker

---

### Step 1: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the following schema:

```sql
-- Profile table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    github_username VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE scan_targets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    url VARCHAR(512) NOT NULL,
    is_private BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE scan_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_id UUID REFERENCES scan_targets(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    progress_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE secret_findings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES scan_jobs(id) ON DELETE CASCADE NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    line_number INTEGER NOT NULL,
    secret_type VARCHAR(100) NOT NULL,
    masked_secret VARCHAR(128) NOT NULL,
    commit_hash VARCHAR(40),
    commit_author VARCHAR(256),
    severity VARCHAR(50) DEFAULT 'medium',
    is_false_positive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own targets" ON scan_targets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can read own jobs" ON scan_jobs FOR SELECT USING (
    EXISTS (SELECT 1 FROM scan_targets WHERE scan_targets.id = scan_jobs.target_id AND scan_targets.user_id = auth.uid())
);
CREATE POLICY "Users can insert own jobs" ON scan_jobs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM scan_targets WHERE scan_targets.id = target_id AND scan_targets.user_id = auth.uid())
);
CREATE POLICY "Users can delete own jobs" ON scan_jobs FOR DELETE USING (
    EXISTS (SELECT 1 FROM scan_targets WHERE scan_targets.id = target_id AND scan_targets.user_id = auth.uid())
);
CREATE POLICY "Users can read own findings" ON secret_findings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM scan_jobs
        JOIN scan_targets ON scan_jobs.target_id = scan_targets.id
        WHERE scan_jobs.id = secret_findings.job_id AND scan_targets.user_id = auth.uid()
    )
);
```

3. In **Authentication → Providers**, enable **GitHub OAuth** and paste your GitHub App Client ID & Secret.
4. Set the **redirect URL** to: `https://your-domain.vercel.app/auth/callback`

---

### Step 2: Deploy the Frontend to Vercel

```bash
# Clone this repo
git clone https://github.com/YOUR_USERNAME/gitprotect.git
cd gitprotect

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local
# → Edit .env.local with your Supabase URL and Anon Key

# Run locally
npm run dev
```

**Deploy to Vercel:**

1. Push to GitHub and import the repo in [vercel.com](https://vercel.com).
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### Step 3: Deploy the Worker to Render

```bash
cd worker

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# → Edit .env with your Supabase URL, Service Role Key, and optional GitHub PAT
```

**Deploy to Render:**

1. Create a new **Web Service** on Render.
2. Point it to the `worker/` directory.
3. Set the **Start Command** to: `node src/index.js`
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` ← Get from Supabase → Settings → API
   - `GITHUB_PAT` (optional but recommended for higher rate limits)
   - `POLL_INTERVAL_MS` (default: 15000)

---

## 🔐 Security Notes

- The worker uses the **Supabase Service Role Key** (bypasses RLS) — **never expose this in the frontend**.
- Discovered secrets are **masked** before storage. The raw secret is never saved to the database.
- Users can mark findings as **false positives** to clean up their reports.

---

## 📦 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 15 + Tailwind CSS | Fast, serverless, easy deployment |
| Auth & DB | Supabase | Free PostgreSQL + Auth + Realtime |
| Scanner Worker | Node.js + simple-git | Lightweight, easy to deploy |
| Hosting (frontend) | Vercel Free Tier | Instant global CDN |
| Hosting (worker) | Render Free Tier | Always-on background process |

---

## 🗺️ Roadmap

- [x] User registration & GitHub OAuth
- [x] Public repository scanning
- [x] 25+ secret detection rules
- [x] Real-time scan progress
- [x] Findings dashboard with severity filtering
- [ ] Email notifications on findings (via Resend)
- [ ] Webhook notifications (Slack, Discord)
- [ ] Private repository support (Pro tier)
- [ ] CI/CD pipeline integration

---

## 📄 License

MIT — free to use, modify, and distribute.

---

> Built with ❤️ for the developer community. If this tool saves you from a credential leak, please ⭐ star the repo!
