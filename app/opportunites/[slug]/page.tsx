"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { opportunities, type Block } from "@/lib/data";

/* ─── Couleurs par type ─── */
const TYPE_COLOR: Record<string, { color: string; bg: string; dark: string }> = {
  "Emploi CDI": { color: "#1A5C40", bg: "#EAF4EF", dark: "#0F3828" },
  "Emploi": { color: "#9B6B1A", bg: "#FBF4E8", dark: "#6B4A10" },
  "Stage": { color: "#1E4DA8", bg: "#EBF0FB", dark: "#152F6B" },
  "Graduate": { color: "#7A1E4A", bg: "#F9EBF3", dark: "#52122F" },
  "Freelance": { color: "#B8341E", bg: "#FAEBE8", dark: "#8A2112" },
  "Volontariat": { color: "#928E80", bg: "#F0EDE4", dark: "#5C5A52" },
};

/* ─── Calcul jours restants ─── */
function daysUntil(deadline: string): number | null {
  const months: Record<string, number> = {
    "Jan": 0, "Fév": 1, "Mar": 2, "Avr": 3, "Mai": 4, "Jun": 5,
    "Juil": 6, "Aoû": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Déc": 11,
  };
  const parts = deadline.split(" ");
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  const year = parseInt(parts[2]);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  return Math.ceil((new Date(year, month, day).getTime() - Date.now()) / 86400000);
}

