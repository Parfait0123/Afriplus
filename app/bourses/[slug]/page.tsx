"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { scholarships, type Block } from "@/lib/data";

/* ─── Couleurs par niveau ─── */
const LEVEL_COLOR: Record<string, { color: string; bg: string; dark: string }> = {
  "Licence":           { color: "#1E4DA8", bg: "#EBF0FB", dark: "#152F6B" },
  "Master":            { color: "#1A5C40", bg: "#EAF4EF", dark: "#0F3828" },
  "Doctorat":          { color: "#7A4A1E", bg: "#FDF3E8", dark: "#5C3212" },
  "Postdoc":           { color: "#2D6B6B", bg: "#E6F4F4", dark: "#0F3838" },
  "Toutes formations": { color: "#C08435", bg: "#FBF4E8", dark: "#7A4F0E" },
};



/* ─── Calcul jours restants ─── */
function daysUntil(deadline: string): number | null {
  const months: Record<string, number> = {
    "Jan": 0, "Fév": 1, "Mar": 2, "Avr": 3, "Mai": 4, "Juin": 5,
    "Juil": 6, "Aoû": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Déc": 11,
    "Mars": 2,
  };
  const parts = deadline.split(" ");
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  const year = parseInt(parts[2]);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  const target = new Date(year, month, day);
  const diff = Math.ceil((target.getTime() - Date.now()) / 86400000);
  return diff;
}

