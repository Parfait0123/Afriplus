"use client";

/**
 * app/admin/actualites/[id]/page.tsx
 * — autosave localStorage (récupère les données au reload)
 * — sauvegarde brouillon + publication séparées
 * — aperçu dans un nouvel onglet
 * — gradient auto selon catégorie
 * — image upload (pas de champ URL)
 * — auteur pré-rempli depuis useAuth
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BlockBuilder from "@/components/admin/BlockBuilder";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { Article, Block, Category, ArticleContent } from "@/types/database";

/* ── Config ─────────────────────────────────────────────── */
const CATEGORIES: Category[] = [
  "Politique","Économie","Tech","Sport","Culture","Santé","Environnement",
];
const CAT_COLOR: Record<string, string> = {
  Politique:"#5A7FD4", Économie:"#C08435", Tech:"#4A9E6F",
  Sport:"#C25B3F", Culture:"#9B6B3A", Santé:"#4A9E9E", Environnement:"#5A8F5A",
};
const CAT_GRADIENT: Record<string, string> = {
  Politique:     "linear-gradient(135deg,#050010,#0a0020,#10003a)",
  Économie:      "linear-gradient(135deg,#0a0800,#1a1400,#2a2000)",
  Tech:          "linear-gradient(135deg,#001a0f,#002e1a,#004025)",
  Sport:         "linear-gradient(135deg,#0e0005,#1a000a,#260010)",
  Culture:       "linear-gradient(135deg,#0a0500,#1a0e00,#2e1800)",
  Santé:         "linear-gradient(135deg,#001005,#001a0a,#002814)",
  Environnement: "linear-gradient(135deg,#001018,#001a28,#002535)",
};

function slugify(t: string) {
  return t.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9\s-]/g,"").trim()
    .replace(/\s+/g,"-").replace(/-+/g,"-");
}

/* ── Icônes ─────────────────────────────────────────────── */
const IcoSave  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcoBack  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IcoEye   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

/* ── Types état ─────────────────────────────────────────── */
interface EditorState {
  title: string; excerpt: string; intro: string; blocks: Block[];
  category: Category; authorName: string; readingTime: number;
  featured: boolean; published: boolean; coverUrl: string;
  tags: string[]; metaTitle: string; metaDesc: string;
  slug: string; slugLocked: boolean;
}

