"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { createClient } from "@/lib/supabase/client";
import type { Block, ArticleContent } from "@/types/blocks";

/* ─── Palettes catégorie ─── */
const CAT: Record<string, { color: string; bg: string; dark: string }> = {
  Politique: { color: "#1E4DA8", bg: "#EBF0FB", dark: "#152F6B" },
  Économie: { color: "#C08435", bg: "#FBF4E8", dark: "#7A4F0E" },
  Tech: { color: "#1A5C40", bg: "#EAF4EF", dark: "#0F3828" },
  Sport: { color: "#B8341E", bg: "#FAEBE8", dark: "#8A2112" },
  Culture: { color: "#7A4A1E", bg: "#FDF3E8", dark: "#5C3212" },
  Santé: { color: "#1A5C5C", bg: "#E6F4F4", dark: "#0F3838" },
  Environnement: { color: "#2D6B3B", bg: "#E6F4EA", dark: "#1A4224" },
};

/* ─── Article tel que retourné par Supabase ─── */
interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: ArticleContent | null;
  category: string;
  author_id: string | null;
  author_name: string;
  date: string;
  reading_time: number;
  featured: boolean;
  published: boolean;
  published_at: string | null;
  cover_url: string | null;
  image_gradient: string;
  tags: string[];
  views: number;
  created_at: string;
}

/* ─── Profil auteur ─── */
interface AuthorProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

