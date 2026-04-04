"use client";

/**
 * app/admin/bourses/page.tsx
 * Listing admin des bourses — design aligné sur admin/evenements
 * Confirmation par mot de passe pour les actions critiques (suppression individuelle/bulk)
 * Fonctionnalités : recherche, filtres, tri, actions groupées, export CSV, toggle urgent, etc.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ── Types ── */
type Level = "Licence" | "Master" | "Doctorat" | "Postdoc" | "Toutes formations";
const LEVELS: Level[] = ["Licence", "Master", "Doctorat", "Postdoc", "Toutes formations"];
const LEVEL_COLOR: Record<string, string> = {
  Licence: "#5A7FD4",
  Master: "#1A5C40",
  Doctorat: "#C08435",
  Postdoc: "#7A4A1E",
  "Toutes formations": "#928E80",
};
type SortField = "deadline" | "title" | "created_at" | "organization" | "views" | "saves_count";
type SortDir = "asc" | "desc";
type FilterStatus = "all" | "published" | "draft" | "urgent";

interface ScholarshipRow {
  id: string;
  slug: string;
  title: string;
  organization: string;
  country: string;
  flag: string;
  level: Level;
  domain: string;
  deadline: string;
  urgent: boolean;
  amount: string | null;
  cover_url: string | null;
  image_gradient: string;
  tags: string[];
  published: boolean;
  views: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  published: number;
  draft: number;
  urgent: number;
  totalViews: number;
  totalSaves: number;
}

/* ── Icônes (identiques à celles des événements) ── */
const IcoRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-3.78" />
  </svg>
);
const IcoPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IcoSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IcoEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IcoEye = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcoTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IcoExport = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IcoAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IcoTrending = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const IcoBookmark = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const IcoChevL = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IcoChevR = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IcoChevU = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const IcoChevD = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IcoPwdShow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcoPwdHide = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IcoClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Composants de style ── */
function StatusBadge({ published }: { published: boolean }) {
  if (!published)
    return (
      <span
        style={{
          fontSize: "0.58rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "0.2rem 0.65rem",
          borderRadius: 100,
          background: "#F0EDE4",
          color: "#928E80",
          border: "1px solid rgba(20,20,16,.1)",
        }}
      >
        Brouillon
      </span>
    );
  return (
    <span
      style={{
        fontSize: "0.58rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "0.2rem 0.65rem",
        borderRadius: 100,
        background: "#EAF4EF",
        color: "#1A5C40",
        border: "1px solid rgba(26,92,64,.15)",
      }}
    >
      Publiée
    </span>
  );
}

function LevelPill({ level }: { level: Level }) {
  const color = LEVEL_COLOR[level] ?? "#928E80";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.6rem",
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "0.22rem 0.75rem",
        borderRadius: 100,
        background: `${color}14`,
        color: color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      {level === "Toutes formations" ? "Tout" : level}
    </span>
  );
}

