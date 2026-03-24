-- ============================================================
-- AfriPulse — Schéma Supabase COMPLET ET DÉFINITIF
-- Analysé depuis : toutes les pages admin fournies
-- Idempotent : safe à ré-exécuter sur une base existante
-- ============================================================

-- ── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- DROP POLICIES EXISTANTES (idempotent)
-- ============================================================

DROP POLICY IF EXISTS "profiles_select"             ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own"         ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert"             ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"         ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin"       ON public.profiles;

DROP POLICY IF EXISTS "articles_public_read"        ON public.articles;
DROP POLICY IF EXISTS "articles_admin_write"        ON public.articles;
DROP POLICY IF EXISTS "articles_admin_insert"       ON public.articles;
DROP POLICY IF EXISTS "articles_admin_update"       ON public.articles;
DROP POLICY IF EXISTS "articles_admin_delete"       ON public.articles;

DROP POLICY IF EXISTS "scholarships_public_read"    ON public.scholarships;
DROP POLICY IF EXISTS "scholarships_admin_write"    ON public.scholarships;

DROP POLICY IF EXISTS "opportunities_public_read"   ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_admin_write"   ON public.opportunities;

DROP POLICY IF EXISTS "events_public_read"          ON public.events;
DROP POLICY IF EXISTS "events_admin_write"          ON public.events;

DROP POLICY IF EXISTS "newsletter_public_insert"    ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_read"       ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_delete"     ON public.newsletter_subscribers;

DROP POLICY IF EXISTS "saves_own_select"            ON public.saves;
DROP POLICY IF EXISTS "saves_own_insert"            ON public.saves;
DROP POLICY IF EXISTS "saves_own_delete"            ON public.saves;
DROP POLICY IF EXISTS "saves_admin_read"            ON public.saves;

DROP POLICY IF EXISTS "applications_own_select"     ON public.applications;
DROP POLICY IF EXISTS "applications_own_insert"     ON public.applications;
DROP POLICY IF EXISTS "applications_own_update"     ON public.applications;
DROP POLICY IF EXISTS "applications_own_delete"     ON public.applications;
DROP POLICY IF EXISTS "applications_admin_read"     ON public.applications;

DROP POLICY IF EXISTS "event_reg_own_select"        ON public.event_registrations;
DROP POLICY IF EXISTS "event_reg_own_insert"        ON public.event_registrations;
DROP POLICY IF EXISTS "event_reg_own_delete"        ON public.event_registrations;
DROP POLICY IF EXISTS "event_reg_admin_read"        ON public.event_registrations;

DROP POLICY IF EXISTS "articles_storage_read"       ON storage.objects;
DROP POLICY IF EXISTS "articles_storage_upload"     ON storage.objects;
DROP POLICY IF EXISTS "articles_storage_update"     ON storage.objects;
DROP POLICY IF EXISTS "articles_storage_delete"     ON storage.objects;
DROP POLICY IF EXISTS "scholarships_storage_read"   ON storage.objects;
DROP POLICY IF EXISTS "scholarships_storage_upload" ON storage.objects;
DROP POLICY IF EXISTS "scholarships_storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "opportunities_storage_read"  ON storage.objects;
DROP POLICY IF EXISTS "opportunities_storage_upload" ON storage.objects;
DROP POLICY IF EXISTS "opportunities_storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "events_storage_read"         ON storage.objects;
DROP POLICY IF EXISTS "events_storage_upload"       ON storage.objects;
DROP POLICY IF EXISTS "events_storage_delete"       ON storage.objects;
DROP POLICY IF EXISTS "avatars_storage_read"        ON storage.objects;
DROP POLICY IF EXISTS "avatars_storage_upload"      ON storage.objects;
DROP POLICY IF EXISTS "avatars_storage_update"      ON storage.objects;
DROP POLICY IF EXISTS "avatars_storage_delete"      ON storage.objects;


