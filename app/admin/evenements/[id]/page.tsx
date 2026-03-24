"use client";

/**
 * app/admin/evenements/[id]/page.tsx
 * Éditeur événement — données réelles Supabase
 * Route /admin/evenements/nouveau pour créer
 * Route /admin/evenements/:id pour éditer
 * Miroir fidèle de admin/bourses/[id]/page.tsx
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Block } from "@/types/blocks";

/* ── Types ── */
type EventType =
  | "Conférence"
  | "Forum"
  | "Hackathon"
  | "Salon"
  | "Atelier"
  | "Sommet";

interface EventForm {
  slug: string;
  title: string;
  type: EventType;
  location: string;
  country: string;
  flag: string;
  event_date: string;
  description: string;
  organizer: string;
  attendees: string;
  register_url: string;
  cover_url: string;
  image_gradient: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  content: Block[]; // JSONB — blocs de contenu éditoriaux
}

/* ── Config ── */
const EVENT_TYPES: EventType[] = [
  "Conférence",
  "Forum",
  "Hackathon",
  "Salon",
  "Atelier",
  "Sommet",
];

const TYPE_GRADIENT: Record<EventType, string> = {
  Conférence:
    "linear-gradient(135deg,#001420 0%,#002840 40%,#003a58 70%,#001e30 100%)",
  Forum:
    "linear-gradient(135deg,#0f1a00 0%,#1e3400 40%,#2c4c00 70%,#182800 100%)",
  Hackathon:
    "linear-gradient(135deg,#001a10 0%,#003020 40%,#004830 70%,#002418 100%)",
  Salon:
    "linear-gradient(135deg,#1a0a00 0%,#301500 40%,#481e00 70%,#281000 100%)",
  Atelier:
    "linear-gradient(135deg,#0a0a1a 0%,#141428 40%,#1e1e3c 70%,#0e0e22 100%)",
  Sommet:
    "linear-gradient(135deg,#1a0818 0%,#301030 40%,#481848 70%,#280c28 100%)",
};

const TYPE_COLOR: Record<string, string> = {
  Conférence: "#1E4DA8",
  Forum: "#1A5C40",
  Hackathon: "#7A1E4A",
  Salon: "#9B6B1A",
  Atelier: "#2D6B6B",
  Sommet: "#141410",
};

const BLOCK_TYPES = [
  { value: "paragraph", label: "Paragraphe" },
  { value: "heading", label: "Titre H2/H3" },
  { value: "pullquote", label: "Citation" },
  { value: "factbox", label: "Encadré Faits" },
  { value: "checklist", label: "Checklist" },
  { value: "steps", label: "Étapes" },
  { value: "benefits", label: "Avantages" },
  { value: "agenda", label: "Programme / Agenda" },
  { value: "speakers", label: "Intervenants" },
  { value: "alert", label: "Alerte / Info" },
  { value: "location", label: "Localisation" },
  { value: "apply", label: "Bouton CTA (Inscription)" },
  { value: "external", label: "Lien externe" },
  { value: "image", label: "Image" },
  { value: "divider", label: "Séparateur" },
] as const;

const FLAGS = [
  "🌍","🇸🇳","🇨🇮","🇬🇭","🇳🇬","🇰🇪","🇷🇼","🇲🇦","🇩🇿","🇪🇬",
  "🇿🇦","🇹🇳","🇪🇹","🇨🇲","🇹🇿","🇺🇬","🇲🇱","🇧🇫","🇳🇪","🇹🇬",
  "🇧🇯","🇲🇿","🇦🇴","🇿🇼","🇧🇼","🇳🇦","🇫🇷","🇩🇪","🇬🇧","🇺🇸",
  "🇨🇦","🇨🇭","🇧🇪","🇵🇹","🇪🇸","🇮🇹","🇨🇳","🇯🇵","🇦🇪","🇶🇦",
];

/* ── Icônes ── */
const IcoArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const IcoSave = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IcoEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcoPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcoTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IcoUp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const IcoDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IcoUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

/* ── Helpers ── */
function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyBlock(type: string): Block {
  switch (type) {
    case "heading":
      return { type: "heading", text: "", level: 2 };
    case "pullquote":
      return { type: "pullquote", text: "", author: "", role: "" };
    case "factbox":
      return { type: "factbox", title: "", facts: [""] };
    case "checklist":
      return { type: "checklist", title: "", items: [{ label: "", detail: "" }] };
    case "steps":
      return { type: "steps", title: "", items: [{ label: "", desc: "" }] };
    case "benefits":
      return { type: "benefits", title: "", items: [{ icon: "✅", label: "", value: "", highlight: false }] };
    case "agenda":
      return { type: "agenda", title: "", sessions: [{ time: "", title: "", speaker: "", tag: "", highlight: false }] };
    case "speakers":
      return { type: "speakers", title: "", people: [{ name: "", role: "", org: "" }] };
    case "alert":
      return { type: "alert", message: "", variant: "info" };
    case "location":
      return { type: "location", label: "", address: "", mapUrl: "" };
    case "apply":
      return { type: "apply", label: "", url: "", note: "", deadline: "" };
    case "external":
      return { type: "external", url: "", label: "", description: "", favicon: "🔗" };
    case "image":
      return { type: "image", url: "", alt: "", caption: "", credit: "" };
    case "divider":
      return { type: "divider" };
    default:
      return { type: "paragraph", text: "" };
  }
}

/* ══════════════════════════════════════════════════════════
   COMPOSANTS ÉDITEURS DE BLOCS
══════════════════════════════════════════════════════════ */

