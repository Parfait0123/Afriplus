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
import type { Article, Block, ArticleContent } from "@/types/database";

// Import des constantes catégories
import { CATEGORIES, CAT_COLOR, CAT_GRADIENT, type Category } from "@/lib/constants/categories";

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
  slug: string; slugLocked: boolean; authorId: string | null;
}

function defaultState(profileName?: string): EditorState {
  return {
    title:"", excerpt:"", intro:"", blocks:[],
    category:"Économie", authorName: profileName ?? "",
    readingTime:5, featured:false, published:false,
    coverUrl:"", tags:[], metaTitle:"", metaDesc:"",
    slug:"", slugLocked:false, authorId: null,
  };
}

function slugify(t: string) {
  return t.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9\s-]/g,"").trim()
    .replace(/\s+/g,"-").replace(/-+/g,"-");
}

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function ArticleEditorPage({ params }: { params: { id: string } }) {
  const sb     = createClient();
  const router = useRouter();
  const { profile } = useAuth();
  const isNew  = params.id === "nouveau";

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

  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteShowPwd, setDeleteShowPwd] = useState(false);

  // Modal mot de passe pour publier / dépublier
  const [pubModal, setPubModal]       = useState<null | boolean>(null);
  const [pubPassword, setPubPassword] = useState("");
  const [pubError, setPubError]       = useState("");
  const [pubLoading, setPubLoading]   = useState(false);
  const [pubShowPwd, setPubShowPwd]   = useState(false);

  const titleRef     = useRef<HTMLInputElement>(null);
  const autoSaveRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const articleIdRef = useRef<string | null>(isNew ? null : params.id);

  /* ── Helpers state ── */
  const set = useCallback(<K extends keyof EditorState>(k: K, v: EditorState[K]) =>
    setState(prev => ({ ...prev, [k]: v })), []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Autosave localStorage ───────────────────────────────── */
  useEffect(() => {
    if (loading) return;
    if (isNew) return;
    if (!articleIdRef.current) return;

    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (!articleIdRef.current) return;
      try {
        const key = `afripulse_draft_${articleIdRef.current}`;
        localStorage.setItem(key, JSON.stringify(state));
        setHasDraft(true);
      } catch { /* quota exceeded */ }
    }, 1500);

    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [state, loading, isNew]);

  /* ── Auteur depuis profil ── */
  useEffect(() => {
    if (isNew && profile?.full_name && !state.authorName) {
      set("authorId", profile.id);
      set("authorName", profile.full_name);
    }
  }, [profile, isNew]);

  /* ── Chargement ───────────────────────────────────────────── */
  useEffect(() => {
    if (isNew) {
      try { localStorage.removeItem("afripulse_draft_article_nouveau"); } catch { /* ignore */ }
      setTimeout(() => titleRef.current?.focus(), 120);
      return;
    }

    (sb.from("articles") as any).select("*").eq("id", params.id).single()
      .then(({ data, error }: any) => {
        if (data) {
          const a = data as Article;
          const rawContent = (a as any).content;
          const parsedContent = typeof rawContent === "string"
            ? (() => { try { return JSON.parse(rawContent); } catch { return {}; } })()
            : (rawContent ?? {});
          setState({
            title:       a.title,
            excerpt:     a.excerpt ?? "",
            intro:       parsedContent.intro ?? "",
            blocks:      parsedContent.blocks ?? [],
            category:    a.category as Category,
            authorName:  a.author_name,
            authorId:    a.author_id,
            readingTime: (a as any).reading_time ?? (a as any).read_time ?? 5,
            featured:    a.featured,
            published:   a.published,
            coverUrl:    a.cover_url ?? "",
            tags:        a.tags ?? [],
            metaTitle:   (a as any).meta_title ?? "",
            metaDesc:    (a as any).meta_desc ?? "",
            slug:        a.slug,
            slugLocked:  true,
          });
          try {
            const draftKey = `afripulse_draft_${params.id}`;
            const raw = localStorage.getItem(draftKey);
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
    if (!articleIdRef.current) return;
    try {
      const key = `afripulse_draft_${articleIdRef.current}`;
      const raw = localStorage.getItem(key);
      if (raw) { setState(JSON.parse(raw)); showToast("Brouillon local restauré"); }
    } catch { showToast("Impossible de restaurer", false); }
  };

  /* ── Effacer brouillon local ── */
  const clearDraft = () => {
    if (autoSaveRef.current) { clearTimeout(autoSaveRef.current); autoSaveRef.current = null; }
    setHasDraft(false);
    try {
      const id = articleIdRef.current;
      if (id) localStorage.removeItem(`afripulse_draft_${id}`);
      localStorage.removeItem("afripulse_draft_article_nouveau");
    } catch { /* ignore */ }
  };

  /* ── Sauvegarde Supabase ── */
  const save = async (pub?: boolean) => {
    if (!state.title.trim()) { showToast("Le titre est requis", false); return; }
    setSaving(true);

    const content: ArticleContent = { intro: state.intro, blocks: state.blocks };
    const pubNow = pub !== undefined ? pub : state.published;

    const publishedAtPayload = pubNow
      ? (state.published ? undefined : new Date().toISOString())
      : null;

    const payload: Record<string, unknown> = {
      title:          state.title.trim(),
      slug:           state.slug || slugify(state.title),
      excerpt:        state.excerpt.trim() || null,
      content,
      category:       state.category,
      author_name:    state.authorName,
      author_id:      state.authorId,
      reading_time:   state.readingTime,
      read_time:      state.readingTime,
      featured:       state.featured,
      published:      pubNow,
      image_gradient: CAT_GRADIENT[state.category] ?? "linear-gradient(135deg,#0a0800,#261e00)",
      cover_url:      state.coverUrl || null,
      tags:           state.tags,
      meta_title:     state.metaTitle || null,
      meta_desc:      state.metaDesc || null,
    };

    if (publishedAtPayload !== undefined) {
      payload.published_at = publishedAtPayload;
    }

    const existingId = articleIdRef.current;

    const { data, error } = existingId === null
      ? await (sb.from("articles") as any).insert(payload).select("id,slug").single()
      : await (sb.from("articles") as any).update(payload).eq("id", existingId).select("id,slug").single();

    setSaving(false);

    if (error) {
      console.error("Erreur Supabase save():", error);
      showToast("Erreur : " + error.message, false);
      return;
    }

    const newId = (data as any)?.id as string | undefined;

    if (existingId === null && newId) {
      articleIdRef.current = newId;
      clearDraft();
      showToast(pubNow ? "Article publié !" : "Brouillon créé !");
      window.location.href = `/admin/actualites/${newId}`;
    } else {
      clearDraft();
      if (pub !== undefined) setState(prev => ({ ...prev, published: pub }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      showToast(pub === true ? "Article publié !" : pub === false ? "Brouillon sauvegardé" : "Sauvegardé");
    }
  };

  /* ── Computed ── */
  const wordCount = [state.intro, ...state.blocks.map(b => "text" in b ? (b as any).text : "")].join(" ")
    .trim().split(/\s+/).filter(Boolean).length;
  const estTime  = Math.max(1, Math.ceil(wordCount / 200));
  const catColor = CAT_COLOR[state.category] ?? "#C08435";
  const previewSlug = state.slug || slugify(state.title || "apercu");

  /* ── Suppression avec confirmation mot de passe ── */
  const confirmDelete = async () => {
    if (!deletePassword) { setDeleteError("Entrez votre mot de passe."); return; }
    setDeleteLoading(true);
    setDeleteError("");

    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.auth.signInWithPassword({
      email: user?.email ?? "",
      password: deletePassword,
    });

    if (error) {
      setDeleteLoading(false);
      setDeleteError("Mot de passe incorrect.");
      setDeletePassword("");
      return;
    }

    await (sb.from("articles") as any).delete().eq("id", articleIdRef.current);
    clearDraft();
    router.push("/admin/actualites");
  };

  /* ── Publication / dépublication avec confirmation mot de passe ── */
  const confirmPublish = async () => {
    if (!pubPassword) { setPubError("Entrez votre mot de passe."); return; }
    setPubLoading(true);
    setPubError("");

    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.auth.signInWithPassword({
      email: user?.email ?? "",
      password: pubPassword,
    });

    if (error) {
      setPubLoading(false);
      setPubError("Mot de passe incorrect.");
      setPubPassword("");
      return;
    }

    const targetPub = pubModal as boolean;
    setPubModal(null);
    setPubPassword("");
    setPubLoading(false);
    await save(targetPub);
  };

  if (loading) return (
    <div className="aa-fullpage-loader"><div className="aa-loader-ring" /></div>
  );

  return (
    <div className="aa-editor-page">
      <style>{`
        @keyframes aa-modal-in {
          from { opacity: 0; transform: scale(.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes aa-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div className={`aa-toast ${toast.ok ? "aa-toast--ok" : "aa-toast--err"}`}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* ── Modal suppression avec mot de passe ── */}
      {deleteModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9900,
          background: "rgba(20,20,16,.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem",
        }}
          onClick={e => { if (e.target === e.currentTarget) { setDeleteModal(false); setDeletePassword(""); setDeleteError(""); } }}
        >
          <div style={{
            background: "#fff", borderRadius: 24, padding: "2.25rem 2.5rem",
            maxWidth: 420, width: "100%",
            boxShadow: "0 32px 80px rgba(20,20,16,.22)",
            animation: "aa-modal-in .22s cubic-bezier(.34,1.56,.64,1)",
          }}>
            {/* Icône */}
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "rgba(184,52,30,.08)", border: "1px solid rgba(184,52,30,.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1.25rem",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8341E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </div>

            {/* Titre */}
            <div style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "1.2rem", fontWeight: 900, color: "#141410",
              marginBottom: ".5rem", letterSpacing: "-.025em",
            }}>
              Supprimer cet article ?
            </div>
            <p style={{ fontSize: ".82rem", color: "#928E80", lineHeight: 1.65, marginBottom: "1.6rem" }}>
              Cette action est <strong style={{ color: "#141410" }}>irréversible</strong>.
              Confirmez votre identité en saisissant votre mot de passe.
            </p>

            {/* Champ mot de passe */}
            <div style={{ marginBottom: "1.1rem" }}>
              <label style={{
                fontSize: ".6rem", fontWeight: 700, letterSpacing: ".1em",
                textTransform: "uppercase", color: "#928E80",
                display: "block", marginBottom: ".45rem",
              }}>
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={deleteShowPwd ? "text" : "password"}
                  value={deletePassword}
                  onChange={e => { setDeletePassword(e.target.value); setDeleteError(""); }}
                  onKeyDown={e => { if (e.key === "Enter") confirmDelete(); }}
                  placeholder="••••••••••••"
                  autoFocus
                  style={{
                    width: "100%", padding: ".7rem 3rem .7rem 1rem",
                    borderRadius: 12, fontSize: ".88rem", color: "#141410",
                    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                    border: deleteError
                      ? "1.5px solid #B8341E"
                      : "1.5px solid rgba(20,20,16,.14)",
                    background: deleteError ? "rgba(184,52,30,.03)" : "#F8F6F1",
                    transition: "border-color .15s",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setDeleteShowPwd(v => !v)}
                  style={{
                    position: "absolute", right: ".85rem", top: "50%",
                    transform: "translateY(-50%)", background: "none", border: "none",
                    cursor: "pointer", color: "#928E80", display: "flex",
                    alignItems: "center", padding: 0,
                  }}
                >
                  {deleteShowPwd
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>

              {deleteError && (
                <div style={{
                  marginTop: ".45rem", display: "flex", alignItems: "center",
                  gap: ".35rem", fontSize: ".72rem", color: "#B8341E", fontWeight: 600,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {deleteError}
                </div>
              )}
            </div>

            {/* Boutons */}
            <div style={{ display: "flex", gap: ".65rem" }}>
              <button
                onClick={() => { setDeleteModal(false); setDeletePassword(""); setDeleteError(""); }}
                style={{
                  flex: 1, padding: ".7rem", borderRadius: 12, cursor: "pointer",
                  fontFamily: "inherit", fontSize: ".82rem", fontWeight: 600,
                  background: "transparent", color: "#38382E",
                  border: "1.5px solid rgba(20,20,16,.14)",
                  transition: "background .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F8F6F1")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading || !deletePassword}
                style={{
                  flex: 1, padding: ".7rem", borderRadius: 12, cursor: deleteLoading || !deletePassword ? "default" : "pointer",
                  fontFamily: "inherit", fontSize: ".82rem", fontWeight: 700,
                  background: deleteLoading || !deletePassword ? "rgba(184,52,30,.35)" : "#B8341E",
                  color: "#fff", border: "none",
                  transition: "background .15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: ".45rem",
                }}
              >
                {deleteLoading
                  ? <><div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "aa-spin .7s linear infinite" }}/> Vérification…</>
                  : "Supprimer définitivement"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmation publication / dépublication ── */}
      {pubModal !== null && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9900,
          background: "rgba(20,20,16,.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem",
        }}
          onClick={e => { if (e.target === e.currentTarget) { setPubModal(null); setPubPassword(""); setPubError(""); } }}
        >
          <div style={{
            background: "#fff", borderRadius: 24, padding: "2.25rem 2.5rem",
            maxWidth: 420, width: "100%",
            boxShadow: "0 32px 80px rgba(20,20,16,.22)",
            animation: "aa-modal-in .22s cubic-bezier(.34,1.56,.64,1)",
          }}>
            {/* Icône */}
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: pubModal ? "rgba(26,92,64,.08)" : "rgba(192,132,53,.08)",
              border: `1px solid ${pubModal ? "rgba(26,92,64,.18)" : "rgba(192,132,53,.2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1.25rem",
            }}>
              {pubModal
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A5C40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C08435" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              }
            </div>

            <div style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "1.2rem", fontWeight: 900, color: "#141410",
              marginBottom: ".5rem", letterSpacing: "-.025em",
            }}>
              {pubModal ? "Publier cet article ?" : "Passer en brouillon ?"}
            </div>
            <p style={{ fontSize: ".82rem", color: "#928E80", lineHeight: 1.65, marginBottom: "1.6rem" }}>
              {pubModal
                ? "L'article sera visible par tous les visiteurs d'AfriPulse."
                : "L'article ne sera plus visible du public."
              }{" "}Confirmez votre identité.
            </p>

            <div style={{ marginBottom: "1.1rem" }}>
              <label style={{
                fontSize: ".6rem", fontWeight: 700, letterSpacing: ".1em",
                textTransform: "uppercase", color: "#928E80",
                display: "block", marginBottom: ".45rem",
              }}>
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={pubShowPwd ? "text" : "password"}
                  value={pubPassword}
                  onChange={e => { setPubPassword(e.target.value); setPubError(""); }}
                  onKeyDown={e => { if (e.key === "Enter") confirmPublish(); }}
                  placeholder="••••••••••••"
                  autoFocus
                  style={{
                    width: "100%", padding: ".7rem 3rem .7rem 1rem",
                    borderRadius: 12, fontSize: ".88rem", color: "#141410",
                    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                    border: pubError ? "1.5px solid #B8341E" : "1.5px solid rgba(20,20,16,.14)",
                    background: pubError ? "rgba(184,52,30,.03)" : "#F8F6F1",
                    transition: "border-color .15s",
                  }}
                />
                <button type="button" onClick={() => setPubShowPwd(v => !v)}
                  style={{ position: "absolute", right: ".85rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#928E80", display: "flex", alignItems: "center", padding: 0 }}>
                  {pubShowPwd
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {pubError && (
                <div style={{ marginTop: ".45rem", display: "flex", alignItems: "center", gap: ".35rem", fontSize: ".72rem", color: "#B8341E", fontWeight: 600 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {pubError}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: ".65rem" }}>
              <button
                onClick={() => { setPubModal(null); setPubPassword(""); setPubError(""); }}
                style={{ flex: 1, padding: ".7rem", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontSize: ".82rem", fontWeight: 600, background: "transparent", color: "#38382E", border: "1.5px solid rgba(20,20,16,.14)", transition: "background .15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F8F6F1")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Annuler
              </button>
              <button
                onClick={confirmPublish}
                disabled={pubLoading || !pubPassword}
                style={{
                  flex: 1, padding: ".7rem", borderRadius: 12,
                  cursor: pubLoading || !pubPassword ? "default" : "pointer",
                  fontFamily: "inherit", fontSize: ".82rem", fontWeight: 700, border: "none",
                  background: pubLoading || !pubPassword
                    ? "rgba(20,20,16,.2)"
                    : pubModal ? "#1A5C40" : "#C08435",
                  color: "#fff", transition: "background .15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: ".45rem",
                }}
              >
                {pubLoading
                  ? <><div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "aa-spin .7s linear infinite" }}/> Vérification…</>
                  : pubModal ? "Publier l'article" : "Passer en brouillon"
                }
              </button>
            </div>
          </div>
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
          <Link
            href={`/actualites/${previewSlug}${!state.published ? "?preview=1" : ""}`}
            target="_blank"
            className="aa-editor-preview-btn"
          >
            <IcoEye /> Aperçu
          </Link>

          <button
            className="aa-editor-draft-btn"
            onClick={() => { setPubModal(false); setPubPassword(""); setPubError(""); }}
            disabled={saving}
          >
            {saving ? "…" : "Brouillon"}
          </button>

          <button
            className="aa-editor-publish-btn"
            onClick={() => { setPubModal(true); setPubPassword(""); setPubError(""); }}
            disabled={saving}
          >
            {saved ? "✓ Sauvegardé" : state.published ? "Enregistrer →" : "Publier →"}
          </button>
        </div>
      </div>

      {/* ── Bandeau brouillon local (uniquement pour articles existants) ── */}
      {hasDraft && articleIdRef.current !== null && (
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

          <input
            ref={titleRef}
            value={state.title}
            onChange={e => set("title", e.target.value)}
            placeholder="Titre de l'article…"
            className="aa-title-input"
          />

          <textarea
            value={state.excerpt}
            onChange={e => set("excerpt", e.target.value)}
            placeholder="Chapeau — résumé accrocheur visible dans les listings…"
            rows={2}
            className="aa-excerpt-input"
            style={{ borderLeftColor: catColor }}
          />

          <div className="aa-tabs">
            {(["content","seo","settings"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`aa-tab ${activeTab===t ? "aa-tab--active" : ""}`}>
                {{ content:"Contenu", seo:"SEO", settings:"Paramètres" }[t]}
              </button>
            ))}
          </div>

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
                  <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
                    {state.excerpt && !state.metaDesc && (
                      <button
                        onClick={() => set("metaDesc", state.excerpt.slice(0, 160))}
                        style={{ fontSize:".62rem", fontWeight:600, color:"#C08435",
                          background:"rgba(192,132,53,.08)", border:"none", borderRadius:100,
                          padding:".15rem .55rem", cursor:"pointer", fontFamily:"inherit" }}>
                        ← Copier le résumé
                      </button>
                    )}
                    <span className={`aa-char-count ${state.metaDesc.length>160?"aa-char-count--err":"aa-char-count--ok"}`}>
                      {state.metaDesc.length}/160
                    </span>
                  </div>
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

          <div className="aa-sidebar-card">
            <div className="aa-sidebar-title">Publication</div>

            <div className="aa-sidebar-row">
              <span className="aa-sidebar-row-label">Statut</span>
              <button
                className={`aa-status-pill ${state.published ? "aa-status-pill--pub" : "aa-status-pill--draft"}`}
                >
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

          <div className="aa-sidebar-card">
            <div className="aa-sidebar-title">Auteur</div>
            {profile?.full_name && state.authorName === profile.full_name && (
              <div className="aa-author-badge">
                <div className="aa-author-avatar">
                 {profile.avatar_url
                      ? <img src={profile.avatar_url} alt={profile.full_name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "15pt" }} />
                      : profile.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                    }
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
                onClick={() => {set("authorName", profile.full_name ?? ""); set("authorId", profile.id ?? null);}}>
                ← Remettre mon nom
              </button>
            )}
          </div>

          <button className="aa-save-btn" onClick={() => save()} disabled={saving}>
            <IcoSave />
            {saving ? "Enregistrement…" : saved ? "✓ Sauvegardé" : "Enregistrer"}
          </button>

          {articleIdRef.current && (
            <button className="aa-delete-btn"
              onClick={() => { setDeleteModal(true); setDeletePassword(""); setDeleteError(""); }}>
              Supprimer l&apos;article
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}