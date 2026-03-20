/**
 * types/supabase-analytics.ts
 * Types pour les requêtes Supabase analytiques
 */

/* Types pour les données brutes de Supabase */
export interface SaveRow {
  created_at: string;
  content_type: string;
  content_slug: string;
  content_title: string | null;
}

export interface SubscriberRow {
  created_at: string;
  confirmed: boolean;
}

export interface ArticleRow {
  category: string;
  published: boolean;
}

export interface BurseRow {
  urgent: boolean;
}

export interface RegistrationRow {
  created_at: string;
}

/* Types pour les réponses Supabase avec count */
export interface SupabaseCountResponse<T> {
  data: T[] | null;
  count: number | null;
  error: any;
}