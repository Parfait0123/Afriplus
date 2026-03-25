"use client";

export const dynamic = "force-dynamic"; 

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import type { Block } from "@/types/blocks";

/* ─── Types ─── */
type OpportunityType = "Emploi CDI" | "Emploi" | "Stage" | "Graduate" | "Freelance" | "Volontariat";

interface Opportunity {
  id: string;
  slug: string;
  title: string;
  company: string;
  company_initials: string;
  location: string;
  country: string;
  flag: string;
  type: OpportunityType;
  sector: string;
  deadline: string;
  remote: boolean;
  salary: string | null;
  content: Block[];
  cover_url: string | null;
  image_gradient: string;
  skills: string[];
  published: boolean;
  views: number;
  apply_url: string | null;
  posted_at: string;
  created_at: string;
  updated_at: string;
}

const TYPES: OpportunityType[] = ["Emploi CDI", "Emploi", "Stage", "Graduate", "Freelance", "Volontariat"];

const TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  "Emploi CDI":  { color: "#1A5C40", bg: "#EAF4EF" },
  "Emploi":      { color: "#9B6B1A", bg: "#FBF4E8" },
  "Stage":       { color: "#1E4DA8", bg: "#EBF0FB" },
  "Graduate":    { color: "#7A1E4A", bg: "#F9EBF3" },
  "Freelance":   { color: "#B8341E", bg: "#FAEBE8" },
  "Volontariat": { color: "#928E80", bg: "#F0EDE4" },
};

const PAGE_SIZE = 12;

/* ─── Pill type ─── */
function TypePill({ type, inverted = false }: { type: string; inverted?: boolean }) {
  const s = TYPE_STYLE[type] ?? { color: "#928E80", bg: "#F0EDE4" };
  if (inverted) return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem",
      fontSize:"0.55rem", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase",
      padding:"0.22rem 0.7rem", borderRadius:100,
      background:"rgba(255,255,255,.15)", color:"#fff",
      border:"1px solid rgba(255,255,255,.2)", backdropFilter:"blur(8px)" }}>
      {type}
    </span>
  );
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem",
      fontSize:"0.55rem", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase",
      padding:"0.22rem 0.7rem", borderRadius:100, background:s.bg, color:s.color }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
      {type}
    </span>
  );
}

/* ─── Logo entreprise ─── */
function CompanyLogo({ initials, size = 40 }: { initials: string; size?: number }) {
  return (
    <div style={{ width:size, height:size, borderRadius: size * 0.28,
      background:"rgba(255,255,255,.95)", backdropFilter:"blur(8px)",
      border:"1px solid rgba(255,255,255,.5)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Fraunces', Georgia, serif", fontSize: size * 0.38,
      fontWeight:900, color:"#C08435",
      boxShadow:"0 2px 12px rgba(0,0,0,.18)", flexShrink:0 }}>
      {initials}
    </div>
  );
}

/* ─── Méta offre ─── */
function OppMeta({ opp, light = false }: { opp: Opportunity; light?: boolean }) {
  const col  = light ? "rgba(248,246,241,.45)" : "#928E80";
  const bold = light ? "rgba(248,246,241,.8)"  : "#38382E";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"0.9rem", fontSize:"0.6rem", color:col }}>
      <span style={{ fontWeight:700, color:bold }}>{opp.company}</span>
      <span style={{ width:3, height:3, borderRadius:"50%", background:col, flexShrink:0 }}/>
      <span>📍 {opp.location}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */
