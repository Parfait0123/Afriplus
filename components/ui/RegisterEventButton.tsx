"use client";

import Link from "next/link";
import { useEventRegistration } from "@/hooks/useAuth";

interface RegisterEventButtonProps {
  eventSlug:     string;
  eventTitle:    string;
  eventDate?:    string;     // ISO "2026-04-15"
  eventLocation?: string;
  color?:        string;
  bg?:           string;
  variant?:      "full" | "pill";
}
/* 
export default function RegisterEventButton({
  eventSlug, eventTitle, eventDate, eventLocation,
  color   = "#1E4DA8",
  bg      = "#EBF0FB",
  variant = "full",
}: RegisterEventButtonProps) {
  const { registered, loading, toggle, exportICS, isLoggedIn } =
    useEventRegistration(eventSlug, eventTitle, eventDate, eventLocation);

  const fullWidth = variant === "full";

  if (loading) return (
    <div style={{ height: fullWidth ? 50 : 38, borderRadius: fullWidth ? 14 : 100, background: "rgba(20,20,16,.06)" }} />
  );

  if (!isLoggedIn) return (
    <Link href="/login" style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
      width: fullWidth ? "100%" : "auto",
      padding: fullWidth ? "0.95rem" : "0.6rem 1.2rem",
      borderRadius: fullWidth ? 14 : 100,
      background: color, color: "#fff", textDecoration: "none",
      fontWeight: 700, fontSize: "0.9rem",
      boxShadow: `0 4px 14px ${color}45`,
    }}>
      S'inscrire à l'événement →
    </Link>
  );

  if (registered) return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
        padding: "0.9rem", background: bg,
        border: `1.5px solid ${color}`, borderRadius: 14,
        fontWeight: 700, fontSize: "0.88rem", color,
      }}>
        ✓ Inscrit à cet événement
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {eventDate && (
          <button onClick={exportICS} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
            padding: "0.6rem", borderRadius: 10, background: "#F8F6F1",
            border: "1px solid rgba(20,20,16,.1)", color: "#38382E",
            fontWeight: 600, fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit",
          }}>
            📅 Ajouter au calendrier
          </button>
        )}
        <button onClick={toggle} style={{
          flex: eventDate ? "0 0 auto" : 1,
          padding: "0.6rem 0.85rem", borderRadius: 10,
          background: "#FAEBE8", border: "none",
          color: "#B8341E", fontWeight: 600, fontSize: "0.75rem",
          cursor: "pointer", fontFamily: "inherit",
        }}>
          Se désinscrire
        </button>
      </div>
    </div>
  );

  return (
    <button onClick={toggle} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
      width: fullWidth ? "100%" : "auto",
      padding: fullWidth ? "0.95rem" : "0.6rem 1.2rem",
      borderRadius: fullWidth ? 14 : 100,
      background: color, color: "#fff", border: "none",
      fontWeight: 700, fontSize: "0.88rem", cursor: "pointer",
      boxShadow: `0 4px 14px ${color}45`, transition: "opacity .18s",
      fontFamily: "inherit",
    }}>
      S'inscrire à l'événement →
    </button>
  );
}
 */