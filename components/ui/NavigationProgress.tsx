"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/* ── Durées ─────────────────────────────────────────────── */
const FAKE_PROGRESS_INTERVAL = 120;   // ms entre chaque tick
const FAKE_PROGRESS_INCREMENT = 0.035; // avancement par tick (s'ralentit à mesure)
const COMPLETE_DELAY = 200;            // ms après arrivée avant de masquer

export default function NavigationProgress() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [visible,  setVisible]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [leaving,  setLeaving]  = useState(false); // fade-out final

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeRef = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const prevPath    = useRef<string>("");

  const clearAll = useCallback(() => {
    if (timerRef.current)    clearInterval(timerRef.current);
    if (completeRef.current) clearTimeout(completeRef.current);
  }, []);

  /* ── Démarrer ── */
  const start = useCallback(() => {
    clearAll();
    setLeaving(false);
    setProgress(0);
    setVisible(true);

    let current = 0;
    timerRef.current = setInterval(() => {
      // Progression logarithmique : rapide au début, s'approche de 0.9 sans jamais l'atteindre
      current += FAKE_PROGRESS_INCREMENT * (1 - current);
      const capped = Math.min(current, 0.88);
      setProgress(capped);
    }, FAKE_PROGRESS_INTERVAL);
  }, [clearAll]);

  /* ── Terminer ── */
  const finish = useCallback(() => {
    clearAll();
    setProgress(1);
    completeRef.current = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
        setLeaving(false);
      }, 300);
    }, COMPLETE_DELAY);
  }, [clearAll]);

  /* ── Détecter changement de route ── */
  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (prevPath.current && prevPath.current !== current) {
      finish();
    }
    prevPath.current = current;
  }, [pathname, searchParams, finish]);

  /* ── Intercepter les clics sur les liens ── */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignorer : liens externes, ancres, tel:, mailto:, javascript:
      if (
        href.startsWith("http") ||
        href.startsWith("//")   ||
        href.startsWith("#")    ||
        href.startsWith("tel:") ||
        href.startsWith("mailto:") ||
        href.startsWith("javascript:") ||
        target.target === "_blank"
      ) return;

      // Ignorer si même page
      const currentFull = window.location.pathname + window.location.search;
      if (href === currentFull) return;

      start();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [start]);

  if (!visible) return null;

  const pct = Math.round(progress * 100);

  return (
    <>
      {/* ── Barre de progression ── */}
      <div
        aria-hidden="true"
        style={{
          position:     "fixed",
          top:          0,
          left:         0,
          right:        0,
          height:       "2.5px",
          zIndex:       9999,
          pointerEvents:"none",
        }}
      >
        {/* track */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(192,132,53,.12)" }} />
        {/* fill */}
        <div
          style={{
            position:   "absolute",
            top:        0,
            left:       0,
            height:     "100%",
            width:      `${pct}%`,
            background: "linear-gradient(90deg, #C08435, #E09B48)",
            boxShadow:  "0 0 8px rgba(192,132,53,.6), 0 0 2px rgba(192,132,53,.4)",
            transition: progress === 1
              ? "width 0.15s ease-out"
              : "width 0.08s linear",
            opacity:    leaving ? 0 : 1,
            transitionProperty: leaving ? "opacity" : "width, opacity",
            transitionDuration: leaving ? "0.3s" : undefined,
          }}
        />
        {/* lueur finale */}
        <div
          style={{
            position:    "absolute",
            top:         0,
            right:       `${100 - pct}%`,
            transform:   "translateX(50%)",
            width:       "60px",
            height:      "100%",
            background:  "radial-gradient(ellipse at center, rgba(224,155,72,.7) 0%, transparent 70%)",
            opacity:     leaving ? 0 : 1,
            transition:  leaving ? "opacity 0.3s" : "none",
          }}
        />
      </div>

      {/* ── Spinner discret coin bas-droit ── */}
      <div
        aria-hidden="true"
        style={{
          position:    "fixed",
          bottom:      "1.25rem",
          right:       "1.5rem",
          zIndex:      9998,
          pointerEvents:"none",
          opacity:     leaving ? 0 : 1,
          transition:  leaving ? "opacity 0.3s" : "opacity 0.15s",
          display:     "flex",
          alignItems:  "center",
          gap:         "0.5rem",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          style={{ animation: "nprogress-spin 0.65s linear infinite" }}
        >
          <circle
            cx="9" cy="9" r="7"
            fill="none"
            stroke="rgba(192,132,53,.15)"
            strokeWidth="2"
          />
          <circle
            cx="9" cy="9" r="7"
            fill="none"
            stroke="#C08435"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="14 30"
          />
        </svg>
      </div>

      {/* ── Keyframe inline — une seule fois ── */}
      <style>{`
        @keyframes nprogress-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}