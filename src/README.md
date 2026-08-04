# MSDAQ frontend (`src/`)

Arabic-first newsroom + public site built with React 19, Vite, and React Router.

## Folder layout

| Folder | Purpose |
|--------|---------|
| `components/` | Shared site chrome (`site-header-nav`, `site-footer`) and shadcn `ui/` primitives |
| `features/` | Domain modules — primary organization unit |
| `features/public-site/` | Reader-facing pages (home, articles, categories, about, partners) |
| `features/newsroom/` | Staff workspace (dashboard, article list/detail, file library) |
| `features/admin/` | Admin-only screens and `Admin*` panel components |
| `features/staff/` | Cross-cutting staff UI shared by newsroom + admin (nav) |
| `features/tools/` | Standalone newsroom tools + smart editor |
| `features/publishing-flow/` | 7-step article publishing wizard |
| `layouts/` | Route shells (`PublicLayout`, `NewsroomLayout`, `AdminLayout`) |
| `lib/` | Pure utilities, SEO helpers, label mappers (`lib/labels/`) |
| `services/api/` | HTTP clients — one module per API area |
| `router/` | Routes, permissions, guards |
| `ssr/` | Server-side render handler for public SEO pages |
| `types/` | Shared TypeScript types |

## Where to put new code

- **Page or flow-specific UI** → `features/<domain>/`
- **Reused across one feature** → `features/<domain>/components/`
- **Reused across public + staff** → `components/` or `features/staff/`
- **API calls** → `services/api/` (keep public vs staff endpoints in separate files)
- **Display label mappers** → `lib/*-labels.ts`, re-export from `lib/labels/`

## Dev commands

| Command | Use when |
|---------|----------|
| `npm run dev` | Client-only SPA (newsroom, admin) — fast HMR |
| `npm run dev:ssr` | Public site with SSR for `/articles/:id` and `/categories/:slug` |
| `npm run build:ssr` | Production build (client + SSR bundle) |
| `npm run start` | Production Node server |

## API naming

- Public read: `Articles_APIs`, `PublicCategories_APIs` → `/api/public/...`
- Staff write: `ArticlesStaff_APIs` → `/api/articles/...` ([`articles-staff.ts`](services/api/articles-staff.ts))
- Admin: `AdminUsers_APIs`, `AdminRoles_APIs`, etc.

## SEO / SSR

Article and category pages use [`lib/seo/`](lib/seo/) for `<head>` tags and JSON-LD. SSR is handled in [`ssr/handle-request.tsx`](ssr/handle-request.tsx) via [`server/index.ts`](../server/index.ts).
