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

- `/` — homepage, ported from the static concept site, with real photography
- `/gallery` — browse all musicians, filterable by instrument, region, occasion
- `/musicians/[slug]` — individual musician profile
- `/book/[slug]` — 3-step booking request flow (occasion/date → contact
  details → review & submit)
- `/join` — musician application form (name, instrument, region, bio)
- `/admin` — password-protected internal page listing booking requests and
  musician applications as they come in (see Database setup below)
- `/terms`, `/privacy` — full Terms & Conditions and Privacy Policy content
- `/api/bookings` and `/api/musician-applications` — API routes backing
  the two forms above, now writing to a real Postgres database

## Database setup (required for booking/join forms to work)

Booking requests and musician applications are saved to a Postgres
database via Neon. This needs to be connected once per environment:

1. In the Vercel dashboard, open this project → **Storage** tab →
   **Create Database** → choose **Postgres** (powered by Neon) → follow
   the prompts → **Connect** it to this project. Vercel automatically
   sets the `DATABASE_URL` environment variable — no manual copying of
   connection strings needed.
2. Still in Vercel, go to **Settings → Environment Variables** and add:
   - `ADMIN_PASSWORD` — a password of your choosing, protects `/admin`
   - `ADMIN_USER` — optional, defaults to `admin` if not set
3. Redeploy (Vercel usually does this automatically after an env var
   change; if not, trigger a redeploy from the Deployments tab).
4. Visit `yoursite.com/admin` — your browser will prompt for the
   username/password you just set. Tables are created automatically on
   first booking/application submission (or first admin page load).

For local development, create a `.env.local` file with `DATABASE_URL`
pointing at a Neon (or any Postgres) connection string, plus
`ADMIN_PASSWORD`.

## What's mocked / prototype-only

- **Musician data** lives in `src/lib/musicians.ts` as a hardcoded array
  (9 example profiles, some using placeholder photography). Swap this
  for real database queries once real musicians sign up — the shape
  (`Musician` type) is designed to map cleanly onto a database table.

## Not yet built (the parts that need real accounts/credentials)

These need you to set up outside accounts before they can be wired in
for real — see the funding deck's Risks & Mitigations section:

- **Payments** — Stripe Connect integration (holding funds, releasing on
  confirmation, the 10% platform fee split)
- **Police vetting** — needs an approved vetting provider/API before
  there's anything to integrate against
- **Withholding tax** — IRD integration for automatic tax handling
- **Musician-facing login** — currently only the internal `/admin` view
  exists; musicians can't yet log in to see their own bookings

## Notes on fonts

Fonts are loaded via a `<link>` tag to Google Fonts in `layout.tsx`
(matching how the original static HTML file loaded them), not via
`next/font/google` — the sandboxed build environment this was built in
couldn't reach Google Fonts' font-file CDN at build time. This should
work fine either way in a normal deployment; if you want the build-time
optimized version later, swap back to `next/font/google` and confirm it
builds cleanly on your own machine/CI.