/* ─── Icônes ─── */
const IcoArrow = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const IcoClock = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
const IcoShare = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const IcoBookmark = ({ on }: { on: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill={on ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

/* ══════════════════════════════════════════════════════════
   RENDU DES BLOCS
   Tous les types de l'éditeur admin sont supportés
══════════════════════════════════════════════════════════ */
function RenderBlock({
  block,
  index,
  cs,
  related,
}: {
  block: Block;
  index: number;
  cs: { color: string; bg: string; dark: string };
  related: ArticleRow[];
}) {
  switch (block.type) {
    /* ─ Paragraphe ─────────────────────────────────────── */
    case "paragraph":
      return <p className="sl-p">{block.text}</p>;

    /* ─ Titre ──────────────────────────────────────────── */
    case "heading":
      if (block.level === 3) {
        return (
          <h3
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(1.05rem, 1.8vw, 1.3rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              margin: "2rem 0 0.85rem",
              color: cs.dark,
            }}
          >
            {block.text}
          </h3>
        );
      }
      return (
        <h2 className="sl-h2" style={{ color: cs.dark }}>
          {block.text}
        </h2>
      );

    /* ─ Citation mise en avant ──────────────────────────── */
    case "pullquote":
      return (
        <blockquote className="sl-quote" style={{ borderLeftColor: cs.color }}>
          <div
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "2.8rem",
              lineHeight: 1,
              fontWeight: 900,
              color: cs.color,
              marginBottom: "0.6rem",
            }}
          >
            "
          </div>
          <p
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(1.05rem, 1.8vw, 1.3rem)",
              fontWeight: 600,
              fontStyle: "italic",
              color: "#141410",
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {block.text}
          </p>
          {(block.author || block.role) && (
            <footer style={{ marginTop: "1.1rem" }}>
              {block.author && (
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: cs.color,
                    letterSpacing: "0.05em",
                  }}
                >
                  — {block.author}
                </div>
              )}
              {block.role && (
                <div
                  style={{
                    fontSize: "0.63rem",
                    color: "#928E80",
                    marginTop: "0.15rem",
                  }}
                >
                  {block.role}
                </div>
              )}
            </footer>
          )}
        </blockquote>
      );

    /* ─ Image ──────────────────────────────────────────── */
    case "image":
      return (
        <figure style={{ margin: "2.2rem 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.url}
            alt={block.alt}
            style={{ width: "100%", borderRadius: 16, display: "block" }}
          />
          {(block.caption || block.credit) && (
            <figcaption
              style={{
                fontSize: "0.68rem",
                color: "#928E80",
                marginTop: "0.55rem",
                lineHeight: 1.5,
              }}
            >
              {block.caption}
              {block.credit && (
                <span style={{ marginLeft: "0.5rem", opacity: 0.7 }}>
                  {block.credit}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      );

    /* ─ Vidéo ──────────────────────────────────────────── */
    case "video":
      return (
        <div
          style={{
            margin: "2.2rem 0",
            borderRadius: 16,
            overflow: "hidden",
            aspectRatio: "16/9",
            background: "#000",
          }}
        >
          <iframe
            src={block.url}
            style={{ width: "100%", height: "100%", border: "none" }}
            allowFullScreen
            title={block.caption ?? "Vidéo"}
          />
          {block.caption && (
            <p
              style={{
                fontSize: "0.68rem",
                color: "#928E80",
                marginTop: "0.55rem",
              }}
            >
              {block.caption}
            </p>
          )}
        </div>
      );

    /* ─ Boîte de faits ─────────────────────────────────── */
    case "factbox":
      return (
        <div
          className="sl-keyfacts"
          style={{ borderTopColor: cs.color, background: cs.bg }}
        >
          <div
            style={{
              fontSize: "0.58rem",
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: cs.color,
              marginBottom: "1.1rem",
            }}
          >
            {block.title}
          </div>
          <div className="sl-facts-grid">
            {block.facts.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "0.65rem",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: cs.color,
                    flexShrink: 0,
                    marginTop: "0.28rem",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#38382E",
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    /* ─ Checklist ──────────────────────────────────────── */
    case "checklist":
      return (
        <div style={{ margin: "2rem 0" }}>
          {block.title && (
            <div
              style={{
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: cs.color,
                marginBottom: "1rem",
              }}
            >
              {block.title}
            </div>
          )}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            {block.items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "0.85rem",
                  alignItems: "flex-start",
                  padding: "0.9rem 1.1rem",
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid rgba(20,20,16,.07)",
                  boxShadow: "0 1px 4px rgba(20,20,16,.04)",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: cs.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={cs.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#141410",
                      lineHeight: 1.35,
                    }}
                  >
                    {item.label}
                  </div>
                  {item.detail && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#928E80",
                        marginTop: "0.2rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.detail}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    /* ─ Étapes numérotées ──────────────────────────────── */
    case "steps":
      return (
        <div style={{ margin: "2rem 0" }}>
          {block.title && (
            <div
              style={{
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: cs.color,
                marginBottom: "1.25rem",
              }}
            >
              {block.title}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {block.items.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                  position: "relative",
                }}
              >
                {i < block.items.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 18,
                      top: 40,
                      width: 2,
                      height: "calc(100% - 20px)",
                      background: `linear-gradient(180deg,${cs.color}40,transparent)`,
                    }}
                  />
                )}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: `linear-gradient(135deg,${cs.color},${cs.dark})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: "0.85rem",
                    fontWeight: 900,
                    color: "#fff",
                    boxShadow: `0 4px 12px ${cs.color}44`,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    flex: 1,
                    paddingTop: "0.5rem",
                    paddingBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#141410",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "#928E80",
                      lineHeight: 1.65,
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    /* ─ Avantages (grille icônes) ──────────────────────── */
    case "benefits":
      return (
        <div
          style={{
            margin: "2rem 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "0.85rem",
          }}
        >
          {block.items.map((b, i) => (
            <div
              key={i}
              style={{
                padding: "1.1rem",
                borderRadius: 16,
                background: b.highlight ? cs.bg : "#fff",
                border: `1px solid ${b.highlight ? cs.color : "rgba(20,20,16,.08)"}`,
                boxShadow: "0 1px 4px rgba(20,20,16,.04)",
              }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>
                {b.icon}
              </div>
              <div
                style={{
                  fontSize: "0.58rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: b.highlight ? cs.color : "#928E80",
                  marginBottom: "0.25rem",
                }}
              >
                {b.label}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#141410",
                  lineHeight: 1.35,
                }}
              >
                {b.value}
              </div>
            </div>
          ))}
        </div>
      );

    /* ─ Tableau comparatif ─────────────────────────────── */
    case "compare":
      return (
        <div style={{ margin: "2rem 0", overflowX: "auto" }}>
          {block.title && (
            <div
              style={{
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: cs.color,
                marginBottom: "1rem",
              }}
            >
              {block.title}
            </div>
          )}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
              background: "#fff",
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(20,20,16,.08)",
            }}
          >
            <thead>
              <tr style={{ background: cs.bg }}>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: cs.color,
                  }}
                />
                {block.columns.map((col, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: cs.color,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{ borderTop: "1px solid rgba(20,20,16,.06)" }}
                >
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontWeight: 600,
                      color: "#141410",
                      fontSize: "0.82rem",
                    }}
                  >
                    {row.label}
                  </td>
                  {row.values.map((val, vi) => (
                    <td
                      key={vi}
                      style={{
                        padding: "0.75rem 1rem",
                        color: "#38382E",
                        fontSize: "0.82rem",
                      }}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    /* ─ Alerte / Info ──────────────────────────────────── */
    case "alert": {
      const alertColors: Record<string, string> = {
        info: "#1A5C5C",
        warning: "#C08435",
        tip: "#1A5C40",
      };
      const alertIcons: Record<string, string> = {
        info: "ℹ️",
        warning: "⚠️",
        tip: "💡",
      };
      const v = block.variant ?? "info";
      return (
        <div
          style={{
            margin: "1.8rem 0",
            padding: "1.1rem 1.4rem",
            borderLeft: `4px solid ${alertColors[v]}`,
            background: `${alertColors[v]}10`,
            borderRadius: "0 12px 12px 0",
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>
            {alertIcons[v]}
          </span>
          <p
            style={{
              fontSize: "0.88rem",
              color: "#38382E",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {block.message}
          </p>
        </div>
      );
    }

    /* ─ Lien externe ───────────────────────────────────── */
    case "external":
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.9rem",
            margin: "1.8rem 0",
            padding: "1rem 1.4rem",
            borderRadius: 14,
            border: "1px solid rgba(20,20,16,.1)",
            background: "#fff",
            textDecoration: "none",
            color: "#141410",
            boxShadow: "0 2px 8px rgba(20,20,16,.05)",
          }}
        >
          {block.favicon &&
            (block.favicon.startsWith("http") ||
            block.favicon.startsWith("/") ? (
              <img
                src={block.favicon}
                alt=""
                style={{ width: 20, height: 20, borderRadius: 4 }}
              />
            ) : (
              <span style={{ fontSize: "1.2rem" }}>{block.favicon}</span>
            ))}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>
              {block.label}
            </div>
            {block.description && (
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#928E80",
                  marginTop: "0.15rem",
                }}
              >
                {block.description}
              </div>
            )}
          </div>
          <span
            style={{ fontSize: "0.72rem", color: "#928E80", flexShrink: 0 }}
          >
            ↗
          </span>
        </a>
      );

    /* ─ Article lié ────────────────────────────────────── */
    case "related": {
      const target = related.find((a) => a.slug === block.slug);
      if (!target && !block.label) return null;
      return (
        <Link
          href={`/actualites/${block.slug}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            margin: "1.8rem 0",
            padding: "0.9rem 1.4rem",
            borderLeft: `3px solid ${cs.color}`,
            background: cs.bg,
            borderRadius: "0 12px 12px 0",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              fontSize: "0.58rem",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: cs.color,
              flexShrink: 0,
            }}
          >
            À lire aussi
          </span>
          <span
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#141410",
              lineHeight: 1.35,
            }}
          >
            {target?.title ?? block.label}
          </span>
          <span style={{ marginLeft: "auto", color: cs.color, flexShrink: 0 }}>
            →
          </span>
        </Link>
      );
    }

    /* ─ Téléchargement ─────────────────────────────────── */
    case "download":
      return (
        <a
          href={block.url}
          download
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            margin: "1.2rem 0",
            padding: "0.65rem 1.4rem",
            borderRadius: 100,
            background: cs.bg,
            color: cs.color,
            fontWeight: 700,
            fontSize: "0.8rem",
            textDecoration: "none",
          }}
        >
          ↓ {block.label}
          {block.size && (
            <span style={{ opacity: 0.6, fontWeight: 400 }}>
              ({block.size})
            </span>
          )}
        </a>
      );

    /* ─ CTA Candidature ────────────────────────────────── */
    case "apply":
      return (
        <div
          style={{
            margin: "2rem 0",
            padding: "1.5rem 1.75rem",
            background: "#141410",
            borderRadius: 20,
            border: "1px solid rgba(248,246,241,.06)",
          }}
        >
          {block.deadline && (
            <div
              style={{
                fontSize: "0.58rem",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(248,246,241,.35)",
                marginBottom: "0.35rem",
              }}
            >
              Date limite : {block.deadline}
            </div>
          )}
          {block.note && (
            <p
              style={{
                fontSize: "0.82rem",
                color: "rgba(248,246,241,.55)",
                lineHeight: 1.65,
                marginBottom: "1rem",
              }}
            >
              {block.note}
            </p>
          )}
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#C08435",
              color: "#fff",
              padding: "0.85rem 1.75rem",
              borderRadius: 100,
              fontWeight: 800,
              fontSize: "0.88rem",
              textDecoration: "none",
              boxShadow: "0 6px 20px rgba(192,132,53,.4)",
            }}
          >
            {block.label} ↗
          </a>
        </div>
      );

    /* ─ Agenda ─────────────────────────────────────────── */
    case "agenda":
      return (
        <div style={{ margin: "2rem 0" }}>
          {block.title && (
            <div
              style={{
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: cs.color,
                marginBottom: "1rem",
              }}
            >
              {block.title}
            </div>
          )}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid rgba(20,20,16,.08)",
              overflow: "hidden",
            }}
          >
            {block.sessions.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                  padding: "0.9rem 1.25rem",
                  borderBottom:
                    i < block.sessions.length - 1
                      ? "1px solid rgba(20,20,16,.06)"
                      : "none",
                }}
              >
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: cs.color,
                    flexShrink: 0,
                    minWidth: 52,
                    fontFamily: "'Fraunces', Georgia, serif",
                  }}
                >
                  {s.time}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#141410",
                      lineHeight: 1.3,
                    }}
                  >
                    {s.title}
                  </div>
                  {s.speaker && (
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "#928E80",
                        marginTop: "0.2rem",
                      }}
                    >
                      {s.speaker}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    /* ─ Intervenants ───────────────────────────────────── */
    case "speakers":
      return (
        <div style={{ margin: "2rem 0" }}>
          {block.title && (
            <div
              style={{
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: cs.color,
                marginBottom: "1rem",
              }}
            >
              {block.title}
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "0.85rem",
            }}
          >
            {block.people.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: "1.1rem",
                  borderRadius: 14,
                  background: "#fff",
                  border: "1px solid rgba(20,20,16,.08)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "0.5rem",
                }}
              >
                {p.avatar ? (
                  <img
                    src={p.avatar}
                    alt={p.name}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg,${cs.color},${cs.dark})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      fontWeight: 900,
                      color: "#fff",
                    }}
                  >
                    {p.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#141410",
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: cs.color,
                      fontWeight: 600,
                    }}
                  >
                    {p.role}
                  </div>
                  {p.org && (
                    <div
                      style={{
                        fontSize: "0.65rem",
                        color: "#928E80",
                        marginTop: "0.1rem",
                      }}
                    >
                      {p.org}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    /* ─ Localisation ───────────────────────────────────── */
    case "location":
      return (
        <div
          style={{
            margin: "2rem 0",
            padding: "1.1rem 1.4rem",
            background: "#fff",
            borderRadius: 14,
            border: "1px solid rgba(20,20,16,.08)",
            boxShadow: "0 1px 4px rgba(20,20,16,.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>📍</span>
            <div>
              <div
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "#141410",
                }}
              >
                {block.label}
              </div>
              {block.address && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#928E80",
                    marginTop: "0.2rem",
                  }}
                >
                  {block.address}
                </div>
              )}
            </div>
            {block.mapUrl && (
              <a
                href={block.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginLeft: "auto",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: cs.color,
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                Voir sur la carte ↗
              </a>
            )}
          </div>
          {block.mapUrl && (
            <div
              style={{
                marginTop: "0.85rem",
                borderRadius: 10,
                overflow: "hidden",
                height: 200,
                background: "#F0EDE4",
              }}
            >
              <iframe
                src={block.mapUrl}
                width="100%"
                height="200"
                style={{ border: "none" }}
                loading="lazy"
              />
            </div>
          )}
        </div>
      );

    /* ─ Profil (compatibilité database.ts) ─────────────── */
    case "profile":
      return null;

    /* ─ Séparateur ─────────────────────────────────────── */
    case "divider":
      return (
        <hr
          style={{
            margin: "2.5rem 0",
            border: "none",
            borderTop: "1px solid rgba(20,20,16,.1)",
          }}
        />
      );

    default:
      return null;
  }
}