/* ─── Icônes ─── */
const IcoArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const IcoExternal = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const IcoBookmark = ({ on }: { on: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill={on ? "currentColor" : "none"} stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const IcoShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

/* ══════════════════════════════════════════════════════
   PAGE EXPORT (server-compatible wrapper)
══════════════════════════════════════════════════════ */

/* ─── Block Renderer ─── */
function BlockRenderer({ blocks, color, bg, dark }: {
  blocks: Block[];
  color: string;
  bg: string;
  dark: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "2rem" }}>
      {blocks.map((block, i) => {
        switch (block.type) {

          case "paragraph":
            return <p key={i} className="bs-p">{block.text}</p>;

          case "heading":
            return block.level === 3
              ? <h3 key={i} style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 900, color: "#141410", marginTop: "0.5rem" }}>{block.text}</h3>
              : (
                <div key={i} style={{ paddingTop: "1rem" }}>
                  <h2 className="bs-h2">{block.text}</h2>
                  <div style={{ width: "2.8rem", height: 3, background: color, borderRadius: 100, marginTop: "0.75rem" }}/>
                </div>
              );

          case "pullquote":
            return (
              <blockquote key={i} style={{ margin: "0.5rem 0", padding: "1.5rem 2rem", borderLeft: `4px solid ${color}`, background: bg, borderRadius: "0 16px 16px 0" }}>
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, fontStyle: "italic", color: "#141410", lineHeight: 1.5, marginBottom: block.author ? "0.75rem" : 0 }}>
                  « {block.text} »
                </p>
                {block.author && (
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    — {block.author}{block.role ? `, ${block.role}` : ""}
                  </div>
                )}
              </blockquote>
            );

          case "factbox":
            return (
              <div key={i} style={{ padding: "1.5rem 1.75rem", background: "#141410", borderRadius: 20, border: "1px solid rgba(248,246,241,.06)" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C08435", marginBottom: "1rem" }}>
                  💡 {block.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {block.facts.map((fact, j) => (
                    <div key={j} style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
                      <span style={{ color: "#C08435", fontWeight: 700, fontSize: "0.7rem", flexShrink: 0, marginTop: "0.15rem" }}>→</span>
                      <span style={{ fontSize: "0.82rem", color: "rgba(248,246,241,.65)", lineHeight: 1.6 }}>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "alert":
            const alertStyles = {
              info:    { bg: "#EBF0FB", border: "#1E4DA8", icon: "ℹ️", color: "#1E4DA8" },
              warning: { bg: "#FFF4EB", border: "#C08435", icon: "⚠️", color: "#C08435" },
              tip:     { bg: "#EAF4EF", border: "#1A5C40", icon: "💡", color: "#1A5C40" },
            };
            const as = alertStyles[block.variant ?? "info"];
            return (
              <div key={i} style={{ display: "flex", gap: "0.85rem", padding: "1rem 1.25rem", background: as.bg, border: `1.5px solid ${as.border}40`, borderRadius: 14 }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{as.icon}</span>
                <p style={{ fontSize: "0.85rem", color: "#141410", lineHeight: 1.6, margin: 0 }}>{block.message}</p>
              </div>
            );

          case "divider":
            return <hr key={i} style={{ border: "none", borderTop: "1px solid rgba(20,20,16,.08)", margin: "0.5rem 0" }}/>;

          case "benefits":
            return (
              <div key={i} className="bs-benefits-grid">
                {block.items.map((b, j) => (
                  <div key={j} className={`bs-benefit-card ${b.highlight ? "bs-benefit-card--highlight" : ""}`}
                    style={b.highlight ? { borderColor: color, background: bg } : {}}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.6rem" }}>{b.icon}</div>
                    <div style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: b.highlight ? color : "#928E80", marginBottom: "0.3rem" }}>{b.label}</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#141410", lineHeight: 1.4 }}>{b.value}</div>
                  </div>
                ))}
              </div>
            );

          case "checklist":
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {block.title && <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>{block.title}</div>}
                {block.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", padding: "0.9rem 1.1rem", background: "#fff", borderRadius: 14, border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 6px rgba(20,20,16,.04)" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <IcoCheck />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "0.88rem", color: "#38382E", fontWeight: 500, lineHeight: 1.55 }}>{item.label}</span>
                      {item.detail && <div style={{ fontSize: "0.72rem", color: "#928E80", marginTop: "0.2rem", lineHeight: 1.5 }}>{item.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            );

          case "steps":
            return (
              <div key={i}>
                {block.title && <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>{block.title}</div>}
                <div className="bs-steps">
                  {block.items.map((step, j) => (
                    <div key={j} className="bs-step">
                      {j < block.items.length - 1 && (
                        <div style={{ position: "absolute", left: 18, top: 40, width: 2, height: "calc(100% - 20px)", background: `linear-gradient(180deg, ${color}40, transparent)` }}/>
                      )}
                      <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${color}, ${dark})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.78rem", fontWeight: 900, color: "#fff", boxShadow: `0 4px 12px ${color}44` }}>
                        {j + 1}
                      </div>
                      <div style={{ flex: 1, paddingTop: "0.4rem" }}>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#141410", marginBottom: "0.3rem" }}>{step.label}</div>
                        <div style={{ fontSize: "0.8rem", color: "#928E80", lineHeight: 1.6 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "external":
            return (
              <a key={i} href={block.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "#fff", border: "1px solid rgba(20,20,16,.08)", borderRadius: 14, textDecoration: "none", boxShadow: "0 1px 6px rgba(20,20,16,.04)" }}>
                {block.favicon && <img src={block.favicon} alt="" width={16} height={16} style={{ borderRadius: 4 }}/>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#141410" }}>{block.label}</div>
                  {block.description && <div style={{ fontSize: "0.72rem", color: "#928E80", marginTop: "0.15rem" }}>{block.description}</div>}
                </div>
                <IcoExternal />
              </a>
            );

          case "download":
            return (
              <a key={i} href={block.url} download
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: bg, border: `1.5px solid ${color}30`, borderRadius: 14, textDecoration: "none" }}>
                <span style={{ fontSize: "1.2rem" }}>📥</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: color }}>{block.label}</div>
                  {block.size && <div style={{ fontSize: "0.7rem", color: "#928E80", marginTop: "0.1rem" }}>{block.size}</div>}
                </div>
              </a>
            );

          case "profile":
            return (
              <div key={i}>
                {block.title && (
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>{block.title}</div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
                  {block.traits.map((t, j) => (
                    <div key={j} style={{ padding: "1.1rem 1.25rem", background: "#fff", borderRadius: 16, border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 8px rgba(20,20,16,.05)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div style={{ fontSize: "1.4rem" }}>{t.icon}</div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#141410", letterSpacing: "0.02em" }}>{t.label}</div>
                      <div style={{ fontSize: "0.72rem", color: "#928E80", lineHeight: 1.55 }}>{t.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "compare":
            return (
              <div key={i}>
                {block.title && (
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>{block.title}</div>
                )}
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(20,20,16,.08)", boxShadow: "0 1px 8px rgba(20,20,16,.04)" }}>
                  {/* Header row */}
                  <div style={{ display: "grid", gridTemplateColumns: `1.5fr ${block.columns.map(() => "1fr").join(" ")}`, background: "#141410" }}>
                    <div style={{ padding: "0.75rem 1rem" }} />
                    {block.columns.map((col, j) => (
                      <div key={j} style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", fontWeight: 800, color: col.color ?? color, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", borderLeft: "1px solid rgba(255,255,255,.06)" }}>
                        {col.label}
                      </div>
                    ))}
                  </div>
                  {/* Data rows */}
                  {block.rows.map((row, j) => (
                    <div key={j} style={{ display: "grid", gridTemplateColumns: `1.5fr ${block.columns.map(() => "1fr").join(" ")}`, background: j % 2 === 0 ? "#fff" : "#F8F6F1", borderTop: "1px solid rgba(20,20,16,.06)" }}>
                      <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", fontWeight: 600, color: "#38382E" }}>{row.label}</div>
                      {row.values.map((val, k) => (
                        <div key={k} style={{ padding: "0.75rem 1rem", fontSize: "0.78rem", color: "#928E80", textAlign: "center", borderLeft: "1px solid rgba(20,20,16,.06)", lineHeight: 1.45 }}>{val}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );

          case "location":
            return (
              <div key={i} style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(20,20,16,.08)", boxShadow: "0 2px 12px rgba(20,20,16,.06)" }}>
                {/* Map embed or static placeholder */}
                {block.mapUrl ? (
                  <iframe
                    src={block.mapUrl}
                    width="100%" height="220"
                    style={{ display: "block", border: "none" }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={block.label}
                  />
                ) : (
                  <div style={{ height: 180, background: `linear-gradient(135deg, ${bg} 0%, #E8E4DA 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ fontSize: "2rem" }}>📍</div>
                    <div style={{ fontSize: "0.75rem", color: "#928E80", fontWeight: 600 }}>{block.label}</div>
                  </div>
                )}
                <div style={{ padding: "0.9rem 1.1rem", background: "#fff", display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0 }}>📍</div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#141410" }}>{block.label}</div>
                    {block.address && <div style={{ fontSize: "0.72rem", color: "#928E80", marginTop: "0.1rem" }}>{block.address}</div>}
                  </div>
                </div>
              </div>
            );

          case "apply":
            return (
              <div key={i} style={{ padding: "1.75rem", background: `linear-gradient(135deg, ${dark} 0%, #141410 100%)`, borderRadius: 20, border: `1px solid ${color}30`, boxShadow: `0 4px 24px ${color}18` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {block.deadline && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: color }}>
                      <span>⏳</span> Date limite : {block.deadline}
                    </div>
                  )}
                  <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.2rem", fontWeight: 900, color: "#F8F6F1", lineHeight: 1.3 }}>
                    {block.label}
                  </div>
                  {block.note && (
                    <div style={{ fontSize: "0.78rem", color: "rgba(248,246,241,.5)", lineHeight: 1.6 }}>{block.note}</div>
                  )}
                  <a href={block.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", padding: "0.85rem 1.5rem", background: color, color: "#fff", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: "0.88rem", boxShadow: `0 4px 16px ${color}55`, transition: "opacity .2s", alignSelf: "flex-start" }}>
                    Postuler maintenant →
                  </a>
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

export default function OpportuniteDetailPage({ params }: { params: { slug: string } }) {
  return <OppClient slug={params.slug} />;
}

/* ══════════════════════════════════════════════════════
   COMPOSANT CLIENT
══════════════════════════════════════════════════════ */
function OppClient({ slug }: { slug: string }) {
  const opp = opportunities.find((o) => o.slug === slug);
  if (!opp) notFound();

  const [heroVisible, setHeroVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  const tc = TYPE_COLOR[opp.type] ?? TYPE_COLOR["Emploi"];
  const blocks = opp.blocks;
  const daysLeft = daysUntil(opp.deadline);
  const isUrgent = daysLeft !== null && daysLeft <= 14;

  const related = opportunities
    .filter((o) => o.id !== opp.id && o.type === opp.type)
    .slice(0, 3)
    .concat(opportunities.filter((o) => o.id !== opp.id))
    .slice(0, 3);

  useEffect(() => { requestAnimationFrame(() => setHeroVisible(true)); }, []);

  return (
    <>
      <Navbar />
      <main>

        {/* ══════════════════════════════════════════
            HERO — immersif pleine largeur
        ══════════════════════════════════════════ */}
        <section style={{
          position: "relative", overflow: "hidden",
          height: "clamp(460px, 64vh, 620px)", paddingTop: 64,
        }}>
          {/* Fond gradient animé */}
          <div style={{
            position: "absolute", inset: 0, background: opp.imageGradient,
            transform: heroVisible ? "scale(1)" : "scale(1.05)",
            transition: "transform 1.4s cubic-bezier(.25,.46,.45,.94)",
          }} />
          {/* Grain texture */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
          }} />
          {/* Overlays lumière */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(160deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.65) 72%, rgba(0,0,0,.95) 100%)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(100deg, rgba(0,0,0,.55) 0%, transparent 55%)",
          }} />

          {/* Initiales déco fantôme */}
          <div aria-hidden="true" style={{
            position: "absolute", top: "15%", right: "5%",
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "clamp(8rem,18vw,15rem)", fontWeight: 900, lineHeight: 1,
            color: "rgba(255,255,255,.04)", letterSpacing: "-0.06em",
            pointerEvents: "none", userSelect: "none",
          }}>
            {opp.companyInitials}
          </div>
          {/* Cercles déco */}
          {[320, 180].map((size, i) => (
            <div key={i} style={{
              position: "absolute", top: `${10 + i * 10}%`, right: `${8 + i * 6}%`,
              width: size, height: size, borderRadius: "50%",
              border: `1px solid rgba(255,255,255,${i === 0 ? .04 : .06})`,
              pointerEvents: "none",
            }} />
          ))}

          {/* Contenu */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: "clamp(1.5rem, 5.5vw, 5rem)",
            maxWidth: 1100, margin: "0 auto",
            left: "50%", transform: "translateX(-50%)", width: "100%",
          }}>
            {/* Retour */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              marginBottom: "1.75rem",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(8px)",
              transition: "opacity .7s .1s, transform .7s .1s",
            }}>
              <Link href="/opportunites" style={{
                display: "flex", alignItems: "center", gap: "0.45rem",
                fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,.45)",
                textDecoration: "none", transition: "color .2s",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.45)"}>
                <IcoArrow /> Opportunités
              </Link>
              <span style={{ color: "rgba(255,255,255,.2)" }}>›</span>
              <span style={{
                fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em",
                textTransform: "uppercase", color: tc.color,
              }}>
                {opp.type}
              </span>
            </div>

            {/* Badges */}
            <div style={{
              display: "flex", gap: "0.6rem", flexWrap: "wrap",
              marginBottom: "1.35rem",
              opacity: heroVisible ? 1 : 0, transition: "opacity .7s .2s",
            }}>
              <span style={{
                fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em",
                textTransform: "uppercase", padding: "0.28rem 0.85rem",
                borderRadius: 100, background: tc.color, color: "#fff",
              }}>
                {opp.type}
              </span>
              <span style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em",
                textTransform: "uppercase", padding: "0.28rem 0.85rem",
                borderRadius: 100, background: "rgba(255,255,255,.92)",
                color: isUrgent ? "#B8341E" : "#1A5C40",
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                  background: isUrgent ? "#B8341E" : "#1A5C40",
                  animation: isUrgent ? "blink 1.4s ease-in-out infinite" : "none",
                }} />
                {isUrgent ? "Clôture imminente" : "Candidatures ouvertes"}
              </span>
              <span style={{
                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", padding: "0.28rem 0.85rem",
                borderRadius: 100, background: "rgba(255,255,255,.12)",
                color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.16)",
                backdropFilter: "blur(8px)",
              }}>
                {opp.sector}
              </span>
              {opp.remote && (
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", padding: "0.28rem 0.85rem",
                  borderRadius: 100, background: "rgba(255,255,255,.12)",
                  color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.16)",
                  backdropFilter: "blur(8px)",
                }}>
                  Remote possible
                </span>
              )}
            </div>

            {/* Titre */}
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(1.7rem, 4.5vw, 3.5rem)",
              fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08,
              color: "#F8F6F1", maxWidth: "22ch", marginBottom: "1.5rem",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(20px)",
              transition: "opacity .9s .25s, transform .9s .25s",
            }}>
              {opp.title}
            </h1>

            {/* Méta */}
            <div style={{
              display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap",
              opacity: heroVisible ? 1 : 0, transition: "opacity .8s .4s",
            }}>
              {/* Logo entreprise */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `linear-gradient(135deg, ${tc.color}, ${tc.dark})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 900, color: "#fff",
                }}>
                  {opp.companyInitials}
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#F8F6F1" }}>
                    {opp.company}
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,.42)" }}>
                    <span>{opp.flag}</span> {opp.location}, {opp.country}
                  </div>
                </div>
              </div>

              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.14)", flexShrink: 0 }} />

              {/* Deadline */}
              <div>
                <div style={{
                  fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "rgba(255,255,255,.38)", marginBottom: "0.15rem",
                }}>
                  Date limite
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: 800, color: isUrgent ? "#FF8A75" : "#F8F6F1" }}>
                  {opp.deadline}
                  {daysLeft !== null && daysLeft > 0 && (
                    <span style={{
                      fontSize: "0.6rem", fontWeight: 600, marginLeft: "0.6rem",
                      color: daysLeft < 15 ? "#FF8A75" : "rgba(255,255,255,.45)",
                    }}>
                      ({daysLeft}j restants)
                    </span>
                  )}
                  {daysLeft !== null && daysLeft <= 0 && (
                    <span style={{ fontSize: "0.6rem", color: "#FF8A75", marginLeft: "0.5rem" }}>Expiré</span>
                  )}
                </div>
              </div>

              {opp.salary && (
                <>
                  <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.14)", flexShrink: 0 }} />
                  <div>
                    <div style={{
                      fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em",
                      textTransform: "uppercase", color: "rgba(255,255,255,.38)", marginBottom: "0.15rem",
                    }}>
                      Rémunération
                    </div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#C08435" }}>
                      {opp.salary}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CORPS — Layout 2 colonnes
        ══════════════════════════════════════════ */}
        <div style={{ background: "#F8F6F1" }}>
          <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(1rem, 5vw, 4rem)" }}>
            <div className="bs-layout">

              {/* ── CONTENU PRINCIPAL ── */}
              <div className="bs-main">

                {/* Barre actions */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.65rem",
                  padding: "2rem 0 1.75rem",
                  borderBottom: "1px solid rgba(20,20,16,.07)", flexWrap: "wrap",
                }}>
                  <button onClick={() => setSaved(!saved)} className="bs-btn"
                    style={saved ? { background: tc.bg, color: tc.color, borderColor: tc.color } : {}}>
                    <IcoBookmark on={saved} />
                    {saved ? "Sauvegardée" : "Sauvegarder"}
                  </button>
                  <button className="bs-btn"><IcoShare /> Partager</button>
                  {/* progress bar removed — documents now in free blocks */}
                </div>

                {/* Présentation */}
                {/* ── Contenu libre en blocs ── */}
                <RevealWrapper>
                  <BlockRenderer blocks={blocks} color={tc.color} bg={tc.bg} dark={tc.dark} />
                </RevealWrapper>
              </div>

              {/* ── SIDEBAR STICKY ── */}
              <aside className="bs-sidebar">

                {/* ─ CTA Principal ─ */}
                <div className="bs-cta-card" style={{ borderTopColor: tc.color }}>
                  {/* Countdown */}
                  {daysLeft !== null && (
                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between", marginBottom: "1.25rem",
                      padding: "0.85rem 1rem",
                      background: isUrgent ? "#FFF4F2" : tc.bg, borderRadius: 12,
                      border: `1px solid ${isUrgent ? "#FFD0C8" : "rgba(20,20,16,.08)"}`,
                    }}>
                      <div>
                        <div style={{
                          fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: isUrgent ? "#B8341E" : "#928E80", marginBottom: "0.2rem",
                        }}>
                          Clôture dans
                        </div>
                        <div style={{
                          fontFamily: "'Fraunces', Georgia, serif",
                          fontSize: "1.5rem", fontWeight: 900, lineHeight: 1,
                          color: isUrgent ? "#B8341E" : tc.color,
                        }}>
                          {daysLeft > 0 ? `${daysLeft}j` : "Expiré"}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: "1.5rem", fontWeight: 900, color: "rgba(20,20,16,.08)",
                      }}>
                        {opp.companyInitials}
                      </div>
                    </div>
                  )}

                  {/* Infos clés */}
                  {([
                    { label: "Date limite", value: opp.deadline, bold: isUrgent, color: isUrgent ? "#B8341E" : tc.color },
                    { label: "Salaire", value: opp.salary ?? "Non précisé", bold: !!opp.salary, color: "#1A5C40" },
                    { label: "Type", value: opp.type, bold: false, color: "#38382E" },
                    { label: "Secteur", value: opp.sector, bold: false, color: "#38382E" },
                    { label: "Lieu", value: `${opp.location}, ${opp.country}`, bold: false, color: "#38382E" },
                    { label: "Remote", value: opp.remote ? "Possible" : "Sur site", bold: false, color: "#38382E" },
                    { label: "Publié le", value: opp.postedAt, bold: false, color: "#928E80" },
                  ] as { label: string; value: string; bold: boolean; color: string }[]).map((row, i, arr) => (
                    <div key={row.label} style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", gap: "1rem", padding: "0.8rem 0",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(20,20,16,.07)" : "none",
                    }}>
                      <span style={{
                        fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.07em",
                        textTransform: "uppercase", color: "#928E80", flexShrink: 0,
                      }}>
                        {row.label}
                      </span>
                      <span style={{
                        fontSize: "0.85rem", fontWeight: row.bold ? 800 : 500,
                        color: row.color, textAlign: "right", lineHeight: 1.3,
                      }}>
                        {row.value}
                      </span>
                    </div>
                  ))}

                  {/* Bouton postuler */}
                  <a href="#" style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: "0.5rem", width: "100%", textAlign: "center",
                    background: tc.color, color: "#fff", padding: "1rem", borderRadius: 100,
                    fontWeight: 800, fontSize: "0.9rem", textDecoration: "none",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    boxShadow: `0 6px 24px ${tc.color}44`,
                    transition: "all .25s", marginTop: "1.5rem",
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = tc.dark;
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 12px 32px ${tc.color}55`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = tc.color;
                      (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 6px 24px ${tc.color}44`;
                    }}>
                    Postuler maintenant <IcoExternal />
                  </a>
                  <div style={{ textAlign: "center", marginTop: "0.65rem", fontSize: "0.65rem", color: "#928E80" }}>
                    Candidature externe · Site officiel
                  </div>
                </div>

                {/* ─ Compétences ─ */}
                <div className="bs-sidebar-block">
                  <div className="bs-sidebar-label">Compétences clés</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {opp.skills.map((s) => (
                      <span key={s} style={{
                        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em",
                        textTransform: "uppercase", padding: "0.28rem 0.75rem",
                        borderRadius: 100, background: tc.bg, color: tc.color,
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ─ Checklist rapide ─ */}

              </aside>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            OFFRES SIMILAIRES
        ══════════════════════════════════════════ */}
        <section style={{ background: "#F0EDE4", padding: "5rem 0" }}>
          <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(1rem, 5vw, 4rem)" }}>
            <div style={{
              display: "flex", alignItems: "flex-end", justifyContent: "space-between",
              flexWrap: "wrap", gap: "1rem", marginBottom: "2.25rem",
              paddingBottom: "1.25rem", borderBottom: "2px solid #141410",
            }}>
              <div>
                <div style={{
                  fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "#C08435", marginBottom: "0.45rem",
                }}>
                  Continuer à explorer
                </div>
                <h2 style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 900,
                  letterSpacing: "-0.035em", color: "#141410", margin: 0,
                }}>
                  Autres{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435" }}>
                    opportunités
                  </em>
                </h2>
              </div>
              <Link href="/opportunites" style={{
                fontSize: "0.78rem", fontWeight: 700, color: "#C08435",
                textDecoration: "none", padding: "0.5rem 1.25rem", borderRadius: 100,
                border: "1.5px solid rgba(192,132,53,.3)", background: "rgba(192,132,53,.06)",
              }}>
                Toutes les offres →
              </Link>
            </div>

            <div className="bs-related-grid">
              {related.map((r, ri) => {
                const rtc = TYPE_COLOR[r.type] ?? TYPE_COLOR["Emploi"];
                const rdaysLeft = daysUntil(r.deadline);
                const rUrgent = rdaysLeft !== null && rdaysLeft <= 14;
                return (
                  <RevealWrapper key={r.id} delay={ri * 0.1}>
                    <Link href={`/opportunites/${r.slug}`}
                      style={{ textDecoration: "none", display: "block", height: "100%" }}>
                      <div className="bs-related-card">
                        <div style={{ height: 160, position: "relative", overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ position: "absolute", inset: 0, background: r.imageGradient }} />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 30%,rgba(0,0,0,.75) 100%)" }} />
                          {/* Initiales déco */}
                          <div aria-hidden="true" style={{
                            position: "absolute", bottom: "-0.5rem", right: "0.75rem",
                            fontFamily: "'Fraunces', Georgia, serif",
                            fontSize: "4rem", fontWeight: 900, lineHeight: 1,
                            color: "rgba(255,255,255,.07)", letterSpacing: "-0.04em",
                            pointerEvents: "none",
                          }}>
                            {r.companyInitials}
                          </div>
                          {/* Entreprise */}
                          <div style={{
                            position: "absolute", bottom: "0.8rem", left: "0.9rem",
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)",
                            padding: "0.3rem 0.7rem 0.3rem 0.45rem", borderRadius: 100,
                          }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: 6,
                              background: `linear-gradient(135deg, ${rtc.color}, ${rtc.dark})`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.48rem", fontWeight: 900, color: "#fff", flexShrink: 0,
                            }}>
                              {r.companyInitials}
                            </div>
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#fff" }}>
                              {r.company}
                            </span>
                          </div>
                          {rUrgent && (
                            <div style={{
                              position: "absolute", top: "0.8rem", right: "0.8rem",
                              display: "flex", alignItems: "center", gap: "0.3rem",
                              fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.1em",
                              textTransform: "uppercase", color: "#fff", background: "#B8341E",
                              padding: "0.25rem 0.65rem", borderRadius: 100,
                            }}>
                              <span style={{
                                width: 5, height: 5, borderRadius: "50%",
                                background: "rgba(255,255,255,.7)",
                                animation: "blink 1.4s ease-in-out infinite",
                                display: "inline-block",
                              }} />
                              Urgent
                            </div>
                          )}
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: rtc.color }} />
                        </div>

                        <div style={{ padding: "1.25rem 1.4rem", display: "flex", flexDirection: "column", flex: 1 }}>
                          <div style={{
                            fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.1em",
                            textTransform: "uppercase", color: rtc.color, marginBottom: "0.4rem",
                          }}>
                            {r.sector}
                          </div>
                          <h3 style={{
                            fontFamily: "'Fraunces', Georgia, serif",
                            fontSize: "0.97rem", fontWeight: 700, color: "#141410",
                            lineHeight: 1.3, flex: 1, marginBottom: "0.75rem",
                            display: "-webkit-box", WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                          } as React.CSSProperties}>
                            {r.title}
                          </h3>
                          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                            <span style={{
                              fontSize: "0.55rem", fontWeight: 700, padding: "0.2rem 0.6rem",
                              borderRadius: 100, background: rtc.bg, color: rtc.color,
                            }}>
                              {r.type}
                            </span>
                            {r.salary && (
                              <span style={{
                                fontSize: "0.55rem", fontWeight: 700, padding: "0.2rem 0.6rem",
                                borderRadius: 100, background: "#EAF4EF", color: "#1A5C40",
                              }}>
                                {r.salary}
                              </span>
                            )}
                          </div>
                          <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            paddingTop: "0.75rem", borderTop: "1px solid rgba(20,20,16,.07)",
                            marginTop: "auto",
                          }}>
                            <span style={{ fontSize: "0.6rem", color: "#928E80" }}>
                              <span>{r.flag}</span>{" "}
                              {r.location} · <b style={{ color: rUrgent ? "#B8341E" : "#38382E" }}>
                                {r.deadline}
                              </b>
                            </span>
                            {rdaysLeft !== null && rdaysLeft > 0 && (
                              <span style={{
                                fontSize: "0.6rem", fontWeight: 700,
                                color: rdaysLeft < 15 ? "#B8341E" : "#928E80",
                              }}>
                                {rdaysLeft}j →
                              </span>
                            )}
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
      </main>

      <NewsletterBand />
      <Footer />

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: .3; }
        }
      `}</style>
    </>
  );
}