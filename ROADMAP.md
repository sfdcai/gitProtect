# 🚀 GitProtect Feature Roadmap

This document outlines the planned features and future capabilities for the GitProtect platform.

## 🏗️ Phase 1: Core Reliability & Expansion (Up Next)

- [ ] **Automated Scheduling (Cron Jobs)**
  - Allow users to configure daily, weekly, or monthly automated scans for their repositories.
  - Implement serverless cron endpoints to trigger the worker automatically.
- [ ] **GitHub Webhook Integration**
  - Instant scanning! Automatically trigger a scan the exact moment a developer runs `git push` to a repository, rather than waiting for manual clicks.
- [ ] **Email & Slack Notifications**
  - Send an immediate alert when a critical secret is leaked.
- [ ] **Worker Reliability Overhaul**
  - Migrate the Render Web Service to a true Background Worker or GitHub Actions workflow to eliminate "cold boot" delays.

## 🛡️ Phase 2: Advanced Scanning & Security

- [ ] **Deep History Scanning**
  - Currently, we scan the codebase at the `HEAD` commit. We need to implement `git log -p` scanning to find secrets that were committed and then "deleted" in subsequent commits (the secret is still in the history!).
- [ ] **`.gitprotectignore` Support**
  - Allow developers to add a `.gitprotectignore` file to their repository to mark specific test files or mock secrets as known false positives, so they don't flag in the dashboard.
- [ ] **Secret Masking & Encryption**
  - Encrypt the findings in the database so that even database administrators cannot see the plaintext leaked secrets.

## 👑 Phase 3: Pro Features & Enterprise

- [ ] **Private Repository Support (Pro Tier)**
  - Implement full GitHub App installation flow allowing GitProtect to securely clone private repositories using short-lived installation tokens.
- [ ] **Team Workspaces**
  - Allow multiple developers to share a workspace and view findings for an organization's repositories.
- [ ] **Jira / Linear Integration**
  - One-click "Create Ticket" to assign a remediation task to a developer when a secret is found.
- [ ] **Automated Remediation (PR creation)**
  - GitProtect automatically opens a Pull Request to remove the secret and cycle the credential using provider APIs (e.g., automatically revoking an AWS key).