function defaultState(profileName?: string): EditorState {
  return {
    title:"", excerpt:"", intro:"", blocks:[],
    category:"Économie", authorName: profileName ?? "",
    readingTime:5, featured:false, published:false,
    coverUrl:"", tags:[], metaTitle:"", metaDesc:"",
    slug:"", slugLocked:false,
  };
}

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function ArticleEditorPage({ params }: { params: { id: string } }) {
  const sb     = createClient();
  const router = useRouter();
  const { profile } = useAuth();
  const isNew  = params.id === "nouveau";
  const DRAFT_KEY = `afripulse_draft_article_${params.id}`;

  /* ── État formulaire (un seul objet pour le localStorage) ── */
  const [state,       setState]     = useState<EditorState>(defaultState());
  const [tagInput,    setTagInput]  = useState("");
  const [activeTab,   setActiveTab] = useState<"content"|"seo"|"settings">("content");

  /* ── État UI ── */
  const [loading,     setLoading]   = useState(!isNew);
  const [saving,      setSaving]    = useState(false);
  const [saved,       setSaved]     = useState(false);
  const [hasDraft,    setHasDraft]  = useState(false);
  const [toast,       setToast]     = useState<{ msg: string; ok: boolean } | null>(null);

  const titleRef    = useRef<HTMLInputElement>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Helpers state ── */
  const set = useCallback(<K extends keyof EditorState>(k: K, v: EditorState[K]) =>
    setState(prev => ({ ...prev, [k]: v })), []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Autosave dans localStorage (debounce 1.5s) ── */
  useEffect(() => {
    if (loading) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
        setHasDraft(true);
      } catch { /* quota exceeded */ }
    }, 1500);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [state, loading]);

  /* ── Auteur depuis profil ── */
  useEffect(() => {
    if (isNew && profile?.full_name && !state.authorName) {
      set("authorName", profile.full_name);
    }
  }, [profile, isNew]);

  /* ── Chargement : article Supabase ou brouillon localStorage ── */
  useEffect(() => {
    if (isNew) {
      // Recharger le brouillon localStorage si existant
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw) as EditorState;
          setState(draft);
          setHasDraft(true);
          showToast("Brouillon local restauré ✦", true);
        }
      } catch { /* ignore */ }
      setTimeout(() => titleRef.current?.focus(), 120);
      return;
    }

    // Article existant : Supabase prioritaire
    (sb.from("articles") as any).select("*").eq("id", params.id).single()
      .then(({ data }: any) => {
        if (data) {
          const a = data as Article;
          setState({
            title:       a.title,
            excerpt:     a.excerpt ?? "",
            intro:       a.content?.intro ?? "",
            blocks:      a.content?.blocks ?? [],
            category:    a.category,
            authorName:  a.author_name,
            readingTime: a.reading_time,
            featured:    a.featured,
            published:   a.published,
            coverUrl:    a.cover_url ?? "",
            tags:        a.tags ?? [],
            metaTitle:   (a as any).meta_title ?? "",
            metaDesc:    (a as any).meta_desc ?? "",
            slug:        a.slug,
            slugLocked:  true,
          });
          // Vérifier si un brouillon local plus récent existe
          try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (raw) setHasDraft(true);
          } catch { /* ignore */ }
        }
        setLoading(false);
      });
  }, [params.id, isNew]);

  /* ── Auto-slug ── */
  useEffect(() => {
    if (!state.slugLocked && state.title)
      set("slug", slugify(state.title));
  }, [state.title, state.slugLocked]);

  /* ── Tags ── */
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !state.tags.includes(t)) {
      set("tags", [...state.tags, t]);
      setTagInput("");
    }
  };

  /* ── Restaurer brouillon local ── */
  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) { setState(JSON.parse(raw)); showToast("Brouillon local restauré"); }
    } catch { showToast("Impossible de restaurer", false); }
  };

  /* ── Effacer brouillon local ── */
  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); setHasDraft(false); } catch { /* ignore */ }
  };

  /* ── Sauvegarde Supabase ── */
  const save = async (pub?: boolean) => {
    if (!state.title.trim()) { showToast("Le titre est requis", false); return; }
    setSaving(true);
    const content: ArticleContent = { intro: state.intro, blocks: state.blocks };
    const pubNow = pub !== undefined ? pub : state.published;
    const payload = {
      title:          state.title.trim(),
      slug:           state.slug || slugify(state.title),
      excerpt:        state.excerpt.trim() || null,
      content,
      category:       state.category,
      author_name:    state.authorName,
      reading_time:   state.readingTime,
      featured:       state.featured,
      published:      pubNow,
      published_at:   pubNow ? new Date().toISOString() : null,
      image_gradient: CAT_GRADIENT[state.category] ?? "linear-gradient(135deg,#0a0800,#261e00)",
      cover_url:      state.coverUrl || null,
      tags:           state.tags,
      meta_title:     state.metaTitle || null,
      meta_desc:      state.metaDesc || null,
    };
    const { data, error } = isNew
      ? await (sb.from("articles") as any).insert(payload).select("id,slug").single()
      : await (sb.from("articles") as any).update(payload).eq("id", params.id).select("id,slug").single();
    setSaving(false);
    if (error) {
      showToast("Erreur : " + error.message, false);
    } else {
      setSaved(true); setTimeout(() => setSaved(false), 3000);
      // Effacer le brouillon local après sauvegarde réussie
      clearDraft();
      if (pub !== undefined) set("published", pub);
      showToast(pub === true ? "Article publié !" : pub === false ? "Brouillon sauvegardé" : "Sauvegardé");
      if (isNew && data) router.replace(`/admin/actualites/${(data as any).id}`);
    }
  };

  /* ── Computed ── */
  const wordCount = [state.intro, ...state.blocks.map(b => "text" in b ? (b as any).text : "")].join(" ")
    .trim().split(/\s+/).filter(Boolean).length;
  const estTime  = Math.max(1, Math.ceil(wordCount / 200));
  const catColor = CAT_COLOR[state.category] ?? "#C08435";
  const previewSlug = state.slug || slugify(state.title || "apercu");

  if (loading) return (
    <div className="aa-fullpage-loader"><div className="aa-loader-ring" /></div>
  );

  return (
    <div className="aa-editor-page">

      {/* ── Toast ── */}
      {toast && (
        <div className={`aa-toast ${toast.ok ? "aa-toast--ok" : "aa-toast--err"}`}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* ════ TOPBAR ════ */}
      <div className="aa-editor-topbar">
        <div className="aa-editor-breadcrumb">
          <Link href="/admin/actualites" className="aa-editor-back">
            <IcoBack /> Actualités
          </Link>
          <span className="aa-editor-crumb-sep">›</span>
          <span className="aa-editor-crumb-name">
            {state.title || (isNew ? "Nouvel article" : "Éditer")}
          </span>
        </div>

        <div className="aa-editor-indicators">
          <span className="aa-editor-wordcount">{wordCount} mots · ~{estTime} min</span>
          {hasDraft && !saving && (
            <span className="aa-editor-draft-badge" title="Brouillon local non sauvegardé">
              ● local
            </span>
          )}
          <span className={`aa-editor-status-dot ${state.published ? "aa-editor-status-dot--pub" : "aa-editor-status-dot--draft"}`} />
          <span className="aa-editor-status-label">{state.published ? "Publié" : "Brouillon"}</span>
        </div>

        <div className="aa-editor-actions">
          {/* Aperçu — ouvre le slug dans un nouvel onglet */}
          <Link
            href={`/actualites/${previewSlug}${!state.published ? "?preview=1" : ""}`}
            target="_blank"
            className="aa-editor-preview-btn"
          >
            <IcoEye /> Aperçu
          </Link>

          {/* Enregistrer comme brouillon */}
          <button
            className="aa-editor-draft-btn"
            onClick={() => save(false)}
            disabled={saving}
          >
            {saving ? "…" : "Brouillon"}
          </button>

          {/* Publier */}
          <button
            className="aa-editor-publish-btn"
            onClick={() => save(true)}
            disabled={saving}
          >
            {saving ? "Enregistrement…" : saved ? "✓ Sauvegardé" : state.published ? "Enregistrer →" : "Publier →"}
          </button>
        </div>
      </div>

      {/* ── Bandeau brouillon local récupérable ── */}
      {hasDraft && !isNew && (
        <div className="aa-draft-banner">
          <span>📝 Un brouillon local non sauvegardé existe.</span>
          <button onClick={restoreDraft} className="aa-draft-banner-btn">Restaurer</button>
          <button onClick={clearDraft}  className="aa-draft-banner-dismiss">Ignorer</button>
        </div>
      )}

      {/* ════ LAYOUT ════ */}
      <div className="aa-editor-layout">

        {/* ── ZONE PRINCIPALE ── */}
        <div className="aa-editor-main">

          {/* Titre */}
          <input
            ref={titleRef}
            value={state.title}
            onChange={e => set("title", e.target.value)}
            placeholder="Titre de l'article…"
            className="aa-title-input"
          />

          {/* Chapô */}
          <textarea
            value={state.excerpt}
            onChange={e => set("excerpt", e.target.value)}
            placeholder="Chapeau — résumé accrocheur visible dans les listings…"
            rows={2}
            className="aa-excerpt-input"
            style={{ borderLeftColor: catColor }}
          />

          {/* Onglets */}
          <div className="aa-tabs">
            {(["content","seo","settings"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`aa-tab ${activeTab===t ? "aa-tab--active" : ""}`}>
                {{ content:"Contenu", seo:"SEO", settings:"Paramètres" }[t]}
              </button>
            ))}
          </div>

          {/* ─── CONTENU ─── */}
          {activeTab === "content" && (
            <>
              <div className="aa-editor-field-group">
                <label className="aa-section-label">Introduction</label>
                <textarea
                  value={state.intro}
                  onChange={e => set("intro", e.target.value)}
                  placeholder="Introduction développée visible en haut de l'article, avant les blocs…"
                  rows={4}
                  className="aa-field aa-field--textarea aa-field--intro"
                />
              </div>

              <BlockBuilder
                blocks={state.blocks}
                onChange={blocks => set("blocks", blocks)}
                preset="article"
              />
            </>
          )}

          {/* ─── SEO ─── */}
          {activeTab === "seo" && (
            <div className="aa-seo-panel">
              <div className="aa-editor-field-group">
                <div className="aa-label-row">
                  <span>Slug (URL)</span>
                  <button className="aa-slug-lock-btn"
                    onClick={() => set("slugLocked", !state.slugLocked)}
                    style={{ color: state.slugLocked ? catColor : "#928E80" }}>
                    {state.slugLocked ? "🔒 Déverrouiller" : "🔓 Modifier"}
                  </button>
                </div>
                <div className="aa-slug-wrap">
                  <span className="aa-slug-prefix">afripulse.com/actualites/</span>
                  <input className="aa-slug-input" value={state.slug}
                    onChange={e => { if (!state.slugLocked) set("slug", e.target.value); }}
                    readOnly={state.slugLocked}
                    style={{ color: state.slugLocked ? "#928E80" : "#141410" }}
                  />
                </div>
              </div>

              <div className="aa-editor-field-group">
                <div className="aa-label-row">
                  <span>Titre SEO</span>
                  <span className={`aa-char-count ${state.metaTitle.length>60?"aa-char-count--err":"aa-char-count--ok"}`}>
                    {state.metaTitle.length}/60
                  </span>
                </div>
                <input className="aa-field" value={state.metaTitle}
                  onChange={e => set("metaTitle", e.target.value)}
                  placeholder={state.title || "Titre optimisé pour Google…"}
                />
              </div>

              <div className="aa-editor-field-group">
                <div className="aa-label-row">
                  <span>Description SEO</span>
                  <span className={`aa-char-count ${state.metaDesc.length>160?"aa-char-count--err":"aa-char-count--ok"}`}>
                    {state.metaDesc.length}/160
                  </span>
                </div>
                <textarea className="aa-field aa-field--textarea" value={state.metaDesc} rows={3}
                  onChange={e => set("metaDesc", e.target.value)}
                  placeholder={state.excerpt || "Description visible dans les résultats Google…"}
                />
              </div>

              <div className="aa-editor-field-group">
                <label className="aa-section-label">Aperçu dans Google</label>
                <div className="aa-seo-preview">
                  <div className="aa-seo-preview-url">afripulse.com › actualites › {previewSlug}</div>
                  <div className="aa-seo-preview-title">{state.metaTitle || state.title || "Titre de l'article"}</div>
                  <div className="aa-seo-preview-desc">{state.metaDesc || state.excerpt || "Description visible dans les résultats."}</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PARAMÈTRES ─── */}
          {activeTab === "settings" && (
            <div className="aa-settings-panel">
              <div className="aa-editor-field-group">
                <ImageUpload
                  bucket="articles"
                  path={`covers/${state.slug || "nouveau"}`}
                  value={state.coverUrl || null}
                  onChange={url => set("coverUrl", url)}
                  onError={msg => showToast(msg, false)}
                  aspectRatio="16/9"
                  label="Image de couverture"
                  maxSizeMB={8}
                />
              </div>

              <div className="aa-editor-field-group">
                <label className="aa-section-label">Tags</label>
                <div className="aa-tags-list">
                  {state.tags.map(t => (
                    <span key={t} className="aa-tag">
                      {t}
                      <button className="aa-tag-remove"
                        onClick={() => set("tags", state.tags.filter(x => x!==t))}>✕</button>
                    </span>
                  ))}
                </div>
                <div className="aa-tag-row">
                  <input className="aa-field" value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key==="Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Ajouter un tag, puis Entrée"
                  />
                  <button className="aa-tag-add-btn" onClick={addTag}>Ajouter</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="aa-editor-sidebar">

          {/* Publication */}
          <div className="aa-sidebar-card">
            <div className="aa-sidebar-title">Publication</div>

            <div className="aa-sidebar-row">
              <span className="aa-sidebar-row-label">Statut</span>
              <button
                className={`aa-status-pill ${state.published ? "aa-status-pill--pub" : "aa-status-pill--draft"}`}
                onClick={() => set("published", !state.published)}>
                <span className={`aa-status-dot ${state.published ? "aa-status-dot--pub" : "aa-status-dot--draft"}`} />
                {state.published ? "Publié" : "Brouillon"}
              </button>
            </div>

            <div className="aa-sidebar-row">
              <span className="aa-sidebar-row-label">À la une</span>
              <button
                className={`aa-toggle ${state.featured ? "aa-toggle--on" : "aa-toggle--off"}`}
                onClick={() => set("featured", !state.featured)}>
                <span className={`aa-toggle-knob ${state.featured ? "aa-toggle-knob--on" : "aa-toggle-knob--off"}`} />
              </button>
            </div>

            <div className="aa-sidebar-row">
              <span className="aa-sidebar-row-label">Temps de lecture</span>
              <div className="aa-counter">
                <button className="aa-counter-btn" onClick={() => set("readingTime", Math.max(1, state.readingTime-1))}>−</button>
                <span className="aa-counter-val">{state.readingTime}</span>
                <button className="aa-counter-btn" onClick={() => set("readingTime", state.readingTime+1)}>+</button>
                <span className="aa-counter-unit">min</span>
              </div>
            </div>

            <div className="aa-sidebar-hint">
              Estimation : ~{estTime} min ({wordCount} mots)
            </div>
          </div>

          {/* Catégorie */}
          <div className="aa-sidebar-card">
            <div className="aa-sidebar-title">Catégorie</div>
            <div className="aa-cat-pills">
              {CATEGORIES.map(cat => {
                const active = state.category === cat;
                const cc = CAT_COLOR[cat] ?? "#928E80";
                return (
                  <button key={cat} onClick={() => set("category", cat)}
                    className="aa-cat-pill"
                    style={{
                      border:     `1.5px solid ${active ? cc : "rgba(20,20,16,.12)"}`,
                      background: active ? `${cc}14` : "transparent",
                      color:      active ? cc : "#38382E",
                    }}>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auteur */}
          <div className="aa-sidebar-card">
            <div className="aa-sidebar-title">Auteur</div>
            {profile?.full_name && state.authorName === profile.full_name && (
              <div className="aa-author-badge">
                <div className="aa-author-avatar">
                  {profile.full_name.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div className="aa-author-name">{profile.full_name}</div>
                  <div className="aa-author-role">{profile.role}</div>
                </div>
              </div>
            )}
            <input className="aa-field" value={state.authorName}
              onChange={e => set("authorName", e.target.value)}
              placeholder="Nom du journaliste"
            />
            {profile?.full_name && state.authorName !== profile.full_name && (
              <button className="aa-author-reset"
                onClick={() => set("authorName", profile.full_name ?? "")}>
                ← Remettre mon nom
              </button>
            )}
          </div>

          {/* Actions */}
          <button className="aa-save-btn" onClick={() => save()} disabled={saving}>
            <IcoSave />
            {saving ? "Enregistrement…" : saved ? "✓ Sauvegardé" : "Enregistrer"}
          </button>

          {!isNew && (
            <button className="aa-delete-btn"
              onClick={async () => {
                if (!window.confirm("Supprimer cet article ? Irréversible.")) return;
                await (sb.from("articles") as any).delete().eq("id", params.id);
                clearDraft();
                router.push("/admin/actualites");
              }}>
              Supprimer l&apos;article
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}