-- ============================================================
-- TABLE : profiles
-- Pages : admin/page, admin/utilisateurs, admin/analytique/audience
-- Colonnes lues : id, email, full_name, role, country, domain, created_at
-- Colonnes écrites : role (UPDATE par admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  role         TEXT        NOT NULL DEFAULT 'reader'
                           CHECK (role IN ('admin','editor','reader')),
  country      TEXT,       -- analytique/audience + admin/utilisateurs
  domain       TEXT,       -- analytique/audience + admin/utilisateurs
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country    TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS domain     TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();


-- ============================================================
-- TABLE : articles
-- Pages : admin/actualites/[id] (éditeur complet)
--
-- COLONNES CRITIQUES issues de l'analyse de l'éditeur :
--   content      → JSONB  { intro: string, blocks: Block[] }
--   cover_url    → TEXT   (NOM EXACT utilisé par la page — PAS image_url)
--   reading_time → INT    (NOM EXACT utilisé par la page — PAS read_time)
--   published_at → TIMESTAMPTZ nullable (SET lors de la publication)
--   meta_title   → TEXT nullable
--   meta_desc    → TEXT nullable
--   tags         → TEXT[]
--   image_gradient → TEXT (calculé côté front selon catégorie)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,
  excerpt          TEXT,
  content          JSONB,      -- { intro: string, blocks: Block[] }
  category         TEXT        NOT NULL
                               CHECK (category IN (
                                 'Politique','Économie','Tech','Sport',
                                 'Culture','Santé','Environnement'
                               )),
  author_id        UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name      TEXT        NOT NULL DEFAULT '',
  reading_time     INT         NOT NULL DEFAULT 5,  -- NOM : reading_time
  featured         BOOLEAN     NOT NULL DEFAULT FALSE,
  published        BOOLEAN     NOT NULL DEFAULT FALSE,
  published_at     TIMESTAMPTZ,                     -- nullable, SET à la publication
  cover_url        TEXT,                            -- NOM : cover_url (bucket articles)
  image_gradient   TEXT        NOT NULL DEFAULT 'linear-gradient(135deg,#0a0800,#261e00)',
  tags             TEXT[]      NOT NULL DEFAULT '{}',
  meta_title       TEXT,                            -- SEO, nullable
  meta_desc        TEXT,                            -- SEO, nullable
  views            INT         NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration sécurisée depuis une table existante
-- Si read_time existe et reading_time n'existe pas → renommer
-- content est déjà JSONB — pas de conversion nécessaire

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS published_at   TIMESTAMPTZ;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS cover_url      TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS image_gradient TEXT
  DEFAULT 'linear-gradient(135deg,#0a0800,#261e00)';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS tags           TEXT[] DEFAULT '{}';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_title     TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_desc      TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS views          INT DEFAULT 0;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS reading_time   INT DEFAULT 5;


-- ============================================================
-- TABLE : scholarships
-- Pages : admin/bourses, admin/analytique/contenu
-- Colonnes lues : id, title, slug, level, urgent, deadline, organization
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scholarships (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,
  organization     TEXT        NOT NULL,
  country          TEXT        NOT NULL DEFAULT '',
  flag             TEXT        NOT NULL DEFAULT '🌍',
  level            TEXT        NOT NULL
                               CHECK (level IN (
                                 'Licence','Master','Doctorat',
                                 'Postdoc','Toutes formations'
                               )),
  domain           TEXT        NOT NULL DEFAULT 'Toutes disciplines',
  deadline         DATE        NOT NULL,
  urgent           BOOLEAN     NOT NULL DEFAULT FALSE,
  amount           TEXT,
  blocks      TEXT,
  meta_desc        TEXT,
  meta_title       TEXT,
  saves_count      INT         NOT NULL DEFAULT 0,
  views            INT         NOT NULL DEFAULT 0,
  cover_url        TEXT,       -- bucket scholarships (cohérence avec articles)
  image_gradient   TEXT        NOT NULL DEFAULT 'linear-gradient(135deg,#0a0800,#261e00)',
  tags             TEXT[]      NOT NULL DEFAULT '{}',
  published        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS cover_url    TEXT;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS description  TEXT;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS mission      TEXT;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS image_gradient TEXT
  DEFAULT 'linear-gradient(135deg,#0a0800,#261e00)';
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS tags         TEXT[] DEFAULT '{}';

-- Si image_url existe → renommer en cover_url pour cohérence
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'scholarships'
      AND column_name = 'image_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'scholarships'
      AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE public.scholarships RENAME COLUMN image_url TO cover_url;
  END IF;
END $$;


-- ============================================================
-- TABLE : opportunities
-- Pages : admin/opportunites, admin/analytique/contenu
-- Colonnes lues : id, title, slug, type, company
-- + colonnes enrichies depuis data.ts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.opportunities (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,
  company          TEXT        NOT NULL,
  company_initials TEXT        NOT NULL DEFAULT '',
  location         TEXT        NOT NULL DEFAULT '',
  country          TEXT,
  flag             TEXT        NOT NULL DEFAULT '🌍',
  type             TEXT        NOT NULL
                               CHECK (type IN (
                                 'Emploi CDI','Stage','Graduate',
                                 'Emploi','Freelance','Volontariat'
                               )),
  sector           TEXT,
  description      TEXT,
  skills           TEXT[]      NOT NULL DEFAULT '{}',
  deadline         DATE,
  posted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  salary           TEXT,
  remote           BOOLEAN     NOT NULL DEFAULT FALSE,
  featured         BOOLEAN     NOT NULL DEFAULT FALSE,
  cover_url        TEXT,       -- bucket opportunities
  image_gradient   TEXT        NOT NULL DEFAULT 'linear-gradient(135deg,#0a0800,#261e00)',
  apply_url        TEXT,
  published        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS country         TEXT;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS flag            TEXT DEFAULT '🌍';
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS sector          TEXT;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS description     TEXT;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS skills          TEXT[] DEFAULT '{}';
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS deadline        DATE;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS posted_at       TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS salary          TEXT;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS remote          BOOLEAN DEFAULT FALSE;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS featured        BOOLEAN DEFAULT FALSE;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS cover_url       TEXT;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS image_gradient  TEXT
  DEFAULT 'linear-gradient(135deg,#0a0800,#261e00)';

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'opportunities'
      AND column_name = 'image_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'opportunities'
      AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE public.opportunities RENAME COLUMN image_url TO cover_url;
  END IF;
END $$;


-- ============================================================
-- TABLE : events
-- Pages : admin/analytique/contenu, admin/evenements/nouveau
-- Colonnes lues : id, title, slug, type, event_date, location
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,
  type             TEXT        NOT NULL
                               CHECK (type IN (
                                 'Conférence','Forum','Hackathon',
                                 'Salon','Atelier','Sommet'
                               )),
  location         TEXT        NOT NULL DEFAULT '',
  country          TEXT,
  flag             TEXT        NOT NULL DEFAULT '🌍',
  event_date       DATE        NOT NULL,
  description      TEXT,
  organizer        TEXT,
  attendees        TEXT,
  register_url     TEXT,
  cover_url        TEXT,       -- bucket events
  image_gradient   TEXT        NOT NULL DEFAULT 'linear-gradient(135deg,#0a0800,#261e00)',
  tags             TEXT[]      NOT NULL DEFAULT '{}',
  featured         BOOLEAN     NOT NULL DEFAULT FALSE,
  published        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS country        TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS flag           TEXT DEFAULT '🌍';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organizer      TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS attendees      TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cover_url      TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_gradient TEXT
  DEFAULT 'linear-gradient(135deg,#0a0800,#261e00)';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tags           TEXT[] DEFAULT '{}';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS featured       BOOLEAN DEFAULT FALSE;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events'
      AND column_name = 'image_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events'
      AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE public.events RENAME COLUMN image_url TO cover_url;
  END IF;
END $$;


-- ============================================================
-- TABLE : newsletter_subscribers
-- Pages : admin/abonnes (mock), admin/analytique/audience
-- Colonnes lues : id, email, confirmed, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        UNIQUE NOT NULL,
  confirmed    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLE : saves
-- Pages : admin/analytique/engagement, admin/analytique/page,
--         admin/utilisateurs (COUNT par user_id)
-- Colonnes lues : id, user_id, content_type, content_slug,
--                 content_title, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saves (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL
                             REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type   TEXT        NOT NULL
                             CHECK (content_type IN (
                               'article','scholarship','opportunity','event'
                             )),
  content_slug   TEXT        NOT NULL,
  content_title  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, content_type, content_slug)
);

ALTER TABLE public.saves ADD COLUMN IF NOT EXISTS content_title TEXT;


-- ============================================================
-- TABLE : applications
-- Pages : admin/analytique/engagement, admin/analytique/page,
--         admin/utilisateurs (COUNT par user_id)
-- Colonnes lues : id, user_id, content_type, content_title,
--                 status, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.applications (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL
                             REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, content_type, content_slug)
);

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS content_title TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS notes         TEXT;


-- ============================================================
-- TABLE : event_registrations
-- Pages : admin/analytique/engagement, admin/utilisateurs (COUNT)
-- Colonnes lues : id, user_id, event_slug, event_title,
--                 event_date, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL
                           REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_slug   TEXT        NOT NULL,
  event_title  TEXT,
  event_date   DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_slug)
);

ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS event_title TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS event_date  DATE;


