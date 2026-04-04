"use client";

/**
 * app/admin/evenements/page.tsx
 * Page admin liste des événements — données réelles Supabase
 * Ajout : suppression avec confirmation par mot de passe
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ── Types ── */
type EventType =
  | "Conférence"
  | "Forum"
  | "Hackathon"
  | "Salon"
  | "Atelier"
  | "Sommet";

interface AdminEvent {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  location: string;
  country: string | null;
  flag: string;
  event_date: string;
  organizer: string | null;
  attendees: string | null;
  featured: boolean;
  published: boolean;
  cover_url: string | null;
  image_gradient: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

/* ── Config types ── */
const EVENT_TYPES: EventType[] = [
  "Conférence",
  "Forum",
  "Hackathon",
  "Salon",
  "Atelier",
  "Sommet",
];

const TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  Conférence: { color: "#1E4DA8", bg: "#EBF0FB" },
  Forum: { color: "#1A5C40", bg: "#EAF4EF" },
  Hackathon: { color: "#7A1E4A", bg: "#F9EBF3" },
  Salon: { color: "#9B6B1A", bg: "#FBF4E8" },
  Atelier: { color: "#2D6B6B", bg: "#E6F4F4" },
  Sommet: { color: "#141410", bg: "#F0EDE4" },
};

const PAGE_SIZE = 20;

/* ── Icônes SVG inline ── */
const IcoCal = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IcoPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcoPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IcoEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IcoEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcoTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const IcoStar = ({ filled }: { filled?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IcoRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-3.78" />
  </svg>
);
const IcoClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IcoPwdShow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcoPwdHide = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ── Composant Pill Type ── */
function TypePill({ type }: { type: string }) {
  const s = TYPE_STYLE[type] ?? { color: "#928E80", bg: "#F0EDE4" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.6rem",
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "0.22rem 0.75rem",
        borderRadius: 100,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.color,
          flexShrink: 0,
        }}
      />
      {type}
    </span>
  );
}

/* ── Badge statut ── */
function StatusBadge({ published, featured }: { published: boolean; featured: boolean }) {
  if (!published)
    return (
      <span
        style={{
          fontSize: "0.58rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "0.2rem 0.65rem",
          borderRadius: 100,
          background: "#F0EDE4",
          color: "#928E80",
          border: "1px solid rgba(20,20,16,.1)",
        }}
      >
        Brouillon
      </span>
    );
  if (featured)
    return (
      <span
        style={{
          fontSize: "0.58rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "0.2rem 0.65rem",
          borderRadius: 100,
          background: "#FDF4E7",
          color: "#C08435",
          border: "1px solid rgba(192,132,53,.2)",
        }}
      >
        ★ Vedette
      </span>
    );
  return (
    <span
      style={{
        fontSize: "0.58rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "0.2rem 0.65rem",
        borderRadius: 100,
        background: "#EAF4EF",
        color: "#1A5C40",
        border: "1px solid rgba(26,92,64,.15)",
      }}
    >
      Publié
    </span>
  );
}

