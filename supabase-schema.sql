-- ═══════════════════════════════════════════════════════════════════
-- AFRIPULSE — Schéma SQL complet
-- Supabase Dashboard → SQL Editor → Run
--
-- Conçu pour l'état RÉEL de la base :
--   • tables déjà créées (profiles, saves, applications, etc.)
--   • role stocké en TEXT (pas enum)
--   • colonnes étendues de profiles manquantes
--   • policies en double sur profiles
--
-- SAFE : IF NOT EXISTS / DROP IF EXISTS partout.
-- Aucune donnée existante ne sera perdue.
-- ═══════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════
-- 1. EXTENSIONS
-- ════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;


-- ════════════════════════════════════════════════════════════════
-- 2. ENUMS
--    Chaque enum est créé seulement s'il n'existe pas.
--    user_role N'EST PAS recréé (la colonne est TEXT dans ta base
--    et on ne la migre pas pour éviter de casser quoi que ce soit).
-- ════════════════════════════════════════════════════════════════

do $$ begin
  create type article_category as enum (
    'Politique','Économie','Tech','Sport','Culture','Santé','Environnement'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type scholarship_level as enum (
    'Licence','Master','Doctorat','Postdoc','Toutes formations'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type opportunity_type as enum (
    'Emploi CDI','Emploi','Stage','Graduate','Freelance','Volontariat'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_type as enum (
    'Conférence','Forum','Hackathon','Salon','Atelier','Sommet'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum (
    'interested','in_progress','submitted',
    'interview','accepted','rejected','withdrawn'
  );
exception when duplicate_object then null; end $$;


-- ════════════════════════════════════════════════════════════════
-- 3. FONCTIONS UTILITAIRES
-- ════════════════════════════════════════════════════════════════

-- Mise à jour automatique de updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Incrémenter les vues d'un article
create or replace function public.increment_article_views(article_slug text)
returns void language plpgsql security definer as $$
begin
  update public.articles
  set views = views + 1
  where slug = article_slug and published = true;
end;
$$;

-- Créer un profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ════════════════════════════════════════════════════════════════
-- 4. TABLE : profiles — colonnes manquantes + trigger
-- ════════════════════════════════════════════════════════════════

-- Colonnes étendues (manquantes dans ta base actuelle)
alter table public.profiles
  add column if not exists country      text,
  add column if not exists city         text,
  add column if not exists bio          text,
  add column if not exists domain       text,
  add column if not exists level        text,
  add column if not exists linkedin_url text,
  add column if not exists website_url  text,
  add column if not exists notify_saves boolean not null default true,
  add column if not exists notify_news  boolean not null default true;

-- S'assurer que updated_at existe (déjà présent dans ta base, sans risque)
alter table public.profiles
  add column if not exists updated_at timestamptz default now();

-- Trigger updated_at
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- Insérer un profil pour les users qui n'en ont pas encore
insert into public.profiles (id, email, full_name)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;


-- ════════════════════════════════════════════════════════════════
-- 5. TABLE : articles
-- ════════════════════════════════════════════════════════════════

create table if not exists public.articles (
  id             uuid        primary key default uuid_generate_v4(),
  slug           text        unique not null,
  title          text        not null,
  excerpt        text,
  content        text,
  category       text        not null default 'Tech',
  author_id      uuid        references public.profiles(id) on delete set null,
  author_name    text        not null default 'Rédaction AroMe',
  date           timestamptz not null default now(),
  read_time      int         not null default 5,
  featured       boolean     not null default false,
  image_url      text,
  image_gradient text        not null default 'linear-gradient(135deg, #0a0800, #1a1400)',
  published      boolean     not null default false,
  views          int         not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists articles_slug_idx      on public.articles(slug);
create index if not exists articles_category_idx  on public.articles(category);
create index if not exists articles_published_idx on public.articles(published);
create index if not exists articles_featured_idx  on public.articles(featured);
create index if not exists articles_date_idx      on public.articles(date desc);
create index if not exists articles_fts_idx on public.articles
  using gin(to_tsvector('french',
    title || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,'')
  ));

drop trigger if exists articles_updated_at on public.articles;
create trigger articles_updated_at
  before update on public.articles
  for each row execute function public.update_updated_at();


-- ════════════════════════════════════════════════════════════════
-- 6. TABLE : scholarships
-- ════════════════════════════════════════════════════════════════

create table if not exists public.scholarships (
  id             uuid    primary key default uuid_generate_v4(),
  slug           text    unique not null,
  title          text    not null,
  organization   text    not null,
  country        text    not null,
  flag           text    not null default '🌍',
  level          text    not null default 'Master',
  domain         text    not null default 'Toutes disciplines',
  deadline       date    not null,
  urgent         boolean not null default false,
  amount         text,
  image_url      text,
  apply_url      text,
  image_gradient text    not null default 'linear-gradient(135deg, #0a0800, #1a1400)',
  tags           text[]  not null default '{}',
  apply_url      text,
  published      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists scholarships_slug_idx      on public.scholarships(slug);
create index if not exists scholarships_level_idx     on public.scholarships(level);
create index if not exists scholarships_deadline_idx  on public.scholarships(deadline asc);
create index if not exists scholarships_urgent_idx    on public.scholarships(urgent);
create index if not exists scholarships_published_idx on public.scholarships(published);
create index if not exists scholarships_fts_idx on public.scholarships
  using gin(to_tsvector('french', title || ' ' || organization || ' ' || domain));

drop trigger if exists scholarships_updated_at on public.scholarships;
create trigger scholarships_updated_at
  before update on public.scholarships
  for each row execute function public.update_updated_at();


-- ════════════════════════════════════════════════════════════════
-- 7. TABLE : opportunities
-- ════════════════════════════════════════════════════════════════

create table if not exists public.opportunities (
  id               uuid    primary key default uuid_generate_v4(),
  slug             text    unique not null,
  title            text    not null,
  company          text    not null,
  company_initials text    not null default '??',
  location         text    not null,
  type             text    not null default 'Emploi CDI',
  saves_count      int     not null default 0,
  views            int     not null default 0,
  description      text,
  content         text,
  meta_title      text,
  meta_desc       text,
  image_url        text,
  image_gradient   text    not null default 'linear-gradient(135deg, #0a0800, #1a1400)',
  apply_url        text,
  published        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists opportunities_slug_idx      on public.opportunities(slug);
create index if not exists opportunities_type_idx      on public.opportunities(type);
create index if not exists opportunities_published_idx on public.opportunities(published);
create index if not exists opportunities_fts_idx on public.opportunities
  using gin(to_tsvector('french',
    title || ' ' || company || ' ' || coalesce(description,'')
  ));

drop trigger if exists opportunities_updated_at on public.opportunities;
create trigger opportunities_updated_at
  before update on public.opportunities
  for each row execute function public.update_updated_at();


-- ════════════════════════════════════════════════════════════════
-- 8. TABLE : events
-- ════════════════════════════════════════════════════════════════

create table if not exists public.events (
  id           uuid    primary key default uuid_generate_v4(),
  slug         text    unique not null,
  title        text    not null,
  type         text    not null default 'Conférence',
  location     text    not null,
  event_date   date    not null,
  description  text,
  register_url text,
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists events_slug_idx      on public.events(slug);
create index if not exists events_type_idx      on public.events(type);
create index if not exists events_date_idx      on public.events(event_date asc);
create index if not exists events_published_idx on public.events(published);

drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at
  before update on public.events
  for each row execute function public.update_updated_at();


-- ════════════════════════════════════════════════════════════════
-- 9. TABLE : newsletter_subscribers
-- ════════════════════════════════════════════════════════════════

create table if not exists public.newsletter_subscribers (
  id                 uuid primary key default uuid_generate_v4(),
  email              text unique not null,
  confirmed          boolean not null default false,
  confirmation_token text unique default encode(gen_random_bytes(32), 'hex'),
  created_at         timestamptz not null default now()
);

create index if not exists newsletter_email_idx     on public.newsletter_subscribers(email);
create index if not exists newsletter_confirmed_idx on public.newsletter_subscribers(confirmed);


-- ════════════════════════════════════════════════════════════════
-- 10. TABLE : saves
-- ════════════════════════════════════════════════════════════════

create table if not exists public.saves (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  content_type  text not null check (content_type in ('article','scholarship','opportunity','event')),
  content_slug  text not null,
  content_title text,
  content_meta  jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  unique(user_id, content_type, content_slug)
);

create index if not exists saves_user_id_idx on public.saves(user_id);
create index if not exists saves_type_idx    on public.saves(content_type);


-- ════════════════════════════════════════════════════════════════
-- 11. TABLE : applications
-- ════════════════════════════════════════════════════════════════

create table if not exists public.applications (
  id            uuid               primary key default gen_random_uuid(),
  user_id       uuid               not null references auth.users(id) on delete cascade,
  content_type  text               not null check (content_type in ('scholarship','opportunity')),
  content_slug  text               not null,
  content_title text,
  content_meta  jsonb              not null default '{}',
  status        application_status not null default 'interested',
  notes         text,
  deadline      date,
  applied_at    timestamptz,
  created_at    timestamptz        not null default now(),
  updated_at    timestamptz        not null default now(),
  unique(user_id, content_type, content_slug)
);

create index if not exists applications_user_id_idx  on public.applications(user_id);
create index if not exists applications_status_idx   on public.applications(status);
create index if not exists applications_deadline_idx on public.applications(deadline);

drop trigger if exists applications_updated_at on public.applications;
create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.update_updated_at();


-- ════════════════════════════════════════════════════════════════
-- 12. TABLE : event_registrations
-- ════════════════════════════════════════════════════════════════

create table if not exists public.event_registrations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  event_slug     text not null,
  event_title    text,
  event_date     date,
  event_location text,
  created_at     timestamptz not null default now(),
  unique(user_id, event_slug)
);

create index if not exists event_reg_user_id_idx on public.event_registrations(user_id);


-- ════════════════════════════════════════════════════════════════
-- 13. ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════

alter table public.profiles               enable row level security;
alter table public.articles               enable row level security;
alter table public.scholarships           enable row level security;
alter table public.opportunities          enable row level security;
alter table public.events                 enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.saves                  enable row level security;
alter table public.applications           enable row level security;
alter table public.event_registrations    enable row level security;

-- ── profiles ──
-- Supprimer toutes les policies existantes (doublons constatés)
drop policy if exists "profiles_insert"      on public.profiles;
drop policy if exists "profiles_own_insert"  on public.profiles;
drop policy if exists "profiles_own_update"  on public.profiles;
drop policy if exists "profiles_public_read" on public.profiles;
drop policy if exists "profiles_select_own"  on public.profiles;
drop policy if exists "profiles_update_own"  on public.profiles;

-- Recréer proprement : 3 policies claires
create policy "profiles_public_read"
  on public.profiles for select
  using (true);

create policy "profiles_own_update"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_own_insert"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ── articles ──
drop policy if exists "articles_public_read" on public.articles;
drop policy if exists "articles_admin_all"   on public.articles;

create policy "articles_public_read"
  on public.articles for select
  using (published = true);

create policy "articles_admin_all"
  on public.articles for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','editor')
    )
  );

-- ── scholarships ──
drop policy if exists "scholarships_public_read" on public.scholarships;
drop policy if exists "scholarships_admin_all"   on public.scholarships;

create policy "scholarships_public_read"
  on public.scholarships for select
  using (published = true);

create policy "scholarships_admin_all"
  on public.scholarships for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','editor')
    )
  );

-- ── opportunities ──
drop policy if exists "opportunities_public_read" on public.opportunities;
drop policy if exists "opportunities_admin_all"   on public.opportunities;

create policy "opportunities_public_read"
  on public.opportunities for select
  using (published = true);

create policy "opportunities_admin_all"
  on public.opportunities for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','editor')
    )
  );

