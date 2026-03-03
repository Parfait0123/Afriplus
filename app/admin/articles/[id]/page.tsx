"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { articles } from "@/lib/data";
import type { Category } from "@/lib/data";

const categories: Category[] = ["Politique", "Économie", "Tech", "Sport", "Culture", "Santé", "Environnement"];

export default function ArticleEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "nouveau";
  const existing = !isNew ? articles.find((a) => a.id === params.id) : null;

  const [form, setForm] = useState({
    title: existing?.title || "",
    excerpt: existing?.excerpt || "",
    content: "",
    category: existing?.category || "Économie",
    author: existing?.author || "",
    readTime: existing?.readTime || 5,
    featured: existing?.featured || false,
    published: true,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO: Supabase insert/update
    // const { error } = await supabase.from('articles').upsert({ ...form, slug: slugify(form.title) })
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ padding: "2.5rem", maxWidth: 960 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.78rem", color: "#928E80" }}>
        <Link href="/admin/articles" style={{ color: "#928E80", textDecoration: "none" }}>Actualités</Link>
        <span>/</span>
        <span style={{ color: "#141410" }}>{isNew ? "Nouvel article" : "Éditer"}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 900, color: "#141410", letterSpacing: "-0.04em" }}>
          {isNew ? "Rédiger un article" : "Éditer l'article"}
        </h1>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <Link href="/admin/articles" style={{ ...btnOutline }}>Annuler</Link>
          <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1, cursor: saving ? "wait" : "pointer" }}>
            {saving ? "Enregistrement…" : saved ? "✓ Enregistré !" : "Publier"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem", alignItems: "start" }}>

        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Titre *</label>
            <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} required placeholder="Titre de l'article" style={{ ...inputStyle, fontSize: "1.05rem", fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Chapeau / Extrait *</label>
            <textarea value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} required placeholder="Un résumé accrocheur en 1-2 phrases…" rows={3}
              style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Corps de l&apos;article</label>
            <textarea value={form.content} onChange={(e) => update("content", e.target.value)} placeholder="Rédigez le contenu complet ici. Markdown supporté." rows={16}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.8 }} />
            <div style={{ fontSize: "0.68rem", color: "#928E80", marginTop: "0.4rem" }}>
              💡 Markdown supporté : **gras**, *italique*, ## titres, [lien](url)
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", position: "sticky", top: "1.5rem" }}>

          {/* Publish */}
          <div style={cardStyle}>
            <h3 style={cardTitle}>Publication</h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0", borderTop: "1px solid rgba(20,20,16,.07)" }}>
              <span style={{ fontSize: "0.82rem", color: "#38382E" }}>Statut</span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, background: "#EAF4EF", color: "#1A5C40", padding: "0.2rem 0.65rem", borderRadius: 100 }}>Publié</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0", borderTop: "1px solid rgba(20,20,16,.07)" }}>
              <span style={{ fontSize: "0.82rem", color: "#38382E" }}>En vedette</span>
              <button type="button" onClick={() => update("featured", !form.featured)}
                style={{ width: 44, height: 24, borderRadius: 100, background: form.featured ? "#C08435" : "#E0DDD8", border: "none", cursor: "pointer", position: "relative", transition: "background .2s" }}>
                <span style={{ position: "absolute", top: 3, left: form.featured ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
              </button>
            </div>
          </div>

          {/* Category */}
          <div style={cardStyle}>
            <h3 style={cardTitle}>Catégorie</h3>
            <select value={form.category} onChange={(e) => update("category", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Meta */}
          <div style={cardStyle}>
            <h3 style={cardTitle}>Métadonnées</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div>
                <label style={labelStyle}>Auteur</label>
                <input type="text" value={form.author} onChange={(e) => update("author", e.target.value)} placeholder="Nom de l'auteur" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Temps de lecture (min)</label>
                <input type="number" value={form.readTime} onChange={(e) => update("readTime", parseInt(e.target.value))} min={1} max={60} style={inputStyle} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ ...btnPrimary, justifyContent: "center", opacity: saving ? 0.7 : 1, cursor: saving ? "wait" : "pointer" }}>
            {saving ? "Enregistrement…" : saved ? "✓ Enregistré !" : isNew ? "Publier l'article" : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}

const fieldWrap: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.5rem" };
const labelStyle: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "#38382E" };
const inputStyle: React.CSSProperties = { width: "100%", background: "#fff", border: "1.5px solid rgba(20,20,16,.1)", borderRadius: 12, padding: "0.72rem 1rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.88rem", color: "#141410", outline: "none", boxSizing: "border-box" as const };
const btnPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", fontWeight: 700, padding: "0.65rem 1.4rem", borderRadius: 100, background: "#141410", color: "#fff", border: "none" };
const btnOutline: React.CSSProperties = { display: "inline-flex", alignItems: "center", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", fontWeight: 600, padding: "0.65rem 1.2rem", borderRadius: 100, background: "transparent", color: "#38382E", border: "1.5px solid rgba(20,20,16,.12)", textDecoration: "none" };
const cardStyle: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: "1.2rem", border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 3px rgba(20,20,16,.04)" };
const cardTitle: React.CSSProperties = { fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.88rem", fontWeight: 700, color: "#141410", marginBottom: "0.75rem" };
