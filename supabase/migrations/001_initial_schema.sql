-- ============================================================
-- AfriPulse — Schéma Supabase COMPLET
-- À exécuter une seule fois dans l'éditeur SQL Supabase
-- (DROP SCHEMA puis tout recréer — idéal pour un projet frais)
-- ============================================================

-- ── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- TABLES PRINCIPALES
-- ============================================================

-- ── Profiles (liés à auth.users) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  role         TEXT        NOT NULL DEFAULT 'reader'
                           CHECK (role IN ('admin', 'editor', 'reader')),
  country      TEXT,                          -- pays renseigné dans le profil
  domain       TEXT,                          -- domaine d'intérêt
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Articles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.articles (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,
  excerpt          TEXT,
  content          TEXT,
  category         TEXT        NOT NULL
                               CHECK (category IN (
                                 'Politique','Économie','Tech','Sport',
                                 'Culture','Santé','Environnement'
                               )),
  author_id        UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name      TEXT        NOT NULL DEFAULT '',
  date             TIMESTAMPTZ DEFAULT NOW(),
  read_time        INT         DEFAULT 5,
  featured         BOOLEAN     DEFAULT FALSE,
  image_url        TEXT,                      -- URL Supabase Storage (bucket articles)
  image_gradient   TEXT        DEFAULT 'linear-gradient(135deg, #0a0800, #261e00)',
  published        BOOLEAN     DEFAULT FALSE,
  views            INT         DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Scholarships / Bourses ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scholarships (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,
  organization     TEXT        NOT NULL,
  country          TEXT        NOT NULL,
  flag             TEXT        DEFAULT '🌍',
  level            TEXT        NOT NULL
                               CHECK (level IN (
                                 'Licence','Master','Doctorat',
                                 'Postdoc','Toutes formations'
                               )),
  domain           TEXT        NOT NULL DEFAULT 'Toutes disciplines',
  deadline         DATE        NOT NULL,
  urgent           BOOLEAN     DEFAULT FALSE,
  amount           TEXT,
  description      TEXT,                      -- texte riche / chapô
  mission          TEXT,                      -- 2e paragraphe
  image_url        TEXT,                      -- URL Supabase Storage
  image_gradient   TEXT        DEFAULT 'linear-gradient(135deg, #0a0800, #261e00)',
  tags             TEXT[]      DEFAULT '{}',
  published        BOOLEAN     DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Opportunities ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.opportunities (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,
  company          TEXT        NOT NULL,
  company_initials TEXT        NOT NULL DEFAULT '',
  location         TEXT        NOT NULL,
  country          TEXT,
  flag             TEXT        DEFAULT '🌍',
  type             TEXT        NOT NULL
                               CHECK (type IN (
                                 'Emploi CDI','Stage','Graduate',
                                 'Emploi','Freelance','Volontariat'
                               )),
  sector           TEXT,
  description      TEXT,
  skills           TEXT[]      DEFAULT '{}',
  deadline         DATE,
  posted_at        TIMESTAMPTZ DEFAULT NOW(),
  salary           TEXT,
  remote           BOOLEAN     DEFAULT FALSE,
  featured         BOOLEAN     DEFAULT FALSE,
  image_url        TEXT,
  image_gradient   TEXT        DEFAULT 'linear-gradient(135deg, #0a0800, #261e00)',
  apply_url        TEXT,
  published        BOOLEAN     DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Events ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,
  type             TEXT        NOT NULL
                               CHECK (type IN (
                                 'Conférence','Forum','Hackathon',
                                 'Salon','Atelier','Sommet'
                               )),
  location         TEXT        NOT NULL,
  country          TEXT,
  flag             TEXT        DEFAULT '🌍',
  event_date       DATE        NOT NULL,
  description      TEXT,
  organizer        TEXT,
  attendees        TEXT,
  register_url     TEXT,
  image_url        TEXT,
  image_gradient   TEXT        DEFAULT 'linear-gradient(135deg, #0a0800, #261e00)',
  tags             TEXT[]      DEFAULT '{}',
  featured         BOOLEAN     DEFAULT FALSE,
  published        BOOLEAN     DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Newsletter subscribers ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        UNIQUE NOT NULL,
  confirmed    BOOLEAN     DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Saves (contenus sauvegardés par les membres) ───────────
CREATE TABLE IF NOT EXISTS public.saves (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type   TEXT        NOT NULL
                             CHECK (content_type IN (
                               'article','scholarship','opportunity','event'
                             )),
  content_slug   TEXT        NOT NULL,
  content_title  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, content_type, content_slug)
);

-- ── Applications (candidatures suivies) ────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type   TEXT        NOT NULL
                             CHECK (content_type IN ('scholarship','opportunity')),
  content_slug   TEXT        NOT NULL,
  content_title  TEXT,
  status         TEXT        NOT NULL DEFAULT 'interested'
                             CHECK (status IN (
                               'interested','in_progress','submitted',
                               'interview','accepted','rejected','withdrawn'
                             )),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, content_type, content_slug)
);

