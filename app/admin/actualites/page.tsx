"use client";

/**
 * app/admin/actualites/page.tsx
 * Listing admin des actualités — design harmonisé avec événements/bourses
 * Fonctionnalités : recherche, filtre catégorie/statut, tri, actions groupées,
 * export CSV, suppression avec mot de passe, toggle featured
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Article, Category } from "@/types/database";

/* ── Types ── */
type SortField = "published_at" | "title" | "views" | "saves_count" | "created_at";
type SortDir = "asc" | "desc";
type FilterStatus = "all" | "published" | "draft" | "featured";

interface Stats {
  total: number;
  published: number;
  draft: number;
  featured: number;
  views: number;
}

const CATEGORIES: Category[] = [
  "Politique", "Économie", "Tech", "Sport", "Culture", "Santé", "Environnement",
];
const CAT_COLOR: Record<string, string> = {
  Politique: "#5A7FD4",
  Économie: "#C08435",
  Tech: "#4A9E6F",
  Sport: "#C25B3F",
  Culture: "#9B6B3A",
  Santé: "#4A9E9E",
  Environnement: "#5A8F5A",
};

/* ── Icônes (identiques à événements) ── */
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
const IcoStar = ({ filled }: { filled: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
      Publié
    </span>
  );
}

function CategoryPill({ category }: { category: Category }) {
  const color = CAT_COLOR[category] ?? "#928E80";
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
      {category}
    </span>
  );
}

