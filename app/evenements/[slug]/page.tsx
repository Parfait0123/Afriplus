"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import RegisterEventButton from "@/components/ui/RegisterEventButton";
import { events, type Block } from "@/lib/data";
import { createBrowserClient } from "@supabase/ssr";

/* ── Supabase client ── */
let _sb: ReturnType<typeof createBrowserClient> | null = null;
function getSB() {
  if (!_sb) _sb = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return _sb;
}

/* ── Couleurs par type ── */
const TYPE_COLOR: Record<string, { color: string; bg: string; dark: string }> = {
  "Conférence": { color: "#1E4DA8", bg: "#EBF0FB", dark: "#102860" },
  "Forum":      { color: "#1A5C40", bg: "#EAF4EF", dark: "#0F3828" },
  "Hackathon":  { color: "#B8341E", bg: "#FAEBE8", dark: "#7A2010" },
  "Salon":      { color: "#C08435", bg: "#FBF4E8", dark: "#7A5220" },
  "Atelier":    { color: "#7A1E4A", bg: "#F9EBF3", dark: "#52123A" },
  "Sommet":     { color: "#141410", bg: "#F0EDE4", dark: "#000" },
};

/* ================================================================
   ICÔNES
   ================================================================ */
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
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const IcoLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IcoBookmark = ({ on }: { on: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
const IcoExternal = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

/* ================================================================
   CHECKLIST INTERACTIVE
   ================================================================ */
function ChecklistBlock({ block, color, bg }: {
  block: { title?: string; items: { label: string; detail?: string }[] };
  color: string; bg: string;
}) {
  const [checked, setChecked] = useState<number[]>([]);
  const toggle = (j: number) =>
    setChecked(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]);
  const total = block.items.length;
  const done  = checked.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
      {block.title && (
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>
          {block.title}
        </div>
      )}
      {total > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
          <div style={{ flex: 1, height: 4, background: "rgba(20,20,16,.08)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 100, background: color, width: `${(done / total) * 100}%`, transition: "width .3s cubic-bezier(.34,1.56,.64,1)" }} />
          </div>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, color, flexShrink: 0 }}>{done}/{total}</span>
        </div>
      )}
      {block.items.map((item, j) => {
        const on = checked.includes(j);
        return (
          <div key={j} onClick={() => toggle(j)}
            style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", padding: "0.85rem 1rem", background: on ? bg : "#fff", borderRadius: 14, border: `1px solid ${on ? color : "rgba(20,20,16,.07)"}`, cursor: "pointer", transition: "all .18s", boxShadow: on ? "none" : "0 1px 4px rgba(20,20,16,.04)" }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: on ? color : "transparent", border: `2px solid ${on ? color : "rgba(20,20,16,.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginTop: "0.1rem", transition: "all .18s" }}>
              {on && <IcoCheck />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.86rem", fontWeight: 600, color: on ? color : "#141410", textDecoration: on ? "line-through" : "none", textDecorationColor: color, lineHeight: 1.4, marginBottom: item.detail ? "0.2rem" : 0 }}>
                {item.label}
              </div>
              {item.detail && <div style={{ fontSize: "0.7rem", color: "#928E80", lineHeight: 1.5 }}>{item.detail}</div>}
            </div>
          </div>
        );
      })}
      {done === total && total > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.8rem 1rem", background: bg, border: `1.5px solid ${color}`, borderRadius: 14 }}>
          <span>✅</span>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color }}>Tout prêt — inscrivez-vous !</span>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   BLOCK RENDERER
   ================================================================ */
function BlockRenderer({ blocks, color, bg, dark }: {
  blocks: Block[]; color: string; bg: string; dark: string;
}) {
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
                {block.author && <div style={{ fontSize: "0.67rem", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.1em" }}>— {block.author}{block.role ? `, ${block.role}` : ""}</div>}
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
            const styles = {
              info:    { bg: "#EBF0FB", border: "#1E4DA8", icon: "ℹ️" },
              warning: { bg: "#FFF4EB", border: "#C08435",  icon: "⚠️" },
              tip:     { bg: "#EAF4EF", border: "#1A5C40",  icon: "💡" },
            };
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
              <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.65rem" }}>
                {block.items.map((b, j) => (
                  <div key={j} style={{ padding: "1rem 1.1rem", background: b.highlight ? bg : "#fff", borderRadius: 14, border: `1px solid ${b.highlight ? color : "rgba(20,20,16,.07)"}`, boxShadow: b.highlight ? "none" : "0 1px 4px rgba(20,20,16,.04)" }}>
                    <div style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>{b.icon}</div>
                    <div style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: b.highlight ? color : "#928E80", marginBottom: "0.25rem" }}>{b.label}</div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#141410", lineHeight: 1.35 }}>{b.value}</div>
                  </div>
                ))}
              </div>
            );

          case "external":
            return (
              <a key={i} href={block.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.9rem 1.1rem", background: "#fff", border: "1px solid rgba(20,20,16,.07)", borderRadius: 13, textDecoration: "none", boxShadow: "0 1px 4px rgba(20,20,16,.04)" }}>
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
              <a key={i} href={block.url} download
                style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.9rem 1.1rem", background: bg, border: `1.5px solid ${color}30`, borderRadius: 13, textDecoration: "none" }}>
                <span style={{ fontSize: "1.1rem" }}>📥</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.86rem", fontWeight: 700, color }}>{block.label}</div>
                  {block.size && <div style={{ fontSize: "0.68rem", color: "#928E80" }}>{block.size}</div>}
                </div>
              </a>
            );

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
                      {s.tag && <div style={{ fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.2rem 0.55rem", borderRadius: 100, background: color + "18", color, flexShrink: 0 }}>{s.tag}</div>}
                    </div>
                  ))}
                </div>
              </div>
            );

          case "speakers":
            return (
              <div key={i}>
                {block.title && <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>{block.title}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.7rem" }}>
                  {block.people.map((p, j) => (
                    <div key={j} style={{ padding: "1.1rem", background: "#fff", borderRadius: 16, border: "1px solid rgba(20,20,16,.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", textAlign: "center", boxShadow: "0 1px 6px rgba(20,20,16,.04)" }}>
                      {p.avatar
                        ? <img src={p.avatar} alt={p.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
                        : <div style={{ width: 52, height: 52, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", border: `2px solid ${color}30` }}>{p.emoji ?? "👤"}</div>
                      }
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#141410", lineHeight: 1.3 }}>{p.name}</div>
                        <div style={{ fontSize: "0.68rem", color, fontWeight: 600, marginTop: "0.15rem" }}>{p.role}</div>
                        {p.org && <div style={{ fontSize: "0.65rem", color: "#928E80", marginTop: "0.1rem" }}>{p.org}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          default: return null;
        }
      })}
    </div>
  );
}

/* ================================================================
   PAGE EXPORT
   ================================================================ */
export default function EventDetailPage({ params }: { params: { slug: string } }) {
  return <EventClient slug={params.slug} />;
}

/* ================================================================
   COMPOSANT CLIENT
   ================================================================ */
function EventClient({ slug }: { slug: string }) {
  const ev = events.find(e => e.slug === slug);
  if (!ev) notFound();

  const [heroVisible, setHeroVisible] = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [savingLoad,  setSavingLoad]  = useState(false);
  const [copied,      setCopied]      = useState(false);

  const tc     = TYPE_COLOR[ev.type] ?? TYPE_COLOR["Conférence"];
  const blocks = (ev as any).blocks as Block[] | undefined;
  const related = events.filter(e => e.id !== ev.id).slice(0, 4);

  /* Animation hero */
  useEffect(() => { requestAnimationFrame(() => setHeroVisible(true)); }, []);

  /* Charger état de sauvegarde */
  useEffect(() => {
    const sb = getSB();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        try {
          const local = localStorage.getItem(`saved-event-${ev.slug}`);
          if (local) setSaved(JSON.parse(local));
        } catch {}
        return;
      }
      const { data: row } = await sb.from("saves")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("content_type", "event")
        .eq("content_slug", ev.slug)
        .maybeSingle();
      setSaved(!!row);
    });
  }, [ev.slug]);

  /* Toggle sauvegarde */
  const toggleSave = async () => {
    setSavingLoad(true);
    const sb = getSB();
    const { data: { user } } = await sb.auth.getUser();

    if (!user) {
      const next = !saved;
      setSaved(next);
      try { localStorage.setItem(`saved-event-${ev.slug}`, JSON.stringify(next)); } catch {}
      setSavingLoad(false);
      return;
    }
    if (saved) {
      setSaved(false);
      await sb.from("saves").delete()
        .eq("user_id", user.id)
        .eq("content_type", "event")
        .eq("content_slug", ev.slug);
    } else {
      setSaved(true);
      await sb.from("saves").insert({
        user_id:       user.id,
        content_type:  "event",
        content_slug:  ev.slug,
        content_title: ev.title,
        content_meta:  { date: `${ev.day} ${ev.month} ${ev.year}`, location: ev.location },
      });
    }
    setSavingLoad(false);
  };

  /* Partage */
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ url, title: ev.title }); } catch {}
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <>
      <Navbar />

      {/* ════ HERO ════ */}
      <div style={{ paddingTop: "62px" }}>
        <div className="ev-hero" style={{ background: ev.imageGradient }}>

          {/* Grille déco */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${tc.color}08 1px, transparent 1px), linear-gradient(90deg, ${tc.color}08 1px, transparent 1px)`, backgroundSize: "72px 72px", pointerEvents: "none" }} />

          {/* Cercles déco — masqués sur mobile via CSS */}
          <div className="ev-hero-circles">
            <div style={{ position: "absolute", top: "-15%", right: "-8%", width: "55vw", height: "55vw", borderRadius: "50%", border: `1px solid ${tc.color}18`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "-5%", right: "2%", width: "35vw", height: "35vw", borderRadius: "50%", border: `1px solid ${tc.color}12`, pointerEvents: "none" }} />
          </div>

          {/* Gradient bas */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(transparent, rgba(0,0,0,.75))", pointerEvents: "none" }} />

          {/* Contenu */}
          <div className="ev-hero-inner" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateY(20px)", transition: "all .8s cubic-bezier(.16,1,.3,1)" }}>

            {/* Breadcrumb */}
            <div className="ev-breadcrumb">
              <Link href="/" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Accueil</Link>
              <span style={{ color: "rgba(255,255,255,.25)" }}>/</span>
              <Link href="/evenements" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Événements</Link>
              <span style={{ color: "rgba(255,255,255,.25)" }}>/</span>
              <span style={{ color: "rgba(255,255,255,.65)" }}>{ev.type}</span>
            </div>

            {/* Badges */}
            <div className="ev-badges">
              <div style={{ display: "inline-flex", alignItems: "center", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.3rem 0.85rem", borderRadius: 100, background: tc.color, color: "#fff" }}>
                {ev.type}
              </div>
              {ev.tags.map(tag => (
                <div key={tag} style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.7rem", borderRadius: 100, background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.65)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,.12)" }}>
                  {tag}
                </div>
              ))}
            </div>

            {/* Titre */}
            <h1 className="ev-title">
              {ev.title}
            </h1>

            {/* Méta strip */}
            <div className="ev-meta-strip">
              <div className="ev-meta-item">
                <IcoCalendar /> {ev.day} {ev.month} {ev.year}
              </div>
              <div className="ev-meta-item">
                <IcoPin /> {ev.location}{ev.flag ? ` ${ev.flag}` : ""}
              </div>
              <div className="ev-meta-item">
                <IcoUsers /> {ev.attendees} participants
              </div>
              <span className="ev-meta-sep" />
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,.5)" }}>
                par <span style={{ color: "rgba(255,255,255,.8)", fontWeight: 600 }}>{ev.organizer}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════ BARRE ACTIONS ════ */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(20,20,16,.07)", position: "sticky", top: 62, zIndex: 40 }}>
        <div className="ev-action-bar">
          <Link href="/evenements" className="ev-back-btn">
            <IcoArrow /> <span className="ev-back-label">Retour</span>
          </Link>
          <div style={{ flex: 1 }} />
          <button onClick={toggleSave} disabled={savingLoad} className="ev-bar-btn"
            style={{ background: saved ? tc.bg : "transparent", color: saved ? tc.color : "#928E80", borderColor: saved ? tc.color : "rgba(20,20,16,.1)" }}>
            <IcoBookmark on={saved} />
            <span className="ev-btn-label">{savingLoad ? "…" : saved ? "Sauvegardé" : "Sauvegarder"}</span>
          </button>
          <button onClick={handleShare} className="ev-bar-btn">
            {copied ? <IcoLink /> : <IcoShare />}
            <span className="ev-btn-label">{copied ? "Copié !" : "Partager"}</span>
          </button>
          <a href={ev.eventUrl} className="ev-register-pill" style={{ background: tc.color, boxShadow: `0 2px 10px ${tc.color}40` }}>
            S'inscrire
          </a>
        </div>
      </div>

      {/* ════ CORPS ════ */}
      <div style={{ background: "#F8F6F1", padding: "2.5rem 0 4rem" }}>
        <div className="ev-body-wrapper">
          <div className="ev-layout">

            {/* ── Contenu principal ── */}
            <div className="ev-main">
              {/* Excerpt */}
              <RevealWrapper>
                <div className="ev-excerpt-card" style={{ borderTopColor: tc.color }}>
                  <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.05rem", fontWeight: 400, fontStyle: "italic", color: "#38382E", lineHeight: 1.7, margin: 0 }}>
                    {ev.excerpt}
                  </p>
                </div>
              </RevealWrapper>

              {/* Blocs */}
              <div className="ev-blocks-card">
                {blocks && blocks.length > 0 ? (
                  <RevealWrapper>
                    <BlockRenderer blocks={blocks} color={tc.color} bg={tc.bg} dark={tc.dark} />
                  </RevealWrapper>
                ) : (
                  <div style={{ padding: "2rem 0", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📋</div>
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#141410", marginBottom: "0.5rem" }}>Détails à venir</div>
                    <div style={{ fontSize: "0.82rem", color: "#928E80" }}>Le programme complet sera publié prochainement.</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className="ev-sidebar" id="inscription">

              {/* CTA card */}
              <div className="ev-cta-card" style={{ borderTopColor: tc.color }}>
                {/* Big date */}
                <div className="ev-date-block" style={{ borderBottomColor: "rgba(20,20,16,.07)" }}>
                  <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "4rem", fontWeight: 900, color: tc.color, lineHeight: 1, display: "block" }}>{ev.day}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#928E80", letterSpacing: "0.06em", textTransform: "uppercase" }}>{ev.month} {ev.year}</span>
                </div>

                {/* Infos */}
                <div className="ev-info-list">
                  {[
                    { icon: "🏷️", label: "Type",         value: ev.type },
                    { icon: "📍", label: "Lieu",         value: `${ev.location}${ev.flag ? `, ${ev.flag}` : ""}` },
                    { icon: "👥", label: "Participants", value: ev.attendees },
                    { icon: "🏛️", label: "Organisateur", value: ev.organizer },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.12rem" }}>{item.label}</div>
                        <div style={{ fontSize: "0.85rem", color: "#38382E", fontWeight: 500 }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

               
              </div>

              {/* Tags */}
              {ev.tags.length > 0 && (
                <div className="ev-tags-card">
                  <div className="ev-tags-label">Thématiques</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {ev.tags.map(tag => (
                      <div key={tag} style={{ fontSize: "0.68rem", fontWeight: 700, padding: "0.3rem 0.75rem", borderRadius: 100, background: tc.bg, color: tc.color, border: `1px solid ${tc.color}20` }}>
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {/* ════ ÉVÉNEMENTS LIÉS ════ */}
      <div style={{ padding: "4rem 0", background: "#F0EDE4" }}>
        <div className="ev-related-wrapper">
          <div style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.5rem" }}>À ne pas manquer</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(1.5rem,3vw,1.9rem)", fontWeight: 900, letterSpacing: "-0.035em", marginBottom: "2rem", color: "#141410" }}>
            Autres <em style={{ fontStyle: "italic", color: tc.color, fontWeight: 200 }}>événements</em>
          </h2>
          <div className="ev-related-grid">
            {related.map(r => {
              const rc = TYPE_COLOR[r.type] ?? TYPE_COLOR["Conférence"];
              return (
                <Link key={r.id} href={`/evenements/${r.slug}`} style={{ textDecoration: "none" }}>
                  <div className="ev-related-card"
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 8px 24px rgba(20,20,16,.1)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "none"; el.style.boxShadow = "0 1px 4px rgba(20,20,16,.05)"; }}>
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