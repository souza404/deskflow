# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build (outputs to dist/)
npm run preview   # Serve the production build locally
npm run lint      # TypeScript type-check (tsc --noEmit) — no test suite exists
```

## Environment

Copy `.env.example` to `.env` and set:
- `GEMINI_API_KEY` — required for LIA chat (AI-assisted ticket creation)
- `APP_URL` — runtime URL for OAuth callbacks

The Vite config injects `GEMINI_API_KEY` into the browser bundle via `import.meta.env`.

## Architecture

**DeskFlow** is a React 19 + Vite 6 helpdesk SPA. The UI uses a "Liquid Glass Dark" theme built on Tailwind CSS 4, with `GlassCard` (`src/components/ui/GlassCard.tsx`) as the foundational visual primitive.

### Tab-based navigation (App.tsx)

Three top-level views, switched in `App.tsx` via tab state:

| Tab | File | Purpose |
|-----|------|---------|
| Portal | `src/views/Portal.tsx` | End-user ticket submission |
| Kanban | `src/views/Kanban.tsx` | Agent board with drag-and-drop columns |
| Dashboard | `src/views/Dashboard.tsx` | Analytics and SLA metrics |

All views are wrapped by `src/components/layout/Layout.tsx` (nav bar, global chrome).

### Key components

- **`LiaChat.tsx`** — Floating AI assistant powered by `@google/genai` (Gemini). Handles streaming responses and pre-fills ticket forms from natural language.
- **`SLATimer.tsx`** — Countdown timer that reads SLA deadlines from ticket data and highlights breaches.
- **`TicketDetailModal.tsx`** — Full-screen modal for viewing/editing a ticket; receives a ticket object prop.

### Data layer

All data lives in `src/data/mock.ts` as in-memory arrays (tickets, customers, agents). `better-sqlite3` is installed but not wired up. Any persistence work should start here.

### Path alias

`@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts`).
