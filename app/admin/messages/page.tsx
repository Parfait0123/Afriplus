"use client";

/**
 * app/admin/messages/page.tsx
 * Gestion des messages de contact — design luxueux style événements/bourses
 * Fonctionnalités : listing, pagination, recherche, marquer lu/non lu, suppression,
 * modale de lecture avec détails, actions bulk
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/* ── Types ── */
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface Stats {
  total: number;
  read: number;
  unread: number;
}

const SUBJECT_LABELS: Record<string, string> = {
  partenariat: "🤝 Partenariat / Collaboration",
  bourse: "🎓 Signaler ou proposer une bourse",
  opportunite: "💼 Proposer une opportunité",
  evenement: "📅 Proposer un événement",
  erreur: "⚠️ Signaler une erreur",
  presse: "📰 Demande presse / média",
  technique: "🔧 Problème technique",
  autre: "💬 Autre",
};

const PAGE_SIZE = 15;

/* ── Icônes modernisées ── */
const IcoRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);

const IcoSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// Icône enveloppe luxueuse
const IcoMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 6L12 13L2 6" />
    <path d="M22 6V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V6" />
    <path d="M2 8L9 13" strokeWidth="1.2" />
    <path d="M22 8L15 13" strokeWidth="1.2" />
    <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const IcoChevL = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IcoChevR = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IcoClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IcoMarkRead = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IcoMarkUnread = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IcoArrowBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

/* ── Composants de style ── */
function SubjectPill({ subject }: { subject: string }) {
  const label = SUBJECT_LABELS[subject] || subject;
  const color = subject === "partenariat" ? "#C08435" :
                subject === "bourse" ? "#1A5C40" :
                subject === "opportunite" ? "#1E4DA8" :
                subject === "evenement" ? "#7A1E4A" :
                subject === "erreur" ? "#B8341E" :
                subject === "presse" ? "#5A7FD4" :
                subject === "technique" ? "#2D6B6B" : "#928E80";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.6rem",
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "0.22rem 0.75rem",
        borderRadius: 100,
        background: `${color}14`,
        color: color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      {label.length > 30 ? label.slice(0, 27) + "…" : label}
    </span>
  );
}

function StatusBadge({ read }: { read: boolean }) {
  if (!read)
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
        Non lu
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
      Lu
    </span>
  );
}

