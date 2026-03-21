"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import { createClient } from "@/lib/supabase/client";

type Category = "Politique"|"Économie"|"Tech"|"Sport"|"Culture"|"Santé"|"Environnement";

/* ── Type article Supabase ── */
interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: Category;
  author_name: string;
  reading_time: number;
  cover_url: string | null;
  image_gradient: string;
  featured: boolean;
  published_at: string | null;
  created_at: string;
}

/* ─── Config catégories ─── */
const CATEGORIES: Category[] = ["Politique","Économie","Tech","Sport","Culture","Santé","Environnement"];

const CAT_STYLE: Record<string, { color: string; bg: string }> = {
  "Politique":     { color: "#1E4DA8", bg: "#EBF0FB" },
  "Économie":      { color: "#9B6B1A", bg: "#FBF4E8" },
  "Tech":          { color: "#1A5C40", bg: "#EAF4EF" },
  "Sport":         { color: "#B8341E", bg: "#FAEBE8" },
  "Culture":       { color: "#7A4A1E", bg: "#FDF3E8" },
  "Santé":         { color: "#1A5C5C", bg: "#E6F4F4" },
  "Environnement": { color: "#2D6B3B", bg: "#E6F4EA" },
};

/* ─── Micro-composants ─── */
function CategoryPill({ cat, inverted = false }: { cat: string; inverted?: boolean }) {
  const s = CAT_STYLE[cat] ?? { color: "#928E80", bg: "#F0EDE4" };
  if (inverted) {
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem",
        fontSize:"0.55rem", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase",
        padding:"0.22rem 0.7rem", borderRadius:100,
        background:"rgba(255,255,255,.15)", color:"#fff",
        border:"1px solid rgba(255,255,255,.2)", backdropFilter:"blur(8px)" }}>
        {cat}
      </span>
    );
  }
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem",
      fontSize:"0.55rem", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase",
      padding:"0.22rem 0.7rem", borderRadius:100,
      background: s.bg, color: s.color }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
      {cat}
    </span>
  );
}

function Byline({ author, date, readTime, light = false }: { author:string; date:string; readTime:number; light?:boolean }) {
  const col = light ? "rgba(248,246,241,.45)" : "#928E80";
  const bold = light ? "rgba(248,246,241,.8)" : "#38382E";
  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" });
    } catch { return iso; }
  };
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"0.9rem", fontSize:"0.6rem", color:col }}>
      <span style={{ fontWeight:700, color:bold }}>{author}</span>
      <span style={{ width:3, height:3, borderRadius:"50%", background:col, flexShrink:0 }}/>
      <span>{fmtDate(date)}</span>
      <span style={{ width:3, height:3, borderRadius:"50%", background:col, flexShrink:0 }}/>
      <span>{readTime} min</span>
    </div>
  );
}

