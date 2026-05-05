-- Ursuline Study Centre - Full Database Schema

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Faculty Table
CREATE TABLE IF NOT EXISTS public.faculty (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT,
    qualification TEXT,
    experience TEXT,
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    student_class TEXT,
    quote TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Results / Stats Table
CREATE TABLE IF NOT EXISTS public.results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    source TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. FAQs Table
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    expires_at DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Settings Table (Key-Value Store)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Initialize default settings
INSERT INTO public.settings (key, value) VALUES
    ('phone', '+91 95075 89503'),
    ('phone2', '+91 62025 78886'),
    ('email', 'ursulinestudycentre@gmail.com'),
    ('whatsapp', '919507589503'),
    ('address', 'Ursuline Convent Campus, Dr. Camil Bulcke Path, Ranchi'),
    ('mapsLink', 'https://maps.google.com'),
    ('playStoreLink', 'https://play.google.com/store/apps/details?id=com.vefytech.academicorigin'),
    ('youtubeChannel', 'https://youtube.com/@academicorigin'),
    ('admissionsOpen', 'true')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS (Row Level Security) but allow public read access for all
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Allow public read-only access on courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on faculty" ON public.faculty FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on settings" ON public.settings FOR SELECT USING (true);
