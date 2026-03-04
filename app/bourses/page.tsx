"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import { scholarships, type ScholarshipLevel } from "@/lib/data";

/* ─── Config niveaux ─── */
const LEVELS: ScholarshipLevel[] = ["Licence", "Master", "Doctorat", "Postdoc", "Toutes formations"];

const LEVEL_STYLE: Record<string, { color: string; bg: string }> = {
  "Licence":           { color: "#1E4DA8", bg: "#EBF0FB" },
  "Master":            { color: "#1A5C40", bg: "#EAF4EF" },
  "Doctorat":          { color: "#7A1E4A", bg: "#F9EBF3" },
  "Postdoc":           { color: "#9B6B1A", bg: "#FBF4E8" },
  "Toutes formations": { color: "#141410", bg: "#F0EDE4" },
};

/* ─── Pill niveau ─── */
function LevelPill({ level, inverted = false }: { level: string; inverted?: boolean }) {
  const s = LEVEL_STYLE[level] ?? { color: "#928E80", bg: "#F0EDE4" };
  if (inverted) return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem",
      fontSize:"0.55rem", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase",
      padding:"0.22rem 0.7rem", borderRadius:100,
      background:"rgba(255,255,255,.15)", color:"#fff",
      border:"1px solid rgba(255,255,255,.2)", backdropFilter:"blur(8px)" }}>
      {level}
    </span>
  );
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem",
      fontSize:"0.55rem", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase",
      padding:"0.22rem 0.7rem", borderRadius:100, background:s.bg, color:s.color }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
      {level}
    </span>
  );
}

