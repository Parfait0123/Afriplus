"use client";

/**
 * components/ui/AdminModal.tsx
 * Modale générique réutilisable — design luxueux AfriPulse
 *
 * Usage :
 *   <AdminModal
 *     open={open}
 *     title="Envoyer une campagne"
 *     size="md"
 *     onClose={() => setOpen(false)}
 *   >
 *     <p>Contenu de la modale</p>
 *   </AdminModal>
 */

import { useEffect, useState } from "react";

interface AdminModalProps {
  open:       boolean;
  title:      string;
  subtitle?:  string;
  size?:      "sm" | "md" | "lg" | "xl";
  onClose:    () => void;
  children:   React.ReactNode;
  footer?:    React.ReactNode;
  noPadding?: boolean;
}

const SIZE_MAP = {
  sm: 420,
  md: 560,
  lg: 720,
  xl: 920,
};

const IcoClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export function AdminModal({
  open, title, subtitle, size = "md",
  onClose, children, footer, noPadding = false,
}: AdminModalProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      const t = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = "";
      }, 300);
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onClose]);

  if (!mounted) return null;

  const maxW = SIZE_MAP[size];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(10,8,0,.8)",
          backdropFilter: "blur(12px)",
          opacity: visible ? 1 : 0,
          transition: "opacity .25s ease",
        }}
      />

      {/* Modale */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 1001,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1.5rem",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "linear-gradient(145deg, #1e1c16 0%, #161410 60%, #0e0c0a 100%)",
            border: "1px solid rgba(248,246,241,.08)",
            borderRadius: 24,
            width: "100%",
            maxWidth: maxW,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 40px 100px rgba(0,0,0,.7), 0 10px 30px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06)",
            pointerEvents: "all",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
            transition: "opacity .3s cubic-bezier(.16,1,.3,1), transform .3s cubic-bezier(.16,1,.3,1)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "1.5rem 1.75rem",
            borderBottom: "1px solid rgba(248,246,241,.07)",
            display: "flex", alignItems: "center", gap: "1rem",
            flexShrink: 0,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "1.15rem", fontWeight: 900,
                letterSpacing: "-0.025em",
                color: "#F8F6F1", margin: 0, lineHeight: 1.2,
              }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{
                  fontSize: "0.78rem", color: "rgba(248,246,241,.35)",
                  margin: "0.3rem 0 0", lineHeight: 1.5,
                }}>
                  {subtitle}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                flexShrink: 0, width: 34, height: 34,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 10,
                background: "rgba(248,246,241,.06)",
                border: "1px solid rgba(248,246,241,.09)",
                color: "rgba(248,246,241,.4)",
                cursor: "pointer", transition: "all .15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,246,241,.12)";
                (e.currentTarget as HTMLButtonElement).style.color = "#F8F6F1";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,246,241,.06)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(248,246,241,.4)";
              }}
            >
              <IcoClose />
            </button>
          </div>

          {/* Corps */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: noPadding ? 0 : "1.75rem",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(192,132,53,.2) transparent",
          }}>
            {children}
          </div>

          {/* Footer optionnel */}
          {footer && (
            <div style={{
              padding: "1.25rem 1.75rem",
              borderTop: "1px solid rgba(248,246,241,.07)",
              flexShrink: 0,
            }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}