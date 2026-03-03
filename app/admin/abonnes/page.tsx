"use client";
import { useState } from "react";

// Mock subscriber data
const mockSubscribers = Array.from({ length: 24 }, (_, i) => ({
  id: `sub-${i + 1}`,
  email: `utilisateur${i + 1}@exemple.${["com", "fr", "org", "net"][i % 4]}`,
  confirmed: i % 7 !== 0,
  date: new Date(Date.now() - i * 86400000 * 3).toLocaleDateString("fr-FR"),
  country: ["Sénégal", "Côte d'Ivoire", "Nigeria", "Kenya", "Ghana", "Cameroun", "Mali", "Maroc"][i % 8],
}));

export default function AdminAbonnesPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = mockSubscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.country.toLowerCase().includes(search.toLowerCase())
  );

  const confirmed = mockSubscribers.filter((s) => s.confirmed).length;

  return (
    <div style={{ padding: "2.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#141410", marginBottom: "0.4rem" }}>
          📧 Abonnés Newsletter
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#928E80" }}>{confirmed} abonnés confirmés · {mockSubscribers.length - confirmed} en attente</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.2rem", marginBottom: "2rem" }}>
        {[
          { label: "Total abonnés", value: "12 847", delta: "+234 cette semaine", color: "#EBF0FB", accent: "#1E4DA8" },
          { label: "Taux d'ouverture", value: "48.2%", delta: "+2.1% vs mois dernier", color: "#EAF4EF", accent: "#1A5C40" },
          { label: "Taux de clic", value: "12.8%", delta: "Moyenne secteur : 8%", color: "#FBF4E8", accent: "#C08435" },
          { label: "Désabonnements", value: "0.4%", delta: "En baisse ✓", color: "#F0EDE4", accent: "#928E80" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 18, padding: "1.4rem", border: "1px solid rgba(20,20,16,.07)" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.6rem" }}>{s.label}</div>
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 900, color: "#141410", lineHeight: 1, marginBottom: "0.3rem" }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: s.accent }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.4rem", borderBottom: "1px solid rgba(20,20,16,.07)", display: "flex", gap: "1rem", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem", color: "#928E80" }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par email ou pays…"
              style={{ width: "100%", background: "#F8F6F1", border: "1.5px solid rgba(20,20,16,.08)", borderRadius: 100, padding: "0.6rem 1rem 0.6rem 2.4rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", color: "#141410", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          {selected.size > 0 && (
            <button style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.35rem 0.8rem", borderRadius: 100, cursor: "pointer", background: "#FAEBE8", color: "#B8341E", border: "1px solid rgba(184,52,30,.2)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              Supprimer ({selected.size})
            </button>
          )}
          <button style={{ marginLeft: "auto", fontSize: "0.82rem", fontWeight: 600, padding: "0.55rem 1.2rem", borderRadius: 100, cursor: "pointer", background: "#141410", color: "#fff", border: "none", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            Exporter CSV
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(20,20,16,.07)" }}>
              <th style={{ padding: "0.75rem 1.4rem", textAlign: "left", width: 40 }}>
                <input type="checkbox" onChange={() => {
                  if (selected.size === filtered.length) setSelected(new Set());
                  else setSelected(new Set(filtered.map((s) => s.id)));
                }} />
              </th>
              {["Email", "Pays", "Statut", "Date d'inscription", ""].map((h) => (
                <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#928E80" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub, i) => (
              <tr key={sub.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(20,20,16,.04)" : "none", background: selected.has(sub.id) ? "rgba(192,132,53,.04)" : "transparent" }}>
                <td style={{ padding: "0.85rem 1.4rem" }}>
                  <input type="checkbox" checked={selected.has(sub.id)} onChange={() => {
                    const next = new Set(selected);
                    if (next.has(sub.id)) next.delete(sub.id); else next.add(sub.id);
                    setSelected(next);
                  }} />
                </td>
                <td style={{ padding: "0.85rem 1rem", fontSize: "0.87rem", fontWeight: 500, color: "#141410" }}>{sub.email}</td>
                <td style={{ padding: "0.85rem 1rem", fontSize: "0.82rem", color: "#928E80" }}>{sub.country}</td>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.68rem", fontWeight: 700, padding: "0.22rem 0.65rem", borderRadius: 100, background: sub.confirmed ? "#EAF4EF" : "#FBF4E8", color: sub.confirmed ? "#1A5C40" : "#C08435" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: sub.confirmed ? "#1A5C40" : "#C08435" }} />
                    {sub.confirmed ? "Confirmé" : "En attente"}
                  </span>
                </td>
                <td style={{ padding: "0.85rem 1rem", fontSize: "0.82rem", color: "#928E80" }}>{sub.date}</td>
                <td style={{ padding: "0.85rem 1.4rem", textAlign: "right" }}>
                  <button style={{ fontSize: "0.72rem", fontWeight: 600, padding: "0.28rem 0.65rem", borderRadius: 100, cursor: "pointer", background: "transparent", color: "#928E80", border: "1px solid rgba(20,20,16,.1)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: "1rem 1.4rem", borderTop: "1px solid rgba(20,20,16,.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.78rem", color: "#928E80" }}>Affichage de {filtered.length} / {mockSubscribers.length} abonnés</span>
        </div>
      </div>
    </div>
  );
}
