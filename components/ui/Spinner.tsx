"use client";

/**
 * components/ui/Spinner.tsx
 * Loaders réutilisables — plusieurs variantes
 */

interface SpinnerProps {
  size?:  number;
  color?: string;
  track?: string;
}

/* ── Spinner rotatif classique ── */
export function Spinner({ size = 20, color = "#C08435", track = "rgba(192,132,53,.2)" }: SpinnerProps) {
  return (
    <>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        border: `${Math.max(2, size / 10)}px solid ${track}`,
        borderTopColor: color,
        animation: "spinner-rotate .7s linear infinite",
        flexShrink: 0,
      }} />
      <style>{`@keyframes spinner-rotate { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

/* ── Skeleton loader (placeholder de contenu) ── */
interface SkeletonProps {
  width?:  string | number;
  height?: string | number;
  radius?: number;
  style?:  React.CSSProperties;
}

export function Skeleton({ width = "100%", height = 16, radius = 6, style }: SkeletonProps) {
  return (
    <>
      <div style={{
        width, height, borderRadius: radius,
        background: "linear-gradient(90deg, rgba(248,246,241,.06) 25%, rgba(248,246,241,.1) 50%, rgba(248,246,241,.06) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s ease-in-out infinite",
        flexShrink: 0,
        ...style,
      }} />
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

/* ── Page de chargement complète ── */
export function PageLoader({ message = "Chargement…" }: { message?: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: 400, gap: "1.25rem",
    }}>
      <div style={{ position: "relative", width: 48, height: 48 }}>
        {/* Cercle extérieur lent */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "2px solid rgba(192,132,53,.15)",
          borderTopColor: "#C08435",
          animation: "spinner-rotate 1.2s linear infinite",
        }} />
        {/* Cercle intérieur rapide */}
        <div style={{
          position: "absolute", inset: 8, borderRadius: "50%",
          border: "2px solid rgba(192,132,53,.08)",
          borderBottomColor: "rgba(192,132,53,.5)",
          animation: "spinner-rotate .6s linear infinite reverse",
        }} />
        {/* Point central */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 6, height: 6, borderRadius: "50%",
          background: "#C08435",
          animation: "spinner-pulse 1.2s ease-in-out infinite",
        }} />
      </div>
      <p style={{
        fontSize: "0.82rem", color: "rgba(248,246,241,.3)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        letterSpacing: "0.05em",
      }}>
        {message}
      </p>
      <style>{`
        @keyframes spinner-rotate { to { transform: rotate(360deg); } }
        @keyframes spinner-pulse { 0%,100%{opacity:1;transform:translate(-50%,-50%) scale(1)} 50%{opacity:.4;transform:translate(-50%,-50%) scale(.5)} }
      `}</style>
    </div>
  );
}

/* ── Skeleton d'une ligne de tableau ── */
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: "1rem", padding: "1rem 1.5rem",
      borderBottom: "1px solid rgba(248,246,241,.05)",
      alignItems: "center",
    }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height={14} width={i === 0 ? "80%" : i === cols - 1 ? 60 : "65%"} />
      ))}
    </div>
  );
}