function BlockEditor({
  block,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: {
  block: Block;
  index: number;
  total: number;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: ".55rem .8rem",
    borderRadius: 8,
    border: "1px solid rgba(20,20,16,.12)",
    background: "#FAFAF8",
    fontSize: ".78rem",
    color: "#141410",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical" as const,
    transition: "border .18s",
  };
  const taStyle: React.CSSProperties = { ...inputStyle, minHeight: 80, resize: "vertical" };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: ".58rem",
    fontWeight: 700,
    letterSpacing: ".1em",
    textTransform: "uppercase",
    color: "#928E80",
    marginBottom: ".3rem",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    gap: ".6rem",
    marginBottom: ".5rem",
    alignItems: "flex-start",
  };

  const typeColors: Record<string, string> = {
    paragraph: "#38382E", heading: "#1E4DA8", pullquote: "#7A4A1E",
    factbox: "#2D6B6B", checklist: "#1A5C40", steps: "#C08435",
    benefits: "#7A1E4A", agenda: "#1E4DA8", speakers: "#9B6B1A",
    alert: "#B8341E", location: "#38382E", apply: "#1A5C40",
    external: "#2D6B6B", image: "#928E80", divider: "#C4C0B6",
  };

  const typeLabel: Record<string, string> = {
    paragraph: "Paragraphe", heading: "Titre", pullquote: "Citation",
    factbox: "Encadré Faits", checklist: "Checklist", steps: "Étapes",
    benefits: "Avantages", agenda: "Programme", speakers: "Intervenants",
    alert: "Alerte", location: "Localisation", apply: "Inscription CTA",
    external: "Lien externe", image: "Image", divider: "Séparateur",
  };

  const renderEditor = () => {
    switch (block.type) {
      case "paragraph":
        return (
          <textarea
            style={taStyle}
            value={block.text}
            placeholder="Texte du paragraphe…"
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
        );

      case "heading":
        return (
          <div style={{ display: "flex", gap: ".6rem" }}>
            <select
              value={block.level ?? 2}
              onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 2 | 3 })}
              style={{ ...inputStyle, width: 80, resize: "none" }}
            >
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={block.text}
              placeholder="Titre de la section…"
              onChange={(e) => onChange({ ...block, text: e.target.value })}
            />
          </div>
        );

      case "pullquote":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            <textarea
              style={taStyle}
              value={block.text}
              placeholder="Texte de la citation…"
              onChange={(e) => onChange({ ...block, text: e.target.value })}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".5rem" }}>
              <input style={inputStyle} value={block.author ?? ""} placeholder="Auteur"
                onChange={(e) => onChange({ ...block, author: e.target.value })} />
              <input style={inputStyle} value={block.role ?? ""} placeholder="Titre / Rôle"
                onChange={(e) => onChange({ ...block, role: e.target.value })} />
            </div>
          </div>
        );

      case "alert":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            <select
              value={block.variant ?? "info"}
              onChange={(e) => onChange({ ...block, variant: e.target.value as "info" | "warning" | "tip" })}
              style={{ ...inputStyle, resize: "none" }}
            >
              <option value="info">ℹ️ Info</option>
              <option value="warning">⚠️ Attention</option>
              <option value="tip">💡 Conseil</option>
            </select>
            <textarea
              style={taStyle}
              value={block.message}
              placeholder="Message de l'alerte…"
              onChange={(e) => onChange({ ...block, message: e.target.value })}
            />
          </div>
        );

      case "factbox":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            <input style={inputStyle} value={block.title} placeholder="Titre de l'encadré"
              onChange={(e) => onChange({ ...block, title: e.target.value })} />
            {(block.facts ?? []).map((fact, fi) => (
              <div key={fi} style={rowStyle}>
                <input style={{ ...inputStyle, flex: 1 }} value={fact} placeholder={`Fait ${fi + 1}`}
                  onChange={(e) => {
                    const facts = [...block.facts];
                    facts[fi] = e.target.value;
                    onChange({ ...block, facts });
                  }} />
                <button onClick={() => {
                  const facts = block.facts.filter((_, i) => i !== fi);
                  onChange({ ...block, facts });
                }} style={{ ...inputStyle, width: 32, textAlign: "center", cursor: "pointer", color: "#B8341E", flexShrink: 0 }}>×</button>
              </div>
            ))}
            <button
              onClick={() => onChange({ ...block, facts: [...block.facts, ""] })}
              style={{ fontSize: ".7rem", fontWeight: 700, color: "#C08435", background: "none", border: "1px dashed rgba(192,132,53,.4)", borderRadius: 8, padding: ".4rem", cursor: "pointer" }}
            >
              + Ajouter un fait
            </button>
          </div>
        );

      case "checklist":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            <input style={inputStyle} value={block.title ?? ""} placeholder="Titre (optionnel)"
              onChange={(e) => onChange({ ...block, title: e.target.value })} />
            {(block.items ?? []).map((item, ii) => (
              <div key={ii} style={{ display: "flex", flexDirection: "column", gap: ".3rem", padding: ".6rem", background: "rgba(20,20,16,.03)", borderRadius: 8, border: "1px solid rgba(20,20,16,.07)" }}>
                <div style={rowStyle}>
                  <input style={{ ...inputStyle, flex: 1 }} value={item.label} placeholder="Élément"
                    onChange={(e) => {
                      const items = [...block.items];
                      items[ii] = { ...items[ii], label: e.target.value };
                      onChange({ ...block, items });
                    }} />
                  <button onClick={() => {
                    const items = block.items.filter((_, i) => i !== ii);
                    onChange({ ...block, items });
                  }} style={{ ...inputStyle, width: 32, cursor: "pointer", color: "#B8341E", flexShrink: 0 }}>×</button>
                </div>
                <input style={inputStyle} value={item.detail ?? ""} placeholder="Détail (optionnel)"
                  onChange={(e) => {
                    const items = [...block.items];
                    items[ii] = { ...items[ii], detail: e.target.value };
                    onChange({ ...block, items });
                  }} />
              </div>
            ))}
            <button onClick={() => onChange({ ...block, items: [...block.items, { label: "", detail: "" }] })}
              style={{ fontSize: ".7rem", fontWeight: 700, color: "#C08435", background: "none", border: "1px dashed rgba(192,132,53,.4)", borderRadius: 8, padding: ".4rem", cursor: "pointer" }}>
              + Ajouter un élément
            </button>
          </div>
        );

      case "steps":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            <input style={inputStyle} value={block.title ?? ""} placeholder="Titre (optionnel)"
              onChange={(e) => onChange({ ...block, title: e.target.value })} />
            {(block.items ?? []).map((item, ii) => (
              <div key={ii} style={{ display: "flex", flexDirection: "column", gap: ".3rem", padding: ".6rem", background: "rgba(20,20,16,.03)", borderRadius: 8, border: "1px solid rgba(20,20,16,.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".2rem" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#C08435", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".62rem", fontWeight: 900, flexShrink: 0 }}>{ii + 1}</span>
                  <input style={{ ...inputStyle, flex: 1 }} value={item.label} placeholder="Intitulé de l'étape"
                    onChange={(e) => {
                      const items = [...block.items];
                      items[ii] = { ...items[ii], label: e.target.value };
                      onChange({ ...block, items });
                    }} />
                  <button onClick={() => { const items = block.items.filter((_, i) => i !== ii); onChange({ ...block, items }); }}
                    style={{ ...inputStyle, width: 32, cursor: "pointer", color: "#B8341E", flexShrink: 0 }}>×</button>
                </div>
                <textarea style={{ ...taStyle, minHeight: 60 }} value={item.desc} placeholder="Description de l'étape"
                  onChange={(e) => {
                    const items = [...block.items];
                    items[ii] = { ...items[ii], desc: e.target.value };
                    onChange({ ...block, items });
                  }} />
              </div>
            ))}
            <button onClick={() => onChange({ ...block, items: [...block.items, { label: "", desc: "" }] })}
              style={{ fontSize: ".7rem", fontWeight: 700, color: "#C08435", background: "none", border: "1px dashed rgba(192,132,53,.4)", borderRadius: 8, padding: ".4rem", cursor: "pointer" }}>
              + Ajouter une étape
            </button>
          </div>
        );

      case "benefits":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            <input style={inputStyle} value={block.title ?? ""} placeholder="Titre (optionnel)"
              onChange={(e) => onChange({ ...block, title: e.target.value })} />
            {(block.items ?? []).map((item, ii) => (
              <div key={ii} style={{ display: "grid", gridTemplateColumns: "48px 1fr 1fr auto auto", gap: ".4rem", alignItems: "center" }}>
                <input style={{ ...inputStyle, textAlign: "center", fontSize: "1.1rem", padding: ".3rem" }} value={item.icon} placeholder="🔹"
                  onChange={(e) => {
                    const items = [...block.items];
                    items[ii] = { ...items[ii], icon: e.target.value };
                    onChange({ ...block, items });
                  }} />
                <input style={inputStyle} value={item.label} placeholder="Label"
                  onChange={(e) => {
                    const items = [...block.items];
                    items[ii] = { ...items[ii], label: e.target.value };
                    onChange({ ...block, items });
                  }} />
                <input style={inputStyle} value={item.value} placeholder="Valeur"
                  onChange={(e) => {
                    const items = [...block.items];
                    items[ii] = { ...items[ii], value: e.target.value };
                    onChange({ ...block, items });
                  }} />
                <label style={{ display: "flex", alignItems: "center", gap: ".3rem", fontSize: ".62rem", color: "#928E80", cursor: "pointer", whiteSpace: "nowrap" }}>
                  <input type="checkbox" checked={item.highlight ?? false}
                    onChange={(e) => {
                      const items = [...block.items];
                      items[ii] = { ...items[ii], highlight: e.target.checked };
                      onChange({ ...block, items });
                    }} />
                  ★
                </label>
                <button onClick={() => { const items = block.items.filter((_, i) => i !== ii); onChange({ ...block, items }); }}
                  style={{ ...inputStyle, width: 28, cursor: "pointer", color: "#B8341E", padding: ".2rem" }}>×</button>
              </div>
            ))}
            <button onClick={() => onChange({ ...block, items: [...block.items, { icon: "✅", label: "", value: "", highlight: false }] })}
              style={{ fontSize: ".7rem", fontWeight: 700, color: "#C08435", background: "none", border: "1px dashed rgba(192,132,53,.4)", borderRadius: 8, padding: ".4rem", cursor: "pointer" }}>
              + Ajouter un avantage
            </button>
          </div>
        );

      case "agenda":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            <input style={inputStyle} value={block.title ?? ""} placeholder="Titre du programme (optionnel)"
              onChange={(e) => onChange({ ...block, title: e.target.value })} />
            {(block.sessions ?? []).map((session, si) => (
              <div key={si} style={{ padding: ".65rem", background: "rgba(20,20,16,.03)", borderRadius: 8, border: "1px solid rgba(20,20,16,.07)", display: "flex", flexDirection: "column", gap: ".35rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "90px 1fr auto", gap: ".4rem", alignItems: "center" }}>
                  <input style={{ ...inputStyle, fontSize: ".7rem" }} value={session.time} placeholder="Horaire"
                    onChange={(e) => {
                      const sessions = [...block.sessions];
                      sessions[si] = { ...sessions[si], time: e.target.value };
                      onChange({ ...block, sessions });
                    }} />
                  <input style={inputStyle} value={session.title} placeholder="Titre de la session"
                    onChange={(e) => {
                      const sessions = [...block.sessions];
                      sessions[si] = { ...sessions[si], title: e.target.value };
                      onChange({ ...block, sessions });
                    }} />
                  <button onClick={() => { const sessions = block.sessions.filter((_, i) => i !== si); onChange({ ...block, sessions }); }}
                    style={{ ...inputStyle, width: 30, cursor: "pointer", color: "#B8341E", padding: ".2rem" }}>×</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px auto", gap: ".4rem", alignItems: "center" }}>
                  <input style={inputStyle} value={session.speaker ?? ""} placeholder="Intervenant(s)"
                    onChange={(e) => {
                      const sessions = [...block.sessions];
                      sessions[si] = { ...sessions[si], speaker: e.target.value };
                      onChange({ ...block, sessions });
                    }} />
                  <input style={inputStyle} value={session.tag ?? ""} placeholder="Tag"
                    onChange={(e) => {
                      const sessions = [...block.sessions];
                      sessions[si] = { ...sessions[si], tag: e.target.value };
                      onChange({ ...block, sessions });
                    }} />
                  <label style={{ display: "flex", alignItems: "center", gap: ".3rem", fontSize: ".62rem", color: "#928E80", cursor: "pointer" }}>
                    <input type="checkbox" checked={session.highlight ?? false}
                      onChange={(e) => {
                        const sessions = [...block.sessions];
                        sessions[si] = { ...sessions[si], highlight: e.target.checked };
                        onChange({ ...block, sessions });
                      }} />
                    ⭐
                  </label>
                </div>
              </div>
            ))}
            <button onClick={() => onChange({ ...block, sessions: [...block.sessions, { time: "", title: "", speaker: "", tag: "", highlight: false }] })}
              style={{ fontSize: ".7rem", fontWeight: 700, color: "#C08435", background: "none", border: "1px dashed rgba(192,132,53,.4)", borderRadius: 8, padding: ".4rem", cursor: "pointer" }}>
              + Ajouter une session
            </button>
          </div>
        );

      case "speakers":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            <input style={inputStyle} value={block.title ?? ""} placeholder="Titre (ex : Intervenants confirmés)"
              onChange={(e) => onChange({ ...block, title: e.target.value })} />
            {(block.people ?? []).map((person, pi) => (
              <div key={pi} style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr 1fr auto", gap: ".4rem", alignItems: "center" }}>
                <input style={{ ...inputStyle, textAlign: "center", fontSize: "1.1rem", padding: ".3rem" }} value={person.emoji ?? "👤"} placeholder="🧑"
                  onChange={(e) => {
                    const people = [...block.people];
                    people[pi] = { ...people[pi], emoji: e.target.value };
                    onChange({ ...block, people });
                  }} />
                <input style={inputStyle} value={person.name} placeholder="Nom"
                  onChange={(e) => {
                    const people = [...block.people];
                    people[pi] = { ...people[pi], name: e.target.value };
                    onChange({ ...block, people });
                  }} />
                <input style={inputStyle} value={person.role} placeholder="Rôle"
                  onChange={(e) => {
                    const people = [...block.people];
                    people[pi] = { ...people[pi], role: e.target.value };
                    onChange({ ...block, people });
                  }} />
                <input style={inputStyle} value={person.org ?? ""} placeholder="Organisation"
                  onChange={(e) => {
                    const people = [...block.people];
                    people[pi] = { ...people[pi], org: e.target.value };
                    onChange({ ...block, people });
                  }} />
                <button onClick={() => { const people = block.people.filter((_, i) => i !== pi); onChange({ ...block, people }); }}
                  style={{ ...inputStyle, width: 30, cursor: "pointer", color: "#B8341E", padding: ".2rem" }}>×</button>
              </div>
            ))}
            <button onClick={() => onChange({ ...block, people: [...block.people, { name: "", role: "", org: "", emoji: "👤" }] })}
              style={{ fontSize: ".7rem", fontWeight: 700, color: "#C08435", background: "none", border: "1px dashed rgba(192,132,53,.4)", borderRadius: 8, padding: ".4rem", cursor: "pointer" }}>
              + Ajouter un intervenant
            </button>
          </div>
        );

      case "location":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            <input style={inputStyle} value={block.label} placeholder="Nom du lieu (ex : Nairobi, Kenya)"
              onChange={(e) => onChange({ ...block, label: e.target.value })} />
            <input style={inputStyle} value={block.address ?? ""} placeholder="Adresse complète"
              onChange={(e) => onChange({ ...block, address: e.target.value })} />
            <input style={inputStyle} value={block.mapUrl ?? ""} placeholder="URL Google Maps embed (optionnel)"
              onChange={(e) => onChange({ ...block, mapUrl: e.target.value })} />
          </div>
        );

      case "apply":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            <input style={inputStyle} value={block.label} placeholder="Texte du bouton (ex : Inscrivez-vous)"
              onChange={(e) => onChange({ ...block, label: e.target.value })} />
            <input style={inputStyle} value={block.url} placeholder="URL d'inscription"
              onChange={(e) => onChange({ ...block, url: e.target.value })} />
            <input style={inputStyle} value={block.note ?? ""} placeholder="Note sous le bouton (optionnel)"
              onChange={(e) => onChange({ ...block, note: e.target.value })} />
            <input style={inputStyle} value={block.deadline ?? ""} placeholder="Date limite (ex : 20 Avr 2026)"
              onChange={(e) => onChange({ ...block, deadline: e.target.value })} />
          </div>
        );

      case "external":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: ".4rem" }}>
              <input style={{ ...inputStyle, textAlign: "center" }} value={block.favicon ?? "🔗"} placeholder="🔗"
                onChange={(e) => onChange({ ...block, favicon: e.target.value })} />
              <input style={inputStyle} value={block.url} placeholder="URL (https://…)"
                onChange={(e) => onChange({ ...block, url: e.target.value })} />
            </div>
            <input style={inputStyle} value={block.label} placeholder="Texte du lien"
              onChange={(e) => onChange({ ...block, label: e.target.value })} />
            <input style={inputStyle} value={block.description ?? ""} placeholder="Description courte (optionnel)"
              onChange={(e) => onChange({ ...block, description: e.target.value })} />
          </div>
        );

      case "image":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            <input style={inputStyle} value={block.url} placeholder="URL de l'image"
              onChange={(e) => onChange({ ...block, url: e.target.value })} />
            <input style={inputStyle} value={block.alt} placeholder="Texte alternatif (alt)"
              onChange={(e) => onChange({ ...block, alt: e.target.value })} />
            <input style={inputStyle} value={block.caption ?? ""} placeholder="Légende (optionnel)"
              onChange={(e) => onChange({ ...block, caption: e.target.value })} />
            <input style={inputStyle} value={block.credit ?? ""} placeholder="Crédit photo (optionnel)"
              onChange={(e) => onChange({ ...block, credit: e.target.value })} />
          </div>
        );

      case "divider":
        return (
          <div style={{ padding: ".5rem 0", textAlign: "center", color: "#C4C0B6", fontSize: ".7rem" }}>
            — Séparateur visuel —
          </div>
        );

      default:
        return (
          <p style={{ color: "#928E80", fontSize: ".75rem" }}>
            Type de bloc non géré : {(block as any).type}
          </p>
        );
    }
  };

  const color = typeColors[(block as any).type] ?? "#928E80";
  const label = typeLabel[(block as any).type] ?? (block as any).type;

  return (
    <div style={{
      background: "#fff",
      border: "1px solid rgba(20,20,16,.08)",
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: ".75rem",
      boxShadow: "0 1px 6px rgba(20,20,16,.04)",
    }}>
      {/* Header du bloc */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: ".6rem .85rem",
        background: "#FAFAF8",
        borderBottom: "1px solid rgba(20,20,16,.07)",
        gap: ".6rem",
      }}>
        <span style={{
          fontSize: ".55rem", fontWeight: 800, letterSpacing: ".12em",
          textTransform: "uppercase", padding: ".2rem .65rem", borderRadius: 100,
          background: `${color}18`, color, flexShrink: 0,
        }}>
          {label}
        </span>
        <span style={{ color: "#C4C0B6", fontSize: ".6rem" }}>
          #{index + 1}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: ".3rem" }}>
          <button
            disabled={index === 0}
            onClick={() => onMove("up")}
            style={{
              width: 26, height: 26, borderRadius: 7, border: "1px solid rgba(20,20,16,.12)",
              background: "transparent", cursor: index === 0 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: index === 0 ? "#C4C0B6" : "#928E80", transition: "all .15s",
            }}
          >
            <IcoUp />
          </button>
          <button
            disabled={index === total - 1}
            onClick={() => onMove("down")}
            style={{
              width: 26, height: 26, borderRadius: 7, border: "1px solid rgba(20,20,16,.12)",
              background: "transparent", cursor: index === total - 1 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: index === total - 1 ? "#C4C0B6" : "#928E80", transition: "all .15s",
            }}
          >
            <IcoDown />
          </button>
          <button
            onClick={onDelete}
            style={{
              width: 26, height: 26, borderRadius: 7, border: "1px solid rgba(184,52,30,.15)",
              background: "rgba(184,52,30,.05)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#B8341E", transition: "all .15s",
            }}
          >
            <IcoTrash />
          </button>
        </div>
      </div>
      {/* Corps du bloc */}
      <div style={{ padding: ".85rem" }}>
        {renderEditor()}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE — ÉDITEUR
