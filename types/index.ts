/**
 * types/index.ts
 * Source unique de vérité pour tous les types du projet AfriPulse.
 * Chemin : types/index.ts  →  importer via @/types
 */

/* ── Rôles ── */
export type UserRole = "admin" | "editor" | "reader";

/* ── Profil utilisateur (table `profiles`) ── */
export type Profile = {
  id:           string;
  full_name:    string | null;
  avatar_url:   string | null;
  role:         UserRole;
  country:      string | null;
  city:         string | null;
  bio:          string | null;
  domain:       string | null;
  level:        string | null;
  linkedin_url: string | null;
  website_url:  string | null;
  notify_saves: boolean;
  notify_news:  boolean;
};

/* ── Type de contenu ── */
export type ContentType = "article" | "scholarship" | "opportunity" | "event";

/* ── Sauvegardes (table `saves`) ── */
export type Save = {
  id:            string;
  user_id:       string;
  content_type:  ContentType;
  content_slug:  string;
  content_title: string | null;
  content_meta:  Record<string, unknown> | null;
  created_at:    string;
};

/* ── Statut de candidature ── */
export type ApplicationStatus =
  | "interested"
  | "in_progress"
  | "submitted"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

/* ── Candidature (table `applications`) ── */
export type Application = {
  id:            string;
  user_id:       string;
  content_type:  "scholarship" | "opportunity";
  content_slug:  string;
  content_title: string | null;
  content_meta:  Record<string, unknown> | null;
  status:        ApplicationStatus;
  notes:         string | null;
  deadline:      string | null;
  created_at:    string;
  updated_at:    string;
};

/* ── Inscription événement (table `event_registrations`) ── */
export type EventRegistration = {
  id:             string;
  user_id:        string;
  event_slug:     string;
  event_title:    string | null;
  event_date:     string | null;
  event_location: string | null;
  created_at:     string;
};

/* ── Onglets du dashboard ── */
export type DashboardTab = "saves" | "applications" | "events" | "profile";

/* ══════════════════════════════════════════════════════
   Constantes UI partagées
══════════════════════════════════════════════════════ */

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  interested:  "Intéressé",
  in_progress: "En cours",
  submitted:   "Soumis",
  interview:   "Entretien",
  accepted:    "Accepté 🎉",
  rejected:    "Refusé",
  withdrawn:   "Retiré",
};

export const STATUS_COLOR: Record<ApplicationStatus, { color: string; bg: string }> = {
  interested:  { color: "#928E80", bg: "#F0EDE4" },
  in_progress: { color: "#1E4DA8", bg: "#EBF0FB" },
  submitted:   { color: "#C08435", bg: "#FBF4E8" },
  interview:   { color: "#7A1E4A", bg: "#F9EBF3" },
  accepted:    { color: "#1A5C40", bg: "#EAF4EF" },
  rejected:    { color: "#B8341E", bg: "#FAEBE8" },
  withdrawn:   { color: "#928E80", bg: "#F0EDE4" },
};

export const CONTENT_PATHS: Record<ContentType, string> = {
  article:     "/actualites",
  scholarship: "/bourses",
  opportunity: "/opportunites",
  event:       "/evenements",
};

export const CONTENT_LABEL: Record<ContentType, string> = {
  article:     "Article",
  scholarship: "Bourse",
  opportunity: "Opportunité",
  event:       "Événement",
};