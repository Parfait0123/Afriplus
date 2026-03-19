"use client";

/**
 * app/admin/editeur/page.tsx
 * Éditeur de blocs visuel — crée/édite le JSON de blocks[] pour
 * articles, bourses, opportunités et événements.
 * Le JSON produit peut être copié ou sauvegardé dans Supabase.
 */

import { useState, useCallback } from "react";
import type { Block } from "@/lib/data";

/* ── Types de blocs disponibles ── */
const BLOCK_DEFS: { type: Block["type"]; label: string; icon: string; desc: string }[] = [
  { type: "paragraph",  label: "Paragraphe",        icon: "¶",  desc: "Texte libre" },
  { type: "heading",    label: "Titre",              icon: "H",  desc: "Titre H2 ou H3" },
  { type: "pullquote",  label: "Citation",           icon: "❝",  desc: "Citation mise en avant" },
  { type: "factbox",    label: "Boîte de faits",     icon: "💡", desc: "Liste de faits sur fond sombre" },
  { type: "alert",      label: "Alerte",             icon: "⚠️", desc: "Info, avertissement ou conseil" },
  { type: "checklist",  label: "Checklist",          icon: "☑️", desc: "Liste de tâches cochables" },
  { type: "steps",      label: "Étapes",             icon: "1→", desc: "Processus étape par étape" },
  { type: "benefits",   label: "Avantages",          icon: "★",  desc: "Grille d'avantages avec icônes" },
  { type: "compare",    label: "Tableau comparatif", icon: "⊞",  desc: "Colonnes de comparaison" },
  { type: "external",   label: "Lien externe",       icon: "↗",  desc: "Lien avec aperçu" },
  { type: "download",   label: "Téléchargement",     icon: "↓",  desc: "Bouton de téléchargement" },
  { type: "divider",    label: "Séparateur",         icon: "—",  desc: "Ligne de séparation" },
  { type: "agenda",     label: "Agenda",             icon: "📅", desc: "Programme horodaté" },
  { type: "speakers",   label: "Intervenants",       icon: "🎤", desc: "Grille de speakers" },
  { type: "apply",      label: "CTA Candidature",    icon: "→",  desc: "Bloc d'appel à candidater" },
  { type: "location",   label: "Localisation",       icon: "📍", desc: "Adresse avec carte" },
];

/* ── Créer un bloc vide selon son type ── */
function emptyBlock(type: Block["type"]): Block {
  switch (type) {
    case "paragraph":  return { type, text: "" };
    case "heading":    return { type, text: "", level: 2 };
    case "pullquote":  return { type, text: "", author: "", role: "" };
    case "factbox":    return { type, title: "Le saviez-vous ?", facts: [""] };
    case "alert":      return { type, message: "", variant: "info" };
    case "checklist":  return { type, title: "", items: [{ label: "", detail: "" }] };
    case "steps":      return { type, title: "", items: [{ label: "", desc: "" }] };
    case "benefits":   return { type, items: [{ icon: "✅", label: "", value: "" }] };
    case "compare":    return { type, title: "", columns: [{ label: "Option A" }, { label: "Option B" }], rows: [{ label: "", values: ["", ""] }] };
    case "external":   return { type, url: "", label: "", description: "" };
    case "download":   return { type, url: "", label: "", size: "" };
    case "divider":    return { type };
    case "agenda":     return { type, title: "Programme", sessions: [{ time: "09:00", title: "", speaker: "" }] };
    case "speakers":   return { type, title: "Intervenants", people: [{ name: "", role: "", org: "" }] };
    case "apply":      return { type, label: "Postuler maintenant", url: "", note: "", deadline: "" };
    case "location":   return { type, label: "", address: "", mapUrl: "" };
    default:           return { type: "paragraph", text: "" };
  }
}

