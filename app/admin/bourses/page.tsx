"use client";
import { useState } from "react";
import Link from "next/link";
import { scholarships as initial } from "@/lib/data";

export default function AdminBoursesPage() {
  const [items, setItems] = useState(initial);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const filtered = items.filter((s) => [s.title, s.organization, s.country].join(" ").toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 900, color: "#141410", letterSpacing: "-0.04em", marginBottom: "0.3rem" }}>Bourses d&apos;études</h1>
          <p style={{ fontSize: "0.85rem", color: "#928E80" }}>{items.length} bourses référencées</p>
        </div>
        <Link href="/admin/bourses/nouvelle" style={btnPrimary}>🎓 Ajouter une bourse</Link>
      </div>
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" style={{ ...searchInput, marginBottom: "1.5rem" }} />
      <div style={tableWrap}>
        <div style={{ ...tableHeader, gridTemplateColumns: "2fr 100px 80px 120px 100px 130px" }}>
          {["Bourse", "Pays", "Niveau", "Deadline", "Statut", "Actions"].map((h) => <div key={h} style={thStyle}>{h}</div>)}
        </div>
        {filtered.map((sc, i) => (
          <div key={sc.id} style={{ ...tableRow, gridTemplateColumns: "2fr 100px 80px 120px 100px 130px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(20,20,16,.06)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: sc.imageGradient, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>{sc.flag}</div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#141410" }}>{sc.title}</div>
                <div style={{ fontSize: "0.68rem", color: "#C08435" }}>{sc.organization}</div>
              </div>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#38382E" }}>{sc.country}</div>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, background: "#EBF0FB", color: "#1E4DA8", padding: "0.2rem 0.55rem", borderRadius: 100 }}>{sc.level}</span>
            <div style={{ fontSize: "0.75rem", color: sc.urgent ? "#B8341E" : "#928E80", fontWeight: sc.urgent ? 600 : 400 }}>{sc.deadline}</div>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, background: sc.urgent ? "#FAEBE8" : "#EAF4EF", color: sc.urgent ? "#B8341E" : "#1A5C40", padding: "0.2rem 0.55rem", borderRadius: 100 }}>{sc.urgent ? "Urgent" : "Ouvert"}</span>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              <Link href={`/bourses/${sc.slug}`} target="_blank" style={btnMini("#928E80", "#F8F6F1")}>↗</Link>
              <Link href={`/admin/bourses/${sc.id}`} style={btnMini("#1E4DA8", "#EBF0FB")}>Éditer</Link>
              {confirmDelete === sc.id ? (
                <><button onClick={() => { setItems(items.filter((s) => s.id !== sc.id)); setConfirmDelete(null); }} style={delYes}>Oui</button><button onClick={() => setConfirmDelete(null)} style={delNo}>Non</button></>
              ) : (
                <button onClick={() => setConfirmDelete(sc.id)} style={delBtn}>✕</button>
              )}
            </div>
          </div>
        ))}
        {!filtered.length && <div style={{ padding: "3rem", textAlign: "center", color: "#928E80" }}>Aucune bourse trouvée.</div>}
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", fontWeight: 700, padding: "0.65rem 1.4rem", borderRadius: 100, background: "#141410", color: "#fff", textDecoration: "none" };
const searchInput: React.CSSProperties = { background: "#fff", border: "1.5px solid rgba(20,20,16,.1)", borderRadius: 12, padding: "0.72rem 1.2rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.9rem", color: "#141410", outline: "none", width: 360 };
const tableWrap: React.CSSProperties = { background: "#fff", borderRadius: 24, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden" };
const tableHeader: React.CSSProperties = { display: "grid", gap: "1rem", padding: "0.85rem 1.5rem", borderBottom: "1px solid rgba(20,20,16,.07)", background: "#F8F6F1" };
const tableRow: React.CSSProperties = { display: "grid", gap: "1rem", padding: "1rem 1.5rem", alignItems: "center" };
const thStyle: React.CSSProperties = { fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#928E80" };
const btnMini = (color: string, bg: string): React.CSSProperties => ({ padding: "0.28rem 0.6rem", borderRadius: 8, fontSize: "0.68rem", fontWeight: 600, color, background: bg, textDecoration: "none", display: "inline-block" });
const delYes: React.CSSProperties = { padding: "0.28rem 0.55rem", borderRadius: 8, fontSize: "0.68rem", fontWeight: 700, border: "none", cursor: "pointer", color: "#fff", background: "#B8341E", fontFamily: "'DM Sans', system-ui, sans-serif" };
const delNo: React.CSSProperties = { padding: "0.28rem 0.55rem", borderRadius: 8, fontSize: "0.68rem", fontWeight: 600, border: "none", cursor: "pointer", color: "#928E80", background: "#F0EDE4", fontFamily: "'DM Sans', system-ui, sans-serif" };
const delBtn: React.CSSProperties = { padding: "0.28rem 0.55rem", borderRadius: 8, fontSize: "0.68rem", fontWeight: 700, border: "none", cursor: "pointer", color: "#B8341E", background: "#FAEBE8", fontFamily: "'DM Sans', system-ui, sans-serif" };