══════════════════════════════════════════════════════════ */
export default function AdminEventEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const isNew = params.id === "nouveau";
  const sb = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">(
    "content"
  );
  const [addingBlock, setAddingBlock] = useState(false);
  const [newBlockType, setNewBlockType] = useState<string>("paragraph");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<EventForm>({
    slug: "",
    title: "",
    type: "Conférence",
    location: "",
    country: "",
    flag: "🌍",
    event_date: "",
    description: "",
    organizer: "",
    attendees: "",
    register_url: "",
    cover_url: "",
    image_gradient: TYPE_GRADIENT["Conférence"],
    tags: [],
    featured: false,
    published: false,
    content: [],
  });

  const [tagInput, setTagInput] = useState("");

  /* ── Chargement données existantes ── */
  useEffect(() => {
    if (isNew) return;
    (async () => {
      setLoading(true);
      const { data, error } = await sb
        .from("events")
        .select("*")
        .eq("id", params.id)
        .single();
      if (!error && data) {
        let parsedContent: Block[] = [];
        if (data.content) {
          try {
            parsedContent =
              typeof data.content === "string"
                ? JSON.parse(data.content)
                : data.content;
          } catch {
            parsedContent = [];
          }
        }
        setForm({
          slug: data.slug ?? "",
          title: data.title ?? "",
          type: (data.type as EventType) ?? "Conférence",
          location: data.location ?? "",
          country: data.country ?? "",
          flag: data.flag ?? "🌍",
          event_date: data.event_date ?? "",
          description: data.description ?? "",
          organizer: data.organizer ?? "",
          attendees: data.attendees ?? "",
          register_url: data.register_url ?? "",
          cover_url: data.cover_url ?? "",
          image_gradient:
            data.image_gradient ?? TYPE_GRADIENT["Conférence"],
          tags: data.tags ?? [],
          featured: data.featured ?? false,
          published: data.published ?? false,
          content: parsedContent,
        });
      }
      setLoading(false);
    })();
  }, [params.id, isNew, sb]);

  /* ── Auto-slug ── */
  const titleRef = useRef(form.title);
  titleRef.current = form.title;
  const handleTitleChange = (val: string) => {
    setForm((f) => ({
      ...f,
      title: val,
      slug: isNew ? slugify(val) : f.slug,
    }));
  };

  /* ── Auto-gradient selon type ── */
  const handleTypeChange = (type: EventType) => {
    setForm((f) => ({
      ...f,
      type,
      image_gradient: TYPE_GRADIENT[type],
    }));
  };

  /* ── Upload image de couverture ── */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await sb.storage
        .from("events")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = sb.storage.from("events").getPublicUrl(path);
      setForm((f) => ({ ...f, cover_url: urlData.publicUrl }));
    } catch (err) {
      setSaveMsg({ type: "error", text: "Erreur upload image." });
    } finally {
      setUploadingCover(false);
    }
  };

  /* ── Tags ── */
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };
  const removeTag = (tag: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  /* ── Gestion blocs ── */
  const addBlock = () => {
    setForm((f) => ({
      ...f,
      content: [...f.content, emptyBlock(newBlockType)],
    }));
    setAddingBlock(false);
  };
  const updateBlock = (i: number, b: Block) =>
    setForm((f) => {
      const content = [...f.content];
      content[i] = b;
      return { ...f, content };
    });
  const deleteBlock = (i: number) =>
    setForm((f) => ({
      ...f,
      content: f.content.filter((_, idx) => idx !== i),
    }));
  const moveBlock = (i: number, dir: "up" | "down") => {
    setForm((f) => {
      const content = [...f.content];
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= content.length) return f;
      [content[i], content[j]] = [content[j], content[i]];
      return { ...f, content };
    });
  };

  /* ── Sauvegarde ── */
  const save = async (publishOverride?: boolean) => {
    const isPublishing = publishOverride !== undefined;
    if (isPublishing) setPublishing(true);
    else setSaving(true);
    setSaveMsg(null);

    const payload: Record<string, any> = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      type: form.type,
      location: form.location,
      country: form.country,
      flag: form.flag,
      event_date: form.event_date || null,
      description: form.description || null,
      organizer: form.organizer || null,
      attendees: form.attendees || null,
      register_url: form.register_url || null,
      cover_url: form.cover_url || null,
      image_gradient: form.image_gradient,
      tags: form.tags,
      featured: form.featured,
      published: publishOverride !== undefined ? publishOverride : form.published,
      content: form.content,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isNew) {
        payload.created_at = new Date().toISOString();
        const { data, error } = await sb
          .from("events")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        setSaveMsg({ type: "success", text: publishOverride ? "Événement publié !" : "Événement créé !" });
        setTimeout(() => router.push(`/admin/evenements/${data.id}`), 900);
      } else {
        if (publishOverride !== undefined) {
          payload.published = publishOverride;
          setForm((f) => ({ ...f, published: publishOverride }));
        }
        const { error } = await sb
          .from("events")
          .update(payload)
          .eq("id", params.id);
        if (error) throw error;
        setSaveMsg({ type: "success", text: publishOverride ? (publishOverride ? "Publié !" : "Dépublié !") : "Sauvegardé !" });
      }
    } catch (err: any) {
      setSaveMsg({
        type: "error",
        text: err.message ?? "Erreur lors de la sauvegarde.",
      });
    } finally {
      setSaving(false);
      setPublishing(false);
      setTimeout(() => setSaveMsg(null), 3500);
    }
  };

  /* ── Styles partagés ── */
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: ".65rem .9rem",
    borderRadius: 10,
    border: "1px solid rgba(20,20,16,.12)",
    background: "#fff",
    fontSize: ".8rem",
    color: "#141410",
    outline: "none",
    fontFamily: "inherit",
    transition: "border .18s",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: ".58rem",
    fontWeight: 800,
    letterSpacing: ".12em",
    textTransform: "uppercase",
    color: "#928E80",
    marginBottom: ".35rem",
  };
  const sectionStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 14,
    border: "1px solid rgba(20,20,16,.08)",
    padding: "1.5rem",
    marginBottom: "1.25rem",
    boxShadow: "0 1px 8px rgba(20,20,16,.04)",
  };
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: ".62rem",
    fontWeight: 800,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    color: "#928E80",
    marginBottom: "1.1rem",
    paddingBottom: ".6rem",
    borderBottom: "1px solid rgba(20,20,16,.07)",
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(20,20,16,.08)", borderTopColor: "#C08435", animation: "spin .8s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "#928E80", fontSize: ".8rem" }}>Chargement de l'événement…</p>
          <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const typeColor = TYPE_COLOR[form.type] ?? "#141410";

  return (
    <>
      <style>{`
        .aee-input:focus { border-color:#C08435 !important; }
        .aee-tab { padding:.5rem 1rem; border:none; background:none; cursor:pointer; font-size:.72rem; font-weight:700; letter-spacing:.04em; border-bottom:2px solid transparent; transition:all .18s; color:#928E80; }
        .aee-tab.active { color:#141410; border-bottom-color:#C08435; }
        .aee-tab:hover { color:#38382E; }
        .aee-btn { display:inline-flex; align-items:center; gap:.4rem; padding:.6rem 1.2rem; border-radius:10px; border:none; cursor:pointer; font-size:.75rem; font-weight:700; letter-spacing:.04em; transition:all .18s; }
        .aee-btn:disabled { opacity:.55; cursor:not-allowed; }
        @keyframes aee-spin { to { transform:rotate(360deg); } }
        .aee-spinner { width:14px; height:14px; border-radius:50%; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; animation:aee-spin .7s linear infinite; display:inline-block; }
        .aee-save-toast {
          position:fixed; bottom:1.5rem; right:1.5rem; z-index:9999;
          padding:.75rem 1.25rem; border-radius:12px; font-size:.78rem; font-weight:700;
          box-shadow:0 8px 32px rgba(0,0,0,.18); animation:aee-toast-in .25s ease;
        }
        @keyframes aee-toast-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .aee-cover-zone {
          border:2px dashed rgba(20,20,16,.15); border-radius:12px;
          cursor:pointer; transition:border-color .2s, background .2s;
          text-align:center;
        }
        .aee-cover-zone:hover { border-color:#C08435; background:rgba(192,132,53,.03); }
      `}</style>

      {/* Toast notification */}
      {saveMsg && (
        <div
          className="aee-save-toast"
          style={{
            background: saveMsg.type === "success" ? "#1A5C40" : "#B8341E",
            color: "#fff",
          }}
        >
          {saveMsg.type === "success" ? "✓" : "✕"} {saveMsg.text}
        </div>
      )}

      <div style={{ background: "#F5F3EE", minHeight: "100vh" }}>
        {/* ── Barre du haut ── */}
        <div style={{
          background: "#141410",
          borderBottom: "3px solid #C08435",
          padding: "0",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 clamp(1rem,3vw,2.5rem)" }}>
            {/* Ligne 1 : navigation + actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 0 .75rem", flexWrap: "wrap" }}>
              <Link href="/admin/evenements"
                style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".7rem", fontWeight: 700, color: "rgba(248,246,241,.45)", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(248,246,241,.8)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248,246,241,.45)")}
              >
                <IcoArrow /> Événements
              </Link>
              <span style={{ color: "rgba(248,246,241,.18)" }}>›</span>
              <span style={{ fontSize: ".7rem", fontWeight: 800, color: "#C08435", letterSpacing: ".06em" }}>
                {isNew ? "Nouvel événement" : form.title || "Éditer"}
              </span>

              {/* Statut pill */}
              <span style={{
                marginLeft: ".25rem",
                fontSize: ".55rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase",
                padding: ".18rem .65rem", borderRadius: 100,
                background: form.published ? "rgba(26,92,64,.4)" : "rgba(248,246,241,.1)",
                color: form.published ? "#6FCF97" : "rgba(248,246,241,.45)",
              }}>
                {form.published ? "● Publié" : "○ Brouillon"}
              </span>

              {/* Actions */}
              <div style={{ marginLeft: "auto", display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                {!isNew && (
                  <Link href={`/evenements/${form.slug}?preview=1`} target="_blank" rel="noopener noreferrer">
                    <button className="aee-btn" style={{ background: "rgba(248,246,241,.1)", color: "rgba(248,246,241,.7)", border: "1px solid rgba(248,246,241,.15)" }}>
                      <IcoEye /> Prévisualiser
                    </button>
                  </Link>
                )}
                <button
                  className="aee-btn"
                  disabled={saving || publishing}
                  onClick={() => save()}
                  style={{ background: "rgba(248,246,241,.12)", color: "#F8F6F1", border: "1px solid rgba(248,246,241,.18)" }}
                >
                  {saving ? <span className="aee-spinner" /> : <IcoSave />}
                  {saving ? "Sauvegarde…" : "Sauvegarder"}
                </button>
                <button
                  className="aee-btn"
                  disabled={saving || publishing}
                  onClick={() => save(!form.published)}
                  style={{ background: form.published ? "#B8341E" : "#C08435", color: "#fff" }}
                >
                  {publishing ? <span className="aee-spinner" /> : null}
                  {publishing
                    ? "En cours…"
                    : form.published
                    ? "Dépublier"
                    : "Publier"}
                </button>
              </div>
            </div>

            {/* Ligne 2 : onglets */}
            <div style={{ display: "flex", gap: "0", borderTop: "1px solid rgba(248,246,241,.08)" }}>
              {(["content", "seo", "settings"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`aee-tab${activeTab === tab ? " active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ color: activeTab === tab ? "#F8F6F1" : "rgba(248,246,241,.4)", borderBottomColor: activeTab === tab ? "#C08435" : "transparent" }}
                >
                  {tab === "content" ? "Contenu éditorial" : tab === "seo" ? "SEO & Meta" : "Paramètres"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══ CORPS ══ */}
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "2rem clamp(1rem,3vw,2.5rem)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>

            {/* ── Colonne principale ── */}
            <div>
              {/* ════ ONGLET CONTENU ════ */}
              {activeTab === "content" && (
                <>
                  {/* Infos principales */}
                  <div style={sectionStyle}>
                    <p style={sectionTitleStyle}>Informations générales</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                      {/* Titre */}
                      <div>
                        <label style={labelStyle}>Titre *</label>
                        <input
                          className="aee-input"
                          style={{ ...inputStyle, fontSize: "1rem", fontWeight: 700, fontFamily: "'Fraunces', Georgia, serif" }}
                          value={form.title}
                          placeholder="Titre de l'événement…"
                          onChange={(e) => handleTitleChange(e.target.value)}
                        />
                      </div>

                      {/* Slug */}
                      <div>
                        <label style={labelStyle}>Slug URL</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: ".9rem", top: "50%", transform: "translateY(-50%)", color: "#928E80", fontSize: ".72rem" }}>
                            /evenements/
                          </span>
                          <input
                            className="aee-input"
                            style={{ ...inputStyle, paddingLeft: "7.5rem" }}
                            value={form.slug}
                            placeholder="slug-url"
                            onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                          />
                        </div>
                      </div>

                      {/* Description courte */}
                      <div>
                        <label style={labelStyle}>Description / Extrait</label>
                        <textarea
                          className="aee-input"
                          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                          value={form.description}
                          placeholder="Résumé court de l'événement affiché dans les listes…"
                          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        />
                      </div>

                      {/* Type + Flag */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                          <label style={labelStyle}>Type d'événement *</label>
                          <select
                            className="aee-input"
                            style={{ ...inputStyle, appearance: "auto" }}
                            value={form.type}
                            onChange={(e) => handleTypeChange(e.target.value as EventType)}
                          >
                            {EVENT_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Drapeau</label>
                          <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                            <select
                              className="aee-input"
                              style={{ ...inputStyle, width: 90, fontSize: "1.2rem" }}
                              value={form.flag}
                              onChange={(e) => setForm((f) => ({ ...f, flag: e.target.value }))}
                            >
                              {FLAGS.map((fl) => (
                                <option key={fl} value={fl}>{fl}</option>
                              ))}
                            </select>
                            <span style={{ fontSize: "1.6rem" }}>{form.flag}</span>
                          </div>
                        </div>
                      </div>

                      {/* Lieu + Pays */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                          <label style={labelStyle}>Lieu / Ville *</label>
                          <input
                            className="aee-input"
                            style={inputStyle}
                            value={form.location}
                            placeholder="ex : Nairobi"
                            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Pays</label>
                          <input
                            className="aee-input"
                            style={inputStyle}
                            value={form.country}
                            placeholder="ex : Kenya"
                            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Date + Participants */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                          <label style={labelStyle}>Date de l'événement *</label>
                          <input
                            type="date"
                            className="aee-input"
                            style={inputStyle}
                            value={form.event_date}
                            onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Participants attendus</label>
                          <input
                            className="aee-input"
                            style={inputStyle}
                            value={form.attendees}
                            placeholder="ex : 5 000+"
                            onChange={(e) => setForm((f) => ({ ...f, attendees: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Organisateur + URL inscription */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                          <label style={labelStyle}>Organisateur</label>
                          <input
                            className="aee-input"
                            style={inputStyle}
                            value={form.organizer}
                            placeholder="ex : AfricaTech Foundation"
                            onChange={(e) => setForm((f) => ({ ...f, organizer: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>URL d'inscription directe</label>
                          <input
                            className="aee-input"
                            style={inputStyle}
                            value={form.register_url}
                            placeholder="https://…"
                            onChange={(e) => setForm((f) => ({ ...f, register_url: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image de couverture */}
                  <div style={sectionStyle}>
                    <p style={sectionTitleStyle}>Image de couverture</p>
                    <div>
                      {form.cover_url ? (
                        <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", marginBottom: "1rem" }}>
                          <img src={form.cover_url} alt="Cover" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                          <button
                            onClick={() => setForm((f) => ({ ...f, cover_url: "" }))}
                            style={{ position: "absolute", top: ".5rem", right: ".5rem", background: "rgba(0,0,0,.6)", color: "#fff", border: "none", borderRadius: 8, padding: ".3rem .7rem", fontSize: ".7rem", cursor: "pointer" }}
                          >
                            ✕ Supprimer
                          </button>
                        </div>
                      ) : (
                        <div
                          className="aee-cover-zone"
                          style={{ padding: "2.5rem 1rem", marginBottom: "1rem" }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploadingCover ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem" }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid rgba(192,132,53,.2)", borderTopColor: "#C08435", animation: "aee-spin .8s linear infinite" }} />
                              <span style={{ fontSize: ".72rem", color: "#928E80" }}>Upload en cours…</span>
                            </div>
                          ) : (
                            <>
                              <div style={{ color: "#C4C0B6", marginBottom: ".5rem" }}><IcoUpload /></div>
                              <p style={{ fontSize: ".78rem", fontWeight: 700, color: "#38382E", marginBottom: ".2rem" }}>Cliquez pour uploader une image</p>
                              <p style={{ fontSize: ".65rem", color: "#928E80" }}>JPG, PNG ou WebP · max 5 Mo · 1200×628 recommandé</p>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        className="aee-input"
                        style={inputStyle}
                        value={form.cover_url}
                        placeholder="Ou collez une URL d'image externe…"
                        onChange={(e) => setForm((f) => ({ ...f, cover_url: e.target.value }))}
                      />
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />
                    </div>

                    {/* Gradient preview */}
                    <div style={{ marginTop: "1rem" }}>
                      <label style={labelStyle}>Gradient de fond (CSS)</label>
                      <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: form.image_gradient, flexShrink: 0, border: "1px solid rgba(20,20,16,.1)" }} />
                        <input
                          className="aee-input"
                          style={{ ...inputStyle, fontFamily: "monospace", fontSize: ".7rem" }}
                          value={form.image_gradient}
                          onChange={(e) => setForm((f) => ({ ...f, image_gradient: e.target.value }))}
                        />
                      </div>
                      <div style={{ display: "flex", gap: ".4rem", marginTop: ".6rem", flexWrap: "wrap" }}>
                        {EVENT_TYPES.map((t) => (
                          <button
                            key={t}
                            title={t}
                            onClick={() => setForm((f) => ({ ...f, image_gradient: TYPE_GRADIENT[t] }))}
                            style={{
                              width: 28, height: 28, borderRadius: 7, border: form.image_gradient === TYPE_GRADIENT[t] ? `2px solid ${TYPE_COLOR[t]}` : "1px solid rgba(20,20,16,.1)",
                              background: TYPE_GRADIENT[t], cursor: "pointer",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Blocs de contenu éditoriaux */}
                  <div style={sectionStyle}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem", paddingBottom: ".6rem", borderBottom: "1px solid rgba(20,20,16,.07)" }}>
                      <p style={{ ...sectionTitleStyle, margin: 0, border: "none", padding: 0 }}>
                        Contenu éditorial
                      </p>
                      <span style={{ fontSize: ".6rem", color: "#928E80" }}>
                        {form.content.length} bloc{form.content.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Liste des blocs */}
                    {form.content.length === 0 && (
                      <div style={{ textAlign: "center", padding: "2rem 0", color: "#C4C0B6" }}>
                        <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>✍️</div>
                        <p style={{ fontSize: ".78rem" }}>Aucun bloc de contenu encore.</p>
                        <p style={{ fontSize: ".7rem" }}>Ajoutez des blocs pour construire le contenu de la page.</p>
                      </div>
                    )}
                    {form.content.map((block, i) => (
                      <BlockEditor
                        key={i}
                        block={block}
                        index={i}
                        total={form.content.length}
                        onChange={(b) => updateBlock(i, b)}
                        onDelete={() => deleteBlock(i)}
                        onMove={(dir) => moveBlock(i, dir)}
                      />
                    ))}

                    {/* Ajouter un bloc */}
                    {addingBlock ? (
                      <div style={{ background: "#FAFAF8", border: "1px solid rgba(20,20,16,.1)", borderRadius: 12, padding: "1rem", marginTop: ".5rem" }}>
                        <label style={labelStyle}>Type de bloc</label>
                        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                          {BLOCK_TYPES.map((bt) => (
                            <button
                              key={bt.value}
                              onClick={() => setNewBlockType(bt.value)}
                              style={{
                                padding: ".3rem .75rem", borderRadius: 100,
                                border: newBlockType === bt.value ? "2px solid #C08435" : "1px solid rgba(20,20,16,.12)",
                                background: newBlockType === bt.value ? "#FDF4E7" : "#fff",
                                color: newBlockType === bt.value ? "#C08435" : "#928E80",
                                fontSize: ".62rem", fontWeight: 700, cursor: "pointer",
                                transition: "all .15s",
                              }}
                            >
                              {bt.label}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: ".6rem" }}>
                          <button
                            className="aee-btn"
                            onClick={addBlock}
                            style={{ background: "#C08435", color: "#fff" }}
                          >
                            <IcoPlus /> Insérer
                          </button>
                          <button
                            className="aee-btn"
                            onClick={() => setAddingBlock(false)}
                            style={{ background: "transparent", color: "#928E80", border: "1px solid rgba(20,20,16,.12)" }}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingBlock(true)}
                        style={{
                          width: "100%", padding: ".85rem",
                          borderRadius: 12, border: "2px dashed rgba(192,132,53,.35)",
                          background: "rgba(192,132,53,.03)",
                          color: "#C08435", fontSize: ".75rem", fontWeight: 700,
                          cursor: "pointer", transition: "all .2s", marginTop: ".25rem",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(192,132,53,.07)";
                          e.currentTarget.style.borderColor = "#C08435";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(192,132,53,.03)";
                          e.currentTarget.style.borderColor = "rgba(192,132,53,.35)";
                        }}
                      >
                        <IcoPlus /> Ajouter un bloc de contenu
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ════ ONGLET SEO ════ */}
              {activeTab === "seo" && (
                <div style={sectionStyle}>
                  <p style={sectionTitleStyle}>SEO & Métadonnées</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Meta Title</label>
                      <input
                        className="aee-input"
                        style={inputStyle}
                        value={(form as any).meta_title ?? ""}
                        placeholder={`${form.title} | AfriPulse`}
                        onChange={(e) => setForm((f: any) => ({ ...f, meta_title: e.target.value }))}
                      />
                      <p style={{ fontSize: ".6rem", color: "#928E80", marginTop: ".25rem" }}>
                        {((form as any).meta_title ?? "").length} / 60 caractères recommandés
                      </p>
                    </div>
                    <div>
                      <label style={labelStyle}>Meta Description</label>
                      <textarea
                        className="aee-input"
                        style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                        value={(form as any).meta_desc ?? ""}
                        placeholder={form.description.slice(0, 155) + "…"}
                        onChange={(e) => setForm((f: any) => ({ ...f, meta_desc: e.target.value }))}
                      />
                      <p style={{ fontSize: ".6rem", color: "#928E80", marginTop: ".25rem" }}>
                        {((form as any).meta_desc ?? "").length} / 155 caractères recommandés
                      </p>
                    </div>
                    {/* Aperçu SERP */}
                    <div>
                      <label style={labelStyle}>Aperçu Google (SERP)</label>
                      <div style={{ background: "#FAFAF8", border: "1px solid rgba(20,20,16,.1)", borderRadius: 10, padding: "1rem 1.25rem" }}>
                        <div style={{ fontSize: ".7rem", color: "#928E80", marginBottom: ".2rem" }}>
                          afripulse.com › evenements › {form.slug || "slug-url"}
                        </div>
                        <div style={{ fontSize: ".9rem", color: "#1a0dab", fontWeight: 700, marginBottom: ".25rem" }}>
                          {(form as any).meta_title || form.title || "Titre de l'événement"} | AfriPulse
                        </div>
                        <div style={{ fontSize: ".78rem", color: "#545454", lineHeight: 1.5 }}>
                          {(form as any).meta_desc || form.description || "Description de l'événement qui apparaîtra dans les résultats de recherche Google."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ ONGLET PARAMÈTRES ════ */}
              {activeTab === "settings" && (
                <div style={sectionStyle}>
                  <p style={sectionTitleStyle}>Paramètres avancés</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                    {/* Publié */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".85rem 1rem", background: "#FAFAF8", borderRadius: 10, border: "1px solid rgba(20,20,16,.08)" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: ".82rem", color: "#141410" }}>Publication</div>
                        <div style={{ fontSize: ".65rem", color: "#928E80" }}>Rendre cet événement visible sur le site</div>
                      </div>
                      <button
                        onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                        style={{
                          position: "relative", width: 44, height: 26, borderRadius: 100,
                          border: "none", cursor: "pointer", background: form.published ? "#1A5C40" : "rgba(20,20,16,.2)",
                          transition: "background .2s", flexShrink: 0,
                        }}
                      >
                        <span style={{
                          position: "absolute", width: 20, height: 20, borderRadius: "50%",
                          background: "#fff", top: 3, transition: "transform .2s",
                          transform: form.published ? "translateX(21px)" : "translateX(3px)",
                          boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                        }} />
                      </button>
                    </div>

                    {/* Vedette */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".85rem 1rem", background: "#FAFAF8", borderRadius: 10, border: "1px solid rgba(20,20,16,.08)" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: ".82rem", color: "#141410" }}>Événement vedette ★</div>
                        <div style={{ fontSize: ".65rem", color: "#928E80" }}>Mis en avant dans la section principale de la liste</div>
                      </div>
                      <button
                        onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
                        style={{
                          position: "relative", width: 44, height: 26, borderRadius: 100,
                          border: "none", cursor: "pointer", background: form.featured ? "#C08435" : "rgba(20,20,16,.2)",
                          transition: "background .2s", flexShrink: 0,
                        }}
                      >
                        <span style={{
                          position: "absolute", width: 20, height: 20, borderRadius: "50%",
                          background: "#fff", top: 3, transition: "transform .2s",
                          transform: form.featured ? "translateX(21px)" : "translateX(3px)",
                          boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                        }} />
                      </button>
                    </div>

                    {/* Tags */}
                    <div>
                      <label style={labelStyle}>Tags</label>
                      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".6rem" }}>
                        {form.tags.map((tag) => (
                          <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: ".3rem", padding: ".22rem .75rem", borderRadius: 100, background: "#F0EDE4", color: "#38382E", fontSize: ".65rem", fontWeight: 700 }}>
                            {tag}
                            <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "#928E80", padding: 0, lineHeight: 1, fontSize: ".7rem" }}>×</button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: ".5rem" }}>
                        <input
                          className="aee-input"
                          style={{ ...inputStyle, flex: 1 }}
                          value={tagInput}
                          placeholder="Ajouter un tag…"
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); addTag(); }
                          }}
                        />
                        <button
                          className="aee-btn"
                          onClick={addTag}
                          style={{ background: "#F0EDE4", color: "#38382E", border: "1px solid rgba(20,20,16,.12)", flexShrink: 0 }}
                        >
                          <IcoPlus /> Ajouter
                        </button>
                      </div>
                    </div>

                    {/* Danger zone */}
                    {!isNew && (
                      <div style={{ marginTop: ".5rem", padding: "1rem", background: "#FAEBE8", borderRadius: 10, border: "1px solid rgba(184,52,30,.15)" }}>
                        <div style={{ fontWeight: 700, fontSize: ".78rem", color: "#B8341E", marginBottom: ".4rem" }}>Zone dangereuse</div>
                        <p style={{ fontSize: ".68rem", color: "#B8341E", marginBottom: ".75rem", opacity: .8 }}>
                          Cette action est irréversible. L'événement et tout son contenu seront définitivement supprimés.
                        </p>
                        <button
                          className="aee-btn"
                          style={{ background: "#B8341E", color: "#fff" }}
                          onClick={async () => {
                            if (!confirm(`Supprimer définitivement « ${form.title} » ? Cette action est irréversible.`)) return;
                            const { error } = await sb.from("events").delete().eq("id", params.id);
                            if (!error) router.push("/admin/evenements");
                          }}
                        >
                          <IcoTrash /> Supprimer définitivement
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar droite ── */}
            <div style={{ position: "sticky", top: 112 }}>

              {/* Aperçu carte */}
              <div style={{ ...sectionStyle, padding: 0, overflow: "hidden", marginBottom: "1rem" }}>
                <div style={{ height: 120, background: form.image_gradient, position: "relative", display: "flex", alignItems: "flex-end", padding: ".75rem" }}>
                  {form.cover_url && (
                    <img src={form.cover_url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 60%)" }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <span style={{ fontSize: ".55rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", padding: ".18rem .6rem", borderRadius: 100, background: typeColor, color: "#fff" }}>
                      {form.type || "Type"}
                    </span>
                  </div>
                  <span style={{ position: "absolute", top: ".75rem", right: ".75rem", fontSize: "1.4rem" }}>{form.flag}</span>
                </div>
                <div style={{ padding: "1rem" }}>
                  <div style={{ fontWeight: 800, fontSize: ".82rem", color: "#141410", marginBottom: ".3rem", lineHeight: 1.35 }}>
                    {form.title || "Titre de l'événement"}
                  </div>
                  <div style={{ fontSize: ".62rem", color: "#928E80", display: "flex", flexDirection: "column", gap: ".15rem" }}>
                    {form.event_date && (
                      <span>📅 {new Date(form.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                    )}
                    {form.location && <span>📍 {form.location}{form.country ? `, ${form.country}` : ""}</span>}
                    {form.organizer && <span>🏛️ {form.organizer}</span>}
                    {form.attendees && <span>👥 {form.attendees} participants</span>}
                  </div>
                </div>
              </div>

              {/* Publication rapide */}
              <div style={sectionStyle}>
                <p style={sectionTitleStyle}>Publication</p>
                <div style={{ display: "flex", flexDirection: "column", gap: ".65rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".72rem" }}>
                    <span style={{ color: "#928E80" }}>Statut</span>
                    <span style={{ fontWeight: 700, color: form.published ? "#1A5C40" : "#928E80" }}>
                      {form.published ? "● Publié" : "○ Brouillon"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".72rem" }}>
                    <span style={{ color: "#928E80" }}>Vedette</span>
                    <span style={{ fontWeight: 700, color: form.featured ? "#C08435" : "#928E80" }}>
                      {form.featured ? "★ Oui" : "Non"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".72rem" }}>
                    <span style={{ color: "#928E80" }}>Blocs</span>
                    <span style={{ fontWeight: 700, color: "#38382E" }}>
                      {form.content.length} bloc{form.content.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ height: 1, background: "rgba(20,20,16,.07)", margin: ".2rem 0" }} />
                  <button
                    className="aee-btn"
                    disabled={saving || publishing}
                    onClick={() => save()}
                    style={{ background: "#F0EDE4", color: "#38382E", width: "100%", justifyContent: "center", border: "1px solid rgba(20,20,16,.1)" }}
                  >
                    {saving ? <span className="aee-spinner" style={{ borderTopColor: "#38382E" }} /> : <IcoSave />}
                    {saving ? "Sauvegarde…" : "Sauvegarder"}
                  </button>
                  <button
                    className="aee-btn"
                    disabled={saving || publishing}
                    onClick={() => save(!form.published)}
                    style={{ background: form.published ? "#B8341E" : "#C08435", color: "#fff", width: "100%", justifyContent: "center" }}
                  >
                    {publishing ? <span className="aee-spinner" /> : null}
                    {publishing ? "En cours…" : form.published ? "Dépublier" : "Publier l'événement"}
                  </button>
                </div>
              </div>

              {/* Infos complémentaires */}
              <div style={{ ...sectionStyle, fontSize: ".68rem", color: "#928E80" }}>
                <p style={{ ...sectionTitleStyle, marginBottom: ".75rem" }}>Conseils</p>
                <ul style={{ margin: 0, padding: "0 0 0 1rem", lineHeight: 1.7 }}>
                  <li>Ajoutez un bloc <strong>Agenda</strong> pour le programme détaillé</li>
                  <li>Utilisez <strong>Intervenants</strong> pour présenter les speakers</li>
                  <li>Le bloc <strong>Inscription CTA</strong> génère le bouton d'appel à l'action</li>
                  <li>Ajoutez <strong>Localisation</strong> pour une carte intégrée</li>
                  <li>Slug & SEO auto-générés — vérifiez avant publication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}