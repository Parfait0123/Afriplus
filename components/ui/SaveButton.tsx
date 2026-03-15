"use client";

import Link from "next/link";
import { useSave, type ContentType } from "@/hooks/useAuth";

interface SaveButtonProps {
  contentType:  ContentType;
  contentSlug:  string;
  contentTitle: string;
  contentMeta?: Record<string, unknown>;
  variant?:     "icon" | "pill" | "full";
  color?:       string;
  bg?:          string;
}

export default function SaveButton({
  contentType, contentSlug, contentTitle, contentMeta,
  variant = "pill",
  color   = "#C08435",
  bg      = "#FBF4E8",
}: SaveButtonProps) {
  const { saved, loading, toggle, isLoggedIn } = useSave(
    contentType, contentSlug, contentTitle, contentMeta
  );

  const baseStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "0.45rem",
    fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
    padding: variant === "icon" ? "0.5rem" : "0.5rem 1.1rem",
    borderRadius: 100, transition: "all .18s", fontFamily: "inherit",
  };

  if (loading) {
    return (
      <div style={{
        ...baseStyle,
        width: variant === "icon" ? 34 : 120, height: 34,
        background: "rgba(20,20,16,.06)", border: "none",
        animation: "pulse 1.5s ease infinite",
      }} />
    );
  }

  if (!isLoggedIn) {
    return (
      <Link href="/login" style={{
        ...baseStyle,
        border: "1px solid rgba(20,20,16,.1)",
        background: "transparent", color: "#928E80",
        textDecoration: "none",
      }}>
        ☆{variant !== "icon" && " Sauvegarder"}
      </Link>
    );
  }

  return (
    <button
      onClick={toggle}
      style={{
        ...baseStyle,
        border:     `1px solid ${saved ? color : "rgba(20,20,16,.1)"}`,
        background: saved ? bg : "transparent",
        color:      saved ? color : "#928E80",
      }}
    >
      {saved ? "★" : "☆"}
      {variant !== "icon" && (saved ? " Sauvegardé" : " Sauvegarder")}
    </button>
  );
}
