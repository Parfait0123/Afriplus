-- ============================================================
-- AfriPulse — Schéma Supabase complet
-- Exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- ── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles (liés à auth.users) ──────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('admin', 'editor', 'reader')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Articles ───────────────────────────────────────────────
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL CHECK (category IN ('Politique','Économie','Tech','Sport','Culture','Santé','Environnement')),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT '',
  date TIMESTAMPTZ DEFAULT NOW(),
  read_time INT DEFAULT 5,
  featured BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  image_gradient TEXT DEFAULT 'linear-gradient(135deg, #0a0800, #261e00)',
  published BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Scholarships / Bourses ─────────────────────────────────
CREATE TABLE public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  country TEXT NOT NULL,
  flag TEXT DEFAULT '🌍',
  level TEXT NOT NULL CHECK (level IN ('Licence','Master','Doctorat','Postdoc','Toutes formations')),
  domain TEXT NOT NULL DEFAULT 'Toutes disciplines',
  deadline DATE NOT NULL,
  urgent BOOLEAN DEFAULT FALSE,
  amount TEXT,
  image_url TEXT,
  image_gradient TEXT DEFAULT 'linear-gradient(135deg, #0a0800, #261e00)',
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Opportunities ──────────────────────────────────────────
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_initials TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Emploi CDI','Stage','Graduate','Emploi','Freelance','Volontariat')),
  description TEXT,
  image_url TEXT,
  image_gradient TEXT DEFAULT 'linear-gradient(135deg, #0a0800, #261e00)',
  apply_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Events ─────────────────────────────────────────────────
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Conférence','Forum','Hackathon','Salon','Atelier','Sommet')),
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  register_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Newsletter subscribers ─────────────────────────────────
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  confirmed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Profiles : chacun voit son propre profil, admins voient tout
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Articles publiés : lecture publique
CREATE POLICY "articles_public_read" ON public.articles FOR SELECT USING (published = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor')));
CREATE POLICY "articles_admin_write" ON public.articles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor')));

-- Bourses publiées : lecture publique
CREATE POLICY "scholarships_public_read" ON public.scholarships FOR SELECT USING (published = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor')));
CREATE POLICY "scholarships_admin_write" ON public.scholarships FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor')));

-- Opportunités publiées : lecture publique
CREATE POLICY "opportunities_public_read" ON public.opportunities FOR SELECT USING (published = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor')));
CREATE POLICY "opportunities_admin_write" ON public.opportunities FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor')));

-- Événements publiés : lecture publique
CREATE POLICY "events_public_read" ON public.events FOR SELECT USING (published = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor')));
CREATE POLICY "events_admin_write" ON public.events FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor')));

-- Newsletter : insertion publique, lecture admin seulement
CREATE POLICY "newsletter_public_insert" ON public.newsletter_subscribers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "newsletter_admin_read" ON public.newsletter_subscribers FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "newsletter_admin_delete" ON public.newsletter_subscribers FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- Trigger : créer profil à l'inscription
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'reader'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger : mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_scholarships_updated_at BEFORE UPDATE ON public.scholarships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- Donner le rôle admin au premier utilisateur (modifier l'email)
-- ============================================================
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'votre-email@exemple.com';

-- ============================================================
-- Index pour les performances
-- ============================================================
CREATE INDEX idx_articles_published ON public.articles(published, date DESC);
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_scholarships_deadline ON public.scholarships(deadline);
CREATE INDEX idx_events_date ON public.events(event_date);
