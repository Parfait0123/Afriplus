"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { articles, type Block } from "@/lib/data";

/* ─── Palettes par catégorie ─── */
const CAT: Record<string, { color: string; bg: string; dark: string }> = {
  "Politique":     { color: "#1E4DA8", bg: "#EBF0FB", dark: "#152F6B" },
  "Économie":      { color: "#C08435", bg: "#FBF4E8", dark: "#7A4F0E" },
  "Tech":          { color: "#1A5C40", bg: "#EAF4EF", dark: "#0F3828" },
  "Sport":         { color: "#B8341E", bg: "#FAEBE8", dark: "#8A2112" },
  "Culture":       { color: "#7A4A1E", bg: "#FDF3E8", dark: "#5C3212" },
  "Santé":         { color: "#1A5C5C", bg: "#E6F4F4", dark: "#0F3838" },
  "Environnement": { color: "#2D6B3B", bg: "#E6F4EA", dark: "#1A4224" },
};

/* ─── Icônes ─── */
const IcoArrow    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IcoClock    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IcoShare    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IcoBookmark = ({ on }: { on: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;

/* ══════════════════════════════════════════════════════
   PAGE EXPORT
══════════════════════════════════════════════════════ */
export default function ArticlePage({ params }: { params: { slug: string } }) {
  return <ArticleClient slug={params.slug} />;
}

/* ══════════════════════════════════════════════════════
   RENDU D'UN BLOC DE CONTENU
══════════════════════════════════════════════════════ */
function renderBlock(
  block: Block,
  key: number,
  cs: { color: string; bg: string; dark: string },
  allArticles: typeof articles
) {
  switch (block.type) {
    case "paragraph":
      return <p key={key} className="sl-p">{block.text}</p>;

    case "heading":
      return (
        <h2 key={key} className="sl-h2" style={{ color: cs.dark }}>
          {block.text}
        </h2>
      );

    case "image":
      return (
        <figure key={key} style={{ margin: "2.2rem 0" }}>
          <img
            src={block.url}
            alt={block.alt}
            style={{ width: "100%", borderRadius: 16, display: "block" }}
          />
          {(block.caption || block.credit) && (
            <figcaption style={{ fontSize: "0.68rem", color: "#928E80",
              marginTop: "0.55rem", lineHeight: 1.5 }}>
              {block.caption}
              {block.credit && (
                <span style={{ marginLeft: "0.5rem", opacity: 0.7 }}>{block.credit}</span>
              )}
            </figcaption>
          )}
        </figure>
      );

    case "pullquote":
      return (
        <blockquote key={key} className="sl-quote" style={{ borderLeftColor: cs.color }}>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "2.8rem", lineHeight: 1, fontWeight: 900,
            color: cs.color, marginBottom: "0.6rem" }}>"</div>
          <p style={{ fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "clamp(1.05rem, 1.8vw, 1.3rem)", fontWeight: 600,
            fontStyle: "italic", color: "#141410", lineHeight: 1.55, margin: 0 }}>
            {block.text}
          </p>
          {(block.author || block.role) && (
            <footer style={{ marginTop: "1.1rem" }}>
              {block.author && (
                <div style={{ fontSize: "0.72rem", fontWeight: 800,
                  color: cs.color, letterSpacing: "0.05em" }}>
                  — {block.author}
                </div>
              )}
              {block.role && (
                <div style={{ fontSize: "0.63rem", color: "#928E80", marginTop: "0.15rem" }}>
                  {block.role}
                </div>
              )}
            </footer>
          )}
        </blockquote>
      );

    case "factbox":
      return (
        <div key={key} className="sl-keyfacts" style={{ borderTopColor: cs.color, background: cs.bg }}>
          <div style={{ fontSize: "0.58rem", fontWeight: 800,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: cs.color, marginBottom: "1.1rem" }}>
            {block.title}
          </div>
          <div className="sl-facts-grid">
            {block.facts.map((f, fi) => (
              <div key={fi} style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%",
                  background: cs.color, flexShrink: 0, marginTop: "0.28rem" }}/>
                <span style={{ fontSize: "0.85rem", color: "#38382E",
                  fontWeight: 500, lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "video":
      return (
        <div key={key} style={{ margin: "2.2rem 0", borderRadius: 16, overflow: "hidden",
          aspectRatio: "16/9", background: "#000" }}>
          <iframe
            src={block.url}
            style={{ width: "100%", height: "100%", border: "none" }}
            allowFullScreen
            title={block.caption ?? "Vidéo"}
          />
          {block.caption && (
            <p style={{ fontSize: "0.68rem", color: "#928E80", marginTop: "0.55rem" }}>
              {block.caption}
            </p>
          )}
        </div>
      );

    case "alert":
      const alertColors: Record<string, string> = {
        info: "#1A5C5C", warning: "#C08435", tip: "#1A5C40",
      };
      const variant = block.variant ?? "info";
      return (
        <div key={key} style={{ margin: "1.8rem 0", padding: "1.2rem 1.6rem",
          borderLeft: `4px solid ${alertColors[variant]}`,
          background: `${alertColors[variant]}10`, borderRadius: "0 12px 12px 0",
          fontSize: "0.88rem", color: "#38382E", lineHeight: 1.7 }}>
          {block.message}
        </div>
      );

    case "external":
      return (
        <a key={key} href={block.url} target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "0.9rem",
            margin: "1.8rem 0", padding: "1rem 1.4rem", borderRadius: 14,
            border: "1px solid rgba(20,20,16,.1)", background: "#fff",
            textDecoration: "none", color: "#141410", boxShadow: "0 2px 8px rgba(20,20,16,.05)" }}>
          {block.favicon && <img src={block.favicon} alt="" style={{ width: 20, height: 20 }} />}
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{block.label}</div>
            {block.description && (
              <div style={{ fontSize: "0.7rem", color: "#928E80", marginTop: "0.15rem" }}>
                {block.description}
              </div>
            )}
          </div>
          <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#928E80" }}>↗</span>
        </a>
      );

    case "related": {
      const target = allArticles.find((a) => a.slug === block.slug);
      const label = block.label ?? (target ? `À lire aussi : ${target.title}` : null);
      if (!label) return null;
      return (
        <Link key={key} href={`/actualites/${block.slug}`}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem",
            margin: "1.8rem 0", padding: "0.9rem 1.4rem",
            borderLeft: `3px solid ${cs.color}`, background: cs.bg,
            borderRadius: "0 12px 12px 0", textDecoration: "none",
            transition: "opacity .18s" }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
          <span style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.12em",
            textTransform: "uppercase", color: cs.color, flexShrink: 0 }}>
            À lire aussi
          </span>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#141410",
            lineHeight: 1.35 }}>
            {target?.title ?? label}
          </span>
          <span style={{ marginLeft: "auto", color: cs.color, flexShrink: 0 }}>→</span>
        </Link>
      );
    }

    case "download":
      return (
        <a key={key} href={block.url} download
          style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem",
            margin: "1.2rem 0", padding: "0.65rem 1.4rem", borderRadius: 100,
            background: cs.bg, color: cs.color, fontWeight: 700,
            fontSize: "0.8rem", textDecoration: "none" }}>
          ↓ {block.label}
          {block.size && <span style={{ opacity: 0.6, fontWeight: 400 }}>({block.size})</span>}
        </a>
      );

    case "divider":
      return (
        <hr key={key} style={{ margin: "2.5rem 0", border: "none",
          borderTop: "1px solid rgba(20,20,16,.1)" }} />
      );

    default:
      return null;
  }
}

