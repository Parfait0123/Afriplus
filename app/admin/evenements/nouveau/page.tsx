"use client";
import { useState } from "react";
import Link from "next/link";

const eventTypes = ["Conférence", "Forum", "Hackathon", "Salon", "Atelier", "Sommet"];

export default function NewEvenementPage() {
  const [form, setForm] = useState({
    title: "",
    type: "Conférence",
    location: "",
    eventDate: "",
    description: "",
    registerUrl: "",
    published: false,
  });
  const [saved, setSaved] = useState(false);

  const update = (k: string, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = (publish = false) => {
    update("published", publish);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/evenements" style={{ fontSize: "0.82rem", color: "#928E80", textDecoration: "none" }}>
            ← Événements
          </Link>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#141410" }}>
            Nouvel événement
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button onClick={() => handleSave(false)} style={btnGhost}>Enregistrer brouillon</button>
          <button onClick={() => handleSave(true)} style={btnPrimary}>Publier →</button>
        </div>
      </div>

      {saved && (
        <div style={{ background: "#EAF4EF", border: "1px solid rgba(26,92,64,.2)", borderRadius: 12, padding: "0.85rem 1.2rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#1A5C40", fontWeight: 500 }}>
          ✓ {form.published ? "Événement publié avec succès !" : "Brouillon enregistré."}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", padding: "1.8rem" }}>
            <label style={labelStyle}>Titre de l&apos;événement *</label>
            <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)}
              placeholder="Ex: AfricaTech Summit 2026" style={inputStyle} />

            <label style={{ ...labelStyle, marginTop: "1.2rem" }}>Description</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
              placeholder="Présentez l'événement, son programme, les intervenants attendus…"
              rows={10} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8 }} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", position: "sticky", top: "2rem" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", padding: "1.4rem" }}>
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#141410", marginBottom: "1.2rem" }}>Détails</h3>

            <label style={labelStyle}>Type d&apos;événement</label>
            <select value={form.type} onChange={(e) => update("type", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <label style={{ ...labelStyle, marginTop: "1rem" }}>Date *</label>
            <input type="date" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} style={inputStyle} />

            <label style={{ ...labelStyle, marginTop: "1rem" }}>Lieu *</label>
            <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)}
              placeholder="Ex: Nairobi, Kenya" style={inputStyle} />

            <label style={{ ...labelStyle, marginTop: "1rem" }}>URL d&apos;inscription</label>
            <input type="url" value={form.registerUrl} onChange={(e) => update("registerUrl", e.target.value)}
              placeholder="https://…" style={inputStyle} />
          </div>

          {/* Preview date card */}
          {form.eventDate && (
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", padding: "1.4rem" }}>
              <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#141410", marginBottom: "1rem" }}>Aperçu carte</h3>
              <div style={{ background: "#FBF4E8", borderRadius: 14, padding: "1rem", display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2.5rem", fontWeight: 900, color: "#C08435", lineHeight: 1 }}>
                  {new Date(form.eventDate).getDate()}
                </span>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1.5 }}>
                  {new Date(form.eventDate).toLocaleString("fr-FR", { month: "short" })}<br />
                  {new Date(form.eventDate).getFullYear()}
                </div>
              </div>
              <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", fontWeight: 700, color: "#141410", fontFamily: "'Fraunces', Georgia, serif" }}>
                {form.title || "Titre de l'événement"}
              </div>
              {form.location && <div style={{ fontSize: "0.75rem", color: "#928E80", marginTop: "0.3rem" }}>📍 {form.location}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#38382E",
  marginBottom: "0.5rem", letterSpacing: "0.02em",
};
const inputStyle: React.CSSProperties = {
  width: "100%", background: "#F8F6F1", border: "1.5px solid rgba(20,20,16,.08)",
  borderRadius: 12, padding: "0.7rem 0.95rem",
  fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.88rem",
  color: "#141410", outline: "none", boxSizing: "border-box", display: "block",
};
const btnPrimary: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", fontWeight: 700,
  padding: "0.65rem 1.4rem", borderRadius: 100, cursor: "pointer",
  background: "#141410", color: "#fff", border: "none",
};
const btnGhost: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", fontWeight: 600,
  padding: "0.65rem 1.3rem", borderRadius: 100, cursor: "pointer",
  background: "transparent", color: "#38382E", border: "1.5px solid rgba(20,20,16,.12)",
};
