import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Ticker from "@/components/sections/Ticker";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { articles, scholarships, opportunities, events } from "@/lib/data";

/* ─── Palettes catégories ─── */
const tagColors: Record<string, { bg: string; color: string }> = {
  "Politique":     { bg: "#EBF0FB", color: "#1E4DA8" },
  "Économie":      { bg: "#FBF4E8", color: "#C08435" },
  "Tech":          { bg: "#EAF4EF", color: "#1A5C40" },
  "Sport":         { bg: "#FAEBE8", color: "#B8341E" },
  "Culture":       { bg: "#FBF4E8", color: "#C08435" },
  "Santé":         { bg: "#EAF4EF", color: "#1A5C40" },
  "Environnement": { bg: "#EAF4EF", color: "#1A5C40" },
};
const oppTagColors: Record<string, { bg: string; color: string }> = {
  "Emploi CDI": { bg: "#EAF4EF", color: "#1A5C40" },
  "Stage":      { bg: "#EBF0FB", color: "#1E4DA8" },
  "Graduate":   { bg: "#FBF4E8", color: "#C08435" },
  "Emploi":     { bg: "#FBF4E8", color: "#C08435" },
};

/* ─── Styles inline réutilisables ─── */
const tagPill: React.CSSProperties = {
  display: "inline-block",
  fontSize: "0.58rem",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  padding: "0.2rem 0.62rem",
  borderRadius: 100,
};
const sectionLink: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#C08435",
  textDecoration: "none",
  padding: "0.48rem 1.15rem",
  borderRadius: 100,
  border: "1.5px solid rgba(192,132,53,.25)",
  background: "#FBF4E8",
  whiteSpace: "nowrap",
  flexShrink: 0,
};
const cardBase: React.CSSProperties = {
  background: "#fff",
  borderRadius: 20,
  border: "1px solid rgba(20,20,16,.07)",
  overflow: "hidden",
  boxShadow: "0 2px 12px rgba(20,20,16,.05)",
  transition: "box-shadow .25s, transform .25s",
};
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default function Home() {
  const hero       = articles[0];
  const topRow     = articles.slice(1, 4);  // 3 mini-articles sidebar héro
  const midRow     = articles.slice(4, 8);  // 4 articles — mosaïque UNIQUEMENT
  const allBourses = scholarships;           // 6 bourses
  const topOpps    = opportunities.slice(0, 4);
  const botOpps    = opportunities.slice(4, 8);
  const topEvents  = events.slice(0, 4);

  return (
    <>
      <Navbar />

      {/* ══════════════════════════════════════════
          HERO  — bg: #F8F6F1
      ══════════════════════════════════════════ */}
      <section style={{ background: "#F8F6F1", paddingTop: "clamp(5.5rem, 10vh, 8rem)", borderBottom: "1px solid rgba(20,20,16,.08)" }}>
        <div className="ap-container">

          {/* Barre chapeau */}
          <div className="ap-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="dot-live" />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#141410" }}>
                Mis à jour en continu
              </span>
            </div>
            <div className="ap-topbar-links">
              {(["Actualités","Bourses","Opportunités","Événements"] as const).map((cat, i) => (
                <Link key={cat} href={`/${["actualites","bourses","opportunites","evenements"][i]}`}
                  style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#928E80", textDecoration: "none" }}>
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Grille héro */}
          <div className="ap-hero-grid">

            {/* Col gauche : titre + article featured */}
            <div>
              <div className="anim-up ap-hero-badge">
                L&apos;Afrique en temps réel
              </div>

              <h1 className="anim-up-1 ap-hero-title">
                L&apos;actualité,<br />
                les{" "}
                <em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435" }}>
                  opportunités
                </em>
              </h1>

              <Link href={`/actualites/${hero.slug}`} style={{ textDecoration: "none", display: "block" }} className="anim-up-2">
                <div className="ap-hero-card card-lift">
                  <div style={{ background: hero.imageGradient, position: "relative", flexShrink: 0 }} className="ap-hero-card-img">
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,.42) 100%)" }} />
                    <span style={{ position: "absolute", top: "1rem", left: "1rem", background: "#B8341E", color: "#fff", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.28rem 0.75rem", borderRadius: 100 }}>
                      À la une
                    </span>
                  </div>
                  <div style={{ padding: "1.75rem 2rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.75rem" }}>
                    <span style={{ ...tagPill, ...(tagColors[hero.category] || {}) }}>{hero.category}</span>
                    <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.35rem", fontWeight: 700, lineHeight: 1.25, color: "#141410" }}>{hero.title}</h2>
                    <p style={{ fontSize: "0.82rem", color: "#928E80", fontWeight: 300, lineHeight: 1.72, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{hero.excerpt}</p>
                    <div style={{ display: "flex", gap: "0.9rem", fontSize: "0.67rem", color: "#928E80", paddingTop: "0.75rem", borderTop: "1px solid rgba(20,20,16,.06)" }}>
                      <span>{hero.author}</span><span>{hero.date}</span><span>{hero.readTime} min</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Col droite : stats + mini articles + CTAs */}
            <div className="ap-hero-aside">
              {/* Stats sombres */}
              <div style={{ background: "#141410", borderRadius: 20, padding: "1.75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                {[
                  { n: "12K+", l: "Lecteurs actifs" }, { n: "340+", l: "Bourses" },
                  { n: "55",   l: "Pays couverts" },   { n: "1 200+", l: "Opportunités" },
                ].map((s) => (
                  <div key={s.l}>
                    <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.7rem", fontWeight: 900, lineHeight: 1, color: "#F8F6F1", display: "block" }}>{s.n}</span>
                    <span style={{ fontSize: "0.65rem", color: "rgba(248,246,241,.45)", marginTop: "0.2rem", display: "block" }}>{s.l}</span>
                  </div>
                ))}
              </div>

              {/* Mini articles */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {topRow.map((art, i) => (
                  <Link key={art.id} href={`/actualites/${art.slug}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", gap: "1rem", padding: "1rem 0", borderBottom: i < topRow.length - 1 ? "1px solid rgba(20,20,16,.08)" : "none" }}>
                      <div style={{ width: 58, height: 58, flexShrink: 0, borderRadius: 12, background: art.imageGradient }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ ...tagPill, ...(tagColors[art.category] || {}), marginBottom: "0.3rem", display: "inline-block" }}>{art.category}</span>
                        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.85rem", fontWeight: 700, color: "#141410", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{art.title}</div>
                        <div style={{ fontSize: "0.63rem", color: "#928E80", marginTop: "0.3rem" }}>{art.date}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* CTAs */}
              <div className="ap-hero-ctas">
                <Link href="/actualites" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.88rem", fontWeight: 600, padding: "0.82rem 1.6rem", borderRadius: 100, textDecoration: "none", background: "#141410", color: "#fff", boxShadow: "0 8px 32px rgba(20,20,16,.12)" }}>
                  Explorer les actualités →
                </Link>
                <Link href="/bourses" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.88rem", fontWeight: 600, padding: "0.82rem 1.6rem", borderRadius: 100, textDecoration: "none", background: "transparent", color: "#38382E", border: "1.5px solid rgba(20,20,16,.15)" }}>
                  Voir les bourses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ══════════════════════════════════════════
          ACTUALITÉS — Mosaïque asymétrique
          bg: #fff  (contraste avec #F8F6F1 du hero)
      ══════════════════════════════════════════ */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="ap-container">
          <RevealWrapper>
            <div className="ap-section-header">
              <div>
                <div className="sh-kicker">Actualités</div>
                <h2 className="ap-section-title">
                  Aussi à la <em style={{ fontStyle: "italic", color: "#C08435", fontWeight: 200 }}>une</em>
                </h2>
              </div>
              <Link href="/actualites" style={sectionLink}>Toutes les actualités →</Link>
            </div>
          </RevealWrapper>

          <div className="ap-news-mosaic">
            {/* Grande carte immersive */}
            <RevealWrapper>
              <Link href={`/actualites/${midRow[0].slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <div className="ap-news-big card-lift" style={{ background: midRow[0].imageGradient }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.08) 0%, rgba(0,0,0,.78) 100%)" }} />
                  <span className="ap-news-num">01</span>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2rem" }}>
                    <span style={{ ...tagPill, background: "rgba(255,255,255,.15)", color: "#fff", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.2)", marginBottom: "0.75rem", display: "inline-block" }}>
                      {midRow[0].category}
                    </span>
                    <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(1.25rem, 2.2vw, 1.7rem)", fontWeight: 700, color: "#fff", lineHeight: 1.22, marginBottom: "0.85rem" }}>
                      {midRow[0].title}
                    </h3>
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,.72)", fontWeight: 300, lineHeight: 1.7, marginBottom: "1.25rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                      {midRow[0].excerpt}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,.55)" }}>{midRow[0].author} · {midRow[0].date}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", fontWeight: 700, color: "#C08435" }}>
                        Lire <ArrowIcon />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </RevealWrapper>

            {/* Liste numérotée droite */}
            <div className="ap-news-list">
              {midRow.slice(1).map((art, i) => (
                <RevealWrapper key={art.id} delay={0.1 * (i + 1)}>
                  <Link href={`/actualites/${art.slug}`} style={{ textDecoration: "none", display: "block" }}>
                    <div className="ap-news-row">
                      <span className="ap-news-row-num">0{i + 2}</span>
                      <div style={{ width: 88, height: 88, flexShrink: 0, borderRadius: 14, background: art.imageGradient, overflow: "hidden", position: "relative" }}>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, transparent 40%, rgba(0,0,0,.28) 100%)" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                          <span style={{ ...tagPill, ...(tagColors[art.category] || {}) }}>{art.category}</span>
                          <span style={{ fontSize: "0.62rem", color: "#928E80" }}>{art.readTime} min</span>
                        </div>
                        <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#141410", lineHeight: 1.3, marginBottom: "0.35rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                          {art.title}
                        </h3>
                        <div style={{ fontSize: "0.65rem", color: "#928E80" }}>{art.author} · {art.date}</div>
                      </div>
                    </div>
                  </Link>
                </RevealWrapper>
              ))}

              <RevealWrapper delay={0.35}>
                <Link href="/actualites" className="ap-news-more">
                  Voir toutes les actualités <ArrowIcon />
                </Link>
              </RevealWrapper>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BOURSES — bg: #F0EDE4
      ══════════════════════════════════════════ */}
      <section style={{ background: "#F0EDE4", padding: "5rem 0" }}>
        <div className="ap-container">
          <RevealWrapper>
            <div className="ap-section-header">
              <div>
                <div className="sh-kicker">Bourses d&apos;études</div>
                <h2 className="ap-section-title">Financez vos <em style={{ fontStyle: "italic", color: "#C08435", fontWeight: 200 }}>études</em></h2>
              </div>
              <Link href="/bourses" style={sectionLink}>Toutes les bourses →</Link>
            </div>
          </RevealWrapper>

          {/* Bandeau urgence */}
          <RevealWrapper>
            <div className="ap-urgency-bar">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.1rem" }}>⏰</span>
                <div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C08435", display: "block" }}>Deadlines proches</span>
                  <span style={{ fontSize: "0.87rem", color: "#F8F6F1", fontWeight: 500 }}>2 bourses ferment dans moins de 30 jours — ne les ratez pas</span>
                </div>
              </div>
              <Link href="/bourses?filter=urgent" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, padding: "0.55rem 1.2rem", borderRadius: 100, textDecoration: "none", background: "#C08435", color: "#fff", flexShrink: 0 }}>
                Voir les urgentes <ArrowIcon />
              </Link>
            </div>
          </RevealWrapper>

          {/* Grille 3×2 */}
          <div className="ap-grid-3">
            {allBourses.map((sc, i) => (
              <RevealWrapper key={sc.id} delay={0.07 * i}>
                <Link href={`/bourses/${sc.slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                  <div style={{ ...cardBase, display: "flex", flexDirection: "column", height: "100%" }} className="card-lift">
                    <div style={{ height: 130, background: sc.imageGradient, position: "relative", flexShrink: 0 }}>
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,.52) 100%)" }} />
                      <div style={{ position: "absolute", bottom: "0.75rem", left: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,.92)", backdropFilter: "blur(8px)", padding: "0.2rem 0.6rem 0.2rem 0.4rem", borderRadius: 100, fontSize: "0.63rem", fontWeight: 700, color: "#141410" }}>
                        <span style={{ fontSize: "0.9rem" }}>{sc.flag}</span>{sc.country}
                      </div>
                      {sc.urgent && (
                        <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.65rem", borderRadius: 100, fontSize: "0.58rem", fontWeight: 700, background: "#B8341E", color: "#fff" }}>
                          🔥 Urgent
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "1.1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                      <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C08435" }}>{sc.organization}</div>
                      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#141410", lineHeight: 1.32, flex: 1 }}>{sc.title}</div>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.58rem", fontWeight: 600, padding: "0.18rem 0.55rem", borderRadius: 100, background: "#EAF4EF", color: "#1A5C40" }}>{sc.level}</span>
                        {sc.amount && (
                          <span style={{ fontSize: "0.58rem", fontWeight: 600, padding: "0.18rem 0.55rem", borderRadius: 100, background: "#FBF4E8", color: "#C08435" }}>{sc.amount}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.8rem", borderTop: "1px solid rgba(20,20,16,.07)" }}>
                        <span style={{ fontSize: "0.63rem", color: "#928E80" }}>📅 {sc.deadline}</span>
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#C08435" }}>Postuler →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA  — bg: #141410
      ══════════════════════════════════════════ */}
      <section style={{ background: "#141410", padding: "4.5rem 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 15% 50%, rgba(192,132,53,.1), transparent 55%), radial-gradient(circle at 85% 50%, rgba(26,92,64,.08), transparent 55%)", pointerEvents: "none" }} />
        <div className="ap-container" style={{ position: "relative", zIndex: 1 }}>
          <RevealWrapper>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5rem" }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(1.9rem, 4.5vw, 3.8rem)", fontWeight: 900, color: "#F8F6F1", lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 680 }}>
                Votre prochain grand{" "}
                <em style={{ color: "#C08435", fontWeight: 200, fontStyle: "italic" }}>pas</em>{" "}
                commence ici
              </h2>
              <p style={{ fontSize: "0.95rem", color: "rgba(248,246,241,.5)", fontWeight: 300, maxWidth: 440, lineHeight: 1.82 }}>
                Rejoignez plus de 12 000 Africains qui utilisent AfriPulse pour saisir chaque opportunité.
              </p>
              <div className="ap-cta-btns">
                <Link href="/auth/inscription" style={{ display: "inline-flex", alignItems: "center", fontSize: "0.9rem", fontWeight: 600, padding: "0.88rem 2.2rem", borderRadius: 100, textDecoration: "none", background: "#C08435", color: "#fff", boxShadow: "0 10px 40px rgba(192,132,53,.4)" }}>
                  Créer un compte gratuit →
                </Link>
                <Link href="/actualites" style={{ display: "inline-flex", alignItems: "center", fontSize: "0.9rem", fontWeight: 500, padding: "0.88rem 1.8rem", borderRadius: 100, textDecoration: "none", background: "transparent", color: "rgba(248,246,241,.65)", border: "1.5px solid rgba(248,246,241,.15)" }}>
                  Explorer d&apos;abord
                </Link>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          OPPORTUNITÉS — bg: #F8F6F1
      ══════════════════════════════════════════ */}
      <section style={{ padding: "5rem 0", background: "#F8F6F1" }}>
        <div className="ap-container">
          <RevealWrapper>
            <div className="ap-section-header">
              <div>
                <div className="sh-kicker">Opportunités professionnelles</div>
                <h2 className="ap-section-title">Boostez votre <em style={{ fontStyle: "italic", color: "#C08435", fontWeight: 200 }}>carrière</em></h2>
              </div>
              <Link href="/opportunites" style={sectionLink}>Toutes les opportunités →</Link>
            </div>
          </RevealWrapper>

          {/* 4 cartes visuelles */}
          <div className="ap-grid-4" style={{ marginBottom: "1.25rem" }}>
            {topOpps.map((opp, i) => {
              const tc = oppTagColors[opp.type] || { bg: "#FBF4E8", color: "#C08435" };
              return (
                <RevealWrapper key={opp.id} delay={0.07 * i}>
                  <OppCard opp={opp} tc={tc} tagPill={tagPill} cardBase={cardBase} />
                </RevealWrapper>
              );
            })}
          </div>

          {/* 4 lignes compactes */}
          <div className="ap-grid-2">
            {botOpps.map((opp, i) => {
              const tc = oppTagColors[opp.type] || { bg: "#FBF4E8", color: "#C08435" };
              return (
                <RevealWrapper key={opp.id} delay={0.07 * i}>
                  <Link href={`/opportunites/${opp.slug}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ ...cardBase, display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem" }} className="card-lift">
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: opp.imageGradient, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.78rem", fontWeight: 900, color: "rgba(255,255,255,.85)" }}>
                        {opp.companyInitials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#C08435", marginBottom: "0.2rem" }}>{opp.company}</div>
                        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.9rem", fontWeight: 700, color: "#141410", lineHeight: 1.28, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{opp.title}</div>
                        <div style={{ fontSize: "0.63rem", color: "#928E80", marginTop: "0.2rem" }}>📍 {opp.location}</div>
                      </div>
                      <span style={{ ...tagPill, background: tc.bg, color: tc.color, flexShrink: 0 }}>{opp.type}</span>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#C08435", flexShrink: 0 }}>→</span>
                    </div>
                  </Link>
                </RevealWrapper>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ÉVÉNEMENTS — bg: #F0EDE4
      ══════════════════════════════════════════ */}
      <section style={{ padding: "5rem 0", background: "#F0EDE4" }}>
        <div className="ap-container">
          <RevealWrapper>
            <div className="ap-section-header">
              <div>
                <div className="sh-kicker">Événements</div>
                <h2 className="ap-section-title">À ne pas <em style={{ fontStyle: "italic", color: "#C08435", fontWeight: 200 }}>manquer</em></h2>
              </div>
              <Link href="/evenements" style={sectionLink}>Tous les événements →</Link>
            </div>
          </RevealWrapper>

          <div className="ap-events-layout">
            {/* 4 cartes événements */}
            <div className="ap-grid-2-main">
              {topEvents.map((ev, i) => (
                <RevealWrapper key={ev.id} delay={0.07 * i}>
                  <Link href={`/evenements/${ev.slug}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ ...cardBase, display: "flex" }} className="card-lift">
                      <div style={{ background: "linear-gradient(180deg, #FBF4E8, #F5ECD8)", borderRight: "1px solid rgba(192,132,53,.15)", padding: "1.25rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, minWidth: 72 }}>
                        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2rem", fontWeight: 900, color: "#C08435", lineHeight: 1 }}>{ev.day}</span>
                        <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#928E80", marginTop: "0.15rem" }}>{ev.month}</span>
                        <span style={{ fontSize: "0.55rem", color: "#928E80" }}>{ev.year}</span>
                      </div>
                      <div style={{ padding: "1.1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
                        <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C08435" }}>{ev.type}</div>
                        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.92rem", fontWeight: 700, lineHeight: 1.3, color: "#141410" }}>{ev.title}</div>
                        <div style={{ fontSize: "0.63rem", color: "#928E80", marginTop: "auto" }}>📍 {ev.location}</div>
                      </div>
                    </div>
                  </Link>
                </RevealWrapper>
              ))}
            </div>

            {/* Agenda latéral sombre */}
            <RevealWrapper delay={0.15}>
              <div style={{ background: "#141410", borderRadius: 20, padding: "1.75rem", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C08435", marginBottom: "0.75rem" }}>
                  📅 Agenda complet
                </div>
                {events.slice(4).map((ev, i) => (
                  <Link key={ev.id} href={`/evenements/${ev.slug}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.7rem 0", borderBottom: i < 3 ? "1px solid rgba(248,246,241,.06)" : "none" }}>
                      <div style={{ textAlign: "center", flexShrink: 0, width: 40 }}>
                        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.3rem", fontWeight: 900, color: "#C08435", lineHeight: 1, display: "block" }}>{ev.day}</span>
                        <span style={{ fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase", color: "rgba(248,246,241,.35)" }}>{ev.month}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#F8F6F1", lineHeight: 1.28, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{ev.title}</div>
                        <div style={{ fontSize: "0.63rem", color: "rgba(248,246,241,.4)", marginTop: "0.15rem" }}>{ev.location}</div>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "#C08435", flexShrink: 0 }}>→</span>
                    </div>
                  </Link>
                ))}
                <Link href="/evenements" style={{ display: "block", textAlign: "center", fontSize: "0.8rem", fontWeight: 600, color: "#C08435", textDecoration: "none", marginTop: "1.25rem", padding: "0.65rem", borderRadius: 12, border: "1px solid rgba(192,132,53,.25)", background: "rgba(192,132,53,.06)" }}>
                  Voir tous les événements →
                </Link>
              </div>
            </RevealWrapper>
          </div>
        </div>
      </section>

      <NewsletterBand />
      <Footer />
    </>
  );
}

/* ─── Composant carte opportunité visuelle ─── */
function OppCard({ opp, tc, tagPill, cardBase }: {
  opp: { slug: string; companyInitials: string; imageGradient: string; company: string; title: string; location: string; type: string };
  tc: { bg: string; color: string };
  tagPill: React.CSSProperties;
  cardBase: React.CSSProperties;
}) {
  return (
    <Link href={`/opportunites/${opp.slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <div style={{ ...cardBase, display: "flex", flexDirection: "column", height: "100%" }} className="card-lift">
        <div style={{ height: 110, background: opp.imageGradient, position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 10%, rgba(0,0,0,.5) 100%)" }} />
          <div style={{ position: "absolute", bottom: "0.7rem", left: "0.85rem", width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,.95)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.78rem", fontWeight: 900, color: "#C08435" }}>
            {opp.companyInitials}
          </div>
          <span style={{ position: "absolute", top: "0.7rem", right: "0.7rem", ...tagPill, background: tc.bg, color: tc.color }}>
            {opp.type}
          </span>
        </div>
        <div style={{ padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
          <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C08435" }}>{opp.company}</div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.92rem", fontWeight: 700, color: "#141410", lineHeight: 1.3, flex: 1 }}>{opp.title}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid rgba(20,20,16,.07)" }}>
            <span style={{ fontSize: "0.63rem", color: "#928E80" }}>📍 {opp.location}</span>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#C08435" }}>Postuler →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}