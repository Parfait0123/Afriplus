"use client";

/**
 * components/admin/BlockBuilder.tsx
 * Éditeur de blocs visuel simplifié pour non-développeurs.
 */

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Block } from "@/types/blocks";

/* ── Définitions des blocs ──────────────────────────────── */
const BLOCK_DEFS = [
  {
    group: "Texte",
    items: [
      { type: "paragraph" as const, icon: "¶",  label: "Paragraphe",            desc: "Un bloc de texte classique",                  color: "#1A5C40" },
      { type: "heading"   as const, icon: "T",  label: "Titre de section",       desc: "Titre visible dans le sommaire",              color: "#1E4DA8" },
      { type: "pullquote" as const, icon: "❝",  label: "Citation mise en avant", desc: "Met en valeur une phrase importante",         color: "#7A4A1E" },
    ],
  },
  {
    group: "Médias",
    items: [
      { type: "image" as const, icon: "🖼", label: "Image", desc: "Uploader depuis le PC ou coller un lien", color: "#1A5C5C" },
      { type: "video" as const, icon: "▶",  label: "Vidéo", desc: "YouTube, Vimeo ou autre lien vidéo",      color: "#B8341E" },
    ],
  },
  {
    group: "Informations",
    items: [
      { type: "factbox"   as const, icon: "💡", label: "Boîte de faits",        desc: "Liste de chiffres ou faits clés",             color: "#C08435" },
      { type: "checklist" as const, icon: "✅", label: "Liste de points",        desc: "Points avec coche (critères, conditions…)",   color: "#1A5C40" },
      { type: "steps"     as const, icon: "1→", label: "Étapes numérotées",      desc: "Processus à suivre dans l'ordre",             color: "#1E4DA8" },
      { type: "benefits"  as const, icon: "★",  label: "Avantages / Bénéfices",  desc: "Grille avec icônes et valeurs",               color: "#1A5C40" },
      { type: "compare"   as const, icon: "⊞",  label: "Tableau comparatif",     desc: "Comparer plusieurs options côte à côte",      color: "#7A4A1E" },
    ],
  },
  {
    group: "Actions",
    items: [
      { type: "alert"    as const, icon: "⚠",  label: "Note d'information",    desc: "Info, avertissement ou conseil en couleur",   color: "#C08435" },
      { type: "apply"    as const, icon: "→",  label: "Bouton de candidature", desc: "CTA avec lien, date limite et note",          color: "#1A5C40" },
      { type: "external" as const, icon: "↗",  label: "Lien externe",          desc: "Lien vers un site avec aperçu",               color: "#1E4DA8" },
      { type: "download" as const, icon: "↓",  label: "Fichier à télécharger", desc: "Bouton pour télécharger un document",         color: "#928E80" },
      { type: "related"  as const, icon: "↪",  label: "Renvoi vers un article",desc: "\"À lire aussi\" vers un autre article",      color: "#7A4A1E" },
    ],
  },
  {
    group: "Événement",
    items: [
      { type: "agenda"   as const, icon: "📅", label: "Programme / Agenda", desc: "Liste des sessions avec horaires",           color: "#1A5C5C" },
      { type: "speakers" as const, icon: "🎤", label: "Intervenants",        desc: "Grille de cartes personnes",                color: "#7A4A1E" },
      { type: "location" as const, icon: "📍", label: "Lieu",                desc: "Adresse avec carte intégrée optionnelle",   color: "#1E4DA8" },
    ],
  },
  {
    group: "Mise en page",
    items: [
      { type: "divider" as const, icon: "—", label: "Séparateur", desc: "Ligne de séparation entre deux sections", color: "#928E80" },
    ],
  },
] as const;

/* ── Bloc vide ──────────────────────────────────────────── */
function emptyBlock(type: Block["type"]): Block {
  switch (type) {
    case "paragraph":  return { type, text: "" };
    case "heading":    return { type, text: "", level: 2 };
    case "pullquote":  return { type, text: "", author: "", role: "" };
    case "image":      return { type, url: "", alt: "", caption: "" };
    case "video":      return { type, url: "", caption: "" };
    case "factbox":    return { type, title: "Chiffres clés", facts: [""] };
    case "checklist":  return { type, title: "", items: [{ label: "", detail: "" }] };
    case "steps":      return { type, title: "", items: [{ label: "", desc: "" }] };
    case "benefits":   return { type, items: [{ icon: "✅", label: "", value: "" }] };
    case "compare":    return { type, title: "", columns: [{ label: "Option A" }, { label: "Option B" }], rows: [{ label: "", values: ["", ""] }] };
    case "alert":      return { type, message: "", variant: "info" };
    case "apply":      return { type, label: "Postuler maintenant", url: "", deadline: "", note: "" };
    case "external":   return { type, url: "", label: "", description: "" };
    case "download":   return { type, url: "", label: "Télécharger le document", size: "" };
    case "related":    return { type, slug: "", label: "" };
    case "agenda":     return { type, title: "Programme", sessions: [{ time: "09h00", title: "", speaker: "" }] };
    case "speakers":   return { type, title: "Intervenants", people: [{ name: "", role: "", org: "" }] };
    case "location":   return { type, label: "", address: "", mapUrl: "" };
    case "divider":    return { type };
    default:           return { type: "paragraph", text: "" };
  }
}

