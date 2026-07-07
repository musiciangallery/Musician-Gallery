# Musician Gallery — Product Scaffold

Next.js (App Router) + Tailwind, using the same design tokens as the
original concept site: Cormorant Garamond / DM Sans, off-white palette,
editorial spacing.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. If `node_modules` looks odd or you hit
install errors, delete it and `package-lock.json` first, then
`npm install` again — this scaffold was built in a sandboxed
environment that occasionally left a partial install behind.

## What's built (working, click through it)

- `/` — homepage, ported from the static concept site
- `/gallery` — browse all musicians, filterable by instrument, region, occasion
- `/musicians/[slug]` — individual musician profile
- `/book/[slug]` — 3-step booking request flow (occasion/date → contact
  details → review & submit)
- `/join` — musician application form (name, instrument, region, bio)
- `/api/bookings` and `/api/musician-applications` — API routes backing
  the two forms above

## What's mocked / prototype-only

- **Musician data** lives in `src/lib/musicians.ts` as a hardcoded array
  (9 example profiles). Swap this for real database queries once you
  have a backend — the shape (`Musician` type) is designed to map
  cleanly onto a database table.
- **Booking requests and musician applications** are written to flat
  JSON files (`data/bookings.json`, `data/musician-applications.json`)
  by the API routes. This works for local development only — it will
  not persist correctly on a serverless host (Vercel, etc.) and must be
  replaced with a real database (e.g. Postgres via Supabase) before
  launch. The API route code is written so that swap is a matter of
  replacing the `readBookings`/`writeBookings` functions, not
  rewriting the forms.

## Not yet built (the parts that need real accounts/credentials)

These need you to set up outside accounts before they can be wired in
for real — see the funding deck's Risks & Mitigations section:

- **Payments** — Stripe Connect integration (holding funds, releasing on
  confirmation, the 10% platform fee split)
- **Police vetting** — needs an approved vetting provider/API before
  there's anything to integrate against
- **Withholding tax** — IRD integration for automatic tax handling
- **Authentication** — musician/client login, a musician dashboard to
  view and respond to booking requests
- **Real photos** — the gallery currently has no images; add a `photo`
  field to `Musician` and swap `MusicianCard`/profile pages to render it

## Notes on fonts

Fonts are loaded via a `<link>` tag to Google Fonts in `layout.tsx`
(matching how the original static HTML file loaded them), not via
`next/font/google` — the sandboxed build environment this was built in
couldn't reach Google Fonts' font-file CDN at build time. This should
work fine either way in a normal deployment; if you want the build-time
optimized version later, swap back to `next/font/google` and confirm it
builds cleanly on your own machine/CI.