/* ── Modale de confirmation par mot de passe (identique aux autres pages) ── */
function PasswordConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  actionLabel,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title: string;
  message: string;
  actionLabel: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirm = async () => {
    if (!password) {
      setError("Mot de passe requis");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onConfirm(password);
      setPassword("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="aev-modal-overlay" onClick={onClose}>
      <div className="aev-pwd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="aev-modal-header">
          <div className="aev-modal-title">{title}</div>
          <button className="aev-modal-close" onClick={onClose}>
            <IcoClose />
          </button>
        </div>
        <p className="aev-modal-desc">{message}</p>
        <div className="aev-pwd-field">
          <label>Mot de passe administrateur</label>
          <input
            type="email"
            name="fake-email"
            autoComplete="email"
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
          />
          <input
            type="password"
            name="fake-password"
            autoComplete="current-password"
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
          />
          <div className="aev-pwd-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              autoFocus
              autoComplete="new-password"
              name="new-password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="aev-pwd-toggle">
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {error && <div className="aev-pwd-error">{error}</div>}
        </div>
        <div className="aev-modal-actions">
          <button className="aev-btn aev-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button className="aev-btn aev-btn-danger" onClick={handleConfirm} disabled={loading}>
            {loading ? "Vérification..." : actionLabel}
          </button>
        </div>
      </div>
      <style jsx>{`
        .aev-pwd-modal {
          background: #fff;
          border-radius: 24px;
          padding: 2rem;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 24px 64px rgba(20, 20, 16, 0.18);
        }
        .aev-modal-desc {
          font-size: 0.82rem;
          color: #928e80;
          line-height: 1.65;
          margin-bottom: 1.5rem;
        }
        .aev-pwd-field label {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #928e80;
          display: block;
          margin-bottom: 0.45rem;
        }
        .aev-pwd-input-wrapper {
          position: relative;
        }
        .aev-pwd-input-wrapper input {
          width: 100%;
          padding: 0.7rem 3rem 0.7rem 1rem;
          border-radius: 12px;
          font-size: 0.88rem;
          border: 1.5px solid rgba(20, 20, 16, 0.14);
          background: #f8f6f1;
          outline: none;
        }
        .aev-pwd-toggle {
          position: absolute;
          right: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #928e80;
        }
        .aev-pwd-error {
          margin-top: 0.45rem;
          font-size: 0.72rem;
          color: #b8341e;
        }
        .aev-modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
export default function AdminEvenementsPage() {
  const sb = createClient();
  const router = useRouter();

  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"Tout" | EventType>("Tout");
  const [filterStatus, setFilterStatus] = useState<"Tout" | "published" | "draft" | "featured">("Tout");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // État pour la modale de mot de passe (suppression)
  const [pwdModal, setPwdModal] = useState<{ eventId: string; eventTitle: string } | null>(null);

  const totalPublished = events.filter((e) => e.published).length;
  const totalFeatured = events.filter((e) => e.featured).length;
  const totalDraft = events.filter((e) => !e.published).length;

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Vérification mot de passe ── */
  const verifyPassword = async (password: string): Promise<void> => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("Non authentifié");
    const { error } = await sb.auth.signInWithPassword({ email: user.email!, password });
    if (error) throw new Error("Mot de passe incorrect");
  };

  /* ── Suppression définitive avec mot de passe ── */
  const confirmDeleteWithPassword = async (password: string, eventId: string) => {
    await verifyPassword(password);
    setDeleting(eventId);
    try {
      const { error } = await sb.from("events").delete().eq("id", eventId);
      if (!error) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        setTotal((t) => t - 1);
        showToast("Événement supprimé définitivement.");
      } else {
        throw error;
      }
    } finally {
      setDeleting(null);
    }
  };

  /* ── Ouvre la modale de confirmation ── */
  const deleteEvent = (ev: AdminEvent) => {
    setPwdModal({ eventId: ev.id, eventTitle: ev.title });
  };

  /* ── Chargement des événements ── */
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      let query = sb
        .from("events")
        .select("*", { count: "exact" })
        .order("event_date", { ascending: true });

      if (search.trim()) {
        query = query.or(
          `title.ilike.%${search.trim()}%,organizer.ilike.%${search.trim()}%,location.ilike.%${search.trim()}%`
        );
      }
      if (filterType !== "Tout") {
        query = query.eq("type", filterType);
      }
      if (filterStatus === "published") {
        query = query.eq("published", true);
      } else if (filterStatus === "draft") {
        query = query.eq("published", false);
      } else if (filterStatus === "featured") {
        query = query.eq("featured", true);
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = page * PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (!error && data) {
        setEvents(data as AdminEvent[]);
        setTotal(count ?? 0);
      }
    } catch (err) {
      console.error("Erreur chargement événements:", err);
    } finally {
      setLoading(false);
    }
  }, [sb, search, filterType, filterStatus, page]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /* ── Toggle published ── */
  const togglePublished = async (ev: AdminEvent) => {
    setToggling(ev.id);
    try {
      const { error } = await (sb.from("events") as any)
        .update({ published: !ev.published })
        .eq("id", ev.id);
      if (!error) {
        setEvents((prev) =>
          prev.map((e) => (e.id === ev.id ? { ...e, published: !ev.published } : e))
        );
      }
    } finally {
      setToggling(null);
    }
  };

  /* ── Toggle featured ── */
  const toggleFeatured = async (ev: AdminEvent) => {
    setToggling(ev.id);
    try {
      const { error } = await (sb.from("events") as any)
        .update({ featured: !ev.featured })
        .eq("id", ev.id);
      if (!error) {
        setEvents((prev) =>
          prev.map((e) => (e.id === ev.id ? { ...e, featured: !ev.featured } : e))
        );
      }
    } finally {
      setToggling(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const isUpcoming = (dateStr: string) => new Date(dateStr) >= new Date();
  const daysUntil = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    return diff;
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <style>{`
        .aev-wrap { max-width: 1380px; margin: 0 auto; padding: 0 clamp(1rem,3vw,2.5rem); }
        .aev-btn {
          display:inline-flex; align-items:center; gap:.4rem;
          padding:.55rem 1.1rem; border-radius:10px; border:none; cursor:pointer;
          font-size:.72rem; font-weight:700; letter-spacing:.04em; transition:all .18s;
        }
        .aev-btn:disabled { opacity:.5; cursor:not-allowed; }
        .aev-btn-primary { background:#141410; color:#F8F6F1; }
        .aev-btn-primary:hover:not(:disabled) { background:#2a2a20; }
        .aev-btn-ghost {
          background:transparent; color:#928E80;
          border:1px solid rgba(20,20,16,.12);
        }
        .aev-btn-ghost:hover:not(:disabled) { background:rgba(20,20,16,.05); color:#38382E; }
        .aev-btn-danger { background:#FAEBE8; color:#B8341E; }
        .aev-btn-danger:hover:not(:disabled) { background:#f5d5cf; }
        .aev-input {
          width:100%; padding:.6rem .9rem; border-radius:10px;
          border:1px solid rgba(20,20,16,.12); background:#fff;
          font-size:.8rem; color:#38382E; outline:none;
          transition:border .18s;
        }
        .aev-input:focus { border-color:#C08435; }
        .aev-select {
          padding:.55rem .85rem; border-radius:10px;
          border:1px solid rgba(20,20,16,.12); background:#fff;
          font-size:.75rem; color:#38382E; outline:none; cursor:pointer;
          transition:border .18s;
        }
        .aev-select:focus { border-color:#C08435; }
        .aev-table-wrap {
          background:#fff; border-radius:16px;
          border:1px solid rgba(20,20,16,.08);
          overflow:hidden; box-shadow:0 2px 24px rgba(20,20,16,.05);
        }
        .aev-table { width:100%; border-collapse:collapse; }
        .aev-th {
          padding:.75rem 1rem; text-align:left;
          font-size:.58rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase;
          color:#928E80; background:#FAFAF8;
          border-bottom:1px solid rgba(20,20,16,.07);
          white-space:nowrap;
        }
        .aev-td {
          padding:.85rem 1rem; vertical-align:middle;
          border-bottom:1px solid rgba(20,20,16,.055);
          font-size:.78rem; color:#38382E;
        }
        .aev-row { transition:background .15s; cursor:pointer; }
        .aev-row:hover { background:#FAFAF8; }
        .aev-row:last-child .aev-td { border-bottom:none; }
        .aev-action-btn {
          display:inline-flex; align-items:center; justify-content:center;
          width:30px; height:30px; border-radius:8px; border:1px solid rgba(20,20,16,.1);
          background:transparent; cursor:pointer; transition:all .18s; color:#928E80;
        }
        .aev-action-btn:hover { background:rgba(20,20,16,.06); color:#38382E; }
        .aev-action-btn:disabled { opacity:.4; cursor:not-allowed; }
        .aev-toggle {
          position:relative; display:inline-flex; align-items:center;
          width:38px; height:22px; border-radius:100px;
          border:none; cursor:pointer; transition:background .2s; flex-shrink:0;
        }
        .aev-toggle-thumb {
          position:absolute; width:16px; height:16px; border-radius:50%;
          background:#fff; transition:transform .2s;
          box-shadow:0 1px 4px rgba(0,0,0,.2);
        }
        .aev-page-btn {
          display:inline-flex; align-items:center; justify-content:center;
          min-width:32px; height:32px; padding:0 .4rem; border-radius:8px;
          border:1px solid rgba(20,20,16,.12); background:transparent;
          font-size:.72rem; font-weight:600; color:#38382E; cursor:pointer;
          transition:all .15s;
        }
        .aev-page-btn:hover { background:rgba(20,20,16,.06); }
        .aev-page-btn.active { background:#141410; color:#fff; border-color:#141410; }
        .aev-page-btn:disabled { opacity:.35; cursor:not-allowed; }
        .aev-spinner {
          width:36px; height:36px; border-radius:50%;
          border:3px solid rgba(20,20,16,.08); border-top-color:#C08435;
          animation:aev-spin .8s linear infinite; margin:0 auto 1rem;
        }
        @keyframes aev-spin { to { transform:rotate(360deg); } }
        .aev-gradient-thumb {
          width:44px; height:44px; border-radius:10px; flex-shrink:0;
          overflow:hidden; position:relative;
        }
        .aev-upcoming-dot {
          display:inline-block; width:7px; height:7px; border-radius:50%;
          background:#1A5C40; margin-right:.35rem; vertical-align:middle;
          animation:aev-blink 2s ease-in-out infinite;
        }
        .aev-past-dot {
          display:inline-block; width:7px; height:7px; border-radius:50%;
          background:#928E80; margin-right:.35rem; vertical-align:middle;
        }
        @keyframes aev-blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        @media(max-width:900px) {
          .aev-col-hide { display:none; }
          .aev-col-hide-md { display:none; }
        }
        @media(max-width:600px) {
          .aev-col-hide-sm { display:none; }
        }
        .aev-modal-overlay {
          position:fixed; inset:0; background:rgba(20,20,16,.6);
          backdrop-filter:blur(4px); z-index:9900; display:flex;
          align-items:center; justify-content:center; padding:1rem;
        }
        .aev-modal-header {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:1rem;
        }
        .aev-modal-title {
          font-family:'Fraunces',Georgia,serif;
          font-size:1.2rem; font-weight:900; color:#141410;
        }
        .aev-modal-close {
          background:none; border:none; cursor:pointer; color:#928E80;
        }
      `}</style>

      <div style={{ background: "#F5F3EE", minHeight: "100vh", paddingBottom: "4rem" }}>
        {/* ── En-tête ── */}
        <div
          style={{
            background: "#141410",
            borderBottom: "3px solid #C08435",
            padding: "2rem 0 1.75rem",
          }}
        >
          <div className="aev-wrap">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".65rem",
                    marginBottom: ".5rem",
                  }}
                >
                  <Link
                    href="/admin"
                    style={{
                      fontSize: ".6rem",
                      fontWeight: 700,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "rgba(248,246,241,.35)",
                      textDecoration: "none",
                      transition: "color .2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "rgba(248,246,241,.7)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(248,246,241,.35)")
                    }
                  >
                    Admin
                  </Link>
                  <span style={{ color: "rgba(248,246,241,.2)" }}>›</span>
                  <span
                    style={{
                      fontSize: ".6rem",
                      fontWeight: 800,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "#C08435",
                    }}
                  >
                    Événements
                  </span>
                </div>
                <h1
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: "clamp(1.6rem,3vw,2.4rem)",
                    fontWeight: 900,
                    color: "#F8F6F1",
                    letterSpacing: "-0.03em",
                    margin: 0,
                  }}
                >
                  Gestion des Événements
                </h1>
                <p
                  style={{
                    fontSize: ".75rem",
                    color: "rgba(248,246,241,.4)",
                    marginTop: ".35rem",
                  }}
                >
                  {total} événement{total !== 1 ? "s" : ""} au total
                </p>
              </div>
              <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
                <button
                  className="aev-btn aev-btn-ghost"
                  style={{ color: "rgba(248,246,241,.6)", borderColor: "rgba(248,246,241,.15)" }}
                  onClick={() => loadEvents()}
                >
                  <IcoRefresh /> Actualiser
                </button>
                <Link href="/admin/evenements/nouveau">
                  <button className="aev-btn" style={{ background: "#C08435", color: "#fff" }}>
                    <IcoPlus /> Nouvel événement
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "Total", value: total, color: "#F8F6F1", sub: "événements" },
                { label: "Publiés", value: totalPublished, color: "#6FCF97", sub: "en ligne" },
                { label: "Vedette", value: totalFeatured, color: "#C08435", sub: "mis en avant" },
                { label: "Brouillons", value: totalDraft, color: "#928E80", sub: "non publiés" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(248,246,241,.06)",
                    border: "1px solid rgba(248,246,241,.1)",
                    borderRadius: 12,
                    padding: ".75rem 1.25rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      color: s.color,
                      fontFamily: "'Fraunces', Georgia, serif",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: ".58rem",
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "rgba(248,246,241,.35)",
                      marginTop: ".2rem",
                    }}
                  >
                    {s.label} · {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filtres & recherche ── */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid rgba(20,20,16,.07)",
            padding: "1rem 0",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: "0 2px 12px rgba(20,20,16,.05)",
          }}
        >
          <div className="aev-wrap">
            <div
              style={{
                display: "flex",
                gap: ".75rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: "1",
                  minWidth: "220px",
                  maxWidth: "380px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: ".8rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#928E80",
                    pointerEvents: "none",
                  }}
                >
                  <IcoSearch />
                </span>
                <input
                  className="aev-input"
                  style={{ paddingLeft: "2.2rem" }}
                  placeholder="Rechercher un événement, organisateur…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <select
                className="aev-select"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as typeof filterType);
                  setPage(1);
                }}
              >
                <option value="Tout">Tous les types</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                className="aev-select"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as typeof filterStatus);
                  setPage(1);
                }}
              >
                <option value="Tout">Tous les statuts</option>
                <option value="published">Publiés</option>
                <option value="draft">Brouillons</option>
                <option value="featured">Vedette</option>
              </select>

              {(search || filterType !== "Tout" || filterStatus !== "Tout") && (
                <button
                  className="aev-btn aev-btn-ghost"
                  onClick={() => {
                    setSearch("");
                    setFilterType("Tout");
                    setFilterStatus("Tout");
                    setPage(1);
                  }}
                >
                  ✕ Réinitialiser
                </button>
              )}

              <div
                style={{
                  marginLeft: "auto",
                  fontSize: ".72rem",
                  color: "#928E80",
                  whiteSpace: "nowrap",
                }}
              >
                {total} résultat{total !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* ── Corps ── */}
        <div className="aev-wrap" style={{ paddingTop: "1.75rem" }}>
          {/* Raccourcis types */}
          <div
            style={{
              display: "flex",
              gap: ".5rem",
              flexWrap: "wrap",
              marginBottom: "1.25rem",
            }}
          >
            {(["Tout", ...EVENT_TYPES] as ("Tout" | EventType)[]).map((t) => {
              const active = filterType === t;
              const s = TYPE_STYLE[t as string];
              const count =
                t === "Tout" ? total : events.filter((e) => e.type === t).length;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setFilterType(t);
                    setPage(1);
                  }}
                  style={{
                    padding: ".3rem .85rem",
                    borderRadius: 100,
                    border: active ? "none" : "1px solid rgba(20,20,16,.12)",
                    background: active ? s?.color ?? "#141410" : "#fff",
                    color: active ? "#fff" : "#928E80",
                    fontSize: ".6rem",
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all .18s",
                  }}
                >
                  {t}{" "}
                  <span style={{ opacity: 0.6, fontWeight: 400, fontSize: ".55rem" }}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tableau */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <div className="aev-spinner" />
              <p style={{ color: "#928E80", fontSize: ".8rem" }}>
                Chargement des événements…
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="aev-empty">
              <div
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "3rem",
                  color: "rgba(20,20,16,.1)",
                  marginBottom: ".5rem",
                }}
              >
                📅
              </div>
              <p
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "1.4rem",
                  color: "rgba(20,20,16,.2)",
                  fontWeight: 900,
                }}
              >
                Aucun événement trouvé
              </p>
              <p style={{ color: "#928E80", fontSize: ".8rem", marginTop: ".4rem" }}>
                {search || filterType !== "Tout" || filterStatus !== "Tout"
                  ? "Essayez de modifier vos filtres de recherche."
                  : "Créez votre premier événement pour commencer."}
              </p>
              {!search && filterType === "Tout" && filterStatus === "Tout" && (
                <Link href="/admin/evenements/nouveau">
                  <button
                    className="aev-btn"
                    style={{ marginTop: "1.5rem", background: "#C08435", color: "#fff" }}
                  >
                    <IcoPlus /> Créer un événement
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="aev-table-wrap" style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "780px" }}>
                <table className="aev-table">
                  <thead>
                    <tr>
                      <th className="aev-th" style={{ width: 52 }} />
                      <th className="aev-th">Événement</th>
                      <th className="aev-th aev-col-hide">Type</th>
                      <th className="aev-th aev-col-hide-md">Date</th>
                      <th className="aev-th aev-col-hide">Lieu</th>
                      <th className="aev-th aev-col-hide">Statut</th>
                      <th className="aev-th" style={{ textAlign: "center" }}>
                        En ligne
                      </th>
                      <th className="aev-th" style={{ textAlign: "center" }}>
                        Vedette
                      </th>
                      <th className="aev-th" style={{ textAlign: "right" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => {
                      const upcoming = isUpcoming(ev.event_date);
                      const days = daysUntil(ev.event_date);
                      const isToggling = toggling === ev.id;
                      const isDeleting = deleting === ev.id;

                      return (
                        <tr
                          key={ev.id}
                          className="aev-row"
                          onClick={() => router.push(`/admin/evenements/${ev.id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {/* Miniature */}
                          <td className="aev-td" style={{ paddingRight: 0 }}>
                            <div
                              className="aev-gradient-thumb"
                              style={{ background: ev.image_gradient }}
                            >
                              {ev.cover_url ? (
                                <img
                                  src={ev.cover_url}
                                  alt=""
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    position: "absolute",
                                    inset: 0,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.2rem",
                                  }}
                                >
                                  {ev.flag}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Titre */}
                          <td className="aev-td" style={{ maxWidth: 280 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                color: "#141410",
                                fontSize: ".82rem",
                                lineHeight: 1.35,
                                marginBottom: ".25rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {ev.title}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".5rem",
                                fontSize: ".62rem",
                                color: "#928E80",
                              }}
                            >
                              {upcoming ? (
                                <span>
                                  <span className="aev-upcoming-dot" />
                                  Dans {days}j
                                </span>
                              ) : (
                                <span style={{ color: "#B8B4A8" }}>
                                  <span className="aev-past-dot" />
                                  Passé
                                </span>
                              )}
                              {ev.organizer && (
                                <>
                                  <span>·</span>
                                  <span>{ev.organizer}</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Type */}
                          <td className="aev-td aev-col-hide">
                            <TypePill type={ev.type} />
                          </td>

                          {/* Date */}
                          <td className="aev-td aev-col-hide-md">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".35rem",
                                fontSize: ".72rem",
                                color: upcoming ? "#38382E" : "#928E80",
                                fontWeight: upcoming ? 700 : 400,
                              }}
                            >
                              <IcoCal />
                              {formatDate(ev.event_date)}
                            </div>
                          </td>

                          {/* Lieu */}
                          <td className="aev-td aev-col-hide">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".3rem",
                                fontSize: ".72rem",
                                color: "#928E80",
                              }}
                            >
                              <IcoPin />
                              {ev.flag} {ev.location}
                            </div>
                          </td>

                          {/* Statut */}
                          <td className="aev-td aev-col-hide">
                            <StatusBadge published={ev.published} featured={ev.featured} />
                          </td>

                          {/* Toggle publié */}
                          <td
                            className="aev-td"
                            style={{ textAlign: "center" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="aev-toggle"
                              title={ev.published ? "Dépublier" : "Publier"}
                              disabled={isToggling || isDeleting}
                              onClick={() => togglePublished(ev)}
                              style={{
                                background: ev.published ? "#1A5C40" : "rgba(20,20,16,.15)",
                              }}
                            >
                              <span
                                className="aev-toggle-thumb"
                                style={{
                                  transform: ev.published ? "translateX(18px)" : "translateX(3px)",
                                }}
                              />
                            </button>
                          </td>

                          {/* Toggle vedette */}
                          <td
                            className="aev-td"
                            style={{ textAlign: "center" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="aev-action-btn"
                              title={ev.featured ? "Retirer vedette" : "Mettre en vedette"}
                              disabled={isToggling || isDeleting}
                              onClick={() => toggleFeatured(ev)}
                              style={{
                                color: ev.featured ? "#C08435" : "#928E80",
                                background: ev.featured ? "#FDF4E7" : "transparent",
                                borderColor: ev.featured ? "rgba(192,132,53,.25)" : "rgba(20,20,16,.1)",
                              }}
                            >
                              <IcoStar filled={ev.featured} />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="aev-td" onClick={(e) => e.stopPropagation()}>
                            <div
                              style={{
                                display: "flex",
                                gap: ".4rem",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Link
                                href={`/evenements/${ev.slug}?preview=1`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <button className="aev-action-btn" title="Prévisualiser">
                                  <IcoEye />
                                </button>
                              </Link>
                              <Link href={`/admin/evenements/${ev.id}`}>
                                <button
                                  className="aev-action-btn"
                                  title="Modifier"
                                  style={{
                                    color: "#1E4DA8",
                                    borderColor: "rgba(30,77,168,.2)",
                                    background: "rgba(30,77,168,.05)",
                                  }}
                                >
                                  <IcoEdit />
                                </button>
                              </Link>
                              <button
                                className="aev-action-btn"
                                title="Supprimer"
                                disabled={isDeleting || isToggling}
                                onClick={() => deleteEvent(ev)}
                                style={{
                                  color: "#B8341E",
                                  borderColor: "rgba(184,52,30,.2)",
                                  background: "rgba(184,52,30,.05)",
                                }}
                              >
                                {isDeleting ? (
                                  <span
                                    style={{
                                      width: 10,
                                      height: 10,
                                      border: "2px solid rgba(184,52,30,.3)",
                                      borderTopColor: "#B8341E",
                                      borderRadius: "50%",
                                      display: "inline-block",
                                      animation: "aev-spin .7s linear infinite",
                                    }}
                                  />
                                ) : (
                                  <IcoTrash />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "1.5rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <span style={{ fontSize: ".72rem", color: "#928E80" }}>
                Page {page} sur {totalPages} — {total} résultat{total !== 1 ? "s" : ""}
              </span>
              <div style={{ display: "flex", gap: ".35rem" }}>
                <button
                  className="aev-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      className={`aev-page-btn${page === pg ? " active" : ""}`}
                      onClick={() => setPage(pg)}
                    >
                      {pg}
                    </button>
                  );
                })}
                {totalPages > 7 && (
                  <>
                    <span style={{ padding: "0 .2rem", color: "#928E80" }}>…</span>
                    <button
                      className={`aev-page-btn${page === totalPages ? " active" : ""}`}
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  className="aev-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modale de confirmation par mot de passe pour suppression */}
      <PasswordConfirmModal
        isOpen={!!pwdModal}
        onClose={() => setPwdModal(null)}
        onConfirm={async (password) => {
          if (!pwdModal) return;
          await confirmDeleteWithPassword(password, pwdModal.eventId);
          setPwdModal(null);
        }}
        title={`Supprimer "${pwdModal?.eventTitle}" ?`}
        message="Cette action est irréversible. Confirmez votre mot de passe administrateur."
        actionLabel="Supprimer définitivement"
      />

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            background: toast.ok ? "#141410" : "#B8341E",
            color: "#F8F6F1",
            padding: ".85rem 1.4rem",
            borderRadius: 12,
            fontSize: ".82rem",
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(20,20,16,.25)",
            animation: "aev-toast-slide .25s ease",
          }}
        >
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes aev-toast-slide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </>
  );
}