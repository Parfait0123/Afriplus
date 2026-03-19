"use client";

/**
 * components/admin/AdminTable.tsx — Refonte complète
 *
 * Nouvelles fonctionnalités :
 *   - editHref fonctionnel
 *   - Pagination réelle
 *   - onDelete / onTogglePublish callbacks
 *   - Sélection multiple avec actions en masse
 *   - Design luxueux AfriPulse dark
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { PublishedBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Spinner";

export interface ContentRow {
  id:           string;
  title:        string;
  meta1?:       string;
  meta2?:       string;
  meta3?:       string;
  badge?:       string;
  badgeColor?:  string;
  badgeBg?:     string;
  published?:   boolean;
  viewHref?:    string;
}

interface AdminTableProps {
  title:               string;
  icon:                string;
  rows:                ContentRow[];
  newHref:             string;
  newLabel:            string;
  editBasePath:        string;  // ex: "/admin/articles"
  searchPlaceholder?:  string;
  filterOptions?:      string[];
  loading?:            boolean;
  itemsPerPage?:       number;
  onDelete?:           (id: string) => Promise<void>;
  onTogglePublish?:    (id: string, published: boolean) => Promise<void>;
  onBulkDelete?:       (ids: string[]) => Promise<void>;
}

/* ── Icônes ── */
const IcoSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcoEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcoTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
  </svg>
);
const IcoEye = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcoPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcoChevLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IcoChevRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const BADGE_FALLBACK = { color: "#928E80", bg: "rgba(146,142,128,.12)" };

