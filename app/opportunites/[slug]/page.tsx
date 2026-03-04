"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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

/* ─── Icônes SVG ─── */
const IcoArrow    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IcoClock    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IcoShare    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IcoBookmark = ({ on }: { on: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
const IcoLink     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IcoPlay     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IcoDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

/* ══════════════════════════════════════════════════════════
   RENDERERS DE BLOCS
══════════════════════════════════════════════════════════ */

function BlockParagraph({ text }: { text: string }) {
  return <p className="sl-p">{text}</p>;
}

function BlockHeading({ text, level = 2 }: { text: string; level?: 2 | 3 }) {
  const Tag = `h${level}` as "h2" | "h3";
  return <Tag className={level === 2 ? "sl-h2" : "sl-h3"}>{text}</Tag>;
}

function BlockImage({ url, alt, caption, credit }: {
  url: string; alt: string; caption?: string; credit?: string
}) {
  return (
    <figure className="sl-figure">
      <div className="sl-figure-img">
        <Image
          src={url}
          alt={alt}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>
      {(caption || credit) && (
        <figcaption className="sl-figcaption">
          {caption && <span>{caption}</span>}
          {credit && <span className="sl-credit">{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}

function BlockVideo({ url, caption, platform = "youtube" }: {
  url: string; caption?: string; platform?: string
}) {
  const [playing, setPlaying] = useState(false);

  // Extract YouTube video ID
  const ytId = url.includes("youtube.com") || url.includes("youtu.be")
    ? (url.split("v=")[1] ?? url.split("/").pop())?.split("&")[0]
    : null;

  const embedUrl = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1`
    : url;

  const thumbUrl = ytId
    ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
    : null;

  return (
    <figure className="sl-figure">
      <div className="sl-video-wrap">
        {playing ? (
          <iframe
            src={embedUrl}
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <div
            onClick={() => setPlaying(true)}
            style={{
              position: "absolute", inset: 0, cursor: "pointer",
              background: thumbUrl
                ? `url(${thumbUrl}) center/cover`
                : "linear-gradient(135deg,#141410,#38382E)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(0,0,0,.65)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", border: "2px solid rgba(255,255,255,.3)",
              transition: "transform .2s, background .2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,.85)"; (e.currentTarget as HTMLDivElement).style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,.65)"; (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}>
              <IcoPlay />
            </div>
            <div style={{
              position: "absolute", top: "0.85rem", left: "0.85rem",
              fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#fff",
              padding: "0.22rem 0.65rem", borderRadius: 100,
              background: "rgba(255,0,0,.8)", backdropFilter: "blur(4px)",
            }}>
              {platform === "youtube" ? "YouTube" : platform === "vimeo" ? "Vimeo" : "Vidéo"}
            </div>
          </div>
        )}
      </div>
      {caption && <figcaption className="sl-figcaption"><span>{caption}</span></figcaption>}
    </figure>
  );
}

function BlockPullquote({ text, author, role, color }: {
  text: string; author?: string; role?: string; color: string
}) {
  return (
    <blockquote className="sl-pullquote" style={{ borderLeftColor: color }}>
      <div className="sl-pullquote-mark" style={{ color }}>"</div>
      <p className="sl-pullquote-text">{text}</p>
      {(author || role) && (
        <footer className="sl-pullquote-footer">
          {author && <div className="sl-pullquote-author" style={{ color }}>— {author}</div>}
          {role  && <div className="sl-pullquote-role">{role}</div>}
        </footer>
      )}
    </blockquote>
  );
}

function BlockFactbox({ title, facts, color, bg }: {
  title: string; facts: string[]; color: string; bg: string
}) {
  return (
    <div className="sl-factbox" style={{ background: bg, borderTopColor: color }}>
      <div className="sl-factbox-title" style={{ color }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        {title}
      </div>
      <ul className="sl-factbox-list">
        {facts.map((f, i) => (
          <li key={i} className="sl-factbox-item">
            <div className="sl-factbox-dot" style={{ background: color }}/>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BlockRelated({ slug, label, color, bg }: {
  slug: string; label?: string; color: string; bg: string
}) {
  const target = articles.find(a => a.slug === slug);
  if (!target) return null;
  const tcs = CAT[target.category] ?? CAT["Économie"];

  return (
    <Link href={`/actualites/${slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="sl-related-inline" style={{ borderLeftColor: color, background: bg }}>
        <div className="sl-related-inline-kicker" style={{ color }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          {label ?? "À lire aussi"}
        </div>
        <div className="sl-related-inline-inner">
          <div className="sl-related-inline-thumb" style={{ background: target.imageGradient }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,transparent,rgba(0,0,0,.25))" }}/>
          </div>
          <div className="sl-related-inline-body">
            <span className="sl-related-inline-cat" style={{ color: tcs.color }}>{target.category}</span>
            <div className="sl-related-inline-title">{target.title}</div>
            <span className="sl-related-inline-meta">{target.author} · {target.readTime} min</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function BlockExternal({ url, label, description, favicon }: {
  url: string; label: string; description?: string; favicon?: string
}) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="sl-external">
      <div className="sl-external-icon">{favicon ?? <IcoLink />}</div>
      <div className="sl-external-body">
        <div className="sl-external-label">{label}</div>
        {description && <div className="sl-external-desc">{description}</div>}
      </div>
      <div className="sl-external-arrow">→</div>
    </a>
  );
}

function BlockAlert({ message, variant = "info" }: { message: string; variant?: string }) {
  const styles: Record<string, { bg: string; border: string; color: string }> = {
    info:    { bg: "#EBF0FB", border: "#1E4DA8", color: "#152F6B" },
    warning: { bg: "#FBF4E8", border: "#C08435", color: "#7A4F0E" },
    tip:     { bg: "#EAF4EF", border: "#1A5C40", color: "#0F3828" },
  };
  const s = styles[variant] ?? styles.info;

  return (
    <div className="sl-alert" style={{ background: s.bg, borderLeftColor: s.border, color: s.color }}>
      <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.7, fontWeight: 400 }}>{message}</p>
    </div>
  );
}

function BlockDownload({ url, label, size }: { url: string; label: string; size?: string }) {
  return (
    <a href={url} download className="sl-download">
      <IcoDownload />
      <span className="sl-download-label">{label}</span>
      {size && <span className="sl-download-size">{size}</span>}
    </a>
  );
}

function BlockDivider() {
  return (
    <div className="sl-divider">
      <span/><span/><span/>
    </div>
  );
}

/* ── Dispatcher principal des blocs ── */
function RenderBlock({ block, color, bg }: { block: Block; color: string; bg: string }) {
  switch (block.type) {
    case "paragraph":  return <BlockParagraph text={block.text} />;
    case "heading":    return <BlockHeading text={block.text} level={block.level} />;
    case "image":      return <BlockImage url={block.url} alt={block.alt} caption={block.caption} credit={block.credit} />;
    case "video":      return <BlockVideo url={block.url} caption={block.caption} platform={block.platform} />;
    case "pullquote":  return <BlockPullquote text={block.text} author={block.author} role={block.role} color={color} />;
    case "factbox":    return <BlockFactbox title={block.title} facts={block.facts} color={color} bg={bg} />;
    case "related":    return <BlockRelated slug={block.slug} label={block.label} color={color} bg={bg} />;
    case "external":   return <BlockExternal url={block.url} label={block.label} description={block.description} favicon={block.favicon} />;
    case "alert":      return <BlockAlert message={block.message} variant={block.variant} />;
    case "download":   return <BlockDownload url={block.url} label={block.label} size={block.size} />;
    case "divider":    return <BlockDivider />;
    default:           return null;
  }
}

/* ══════════════════════════════════════════════════════════
   PAGE EXPORT
══════════════════════════════════════════════════════════ */
export default function ArticlePage({ params }: { params: { slug: string } }) {
  return <ArticleClient slug={params.slug} />;
}

/* ══════════════════════════════════════════════════════════
   COMPOSANT CLIENT PRINCIPAL
══════════════════════════════════════════════════════════ */
function ArticleClient({ slug }: { slug: string }) {
  const router  = useRouter();
  const article = articles.find(a => a.slug === slug);

  useEffect(() => {
    if (!article) router.replace("/404");
  }, [article, router]);

  const [progress,    setProgress]    = useState(0);
  const [bookmarked,  setBookmarked]  = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

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
  const idx     = articles.findIndex(a => a.id === article.id);

  const related = [
    ...articles.filter(a => a.category === article.category && a.id !== article.id),
    ...articles.filter(a => a.category !== article.category  && a.id !== article.id),
  ].slice(0, 3);

  /* Extraire les headings pour le sommaire */
  const headings = article.content.blocks
    .filter(b => b.type === "heading" && (b as { level?: number }).level === 2)
    .map(b => (b as { text: string }).text);

  return (
    <>
      {/* ── Barre de progression ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9999,
        background: "rgba(20,20,16,.08)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: cs.color,
          transition: "width .1s linear", boxShadow: `0 0 12px ${cs.color}88` }}/>
      </div>

      <Navbar />

      <main>
        {/* ══════ HERO ══════ */}
        <section style={{ position: "relative", overflow: "hidden",
          height: "clamp(540px, 80vh, 780px)", paddingTop: 64 }}>

          <div style={{ position: "absolute", inset: 0, background: article.imageGradient,
            transform: heroVisible ? "scale(1)" : "scale(1.06)",
            transition: "transform 1.6s cubic-bezier(.25,.46,.45,.94)" }}/>
          <div style={{ position: "absolute", inset: 0, background:
            "linear-gradient(180deg,rgba(0,0,0,.15) 0%,transparent 25%,rgba(0,0,0,.5) 60%,rgba(0,0,0,.96) 100%)" }}/>
          <div style={{ position: "absolute", inset: 0, background:
            "linear-gradient(110deg,rgba(0,0,0,.6) 0%,transparent 55%)" }}/>

          {/* Numéro fantôme */}
          <div style={{ position: "absolute", bottom: "-3rem", right: "2rem",
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "clamp(12rem, 26vw, 26rem)", fontWeight: 900,
            color: "rgba(255,255,255,.035)", lineHeight: 1, letterSpacing: "-0.06em",
            pointerEvents: "none", userSelect: "none" }}>
            {String(idx + 1).padStart(2, "0")}
          </div>

          {/* Bande catégorie couleur en bas du hero */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
            height: 4, background: cs.color,
            opacity: heroVisible ? 1 : 0, transition: "opacity 1s 1s" }}/>

          <div style={{ position: "absolute", inset: 0, display: "flex",
            flexDirection: "column", justifyContent: "flex-end",
            padding: "clamp(1.5rem, 5.5vw, 5.5rem)",
            maxWidth: 1140, margin: "0 auto",
            left: "50%", transform: "translateX(-50%)", width: "100%" }}>

            {/* Fil d'Ariane */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem",
              marginBottom: "1.6rem",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(12px)",
              transition: "opacity .7s .1s, transform .7s .1s" }}>
              <Link href="/actualites"
                style={{ display: "flex", alignItems: "center", gap: "0.45rem",
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "rgba(255,255,255,.45)",
                  textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.45)")}>
                <IcoArrow /> Actualités
              </Link>
              <span style={{ color: "rgba(255,255,255,.18)", fontSize: "0.7rem" }}>›</span>
              <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em",
                textTransform: "uppercase", color: cs.color }}>{article.category}</span>
            </div>

            {/* Titre */}
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(2rem, 5.5vw, 4.4rem)", fontWeight: 900,
              letterSpacing: "-0.045em", lineHeight: 1.03, color: "#F8F6F1",
              maxWidth: "18ch", marginBottom: "2rem",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(28px)",
              transition: "opacity .9s .22s, transform .9s .22s" }}>
              {article.title}
            </h1>

            {/* Méta */}
            <div style={{ display: "flex", alignItems: "center",
              gap: "clamp(.75rem,2vw,1.5rem)", flexWrap: "wrap",
              opacity: heroVisible ? 1 : 0, transition: "opacity .8s .44s" }}>

              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${cs.color}, ${cs.dark})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.68rem", fontWeight: 900, color: "#fff",
                  border: "2px solid rgba(255,255,255,.2)", flexShrink: 0 }}>
                  {article.author.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#F8F6F1" }}>{article.author}</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,.38)" }}>{article.date}</div>
                </div>
              </div>

              <div style={{ width: 1, height: 30, background: "rgba(255,255,255,.15)", flexShrink: 0 }}/>

              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem",
                fontSize: "0.65rem", color: "rgba(255,255,255,.45)", fontWeight: 500 }}>
                <IcoClock /> {article.readTime} min de lecture
              </div>

              <span style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.12em",
                textTransform: "uppercase", padding: "0.28rem 0.9rem", borderRadius: 100,
                background: cs.color, color: "#fff" }}>
                {article.category}
              </span>
            </div>
          </div>
        </section>

        {/* ══════ CORPS + SIDEBAR ══════ */}
        <div style={{ background: "#F8F6F1" }} ref={bodyRef}>
          <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 clamp(1rem,5vw,4rem)" }}>
            <div className="sl-layout">

              {/* ── ARTICLE ── */}
              <article className="sl-main">

                {/* Intro */}
                <div style={{ paddingTop: "3.5rem", paddingBottom: "2.5rem",
                  borderBottom: "1px solid rgba(20,20,16,.08)" }}>
                  <div style={{ width: "3rem", height: 3, background: cs.color,
                    borderRadius: 100, marginBottom: "1.6rem" }}/>
                  <p className="sl-lead" style={{ borderLeftColor: cs.color }}>
                    {article.content.intro}
                  </p>
                </div>

                {/* Boutons action */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem",
                  padding: "1.5rem 0", borderBottom: "1px solid rgba(20,20,16,.07)",
                  flexWrap: "wrap" }}>
                  <button onClick={() => setBookmarked(b => !b)} className="sl-btn"
                    style={bookmarked ? { background: cs.bg, color: cs.color, borderColor: cs.color } : {}}>
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

                {/* Corps — rendu des blocs */}
                <div className="sl-body">
                  {article.content.blocks.map((block, i) => (
                    <RenderBlock key={i} block={block} color={cs.color} bg={cs.bg} />
                  ))}
                </div>

                {/* Footer article */}
                <div style={{ paddingTop: "2.5rem", borderTop: "2px solid rgba(20,20,16,.08)",
                  paddingBottom: "3.5rem" }}>
                  <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                    {[article.category, "Afrique", "2026"].map(t => (
                      <span key={t} style={{ fontSize: "0.58rem", fontWeight: 800,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "0.28rem 0.85rem", borderRadius: 100,
                        background: cs.bg, color: cs.color }}>{t}</span>
                    ))}
                  </div>

                  <div className="sl-author" style={{ borderLeftColor: cs.color }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
                      background: `linear-gradient(135deg, ${cs.color}, ${cs.dark})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>
                      {article.author.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.12em",
                        textTransform: "uppercase", color: cs.color, marginBottom: "0.25rem" }}>Journaliste</div>
                      <div style={{ fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: "1.15rem", fontWeight: 700, color: "#141410" }}>{article.author}</div>
                      <div style={{ fontSize: "0.65rem", color: "#928E80", marginTop: "0.2rem" }}>
                        Correspondant AfriPulse · Publié le {article.date}
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* ── SIDEBAR ── */}
              <aside className="sl-sidebar">

                {/* Progression */}
                <div className="sl-card">
                  <div className="sl-card-label">Progression</div>
                  <div style={{ height: 6, background: "rgba(20,20,16,.09)",
                    borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 100, background: cs.color,
                      width: `${progress}%`, transition: "width .18s",
                      boxShadow: `0 0 8px ${cs.color}55` }}/>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    fontSize: "0.6rem", color: "#928E80", marginTop: "0.55rem" }}>
                    <span style={{ fontWeight: 700, color: cs.color }}>{Math.round(progress)}% lu</span>
                    <span>{article.readTime} min</span>
                  </div>
                </div>

                {/* Sommaire dynamique */}
                {headings.length > 0 && (
                  <div className="sl-card" style={{ padding: 0 }}>
                    <div style={{ padding: "1.2rem 1.2rem 0.8rem",
                      borderBottom: "1px solid rgba(20,20,16,.07)" }}>
                      <div className="sl-card-label" style={{ marginBottom: 0 }}>Sommaire</div>
                    </div>
                    {headings.map((h, i) => (
                      <div key={i} style={{ display: "flex", gap: "0.8rem",
                        alignItems: "flex-start", padding: "0.8rem 1.2rem",
                        borderBottom: i < headings.length - 1 ? "1px solid rgba(20,20,16,.06)" : "none" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%",
                          background: cs.bg, color: cs.color, fontSize: "0.58rem",
                          fontWeight: 900, display: "flex", alignItems: "center",
                          justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontSize: "0.74rem", color: "#38382E",
                          fontWeight: 600, lineHeight: 1.38 }}>{h}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* À lire aussi */}
                <div className="sl-card" style={{ padding: 0 }}>
                  <div style={{ padding: "1.2rem 1.2rem 0.8rem",
                    borderBottom: "1px solid rgba(20,20,16,.07)" }}>
                    <div className="sl-card-label" style={{ marginBottom: 0 }}>À lire aussi</div>
                  </div>
                  {related.map((art, ri) => {
                    const acs = CAT[art.category] ?? CAT["Économie"];
                    return (
                      <Link key={art.id} href={`/actualites/${art.slug}`}
                        style={{ textDecoration: "none", display: "block" }}>
                        <div style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start",
                          padding: "0.9rem 1.2rem",
                          borderBottom: ri < related.length - 1 ? "1px solid rgba(20,20,16,.06)" : "none",
                          transition: "background .18s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(20,20,16,.03)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}>
                          <div style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                            background: art.imageGradient, position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", inset: 0,
                              background: "linear-gradient(135deg,transparent,rgba(0,0,0,.25))" }}/>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.54rem", fontWeight: 800, letterSpacing: "0.1em",
                              textTransform: "uppercase", color: acs.color, marginBottom: "0.28rem" }}>
                              {art.category}
                            </div>
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

                {/* Newsletter */}
                <div className="sl-card" style={{ background: "#141410", border: "none", padding: "1.6rem" }}>
                  <div style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.18em",
                    textTransform: "uppercase", color: "#C08435", marginBottom: "0.65rem" }}>Newsletter</div>
                  <p style={{ fontSize: "0.75rem", color: "rgba(248,246,241,.45)",
                    lineHeight: 1.65, fontWeight: 300, marginBottom: "1.1rem" }}>
                    Les 5 infos africaines essentielles chaque matin dans votre boîte.
                  </p>
                  <Link href="/newsletter" style={{ display: "block", textAlign: "center",
                    background: "#C08435", color: "#fff", borderRadius: 100,
                    padding: "0.7rem", fontSize: "0.75rem", fontWeight: 700,
                    textDecoration: "none", transition: "opacity .2s" }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = ".85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                    S&apos;abonner gratuitement
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* ══════ ARTICLES LIÉS ══════ */}
        <section style={{ background: "#F0EDE4", padding: "5.5rem 0" }}>
          <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 clamp(1rem,5vw,4rem)" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between",
              flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem", paddingBottom: "1.4rem",
              borderBottom: "2px solid #141410" }}>
              <div>
                <div style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "#C08435", marginBottom: "0.5rem" }}>
                  Continuer à lire
                </div>
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "clamp(1.5rem,3vw,2.3rem)", fontWeight: 900,
                  letterSpacing: "-0.035em", color: "#141410", margin: 0 }}>
                  Articles{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435" }}>similaires</em>
                </h2>
              </div>
              <Link href="/actualites" style={{ fontSize: "0.78rem", fontWeight: 700,
                color: "#C08435", textDecoration: "none", padding: "0.55rem 1.3rem",
                borderRadius: 100, border: "1.5px solid rgba(192,132,53,.3)",
                background: "rgba(192,132,53,.06)", transition: "background .2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(192,132,53,.12)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(192,132,53,.06)")}>
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
                        <div style={{ height: 220, position: "relative", overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ position: "absolute", inset: 0, background: art.imageGradient,
                            transition: "transform .5s ease" }} className="sl-card-img"/>
                          <div style={{ position: "absolute", inset: 0,
                            background: "linear-gradient(180deg,transparent 30%,rgba(0,0,0,.65) 100%)" }}/>
                          <span style={{ position: "absolute", top: "1rem", left: "1rem",
                            fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.1em",
                            textTransform: "uppercase", padding: "0.24rem 0.72rem", borderRadius: 100,
                            background: "rgba(255,255,255,.12)", color: "#fff",
                            backdropFilter: "blur(10px)" }}>{art.category}</span>
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
                            height: 3, background: acs.color }}/>
                        </div>
                        <div style={{ padding: "1.4rem 1.6rem", display: "flex",
                          flexDirection: "column", flex: 1 }}>
                          <h3 style={{ fontFamily: "'Fraunces', Georgia, serif",
                            fontSize: "1rem", fontWeight: 700, color: "#141410",
                            lineHeight: 1.28, flex: 1,
                            display: "-webkit-box", WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                            marginBottom: "0.55rem",
                          } as React.CSSProperties}>{art.title}</h3>
                          <p style={{ fontSize: "0.78rem", color: "#928E80", lineHeight: 1.7,
                            fontWeight: 300, display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                            marginBottom: "0.9rem",
                          } as React.CSSProperties}>{art.excerpt}</p>
                          <div style={{ display: "flex", alignItems: "center",
                            justifyContent: "space-between", paddingTop: "0.9rem",
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

      {/* ════════ STYLES ════════ */}
      <style>{`
        /* Layout */
        .sl-layout {
          display: grid;
          grid-template-columns: 1fr 348px;
          gap: 3.5rem;
          align-items: start;
        }
        .sl-sidebar {
          position: sticky;
          top: 5.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 3.5rem;
          padding-bottom: 3.5rem;
        }

        /* Intro */
        .sl-lead {
          font-size: clamp(1.05rem, 1.6vw, 1.24rem);
          font-weight: 400;
          color: #38382E;
          line-height: 1.88;
          border-left: 3px solid;
          padding-left: 1.5rem;
          font-style: italic;
        }

        /* Corps */
        .sl-body { padding-top: 2.8rem; display: flex; flex-direction: column; gap: 0; }
        .sl-h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.3rem, 2.2vw, 1.7rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.16;
          color: #141410;
          margin: 3rem 0 1.1rem;
        }
        .sl-h3 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.1rem, 1.8vw, 1.35rem);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #38382E;
          margin: 2rem 0 0.8rem;
        }
        .sl-p {
          font-size: clamp(0.95rem, 1.3vw, 1.06rem);
          color: #38382E;
          line-height: 1.9;
          margin: 0 0 1.4rem;
          font-weight: 300;
        }

        /* Image */
        .sl-figure {
          margin: 2.5rem 0;
        }
        .sl-figure-img {
          position: relative;
          height: clamp(220px, 50vw, 480px);
          border-radius: 20px;
          overflow: hidden;
          background: #141410;
        }
        .sl-figcaption {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-top: 0.75rem;
          padding: 0 0.25rem;
          font-size: 0.72rem;
          color: #928E80;
          line-height: 1.5;
          font-style: italic;
        }
        .sl-credit {
          flex-shrink: 0;
          font-size: 0.62rem;
          font-weight: 600;
          font-style: normal;
          color: #b0ac9f;
          white-space: nowrap;
        }

        /* Vidéo */
        .sl-video-wrap {
          position: relative;
          padding-top: 56.25%;
          border-radius: 20px;
          overflow: hidden;
          background: #141410;
        }

        /* Pull quote */
        .sl-pullquote {
          margin: 2.8rem 0;
          padding: 2rem 2.4rem;
          border-left: 4px solid;
          background: rgba(20,20,16,.03);
          border-radius: 0 20px 20px 0;
        }
        .sl-pullquote-mark {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 3.5rem;
          line-height: 0.8;
          font-weight: 900;
          margin-bottom: 0.7rem;
        }
        .sl-pullquote-text {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.1rem, 2vw, 1.35rem);
          font-weight: 600;
          font-style: italic;
          color: #141410;
          line-height: 1.55;
          margin: 0;
        }
        .sl-pullquote-footer { margin-top: 1.2rem; }
        .sl-pullquote-author {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }
        .sl-pullquote-role {
          font-size: 0.63rem;
          color: #928E80;
          margin-top: 0.15rem;
        }

        /* Factbox */
        .sl-factbox {
          margin: 2.5rem 0;
          padding: 1.6rem 1.8rem;
          border-top: 3px solid;
          border-radius: 0 0 20px 20px;
        }
        .sl-factbox-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 1.1rem;
        }
        .sl-factbox-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem 1.5rem;
        }
        .sl-factbox-item {
          display: flex;
          gap: 0.65rem;
          align-items: flex-start;
          font-size: 0.85rem;
          color: #38382E;
          font-weight: 500;
          line-height: 1.5;
        }
        .sl-factbox-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 0.3rem;
        }

        /* Related inline */
        .sl-related-inline {
          margin: 2rem 0;
          padding: 1.2rem 1.4rem;
          border-left: 4px solid;
          border-radius: 0 16px 16px 0;
          transition: opacity .2s;
        }
        .sl-related-inline:hover { opacity: .85; }
        .sl-related-inline-kicker {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.58rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 0.8rem;
        }
        .sl-related-inline-inner {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .sl-related-inline-thumb {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .sl-related-inline-body { flex: 1; min-width: 0; }
        .sl-related-inline-cat {
          font-size: 0.54rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.25rem;
        }
        .sl-related-inline-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 0.92rem;
          font-weight: 700;
          color: #141410;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .sl-related-inline-meta {
          font-size: 0.58rem;
          color: #928E80;
          display: block;
          margin-top: 0.3rem;
        }

        /* External link */
        .sl-external {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.1rem 1.4rem;
          margin: 2rem 0;
          background: #fff;
          border: 1.5px solid rgba(20,20,16,.1);
          border-radius: 16px;
          text-decoration: none;
          color: #38382E;
          transition: box-shadow .2s, transform .2s;
          box-shadow: 0 2px 8px rgba(20,20,16,.05);
        }
        .sl-external:hover {
          box-shadow: 0 8px 28px rgba(20,20,16,.1);
          transform: translateY(-2px);
        }
        .sl-external-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(20,20,16,.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          flex-shrink: 0;
        }
        .sl-external-body { flex: 1; min-width: 0; }
        .sl-external-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #141410;
          line-height: 1.3;
        }
        .sl-external-desc {
          font-size: 0.72rem;
          color: #928E80;
          margin-top: 0.2rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .sl-external-arrow {
          font-size: 1.1rem;
          color: #928E80;
          flex-shrink: 0;
        }

        /* Alert */
        .sl-alert {
          margin: 2rem 0;
          padding: 1.2rem 1.5rem;
          border-left: 4px solid;
          border-radius: 0 16px 16px 0;
        }

        /* Download */
        .sl-download {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.65rem 1.2rem;
          margin: 1.5rem 0;
          background: #141410;
          color: #F8F6F1;
          border-radius: 100px;
          text-decoration: none;
          font-size: 0.78rem;
          font-weight: 600;
          transition: opacity .2s;
        }
        .sl-download:hover { opacity: .82; }
        .sl-download-size {
          font-size: 0.62rem;
          color: rgba(248,246,241,.45);
          margin-left: 0.3rem;
        }

        /* Divider */
        .sl-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.7rem;
          margin: 3rem 0;
        }
        .sl-divider span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(20,20,16,.18);
          display: block;
        }
        .sl-divider span:nth-child(2) { background: rgba(20,20,16,.32); }

        /* Author card */
        .sl-author {
          display: flex;
          gap: 1.3rem;
          align-items: flex-start;
          padding: 1.5rem 1.8rem;
          background: #fff;
          border-radius: 22px;
          border-left: 4px solid;
          box-shadow: 0 2px 14px rgba(20,20,16,.06);
        }

        /* Sidebar cards */
        .sl-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid rgba(20,20,16,.08);
          padding: 1.3rem;
          box-shadow: 0 2px 8px rgba(20,20,16,.05);
        }
        .sl-card-label {
          font-size: 0.58rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #928E80;
          margin-bottom: 0.9rem;
        }

        /* Boutons */
        .sl-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.55rem 1.1rem;
          border-radius: 100px;
          border: 1.5px solid rgba(20,20,16,.12);
          background: transparent;
          color: #38382E;
          cursor: pointer;
          transition: all .2s;
          font-family: inherit;
        }
        .sl-btn:hover { background: rgba(20,20,16,.04); }

        /* Related cards grid */
        .sl-related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.4rem;
        }
        .sl-related-card {
          background: #fff;
          border-radius: 26px;
          border: 1px solid rgba(20,20,16,.07);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: transform .3s ease, box-shadow .3s ease;
          box-shadow: 0 2px 10px rgba(20,20,16,.06);
        }
        .sl-related-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 56px rgba(20,20,16,.13);
        }
        .sl-related-card:hover .sl-card-img {
          transform: scale(1.04);
        }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .sl-layout { grid-template-columns: 1fr; }
          .sl-sidebar { position: static; padding-top: 0; }
          .sl-related-grid { grid-template-columns: repeat(2,1fr); }
          .sl-factbox-list { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .sl-related-grid { grid-template-columns: 1fr; }
          .sl-pullquote { padding: 1.4rem 1.4rem; }
          .sl-factbox { padding: 1.2rem 1.2rem; }
          .sl-related-inline-thumb { width: 44px; height: 44px; }
        }
      `}</style>
    </>
  );
}