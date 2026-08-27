# صبارة بوست

**Investigate. Verify. Publish with trust.**

صبارة بوست is an Arabic-first internal newsroom platform. Staff use a **Newsroom Workspace** and **Admin** area on top of one backend; readers get a plain, read-only public site (no scores, no login).

---

## What we build

| Area            | Purpose                                                                           |
| --------------- | --------------------------------------------------------------------------------- |
| **Public site** | Home, articles, categories, about, partners, static pages                         |
| **Newsroom**    | Article list, publishing flow (7 steps), standalone tools, file library, calendar |
| **Admin**       | Dashboard, team, roles & permissions, categories                                  |

Publishing enforces gates (sources, cover, standards, credibility, localization) before publish. Standalone tools mirror many editorial checks outside the article flow.

---

## Tech stack

| Layer       | Technology                                                 |
| ----------- | ---------------------------------------------------------- |
| Frontend    | React 19 + TypeScript                                      |
| Routing     | React Router v7                                            |
| Data        | TanStack Query v5                                          |
| Styling     | Tailwind CSS v4 + Radix UI (shadcn-style `components/ui/`) |
| Build       | Vite 8                                                     |
| SSR         | Express + Vite middleware (`server/index.ts`, `src/ssr/`)  |
| Backend API | Laravel (Railway-hosted)                                   |

---

## Project structure

See **[`src/README.md`](src/README.md)** for the canonical layout. Summary:

```
src/
├── components/          # Shared chrome + ui primitives
├── features/            # Domain modules (primary org unit)
│   ├── public-site/
│   ├── newsroom/
│   ├── admin/
│   ├── publishing-flow/
│   ├── tools/
│   └── calendar/
├── layouts/             # PublicLayout, NewsroomLayout, AdminLayout
├── lib/                 # Utilities, labels, SEO helpers
├── services/api/        # HTTP clients per API area
├── router/              # Routes, permissions, guards
├── types/               # Shared TypeScript types
└── ssr/                 # SSR handler for public SEO pages
```

---

## Commands

| Command             | Use                                    |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Client-only SPA (fast HMR)             |
| `npm run dev:ssr`   | Public site with SSR                   |
| `npm run build`     | Typecheck + client build               |
| `npm run build:ssr` | Production client + SSR bundle         |
| `npm run start`     | Production Node server                 |
| `npm run check:ssr` | Smoke-check SSR HTML (after `dev:ssr`) |

---

## API naming

- **Public read:** `Articles_APIs`, `PublicCategories_APIs` → `/api/public/...`
- **Staff write:** `ArticlesStaff_APIs` → `/api/articles/...`
- **Standalone tools:** `ToolsEditorial_APIs`, `ImageVerification_APIs`, etc. → `/api/tools/...`
- **Admin:** `AdminDashboard_APIs`, `AdminUsers_APIs`, `AdminRoles_APIs`, …

---

## License

Private — all rights reserved.
