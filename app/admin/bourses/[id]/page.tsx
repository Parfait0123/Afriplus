"use client";

/**
 * app/admin/bourses/[id]/page.tsx
 * Éditeur admin d'une bourse — design cohérent avec la page actualités
 * Contenu unique : blocks (comme pour les articles)
 * SEO auto-généré depuis le contenu
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ImageUpload } from "@/components/ui/ImageUpload";
import BlockBuilder from "@/components/admin/BlockBuilder";
import type { Block } from "@/types/blocks";
import { Scholarship } from "@/types/database";

/* ── Types ── */
type Level = "Licence"|"Master"|"Doctorat"|"Postdoc"|"Toutes formations";
type Tab = "general"|"content"|"seo";

const LEVELS: Level[] = ["Licence","Master","Doctorat","Postdoc","Toutes formations"];
const LEVEL_COLOR: Record<string,string> = {
  Licence:"#5A7FD4", Master:"#1A5C40", Doctorat:"#C08435",
  Postdoc:"#7A4A1E", "Toutes formations":"#928E80",
};
const COMMON_FLAGS = ["🇲🇦","🇩🇿","🇹🇳","🇸🇳","🇨🇮","🇨🇲","🇪🇬","🇿🇦","🇳🇬","🇰🇪","🇫🇷","🇺🇸","🇬🇧","🇩🇪","🇨🇦","🇧🇪","🌍","🌐"];

function slugify(t:string) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-");
}

/* ── Extraire le texte du premier bloc pour la meta description ── */
function extractFirstTextFromBlocks(blocks: Block[]): string {
  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
        if (block.text && block.text.trim().length > 0) {
          return block.text.trim();
        }
        break;
      case "heading":
        if (block.text && block.text.trim().length > 0) {
          return block.text.trim();
        }
        break;
      case "pullquote":
        if (block.text && block.text.trim().length > 0) {
          return block.text.trim();
        }
        break;
      case "alert":
        if (block.message && block.message.trim().length > 0) {
          return block.message.trim();
        }
        break;
      case "checklist":
        if (block.items && block.items.length > 0 && block.items[0].label) {
          return block.items[0].label.trim();
        }
        break;
      case "steps":
        if (block.items && block.items.length > 0 && block.items[0].label) {
          return block.items[0].label.trim();
        }
        break;
      default:
        continue;
    }
  }
  return "";
}

interface BourseState {
  title: string; slug: string; slugLocked: boolean;
  organization: string; country: string; flag: string;
  level: Level; domain: string; deadline: string;
  urgent: boolean; amount: string;
  blocks: Block[];
  coverUrl: string; tags: string[];
  published: boolean; metaTitle: string; metaDesc: string;
  apply_url: string;
}

function defaultState(): BourseState {
  return {
    title:"", slug:"", slugLocked:false,
    organization:"", country:"", flag:"🌍",
    level:"Master", domain:"", deadline:"",
    urgent:false, amount:"",
    blocks: [],
    coverUrl:"", tags:[], published:false, apply_url:"", metaTitle:"", metaDesc:"",
  };
}

