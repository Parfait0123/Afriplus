"use client";
import { useState } from "react";
import Link from "next/link";
import { articles as initial } from "@/lib/data";

export default function AdminArticlesPage() {
  const [items, setItems] = useState(initial);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = items.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase()) ||
    a.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 900, color: "#141410", letterSpacing: "-0.04em", marginBottom: "0.3rem" }}>Actualités</h1>
          <p style={{ fontSize: "0.85rem", color: "#928E80" }}>{items.length} articles</p>
        </div>
        <Link href="/admin/articles/nouveau" style={btnPrimary}>✏️ Rédiger un article</Link>
      </div>

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…"
        style={{ ...searchInput, marginBottom: "1.5rem" }} />

      <div style={tableWrap}>
        <div style={{ ...tableHeader, gridTemplateColumns: "2fr 100px 120px 110px 130px" }}>
          {["Titre", "Catégorie", "Auteur", "Date", "Actions"].map((h) => (
            <div key={h} style={thStyle}>{h}</div>
          ))}
        </div>
        {filtered.map((art, i) => (
          <div key={art.id} style={{ ...tableRow, gridTemplateColumns: "2fr 100px 120px 110px 130px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(20,20,16,.06)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: art.imageGradient, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#141410", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}>{art.title}</div>
                {art.featured && <span style={{ fontSize: "0.6rem", color: "#C08435" }}>⭐ Vedette</span>}
              </div>
            </div>
            <div><span style={{ fontSize: "0.62rem", fontWeight: 700, background: "#FBF4E8", color: "#C08435", padding: "0.2rem 0.55rem", borderRadius: 100, textTransform: "uppercase" as const }}>{art.category}</span></div>
            <div style={{ fontSize: "0.82rem", color: "#38382E" }}>{art.author}</div>
            <div style={{ fontSize: "0.75rem", color: "#928E80" }}>{art.date}</div>
            <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
              <Link href={`/actualites/${art.slug}`} target="_blank" style={btnMini("#928E80", "#F8F6F1")}>↗</Link>
              <Link href={`/admin/articles/${art.id}`} style={btnMini("#1E4DA8", "#EBF0FB")}>Éditer</Link>
              {confirmDelete === art.id ? (
                <>
                  <button onClick={() => { setItems(items.filter((a) => a.id !== art.id)); setConfirmDelete(null); }} style={{ ...btnAction, color: "#fff", background: "#B8341E" }}>Oui</button>
                  <button onClick={() => setConfirmDelete(null)} style={{ ...btnAction, color: "#928E80", background: "#F0EDE4" }}>Non</button>
                </>
              ) : (
                <button onClick={() => setConfirmDelete(art.id)} style={{ ...btnAction, color: "#B8341E", background: "#FAEBE8" }}>✕</button>
              )}
            </div>
          </div>
        ))}
        {!filtered.length && <div style={{ padding: "3rem", textAlign: "center", color: "#928E80" }}>Aucun résultat.</div>}
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", fontWeight: 700, padding: "0.65rem 1.4rem", borderRadius: 100, background: "#141410", color: "#fff", textDecoration: "none" };
const searchInput: React.CSSProperties = { background: "#fff", border: "1.5px solid rgba(20,20,16,.1)", borderRadius: 12, padding: "0.72rem 1.2rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.9rem", color: "#141410", outline: "none", width: 360 };
const tableWrap: React.CSSProperties = { background: "#fff", borderRadius: 24, border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 3px rgba(20,20,16,.04)", overflow: "hidden" };
const tableHeader: React.CSSProperties = { display: "grid", gap: "1rem", padding: "0.85rem 1.5rem", borderBottom: "1px solid rgba(20,20,16,.07)", background: "#F8F6F1" };
const tableRow: React.CSSProperties = { display: "grid", gap: "1rem", padding: "1rem 1.5rem", alignItems: "center" };
const thStyle: React.CSSProperties = { fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#928E80" };
const btnMini = (color: string, bg: string): React.CSSProperties => ({ padding: "0.28rem 0.6rem", borderRadius: 8, fontSize: "0.68rem", fontWeight: 600, color, background: bg, textDecoration: "none", display: "inline-block" });
const btnAction: React.CSSProperties = { padding: "0.28rem 0.55rem", borderRadius: 8, fontSize: "0.68rem", fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" };