-- ── events ──
drop policy if exists "events_public_read" on public.events;
drop policy if exists "events_admin_all"   on public.events;

create policy "events_public_read"
  on public.events for select
  using (published = true);

create policy "events_admin_all"
  on public.events for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','editor')
    )
  );

-- ── newsletter ──
drop policy if exists "newsletter_insert"     on public.newsletter_subscribers;
drop policy if exists "newsletter_admin_read" on public.newsletter_subscribers;

create policy "newsletter_insert"
  on public.newsletter_subscribers for insert
  with check (true);

create policy "newsletter_admin_read"
  on public.newsletter_subscribers for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── saves ──
drop policy if exists "saves_own_all"          on public.saves;
drop policy if exists "Users manage their saves" on public.saves;

create policy "saves_own_all"
  on public.saves for all
  using (auth.uid() = user_id);

-- ── applications ──
drop policy if exists "applications_own_all"              on public.applications;
drop policy if exists "Users manage their applications"   on public.applications;

create policy "applications_own_all"
  on public.applications for all
  using (auth.uid() = user_id);

-- ── event_registrations ──
drop policy if exists "event_registrations_own_all"                on public.event_registrations;
drop policy if exists "Users manage their event registrations"     on public.event_registrations;

create policy "event_registrations_own_all"
  on public.event_registrations for all
  using (auth.uid() = user_id);


-- ════════════════════════════════════════════════════════════════
-- 14. STORAGE — bucket avatars
-- ════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true,
  2097152,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_own_insert"  on storage.objects;
drop policy if exists "avatars_own_update"  on storage.objects;

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_own_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_own_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


-- ════════════════════════════════════════════════════════════════
-- 15. ADMIN — promouvoir un utilisateur
-- ════════════════════════════════════════════════════════════════

-- À exécuter manuellement après le script :
-- update public.profiles set role = 'admin' where email = 'ton@email.com';


-- 1. Activer RLS sur la table (si ce n'est pas déjà fait)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 2. Créer une politique pour permettre l'insertion par des utilisateurs non authentifiés (public)
CREATE POLICY "Allow public insert" ON contact_messages
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 3. (Optionnel) Créer une politique pour permettre aux admins de voir/update les messages
CREATE POLICY "Allow authenticated select" ON contact_messages
    FOR SELECT
    TO authenticated
    USING (true);

-- 4. (Optionnel) Créer une politique pour permettre aux admins de mettre à jour le statut "read"
CREATE POLICY "Allow authenticated update" ON contact_messages
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);