/* ─── Icônes ─── */
const IcoArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);
const IcoExternal = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const IcoBookmark = ({ on }: { on: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
const IcoShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

/* ══════════════════════════════════════════════════════
   EXPORTS NEXT.JS
══════════════════════════════════════════════════════ */


/* ─── Block Renderer ─── */
/* ─── Checklist interactive ─── */
function ChecklistBlock({ block, color, bg }: {
  block: { title?: string; items: { label: string; detail?: string }[] };
  color: string;
  bg: string;
}) {
  const [checked, setChecked] = useState<number[]>([]);
  const toggle = (j: number) =>
    setChecked(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]);
  const total = block.items.length;
  const done = checked.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {block.title && (
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>{block.title}</div>
      )}
      {total > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
          <div style={{ flex: 1, height: 5, background: "rgba(20,20,16,.08)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 100, background: color,
              width: `${(done / total) * 100}%`, transition: "width .3s cubic-bezier(.34,1.56,.64,1)" }} />
          </div>
          <span style={{ fontSize: "0.62rem", fontWeight: 700, color: color, flexShrink: 0 }}>
            {done}/{total}
          </span>
        </div>
      )}
      {block.items.map((item, j) => {
        const isChecked = checked.includes(j);
        return (
          <div key={j} onClick={() => toggle(j)}
            style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start",
              padding: "0.9rem 1.1rem",
              background: isChecked ? bg : "#fff",
              borderRadius: 14,
              border: `1px solid ${isChecked ? color : "rgba(20,20,16,.07)"}`,
              cursor: "pointer", transition: "all .18s",
              boxShadow: isChecked ? "none" : "0 1px 6px rgba(20,20,16,.04)" }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, transition: "all .18s",
              background: isChecked ? color : "transparent",
              border: `2px solid ${isChecked ? color : "rgba(20,20,16,.2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              {isChecked && <IcoCheck />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 600,
                color: isChecked ? color : "#141410",
                textDecoration: isChecked ? "line-through" : "none",
                textDecorationColor: color, lineHeight: 1.4, marginBottom: item.detail ? "0.25rem" : 0 }}>
                {item.label}
              </div>
              {item.detail && (
                <div style={{ fontSize: "0.72rem", color: "#928E80", lineHeight: 1.5 }}>
                  {item.detail}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {done === total && total > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem",
          padding: "0.85rem 1.1rem", background: bg,
          border: `1.5px solid ${color}`, borderRadius: 14, marginTop: "0.25rem" }}>
          <span style={{ fontSize: "1rem" }}>✅</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: color }}>
            Dossier complet — vous pouvez postuler !
          </span>
        </div>
      )}
    </div>
  );
}

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
            return <ChecklistBlock key={i} block={block} color={color} bg={bg} />;

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
                  <div style={{ display: "grid", gridTemplateColumns: `1.5fr ${block.columns.map(() => "1fr").join(" ")}`, background: "#141410" }}>
                    <div style={{ padding: "0.75rem 1rem" }} />
                    {block.columns.map((col, j) => (
                      <div key={j} style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", fontWeight: 800, color: col.color ?? color, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", borderLeft: "1px solid rgba(255,255,255,.06)" }}>
                        {col.label}
                      </div>
                    ))}
                  </div>
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

export default function BourseDetailPage({ params }: { params: { slug: string } }) {
  return <BourseClient slug={params.slug} />;
}

/* ══════════════════════════════════════════════════════
   COMPOSANT CLIENT
══════════════════════════════════════════════════════ */
function BourseClient({ slug }: { slug: string }) {
  const sc = scholarships.find((s) => s.slug === slug);
  if (!sc) notFound();

  const [heroVisible, setHeroVisible] = useState(false);
  const [saved, setSaved]             = useState(false);

  const lc      = LEVEL_COLOR[sc.level] ?? LEVEL_COLOR["Master"];
  const blocks = sc.blocks;
  const daysLeft = daysUntil(sc.deadline);

  const related = scholarships.filter((s) => s.id !== sc.id).slice(0, 3);

  useEffect(() => { requestAnimationFrame(() => setHeroVisible(true)); }, []);

;

  /* Urgence couleur */
  const urgentColor = sc.urgent ? "#B8341E" : "#1A5C40";
  const urgentBg    = sc.urgent ? "#FAEBE8" : "#EAF4EF";

  return (
    <>
      <Navbar />

      <main>
        {/* ══════════════════════════════════════════
            HERO — Immersif pleine largeur
        ══════════════════════════════════════════ */}
        <section style={{ position: "relative", overflow: "hidden",
          height: "clamp(460px, 64vh, 620px)", paddingTop: 64 }}>

          {/* Fond dégradé */}
          <div style={{
            position: "absolute", inset: 0, background: sc.imageGradient,
            transform: heroVisible ? "scale(1)" : "scale(1.05)",
            transition: "transform 1.4s cubic-bezier(.25,.46,.45,.94)",
          }}/>
          {/* Grain texture */}
          <div style={{ position: "absolute", inset: 0,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
            opacity: 0.5, pointerEvents: "none" }}/>
          {/* Overlays */}
          <div style={{ position: "absolute", inset: 0,
            background: "linear-gradient(160deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.0) 35%, rgba(0,0,0,.65) 72%, rgba(0,0,0,.95) 100%)" }}/>
          <div style={{ position: "absolute", inset: 0,
            background: "linear-gradient(100deg, rgba(0,0,0,.55) 0%, transparent 55%)" }}/>

          {/* Déco — cercles abstraits */}
          <div style={{ position: "absolute", top: "10%", right: "8%",
            width: 320, height: 320, borderRadius: "50%",
            border: `1px solid rgba(255,255,255,.04)`, pointerEvents: "none" }}/>
          <div style={{ position: "absolute", top: "20%", right: "14%",
            width: 180, height: 180, borderRadius: "50%",
            border: `1px solid rgba(255,255,255,.06)`, pointerEvents: "none" }}/>

          {/* Contenu */}
          <div style={{ position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: "clamp(1.5rem, 5.5vw, 5rem)",
            maxWidth: 1100, margin: "0 auto",
            left: "50%", transform: "translateX(-50%)", width: "100%" }}>

            {/* Retour */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem",
              marginBottom: "1.75rem",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(8px)",
              transition: "opacity .7s .1s, transform .7s .1s" }}>
              <Link href="/bourses" style={{ display: "flex", alignItems: "center",
                gap: "0.45rem", fontSize: "0.62rem", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(255,255,255,.45)", textDecoration: "none",
                transition: "color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.45)"}>
                <IcoArrow /> Bourses
              </Link>
              <span style={{ color: "rgba(255,255,255,.2)" }}>›</span>
              <span style={{ fontSize: "0.62rem", fontWeight: 800,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: lc.color }}>{sc.level}</span>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap",
              marginBottom: "1.35rem",
              opacity: heroVisible ? 1 : 0, transition: "opacity .7s .2s" }}>
              {/* Niveau */}
              <span style={{ fontSize: "0.6rem", fontWeight: 800,
                letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "0.28rem 0.85rem", borderRadius: 100,
                background: lc.color, color: "#fff" }}>
                {sc.level}
              </span>
              {/* Statut urgence */}
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem",
                fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em",
                textTransform: "uppercase", padding: "0.28rem 0.85rem",
                borderRadius: 100,
                background: "rgba(255,255,255,.92)", color: urgentColor }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%",
                  background: urgentColor, flexShrink: 0,
                  animation: sc.urgent ? "blink 1.4s ease-in-out infinite" : "none" }}/>
                {sc.urgent ? "Clôture imminente" : "Candidatures ouvertes"}
              </span>
              {/* Domaine */}
              <span style={{ fontSize: "0.6rem", fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "0.28rem 0.85rem", borderRadius: 100,
                background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.8)",
                border: "1px solid rgba(255,255,255,.16)",
                backdropFilter: "blur(8px)" }}>
                {sc.domain}
              </span>
            </div>

            {/* Titre */}
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(1.7rem, 4.5vw, 3.5rem)",
              fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08,
              color: "#F8F6F1", maxWidth: "22ch", marginBottom: "1.5rem",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(20px)",
              transition: "opacity .9s .25s, transform .9s .25s" }}>
              {sc.title}
            </h1>

            {/* Méta organisation + pays */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem",
              flexWrap: "wrap",
              opacity: heroVisible ? 1 : 0, transition: "opacity .8s .4s" }}>
              {/* Org */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `linear-gradient(135deg, ${lc.color}, ${lc.dark})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 900, color: "#fff" }}>
                  {sc.organization.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#F8F6F1" }}>
                    {sc.organization}
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,.42)" }}>
                    {sc.flag} {sc.country}
                  </div>
                </div>
              </div>

              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.14)", flexShrink: 0 }}/>

              {/* Deadline */}
              <div>
                <div style={{ fontSize: "0.58rem", fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "rgba(255,255,255,.38)", marginBottom: "0.15rem" }}>
                  Date limite
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: 800,
                  color: sc.urgent ? "#FF8A75" : "#F8F6F1" }}>
                  {sc.deadline}
                  {daysLeft !== null && daysLeft > 0 && (
                    <span style={{ fontSize: "0.6rem", fontWeight: 600,
                      color: daysLeft < 15 ? "#FF8A75" : "rgba(255,255,255,.45)",
                      marginLeft: "0.6rem" }}>
                      ({daysLeft}j restants)
                    </span>
                  )}
                  {daysLeft !== null && daysLeft <= 0 && (
                    <span style={{ fontSize: "0.6rem", color: "#FF8A75", marginLeft: "0.5rem" }}>
                      Expiré
                    </span>
                  )}
                </div>
              </div>

              {sc.amount && (
                <>
                  <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.14)", flexShrink: 0 }}/>
                  <div>
                    <div style={{ fontSize: "0.58rem", fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "rgba(255,255,255,.38)", marginBottom: "0.15rem" }}>
                      Financement
                    </div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#C08435" }}>
                      {sc.amount}
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
          <div style={{ maxWidth: 1340, margin: "0 auto",
            padding: "0 clamp(1rem, 5vw, 4rem)" }}>
            <div className="bs-layout">

              {/* ── CONTENU PRINCIPAL ── */}
              <div className="bs-main">

                {/* Barre actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem",
                  padding: "2rem 0 1.75rem",
                  borderBottom: "1px solid rgba(20,20,16,.07)",
                  flexWrap: "wrap" }}>
                  <button onClick={() => setSaved(!saved)}
                    className="bs-btn"
                    style={ saved ? { background: lc.bg, color: lc.color, borderColor: lc.color } : {} }>
                    <IcoBookmark on={saved}/>
                    {saved ? "Sauvegardée" : "Sauvegarder"}
                  </button>
                  <button className="bs-btn"><IcoShare /> Partager</button>

                </div>

                {/* ── Contenu libre en blocs ── */}
                <RevealWrapper>
                  <BlockRenderer blocks={blocks} color={lc.color} bg={lc.bg} dark={lc.dark} />
                </RevealWrapper>
              </div>

              {/* ── SIDEBAR STICKY ── */}
              <aside className="bs-sidebar">

                {/* ─ CTA Principal ─ */}
                <div className="bs-cta-card" style={{ borderTopColor: lc.color }}>
                  {/* Countdown */}
                  {daysLeft !== null && (
                    <div style={{ display: "flex", alignItems: "center",
                      justifyContent: "space-between", marginBottom: "1.25rem",
                      padding: "0.85rem 1rem",
                      background: sc.urgent ? "#FFF4F2" : lc.bg,
                      borderRadius: 12,
                      border: `1px solid ${sc.urgent ? "#FFD0C8" : "rgba(20,20,16,.08)"}` }}>
                      <div>
                        <div style={{ fontSize: "0.55rem", fontWeight: 800,
                          letterSpacing: "0.15em", textTransform: "uppercase",
                          color: sc.urgent ? "#B8341E" : "#928E80", marginBottom: "0.2rem" }}>
                          Clôture dans
                        </div>
                        <div style={{ fontFamily: "'Fraunces', Georgia, serif",
                          fontSize: "1.5rem", fontWeight: 900,
                          color: sc.urgent ? "#B8341E" : lc.color, lineHeight: 1 }}>
                          {daysLeft > 0 ? `${daysLeft}j` : "Expiré"}
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: "1.5rem", fontWeight: 900,
                        color: "rgba(20,20,16,.08)" }}>
                        {sc.flag}
                      </div>
                    </div>
                  )}

                  {/* Infos clés */}
                  {[
                    { label: "Date limite", value: sc.deadline, bold: sc.urgent, color: sc.urgent ? "#B8341E" : lc.color },
                    { label: "Financement", value: sc.amount ?? "Non précisé", bold: true, color: "#1A5C40" },
                    { label: "Niveau", value: sc.level, bold: false, color: "#38382E" },
                    { label: "Domaine", value: sc.domain, bold: false, color: "#38382E" },
                    { label: "Destination", value: `${sc.flag} ${sc.country}`, bold: false, color: "#38382E" },
                    { label: "Organisateur", value: sc.organization, bold: false, color: "#38382E" },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", gap: "1rem",
                      padding: "0.8rem 0",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(20,20,16,.07)" : "none" }}>
                      <span style={{ fontSize: "0.62rem", fontWeight: 700,
                        letterSpacing: "0.07em", textTransform: "uppercase",
                        color: "#928E80", flexShrink: 0 }}>
                        {row.label}
                      </span>
                      <span style={{ fontSize: "0.85rem",
                        fontWeight: row.bold ? 800 : 500,
                        color: row.color, textAlign: "right", lineHeight: 1.3 }}>
                        {row.value}
                      </span>
                    </div>
                  ))}

                  {/* CTA Bouton */}
                  <a href="#" style={{ display: "flex", alignItems: "center",
                    justifyContent: "center", gap: "0.5rem",
                    width: "100%", textAlign: "center",
                    background: lc.color, color: "#fff",
                    padding: "1rem", borderRadius: 100,
                    fontWeight: 800, fontSize: "0.9rem",
                    textDecoration: "none",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    boxShadow: `0 6px 24px ${lc.color}44`,
                    transition: "all .25s", marginTop: "1.5rem" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = lc.dark;
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 12px 32px ${lc.color}55`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = lc.color;
                      (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 6px 24px ${lc.color}44`;
                    }}>
                    Postuler maintenant <IcoExternal />
                  </a>
                  <div style={{ textAlign: "center", marginTop: "0.65rem",
                    fontSize: "0.65rem", color: "#928E80" }}>
                    Candidature externe · Site officiel
                  </div>
                </div>

                {/* ─ Tags ─ */}
                <div className="bs-sidebar-block">
                  <div className="bs-sidebar-label">Tags</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {sc.tags.map((t) => (
                      <span key={t} style={{ fontSize: "0.6rem", fontWeight: 700,
                        letterSpacing: "0.06em", textTransform: "uppercase",
                        padding: "0.28rem 0.75rem", borderRadius: 100,
                        background: lc.bg, color: lc.color }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>


              </aside>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            AUTRES BOURSES
        ══════════════════════════════════════════ */}
        <section style={{ background: "#F0EDE4", padding: "5rem 0" }}>
          <div style={{ maxWidth: 1340, margin: "0 auto",
            padding: "0 clamp(1rem, 5vw, 4rem)" }}>

            <div style={{ display: "flex", alignItems: "flex-end",
              justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
              marginBottom: "2.25rem", paddingBottom: "1.25rem",
              borderBottom: "2px solid #141410" }}>
              <div>
                <div style={{ fontSize: "0.58rem", fontWeight: 800,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "#C08435", marginBottom: "0.45rem" }}>
                  Continuer à explorer
                </div>
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 900,
                  letterSpacing: "-0.035em", color: "#141410", margin: 0 }}>
                  Autres{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435" }}>
                    bourses
                  </em>
                </h2>
              </div>
              <Link href="/bourses" style={{ fontSize: "0.78rem", fontWeight: 700,
                color: "#C08435", textDecoration: "none",
                padding: "0.5rem 1.25rem", borderRadius: 100,
                border: "1.5px solid rgba(192,132,53,.3)",
                background: "rgba(192,132,53,.06)" }}>
                Toutes les bourses →
              </Link>
            </div>

            <div className="bs-related-grid">
              {related.map((r, ri) => {
                const rlc = LEVEL_COLOR[r.level] ?? LEVEL_COLOR["Master"];
                const rdaysLeft = daysUntil(r.deadline);
                return (
                  <RevealWrapper key={r.id} delay={ri * 0.1}>
                    <Link href={`/bourses/${r.slug}`}
                      style={{ textDecoration: "none", display: "block", height: "100%" }}>
                      <div className="bs-related-card">
                        {/* Image + badge */}
                        <div style={{ height: 160, position: "relative",
                          overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ position: "absolute", inset: 0,
                            background: r.imageGradient }}/>
                          <div style={{ position: "absolute", inset: 0,
                            background: "linear-gradient(180deg,transparent 30%,rgba(0,0,0,.75) 100%)" }}/>
                          {/* Flag + pays */}
                          <div style={{ position: "absolute", bottom: "0.8rem",
                            left: "0.9rem", display: "flex", alignItems: "center",
                            gap: "0.35rem", fontSize: "0.65rem", fontWeight: 700,
                            color: "#fff", background: "rgba(0,0,0,.4)",
                            backdropFilter: "blur(8px)",
                            padding: "0.3rem 0.7rem", borderRadius: 100 }}>
                            {r.flag} {r.country}
                          </div>
                          {/* Urgence */}
                          {r.urgent && (
                            <div style={{ position: "absolute", top: "0.8rem",
                              right: "0.8rem", display: "flex", alignItems: "center",
                              gap: "0.3rem", fontSize: "0.55rem", fontWeight: 800,
                              letterSpacing: "0.1em", textTransform: "uppercase",
                              color: "#fff", background: "#B8341E",
                              padding: "0.25rem 0.65rem", borderRadius: 100 }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%",
                                background: "rgba(255,255,255,.7)",
                                animation: "blink 1.4s ease-in-out infinite",
                                display: "inline-block" }}/>
                              Urgent
                            </div>
                          )}
                          {/* Trait coloré bas */}
                          <div style={{ position: "absolute", bottom: 0, left: 0,
                            right: 0, height: 3, background: rlc.color }}/>
                        </div>
                        {/* Corps */}
                        <div style={{ padding: "1.25rem 1.4rem", display: "flex",
                          flexDirection: "column", flex: 1 }}>
                          <div style={{ fontSize: "0.58rem", fontWeight: 800,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            color: rlc.color, marginBottom: "0.4rem" }}>
                            {r.organization}
                          </div>
                          <h3 style={{ fontFamily: "'Fraunces', Georgia, serif",
                            fontSize: "0.97rem", fontWeight: 700, color: "#141410",
                            lineHeight: 1.3, flex: 1, marginBottom: "0.75rem",
                            display: "-webkit-box", WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                          } as React.CSSProperties}>{r.title}</h3>
                          <div style={{ display: "flex", gap: "0.4rem",
                            flexWrap: "wrap", marginBottom: "0.75rem" }}>
                            <span style={{ fontSize: "0.55rem", fontWeight: 700,
                              padding: "0.2rem 0.6rem", borderRadius: 100,
                              background: rlc.bg, color: rlc.color }}>{r.level}</span>
                            {r.amount && (
                              <span style={{ fontSize: "0.55rem", fontWeight: 700,
                                padding: "0.2rem 0.6rem", borderRadius: 100,
                                background: "#EAF4EF", color: "#1A5C40" }}>{r.amount}</span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center",
                            justifyContent: "space-between", paddingTop: "0.75rem",
                            borderTop: "1px solid rgba(20,20,16,.07)", marginTop: "auto" }}>
                            <span style={{ fontSize: "0.6rem", color: "#928E80" }}>
                              Deadline : <b style={{ color: r.urgent ? "#B8341E" : "#38382E" }}>
                                {r.deadline}
                              </b>
                            </span>
                            {rdaysLeft !== null && rdaysLeft > 0 && (
                              <span style={{ fontSize: "0.6rem", fontWeight: 700,
                                color: rdaysLeft < 15 ? "#B8341E" : "#928E80" }}>
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
    </>
  );
}