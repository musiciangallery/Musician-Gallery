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
- `/join` — musician application form, with the full field set (instruments,
  region, years experience, teacher-specific and event-specific fields,
  previous work links)
- `/admin` — password-protected internal page: booking requests, pending
  applications with a Review & Approve flow (edit the bio, upload a treated
  photo, publish), a list of live published musicians, and decided
  applications (see Database setup and Photo storage setup below)
- `/terms`, `/privacy` — full Terms & Conditions and Privacy Policy content
- `/api/bookings` and `/api/musician-applications` — API routes backing
  the two forms above, writing to a real Postgres database
- `/api/admin/approve` and `/api/admin/decline` — used by the admin Review
  & Approve flow; protected by the same password as `/admin`

## Photo storage setup (required for approving applications with a photo)

Approving an application uploads the photo you pick to Vercel Blob storage:

1. In the Vercel dashboard, open this project → **Storage** tab →
   **Create Database** → choose **Blob** → follow the prompts → **Connect**
   it to this project. Vercel automatically sets the
   `BLOB_READ_WRITE_TOKEN` environment variable.
2. Redeploy if it doesn't happen automatically.

Without this connected, the "Approve & publish" button in `/admin` will
fail with an upload error — the rest of the site works fine either way.

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

- **9 placeholder musician profiles** in `src/lib/musicians.ts` are kept
  deliberately, mixed in alongside real approved musicians, so the gallery
  looks populated during soft launch. Delete entries from that file
  whenever you're ready to retire a placeholder.
- Real, approved musicians are stored in the `musicians` Postgres table
  and published via `/admin`'s Review & Approve flow — the gallery, search
  filters, individual profile pages, and booking flow all include them
  automatically alongside the placeholders.

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
