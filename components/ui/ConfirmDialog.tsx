"use client";

/**
 * components/ui/ConfirmDialog.tsx
 * Dialogue de confirmation avant action destructive
 *
 * Usage :
 *   <ConfirmDialog
 *     open={confirmOpen}
 *     title="Supprimer cet article ?"
 *     message="Cette action est irréversible."
 *     confirmLabel="Supprimer"
 *     variant="danger"
 *     onConfirm={handleDelete}
 *     onCancel={() => setConfirmOpen(false)}
 *   />
 */

import { useEffect, useState } from "react";

interface ConfirmDialogProps {
  open:          boolean;
  title:         string;
  message?:      string;
  confirmLabel?: string;
  cancelLabel?:  string;
  variant?:      "danger" | "warning" | "default";
  loading?:      boolean;
  onConfirm:     () => void | Promise<void>;
  onCancel:      () => void;
}

const IcoTrash = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);
const IcoWarning = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const VARIANT_CONFIG = {
  danger: {
    iconBg:    "rgba(184,52,30,.15)",
    iconColor: "#E05A3A",
    icon:      <IcoTrash />,
    btnBg:     "#B8341E",
    btnHover:  "#9A2A16",
    btnShadow: "rgba(184,52,30,.4)",
  },
  warning: {
    iconBg:    "rgba(192,132,53,.15)",
    iconColor: "#C08435",
    icon:      <IcoWarning />,
    btnBg:     "#C08435",
    btnHover:  "#A06E2A",
    btnShadow: "rgba(192,132,53,.4)",
  },
  default: {
    iconBg:    "rgba(192,132,53,.15)",
    iconColor: "#C08435",
    icon:      <IcoWarning />,
    btnBg:     "#141410",
    btnHover:  "#2a2a24",
    btnShadow: "rgba(20,20,16,.4)",
  },
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel  = "Annuler",
  variant      = "danger",
  loading      = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cfg = VARIANT_CONFIG[variant];

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Fermer avec Escape
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, loading, onCancel]);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => !loading && onCancel()}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(10,8,0,.85)",
          backdropFilter: "blur(8px)",
          opacity: visible ? 1 : 0,
          transition: "opacity .25s ease",
        }}
      />

      {/* Dialog */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1.5rem",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "linear-gradient(145deg, #1c1a14 0%, #141410 60%, #0e0c08 100%)",
            border: "1px solid rgba(248,246,241,.08)",
            borderRadius: 24,
            padding: "2rem",
            width: "100%",
            maxWidth: 420,
            boxShadow: "0 32px 80px rgba(0,0,0,.7), 0 8px 24px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06)",
            pointerEvents: "all",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
            transition: "opacity .3s cubic-bezier(.16,1,.3,1), transform .3s cubic-bezier(.16,1,.3,1)",
          }}
        >
          {/* Icône */}
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: cfg.iconBg,
            border: `1px solid ${cfg.iconColor}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: cfg.iconColor,
            marginBottom: "1.25rem",
          }}>
            {cfg.icon}
          </div>

          {/* Titre */}
          <h3 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "1.2rem", fontWeight: 900,
            letterSpacing: "-0.025em",
            color: "#F8F6F1", marginBottom: "0.6rem",
          }}>
            {title}
          </h3>

          {/* Message */}
          {message && (
            <p style={{
              fontSize: "0.85rem", color: "rgba(248,246,241,.45)",
              lineHeight: 1.7, marginBottom: "1.75rem",
            }}>
              {message}
            </p>
          )}

          {!message && <div style={{ marginBottom: "1.75rem" }} />}

          {/* Séparateur */}
          <div style={{ height: 1, background: "rgba(248,246,241,.06)", marginBottom: "1.5rem" }} />

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {/* Annuler */}
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1, padding: "0.8rem 1.25rem",
                borderRadius: 12,
                background: "rgba(248,246,241,.06)",
                border: "1px solid rgba(248,246,241,.1)",
                color: "rgba(248,246,241,.65)",
                fontSize: "0.85rem", fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                transition: "all .18s",
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,246,241,.1)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#F8F6F1";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,246,241,.06)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(248,246,241,.65)";
              }}
            >
              {cancelLabel}
            </button>

            {/* Confirmer */}
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                flex: 1, padding: "0.8rem 1.25rem",
                borderRadius: 12,
                background: cfg.btnBg,
                border: "none",
                color: "#fff",
                fontSize: "0.85rem", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                transition: "all .18s",
                opacity: loading ? 0.7 : 1,
                boxShadow: loading ? "none" : `0 4px 16px ${cfg.btnShadow}`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              }}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.background = cfg.btnHover;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = cfg.btnBg;
                (e.currentTarget as HTMLButtonElement).style.transform = "none";
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 14, height: 14, border: "2px solid rgba(255,255,255,.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "confirm-spin .7s linear infinite",
                    display: "inline-block",
                  }} />
                  En cours…
                </>
              ) : confirmLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confirm-spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}