# Ursuline Study Centre

Official website for Ursuline Study Centre — a premier educational institution.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **Auth:** JWT-based admin authentication
- **Storage:** Supabase Storage (images → WebP)
- **Deployment:** Vercel

## Project Structure

```
src/
  app/           # Next.js App Router pages & API routes
  components/
    admin/       # Admin panel components
    layout/      # Navbar, Footer, etc.
    sections/    # Public-facing page sections
    ui/          # Reusable UI elements
  lib/           # Auth, Supabase client, validation, utilities
  middleware.ts  # Security middleware (CSRF, rate limiting, admin protection)
  types/         # Shared TypeScript types

docs/
  SECURITY.md    # Security reference & procedures

database/
  migrations/    # Numbered SQL migration scripts
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in .env.local with your Supabase and other credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Panel

Access at `/admin/login` using configured admin credentials.

## Environment Variables

See `.env.example` for all required variables.  
See `docs/SECURITY.md` for security setup and procedures.

## Deployment

Push to `main` branch — Vercel deploys automatically.

Ensure all environment variables are configured in the Vercel dashboard before deploying.
