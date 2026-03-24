"use client";

/**
 * app/admin/opportunites/[id]/page.tsx
 * Éditeur admin d'une opportunité — design cohérent avec admin/bourses/[id]
 * Contenu unique : blocks (comme pour les bourses)
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

/* ── Types ── */
type OpportunityType = "Emploi CDI" | "Stage" | "Graduate" | "Emploi" | "Freelance" | "Volontariat";
type Tab = "general" | "content" | "seo";

const OPP_TYPES: OpportunityType[] = ["Emploi CDI", "Stage", "Graduate", "Emploi", "Freelance", "Volontariat"];
const TYPE_COLOR: Record<string, string> = {
  "Emploi CDI": "#1A5C40",
  "Stage":      "#5A7FD4",
  "Graduate":   "#C08435",
  "Emploi":     "#2E7D4F",
  "Freelance":  "#7A4A1E",
  "Volontariat":"#928E80",
};
const COMMON_FLAGS = ["🇲🇦","🇩🇿","🇹🇳","🇸🇳","🇨🇮","🇨🇲","🇪🇬","🇿🇦","🇳🇬","🇰🇪","🇫🇷","🇺🇸","🇬🇧","🇩🇪","🇨🇦","🇧🇪","🌍","🌐"];

function slugify(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

/* ── Extraire le texte du premier bloc pour la meta description ── */
function extractFirstTextFromBlocks(blocks: Block[]): string {
  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
        if (block.text && block.text.trim().length > 0) return block.text.trim();
        break;
      case "heading":
        if (block.text && block.text.trim().length > 0) return block.text.trim();
        break;
      case "pullquote":
        if (block.text && block.text.trim().length > 0) return block.text.trim();
        break;
      case "alert":
        if (block.message && block.message.trim().length > 0) return block.message.trim();
        break;
      case "checklist":
        if (block.items && block.items.length > 0 && block.items[0].label) return block.items[0].label.trim();
        break;
      case "steps":
        if (block.items && block.items.length > 0 && block.items[0].label) return block.items[0].label.trim();
        break;
      default:
        continue;
    }
  }
  return "";
}

interface OpportunityState {
  title: string; slug: string; slugLocked: boolean;
  company: string; companyInitials: string;
  location: string; country: string; flag: string;
  type: OpportunityType; sector: string;
  deadline: string; postedAt: string;
  salary: string; remote: boolean; featured: boolean;
  applyUrl: string;
  blocks: Block[];
  coverUrl: string; skills: string[];
  published: boolean; metaTitle: string; metaDesc: string;
}

function defaultState(): OpportunityState {
  return {
    title: "", slug: "", slugLocked: false,
    company: "", companyInitials: "",
    location: "", country: "", flag: "🌍",
    type: "Emploi CDI", sector: "", deadline: "",
    postedAt: new Date().toISOString().slice(0, 10),
    salary: "", remote: false, featured: false,
    applyUrl: "",
    blocks: [],
    coverUrl: "", skills: [],
    published: false, metaTitle: "", metaDesc: "",
  };
}

