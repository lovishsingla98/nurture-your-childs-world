# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nurture is a marketing/landing page for an AI parenting co-pilot (ages 3–12), built by Cortiq Labs. It's a React SPA with Firebase Firestore for data persistence. The project was scaffolded with the Lovable platform.

## Commands

- **Dev server:** `npm run dev` (Vite on port 8080)
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Preview prod build:** `npm run preview`

No test framework is configured.

## Architecture

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Radix primitives)

**Routing:** React Router v6 with two routes: `/` (Index landing page) and `*` (NotFound). All content is on the single Index page.

**Data flow:** Waitlist and feedback forms write to Firestore collections (`waitlist`, `feedback`) via `src/lib/firestore.ts`. On Firebase failure, data falls back to localStorage. No backend server—fully serverless.

**Key directories:**
- `src/components/ui/` — shadcn/ui component library (do not manually edit; use shadcn CLI)
- `src/components/forms/` — WaitlistForm, FeedbackForm
- `src/components/sections/` — FeatureSlides carousel
- `src/components/site/` — Header, Footer
- `src/lib/firebase.ts` — Firebase app initialization
- `src/lib/firestore.ts` — Firestore read/write operations and TypeScript interfaces
- `src/pages/Index.tsx` — Main landing page (hero, features, testimonials, forms, CTA)

**Path alias:** `@/*` maps to `src/*`.

## Environment Variables

Firebase config via `VITE_`-prefixed env vars (see `firebase.env.example`):
`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

## Styling

Tailwind with CSS variable-based theming (HSL colors). Primary: lavender, accent: mint green. Dark mode supported via `next-themes`. Custom classes `.btn-hero`, `.glass-card`, `.hero-veil` defined in `src/index.css`. Border radius base: 0.9rem.

## Key Patterns

- shadcn/ui components use `class-variance-authority` for variants and `tailwind-merge`/`clsx` (via `src/lib/utils.ts` `cn()` helper)
- Forms use `react-hook-form` + `zod` for validation
- SEO handled with `react-helmet-async` (meta tags, JSON-LD structured data)
- Toast notifications via `sonner`
- TanStack Query (React Query v5) is installed for async state management