/* ══════════════════════════════════════════════════════
   COMPOSANT CLIENT
══════════════════════════════════════════════════════ */
function ArticleClient({ slug }: { slug: string }) {
  const router  = useRouter();
  const article = articles.find((a) => a.slug === slug);

  // Redirect client-side si article introuvable (notFound() est server-only)
  useEffect(() => {
    if (!article) router.replace("/404");
  }, [article, router]);

  const [progress,    setProgress]    = useState(0);
  const [bookmarked,  setBookmarked]  = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  /* Progression de lecture */
  useEffect(() => {
    requestAnimationFrame(() => setHeroVisible(true));
    const onScroll = () => {
      const el = bodyRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const h   = el.offsetHeight - window.innerHeight + 160;
      setProgress(Math.min(100, Math.max(0, (-top / h) * 100)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!article) return null;

  const cs      = CAT[article.category] ?? CAT["Économie"];
  const idx     = articles.findIndex((a) => a.id === article.id);

  /* Articles liés — même catégorie d'abord */
  const related = [
    ...articles.filter((a) => a.category === article.category && a.id !== article.id),
    ...articles.filter((a) => a.category !== article.category  && a.id !== article.id),
  ].slice(0, 3);

  return (
    <>
      {/* ── Barre progression fixe ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9999,
        background: "rgba(20,20,16,.1)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: cs.color,
          transition: "width .12s linear", boxShadow: `0 0 10px ${cs.color}99` }}/>
      </div>

      <Navbar />

      <main>
        {/* ══════ HERO CINÉMATIQUE ══════ */}
        <section style={{ position: "relative", overflow: "hidden",
          height: "clamp(540px, 78vh, 740px)", paddingTop: 64 }}>
          <div style={{ position: "absolute", inset: 0, background: article.imageGradient,
            transform: heroVisible ? "scale(1)" : "scale(1.05)",
            transition: "transform 1.4s cubic-bezier(.25,.46,.45,.94)" }}/>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.2) 0%, transparent 28%, rgba(0,0,0,.55) 65%, rgba(0,0,0,.94) 100%)" }}/>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,0,0,.5) 0%, transparent 52%)" }}/>

          {/* Numéro fantôme */}
          <div style={{ position: "absolute", bottom: "-2.5rem", right: "1.5rem",
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "clamp(10rem, 24vw, 22rem)", fontWeight: 900,
            color: "rgba(255,255,255,.04)", lineHeight: 1, letterSpacing: "-0.06em",
            pointerEvents: "none", userSelect: "none" }}>
            {String(idx + 1).padStart(2, "0")}
          </div>

          {/* Contenu hero */}
          <div style={{ position: "absolute", inset: 0, display: "flex",
            flexDirection: "column", justifyContent: "flex-end",
            padding: "clamp(1.5rem, 5.5vw, 5rem)",
            maxWidth: 1100, margin: "0 auto",
            left: "50%", transform: "translateX(-50%)", width: "100%" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem",
              marginBottom: "1.75rem",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(10px)",
              transition: "opacity .7s .1s, transform .7s .1s" }}>
              <Link href="/actualites" style={{ display: "flex", alignItems: "center",
                gap: "0.45rem", fontSize: "0.62rem", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(255,255,255,.48)", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.48)")}>
                <IcoArrow /> Actualités
              </Link>
              <span style={{ color: "rgba(255,255,255,.2)" }}>›</span>
              <span style={{ fontSize: "0.62rem", fontWeight: 800,
                letterSpacing: "0.1em", textTransform: "uppercase", color: cs.color }}>
                {article.category}
              </span>
            </div>

            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(1.9rem, 5vw, 4rem)", fontWeight: 900,
              letterSpacing: "-0.04em", lineHeight: 1.04, color: "#F8F6F1",
              maxWidth: "20ch", marginBottom: "1.75rem",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(22px)",
              transition: "opacity .9s .22s, transform .9s .22s" }}>
              {article.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center",
              gap: "clamp(0.75rem, 2vw, 1.5rem)", flexWrap: "wrap",
              opacity: heroVisible ? 1 : 0, transition: "opacity .8s .42s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${cs.color}, ${cs.dark})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", fontWeight: 900, color: "#fff",
                  border: "2px solid rgba(255,255,255,.18)", flexShrink: 0 }}>
                  {article.author.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#F8F6F1" }}>{article.author}</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,.38)" }}>{article.date}</div>
                </div>
              </div>
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.14)", flexShrink: 0 }}/>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem",
                fontSize: "0.65rem", color: "rgba(255,255,255,.45)", fontWeight: 500 }}>
                <IcoClock /> {article.readTime} min de lecture
              </div>
              <span style={{ fontSize: "0.58rem", fontWeight: 800,
                letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "0.25rem 0.85rem", borderRadius: 100,
                background: cs.color, color: "#fff" }}>
                {article.category}
              </span>
            </div>
          </div>
        </section>

        {/* ══════ CORPS + SIDEBAR ══════ */}
        <div style={{ background: "#F8F6F1" }} ref={bodyRef}>
          <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(1rem, 5vw, 4rem)" }}>
            <div className="sl-layout">

              {/* ── ARTICLE ── */}
              <article className="sl-main">
                {/* Chapô */}
                <div style={{ paddingTop: "3.5rem", paddingBottom: "2.5rem",
                  borderBottom: "1px solid rgba(20,20,16,.08)" }}>
                  <div style={{ width: "2.8rem", height: 3, background: cs.color,
                    borderRadius: 100, marginBottom: "1.6rem" }}/>
                  <p className="sl-lead" style={{ borderLeftColor: cs.color }}>
                    {article.content.intro}
                  </p>
                </div>

                {/* Boutons action */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem",
                  padding: "1.5rem 0", borderBottom: "1px solid rgba(20,20,16,.07)", flexWrap: "wrap" }}>
                  <button onClick={() => setBookmarked(!bookmarked)} className="sl-btn"
                    style={ bookmarked ? { background: cs.bg, color: cs.color, borderColor: cs.color } : {} }>
                    <IcoBookmark on={bookmarked}/>
                    {bookmarked ? "Sauvegardé" : "Sauvegarder"}
                  </button>
                  <button className="sl-btn"><IcoShare /> Partager</button>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.55rem" }}>
                    <div style={{ width: 72, height: 4, background: "rgba(20,20,16,.1)",
                      borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: cs.color, borderRadius: 100,
                        width: `${progress}%`, transition: "width .18s" }}/>
                    </div>
                    <span style={{ fontSize: "0.6rem", color: "#928E80", fontWeight: 600 }}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                {/* Blocs de contenu */}
                <div className="sl-body">
                  {article.content.blocks.map((block, bi) =>
                    renderBlock(block, bi, cs, articles)
                  )}
                </div>

                {/* Footer article */}
                <div style={{ paddingTop: "2.5rem", borderTop: "2px solid rgba(20,20,16,.08)", paddingBottom: "3rem" }}>
                  <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                    {[article.category, "Afrique", "2026"].map((t) => (
                      <span key={t} style={{ fontSize: "0.58rem", fontWeight: 800,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "0.25rem 0.78rem", borderRadius: 100,
                        background: cs.bg, color: cs.color }}>{t}</span>
                    ))}
                  </div>
                  <div className="sl-author" style={{ borderLeftColor: cs.color }}>
                    <div style={{ width: 58, height: 58, borderRadius: "50%", flexShrink: 0,
                      background: `linear-gradient(135deg, ${cs.color}, ${cs.dark})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.05rem", fontWeight: 900, color: "#fff" }}>
                      {article.author.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.58rem", fontWeight: 800,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        color: cs.color, marginBottom: "0.25rem" }}>Journaliste</div>
                      <div style={{ fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: "1.1rem", fontWeight: 700, color: "#141410" }}>
                        {article.author}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "#928E80", marginTop: "0.18rem" }}>
                        Correspondant AfriPulse · Publié le {article.date}
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* ── SIDEBAR STICKY ── */}
              <aside className="sl-sidebar">
                <div className="sl-card">
                  <div className="sl-card-label">Progression</div>
                  <div style={{ height: 6, background: "rgba(20,20,16,.09)", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 100, background: cs.color,
                      width: `${progress}%`, transition: "width .18s", boxShadow: `0 0 8px ${cs.color}55` }}/>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    fontSize: "0.6rem", color: "#928E80", marginTop: "0.55rem" }}>
                    <span style={{ fontWeight: 700, color: cs.color }}>{Math.round(progress)}% lu</span>
                    <span>{article.readTime} min</span>
                  </div>
                </div>

                <div className="sl-card" style={{ padding: 0 }}>
                  <div style={{ padding: "1.2rem 1.2rem 0.8rem", borderBottom: "1px solid rgba(20,20,16,.07)" }}>
                    <div className="sl-card-label" style={{ marginBottom: 0 }}>Sommaire</div>
                  </div>
                  {article.content.blocks
                    .filter((b): b is Extract<Block, { type: "heading" }> => b.type === "heading")
                    .map((b, si, arr) => (
                    <div key={si} style={{ display: "flex", gap: "0.8rem",
                      alignItems: "flex-start", padding: "0.8rem 1.2rem",
                      borderBottom: si < arr.length - 1 ? "1px solid rgba(20,20,16,.06)" : "none" }}>
                      <div style={{ width: 21, height: 21, borderRadius: "50%",
                        background: cs.bg, color: cs.color, fontSize: "0.58rem",
                        fontWeight: 900, display: "flex", alignItems: "center",
                        justifyContent: "center", flexShrink: 0 }}>{si + 1}</div>
                      <span style={{ fontSize: "0.74rem", color: "#38382E",
                        fontWeight: 600, lineHeight: 1.4 }}>{b.text}</span>
                    </div>
                  ))}
                </div>

                <div className="sl-card" style={{ padding: 0 }}>
                  <div style={{ padding: "1.2rem 1.2rem 0.8rem", borderBottom: "1px solid rgba(20,20,16,.07)" }}>
                    <div className="sl-card-label" style={{ marginBottom: 0 }}>À lire aussi</div>
                  </div>
                  {related.map((art, ri) => {
                    const acs = CAT[art.category] ?? CAT["Économie"];
                    return (
                      <Link key={art.id} href={`/actualites/${art.slug}`}
                        style={{ textDecoration: "none", display: "block" }}>
                        <div style={{ display: "flex", gap: "0.8rem",
                          alignItems: "flex-start", padding: "0.88rem 1.2rem",
                          borderBottom: ri < related.length - 1 ? "1px solid rgba(20,20,16,.06)" : "none",
                          transition: "background .18s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(20,20,16,.03)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}>
                          <div style={{ width: 50, height: 50, borderRadius: 10, flexShrink: 0,
                            background: art.imageGradient, position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", inset: 0,
                              background: "linear-gradient(135deg,transparent,rgba(0,0,0,.22))" }}/>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.54rem", fontWeight: 800,
                              letterSpacing: "0.1em", textTransform: "uppercase",
                              color: acs.color, marginBottom: "0.28rem" }}>{art.category}</div>
                            <div style={{ fontFamily: "'Fraunces', Georgia, serif",
                              fontSize: "0.8rem", fontWeight: 700, color: "#141410", lineHeight: 1.28,
                              display: "-webkit-box", WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical", overflow: "hidden",
                            } as React.CSSProperties}>{art.title}</div>
                            <div style={{ fontSize: "0.57rem", color: "#928E80", marginTop: "0.28rem" }}>
                              {art.author} · {art.readTime} min
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="sl-card" style={{ background: "#141410", border: "none", padding: "1.5rem" }}>
                  <div style={{ fontSize: "0.58rem", fontWeight: 800,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "#C08435", marginBottom: "0.6rem" }}>Newsletter</div>
                  <p style={{ fontSize: "0.75rem", color: "rgba(248,246,241,.5)",
                    lineHeight: 1.65, fontWeight: 300, marginBottom: "1.1rem" }}>
                    Les 5 infos africaines essentielles chaque matin.
                  </p>
                  <Link href="/newsletter" style={{ display: "block", textAlign: "center",
                    background: "#C08435", color: "#fff", borderRadius: 100,
                    padding: "0.65rem", fontSize: "0.75rem", fontWeight: 700,
                    textDecoration: "none" }}>
                    S&apos;abonner gratuitement
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* ══════ ARTICLES LIÉS ══════ */}
        <section style={{ background: "#F0EDE4", padding: "5rem 0" }}>
          <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(1rem, 5vw, 4rem)" }}>
            <div style={{ display: "flex", alignItems: "flex-end",
              justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
              marginBottom: "2.25rem", paddingBottom: "1.25rem",
              borderBottom: "2px solid #141410" }}>
              <div>
                <div style={{ fontSize: "0.58rem", fontWeight: 800,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "#C08435", marginBottom: "0.45rem" }}>Continuer à lire</div>
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 900,
                  letterSpacing: "-0.035em", color: "#141410", margin: 0 }}>
                  Articles{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435" }}>similaires</em>
                </h2>
              </div>
              <Link href="/actualites" style={{ fontSize: "0.78rem", fontWeight: 700,
                color: "#C08435", textDecoration: "none", padding: "0.5rem 1.25rem",
                borderRadius: 100, border: "1.5px solid rgba(192,132,53,.3)",
                background: "rgba(192,132,53,.06)" }}>
                Toutes les actualités →
              </Link>
            </div>

            <div className="sl-related-grid">
              {related.map((art, ri) => {
                const acs = CAT[art.category] ?? CAT["Économie"];
                return (
                  <RevealWrapper key={art.id} delay={ri * 0.1}>
                    <Link href={`/actualites/${art.slug}`}
                      style={{ textDecoration: "none", display: "block", height: "100%" }}>
                      <div className="sl-related-card">
                        <div style={{ height: 215, position: "relative", overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ position: "absolute", inset: 0, background: art.imageGradient }}/>
                          <div style={{ position: "absolute", inset: 0,
                            background: "linear-gradient(180deg,transparent 35%,rgba(0,0,0,.6) 100%)" }}/>
                          <span style={{ position: "absolute", top: "0.9rem", left: "0.9rem",
                            fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.1em",
                            textTransform: "uppercase", padding: "0.22rem 0.7rem", borderRadius: 100,
                            background: "rgba(255,255,255,.14)", color: "#fff", backdropFilter: "blur(8px)" }}>
                            {art.category}
                          </span>
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
                            height: 3, background: acs.color }}/>
                        </div>
                        <div style={{ padding: "1.35rem 1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                          <h3 style={{ fontFamily: "'Fraunces', Georgia, serif",
                            fontSize: "1rem", fontWeight: 700, color: "#141410",
                            lineHeight: 1.28, flex: 1,
                            display: "-webkit-box", WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                            marginBottom: "0.5rem",
                          } as React.CSSProperties}>{art.title}</h3>
                          <p style={{ fontSize: "0.78rem", color: "#928E80",
                            lineHeight: 1.7, fontWeight: 300,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                            marginBottom: "0.85rem",
                          } as React.CSSProperties}>{art.excerpt}</p>
                          <div style={{ display: "flex", alignItems: "center",
                            justifyContent: "space-between", paddingTop: "0.85rem",
                            borderTop: "1px solid rgba(20,20,16,.07)", marginTop: "auto" }}>
                            <span style={{ fontSize: "0.6rem", color: "#928E80" }}>
                              <b style={{ color: "#38382E" }}>{art.author}</b> · {art.date}
                            </span>
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: acs.color }}>
                              {art.readTime} min →
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
      </main>

      <NewsletterBand />
      <Footer />

      {/* ── CSS ── */}
      <style>{`
        .sl-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 3rem;
          align-items: start;
        }
        .sl-sidebar {
          position: sticky;
          top: 5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 3.5rem;
          padding-bottom: 3rem;
        }
        .sl-lead {
          font-size: clamp(1.05rem, 1.6vw, 1.22rem);
          font-weight: 400;
          color: #38382E;
          line-height: 1.85;
          border-left: 3px solid;
          padding-left: 1.4rem;
          font-style: italic;
        }
        .sl-body { padding-top: 2.5rem; }
        .sl-h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.25rem, 2.2vw, 1.65rem);
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.18;
          margin: 2.8rem 0 1.1rem;
        }
        .sl-p {
          font-size: clamp(0.95rem, 1.3vw, 1.05rem);
          color: #38382E;
          line-height: 1.88;
          margin: 0 0 1.35rem;
          font-weight: 300;
        }
        .sl-quote {
          margin: 2.2rem 0;
          padding: 1.8rem 2rem;
          border-left: 4px solid;
          background: rgba(20,20,16,.03);
          border-radius: 0 16px 16px 0;
        }
        .sl-keyfacts {
          margin: 2.2rem 0;
          padding: 1.6rem 1.8rem;
          border-top: 3px solid;
          border-radius: 0 0 16px 16px;
        }
        .sl-facts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem 1.5rem;
        }
        .sl-author {
          display: flex;
          gap: 1.2rem;
          align-items: flex-start;
          padding: 1.4rem 1.6rem;
          background: #fff;
          border-radius: 20px;
          border-left: 4px solid;
          box-shadow: 0 2px 12px rgba(20,20,16,.06);
        }
        .sl-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid rgba(20,20,16,.08);
          padding: 1.2rem;
          box-shadow: 0 2px 8px rgba(20,20,16,.05);
        }
        .sl-card-label {
          font-size: 0.58rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #928E80;
          margin-bottom: 0.85rem;
        }
        .sl-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.52rem 1.1rem;
          border-radius: 100px;
          border: 1.5px solid rgba(20,20,16,.12);
          background: transparent;
          color: #38382E;
          cursor: pointer;
          transition: all .2s;
          font-family: inherit;
        }
        .sl-btn:hover { background: rgba(20,20,16,.04); }
        .sl-related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.3rem;
        }
        .sl-related-card {
          background: #fff;
          border-radius: 24px;
          border: 1px solid rgba(20,20,16,.07);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: transform .28s ease, box-shadow .28s ease;
          box-shadow: 0 2px 8px rgba(20,20,16,.06);
        }
        .sl-related-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(20,20,16,.12);
        }
        /* Responsive */
        @media (max-width: 1024px) {
          .sl-layout { grid-template-columns: 1fr; }
          .sl-sidebar { position: static; padding-top: 0; padding-bottom: 1rem; }
          .sl-related-grid { grid-template-columns: repeat(2, 1fr); }
          .sl-facts-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .sl-related-grid { grid-template-columns: 1fr; }
          .sl-quote { padding: 1.2rem; }
          .sl-keyfacts { padding: 1.2rem; }
          .sl-h2 { margin-top: 2rem; }
        }
      `}</style>
    </>
  );
}