/* ── Modale de confirmation par mot de passe (identique à utilisateurs) ── */
function PasswordConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  actionLabel,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title: string;
  message: string;
  actionLabel: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirm = async () => {
    if (!password) {
      setError("Mot de passe requis");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onConfirm(password);
      setPassword("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bs-modal-overlay" onClick={onClose}>
      <div className="bs-pwd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bs-modal-header">
          <div className="bs-modal-title">{title}</div>
          <button className="bs-modal-close" onClick={onClose}>
            <IcoClose />
          </button>
        </div>
        <p className="bs-modal-desc">{message}</p>
        <div className="bs-pwd-field">
          <label>Mot de passe administrateur</label>
          {/* Champs factices pour éviter l'autocomplétion */}
          <input
            type="email"
            name="fake-email"
            autoComplete="email"
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
          />
          <input
            type="password"
            name="fake-password"
            autoComplete="current-password"
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
          />
          <div className="bs-pwd-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              autoFocus
              autoComplete="new-password"
              name="new-password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="bs-pwd-toggle">
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {error && <div className="bs-pwd-error">{error}</div>}
        </div>
        <div className="bs-modal-actions">
          <button className="bs-btn bs-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button className="bs-btn bs-btn-danger" onClick={handleConfirm} disabled={loading}>
            {loading ? "Vérification..." : actionLabel}
          </button>
        </div>
      </div>
      <style jsx>{`
        .bs-pwd-modal {
          background: #fff;
          border-radius: 24px;
          padding: 2rem;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 24px 64px rgba(20, 20, 16, 0.18);
        }
        .bs-modal-desc {
          font-size: 0.82rem;
          color: #928e80;
          line-height: 1.65;
          margin-bottom: 1.5rem;
        }
        .bs-pwd-field label {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #928e80;
          display: block;
          margin-bottom: 0.45rem;
        }
        .bs-pwd-input-wrapper {
          position: relative;
        }
        .bs-pwd-input-wrapper input {
          width: 100%;
          padding: 0.7rem 3rem 0.7rem 1rem;
          border-radius: 12px;
          font-size: 0.88rem;
          border: 1.5px solid rgba(20, 20, 16, 0.14);
          background: #f8f6f1;
          outline: none;
        }
        .bs-pwd-toggle {
          position: absolute;
          right: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #928e80;
        }
        .bs-pwd-error {
          margin-top: 0.45rem;
          font-size: 0.72rem;
          color: #b8341e;
        }
        .bs-modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
const PAGE_SIZE = 15;

export default function AdminBoursesPage() {
  const sb = createClient();
  const router = useRouter();

  const [items, setItems] = useState<ScholarshipRow[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    draft: 0,
    urgent: 0,
    totalViews: 0,
    totalSaves: 0,
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [level, setLevel] = useState<Level | "">("");
  const [domain, setDomain] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [status, setStatus] = useState<FilterStatus>("all");
  const [sort, setSort] = useState<SortField>("created_at");
  const [dir, setDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  // État pour la modale de mot de passe
  const [pwdModal, setPwdModal] = useState<{
    action: "delete" | "bulkDelete";
    ids: string[];
  } | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Chargement des domaines ── */
  useEffect(() => {
    sb.from("scholarships")
      .select("domain")
      .then(({ data }) => {
        if (data) {
          const unique = [
            ...new Set(data.map((d: any) => (d.domain ? d.domain : "")).filter(Boolean)),
          ];
          setDomains(unique.sort());
        }
      });
  }, []);

  /* ── Stats ── */
  const loadStats = useCallback(async () => {
    const [{ count: tot }, { count: pub }, { count: urg }, viewsRes, savesRes] = await Promise.all([
      sb.from("scholarships").select("id", { count: "exact", head: true }),
      sb.from("scholarships").select("id", { count: "exact", head: true }).eq("published", true),
      sb.from("scholarships").select("id", { count: "exact", head: true }).eq("urgent", true),
      sb.from("scholarships").select("views"),
      sb.from("scholarships").select("saves_count"),
    ]);
    const totalViews = (viewsRes.data ?? []).reduce((s: number, a: any) => s + (a.views || 0), 0);
    const totalSaves = (savesRes.data ?? []).reduce((s: number, a: any) => s + (a.saves_count || 0), 0);
    setStats({
      total: tot ?? 0,
      published: pub ?? 0,
      draft: (tot ?? 0) - (pub ?? 0),
      urgent: urg ?? 0,
      totalViews,
      totalSaves,
    });
  }, []);

  /* ── Chargement des bourses ── */
  const loadItems = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());

    let query = sb
      .from("scholarships")
      .select(
        "id,slug,title,organization,country,flag,level,domain,deadline,urgent,amount,cover_url,image_gradient,tags,published,views,saves_count,created_at,updated_at",
        { count: "exact" }
      )
      .order(sort, { ascending: dir === "asc" })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,organization.ilike.%${search}%`);
    }
    if (level) {
      query = query.eq("level", level);
    }
    if (domain) {
      query = query.eq("domain", domain);
    }
    if (status === "published") {
      query = query.eq("published", true);
    } else if (status === "draft") {
      query = query.eq("published", false);
    } else if (status === "urgent") {
      query = query.eq("urgent", true);
    }

    const { data, count, error } = await query;
    if (error) {
      console.error("Erreur chargement bourses :", error);
      showToast("Erreur de chargement", false);
    } else {
      setItems((data ?? []) as ScholarshipRow[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, search, level, domain, status, sort, dir]);

  useEffect(() => {
    loadItems();
    loadStats();
  }, [loadItems, loadStats]);

  const refresh = () => {
    loadItems();
    loadStats();
  };

  /* ── Vérification mot de passe ── */
  const verifyPassword = async (password: string): Promise<void> => {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) throw new Error("Non authentifié");
    const { error } = await sb.auth.signInWithPassword({ email: user.email!, password });
    if (error) throw new Error("Mot de passe incorrect");
  };

  /* ── Suppression avec mot de passe ── */
  const confirmDelete = async (password: string, ids: string[]) => {
    await verifyPassword(password);
    const { error } = await sb.from("scholarships").delete().in("id", ids);
    if (error) throw error;
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    setTotal((t) => t - ids.length);
    setSelected(new Set());
    showToast(`${ids.length} bourse${ids.length > 1 ? "s" : ""} supprimée${ids.length > 1 ? "s" : ""}`);
    loadStats();
  };

  const deleteSingle = (id: string) => {
    setPwdModal({ action: "delete", ids: [id] });
  };

  const deleteBulk = () => {
    if (selected.size === 0) return;
    setPwdModal({ action: "bulkDelete", ids: Array.from(selected) });
  };

  /* ── Toggle urgent ── */
  const toggleUrgent = async (id: string, cur: boolean) => {
    setToggling(id);
    try {
      const { error } = await (sb.from("scholarships") as any).update({ urgent: !cur }).eq("id", id);
      if (!error) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, urgent: !cur } : i)));
        showToast(cur ? "Urgence retirée" : "Marqué urgent");
        loadStats();
      }
    } finally {
      setToggling(null);
    }
  };

  /* ── Actions groupées (publish, unpublish) ── */
  const bulkPublish = async (ids: string[], publish: boolean) => {
    await (sb.from("scholarships") as any).update({ published: publish }).in("id", ids);
    setItems((prev) => prev.map((i) => (ids.includes(i.id) ? { ...i, published: publish } : i)));
    setSelected(new Set());
    loadStats();
    showToast(`${ids.length} bourse${ids.length > 1 ? "s" : ""} ${publish ? "publiée(s)" : "dépubliée(s)"}`);
  };

  /* ── Export CSV ── */
  const exportCSV = async () => {
    let query = sb
      .from("scholarships")
      .select("title,organization,level,domain,deadline,country,urgent,published,views,saves_count")
      .order(sort, { ascending: dir === "asc" });
    if (search) query = query.or(`title.ilike.%${search}%,organization.ilike.%${search}%`);
    if (level) query = query.eq("level", level);
    if (domain) query = query.eq("domain", domain);
    if (status === "published") query = query.eq("published", true);
    if (status === "draft") query = query.eq("published", false);
    if (status === "urgent") query = query.eq("urgent", true);
    const { data } = await query;
    if (!data) return;
    const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const rows = [
      ["Titre", "Organisation", "Niveau", "Domaine", "Date limite", "Pays", "Urgent", "Statut", "Vues", "Saves"].join(","),
      ...data.map((b: any) =>
        [
          escape(b.title),
          escape(b.organization),
          b.level,
          b.domain || "",
          b.deadline,
          escape(b.country || ""),
          b.urgent ? "Oui" : "Non",
          b.published ? "Publié" : "Brouillon",
          b.views,
          b.saves_count,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bourses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Tri ── */
  const toggleSort = (field: SortField) => {
    if (sort === field) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setDir(field === "deadline" ? "asc" : "desc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort !== field) return <span style={{ opacity: 0.2 }}><IcoChevD /></span>;
    return dir === "asc" ? <IcoChevU /> : <IcoChevD />;
  };

  /* ── Sélection ── */
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  };

  /* ── Formats ── */
  const fmtDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };
  const daysLeft = (deadline: string) => {
    const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (d < 0) return <span style={{ color: "#B8341E", fontWeight: 700, fontSize: ".65rem" }}>Expirée</span>;
    if (d <= 7) return <span style={{ color: "#B8341E", fontWeight: 700, fontSize: ".65rem" }}>{d}j</span>;
    if (d <= 30) return <span style={{ color: "#C08435", fontWeight: 700, fontSize: ".65rem" }}>{d}j</span>;
    return <span style={{ color: "#928E80", fontSize: ".65rem" }}>{d}j</span>;
  };
  const fmtNum = (n: number) => n?.toLocaleString("fr-FR") || "0";

  return (
    <>
      <style>{`
        .bs-wrap { max-width: 1380px; margin: 0 auto; padding: 0 clamp(1rem,3vw,2.5rem); }
        .bs-btn {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .55rem 1.1rem; border-radius: 10px; border: none; cursor: pointer;
          font-size: .72rem; font-weight: 700; letter-spacing: .04em; transition: all .18s;
        }
        .bs-btn:disabled { opacity: .5; cursor: not-allowed; }
        .bs-btn-primary { background: #141410; color: #F8F6F1; }
        .bs-btn-primary:hover:not(:disabled) { background: #2a2a20; }
        .bs-btn-ghost {
          background: transparent; color: #928E80;
          border: 1px solid rgba(20,20,16,.12);
        }
        .bs-btn-ghost:hover:not(:disabled) { background: rgba(20,20,16,.05); color: #38382E; }
        .bs-btn-danger { background: #FAEBE8; color: #B8341E; }
        .bs-btn-danger:hover:not(:disabled) { background: #f5d5cf; }
        .bs-input {
          width: 100%; padding: .6rem .9rem; border-radius: 10px;
          border: 1px solid rgba(20,20,16,.12); background: #fff;
          font-size: .8rem; color: #38382E; outline: none;
          transition: border .18s;
        }
        .bs-input:focus { border-color: #C08435; }
        .bs-select {
          padding: .55rem .85rem; border-radius: 10px;
          border: 1px solid rgba(20,20,16,.12); background: #fff;
          font-size: .75rem; color: #38382E; outline: none; cursor: pointer;
        }
        .bs-select:focus { border-color: #C08435; }
        .bs-table-wrap {
          background: #fff; border-radius: 16px;
          border: 1px solid rgba(20,20,16,.08);
          overflow: hidden; box-shadow: 0 2px 24px rgba(20,20,16,.05);
        }
        .bs-table { width: 100%; border-collapse: collapse; }
        .bs-th {
          padding: .75rem 1rem; text-align: left;
          font-size: .58rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
          color: #928E80; background: #FAFAF8;
          border-bottom: 1px solid rgba(20,20,16,.07);
          white-space: nowrap;
        }
        .bs-td {
          padding: .85rem 1rem; vertical-align: middle;
          border-bottom: 1px solid rgba(20,20,16,.055);
          font-size: .78rem; color: #38382E;
        }
        .bs-row { transition: background .15s; cursor: pointer; }
        .bs-row:hover { background: #FAFAF8; }
        .bs-row:last-child .bs-td { border-bottom: none; }
        .bs-action-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(20,20,16,.1);
          background: transparent; cursor: pointer; transition: all .18s; color: #928E80;
        }
        .bs-action-btn:hover { background: rgba(20,20,16,.06); color: #38382E; }
        .bs-action-btn:disabled { opacity: .4; cursor: not-allowed; }
        .bs-page-btn {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 32px; height: 32px; padding: 0 .4rem; border-radius: 8px;
          border: 1px solid rgba(20,20,16,.12); background: transparent;
          font-size: .72rem; font-weight: 600; color: #38382E; cursor: pointer;
          transition: all .15s;
        }
        .bs-page-btn:hover { background: rgba(20,20,16,.06); }
        .bs-page-btn.active { background: #141410; color: #fff; border-color: #141410; }
        .bs-page-btn:disabled { opacity: .35; cursor: not-allowed; }
        .bs-gradient-thumb {
          width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
          overflow: hidden; position: relative;
        }
        .bs-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid rgba(20,20,16,.08); border-top-color: #C08435;
          animation: bs-spin .8s linear infinite; margin: 0 auto 1rem;
        }
        @keyframes bs-spin { to { transform: rotate(360deg); } }
        @keyframes bs-slide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        .bs-bulk-bar {
          background: #141410; border-radius: 12px; padding: .85rem 1.4rem;
          margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;
          box-shadow: 0 4px 16px rgba(20,20,16,.2); animation: bs-slide .2s ease;
        }
        .bs-modal-overlay {
          position: fixed; inset: 0; background: rgba(20,20,16,.6);
          backdrop-filter: blur(4px); z-index: 9900; display: flex;
          align-items: center; justify-content: center; padding: 1rem;
        }
        .bs-modal-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem;
        }
        .bs-modal-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.2rem; font-weight: 900; color: #141410;
        }
        .bs-modal-close {
          background: none; border: none; cursor: pointer; color: #928E80;
        }
        @media (max-width: 900px) {
          .bs-col-hide { display: none; }
          .bs-col-hide-md { display: none; }
        }
        @media (max-width: 600px) {
          .bs-col-hide-sm { display: none; }
        }
      `}</style>

      <div style={{ background: "#F5F3EE", minHeight: "100vh", paddingBottom: "4rem" }}>
        {/* ── En-tête (style événements) ── */}
        <div style={{ background: "#141410", borderBottom: "3px solid #C08435", padding: "2rem 0 1.75rem" }}>
          <div className="bs-wrap">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: ".5rem" }}>
                  <Link
                    href="/admin"
                    style={{
                      fontSize: ".6rem",
                      fontWeight: 700,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "rgba(248,246,241,.35)",
                      textDecoration: "none",
                      transition: "color .2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(248,246,241,.7)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248,246,241,.35)")}
                  >
                    Admin
                  </Link>
                  <span style={{ color: "rgba(248,246,241,.2)" }}>›</span>
                  <span
                    style={{
                      fontSize: ".6rem",
                      fontWeight: 800,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "#C08435",
                    }}
                  >
                    Bourses
                  </span>
                </div>
                <h1
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: "clamp(1.6rem,3vw,2.4rem)",
                    fontWeight: 900,
                    color: "#F8F6F1",
                    letterSpacing: "-0.03em",
                    margin: 0,
                  }}
                >
                  Gestion des Bourses
                </h1>
                <p style={{ fontSize: ".75rem", color: "rgba(248,246,241,.4)", marginTop: ".35rem" }}>
                  {stats.total} bourse{stats.total !== 1 ? "s" : ""} au total
                </p>
              </div>
              <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
                <button
                  className="bs-btn bs-btn-ghost"
                  style={{ color: "rgba(248,246,241,.6)", borderColor: "rgba(248,246,241,.15)" }}
                  onClick={refresh}
                >
                  <IcoRefresh /> Actualiser
                </button>
                <button
                  className="bs-btn bs-btn-ghost"
                  style={{ color: "rgba(248,246,241,.6)", borderColor: "rgba(248,246,241,.15)" }}
                  onClick={exportCSV}
                >
                  <IcoExport /> Exporter CSV
                </button>
                <Link href="/admin/bourses/nouveau">
                  <button className="bs-btn" style={{ background: "#C08435", color: "#fff" }}>
                    <IcoPlus /> Nouvelle bourse
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats cards */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
              {[
                { label: "Total", value: stats.total, color: "#F8F6F1", sub: "bourses" },
                { label: "Publiées", value: stats.published, color: "#6FCF97", sub: "en ligne" },
                { label: "Brouillons", value: stats.draft, color: "#928E80", sub: "non publiées" },
                { label: "Urgentes", value: stats.urgent, color: "#C08435", sub: "deadline < 7j" },
                { label: "Vues", value: stats.totalViews, color: "#5A7FD4", sub: "impressions" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(248,246,241,.06)",
                    border: "1px solid rgba(248,246,241,.1)",
                    borderRadius: 12,
                    padding: ".75rem 1.25rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      color: s.color,
                      fontFamily: "'Fraunces', Georgia, serif",
                      lineHeight: 1,
                    }}
                  >
                    {fmtNum(s.value)}
                  </div>
                  <div
                    style={{
                      fontSize: ".58rem",
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "rgba(248,246,241,.35)",
                      marginTop: ".2rem",
                    }}
                  >
                    {s.label} · {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filtres (sticky) ── */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid rgba(20,20,16,.07)",
            padding: "1rem 0",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: "0 2px 12px rgba(20,20,16,.05)",
          }}
        >
          <div className="bs-wrap">
            <div style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap" }}>
              {/* Recherche */}
              <div style={{ position: "relative", flex: "1", minWidth: "220px", maxWidth: "380px" }}>
                <span
                  style={{
                    position: "absolute",
                    left: ".8rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#928E80",
                    pointerEvents: "none",
                  }}
                >
                  <IcoSearch />
                </span>
                <input
                  className="bs-input"
                  style={{ paddingLeft: "2.2rem" }}
                  placeholder="Rechercher titre, organisation…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearch(searchInput);
                      setPage(1);
                    }
                  }}
                />
              </div>

              {/* Niveau */}
              <select
                className="bs-select"
                value={level}
                onChange={(e) => {
                  setLevel(e.target.value as Level | "");
                  setPage(1);
                }}
              >
                <option value="">Tous niveaux</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              {/* Domaine */}
              {domains.length > 0 && (
                <select
                  className="bs-select"
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Tous domaines</option>
                  {domains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}

              {/* Statut */}
              <select
                className="bs-select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as FilterStatus);
                  setPage(1);
                }}
              >
                <option value="all">Tous statuts</option>
                <option value="published">Publiées</option>
                <option value="draft">Brouillons</option>
                <option value="urgent">Urgentes</option>
              </select>

              {(search || level || domain || status !== "all") && (
                <button
                  className="bs-btn bs-btn-ghost"
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                    setLevel("");
                    setDomain("");
                    setStatus("all");
                    setPage(1);
                  }}
                >
                  ✕ Réinitialiser
                </button>
              )}

              <div style={{ marginLeft: "auto", fontSize: ".72rem", color: "#928E80", whiteSpace: "nowrap" }}>
                {total} résultat{total !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* ── Corps ── */}
        <div className="bs-wrap" style={{ paddingTop: "1.75rem" }}>
          {/* Bulk actions bar */}
          {selected.size > 0 && (
            <div className="bs-bulk-bar">
              <span style={{ fontSize: ".78rem", fontWeight: 700, color: "#C08435" }}>
                {selected.size} sélectionnée{selected.size > 1 ? "s" : ""}
              </span>
              <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.1)" }} />
              <button
                onClick={() => bulkPublish(Array.from(selected), true)}
                style={{
                  fontFamily: "inherit",
                  fontSize: ".75rem",
                  fontWeight: 600,
                  color: "#4A9E6F",
                  background: "rgba(74,158,111,.12)",
                  border: "none",
                  padding: ".38rem .85rem",
                  borderRadius: 100,
                  cursor: "pointer",
                }}
              >
                Publier tout
              </button>
              <button
                onClick={() => bulkPublish(Array.from(selected), false)}
                style={{
                  fontFamily: "inherit",
                  fontSize: ".75rem",
                  fontWeight: 600,
                  color: "#C08435",
                  background: "rgba(192,132,53,.12)",
                  border: "none",
                  padding: ".38rem .85rem",
                  borderRadius: 100,
                  cursor: "pointer",
                }}
              >
                Dépublier tout
              </button>
              <button
                onClick={deleteBulk}
                style={{
                  fontFamily: "inherit",
                  fontSize: ".75rem",
                  fontWeight: 600,
                  color: "#C25B3F",
                  background: "rgba(194,91,63,.12)",
                  border: "none",
                  padding: ".38rem .85rem",
                  borderRadius: 100,
                  cursor: "pointer",
                }}
              >
                Supprimer
              </button>
              <button
                onClick={() => setSelected(new Set())}
                style={{
                  marginLeft: "auto",
                  fontFamily: "inherit",
                  fontSize: ".72rem",
                  color: "rgba(255,255,255,.4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
            </div>
          )}

          {/* Tableau */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <div className="bs-spinner" />
              <p style={{ color: "#928E80", fontSize: ".8rem" }}>Chargement des bourses…</p>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
              <div
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "3rem",
                  color: "rgba(20,20,16,.1)",
                  marginBottom: ".5rem",
                }}
              >
                🎓
              </div>
              <p
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "1.4rem",
                  color: "rgba(20,20,16,.2)",
                  fontWeight: 900,
                }}
              >
                Aucune bourse trouvée
              </p>
              <p style={{ color: "#928E80", fontSize: ".8rem", marginTop: ".4rem" }}>
                {search || level || domain || status !== "all"
                  ? "Essayez de modifier vos filtres de recherche."
                  : "Créez votre première bourse pour commencer."}
              </p>
              {!search && !level && !domain && status === "all" && (
                <Link href="/admin/bourses/nouveau">
                  <button
                    className="bs-btn"
                    style={{ marginTop: "1.5rem", background: "#C08435", color: "#fff" }}
                  >
                    <IcoPlus /> Créer une bourse
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="bs-table-wrap" style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "1200px" }}>
                <table className="bs-table">
                  <thead>
                    <tr>
                      <th className="bs-th" style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          checked={selected.size > 0 && selected.size === items.length}
                          ref={(el) => {
                            if (el) el.indeterminate = selected.size > 0 && selected.size < items.length;
                          }}
                          onChange={toggleAll}
                          style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#C08435" }}
                        />
                      </th>
                      <th className="bs-th">Bourse</th>
                      <th className="bs-th bs-col-hide">Niveau</th>
                      <th className="bs-th bs-col-hide">Organisation</th>
                      <th className="bs-th bs-col-hide">Domaine</th>
                      <th className="bs-th">
                        <div onClick={() => toggleSort("deadline")} style={{ display: "flex", alignItems: "center", gap: ".35rem", cursor: "pointer" }}>
                          Deadline <SortIcon field="deadline" />
                        </div>
                      </th>
                      <th className="bs-th">
                        <div onClick={() => toggleSort("views")} style={{ display: "flex", alignItems: "center", gap: ".35rem", cursor: "pointer" }}>
                          Vues <SortIcon field="views" />
                        </div>
                      </th>
                      <th className="bs-th">
                        <div onClick={() => toggleSort("saves_count")} style={{ display: "flex", alignItems: "center", gap: ".35rem", cursor: "pointer" }}>
                          Saves <SortIcon field="saves_count" />
                        </div>
                      </th>
                      <th className="bs-th">Statut</th>
                      <th className="bs-th">
                        <div onClick={() => toggleSort("created_at")} style={{ display: "flex", alignItems: "center", gap: ".35rem", cursor: "pointer" }}>
                          Créé <SortIcon field="created_at" />
                        </div>
                      </th>
                      <th className="bs-th" style={{ textAlign: "right" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const isSelected = selected.has(item.id);
                      const isTogglingUrgent = toggling === item.id;
                      return (
                        <tr
                          key={item.id}
                          className="bs-row"
                          onClick={() => router.push(`/admin/bourses/${item.id}`)}
                          style={{ background: isSelected ? "rgba(192,132,53,.03)" : "transparent" }}
                        >
                          <td className="bs-td" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              onClick={(e) => toggleSelect(item.id, e as any)}
                              style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#C08435" }}
                            />
                          </td>
                          <td className="bs-td">
                            <div style={{ display: "flex", alignItems: "center", gap: ".85rem" }}>
                              <div className="bs-gradient-thumb" style={{ background: item.image_gradient }}>
                                {item.cover_url ? (
                                  <img
                                    src={item.cover_url}
                                    alt=""
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      position: "absolute",
                                      inset: 0,
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      position: "absolute",
                                      inset: 0,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "1.2rem",
                                    }}
                                  >
                                    {item.flag}
                                  </div>
                                )}
                                {item.urgent && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: 2,
                                      right: 2,
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      background: "#B8341E",
                                      border: "1.5px solid #fff",
                                      boxShadow: "0 0 4px rgba(184,52,30,.5)",
                                    }}
                                  />
                                )}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    color: "#141410",
                                    fontSize: ".82rem",
                                    lineHeight: 1.35,
                                    marginBottom: ".25rem",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: 220,
                                  }}
                                >
                                  {item.title}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: ".5rem",
                                    fontSize: ".62rem",
                                    color: "#928E80",
                                  }}
                                >
                                  <span>
                                    {item.flag} {item.country}
                                  </span>
                                  {item.amount && (
                                    <>
                                      <span>·</span>
                                      <span>{item.amount}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="bs-td bs-col-hide">
                            <LevelPill level={item.level} />
                          </td>
                          <td
                            className="bs-td bs-col-hide"
                            style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {item.organization}
                          </td>
                          <td
                            className="bs-td bs-col-hide"
                            style={{ maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {item.domain || "—"}
                          </td>
                          <td className="bs-td">
                            <div style={{ display: "flex", flexDirection: "column", gap: ".15rem" }}>
                              <span style={{ fontSize: ".72rem", color: "#38382E", fontWeight: 500 }}>
                                {fmtDate(item.deadline)}
                              </span>
                              {daysLeft(item.deadline)}
                            </div>
                          </td>
                          <td className="bs-td">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".35rem",
                                fontFamily: "'Fraunces', Georgia, serif",
                                fontSize: ".8rem",
                                fontWeight: 700,
                                color: "#5A7FD4",
                              }}
                            >
                              <IcoTrending /> {fmtNum(item.views)}
                            </div>
                          </td>
                          <td className="bs-td">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".35rem",
                                fontFamily: "'Fraunces', Georgia, serif",
                                fontSize: ".8rem",
                                fontWeight: 700,
                                color: "#4A9E6F",
                              }}
                            >
                              <IcoBookmark /> {fmtNum(item.saves_count)}
                            </div>
                          </td>
                          <td className="bs-td">
                            <StatusBadge published={item.published} />
                          </td>
                          <td className="bs-td" style={{ whiteSpace: "nowrap" }}>
                            {fmtDate(item.created_at)}
                          </td>
                          <td className="bs-td" onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: ".4rem", justifyContent: "flex-end" }}>
                              <button
                                className="bs-action-btn"
                                title={item.urgent ? "Retirer urgence" : "Marquer urgent"}
                                disabled={isTogglingUrgent}
                                onClick={() => toggleUrgent(item.id, item.urgent)}
                                style={{
                                  color: item.urgent ? "#B8341E" : "#928E80",
                                  background: item.urgent ? "rgba(184,52,30,.1)" : "transparent",
                                  borderColor: item.urgent ? "rgba(184,52,30,.25)" : "rgba(20,20,16,.1)",
                                }}
                              >
                                <IcoAlert />
                              </button>
                              <Link
                                href={`/bourses/${item.slug}${!item.published ? "?preview=1" : ""}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <button className="bs-action-btn" title="Prévisualiser">
                                  <IcoEye />
                                </button>
                              </Link>
                              <Link href={`/admin/bourses/${item.id}`}>
                                <button
                                  className="bs-action-btn"
                                  title="Modifier"
                                  style={{
                                    color: "#1E4DA8",
                                    borderColor: "rgba(30,77,168,.2)",
                                    background: "rgba(30,77,168,.05)",
                                  }}
                                >
                                  <IcoEdit />
                                </button>
                              </Link>
                              <button
                                className="bs-action-btn"
                                title="Supprimer"
                                onClick={() => deleteSingle(item.id)}
                                style={{
                                  color: "#B8341E",
                                  borderColor: "rgba(184,52,30,.2)",
                                  background: "rgba(184,52,30,.05)",
                                }}
                              >
                                <IcoTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "1.5rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <span style={{ fontSize: ".72rem", color: "#928E80" }}>
                Page {page} sur {totalPages} — {total} bourse{total !== 1 ? "s" : ""}
              </span>
              <div style={{ display: "flex", gap: ".35rem" }}>
                <button className="bs-page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pg: number;
                  if (totalPages <= 7) pg = i + 1;
                  else if (page <= 4) pg = i + 1;
                  else if (page >= totalPages - 3) pg = totalPages - 6 + i;
                  else pg = page - 3 + i;
                  return (
                    <button key={pg} className={`bs-page-btn ${page === pg ? "active" : ""}`} onClick={() => setPage(pg)}>
                      {pg}
                    </button>
                  );
                })}
                {totalPages > 7 && page <= totalPages - 4 && (
                  <>
                    <span style={{ padding: "0 .2rem", color: "#928E80" }}>…</span>
                    <button
                      className={`bs-page-btn ${page === totalPages ? "active" : ""}`}
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button className="bs-page-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modale de confirmation par mot de passe */}
      <PasswordConfirmModal
        isOpen={!!pwdModal}
        onClose={() => setPwdModal(null)}
        onConfirm={async (password) => {
          if (!pwdModal) return;
          await confirmDelete(password, pwdModal.ids);
          setPwdModal(null);
        }}
        title={
          pwdModal?.ids.length === 1
            ? "Supprimer cette bourse ?"
            : `Supprimer ${pwdModal?.ids.length} bourses ?`
        }
        message="Cette action est irréversible. Confirmez votre mot de passe administrateur."
        actionLabel="Supprimer définitivement"
      />

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            background: toast.ok ? "#141410" : "#B8341E",
            color: "#F8F6F1",
            padding: ".85rem 1.4rem",
            borderRadius: 12,
            fontSize: ".82rem",
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(20,20,16,.25)",
            animation: "bs-toast-slide .25s ease",
          }}
        >
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes bs-toast-slide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </>
  );
}