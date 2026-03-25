"use client";

/**
 * app/admin/newsletter/page.tsx
 * Gestion avancée des abonnés à la newsletter
 * Fonctionnalités :
 * - Liste paginée avec filtres, recherche, suppression, export
 * - Double opt-in (envoi de confirmation, suivi des confirmations)
 * - Campagnes email (création et envoi aux abonnés sélectionnés)
 * - Centres d'intérêt (tags) pour les abonnés
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/* ── Types ── */
interface Subscriber {
  id: string;
  email: string;
  confirmed: boolean;
  confirmed_at: string | null;
  tags: string[];
  created_at: string;
  confirmation_token?: string;
}

interface Campaign {
  id?: string;
  subject: string;
  content: string;
  target: "all" | "confirmed" | "pending" | "tags";
  tags?: string[];
  sent_at?: string;
}

const PAGE_SIZE = 20;

/* ── Icônes SVG (style cohérent) ── */
const IcoSearch = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const IcoRefresh = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.78"/></svg>);
const IcoTrash = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>);
const IcoDownload = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const IcoMail = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>);
const IcoPlus = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const IcoSend = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const IcoTag = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-5-5A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z"/></svg>);
const IcoClose = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const IcoSettings = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.04.04A10 10 0 0 0 12 17.66a10 10 0 0 0 6.36-2.62l.04-.04z"/></svg>);

/* ── Composant Toast ── */
const Toast = ({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div style={{
      position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999,
      background: ok ? "#141410" : "#B8341E", color: "#F8F6F1",
      padding: ".85rem 1.4rem", borderRadius: 12, fontSize: ".82rem", fontWeight: 600,
      boxShadow: "0 8px 32px rgba(20,20,16,.25)",
      animation: "slide-up .25s ease",
    }}>
      {ok ? "✓" : "✕"} {msg}
    </div>
  );
};