/* ─── Méta bourse (équivalent Byline) ─── */
function BurseMeta({ sc, light = false }: { sc: typeof scholarships[0]; light?: boolean }) {
  const col  = light ? "rgba(248,246,241,.45)" : "#928E80";
  const bold = light ? "rgba(248,246,241,.8)"  : "#38382E";
  const red  = light ? "#E8B86D"               : "#B8341E";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"0.9rem", fontSize:"0.6rem", color:col }}>
      <span style={{ fontWeight:700, color:bold }}>{sc.flag} {sc.country}</span>
      <span style={{ width:3, height:3, borderRadius:"50%", background:col, flexShrink:0 }}/>
      <span style={{ color: sc.urgent ? red : col, fontWeight: sc.urgent ? 700 : 400 }}>
        📅 {sc.deadline}
      </span>
      {sc.amount && <>
        <span style={{ width:3, height:3, borderRadius:"50%", background:col, flexShrink:0 }}/>
        <span style={{ fontWeight:600, color: light ? "rgba(248,246,241,.65)" : "#1A5C40" }}>
          💰 {sc.amount}
        </span>
      </>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */
export default function BoursesPage() {
  const [filter, setFilter] = useState<"Tout" | ScholarshipLevel>("Tout");

  /* ── Découpage éditorial propre aux bourses ── */
  const urgentes   = scholarships.filter(s => s.urgent);          // Clôture imminente
  const vedette    = urgentes[0];                                  // Bourse en vedette
  const sideUrgent = urgentes.slice(1, 4);                        // Sidebar urgentes
  const spotlight  = scholarships.find(s => !s.urgent)!;          // Mise en avant sombre
  const parNiveau  = scholarships.filter(s =>
    !s.urgent && s.id !== spotlight.id).slice(0, 6);              // 2×3 par niveau
  const remaining  = scholarships.filter(s =>
    !urgentes.includes(s) && s.id !== spotlight.id && !parNiveau.includes(s));
  const filtered   = filter === "Tout"
    ? remaining
    : remaining.filter(s => s.level === filter);

  return (
    <>
      <Navbar />

      <main style={{ background:"#EEEADE" }}>

        {/* ══════════════════════════════════════════
            MASTHEAD BOURSES
        ══════════════════════════════════════════ */}
        <div style={{ background:"#141410", paddingTop:"clamp(4.5rem,8vh,6.5rem)" }}>
          <div className="nw-wrap">

            {/* Topbar : compteurs urgences + filtres rapides */}
            <div className="nw-topbar">
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                <span className="dot-live"/>
                <span className="nw-meta">
                  {urgentes.length} clôture{urgentes.length > 1 ? "s" : ""} imminente{urgentes.length > 1 ? "s" : ""}
                  &ensp;·&ensp;{scholarships.length} bourses actives
                </span>
              </div>
              <div className="nw-topbar-nav">
                {LEVELS.filter(l => l !== "Toutes formations").map(l => (
                  <button key={l} className="nw-topbar-link"
                    onClick={() => {
                      setFilter(l);
                      document.getElementById("bs-grid")?.scrollIntoView({ behavior:"smooth" });
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Masthead */}
            <div className="nw-masthead">
              <div className="nw-masthead-left">
                <div className="nw-edition-tag">Financement · Afrique</div>
                <h1 className="nw-masthead-title">
                  Bour<span style={{ color:"#C08435", fontStyle:"italic", fontWeight:200 }}>ses</span>
                </h1>
              </div>
              <div className="nw-masthead-right">
                <p className="nw-masthead-desc">
                  Opportunités de financement vérifiées —<br/>
                  Masters, Doctorats, formations internationales.
                </p>
                {/* Stats par niveau */}
                <div style={{ display:"flex", gap:"1.25rem", flexWrap:"wrap" }}>
                  {LEVELS.filter(l => l !== "Toutes formations").map(l => {
                    const count = scholarships.filter(s => s.level === l).length;
                    const s = LEVEL_STYLE[l];
                    return (
                      <div key={l} style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
                        <span style={{ fontSize:"0.6rem", fontWeight:600,
                          color:"rgba(248,246,241,.35)", letterSpacing:"0.05em" }}>
                          {l} <strong style={{ color:"rgba(248,246,241,.7)" }}>{count}</strong>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div style={{ height:3, background:"linear-gradient(90deg, #C08435 0%, #E8B86D 50%, #C08435 100%)" }}/>
        </div>

        {/* ══════════════════════════════════════════
            ZONE 1 — VEDETTE URGENTE + SIDEBAR
            La manchette = bourse la plus urgente
        ══════════════════════════════════════════ */}
        {vedette && (
          <div className="nw-wrap" style={{ paddingTop:"2.5rem" }}>
            <div className="nw-zone1">

              {/* Bourse vedette */}
              <Link href={`/bourses/${vedette.slug}`} className="nw-hero-link">
                <article className="nw-hero">
                  <div className="nw-hero-img" style={{ background: vedette.imageGradient }}>
                    <div className="nw-hero-overlay"/>
                    <div className="nw-hero-ghost-num">{vedette.flag}</div>
                    {/* Badge urgent */}
                    <div className="nw-hero-badge">
                      <span style={{ width:6, height:6, borderRadius:"50%",
                        background:"#fff", display:"inline-block" }}/>
                      Clôture imminente
                    </div>
                    {/* Montant en surimpression */}
                    {vedette.amount && (
                      <div style={{ position:"absolute", bottom:"1.25rem", right:"1.25rem",
                        fontSize:"0.72rem", fontWeight:800, letterSpacing:"0.04em",
                        padding:"0.3rem 0.9rem", borderRadius:100,
                        background:"#1A5C40", color:"#fff",
                        boxShadow:"0 4px 20px rgba(0,0,0,.3)" }}>
                        💰 {vedette.amount}
                      </div>
                    )}
                  </div>
                  <div className="nw-hero-body">
                    <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                      <LevelPill level={vedette.level}/>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem",
                        fontSize:"0.55rem", fontWeight:800, letterSpacing:"0.12em",
                        textTransform:"uppercase", padding:"0.22rem 0.7rem", borderRadius:100,
                        background:"#FAEBE8", color:"#B8341E" }}>
                        <span style={{ width:5, height:5, borderRadius:"50%",
                          background:"#B8341E", flexShrink:0 }}/>
                        Urgent
                      </span>
                    </div>
                    <h2 className="nw-hero-title">{vedette.title}</h2>
                    <p className="nw-hero-excerpt">
                      {vedette.organization} · {vedette.country} · {vedette.domain}
                    </p>
                    <div style={{ display:"flex", alignItems:"center",
                      justifyContent:"space-between",
                      paddingTop:"1.25rem", borderTop:"1px solid rgba(20,20,16,.08)" }}>
                      <BurseMeta sc={vedette}/>
                      <span className="nw-read-cta">Postuler →</span>
                    </div>
                  </div>
                </article>
              </Link>

              {/* Sidebar : autres urgentes */}
              <aside className="nw-sidebar">
                <div className="nw-sidebar-label">À ne pas manquer</div>
                {sideUrgent.map((sc, i) => (
                  <Link key={sc.id} href={`/bourses/${sc.slug}`} className="nw-sidebar-link">
                    <article className="nw-sidebar-art"
                      style={{ borderBottom: i < sideUrgent.length - 1
                        ? "1px solid rgba(20,20,16,.09)" : "none" }}>
                      <div className="nw-sidebar-thumb" style={{ background: sc.imageGradient }}>
                        <div style={{ position:"absolute", inset:0,
                          background:"linear-gradient(135deg,transparent,rgba(0,0,0,.28))" }}/>
                        <div style={{ position:"absolute", bottom:"0.3rem", right:"0.4rem",
                          fontSize:"1.2rem", lineHeight:1 }}>{sc.flag}</div>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <LevelPill level={sc.level}/>
                        <h3 className="nw-sidebar-title">{sc.title}</h3>
                        <BurseMeta sc={sc}/>
                      </div>
                    </article>
                  </Link>
                ))}
              </aside>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            ZONE 2 — SPOTLIGHT SOMBRE
            La bourse la plus dotée / emblématique
        ══════════════════════════════════════════ */}
        <div style={{ margin:"2.5rem 0", background:"#141410",
          position:"relative", overflow:"hidden" }}>
          <div className="nw-wrap">
            <Link href={`/bourses/${spotlight.slug}`}
              style={{ textDecoration:"none", display:"block" }}>
              <div className="nw-spotlight">
                <div className="nw-spotlight-img" style={{ background: spotlight.imageGradient }}>
                  <div style={{ position:"absolute", inset:0,
                    background:"linear-gradient(90deg, #141410 0%, rgba(20,20,16,.4) 60%, transparent 100%)" }}/>
                  {/* Flag décoratif */}
                  <div style={{ position:"absolute", bottom:"1.5rem", right:"2rem",
                    fontSize:"5rem", lineHeight:1,
                    filter:"drop-shadow(0 4px 24px rgba(0,0,0,.5))" }}>
                    {spotlight.flag}
                  </div>
                </div>
                <div className="nw-spotlight-body">
                  <div style={{ fontSize:"0.58rem", fontWeight:800, letterSpacing:"0.2em",
                    textTransform:"uppercase", color:"#C08435", marginBottom:"1rem" }}>
                    Bourse d&apos;excellence
                  </div>
                  <LevelPill level={spotlight.level} inverted/>
                  <h2 className="nw-spotlight-title">{spotlight.title}</h2>
                  <p className="nw-spotlight-excerpt">
                    {spotlight.organization} · {spotlight.country}<br/>
                    {spotlight.domain}
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:"2rem", marginTop:"2rem" }}>
                    <BurseMeta sc={spotlight} light/>
                    <span style={{ marginLeft:"auto", fontSize:"0.8rem", fontWeight:700,
                      color:"#C08435", display:"flex", alignItems:"center", gap:"0.4rem",
                      flexShrink:0, borderBottom:"1.5px solid rgba(192,132,53,.3)",
                      paddingBottom:"2px" }}>
                      Voir la bourse
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </div>
                <div style={{ position:"absolute", top:0, left:-10, width:4,
                  height:"100%", background:"#C08435" }}/>
              </div>
            </Link>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            ZONE 3 — SÉLECTION PAR NIVEAU
            6 bourses en 2 rangées de 3
        ══════════════════════════════════════════ */}
        <div className="nw-wrap">
          <div className="nw-section-header">
            <div className="nw-section-rule"/>
            <span className="nw-section-label">Sélection · Tous niveaux</span>
            <div className="nw-section-rule"/>
          </div>
          <div className="nw-trio">
            {parNiveau.map((sc, i) => (
              <Link key={sc.id} href={`/bourses/${sc.slug}`} style={{ textDecoration:"none" }}>
                <article className="nw-trio-card">
                  <div className="nw-trio-img" style={{ background: sc.imageGradient }}>
                    <div style={{ position:"absolute", inset:0,
                      background:"linear-gradient(180deg,transparent 45%,rgba(0,0,0,.65) 100%)" }}/>
                    <div style={{ position:"absolute", top:"0.85rem", left:"0.85rem" }}>
                      <LevelPill level={sc.level} inverted/>
                    </div>
                    {/* Numéro décoratif */}
                    <div style={{ position:"absolute", bottom:"-1rem", right:"0.75rem",
                      fontFamily:"'Fraunces', Georgia, serif", fontSize:"3rem", fontWeight:900,
                      color:"rgba(255,255,255,.09)", lineHeight:1, letterSpacing:"-0.04em",
                      pointerEvents:"none" }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    {/* Flag */}
                    <div style={{ position:"absolute", bottom:"0.85rem", left:"0.9rem",
                      fontSize:"1.4rem", lineHeight:1 }}>{sc.flag}</div>
                    {/* Montant */}
                    {sc.amount && (
                      <div style={{ position:"absolute", bottom:"0.85rem", right:"0.9rem",
                        fontSize:"0.58rem", fontWeight:800, padding:"0.2rem 0.6rem",
                        borderRadius:100, background:"#1A5C40", color:"#fff" }}>
                        {sc.amount}
                      </div>
                    )}
                  </div>
                  <div style={{ padding:"1.25rem 1.35rem" }}>
                    <div style={{ fontSize:"0.6rem", fontWeight:800, letterSpacing:"0.1em",
                      textTransform:"uppercase", color:"#C08435", marginBottom:"0.35rem" }}>
                      {sc.organization}
                    </div>
                    <h3 className="nw-trio-title">{sc.title}</h3>
                    <p className="nw-trio-excerpt">{sc.domain}</p>
                    <div style={{ paddingTop:"0.85rem", borderTop:"1px solid rgba(20,20,16,.07)",
                      marginTop:"0.5rem" }}>
                      <BurseMeta sc={sc}/>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            ZONE 4 — GRILLE FILTRÉE PAR NIVEAU
        ══════════════════════════════════════════ */}
        <div id="bs-grid" className="nw-wrap"
          style={{ paddingTop:"1rem", paddingBottom:"5rem" }}>

          <div className="nw-grid-header">
            <div>
              <h2 className="nw-grid-title">
                {filter === "Tout" ? "Toutes les bourses" : `Niveau ${filter}`}
              </h2>
              <span className="nw-grid-count">
                {filtered.length} bourse{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="nw-filters">
              {(["Tout", ...LEVELS.filter(l => l !== "Toutes formations")] as ("Tout"|ScholarshipLevel)[])
                .map(f => {
                  const active = filter === f;
                  const s = LEVEL_STYLE[f as string];
                  return (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`nw-filter-btn ${active ? "nw-filter-btn--active" : ""}`}
                      style={active && s ? { background:s.color, color:"#fff" } : {}}>
                      {f === "Tout" ? "Tout" : f}
                    </button>
                  );
                })}
              {filter !== "Tout" && (
                <button onClick={() => setFilter("Tout")} className="nw-filter-clear">
                  ✕ Effacer
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"6rem 0" }}>
              <p style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:"1.5rem",
                color:"rgba(20,20,16,.15)", fontWeight:900 }}>—</p>
              <p style={{ color:"#928E80", fontSize:"0.88rem", marginTop:"0.5rem" }}>
                Aucune bourse dans cette catégorie.
              </p>
              <button onClick={() => setFilter("Tout")} className="nw-load-btn"
                style={{ marginTop:"1.5rem" }}>
                Voir tout
              </button>
            </div>
          ) : (
            <div className="nw-grid">
              {filtered.map((sc, i) => {
                const isWide = i % 7 === 0;
                return (
                  <Link key={sc.id} href={`/bourses/${sc.slug}`}
                    style={{ textDecoration:"none", gridColumn: isWide ? "span 2" : "span 1" }}>
                    <article className={`nw-card ${isWide ? "nw-card--wide" : ""}`}>
                      <div className={`nw-card-img ${isWide ? "nw-card-img--wide" : ""}`}
                        style={{ background: sc.imageGradient }}>
                        <div style={{ position:"absolute", inset:0,
                          background: isWide
                            ? "linear-gradient(180deg,rgba(0,0,0,.06) 0%,rgba(0,0,0,.72) 100%)"
                            : "linear-gradient(180deg,transparent 40%,rgba(0,0,0,.55) 100%)" }}/>
                        <div style={{ position:"absolute", top:"0.85rem", left:"0.85rem" }}>
                          <LevelPill level={sc.level} inverted={!isWide}/>
                        </div>
                        {/* Flag */}
                        <div style={{ position:"absolute", bottom:"0.75rem", left:"0.85rem",
                          fontSize: isWide ? "1.8rem" : "1.2rem", lineHeight:1 }}>
                          {sc.flag}
                        </div>
                        {sc.urgent && (
                          <div style={{ position:"absolute", top:"0.85rem", right:"0.85rem",
                            fontSize:"0.55rem", fontWeight:800, letterSpacing:"0.1em",
                            textTransform:"uppercase", padding:"0.2rem 0.62rem",
                            borderRadius:100, background:"#B8341E", color:"#fff" }}>
                            Urgent
                          </div>
                        )}
                        {isWide && (
                          <div style={{ position:"absolute", bottom:"0.5rem", right:"1rem",
                            fontFamily:"'Fraunces', Georgia, serif", fontSize:"4.5rem",
                            fontWeight:900, color:"rgba(255,255,255,.07)", lineHeight:1 }}>
                            {String(i + 1).padStart(2, "0")}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: isWide ? "1.5rem 1.75rem" : "1rem 1.2rem",
                        display:"flex", flexDirection:"column", flex:1, gap:"0.4rem" }}>
                        <div style={{ fontSize:"0.58rem", fontWeight:800,
                          letterSpacing:"0.1em", textTransform:"uppercase", color:"#C08435" }}>
                          {sc.organization}
                        </div>
                        {!isWide && <div style={{ marginBottom:"0.1rem" }}>
                          <LevelPill level={sc.level}/>
                        </div>}
                        <h3 className={`nw-card-title ${isWide ? "nw-card-title--wide" : ""}`}>
                          {sc.title}
                        </h3>
                        {isWide && (
                          <p className="nw-card-excerpt">
                            {sc.domain} · {sc.country}
                          </p>
                        )}
                        <div style={{ marginTop:"auto", paddingTop:"0.75rem",
                          borderTop:"1px solid rgba(20,20,16,.06)" }}>
                          <BurseMeta sc={sc}/>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{ textAlign:"center", marginTop:"4rem" }}>
              <button className="nw-load-btn">
                Charger plus de bourses
                <span style={{ marginLeft:"0.75rem", fontSize:"0.6rem", fontWeight:800,
                  background:"rgba(248,246,241,.15)", padding:"0.15rem 0.6rem",
                  borderRadius:100 }}>+12</span>
              </button>
            </div>
          )}
        </div>
      </main>

      <NewsletterBand />
      <Footer />
    </>
  );
}