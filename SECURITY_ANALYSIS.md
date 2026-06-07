# 🔒 GitProtect Security Analysis & Architecture

This document outlines the current security posture of the GitProtect application, including its strengths, potential vulnerabilities, and recommended improvements for production.

## 1. Current Security Strengths

* **Supabase Row Level Security (RLS):** All data is protected at the database level. Users can only `SELECT`, `INSERT`, and `DELETE` their own repositories and scan jobs. Findings are securely linked through foreign keys so user A can never see user B's leaked secrets.
* **Service Role Isolation:** The Next.js frontend only ever uses the Supabase Anonymous Key (restricted by RLS). Only the isolated Node.js Background Worker holds the `SUPABASE_SERVICE_ROLE_KEY` to write findings bypassing RLS.
* **Ephemeral Storage:** The worker clones repositories into isolated temporary directories (`/tmp/gitprotect-...`) and explicitly deletes the directory the moment the scan is complete, preventing disk exhaustion or lingering code.
* **No Plain-Text Passwords:** Authentication is entirely managed by Supabase Auth (Magic Links, OAuth, or salted/hashed passwords). The app never sees or stores user passwords.

## 2. Identified Security Risks & Vulnerabilities

| Risk Area | Threat Description | Recommended Fix |
|---|---|---|
| **Secret Storage** | When a secret is found, the exact leaked string (`masked_secret`) is currently saved directly into the database. If the database is compromised, the attacker gets a list of all verified secrets. | **Immediate:** Ensure `masked_secret` is actually heavily masked before database insertion (e.g., `sk_live_...a8f9`). Do not store the full secret. |
| **Worker RCE via Git** | If a user inputs a maliciously crafted repository URL, the `simple-git` clone command could theoretically be exploited for Remote Code Execution on the worker server. | **High:** Sanitize all incoming GitHub URLs strictly. Ensure they conform to `^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$` before running `git clone`. |
| **Denial of Service (Worker)** | A malicious user could add 500 massive repositories (like the Linux Kernel) and click "Scan All", crashing the Render worker due to out-of-memory or disk space exhaustion. | **Medium:** Implement a queue limit per user. Implement a maximum clone depth (`git clone --depth 1`) or maximum directory size limit. |

## 3. Worker Reliability Issues (Render)

Currently, the worker runs as a Render "Web Service" on the Free Tier. 
* **The Problem:** Render spins down free web services after 15 minutes of inactivity. When a new scan is triggered, Render has to "cold start" the container, which can take 1–2 minutes, making the UI feel broken or slow.
* **The Solution:** The worker should be deployed as a **Render Background Worker** (which does not sleep and does not require a port). However, Background Workers are a paid feature on Render ($7/mo). As a free alternative, consider using a serverless cron job (e.g., Vercel Cron or GitHub Actions) to trigger scans instead of a persistent Node polling script.

## 4. Compliance & Trust

To build a trusted security tool, the application will eventually need:
1. **Privacy Policy & Terms of Service:** Clear rules on data retention.
2. **Data Deletion:** A mechanism to automatically purge `secret_findings` after 30 days.
3. **GitHub App Verification:** Moving from a Personal Access Token to a verified GitHub App installation so users grant granular permissions to their specific repositories.
