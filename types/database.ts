// types/database.ts — Types TypeScript pour Supabase (version enrichie)

export type Category =
  | "Politique" | "Économie" | "Tech" | "Sport"
  | "Culture"   | "Santé"    | "Environnement";

export type ScholarshipLevel =
  | "Licence" | "Master" | "Doctorat"
  | "Postdoc" | "Postdoc / Recherche" | "Toutes formations";

export type OpportunityType =
  | "Emploi CDI" | "Stage" | "Graduate"
  | "Emploi"     | "Freelance" | "Volontariat";

export type EventType =
  | "Conférence" | "Forum"  | "Hackathon"
  | "Salon"      | "Atelier"| "Sommet";

export type UserRole    = "admin" | "editor" | "reader";
export type ContentType = "article" | "scholarship" | "opportunity" | "event";
export type AppStatus   = "saved" | "applied" | "interviewing" | "accepted" | "rejected";

/* ══ BLOC SYSTÈME — compatible JSONB ═══════════════════════ */
export type Block =
  | { type: "paragraph";  text: string }
  | { type: "heading";    text: string; level?: 2 | 3 }
  | { type: "image";      url: string; alt: string; caption?: string; credit?: string }
  | { type: "video";      url: string; caption?: string; platform?: "youtube" | "vimeo" | "other" }
  | { type: "pullquote";  text: string; author?: string; role?: string }
  | { type: "factbox";    title: string; facts: string[] }
  | { type: "related";    slug: string; label?: string }
  | { type: "external";   url: string; label: string; description?: string; favicon?: string }
  | { type: "alert";      message: string; variant?: "info" | "warning" | "tip" }
  | { type: "download";   url: string; label: string; size?: string }
  | { type: "divider" }
  | { type: "checklist";  title?: string; items: { label: string; detail?: string }[] }
  | { type: "steps";      title?: string; items: { label: string; desc: string }[] }
  | { type: "benefits";   title?: string; items: { icon: string; label: string; value: string; highlight?: boolean }[] }
  | { type: "profile";    title?: string; traits: { icon: string; label: string; description: string }[] }
  | { type: "compare";    title?: string; columns: { label: string; color?: string }[]; rows: { label: string; values: string[] }[] }
  | { type: "location";   label: string; address?: string; lat?: number; lng?: number; mapUrl?: string }
  | { type: "apply";      label: string; url: string; note?: string; deadline?: string }
  | { type: "agenda";     title?: string; sessions: { time: string; title: string; speaker?: string; tag?: string; highlight?: boolean }[] }
  | { type: "speakers";   title?: string; people: { name: string; role: string; org?: string; avatar?: string; emoji?: string }[] }

export interface ArticleContent {
  intro:  string;
  blocks: Block[];
}

/* ══ TABLES ═════════════════════════════════════════════════ */

export interface Profile {
  id:         string;
  email:      string;
  full_name:  string | null;
  avatar_url: string | null;
  country:    string | null;
  role:       UserRole;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id:             string;
  slug:           string;
  title:          string;
  excerpt:        string | null;
  content:        ArticleContent | null;   // JSONB
  category:       Category;
  author_id:      string | null;
  author_name:    string;
  reading_time:   number;
  featured:       boolean;
  cover_url:      string | null;
  image_gradient: string;
  tags:           string[];
  published:      boolean;
  published_at:   string | null;
  meta_title:     string | null;
  meta_desc:      string | null;
  views:          number;
  saves_count:    number;
  shares_count:   number;
  created_at:     string;
  updated_at:     string;
}

export interface Scholarship {
  id:             string;
  slug:           string;
  title:          string;
  organization:   string;
  country:        string;
  flag:           string;
  level:          ScholarshipLevel;
  domain:         string;
  deadline:       string;
  urgent:         boolean;
  amount:         string | null;
  cover_url:      string | null;
  image_gradient: string;
  tags:           string[];
  apply_url:      string | null;
  content:        { intro: string; blocks: Block[] } | null;
  published:      boolean;
  published_at:   string | null;
  views:          number;
  saves_count:    number;
  created_at:     string;
  updated_at:     string;
}