/* ── Icônes ── */
const IcoBack  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IcoSave  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcoEye   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function BourseEditorPage({ params }: { params: { id: string } }) {
  const sb     = createClient();
  const router = useRouter();
  const { profile } = useAuth();
  const isNew  = params.id === "nouveau";

  const [state,     setState]   = useState<BourseState>(defaultState());
  const [tagInput,  setTagInput] = useState("");
  const [tab,       setTab]      = useState<Tab>("general");
  const [domains,   setDomains]  = useState<string[]>([]);
  const [customDomain, setCustomDomain] = useState("");

  const [loading,   setLoading]  = useState(!isNew);
  const [saving,    setSaving]   = useState(false);
  const [saved,     setSaved]    = useState(false);
  const [toast,     setToast]    = useState<{msg:string;ok:boolean}|null>(null);

  // Modals de confirmation (sans mot de passe)
  const [pubModal,   setPubModal]   = useState<null|boolean>(null);
  const [delModal,   setDelModal]   = useState(false);

  // Autosave localStorage
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemIdRef = useRef<string|null>(isNew ? null : params.id);
  const titleRef  = useRef<HTMLInputElement>(null);

  const set = useCallback(<K extends keyof BourseState>(k:K, v:BourseState[K]) =>
    setState(prev=>({...prev,[k]:v})), []);

  const showToast = (msg:string, ok=true) => {
    setToast({msg,ok}); setTimeout(()=>setToast(null),3500);
  };

  /* ── Chargement des domaines existants ── */
  useEffect(() => {
    sb.from("scholarships").select("domain").then(({ data }) => {
      if (data) {
        const unique = [...new Set(data.map((d: any) => d.domain).filter(Boolean))];
        setDomains(unique.sort());
      }
    });
  }, []);

  /* ── Chargement de la bourse ── */
  useEffect(() => {
    if (isNew) { setTimeout(()=>titleRef.current?.focus(), 120); return; }
    sb.from("scholarships").select("*").eq("id", params.id).single()
      .then(({ data, error }: any) => {
        if (data) {
          let parsedBlocks: Block[] = [];
          if (data.content) {
            try {
              parsedBlocks = typeof data.content === "string" 
                ? JSON.parse(data.content) 
                : data.content;
            } catch { parsedBlocks = []; }
          }
          setState({
            title:       data.title ?? "",
            slug:        data.slug ?? "",
            slugLocked:  true,
            organization:data.organization ?? "",
            country:     data.country ?? "",
            flag:        data.flag ?? "🌍",
            level:       data.level ?? "Master",
            domain:      data.domain ?? "",
            deadline:    data.deadline ?? "",
            urgent:      data.urgent ?? false,
            amount:      data.amount ?? "",
            blocks:      parsedBlocks,
            coverUrl:    data.cover_url ?? "",
            tags:        data.tags ?? [],
            published:   data.published ?? false,
            metaTitle:   data.meta_title ?? "",
            metaDesc:    data.meta_desc ?? "",
            apply_url:    data.apply_url ?? "",
          });
        }
        setLoading(false);
      });
  }, [params.id, isNew]);

  /* ── Autosave localStorage ── */
  useEffect(() => {
    if (loading) return;
    if (isNew) return;
    if (!itemIdRef.current) return;

    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (!itemIdRef.current) return;
      try {
        localStorage.setItem(`afripulse_draft_scholarship_${itemIdRef.current}`, JSON.stringify(state));
      } catch { /* quota exceeded */ }
    }, 1500);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [state, loading, isNew]);

  /* ── Auto-slug ── */
  useEffect(() => {
    if (!state.slugLocked && state.title)
      set("slug", slugify(state.title));
  }, [state.title, state.slugLocked]);

  /* ── Tags ── */
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !state.tags.includes(t)) { set("tags",[...state.tags,t]); setTagInput(""); }
  };

  /* ── Génération automatique du titre SEO (basé sur le titre de la bourse) ── */
  const getDefaultMetaTitle = () => {
    if (state.title) {
      return `${state.title} — Bourse d'études | AfriPulse`;
    }
    return "Bourse d'études | AfriPulse";
  };

  /* ── Génération automatique de la description SEO (basée sur le contenu) ── */
  const getDefaultMetaDesc = () => {
    // 1. Extraire le texte du premier bloc
    const firstText = extractFirstTextFromBlocks(state.blocks);
    if (firstText && firstText.length > 0) {
      // Tronquer à 160 caractères
      return firstText.length > 160 ? firstText.slice(0, 157) + "..." : firstText;
    }
    
    // 2. Fallback : description par défaut
    return `Candidature pour ${state.organization || "cette bourse"} — ${state.level || "Niveau"} — Financement ${state.amount || "disponible"}. Découvrez les conditions et postulez avant ${state.deadline || "la date limite"}.`;
  };

  /* ── Remplir automatiquement le titre SEO (si vide) ── */
  const fillDefaultMetaTitle = () => {
    if (!state.metaTitle && state.title) {
      set("metaTitle", getDefaultMetaTitle());
      showToast("Titre SEO généré automatiquement");
    }
  };

  /* ── Remplir automatiquement la description SEO (si vide) ── */
  const fillDefaultMetaDesc = () => {
    if (!state.metaDesc && state.blocks.length > 0) {
      set("metaDesc", getDefaultMetaDesc());
      showToast("Description SEO générée automatiquement");
    } else if (!state.metaDesc && !state.blocks.length) {
      showToast("Ajoutez du contenu d'abord pour générer une description", false);
    }
  };

  /* ── Sauvegarde ── */
  const save = async (pub?: boolean) => {
    if (!state.title.trim()) { showToast("Le titre est requis", false); return; }
    if (!state.organization.trim()) { showToast("L'organisme est requis", false); return; }
    if (!state.deadline) { showToast("La date limite est requise", false); return; }
    if (state.tags.length === 0) { showToast("Ajoutez au moins un tag", false); return; }
    if (!state.domain.trim()) { showToast("Le domaine est requis", false); return; }
    setSaving(true);

    const pubNow = pub !== undefined ? pub : state.published;
    
    // Auto-remplir les champs SEO si vides
    const finalMetaTitle = state.metaTitle || getDefaultMetaTitle();
    const finalMetaDesc = state.metaDesc || getDefaultMetaDesc();
    
    const payload: Record<string,unknown> = {
      title:          state.title.trim(),
      slug:           state.slug || slugify(state.title),
      organization:   state.organization.trim(),
      country:        state.country.trim() || "",
      flag:           state.flag,
      level:          state.level,
      domain:         state.domain.trim() || null,
      deadline:       state.deadline,
      urgent:         state.urgent,
      amount:         state.amount.trim() || null,
      apply_url:      state.apply_url.trim() || null, 
      content:        state.blocks,
      cover_url:      state.coverUrl || null,
      image_gradient: `linear-gradient(135deg,${LEVEL_COLOR[state.level]||"#C08435"}22,#0a0800)`,
      tags:           state.tags,
      published:      pubNow,
      meta_title:     finalMetaTitle,
      meta_desc:      finalMetaDesc,
    };
    
const existingId = itemIdRef.current;
const { data, error } = existingId === null
  ? await (sb.from("scholarships") as any).insert(payload).select("id,slug").single()
  : await (sb.from("scholarships") as any).update(payload).eq("id", existingId).select("id,slug").single();

    if (error) {
      showToast("Erreur : " + error.message, false);
      return;
    }

    const newId = (data as any)?.id as string|undefined;
    if (existingId === null && newId) {
      itemIdRef.current = newId;
      showToast(pubNow ? "Bourse publiée !" : "Brouillon créé !");
      router.push(`/admin/bourses/${newId}`);
    } else {
      if (pub !== undefined) setState(prev=>({...prev, published:pub}));
      setSaved(true);
      setTimeout(()=>setSaved(false), 3000);
      showToast(pub===true ? "Bourse publiée !" : pub===false ? "Brouillon sauvegardé" : "Sauvegardé");
    }
  };

  /* ── Restaurer brouillon local ── */
  const restoreDraft = () => {
    if (!itemIdRef.current) return;
    try {
      const raw = localStorage.getItem(`afripulse_draft_scholarship_${itemIdRef.current}`);
      if (raw) { setState(JSON.parse(raw)); showToast("Brouillon local restauré"); }
    } catch { showToast("Impossible de restaurer", false); }
  };

  const clearDraft = () => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    try {
      if (itemIdRef.current) localStorage.removeItem(`afripulse_draft_scholarship_${itemIdRef.current}`);
    } catch { /* ignore */ }
  };

  /* ── Ajouter un nouveau domaine ── */
  const addCustomDomain = () => {
    const newDomain = customDomain.trim();
    if (newDomain && !domains.includes(newDomain)) {
      setDomains(prev => [...prev, newDomain].sort());
      set("domain", newDomain);
      setCustomDomain("");
    }
  };

  if (loading) return (
    <div className="aa-fullpage-loader">
      <div className="aa-loader-ring" />
    </div>
  );

  const lvlColor = LEVEL_COLOR[state.level] ?? "#C08435";
  const previewSlug = state.slug || slugify(state.title || "bourse");
  const hasDraft = (() => {
    try { return itemIdRef.current && !!localStorage.getItem(`afripulse_draft_scholarship_${itemIdRef.current}`); } catch { return false; }
  })();

  // Calcul de l'aperçu SEO en temps réel
  const previewTitle = state.metaTitle || getDefaultMetaTitle();
  const previewDesc = state.metaDesc || getDefaultMetaDesc();

  return (
    <div className="aa-editor-page">
      <style>{`
        .bs-input { width:100%; padding:.65rem .9rem; border-radius:12px; font-size:.88rem; font-family:inherit; outline:none; border:1.5px solid rgba(20,20,16,.12); background:#F8F6F1; color:#141410; transition:border-color .15s; box-sizing:border-box; }
        .bs-input:focus { border-color:#C08435; box-shadow:0 0 0 3px rgba(192,132,53,.1); }
        .bs-textarea { resize:vertical; min-height:120px; }
        .bs-label { font-size:.6rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#928E80; display:block; margin-bottom:.45rem; }
        .bs-field-group { margin-bottom:1.4rem; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`aa-toast ${toast.ok ? "aa-toast--ok" : "aa-toast--err"}`}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Modal de confirmation publication */}
      {pubModal !== null && (
        <div className="aa-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setPubModal(null); }}>
          <div className="aa-modal">
            <div className="aa-modal-icon aa-modal-icon--warning">
              {pubModal ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C08435" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C08435" strokeWidth="1.8"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              )}
            </div>
            <div className="aa-modal-title">
              {pubModal ? "Publier cette bourse ?" : "Enregistrer les modifications"}
            </div>
            <p className="aa-modal-desc">
              {pubModal
                ? "La bourse sera visible par tous les visiteurs d'AfriPulse."
                : "Les modifications seront sauvegardées."}
            </p>
            <div className="aa-modal-actions">
              <button className="aa-btn aa-btn--secondary" onClick={() => setPubModal(null)}>
                Annuler
              </button>
              <button
                className="aa-btn aa-btn--primary"
                onClick={() => {
                  const target = pubModal;
                  setPubModal(null);
                  save(target);
                }}
              >
                {pubModal ? "Publier" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation suppression */}
      {delModal && (
        <div className="aa-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDelModal(false); }}>
          <div className="aa-modal">
            <div className="aa-modal-icon aa-modal-icon--danger">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B8341E" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </div>
            <div className="aa-modal-title">Supprimer cette bourse ?</div>
            <p className="aa-modal-desc">
              Cette action est <strong>irréversible</strong>. Toutes les données seront définitivement perdues.
            </p>
            <div className="aa-modal-actions">
              <button className="aa-btn aa-btn--secondary" onClick={() => setDelModal(false)}>
                Annuler
              </button>
              <button
                className="aa-btn aa-btn--danger"
                onClick={async () => {
                  await sb.from("scholarships").delete().eq("id", itemIdRef.current ?? "");
                  showToast("Bourse supprimée !");
                  router.push("/admin/bourses");
                }}
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOPBAR */}
      <div className="aa-editor-topbar">
        <div className="aa-editor-breadcrumb">
          <Link href="/admin/bourses" className="aa-editor-back">
            <IcoBack/> Bourses
          </Link>
          <span className="aa-editor-crumb-sep">›</span>
          <span className="aa-editor-crumb-name">
            {state.title || (isNew ? "Nouvelle bourse" : "Éditer")}
          </span>
        </div>

        <div className="aa-editor-indicators">
          {state.urgent && (
            <span className="aa-editor-draft-badge" style={{ background: "rgba(184,52,30,.1)", color: "#B8341E" }}>
              ⚡ Urgent
            </span>
          )}
          {hasDraft && !saving && (
            <span className="aa-editor-draft-badge" title="Brouillon local non sauvegardé">
              ● local
            </span>
          )}
          <span className={`aa-editor-status-dot ${state.published ? "aa-editor-status-dot--pub" : "aa-editor-status-dot--draft"}`} />
          <span className="aa-editor-status-label">{state.published ? "Publiée" : "Brouillon"}</span>
        </div>

        <div className="aa-editor-actions">
          <Link
            href={`/bourses/${previewSlug}${!state.published ? "?preview=1" : ""}`}
            target="_blank"
            className="aa-editor-preview-btn"
          >
            <IcoEye/> Aperçu
          </Link>
          <button
            className="aa-editor-draft-btn"
            onClick={() => setPubModal(false)}
            disabled={saving}
          >
            {saving ? "…" : "Brouillon"}
          </button>
          <button
            className="aa-editor-publish-btn"
            onClick={() => setPubModal(true)}
            disabled={saving}
          >
            {saved ? "✓ Sauvegardé" : state.published ? "Enregistrer →" : "Publier →"}
          </button>
        </div>
      </div>

      {/* Bandeau restauration brouillon */}
      {hasDraft && itemIdRef.current && (
        <div className="aa-draft-banner">
          <span>📝 Un brouillon local non sauvegardé existe.</span>
          <button onClick={restoreDraft} className="aa-draft-banner-btn">Restaurer</button>
          <button onClick={clearDraft} className="aa-draft-banner-dismiss">Ignorer</button>
        </div>
      )}

      {/* LAYOUT */}
      <div className="aa-editor-layout">
        <div className="aa-editor-main">
          {/* Titre */}
          <input
            ref={titleRef}
            value={state.title}
            onChange={e => set("title", e.target.value)}
            placeholder="Titre de la bourse…"
            className="aa-title-input"
          />

          {/* Tabs */}
          <div className="aa-tabs">
            {(["general","content","seo"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`aa-tab ${tab === t ? "aa-tab--active" : ""}`}
              >
                {{ general: "Général", content: "Contenu", seo: "SEO" }[t]}
              </button>
            ))}
          </div>

          {/* ONGLET GÉNÉRAL (inchangé) */}
          {tab === "general" && (
            <div style={{ paddingTop: "1.5rem" }}>
              {/* ... contenu inchangé ... */}
              <div className="bs-field-group">
                <label className="bs-label">Organisme *</label>
                <input
                  className="bs-input"
                  value={state.organization}
                  onChange={e => set("organization", e.target.value)}
                  placeholder="Ex : Université de Paris, Fondation X…"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="bs-field-group">
                  <label className="bs-label">Pays</label>
                  <input
                    className="bs-input"
                    value={state.country}
                    onChange={e => set("country", e.target.value)}
                    placeholder="Ex : France, Maroc…"
                  />
                </div>
                <div className="bs-field-group">
                  <label className="bs-label">Drapeau</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem", marginBottom: ".35rem" }}>
                    {COMMON_FLAGS.map(f => (
                      <button
                        key={f}
                        onClick={() => set("flag", f)}
                        style={{
                          width: 36, height: 36, borderRadius: 10, border: "none",
                          background: state.flag === f ? "rgba(192,132,53,.15)" : "rgba(20,20,16,.05)",
                          fontSize: "1.2rem", cursor: "pointer",
                          outline: state.flag === f ? "2px solid #C08435" : "none"
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <input
                    className="bs-input"
                    value={state.flag}
                    onChange={e => set("flag", e.target.value)}
                    placeholder="Emoji drapeau"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="bs-field-group">
                  <label className="bs-label">Niveau *</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                    {LEVELS.map(l => {
                      const active = state.level === l;
                      const lc = LEVEL_COLOR[l];
                      return (
                        <button
                          key={l}
                          onClick={() => set("level", l)}
                          className="aa-cat-pill"
                          style={{
                            border: `1.5px solid ${active ? lc : "rgba(20,20,16,.12)"}`,
                            background: active ? `${lc}14` : "transparent",
                            color: active ? lc : "#38382E"
                          }}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="bs-field-group">
                  <label className="bs-label">Domaine *</label>
                  <select
                    value={state.domain}
                    onChange={e => set("domain", e.target.value)}
                    className="bs-input"
                    style={{ flex: 1 }}
                  >
                    <option value="">Sélectionner un domaine</option>
                    {domains.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <input
                      type="text"
                      placeholder="Ou ajouter un nouveau domaine"
                      value={customDomain}
                      onChange={e => setCustomDomain(e.target.value)}
                      className="bs-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={addCustomDomain}
                      disabled={!customDomain.trim()}
                      style={{
                        padding: "0 1rem", borderRadius: 10, border: "none",
                        background: customDomain.trim() ? "#141410" : "rgba(20,20,16,.1)",
                        color: customDomain.trim() ? "#fff" : "#928E80",
                        cursor: customDomain.trim() ? "pointer" : "default",
                        fontSize: "0.78rem", fontWeight: 700
                      }}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="bs-field-group">
                  <label className="bs-label">Date limite *</label>
                  <input
                    type="date"
                    className="bs-input"
                    value={state.deadline}
                    onChange={e => set("deadline", e.target.value)}
                  />
                </div>
                <div className="bs-field-group">
                  <label className="bs-label">Montant / Couverture</label>
                  <input
                    className="bs-input"
                    value={state.amount}
                    onChange={e => set("amount", e.target.value)}
                    placeholder="Ex : 15 000 €/an, Intégrale, Partielle…"
                  />
                </div>
              </div>


                  <div className="bs-field-group">
  <label className="bs-label">URL de candidature</label>
  <input
    type="url"
    className="bs-input"
    value={state.apply_url}
    onChange={e => set("apply_url", e.target.value)}
    placeholder="https://exemple.com/candidature"
  />
  <div style={{ fontSize: ".65rem", color: "#928E80", marginTop: ".3rem" }}>
    Lien officiel pour postuler à cette bourse
  </div>
</div>

              {/* Tags */}
              <div className="bs-field-group">
                <label className="bs-label">Tags</label>
                <div className="aa-tags-list" style={{ marginBottom: ".5rem" }}>
                  {state.tags.map(t => (
                    <span key={t} className="aa-tag">
                      {t}
                      <button
                        className="aa-tag-remove"
                        onClick={() => set("tags", state.tags.filter(x => x !== t))}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="aa-tag-row">
                  <input
                    className="aa-field"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Ajouter un tag, puis Entrée"
                  />
                  <button className="aa-tag-add-btn" onClick={addTag}>Ajouter</button>
                </div>
              </div>

              {/* Image */}
              <div className="bs-field-group">
                <ImageUpload
                  bucket="scholarships"
                  path={`covers/${state.slug || "nouveau"}`}
                  value={state.coverUrl || null}
                  onChange={url => set("coverUrl", url)}
                  onError={msg => showToast(msg, false)}
                  aspectRatio="16/9"
                  label="Image de couverture"
                  maxSizeMB={5}
                />
              </div>
            </div>
          )}

          {/* ONGLET CONTENU (inchangé) */}
          {tab === "content" && (
            <div style={{ paddingTop: "1.5rem" }}>
              <div className="bs-field-group">
                <label className="bs-label">Contenu de la bourse</label>
                <p style={{ fontSize: ".72rem", color: "#928E80", marginBottom: ".6rem", lineHeight: 1.5 }}>
                  Construisez le contenu de votre bourse (description, conditions, avantages, etc.) en ajoutant des blocs.
                </p>
                <BlockBuilder
                  blocks={state.blocks}
                  onChange={blocks => set("blocks", blocks)}
                  preset="scholarship"
                />
              </div>

              {/* Aperçu rapide de la carte */}
              {state.title && (
                <div style={{ marginTop: "2rem" }}>
                  <label className="bs-label">Aperçu carte</label>
                  <div style={{
                    background: "#fff", borderRadius: 20, overflow: "hidden",
                    border: "1px solid rgba(20,20,16,.08)", boxShadow: "0 2px 12px rgba(20,20,16,.07)",
                    maxWidth: 380
                  }}>
                    <div style={{
                      height: 160, position: "relative",
                      background: state.coverUrl ? `url(${state.coverUrl}) center/cover` : `linear-gradient(135deg,${lvlColor}22,#0a0800)`
                    }}>
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent,rgba(0,0,0,.6))" }} />
                      <div style={{ position: "absolute", top: "0.85rem", left: "0.85rem" }}>
                        <span style={{
                          fontSize: ".55rem", fontWeight: 800, letterSpacing: ".1em",
                          textTransform: "uppercase", padding: ".22rem .7rem", borderRadius: 100,
                          background: "rgba(255,255,255,.15)", color: "#fff", backdropFilter: "blur(8px)"
                        }}>
                          {state.level}
                        </span>
                      </div>
                      {state.urgent && (
                        <div style={{
                          position: "absolute", top: ".85rem", right: ".85rem",
                          background: "#B8341E", color: "#fff", fontSize: ".55rem", fontWeight: 800,
                          padding: ".22rem .65rem", borderRadius: 100, letterSpacing: ".08em",
                          textTransform: "uppercase"
                        }}>
                          ⚡ Urgent
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "1.2rem 1.4rem" }}>
                      <div style={{
                        fontFamily: "'Fraunces',Georgia,serif", fontSize: ".95rem",
                        fontWeight: 700, color: "#141410", lineHeight: 1.3, marginBottom: ".4rem"
                      }}>
                        {state.title || "Titre de la bourse"}
                      </div>
                      <div style={{ fontSize: ".72rem", color: "#928E80" }}>
                        {state.flag} {state.organization || "Organisme"} · {state.deadline ? new Date(state.deadline).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "Date limite"}
                      </div>
                      {state.amount && (
                        <div style={{ marginTop: ".5rem", fontSize: ".7rem", fontWeight: 700, color: lvlColor }}>
                          {state.amount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ONGLET SEO AMÉLIORÉ */}
          {tab === "seo" && (
            <div className="aa-seo-panel" style={{ paddingTop: "1.5rem" }}>
              {/* Slug */}
              <div className="bs-field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".45rem" }}>
                  <label className="bs-label" style={{ margin: 0 }}>Slug (URL)</label>
                  <button
                    onClick={() => set("slugLocked", !state.slugLocked)}
                    style={{
                      fontSize: ".62rem", fontWeight: 600,
                      color: state.slugLocked ? "#C08435" : "#928E80",
                      background: "none", border: "none", cursor: "pointer", fontFamily: "inherit"
                    }}
                  >
                    {state.slugLocked ? "🔒 Déverrouiller" : "🔓 Modifier"}
                  </button>
                </div>
                <div className="aa-slug-wrap">
                  <span className="aa-slug-prefix">afripulse.com/bourses/</span>
                  <input
                    className="aa-slug-input"
                    value={state.slug}
                    onChange={e => { if (!state.slugLocked) set("slug", e.target.value); }}
                    readOnly={state.slugLocked}
                    style={{ color: state.slugLocked ? "#928E80" : "#141410" }}
                  />
                </div>
              </div>

              {/* Titre SEO avec bouton de génération */}
              <div className="bs-field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".45rem" }}>
                  <label className="bs-label" style={{ margin: 0 }}>Titre SEO</label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <button
                      onClick={fillDefaultMetaTitle}
                      disabled={!state.title}
                      style={{
                        fontSize: ".6rem", fontWeight: 600, padding: ".2rem .6rem",
                        borderRadius: 100, border: "1px solid rgba(192,132,53,.3)",
                        background: "rgba(192,132,53,.08)", color: "#C08435",
                        cursor: state.title ? "pointer" : "default", fontFamily: "inherit"
                      }}
                    >
                      🔄 Générer
                    </button>
                    <span className={`aa-char-count ${state.metaTitle.length > 60 ? "aa-char-count--err" : "aa-char-count--ok"}`}>
                      {state.metaTitle.length}/60
                    </span>
                  </div>
                </div>
                <input
                  className="bs-input"
                  value={state.metaTitle}
                  onChange={e => set("metaTitle", e.target.value)}
                  placeholder={getDefaultMetaTitle()}
                />
                {!state.metaTitle && state.title && (
                  <div style={{ fontSize: ".65rem", color: "#928E80", marginTop: ".25rem" }}>
                    💡 Suggestion : {getDefaultMetaTitle()}
                  </div>
                )}
              </div>

              {/* Description SEO avec bouton de génération */}
              <div className="bs-field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".45rem" }}>
                  <label className="bs-label" style={{ margin: 0 }}>Description SEO</label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <button
                      onClick={fillDefaultMetaDesc}
                      disabled={state.blocks.length === 0}
                      style={{
                        fontSize: ".6rem", fontWeight: 600, padding: ".2rem .6rem",
                        borderRadius: 100, border: "1px solid rgba(192,132,53,.3)",
                        background: "rgba(192,132,53,.08)", color: "#C08435",
                        cursor: state.blocks.length > 0 ? "pointer" : "default", fontFamily: "inherit"
                      }}
                    >
                      🔄 Générer
                    </button>
                    <span className={`aa-char-count ${state.metaDesc.length > 160 ? "aa-char-count--err" : "aa-char-count--ok"}`}>
                      {state.metaDesc.length}/160
                    </span>
                  </div>
                </div>
                <textarea
                  className="bs-input bs-textarea"
                  value={state.metaDesc}
                  onChange={e => set("metaDesc", e.target.value)}
                  rows={3}
                  placeholder="Description visible dans les résultats Google…"
                />
                {!state.metaDesc && state.blocks.length > 0 && (
                  <div style={{ fontSize: ".65rem", color: "#928E80", marginTop: ".25rem" }}>
                    💡 Suggestion : {getDefaultMetaDesc().slice(0, 120)}…
                  </div>
                )}
                {!state.metaDesc && state.blocks.length === 0 && (
                  <div style={{ fontSize: ".65rem", color: "#B8341E", marginTop: ".25rem" }}>
                    ⚠️ Ajoutez du contenu pour générer une description automatique.
                  </div>
                )}
              </div>

              {/* Aperçu Google en temps réel */}
              <div className="bs-field-group">
                <label className="bs-label">Aperçu dans Google</label>
                <div className="aa-seo-preview">
                  <div className="aa-seo-preview-url">afripulse.com › bourses › {previewSlug}</div>
                  <div className="aa-seo-preview-title">{previewTitle}</div>
                  <div className="aa-seo-preview-desc">{previewDesc.length > 160 ? previewDesc.slice(0, 157) + "..." : previewDesc}</div>
                </div>
                <div style={{ fontSize: ".65rem", color: "#928E80", marginTop: ".5rem" }}>
                  📌 Le titre SEO et la description sont générés automatiquement si vous les laissez vides.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR (inchangé) */}
        <aside className="aa-editor-sidebar">
          <div className="aa-sidebar-card">
            <div className="aa-sidebar-title">Publication</div>

            <div className="aa-sidebar-row">
              <span className="aa-sidebar-row-label">Statut</span>
              <div className={`aa-status-pill ${state.published ? "aa-status-pill--pub" : "aa-status-pill--draft"}`}>
                <span className={`aa-status-dot ${state.published ? "aa-status-dot--pub" : "aa-status-dot--draft"}`} />
                {state.published ? "Publiée" : "Brouillon"}
              </div>
            </div>

            <div className="aa-sidebar-row">
              <span className="aa-sidebar-row-label">Urgence</span>
              <button
                className={`aa-toggle ${state.urgent ? "aa-toggle--on" : "aa-toggle--off"}`}
                onClick={() => set("urgent", !state.urgent)}
              >
                <span
                  className={`aa-toggle-knob ${state.urgent ? "aa-toggle-knob--on" : "aa-toggle-knob--off"}`}
                  style={state.urgent ? { background: "#B8341E" } : {}}
                />
              </button>
            </div>

            {state.deadline && (
              <div style={{
                marginTop: ".75rem", padding: ".65rem .85rem", borderRadius: 12,
                background: "rgba(192,132,53,.06)", border: "1px solid rgba(192,132,53,.15)"
              }}>
                <div style={{
                  fontSize: ".58rem", fontWeight: 700, letterSpacing: ".1em",
                  textTransform: "uppercase", color: "#C08435", marginBottom: ".2rem"
                }}>
                  Date limite
                </div>
                <div style={{ fontSize: ".82rem", fontWeight: 700, color: "#141410" }}>
                  {new Date(state.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                {(() => {
                  const d = Math.ceil((new Date(state.deadline).getTime() - Date.now()) / 86400000);
                  return (
                    <div style={{
                      fontSize: ".65rem", marginTop: ".15rem",
                      color: d <= 7 ? "#B8341E" : d <= 30 ? "#C08435" : "#928E80",
                      fontWeight: 600
                    }}>
                      {d < 0 ? "Expirée" : `Dans ${d} jour${d > 1 ? "s" : ""}`}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="aa-sidebar-card">
            <div className="aa-sidebar-title">Niveau</div>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
              <span style={{
                fontSize: ".75rem", fontWeight: 800, color: lvlColor,
                background: `${lvlColor}14`, padding: ".3rem .8rem", borderRadius: 100,
                letterSpacing: ".06em", textTransform: "uppercase"
              }}>
                {state.level}
              </span>
              <span style={{ fontSize: ".72rem", color: "#928E80" }}>{state.domain || "Aucun domaine"}</span>
            </div>
            {state.amount && (
              <div style={{ marginTop: ".65rem", fontSize: ".8rem", fontWeight: 700, color: lvlColor }}>
                {state.amount}
              </div>
            )}
          </div>

          {profile?.full_name && (
            <div className="aa-sidebar-card">
              <div className="aa-sidebar-title">Ajouté par</div>
              <div className="aa-author-badge">
                <div className="aa-author-avatar" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {(profile as any)?.avatar_url
                    ? <img src={(profile as any).avatar_url} alt={profile.full_name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    : profile.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                  }
                </div>
                <div>
                  <div className="aa-author-name">{profile.full_name}</div>
                  <div className="aa-author-role">{profile.role}</div>
                </div>
              </div>
            </div>
          )}

          <button
            className="aa-save-btn"
            onClick={() => setPubModal(state.published)}
            disabled={saving}
          >
            <IcoSave />
            {saving ? "Enregistrement…" : saved ? "✓ Sauvegardé" : "Enregistrer"}
          </button>

          {itemIdRef.current && (
            <button className="aa-delete-btn" onClick={() => setDelModal(true)}>
              Supprimer la bourse
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}