/* ══════════════════════════════════════════════════════════
   PAGE EXPORT
══════════════════════════════════════════════════════════ */
export default function ArticlePage({ params }: { params: { slug: string } }) {
  return <ArticleClient slug={params.slug} />;
}

/* ══════════════════════════════════════════════════════════
   COMPOSANT CLIENT — lit Supabase (publiés + brouillons admin)
══════════════════════════════════════════════════════════ */
function ArticleClient({ slug }: { slug: string }) {
  const sb = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";

  const [article, setArticle] = useState<ArticleRow | null>(null);
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [relArticles, setRelArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const viewsIncremented = useRef(false);

  /* ── Charger l'article depuis Supabase ── */
  const load = useCallback(async () => {
    let query = sb.from("articles").select("*").eq("slug", slug);
    if (!isPreview) query = query.eq("published", true);

    const { data: rawData, error } = await query.single();
    const data = rawData as ArticleRow | null;

    if (error || !data) {
      router.replace("/404");
      return;
    }

    // Parser content si Supabase retourne du JSONB en string
    const rawContent = (data as any).content;
    const parsedContent: ArticleContent =
      typeof rawContent === "string"
        ? (() => {
            try {
              return JSON.parse(rawContent);
            } catch {
              return { intro: "", blocks: [] };
            }
          })()
        : (rawContent ?? { intro: "", blocks: [] });

    setArticle({ ...data, content: parsedContent });
    console.log(data);

    // Charger le profil de l'auteur si author_id existe
    if (data.author_id) {
      const { data: profileData } = await sb
        .from("profiles")
        .select("id,full_name,avatar_url,role")
        .eq("id", data.author_id)
        .single();
      if (profileData) setAuthor(profileData as AuthorProfile);
    }

    // Incrémenter les vues — une seule fois par montage (guard contre StrictMode)
    if (!isPreview && !viewsIncremented.current) {
      viewsIncremented.current = true;
      (sb as any)
        .rpc("increment_article_views", { article_id: data.id })
        .then(({ error: rpcErr }: any) => {
          if (rpcErr) {
            (sb.from("articles") as any)
              .update({ views: ((data as any).views ?? 0) + 1 })
              .eq("id", data.id);
          }
        });
    }

    // Vérifier si l'article est sauvegardé (utilisateur connecté)
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user) {
      const { data: saveData } = await sb
        .from("saves")
        .select("id")
        .eq("user_id", user.id)
        .eq("content_type", "article")
        .eq("content_slug", slug)
        .maybeSingle();
      if (saveData) setBookmarked(true);
    }

    // Articles liés — même catégorie d'abord
    const { data: rel } = await sb
      .from("articles")
      .select(
        "id,slug,title,excerpt,category,author_name,reading_time,cover_url,image_gradient,created_at",
      )
      .eq("published", true)
      .neq("id", data.id)
      .order("category", { ascending: false })
      .limit(6);

    if (rel) {
      const sorted = [
        ...(rel as ArticleRow[]).filter((a) => a.category === data.category),
        ...(rel as ArticleRow[]).filter((a) => a.category !== data.category),
      ].slice(0, 3);
      setRelArticles(sorted);
    }

    setLoading(false);
  }, [slug, isPreview]);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Barre de progression ── */
  useEffect(() => {
    requestAnimationFrame(() => setHeroVisible(true));
    const onScroll = () => {
      const el = bodyRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const h = el.offsetHeight - window.innerHeight + 160;
      setProgress(Math.min(100, Math.max(0, (-top / h) * 100)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F6F1",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid rgba(20,20,16,.08)",
            borderTopColor: "#C08435",
            animation: "spin .8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (!article) return null;

  const cs = CAT[article.category] ?? CAT["Économie"];
  const content = {
    intro: article.content?.intro ?? article.excerpt ?? "",
    blocks: article.content?.blocks ?? [],
  };
  const headings = content.blocks.filter(
    (b): b is Extract<Block, { type: "heading" }> => b.type === "heading",
  );

  return (
    <>
      {/* Barre progression */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 9999,
          background: "rgba(20,20,16,.1)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: cs.color,
            transition: "width .12s linear",
            boxShadow: `0 0 10px ${cs.color}99`,
          }}
        />
      </div>

      {/* Bandeau aperçu brouillon */}
      {isPreview && !article.published && (
        <div
          style={{
            position: "fixed",
            top: 3,
            left: 0,
            right: 0,
            zIndex: 9998,
            background: "#C08435",
            color: "#fff",
            textAlign: "center",
            padding: "0.5rem 1rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          👁 MODE APERÇU — Cet article est un brouillon, non visible du public
          <Link
            href={`/admin/actualites/${article.id}`}
            style={{
              marginLeft: "1.5rem",
              color: "#fff",
              textDecoration: "underline",
              fontSize: "0.72rem",
            }}
          >
            ← Retour à l&apos;éditeur
          </Link>
        </div>
      )}

      <Navbar />

      <main style={{ paddingTop: isPreview && !article.published ? 34 : 0 }}>
        {/* ══ HERO ══════════════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            height: "clamp(540px, 78vh, 740px)",
            paddingTop: 64,
          }}
        >
          {/* Fond : image de couverture ou gradient */}
          {article.cover_url ? (
            <div style={{ position: "absolute", inset: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.cover_url}
                alt={article.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: heroVisible ? "scale(1)" : "scale(1.05)",
                  transition: "transform 1.4s cubic-bezier(.25,.46,.45,.94)",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: article.image_gradient,
                transform: heroVisible ? "scale(1)" : "scale(1.05)",
                transition: "transform 1.4s cubic-bezier(.25,.46,.45,.94)",
              }}
            />
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg,rgba(0,0,0,.2) 0%,transparent 28%,rgba(0,0,0,.55) 65%,rgba(0,0,0,.94) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(105deg,rgba(0,0,0,.5) 0%,transparent 52%)",
            }}
          />

          {/* Contenu hero */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "clamp(1.5rem, 5.5vw, 5rem)",
              maxWidth: 1100,
              margin: "0 auto",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.75rem",
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "none" : "translateY(10px)",
                transition: "opacity .7s .1s, transform .7s .1s",
              }}
            >
              <Link
                href="/actualites"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.48)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,.48)")
                }
              >
                <IcoArrow /> Actualités
              </Link>
              <span style={{ color: "rgba(255,255,255,.2)" }}>›</span>
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: cs.color,
                }}
              >
                {article.category}
              </span>
              {/* Badge brouillon */}
              {!article.published && (
                <span
                  style={{
                    fontSize: "0.55rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "0.2rem 0.6rem",
                    borderRadius: 100,
                    background: "#C08435",
                    color: "#fff",
                  }}
                >
                  BROUILLON
                </span>
              )}
            </div>

            <h1
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(1.9rem, 5vw, 4rem)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1.04,
                color: "#F8F6F1",
                maxWidth: "20ch",
                marginBottom: "1.75rem",
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "none" : "translateY(22px)",
                transition: "opacity .9s .22s, transform .9s .22s",
              }}
            >
              {article.title}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(0.75rem, 2vw, 1.5rem)",
                flexWrap: "wrap",
                opacity: heroVisible ? 1 : 0,
                transition: "opacity .8s .42s",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
              >
                <Link
                  href={
                    article.author_id ? `/profil/${article.author_id}` : "#"
                  }
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg,${cs.color},${cs.dark})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.65rem",
                      fontWeight: 900,
                      color: "#fff",
                      border: "2px solid rgba(255,255,255,.18)",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {author?.avatar_url ? (
                      <img
                        src={author.avatar_url}
                        alt={article.author_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      article.author_name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#F8F6F1",
                      }}
                    >
                      {article.author_name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6rem",
                        color: "rgba(255,255,255,.38)",
                      }}
                    >
                      {new Date(
                        article.published_at ?? article.created_at,
                      ).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </Link>
              </div>
              <div
                style={{
                  width: 1,
                  height: 28,
                  background: "rgba(255,255,255,.14)",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.65rem",
                  color: "rgba(255,255,255,.45)",
                  fontWeight: 500,
                }}
              >
                <IcoClock /> {article.reading_time} min de lecture
              </div>
              <span
                style={{
                  fontSize: "0.58rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "0.25rem 0.85rem",
                  borderRadius: 100,
                  background: cs.color,
                  color: "#fff",
                }}
              >
                {article.category}
              </span>
            </div>
          </div>
        </section>

        {/* ══ CORPS + SIDEBAR ═══════════════════════════════ */}
        <div style={{ background: "#F8F6F1" }} ref={bodyRef}>
          <div
            style={{
              maxWidth: 1340,
              margin: "0 auto",
              padding: "0 clamp(1rem, 5vw, 4rem)",
            }}
          >
            <div className="sl-layout">
              {/* ── Article ── */}
              <article className="sl-main">
                {/* Chapô */}
                <div
                  style={{
                    paddingTop: "3.5rem",
                    paddingBottom: "2.5rem",
                    borderBottom: "1px solid rgba(20,20,16,.08)",
                  }}
                >
                  <div
                    style={{
                      width: "2.8rem",
                      height: 3,
                      background: cs.color,
                      borderRadius: 100,
                      marginBottom: "1.6rem",
                    }}
                  />
                  <p className="sl-lead" style={{ borderLeftColor: cs.color }}>
                    {content.intro || article.excerpt}
                  </p>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    padding: "1.5rem 0",
                    borderBottom: "1px solid rgba(20,20,16,.07)",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={async () => {
                      const {
                        data: { user },
                      } = await sb.auth.getUser();
                      if (!user) {
                        router.push("/connexion");
                        return;
                      }
                      if (bookmarked) {
                        await sb
                          .from("saves")
                          .delete()
                          .eq("user_id", user.id)
                          .eq("content_type", "article")
                          .eq("content_slug", slug);
                        setBookmarked(false);
                      } else {
                        await sb.from("saves").insert({
                          user_id: user.id,
                          content_type: "article",
                          content_slug: slug,
                          content_title: article.title,
                        } as any);
                        setBookmarked(true);
                      }
                    }}
                    className="sl-btn"
                    style={
                      bookmarked
                        ? {
                            background: cs.bg,
                            color: cs.color,
                            borderColor: cs.color,
                          }
                        : {}
                    }
                  >
                    <IcoBookmark on={bookmarked} />
                    {bookmarked ? "Sauvegardé" : "Sauvegarder"}
                  </button>
                  <button
                    className="sl-btn"
                    onClick={() =>
                      navigator.share?.({
                        title: article.title,
                        url: window.location.href,
                      })
                    }
                  >
                    <IcoShare /> Partager
                  </button>
                  <div
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 4,
                        background: "rgba(20,20,16,.1)",
                        borderRadius: 100,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: cs.color,
                          borderRadius: 100,
                          width: `${progress}%`,
                          transition: "width .18s",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "0.6rem",
                        color: "#928E80",
                        fontWeight: 600,
                      }}
                    >
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                {/* Blocs de contenu */}
                <div className="sl-body">
                  {(content.blocks ?? []).map((block, bi) => (
                    <RenderBlock
                      key={bi}
                      block={block}
                      index={bi}
                      cs={cs}
                      related={relArticles}
                    />
                  ))}
                </div>

                {/* Footer article */}
                <div
                  style={{
                    paddingTop: "2.5rem",
                    borderTop: "2px solid rgba(20,20,16,.08)",
                    paddingBottom: "3rem",
                  }}
                >
                  {article.tags && article.tags.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.45rem",
                        flexWrap: "wrap",
                        marginBottom: "2rem",
                      }}
                    >
                      {article.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: "0.58rem",
                            fontWeight: 800,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            padding: "0.25rem 0.78rem",
                            borderRadius: 100,
                            background: cs.bg,
                            color: cs.color,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className="sl-author"
                    style={{ borderLeftColor: cs.color }}
                  >
                    <Link
                      href={
                        article.author_id ? `/profil/${article.author_id}` : "#"
                      }
                      style={{ textDecoration: "none", flexShrink: 0 }}
                    >
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg,${cs.color},${cs.dark})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.05rem",
                          fontWeight: 900,
                          color: "#fff",
                          overflow: "hidden",
                          transition: "opacity .18s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "0.8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        {author?.avatar_url ? (
                          <img
                            src={author.avatar_url}
                            alt={article.author_name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          article.author_name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        )}
                      </div>
                    </Link>
                    <div>
                      <div
                        style={{
                          fontSize: "0.58rem",
                          fontWeight: 800,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: cs.color,
                          marginBottom: "0.25rem",
                        }}
                      >
                        Journaliste
                      </div>
                      <Link
                        href={
                          article.author_id
                            ? `/profil/${article.author_id}`
                            : "#"
                        }
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          style={{
                            fontFamily: "'Fraunces', Georgia, serif",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "#141410",
                            transition: "color .15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = cs.color)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#141410")
                          }
                        >
                          {article.author_name}
                        </div>
                      </Link>
                      <div
                        style={{
                          fontSize: "0.65rem",
                          color: "#928E80",
                          marginTop: "0.18rem",
                        }}
                      >
                        Correspondant AroMe · Publié le{" "}
                        {new Date(
                          article.published_at ?? article.created_at,
                        ).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* ── Sidebar sticky ── */}
              <aside className="sl-sidebar">
                {/* Progression */}
                <div className="sl-card">
                  <div className="sl-card-label">Progression</div>
                  <div
                    style={{
                      height: 6,
                      background: "rgba(20,20,16,.09)",
                      borderRadius: 100,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 100,
                        background: cs.color,
                        width: `${progress}%`,
                        transition: "width .18s",
                        boxShadow: `0 0 8px ${cs.color}55`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.6rem",
                      color: "#928E80",
                      marginTop: "0.55rem",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: cs.color }}>
                      {Math.round(progress)}% lu
                    </span>
                    <span>{article.reading_time} min</span>
                  </div>
                </div>

                {/* Sommaire (titres H2/H3) */}
                {headings.length > 0 && (
                  <div className="sl-card" style={{ padding: 0 }}>
                    <div
                      style={{
                        padding: "1.2rem 1.2rem 0.8rem",
                        borderBottom: "1px solid rgba(20,20,16,.07)",
                      }}
                    >
                      <div
                        className="sl-card-label"
                        style={{ marginBottom: 0 }}
                      >
                        Sommaire
                      </div>
                    </div>
                    {headings.map((b, si) => (
                      <div
                        key={si}
                        style={{
                          display: "flex",
                          gap: "0.8rem",
                          alignItems: "flex-start",
                          padding: "0.8rem 1.2rem",
                          borderBottom:
                            si < headings.length - 1
                              ? "1px solid rgba(20,20,16,.06)"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            width: 21,
                            height: 21,
                            borderRadius: "50%",
                            background: cs.bg,
                            color: cs.color,
                            fontSize: "0.58rem",
                            fontWeight: 900,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {si + 1}
                        </div>
                        <span
                          style={{
                            fontSize: "0.74rem",
                            color: "#38382E",
                            fontWeight: 600,
                            lineHeight: 1.4,
                          }}
                        >
                          {b.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* À lire aussi */}
                {relArticles.length > 0 && (
                  <div className="sl-card" style={{ padding: 0 }}>
                    <div
                      style={{
                        padding: "1.2rem 1.2rem 0.8rem",
                        borderBottom: "1px solid rgba(20,20,16,.07)",
                      }}
                    >
                      <div
                        className="sl-card-label"
                        style={{ marginBottom: 0 }}
                      >
                        À lire aussi
                      </div>
                    </div>
                    {relArticles.map((art, ri) => {
                      const acs = CAT[art.category] ?? CAT["Économie"];
                      return (
                        <Link
                          key={art.id}
                          href={`/actualites/${art.slug}`}
                          style={{ textDecoration: "none", display: "block" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "0.8rem",
                              alignItems: "flex-start",
                              padding: "0.88rem 1.2rem",
                              borderBottom:
                                ri < relArticles.length - 1
                                  ? "1px solid rgba(20,20,16,.06)"
                                  : "none",
                              transition: "background .18s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(20,20,16,.03)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "")
                            }
                          >
                            <div
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 10,
                                flexShrink: 0,
                                overflow: "hidden",
                                position: "relative",
                              }}
                            >
                              {art.cover_url ? (
                                <img
                                  src={art.cover_url}
                                  alt={art.title}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    background: art.image_gradient,
                                  }}
                                />
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "0.54rem",
                                  fontWeight: 800,
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                  color: acs.color,
                                  marginBottom: "0.28rem",
                                }}
                              >
                                {art.category}
                              </div>
                              <div
                                style={
                                  {
                                    fontFamily: "'Fraunces', Georgia, serif",
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                    color: "#141410",
                                    lineHeight: 1.28,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  } as React.CSSProperties
                                }
                              >
                                {art.title}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.57rem",
                                  color: "#928E80",
                                  marginTop: "0.28rem",
                                }}
                              >
                                {art.author_name} · {art.reading_time} min
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Newsletter */}
                <div
                  className="sl-card"
                  style={{
                    background: "#141410",
                    border: "none",
                    padding: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#C08435",
                      marginBottom: "0.6rem",
                    }}
                  >
                    Newsletter
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(248,246,241,.5)",
                      lineHeight: 1.65,
                      fontWeight: 300,
                      marginBottom: "1.1rem",
                    }}
                  >
                    Les 5 infos africaines essentielles chaque matin.
                  </p>
                  <Link
                    href="/newsletter"
                    style={{
                      display: "block",
                      textAlign: "center",
                      background: "#C08435",
                      color: "#fff",
                      borderRadius: 100,
                      padding: "0.65rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    S&apos;abonner gratuitement
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* ══ ARTICLES LIÉS ═════════════════════════════════ */}
        {relArticles.length > 0 && (
          <section style={{ background: "#F0EDE4", padding: "5rem 0" }}>
            <div
              style={{
                maxWidth: 1340,
                margin: "0 auto",
                padding: "0 clamp(1rem, 5vw, 4rem)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem",
                  marginBottom: "2.25rem",
                  paddingBottom: "1.25rem",
                  borderBottom: "2px solid #141410",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#C08435",
                      marginBottom: "0.45rem",
                    }}
                  >
                    Continuer à lire
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                      fontWeight: 900,
                      letterSpacing: "-0.035em",
                      color: "#141410",
                      margin: 0,
                    }}
                  >
                    Articles{" "}
                    <em
                      style={{
                        fontStyle: "italic",
                        fontWeight: 200,
                        color: "#C08435",
                      }}
                    >
                      similaires
                    </em>
                  </h2>
                </div>
                <Link
                  href="/actualites"
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#C08435",
                    textDecoration: "none",
                    padding: "0.5rem 1.25rem",
                    borderRadius: 100,
                    border: "1.5px solid rgba(192,132,53,.3)",
                    background: "rgba(192,132,53,.06)",
                  }}
                >
                  Toutes les actualités →
                </Link>
              </div>

              <div className="sl-related-grid">
                {relArticles.map((art, ri) => {
                  const acs = CAT[art.category] ?? CAT["Économie"];
                  return (
                    <RevealWrapper key={art.id} delay={ri * 0.1}>
                      <Link
                        href={`/actualites/${art.slug}`}
                        style={{
                          textDecoration: "none",
                          display: "block",
                          height: "100%",
                        }}
                      >
                        <div className="sl-related-card">
                          <div
                            style={{
                              height: 215,
                              position: "relative",
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            {art.cover_url ? (
                              <img
                                src={art.cover_url}
                                alt={art.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: art.image_gradient,
                                }}
                              />
                            )}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                  "linear-gradient(180deg,transparent 35%,rgba(0,0,0,.6) 100%)",
                              }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                top: "0.9rem",
                                left: "0.9rem",
                                fontSize: "0.55rem",
                                fontWeight: 800,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                padding: "0.22rem 0.7rem",
                                borderRadius: 100,
                                background: "rgba(255,255,255,.14)",
                                color: "#fff",
                                backdropFilter: "blur(8px)",
                              }}
                            >
                              {art.category}
                            </span>
                            <div
                              style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 3,
                                background: acs.color,
                              }}
                            />
                          </div>
                          <div
                            style={{
                              padding: "1.35rem 1.5rem",
                              display: "flex",
                              flexDirection: "column",
                              flex: 1,
                            }}
                          >
                            <h3
                              style={
                                {
                                  fontFamily: "'Fraunces', Georgia, serif",
                                  fontSize: "1rem",
                                  fontWeight: 700,
                                  color: "#141410",
                                  lineHeight: 1.28,
                                  flex: 1,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  marginBottom: "0.5rem",
                                } as React.CSSProperties
                              }
                            >
                              {art.title}
                            </h3>
                            {art.excerpt && (
                              <p
                                style={
                                  {
                                    fontSize: "0.78rem",
                                    color: "#928E80",
                                    lineHeight: 1.7,
                                    fontWeight: 300,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    marginBottom: "0.85rem",
                                  } as React.CSSProperties
                                }
                              >
                                {art.excerpt}
                              </p>
                            )}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingTop: "0.85rem",
                                borderTop: "1px solid rgba(20,20,16,.07)",
                                marginTop: "auto",
                              }}
                            >
                              <span
                                style={{ fontSize: "0.6rem", color: "#928E80" }}
                              >
                                <b style={{ color: "#38382E" }}>
                                  {art.author_name}
                                </b>
                              </span>
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                  color: acs.color,
                                }}
                              >
                                {art.reading_time} min →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </RevealWrapper>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <NewsletterBand />
      <Footer />

      <style>{`
        .sl-layout { display: grid; grid-template-columns: 1fr 340px; gap: 3rem; align-items: start; }
        .sl-sidebar { position: sticky; top: 5rem; display: flex; flex-direction: column; gap: 1rem; padding-top: 3.5rem; padding-bottom: 3rem; }
        .sl-lead { font-size: clamp(1.05rem, 1.6vw, 1.22rem); font-weight: 400; color: #38382E; line-height: 1.85; border-left: 3px solid; padding-left: 1.4rem; font-style: italic; }
        .sl-body { padding-top: 2.5rem; }
        .sl-h2 { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.25rem, 2.2vw, 1.65rem); font-weight: 700; letter-spacing: -0.025em; line-height: 1.18; margin: 2.8rem 0 1.1rem; }
        .sl-p { font-size: clamp(0.95rem, 1.3vw, 1.05rem); color: #38382E; line-height: 1.88; margin: 0 0 1.35rem; font-weight: 300; }
        .sl-quote { margin: 2.2rem 0; padding: 1.8rem 2rem; border-left: 4px solid; background: rgba(20,20,16,.03); border-radius: 0 16px 16px 0; }
        .sl-keyfacts { margin: 2.2rem 0; padding: 1.6rem 1.8rem; border-top: 3px solid; border-radius: 0 0 16px 16px; }
        .sl-facts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 1.5rem; }
        .sl-author { display: flex; gap: 1.2rem; align-items: flex-start; padding: 1.4rem 1.6rem; background: #fff; border-radius: 20px; border-left: 4px solid; box-shadow: 0 2px 12px rgba(20,20,16,.06); }
        .sl-card { background: #fff; border-radius: 20px; border: 1px solid rgba(20,20,16,.08); padding: 1.2rem; box-shadow: 0 2px 8px rgba(20,20,16,.05); }
        .sl-card-label { font-size: 0.58rem; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #928E80; margin-bottom: 0.85rem; }
        .sl-btn { display: inline-flex; align-items: center; gap: 0.45rem; font-size: 0.72rem; font-weight: 600; padding: 0.52rem 1.1rem; border-radius: 100px; border: 1.5px solid rgba(20,20,16,.12); background: transparent; color: #38382E; cursor: pointer; transition: all .2s; font-family: inherit; }
        .sl-btn:hover { background: rgba(20,20,16,.04); }
        .sl-related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.3rem; }
        .sl-related-card { background: #fff; border-radius: 24px; border: 1px solid rgba(20,20,16,.07); overflow: hidden; display: flex; flex-direction: column; height: 100%; transition: transform .28s ease, box-shadow .28s ease; box-shadow: 0 2px 8px rgba(20,20,16,.06); }
        .sl-related-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(20,20,16,.12); }
        @media (max-width: 1024px) { .sl-layout { grid-template-columns: 1fr; } .sl-sidebar { position: static; padding-top: 0; } .sl-related-grid { grid-template-columns: repeat(2, 1fr); } .sl-facts-grid { grid-template-columns: 1fr; } }
        @media (max-width: 640px) { .sl-related-grid { grid-template-columns: 1fr; } .sl-quote { padding: 1.2rem; } .sl-keyfacts { padding: 1.2rem; } }
      `}</style>
    </>
  );
}