export default function OpportunitesPage() {
  const sb = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"Tout" | OpportunityType>("Tout");

  const loadInitial = useCallback(async () => {
    setLoading(true);
    let query = sb.from("opportunities").select("*").order("created_at", { ascending: false });
    if (!isPreview) {
      query = query.eq("published", true);
    }
    const { data, error } = await query;

    if (!error && data) {
      const parsed = (data as any[]).map(opp => ({
        ...opp,
        content: opp.content ? (typeof opp.content === "string" ? JSON.parse(opp.content) : opp.content) : [],
      })) as Opportunity[];
      setOpportunities(parsed);
      setHasMore(parsed.length > PAGE_SIZE);
    }
    setLoading(false);
  }, [isPreview]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const nextPage = page + 1;
    const from = (nextPage - 1) * PAGE_SIZE;
    const to = nextPage * PAGE_SIZE - 1;

    let query = sb
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (!isPreview) {
      query = query.eq("published", true);
    }
    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const parsed = (data as any[]).map(opp => ({
        ...opp,
        content: opp.content ? (typeof opp.content === "string" ? JSON.parse(opp.content) : opp.content) : [],
      })) as Opportunity[];
      setOpportunities(prev => [...prev, ...parsed]);
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [page, hasMore, loadingMore, isPreview]);

  /* ── Découpage éditorial ── */
  const sortedByDate = [...opportunities].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const vedette    = sortedByDate[0];
  const sideItems  = sortedByDate.slice(1, 4);
  const spotlight  = sortedByDate[4];
  const trio       = sortedByDate.slice(5, 8);
  const remaining  = sortedByDate.slice(8);
  const filtered   = filter === "Tout"
    ? remaining
    : remaining.filter(o => o.type === filter);

  /* Compteurs par type */
  const counts = TYPES.reduce((acc, t) => {
    acc[t] = opportunities.filter(o => o.type === t).length;
    return acc;
  }, {} as Record<string, number>);

  // État de chargement
  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ background:"#EEEADE", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", border:"3px solid rgba(20,20,16,.08)", borderTopColor:"#C08435", animation:"spin 0.8s linear infinite", margin:"0 auto 1rem" }}/>
            <p style={{ color:"#928E80" }}>Chargement des opportunités...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* Bandeau aperçu brouillon */}
      {isPreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9998,
            background: "#C08435",
            color: "#fff",
            textAlign: "center",
            padding: "0.5rem 1rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          👁 MODE APERÇU — Les brouillons sont visibles
          <button
            onClick={() => router.push("/admin/opportunites")}
            style={{
              marginLeft: "1.5rem",
              color: "#fff",
              textDecoration: "underline",
              fontSize: "0.72rem",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ← Retour à l&apos;admin
          </button>
        </div>
      )}

      <Navbar />

      <main style={{ background:"#EEEADE", paddingTop: isPreview ? 34 : 0 }}>

        {/* ══════════════════════════════════════════
            MASTHEAD
        ══════════════════════════════════════════ */}
        <div style={{ background:"#141410", paddingTop:"clamp(4.5rem,8vh,6.5rem)" }}>
          <div className="nw-wrap">

            {/* Topbar */}
            <div className="nw-topbar">
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                <span className="dot-live"/>
                <span className="nw-meta">
                  {opportunities.length} offres publiées &ensp;·&ensp; Afrique & International
                </span>
              </div>
              <div className="nw-topbar-nav">
                {TYPES.map(t => (
                  <button key={t} className="nw-topbar-link"
                    onClick={() => {
                      setFilter(t);
                      document.getElementById("opp-grid")?.scrollIntoView({ behavior:"smooth" });
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Masthead */}
            <div className="nw-masthead">
              <div className="nw-masthead-left">
                <div className="nw-edition-tag">Carrières · Afrique</div>
                <h1 className="nw-masthead-title">
                  Oppor<span style={{ color:"#C08435", fontStyle:"italic", fontWeight:200 }}>
                    tunités
                  </span>
                </h1>
              </div>
              <div className="nw-masthead-right">
                <p className="nw-masthead-desc">
                  Emplois, stages et programmes graduate<br/>
                  de premier plan sur le continent africain.
                </p>
                {/* Compteurs par type */}
                <div style={{ display:"flex", gap:"1.25rem", flexWrap:"wrap" }}>
                  {TYPES.filter(t => counts[t] > 0).map(t => {
                    const s = TYPE_STYLE[t];
                    return (
                      <div key={t} style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                        <span style={{ width:6, height:6, borderRadius:"50%",
                          background:s.color, flexShrink:0 }}/>
                        <span style={{ fontSize:"0.6rem", fontWeight:600,
                          color:"rgba(248,246,241,.35)", letterSpacing:"0.05em" }}>
                          {t} <strong style={{ color:"rgba(248,246,241,.7)" }}>{counts[t]}</strong>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div style={{ height:3, background:"linear-gradient(90deg,#C08435 0%,#E8B86D 50%,#C08435 100%)" }}/>
        </div>

        {/* ══════════════════════════════════════════
            ZONE 1 — VEDETTE + SIDEBAR
        ══════════════════════════════════════════ */}
        {vedette && (
          <div className="nw-wrap" style={{ paddingTop:"2.5rem" }}>
            <div className="nw-zone1">

              {/* Offre vedette */}
              <Link href={`/opportunites/${vedette.slug}${!vedette.published && isPreview ? "?preview=1" : ""}`} className="nw-hero-link">
                <article className="nw-hero">
                  <div className="nw-hero-img" style={{
                    background: vedette.cover_url
                      ? `url(${vedette.cover_url}) center/cover no-repeat`
                      : vedette.image_gradient
                  }}>
                    <div className="nw-hero-overlay"/>
                    <div className="nw-hero-ghost-num" style={{ fontSize:"clamp(7rem,14vw,12rem)",
                      letterSpacing:"-0.04em" }}>
                      {vedette.company_initials}
                    </div>
                    <div className="nw-hero-badge">
                      <span style={{ width:6, height:6, borderRadius:"50%",
                        background:"#fff", display:"inline-block" }}/>
                      Offre en vedette
                    </div>
                    <div style={{ position:"absolute", bottom:"1.25rem", left:"1.25rem" }}>
                      <CompanyLogo initials={vedette.company_initials} size={48} />
                    </div>
                  </div>
                  <div className="nw-hero-body">
                    <TypePill type={vedette.type}/>
                    <h2 className="nw-hero-title">{vedette.title}</h2>
                    <p className="nw-hero-excerpt" style={{ color:"#928E80" }}>
                      {vedette.company} · {vedette.location}
                    </p>
                    <div style={{ display:"flex", alignItems:"center",
                      justifyContent:"space-between",
                      paddingTop:"1.25rem", borderTop:"1px solid rgba(20,20,16,.08)" }}>
                      <OppMeta opp={vedette}/>
                      <span className="nw-read-cta">Postuler →</span>
                    </div>
                  </div>
                </article>
              </Link>

              {/* Sidebar */}
              <aside className="nw-sidebar">
                <div className="nw-sidebar-label">Autres offres</div>
                {sideItems.map((opp, i) => (
                  <Link key={opp.id} href={`/opportunites/${opp.slug}${!opp.published && isPreview ? "?preview=1" : ""}`} className="nw-sidebar-link">
                    <article className="nw-sidebar-art"
                      style={{ borderBottom: i < sideItems.length - 1
                        ? "1px solid rgba(20,20,16,.09)" : "none" }}>
                      <div className="nw-sidebar-thumb" style={{
                        background: opp.cover_url
                          ? `url(${opp.cover_url}) center/cover no-repeat`
                          : opp.image_gradient
                      }}>
                        <div style={{ position:"absolute", inset:0,
                          background:"linear-gradient(135deg,transparent,rgba(0,0,0,.28))" }}/>
                        <div style={{ position:"absolute", bottom:"0.35rem", left:"0.4rem" }}>
                          <CompanyLogo initials={opp.company_initials} size={28} />
                        </div>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <TypePill type={opp.type}/>
                        <h3 className="nw-sidebar-title">{opp.title}</h3>
                        <OppMeta opp={opp}/>
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
        ══════════════════════════════════════════ */}
        {spotlight && (
          <div style={{ margin:"2.5rem 0", background:"#141410",
            position:"relative", overflow:"hidden" }}>
            <div className="nw-wrap">
              <Link href={`/opportunites/${spotlight.slug}${!spotlight.published && isPreview ? "?preview=1" : ""}`}
                style={{ textDecoration:"none", display:"block" }}>
                <div className="nw-spotlight">
                  <div className="nw-spotlight-img" style={{
                    background: spotlight.cover_url
                      ? `url(${spotlight.cover_url}) center/cover no-repeat`
                      : spotlight.image_gradient
                  }}>
                    <div style={{ position:"absolute", inset:0,
                      background:"linear-gradient(90deg,#141410 0%,rgba(20,20,16,.4) 60%,transparent 100%)" }}/>
                    <div style={{ position:"absolute", bottom:"-1rem", right:"1.5rem",
                      fontFamily:"'Fraunces', Georgia, serif",
                      fontSize:"clamp(7rem,14vw,11rem)", fontWeight:900,
                      color:"rgba(255,255,255,.07)", lineHeight:1,
                      letterSpacing:"-0.05em", pointerEvents:"none" }}>
                      {spotlight.company_initials}
                    </div>
                  </div>
                  <div className="nw-spotlight-body">
                    <div style={{ fontSize:"0.58rem", fontWeight:800, letterSpacing:"0.2em",
                      textTransform:"uppercase", color:"#C08435", marginBottom:"1rem" }}>
                      Programme d&apos;excellence
                    </div>
                    <TypePill type={spotlight.type} inverted/>
                    <h2 className="nw-spotlight-title">{spotlight.title}</h2>
                    <p className="nw-spotlight-excerpt">
                      {spotlight.company} · {spotlight.location}
                    </p>
                    <div style={{ display:"flex", alignItems:"center", gap:"2rem", marginTop:"2rem" }}>
                      <OppMeta opp={spotlight} light/>
                      <span style={{ marginLeft:"auto", fontSize:"0.8rem", fontWeight:700,
                        color:"#C08435", display:"flex", alignItems:"center", gap:"0.4rem",
                        flexShrink:0, borderBottom:"1.5px solid rgba(192,132,53,.3)",
                        paddingBottom:"2px" }}>
                        Voir l&apos;offre
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div style={{ position:"absolute", top:0,
                    left:-10, width:4,
                    height:"100%", background:"#C08435" }}/>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            ZONE 3 — TRIO 3 COLONNES
        ══════════════════════════════════════════ */}
        {trio.length > 0 && (
          <div className="nw-wrap">
            <div className="nw-section-header">
              <div className="nw-section-rule"/>
              <span className="nw-section-label">Sélection · Tous profils</span>
              <div className="nw-section-rule"/>
            </div>
            <div className="nw-trio">
              {trio.map((opp, i) => (
                <Link key={opp.id} href={`/opportunites/${opp.slug}${!opp.published && isPreview ? "?preview=1" : ""}`}
                  style={{ textDecoration:"none" }}>
                  <article className="nw-trio-card">
                    <div className="nw-trio-img" style={{
                      background: opp.cover_url
                        ? `url(${opp.cover_url}) center/cover no-repeat`
                        : opp.image_gradient
                    }}>
                      <div style={{ position:"absolute", inset:0,
                        background:"linear-gradient(180deg,transparent 45%,rgba(0,0,0,.65) 100%)" }}/>
                      <div style={{ position:"absolute", top:"0.85rem", left:"0.85rem" }}>
                        <TypePill type={opp.type} inverted/>
                      </div>
                      <div style={{ position:"absolute", bottom:"-1rem", right:"0.75rem",
                        fontFamily:"'Fraunces', Georgia, serif", fontSize:"3rem", fontWeight:900,
                        color:"rgba(255,255,255,.09)", lineHeight:1, letterSpacing:"-0.04em",
                        pointerEvents:"none" }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div style={{ position:"absolute", bottom:"0.85rem", left:"0.9rem" }}>
                        <CompanyLogo initials={opp.company_initials} size={36} />
                      </div>
                    </div>
                    <div style={{ padding:"1.25rem 1.35rem" }}>
                      <div style={{ fontSize:"0.6rem", fontWeight:800, letterSpacing:"0.1em",
                        textTransform:"uppercase", color:"#C08435", marginBottom:"0.35rem" }}>
                        {opp.company}
                      </div>
                      <h3 className="nw-trio-title">{opp.title}</h3>
                      <p className="nw-trio-excerpt">📍 {opp.location}</p>
                      <div style={{ paddingTop:"0.85rem",
                        borderTop:"1px solid rgba(20,20,16,.07)", marginTop:"0.5rem" }}>
                        <OppMeta opp={opp}/>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            ZONE 4 — GRILLE FILTRÉE
        ══════════════════════════════════════════ */}
        <div id="opp-grid" className="nw-wrap"
          style={{ paddingTop:"1rem", paddingBottom:"5rem" }}>

          <div className="nw-grid-header">
            <div>
              <h2 className="nw-grid-title">
                {filter === "Tout" ? "Toutes les offres" : filter}
              </h2>
              <span className="nw-grid-count">
                {filtered.length} offre{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="nw-filters">
              {(["Tout", ...TYPES] as ("Tout" | OpportunityType)[]).map(f => {
                const active = filter === f;
                const s = TYPE_STYLE[f as string];
                return (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`nw-filter-btn ${active ? "nw-filter-btn--active" : ""}`}
                    style={active && s ? { background:s.color, color:"#fff" } : {}}>
                    {f}
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
                Aucune offre dans cette catégorie.
              </p>
              <button onClick={() => setFilter("Tout")}
                className="nw-load-btn" style={{ marginTop:"1.5rem" }}>
                Voir tout
              </button>
            </div>
          ) : (
            <>
              <div className="nw-grid">
                {filtered.map((opp, i) => {
                  const isWide = i % 7 === 0;
                  return (
                    <Link key={opp.id} href={`/opportunites/${opp.slug}${!opp.published && isPreview ? "?preview=1" : ""}`}
                      style={{ textDecoration:"none", gridColumn: isWide ? "span 2" : "span 1" }}>
                      <article className={`nw-card ${isWide ? "nw-card--wide" : ""}`}>
                        <div className={`nw-card-img ${isWide ? "nw-card-img--wide" : ""}`}
                          style={{
                            background: opp.cover_url
                              ? `url(${opp.cover_url}) center/cover no-repeat`
                              : opp.image_gradient
                          }}>
                          <div style={{ position:"absolute", inset:0,
                            background: isWide
                              ? "linear-gradient(180deg,rgba(0,0,0,.06) 0%,rgba(0,0,0,.72) 100%)"
                              : "linear-gradient(180deg,transparent 40%,rgba(0,0,0,.55) 100%)" }}/>
                          <div style={{ position:"absolute", top:"0.85rem", left:"0.85rem" }}>
                            <TypePill type={opp.type} inverted={!isWide}/>
                          </div>
                          <div style={{ position:"absolute", bottom:"0.85rem", left:"0.85rem" }}>
                            <CompanyLogo initials={opp.company_initials}
                              size={isWide ? 44 : 34}/>
                          </div>
                          {isWide && (
                            <div style={{ position:"absolute", bottom:"0.5rem", right:"1rem",
                              fontFamily:"'Fraunces', Georgia, serif", fontSize:"4.5rem",
                              fontWeight:900, color:"rgba(255,255,255,.07)", lineHeight:1,
                              letterSpacing:"-0.04em" }}>
                              {opp.company_initials}
                            </div>
                          )}
                        </div>
                        <div style={{ padding: isWide ? "1.5rem 1.75rem" : "1rem 1.2rem",
                          display:"flex", flexDirection:"column", flex:1, gap:"0.4rem" }}>
                          <div style={{ fontSize:"0.58rem", fontWeight:800,
                            letterSpacing:"0.1em", textTransform:"uppercase", color:"#C08435" }}>
                            {opp.company}
                          </div>
                          {!isWide && <div style={{ marginBottom:"0.1rem" }}>
                            <TypePill type={opp.type}/>
                          </div>}
                          <h3 className={`nw-card-title ${isWide ? "nw-card-title--wide" : ""}`}>
                            {opp.title}
                          </h3>
                          {isWide && (
                            <p className="nw-card-excerpt">📍 {opp.location}</p>
                          )}
                          <div style={{ marginTop:"auto", paddingTop:"0.75rem",
                            borderTop:"1px solid rgba(20,20,16,.06)" }}>
                            <OppMeta opp={opp}/>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>

              {/* Bouton Charger plus */}
              {hasMore && (
                <div style={{ textAlign:"center", marginTop:"4rem" }}>
                  <button 
                    onClick={loadMore} 
                    disabled={loadingMore}
                    className="nw-load-btn"
                    style={{ opacity: loadingMore ? 0.6 : 1, cursor: loadingMore ? "wait" : "pointer" }}
                  >
                    {loadingMore ? (
                      <>
                        <span style={{ display:"inline-block", width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", animation:"spin 0.8s linear infinite", marginRight:"0.5rem" }}/>
                        Chargement...
                      </>
                    ) : (
                      <>
                        Charger plus d&apos;offres
                        <span style={{ marginLeft:"0.75rem", fontSize:"0.6rem", fontWeight:800,
                          background:"rgba(248,246,241,.15)", padding:"0.15rem 0.6rem",
                          borderRadius:100 }}>+{PAGE_SIZE}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <NewsletterBand />
      <Footer />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}