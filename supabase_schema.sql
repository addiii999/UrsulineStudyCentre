-- =====================================================
-- URSULINE STUDY CENTRE — COMPLETE DATABASE SCHEMA
-- PostgreSQL / Supabase
-- Version: 2.0  |  Date: 2026-05-06
-- =====================================================
-- Run this entire file in Supabase SQL Editor (once).
-- Safe to re-run — all statements are idempotent.
-- =====================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1 ▸ CONTENT TABLES (Admin-managed, publicly readable)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1A. Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    name        TEXT        NOT NULL,
    category    TEXT        NOT NULL,         -- 'board', 'competitive', 'vocational'
    description TEXT,
    is_active   BOOLEAN     DEFAULT true,
    sort_order  INTEGER     DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 1B. Faculty
CREATE TABLE IF NOT EXISTS public.faculty (
    id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    name           TEXT        NOT NULL,
    subject        TEXT,
    qualification  TEXT,
    experience     TEXT,                      -- e.g. '12 Years'
    role           TEXT        NOT NULL,      -- e.g. 'Senior Teacher'
    is_active      BOOLEAN     DEFAULT true,
    sort_order     INTEGER     DEFAULT 0,
    created_at     TIMESTAMPTZ DEFAULT now()
);

-- 1C. Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    name          TEXT        NOT NULL,
    student_class TEXT,                       -- e.g. 'Class XII, Science'
    quote         TEXT        NOT NULL,
    rating        INTEGER     DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    is_visible    BOOLEAN     DEFAULT true,
    sort_order    INTEGER     DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 1D. Results / Stats
