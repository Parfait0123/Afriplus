"use client";

/**
 * app/admin/actualites/page.tsx
 * Listing admin des actualités — éditorial sombre, Fraunces + DM Sans
 * Données réelles Supabase, filtres, recherche, actions bulk, stats
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Article, Category } from "@/types/database";

/* ── Config ─────────────────────────────────────────────── */
const PAGE_SIZE = 15;
const CATEGORIES: Category[] = [
  "Politique",
  "Économie",
  "Tech",
  "Sport",
  "Culture",
  "Santé",
  "Environnement",
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

/* ── Icônes SVG ─────────────────────────────────────────── */
const IcoSearch = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IcoPlus = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IcoEdit = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IcoEye = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcoTrash = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);
const IcoFilter = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const IcoChevron = ({ d }: { d: "up" | "down" | "left" | "right" }) => {
  const pts = {
    up: "18 15 12 9 6 15",
    down: "6 9 12 15 18 9",
    left: "15 18 9 12 15 6",
    right: "9 18 15 12 9 6",
  };
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points={pts[d]} />
    </svg>
  );
};
const IcoStar = ({ filled }: { filled: boolean }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IcoExport = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

/* ── Types ──────────────────────────────────────────────── */
type SortField =
  | "published_at"
  | "title"
  | "views"
  | "saves_count"
  | "created_at";
type SortDir = "asc" | "desc";
type FilterStatus = "all" | "published" | "draft" | "featured";

interface Stats {
  total: number;
  published: number;
  draft: number;
  featured: number;
  views: number;
}

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
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
  const [searchDraft, setSearchDraft] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [sort, setSort] = useState<SortField>("published_at");
  const [dir, setDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{
    type: "delete" | "bulk-delete" | "bulk-toggle";
    ids: string[];
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  /* ── Toast ── */
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Charger stats ── */
  const loadStats = useCallback(async () => {
    const [{ count: tot }, { count: pub }, { data: featData }, viewsRes] =
      await Promise.all([
        sb.from("articles").select("id", { count: "exact", head: true }),
        sb
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("published", true),
        sb.from("articles").select("id").eq("featured", true),
        sb.from("articles").select("views"),
      ]);
    const totalViews = (viewsRes.data ?? []).reduce(
      (s: number, a: any) => s + (a.views || 0),
      0,
    );
    setStats({
      total: tot ?? 0,
      published: pub ?? 0,
      draft: (tot ?? 0) - (pub ?? 0),
      featured: featData?.length ?? 0,
      views: totalViews,
    });
  }, []);

  /* ── Charger articles ── */
  const load = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());

    let q = sb
      .from("articles")
      .select(
        "id,slug,title,excerpt,category,author_name,reading_time,published_at,published,featured,image_gradient,cover_url,tags,views,saves_count,created_at,updated_at",
        { count: "exact" },
      )
      .order(sort, { ascending: dir === "asc" })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (search) q = q.ilike("title", `%${search}%`);
    if (category) q = q.eq("category", category);
    if (status === "published") q = q.eq("published", true);
    if (status === "draft") q = q.eq("published", false);
    if (status === "featured") q = q.eq("featured", true);

    const { data, count, error } = await q;
    if (!error) {
      setArticles(data as Article[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, search, category, status, sort, dir]);

  useEffect(() => {
    load();
    loadStats();
  }, [load, loadStats]);

  /* ── Tri colonne ── */
  const toggleSort = (f: SortField) => {
    if (sort === f) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(f);
      setDir("desc");
    }
    setPage(1);
  };

  /* ── Sélection ── */
  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () => {
    if (selected.size === articles.length) setSelected(new Set());
    else setSelected(new Set(articles.map((a) => a.id)));
  };

  /* ── Toggle publié ── */
  const togglePublished = async (id: string, current: boolean) => {
    const { error } = await (sb.from("articles") as any)
      .update({ published: !current })
      .eq("id", id);
    if (!error) {
      showToast(current ? "Article dépublié" : "Article publié");
      load();
      loadStats();
    } else showToast("Erreur lors de la mise à jour", false);
  };

  /* ── Toggle vedette ── */
  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await (sb.from("articles") as any)
      .update({ featured: !current })
      .eq("id", id);
    if (!error) {
      showToast(current ? "Retiré de la une" : "Mis à la une");
      load();
      loadStats();
    } else showToast("Erreur", false);
  };

  /* ── Supprimer ── */
  const deleteArticles = async (ids: string[]) => {
    setActionLoading(true);
    const { error } = await (sb.from("articles") as any).delete().in("id", ids);
    setActionLoading(false);
    setConfirm(null);
    if (!error) {
      showToast(
        `${ids.length} article${ids.length > 1 ? "s" : ""} supprimé${ids.length > 1 ? "s" : ""}`,
      );
      load();
      loadStats();
    } else showToast("Erreur lors de la suppression", false);
  };

  /* ── Bulk publish ── */
  const bulkPublish = async (ids: string[], publish: boolean) => {
    setActionLoading(true);
    await (sb.from("articles") as any)
      .update({ published: publish })
      .in("id", ids);
    setActionLoading(false);
    setConfirm(null);
    showToast(
      `${ids.length} article${ids.length > 1 ? "s" : ""} ${publish ? "publiés" : "dépubliés"}`,
    );
    load();
    loadStats();
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const rows = [
      ["Titre", "Catégorie", "Auteur", "Statut", "Vues", "Date"].join(","),
      ...articles.map((a) =>
        [
          `"${a.title}"`,
          a.category,
          a.author_name,
          a.published ? "Publié" : "Brouillon",
          a.views,
          a.published_at
            ? new Date(a.published_at).toLocaleDateString("fr-FR")
            : "",
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "actualites.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Formatters ── */
  const fmt = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const fmtNum = (n: number) => n.toLocaleString("fr-FR");

  /* ── Render sort icon ── */
  const SortIcon = ({ f }: { f: SortField }) =>
    sort === f ? (
      <IcoChevron d={dir === "asc" ? "up" : "down"} />
    ) : (
      <span style={{ opacity: 0.25 }}>
        <IcoChevron d="down" />
      </span>
    );

  /* ─────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        padding: "2.5rem 3rem",
        minHeight: "100vh",
        background: "var(--bg2)",
      }}
    >
      {/* ── Toast ── */}
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
            animation: "slideUp .25s ease",
          }}
        >
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* ── Confirm dialog ── */}
      {confirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,20,16,.55)",
            backdropFilter: "blur(4px)",
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "2rem 2.5rem",
              maxWidth: 440,
              width: "100%",
              margin: "0 1rem",
              boxShadow: "0 24px 64px rgba(20,20,16,.18)",
            }}
          >
            <div
              style={{
                fontFamily: "'Fraunces',Georgia,serif",
                fontSize: "1.25rem",
                fontWeight: 900,
                color: "#141410",
                marginBottom: ".75rem",
              }}
            >
              {confirm.type === "delete" || confirm.type === "bulk-delete"
                ? "Supprimer ?"
                : confirm.type === "bulk-toggle"
                  ? "Modifier le statut ?"
                  : ""}
            </div>
            <p
              style={{
                fontSize: ".85rem",
                color: "#928E80",
                lineHeight: 1.6,
                marginBottom: "1.5rem",
              }}
            >
              {confirm.type === "bulk-delete"
                ? `Cette action supprimera définitivement ${confirm.ids.length} article${confirm.ids.length > 1 ? "s" : ""}. Impossible de récupérer.`
                : confirm.type === "delete"
                  ? "Cet article sera supprimé définitivement."
                  : `${confirm.ids.length} article${confirm.ids.length > 1 ? "s" : ""} seront mis à jour.`}
            </p>
            <div
              style={{
                display: "flex",
                gap: ".75rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setConfirm(null)}
                style={{
                  padding: ".6rem 1.2rem",
                  borderRadius: 100,
                  border: "1.5px solid rgba(20,20,16,.15)",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: ".82rem",
                  fontWeight: 600,
                  color: "#38382E",
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (
                    confirm.type === "delete" ||
                    confirm.type === "bulk-delete"
                  )
                    deleteArticles(confirm.ids);
                }}
                disabled={actionLoading}
                style={{
                  padding: ".6rem 1.4rem",
                  borderRadius: 100,
                  border: "none",
                  background: "#B8341E",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: ".82rem",
                  fontWeight: 700,
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                {actionLoading ? "En cours…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ HEADER ══ */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: ".58rem",
              fontWeight: 700,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "#C08435",
              marginBottom: ".4rem",
            }}
          >
            AfriPulse Admin
          </div>
          <h1
            style={{
              fontFamily: "'Fraunces',Georgia,serif",
              fontSize: "2rem",
              fontWeight: 900,
              letterSpacing: "-.04em",
              color: "#141410",
              margin: 0,
            }}
          >
            Actualités
          </h1>
          <p
            style={{
              fontSize: ".78rem",
              color: "#928E80",
              marginTop: ".25rem",
            }}
          >
            {stats.total.toLocaleString("fr-FR")} articles · {stats.published}{" "}
            publiés · {stats.draft} brouillons
          </p>
        </div>
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          <button
            onClick={exportCSV}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".4rem",
              fontFamily: "'DM Sans',system-ui,sans-serif",
              fontSize: ".78rem",
              fontWeight: 600,
              padding: ".55rem 1.1rem",
              borderRadius: 100,
              cursor: "pointer",
              background: "transparent",
              color: "#38382E",
              border: "1.5px solid rgba(20,20,16,.15)",
              transition: "all .18s",
            }}
          >
            <IcoExport /> Exporter CSV
          </button>
          <Link
            href="/admin/actualites/nouveau"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".45rem",
              fontFamily: "'DM Sans',system-ui,sans-serif",
              fontSize: ".82rem",
              fontWeight: 700,
              padding: ".6rem 1.3rem",
              borderRadius: 100,
              background: "#141410",
              color: "#fff",
              textDecoration: "none",
              transition: "opacity .18s",
            }}
          >
            <IcoPlus /> Nouvel article
          </Link>
        </div>
      </div>

      {/* ══ STATS BAND ══ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        {[
          {
            label: "Total",
            value: stats.total,
            color: "#141410",
            sub: "articles",
          },
          {
            label: "Publiés",
            value: stats.published,
            color: "#1A5C40",
            sub: "en ligne",
          },
          {
            label: "Brouillons",
            value: stats.draft,
            color: "#C08435",
            sub: "en attente",
          },
          {
            label: "À la une",
            value: stats.featured,
            color: "#5A7FD4",
            sub: "articles vedettes",
          },
          {
            label: "Vues totales",
            value: stats.views,
            color: "#7A4A1E",
            sub: "impressions",
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "1.1rem 1.3rem",
              border: "1px solid var(--border)",
              boxShadow: "var(--s1)",
              borderTop: `3px solid ${s.color}`,
            }}
          >
            <div
              style={{
                fontSize: ".58rem",
                fontWeight: 700,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#928E80",
                marginBottom: ".3rem",
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: "'Fraunces',Georgia,serif",
                fontSize: "1.6rem",
                fontWeight: 900,
                color: s.color,
                letterSpacing: "-.04em",
                lineHeight: 1,
              }}
            >
              {fmtNum(s.value)}
            </div>
            <div
              style={{
                fontSize: ".6rem",
                color: "#928E80",
                marginTop: ".2rem",
              }}
            >
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ══ FILTRES ══ */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--border)",
          padding: "1.1rem 1.4rem",
          marginBottom: "1.25rem",
          boxShadow: "var(--s1)",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Recherche */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".5rem",
            background: "#F8F6F1",
            border: "1.5px solid rgba(20,20,16,.09)",
            borderRadius: 100,
            padding: ".42rem .42rem .42rem 1rem",
            flex: "0 0 260px",
          }}
        >
          <span style={{ color: "#928E80", display: "flex", flexShrink: 0 }}>
            <IcoSearch />
          </span>
          <input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(searchDraft);
                setPage(1);
              }
            }}
            placeholder="Rechercher un article…"
            style={{
              border: "none",
              background: "transparent",
              fontFamily: "'DM Sans',system-ui,sans-serif",
              fontSize: ".82rem",
              color: "#141410",
              outline: "none",
              width: "100%",
            }}
          />
          {searchDraft && (
            <button
              onClick={() => {
                setSearchDraft("");
                setSearch("");
                setPage(1);
              }}
              style={{
                background: "rgba(20,20,16,.08)",
                border: "none",
                borderRadius: "50%",
                width: 20,
                height: 20,
                cursor: "pointer",
                fontSize: ".65rem",
                color: "#928E80",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Statut */}
        <div style={{ display: "flex", gap: ".35rem" }}>
          {(
            [
              { key: "all", label: "Tout" },
              { key: "published", label: "Publiés" },
              { key: "draft", label: "Brouillons" },
              { key: "featured", label: "À la une" },
            ] as { key: FilterStatus; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setStatus(f.key);
                setPage(1);
              }}
              style={{
                fontFamily: "'DM Sans',system-ui,sans-serif",
                fontSize: ".72rem",
                fontWeight: 600,
                padding: ".38rem .85rem",
                borderRadius: 100,
                cursor: "pointer",
                transition: "all .15s",
                background: status === f.key ? "#141410" : "transparent",
                color: status === f.key ? "#fff" : "#38382E",
                border:
                  status === f.key ? "none" : "1.5px solid rgba(20,20,16,.12)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Catégorie */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as Category | "");
            setPage(1);
          }}
          style={{
            fontFamily: "'DM Sans',system-ui,sans-serif",
            fontSize: ".78rem",
            fontWeight: 500,
            padding: ".42rem .9rem",
            borderRadius: 100,
            border: "1.5px solid rgba(20,20,16,.12)",
            background: "#fff",
            color: category ? "#141410" : "#928E80",
            cursor: "pointer",
            appearance: "none",
            outline: "none",
          }}
        >
          <option value="">Toutes catégories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Compteur */}
        <div
          style={{
            marginLeft: "auto",
            fontSize: ".72rem",
            color: "#928E80",
            fontWeight: 500,
          }}
        >
          {total.toLocaleString("fr-FR")} résultat{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ══ ACTIONS BULK ══ */}
      {selected.size > 0 && (
        <div
          style={{
            background: "#141410",
            borderRadius: 12,
            padding: ".85rem 1.4rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 4px 16px rgba(20,20,16,.2)",
            animation: "slideUp .2s ease",
          }}
        >
          <span
            style={{ fontSize: ".78rem", fontWeight: 700, color: "#C08435" }}
          >
            {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
          </span>
          <div
            style={{ width: 1, height: 18, background: "rgba(255,255,255,.1)" }}
          />
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
            onClick={() =>
              setConfirm({ type: "bulk-delete", ids: Array.from(selected) })
            }
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

      {/* ══ TABLE ══ */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          border: "1px solid var(--border)",
          boxShadow: "var(--s2)",
          overflow: "hidden",
        }}
      >
        {/* En-tête colonnes */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 3fr 110px 110px 90px 90px 90px 110px",
            gap: "0 .75rem",
            padding: ".75rem 1.4rem",
            background: "#F8F6F1",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {/* Checkbox all */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={selected.size > 0 && selected.size === articles.length}
              ref={(el) => {
                if (el)
                  el.indeterminate =
                    selected.size > 0 && selected.size < articles.length;
              }}
              onChange={toggleAll}
              style={{
                width: 15,
                height: 15,
                cursor: "pointer",
                accentColor: "#C08435",
              }}
            />
          </div>
          {[
            { label: "Article", field: "title" as SortField },
            { label: "Catégorie", field: null },
            { label: "Auteur", field: null },
            { label: "Vues", field: "views" as SortField },
            { label: "Saves", field: "saves_count" as SortField },
            { label: "Statut", field: null },
            { label: "Date", field: "published_at" as SortField },
          ].map((col) => (
            <div
              key={col.label}
              onClick={() => col.field && toggleSort(col.field)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".35rem",
                fontSize: ".6rem",
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "#928E80",
                cursor: col.field ? "pointer" : "default",
                userSelect: "none",
              }}
            >
              {col.label}
              {col.field && <SortIcon f={col.field} />}
            </div>
          ))}
        </div>

        {/* Lignes */}
        {loading ? (
          <div className="aa-table-loader">
            <div className="aa-loader-ring" />
          </div>
        ) : articles.length === 0 ? (
          <div style={{ padding: "5rem", textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Fraunces',Georgia,serif",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "#141410",
                marginBottom: ".5rem",
              }}
            >
              Aucun article
            </div>
            <p
              style={{
                fontSize: ".82rem",
                color: "#928E80",
                marginBottom: "1.5rem",
              }}
            >
              {search || category || status !== "all"
                ? "Aucun résultat pour ces filtres."
                : "Rédigez votre premier article."}
            </p>
            <Link
              href="/admin/actualites/nouveau"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: ".4rem",
                fontFamily: "'DM Sans',system-ui,sans-serif",
                fontSize: ".82rem",
                fontWeight: 700,
                padding: ".6rem 1.3rem",
                borderRadius: 100,
                background: "#141410",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              <IcoPlus /> Rédiger un article
            </Link>
          </div>
        ) : (
          articles.map((art, i) => {
            const isSel = selected.has(art.id);
            const cc = CAT_COLOR[art.category] ?? "#928E80";
            return (
              <div
                key={art.id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "40px 3fr 110px 110px 90px 90px 90px 110px",
                  gap: "0 .75rem",
                  padding: ".9rem 1.4rem",
                  alignItems: "center",
                  borderBottom:
                    i < articles.length - 1
                      ? "1px solid rgba(20,20,16,.05)"
                      : "none",
                  background: isSel ? "rgba(192,132,53,.03)" : "transparent",
                  transition: "background .12s",
                }}
                onMouseEnter={(e) => {
                  if (!isSel)
                    (e.currentTarget as HTMLDivElement).style.background =
                      "#FAFAF8";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = isSel
                    ? "rgba(192,132,53,.03)"
                    : "transparent";
                }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSel}
                  onChange={() => toggleSelect(art.id)}
                  style={{
                    width: 15,
                    height: 15,
                    cursor: "pointer",
                    accentColor: "#C08435",
                  }}
                />

                {/* Article */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".85rem",
                    minWidth: 0,
                  }}
                >
                  {/* Miniature */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      flexShrink: 0,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {art.cover_url ? (
                      <img
                        src={art.cover_url}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: art.image_gradient,
                        }}
                      />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: ".84rem",
                        fontWeight: 700,
                        color: "#141410",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        letterSpacing: "-.01em",
                        marginBottom: ".2rem",
                      }}
                    >
                      {art.title}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem",
                      }}
                    >
                      {art.featured && (
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
                      <span style={{ fontSize: ".62rem", color: "#928E80" }}>
                        {art.reading_time} min · {art.author_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Catégorie */}
                <span
                  style={{
                    display: "inline-block",
                    fontSize: ".56rem",
                    fontWeight: 800,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: cc,
                    background: `${cc}14`,
                    padding: ".22rem .65rem",
                    borderRadius: 100,
                  }}
                >
                  {art.category}
                </span>

                {/* Auteur */}
                <span
                  style={{
                    fontSize: ".75rem",
                    color: "#38382E",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {art.author_name}
                </span>

                {/* Vues */}
                <span
                  style={{
                    fontFamily: "'Fraunces',Georgia,serif",
                    fontSize: ".88rem",
                    fontWeight: 700,
                    color: "#141410",
                    letterSpacing: "-.02em",
                  }}
                >
                  {fmtNum(art.views)}
                </span>

                {/* Saves */}
                <span
                  style={{
                    fontFamily: "'Fraunces',Georgia,serif",
                    fontSize: ".88rem",
                    fontWeight: 700,
                    color: "#5A7FD4",
                    letterSpacing: "-.02em",
                  }}
                >
                  {fmtNum(art.saves_count)}
                </span>

                {/* Statut — toggle */}
                <button
                  onClick={() => togglePublished(art.id, art.published)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".35rem",
                    fontFamily: "inherit",
                    fontSize: ".62rem",
                    fontWeight: 700,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    padding: ".28rem .7rem",
                    borderRadius: 100,
                    cursor: "pointer",
                    border: "none",
                    background: art.published
                      ? "rgba(26,92,64,.1)"
                      : "rgba(20,20,16,.06)",
                    color: art.published ? "#1A5C40" : "#928E80",
                    transition: "all .15s",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: art.published ? "#4A9E6F" : "#D0CCBF",
                    }}
                  />
                  {art.published ? "Publié" : "Brouillon"}
                </button>

                {/* Date + actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <span style={{ fontSize: ".65rem", color: "#928E80" }}>
                    {fmt(art.published_at)}
                  </span>
                  {/* Actions */}
                  <div
                    style={{ display: "flex", gap: ".25rem", opacity: 0 }}
                    className="row-actions"
                  >
                    <button
                      title="Vedette"
                      onClick={() => toggleFeatured(art.id, art.featured)}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        border: "none",
                        background: art.featured
                          ? "rgba(192,132,53,.12)"
                          : "rgba(20,20,16,.06)",
                        color: art.featured ? "#C08435" : "#928E80",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IcoStar filled={art.featured} />
                    </button>
                    <Link
                      href={`/actualites/${art.slug}`}
                      target="_blank"
                      title="Voir sur le site"
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        border: "none",
                        background: "rgba(20,20,16,.06)",
                        color: "#928E80",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                      }}
                    >
                      <IcoEye />
                    </Link>
                    <Link
                      href={`/admin/actualites/${art.id}`}
                      title="Éditer"
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        border: "none",
                        background: "rgba(30,77,168,.08)",
                        color: "#1E4DA8",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                      }}
                    >
                      <IcoEdit />
                    </Link>
                    <button
                      title="Supprimer"
                      onClick={() =>
                        setConfirm({ type: "delete", ids: [art.id] })
                      }
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        border: "none",
                        background: "rgba(184,52,30,.08)",
                        color: "#B8341E",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IcoTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ══ PAGINATION ══ */}
      {!loading && totalPages > 1 && (
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <span style={{ fontSize: ".75rem", color: "#928E80" }}>
            Page {page} sur {totalPages} · {total} articles
          </span>
          <div style={{ display: "flex", gap: ".4rem" }}>
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
              }}
              disabled={page === 1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".3rem",
                fontFamily: "inherit",
                fontSize: ".75rem",
                fontWeight: 600,
                padding: ".45rem .9rem",
                borderRadius: 100,
                cursor: page === 1 ? "not-allowed" : "pointer",
                background: "transparent",
                color: page === 1 ? "#D0CCBF" : "#38382E",
                border: "1.5px solid",
                borderColor: page === 1 ? "#E8E4DC" : "rgba(20,20,16,.15)",
              }}
            >
              <IcoChevron d="left" /> Précédent
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p =
                totalPages <= 7
                  ? i + 1
                  : page <= 4
                    ? i + 1
                    : page >= totalPages - 3
                      ? totalPages - 6 + i
                      : page - 3 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: ".75rem",
                    fontWeight: 600,
                    background: page === p ? "#141410" : "transparent",
                    color: page === p ? "#fff" : "#38382E",
                    border:
                      page === p ? "none" : "1.5px solid rgba(20,20,16,.12)",
                    transition: "all .15s",
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={page === totalPages}
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".3rem",
                fontFamily: "inherit",
                fontSize: ".75rem",
                fontWeight: 600,
                padding: ".45rem .9rem",
                borderRadius: 100,
                cursor: page === totalPages ? "not-allowed" : "pointer",
                background: "transparent",
                color: page === totalPages ? "#D0CCBF" : "#38382E",
                border: "1.5px solid",
                borderColor:
                  page === totalPages ? "#E8E4DC" : "rgba(20,20,16,.15)",
              }}
            >
              Suivant <IcoChevron d="right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