export interface Opportunity {
  id:               string;
  slug:             string;
  title:            string;
  company:          string;
  company_initials: string;
  location:         string;
  country:          string;
  flag:             string;
  type:             OpportunityType;
  sector:           string | null;
  description:      string | null;
  skills:           string[];
  deadline:         string | null;
  posted_at:        string | null;
  salary:           string | null;
  remote:           boolean;
  featured:         boolean;
  cover_url:        string | null;
  image_gradient:   string;
  apply_url:        string | null;
  content:          { intro: string; blocks: Block[] } | null;
  published:        boolean;
  published_at:     string | null;
  views:            number;
  saves_count:      number;
  created_at:       string;
  updated_at:       string;
}

export interface Event {
  id:             string;
  slug:           string;
  title:          string;
  type:           EventType;
  location:       string;
  country:        string;
  flag:           string;
  event_date:     string;
  excerpt:        string | null;
  organizer:      string | null;
  attendees:      string | null;
  cover_url:      string | null;
  image_gradient: string;
  tags:           string[];
  featured:       boolean;
  event_url:      string | null;
  description:    string | null;
  register_url:   string | null;
  content:        { intro: string; blocks: Block[] } | null;
  published:      boolean;
  published_at:   string | null;
  views:          number;
  saves_count:    number;
  created_at:     string;
  updated_at:     string;
}

export interface NewsletterSubscriber {
  id:         string;
  email:      string;
  confirmed:  boolean;
  created_at: string;
}

export interface Save {
  id:            string;
  user_id:       string;
  content_type:  ContentType;
  content_id:    string;
  content_slug:  string;
  content_title: string | null;
  created_at:    string;
}

export interface Application {
  id:           string;
  user_id:      string;
  content_type: "scholarship" | "opportunity";
  content_id:   string;
  content_slug: string;
  status:       AppStatus;
  notes:        string | null;
  created_at:   string;
  updated_at:   string;
}

export interface EventRegistration {
  id:         string;
  user_id:    string;
  event_id:   string;
  event_slug: string;
  created_at: string;
}

/* ══ DATABASE SCHEMA ════════════════════════════════════════ */
export interface Database {
  public: {
    Tables: {
      profiles:               { Row: Profile;              Insert: Omit<Profile, "created_at"|"updated_at">;             Update: Partial<Omit<Profile,"id">>; };
      articles:               { Row: Article;              Insert: Omit<Article, "id"|"created_at"|"updated_at">;        Update: Partial<Omit<Article,"id">>; };
      scholarships:           { Row: Scholarship;          Insert: Omit<Scholarship,"id"|"created_at"|"updated_at">;     Update: Partial<Omit<Scholarship,"id">>; };
      opportunities:          { Row: Opportunity;          Insert: Omit<Opportunity,"id"|"created_at"|"updated_at">;     Update: Partial<Omit<Opportunity,"id">>; };
      events:                 { Row: Event;                Insert: Omit<Event,"id"|"created_at"|"updated_at">;           Update: Partial<Omit<Event,"id">>; };
      newsletter_subscribers: { Row: NewsletterSubscriber; Insert: Omit<NewsletterSubscriber,"id"|"created_at">;         Update: Partial<Omit<NewsletterSubscriber,"id">>; };
      saves:                  { Row: Save;                 Insert: Omit<Save,"id"|"created_at">;                         Update: never; };
      applications:           { Row: Application;          Insert: Omit<Application,"id"|"created_at"|"updated_at">;     Update: Partial<Omit<Application,"id">>; };
      event_registrations:    { Row: EventRegistration;    Insert: Omit<EventRegistration,"id"|"created_at">;            Update: never; };
    };
  };
}