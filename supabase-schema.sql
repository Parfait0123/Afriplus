-- ═══════════════════════════════════════════════════════════════
-- AFRIPULSE — Schéma Supabase (PostgreSQL)
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Types Enum ──────────────────────────────────────────────────
CREATE TYPE article_category AS ENUM (
  'Politique', 'Économie', 'Tech', 'Sport', 'Culture', 'Santé', 'Environnement'
);

CREATE TYPE scholarship_level AS ENUM (
  'Licence', 'Master', 'Doctorat', 'Postdoc', 'Toutes formations'
);

CREATE TYPE opportunity_type AS ENUM (
  'Emploi CDI', 'Emploi', 'Stage', 'Graduate', 'Freelance', 'Volontariat'
);

CREATE TYPE event_type AS ENUM (
  'Conférence', 'Forum', 'Hackathon', 'Salon', 'Atelier', 'Sommet'
);

CREATE TYPE user_role AS ENUM ('admin', 'editor', 'reader');

-- ── TABLE: profiles ─────────────────────────────────────────────
-- Complète les données auth.users de Supabase
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'reader',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: créer un profil automatiquement après inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: updated_at auto
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── TABLE: articles ──────────────────────────────────────────────
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category article_category NOT NULL DEFAULT 'Tech',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Rédaction AfriPulse',
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_time INT NOT NULL DEFAULT 5,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  image_gradient TEXT NOT NULL DEFAULT 'linear-gradient(135deg, #0a0800, #1a1400)',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  views INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX articles_slug_idx ON articles(slug);
CREATE INDEX articles_category_idx ON articles(category);
CREATE INDEX articles_published_idx ON articles(published);
CREATE INDEX articles_featured_idx ON articles(featured);
CREATE INDEX articles_date_idx ON articles(date DESC);

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── TABLE: scholarships ──────────────────────────────────────────
CREATE TABLE scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  country TEXT NOT NULL,
  flag TEXT NOT NULL DEFAULT '🌍',
  level scholarship_level NOT NULL DEFAULT 'Master',
  domain TEXT NOT NULL DEFAULT 'Toutes disciplines',
  deadline DATE NOT NULL,
  urgent BOOLEAN NOT NULL DEFAULT FALSE,
  amount TEXT,
  image_url TEXT,
  image_gradient TEXT NOT NULL DEFAULT 'linear-gradient(135deg, #0a0800, #1a1400)',
  tags TEXT[] NOT NULL DEFAULT '{}',
  apply_url TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX scholarships_slug_idx ON scholarships(slug);
CREATE INDEX scholarships_level_idx ON scholarships(level);
CREATE INDEX scholarships_deadline_idx ON scholarships(deadline ASC);
CREATE INDEX scholarships_urgent_idx ON scholarships(urgent);
CREATE INDEX scholarships_published_idx ON scholarships(published);

CREATE TRIGGER scholarships_updated_at
  BEFORE UPDATE ON scholarships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── TABLE: opportunities ────────────────────────────────────────
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_initials TEXT NOT NULL DEFAULT '??',
  location TEXT NOT NULL,
  type opportunity_type NOT NULL DEFAULT 'Emploi CDI',
  description TEXT,
  image_url TEXT,
  image_gradient TEXT NOT NULL DEFAULT 'linear-gradient(135deg, #0a0800, #1a1400)',
  apply_url TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX opportunities_slug_idx ON opportunities(slug);
CREATE INDEX opportunities_type_idx ON opportunities(type);
CREATE INDEX opportunities_published_idx ON opportunities(published);

CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── TABLE: events ────────────────────────────────────────────────
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type event_type NOT NULL DEFAULT 'Conférence',
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  register_url TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX events_slug_idx ON events(slug);
CREATE INDEX events_type_idx ON events(type);
CREATE INDEX events_date_idx ON events(event_date ASC);
CREATE INDEX events_published_idx ON events(published);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── TABLE: newsletter_subscribers ───────────────────────────────
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  confirmation_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX newsletter_email_idx ON newsletter_subscribers(email);
CREATE INDEX newsletter_confirmed_idx ON newsletter_subscribers(confirmed);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ── Policies: profiles ──────────────────────────────────────────
-- Tout le monde peut voir les profils publics
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

-- Chaque utilisateur peut modifier son propre profil
CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ── Policies: articles ──────────────────────────────────────────
-- Lecture publique des articles publiés
CREATE POLICY "articles_public_read" ON articles
  FOR SELECT USING (published = true);

-- Admins et éditeurs voient tout
CREATE POLICY "articles_admin_all" ON articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- ── Policies: scholarships ──────────────────────────────────────
CREATE POLICY "scholarships_public_read" ON scholarships
  FOR SELECT USING (published = true);

CREATE POLICY "scholarships_admin_all" ON scholarships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- ── Policies: opportunities ─────────────────────────────────────
CREATE POLICY "opportunities_public_read" ON opportunities
  FOR SELECT USING (published = true);

CREATE POLICY "opportunities_admin_all" ON opportunities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- ── Policies: events ────────────────────────────────────────────
CREATE POLICY "events_public_read" ON events
  FOR SELECT USING (published = true);

CREATE POLICY "events_admin_all" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- ── Policies: newsletter ────────────────────────────────────────
-- Tout le monde peut s'inscrire
CREATE POLICY "newsletter_insert" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Admins voient tout
CREATE POLICY "newsletter_admin_read" ON newsletter_subscribers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- FONCTIONS UTILITAIRES
-- ═══════════════════════════════════════════════════════════════

-- Promouvoir un utilisateur en admin (à exécuter manuellement)
-- UPDATE profiles SET role = 'admin' WHERE email = 'votre@email.com';

-- Incrémenter les vues d'un article
CREATE OR REPLACE FUNCTION increment_article_views(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE articles SET views = views + 1 WHERE slug = article_slug AND published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recherche plein texte
CREATE INDEX articles_fts_idx ON articles
  USING GIN (to_tsvector('french', title || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, '')));

CREATE INDEX scholarships_fts_idx ON scholarships
  USING GIN (to_tsvector('french', title || ' ' || organization || ' ' || domain));

CREATE INDEX opportunities_fts_idx ON opportunities
  USING GIN (to_tsvector('french', title || ' ' || company || ' ' || COALESCE(description, '')));

-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKETS (à créer dans Supabase Dashboard > Storage)
-- ═══════════════════════════════════════════════════════════════
-- Bucket: "images" (public) — pour les images d'articles, bourses, etc.
-- Bucket: "avatars" (public) — pour les photos de profil

-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
