"use client";
import Link from "next/link";
import { useState } from "react";

export interface ContentRow {
  id: string;
  title: string;
  meta1?: string;   // e.g. category / organization
  meta2?: string;   // e.g. date / deadline
  meta3?: string;   // e.g. author / location
  badge?: string;
  badgeColor?: "green" | "gold" | "red" | "blue" | "gray";
  published?: boolean;
}

interface AdminTableProps {
  title: string;
  icon: string;
  rows: ContentRow[];
  newHref: string;
  newLabel: string;
  searchPlaceholder?: string;
  filterOptions?: string[];
}

const badgeBg: Record<string, { bg: string; color: string }> = {
  green: { bg: "#EAF4EF", color: "#1A5C40" },
  gold:  { bg: "#FBF4E8", color: "#C08435" },
  red:   { bg: "#FAEBE8", color: "#B8341E" },
  blue:  { bg: "#EBF0FB", color: "#1E4DA8" },
  gray:  { bg: "#F0EDE4", color: "#928E80" },
};

export default function AdminTable({
  title, icon, rows, newHref, newLabel,
  searchPlaceholder = "Rechercher…", filterOptions = [],
}: AdminTableProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = rows.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.meta1 || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Tous" || r.badge === filter || r.meta1 === filter;
    return matchSearch && matchFilter;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#141410", marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span>{icon}</span> {title}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#928E80" }}>{filtered.length} entrée{filtered.length > 1 ? "s" : ""}</p>
        </div>
        <Link href={newHref} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.87rem", fontWeight: 700, padding: "0.75rem 1.4rem", borderRadius: 100, textDecoration: "none", background: "#141410", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          + {newLabel}
        </Link>
      </div>

      {/* Toolbar */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden", boxShadow: "0 1px 3px rgba(20,20,16,.04)" }}>
        <div style={{ padding: "1rem 1.4rem", borderBottom: "1px solid rgba(20,20,16,.07)", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem", color: "#928E80" }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              style={{ width: "100%", background: "#F8F6F1", border: "1.5px solid rgba(20,20,16,.08)", borderRadius: 100, padding: "0.6rem 1rem 0.6rem 2.4rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", color: "#141410", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Filters */}
          {filterOptions.length > 0 && (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {["Tous", ...filterOptions].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.75rem", fontWeight: 600, padding: "0.38rem 0.9rem", borderRadius: 100, cursor: "pointer", transition: "all .18s", background: filter === f ? "#141410" : "transparent", color: filter === f ? "#fff" : "#38382E", border: filter === f ? "none" : "1.5px solid rgba(20,20,16,.12)" }}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Bulk action */}
          {selected.size > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginLeft: "auto" }}>
              <span style={{ fontSize: "0.78rem", color: "#928E80" }}>{selected.size} sélectionné(s)</span>
              <button style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.35rem 0.8rem", borderRadius: 100, cursor: "pointer", background: "#FAEBE8", color: "#B8341E", border: "1px solid rgba(184,52,30,.2)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                Supprimer
              </button>
              <button style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.35rem 0.8rem", borderRadius: 100, cursor: "pointer", background: "#EAF4EF", color: "#1A5C40", border: "1px solid rgba(26,92,64,.2)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                Publier
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(20,20,16,.07)" }}>
                <th style={{ padding: "0.75rem 1.4rem", textAlign: "left", width: 40 }}>
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} style={{ cursor: "pointer" }} />
                </th>
                <th style={{ ...thStyle, paddingLeft: 0 }}>Titre</th>
                <th style={thStyle}>Catégorie</th>
                <th style={thStyle}>Date / Deadline</th>
                <th style={thStyle}>Auteur / Lieu</th>
                <th style={thStyle}>Statut</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#928E80", fontSize: "0.87rem" }}>
                    Aucun résultat pour &ldquo;{search}&rdquo;
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => {
                  const bc = badgeBg[row.badgeColor || "gray"];
                  return (
                    <tr key={row.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(20,20,16,.04)" : "none", background: selected.has(row.id) ? "rgba(192,132,53,.04)" : "transparent", transition: "background .15s" }}>
                      <td style={{ padding: "0.9rem 1.4rem", width: 40 }}>
                        <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} style={{ cursor: "pointer" }} />
                      </td>
                      <td style={{ padding: "0.9rem 1rem 0.9rem 0", maxWidth: 320 }}>
                        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.9rem", fontWeight: 700, color: "#141410", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                          {row.title}
                        </div>
                      </td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        {row.badge && (
                          <span style={{ display: "inline-block", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.2rem 0.65rem", borderRadius: 100, background: bc.bg, color: bc.color }}>
                            {row.badge}
                          </span>
                        )}
                        {!row.badge && row.meta1 && (
                          <span style={{ fontSize: "0.82rem", color: "#928E80" }}>{row.meta1}</span>
                        )}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.82rem", color: "#928E80" }}>{row.meta2}</td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.82rem", color: "#928E80" }}>{row.meta3}</td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.68rem", fontWeight: 700, padding: "0.22rem 0.65rem", borderRadius: 100, background: row.published !== false ? "#EAF4EF" : "#F0EDE4", color: row.published !== false ? "#1A5C40" : "#928E80" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: row.published !== false ? "#1A5C40" : "#928E80" }} />
                          {row.published !== false ? "Publié" : "Brouillon"}
                        </span>
                      </td>
                      <td style={{ padding: "0.9rem 1.4rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.32rem 0.75rem", borderRadius: 100, cursor: "pointer", background: "transparent", color: "#C08435", border: "1px solid rgba(192,132,53,.25)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                            Éditer
                          </button>
                          <button style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.32rem 0.75rem", borderRadius: 100, cursor: "pointer", background: "transparent", color: "#928E80", border: "1px solid rgba(20,20,16,.1)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                            ⋯
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "1rem 1.4rem", borderTop: "1px solid rgba(20,20,16,.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.78rem", color: "#928E80" }}>
            Affichage de {Math.min(filtered.length, 20)} / {rows.length} entrées
          </span>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {["←", "1", "2", "3", "→"].map((p, i) => (
              <button key={i} style={{ width: 32, height: 32, borderRadius: 8, border: p === "1" ? "none" : "1px solid rgba(20,20,16,.1)", background: p === "1" ? "#141410" : "transparent", color: p === "1" ? "#fff" : "#38382E", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#928E80",
};
