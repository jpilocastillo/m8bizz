# M8 Business Suite

Marketing and business management dashboard built with **Next.js 14**, **React18**, **Supabase**, and **Tailwind CSS**.

## Prerequisites

- **Node.js** 18.x or newer (LTS recommended)
- **npm** (comes with Node)
- A **Supabase** project with the schema applied (see `supabase/migrations/`)

## Setup

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables. Copy the template and fill in values from your Supabase project (and optional site URL):

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Required | Notes |
   |----------|----------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Yes | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Yes in local dev for some scripts / server flows | **Secret** — never expose to the client |
   | `NEXT_PUBLIC_SITE_URL` | Optional | Used for links such as password reset; defaults to the current origin in many cases |

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server (after `build`) |
| `npm run lint` | ESLint |
| `npm test` | Jest tests |
| `npm run setup-admin` / `create-admin` / `make-admin` | Admin setup helpers (see `scripts/`) |
| `npm run create-test-users` / `update-test-users` / `check-users` | User utilities for development |

## Project layout (high level)

- `app/` — Next.js App Router pages and layouts
- `components/` — UI and feature components
- `lib/` — Shared logic (auth, Supabase helpers, etc.)
- `supabase/migrations/` — SQL migrations for the database
- `scripts/` — Node/ts-node maintenance and test scripts

## Documentation

- See `USER_MANUAL.md` for end-user oriented documentation.

## License

Private project — all rights reserved unless otherwise specified by the repository owner.