CREATE TABLE IF NOT EXISTS public.results (
    id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    label      TEXT        NOT NULL,          -- e.g. 'Board Pass Rate'
    value      TEXT        NOT NULL,          -- e.g. '98%'
    source     TEXT        NOT NULL,          -- e.g. 'JAC Board 2025'
    is_visible BOOLEAN     DEFAULT true,
    sort_order INTEGER     DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1E. FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
    id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    question   TEXT        NOT NULL,
    answer     TEXT        NOT NULL,
    is_active  BOOLEAN     DEFAULT true,
    sort_order INTEGER     DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1F. Announcements / Banners
CREATE TABLE IF NOT EXISTS public.announcements (
    id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    title      TEXT        NOT NULL,
    message    TEXT        NOT NULL,
    type       TEXT        DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning')),
    expires_at DATE,
    is_active  BOOLEAN     DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1G. YouTube Videos
CREATE TABLE IF NOT EXISTS public.videos (
    id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id   TEXT        NOT NULL,          -- YouTube video ID only
    title      TEXT,
    thumbnail  TEXT,                          -- auto-generated URL
    is_active  BOOLEAN     DEFAULT true,
    sort_order INTEGER     DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1H. Website Settings (Key-Value store)
CREATE TABLE IF NOT EXISTS public.settings (
    key        TEXT        PRIMARY KEY,
    value      TEXT        NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2 ▸ LEADS & STUDENTS (Private — admin-only access)
-- ─────────────────────────────────────────────────────────────────────────────

-- 2A. Enquiries / Leads (from Contact Form)
CREATE TABLE IF NOT EXISTS public.enquiries (
    id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    name         TEXT        NOT NULL,
    phone        TEXT        NOT NULL,
    class        TEXT,                        -- 'Class 9', 'Class 10', etc.
    stream       TEXT,                        -- 'Science (PCM)', 'Commerce', etc.
    message      TEXT,
    source       TEXT        DEFAULT 'website_contact',  -- 'website_contact', 'whatsapp', 'walk_in'
    status       TEXT        DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
    notes        TEXT,                        -- Admin internal notes
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

-- 2B. Student Applications (from Full Admission Form /apply)
CREATE TABLE IF NOT EXISTS public.students (
    id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Personal Details
    full_name           TEXT        NOT NULL,
    dob                 DATE,
    aadhaar_last4       TEXT,                 -- Store ONLY last 4 digits for security

    -- Parent Details
    mother_name         TEXT,
    father_name         TEXT,

    -- Previous Education (Class X)
    prev_board          TEXT,                 -- 'JAC', 'CBSE', 'ICSE'
    prev_school         TEXT,
    prev_year           TEXT,
    prev_marks          TEXT,

    -- Present Class
    present_class       TEXT,                 -- 'Class XI', 'Class XII'
    present_board       TEXT,
    present_school      TEXT,
    present_year        TEXT,

    -- Course Applied
    course              TEXT        NOT NULL, -- 'Science (PCM)', 'Commerce', etc.
    vocational          TEXT,                 -- Optional vocational subject

    -- Present Address
    present_village     TEXT,
    present_district    TEXT,
    present_ps          TEXT,
    present_phone       TEXT        NOT NULL,

    -- Permanent Address
    permanent_village   TEXT,
    permanent_district  TEXT,
    permanent_ps        TEXT,
    permanent_phone     TEXT,

    -- Admission Status (admin-controlled)
    admission_status    TEXT        DEFAULT 'applied' CHECK (admission_status IN ('applied', 'under_review', 'approved', 'rejected', 'enrolled')),
    admin_notes         TEXT,
    session             TEXT        DEFAULT '2026-27',

    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- 2C. Fee Structure
CREATE TABLE IF NOT EXISTS public.fees (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    course      TEXT        NOT NULL,         -- 'Science (PCM)', 'Commerce', etc.
    class       TEXT        NOT NULL,         -- 'Class XI', 'Class XII', 'Class IX-X'
    session     TEXT        NOT NULL,         -- '2026-27'
    amount      INTEGER     NOT NULL,         -- Fee in INR
    frequency   TEXT        DEFAULT 'annual' CHECK (frequency IN ('monthly', 'quarterly', 'annual', 'one_time')),
    description TEXT,
    is_active   BOOLEAN     DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3 ▸ DEFAULT DATA SEED
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.settings (key, value) VALUES
    ('phone',            '+91 95075 89503'),
    ('phone2',           '+91 62025 78886'),
    ('email',            'ursulinestudycentre@gmail.com'),
    ('whatsapp',         '919507589503'),
    ('address',          'Ursuline Convent Campus, Dr. Camil Bulcke Path, Ranchi'),
    ('mapsLink',         'https://maps.google.com'),
    ('mapEmbed',         'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3662.0!2d85.3!3d23.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDE4JzAwLjAiTiA4NcKwMTgnMDAuMCJF!5e0!3m2!1sen!2sin!4v1'),
    ('playStoreLink',    'https://play.google.com/store/apps/details?id=com.vefytech.academicorigin'),
    ('youtubeChannel',   'https://youtube.com/@academicorigin'),
    ('admissionsOpen',   'true'),
    ('founded',          '2000'),
    ('motto',            'Empowering Girls. Building Futures.'),
    ('designer',         'Aayush'),
    ('designerPhone',    '9508639773')
ON CONFLICT (key) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4 ▸ ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────
-- Public tables: anyone can READ. Only SERVICE_ROLE can write.
-- Private tables: SERVICE_ROLE only. No public access at all.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.courses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees          ENABLE ROW LEVEL SECURITY;

-- ── PUBLIC READ policies (content tables only) ────────────────────────────────
CREATE POLICY "public_read_courses"       ON public.courses       FOR SELECT USING (true);
CREATE POLICY "public_read_faculty"       ON public.faculty       FOR SELECT USING (true);
CREATE POLICY "public_read_testimonials"  ON public.testimonials  FOR SELECT USING (true);
CREATE POLICY "public_read_results"       ON public.results       FOR SELECT USING (true);
CREATE POLICY "public_read_faqs"          ON public.faqs          FOR SELECT USING (true);
CREATE POLICY "public_read_announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "public_read_videos"        ON public.videos        FOR SELECT USING (true);
CREATE POLICY "public_read_settings"      ON public.settings      FOR SELECT USING (true);

-- ── PUBLIC INSERT on enquiries (contact form) & students (apply form) ─────────
CREATE POLICY "public_insert_enquiries"   ON public.enquiries     FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_students"    ON public.students      FOR INSERT WITH CHECK (true);

-- NOTE: All UPDATE / DELETE operations use SERVICE_ROLE key (bypasses RLS)
-- This is handled server-side via createAdminClient() in API routes.
-- No additional write policies are needed for public/anon role.


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5 ▸ PERFORMANCE INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_courses_active       ON public.courses       (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_faculty_active       ON public.faculty       (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_visible ON public.testimonials  (is_visible, sort_order);
CREATE INDEX IF NOT EXISTS idx_faqs_active          ON public.faqs          (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_results_visible      ON public.results       (is_visible, sort_order);
CREATE INDEX IF NOT EXISTS idx_videos_active        ON public.videos        (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements (is_active, expires_at);

-- Lead/student indexes for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_enquiries_status     ON public.enquiries     (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone      ON public.enquiries     (phone);
CREATE INDEX IF NOT EXISTS idx_students_status      ON public.students      (admission_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_session     ON public.students      (session, admission_status);
CREATE INDEX IF NOT EXISTS idx_fees_course_class    ON public.fees          (course, class, session);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6 ▸ AUTO-UPDATE TIMESTAMP TRIGGER
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER enquiries_updated_at
    BEFORE UPDATE ON public.enquiries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- DONE. All tables, policies, indexes, and triggers are set up.
-- Next step: Run this in Supabase > SQL Editor > New Query > Run All
-- ─────────────────────────────────────────────────────────────────────────────
