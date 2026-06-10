# Ursuline Study Centre

## Overview

Ursuline Study Centre is a production-grade web platform for a girls-only educational institution based in Ranchi, Jharkhand. The platform serves as a public informational website and includes a fully featured administrative dashboard for managing all institution content.

The website provides prospective students and parents with comprehensive information about courses, faculty, admissions, and institutional achievements. The admin panel allows authorized staff to manage all site content, enquiries, student records, and media assets without requiring developer involvement.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Authentication | JWT (jose), bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| File Storage | Supabase Storage |
| Input Validation | Zod |
| XSS Protection | DOMPurify / isomorphic-dompurify |
| Deployment | Vercel |

---

## Features

### Public Website
- Institutional homepage with hero, about, and trust sections
- Dynamic courses and faculty listings (fetched from database)
- Student results showcase
- Photo gallery
- Founder and about sections
- FAQ section
- Testimonials
- YouTube video integration
- Enquiry/contact form with email notification
- Online application form
- Announcement banner
- Sitemap and robots.txt

### Admin Panel
- Secure login with JWT-based sessions and rate limiting
- Dashboard with live enquiry and notification overview
- Enquiry management (status tracking, follow-up, export)
- Student record management with soft delete and restore
- Faculty management with photo upload
- Course management
- Gallery management
- Testimonials management
- YouTube video management
- FAQ management
- Notice/announcement management
- Results management
- Site settings editor
- Storage manager with cleanup tools
- Backup and export tools
- Audit log system

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages and API routes
│   ├── api/                    # REST API route handlers
│   │   ├── admin/              # Admin auth endpoints
│   │   ├── enquiry/            # Enquiry CRUD
│   │   ├── faculty/            # Faculty CRUD
│   │   ├── courses/            # Courses CRUD
│   │   ├── gallery/            # Gallery CRUD
│   │   ├── students/           # Student record management
│   │   ├── upload/             # File upload with validation
│   │   ├── backup/             # Backup and export
│   │   ├── cron/               # Scheduled cleanup jobs
│   │   └── ...                 # Other resource endpoints
│   ├── admin/dashboard/        # Admin panel page
│   ├── apply/                  # Public application form page
│   ├── layout.tsx              # Root layout with metadata and fonts
│   ├── page.tsx                # Public homepage
│   ├── globals.css             # Global styles
│   ├── robots.ts               # robots.txt generation
│   └── sitemap.ts              # sitemap.xml generation
│
├── components/
│   ├── admin/                  # Admin panel UI components
│   ├── layout/                 # Navbar, Footer, AnnouncementBanner
│   ├── sections/               # Public homepage sections
│   └── ui/                     # Shared UI elements (WhatsApp button, etc.)
│
├── lib/
│   ├── supabase/
│   │   └── client.ts           # Supabase browser and admin clients
│   ├── auth/
│   │   └── index.ts            # JWT authentication helpers
│   ├── validations/
│   │   └── index.ts            # Zod input validation schemas
│   └── security/
│       ├── audit.ts            # Audit log helper
│       └── rate-limit.ts       # In-memory rate limiting
│
├── services/                   # Server-side service layer
│   ├── email.ts                # Nodemailer email service
│   ├── notifications.ts        # Admin notification service
│   └── settings.ts             # Application settings fetcher
│
├── config/
│   └── constants.ts            # Static site configuration and navigation
│
├── types/
│   └── index.ts                # Shared TypeScript interfaces
│
└── proxy.ts                    # Next.js 16 security middleware
                                # (CSRF, rate limiting, admin route protection)

database/
└── migrations/                 # Numbered SQL migration scripts (001–009)

docs/
└── SECURITY.md                 # Security procedures and configurations

public/
├── images/                     # Institutional photos
├── logo.png                    # Institution logo
└── favicon.png                 # Site favicon
```

---

## Installation

### Prerequisites
- Node.js 18 or later
- A Supabase project with the database schema applied
- A Gmail account with App Password enabled (for email notifications)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/addiii999/UrsulineStudyCentre.git
   cd UrsulineStudyCentre
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in all values in `.env.local` as documented below.

4. Apply the database schema:
   - Open the Supabase SQL Editor
   - Run `database/migrations/001_schema_base.sql` first
   - Run remaining migration files in numerical order

5. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

```env
# Supabase — obtain from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Admin credentials
ADMIN_USERNAME=admin@example.com
ADMIN_PASSWORD_HASH=bcrypt-hashed-password
ADMIN_SESSION_SECRET=random-32-byte-string
JWT_SECRET=random-32-byte-string

# Email — Gmail with App Password
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Cron job protection
CRON_SECRET=random-hex-string
```

To generate secure secret values:
```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))
```

All variables must also be added to the Vercel project settings under Environment Variables before deployment.

---

## Database

The application uses Supabase (PostgreSQL) as its database.

### Core Tables

| Table | Purpose |
|-------|---------|
| `enquiries` | Admission enquiries from prospective students |
| `faculty` | Faculty member profiles and information |
| `courses` | Course listings with categories and fees |
| `gallery` | Photo gallery with storage paths |
| `testimonials` | Student testimonials and ratings |
| `youtube_videos` | Embedded YouTube video references |
| `faq` | Frequently asked questions |
| `notices` | Announcements and notices |
| `results` | Academic result statistics |
| `students` | Student records with admission status |
| `notifications` | Admin bell notifications |
| `audit_logs` | Admin action audit trail |
| `login_attempts` | Brute force protection tracking |
| `settings` | Key-value site configuration store |

### Data Flow
- Public-facing sections fetch data directly from Supabase using the anon client
- Admin operations go through Next.js API routes which use the service role client
- Row Level Security (RLS) is enforced at the database level

---

## Deployment

The application is deployed on Vercel with automatic deployments on push to the `main` branch.

### Build Command
```bash
npm run build
```

### Deployment Steps
1. Push changes to the `main` branch on GitHub
2. Vercel automatically triggers a build and deployment
3. Ensure all environment variables are configured in the Vercel project dashboard
4. The commit author must be a verified contributor on the Vercel project

---

## Security Notes

- Admin sessions use signed JWTs with a 2-hour expiry
- All API mutations require a valid admin session cookie
- Rate limiting is enforced at the middleware level (Next.js proxy) and per-route level
- CSRF protection blocks cross-origin mutation requests in production
- All user inputs are validated with Zod schemas and sanitized with DOMPurify
- File uploads are validated by magic number, not just MIME type
- Sensitive keys are never exposed to the client
- All admin actions are logged to the `audit_logs` table

See `docs/SECURITY.md` for full security procedures.

---

## Maintenance Notes

### Content Management
All site content (faculty, courses, gallery, notices, testimonials, results, FAQs, YouTube videos) is managed through the admin panel at `/admin/dashboard`. No code changes are required for content updates.

### Site Settings
Key site configuration values (contact details, social links, etc.) can be updated through the Settings section of the admin panel. These are stored in the `settings` table and override the default values in `src/config/constants.ts`.

### Backups
The admin panel includes a built-in backup tool that exports data as a ZIP archive. Regular weekly backups are recommended. The `WeeklyBackupReminder` component prompts the admin if a backup has not been performed recently.

### Database Migrations
Future schema changes should be added as numbered files in `database/migrations/` following the existing convention (`010_description.sql`, etc.) and run in the Supabase SQL Editor.