/* ── Icônes ── */
const IcoBack = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
const IcoSave = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
const IcoEye  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */
export default function OpportunityEditorPage({ params }: { params: { id: string } }) {
  const sb     = createClient();
  const router = useRouter();
  const { profile } = useAuth();
  const isNew  = params.id === "nouveau";

  const [state,      setState]   = useState<OpportunityState>(defaultState());
  const [skillInput, setSkillInput] = useState("");
  const [tab,        setTab]      = useState<Tab>("general");
  const [sectors,    setSectors]  = useState<string[]>([]);
  const [customSector, setCustomSector] = useState("");

  const [loading,  setLoading]  = useState(!isNew);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);

  /* ── Modals ── */
  const [pubModal, setPubModal] = useState<null | boolean>(null);
  const [delModal, setDelModal] = useState(false);

  /* ── Refs ── */
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemIdRef   = useRef<string | null>(isNew ? null : params.id);
  const titleRef    = useRef<HTMLInputElement>(null);

  const set = useCallback(<K extends keyof OpportunityState>(k: K, v: OpportunityState[K]) =>
    setState(prev => ({ ...prev, [k]: v })), []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3500);
  };

  /* ── Chargement des secteurs existants ── */
  useEffect(() => {
    sb.from("opportunities").select("sector").then(({ data }) => {
      if (data) {
        const unique = [...new Set(data.map((d: any) => d.sector).filter(Boolean))];
        setSectors(unique.sort());
      }
    });
  }, []);

  /* ── Chargement de l'opportunité ── */
  useEffect(() => {
    if (isNew) { setTimeout(() => titleRef.current?.focus(), 120); return; }
    sb.from("opportunities").select("*").eq("id", params.id).single()
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
          // Fallback : si blocks existe en direct
          if (!parsedBlocks.length && data.blocks) {
            try {
              parsedBlocks = typeof data.blocks === "string"
                ? JSON.parse(data.blocks)
                : data.blocks;
            } catch { parsedBlocks = []; }
          }
          setState({
            title:           data.title ?? "",
            slug:            data.slug ?? "",
            slugLocked:      true,
            company:         data.company ?? "",
            companyInitials: data.company_initials ?? "",
            location:        data.location ?? "",
            country:         data.country ?? "",
            flag:            data.flag ?? "🌍",
            type:            data.type ?? "Emploi CDI",
            sector:          data.sector ?? "",
            deadline:        data.deadline ?? "",
            postedAt:        data.posted_at ? data.posted_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
            salary:          data.salary ?? "",
            remote:          data.remote ?? false,
            featured:        data.featured ?? false,
            applyUrl:        data.apply_url ?? "",
            blocks:          parsedBlocks,
            coverUrl:        data.cover_url ?? "",
            skills:          data.skills ?? [],
            published:       data.published ?? false,
            metaTitle:       data.meta_title ?? "",
            metaDesc:        data.meta_desc ?? "",
          });
        }
        setLoading(false);
      });
  }, [params.id, isNew]);

  /* ── Autosave localStorage ── */
  useEffect(() => {
    if (loading || isNew || !itemIdRef.current) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (!itemIdRef.current) return;
      try { localStorage.setItem(`afripulse_draft_opportunity_${itemIdRef.current}`, JSON.stringify(state)); } catch { }
    }, 1500);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [state, loading, isNew]);

  /* ── Auto-slug ── */
  useEffect(() => {
    if (!state.slugLocked && state.title) set("slug", slugify(state.title));
  }, [state.title, state.slugLocked]);

  /* ── Auto company initials ── */
  useEffect(() => {
    if (!state.companyInitials && state.company) {
      const initials = state.company.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase();
      set("companyInitials", initials);
    }
  }, [state.company]);

  /* ── Skills ── */
  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !state.skills.includes(t)) { set("skills", [...state.skills, t]); setSkillInput(""); }
  };

  /* ── SEO auto ── */
  const getDefaultMetaTitle = () => {
    if (state.title) return `${state.title} — ${state.company || "Offre d'emploi"} | AfriPulse`;
    return "Offre d'emploi | AfriPulse";
  };
  const getDefaultMetaDesc = () => {
    const firstText = extractFirstTextFromBlocks(state.blocks);
    if (firstText && firstText.length > 0) {
      return firstText.length > 160 ? firstText.slice(0, 157) + "..." : firstText;
    }
    return `${state.type || "Poste"} chez ${state.company || "cette entreprise"} — ${state.sector || "Secteur"} — ${state.location || "Afrique"}. ${state.remote ? "Poste remote." : ""} ${state.salary ? `Rémunération : ${state.salary}.` : ""} Candidatez avant ${state.deadline || "la date limite"}.`;
  };

  const fillDefaultMetaTitle = () => {
    if (!state.metaTitle && state.title) { set("metaTitle", getDefaultMetaTitle()); showToast("Titre SEO généré automatiquement"); }
  };
  const fillDefaultMetaDesc = () => {
    if (!state.metaDesc && state.blocks.length > 0) { set("metaDesc", getDefaultMetaDesc()); showToast("Description SEO générée automatiquement"); }
    else if (!state.metaDesc && !state.blocks.length) { showToast("Ajoutez du contenu d'abord", false); }
  };

  /* ── Ajouter secteur personnalisé ── */
  const addCustomSector = () => {
    const s = customSector.trim();
    if (s && !sectors.includes(s)) {
      setSectors(prev => [...prev, s].sort());
      set("sector", s);
      setCustomSector("");
    }
  };

  /* ── Sauvegarde ── */
  const save = async (pub?: boolean) => {
    if (!state.title.trim())   { showToast("Le titre est requis", false); return; }
    if (!state.company.trim()) { showToast("L'entreprise est requise", false); return; }
    if (state.skills.length === 0) { showToast("Ajoutez au moins une compétence", false); return; }
    setSaving(true);

    const pubNow = pub !== undefined ? pub : state.published;
    const finalMetaTitle = state.metaTitle || getDefaultMetaTitle();
    const finalMetaDesc  = state.metaDesc  || getDefaultMetaDesc();

    const payload: Record<string, unknown> = {
      title:           state.title.trim(),
      slug:            state.slug || slugify(state.title),
      company:         state.company.trim(),
      company_initials: state.companyInitials.trim() || state.company.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase(),
      location:        state.location.trim() || "",
      country:         state.country.trim() || "",
      flag:            state.flag,
      type:            state.type,
      sector:          state.sector.trim() || null,
      deadline:        state.deadline || null,
      posted_at:       state.postedAt || new Date().toISOString().slice(0, 10),
      salary:          state.salary.trim() || null,
      remote:          state.remote,
      featured:        state.featured,
      apply_url:       state.applyUrl.trim() || null,
      content:         state.blocks,
      cover_url:       state.coverUrl || null,
      image_gradient:  `linear-gradient(135deg,${TYPE_COLOR[state.type] || "#1A5C40"}22,#0a0800)`,
      skills:          state.skills,
      published:       pubNow,
      meta_title:      finalMetaTitle,
      meta_desc:       finalMetaDesc,
    };

    const existingId = itemIdRef.current;
    const { data, error } = existingId === null
      ? await (sb.from("opportunities") as any).insert(payload).select("id,slug").single()
      : await (sb.from("opportunities") as any).update(payload).eq("id", existingId).select("id,slug").single();

    if (error) { showToast("Erreur : " + error.message, false); setSaving(false); return; }

    const newId = (data as any)?.id as string | undefined;
    if (existingId === null && newId) {
      itemIdRef.current = newId;
      showToast(pubNow ? "Opportunité publiée !" : "Brouillon créé !");
      router.push(`/admin/opportunites/${newId}`);
    } else {
      if (pub !== undefined) setState(prev => ({ ...prev, published: pub }));
      setSaved(true); setTimeout(() => setSaved(false), 3000);
      showToast(pub === true ? "Opportunité publiée !" : pub === false ? "Brouillon sauvegardé" : "Sauvegardé");
    }
    setSaving(false);
  };

  /* ── Brouillon local ── */
  const restoreDraft = () => {
    if (!itemIdRef.current) return;
    try {
      const raw = localStorage.getItem(`afripulse_draft_opportunity_${itemIdRef.current}`);
      if (raw) { setState(JSON.parse(raw)); showToast("Brouillon local restauré"); }
    } catch { showToast("Impossible de restaurer", false); }
  };
  const clearDraft = () => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    try { if (itemIdRef.current) localStorage.removeItem(`afripulse_draft_opportunity_${itemIdRef.current}`); } catch { }
  };

  if (loading) return (
    <div className="aa-fullpage-loader"><div className="aa-loader-ring" /></div>
  );

  const tc = TYPE_COLOR[state.type] ?? "#1A5C40";
  const previewSlug = state.slug || slugify(state.title || "opportunite");
  const hasDraft = (() => {
    try { return itemIdRef.current && !!localStorage.getItem(`afripulse_draft_opportunity_${itemIdRef.current}`); } catch { return false; }
  })();

  const previewTitle = state.metaTitle || getDefaultMetaTitle();
  const previewDesc  = state.metaDesc  || getDefaultMetaDesc();

  return (
    <div className="aa-editor-page">
      <style>{`
        .op-input { width:100%; padding:.65rem .9rem; border-radius:12px; font-size:.88rem; font-family:inherit; outline:none; border:1.5px solid rgba(20,20,16,.12); background:#F8F6F1; color:#141410; transition:border-color .15s; box-sizing:border-box; }
        .op-input:focus { border-color:#1A5C40; box-shadow:0 0 0 3px rgba(26,92,64,.1); }
        .op-textarea { resize:vertical; min-height:120px; }
        .op-label { font-size:.6rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#928E80; display:block; margin-bottom:.45rem; }
        .op-field-group { margin-bottom:1.4rem; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`aa-toast ${toast.ok ? "aa-toast--ok" : "aa-toast--err"}`}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Modal publication */}
      {pubModal !== null && (
        <div className="aa-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setPubModal(null); }}>
          <div className="aa-modal">
            <div className="aa-modal-icon aa-modal-icon--warning">
              {pubModal ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A5C40" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A5C40" strokeWidth="1.8"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
              )}
            </div>
            <div className="aa-modal-title">
              {pubModal ? "Publier cette opportunité ?" : "Enregistrer les modifications"}
            </div>
            <p className="aa-modal-desc">
              {pubModal
                ? "L'opportunité sera visible par tous les visiteurs d'AfriPulse."
                : "Les modifications seront sauvegardées."}
            </p>
            <div className="aa-modal-actions">
              <button className="aa-btn aa-btn--secondary" onClick={() => setPubModal(null)}>Annuler</button>
              <button className="aa-btn aa-btn--primary" onClick={() => { const target = pubModal; setPubModal(null); save(target); }}>
                {pubModal ? "Publier" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {delModal && (
        <div className="aa-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDelModal(false); }}>
          <div className="aa-modal">
            <div className="aa-modal-icon aa-modal-icon--danger">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B8341E" strokeWidth="1.8"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
            </div>
            <div className="aa-modal-title">Supprimer cette opportunité ?</div>
            <p className="aa-modal-desc">Cette action est <strong>irréversible</strong>. Toutes les données seront définitivement perdues.</p>
            <div className="aa-modal-actions">
              <button className="aa-btn aa-btn--secondary" onClick={() => setDelModal(false)}>Annuler</button>
              <button className="aa-btn aa-btn--danger" onClick={async () => {
                await sb.from("opportunities").delete().eq("id", itemIdRef.current ?? "");
                showToast("Opportunité supprimée !");
                router.push("/admin/opportunites");
              }}>Supprimer définitivement</button>
            </div>
          </div>
        </div>
      )}

      {/* TOPBAR */}
      <div className="aa-editor-topbar">
        <div className="aa-editor-breadcrumb">
          <Link href="/admin/opportunites" className="aa-editor-back">
            <IcoBack /> Opportunités
          </Link>
          <span className="aa-editor-crumb-sep">›</span>
          <span className="aa-editor-crumb-name">
            {state.title || (isNew ? "Nouvelle opportunité" : "Éditer")}
          </span>
        </div>

        <div className="aa-editor-indicators">
          {state.featured && (
            <span className="aa-editor-draft-badge" style={{ background: "rgba(192,132,53,.1)", color: "#C08435" }}>⭐ En vedette</span>
          )}
          {state.remote && (
            <span className="aa-editor-draft-badge" style={{ background: "rgba(90,127,212,.1)", color: "#5A7FD4" }}>🌐 Remote</span>
          )}
          {hasDraft && !saving && (
            <span className="aa-editor-draft-badge" title="Brouillon local non sauvegardé">● local</span>
          )}
          <span className={`aa-editor-status-dot ${state.published ? "aa-editor-status-dot--pub" : "aa-editor-status-dot--draft"}`} />
          <span className="aa-editor-status-label">{state.published ? "Publiée" : "Brouillon"}</span>
        </div>

        <div className="aa-editor-actions">
          <Link
            href={`/opportunites/${previewSlug}${!state.published ? "?preview=1" : ""}`}
            target="_blank"
            className="aa-editor-preview-btn"
          >
            <IcoEye /> Aperçu
          </Link>
          <button className="aa-editor-draft-btn" onClick={() => setPubModal(false)} disabled={saving}>
            {saving ? "…" : "Brouillon"}
          </button>
          <button className="aa-editor-publish-btn" onClick={() => setPubModal(true)} disabled={saving}>
            {saved ? "✓ Sauvegardé" : state.published ? "Enregistrer →" : "Publier →"}
          </button>
        </div>
      </div>

      {/* Bandeau brouillon local */}
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
            placeholder="Titre du poste…"
            className="aa-title-input"
          />

          {/* Tabs */}
          <div className="aa-tabs">
            {(["general", "content", "seo"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`aa-tab ${tab === t ? "aa-tab--active" : ""}`}>
                {{ general: "Général", content: "Contenu", seo: "SEO" }[t]}
              </button>
            ))}
          </div>

          {/* ═══ ONGLET GÉNÉRAL ═══ */}
          {tab === "general" && (
            <div style={{ paddingTop: "1.5rem" }}>
              {/* Entreprise + Initiales */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem" }}>
                <div className="op-field-group">
                  <label className="op-label">Entreprise *</label>
                  <input className="op-input" value={state.company} onChange={e => set("company", e.target.value)} placeholder="Ex : Google, Banque Mondiale, ONU…" />
                </div>
                <div className="op-field-group" style={{ width: 120 }}>
                  <label className="op-label">Initiales</label>
                  <input className="op-input" value={state.companyInitials} onChange={e => set("companyInitials", e.target.value.toUpperCase().slice(0, 4))} placeholder="Ex : WB" maxLength={4} style={{ textTransform: "uppercase", textAlign: "center", fontWeight: 800, letterSpacing: ".05em" }} />
                </div>
              </div>

              {/* Localisation + Pays + Drapeau */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="op-field-group">
                  <label className="op-label">Localisation</label>
                  <input className="op-input" value={state.location} onChange={e => set("location", e.target.value)} placeholder="Ex : Nairobi, Abidjan, Remote…" />
                </div>
                <div className="op-field-group">
                  <label className="op-label">Pays</label>
                  <input className="op-input" value={state.country} onChange={e => set("country", e.target.value)} placeholder="Ex : Kenya, Côte d'Ivoire…" />
                </div>
              </div>

              {/* Drapeau */}
              <div className="op-field-group">
                <label className="op-label">Drapeau</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem", marginBottom: ".35rem" }}>
                  {COMMON_FLAGS.map(f => (
                    <button key={f} onClick={() => set("flag", f)} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: state.flag === f ? "rgba(26,92,64,.15)" : "rgba(20,20,16,.05)", fontSize: "1.2rem", cursor: "pointer", outline: state.flag === f ? "2px solid #1A5C40" : "none" }}>
                      {f}
                    </button>
                  ))}
                </div>
                <input className="op-input" value={state.flag} onChange={e => set("flag", e.target.value)} placeholder="Emoji drapeau personnalisé" />
              </div>

              {/* Type de contrat */}
              <div className="op-field-group">
                <label className="op-label">Type de contrat *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                  {OPP_TYPES.map(t => {
                    const active = state.type === t;
                    const lc = TYPE_COLOR[t];
                    return (
                      <button key={t} onClick={() => set("type", t)} className="aa-cat-pill"
                        style={{ border: `1.5px solid ${active ? lc : "rgba(20,20,16,.12)"}`, background: active ? `${lc}14` : "transparent", color: active ? lc : "#38382E" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secteur */}
              <div className="op-field-group">
                <label className="op-label">Secteur</label>
                <select value={state.sector} onChange={e => set("sector", e.target.value)} className="op-input">
                  <option value="">Sélectionner un secteur</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <input type="text" placeholder="Ou ajouter un nouveau secteur" value={customSector} onChange={e => setCustomSector(e.target.value)} className="op-input" style={{ flex: 1 }} />
                  <button onClick={addCustomSector} disabled={!customSector.trim()} style={{ padding: "0 1rem", borderRadius: 10, border: "none", background: customSector.trim() ? "#141410" : "rgba(20,20,16,.1)", color: customSector.trim() ? "#fff" : "#928E80", cursor: customSector.trim() ? "pointer" : "default", fontSize: "0.78rem", fontWeight: 700 }}>
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Deadline + Salaire */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="op-field-group">
                  <label className="op-label">Date limite de candidature</label>
                  <input type="date" className="op-input" value={state.deadline} onChange={e => set("deadline", e.target.value)} />
                </div>
                <div className="op-field-group">
                  <label className="op-label">Rémunération</label>
                  <input className="op-input" value={state.salary} onChange={e => set("salary", e.target.value)} placeholder="Ex : 85 000 USD/an, Compétitif…" />
                </div>
              </div>

              {/* URL de candidature */}
              <div className="op-field-group">
                <label className="op-label">URL de candidature</label>
                <input className="op-input" value={state.applyUrl} onChange={e => set("applyUrl", e.target.value)} placeholder="https://careers.exemple.com/postuler" type="url" />
              </div>

              {/* Compétences */}
              <div className="op-field-group">
                <label className="op-label">Compétences requises *</label>
                <div className="aa-tags-list" style={{ marginBottom: ".5rem" }}>
                  {state.skills.map(s => (
                    <span key={s} className="aa-tag">
                      {s}
                      <button className="aa-tag-remove" onClick={() => set("skills", state.skills.filter(x => x !== s))}>✕</button>
                    </span>
                  ))}
                </div>
                <div className="aa-tag-row">
                  <input className="aa-field" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="Ex : Python, Leadership, SQL… puis Entrée" />
                  <button className="aa-tag-add-btn" onClick={addSkill}>Ajouter</button>
                </div>
              </div>

              {/* Image de couverture */}
              <div className="op-field-group">
                <ImageUpload
                  bucket="opportunities"
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

          {/* ═══ ONGLET CONTENU ═══ */}
          {tab === "content" && (
            <div style={{ paddingTop: "1.5rem" }}>
              <div className="op-field-group">
                <label className="op-label">Contenu de l'opportunité</label>
                <p style={{ fontSize: ".72rem", color: "#928E80", marginBottom: ".6rem", lineHeight: 1.5 }}>
                  Construisez le contenu de l'offre (description, avantages, critères, processus de recrutement…) en ajoutant des blocs.
                </p>
                <BlockBuilder blocks={state.blocks} onChange={blocks => set("blocks", blocks)} preset="opportunity" />
              </div>

              {/* Aperçu rapide de la carte */}
              {state.title && (
                <div style={{ marginTop: "2rem" }}>
                  <label className="op-label">Aperçu carte</label>
                  <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(20,20,16,.08)", boxShadow: "0 2px 12px rgba(20,20,16,.07)", maxWidth: 380 }}>
                    <div style={{ height: 140, position: "relative", background: state.coverUrl ? `url(${state.coverUrl}) center/cover` : `linear-gradient(135deg,${tc}22,#0a0800)` }}>
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent,rgba(0,0,0,.5))" }} />
                      <div style={{ position: "absolute", top: ".85rem", left: ".85rem" }}>
                        <span style={{ fontSize: ".55rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", padding: ".22rem .7rem", borderRadius: 100, background: "rgba(255,255,255,.15)", color: "#fff", backdropFilter: "blur(8px)" }}>
                          {state.type}
                        </span>
                      </div>
                      {state.remote && (
                        <div style={{ position: "absolute", top: ".85rem", right: ".85rem", background: "rgba(90,127,212,.9)", color: "#fff", fontSize: ".55rem", fontWeight: 800, padding: ".22rem .65rem", borderRadius: 100, letterSpacing: ".08em", textTransform: "uppercase" }}>
                          🌐 Remote
                        </div>
                      )}
                      {state.featured && (
                        <div style={{ position: "absolute", bottom: ".85rem", right: ".85rem" }}>
                          <span style={{ fontSize: ".65rem" }}>⭐</span>
                        </div>
                      )}
                      {!state.coverUrl && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: "2rem", fontWeight: 900, color: "#fff", opacity: .2 }}>
                            {state.companyInitials || state.company?.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "1.2rem 1.4rem" }}>
                      <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: ".95rem", fontWeight: 700, color: "#141410", lineHeight: 1.3, marginBottom: ".4rem" }}>
                        {state.title || "Titre du poste"}
                      </div>
                      <div style={{ fontSize: ".72rem", color: "#928E80" }}>
                        {state.flag} {state.company || "Entreprise"} · {state.location || "Localisation"}
                      </div>
                      {state.salary && (
                        <div style={{ marginTop: ".5rem", fontSize: ".7rem", fontWeight: 700, color: tc }}>
                          {state.salary}
                        </div>
                      )}
                      {state.skills.length > 0 && (
                        <div style={{ marginTop: ".6rem", display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
                          {state.skills.slice(0, 3).map(s => (
                            <span key={s} style={{ fontSize: ".55rem", fontWeight: 600, padding: ".15rem .5rem", borderRadius: 100, background: `${tc}14`, color: tc }}>
                              {s}
                            </span>
                          ))}
                          {state.skills.length > 3 && <span style={{ fontSize: ".55rem", color: "#928E80" }}>+{state.skills.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ ONGLET SEO ═══ */}
          {tab === "seo" && (
            <div className="aa-seo-panel" style={{ paddingTop: "1.5rem" }}>
              {/* Slug */}
              <div className="op-field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".45rem" }}>
                  <label className="op-label" style={{ margin: 0 }}>Slug (URL)</label>
                  <button onClick={() => set("slugLocked", !state.slugLocked)} style={{ fontSize: ".62rem", fontWeight: 600, color: state.slugLocked ? "#1A5C40" : "#928E80", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                    {state.slugLocked ? "🔒 Déverrouiller" : "🔓 Modifier"}
                  </button>
                </div>
                <div className="aa-slug-wrap">
                  <span className="aa-slug-prefix">afripulse.com/opportunites/</span>
                  <input className="aa-slug-input" value={state.slug} onChange={e => { if (!state.slugLocked) set("slug", e.target.value); }} readOnly={state.slugLocked} style={{ color: state.slugLocked ? "#928E80" : "#141410" }} />
                </div>
              </div>

              {/* Titre SEO */}
              <div className="op-field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".45rem" }}>
                  <label className="op-label" style={{ margin: 0 }}>Titre SEO</label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <button onClick={fillDefaultMetaTitle} disabled={!state.title}
                      style={{ fontSize: ".6rem", fontWeight: 600, padding: ".2rem .6rem", borderRadius: 100, border: "1px solid rgba(26,92,64,.3)", background: "rgba(26,92,64,.08)", color: "#1A5C40", cursor: state.title ? "pointer" : "default", fontFamily: "inherit" }}>
                      🔄 Générer
                    </button>
                    <span className={`aa-char-count ${state.metaTitle.length > 60 ? "aa-char-count--err" : "aa-char-count--ok"}`}>
                      {state.metaTitle.length}/60
                    </span>
                  </div>
                </div>
                <input className="op-input" value={state.metaTitle} onChange={e => set("metaTitle", e.target.value)} placeholder={getDefaultMetaTitle()} />
                {!state.metaTitle && state.title && (
                  <div style={{ fontSize: ".65rem", color: "#928E80", marginTop: ".25rem" }}>💡 Suggestion : {getDefaultMetaTitle()}</div>
                )}
              </div>

              {/* Description SEO */}
              <div className="op-field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".45rem" }}>
                  <label className="op-label" style={{ margin: 0 }}>Description SEO</label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <button onClick={fillDefaultMetaDesc} disabled={state.blocks.length === 0}
                      style={{ fontSize: ".6rem", fontWeight: 600, padding: ".2rem .6rem", borderRadius: 100, border: "1px solid rgba(26,92,64,.3)", background: "rgba(26,92,64,.08)", color: "#1A5C40", cursor: state.blocks.length > 0 ? "pointer" : "default", fontFamily: "inherit" }}>
                      🔄 Générer
                    </button>
                    <span className={`aa-char-count ${state.metaDesc.length > 160 ? "aa-char-count--err" : "aa-char-count--ok"}`}>
                      {state.metaDesc.length}/160
                    </span>
                  </div>
                </div>
                <textarea className="op-input op-textarea" value={state.metaDesc} onChange={e => set("metaDesc", e.target.value)} rows={3} placeholder="Description visible dans les résultats Google…" />
                {!state.metaDesc && state.blocks.length > 0 && (
                  <div style={{ fontSize: ".65rem", color: "#928E80", marginTop: ".25rem" }}>💡 Suggestion : {getDefaultMetaDesc().slice(0, 120)}…</div>
                )}
                {!state.metaDesc && state.blocks.length === 0 && (
                  <div style={{ fontSize: ".65rem", color: "#B8341E", marginTop: ".25rem" }}>⚠️ Ajoutez du contenu pour générer une description automatique.</div>
                )}
              </div>

              {/* Aperçu Google */}
              <div className="op-field-group">
                <label className="op-label">Aperçu dans Google</label>
                <div className="aa-seo-preview">
                  <div className="aa-seo-preview-url">afripulse.com › opportunites › {previewSlug}</div>
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

        {/* ═══ SIDEBAR ═══ */}
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
              <span className="aa-sidebar-row-label">En vedette</span>
              <button className={`aa-toggle ${state.featured ? "aa-toggle--on" : "aa-toggle--off"}`} onClick={() => set("featured", !state.featured)}>
                <span className={`aa-toggle-knob ${state.featured ? "aa-toggle-knob--on" : "aa-toggle-knob--off"}`} style={state.featured ? { background: "#C08435" } : {}} />
              </button>
            </div>
            <div className="aa-sidebar-row">
              <span className="aa-sidebar-row-label">Remote</span>
              <button className={`aa-toggle ${state.remote ? "aa-toggle--on" : "aa-toggle--off"}`} onClick={() => set("remote", !state.remote)}>
                <span className={`aa-toggle-knob ${state.remote ? "aa-toggle-knob--on" : "aa-toggle-knob--off"}`} style={state.remote ? { background: "#5A7FD4" } : {}} />
              </button>
            </div>

            {state.deadline && (
              <div style={{ marginTop: ".75rem", padding: ".65rem .85rem", borderRadius: 12, background: "rgba(26,92,64,.06)", border: "1px solid rgba(26,92,64,.15)" }}>
                <div style={{ fontSize: ".58rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#1A5C40", marginBottom: ".2rem" }}>Date limite</div>
                <div style={{ fontSize: ".82rem", fontWeight: 700, color: "#141410" }}>
                  {new Date(state.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                {(() => {
                  const d = Math.ceil((new Date(state.deadline).getTime() - Date.now()) / 86400000);
                  return (
                    <div style={{ fontSize: ".65rem", marginTop: ".15rem", color: d <= 7 ? "#B8341E" : d <= 30 ? "#C08435" : "#928E80", fontWeight: 600 }}>
                      {d < 0 ? "Expirée" : `Dans ${d} jour${d > 1 ? "s" : ""}`}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="aa-sidebar-card">
            <div className="aa-sidebar-title">Contrat</div>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
              <span style={{ fontSize: ".75rem", fontWeight: 800, color: tc, background: `${tc}14`, padding: ".3rem .8rem", borderRadius: 100, letterSpacing: ".06em", textTransform: "uppercase" }}>
                {state.type}
              </span>
              <span style={{ fontSize: ".72rem", color: "#928E80" }}>{state.sector || "Aucun secteur"}</span>
            </div>
            {state.salary && (
              <div style={{ marginTop: ".65rem", fontSize: ".8rem", fontWeight: 700, color: tc }}>{state.salary}</div>
            )}
            {state.location && (
              <div style={{ marginTop: ".35rem", fontSize: ".72rem", color: "#928E80" }}>{state.flag} {state.location}</div>
            )}
          </div>

          {state.skills.length > 0 && (
            <div className="aa-sidebar-card">
              <div className="aa-sidebar-title">Compétences</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
                {state.skills.map(s => (
                  <span key={s} style={{ fontSize: ".65rem", fontWeight: 600, padding: ".2rem .55rem", borderRadius: 100, background: `${tc}12`, color: tc }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

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

          <button className="aa-save-btn" onClick={() => setPubModal(state.published)} disabled={saving}>
            <IcoSave />
            {saving ? "Enregistrement…" : saved ? "✓ Sauvegardé" : "Enregistrer"}
          </button>

          {itemIdRef.current && (
            <button className="aa-delete-btn" onClick={() => setDelModal(true)}>
              Supprimer l'opportunité
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}