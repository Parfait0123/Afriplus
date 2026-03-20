// types/blocks.ts
// Type Block unifié — utilisé par l'éditeur admin ET la page publique

export type Block =
  // ─ Texte ────────────────────────────────────────────────
  | { type: "paragraph";  text: string }
  | { type: "heading";    text: string; level?: 2 | 3 }
  | { type: "pullquote";  text: string; author?: string; role?: string }

  // ─ Médias ───────────────────────────────────────────────
  | { type: "image";      url: string; alt: string; caption?: string; credit?: string }
  | { type: "video";      url: string; caption?: string; platform?: "youtube" | "vimeo" | "other" }

  // ─ Données / Listes ─────────────────────────────────────
  | { type: "factbox";    title: string; facts: string[] }
  | {
      type: "checklist";
      title?: string;
      items: { label: string; detail?: string }[]
    }
  | {
      type: "steps";
      title?: string;
      items: { label: string; desc: string }[]
    }
  | {
      type: "benefits";
      items: { icon: string; label: string; value: string; highlight?: boolean }[]
    }
  | {
      type: "compare";
      title?: string;
      columns: { label: string }[];
      rows: { label: string; values: string[] }[]
    }

  // ─ Navigation / Liens ───────────────────────────────────
  | { type: "related";    slug: string; label?: string }
  | { type: "external";   url: string; label: string; description?: string; favicon?: string }
  | { type: "download";   url: string; label: string; size?: string }

  // ─ Mise en avant ────────────────────────────────────────
  | { type: "alert";      message: string; variant?: "info" | "warning" | "tip" }
  | {
      type: "apply";
      label: string;
      url: string;
      deadline?: string;
      note?: string
    }

  // ─ Événement ────────────────────────────────────────────
  | {
      type: "agenda";
      title?: string;
      sessions: { time: string; title: string; speaker?: string }[]
    }
  | {
      type: "speakers";
      title?: string;
      people: { name: string; role: string; org?: string; avatar?: string }[]
    }
  | {
      type: "location";
      label: string;
      address?: string;
      mapUrl?: string
    }

  // ─ Profil (compatibilité types/database.ts) ────────────────
  | {
      type: "profile";
      title?: string;
      traits: { icon: string; label: string; description: string }[]
    }

  // ─ Mise en page ─────────────────────────────────────────
  | { type: "divider" }

export interface ArticleContent {
  intro: string;
  blocks: Block[];
}