/* ── Modale de lecture du message améliorée ── */
function MessageModal({
  message,
  onClose,
  onMarkRead,
  onMarkUnread,
  onDelete,
}: {
  message: ContactMessage | null;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  if (!message) return null;

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement ce message ? Cette action est irréversible.")) return;
    setDeleting(true);
    await onDelete(message.id);
    setDeleting(false);
    onClose();
  };

  const formatFullDate = (date: string) => {
    return new Date(date).toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="msg-modal-overlay" onClick={onClose}>
      <div className="msg-modal-container">
        <div className="msg-modal" onClick={(e) => e.stopPropagation()}>
          {/* En-tête avec déco */}
          <div className="msg-modal-accent" />
          
          <div className="msg-modal-header">
            <div className="msg-modal-title-wrapper">
              <div className="msg-modal-icon-bg">
                <IcoMail />
              </div>
              <div>
                <div className="msg-modal-badge">
                  {message.read ? "Message lu" : "Nouveau message"}
                </div>
                <h2 className="msg-modal-title">
                  {message.subject === "partenariat" && "Proposition de partenariat"}
                  {message.subject === "bourse" && "Signalement / Proposition de bourse"}
                  {message.subject === "opportunite" && "Proposition d'opportunité"}
                  {message.subject === "evenement" && "Proposition d'événement"}
                  {message.subject === "erreur" && "Signalement d'erreur"}
                  {message.subject === "presse" && "Demande presse"}
                  {message.subject === "technique" && "Problème technique"}
                  {message.subject === "autre" && "Autre demande"}
                </h2>
              </div>
            </div>
            <button className="msg-modal-close" onClick={onClose}>
              <IcoClose />
            </button>
          </div>

          {/* Métadonnées */}
          <div className="msg-modal-meta">
            <div className="msg-meta-grid">
              <div className="msg-meta-card">
  <span className="msg-meta-icon">👤</span>
  <div>
    <div className="msg-meta-label">Expéditeur</div>
    <div className="msg-meta-value">{message.name}</div>
    <a 
      href={`mailto:${message.email}?subject=Re: ${message.subject}`}
      className="msg-meta-sub-link"
      onClick={(e) => e.stopPropagation()}
    >
      {message.email}
    </a>
  </div>
</div>
              <div className="msg-meta-card">
                <span className="msg-meta-icon">📅</span>
                <div>
                  <div className="msg-meta-label">Date d'envoi</div>
                  <div className="msg-meta-value">{formatFullDate(message.created_at)}</div>
                </div>
              </div>
              <div className="msg-meta-card">
                <span className="msg-meta-icon">🏷️</span>
                <div>
                  <div className="msg-meta-label">Catégorie</div>
                  <div className="msg-meta-value">
                    <SubjectPill subject={message.subject} />
                  </div>
                </div>
              </div>
              <div className="msg-meta-card">
                <span className="msg-meta-icon">📬</span>
                <div>
                  <div className="msg-meta-label">Statut</div>
                  <div className="msg-meta-value">
                    <StatusBadge read={message.read} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="msg-modal-content">
            <div className="msg-modal-message-wrapper">
              <div className="msg-modal-message-label">
                <span>✉️</span> Message
              </div>
              <div className="msg-modal-message">
                {message.message}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="msg-modal-actions">
            {!message.read ? (
              <button className="msg-modal-btn msg-modal-btn-primary" onClick={() => onMarkRead(message.id)}>
                <IcoMarkRead /> Marquer comme lu
              </button>
            ) : (
              <button className="msg-modal-btn msg-modal-btn-secondary" onClick={() => onMarkUnread(message.id)}>
                <IcoMarkUnread /> Marquer comme non lu
              </button>
            )}
            <button className="msg-modal-btn msg-modal-btn-danger" onClick={handleDelete} disabled={deleting}>
              <IcoTrash /> {deleting ? "Suppression..." : "Supprimer"}
            </button>
            <button className="msg-modal-btn msg-modal-btn-outline" onClick={onClose}>
              <IcoArrowBack /> Retour
            </button>
          </div>
        </div>
      </div>

     <style jsx>{`
  .msg-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(20, 20, 16, 0.75);
    backdrop-filter: blur(12px);
    z-index: 9900;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .msg-modal-container {
    max-width: 1000px;
    width: 100%;
    height: 92vh;
    display: flex;
    flex-direction: column;
  }
  .msg-modal {
    background: #fff;
    border-radius: 32px;
    box-shadow: 0 40px 80px rgba(20, 20, 16, 0.3);
    animation: msg-modal-in 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .msg-modal-accent {
    height: 4px;
    background: linear-gradient(90deg, #C08435, #E8B86D, #C08435);
    flex-shrink: 0;
  }
    .msg-meta-sub-link {
  font-size: 0.7rem;
  color: #C08435;
  margin-top: 0.15rem;
  text-decoration: none;
  display: inline-block;
  transition: color 0.15s;
}
.msg-meta-sub-link:hover {
  color: #a8722d;
  text-decoration: underline;
}
  .msg-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem 1.5rem;
    background: #FAFAF8;
    border-bottom: 1px solid rgba(20, 20, 16, 0.06);
    flex-shrink: 0;
  }
  .msg-modal-title-wrapper {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  .msg-modal-icon-bg {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #C08435, #E8B86D);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 4px 12px rgba(192, 132, 53, 0.25);
  }
  .msg-modal-badge {
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #C08435;
    margin-bottom: 0.2rem;
  }
  .msg-modal-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 1.1rem;
    font-weight: 900;
    color: #141410;
    margin: 0;
    line-height: 1.3;
  }
  .msg-modal-close {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: transparent;
    border: 1px solid rgba(20, 20, 16, 0.1);
    cursor: pointer;
    color: #928E80;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.18s;
  }
  .msg-modal-close:hover {
    background: rgba(20, 20, 16, 0.05);
    color: #141410;
  }
  .msg-modal-meta {
    padding: 0.75rem 1.5rem;
    background: #fff;
    flex-shrink: 0;
  }
  .msg-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
  }
  .msg-meta-card {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.5rem 0.8rem;
    background: #F8F6F1;
    border-radius: 12px;
    border: 1px solid rgba(20, 20, 16, 0.05);
  }
  .msg-meta-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }
  .msg-meta-label {
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #928E80;
    margin-bottom: 0.1rem;
  }
  .msg-meta-value {
    font-size: 0.75rem;
    font-weight: 600;
    color: #141410;
  }
  .msg-meta-sub {
    font-size: 0.6rem;
    color: #928E80;
    margin-top: 0.1rem;
  }
  .msg-modal-content {
    padding: 0 1.5rem;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .msg-modal-message-wrapper {
    background: #F8F6F1;
    border-radius: 16px;
    border: 1px solid rgba(20, 20, 16, 0.06);
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
  }
  .msg-modal-message-label {
    padding: 0.6rem 1.2rem;
    background: #F0EDE4;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #928E80;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    border-bottom: 1px solid rgba(20, 20, 16, 0.06);
    flex-shrink: 0;
  }
  .msg-modal-message {
    padding: 1.2rem;
    font-size: 0.9rem;
    line-height: 1.7;
    color: #38382E;
    white-space: pre-wrap;
    word-break: break-word;
    flex: 1;
    overflow-y: auto;
  }
  .msg-modal-actions {
    padding: 0.8rem 1.5rem;
    border-top: 1px solid rgba(20, 20, 16, 0.06);
    display: flex;
    gap: 0.6rem;
    justify-content: flex-end;
    background: #FAFAF8;
    flex-shrink: 0;
  }
  .msg-modal-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s;
    border: none;
    font-family: inherit;
  }
  .msg-modal-btn-primary {
    background: #C08435;
    color: #fff;
  }
  .msg-modal-btn-primary:hover {
    background: #a8722d;
    transform: translateY(-1px);
  }
  .msg-modal-btn-secondary {
    background: #F0EDE4;
    color: #38382E;
  }
  .msg-modal-btn-secondary:hover {
    background: #E0DCD0;
  }
  .msg-modal-btn-danger {
    background: #FAEBE8;
    color: #B8341E;
  }
  .msg-modal-btn-danger:hover {
    background: #F5D5CF;
  }
  .msg-modal-btn-outline {
    background: transparent;
    color: #928E80;
    border: 1px solid rgba(20, 20, 16, 0.15);
  }
  .msg-modal-btn-outline:hover {
    background: rgba(20, 20, 16, 0.05);
    color: #38382E;
  }
  @keyframes msg-modal-in {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(20px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @media (max-width: 640px) {
    .msg-modal-header,
    .msg-modal-meta,
    .msg-modal-content,
    .msg-modal-actions {
      padding-left: 1rem;
      padding-right: 1rem;
    }
    .msg-meta-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
    .msg-modal-title-wrapper {
      flex-direction: column;
      align-items: flex-start;
    }
    .msg-modal-actions {
      flex-wrap: wrap;
    }
    .msg-modal-container {
      height: 95vh;
    }
  }
`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE (conserve le reste inchangé)
══════════════════════════════════════════════════════════ */
export default function AdminMessagesPage() {
  const sb = createClient();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats>({ total: 0, read: 0, unread: 0 });
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Chargement des messages ── */
  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      let query = sb
        .from("contact_messages")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (search.trim()) {
        query = query.or(
          `name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,message.ilike.%${search.trim()}%`
        );
      }
      if (filterStatus === "read") {
        query = query.eq("read", true);
      } else if (filterStatus === "unread") {
        query = query.eq("read", false);
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = page * PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (!error && data) {
        setMessages(data as ContactMessage[]);
        setTotal(count ?? 0);
      }
    } catch (err) {
      console.error("Erreur chargement messages:", err);
    } finally {
      setLoading(false);
    }
  }, [sb, search, filterStatus, page]);

  /* ── Chargement des stats ── */
  const loadStats = useCallback(async () => {
    try {
      const [{ count: total }, { count: read }] = await Promise.all([
        sb.from("contact_messages").select("id", { count: "exact", head: true }),
        sb.from("contact_messages").select("id", { count: "exact", head: true }).eq("read", true),
      ]);
      setStats({
        total: total ?? 0,
        read: read ?? 0,
        unread: (total ?? 0) - (read ?? 0),
      });
    } catch (err) {
      console.error("Erreur chargement stats:", err);
    }
  }, [sb]);

  useEffect(() => {
    loadMessages();
    loadStats();
  }, [loadMessages, loadStats]);

  /* ── Marquer comme lu ── */
  const markAsRead = async (id: string) => {
    setUpdating(id);
    try {
      const { error } = await (sb.from("contact_messages") as any).update({ read: true }).eq("id", id);
      if (!error) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, read: true } : m))
        );
        loadStats();
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, read: true });
        }
        showToast("Message marqué comme lu");
      }
    } finally {
      setUpdating(null);
    }
  };

  /* ── Marquer comme non lu ── */
  const markAsUnread = async (id: string) => {
    setUpdating(id);
    try {
      const { error } = await (sb.from("contact_messages") as any).update({ read: false }).eq("id", id);
      if (!error) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, read: false } : m))
        );
        loadStats();
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, read: false });
        }
        showToast("Message marqué comme non lu");
      }
    } finally {
      setUpdating(null);
    }
  };

  /* ── Supprimer un message ── */
  const deleteMessage = async (id: string) => {
    if (!confirm("Supprimer définitivement ce message ? Cette action est irréversible.")) return;
    setDeleting(id);
    try {
      const { error } = await sb.from("contact_messages").delete().eq("id", id);
      if (!error) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setTotal((t) => t - 1);
        loadStats();
        showToast("Message supprimé");
      }
    } finally {
      setDeleting(null);
    }
  };

  /* ── Actions bulk ── */
  const bulkMarkAsRead = async () => {
    const ids = Array.from(selected);
    setUpdating("bulk");
    try {
      const { error } = await (sb.from("contact_messages") as any).update({ read: true }).in("id", ids);
      if (!error) {
        setMessages((prev) =>
          prev.map((m) => (ids.includes(m.id) ? { ...m, read: true } : m))
        );
        loadStats();
        setSelected(new Set());
        showToast(`${ids.length} message(s) marqué(s) comme lu`);
      }
    } finally {
      setUpdating(null);
    }
  };

  const bulkMarkAsUnread = async () => {
    const ids = Array.from(selected);
    setUpdating("bulk");
    try {
      const { error } = await (sb.from("contact_messages") as any).update({ read: false }).in("id", ids);
      if (!error) {
        setMessages((prev) =>
          prev.map((m) => (ids.includes(m.id) ? { ...m, read: false } : m))
        );
        loadStats();
        setSelected(new Set());
        showToast(`${ids.length} message(s) marqué(s) comme non lu`);
      }
    } finally {
      setUpdating(null);
    }
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (!confirm(`Supprimer définitivement ${ids.length} message(s) ? Cette action est irréversible.`)) return;
    setDeleting("bulk");
    try {
      const { error } = await sb.from("contact_messages").delete().in("id", ids);
      if (!error) {
        setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
        setTotal((t) => t - ids.length);
        loadStats();
        setSelected(new Set());
        showToast(`${ids.length} message(s) supprimé(s)`);
      }
    } finally {
      setDeleting(null);
    }
  };

  /* ── Sélection ── */
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === messages.length) setSelected(new Set());
    else setSelected(new Set(messages.map((m) => m.id)));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        .msg-wrap { max-width: 1380px; margin: 0 auto; padding: 0 clamp(1rem,3vw,2.5rem); }
        .msg-btn-global {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .55rem 1.1rem; border-radius: 10px; border: none; cursor: pointer;
          font-size: .72rem; font-weight: 700; letter-spacing: .04em; transition: all .18s;
        }
        .msg-btn-global:disabled { opacity: .5; cursor: not-allowed; }
        .msg-btn-primary { background: #141410; color: #F8F6F1; }
        .msg-btn-primary:hover:not(:disabled) { background: #2a2a20; }
        .msg-btn-ghost {
          background: transparent; color: #928E80;
          border: 1px solid rgba(20,20,16,.12);
        }
        .msg-btn-ghost:hover:not(:disabled) { background: rgba(20,20,16,.05); color: #38382E; }
        .msg-input {
          width: 100%; padding: .6rem .9rem; border-radius: 10px;
          border: 1px solid rgba(20,20,16,.12); background: #fff;
          font-size: .8rem; color: #38382E; outline: none;
          transition: border .18s;
        }
        .msg-input:focus { border-color: #C08435; }
        .msg-select {
          padding: .55rem .85rem; border-radius: 10px;
          border: 1px solid rgba(20,20,16,.12); background: #fff;
          font-size: .75rem; color: #38382E; outline: none; cursor: pointer;
        }
        .msg-select:focus { border-color: #C08435; }
        .msg-table-wrap {
          background: #fff; border-radius: 16px;
          border: 1px solid rgba(20,20,16,.08);
          overflow: hidden; box-shadow: 0 2px 24px rgba(20,20,16,.05);
        }
        .msg-table { width: 100%; border-collapse: collapse; }
        .msg-th {
          padding: .75rem 1rem; text-align: left;
          font-size: .58rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
          color: #928E80; background: #FAFAF8;
          border-bottom: 1px solid rgba(20,20,16,.07);
          white-space: nowrap;
        }
        .msg-td {
          padding: .85rem 1rem; vertical-align: middle;
          border-bottom: 1px solid rgba(20,20,16,.055);
          font-size: .78rem; color: #38382E;
        }
        .msg-row { transition: background .15s; cursor: pointer; }
        .msg-row:hover { background: #FAFAF8; }
        .msg-row:last-child .msg-td { border-bottom: none; }
        .msg-action-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(20,20,16,.1);
          background: transparent; cursor: pointer; transition: all .18s; color: #928E80;
        }
        .msg-action-btn:hover { background: rgba(20,20,16,.06); color: #38382E; }
        .msg-action-btn:disabled { opacity: .4; cursor: not-allowed; }
        .msg-page-btn {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 32px; height: 32px; padding: 0 .4rem; border-radius: 8px;
          border: 1px solid rgba(20,20,16,.12); background: transparent;
          font-size: .72rem; font-weight: 600; color: #38382E; cursor: pointer;
          transition: all .15s;
        }
        .msg-page-btn:hover { background: rgba(20,20,16,.06); }
        .msg-page-btn.active { background: #141410; color: #fff; border-color: #141410; }
        .msg-page-btn:disabled { opacity: .35; cursor: not-allowed; }
        .msg-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid rgba(20,20,16,.08); border-top-color: #C08435;
          animation: msg-spin .8s linear infinite; margin: 0 auto 1rem;
        }
        @keyframes msg-spin { to { transform: rotate(360deg); } }
        .msg-bulk-bar {
          background: #141410; border-radius: 12px; padding: .85rem 1.4rem;
          margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;
          box-shadow: 0 4px 16px rgba(20,20,16,.2); animation: msg-slide .2s ease;
        }
        @keyframes msg-slide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        @media (max-width: 900px) {
          .msg-col-hide { display: none; }
        }
        @media (max-width: 640px) {
          .msg-col-hide-sm { display: none; }
        }
      `}</style>

      <div style={{ background: "#F5F3EE", minHeight: "100vh", paddingBottom: "4rem" }}>
        {/* ── En-tête ── */}
        <div style={{ background: "#141410", borderBottom: "3px solid #C08435", padding: "2rem 0 1.75rem" }}>
          <div className="msg-wrap">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: ".5rem" }}>
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
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(248,246,241,.7)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248,246,241,.35)")}
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
                    Messages
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
                  Messages de contact
                </h1>
                <p style={{ fontSize: ".75rem", color: "rgba(248,246,241,.4)", marginTop: ".35rem" }}>
                  {stats.total} message{stats.total !== 1 ? "s" : ""} au total
                </p>
              </div>
              <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
                <button
                  className="msg-btn-global msg-btn-ghost"
                  style={{ color: "rgba(248,246,241,.6)", borderColor: "rgba(248,246,241,.15)" }}
                  onClick={() => { loadMessages(); loadStats(); }}
                >
                  <IcoRefresh /> Actualiser
                </button>
              </div>
            </div>

            {/* Stats cards */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
              {[
                { label: "Total", value: stats.total, color: "#F8F6F1", sub: "messages" },
                { label: "Non lus", value: stats.unread, color: "#C08435", sub: "à traiter" },
                { label: "Lus", value: stats.read, color: "#6FCF97", sub: "traités" },
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

        {/* ── Filtres ── */}
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
          <div className="msg-wrap">
            <div style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: "1", minWidth: "220px", maxWidth: "380px" }}>
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
                  className="msg-input"
                  style={{ paddingLeft: "2.2rem" }}
                  placeholder="Rechercher par nom, email ou contenu..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <select
                className="msg-select"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as typeof filterStatus);
                  setPage(1);
                }}
              >
                <option value="all">Tous les messages</option>
                <option value="unread">Non lus</option>
                <option value="read">Lus</option>
              </select>

              {(search || filterStatus !== "all") && (
                <button
                  className="msg-btn-global msg-btn-ghost"
                  onClick={() => {
                    setSearch("");
                    setFilterStatus("all");
                    setPage(1);
                  }}
                >
                  ✕ Réinitialiser
                </button>
              )}

              <div style={{ marginLeft: "auto", fontSize: ".72rem", color: "#928E80", whiteSpace: "nowrap" }}>
                {total} résultat{total !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* ── Corps ── */}
        <div className="msg-wrap" style={{ paddingTop: "1.75rem" }}>
          {/* Bulk actions bar */}
          {selected.size > 0 && (
            <div className="msg-bulk-bar">
              <span style={{ fontSize: ".78rem", fontWeight: 700, color: "#C08435" }}>
                {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
              </span>
              <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.1)" }} />
              <button
                onClick={bulkMarkAsRead}
                disabled={updating === "bulk"}
                style={{
                  fontFamily: "inherit",
                  fontSize: ".75rem",
                  fontWeight: 600,
                  color: "#1A5C40",
                  background: "rgba(26,92,64,.12)",
                  border: "none",
                  padding: ".38rem .85rem",
                  borderRadius: 100,
                  cursor: "pointer",
                }}
              >
                Marquer comme lu
              </button>
              <button
                onClick={bulkMarkAsUnread}
                disabled={updating === "bulk"}
                style={{
                  fontFamily: "inherit",
                  fontSize: ".75rem",
                  fontWeight: 600,
                  color: "#C08435",
                  background: "rgba(192,132,53,.12)",
                  border: "none",
                  padding: ".38rem .85rem",
                  borderRadius: 100,
                  cursor: "pointer",
                }}
              >
                Marquer comme non lu
              </button>
              <button
                onClick={bulkDelete}
                disabled={deleting === "bulk"}
                style={{
                  fontFamily: "inherit",
                  fontSize: ".75rem",
                  fontWeight: 600,
                  color: "#C25B3F",
                  background: "rgba(194,91,63,.12)",
                  border: "none",
                  padding: ".38rem .85rem",
                  borderRadius: 100,
                  cursor: "pointer",
                }}
              >
                Supprimer
              </button>
              <button
                onClick={() => setSelected(new Set())}
                style={{
                  marginLeft: "auto",
                  fontFamily: "inherit",
                  fontSize: ".72rem",
                  color: "rgba(255,255,255,.4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
            </div>
          )}

          {/* Tableau */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <div className="msg-spinner" />
              <p style={{ color: "#928E80", fontSize: ".8rem" }}>Chargement des messages…</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "3rem", color: "rgba(20,20,16,.1)", marginBottom: ".5rem" }}>📭</div>
              <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.4rem", color: "rgba(20,20,16,.2)", fontWeight: 900 }}>
                Aucun message trouvé
              </p>
              <p style={{ color: "#928E80", fontSize: ".8rem", marginTop: ".4rem" }}>
                {search || filterStatus !== "all"
                  ? "Essayez de modifier vos filtres de recherche."
                  : "Les messages de contact apparaîtront ici."}
              </p>
            </div>
          ) : (
            <div className="msg-table-wrap" style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "800px" }}>
                <table className="msg-table">
                  <thead>
                    <tr>
                      <th className="msg-th" style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          checked={selected.size > 0 && selected.size === messages.length}
                          ref={(el) => {
                            if (el) el.indeterminate = selected.size > 0 && selected.size < messages.length;
                          }}
                          onChange={toggleAll}
                          style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#C08435" }}
                        />
                      </th>
                      <th className="msg-th" style={{ width: 40 }}></th>
                      <th className="msg-th">Expéditeur</th>
                      <th className="msg-th msg-col-hide">Sujet</th>
                      <th className="msg-th msg-col-hide-sm">Message</th>
                      <th className="msg-th">Date</th>
                      <th className="msg-th">Statut</th>
                      <th className="msg-th" style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => {
                      const isSelected = selected.has(msg.id);
                      const isUpdating = updating === msg.id;
                      const isDeleting = deleting === msg.id;
                      return (
                        <tr
                          key={msg.id}
                          className="msg-row"
                          onClick={() => setSelectedMessage(msg)}
                          style={{ background: isSelected ? "rgba(192,132,53,.03)" : "transparent" }}
                        >
                          <td className="msg-td" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              onClick={(e) => toggleSelect(msg.id, e as any)}
                              style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#C08435" }}
                            />
                          </td>
                          <td className="msg-td" onClick={(e) => e.stopPropagation()}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 10,
                                background: msg.read ? "#F0EDE4" : "#C08435",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: msg.read ? "#928E80" : "#fff",
                              }}
                            >
                              <IcoMail />
                            </div>
                          </td>
                          <td className="msg-td">
                            <div>
                              <div style={{ fontWeight: 700, color: "#141410", fontSize: ".82rem" }}>
                                {msg.name}
                              </div>
                              <div style={{ fontSize: ".62rem", color: "#928E80" }}>{msg.email}</div>
                            </div>
                          </td>
                          <td className="msg-td msg-col-hide">
                            <SubjectPill subject={msg.subject} />
                          </td>
                          <td className="msg-td msg-col-hide-sm">
                            <div
                              style={{
                                maxWidth: 280,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: msg.read ? "#928E80" : "#38382E",
                                fontWeight: msg.read ? 400 : 500,
                              }}
                            >
                              {msg.message.length > 60 ? msg.message.slice(0, 60) + "…" : msg.message}
                            </div>
                          </td>
                          <td className="msg-td">
                            <div style={{ fontSize: ".7rem", color: "#928E80" }}>
                              {formatDate(msg.created_at)}
                              <br />
                              <span style={{ fontSize: ".6rem" }}>{formatTime(msg.created_at)}</span>
                            </div>
                          </td>
                          <td className="msg-td">
                            <StatusBadge read={msg.read} />
                          </td>
                          <td className="msg-td" onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: ".4rem", justifyContent: "flex-end" }}>
                              <button
                                className="msg-action-btn"
                                title={msg.read ? "Marquer comme non lu" : "Marquer comme lu"}
                                disabled={isUpdating}
                                onClick={() => msg.read ? markAsUnread(msg.id) : markAsRead(msg.id)}
                                style={{
                                  color: msg.read ? "#C08435" : "#1A5C40",
                                  background: msg.read ? "rgba(192,132,53,.08)" : "rgba(26,92,64,.08)",
                                }}
                              >
                                {msg.read ? <IcoMarkUnread /> : <IcoMarkRead />}
                              </button>
                              <button
                                className="msg-action-btn"
                                title="Voir le message"
                                onClick={() => setSelectedMessage(msg)}
                              >
                                <IcoEye />
                              </button>
                              <button
                                className="msg-action-btn"
                                title="Supprimer"
                                disabled={isDeleting}
                                onClick={() => deleteMessage(msg.id)}
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
                                      animation: "msg-spin .7s linear infinite",
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <span style={{ fontSize: ".72rem", color: "#928E80" }}>
                Page {page} sur {totalPages} — {total} message{total !== 1 ? "s" : ""}
              </span>
              <div style={{ display: "flex", gap: ".35rem" }}>
                <button className="msg-page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pg: number;
                  if (totalPages <= 7) pg = i + 1;
                  else if (page <= 4) pg = i + 1;
                  else if (page >= totalPages - 3) pg = totalPages - 6 + i;
                  else pg = page - 3 + i;
                  return (
                    <button key={pg} className={`msg-page-btn ${page === pg ? "active" : ""}`} onClick={() => setPage(pg)}>
                      {pg}
                    </button>
                  );
                })}
                {totalPages > 7 && page <= totalPages - 4 && (
                  <>
                    <span style={{ padding: "0 .2rem", color: "#928E80" }}>…</span>
                    <button className={`msg-page-btn ${page === totalPages ? "active" : ""}`} onClick={() => setPage(totalPages)}>
                      {totalPages}
                    </button>
                  </>
                )}
                <button className="msg-page-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modale de lecture du message améliorée */}
      <MessageModal
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onMarkRead={markAsRead}
        onMarkUnread={markAsUnread}
        onDelete={async (id) => {
          await deleteMessage(id);
          setSelectedMessage(null);
        }}
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
            animation: "msg-toast-slide .25s ease",
          }}
        >
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes msg-toast-slide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </>
  );
}