/* ── Styles ─────────────────────────────────────────────── */
const inp: React.CSSProperties = {
  width: "100%", padding: "0.6rem 0.85rem", borderRadius: 10,
  border: "1.5px solid rgba(20,20,16,.1)", background: "#F8F6F1",
  fontSize: "0.85rem", color: "#141410", fontFamily: "inherit",
  outline: "none", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "#928E80",
  display: "block", marginBottom: "0.35rem",
};
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.25rem" };
const addRowBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "0.4rem",
  padding: "0.4rem 0.85rem", borderRadius: 8,
  border: "1.5px dashed rgba(20,20,16,.15)", background: "transparent",
  color: "#928E80", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit",
};
const removeBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 7, border: "none",
  background: "#FAEBE8", color: "#B8341E", cursor: "pointer",
  fontFamily: "inherit", fontWeight: 700, fontSize: "0.75rem",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};

/* ══════════════════════════════════════════════════════════
   BLOC IMAGE — upload PC + lien URL
══════════════════════════════════════════════════════════ */
function ImageBlockEditor({
  block,
  onChange,
}: {
  block: Extract<Block, { type: "image" }>;
  onChange: (b: Block) => void;
}) {
  const sb       = createClient();
  const fileRef  = useRef<HTMLInputElement>(null);
  const [mode,      setMode]      = useState<"upload" | "url">(block.url ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const [errMsg,    setErrMsg]    = useState<string | null>(null);
  const [urlDraft,  setUrlDraft]  = useState(block.url ?? "");

  const patch = (p: Partial<typeof block>) => onChange({ ...block, ...p } as Block);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrMsg("Format non supporté. Utilisez JPG, PNG ou WebP."); return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrMsg("Image trop lourde (max 8 Mo)."); return;
    }
    setErrMsg(null);
    setUploading(true);
    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `blocks/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await sb.storage
      .from("articles")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) { setErrMsg("Échec : " + error.message); setUploading(false); return; }
    const { data: u } = sb.storage.from("articles").getPublicUrl(data.path);
    patch({ url: u.publicUrl });
    setUrlDraft(u.publicUrl);
    setUploading(false);
  };

  const applyUrl = () => {
    const v = urlDraft.trim();
    if (v) patch({ url: v });
  };

  const reset = () => {
    patch({ url: "" });
    setUrlDraft("");
    setErrMsg(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>

      {/* Aperçu si image chargée */}
      {block.url && (
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden",
          border: "1px solid rgba(20,20,16,.08)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.url} alt="aperçu"
            style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }} />
          <button onClick={reset}
            style={{ position: "absolute", top: "0.6rem", right: "0.6rem",
              background: "rgba(0,0,0,.6)", color: "#fff", border: "none",
              borderRadius: 8, padding: "0.3rem 0.8rem", cursor: "pointer",
              fontSize: "0.72rem", fontWeight: 700, fontFamily: "inherit" }}>
            ✕ Changer l&apos;image
          </button>
        </div>
      )}

      {/* Zone de saisie si pas d'image */}
      {!block.url && (
        <>
          {/* Onglets */}
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden",
            border: "1.5px solid rgba(20,20,16,.1)" }}>
            {(["upload", "url"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{ flex: 1, padding: "0.55rem", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "0.78rem", fontWeight: 600,
                  transition: "all .15s",
                  background: mode === m ? "#141410" : "#F8F6F1",
                  color: mode === m ? "#fff" : "#928E80" }}>
                {m === "upload" ? "📁 Depuis mon PC" : "🔗 Coller un lien"}
              </button>
            ))}
          </div>

          {/* MODE UPLOAD */}
          {mode === "upload" && (
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              onDragOver={e => {
                e.preventDefault();
                (e.currentTarget as HTMLElement).style.borderColor = "#C08435";
                (e.currentTarget as HTMLElement).style.background = "rgba(192,132,53,.04)";
              }}
              onDragLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(20,20,16,.15)";
                (e.currentTarget as HTMLElement).style.background = "#F8F6F1";
              }}
              onDrop={e => {
                e.preventDefault();
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(20,20,16,.15)";
                (e.currentTarget as HTMLElement).style.background = "#F8F6F1";
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              style={{ border: "2px dashed rgba(20,20,16,.15)", borderRadius: 12,
                padding: "2.5rem 1.5rem", textAlign: "center",
                cursor: uploading ? "default" : "pointer",
                background: "#F8F6F1", transition: "all .2s" }}>
              {uploading ? (
                <>
                  <div style={{ width: 32, height: 32, borderRadius: "50%",
                    border: "3px solid rgba(192,132,53,.2)", borderTopColor: "#C08435",
                    animation: "bbspin .7s linear infinite", margin: "0 auto 0.75rem" }}/>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#C08435" }}>
                    Upload en cours…
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>🖼️</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600,
                    color: "#38382E", marginBottom: "0.3rem" }}>
                    Cliquez ou glissez une image ici
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#928E80" }}>
                    JPG, PNG, WebP — max 8 Mo
                  </div>
                </>
              )}
            </div>
          )}

          {/* MODE URL */}
          {mode === "url" && (
            <div style={field}>
              <label style={lbl}>Coller le lien de l&apos;image</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="url" autoFocus
                  value={urlDraft}
                  onChange={e => setUrlDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyUrl(); } }}
                  style={{ ...inp, flex: 1 }}
                  placeholder="https://example.com/image.jpg"
                />
                <button onClick={applyUrl} disabled={!urlDraft.trim()}
                  style={{ padding: "0 1.1rem", borderRadius: 10, border: "none",
                    background: urlDraft.trim() ? "#141410" : "rgba(20,20,16,.1)",
                    color: urlDraft.trim() ? "#fff" : "#928E80",
                    cursor: urlDraft.trim() ? "pointer" : "default",
                    fontSize: "0.78rem", fontWeight: 700, fontFamily: "inherit",
                    flexShrink: 0, whiteSpace: "nowrap" }}>
                  Utiliser
                </button>
              </div>
              {/* Mini aperçu live */}
              {urlDraft && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlDraft} alt="aperçu"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  onLoad={e => { (e.currentTarget as HTMLImageElement).style.display = "block"; }}
                  style={{ display: "none", marginTop: "0.5rem", borderRadius: 8,
                    maxHeight: 140, objectFit: "cover", width: "100%",
                    border: "1px solid rgba(20,20,16,.08)" }} />
              )}
            </div>
          )}

          {/* Input fichier caché */}
          <input ref={fileRef} type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            style={{ display: "none" }} />

          {/* Message d'erreur */}
          {errMsg && (
            <div style={{ fontSize: "0.72rem", color: "#B8341E", background: "#FAEBE8",
              padding: "0.55rem 0.85rem", borderRadius: 8 }}>
              ⚠️ {errMsg}
            </div>
          )}
        </>
      )}

      {/* Description + légende — toujours visible */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div style={field}>
          <label style={lbl}>Description de l&apos;image</label>
          <input value={block.alt ?? ""} onChange={e => patch({ alt: e.target.value })}
            style={inp} placeholder="Ex : Vue aérienne de Nairobi" />
        </div>
        <div style={field}>
          <label style={lbl}>Légende / Crédit (optionnel)</label>
          <input value={block.caption ?? ""} onChange={e => patch({ caption: e.target.value })}
            style={inp} placeholder="Ex : © AFP / Jean Dupont" />
        </div>
      </div>

      <style>{`@keyframes bbspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ÉDITEUR D'UN BLOC
══════════════════════════════════════════════════════════ */
function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const set = useCallback((patch: Partial<Block>) =>
    onChange({ ...block, ...patch } as Block), [block, onChange]);

  switch (block.type) {

    case "paragraph":
      return (
        <div style={field}>
          <label style={lbl}>Texte</label>
          <textarea value={block.text} onChange={e => set({ text: e.target.value })}
            rows={4} style={{ ...inp, resize: "vertical", lineHeight: 1.7 }}
            placeholder="Écrivez votre paragraphe ici…" />
        </div>
      );

    case "heading":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Niveau</label>
            <select value={block.level ?? 2}
              onChange={e => set({ level: Number(e.target.value) as 2 | 3 })} style={inp}>
              <option value={2}>Titre principal (H2)</option>
              <option value={3}>Sous-titre (H3)</option>
            </select>
          </div>
          <div style={field}>
            <label style={lbl}>Texte du titre</label>
            <input value={block.text} onChange={e => set({ text: e.target.value })}
              style={inp} placeholder="Ex : Les résultats économiques" />
          </div>
        </div>
      );

    case "pullquote":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Texte de la citation</label>
            <textarea value={block.text} onChange={e => set({ text: e.target.value })}
              rows={3} style={{ ...inp, resize: "vertical" }}
              placeholder="Ex : « L'Afrique est le continent de l'avenir. »" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={field}>
              <label style={lbl}>Auteur (optionnel)</label>
              <input value={block.author ?? ""} onChange={e => set({ author: e.target.value })}
                style={inp} placeholder="Ex : Kofi Annan" />
            </div>
            <div style={field}>
              <label style={lbl}>Titre / Fonction (optionnel)</label>
              <input value={block.role ?? ""} onChange={e => set({ role: e.target.value })}
                style={inp} placeholder="Ex : Ancien SG de l'ONU" />
            </div>
          </div>
        </div>
      );

    case "image":
      return <ImageBlockEditor block={block} onChange={onChange} />;

    case "video":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Lien de la vidéo (YouTube, Vimeo…)</label>
            <input type="url" value={block.url} onChange={e => set({ url: e.target.value })}
              style={inp} placeholder="https://www.youtube.com/embed/…" />
            <div style={{ fontSize: "0.65rem", color: "#928E80", marginTop: "0.25rem" }}>
              💡 Sur YouTube : clic droit → &quot;Copier le code d&apos;intégration&quot; → copier l&apos;URL du src
            </div>
          </div>
          <div style={field}>
            <label style={lbl}>Légende (optionnel)</label>
            <input value={block.caption ?? ""} onChange={e => set({ caption: e.target.value })}
              style={inp} placeholder="Ex : Discours d'ouverture du sommet" />
          </div>
        </div>
      );

    case "factbox":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Titre de la boîte</label>
            <input value={block.title} onChange={e => set({ title: e.target.value })}
              style={inp} placeholder="Ex : Chiffres clés" />
          </div>
          <label style={lbl}>Éléments</label>
          {block.facts.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
              <input value={f}
                onChange={e => { const facts = [...block.facts]; facts[i] = e.target.value; set({ facts }); }}
                style={{ ...inp, flex: 1 }} placeholder="Ex : 54 pays membres de l'Union Africaine" />
              <button style={removeBtn} onClick={() => set({ facts: block.facts.filter((_, j) => j !== i) })}>✕</button>
            </div>
          ))}
          <button style={addRowBtn} onClick={() => set({ facts: [...block.facts, ""] })}>+ Ajouter un élément</button>
        </div>
      );

    case "checklist":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Titre (optionnel)</label>
            <input value={block.title ?? ""} onChange={e => set({ title: e.target.value })}
              style={inp} placeholder="Ex : Critères d'éligibilité" />
          </div>
          <label style={lbl}>Points</label>
          {block.items.map((item, i) => (
            <div key={i} style={{ background: "#F8F6F1", borderRadius: 10, padding: "0.75rem",
              display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input value={item.label}
                  onChange={e => { const items = [...block.items]; items[i] = { ...items[i], label: e.target.value }; set({ items }); }}
                  style={{ ...inp, flex: 1 }} placeholder="Ex : Être ressortissant africain" />
                <button style={removeBtn} onClick={() => set({ items: block.items.filter((_, j) => j !== i) })}>✕</button>
              </div>
              <input value={item.detail ?? ""}
                onChange={e => { const items = [...block.items]; items[i] = { ...items[i], detail: e.target.value }; set({ items }); }}
                style={inp} placeholder="Précision supplémentaire (optionnel)" />
            </div>
          ))}
          <button style={addRowBtn} onClick={() => set({ items: [...block.items, { label: "", detail: "" }] })}>+ Ajouter un point</button>
        </div>
      );

    case "steps":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Titre (optionnel)</label>
            <input value={block.title ?? ""} onChange={e => set({ title: e.target.value })}
              style={inp} placeholder="Ex : Comment postuler ?" />
          </div>
          <label style={lbl}>Étapes</label>
          {block.items.map((step, i) => (
            <div key={i} style={{ background: "#F8F6F1", borderRadius: 10, padding: "0.75rem",
              display: "flex", gap: "0.75rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#141410",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: "0.78rem", flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input value={step.label}
                  onChange={e => { const items = [...block.items]; items[i] = { ...items[i], label: e.target.value }; set({ items }); }}
                  style={inp} placeholder="Titre de l'étape" />
                <textarea value={step.desc}
                  onChange={e => { const items = [...block.items]; items[i] = { ...items[i], desc: e.target.value }; set({ items }); }}
                  rows={2} style={{ ...inp, resize: "vertical" }} placeholder="Description de cette étape…" />
              </div>
              <button style={{ ...removeBtn, alignSelf: "flex-start" }}
                onClick={() => set({ items: block.items.filter((_, j) => j !== i) })}>✕</button>
            </div>
          ))}
          <button style={addRowBtn} onClick={() => set({ items: [...block.items, { label: "", desc: "" }] })}>+ Ajouter une étape</button>
        </div>
      );

    case "benefits":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={lbl}>Avantages (icône + titre + valeur)</label>
          {block.items.map((b, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "56px 1fr 1fr auto",
              gap: "0.5rem", alignItems: "center", background: "#F8F6F1", borderRadius: 10, padding: "0.65rem" }}>
              <input value={b.icon}
                onChange={e => { const items = [...block.items]; items[i] = { ...items[i], icon: e.target.value }; set({ items }); }}
                style={{ ...inp, textAlign: "center", fontSize: "1.3rem" }} placeholder="🌍" />
              <input value={b.label}
                onChange={e => { const items = [...block.items]; items[i] = { ...items[i], label: e.target.value }; set({ items }); }}
                style={inp} placeholder="Ex : Financement" />
              <input value={b.value}
                onChange={e => { const items = [...block.items]; items[i] = { ...items[i], value: e.target.value }; set({ items }); }}
                style={inp} placeholder="Ex : 100% des frais couverts" />
              <button style={removeBtn} onClick={() => set({ items: block.items.filter((_, j) => j !== i) })}>✕</button>
            </div>
          ))}
          <button style={addRowBtn} onClick={() => set({ items: [...block.items, { icon: "✅", label: "", value: "" }] })}>+ Ajouter un avantage</button>
        </div>
      );

    case "compare":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Titre (optionnel)</label>
            <input value={block.title ?? ""} onChange={e => set({ title: e.target.value })}
              style={inp} placeholder="Ex : Comparaison des programmes" />
          </div>
          <label style={lbl}>Colonnes</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {block.columns.map((col, i) => (
              <div key={i} style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                <input value={col.label}
                  onChange={e => { const columns = [...block.columns]; columns[i] = { label: e.target.value }; set({ columns }); }}
                  style={{ ...inp, width: 140 }} placeholder={`Colonne ${i + 1}`} />
                {block.columns.length > 1 && (
                  <button style={removeBtn} onClick={() => set({
                    columns: block.columns.filter((_, j) => j !== i),
                    rows: block.rows.map(r => ({ ...r, values: r.values.filter((_, j) => j !== i) }))
                  })}>✕</button>
                )}
              </div>
            ))}
            <button style={addRowBtn} onClick={() => set({
              columns: [...block.columns, { label: `Colonne ${block.columns.length + 1}` }],
              rows: block.rows.map(r => ({ ...r, values: [...r.values, ""] }))
            })}>+ Colonne</button>
          </div>
          <label style={lbl}>Lignes</label>
          {block.rows.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: "0.5rem", background: "#F8F6F1", borderRadius: 10, padding: "0.65rem" }}>
              <input value={row.label}
                onChange={e => { const rows = [...block.rows]; rows[ri] = { ...rows[ri], label: e.target.value }; set({ rows }); }}
                style={{ ...inp, width: 140, flexShrink: 0 }} placeholder="Critère" />
              {row.values.map((val, vi) => (
                <input key={vi} value={val}
                  onChange={e => { const rows = [...block.rows]; rows[ri].values[vi] = e.target.value; set({ rows: [...rows] }); }}
                  style={inp} placeholder={block.columns[vi]?.label || `Val ${vi + 1}`} />
              ))}
              <button style={removeBtn} onClick={() => set({ rows: block.rows.filter((_, j) => j !== ri) })}>✕</button>
            </div>
          ))}
          <button style={addRowBtn} onClick={() => set({ rows: [...block.rows, { label: "", values: block.columns.map(() => "") }] })}>+ Ajouter une ligne</button>
        </div>
      );

    case "alert":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Type de note</label>
            <select value={block.variant ?? "info"}
              onChange={e => set({ variant: e.target.value as "info" | "warning" | "tip" })} style={inp}>
              <option value="info">ℹ️ Information</option>
              <option value="warning">⚠️ Avertissement important</option>
              <option value="tip">💡 Conseil pratique</option>
            </select>
          </div>
          <div style={field}>
            <label style={lbl}>Message</label>
            <textarea value={block.message} onChange={e => set({ message: e.target.value })}
              rows={3} style={{ ...inp, resize: "vertical" }}
              placeholder="Ex : Les candidatures ferment le 31 mars à 23h59." />
          </div>
        </div>
      );

    case "apply":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Texte du bouton</label>
            <input value={block.label} onChange={e => set({ label: e.target.value })}
              style={inp} placeholder="Ex : Postuler maintenant" />
          </div>
          <div style={field}>
            <label style={lbl}>Lien de candidature (URL)</label>
            <input type="url" value={block.url} onChange={e => set({ url: e.target.value })}
              style={inp} placeholder="https://…" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={field}>
              <label style={lbl}>Date limite</label>
              <input value={block.deadline ?? ""} onChange={e => set({ deadline: e.target.value })}
                style={inp} placeholder="Ex : 30 Avr 2026" />
            </div>
            <div style={field}>
              <label style={lbl}>Note sous le bouton (optionnel)</label>
              <input value={block.note ?? ""} onChange={e => set({ note: e.target.value })}
                style={inp} placeholder="Ex : Lien officiel · Site externe" />
            </div>
          </div>
        </div>
      );

    case "external":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Lien URL</label>
            <input type="url" value={block.url} onChange={e => set({ url: e.target.value })}
              style={inp} placeholder="https://…" />
          </div>
          <div style={field}>
            <label style={lbl}>Titre du lien</label>
            <input value={block.label} onChange={e => set({ label: e.target.value })}
              style={inp} placeholder="Ex : Rapport officiel ONU — Développement 2026" />
          </div>
          <div style={field}>
            <label style={lbl}>Description courte (optionnel)</label>
            <input value={block.description ?? ""} onChange={e => set({ description: e.target.value })}
              style={inp} placeholder="Ex : Le rapport complet en 184 pages" />
          </div>
          <div style={field}>
            <label style={lbl}>Icône (émoji ou URL — optionnel)</label>
            <input value={block.favicon ?? ""} onChange={e => set({ favicon: e.target.value })}
              style={inp} placeholder="Ex : 📄 ou https://…/icon.png" />
          </div>
        </div>
      );

    case "download":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Lien URL du fichier</label>
            <input type="url" value={block.url} onChange={e => set({ url: e.target.value })}
              style={inp} placeholder="https://…/rapport.pdf" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
            <div style={field}>
              <label style={lbl}>Nom du fichier</label>
              <input value={block.label} onChange={e => set({ label: e.target.value })}
                style={inp} placeholder="Ex : Rapport AfriPulse 2026" />
            </div>
            <div style={field}>
              <label style={lbl}>Taille (optionnel)</label>
              <input value={block.size ?? ""} onChange={e => set({ size: e.target.value })}
                style={inp} placeholder="Ex : 2.4 Mo" />
            </div>
          </div>
        </div>
      );

    case "related":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Slug de l&apos;article lié</label>
            <input value={block.slug} onChange={e => set({ slug: e.target.value })}
              style={inp} placeholder="Ex : accord-union-africaine-2026" />
            <div style={{ fontSize: "0.65rem", color: "#928E80", marginTop: "0.2rem" }}>
              💡 Le slug est la partie de l&apos;URL après /actualites/
            </div>
          </div>
          <div style={field}>
            <label style={lbl}>Texte à afficher (optionnel)</label>
            <input value={block.label ?? ""} onChange={e => set({ label: e.target.value })}
              style={inp} placeholder="Laissez vide pour afficher le titre automatiquement" />
          </div>
        </div>
      );

    case "agenda":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Titre (optionnel)</label>
            <input value={block.title ?? ""} onChange={e => set({ title: e.target.value })}
              style={inp} placeholder="Ex : Programme du jour" />
          </div>
          <label style={lbl}>Sessions</label>
          {block.sessions.map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr auto",
              gap: "0.5rem", alignItems: "center", background: "#F8F6F1", borderRadius: 10, padding: "0.65rem" }}>
              <input value={s.time}
                onChange={e => { const sessions = [...block.sessions]; sessions[i] = { ...sessions[i], time: e.target.value }; set({ sessions }); }}
                style={inp} placeholder="09h00" />
              <input value={s.title}
                onChange={e => { const sessions = [...block.sessions]; sessions[i] = { ...sessions[i], title: e.target.value }; set({ sessions }); }}
                style={inp} placeholder="Intitulé de la session" />
              <input value={s.speaker ?? ""}
                onChange={e => { const sessions = [...block.sessions]; sessions[i] = { ...sessions[i], speaker: e.target.value }; set({ sessions }); }}
                style={inp} placeholder="Intervenant (optionnel)" />
              <button style={removeBtn} onClick={() => set({ sessions: block.sessions.filter((_, j) => j !== i) })}>✕</button>
            </div>
          ))}
          <button style={addRowBtn} onClick={() => set({ sessions: [...block.sessions, { time: "", title: "", speaker: "" }] })}>+ Ajouter une session</button>
        </div>
      );

    case "speakers":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Titre (optionnel)</label>
            <input value={block.title ?? ""} onChange={e => set({ title: e.target.value })}
              style={inp} placeholder="Ex : Les intervenants" />
          </div>
          <label style={lbl}>Personnes</label>
          {block.people.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: "0.5rem", background: "#F8F6F1", borderRadius: 10, padding: "0.65rem" }}>
              <input value={p.name}
                onChange={e => { const people = [...block.people]; people[i] = { ...people[i], name: e.target.value }; set({ people }); }}
                style={inp} placeholder="Nom complet" />
              <input value={p.role}
                onChange={e => { const people = [...block.people]; people[i] = { ...people[i], role: e.target.value }; set({ people }); }}
                style={inp} placeholder="Titre / Rôle" />
              <input value={p.org ?? ""}
                onChange={e => { const people = [...block.people]; people[i] = { ...people[i], org: e.target.value }; set({ people }); }}
                style={inp} placeholder="Organisation" />
              <button style={removeBtn} onClick={() => set({ people: block.people.filter((_, j) => j !== i) })}>✕</button>
            </div>
          ))}
          <button style={addRowBtn} onClick={() => set({ people: [...block.people, { name: "", role: "", org: "" }] })}>+ Ajouter une personne</button>
        </div>
      );

    case "location":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={field}>
            <label style={lbl}>Nom du lieu</label>
            <input value={block.label} onChange={e => set({ label: e.target.value })}
              style={inp} placeholder="Ex : Palais des Congrès de Dakar" />
          </div>
          <div style={field}>
            <label style={lbl}>Adresse complète (optionnel)</label>
            <input value={block.address ?? ""} onChange={e => set({ address: e.target.value })}
              style={inp} placeholder="Ex : Avenue Cheikh Anta Diop, Dakar, Sénégal" />
          </div>
          <div style={field}>
            <label style={lbl}>Lien Google Maps (optionnel)</label>
            <input type="url" value={block.mapUrl ?? ""} onChange={e => set({ mapUrl: e.target.value })}
              style={inp} placeholder="https://maps.google.com/maps?…&output=embed" />
            <div style={{ fontSize: "0.65rem", color: "#928E80", marginTop: "0.2rem" }}>
              💡 Google Maps → Partager → Intégrer → copier l&apos;URL du src
            </div>
          </div>
        </div>
      );

    case "profile":
      return (
        <div style={{ fontSize: "0.65rem", color: "#928E80", padding: "0.5rem",
          background: "#FBF4E8", borderRadius: 8 }}>
          💡 Bloc profil — géré via types/database
        </div>
      );

    case "divider":
      return (
        <div style={{ textAlign: "center", padding: "0.5rem 0", color: "#928E80", fontSize: "0.82rem" }}>
          ─── Ligne de séparation ───
        </div>
      );

    default:
      return <div style={{ color: "#928E80", fontSize: "0.82rem" }}>Type inconnu</div>;
  }
}

