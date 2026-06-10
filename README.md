# مصداق — MISDAQ

**Investigate. Verify. Publish with trust.**

MISDAQ is an Arabic-first journalism platform that treats every published article like an investigation — every claim examined, every source traced, every piece scored for trust and credibility before it reaches readers.

---

## What is MISDAQ?

MISDAQ (مصداق) means _credibility_ in Arabic. The platform gives journalists, readers, and editors a shared set of AI-powered tools to raise the standard of Arabic-language reporting.

---

## Core Features

### For Readers

- **Credibility Checker** — Paste any article URL and get an instant credibility score, claim-by-claim breakdown, and source verification report.
- **Verified Articles Feed** — Browse articles that passed MISDAQ journalism standards, each with a transparent trust rating.
- **Discussion Board** — Community discussion around published investigative content.

### For Journalists

- **Smart Editor** — AI writing assistant with four Arabic journalism tools:
  - Rewrite to Fusha (formal Modern Standard Arabic)
  - Neutralize Bias
  - Remove Discrimination
  - Convert to Bullet Points
- **Standards Check** — Automated credibility and standards analysis (fusha compliance, trust score, claim sourcing, neutrality, five W's, opinion separation).
- **Source Management** — Add and verify sources; WhatsApp-based human-source consent workflow.
- **Publishing Workflow** — Draft → Sources → Standards Check → Publish, with gates that enforce all requirements before a journalist can publish.
- **Image Verification** — Trace and verify image origins.

### For Admins

- **Journalist Application Review** — Approve or reject journalist account requests with identity and credential verification.
- **Content Moderation** — Review and manage community discussion posts.
- **Article Oversight** — Monitor published articles and credibility scores across the platform.

---

## Technology Stack

| Layer         | Technology                         |
| ------------- | ---------------------------------- |
| Frontend      | React 19 + TypeScript              |
| Routing       | React Router v7                    |
| State / Data  | TanStack Query v5                  |
| Forms         | React Hook Form + Zod              |
| Styling       | Tailwind CSS v4 + Radix UI         |
| Animations    | Framer Motion                      |
| i18n          | i18next (Arabic RTL + English LTR) |
| Auth          | JWT + Google OAuth                 |
| Build         | Vite 8                             |
| Backend API   | Laravel (Railway-hosted)           |
| Media Storage | Cloudflare R2                      |

---

## Project Structure

```
src/
├── components/        # Shared UI components
├── hooks/             # Global custom hooks
├── layout/            # App shell, sidebar, nav
├── lib/               # Utilities (API client, media URLs, etc.)
├── router/            # Route definitions
├── schemas/           # Zod validation schemas
├── services/          # API layer + response mappers
├── types/             # TypeScript type definitions
└── views/             # Feature screens
    ├── articles/      # Public articles feed + detail
    ├── credibility/   # Credibility Checker tool
    ├── discussion/    # Community discussion board
    ├── journalist/    # Journalist dashboard, editor, archive
    │   ├── components/
    │   ├── hooks/
    │   └── screens/
    ├── admin/         # Admin dashboard + moderation
    └── home/          # Landing page
```

---

## User Roles

| Role        | Access                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| Guest       | Landing page, Credibility Checker, Smart Editor demo                   |
| Normal User | + Discussion board, apply to become a journalist                       |
| Journalist  | + Full Smart Editor, article writing & publishing workflow             |
| Admin       | + Journalist application review, content moderation, article oversight |

---

## License

Private — all rights reserved.