/* ── Éditeur d'un bloc ── */
function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const inp: React.CSSProperties = { width: "100%", padding: "0.55rem 0.75rem", borderRadius: 8, border: "1.5px solid rgba(20,20,16,.1)", background: "#F8F6F1", fontSize: "0.84rem", color: "#141410", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#928E80", display: "block", marginBottom: "0.3rem" };
  const row: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.25rem" };

  const set = (patch: Partial<Block>) => onChange({ ...block, ...patch } as Block);

  switch (block.type) {
    case "paragraph":
      return (
        <label style={row}>
          <span style={lbl}>Texte</span>
          <textarea value={block.text} onChange={e => set({ text: e.target.value })} rows={4}
            style={{ ...inp, resize: "vertical", lineHeight: 1.6 }} placeholder="Saisissez votre texte…" />
        </label>
      );

    case "heading":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={row}>
            <span style={lbl}>Niveau</span>
            <select value={block.level ?? 2} onChange={e => set({ level: Number(e.target.value) as 2|3 })} style={inp}>
              <option value={2}>H2 — Titre de section</option>
              <option value={3}>H3 — Sous-titre</option>
            </select>
          </label>
          <label style={row}>
            <span style={lbl}>Texte</span>
            <input value={block.text} onChange={e => set({ text: e.target.value })} style={inp} placeholder="Titre de la section" />
          </label>
        </div>
      );

    case "pullquote":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={row}>
            <span style={lbl}>Citation</span>
            <textarea value={block.text} onChange={e => set({ text: e.target.value })} rows={3} style={{ ...inp, resize: "vertical" }} placeholder="Texte de la citation…" />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <label style={row}><span style={lbl}>Auteur</span><input value={block.author ?? ""} onChange={e => set({ author: e.target.value })} style={inp} placeholder="Nom" /></label>
            <label style={row}><span style={lbl}>Rôle</span><input value={block.role ?? ""} onChange={e => set({ role: e.target.value })} style={inp} placeholder="Titre, fonction" /></label>
          </div>
        </div>
      );

    case "factbox":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={row}><span style={lbl}>Titre</span><input value={block.title} onChange={e => set({ title: e.target.value })} style={inp} /></label>
          {block.facts.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
              <input value={f} onChange={e => { const facts = [...block.facts]; facts[i] = e.target.value; set({ facts }); }}
                style={{ ...inp, flex: 1 }} placeholder={`Fait ${i + 1}`} />
              <button onClick={() => set({ facts: block.facts.filter((_, j) => j !== i) })}
                style={{ padding: "0 0.75rem", borderRadius: 8, border: "none", background: "#FAEBE8", color: "#B8341E", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0, fontFamily: "inherit" }}>✕</button>
            </div>
          ))}
          <button onClick={() => set({ facts: [...block.facts, ""] })}
            style={{ alignSelf: "flex-start", padding: "0.4rem 0.85rem", borderRadius: 8, border: "1.5px dashed rgba(20,20,16,.15)", background: "transparent", color: "#928E80", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit" }}>
            + Ajouter un fait
          </button>
        </div>
      );

    case "alert":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={row}>
            <span style={lbl}>Type</span>
            <select value={block.variant ?? "info"} onChange={e => set({ variant: e.target.value as "info"|"warning"|"tip" })} style={inp}>
              <option value="info">ℹ️ Information</option>
              <option value="warning">⚠️ Avertissement</option>
              <option value="tip">💡 Conseil</option>
            </select>
          </label>
          <label style={row}>
            <span style={lbl}>Message</span>
            <textarea value={block.message} onChange={e => set({ message: e.target.value })} rows={3} style={{ ...inp, resize: "vertical" }} />
          </label>
        </div>
      );

    case "checklist":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={row}><span style={lbl}>Titre (optionnel)</span><input value={block.title ?? ""} onChange={e => set({ title: e.target.value })} style={inp} /></label>
          {block.items.map((item, i) => (
            <div key={i} style={{ background: "#F8F6F1", borderRadius: 10, padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input value={item.label} onChange={e => { const items = [...block.items]; items[i] = { ...items[i], label: e.target.value }; set({ items }); }}
                  style={{ ...inp, flex: 1 }} placeholder={`Tâche ${i + 1}`} />
                <button onClick={() => set({ items: block.items.filter((_, j) => j !== i) })}
                  style={{ padding: "0 0.75rem", borderRadius: 8, border: "none", background: "#FAEBE8", color: "#B8341E", cursor: "pointer", fontWeight: 700, flexShrink: 0, fontFamily: "inherit" }}>✕</button>
              </div>
              <input value={item.detail ?? ""} onChange={e => { const items = [...block.items]; items[i] = { ...items[i], detail: e.target.value }; set({ items }); }}
                style={inp} placeholder="Détail (optionnel)" />
            </div>
          ))}
          <button onClick={() => set({ items: [...block.items, { label: "", detail: "" }] })}
            style={{ alignSelf: "flex-start", padding: "0.4rem 0.85rem", borderRadius: 8, border: "1.5px dashed rgba(20,20,16,.15)", background: "transparent", color: "#928E80", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit" }}>
            + Ajouter une tâche
          </button>
        </div>
      );

    case "steps":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={row}><span style={lbl}>Titre (optionnel)</span><input value={block.title ?? ""} onChange={e => set({ title: e.target.value })} style={inp} /></label>
          {block.items.map((item, i) => (
            <div key={i} style={{ background: "#F8F6F1", borderRadius: 10, padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#141410", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.75rem", flexShrink: 0 }}>{i + 1}</div>
                <input value={item.label} onChange={e => { const items = [...block.items]; items[i] = { ...items[i], label: e.target.value }; set({ items }); }}
                  style={{ ...inp, flex: 1 }} placeholder="Étiquette" />
                <button onClick={() => set({ items: block.items.filter((_, j) => j !== i) })}
                  style={{ padding: "0 0.75rem", borderRadius: 8, border: "none", background: "#FAEBE8", color: "#B8341E", cursor: "pointer", fontWeight: 700, flexShrink: 0, fontFamily: "inherit" }}>✕</button>
              </div>
              <textarea value={item.desc} onChange={e => { const items = [...block.items]; items[i] = { ...items[i], desc: e.target.value }; set({ items }); }}
                rows={2} style={{ ...inp, resize: "vertical" }} placeholder="Description de l'étape" />
            </div>
          ))}
          <button onClick={() => set({ items: [...block.items, { label: "", desc: "" }] })}
            style={{ alignSelf: "flex-start", padding: "0.4rem 0.85rem", borderRadius: 8, border: "1.5px dashed rgba(20,20,16,.15)", background: "transparent", color: "#928E80", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit" }}>
            + Ajouter une étape
          </button>
        </div>
      );

    case "external":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={row}><span style={lbl}>URL</span><input type="url" value={block.url} onChange={e => set({ url: e.target.value })} style={inp} placeholder="https://…" /></label>
          <label style={row}><span style={lbl}>Étiquette</span><input value={block.label} onChange={e => set({ label: e.target.value })} style={inp} /></label>
          <label style={row}><span style={lbl}>Description (optionnel)</span><input value={block.description ?? ""} onChange={e => set({ description: e.target.value })} style={inp} /></label>
        </div>
      );

    case "download":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={row}><span style={lbl}>URL du fichier</span><input type="url" value={block.url} onChange={e => set({ url: e.target.value })} style={inp} placeholder="https://…" /></label>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
            <label style={row}><span style={lbl}>Étiquette</span><input value={block.label} onChange={e => set({ label: e.target.value })} style={inp} /></label>
            <label style={row}><span style={lbl}>Taille</span><input value={block.size ?? ""} onChange={e => set({ size: e.target.value })} style={inp} placeholder="ex. 2.4 Mo" /></label>
          </div>
        </div>
      );

    case "apply":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={row}><span style={lbl}>Titre du CTA</span><input value={block.label} onChange={e => set({ label: e.target.value })} style={inp} /></label>
          <label style={row}><span style={lbl}>URL de candidature</span><input type="url" value={block.url} onChange={e => set({ url: e.target.value })} style={inp} placeholder="https://…" /></label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <label style={row}><span style={lbl}>Date limite (texte)</span><input value={block.deadline ?? ""} onChange={e => set({ deadline: e.target.value })} style={inp} placeholder="ex. 15 Avr 2026" /></label>
            <label style={row}><span style={lbl}>Note (optionnel)</span><input value={block.note ?? ""} onChange={e => set({ note: e.target.value })} style={inp} /></label>
          </div>
        </div>
      );

    case "location":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={row}><span style={lbl}>Nom du lieu</span><input value={block.label} onChange={e => set({ label: e.target.value })} style={inp} /></label>
          <label style={row}><span style={lbl}>Adresse</span><input value={block.address ?? ""} onChange={e => set({ address: e.target.value })} style={inp} /></label>
          <label style={row}><span style={lbl}>URL embed carte (optionnel)</span><input value={block.mapUrl ?? ""} onChange={e => set({ mapUrl: e.target.value })} style={inp} placeholder="https://maps.google.com/maps?…&output=embed" /></label>
        </div>
      );

    case "agenda":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={row}><span style={lbl}>Titre</span><input value={block.title ?? ""} onChange={e => set({ title: e.target.value })} style={inp} /></label>
          {block.sessions.map((s, i) => (
            <div key={i} style={{ background: "#F8F6F1", borderRadius: 10, padding: "0.75rem", display: "grid", gridTemplateColumns: "80px 1fr 1fr auto", gap: "0.5rem", alignItems: "center" }}>
              <input value={s.time} onChange={e => { const sessions = [...block.sessions]; sessions[i] = { ...sessions[i], time: e.target.value }; set({ sessions }); }}
                style={{ ...inp }} placeholder="09:00" />
              <input value={s.title} onChange={e => { const sessions = [...block.sessions]; sessions[i] = { ...sessions[i], title: e.target.value }; set({ sessions }); }}
                style={inp} placeholder="Titre de la session" />
              <input value={s.speaker ?? ""} onChange={e => { const sessions = [...block.sessions]; sessions[i] = { ...sessions[i], speaker: e.target.value }; set({ sessions }); }}
                style={inp} placeholder="Intervenant (optionnel)" />
              <button onClick={() => set({ sessions: block.sessions.filter((_, j) => j !== i) })}
                style={{ padding: "0.4rem 0.65rem", borderRadius: 8, border: "none", background: "#FAEBE8", color: "#B8341E", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>✕</button>
            </div>
          ))}
          <button onClick={() => set({ sessions: [...block.sessions, { time: "", title: "", speaker: "" }] })}
            style={{ alignSelf: "flex-start", padding: "0.4rem 0.85rem", borderRadius: 8, border: "1.5px dashed rgba(20,20,16,.15)", background: "transparent", color: "#928E80", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit" }}>
            + Ajouter une session
          </button>
        </div>
      );

    case "speakers":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={row}><span style={lbl}>Titre</span><input value={block.title ?? ""} onChange={e => set({ title: e.target.value })} style={inp} /></label>
          {block.people.map((p, i) => (
            <div key={i} style={{ background: "#F8F6F1", borderRadius: 10, padding: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.5rem" }}>
              <input value={p.name} onChange={e => { const people = [...block.people]; people[i] = { ...people[i], name: e.target.value }; set({ people }); }}
                style={inp} placeholder="Nom" />
              <input value={p.role} onChange={e => { const people = [...block.people]; people[i] = { ...people[i], role: e.target.value }; set({ people }); }}
                style={inp} placeholder="Rôle / titre" />
              <input value={p.org ?? ""} onChange={e => { const people = [...block.people]; people[i] = { ...people[i], org: e.target.value }; set({ people }); }}
                style={inp} placeholder="Organisation" />
              <button onClick={() => set({ people: block.people.filter((_, j) => j !== i) })}
                style={{ padding: "0.4rem 0.65rem", borderRadius: 8, border: "none", background: "#FAEBE8", color: "#B8341E", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>✕</button>
            </div>
          ))}
          <button onClick={() => set({ people: [...block.people, { name: "", role: "", org: "" }] })}
            style={{ alignSelf: "flex-start", padding: "0.4rem 0.85rem", borderRadius: 8, border: "1.5px dashed rgba(20,20,16,.15)", background: "transparent", color: "#928E80", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit" }}>
            + Ajouter un intervenant
          </button>
        </div>
      );

    case "divider":
      return <div style={{ padding: "0.5rem 0", color: "#928E80", fontSize: "0.82rem", textAlign: "center" }}>— Séparateur —</div>;

    default:
      return <div style={{ color: "#928E80", fontSize: "0.82rem" }}>Éditeur non disponible pour ce type.</div>;
  }
}

/* ══════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════ */
export default function AdminEditeurPage() {
  const [blocks,    setBlocks]    = useState<Block[]>([]);
  const [showPicker,setShowPicker]= useState(false);
  const [copied,    setCopied]    = useState(false);
  const [jsonView,  setJsonView]  = useState(false);

  const addBlock = (type: Block["type"]) => {
    setBlocks(prev => [...prev, emptyBlock(type)]);
    setShowPicker(false);
  };

  const updateBlock = useCallback((i: number, b: Block) => {
    setBlocks(prev => prev.map((old, j) => j === i ? b : old));
  }, []);

  const removeBlock = (i: number) => setBlocks(prev => prev.filter((_, j) => j !== i));

  const moveUp   = (i: number) => { if (i === 0) return; setBlocks(prev => { const a = [...prev]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; }); };
  const moveDown = (i: number) => { if (i === blocks.length - 1) return; setBlocks(prev => { const a = [...prev]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; }); };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(blocks, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "2rem 2rem 5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "1.9rem", fontWeight: 900, color: "#141410", letterSpacing: "-0.04em", marginBottom: "0.3rem" }}>
            ✏️ Éditeur de blocs
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#928E80" }}>Composez le contenu riche · {blocks.length} bloc{blocks.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button onClick={() => setJsonView(!jsonView)}
            style={{ padding: "0.55rem 1.1rem", borderRadius: 100, border: "1.5px solid rgba(20,20,16,.12)", background: jsonView ? "#141410" : "transparent", color: jsonView ? "#fff" : "#38382E", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {jsonView ? "Éditeur" : "Voir JSON"}
          </button>
          <button onClick={copyJSON}
            style={{ padding: "0.55rem 1.25rem", borderRadius: 100, border: "none", background: copied ? "#1A5C40" : "#C08435", color: "#fff", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "background .2s" }}>
            {copied ? "✓ Copié !" : "Copier JSON"}
          </button>
          <button onClick={() => setBlocks([])}
            style={{ padding: "0.55rem 1rem", borderRadius: 100, border: "1.5px solid rgba(184,52,30,.2)", background: "#FAEBE8", color: "#B8341E", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Vider
          </button>
        </div>
      </div>

      {/* Vue JSON */}
      {jsonView ? (
        <div style={{ background: "#141410", borderRadius: 16, padding: "1.5rem", overflow: "auto" }}>
          <pre style={{ margin: 0, fontSize: "0.78rem", color: "#E09B48", fontFamily: "'Fira Code', 'Courier New', monospace", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(blocks, null, 2)}
          </pre>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

          {blocks.length === 0 && (
            <div style={{ background: "#fff", borderRadius: 20, border: "2px dashed rgba(20,20,16,.12)", padding: "3rem", textAlign: "center", marginBottom: "1rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📝</div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.1rem", fontWeight: 700, color: "#141410", marginBottom: "0.4rem" }}>Aucun bloc</div>
              <div style={{ fontSize: "0.82rem", color: "#928E80" }}>Cliquez sur "Ajouter un bloc" pour commencer.</div>
            </div>
          )}

          {blocks.map((block, i) => {
            const def = BLOCK_DEFS.find(d => d.type === block.type);
            return (
              <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(20,20,16,.07)", marginBottom: "0.75rem", overflow: "hidden", boxShadow: "0 2px 8px rgba(20,20,16,.04)" }}>
                {/* Bloc header */}
                <div style={{ display: "flex", alignItems: "center", padding: "0.7rem 1rem", background: "#F8F6F1", borderBottom: "1px solid rgba(20,20,16,.07)", gap: "0.75rem" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#141410", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 900, flexShrink: 0 }}>
                    {def?.icon ?? "?"}
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#38382E", flex: 1 }}>{def?.label ?? block.type}</span>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button onClick={() => moveUp(i)} disabled={i === 0}
                      style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(20,20,16,.1)", background: "transparent", color: i === 0 ? "rgba(20,20,16,.2)" : "#38382E", cursor: i === 0 ? "default" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ↑
                    </button>
                    <button onClick={() => moveDown(i)} disabled={i === blocks.length - 1}
                      style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(20,20,16,.1)", background: "transparent", color: i === blocks.length - 1 ? "rgba(20,20,16,.2)" : "#38382E", cursor: i === blocks.length - 1 ? "default" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ↓
                    </button>
                    <button onClick={() => removeBlock(i)}
                      style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(184,52,30,.2)", background: "#FAEBE8", color: "#B8341E", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700 }}>
                      ✕
                    </button>
                  </div>
                </div>
                {/* Bloc body */}
                <div style={{ padding: "1rem" }}>
                  <BlockEditor block={block} onChange={b => updateBlock(i, b)} />
                </div>
              </div>
            );
          })}

          {/* Bouton ajouter */}
          <button onClick={() => setShowPicker(!showPicker)}
            style={{ width: "100%", padding: "0.85rem", borderRadius: 14, border: "2px dashed rgba(20,20,16,.15)", background: showPicker ? "#141410" : "transparent", color: showPicker ? "#fff" : "#928E80", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .18s" }}>
            {showPicker ? "Annuler" : "+ Ajouter un bloc"}
          </button>

          {/* Picker de blocs */}
          {showPicker && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(20,20,16,.07)", padding: "1.25rem", marginTop: "0.75rem", boxShadow: "0 8px 32px rgba(20,20,16,.1)" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.85rem" }}>
                Choisir un type de bloc
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.5rem" }}>
                {BLOCK_DEFS.map(def => (
                  <button key={def.type} onClick={() => addBlock(def.type)}
                    style={{ padding: "0.75rem", borderRadius: 12, border: "1.5px solid rgba(20,20,16,.08)", background: "#F8F6F1", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#C08435"; (e.currentTarget as HTMLElement).style.background = "#FBF4E8"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(20,20,16,.08)"; (e.currentTarget as HTMLElement).style.background = "#F8F6F1"; }}>
                    <div style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>{def.icon}</div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#141410", marginBottom: "0.15rem" }}>{def.label}</div>
                    <div style={{ fontSize: "0.65rem", color: "#928E80" }}>{def.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}