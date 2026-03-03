"use client";
import { useState } from "react";
import Link from "next/link";

const levels = ["Licence", "Master", "Doctorat", "Postdoc", "Toutes formations"];
const countries = ["Canada", "Allemagne", "Royaume-Uni", "France", "Côte d'Ivoire", "Kenya", "Nigeria", "Ghana", "Rwanda", "Maroc", "Égypte", "Afrique du Sud", "États-Unis", "Autre"];

export default function NewBoursePage() {
  const [form, setForm] = useState({
    title: "", organization: "", country: "France", flag: "🇫🇷",
    level: "Master", domain: "", deadline: "", urgent: false,
    amount: "", tags: "", published: false,
  });
  const [saved, setSaved] = useState(false);

  const update = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = (publish = false) => {
    update("published", publish);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/bourses" style={{ fontSize: "0.82rem", color: "#928E80", textDecoration: "none" }}>← Bourses</Link>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#141410" }}>
            Nouvelle bourse
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button onClick={() => handleSave(false)} style={btnOutline}>Enregistrer brouillon</button>
          <button onClick={() => handleSave(true)} style={btnPrimary}>Publier →</button>
        </div>
      </div>

      {saved && (
        <div style={{ background: "#EAF4EF", border: "1px solid rgba(26,92,64,.2)", borderRadius: 12, padding: "0.85rem 1.2rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#1A5C40", fontWeight: 500 }}>
          ✓ {form.published ? "Bourse publiée !" : "Brouillon enregistré."}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", padding: "1.8rem" }}>
            <label style={labelStyle}>Titre de la bourse *</label>
            <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Ex: Mastercard Foundation Scholars Program 2026" style={{ ...inputStyle, fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.05rem", fontWeight: 700 }} />

            <label style={{ ...labelStyle, marginTop: "1.2rem" }}>Organisation / Bailleur *</label>
            <input type="text" value={form.organization} onChange={(e) => update("organization", e.target.value)} placeholder="Ex: Mastercard Foundation" style={inputStyle} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.2rem" }}>
              <div>
                <label style={labelStyle}>Domaine d&apos;études *</label>
                <input type="text" value={form.domain} onChange={(e) => update("domain", e.target.value)} placeholder="Ex: Sciences, Tech, Toutes disciplines" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Montant / Couverture</label>
                <input type="text" value={form.amount} onChange={(e) => update("amount", e.target.value)} placeholder="Ex: 1 200 €/mois ou Financement total" style={inputStyle} />
              </div>
            </div>

            <label style={{ ...labelStyle, marginTop: "1.2rem" }}>Tags (séparés par des virgules)</label>
            <input type="text" value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="Ex: Leadership, Master, Financement total" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", position: "sticky", top: "2rem" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", padding: "1.4rem" }}>
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#141410", marginBottom: "1.2rem" }}>Détails</h3>

            <label style={labelStyle}>Niveau d&apos;études</label>
            <select value={form.level} onChange={(e) => update("level", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {levels.map((l) => <option key={l}>{l}</option>)}
            </select>

            <label style={{ ...labelStyle, marginTop: "1rem" }}>Pays d&apos;accueil</label>
            <select value={form.country} onChange={(e) => update("country", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {countries.map((c) => <option key={c}>{c}</option>)}
            </select>

            <label style={{ ...labelStyle, marginTop: "1rem" }}>Emoji drapeau</label>
            <input type="text" value={form.flag} onChange={(e) => update("flag", e.target.value)} placeholder="🇫🇷" style={{ ...inputStyle, fontSize: "1.2rem" }} />

            <label style={{ ...labelStyle, marginTop: "1rem" }}>Date limite *</label>
            <input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} style={inputStyle} />

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem", padding: "0.75rem", borderRadius: 12, background: "#FAEBE8", cursor: "pointer", border: "1px solid rgba(184,52,30,.1)" }} onClick={() => update("urgent", !form.urgent)}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid", borderColor: form.urgent ? "#B8341E" : "rgba(20,20,16,.2)", background: form.urgent ? "#B8341E" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {form.urgent && <span style={{ color: "#fff", fontSize: "0.65rem", fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#B8341E" }}>⚠️ Marquer comme urgent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#38382E", marginBottom: "0.5rem" };
const inputStyle: React.CSSProperties = { width: "100%", background: "#F8F6F1", border: "1.5px solid rgba(20,20,16,.08)", borderRadius: 12, padding: "0.7rem 0.95rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.88rem", color: "#141410", outline: "none", boxSizing: "border-box", display: "block" };
const btnPrimary: React.CSSProperties = { fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", fontWeight: 700, padding: "0.65rem 1.4rem", borderRadius: 100, cursor: "pointer", background: "#141410", color: "#fff", border: "none" };
const btnOutline: React.CSSProperties = { fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", fontWeight: 600, padding: "0.65rem 1.3rem", borderRadius: 100, cursor: "pointer", background: "transparent", color: "#38382E", border: "1.5px solid rgba(20,20,16,.12)" };
