"use client";

/**
 * components/ui/Toast.tsx
 * Système de notifications — design luxueux AfriPulse
 *
 * Usage dans app/admin/layout.tsx :
 *   <ToastProvider>
 *     {children}
 *     <ToastContainer />
 *   </ToastProvider>
 *
 * Puis dans n'importe quel composant enfant :
 *   const { toast } = useToast()
 *   toast.success("Article publié !")
 */

import { useEffect, useState, useCallback } from "react";
import { ToastContext, useToastState, type Toast, type ToastType } from "@/hooks/useToast";

/* ── Icônes ── */
const IcoCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);
const IcoX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IcoWarning = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IcoInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IcoClose = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ── Config par type ── */
const TOAST_CONFIG: Record<ToastType, {
  icon:    JSX.Element;
  color:   string;
  bg:      string;
  border:  string;
  bar:     string;
}> = {
  success: {
    icon:   <IcoCheck />,
    color:  "#1A5C40",
    bg:     "linear-gradient(135deg, #0e1a12 0%, #152412 100%)",
    border: "rgba(26,92,64,.4)",
    bar:    "#1A5C40",
  },
  error: {
    icon:   <IcoX />,
    color:  "#E05A3A",
    bg:     "linear-gradient(135deg, #1a0e0a 0%, #241210 100%)",
    border: "rgba(184,52,30,.4)",
    bar:    "#B8341E",
  },
  warning: {
    icon:   <IcoWarning />,
    color:  "#E09B48",
    bg:     "linear-gradient(135deg, #1a1508 0%, #241e0a 100%)",
    border: "rgba(192,132,53,.4)",
    bar:    "#C08435",
  },
  info: {
    icon:   <IcoInfo />,
    color:  "#6B9AE0",
    bg:     "linear-gradient(135deg, #0a1020 0%, #101828 100%)",
    border: "rgba(30,77,168,.4)",
    bar:    "#1E4DA8",
  },
};

/* ── Toast individuel ── */
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible]   = useState(false);
  const [progress, setProgress] = useState(100);

  const cfg = TOAST_CONFIG[toast.type];

  useEffect(() => {
    // Apparition
    requestAnimationFrame(() => setVisible(true));

    // Barre de progression
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration]);

  const handleRemove = useCallback(() => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  }, [toast.id, onRemove]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.85rem",
        padding: "1rem 1.1rem",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 16,
        boxShadow: `0 8px 32px rgba(0,0,0,.5), 0 2px 8px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06)`,
        minWidth: 300,
        maxWidth: 400,
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0) scale(1)" : "translateX(20px) scale(0.96)",
        transition: "opacity .3s cubic-bezier(.16,1,.3,1), transform .3s cubic-bezier(.16,1,.3,1)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Icône */}
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: `${cfg.color}20`,
        border: `1px solid ${cfg.color}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: cfg.color,
      }}>
        {cfg.icon}
      </div>

      {/* Texte */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "0.85rem", fontWeight: 700,
          color: "#F8F6F1", lineHeight: 1.3,
          fontFamily: "'Fraunces', Georgia, serif",
          letterSpacing: "-0.01em",
        }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{
            fontSize: "0.75rem", color: "rgba(248,246,241,.5)",
            marginTop: "0.25rem", lineHeight: 1.5,
          }}>
            {toast.message}
          </div>
        )}
      </div>

      {/* Bouton fermer */}
      <button
        onClick={handleRemove}
        style={{
          flexShrink: 0, width: 24, height: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 6, background: "rgba(255,255,255,.06)",
          border: "1px solid rgba(255,255,255,.08)",
          color: "rgba(248,246,241,.4)", cursor: "pointer",
          transition: "all .15s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.12)";
          (e.currentTarget as HTMLButtonElement).style.color = "#F8F6F1";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.06)";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(248,246,241,.4)";
        }}
      >
        <IcoClose />
      </button>

      {/* Barre de progression */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: "rgba(255,255,255,.06)",
      }}>
        <div style={{
          height: "100%", background: cfg.bar,
          width: `${progress}%`,
          transition: "width .05s linear",
          boxShadow: `0 0 6px ${cfg.bar}`,
        }} />
      </div>
    </div>
  );
}

/* ── Conteneur des toasts ── */
export function ToastContainer() {
  const ctx = useToastState();
  // On ne peut pas appeler useToast ici car on EST le provider
  // Ce composant est utilisé DANS ToastProvider avec le state partagé

  return null; // Rendu géré par ToastProvider
}

/* ── Provider ── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const state = useToastState();

  return (
    <ToastContext.Provider value={state}>
      {children}

      {/* Portal toasts — coin bas droite */}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "0.65rem",
          pointerEvents: "none",
        }}
      >
        {state.toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: "all" }}>
            <ToastItem toast={toast} onRemove={state.remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}