-- ── Event registrations (inscriptions aux événements) ───────
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_slug   TEXT        NOT NULL,
  event_title  TEXT,
  event_date   DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, event_slug)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_articles_published
  ON public.articles(published, date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug
  ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category
  ON public.articles(category);

CREATE INDEX IF NOT EXISTS idx_scholarships_deadline
  ON public.scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_slug
  ON public.scholarships(slug);
CREATE INDEX IF NOT EXISTS idx_scholarships_urgent
  ON public.scholarships(urgent);

CREATE INDEX IF NOT EXISTS idx_opportunities_slug
  ON public.opportunities(slug);
CREATE INDEX IF NOT EXISTS idx_opportunities_type
  ON public.opportunities(type);

CREATE INDEX IF NOT EXISTS idx_events_date
  ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_slug
  ON public.events(slug);

CREATE INDEX IF NOT EXISTS idx_saves_user
  ON public.saves(user_id);
CREATE INDEX IF NOT EXISTS idx_saves_content
  ON public.saves(content_type, content_slug);

CREATE INDEX IF NOT EXISTS idx_applications_user
  ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status
  ON public.applications(status);

CREATE INDEX IF NOT EXISTS idx_event_reg_user
  ON public.event_registrations(user_id);


-- ============================================================
-- TRIGGERS — updated_at automatique
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_scholarships_updated_at
    BEFORE UPDATE ON public.scholarships
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- TRIGGER — Créer un profil automatiquement à l'inscription
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

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- DROP toutes les policies existantes (idempotent)
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "profiles_select"          ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert"          ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin"    ON public.profiles;

-- articles
DROP POLICY IF EXISTS "articles_public_read"     ON public.articles;
DROP POLICY IF EXISTS "articles_admin_write"     ON public.articles;
DROP POLICY IF EXISTS "articles_admin_insert"    ON public.articles;
DROP POLICY IF EXISTS "articles_admin_update"    ON public.articles;
DROP POLICY IF EXISTS "articles_admin_delete"    ON public.articles;

-- scholarships
DROP POLICY IF EXISTS "scholarships_public_read" ON public.scholarships;
DROP POLICY IF EXISTS "scholarships_admin_write" ON public.scholarships;

-- opportunities
DROP POLICY IF EXISTS "opportunities_public_read"  ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_admin_write"  ON public.opportunities;

-- events
DROP POLICY IF EXISTS "events_public_read"       ON public.events;
DROP POLICY IF EXISTS "events_admin_write"       ON public.events;

-- newsletter
DROP POLICY IF EXISTS "newsletter_public_insert" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_read"    ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_delete"  ON public.newsletter_subscribers;

-- saves
DROP POLICY IF EXISTS "saves_own_select"         ON public.saves;
DROP POLICY IF EXISTS "saves_own_insert"         ON public.saves;
DROP POLICY IF EXISTS "saves_own_delete"         ON public.saves;
DROP POLICY IF EXISTS "saves_admin_read"         ON public.saves;

-- applications
DROP POLICY IF EXISTS "applications_own_select"  ON public.applications;
DROP POLICY IF EXISTS "applications_own_insert"  ON public.applications;
DROP POLICY IF EXISTS "applications_own_update"  ON public.applications;
DROP POLICY IF EXISTS "applications_own_delete"  ON public.applications;
DROP POLICY IF EXISTS "applications_admin_read"  ON public.applications;

-- event_registrations
DROP POLICY IF EXISTS "event_reg_own_select"     ON public.event_registrations;
DROP POLICY IF EXISTS "event_reg_own_insert"     ON public.event_registrations;
DROP POLICY IF EXISTS "event_reg_own_delete"     ON public.event_registrations;
DROP POLICY IF EXISTS "event_reg_admin_read"     ON public.event_registrations;

-- storage
DROP POLICY IF EXISTS "articles_storage_read"        ON storage.objects;
DROP POLICY IF EXISTS "articles_storage_upload"      ON storage.objects;
DROP POLICY IF EXISTS "articles_storage_update"      ON storage.objects;
DROP POLICY IF EXISTS "articles_storage_delete"      ON storage.objects;
DROP POLICY IF EXISTS "scholarships_storage_read"    ON storage.objects;
DROP POLICY IF EXISTS "scholarships_storage_upload"  ON storage.objects;
DROP POLICY IF EXISTS "scholarships_storage_delete"  ON storage.objects;
DROP POLICY IF EXISTS "opportunities_storage_read"   ON storage.objects;
DROP POLICY IF EXISTS "opportunities_storage_upload" ON storage.objects;
DROP POLICY IF EXISTS "opportunities_storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "events_storage_read"          ON storage.objects;
DROP POLICY IF EXISTS "events_storage_upload"        ON storage.objects;
DROP POLICY IF EXISTS "events_storage_delete"        ON storage.objects;
DROP POLICY IF EXISTS "avatars_storage_read"         ON storage.objects;
DROP POLICY IF EXISTS "avatars_storage_upload"       ON storage.objects;
DROP POLICY IF EXISTS "avatars_storage_update"       ON storage.objects;
DROP POLICY IF EXISTS "avatars_storage_delete"       ON storage.objects;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations   ENABLE ROW LEVEL SECURITY;

-- ── Profiles ────────────────────────────────────────────────
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── Articles ────────────────────────────────────────────────
-- Lecture publique pour les publiés, tout pour admin/editor
CREATE POLICY "articles_public_read"
  ON public.articles FOR SELECT
  USING (
    published = TRUE
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY "articles_admin_insert"
  ON public.articles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY "articles_admin_update"
  ON public.articles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY "articles_admin_delete"
  ON public.articles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

-- ── Scholarships ─────────────────────────────────────────────
CREATE POLICY "scholarships_public_read"
  ON public.scholarships FOR SELECT
  USING (
    published = TRUE
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY "scholarships_admin_write"
  ON public.scholarships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

-- ── Opportunities ────────────────────────────────────────────
CREATE POLICY "opportunities_public_read"
  ON public.opportunities FOR SELECT
  USING (
    published = TRUE
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY "opportunities_admin_write"
  ON public.opportunities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

-- ── Events ───────────────────────────────────────────────────
CREATE POLICY "events_public_read"
  ON public.events FOR SELECT
  USING (
    published = TRUE
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY "events_admin_write"
  ON public.events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

-- ── Newsletter ───────────────────────────────────────────────
CREATE POLICY "newsletter_public_insert"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "newsletter_admin_read"
  ON public.newsletter_subscribers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "newsletter_admin_delete"
  ON public.newsletter_subscribers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── Saves ────────────────────────────────────────────────────
CREATE POLICY "saves_own_select"
  ON public.saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saves_own_insert"
  ON public.saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saves_own_delete"
  ON public.saves FOR DELETE
  USING (auth.uid() = user_id);

-- Admin peut tout lire (pour les analytiques)
CREATE POLICY "saves_admin_read"
  ON public.saves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── Applications ─────────────────────────────────────────────
CREATE POLICY "applications_own_select"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "applications_own_insert"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "applications_own_update"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "applications_own_delete"
  ON public.applications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "applications_admin_read"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── Event registrations ──────────────────────────────────────
CREATE POLICY "event_reg_own_select"
  ON public.event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "event_reg_own_insert"
  ON public.event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_reg_own_delete"
  ON public.event_registrations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "event_reg_admin_read"
  ON public.event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================
-- STORAGE — Buckets + politiques
-- ============================================================

-- Bucket : articles (images de couverture)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'articles', 'articles', TRUE,
  5242880,    -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Bucket : scholarships
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'scholarships', 'scholarships', TRUE,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket : opportunities
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'opportunities', 'opportunities', TRUE,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket : events
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'events', 'events', TRUE,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket : avatars (photos de profil)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', TRUE,
  2097152,    -- 2 MB
  ARRAY['image/jpeg','image/png','image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ── Politiques Storage : articles ────────────────────────────
CREATE POLICY "articles_storage_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'articles');

CREATE POLICY "articles_storage_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'articles'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY "articles_storage_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'articles'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY "articles_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'articles'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

-- ── Politiques Storage : scholarships ────────────────────────
CREATE POLICY "scholarships_storage_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'scholarships');

CREATE POLICY "scholarships_storage_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'scholarships'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY "scholarships_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'scholarships'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

-- ── Politiques Storage : opportunities ───────────────────────
CREATE POLICY "opportunities_storage_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'opportunities');

CREATE POLICY "opportunities_storage_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'opportunities'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY "opportunities_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'opportunities'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

-- ── Politiques Storage : events ──────────────────────────────
CREATE POLICY "events_storage_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'events');

CREATE POLICY "events_storage_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'events'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY "events_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'events'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

-- ── Politiques Storage : avatars ─────────────────────────────
CREATE POLICY "avatars_storage_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_storage_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "avatars_storage_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "avatars_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );


-- ============================================================
-- DONNER LE RÔLE ADMIN AU PREMIER UTILISATEUR
-- Décommenter et remplacer l'email avant d'exécuter
-- ============================================================
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'votre-email@exemple.com';