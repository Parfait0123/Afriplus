/**
 * lib/utils.ts — Utilitaires transversaux AroMe
 */

/* ══════════════════════════════════════════════════
   CLASSNAMES (cn)
   Combine des classes CSS en filtrant les falsy
══════════════════════════════════════════════════ */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* ══════════════════════════════════════════════════
   SLUGIFY
   "L'Union Africaine signe..." → "lunion-africaine-signe"
══════════════════════════════════════════════════ */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retirer les accents
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ýÿ]/g, "y")
    .replace(/ñ/g, "n")
    .replace(/ç/g, "c")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9\s-]/g, "") // supprimer caractères spéciaux
    .replace(/\s+/g, "-") // espaces → tirets
    .replace(/-+/g, "-") // tirets multiples → un seul
    .replace(/^-+|-+$/g, ""); // supprimer tirets en début/fin
}

/* ══════════════════════════════════════════════════
   FORMAT DATE
   "2026-03-15T10:30:00Z" → "15 Mars 2026"
══════════════════════════════════════════════════ */
const FR_MONTHS = [
  "Janv.",
  "Fév.",
  "Mars",
  "Avr.",
  "Mai",
  "Juin",
  "Juil.",
  "Août",
  "Sep.",
  "Oct.",
  "Nov.",
  "Déc.",
];

const FR_MONTHS_LONG = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function formatDate(
  dateStr: string | Date | null | undefined,
  options: { long?: boolean; withTime?: boolean; relative?: boolean } = {},
): string {
  if (!dateStr) return "—";

  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "—";

  if (options.relative) {
    return formatRelativeDate(date);
  }

  const day = date.getDate();
  const month = options.long
    ? FR_MONTHS_LONG[date.getMonth()]
    : FR_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  if (options.withTime) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year} à ${h}h${m}`;
  }

  return `${day} ${month} ${year}`;
}

export function formatRelativeDate(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days} j`;
  return formatDate(date);
}

/* ══════════════════════════════════════════════════
   FORMAT NUMBER
   1284 → "1 284" | 1234567 → "1 234 567"
══════════════════════════════════════════════════ */
export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("fr-FR");
}

/* ══════════════════════════════════════════════════
   FORMAT FILE SIZE
   2097152 → "2 Mo"
══════════════════════════════════════════════════ */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} Ko`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} Mo`;
  return `${(bytes / 1_073_741_824).toFixed(1)} Go`;
}

/* ══════════════════════════════════════════════════
   TRUNCATE
   "Un très long texte..." → "Un très long..." (30 chars)
══════════════════════════════════════════════════ */
export function truncate(str: string | null | undefined, length = 80): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + "…";
}

/* ══════════════════════════════════════════════════
   DAYS UNTIL
   "31 Mars 2026" → 12 (jours restants)
══════════════════════════════════════════════════ */
const MONTH_MAP: Record<string, number> = {
  jan: 0,
  fév: 1,
  mar: 2,
  avr: 3,
  mai: 4,
  jun: 5,
  juil: 6,
  aoû: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  déc: 11,
  janv: 0,
  fev: 1,
  aou: 7,
};

export function daysUntil(
  deadline: string | Date | null | undefined,
): number | null {
  if (!deadline) return null;

  let date: Date;

  if (deadline instanceof Date) {
    date = deadline;
  } else if (/^\d{4}-\d{2}-\d{2}/.test(deadline)) {
    // Format ISO "2026-03-31"
    date = new Date(deadline);
  } else {
    // Format texte "31 Mars 2026"
    const parts = deadline.toLowerCase().split(" ").filter(Boolean);
    if (parts.length < 3) return null;
    const day = parseInt(parts[0]);
    const month = MONTH_MAP[parts[1].slice(0, 4)];
    const year = parseInt(parts[2]);
    if (isNaN(day) || month === undefined || isNaN(year)) return null;
    date = new Date(year, month, day);
  }

  if (isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

/* ══════════════════════════════════════════════════
   GENERATE UNIQUE SLUG
   Ajoute un suffixe si le slug existe déjà
   (à utiliser côté server avec vérification Supabase)
══════════════════════════════════════════════════ */
export function generateSlug(title: string, suffix?: string | number): string {
  const base = slugify(title);
  if (!suffix) return base;
  return `${base}-${suffix}`;
}

/* ══════════════════════════════════════════════════
   EXPORT CSV
   Convertit un tableau d'objets en chaîne CSV
══════════════════════════════════════════════════ */
export function toCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; label: string }[],
): string {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  return [header, ...rows].join("\n");
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════
   DEBOUNCE
══════════════════════════════════════════════════ */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ══════════════════════════════════════════════════
   IS VALID URL
══════════════════════════════════════════════════ */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/* ══════════════════════════════════════════════════
   GET INITIALS
   "Kofi Mensah" → "KM" | "AroMe" → "AP"
══════════════════════════════════════════════════ */
export function getInitials(
  name: string | null | undefined,
  maxChars = 2,
): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, maxChars).toUpperCase();
  return words
    .slice(0, maxChars)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ══════════════════════════════════════════════════
   COULEURS CATÉGORIES ARTICLES
══════════════════════════════════════════════════ */
export const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  Politique: { color: "#1E4DA8", bg: "#EBF0FB" },
  Économie: { color: "#C08435", bg: "#FBF4E8" },
  Tech: { color: "#1A5C40", bg: "#EAF4EF" },
  Sport: { color: "#B8341E", bg: "#FAEBE8" },
  Culture: { color: "#7A4A1E", bg: "#FDF3E8" },
  Santé: { color: "#1A5C5C", bg: "#E6F4F4" },
  Environnement: { color: "#2D6B3B", bg: "#E6F4EA" },
};

export const SCHOLARSHIP_LEVEL_COLORS: Record<
  string,
  { color: string; bg: string }
> = {
  Licence: { color: "#1E4DA8", bg: "#EBF0FB" },
  Master: { color: "#1A5C40", bg: "#EAF4EF" },
  Doctorat: { color: "#7A4A1E", bg: "#FDF3E8" },
  Postdoc: { color: "#2D6B6B", bg: "#E6F4F4" },
  "Toutes formations": { color: "#C08435", bg: "#FBF4E8" },
};

export const OPPORTUNITY_TYPE_COLORS: Record<
  string,
  { color: string; bg: string }
> = {
  "Emploi CDI": { color: "#1A5C40", bg: "#EAF4EF" },
  Emploi: { color: "#9B6B1A", bg: "#FBF4E8" },
  Stage: { color: "#1E4DA8", bg: "#EBF0FB" },
  Graduate: { color: "#7A1E4A", bg: "#F9EBF3" },
  Freelance: { color: "#B8341E", bg: "#FAEBE8" },
  Volontariat: { color: "#928E80", bg: "#F0EDE4" },
};

export const EVENT_TYPE_COLORS: Record<string, { color: string; bg: string }> =
  {
    Conférence: { color: "#1E4DA8", bg: "#EBF0FB" },
    Forum: { color: "#1A5C40", bg: "#EAF4EF" },
    Hackathon: { color: "#B8341E", bg: "#FAEBE8" },
    Salon: { color: "#9B6B1A", bg: "#FBF4E8" },
    Atelier: { color: "#7A1E4A", bg: "#F9EBF3" },
    Sommet: { color: "#141410", bg: "#F0EDE4" },
  };
