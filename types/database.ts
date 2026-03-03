// types/database.ts — Types TypeScript pour Supabase

export type Category = "Politique" | "Économie" | "Tech" | "Sport" | "Culture" | "Santé" | "Environnement";
export type ScholarshipLevel = "Licence" | "Master" | "Doctorat" | "Postdoc" | "Toutes formations";
export type OpportunityType = "Emploi CDI" | "Stage" | "Graduate" | "Emploi" | "Freelance" | "Volontariat";
export type EventType = "Conférence" | "Forum" | "Hackathon" | "Salon" | "Atelier" | "Sommet";
export type UserRole = "admin" | "editor" | "reader";

// ─── SUPABASE DB TYPES ────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Article, "id">>;
      };
      scholarships: {
        Row: Scholarship;
        Insert: Omit<Scholarship, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Scholarship, "id">>;
      };
      opportunities: {
        Row: Opportunity;
        Insert: Omit<Opportunity, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Opportunity, "id">>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Event, "id">>;
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Omit<NewsletterSubscriber, "id" | "created_at">;
        Update: Partial<Omit<NewsletterSubscriber, "id">>;
      };
    };
  };
}

export interface Profile {
  id: string; // UUID = auth.users.id
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: Category;
  author_id: string | null;
  author_name: string;
  date: string;
  read_time: number;
  featured: boolean;
  image_url: string | null;
  image_gradient: string;
  published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Scholarship {
  id: string;
  slug: string;
  title: string;
  organization: string;
  country: string;
  flag: string;
  level: ScholarshipLevel;
  domain: string;
  deadline: string;
  urgent: boolean;
  amount: string | null;
  image_url: string | null;
  image_gradient: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  company: string;
  company_initials: string;
  location: string;
  type: OpportunityType;
  description: string | null;
  image_url: string | null;
  image_gradient: string;
  apply_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  location: string;
  event_date: string;
  description: string | null;
  register_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  confirmed: boolean;
  created_at: string;
}
