"use client";
import { useState } from "react";
import Link from "next/link";

const categories = ["Politique", "Économie", "Tech", "Sport", "Culture", "Santé", "Environnement"];

export default function NewArticlePage() {
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Tech",
    author: "",
    readTime: 5,
    featured: false,
    published: false,
  });
  const [saved, setSaved] = useState(false);

  const update = (k: string, v: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = (publish = false) => {
    update("published", publish);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/articles" style={{ fontSize: "0.82rem", color: "#928E80", textDecoration: "none" }}>
            ← Actualités
          </Link>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#141410" }}>
            Nouvel article
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            onClick={() => handleSave(false)}
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", fontWeight: 600, padding: "0.65rem 1.3rem", borderRadius: 100, cursor: "pointer", background: "transparent", color: "#38382E", border: "1.5px solid rgba(20,20,16,.12)" }}
          >
            Enregistrer brouillon
          </button>
          <button
            onClick={() => handleSave(true)}
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", fontWeight: 700, padding: "0.65rem 1.4rem", borderRadius: 100, cursor: "pointer", background: "#141410", color: "#fff", border: "none" }}
          >
            Publier →
          </button>
        </div>
      </div>

      {saved && (
        <div style={{ background: "#EAF4EF", border: "1px solid rgba(26,92,64,.2)", borderRadius: 12, padding: "0.85rem 1.2rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#1A5C40", fontWeight: 500 }}>
          ✓ {form.published ? "Article publié avec succès !" : "Brouillon enregistré."}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        {/* Main editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", padding: "1.8rem" }}>
            <label style={labelStyle}>Titre de l&apos;article *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Ex: L'Union Africaine signe un accord historique…"
              style={{ ...inputStyle, fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700 }}
            />

            <label style={{ ...labelStyle, marginTop: "1.2rem" }}>Accroche / Résumé *</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              placeholder="Un résumé accrocheur visible dans les listes et les aperçus…"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
            />

            <label style={{ ...labelStyle, marginTop: "1.2rem" }}>Contenu de l&apos;article *</label>
            <textarea
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder="Rédigez le contenu complet de l'article ici…&#10;&#10;Vous pouvez utiliser du markdown : **gras**, *italique*, ## Titre…"
              rows={18}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.85, fontFamily: "'DM Sans', monospace", fontSize: "0.87rem" }}
            />
          </div>
        </div>

        {/* Sidebar settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", position: "sticky", top: "2rem" }}>
          {/* Publish settings */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", padding: "1.4rem" }}>
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#141410", marginBottom: "1.2rem" }}>Paramètres</h3>

            <label style={labelStyle}>Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={{ ...labelStyle, marginTop: "1rem" }}>Auteur</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => update("author", e.target.value)}
              placeholder="Nom de l'auteur"
              style={inputStyle}
            />

            <label style={{ ...labelStyle, marginTop: "1rem" }}>Temps de lecture (min)</label>
            <input
              type="number"
              value={form.readTime}
              onChange={(e) => update("readTime", parseInt(e.target.value))}
              min={1} max={60}
              style={inputStyle}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem", padding: "0.75rem", borderRadius: 12, background: "#F8F6F1", cursor: "pointer" }} onClick={() => update("featured", !form.featured)}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid", borderColor: form.featured ? "#C08435" : "rgba(20,20,16,.2)", background: form.featured ? "#C08435" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {form.featured && <span style={{ color: "#fff", fontSize: "0.65rem", fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#38382E" }}>Article à la une</span>
            </div>
          </div>

          {/* Image */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", padding: "1.4rem" }}>
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#141410", marginBottom: "1rem" }}>Image de couverture</h3>
            <div style={{ border: "2px dashed rgba(20,20,16,.12)", borderRadius: 14, padding: "2rem", textAlign: "center", cursor: "pointer", background: "#F8F6F1" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🖼️</div>
              <div style={{ fontSize: "0.8rem", color: "#928E80", fontWeight: 500 }}>Glissez une image ou cliquez</div>
              <div style={{ fontSize: "0.72rem", color: "#928E80", marginTop: "0.25rem" }}>PNG, JPG, WebP — max 5 MB</div>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <label style={{ ...labelStyle, marginBottom: "0.4rem" }}>URL d&apos;image (optionnel)</label>
              <input type="url" placeholder="https://…" style={inputStyle} />
            </div>
          </div>

          {/* SEO preview */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", padding: "1.4rem" }}>
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#141410", marginBottom: "1rem" }}>Aperçu SEO</h3>
            <div style={{ background: "#F8F6F1", borderRadius: 12, padding: "1rem", fontSize: "0.78rem" }}>
              <div style={{ color: "#1E4DA8", marginBottom: "0.2rem", fontWeight: 600 }}>afripulse.com/actualites/…</div>
              <div style={{ color: "#141410", fontWeight: 700, lineHeight: 1.3, marginBottom: "0.3rem" }}>
                {form.title || "Titre de l'article"}
              </div>
              <div style={{ color: "#928E80", lineHeight: 1.5 }}>
                {form.excerpt?.slice(0, 120) || "Résumé de l'article…"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#38382E",
  marginBottom: "0.5rem",
  letterSpacing: "0.02em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#F8F6F1",
  border: "1.5px solid rgba(20,20,16,.08)",
  borderRadius: 12,
  padding: "0.7rem 0.95rem",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "0.88rem",
  color: "#141410",
  outline: "none",
  boxSizing: "border-box",
  display: "block",
};
