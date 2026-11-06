# Architectural Decision Record: Publisher Authentication & Persistence Strategy

**Status:** Proposed & Documented for Stakeholder Decision (Phase 5)  
**Author:** Principal Product Architect & Security Engineer  
**Date:** November 2026  
**Context:** The Independent Audit confirmed that the platform currently operates as a client-side, local-first application where publisher preferences and editions are saved in browser `localStorage`. Real multi-user authentication (signup, login, sessions, RBAC) does not exist. Before writing authentication code or performing destructive data schema migrations, this document evaluates the two fundamental architectural pathways.

---

## 1. Executive Problem Statement

Newspaper production involves sensitive intellectual property: pre-published investigative reporting, unredacted sources, regional advertising revenue models, and exact edition page geometries. 

Introducing user accounts requires deciding between:
- **Alternative A:** A **Local-First, Air-Gapped Publisher Application** (similar to Affinity Publisher, Adobe InDesign, or Obsidian), where user editions live 100% on the journalist's computer with optional local file encryption and zero external server dependency.
- **Alternative B:** A **Cloud-Based Multi-User Publishing Platform** (similar to Figma or Google Workspace), where user accounts, authentication tokens (OAuth/JWT), editions, and assets are hosted in a centralized cloud database (e.g., Supabase / PostgreSQL) with role-based access control (RBAC).

---

## 2. In-Depth Comparative Matrix

| Evaluation Dimension | Alternative A: Local-First Desktop / PWA | Alternative B: Cloud Multi-Tenant SaaS (Supabase) |
| :--- | :--- | :--- |
| **Data Ownership & Sovereignty** | **100% Client-Owned.** All editions, mastheads, and drafts remain exclusively on the user's physical machine. Zero chance of remote data seizures or third-party subpoenas. | **Host-Dependent.** All articles, photographs, and drafts are stored in remote database tables subject to cloud hosting terms and provider security. |
| **Security & Threat Model** | **Zero-Knowledge Attack Surface.** No database to breach, no leaked passwords, no session hijacking, no JWT expiration edge-cases. Local data is protected by the user's OS disk encryption (BitLocker/FileVault). | **Cloud Security Vulnerabilities.** Requires robust RLS (Row Level Security), secure cookie handling, CORS protection, rate-limiting, and constant audit of API routes. |
| **Offline & Field Capability** | **Full Offline Operation.** Journalists and editors can lay out, balance, and export print-ready editions in rural printing presses or during power/network outages. | **Internet-Dependent.** Editing or saving requires network connectivity unless complex offline CRDT (Conflict-Free Replicated Data Type) synchronization is implemented. |
| **Multi-User Collaboration** | **File-Based Sharing.** Editions are shared via exported JSON bundles or Git repositories (similar to standard desktop publishing files like `.indd`). No real-time simultaneous co-editing. | **Native Multi-User RBAC.** Dedicated roles: *Reporter* (writes copy), *Section Editor* (reviews and places copy), *Chief Editor* (final print approval), *Production Manager* (PDF export). |
| **Backup & Disaster Recovery** | **Manual / User-Managed.** Users must manually export JSON backups or synchronize with their own local network drive. High risk of data loss if browser storage is cleared by accident. | **Automated Cloud Backup.** Automatic version history, revision diffs, point-in-time recovery, and cloud disaster redundancy. |
| **Infrastructure Costs & Complexity** | **Zero Hosting Cost.** Static web application can be hosted on GitHub Pages, Cloudflare Pages, or run locally via `pnpm start`. Zero database maintenance. | **Ongoing Cloud Infrastructure.** PostgreSQL database hosting, object storage for high-res photos (S3/Supabase Storage), auth token management, and monthly egress costs. |
| **Time to Ship** | **Immediate.** Complete editorial stability without backend maintenance. | **2–4 Weeks.** Requires database schema migrations, RLS security policies, auth UI, password reset flows, and email verification infrastructure. |

---

## 3. Recommended Architectural Strategy

### Recommendation: **Hybrid Evolution (Alternative A Now $\rightarrow$ Pluggable Alternative B Later)**

1. **Phase Immediate (Current Release): Authentic Local-First Architecture**
   - Solidify **Alternative A**: Keep the platform 100% local-first and client-side.
   - Do not claim "Cloud Multi-User" or "RBAC" on the landing page or UI.
   - Transparently identify the software as a **Local-First Editorial Desktop Studio**.
   - Provide clean "Export Project JSON" and "Import Project JSON" tools in the TopBar and Dashboard to prevent accidental data loss.

2. **Phase Future (When Multi-User is Approved): Optional Pluggable Supabase Auth Provider**
   - Define an abstract `AuthProvider` and `RemoteStorageAdapter` interface in `packages/storage-adapters`.
   - If the user configures `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, activate Cloud Multi-User mode with RBAC policies.
   - If no cloud keys are provided, seamlessly fall back to local-first mode without penalizing solo publishers or small regional newsrooms.

---

## 4. Required Stakeholder Decision

To proceed with authentication:
- **Decision 1:** Approve **Alternative A (Local-First Desktop Publisher)** as the official architecture. (Recommended for this release).
- **Decision 2:** Authorize the implementation of **Alternative B (Full Supabase Cloud Auth with RBAC)** and schedule database migration work.

*Per Phase 5 guardrails, authentication implementation is held until the user reviews this decision document.*