/* ── Spinner ── */
const Spinner = () => (
  <div style={{ textAlign: "center", padding: "4rem 0" }}>
    <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(20,20,16,.08)", borderTopColor: "#C08435", animation: "spin .8s linear infinite", margin: "0 auto 1rem" }} />
    <p style={{ color: "#928E80", fontSize: ".8rem" }}>Chargement…</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* ── Badge statut ── */
const StatusBadge = ({ confirmed }: { confirmed: boolean }) => (
  <span style={{
    fontSize: ".6rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase",
    padding: ".22rem .7rem", borderRadius: 100,
    background: confirmed ? "#EAF4EF" : "#FAEBE8",
    color: confirmed ? "#1A5C40" : "#B8341E",
  }}>
    {confirmed ? "✓ Confirmé" : "⏳ En attente"}
  </span>
);

/* ── Modal de confirmation (simple) ── */
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: any) => {
  if (!isOpen) return null;
  return (
    <div className="nl-modal-overlay" onClick={onClose}>
      <div className="nl-modal" onClick={e => e.stopPropagation()}>
        <div className="nl-modal-header">
          <div className="nl-modal-title">{title}</div>
          <button className="nl-modal-close" onClick={onClose}><IcoClose /></button>
        </div>
        <p className="nl-modal-desc">{message}</p>
        <div className="nl-modal-actions">
          <button className="nl-btn nl-btn-ghost" onClick={onClose}>Annuler</button>
          <button className="nl-btn nl-btn-danger" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
};

/* ── Modal de création de campagne ── */
const CampaignModal = ({ isOpen, onClose, onSend, tags }: any) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState<"all" | "confirmed" | "pending" | "tags">("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) return;
    setSending(true);
    await onSend({ subject, content, target, tags: selectedTags });
    setSending(false);
    onClose();
    setSubject("");
    setContent("");
    setTarget("all");
    setSelectedTags([]);
  };

  if (!isOpen) return null;
  return (
    <div className="nl-modal-overlay" onClick={onClose}>
      <div className="nl-modal nl-modal-wide" onClick={e => e.stopPropagation()}>
        <div className="nl-modal-header">
          <div className="nl-modal-title">Nouvelle campagne email</div>
          <button className="nl-modal-close" onClick={onClose}><IcoClose /></button>
        </div>
        <div className="nl-campaign-form">
          <div className="nl-field">
            <label>Objet *</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: Les actualités de la semaine" />
          </div>
          <div className="nl-field">
            <label>Contenu (HTML ou texte)</label>
            <textarea rows={6} value={content} onChange={e => setContent(e.target.value)} placeholder="Votre message..." />
          </div>
          <div className="nl-field">
            <label>Destinataires</label>
            <div className="nl-radio-group">
              <label><input type="radio" value="all" checked={target === "all"} onChange={() => setTarget("all")} /> Tous les abonnés</label>
              <label><input type="radio" value="confirmed" checked={target === "confirmed"} onChange={() => setTarget("confirmed")} /> Confirmés uniquement</label>
              <label><input type="radio" value="pending" checked={target === "pending"} onChange={() => setTarget("pending")} /> En attente de confirmation</label>
              <label><input type="radio" value="tags" checked={target === "tags"} onChange={() => setTarget("tags")} /> Par centre d'intérêt</label>
            </div>
            {target === "tags" && (
              <div className="nl-tag-select">
                {tags.map((tag: string) => (
                  <label key={tag}><input type="checkbox" value={tag} checked={selectedTags.includes(tag)} onChange={e => {
                    if (e.target.checked) setSelectedTags([...selectedTags, tag]);
                    else setSelectedTags(selectedTags.filter(t => t !== tag));
                  }} /> {tag}</label>
                ))}
              </div>
            )}
          </div>
          <div className="nl-modal-actions">
            <button className="nl-btn nl-btn-ghost" onClick={onClose}>Annuler</button>
            <button className="nl-btn nl-btn-primary" onClick={handleSend} disabled={sending || !subject || !content}>
              {sending ? "Envoi..." : <><IcoSend /> Envoyer la campagne</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Modal de gestion des tags pour un abonné ── */
const TagsModal = ({ isOpen, onClose, subscriber, tags, onUpdate }: any) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(subscriber?.tags || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subscriber) setSelectedTags(subscriber.tags || []);
  }, [subscriber]);

  const handleSave = async () => {
    if (!subscriber) return;
    setLoading(true);
    await onUpdate(subscriber.id, selectedTags);
    setLoading(false);
    onClose();
  };

  if (!isOpen || !subscriber) return null;
  return (
    <div className="nl-modal-overlay" onClick={onClose}>
      <div className="nl-modal" onClick={e => e.stopPropagation()}>
        <div className="nl-modal-header">
          <div className="nl-modal-title">Centres d'intérêt – {subscriber.email}</div>
          <button className="nl-modal-close" onClick={onClose}><IcoClose /></button>
        </div>
        <div className="nl-tag-select nl-tag-select-large">
          {tags.map((tag: string) => (
            <label key={tag}>
              <input type="checkbox" checked={selectedTags.includes(tag)} onChange={e => {
                if (e.target.checked) setSelectedTags([...selectedTags, tag]);
                else setSelectedTags(selectedTags.filter(t => t !== tag));
              }} /> {tag}
            </label>
          ))}
        </div>
        <div className="nl-modal-actions">
          <button className="nl-btn nl-btn-ghost" onClick={onClose}>Annuler</button>
          <button className="nl-btn nl-btn-primary" onClick={handleSave} disabled={loading}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
export default function AdminNewsletterPage() {
  const sb = createClient();

  // États des onglets
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaigns" | "settings">("subscribers");

  // États des abonnés
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterConfirmed, setFilterConfirmed] = useState<"all" | "confirmed" | "pending">("all");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // États des tags (centres d'intérêt)
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // États des campagnes
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [currentSubscriber, setCurrentSubscriber] = useState<Subscriber | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => setToast({ msg, ok });
  const hideToast = () => setToast(null);

  // Récupération des tags distincts depuis les abonnés
  const refreshTags = useCallback(async () => {
  const response = await (sb.from("newsletter_subscribers") as any).select("tags");
  const { data = [] } = response;
  if (data) {
    const allTags = (data as { tags: string[] | null }[])
      .flatMap((s) => s.tags ?? [])
      .filter((t): t is string => typeof t === "string");
    const unique = [...new Set(allTags)].sort();
    setAvailableTags(unique);
  }
}, []);

  // Chargement des abonnés
  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      let query = sb
        .from("newsletter_subscribers")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (search.trim()) query = query.ilike("email", `%${search.trim()}%`);
      if (filterConfirmed === "confirmed") query = query.eq("confirmed", true);
      else if (filterConfirmed === "pending") query = query.eq("confirmed", false);
      if (filterTags.length > 0) query = query.contains("tags", filterTags);

      const from = (page - 1) * PAGE_SIZE;
      const to = page * PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (!error && data) {
        setSubscribers(data as Subscriber[]);
        setTotal(count ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [sb, search, filterConfirmed, filterTags, page]);

  useEffect(() => {
    loadSubscribers();
    refreshTags();
  }, [loadSubscribers, refreshTags]);

  // Récupération des campagnes (mock – à implémenter avec une table `campaigns` si besoin)
  // Pour l'instant, on les stocke en mémoire locale
  const [campaignHistory, setCampaignHistory] = useState<Campaign[]>([]);

  // Actions sur les abonnés
  const deleteSubscriber = async (id: string, email: string) => {
    setConfirmModal({
      open: true,
      title: "Supprimer cet abonné ?",
      message: `L'abonné ${email} sera définitivement supprimé.`,
      onConfirm: async () => {
        const { error } = await sb.from("newsletter_subscribers").delete().eq("id", id);
        if (!error) {
          setSubscribers(prev => prev.filter(s => s.id !== id));
          setTotal(t => t - 1);
          showToast(`${email} supprimé.`);
        } else {
          showToast("Erreur lors de la suppression", false);
        }
        setConfirmModal(null);
      }
    });
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    setConfirmModal({
      open: true,
      title: `Supprimer ${selected.size} abonné(s) ?`,
      message: "Cette action est irréversible.",
      onConfirm: async () => {
        const ids = Array.from(selected);
        const { error } = await sb.from("newsletter_subscribers").delete().in("id", ids);
        if (!error) {
          setSubscribers(prev => prev.filter(s => !ids.includes(s.id)));
          setTotal(t => t - ids.length);
          setSelected(new Set());
          showToast(`${ids.length} abonné(s) supprimé(s).`);
        } else {
          showToast("Erreur lors de la suppression en masse", false);
        }
        setConfirmModal(null);
      }
    });
  };

  const resendConfirmation = async (sub: Subscriber) => {
    if (sub.confirmed) {
      showToast("Cet abonné est déjà confirmé.", false);
      return;
    }
    // Appel à une API pour envoyer l'email de confirmation
    const { error } = await fetch("/api/newsletter/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sub.email, token: sub.confirmation_token }),
    }).then(r => r.json()).catch(e => ({ error: e }));
    if (!error) {
      showToast(`Email de confirmation envoyé à ${sub.email}`);
    } else {
      showToast("Erreur lors de l'envoi", false);
    }
  };

  const exportCSV = async () => {
    let query = sb
      .from("newsletter_subscribers")
      .select("email,confirmed,created_at,tags")
      .order("created_at", { ascending: false });
    if (search.trim()) query = query.ilike("email", `%${search.trim()}%`);
    if (filterConfirmed === "confirmed") query = query.eq("confirmed", true);
    else if (filterConfirmed === "pending") query = query.eq("confirmed", false);
    if (filterTags.length > 0) query = query.contains("tags", filterTags);
    const { data } = await query;
    if (!data) return;
    const rows = [
      ["Email", "Statut", "Date d'inscription", "Tags"].join(","),
      ...data.map((s: any) => [
        `"${s.email}"`,
        s.confirmed ? "Confirmé" : "En attente",
        new Date(s.created_at).toLocaleDateString("fr-FR"),
        `"${(s.tags || []).join(", ")}"`
      ].join(",")),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter_abonnes.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Export CSV lancé");
  };

  // Gestion des tags pour un abonné
  const updateSubscriberTags = async (id: string, newTags: string[]) => {
  const { error } = await (sb.from("newsletter_subscribers") as any)
    .update({ tags: newTags })
    .eq("id", id);
  if (!error) {
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, tags: newTags } : s));
    refreshTags();
    showToast("Tags mis à jour");
  } else {
    showToast("Erreur", false);
  }
};

  // Ajouter un nouveau tag global
  const addTag = async () => {
    if (!newTag.trim()) return;
    if (availableTags.includes(newTag.trim())) {
      showToast("Ce tag existe déjà", false);
      return;
    }
    setAvailableTags(prev => [...prev, newTag.trim()].sort());
    setNewTag("");
    showToast(`Tag "${newTag.trim()}" ajouté`);
  };

  // Envoi d'une campagne
  const sendCampaign = async (campaign: Campaign) => {
    // Simuler un envoi via une API (vous pouvez remplacer par votre service)
    console.log("Envoi de campagne:", campaign);
    // En attendant, on ajoute à l'historique local
    const newCampaign = { ...campaign, sent_at: new Date().toISOString() };
    setCampaignHistory(prev => [newCampaign, ...prev]);
    showToast(`Campagne "${campaign.subject}" envoyée !`);
  };

  // Statistiques
  const totalConfirmed = subscribers.filter(s => s.confirmed).length;
  const totalPending = subscribers.filter(s => !s.confirmed).length;
  const newThisMonth = subscribers.filter(s => new Date(s.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

  // Pagination
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === subscribers.length) setSelected(new Set());
    else setSelected(new Set(subscribers.map(s => s.id)));
  };
  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  // Filtres par tags pour la liste
  const toggleTagFilter = (tag: string) => {
    setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    setPage(1);
  };

  return (
    <>
      <style>{`
        .nl-wrap { max-width: 1380px; margin: 0 auto; padding: 0 clamp(1rem,3vw,2.5rem); }
        .nl-btn {
          display:inline-flex; align-items:center; gap:.4rem;
          padding:.55rem 1.1rem; border-radius:10px; border:none; cursor:pointer;
          font-size:.72rem; font-weight:700; letter-spacing:.04em; transition:all .18s;
        }
        .nl-btn:disabled { opacity:.5; cursor:not-allowed; }
        .nl-btn-primary { background:#141410; color:#F8F6F1; }
        .nl-btn-primary:hover:not(:disabled) { background:#2a2a20; }
        .nl-btn-ghost {
          background:transparent; color:#928E80;
          border:1px solid rgba(20,20,16,.12);
        }
        .nl-btn-ghost:hover:not(:disabled) { background:rgba(20,20,16,.05); color:#38382E; }
        .nl-btn-danger { background:#FAEBE8; color:#B8341E; }
        .nl-btn-danger:hover:not(:disabled) { background:#f5d5cf; }
        .nl-input {
          width:100%; padding:.6rem .9rem; border-radius:10px;
          border:1px solid rgba(20,20,16,.12); background:#fff;
          font-size:.8rem; color:#38382E; outline:none;
          transition:border .18s;
        }
        .nl-input:focus { border-color:#C08435; }
        .nl-select {
          padding:.55rem .85rem; border-radius:10px;
          border:1px solid rgba(20,20,16,.12); background:#fff;
          font-size:.75rem; color:#38382E; outline:none; cursor:pointer;
          transition:border .18s;
        }
        .nl-table-wrap {
          background:#fff; border-radius:16px;
          border:1px solid rgba(20,20,16,.08);
          overflow:auto;
          box-shadow:0 2px 24px rgba(20,20,16,.05);
        }
        .nl-table { width:100%; border-collapse:collapse; min-width:700px; }
        .nl-th {
          padding:.75rem 1rem; text-align:left;
          font-size:.58rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase;
          color:#928E80; background:#FAFAF8;
          border-bottom:1px solid rgba(20,20,16,.07);
          white-space:nowrap;
        }
        .nl-td {
          padding:.85rem 1rem; vertical-align:middle;
          border-bottom:1px solid rgba(20,20,16,.055);
          font-size:.78rem; color:#38382E;
        }
        .nl-row:hover { background:#FAFAF8; }
        .nl-row:last-child .nl-td { border-bottom:none; }
        .nl-action-btn {
          display:inline-flex; align-items:center; justify-content:center;
          width:30px; height:30px; border-radius:8px; border:1px solid rgba(20,20,16,.1);
          background:transparent; cursor:pointer; transition:all .18s; color:#928E80;
        }
        .nl-action-btn:hover { background:rgba(20,20,16,.06); color:#38382E; }
        .nl-page-btn {
          display:inline-flex; align-items:center; justify-content:center;
          min-width:32px; height:32px; padding:0 .4rem; border-radius:8px;
          border:1px solid rgba(20,20,16,.12); background:transparent;
          font-size:.72rem; font-weight:600; color:#38382E; cursor:pointer;
          transition:all .15s;
        }
        .nl-page-btn:hover { background:rgba(20,20,16,.06); }
        .nl-page-btn.active { background:#141410; color:#fff; border-color:#141410; }
        .nl-page-btn:disabled { opacity:.35; cursor:not-allowed; }
        .nl-stat-card {
          background:#fff; border-radius:14px; padding:1rem 1.25rem;
          border:1px solid rgba(20,20,16,.08); flex:1;
          box-shadow:0 1px 8px rgba(20,20,16,.04);
        }
        .nl-empty {
          text-align:center; padding:5rem 2rem;
        }
        .nl-bulk-bar {
          background:#141410; border-radius:12px; padding:.85rem 1.4rem;
          margin-bottom:1rem; display:flex; align-items:center; gap:1rem;
          box-shadow:0 4px 16px rgba(20,20,16,.2);
        }
        .nl-bulk-count { font-size:.78rem; font-weight:700; color:#C08435; }
        .nl-bulk-divider { width:1px; height:18px; background:rgba(255,255,255,.1); }
        .nl-bulk-cancel {
          margin-left:auto; background:none; border:none; font-size:.72rem;
          color:rgba(255,255,255,.4); cursor:pointer;
        }
        .nl-modal-overlay {
          position:fixed; inset:0; background:rgba(20,20,16,.6);
          backdrop-filter:blur(4px); z-index:9900; display:flex;
          align-items:center; justify-content:center; padding:1rem;
        }
        .nl-modal {
          background:#fff; border-radius:24px; padding:2rem;
          max-width:500px; width:100%;
          box-shadow:0 24px 64px rgba(20,20,16,.18);
          animation:modal-in .22s cubic-bezier(.34,1.56,.64,1);
        }
        .nl-modal-wide { max-width:700px; }
        .nl-modal-header {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:1.2rem; padding-bottom:.8rem; border-bottom:1px solid rgba(20,20,16,.08);
        }
        .nl-modal-title {
          font-family:'Fraunces',Georgia,serif; font-size:1.2rem; font-weight:900;
          color:#141410;
        }
        .nl-modal-close {
          background:none; border:none; cursor:pointer; color:#928E80;
        }
        .nl-modal-desc {
          font-size:.82rem; color:#928E80; line-height:1.65; margin-bottom:1.5rem;
        }
        .nl-modal-actions {
          display:flex; gap:.75rem; justify-content:flex-end;
        }
        .nl-tabs {
          display:flex; gap:0; margin:1rem 0 1.5rem;
          border-bottom:1px solid rgba(20,20,16,.1);
        }
        .nl-tab {
          padding:.6rem 1.2rem; font-size:.78rem; font-weight:600;
          color:#928E80; cursor:pointer; border-bottom:2px solid transparent;
          transition:all .15s;
        }
        .nl-tab.active {
          color:#141410; border-bottom-color:#C08435;
        }
        .nl-field {
          margin-bottom:1.2rem;
        }
        .nl-field label {
          display:block; font-size:.6rem; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; color:#928E80; margin-bottom:.4rem;
        }
        .nl-field input, .nl-field textarea {
          width:100%; padding:.6rem .9rem; border-radius:10px;
          border:1px solid rgba(20,20,16,.12); background:#F8F6F1;
          font-size:.85rem; font-family:inherit;
        }
        .nl-radio-group {
          display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:.5rem;
        }
        .nl-radio-group label {
          display:flex; align-items:center; gap:.4rem; font-size:.75rem; font-weight:500;
          text-transform:none; color:#38382E;
        }
        .nl-tag-select {
          display:flex; flex-wrap:wrap; gap:.5rem; margin-top:.5rem;
        }
        .nl-tag-select label {
          display:flex; align-items:center; gap:.3rem; font-size:.7rem;
          background:#F8F6F1; padding:.2rem .6rem; border-radius:100px;
          cursor:pointer;
        }
        .nl-tag-select-large label {
          padding:.3rem .8rem;
        }
        .nl-tag-chip {
          display:inline-flex; align-items:center; gap:.3rem;
          background:#F0EDE4; border-radius:100px; padding:.2rem .6rem;
          font-size:.7rem; cursor:pointer;
          transition:all .15s;
        }
        .nl-tag-chip.active {
          background:#C08435; color:#fff;
        }
        .nl-campaign-list {
          margin-top:1rem;
        }
        .nl-campaign-item {
          background:#fff; border-radius:12px; padding:1rem;
          margin-bottom:.5rem; border:1px solid rgba(20,20,16,.08);
        }
        @keyframes modal-in {
          from { opacity:0; transform:scale(.94) translateY(8px); }
          to   { opacity:1; transform:none; }
        }
        @keyframes slide-up {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:none; }
        }
        @media(max-width:600px) {
          .nl-col-hide { display:none; }
        }
      `}</style>

      <div style={{ background: "#F5F3EE", minHeight: "100vh", paddingBottom: "4rem" }}>
        {/* ── En-tête ── */}
        <div style={{ background: "#141410", borderBottom: "3px solid #C08435", padding: "2rem 0 1.75rem" }}>
          <div className="nl-wrap">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: ".5rem" }}>
                  <Link href="/admin" style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(248,246,241,.35)", textDecoration: "none", transition: "color .2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(248,246,241,.7)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248,246,241,.35)")}>Admin</Link>
                  <span style={{ color: "rgba(248,246,241,.2)" }}>›</span>
                  <span style={{ fontSize: ".6rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#C08435" }}>Newsletter</span>
                </div>
                <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 900, color: "#F8F6F1", letterSpacing: "-0.03em", margin: 0 }}>
                  Centre d'engagement
                </h1>
                <p style={{ fontSize: ".75rem", color: "rgba(248,246,241,.4)", marginTop: ".35rem" }}>
                  Gérez votre audience, personnalisez les intérêts et envoyez des campagnes ciblées.
                </p>
              </div>
              <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
                <button className="nl-btn nl-btn-ghost" style={{ color: "rgba(248,246,241,.6)", borderColor: "rgba(248,246,241,.15)" }} onClick={loadSubscribers}>
                  <IcoRefresh /> Actualiser
                </button>
                <button className="nl-btn nl-btn-primary" onClick={() => setCampaignModalOpen(true)}>
                  <IcoPlus /> Nouvelle campagne
                </button>
              </div>
            </div>
            {/* Stats rapides */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
              {[
                { label: "Total", value: total, color: "#F8F6F1", sub: "abonnés" },
                { label: "Confirmés", value: totalConfirmed, color: "#1A5C40", sub: "actifs" },
                { label: "En attente", value: totalPending, color: "#B8341E", sub: "non confirmés" },
                { label: "Nouveaux (30j)", value: newThisMonth, color: "#C08435", sub: "dernier mois" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(248,246,241,.06)", border: "1px solid rgba(248,246,241,.1)", borderRadius: 12, padding: ".75rem 1.25rem" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: s.color, fontFamily: "'Fraunces', Georgia, serif", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: ".58rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(248,246,241,.35)", marginTop: ".2rem" }}>{s.label} · {s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Onglets ── */}
        <div className="nl-wrap">
          <div className="nl-tabs">
            <div className={`nl-tab ${activeTab === "subscribers" ? "active" : ""}`} onClick={() => setActiveTab("subscribers")}>
              Abonnés
            </div>
            <div className={`nl-tab ${activeTab === "campaigns" ? "active" : ""}`} onClick={() => setActiveTab("campaigns")}>
              Campagnes
            </div>
            <div className={`nl-tab ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
              Paramètres & Tags
            </div>
          </div>
        </div>

        {/* ── Onglet ABONNÉS ── */}
        {activeTab === "subscribers" && (
          <div className="nl-wrap" style={{ paddingTop: "1.75rem" }}>
            {/* Filtres */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(20,20,16,.08)", padding: "1rem 1.4rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1", minWidth: "220px", maxWidth: "380px" }}>
                  <span style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: "#928E80" }}><IcoSearch /></span>
                  <input className="nl-input" style={{ paddingLeft: "2.2rem" }} placeholder="Rechercher par email" value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }} autoComplete="off" />
                </div>
                <select className="nl-select" value={filterConfirmed} onChange={(e) => { setFilterConfirmed(e.target.value as typeof filterConfirmed); setPage(1); }}>
                  <option value="all">Tous les statuts</option>
                  <option value="confirmed">Confirmés</option>
                  <option value="pending">En attente</option>
                </select>
                <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: ".6rem", color: "#928E80" }}>Tags :</span>
                  {availableTags.map(tag => (
                    <button key={tag} onClick={() => toggleTagFilter(tag)} className={`nl-tag-chip ${filterTags.includes(tag) ? "active" : ""}`}>
                      {tag}
                    </button>
                  ))}
                </div>
                {(search || filterConfirmed !== "all" || filterTags.length > 0) && (
                  <button className="nl-btn nl-btn-ghost" onClick={() => { setSearch(""); setFilterConfirmed("all"); setFilterTags([]); setPage(1); }}>✕ Réinitialiser</button>
                )}
                <div style={{ marginLeft: "auto", fontSize: ".72rem", color: "#928E80" }}>{total} résultat{total !== 1 ? "s" : ""}</div>
              </div>
            </div>

            {/* Barre d'actions bulk */}
            {selected.size > 0 && (
              <div className="nl-bulk-bar">
                <span className="nl-bulk-count">{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</span>
                <div className="nl-bulk-divider" />
                <button className="nl-btn nl-btn-danger" onClick={bulkDelete}>Supprimer</button>
                <button className="nl-bulk-cancel" onClick={() => setSelected(new Set())}>Annuler</button>
              </div>
            )}

            {/* Tableau des abonnés */}
            {loading ? (
              <Spinner />
            ) : subscribers.length === 0 ? (
              <div className="nl-empty">
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "3rem", color: "rgba(20,20,16,.1)", marginBottom: ".5rem" }}>📭</div>
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.4rem", color: "rgba(20,20,16,.2)", fontWeight: 900 }}>Aucun abonné</p>
                <p style={{ color: "#928E80", fontSize: ".8rem", marginTop: ".4rem" }}>Ajustez vos filtres ou attendez des inscriptions.</p>
              </div>
            ) : (
              <div className="nl-table-wrap">
                <table className="nl-table">
                  <thead>
                    <tr>
                      <th className="nl-th" style={{ width: 40 }}><input type="checkbox" checked={selected.size === subscribers.length && subscribers.length > 0}
                        ref={el => { if (el) el.indeterminate = selected.size > 0 && selected.size < subscribers.length; }}
                        onChange={toggleAll} style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#C08435" }} /></th>
                      <th className="nl-th">Email</th>
                      <th className="nl-th">Statut</th>
                      <th className="nl-th">Tags</th>
                      <th className="nl-th">Inscrit le</th>
                      <th className="nl-th" style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map(sub => (
                      <tr key={sub.id} className="nl-row">
                        <td className="nl-td"><input type="checkbox" checked={selected.has(sub.id)} onChange={() => toggleSelect(sub.id)} /></td>
                        <td className="nl-td">{sub.email}</td>
                        <td className="nl-td"><StatusBadge confirmed={sub.confirmed} /></td>
                        <td className="nl-td">
                          <div style={{ display: "flex", gap: ".3rem", flexWrap: "wrap" }}>
                            {sub.tags?.slice(0, 2).map(t => <span key={t} className="nl-tag-chip" style={{ background: "#F0EDE4" }}>{t}</span>)}
                            {sub.tags?.length > 2 && <span className="nl-tag-chip">+{sub.tags.length-2}</span>}
                            <button className="nl-action-btn" onClick={() => { setCurrentSubscriber(sub); setTagsModalOpen(true); }} style={{ width: 24, height: 24, fontSize: ".7rem" }}><IcoTag /></button>
                          </div>
                        </td>
                        <td className="nl-td">{formatDate(sub.created_at)}</td>
                        <td className="nl-td" style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: ".4rem", justifyContent: "flex-end" }}>
                            {!sub.confirmed && (
                              <button className="nl-action-btn" title="Renvoyer l'email de confirmation" onClick={() => resendConfirmation(sub)}>
                                <IcoMail />
                              </button>
                            )}
                            <button className="nl-action-btn" title="Supprimer" onClick={() => deleteSubscriber(sub.id, sub.email)} style={{ color: "#B8341E" }}>
                              <IcoTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <span style={{ fontSize: ".72rem", color: "#928E80" }}>Page {page} sur {totalPages} — {total} résultat{total !== 1 ? "s" : ""}</span>
                <div style={{ display: "flex", gap: ".35rem" }}>
                  <button className="nl-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const pg = i + 1;
                    return <button key={pg} className={`nl-page-btn ${page === pg ? "active" : ""}`} onClick={() => setPage(pg)}>{pg}</button>;
                  })}
                  {totalPages > 7 && (
                    <>
                      <span style={{ padding: "0 .2rem", color: "#928E80" }}>…</span>
                      <button className={`nl-page-btn ${page === totalPages ? "active" : ""}`} onClick={() => setPage(totalPages)}>{totalPages}</button>
                    </>
                  )}
                  <button className="nl-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                </div>
              </div>
            )}

            {/* Bouton export */}
            <div style={{ marginTop: "1rem", textAlign: "right" }}>
              <button className="nl-btn nl-btn-ghost" onClick={exportCSV}><IcoDownload /> Exporter CSV</button>
            </div>
          </div>
        )}

        {/* ── Onglet CAMPAGNES ── */}
        {activeTab === "campaigns" && (
          <div className="nl-wrap" style={{ paddingTop: "1.75rem" }}>
            <div className="nl-stat-card" style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, marginBottom: ".5rem" }}>Historique des envois</h3>
              <div className="nl-campaign-list">
                {campaignHistory.length === 0 ? (
                  <p style={{ color: "#928E80" }}>Aucune campagne envoyée pour le moment.</p>
                ) : (
                  campaignHistory.map((camp, idx) => (
                    <div key={idx} className="nl-campaign-item">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>{camp.subject}</strong>
                        <span style={{ fontSize: ".65rem", color: "#928E80" }}>{camp.sent_at ? formatDate(camp.sent_at) : ""}</span>
                      </div>
                      <div style={{ fontSize: ".7rem", color: "#928E80", marginTop: ".2rem" }}>
                        Destinataires : {camp.target === "all" ? "Tous" : camp.target === "confirmed" ? "Confirmés" : camp.target === "pending" ? "En attente" : `Tags: ${camp.tags?.join(", ")}`}
                      </div>
                      <div style={{ marginTop: ".5rem", fontSize: ".75rem", color: "#38382E" }}>{camp.content.slice(0, 100)}...</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Onglet PARAMÈTRES & TAGS ── */}
        {activeTab === "settings" && (
          <div className="nl-wrap" style={{ paddingTop: "1.75rem" }}>
            <div className="nl-stat-card">
              <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, marginBottom: "1rem" }}>Gestion des centres d'intérêt (tags)</h3>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
                <input className="nl-input" style={{ flex: 1 }} placeholder="Nouveau tag" value={newTag} onChange={e => setNewTag(e.target.value)} />
                <button className="nl-btn nl-btn-primary" onClick={addTag} disabled={!newTag.trim()}><IcoPlus /> Ajouter</button>
              </div>
              <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                {availableTags.map(tag => (
                  <span key={tag} className="nl-tag-chip" style={{ background: "#F0EDE4" }}>
                    {tag}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: ".65rem", color: "#928E80", marginTop: "1rem" }}>
                💡 Les tags permettent de cibler vos campagnes email. Vous pouvez les assigner aux abonnés via le tableau.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <CampaignModal
        isOpen={campaignModalOpen}
        onClose={() => setCampaignModalOpen(false)}
        onSend={sendCampaign}
        tags={availableTags}
      />
      <TagsModal
        isOpen={tagsModalOpen}
        onClose={() => setTagsModalOpen(false)}
        subscriber={currentSubscriber}
        tags={availableTags}
        onUpdate={updateSubscriberTags}
      />
      <ConfirmModal
        isOpen={confirmModal?.open || false}
        onClose={() => setConfirmModal(null)}
        onConfirm={confirmModal?.onConfirm}
        title={confirmModal?.title}
        message={confirmModal?.message}
      />
      {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={hideToast} />}
    </>
  );
}