/* ── Modale de confirmation par mot de passe (identique utilisateurs) ── */
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
    <div className="aa-modal-overlay" onClick={onClose}>
      <div className="aa-pwd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="aa-modal-header">
          <div className="aa-modal-title">{title}</div>
          <button className="aa-modal-close" onClick={onClose}>
            <IcoClose />
          </button>
        </div>
        <p className="aa-modal-desc">{message}</p>
        <div className="aa-pwd-field">
          <label>Mot de passe administrateur</label>
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
          <div className="aa-pwd-input-wrapper">
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
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="aa-pwd-toggle">
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {error && <div className="aa-pwd-error">{error}</div>}
        </div>
        <div className="aa-modal-actions">
          <button className="aa-btn aa-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button className="aa-btn aa-btn-danger" onClick={handleConfirm} disabled={loading}>
            {loading ? "Vérification..." : actionLabel}
          </button>
        </div>
      </div>
      <style jsx>{`
        .aa-pwd-modal {
          background: #fff;
          border-radius: 24px;
          padding: 2rem;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 24px 64px rgba(20, 20, 16, 0.18);
        }
        .aa-modal-desc {
          font-size: 0.82rem;
          color: #928e80;
          line-height: 1.65;
          margin-bottom: 1.5rem;
        }
        .aa-pwd-field label {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #928e80;
          display: block;
          margin-bottom: 0.45rem;
        }
        .aa-pwd-input-wrapper {
          position: relative;
        }
        .aa-pwd-input-wrapper input {
          width: 100%;
          padding: 0.7rem 3rem 0.7rem 1rem;
          border-radius: 12px;
          font-size: 0.88rem;
          border: 1.5px solid rgba(20, 20, 16, 0.14);
          background: #f8f6f1;
          outline: none;
        }
        .aa-pwd-toggle {
          position: absolute;
          right: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #928e80;
        }
        .aa-pwd-error {
          margin-top: 0.45rem;
          font-size: 0.72rem;
          color: #b8341e;
        }
        .aa-modal-actions {
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

export default function AdminActualitesPage() {
  const sb = createClient();
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    draft: 0,
    featured: 0,
    views: 0,
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [sort, setSort] = useState<SortField>("published_at");
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

  /* ── Stats ── */
  const loadStats = useCallback(async () => {
    const [{ count: tot }, { count: pub }, { data: featData }, viewsRes] = await Promise.all([
      sb.from("articles").select("id", { count: "exact", head: true }),
      sb.from("articles").select("id", { count: "exact", head: true }).eq("published", true),
      sb.from("articles").select("id").eq("featured", true),
      sb.from("articles").select("views"),
    ]);
    const totalViews = (viewsRes.data ?? []).reduce((s: number, a: any) => s + (a.views || 0), 0);
    setStats({
      total: tot ?? 0,
      published: pub ?? 0,
      draft: (tot ?? 0) - (pub ?? 0),
      featured: featData?.length ?? 0,
      views: totalViews,
    });
  }, []);

  /* ── Chargement des articles ── */
  const loadArticles = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());

    let query = sb
      .from("articles")
      .select(
        "id,slug,title,excerpt,category,author_name,reading_time,published_at,published,featured,image_gradient,cover_url,tags,views,saves_count,created_at,updated_at",
        { count: "exact" }
      )
      .order(sort, { ascending: dir === "asc" })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (category) {
      query = query.eq("category", category);
    }
    if (status === "published") {
      query = query.eq("published", true);
    } else if (status === "draft") {
      query = query.eq("published", false);
    } else if (status === "featured") {
      query = query.eq("featured", true);
    }

    const { data, count, error } = await query;
    if (!error) {
      setArticles(data as Article[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, search, category, status, sort, dir]);

  useEffect(() => {
    loadArticles();
    loadStats();
  }, [loadArticles, loadStats]);

  const refresh = () => {
    loadArticles();
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
    const { error } = await sb.from("articles").delete().in("id", ids);
    if (error) throw error;
    setArticles((prev) => prev.filter((a) => !ids.includes(a.id)));
    setTotal((t) => t - ids.length);
    setSelected(new Set());
    loadStats();
    showToast(`${ids.length} article${ids.length > 1 ? "s" : ""} supprimé${ids.length > 1 ? "s" : ""}`);
  };

  const deleteSingle = (id: string) => {
    setPwdModal({ action: "delete", ids: [id] });
  };

  const deleteBulk = () => {
    if (selected.size === 0) return;
    setPwdModal({ action: "bulkDelete", ids: Array.from(selected) });
  };

  /* ── Toggle featured (vedette) ── */
  const toggleFeatured = async (id: string, current: boolean) => {
    setToggling(id);
    try {
      const { error } = await (sb.from("articles") as any).update({ featured: !current }).eq("id", id);
      if (!error) {
        setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, featured: !current } : a)));
        loadStats();
        showToast(current ? "Retiré de la une" : "Mis à la une");
      }
    } finally {
      setToggling(null);
    }
  };

  /* ── Actions groupées (publish, unpublish) ── */
  const bulkPublish = async (ids: string[], publish: boolean) => {
    await (sb.from("articles") as any).update({ published: publish }).in("id", ids);
    setArticles((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, published: publish } : a)));
    setSelected(new Set());
    loadStats();
    showToast(`${ids.length} article${ids.length > 1 ? "s" : ""} ${publish ? "publiés" : "dépubliés"}`);
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const rows = [
      ["Titre", "Catégorie", "Auteur", "Statut", "Vues", "Saves", "Date de publication"].join(","),
      ...articles.map((a) =>
        [
          `"${a.title}"`,
          a.category,
          a.author_name,
          a.published ? "Publié" : "Brouillon",
          a.views,
          a.saves_count,
          a.published_at ? new Date(a.published_at).toLocaleDateString("fr-FR") : "",
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "actualites.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Tri ── */
  const toggleSort = (field: SortField) => {
    if (sort === field) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setDir("desc");
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
    if (selected.size === articles.length) setSelected(new Set());
    else setSelected(new Set(articles.map((a) => a.id)));
  };

  /* ── Formats ── */
  const fmtDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };
  const fmtNum = (n: number) => n?.toLocaleString("fr-FR") || "0";

  return (
    <>
      <style>{`
        .aa-wrap { max-width: 1380px; margin: 0 auto; padding: 0 clamp(1rem,3vw,2.5rem); }
        .aa-btn {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .55rem 1.1rem; border-radius: 10px; border: none; cursor: pointer;
          font-size: .72rem; font-weight: 700; letter-spacing: .04em; transition: all .18s;
        }
        .aa-btn:disabled { opacity: .5; cursor: not-allowed; }
        .aa-btn-primary { background: #141410; color: #F8F6F1; }
        .aa-btn-primary:hover:not(:disabled) { background: #2a2a20; }
        .aa-btn-ghost {
          background: transparent; color: #928E80;
          border: 1px solid rgba(20,20,16,.12);
        }
        .aa-btn-ghost:hover:not(:disabled) { background: rgba(20,20,16,.05); color: #38382E; }
        .aa-btn-danger { background: #FAEBE8; color: #B8341E; }
        .aa-btn-danger:hover:not(:disabled) { background: #f5d5cf; }
        .aa-input {
          width: 100%; padding: .6rem .9rem; border-radius: 10px;
          border: 1px solid rgba(20,20,16,.12); background: #fff;
          font-size: .8rem; color: #38382E; outline: none;
          transition: border .18s;
        }
        .aa-input:focus { border-color: #C08435; }
        .aa-select {
          padding: .55rem .85rem; border-radius: 10px;
          border: 1px solid rgba(20,20,16,.12); background: #fff;
          font-size: .75rem; color: #38382E; outline: none; cursor: pointer;
        }
        .aa-select:focus { border-color: #C08435; }
        .aa-table-wrap {
          background: #fff; border-radius: 16px;
          border: 1px solid rgba(20,20,16,.08);
          overflow: hidden; box-shadow: 0 2px 24px rgba(20,20,16,.05);
        }
        .aa-table { width: 100%; border-collapse: collapse; }
        .aa-th {
          padding: .75rem 1rem; text-align: left;
          font-size: .58rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
          color: #928E80; background: #FAFAF8;
          border-bottom: 1px solid rgba(20,20,16,.07);
          white-space: nowrap;
        }
        .aa-td {
          padding: .85rem 1rem; vertical-align: middle;
          border-bottom: 1px solid rgba(20,20,16,.055);
          font-size: .78rem; color: #38382E;
        }
        .aa-row { transition: background .15s; cursor: pointer; }
        .aa-row:hover { background: #FAFAF8; }
        .aa-row:last-child .aa-td { border-bottom: none; }
        .aa-action-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(20,20,16,.1);
          background: transparent; cursor: pointer; transition: all .18s; color: #928E80;
        }
        .aa-action-btn:hover { background: rgba(20,20,16,.06); color: #38382E; }
        .aa-action-btn:disabled { opacity: .4; cursor: not-allowed; }
        .aa-page-btn {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 32px; height: 32px; padding: 0 .4rem; border-radius: 8px;
          border: 1px solid rgba(20,20,16,.12); background: transparent;
          font-size: .72rem; font-weight: 600; color: #38382E; cursor: pointer;
          transition: all .15s;
        }
        .aa-page-btn:hover { background: rgba(20,20,16,.06); }
        .aa-page-btn.active { background: #141410; color: #fff; border-color: #141410; }
        .aa-page-btn:disabled { opacity: .35; cursor: not-allowed; }
        .aa-gradient-thumb {
          width: 48px; height: 48px; border-radius: 10px; flex-shrink: 0;
          overflow: hidden; position: relative;
        }
        .aa-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid rgba(20,20,16,.08); border-top-color: #C08435;
          animation: aa-spin .8s linear infinite; margin: 0 auto 1rem;
        }
        @keyframes aa-spin { to { transform: rotate(360deg); } }
        @keyframes aa-slide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        .aa-bulk-bar {
          background: #141410; border-radius: 12px; padding: .85rem 1.4rem;
          margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;
          box-shadow: 0 4px 16px rgba(20,20,16,.2); animation: aa-slide .2s ease;
        }
        .aa-modal-overlay {
          position: fixed; inset: 0; background: rgba(20,20,16,.6);
          backdrop-filter: blur(4px); z-index: 9900; display: flex;
          align-items: center; justify-content: center; padding: 1rem;
        }
        .aa-modal-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem;
        }
        .aa-modal-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.2rem; font-weight: 900; color: #141410;
        }
        .aa-modal-close {
          background: none; border: none; cursor: pointer; color: #928E80;
        }
        @media (max-width: 900px) {
          .aa-col-hide { display: none; }
          .aa-col-hide-md { display: none; }
        }
        @media (max-width: 600px) {
          .aa-col-hide-sm { display: none; }
        }
      `}</style>

      <div style={{ background: "#F5F3EE", minHeight: "100vh", paddingBottom: "4rem" }}>
        {/* ── En-tête (style événements) ── */}
        <div style={{ background: "#141410", borderBottom: "3px solid #C08435", padding: "2rem 0 1.75rem" }}>
          <div className="aa-wrap">
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
                    Actualités
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
                  Gestion des Actualités
                </h1>
                <p style={{ fontSize: ".75rem", color: "rgba(248,246,241,.4)", marginTop: ".35rem" }}>
                  {stats.total} article{stats.total !== 1 ? "s" : ""} au total
                </p>
              </div>
              <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
                <button
                  className="aa-btn aa-btn-ghost"
                  style={{ color: "rgba(248,246,241,.6)", borderColor: "rgba(248,246,241,.15)" }}
                  onClick={refresh}
                >
                  <IcoRefresh /> Actualiser
                </button>
                <button
                  className="aa-btn aa-btn-ghost"
                  style={{ color: "rgba(248,246,241,.6)", borderColor: "rgba(248,246,241,.15)" }}
                  onClick={exportCSV}
                >
                  <IcoExport /> Exporter CSV
                </button>
                <Link href="/admin/actualites/nouveau">
                  <button className="aa-btn" style={{ background: "#C08435", color: "#fff" }}>
                    <IcoPlus /> Nouvel article
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats cards */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
              {[
                { label: "Total", value: stats.total, color: "#F8F6F1", sub: "articles" },
                { label: "Publiés", value: stats.published, color: "#6FCF97", sub: "en ligne" },
                { label: "Brouillons", value: stats.draft, color: "#928E80", sub: "non publiés" },
                { label: "À la une", value: stats.featured, color: "#C08435", sub: "articles vedettes" },
                { label: "Vues", value: stats.views, color: "#5A7FD4", sub: "impressions" },
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
          <div className="aa-wrap">
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
                  className="aa-input"
                  style={{ paddingLeft: "2.2rem" }}
                  placeholder="Rechercher un article…"
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

              {/* Statut */}
              <select
                className="aa-select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as FilterStatus);
                  setPage(1);
                }}
              >
                <option value="all">Tous statuts</option>
                <option value="published">Publiés</option>
                <option value="draft">Brouillons</option>
                <option value="featured">À la une</option>
              </select>

              {/* Catégorie */}
              <select
                className="aa-select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as Category | "");
                  setPage(1);
                }}
              >
                <option value="">Toutes catégories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {(search || category || status !== "all") && (
                <button
                  className="aa-btn aa-btn-ghost"
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                    setCategory("");
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
        <div className="aa-wrap" style={{ paddingTop: "1.75rem" }}>
          {/* Bulk actions bar */}
          {selected.size > 0 && (
            <div className="aa-bulk-bar">
              <span style={{ fontSize: ".78rem", fontWeight: 700, color: "#C08435" }}>
                {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
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
              <div className="aa-spinner" />
              <p style={{ color: "#928E80", fontSize: ".8rem" }}>Chargement des articles…</p>
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
              <div
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "3rem",
                  color: "rgba(20,20,16,.1)",
                  marginBottom: ".5rem",
                }}
              >
                📰
              </div>
              <p
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "1.4rem",
                  color: "rgba(20,20,16,.2)",
                  fontWeight: 900,
                }}
              >
                Aucun article trouvé
              </p>
              <p style={{ color: "#928E80", fontSize: ".8rem", marginTop: ".4rem" }}>
                {search || category || status !== "all"
                  ? "Essayez de modifier vos filtres de recherche."
                  : "Rédigez votre premier article."}
              </p>
              {!search && !category && status === "all" && (
                <Link href="/admin/actualites/nouveau">
                  <button
                    className="aa-btn"
                    style={{ marginTop: "1.5rem", background: "#C08435", color: "#fff" }}
                  >
                    <IcoPlus /> Rédiger un article
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="aa-table-wrap" style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "1000px" }}>
                <table className="aa-table">
                  <thead>
                    <tr>
                      <th className="aa-th" style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          checked={selected.size > 0 && selected.size === articles.length}
                          ref={(el) => {
                            if (el) el.indeterminate = selected.size > 0 && selected.size < articles.length;
                          }}
                          onChange={toggleAll}
                          style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#C08435" }}
                        />
                      </th>
                      <th className="aa-th">Article</th>
                      <th className="aa-th aa-col-hide">Catégorie</th>
                      <th className="aa-th aa-col-hide">Auteur</th>
                      <th className="aa-th">
                        <div onClick={() => toggleSort("views")} style={{ display: "flex", alignItems: "center", gap: ".35rem", cursor: "pointer" }}>
                          Vues <SortIcon field="views" />
                        </div>
                      </th>
                      <th className="aa-th">
                        <div onClick={() => toggleSort("saves_count")} style={{ display: "flex", alignItems: "center", gap: ".35rem", cursor: "pointer" }}>
                          Saves <SortIcon field="saves_count" />
                        </div>
                      </th>
                      <th className="aa-th">Statut</th>
                      <th className="aa-th">
                        <div onClick={() => toggleSort("published_at")} style={{ display: "flex", alignItems: "center", gap: ".35rem", cursor: "pointer" }}>
                          Publié le <SortIcon field="published_at" />
                        </div>
                      </th>
                      <th className="aa-th" style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article, idx) => {
                      const isSelected = selected.has(article.id);
                      const isTogglingFeatured = toggling === article.id;
                      return (
                        <tr
                          key={article.id}
                          className="aa-row"
                          onClick={() => router.push(`/admin/actualites/${article.id}`)}
                          style={{ background: isSelected ? "rgba(192,132,53,.03)" : "transparent" }}
                        >
                          <td className="aa-td" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              onClick={(e) => toggleSelect(article.id, e as any)}
                              style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#C08435" }}
                            />
                          </td>
                          <td className="aa-td">
                            <div style={{ display: "flex", alignItems: "center", gap: ".85rem" }}>
                              <div className="aa-gradient-thumb" style={{ background: article.image_gradient }}>
                                {article.cover_url ? (
                                  <img
                                    src={article.cover_url}
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
                                    📄
                                  </div>
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
                                    maxWidth: 250,
                                  }}
                                >
                                  {article.title}
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
                                  {article.featured && (
                                    <span
                                      style={{
                                        fontSize: ".52rem",
                                        fontWeight: 800,
                                        letterSpacing: ".08em",
                                        textTransform: "uppercase",
                                        color: "#C08435",
                                        background: "rgba(192,132,53,.1)",
                                        padding: ".12rem .45rem",
                                        borderRadius: 100,
                                      }}
                                    >
                                      Une
                                    </span>
                                  )}
                                  <span>{article.reading_time} min de lecture</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="aa-td aa-col-hide">
                            <CategoryPill category={article.category} />
                          </td>
                          <td
                            className="aa-td aa-col-hide"
                            style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {article.author_name}
                          </td>
                          <td className="aa-td">
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
                              👁 {fmtNum(article.views)}
                            </div>
                          </td>
                          <td className="aa-td">
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
                              🔖 {fmtNum(article.saves_count)}
                            </div>
                          </td>
                          <td className="aa-td">
                            <StatusBadge published={article.published} />
                          </td>
                          <td className="aa-td" style={{ whiteSpace: "nowrap" }}>
                            {fmtDate(article.published_at)}
                          </td>
                          <td className="aa-td" onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: ".4rem", justifyContent: "flex-end" }}>
                              <button
                                className="aa-action-btn"
                                title={article.featured ? "Retirer de la une" : "Mettre à la une"}
                                disabled={isTogglingFeatured}
                                onClick={() => toggleFeatured(article.id, article.featured)}
                                style={{
                                  color: article.featured ? "#C08435" : "#928E80",
                                  background: article.featured ? "rgba(192,132,53,.1)" : "transparent",
                                  borderColor: article.featured ? "rgba(192,132,53,.25)" : "rgba(20,20,16,.1)",
                                }}
                              >
                                <IcoStar filled={article.featured} />
                              </button>
                              <Link
                                href={`/actualites/${article.slug}${!article.published ? "?preview=1" : ""}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <button className="aa-action-btn" title="Prévisualiser">
                                  <IcoEye />
                                </button>
                              </Link>
                              <Link href={`/admin/actualites/${article.id}`}>
                                <button
                                  className="aa-action-btn"
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
                                className="aa-action-btn"
                                title="Supprimer"
                                onClick={() => deleteSingle(article.id)}
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
                Page {page} sur {totalPages} — {total} article{total !== 1 ? "s" : ""}
              </span>
              <div style={{ display: "flex", gap: ".35rem" }}>
                <button className="aa-page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pg: number;
                  if (totalPages <= 7) pg = i + 1;
                  else if (page <= 4) pg = i + 1;
                  else if (page >= totalPages - 3) pg = totalPages - 6 + i;
                  else pg = page - 3 + i;
                  return (
                    <button key={pg} className={`aa-page-btn ${page === pg ? "active" : ""}`} onClick={() => setPage(pg)}>
                      {pg}
                    </button>
                  );
                })}
                {totalPages > 7 && page <= totalPages - 4 && (
                  <>
                    <span style={{ padding: "0 .2rem", color: "#928E80" }}>…</span>
                    <button
                      className={`aa-page-btn ${page === totalPages ? "active" : ""}`}
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button className="aa-page-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
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
            ? "Supprimer cet article ?"
            : `Supprimer ${pwdModal?.ids.length} articles ?`
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
            animation: "aa-toast-slide .25s ease",
          }}
        >
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes aa-toast-slide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </>
  );
}