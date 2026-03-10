"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { events, type Block } from "@/lib/data";

/* ─── Couleurs par type ─── */
const TYPE_COLOR: Record<string, { color: string; bg: string; dark: string }> = {
  "Conférence": { color: "#1E4DA8", bg: "#EBF0FB", dark: "#102860" },
  "Forum":      { color: "#1A5C40", bg: "#EAF4EF", dark: "#0F3828" },
  "Hackathon":  { color: "#B8341E", bg: "#FAEBE8", dark: "#7A2010" },
  "Salon":      { color: "#C08435", bg: "#FBF4E8", dark: "#7A5220" },
  "Atelier":    { color: "#7A1E4A", bg: "#F9EBF3", dark: "#52123A" },
  "Sommet":     { color: "#141410", bg: "#F0EDE4", dark: "#000" },
};

/* ─── Icônes ─── */
const IcoArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const IcoCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const IcoCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IcoPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IcoUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const IcoExternal = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

/* ══════════════════════════════════════════════════════
   CHECKLIST INTERACTIVE
══════════════════════════════════════════════════════ */
function ChecklistBlock({ block, color, bg }: {
  block: { title?: string; items: { label: string; detail?: string }[] };
  color: string; bg: string;
}) {
  const [checked, setChecked] = useState<number[]>([]);
  const toggle = (j: number) =>
    setChecked(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]);
  const total = block.items.length;
  const done = checked.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
      {block.title && <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>{block.title}</div>}
      {total > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
          <div style={{ flex: 1, height: 4, background: "rgba(20,20,16,.08)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 100, background: color, width: `${(done / total) * 100}%`, transition: "width .3s cubic-bezier(.34,1.56,.64,1)" }} />
          </div>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: color, flexShrink: 0 }}>{done}/{total}</span>
        </div>
      )}
      {block.items.map((item, j) => {
        const on = checked.includes(j);
        return (
          <div key={j} onClick={() => toggle(j)} style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", padding: "0.85rem 1rem", background: on ? bg : "#fff", borderRadius: 14, border: `1px solid ${on ? color : "rgba(20,20,16,.07)"}`, cursor: "pointer", transition: "all .18s", boxShadow: on ? "none" : "0 1px 4px rgba(20,20,16,.04)" }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, transition: "all .18s", background: on ? color : "transparent", border: `2px solid ${on ? color : "rgba(20,20,16,.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginTop: "0.1rem" }}>
              {on && <IcoCheck />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.86rem", fontWeight: 600, color: on ? color : "#141410", textDecoration: on ? "line-through" : "none", textDecorationColor: color, lineHeight: 1.4, marginBottom: item.detail ? "0.2rem" : 0 }}>{item.label}</div>
              {item.detail && <div style={{ fontSize: "0.7rem", color: "#928E80", lineHeight: 1.5 }}>{item.detail}</div>}
            </div>
          </div>
        );
      })}
      {done === total && total > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.8rem 1rem", background: bg, border: `1.5px solid ${color}`, borderRadius: 14 }}>
          <span>✅</span>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: color }}>Tout prêt — inscrivez-vous !</span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   BLOCK RENDERER