export default function AdminTable({
  title, icon, rows, newHref, newLabel, editBasePath,
  searchPlaceholder = "Rechercher…",
  filterOptions = [],
  loading = false,
  itemsPerPage = 15,
  onDelete,
  onTogglePublish,
  onBulkDelete,
}: AdminTableProps) {
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("Tous");
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [page,        setPage]        = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting,    setDeleting]    = useState(false);
  const [toggling,    setToggling]    = useState<string | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  /* ── Filtrage ── */
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const q = search.toLowerCase();
      const matchSearch =
        r.title.toLowerCase().includes(q) ||
        (r.meta1 ?? "").toLowerCase().includes(q) ||
        (r.meta2 ?? "").toLowerCase().includes(q) ||
        (r.meta3 ?? "").toLowerCase().includes(q);
      const matchFilter =
        filter === "Tous" ||
        r.badge === filter ||
        r.meta1 === filter;
      return matchSearch && matchFilter;
    });
  }, [rows, search, filter]);

  /* ── Pagination ── */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ── Sélection ── */
  const allSelected  = paginated.length > 0 && paginated.every(r => selected.has(r.id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      paginated.forEach(r => next.delete(r.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      paginated.forEach(r => next.add(r.id));
      setSelected(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  /* ── Actions ── */
  const handleDelete = async () => {
    if (!deleteTarget || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget);
      setSelected(prev => { const n = new Set(prev); n.delete(deleteTarget); return n; });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    if (!onTogglePublish) return;
    setToggling(id);
    try { await onTogglePublish(id, !current); }
    finally { setToggling(null); }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete) return;
    setDeleting(true);
    try {
      await onBulkDelete(Array.from(selected));
      setSelected(new Set());
    } finally {
      setDeleting(false);
      setBulkConfirm(false);
    }
  };

  /* ── Pages de pagination ── */
  const pageNumbers = useMemo(() => {
    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("…");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div style={{ padding: "2rem 2.5rem" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", marginBottom: "2rem",
        flexWrap: "wrap", gap: "1rem",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.35rem" }}>
            <span style={{ fontSize: "1.4rem" }}>{icon}</span>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "1.75rem", fontWeight: 900,
              letterSpacing: "-0.04em", color: "#141410",
            }}>
              {title}
            </h1>
          </div>
          <p style={{ fontSize: "0.82rem", color: "#928E80" }}>
            {loading ? "Chargement…" : `${filtered.length} entrée${filtered.length > 1 ? "s" : ""}`}
            {someSelected && ` · ${selected.size} sélectionnée${selected.size > 1 ? "s" : ""}`}
          </p>
        </div>

        <Link href={newHref} style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: "0.85rem", fontWeight: 700,
          padding: "0.7rem 1.4rem", borderRadius: 100,
          background: "#141410", color: "#fff",
          textDecoration: "none",
          boxShadow: "0 4px 16px rgba(20,20,16,.2)",
          transition: "all .2s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#C08435"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#141410"; }}
        >
          <IcoPlus /> {newLabel}
        </Link>
      </div>

      {/* ── Tableau ── */}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        border: "1px solid rgba(20,20,16,.07)",
        boxShadow: "0 1px 4px rgba(20,20,16,.04)",
        overflow: "hidden",
      }}>

        {/* Toolbar */}
        <div style={{
          padding: "1rem 1.4rem",
          borderBottom: "1px solid rgba(20,20,16,.07)",
          display: "flex", gap: "0.85rem",
          alignItems: "center", flexWrap: "wrap",
          background: "#FAFAF8",
        }}>
          {/* Recherche */}
          <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 360 }}>
            <span style={{
              position: "absolute", left: "0.85rem", top: "50%",
              transform: "translateY(-50%)", color: "#928E80",
            }}>
              <IcoSearch />
            </span>
            <input
              type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              style={{
                width: "100%",
                background: "#fff", border: "1.5px solid rgba(20,20,16,.09)",
                borderRadius: 100, padding: "0.55rem 1rem 0.55rem 2.2rem",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "0.85rem", color: "#141410", outline: "none",
                boxSizing: "border-box" as const,
                transition: "border-color .15s",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#C08435")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(20,20,16,.09)")}
            />
          </div>

          {/* Filtres */}
          {filterOptions.length > 0 && (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {["Tous", ...filterOptions].map(f => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setPage(1); }}
                    style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontSize: "0.72rem", fontWeight: 600,
                      padding: "0.38rem 0.85rem", borderRadius: 100,
                      cursor: "pointer", transition: "all .18s",
                      background: active ? "#141410" : "transparent",
                      color: active ? "#fff" : "#928E80",
                      border: active ? "none" : "1.5px solid rgba(20,20,16,.1)",
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          )}

          {/* Actions en masse */}
          {someSelected && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              marginLeft: "auto",
            }}>
              <span style={{ fontSize: "0.75rem", color: "#928E80", fontWeight: 500 }}>
                {selected.size} sélectionnée{selected.size > 1 ? "s" : ""}
              </span>
              {onBulkDelete && (
                <button
                  onClick={() => setBulkConfirm(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    fontSize: "0.75rem", fontWeight: 600,
                    padding: "0.38rem 0.85rem", borderRadius: 100,
                    cursor: "pointer",
                    background: "#FAEBE8", color: "#B8341E",
                    border: "1px solid rgba(184,52,30,.2)",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                >
                  <IcoTrash /> Supprimer ({selected.size})
                </button>
              )}
            </div>
          )}
        </div>

        {/* En-tête tableau */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "44px 1fr 120px 120px 130px 100px 130px",
          gap: "0.5rem",
          padding: "0.7rem 1.4rem",
          borderBottom: "1px solid rgba(20,20,16,.07)",
          background: "#F8F6F1",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              style={{ cursor: "pointer", accentColor: "#C08435" }}
            />
          </div>
          {["Titre", "Catégorie", "Détail", "Statut", "Publié", "Actions"].map(h => (
            <div key={h} style={{
              fontSize: "0.62rem", fontWeight: 800,
              letterSpacing: "0.1em", textTransform: "uppercase" as const,
              color: "#928E80",
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* Corps */}
        {loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ padding: "1rem 1.4rem", borderBottom: "1px solid rgba(20,20,16,.04)" }}>
                <Skeleton height={18} width={`${60 + Math.random() * 30}%`} />
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <div style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "2rem", color: "rgba(20,20,16,.08)",
              fontWeight: 900, marginBottom: "0.75rem",
            }}>—</div>
            <p style={{ color: "#928E80", fontSize: "0.88rem" }}>
              {search ? `Aucun résultat pour « ${search} »` : "Aucune entrée pour l'instant."}
            </p>
            {search && (
              <button
                onClick={() => { setSearch(""); setFilter("Tous"); }}
                style={{
                  marginTop: "1rem",
                  fontSize: "0.8rem", fontWeight: 600,
                  color: "#C08435", background: "none",
                  border: "none", cursor: "pointer",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          paginated.map((row, i) => {
            const isSelected = selected.has(row.id);
            const bc = row.badgeColor
              ? { color: row.badgeColor, bg: row.badgeBg ?? `${row.badgeColor}18` }
              : BADGE_FALLBACK;
            const isToggling = toggling === row.id;

            return (
              <div
                key={row.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr 120px 120px 130px 100px 130px",
                  gap: "0.5rem",
                  padding: "0.85rem 1.4rem",
                  borderBottom: i < paginated.length - 1 ? "1px solid rgba(20,20,16,.05)" : "none",
                  background: isSelected ? "rgba(192,132,53,.04)" : "transparent",
                  alignItems: "center",
                  transition: "background .15s",
                }}
                onMouseEnter={e => {
                  if (!isSelected)
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(20,20,16,.018)";
                }}
                onMouseLeave={e => {
                  if (!isSelected)
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                {/* Checkbox */}
                <div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(row.id)}
                    style={{ cursor: "pointer", accentColor: "#C08435" }}
                  />
                </div>

                {/* Titre */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: "0.88rem", fontWeight: 700,
                    color: "#141410", lineHeight: 1.35,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  } as React.CSSProperties}>
                    {row.title}
                  </div>
                </div>

                {/* Badge / catégorie */}
                <div>
                  {row.badge ? (
                    <span style={{
                      display: "inline-block",
                      fontSize: "0.6rem", fontWeight: 800,
                      letterSpacing: "0.07em", textTransform: "uppercase" as const,
                      padding: "0.2rem 0.6rem", borderRadius: 100,
                      background: bc.bg, color: bc.color,
                      whiteSpace: "nowrap" as const,
                    }}>
                      {row.badge}
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.82rem", color: "#928E80" }}>{row.meta1 ?? "—"}</span>
                  )}
                </div>

                {/* meta2 */}
                <div style={{ fontSize: "0.78rem", color: "#928E80" }}>
                  {row.meta2 ?? "—"}
                </div>

                {/* meta3 */}
                <div style={{ fontSize: "0.78rem", color: "#928E80" }}>
                  {row.meta3 ?? "—"}
                </div>

                {/* Publié toggle */}
                <div>
                  {onTogglePublish ? (
                    <button
                      onClick={() => handleTogglePublish(row.id, row.published ?? false)}
                      disabled={isToggling}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "0.3rem",
                        fontSize: "0.62rem", fontWeight: 800,
                        letterSpacing: "0.06em", textTransform: "uppercase" as const,
                        padding: "0.22rem 0.65rem", borderRadius: 100,
                        background: row.published ? "#EAF4EF" : "#F0EDE4",
                        color: row.published ? "#1A5C40" : "#928E80",
                        border: "none", cursor: isToggling ? "wait" : "pointer",
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        opacity: isToggling ? 0.6 : 1,
                        transition: "all .2s",
                      }}
                    >
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: row.published ? "#1A5C40" : "#928E80",
                      }} />
                      {row.published ? "Publié" : "Brouillon"}
                    </button>
                  ) : (
                    <PublishedBadge published={row.published ?? false} />
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                  {/* Voir */}
                  {row.viewHref && (
                    <Link
                      href={row.viewHref}
                      target="_blank"
                      title="Voir sur le site"
                      style={{
                        width: 30, height: 30,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: 8,
                        background: "#F8F6F1", color: "#928E80",
                        border: "1px solid rgba(20,20,16,.08)",
                        textDecoration: "none", transition: "all .15s",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "#F0EDE4";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#141410";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "#F8F6F1";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#928E80";
                      }}
                    >
                      <IcoEye />
                    </Link>
                  )}

                  {/* Éditer */}
                  <Link
                    href={`${editBasePath}/${row.id}`}
                    title="Éditer"
                    style={{
                      width: 30, height: 30,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 8,
                      background: "#EBF0FB", color: "#1E4DA8",
                      border: "1px solid rgba(30,77,168,.12)",
                      textDecoration: "none", transition: "all .15s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "#dce7f9";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "#EBF0FB";
                    }}
                  >
                    <IcoEdit />
                  </Link>

                  {/* Supprimer */}
                  {onDelete && (
                    <button
                      onClick={() => setDeleteTarget(row.id)}
                      title="Supprimer"
                      style={{
                        width: 30, height: 30,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: 8,
                        background: "#FAEBE8", color: "#B8341E",
                        border: "1px solid rgba(184,52,30,.12)",
                        cursor: "pointer", transition: "all .15s",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#f5dbd5";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#FAEBE8";
                      }}
                    >
                      <IcoTrash />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Footer Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{
            padding: "1rem 1.4rem",
            borderTop: "1px solid rgba(20,20,16,.06)",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
            background: "#FAFAF8",
          }}>
            <span style={{ fontSize: "0.75rem", color: "#928E80" }}>
              {(currentPage - 1) * itemsPerPage + 1} –{" "}
              {Math.min(currentPage * itemsPerPage, filtered.length)} sur{" "}
              {filtered.length} entrée{filtered.length > 1 ? "s" : ""}
            </span>

            <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent",
                  border: "1.5px solid rgba(20,20,16,.1)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  color: currentPage === 1 ? "#D0CCBF" : "#38382E",
                }}
              >
                <IcoChevLeft />
              </button>

              {pageNumbers.map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} style={{ fontSize: "0.78rem", color: "#928E80", padding: "0 0.25rem" }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      fontSize: "0.78rem", fontWeight: currentPage === p ? 800 : 500,
                      background: currentPage === p ? "#141410" : "transparent",
                      color: currentPage === p ? "#fff" : "#38382E",
                      border: currentPage === p ? "none" : "1.5px solid rgba(20,20,16,.1)",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                    }}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent",
                  border: "1.5px solid rgba(20,20,16,.1)",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  color: currentPage === totalPages ? "#D0CCBF" : "#38382E",
                }}
              >
                <IcoChevRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Dialogues de confirmation ── */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer cette entrée ?"
        message="Cette action est irréversible. L'élément sera définitivement supprimé de la base de données."
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkConfirm}
        title={`Supprimer ${selected.size} entrée${selected.size > 1 ? "s" : ""} ?`}
        message="Cette action est irréversible. Tous les éléments sélectionnés seront définitivement supprimés."
        confirmLabel={`Supprimer ${selected.size} éléments`}
        variant="danger"
        loading={deleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkConfirm(false)}
      />
    </div>
  );
}