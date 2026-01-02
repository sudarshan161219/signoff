# Signoff

**The "Approve" button for Freelancers.**
A secure, professional tool to share deliverables and get binding client approval. Stop scope creep before it starts.

![Project Status](https://img.shields.io/badge/Status-MVP%20Complete-success)
![License](https://img.shields.io/badge/License-MIT-blue)

##  The Problem

Freelancers often send deliverables via Email, WhatsApp, or Drive. Clients reply with "Looks good," but two weeks later say, _"Actually, can we change the layout?"_

**Signoff** solves this by creating a formal "Handover Event."

1. You upload the file.
2. Client gets a secure, time-limited link.
3. Client must click **"Approve"** or **"Request Changes"** to proceed.
4. An audit log records the decision.

##  Key Features (MVP)

- **Secure File Sharing:** Files are stored in Cloudflare R2 and served via signed, expiring URLs.
- **Decision Workflow:** Clients can Approve (locking the project) or Request Changes (with feedback).
- **Time-Sensitive Links:** Admin can set links to expire in 3, 7, 30, or 90 days.
- **Real-time Status:** Polling mechanism updates the dashboard instantly when a client reacts.
- **Audit Trail:** Logs IP addresses and timestamps for every view and decision.
- **Zero-Friction:** Clients do not need to create an account to view/approve.

##  Tech Stack

### Frontend (`/client`)

- **Framework:** React + Vite
- **Language:** TypeScript
- **State Management:** Zustand (with LocalStorage persistence for user preferences)
- **Styling:** Tailwind CSS + Lucide React (Icons)
- **HTTP Client:** Axios
- **Notifications:** Sonner

### Backend (`/server`)

- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Validation:** Zod
- **Storage:** Cloudflare R2 (S3 Compatible)
- **Security:** Helmet, CORS, Rate Limiting
