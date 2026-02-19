# PBD Rekod — CLAUDE.md

## Stack
- Next.js 16 App Router, React 19, TypeScript + JSX mixed (`allowJs: true` in tsconfig)
- Path alias: `@/` maps to project root
- Fonts: Nunito (body) + Playfair Display (headings) via `next/font/google`; CSS vars `--font-nunito`, `--font-playfair`

## Architecture
- `app/` — route segments only (`page.tsx`, `layout.tsx`, `globals.css`)
- `components/ui/` — reusable UI primitives (Snackbar, Icons, editable tables)
- `components/screens/` — full-screen views (Onboarding, RekodHome, KeyIn, etc.)
- `components/PbdApp.jsx` — root client shell; holds all top-level state
- `lib/` — pure JS utils and data (no React, server-safe): `constants.js`, `seed-data.js`, `utils.js`

## Key Patterns
- This is a client-side SPA with tab+view `useState` navigation — NOT URL routing. Never add screens to `app/` subdirectories.
- Every component using hooks needs `'use client'` directive
- `app/globals.css` contains the full custom design system — NOT Tailwind utilities
- CSS custom properties: `--strawberry`, `--matcha`, `--cream`, `--charcoal`, `--muted`, `--border`
- Core assessment values: `TP1–TP6` and `TD` (not assessed); empty string = not keyed yet

## Commands
- `npm run dev` — start dev server on localhost:3000
- `npm run build` — verify production build

## Language
- UI is in Bahasa Malaysia; `lang="ms"` on `<html>`
