"use client";
import { useState } from "react";
import Link from "next/link";

const types = ["Emploi CDI", "Emploi", "Stage", "Graduate", "Freelance", "Volontariat"];

export default function NewOpportunitePage() {
  const [form, setForm] = useState({
    title: "",
    company: "",
    companyInitials: "",
    location: "",
    type: "Emploi CDI",
    description: "",
    applyUrl: "",
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
          <Link href="/admin/opportunites" style={{ fontSize: "0.82rem", color: "#928E80", textDecoration: "none" }}>
            ← Opportunités
          </Link>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#141410" }}>
            Nouvelle opportunité
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button onClick={() => handleSave(false)} style={btnGhost}>Enregistrer brouillon</button>
          <button onClick={() => handleSave(true)} style={btnPrimary}>Publier →</button>
        </div>
      </div>

      {saved && (
        <div style={{ background: "#EAF4EF", border: "1px solid rgba(26,92,64,.2)", borderRadius: 12, padding: "0.85rem 1.2rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#1A5C40", fontWeight: 500 }}>
          ✓ {form.published ? "Opportunité publiée avec succès !" : "Brouillon enregistré."}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>
        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", padding: "1.8rem" }}>
            <label style={labelStyle}>Titre du poste *</label>
            <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)}
              placeholder="Ex: Analyste Financier Junior — Afrique Subsaharienne" style={inputStyle} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.2rem" }}>
              <div>
                <label style={labelStyle}>Entreprise / Organisation *</label>
                <input type="text" value={form.company} onChange={(e) => update("company", e.target.value)}
                  placeholder="Ex: Banque Mondiale" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Initiales (2-3 lettres) *</label>
                <input type="text" value={form.companyInitials} onChange={(e) => update("companyInitials", e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="Ex: WB" maxLength={3} style={inputStyle} />
              </div>
            </div>

            <label style={{ ...labelStyle, marginTop: "1.2rem" }}>Description du poste</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
              placeholder="Décrivez les responsabilités, le profil recherché, les avantages…"
              rows={10} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8 }} />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", position: "sticky", top: "2rem" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", padding: "1.4rem" }}>
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#141410", marginBottom: "1.2rem" }}>Détails</h3>

            <label style={labelStyle}>Type de contrat</label>
            <select value={form.type} onChange={(e) => update("type", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <label style={{ ...labelStyle, marginTop: "1rem" }}>Localisation *</label>
            <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)}
              placeholder="Ex: Nairobi, Kenya" style={inputStyle} />

            <label style={{ ...labelStyle, marginTop: "1rem" }}>URL de candidature</label>
            <input type="url" value={form.applyUrl} onChange={(e) => update("applyUrl", e.target.value)}
              placeholder="https://…" style={inputStyle} />
          </div>

          {/* Image */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", padding: "1.4rem" }}>
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#141410", marginBottom: "1rem" }}>Image / couleur</h3>
            <div style={{ border: "2px dashed rgba(20,20,16,.12)", borderRadius: 14, padding: "1.5rem", textAlign: "center", cursor: "pointer", background: "#F8F6F1" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>🖼️</div>
              <div style={{ fontSize: "0.78rem", color: "#928E80" }}>Glissez une image ou cliquez</div>
            </div>
          </div>
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