export default function ActualitesPage() {
  const sb = createClient();
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter, setFilter] = useState<"Tout" | Category>("Tout");

  useEffect(() => {
    sb.from("articles")
      .select("id,slug,title,excerpt,category,author_name,reading_time,cover_url,image_gradient,featured,published_at,created_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setArticles((data ?? []) as ArticleRow[]);
        setLoading(false);
      });
  }, []);
  
  /* ── Découpage éditorial ── */
  const hero      = articles[0];
  const col1      = articles.slice(1, 4);
  const spotlight = articles[4];
  const trio      = articles.slice(5, 8);
  const longform  = articles.slice(8, 10);
  const remaining = articles.slice(10);
  const filtered  = filter === "Tout" ? remaining : remaining.filter(a => a.category === filter);

  /* ── Helpers pour mapper les champs Supabase ── */
  const imgBg = (art: ArticleRow) =>
    art.cover_url ? `url(${art.cover_url})` : art.image_gradient;
  const imgStyle = (art: ArticleRow): React.CSSProperties =>
    art.cover_url
      ? { background: `url(${art.cover_url}) center/cover no-repeat` }
      : { background: art.image_gradient };

  /* ── Skeleton de chargement ── */
  if (loading) return (
    <>
      <Navbar />
      <main style={{ background:"#EEEADE", minHeight:"100vh" }}>
        <div style={{ background:"#141410", paddingTop:"clamp(4.5rem,8vh,6.5rem)", paddingBottom:"3rem" }}>
          <div className="nw-wrap">
            <div style={{ display:"flex", gap:"1rem", marginBottom:"2rem" }}>
              <div style={{ width:200, height:14, borderRadius:6, background:"rgba(248,246,241,.08)", animation:"nw-pulse 1.4s ease infinite" }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ width:260, height:52, borderRadius:8, background:"rgba(248,246,241,.06)", animation:"nw-pulse 1.4s ease .1s infinite" }}/>
              <div style={{ width:180, height:16, borderRadius:6, background:"rgba(248,246,241,.04)", animation:"nw-pulse 1.4s ease .2s infinite" }}/>
            </div>
          </div>
          <div style={{ height:3, background:"linear-gradient(90deg,#C08435,#E8B86D,#C08435)", marginTop:"2rem" }}/>
        </div>
        <div className="nw-wrap" style={{ paddingTop:"2.5rem", paddingBottom:"5rem" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"2rem", marginBottom:"3rem" }}>
            <div style={{ height:480, borderRadius:20, background:"rgba(20,20,16,.08)", animation:"nw-pulse 1.4s ease infinite" }}/>
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              {[0,1,2].map(i => <div key={i} style={{ height:140, borderRadius:14, background:"rgba(20,20,16,.06)", animation:`nw-pulse 1.4s ease ${i*.1}s infinite` }}/>)}
            </div>
          </div>
        </div>
        <style>{`@keyframes nw-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      </main>
      <Footer />
    </>
  );

  /* ── Pas encore d'articles ── */
  if (articles.length === 0) return (
    <>
      <Navbar />
      <main style={{ background:"#EEEADE", minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"1.5rem", color:"rgba(20,20,16,.2)", fontWeight:900 }}>—</p>
          <p style={{ color:"#928E80", marginTop:"0.5rem" }}>Aucun article publié pour l&apos;instant.</p>
        </div>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />

      <main style={{ background:"#EEEADE" }}>

        {/* ══════════════════════════════════════════
            MASTHEAD — Bandeau journal de presse
        ══════════════════════════════════════════ */}
        <div style={{ background:"#141410", paddingTop:"clamp(4.5rem,8vh,6.5rem)" }}>
          <div className="nw-wrap">

            {/* Date + nav catégories */}
            <div className="nw-topbar">
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                <span className="dot-live"/>
                <span className="nw-meta">
                  {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                </span>
              </div>
              <div className="nw-topbar-nav">
                {CATEGORIES.map(c => (
                  <button key={c} className="nw-topbar-link"
                    onClick={() => { setFilter(c); document.getElementById("nw-grid-section")?.scrollIntoView({behavior:"smooth"}); }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Titre masthead */}
            <div className="nw-masthead">
              <div className="nw-masthead-left">
                <div className="nw-edition-tag">Édition Afrique</div>
                <h1 className="nw-masthead-title">
                  Actua<span style={{ color:"#C08435", fontStyle:"italic", fontWeight:200 }}>lités</span>
                </h1>
              </div>
              <div className="nw-masthead-right">
                <p className="nw-masthead-desc">
                  Information vérifiée, analyses approfondies<br/>
                  et décryptages sur 55 pays africains.
                </p>
                <div className="nw-masthead-count">
                  <span style={{ color:"#C08435", fontWeight:800 }}>{articles.length}</span> articles publiés
                </div>
              </div>
            </div>
          </div>

          {/* Ligne dorée de séparation */}
          <div style={{ height:3, background:"linear-gradient(90deg, #C08435 0%, #E8B86D 50%, #C08435 100%)" }}/>
        </div>

        {/* ══════════════════════════════════════════
            ZONE 1 — MANCHETTE + SIDEBAR 3 ARTICLES
            Disposition : NYT front page
        ══════════════════════════════════════════ */}
        <div className="nw-wrap" style={{ paddingTop:"2.5rem" }}>
          <div className="nw-zone1">

            {/* ── MANCHETTE PRINCIPALE ── */}
            <Link href={`/actualites/${hero.slug}`} className="nw-hero-link">
              <article className="nw-hero">
                {/* Image plein fond */}
                <div className="nw-hero-img" style={imgStyle(hero)}>
                  <div className="nw-hero-overlay"/>
                  {/* Numéro fantôme */}
                  <div className="nw-hero-ghost-num">01</div>
                  {/* Badge */}
                  <div className="nw-hero-badge">
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#fff", display:"inline-block" }}/>
                    À la une
                  </div>
                </div>
                {/* Corps texte */}
                <div className="nw-hero-body">
                  <CategoryPill cat={hero.category}/>
                  <h2 className="nw-hero-title">{hero.title}</h2>
                  <p className="nw-hero-excerpt">{hero.excerpt}</p>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    paddingTop:"1.25rem", borderTop:"1px solid rgba(20,20,16,.08)" }}>
                    <Byline author={hero.author_name} date={hero.published_at ?? hero.created_at} readTime={hero.reading_time}/>
                    <span className="nw-read-cta">Lire →</span>
                  </div>
                </div>
              </article>
            </Link>

            {/* ── SIDEBAR — 3 articles en colonne ── */}
            <aside className="nw-sidebar">
              <div className="nw-sidebar-label">À lire aussi</div>
              {col1.map((art, i) => (
                <Link key={art.id} href={`/actualites/${art.slug}`} className="nw-sidebar-link">
                  <article className="nw-sidebar-art" style={{ borderBottom: i < col1.length-1 ? "1px solid rgba(20,20,16,.09)" : "none" }}>
                    <div className="nw-sidebar-thumb" style={imgStyle(art)}>
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,transparent,rgba(0,0,0,.25))" }}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <CategoryPill cat={art.category}/>
                      <h3 className="nw-sidebar-title">{art.title}</h3>
                      <Byline author={art.author_name} date={art.published_at ?? art.created_at} readTime={art.reading_time}/>
                    </div>
                  </article>
                </Link>
              ))}
            </aside>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            ZONE 2 — SPOTLIGHT sombre pleine largeur
            Style : couverture magazine
        ══════════════════════════════════════════ */}
        <div style={{ margin:"2.5rem 0", background:"#141410", position:"relative", overflow:"hidden" }}>
          <div className="nw-wrap">
            <Link href={`/actualites/${spotlight.slug}`} style={{ textDecoration:"none", display:"block" }}>
              <div className="nw-spotlight">
                {/* Image côté droit */}
                <div className="nw-spotlight-img" style={imgStyle(spotlight)}>
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg, #141410 0%, rgba(20,20,16,.4) 60%, transparent 100%)" }}/>
                </div>
                {/* Texte */}
                <div className="nw-spotlight-body">
                  <div style={{ fontSize:"0.58rem", fontWeight:800, letterSpacing:"0.2em",
                    textTransform:"uppercase", color:"#C08435", marginBottom:"1rem" }}>
                    Reportage exclusif
                  </div>
                  <CategoryPill cat={spotlight.category} inverted/>
                  <h2 className="nw-spotlight-title">{spotlight.title}</h2>
                  <p className="nw-spotlight-excerpt">{spotlight.excerpt}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:"2rem", marginTop:"2rem" }}>
                    <Byline author={spotlight.author_name} date={spotlight.published_at ?? spotlight.created_at} readTime={spotlight.reading_time} light/>
                    <span style={{ marginLeft:"auto", fontSize:"0.8rem", fontWeight:700, color:"#C08435",
                      display:"flex", alignItems:"center", gap:"0.4rem", flexShrink:0,
                      borderBottom:"1.5px solid rgba(192,132,53,.3)", paddingBottom:"2px" }}>
                      Lire le reportage
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
                {/* Accent décoratif */}
                <div style={{ position:"absolute", top:0, left:-10, width:4, height:"100%", background:"#C08435" }}/>
              </div>
            </Link>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            ZONE 3 — TRIO 3 colonnes égales
            Style : rubrique magazine
        ══════════════════════════════════════════ */}
        <div className="nw-wrap">
          <div className="nw-section-header">
            <div className="nw-section-rule"/>
            <span className="nw-section-label">Monde & Société</span>
            <div className="nw-section-rule"/>
          </div>
          <div className="nw-trio">
            {trio.map((art, i) => (
              <Link key={art.id} href={`/actualites/${art.slug}`} style={{ textDecoration:"none" }}>
                <article className="nw-trio-card">
                  <div className="nw-trio-img" style={imgStyle(art)}>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 45%,rgba(0,0,0,.65) 100%)" }}/>
                    <div style={{ position:"absolute", top:"0.85rem", left:"0.85rem" }}>
                      <CategoryPill cat={art.category} inverted/>
                    </div>
                    <div style={{ position:"absolute", bottom:"0.8rem", right:"0.9rem",
                      fontFamily:"'Fraunces', Georgia, serif", fontSize:"3rem", fontWeight:900,
                      color:"rgba(255,255,255,.1)", lineHeight:1, letterSpacing:"-0.04em" }}>
                      {String(i+5).padStart(2,"0")}
                    </div>
                  </div>
                  <div style={{ padding:"1.25rem 1.35rem" }}>
                    <h3 className="nw-trio-title">{art.title}</h3>
                    <p className="nw-trio-excerpt">{art.excerpt}</p>
                    <div style={{ paddingTop:"0.85rem", borderTop:"1px solid rgba(20,20,16,.07)", marginTop:"0.5rem" }}>
                      <Byline author={art.author_name} date={art.published_at ?? art.created_at} readTime={art.reading_time}/>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            ZONE 4 — LONGFORM 2 grands articles
            Style : double page magazine
        ══════════════════════════════════════════ */}
        <div style={{ background:"#fff", margin:"2.5rem 0", padding:"3rem 0" }}>
          <div className="nw-wrap">
            <div className="nw-section-header">
              <div className="nw-section-rule"/>
              <span className="nw-section-label">Analyses & Enquêtes</span>
              <div className="nw-section-rule"/>
            </div>
            <div className="nw-longform">
              {longform.map((art, i) => (
                <Link key={art.id} href={`/actualites/${art.slug}`} style={{ textDecoration:"none" }}>
                  <article className="nw-longform-card">
                    <div className="nw-longform-img" style={imgStyle(art)}>
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.78))" }}/>
                      <div style={{ position:"absolute", top:"1.25rem", left:"1.25rem" }}>
                        <CategoryPill cat={art.category} inverted/>
                      </div>
                      {/* Numéro décoratif */}
                      <div style={{ position:"absolute", bottom:"-1rem", right:"1rem",
                        fontFamily:"'Fraunces', Georgia, serif", fontSize:"8rem",
                        fontWeight:900, color:"rgba(255,255,255,.06)",
                        lineHeight:1, letterSpacing:"-0.05em", pointerEvents:"none" }}>
                        {String(i+9).padStart(2,"0")}
                      </div>
                    </div>
                    <div style={{ padding:"1.75rem 2rem", background:"#fff" }}>
                      {/* Trait doré */}
                      <div style={{ width:"2.5rem", height:2, background:"#C08435", marginBottom:"1rem", borderRadius:100 }}/>
                      <h3 className="nw-longform-title">{art.title}</h3>
                      <p className="nw-longform-excerpt">{art.excerpt}</p>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                        paddingTop:"1.1rem", borderTop:"1px solid rgba(20,20,16,.07)" }}>
                        <Byline author={art.author_name} date={art.published_at ?? art.created_at} readTime={art.reading_time}/>
                        <span className="nw-read-cta">Lire →</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            ZONE 5 — GRILLE PRINCIPALE filtrée
            Style : rubrique journal
        ══════════════════════════════════════════ */}
        <div id="nw-grid-section" className="nw-wrap" style={{ paddingTop:"1rem", paddingBottom:"5rem" }}>

          {/* Header rubrique + filtres */}
          <div className="nw-grid-header">
            <div>
              <h2 className="nw-grid-title">
                {filter === "Tout" ? "Toutes les actualités" : filter}
              </h2>
              <span className="nw-grid-count">{filtered.length} article{filtered.length!==1?"s":""}</span>
            </div>
            <div className="nw-filters">
              {(["Tout", ...CATEGORIES] as ("Tout"|Category)[]).map(f => {
                const active = filter === f;
                const s = CAT_STYLE[f as string];
                return (
                  <button key={f} onClick={() => setFilter(f)} className={`nw-filter-btn ${active?"nw-filter-btn--active":""}`}
                    style={ active && s ? { background: s.color, color:"#fff" } : {} }>
                    {f}
                  </button>
                );
              })}
              {filter !== "Tout" && (
                <button onClick={() => setFilter("Tout")} className="nw-filter-clear">✕ Effacer</button>
              )}
            </div>
          </div>

          {/* Grille masonry-like */}
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"6rem 0" }}>
              <p style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:"1.5rem", color:"rgba(20,20,16,.15)", fontWeight:900 }}>—</p>
              <p style={{ color:"#928E80", fontSize:"0.88rem", marginTop:"0.5rem" }}>Aucun article dans cette catégorie.</p>
              <button onClick={() => setFilter("Tout")} className="nw-load-btn" style={{ marginTop:"1.5rem" }}>Voir tout</button>
            </div>
          ) : (
            <div className="nw-grid">
              {filtered.map((art, i) => {
                const isWide = i % 7 === 0; // toutes les 7 cartes, une wide
                return (
                  <Link key={art.id} href={`/actualites/${art.slug}`}
                    style={{ textDecoration:"none", gridColumn: isWide ? "span 2" : "span 1" }}>
                    <article className={`nw-card ${isWide ? "nw-card--wide" : ""}`}>
                      <div className={`nw-card-img ${isWide ? "nw-card-img--wide" : ""}`}
                        style={imgStyle(art)}>
                        <div style={{ position:"absolute", inset:0,
                          background: isWide
                            ? "linear-gradient(180deg,rgba(0,0,0,.06) 0%,rgba(0,0,0,.72) 100%)"
                            : "linear-gradient(180deg,transparent 40%,rgba(0,0,0,.55) 100%)" }}/>
                        <div style={{ position:"absolute", top:"0.85rem", left:"0.85rem" }}>
                          <CategoryPill cat={art.category} inverted={!isWide}/>
                        </div>
                        {isWide && (
                          <div style={{ position:"absolute", bottom:"0.5rem", right:"1rem",
                            fontFamily:"'Fraunces', Georgia, serif", fontSize:"4.5rem",
                            fontWeight:900, color:"rgba(255,255,255,.07)", lineHeight:1 }}>
                            {String(i+11).padStart(2,"0")}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: isWide ? "1.5rem 1.75rem" : "1rem 1.2rem",
                        display:"flex", flexDirection:"column", flex:1, gap:"0.4rem" }}>
                        {!isWide && <div style={{ marginBottom:"0.15rem" }}><CategoryPill cat={art.category}/></div>}
                        <h3 className={`nw-card-title ${isWide ? "nw-card-title--wide" : ""}`}>{art.title}</h3>
                        {isWide && <p className="nw-card-excerpt">{art.excerpt}</p>}
                        <div style={{ marginTop:"auto", paddingTop:"0.75rem",
                          borderTop:"1px solid rgba(20,20,16,.06)" }}>
                          <Byline author={art.author_name} date={art.published_at ?? art.created_at} readTime={art.reading_time}/>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Charger plus */}
          {filtered.length > 0 && (
            <div style={{ textAlign:"center", marginTop:"4rem" }}>
              <button className="nw-load-btn">
                Charger plus d'articles
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