/* ══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════ */
interface BlockBuilderProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  preset?: "article" | "scholarship" | "opportunity" | "event";
}

export default function BlockBuilder({ blocks, onChange }: BlockBuilderProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [openBlocks, setOpenBlocks] = useState<Set<number>>(new Set());

  const addBlock = (type: Block["type"]) => {
    onChange([...blocks, emptyBlock(type)]);
    setOpenBlocks(prev => new Set([...Array.from(prev), blocks.length]));
    setShowPicker(false);
  };

  const updateBlock = useCallback((i: number, b: Block) =>
    onChange(blocks.map((old, j) => j === i ? b : old)),
    [blocks, onChange]);

  const removeBlock = (i: number) => {
    onChange(blocks.filter((_, j) => j !== i));
    setOpenBlocks(prev => {
      const next = new Set<number>();
      Array.from(prev).forEach(n => { if (n < i) next.add(n); else if (n > i) next.add(n - 1); });
      return next;
    });
  };

  const moveUp = (i: number) => {
    if (i === 0) return;
    const a = [...blocks]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; onChange(a);
  };
  const moveDown = (i: number) => {
    if (i === blocks.length - 1) return;
    const a = [...blocks]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; onChange(a);
  };
  const toggleBlock = (i: number) => setOpenBlocks(prev => {
    const next = new Set(Array.from(prev));
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });

  const getDef = (type: Block["type"]) => {
    for (const g of BLOCK_DEFS) { const f = g.items.find(d => d.type === type); if (f) return f; }
    return null;
  };

  const blockPreview = (b: Block): string => {
    switch (b.type) {
      case "paragraph":  return b.text.slice(0, 60) || "Paragraphe vide…";
      case "heading":    return b.text || "Titre vide…";
      case "pullquote":  return b.text ? `❝ ${b.text.slice(0, 50)}` : "Citation vide…";
      case "image":      return b.url ? "🖼 " + (b.url.split("/").pop() ?? b.url.slice(0, 40)) : "Aucune image";
      case "video":      return b.url ? "▶ " + b.url.slice(0, 40) : "Aucune vidéo";
      case "factbox":    return `${b.facts.filter(Boolean).length} élément(s) · ${b.title}`;
      case "checklist":  return `${b.items.length} point(s)${b.title ? " · " + b.title : ""}`;
      case "steps":      return `${b.items.length} étape(s)${b.title ? " · " + b.title : ""}`;
      case "benefits":   return `${b.items.length} avantage(s)`;
      case "compare":    return `${b.rows.length} ligne(s) · ${b.columns.length} colonne(s)`;
      case "alert":      return b.message.slice(0, 60) || "Message vide…";
      case "apply":      return b.label || "CTA vide";
      case "external":   return b.label || b.url.slice(0, 50) || "Lien vide…";
      case "download":   return b.label || "Fichier vide";
      case "related":    return b.slug || "Slug manquant";
      case "agenda":     return `${b.sessions.length} session(s)`;
      case "speakers":   return `${b.people.length} personne(s)`;
      case "location":   return b.label || "Lieu vide";
      case "divider":    return "─────────────────";
      default:           return "";
    }
  };

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "0.85rem" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#928E80" }}>
          Blocs de contenu ({blocks.length})
        </div>
        {blocks.length > 0 && (
          <button onClick={() => setOpenBlocks(
            openBlocks.size < blocks.length
              ? new Set<number>(blocks.map((_, i) => i))
              : new Set<number>()
          )} style={{ fontSize: "0.7rem", color: "#928E80", background: "none",
            border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            {openBlocks.size < blocks.length ? "Tout déplier" : "Tout replier"}
          </button>
        )}
      </div>

      {blocks.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, border: "2px dashed rgba(20,20,16,.1)",
          padding: "2.5rem", textAlign: "center", marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>📝</div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem",
            fontWeight: 700, color: "#141410", marginBottom: "0.3rem" }}>Aucun bloc</div>
          <div style={{ fontSize: "0.8rem", color: "#928E80" }}>
            Cliquez sur &quot;+ Ajouter un bloc&quot; pour construire votre contenu
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
          {blocks.map((block, i) => {
            const def    = getDef(block.type);
            const isOpen = openBlocks.has(i);
            return (
              <div key={i} style={{ background: "#fff", borderRadius: 14,
                border: "1px solid rgba(20,20,16,.08)", boxShadow: "0 1px 6px rgba(20,20,16,.04)",
                overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", padding: "0.75rem 1rem",
                  cursor: "pointer", background: isOpen ? "#FAFAF8" : "#fff",
                  borderBottom: isOpen ? "1px solid rgba(20,20,16,.07)" : "none", gap: "0.75rem" }}
                  onClick={() => toggleBlock(i)}>
                  <div style={{ width: 32, height: 32, borderRadius: 8,
                    background: def ? `${def.color}14` : "#F0EDE4", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: "0.85rem",
                    fontWeight: 900, color: def?.color ?? "#928E80", flexShrink: 0 }}>
                    {def?.icon ?? "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#141410" }}>
                      {def?.label ?? block.type}
                    </div>
                    {!isOpen && (
                      <div style={{ fontSize: "0.65rem", color: "#928E80", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "0.1rem" }}>
                        {blockPreview(block)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => moveUp(i)} disabled={i === 0}
                      style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid rgba(20,20,16,.1)",
                        background: "transparent", color: i === 0 ? "rgba(20,20,16,.2)" : "#38382E",
                        cursor: i === 0 ? "default" : "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" }}>↑</button>
                    <button onClick={() => moveDown(i)} disabled={i === blocks.length - 1}
                      style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid rgba(20,20,16,.1)",
                        background: "transparent", color: i === blocks.length - 1 ? "rgba(20,20,16,.2)" : "#38382E",
                        cursor: i === blocks.length - 1 ? "default" : "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" }}>↓</button>
                    <button onClick={() => removeBlock(i)}
                      style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid rgba(184,52,30,.2)",
                        background: "#FAEBE8", color: "#B8341E", cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.72rem", fontWeight: 700 }}>✕</button>
                  </div>
                  <div style={{ color: "#928E80", fontSize: "0.7rem", flexShrink: 0,
                    transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▼</div>
                </div>
                {isOpen && (
                  <div style={{ padding: "1rem 1.1rem" }}>
                    <BlockEditor block={block} onChange={b => updateBlock(i, b)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button onClick={() => setShowPicker(!showPicker)}
        style={{ width: "100%", padding: "0.85rem", borderRadius: 12,
          border: `2px dashed ${showPicker ? "#141410" : "rgba(20,20,16,.15)"}`,
          background: showPicker ? "#141410" : "transparent",
          color: showPicker ? "#fff" : "#928E80",
          fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
          fontFamily: "inherit", transition: "all .18s" }}>
        {showPicker ? "✕ Annuler" : "+ Ajouter un bloc"}
      </button>

      {showPicker && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(20,20,16,.08)",
          padding: "1.25rem", marginTop: "0.5rem", boxShadow: "0 8px 32px rgba(20,20,16,.1)" }}>
          <div style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#928E80", marginBottom: "1rem" }}>
            Quel type de contenu voulez-vous ajouter ?
          </div>
          {BLOCK_DEFS.map(group => (
            <div key={group.group} style={{ marginBottom: "1.1rem" }}>
              <div style={{ fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.15em",
                textTransform: "uppercase", color: "rgba(20,20,16,.3)", marginBottom: "0.5rem",
                paddingBottom: "0.35rem", borderBottom: "1px solid rgba(20,20,16,.06)" }}>
                {group.group}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.4rem" }}>
                {group.items.map(def => (
                  <button key={def.type} onClick={() => addBlock(def.type)}
                    style={{ padding: "0.7rem 0.85rem", borderRadius: 10,
                      border: "1.5px solid rgba(20,20,16,.08)", background: "#F8F6F1",
                      cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = def.color; (e.currentTarget as HTMLElement).style.background = `${def.color}0d`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(20,20,16,.08)"; (e.currentTarget as HTMLElement).style.background = "#F8F6F1"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                      <span style={{ fontSize: "1rem" }}>{def.icon}</span>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#141410" }}>{def.label}</span>
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#928E80", lineHeight: 1.4 }}>{def.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}