══════════════════════════════════════════════════════ */
function BlockRenderer({ blocks, color, bg, dark }: { blocks: Block[]; color: string; bg: string; dark: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
      {blocks.map((block, i) => {
        switch (block.type) {

          case "paragraph":
            return <p key={i} style={{ fontSize: "0.95rem", color: "#38382E", lineHeight: 1.85, fontWeight: 300, margin: 0 }}>{block.text}</p>;

          case "heading":
            return block.level === 3
              ? <h3 key={i} style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.05rem", fontWeight: 800, color: "#141410", margin: 0 }}>{block.text}</h3>
              : (
                <div key={i} style={{ paddingTop: "0.75rem" }}>
                  <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.35rem", fontWeight: 900, letterSpacing: "-0.025em", color: "#141410", margin: "0 0 0.6rem" }}>{block.text}</h2>
                  <div style={{ width: "2.5rem", height: 3, background: color, borderRadius: 100 }} />
                </div>
              );

          case "pullquote":
            return (
              <blockquote key={i} style={{ margin: 0, padding: "1.4rem 1.75rem", borderLeft: `4px solid ${color}`, background: bg, borderRadius: "0 16px 16px 0" }}>
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.05rem", fontWeight: 700, fontStyle: "italic", color: "#141410", lineHeight: 1.55, marginBottom: block.author ? "0.65rem" : 0 }}>« {block.text} »</p>
                {block.author && <div style={{ fontSize: "0.67rem", fontWeight: 700, color: color, textTransform: "uppercase", letterSpacing: "0.1em" }}>— {block.author}{block.role ? `, ${block.role}` : ""}</div>}
              </blockquote>
            );

          case "factbox":
            return (
              <div key={i} style={{ padding: "1.4rem 1.6rem", background: "#141410", borderRadius: 18, border: "1px solid rgba(248,246,241,.06)" }}>
                <div style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C08435", marginBottom: "0.9rem" }}>💡 {block.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {block.facts.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start" }}>
                      <span style={{ color: "#C08435", fontWeight: 700, fontSize: "0.65rem", flexShrink: 0, marginTop: "0.15rem" }}>→</span>
                      <span style={{ fontSize: "0.8rem", color: "rgba(248,246,241,.65)", lineHeight: 1.6 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "alert": {
            const styles = { info: { bg: "#EBF0FB", border: "#1E4DA8", icon: "ℹ️" }, warning: { bg: "#FFF4EB", border: "#C08435", icon: "⚠️" }, tip: { bg: "#EAF4EF", border: "#1A5C40", icon: "💡" } };
            const s = styles[block.variant ?? "info"];
            return (
              <div key={i} style={{ display: "flex", gap: "0.75rem", padding: "0.95rem 1.15rem", background: s.bg, border: `1.5px solid ${s.border}40`, borderRadius: 13 }}>
                <span style={{ flexShrink: 0 }}>{s.icon}</span>
                <p style={{ fontSize: "0.84rem", color: "#141410", lineHeight: 1.6, margin: 0 }}>{block.message}</p>
              </div>
            );
          }

          case "divider":
            return <hr key={i} style={{ border: "none", borderTop: "1px solid rgba(20,20,16,.08)", margin: "0.25rem 0" }} />;

          case "checklist":
            return <ChecklistBlock key={i} block={block} color={color} bg={bg} />;

          case "steps":
            return (
              <div key={i}>
                {block.title && <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>{block.title}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                  {block.items.map((step, j) => (
                    <div key={j} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", position: "relative", paddingBottom: j < block.items.length - 1 ? "1.25rem" : 0 }}>
                      {j < block.items.length - 1 && <div style={{ position: "absolute", left: 17, top: 36, width: 2, height: "calc(100% - 16px)", background: `linear-gradient(180deg, ${color}40, transparent)` }} />}
                      <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${color}, ${dark})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.78rem", fontWeight: 900, color: "#fff", boxShadow: `0 4px 10px ${color}44` }}>{j + 1}</div>
                      <div style={{ flex: 1, paddingTop: "0.4rem" }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#141410", marginBottom: "0.2rem" }}>{step.label}</div>
                        <div style={{ fontSize: "0.78rem", color: "#928E80", lineHeight: 1.6 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "benefits":
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.65rem" }}>
                {block.items.map((b, j) => (
                  <div key={j} style={{ padding: "1rem 1.1rem", background: b.highlight ? bg : "#fff", borderRadius: 14, border: `1px solid ${b.highlight ? color : "rgba(20,20,16,.07)"}`, boxShadow: b.highlight ? "none" : "0 1px 4px rgba(20,20,16,.04)" }}>
                    <div style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>{b.icon}</div>
                    <div style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: b.highlight ? color : "#928E80", marginBottom: "0.25rem" }}>{b.label}</div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#141410", lineHeight: 1.35 }}>{b.value}</div>
                  </div>
                ))}
              </div>
            );

          case "compare":
            return (
              <div key={i}>
                {block.title && <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.65rem" }}>{block.title}</div>}
                <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(20,20,16,.08)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: `1.5fr ${block.columns.map(() => "1fr").join(" ")}`, background: "#141410" }}>
                    <div style={{ padding: "0.65rem 0.9rem" }} />
                    {block.columns.map((col, j) => (
                      <div key={j} style={{ padding: "0.65rem 0.9rem", fontSize: "0.65rem", fontWeight: 800, color: col.color ?? color, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", borderLeft: "1px solid rgba(255,255,255,.06)" }}>{col.label}</div>
                    ))}
                  </div>
                  {block.rows.map((row, j) => (
                    <div key={j} style={{ display: "grid", gridTemplateColumns: `1.5fr ${block.columns.map(() => "1fr").join(" ")}`, background: j % 2 === 0 ? "#fff" : "#F8F6F1", borderTop: "1px solid rgba(20,20,16,.06)" }}>
                      <div style={{ padding: "0.65rem 0.9rem", fontSize: "0.78rem", fontWeight: 600, color: "#38382E" }}>{row.label}</div>
                      {row.values.map((val, k) => <div key={k} style={{ padding: "0.65rem 0.9rem", fontSize: "0.75rem", color: "#928E80", textAlign: "center", borderLeft: "1px solid rgba(20,20,16,.06)" }}>{val}</div>)}
                    </div>
                  ))}
                </div>
              </div>
            );

          case "location":
            return (
              <div key={i} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(20,20,16,.08)", boxShadow: "0 2px 10px rgba(20,20,16,.05)" }}>
                {block.mapUrl
                  ? <iframe src={block.mapUrl} width="100%" height="200" style={{ display: "block", border: "none" }} loading="lazy" title={block.label} />
                  : <div style={{ height: 160, background: `linear-gradient(135deg, ${bg}, #E8E4DA)`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.4rem" }}><span style={{ fontSize: "1.75rem" }}>📍</span><span style={{ fontSize: "0.72rem", color: "#928E80", fontWeight: 600 }}>{block.label}</span></div>
                }
                <div style={{ padding: "0.85rem 1rem", background: "#fff", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>📍</div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#141410" }}>{block.label}</div>
                    {block.address && <div style={{ fontSize: "0.7rem", color: "#928E80", marginTop: "0.1rem" }}>{block.address}</div>}
                  </div>
                </div>
              </div>
            );

          case "apply":
            return (
              <div key={i} style={{ padding: "1.6rem", background: `linear-gradient(135deg, ${dark}, #141410)`, borderRadius: 18, border: `1px solid ${color}30`, boxShadow: `0 4px 20px ${color}15` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                  {block.deadline && <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: color }}>⏳ Date limite : {block.deadline}</div>}
                  <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 900, color: "#F8F6F1", lineHeight: 1.3 }}>{block.label}</div>
                  {block.note && <div style={{ fontSize: "0.76rem", color: "rgba(248,246,241,.5)", lineHeight: 1.6 }}>{block.note}</div>}
                  <a href={block.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.4rem", background: color, color: "#fff", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: "0.86rem", boxShadow: `0 4px 14px ${color}50`, alignSelf: "flex-start" }}>
                    S'inscrire maintenant →
                  </a>
                </div>
              </div>
            );

          case "external":
            return (
              <a key={i} href={block.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.9rem 1.1rem", background: "#fff", border: "1px solid rgba(20,20,16,.07)", borderRadius: 13, textDecoration: "none", boxShadow: "0 1px 4px rgba(20,20,16,.04)" }}>
                {block.favicon && <img src={block.favicon} alt="" width={15} height={15} style={{ borderRadius: 3 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#141410" }}>{block.label}</div>
                  {block.description && <div style={{ fontSize: "0.7rem", color: "#928E80", marginTop: "0.1rem" }}>{block.description}</div>}
                </div>
                <IcoExternal />
              </a>
            );

          case "download":
            return (
              <a key={i} href={block.url} download style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.9rem 1.1rem", background: bg, border: `1.5px solid ${color}30`, borderRadius: 13, textDecoration: "none" }}>
                <span style={{ fontSize: "1.1rem" }}>📥</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.86rem", fontWeight: 700, color: color }}>{block.label}</div>
                  {block.size && <div style={{ fontSize: "0.68rem", color: "#928E80" }}>{block.size}</div>}
                </div>
              </a>
            );

          /* ── Bloc agenda — spécifique aux événements ── */
          case "agenda":
            return (
              <div key={i}>
                {block.title && <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>{block.title}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {block.sessions.map((s, j) => (
                    <div key={j} style={{ display: "flex", gap: "1.1rem", alignItems: "flex-start", padding: "0.8rem 1rem", borderRadius: 13, background: s.highlight ? bg : "#fff", border: `1px solid ${s.highlight ? color + "40" : "rgba(20,20,16,.06)"}` }}>
                      <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.82rem", fontWeight: 900, color: s.highlight ? color : "#928E80", flexShrink: 0, minWidth: 42, lineHeight: 1.4 }}>{s.time}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.88rem", fontWeight: s.highlight ? 700 : 500, color: "#141410", lineHeight: 1.35 }}>{s.title}</div>
                        {s.speaker && <div style={{ fontSize: "0.7rem", color: "#928E80", marginTop: "0.2rem" }}>{s.speaker}</div>}
                      </div>
                      {s.tag && <div style={{ fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.2rem 0.55rem", borderRadius: 100, background: color + "18", color: color, flexShrink: 0 }}>{s.tag}</div>}
                    </div>
                  ))}
                </div>
              </div>
            );

          /* ── Bloc speakers ── */
          case "speakers":
            return (
              <div key={i}>
                {block.title && <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>{block.title}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.7rem" }}>
                  {block.people.map((p, j) => (
                    <div key={j} style={{ padding: "1.1rem", background: "#fff", borderRadius: 16, border: "1px solid rgba(20,20,16,.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", textAlign: "center", boxShadow: "0 1px 6px rgba(20,20,16,.04)" }}>
                      {p.avatar
                        ? <img src={p.avatar} alt={p.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
                        : <div style={{ width: 52, height: 52, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", border: `2px solid ${color}30` }}>{p.emoji ?? "👤"}</div>
                      }
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#141410", lineHeight: 1.3 }}>{p.name}</div>
                        <div style={{ fontSize: "0.68rem", color: color, fontWeight: 600, marginTop: "0.15rem" }}>{p.role}</div>
                        {p.org && <div style={{ fontSize: "0.65rem", color: "#928E80", marginTop: "0.1rem" }}>{p.org}</div>}
                      </div>
                    </div>
                  ))}
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

/* ══════════════════════════════════════════════════════
   PAGE EXPORT
══════════════════════════════════════════════════════ */
export default function EventDetailPage({ params }: { params: { slug: string } }) {
  return <EventClient slug={params.slug} />;
}

/* ══════════════════════════════════════════════════════
   COMPOSANT CLIENT
══════════════════════════════════════════════════════ */
function EventClient({ slug }: { slug: string }) {
  const ev = events.find((e) => e.slug === slug);
  if (!ev) notFound();

  const [heroVisible, setHeroVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const tc = TYPE_COLOR[ev.type] ?? TYPE_COLOR["Conférence"];
  const blocks = (ev as any).blocks as Block[] | undefined;
  const related = events.filter((e) => e.id !== ev.id).slice(0, 4);

  useEffect(() => { requestAnimationFrame(() => setHeroVisible(true)); }, []);

  return (
    <>
      <Navbar />

      {/* ══ HERO CINÉMATIQUE ══ */}
      <div style={{ paddingTop: "62px" }}>
        <div style={{ position: "relative", background: ev.imageGradient, minHeight: "72vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>

          {/* Grille déco */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${tc.color}08 1px, transparent 1px), linear-gradient(90deg, ${tc.color}08 1px, transparent 1px)`, backgroundSize: "72px 72px", pointerEvents: "none" }} />

          {/* Cercles décoratifs */}
          <div style={{ position: "absolute", top: "-15%", right: "-8%", width: "55vw", height: "55vw", borderRadius: "50%", border: `1px solid ${tc.color}18`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-5%", right: "2%", width: "35vw", height: "35vw", borderRadius: "50%", border: `1px solid ${tc.color}12`, pointerEvents: "none" }} />

          {/* Gradient bas */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(transparent, rgba(0,0,0,.7))", pointerEvents: "none" }} />

          {/* Contenu hero */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", width: "100%", padding: "0 2.5rem 4rem", opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateY(20px)", transition: "all .8s cubic-bezier(.16,1,.3,1)" }}>

            {/* Breadcrumb */}
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,.4)", marginBottom: "2rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Accueil</Link>
              <span>/</span>
              <Link href="/evenements" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Événements</Link>
              <span>/</span>
              <span style={{ color: "rgba(255,255,255,.65)" }}>{ev.title}</span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.5rem", alignItems: "center" }}>
              {/* Badge type */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.3rem 0.85rem", borderRadius: 100, background: tc.color, color: "#fff" }}>
                {ev.type}
              </div>
              {/* Tags */}
              {ev.tags.map((tag) => (
                <div key={tag} style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.7rem", borderRadius: 100, background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.65)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,.12)" }}>
                  {tag}
                </div>
              ))}
            </div>

            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.02, color: "#fff", marginBottom: "2rem", maxWidth: 820 }}>
              {ev.title}
            </h1>

            {/* Méta strip */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "rgba(255,255,255,.75)" }}>
                <IcoCalendar /> {ev.day} {ev.month} {ev.year}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "rgba(255,255,255,.75)" }}>
                <IcoPin /> {ev.location}, {ev.flag}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "rgba(255,255,255,.75)" }}>
                <IcoUsers /> {ev.attendees} participants
              </div>
              <div style={{ height: 18, width: 1, background: "rgba(255,255,255,.15)" }} />
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,.5)" }}>
                par <span style={{ color: "rgba(255,255,255,.8)", fontWeight: 600 }}>{ev.organizer}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ BARRE ACTIONS ══ */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(20,20,16,.07)", position: "sticky", top: 62, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0.85rem 2.5rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/evenements" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.78rem", fontWeight: 600, color: "#928E80", textDecoration: "none", padding: "0.5rem 1rem", borderRadius: 100, border: "1px solid rgba(20,20,16,.1)" }}>
            <IcoArrow /> Retour
          </Link>
          <div style={{ flex: 1 }} />
          <button onClick={() => setSaved(!saved)} style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.78rem", fontWeight: 600, padding: "0.5rem 1.1rem", borderRadius: 100, border: `1px solid ${saved ? tc.color : "rgba(20,20,16,.1)"}`, background: saved ? tc.bg : "transparent", color: saved ? tc.color : "#928E80", cursor: "pointer" }}>
            {saved ? "★ Sauvegardé" : "☆ Sauvegarder"}
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.78rem", fontWeight: 600, padding: "0.5rem 1.1rem", borderRadius: 100, border: "1px solid rgba(20,20,16,.1)", background: "transparent", color: "#928E80", cursor: "pointer" }}>
            <IcoShare /> Partager
          </button>
          <a href="#inscription" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.78rem", fontWeight: 700, padding: "0.5rem 1.3rem", borderRadius: 100, background: tc.color, color: "#fff", textDecoration: "none", boxShadow: `0 2px 10px ${tc.color}40` }}>
            S'inscrire →
          </a>
        </div>
      </div>

      {/* ══ CORPS ══ */}
      <div style={{ background: "#F8F6F1", padding: "3.5rem 0 5rem" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 2.5rem", display: "grid", gridTemplateColumns: "1fr 320px", gap: "2.5rem", alignItems: "start" }}>

          {/* ── CONTENU PRINCIPAL ── */}
          <div>
            {/* Excerpt */}
            <RevealWrapper>
              <div style={{ background: "#fff", borderRadius: 24, padding: "2rem 2.25rem", boxShadow: "0 2px 12px rgba(20,20,16,.06)", marginBottom: "1.5rem", borderTop: `4px solid ${tc.color}` }}>
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 400, fontStyle: "italic", color: "#38382E", lineHeight: 1.7, margin: 0 }}>
                  {ev.excerpt}
                </p>
              </div>
            </RevealWrapper>

            {/* Blocs libres ou fallback */}
            <div style={{ background: "#fff", borderRadius: 24, padding: "2rem 2.25rem", boxShadow: "0 2px 12px rgba(20,20,16,.06)" }}>
              {blocks && blocks.length > 0
                ? (
                  <RevealWrapper>
                    <BlockRenderer blocks={blocks} color={tc.color} bg={tc.bg} dark={tc.dark} />
                  </RevealWrapper>
                )
                : (
                  /* Fallback élégant si pas de blocks — affiche juste un message éditorial */
                  <div style={{ padding: "2rem 0", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📋</div>
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#141410", marginBottom: "0.5rem" }}>Détails à venir</div>
                    <div style={{ fontSize: "0.82rem", color: "#928E80" }}>Le programme complet sera publié prochainement.</div>
                  </div>
                )
              }
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <aside style={{ position: "sticky", top: "110px", display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Date + CTA */}
            <div id="inscription" style={{ background: "#fff", borderRadius: 24, padding: "1.75rem", boxShadow: "0 2px 12px rgba(20,20,16,.06)", borderTop: `4px solid ${tc.color}` }}>
              {/* Big date */}
              <div style={{ textAlign: "center", padding: "1.25rem 0 1.5rem", borderBottom: "1px solid rgba(20,20,16,.07)", marginBottom: "1.5rem" }}>
                <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "4.5rem", fontWeight: 900, color: tc.color, lineHeight: 1, display: "block" }}>{ev.day}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#928E80", letterSpacing: "0.06em", textTransform: "uppercase" }}>{ev.month} {ev.year}</span>
              </div>

              {/* Infos */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                  { icon: "🏷️", label: "Type", value: ev.type },
                  { icon: "📍", label: "Lieu", value: `${ev.location}, ${ev.country}` },
                  { icon: "👥", label: "Participants", value: ev.attendees },
                  { icon: "🏛️", label: "Organisateur", value: ev.organizer },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.15rem" }}>{item.label}</div>
                      <div style={{ fontSize: "0.85rem", color: "#38382E", fontWeight: 500 }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <a href="#" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", textAlign: "center", background: tc.color, color: "#fff", padding: "0.95rem", borderRadius: 14, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", boxShadow: `0 4px 14px ${tc.color}45` }}>
                S'inscrire à l'événement →
              </a>
            </div>

            {/* Tags */}
            {ev.tags.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 20, padding: "1.25rem 1.5rem", boxShadow: "0 2px 8px rgba(20,20,16,.05)" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.75rem" }}>Thématiques</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {ev.tags.map((tag) => (
                    <div key={tag} style={{ fontSize: "0.68rem", fontWeight: 700, padding: "0.3rem 0.75rem", borderRadius: 100, background: tc.bg, color: tc.color, border: `1px solid ${tc.color}20` }}>{tag}</div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ══ ÉVÉNEMENTS LIÉS ══ */}
      <div style={{ padding: "5rem 0", background: "#F0EDE4" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2.5rem" }}>
          <div style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.5rem" }}>À ne pas manquer</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.9rem", fontWeight: 900, letterSpacing: "-0.035em", marginBottom: "2.25rem", color: "#141410" }}>
            Autres <em style={{ fontStyle: "italic", color: tc.color, fontWeight: 200 }}>événements</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.1rem" }}>
            {related.map((r) => {
              const rc = TYPE_COLOR[r.type] ?? TYPE_COLOR["Conférence"];
              return (
                <Link key={r.id} href={`/evenements/${r.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 22, border: "1px solid rgba(20,20,16,.06)", overflow: "hidden", boxShadow: "0 1px 4px rgba(20,20,16,.05)", transition: "transform .2s, box-shadow .2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(20,20,16,.1)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(20,20,16,.05)"; }}>
                    {/* Date header */}
                    <div style={{ background: rc.bg, borderBottom: `1px solid ${rc.color}20`, padding: "0.85rem 1.1rem", display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                      <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2rem", fontWeight: 900, color: rc.color, lineHeight: 1 }}>{r.day}</span>
                      <div style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#928E80", lineHeight: 1.5 }}>{r.month}<br />{r.year}</div>
                    </div>
                    <div style={{ padding: "0.9rem 1.1rem" }}>
                      <div style={{ fontSize: "0.56rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: rc.color, marginBottom: "0.3rem" }}>{r.type}</div>
                      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.86rem", fontWeight: 800, lineHeight: 1.3, marginBottom: "0.5rem", color: "#141410" }}>{r.title}</div>
                      <div style={{ fontSize: "0.62rem", color: "#928E80" }}>📍 {r.location} {r.flag}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <NewsletterBand />
      <Footer />
    </>
  );
}