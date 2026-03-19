"use client";

/**
 * components/ui/Badge.tsx
 * Badges réutilisables — statuts, catégories, types
 */

import {
  CATEGORY_COLORS,
  SCHOLARSHIP_LEVEL_COLORS,
  OPPORTUNITY_TYPE_COLORS,
  EVENT_TYPE_COLORS,
} from "@/lib/utils";

interface BadgeProps {
  label:   string;
  color?:  string;
  bg?:     string;
  dot?:    boolean;
  size?:   "sm" | "md" | "lg";
  pulse?:  boolean;
  style?:  React.CSSProperties;
}

const SIZE_MAP = {
  sm: { fontSize: "0.55rem", padding: "0.18rem 0.55rem", dotSize: 4 },
  md: { fontSize: "0.62rem", padding: "0.22rem 0.7rem",  dotSize: 5 },
  lg: { fontSize: "0.72rem", padding: "0.28rem 0.9rem",  dotSize: 6 },
};

/* ── Badge générique ── */
export function Badge({
  label, color = "#928E80", bg = "#F0EDE4",
  dot = false, size = "md", pulse = false, style,
}: BadgeProps) {
  const s = SIZE_MAP[size];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      fontSize: s.fontSize, fontWeight: 800,
      letterSpacing: "0.08em", textTransform: "uppercase" as const,
      padding: s.padding, borderRadius: 100,
      background: bg, color,
      whiteSpace: "nowrap" as const,
      flexShrink: 0,
      ...style,
    }}>
      {dot && (
        <span style={{
          width: s.dotSize, height: s.dotSize,
          borderRadius: "50%", background: color, flexShrink: 0,
          animation: pulse ? "badge-pulse 1.4s ease-in-out infinite" : "none",
        }} />
      )}
      {label}
      <style>{`
        @keyframes badge-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.6)} }
      `}</style>
    </span>
  );
}

/* ── Badges spécialisés ── */

export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <Badge
      label={published ? "Publié" : "Brouillon"}
      color={published ? "#1A5C40" : "#928E80"}
      bg={published ? "#EAF4EF" : "#F0EDE4"}
      dot
    />
  );
}

export function UrgentBadge({ urgent }: { urgent: boolean }) {
  if (!urgent) return null;
  return (
    <Badge
      label="Urgent"
      color="#B8341E"
      bg="#FAEBE8"
      dot
      pulse
    />
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const c = CATEGORY_COLORS[category] ?? { color: "#928E80", bg: "#F0EDE4" };
  return <Badge label={category} color={c.color} bg={c.bg} />;
}

export function ScholarshipLevelBadge({ level }: { level: string }) {
  const c = SCHOLARSHIP_LEVEL_COLORS[level] ?? { color: "#928E80", bg: "#F0EDE4" };
  return <Badge label={level} color={c.color} bg={c.bg} />;
}

export function OpportunityTypeBadge({ type }: { type: string }) {
  const c = OPPORTUNITY_TYPE_COLORS[type] ?? { color: "#928E80", bg: "#F0EDE4" };
  return <Badge label={type} color={c.color} bg={c.bg} />;
}

export function EventTypeBadge({ type }: { type: string }) {
  const c = EVENT_TYPE_COLORS[type] ?? { color: "#928E80", bg: "#F0EDE4" };
  return <Badge label={type} color={c.color} bg={c.bg} />;
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    admin:  { color: "#C08435", bg: "#FBF4E8", label: "Admin" },
    editor: { color: "#1E4DA8", bg: "#EBF0FB", label: "Éditeur" },
    reader: { color: "#928E80", bg: "#F0EDE4", label: "Lecteur" },
  };
  const c = map[role] ?? { color: "#928E80", bg: "#F0EDE4", label: role };
  return <Badge label={c.label} color={c.color} bg={c.bg} dot />;
}

/* ── Badge de statut de candidature ── */
export function ApplicationStatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    interested:  { color: "#928E80", bg: "#F0EDE4", label: "Intéressé" },
    in_progress: { color: "#1E4DA8", bg: "#EBF0FB", label: "En cours" },
    submitted:   { color: "#C08435", bg: "#FBF4E8", label: "Soumis" },
    interview:   { color: "#7A1E4A", bg: "#F9EBF3", label: "Entretien" },
    accepted:    { color: "#1A5C40", bg: "#EAF4EF", label: "Accepté" },
    rejected:    { color: "#B8341E", bg: "#FAEBE8", label: "Refusé" },
    withdrawn:   { color: "#928E80", bg: "#F0EDE4", label: "Retiré" },
  };
  const c = map[status] ?? { color: "#928E80", bg: "#F0EDE4", label: status };
  return <Badge label={c.label} color={c.color} bg={c.bg} dot />;
}