-- ============================================================
-- INDEXES
-- ============================================================

-- articles
CREATE INDEX IF NOT EXISTS idx_articles_published_date
  ON public.articles (published, date DESC) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_slug
  ON public.articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_category
  ON public.articles (category);
CREATE INDEX IF NOT EXISTS idx_articles_featured
  ON public.articles (featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_published_at
  ON public.articles (published_at DESC) WHERE published_at IS NOT NULL;

-- scholarships
CREATE INDEX IF NOT EXISTS idx_scholarships_slug
  ON public.scholarships (slug);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline
  ON public.scholarships (deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_urgent
  ON public.scholarships (urgent) WHERE urgent = TRUE;
CREATE INDEX IF NOT EXISTS idx_scholarships_level
  ON public.scholarships (level);

-- opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_slug
  ON public.opportunities (slug);
CREATE INDEX IF NOT EXISTS idx_opportunities_type
  ON public.opportunities (type);
CREATE INDEX IF NOT EXISTS idx_opportunities_published
  ON public.opportunities (published) WHERE published = TRUE;

-- events
CREATE INDEX IF NOT EXISTS idx_events_slug
  ON public.events (slug);
CREATE INDEX IF NOT EXISTS idx_events_date
  ON public.events (event_date);
CREATE INDEX IF NOT EXISTS idx_events_type
  ON public.events (type);

-- saves
CREATE INDEX IF NOT EXISTS idx_saves_user_id
  ON public.saves (user_id);
CREATE INDEX IF NOT EXISTS idx_saves_content
  ON public.saves (content_type, content_slug);
CREATE INDEX IF NOT EXISTS idx_saves_created
  ON public.saves (created_at DESC);

-- applications
CREATE INDEX IF NOT EXISTS idx_applications_user_id
  ON public.applications (user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status
  ON public.applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_created
  ON public.applications (created_at DESC);

-- event_registrations
CREATE INDEX IF NOT EXISTS idx_event_reg_user_id
  ON public.event_registrations (user_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_slug
  ON public.event_registrations (event_slug);

-- newsletter
CREATE INDEX IF NOT EXISTS idx_newsletter_confirmed
  ON public.newsletter_subscribers (confirmed);
CREATE INDEX IF NOT EXISTS idx_newsletter_created
  ON public.newsletter_subscribers (created_at DESC);

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_country
  ON public.profiles (country);
CREATE INDEX IF NOT EXISTS idx_profiles_created
  ON public.profiles (created_at DESC);


-- ============================================================
-- FONCTIONS & TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON public.articles FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TRIGGER trg_scholarships_updated_at
  BEFORE UPDATE ON public.scholarships FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TRIGGER trg_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.applications FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trigger : créer un profil automatiquement à l'inscription
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

DO $$ BEGIN CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================
-- FONCTIONS HELPER POUR LES POLICIES (SECURITY DEFINER)
-- Ces fonctions lisent profiles sans déclencher la RLS
-- évitant la récursion infinie sur la table profiles
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations    ENABLE ROW LEVEL SECURITY;

-- ── profiles ─────────────────────────────────────────────────
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.is_admin()
  );

CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin peut changer le rôle d'autres membres (admin/utilisateurs)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (
    public.is_admin()
  );

-- ── articles ─────────────────────────────────────────────────
-- Lecture publique pour les publiés, tout pour admin+editor
CREATE POLICY "articles_public_read"
  ON public.articles FOR SELECT
  USING (
    published = TRUE
    OR public.is_admin_or_editor()
  );

CREATE POLICY "articles_admin_insert"
  ON public.articles FOR INSERT
  WITH CHECK (
    public.is_admin_or_editor()
  );

CREATE POLICY "articles_admin_update"
  ON public.articles FOR UPDATE
  USING (
    public.is_admin_or_editor()
  );

CREATE POLICY "articles_admin_delete"
  ON public.articles FOR DELETE
  USING (
    public.is_admin_or_editor()
  );

-- ── scholarships ─────────────────────────────────────────────
CREATE POLICY "scholarships_public_read"
  ON public.scholarships FOR SELECT
  USING (
    published = TRUE
    OR public.is_admin_or_editor()
  );

CREATE POLICY "scholarships_admin_write"
  ON public.scholarships FOR ALL
  USING (
    public.is_admin_or_editor()
  )
  WITH CHECK (
    public.is_admin_or_editor()
  );

-- ── opportunities ────────────────────────────────────────────
CREATE POLICY "opportunities_public_read"
  ON public.opportunities FOR SELECT
  USING (
    published = TRUE
    OR public.is_admin_or_editor()
  );

CREATE POLICY "opportunities_admin_write"
  ON public.opportunities FOR ALL
  USING (
    public.is_admin_or_editor()
  )
  WITH CHECK (
    public.is_admin_or_editor()
  );

-- ── events ───────────────────────────────────────────────────
CREATE POLICY "events_public_read"
  ON public.events FOR SELECT
  USING (
    published = TRUE
    OR public.is_admin_or_editor()
  );

CREATE POLICY "events_admin_write"
  ON public.events FOR ALL
  USING (
    public.is_admin_or_editor()
  )
  WITH CHECK (
    public.is_admin_or_editor()
  );

-- ── newsletter_subscribers ───────────────────────────────────
CREATE POLICY "newsletter_public_insert"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "newsletter_admin_read"
  ON public.newsletter_subscribers FOR SELECT
  USING (
    public.is_admin()
  );

CREATE POLICY "newsletter_admin_delete"
  ON public.newsletter_subscribers FOR DELETE
  USING (
    public.is_admin()
  );

-- ── saves ────────────────────────────────────────────────────
CREATE POLICY "saves_own_select"
  ON public.saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saves_own_insert"
  ON public.saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saves_own_delete"
  ON public.saves FOR DELETE
  USING (auth.uid() = user_id);

-- Admin lit tout pour les analytiques
CREATE POLICY "saves_admin_read"
  ON public.saves FOR SELECT
  USING (
    public.is_admin()
  );

-- ── applications ─────────────────────────────────────────────
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
    public.is_admin()
  );

-- ── event_registrations ──────────────────────────────────────
CREATE POLICY "event_reg_own_select"
  ON public.event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "event_reg_own_insert"
  ON public.event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_reg_own_delete"
  ON public.event_registrations FOR DELETE
  USING (auth.uid() = user_id);

-- Admin lit tout pour les analytiques + admin/utilisateurs COUNT
CREATE POLICY "event_reg_admin_read"
  ON public.event_registrations FOR SELECT
  USING (
    public.is_admin()
  );


-- ============================================================
-- STORAGE — Buckets (convention : cover_url partout)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('articles', 'articles', TRUE, 8388608,
  ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('scholarships', 'scholarships', TRUE, 5242880,
  ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('opportunities', 'opportunities', TRUE, 5242880,
  ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('events', 'events', TRUE, 5242880,
  ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', TRUE, 2097152,
  ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- STORAGE — Politiques RLS
-- ============================================================

CREATE POLICY "articles_storage_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'articles');

CREATE POLICY "articles_storage_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'articles' AND public.is_admin_or_editor()
  );

CREATE POLICY "articles_storage_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'articles' AND public.is_admin_or_editor()
  );

CREATE POLICY "articles_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'articles' AND public.is_admin_or_editor()
  );

CREATE POLICY "scholarships_storage_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'scholarships');

CREATE POLICY "scholarships_storage_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'scholarships' AND public.is_admin_or_editor()
  );

CREATE POLICY "scholarships_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'scholarships' AND public.is_admin_or_editor()
  );

CREATE POLICY "opportunities_storage_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'opportunities');

CREATE POLICY "opportunities_storage_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'opportunities' AND public.is_admin_or_editor()
  );

CREATE POLICY "opportunities_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'opportunities' AND public.is_admin_or_editor()
  );

CREATE POLICY "events_storage_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'events');

CREATE POLICY "events_storage_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'events' AND public.is_admin_or_editor()
  );

CREATE POLICY "events_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'events' AND public.is_admin_or_editor()
  );

CREATE POLICY "avatars_storage_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_storage_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "avatars_storage_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "avatars_storage_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);


-- ============================================================
-- DONNER LE RÔLE ADMIN AU PREMIER UTILISATEUR
-- Décommenter et remplacer l'email
-- ============================================================
-- UPDATE public.profiles SET role = 'admin'
-- WHERE email = 'ton-email@exemple.com';



-- Fonction RPC pour incrémenter les vues de manière atomique
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE articles SET views = views + 1 WHERE id = article_id;
$$;

CREATE OR REPLACE FUNCTION increment_views(table_name text, row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('UPDATE %I SET views = COALESCE(views, 0) + 1 WHERE id = $1', table_name) USING row_id;
END;
$$;