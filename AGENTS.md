# Ursuline Study Centre - AI Development Rules

## Project Type
Production-grade full stack educational institution platform.

Stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- React Server Components
- Responsive-first UI

---

## Critical Rules

- Never create duplicate components.
- Reuse existing architecture whenever possible.
- Never generate dummy data unless explicitly asked.
- Never hardcode content already managed from admin panel.
- Keep frontend visually unchanged unless instructed.
- Maintain USC brand colors:
  - Maroon
  - Gold
  - White
  - Soft beige backgrounds

---

## Performance Rules

- Optimize all images automatically.
- Prefer Server Components where possible.
- Avoid unnecessary re-renders.
- Lazy load heavy sections.
- Keep Lighthouse score high.

---

## UI Rules

- Maintain premium institutional aesthetic.
- Keep spacing balanced and professional.
- Avoid cluttered layouts.
- Mobile responsiveness is mandatory.
- Use modern readable fonts only.
- Never use random emojis in production UI.

---

## Backend Rules

- All important data must persist in Supabase.
- Never use local-only temporary storage for critical data.
- All CRUD operations must support:
  - validation
  - loading states
  - error handling
  - soft delete
  - restore

---

## Security Rules

- Protect admin routes.
- Respect RLS policies.
- Never expose secret keys.
- Validate uploads.
- Sanitize form inputs.

---

## Storage Rules

- Compress uploaded images.
- Convert to WebP where possible.
- Keep storage optimized.

---

## Student System Rules

Students can only edit limited safe fields.
Sensitive academic/admin data must remain admin-controlled.

---

## Final Rule

Always prioritize:
- production stability
- maintainability
- performance
- security
- scalability
- clean architecture

---

## Vercel Deployment & CLI Rules

- This repository is associated with the **Ursuline Study Centre** Vercel account (`adityaursuline-2686s-projects`).
- **DO NOT** run Vercel CLI commands globally without specifying the dedicated token.
- Always use the local environment variable `VERCEL_TOKEN` from `.env.local` (e.g. read the token value from there) to authenticate your `vercel` commands.
- Ensure that deployments are only made to the linked project `ursuline-study-centre` and never cross over to "Academic Origin" or any other workspace.