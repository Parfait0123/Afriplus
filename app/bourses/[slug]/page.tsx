"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { scholarships } from "@/lib/data";

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
  const [checkedDocs, setCheckedDocs] = useState<number[]>([]);

  const lc      = LEVEL_COLOR[sc.level] ?? LEVEL_COLOR["Master"];
  const content = sc.content;
  const daysLeft = daysUntil(sc.deadline);

  const related = scholarships.filter((s) => s.id !== sc.id).slice(0, 3);

  useEffect(() => { requestAnimationFrame(() => setHeroVisible(true)); }, []);

  const toggleDoc = (i: number) => {
    setCheckedDocs((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

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

                  {/* Progress checklist */}
                  <div style={{ marginLeft: "auto", display: "flex",
                    alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: 80, height: 5, background: "rgba(20,20,16,.1)",
                      borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 100,
                        background: lc.color,
                        width: `${(checkedDocs.length / content.documents.length) * 100}%`,
                        transition: "width .3s" }}/>
                    </div>
                    <span style={{ fontSize: "0.6rem", color: "#928E80", fontWeight: 600 }}>
                      {checkedDocs.length}/{content.documents.length} docs
                    </span>
                  </div>
                </div>

                {/* Section : À propos */}
                <RevealWrapper>
                  <section style={{ paddingTop: "2.5rem" }}>
                    <div className="bs-section-tag" style={{ color: lc.color }}>
                      À propos du programme
                    </div>
                    <h2 className="bs-h2">Présentation de la bourse</h2>
                    <div style={{ width: "2.8rem", height: 3, background: lc.color,
                      borderRadius: 100, margin: "1rem 0 1.5rem" }}/>
                    <p className="bs-p">{content.description}</p>
                    <p className="bs-p">{content.mission}</p>
                  </section>
                </RevealWrapper>

                {/* Section : Avantages */}
                <RevealWrapper>
                  <section style={{ paddingTop: "3rem" }}>
                    <div className="bs-section-tag" style={{ color: lc.color }}>Ce que couvre la bourse</div>
                    <h2 className="bs-h2">Avantages & financement</h2>
                    <div style={{ width: "2.8rem", height: 3, background: lc.color,
                      borderRadius: 100, margin: "1rem 0 1.75rem" }}/>
                    <div className="bs-benefits-grid">
                      {content.benefits.map((b, i) => (
                        <div key={i} className={`bs-benefit-card ${b.highlight ? "bs-benefit-card--highlight" : ""}`}
                          style={ b.highlight ? { borderColor: lc.color, background: lc.bg } : {} }>
                          <div style={{ fontSize: "1.5rem", marginBottom: "0.6rem" }}>{b.icon}</div>
                          <div style={{ fontSize: "0.6rem", fontWeight: 800,
                            letterSpacing: "0.12em", textTransform: "uppercase",
                            color: b.highlight ? lc.color : "#928E80",
                            marginBottom: "0.3rem" }}>{b.label}</div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 600,
                            color: "#141410", lineHeight: 1.4 }}>{b.value}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                </RevealWrapper>

                {/* Section : Éligibilité */}
                <RevealWrapper>
                  <section style={{ paddingTop: "3rem" }}>
                    <div className="bs-section-tag" style={{ color: lc.color }}>Conditions</div>
                    <h2 className="bs-h2">Critères d'éligibilité</h2>
                    <div style={{ width: "2.8rem", height: 3, background: lc.color,
                      borderRadius: 100, margin: "1rem 0 1.75rem" }}/>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {content.eligibility.map((c, i) => (
                        <div key={i} style={{ display: "flex", gap: "0.85rem",
                          alignItems: "flex-start", padding: "0.9rem 1.1rem",
                          background: "#fff", borderRadius: 14,
                          border: "1px solid rgba(20,20,16,.07)",
                          boxShadow: "0 1px 6px rgba(20,20,16,.04)" }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%",
                            background: lc.bg, color: lc.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0 }}>
                            <IcoCheck />
                          </div>
                          <span style={{ fontSize: "0.88rem", color: "#38382E",
                            fontWeight: 400, lineHeight: 1.55 }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </RevealWrapper>

                {/* Section : Documents — checklist interactive */}
                <RevealWrapper>
                  <section style={{ paddingTop: "3rem" }}>
                    <div className="bs-section-tag" style={{ color: lc.color }}>Dossier de candidature</div>
                    <h2 className="bs-h2">Documents requis</h2>
                    <div style={{ width: "2.8rem", height: 3, background: lc.color,
                      borderRadius: 100, margin: "1rem 0 0.75rem" }}/>
                    {/* Progress docs */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem",
                      marginBottom: "1.5rem" }}>
                      <div style={{ flex: 1, height: 6, background: "rgba(20,20,16,.08)",
                        borderRadius: 100, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 100, background: lc.color,
                          width: `${(checkedDocs.length / content.documents.length) * 100}%`,
                          transition: "width .3s cubic-bezier(.34,1.56,.64,1)" }}/>
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700,
                        color: lc.color, flexShrink: 0 }}>
                        {checkedDocs.length}/{content.documents.length}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {content.documents.map((doc, i) => {
                        const checked = checkedDocs.includes(i);
                        return (
                          <div key={i} onClick={() => toggleDoc(i)}
                            style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start",
                              padding: "1rem 1.15rem",
                              background: checked ? lc.bg : "#fff",
                              borderRadius: 14,
                              border: `1px solid ${checked ? lc.color : "rgba(20,20,16,.07)"}`,
                              cursor: "pointer", transition: "all .2s",
                              boxShadow: checked ? "none" : "0 1px 6px rgba(20,20,16,.04)" }}>
                            {/* Checkbox */}
                            <div style={{ width: 22, height: 22, borderRadius: 7,
                              flexShrink: 0, transition: "all .2s",
                              background: checked ? lc.color : "transparent",
                              border: `2px solid ${checked ? lc.color : "rgba(20,20,16,.2)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#fff" }}>
                              {checked && <IcoCheck />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "0.88rem", fontWeight: 700,
                                color: checked ? lc.dark : "#141410",
                                textDecoration: checked ? "line-through" : "none",
                                textDecorationColor: lc.color, lineHeight: 1.3,
                                marginBottom: "0.2rem" }}>
                                {doc.label}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "#928E80",
                                lineHeight: 1.5, fontWeight: 400 }}>
                                {doc.detail}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {checkedDocs.length === content.documents.length && (
                      <div style={{ marginTop: "1rem", padding: "1rem 1.25rem",
                        background: lc.bg, border: `1.5px solid ${lc.color}`,
                        borderRadius: 14, display: "flex", alignItems: "center",
                        gap: "0.75rem" }}>
                        <span style={{ fontSize: "1.2rem" }}>🎉</span>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: lc.dark }}>
                          Dossier complet ! Vous pouvez maintenant postuler.
                        </span>
                      </div>
                    )}
                  </section>
                </RevealWrapper>

                {/* Section : Étapes de candidature */}
                <RevealWrapper>
                  <section style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
                    <div className="bs-section-tag" style={{ color: lc.color }}>Mode d'emploi</div>
                    <h2 className="bs-h2">Comment postuler ?</h2>
                    <div style={{ width: "2.8rem", height: 3, background: lc.color,
                      borderRadius: 100, margin: "1rem 0 1.75rem" }}/>
                    <div className="bs-steps">
                      {content.steps.map((step, i) => (
                        <div key={i} className="bs-step">
                          {/* Ligne connectrice */}
                          {i < content.steps.length - 1 && (
                            <div style={{ position: "absolute", left: 18,
                              top: 40, width: 2, height: "calc(100% - 20px)",
                              background: `linear-gradient(180deg, ${lc.color}40, transparent)` }}/>
                          )}
                          <div style={{ width: 38, height: 38, borderRadius: "50%",
                            flexShrink: 0,
                            background: `linear-gradient(135deg, ${lc.color}, ${lc.dark})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'Fraunces', Georgia, serif",
                            fontSize: "0.85rem", fontWeight: 900, color: "#fff",
                            boxShadow: `0 4px 12px ${lc.color}44` }}>
                            {step.num}
                          </div>
                          <div style={{ flex: 1, paddingTop: "0.5rem" }}>
                            <div style={{ fontSize: "0.95rem", fontWeight: 700,
                              color: "#141410", marginBottom: "0.3rem" }}>
                              {step.label}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#928E80",
                              lineHeight: 1.6 }}>
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tips */}
                    <div style={{ marginTop: "2rem", padding: "1.5rem 1.75rem",
                      background: "#141410", borderRadius: 20,
                      border: "1px solid rgba(248,246,241,.06)" }}>
                      <div style={{ fontSize: "0.58rem", fontWeight: 800,
                        letterSpacing: "0.2em", textTransform: "uppercase",
                        color: "#C08435", marginBottom: "1rem" }}>
                        💡 Conseils AfriPulse
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        {content.tips.map((tip, i) => (
                          <div key={i} style={{ display: "flex", gap: "0.7rem",
                            alignItems: "flex-start" }}>
                            <span style={{ color: "#C08435", fontWeight: 700,
                              fontSize: "0.7rem", flexShrink: 0, marginTop: "0.15rem" }}>→</span>
                            <span style={{ fontSize: "0.82rem", color: "rgba(248,246,241,.65)",
                              lineHeight: 1.6 }}>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
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

                {/* ─ Checklist rapide ─ */}
                <div className="bs-sidebar-block"
                  style={{ background: "#141410", border: "none" }}>
                  <div className="bs-sidebar-label" style={{ color: "#C08435" }}>
                    Ma checklist
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,.08)",
                    borderRadius: 100, overflow: "hidden", marginBottom: "0.85rem" }}>
                    <div style={{ height: "100%", borderRadius: 100,
                      background: "#C08435",
                      width: `${(checkedDocs.length / content.documents.length) * 100}%`,
                      transition: "width .3s" }}/>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(248,246,241,.45)",
                    marginBottom: "0.5rem" }}>
                    {checkedDocs.length === 0 && "Cochez les docs préparés ci-contre"}
                    {checkedDocs.length > 0 && checkedDocs.length < content.documents.length &&
                      `${content.documents.length - checkedDocs.length} document${content.documents.length - checkedDocs.length > 1 ? "s" : ""} restant${content.documents.length - checkedDocs.length > 1 ? "s" : ""}`}
                    {checkedDocs.length === content.documents.length && "✓ Dossier complet !"}
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