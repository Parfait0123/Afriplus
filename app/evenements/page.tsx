"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";

/* ─── Types ─── */
type EventType = "Conférence" | "Forum" | "Hackathon" | "Salon" | "Atelier" | "Sommet";

interface SbEvent {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  location: string;
  country: string | null;
  flag: string;
  event_date: string;         // DATE ISO "YYYY-MM-DD"
  description: string | null;
  organizer: string | null;
  attendees: string | null;
  cover_url: string | null;
  image_gradient: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  created_at: string;
}

/* ─── Config ─── */
const TYPES: EventType[] = ["Conférence", "Forum", "Hackathon", "Salon", "Atelier", "Sommet"];
const PAGE_SIZE = 12;

const TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  "Conférence": { color: "#1E4DA8", bg: "#EBF0FB" },
  "Forum":      { color: "#1A5C40", bg: "#EAF4EF" },
  "Hackathon":  { color: "#B8341E", bg: "#FAEBE8" },
  "Salon":      { color: "#9B6B1A", bg: "#FBF4E8" },
  "Atelier":    { color: "#7A1E4A", bg: "#F9EBF3" },
  "Sommet":     { color: "#141410", bg: "#F0EDE4" },
};

/* ─── Helpers date ─── */
const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];
const MONTHS_LONG_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function parseDate(iso: string) {
  const d = new Date(iso + "T00:00:00"); // forcer UTC local pour éviter décalage
  return {
    day:   String(d.getDate()).padStart(2, "0"),
    month: MONTHS_FR[d.getMonth()],
    monthLong: MONTHS_LONG_FR[d.getMonth()],
    year:  String(d.getFullYear()),
    ts:    d.getTime(),
    raw:   d,
  };
}

function isUpcoming(iso: string) {
  return new Date(iso + "T00:00:00").getTime() >= Date.now() - 86400000; // today inclusive
}

/* ─── Composants ─── */
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

function DateBlock({ day, month, year, gold = false, large = false }: {
  day: string; month: string; year: string; gold?: boolean; large?: boolean;
}) {
  const w = large ? 70 : 52;
  return (
    <div style={{ width: w, flexShrink: 0, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background: gold ? "#C08435" : "rgba(20,20,16,.06)",
      borderRadius: large ? 16 : 12,
      padding: large ? "0.75rem 0.5rem" : "0.5rem 0.35rem" }}>
      <span style={{ fontFamily:"'Fraunces', Georgia, serif",
        fontSize: large ? "2.1rem" : "1.55rem", fontWeight:900, lineHeight:1,
        color: gold ? "#fff" : "#141410", letterSpacing:"-0.03em" }}>
        {day}
      </span>
      <span style={{ fontSize: large ? "0.58rem" : "0.5rem", fontWeight:800,
        letterSpacing:"0.1em", textTransform:"uppercase",
        color: gold ? "rgba(255,255,255,.75)" : "#928E80", marginTop:"0.08rem" }}>
        {month}
      </span>
      <span style={{ fontSize:"0.46rem", fontWeight:600,
        color: gold ? "rgba(255,255,255,.5)" : "rgba(20,20,16,.22)",
        letterSpacing:"0.04em" }}>
        {year}
      </span>
    </div>
  );
}

function EventByline({ ev, light = false }: { ev: SbEvent; light?: boolean }) {
  const col  = light ? "rgba(248,246,241,.45)" : "#928E80";
  const bold = light ? "rgba(248,246,241,.8)"  : "#38382E";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"0.9rem",
      fontSize:"0.6rem", color: col, flexWrap:"wrap" }}>
      <span style={{ fontWeight:700, color: bold }}>
        {ev.flag} {ev.location}{ev.country ? `, ${ev.country}` : ""}
      </span>
      {ev.attendees && <>
        <span style={{ width:3, height:3, borderRadius:"50%", background: col, flexShrink:0 }}/>
        <span>{ev.attendees} participants</span>
      </>}
      {ev.organizer && <>
        <span style={{ width:3, height:3, borderRadius:"50%", background: col, flexShrink:0 }}/>
        <span>{ev.organizer}</span>
      </>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function EvenementsPage() {
  const sb = createClient();

  const [allEvents, setAllEvents]     = useState<SbEvent[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<"Tous" | EventType>("Tous");
  const [page, setPage]               = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(false);
  const [gridTotal, setGridTotal]     = useState(0);

  /* ══ Chargement initial : vedette + sidebar + spotlight + agenda + grille ══ */
  const loadInitial = useCallback(async () => {
    setLoading(true);

    // On charge tout d'un coup pour avoir le contexte complet des zones éditoriales
    // (vedette, sidebar, spotlight, agenda par mois).
    // La grille paginée sera gérée séparément.
    const { data, error } = await sb
      .from("events")
      .select("*")
      .eq("published", true)
      .order("event_date", { ascending: true }); // ordre chronologique pour l'agenda

    if (!error && data) {
      // Tri éditorial :
      // 1. Événements à venir en premier (event_date >= aujourd'hui), triés par date ASC
      // 2. Événements passés ensuite, triés par date DESC (les plus récents d'abord)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = (data as SbEvent[]).filter(e => new Date(e.event_date) >= today)
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

      const past = (data as SbEvent[]).filter(e => new Date(e.event_date) < today)
        .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

      const sorted = [...upcoming, ...past];
      setAllEvents(sorted);
    }

    setLoading(false);
  }, [sb]);

  useEffect(() => { loadInitial(); }, [loadInitial]);

  /* ══ Chargement grille paginée avec filtre ══ */
  const loadGrid = useCallback(async (currentPage: number, currentFilter: "Tous" | EventType, append = false) => {
    if (append) setLoadingMore(true);

    const today = new Date().toISOString().split("T")[0];
    const from  = (currentPage - 1) * PAGE_SIZE;
    const to    = currentPage * PAGE_SIZE - 1;

    let q = (sb.from("events") as any)
      .select("*", { count: "exact" })
      .eq("published", true)
      .order("event_date", { ascending: true }); // upcoming first

    if (currentFilter !== "Tous") q = q.eq("type", currentFilter);

    // upcoming avant passés — deux requêtes séparées ou range trick
    // On utilise un order combiné : d'abord les futurs, ensuite les passés
    // Supabase ne supporte pas nativement l'order conditionnel, on pagine sur le set trié client
    const { data, error, count } = await q.range(from, to);

    if (!error && data) {
      const raw = data as SbEvent[];
      if (append) {
        setAllEvents(prev => {
          // On ajoute uniquement les nouvelles entrées à la liste globale de la grille
          // (on garde les zones éditoriales intactes)
          return prev;
        });
        setGridEvents(prev => [...prev, ...raw]);
      } else {
        setGridEvents(raw);
      }
      setGridTotal(count ?? 0);
      setHasMore(to < (count ?? 0) - 1);
    }

    if (append) setLoadingMore(false);
  }, [sb]);

  const [gridEvents, setGridEvents] = useState<SbEvent[]>([]);

  useEffect(() => {
    if (!loading) {
      setPage(1);
      loadGrid(1, filter, false);
    }
  }, [filter, loading, loadGrid]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await loadGrid(nextPage, filter, true);
  };

  /* ══ Découpage éditorial depuis allEvents ══ */
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Vedette : 1. featured + à venir, 2. featured passé, 3. premier à venir, 4. premier tout court
  const vedette: SbEvent | null =
    allEvents.find(e => e.featured && new Date(e.event_date) >= today) ??
    allEvents.find(e => e.featured) ??
    allEvents.find(e => new Date(e.event_date) >= today) ??
    allEvents[0] ??
    null;

  // Sidebar : 3 prochains hors vedette
  const sideItems = allEvents
    .filter(e => e.id !== vedette?.id && new Date(e.event_date) >= today)
    .slice(0, 3);

  // Spotlight : 2e featured à venir, sinon 2e à venir, sinon 3e global
  const spotlight: SbEvent | null =
    allEvents.find(e => e.featured && e.id !== vedette?.id && new Date(e.event_date) >= today) ??
    allEvents.filter(e => e.id !== vedette?.id && new Date(e.event_date) >= today)[1] ??
    allEvents.filter(e => e.id !== vedette?.id)[1] ??
    null;

  /* ══ Agenda par mois (tous les événements triés chronologiquement) ══ */
  const agendaEvents = allEvents.filter(e => e.id !== vedette?.id && e.id !== spotlight?.id);

  const byMonth: Record<string, SbEvent[]> = {};
  agendaEvents.forEach(ev => {
    const d = parseDate(ev.event_date);
    const k = `${d.monthLong} ${d.year}`;
    if (!byMonth[k]) byMonth[k] = [];
    byMonth[k].push(ev);
  });
  const months = Object.keys(byMonth);

  /* ══ Compteurs par type ══ */
  const counts = TYPES.reduce((acc, t) => {
    acc[t] = allEvents.filter(e => e.type === t).length;
    return acc;
  }, {} as Record<string, number>);

  /* ══ État de chargement initial ══ */
  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ background:"#EEEADE", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", border:"3px solid rgba(20,20,16,.08)", borderTopColor:"#C08435", animation:"spin .8s linear infinite", margin:"0 auto 1rem" }}/>
            <p style={{ color:"#928E80" }}>Chargement des événements…</p>
          </div>
          <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ background:"#EEEADE", overflowX:"hidden" }}>

        {/* ══ MASTHEAD ══ */}
        <div style={{ background:"#141410", paddingTop:"clamp(4.5rem,8vh,6.5rem)" }}>
          <div className="nw-wrap">
            <div className="nw-topbar">
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                <span className="dot-live"/>
                <span className="nw-meta">
                  {allEvents.filter(e => new Date(e.event_date) >= today).length} événements à venir
                  &ensp;·&ensp;{allEvents.length} au total
                </span>
              </div>
              <div className="nw-topbar-nav">
                {TYPES.map(t => (
                  <button key={t} className="nw-topbar-link"
                    onClick={() => {
                      setFilter(t);
                      document.getElementById("ev-grid")?.scrollIntoView({ behavior:"smooth" });
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="nw-masthead">
              <div className="nw-masthead-left">
                <div className="nw-edition-tag">Agenda · Afrique</div>
                <h1 className="nw-masthead-title">
                  Évène<span style={{ color:"#C08435", fontStyle:"italic", fontWeight:200 }}>ments</span>
                </h1>
              </div>
              <div className="nw-masthead-right">
                <p className="nw-masthead-desc">
                  Conférences, forums, hackathons et sommets<br/>
                  qui façonnent l&apos;avenir de l&apos;Afrique.
                </p>
                <div style={{ display:"flex", gap:"1.25rem", flexWrap:"wrap" }}>
                  {TYPES.filter(t => counts[t] > 0).map(t => {
                    const s = TYPE_STYLE[t];
                    return (
                      <div key={t} style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
                        <span style={{ fontSize:"0.6rem", fontWeight:600,
                          color:"rgba(248,246,241,.35)", letterSpacing:"0.05em" }}>
                          {t} <strong style={{ color:"rgba(248,246,241,.65)" }}>{counts[t]}</strong>
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

        {/* ══ ZONE 1 — VEDETTE + SIDEBAR ══ */}
        {vedette && (
          <div className="nw-wrap" style={{ paddingTop:"2.5rem" }}>
            <div className="nw-zone1">
              <Link href={`/evenements/${vedette.slug}`} className="nw-hero-link">
                <article className="nw-hero">
                  <div className="nw-hero-img" style={{
                    background: vedette.cover_url
                      ? `url(${vedette.cover_url}) center/cover no-repeat`
                      : vedette.image_gradient
                  }}>
                    <div className="nw-hero-overlay"/>
                    {/* Jour fantôme */}
                    <div className="nw-hero-ghost-num"
                      style={{ letterSpacing:"-0.06em", bottom:"-2rem" }}>
                      {parseDate(vedette.event_date).day}
                    </div>
                    <div className="nw-hero-badge">
                      <span style={{ width:6, height:6, borderRadius:"50%",
                        background:"#fff", display:"inline-block" }}/>
                      {vedette.featured ? "Événement en vedette" : "Prochainement"}
                    </div>
                    {/* DateBlock doré */}
                    <div style={{ position:"absolute", bottom:"1.25rem", left:"1.25rem" }}>
                      <DateBlock
                        day={parseDate(vedette.event_date).day}
                        month={parseDate(vedette.event_date).month}
                        year={parseDate(vedette.event_date).year}
                        gold large
                      />
                    </div>
                    {/* Localisation */}
                    <div style={{ position:"absolute", bottom:"1.25rem", right:"1.25rem",
                      display:"flex", alignItems:"center", gap:"0.4rem",
                      background:"rgba(255,255,255,.92)", backdropFilter:"blur(10px)",
                      padding:"0.22rem 0.75rem 0.22rem 0.45rem",
                      borderRadius:100, fontSize:"0.63rem", fontWeight:700, color:"#141410",
                      boxShadow:"0 2px 12px rgba(0,0,0,.2)" }}>
                      <span style={{ fontSize:"1rem" }}>{vedette.flag}</span>
                      {vedette.location}{vedette.country ? `, ${vedette.country}` : ""}
                    </div>
                  </div>
                  <div className="nw-hero-body">
                    <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", flexWrap:"wrap" }}>
                      <TypePill type={vedette.type}/>
                      {vedette.attendees && (
                        <span style={{ fontSize:"0.6rem", color:"#928E80", fontWeight:500 }}>
                          {vedette.attendees} participants
                        </span>
                      )}
                    </div>
                    <h2 className="nw-hero-title">{vedette.title}</h2>
                    {vedette.description && (
                      <p className="nw-hero-excerpt">{vedette.description}</p>
                    )}
                    {vedette.tags?.length > 0 && (
                      <div style={{ display:"flex", gap:"0.3rem", flexWrap:"wrap" }}>
                        {vedette.tags.map(t => (
                          <span key={t} style={{ fontSize:"0.57rem", fontWeight:600,
                            padding:"0.18rem 0.62rem", borderRadius:100,
                            background:"#F0EDE4", color:"#38382E",
                            border:"1px solid rgba(20,20,16,.07)" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ display:"flex", alignItems:"center",
                      justifyContent:"space-between",
                      paddingTop:"1.25rem", borderTop:"1px solid rgba(20,20,16,.08)" }}>
                      <EventByline ev={vedette}/>
                      <span className="nw-read-cta">S&apos;inscrire →</span>
                    </div>
                  </div>
                </article>
              </Link>

              {/* Sidebar agenda */}
              {sideItems.length > 0 && (
                <aside className="nw-sidebar">
                  <div className="nw-sidebar-label">Prochainement</div>
                  {sideItems.map((ev, i) => {
                    const d = parseDate(ev.event_date);
                    return (
                      <Link key={ev.id} href={`/evenements/${ev.slug}`} className="nw-sidebar-link">
                        <article className="nw-sidebar-art" style={{
                          borderBottom: i < sideItems.length - 1
                            ? "1px solid rgba(20,20,16,.09)" : "none",
                          alignItems:"flex-start" }}>
                          <DateBlock day={d.day} month={d.month} year={d.year}/>
                          <div style={{ flex:1, minWidth:0 }}>
                            <TypePill type={ev.type}/>
                            <h3 className="nw-sidebar-title">{ev.title}</h3>
                            <div style={{ fontSize:"0.6rem", color:"#928E80", marginTop:"0.25rem",
                              display:"flex", alignItems:"center", gap:"0.35rem" }}>
                              <span>{ev.flag}</span>
                              <span>{ev.location}{ev.attendees ? ` · ${ev.attendees}` : ""}</span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </aside>
              )}
            </div>
          </div>
        )}

        {/* ══ ZONE 2 — SPOTLIGHT ══ */}
        {spotlight && (
          <div style={{ margin:"2.5rem 0", background:"#141410",
            position:"relative", overflow:"hidden" }}>
            <div className="nw-wrap">
              <Link href={`/evenements/${spotlight.slug}`}
                style={{ textDecoration:"none", display:"block" }}>
                <div className="nw-spotlight">
                  <div className="nw-spotlight-img" style={{
                    background: spotlight.cover_url
                      ? `url(${spotlight.cover_url}) center/cover no-repeat`
                      : spotlight.image_gradient
                  }}>
                    <div style={{ position:"absolute", inset:0,
                      background:"linear-gradient(90deg,#141410 0%,rgba(20,20,16,.35) 60%,transparent 100%)" }}/>
                    {/* Jour fantôme géant */}
                    <div style={{ position:"absolute", bottom:"-2.5rem", right:"0",
                      fontFamily:"'Fraunces', Georgia, serif",
                      fontSize:"clamp(6rem,14vw,12rem)", fontWeight:900,
                      color:"rgba(255,255,255,.05)", lineHeight:1,
                      letterSpacing:"-0.06em", pointerEvents:"none",
                      overflow:"hidden", maxWidth:"100%" }}>
                      {parseDate(spotlight.event_date).day}
                    </div>
                    {/* Flag */}
                    <div style={{ position:"absolute", bottom:"1.5rem", right:"2rem",
                      fontSize:"4rem", lineHeight:1,
                      filter:"drop-shadow(0 4px 20px rgba(0,0,0,.5))" }}>
                      {spotlight.flag}
                    </div>
                  </div>
                  <div className="nw-spotlight-body">
                    <div style={{ fontSize:"0.58rem", fontWeight:800, letterSpacing:"0.2em",
                      textTransform:"uppercase", color:"#C08435", marginBottom:"1rem" }}>
                      Événement majeur
                    </div>
                    <TypePill type={spotlight.type} inverted/>
                    <h2 className="nw-spotlight-title">{spotlight.title}</h2>
                    {spotlight.description && (
                      <p className="nw-spotlight-excerpt">{spotlight.description}</p>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:"2rem", marginTop:"2rem" }}>
                      <EventByline ev={spotlight} light/>
                      <span style={{ marginLeft:"auto", fontSize:"0.8rem", fontWeight:700,
                        color:"#C08435", display:"flex", alignItems:"center", gap:"0.4rem",
                        flexShrink:0, borderBottom:"1.5px solid rgba(192,132,53,.3)",
                        paddingBottom:"2px" }}>
                        Voir l&apos;événement
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div style={{ position:"absolute", top:0, left:0, width:4,
                    height:"100%", background:"#C08435" }}/>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* ══ ZONE 3 — AGENDA PAR MOIS ══ */}
        {months.length > 0 && (
          <div style={{ background:"#fff", margin:"0 0 2.5rem", padding:"3rem 0" }}>
            <div className="nw-wrap">
              <div className="nw-section-header">
                <div className="nw-section-rule"/>
                <span className="nw-section-label">Agenda · Chronologie</span>
                <div className="nw-section-rule"/>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:"2.5rem" }}>
                {months.map(month => (
                  <div key={month}>
                    <div style={{ display:"flex", alignItems:"center", gap:"1rem",
                      marginBottom:"0.5rem" }}>
                      <div style={{ fontFamily:"'Fraunces', Georgia, serif",
                        fontSize:"clamp(1rem,1.8vw,1.25rem)", fontWeight:900,
                        color:"#141410", letterSpacing:"-0.03em" }}>
                        {month}
                      </div>
                      <div style={{ flex:1, height:1, background:"rgba(20,20,16,.08)" }}/>
                      <span style={{ fontSize:"0.58rem", fontWeight:700,
                        color:"#928E80", letterSpacing:"0.08em" }}>
                        {byMonth[month].length} événement{byMonth[month].length > 1 ? "s" : ""}
                      </span>
                    </div>

                    {byMonth[month].map((ev, ei) => {
                      const d = parseDate(ev.event_date);
                      const upcoming = new Date(ev.event_date) >= today;
                      return (
                        <Link key={ev.id} href={`/evenements/${ev.slug}`}
                          style={{ textDecoration:"none", display:"block" }}>
                          <div className="ev-agenda-row" style={{
                            display:"grid",
                            gridTemplateColumns:"52px 1fr auto",
                            alignItems:"center", gap:"1.25rem",
                            padding:"0.95rem 0.75rem",
                            borderTop: ei > 0 ? "1px solid rgba(20,20,16,.06)" : "none",
                            borderRadius:12, margin:"0 -0.75rem",
                            transition:"background .18s",
                            opacity: upcoming ? 1 : 0.55,
                          }}>
                            <DateBlock day={d.day} month={d.month} year={d.year}/>
                            <div style={{ minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"center",
                                gap:"0.6rem", marginBottom:"0.35rem", flexWrap:"wrap" }}>
                                <TypePill type={ev.type}/>
                                <span style={{ fontSize:"0.6rem", color:"#928E80",
                                  display:"flex", alignItems:"center", gap:"0.3rem" }}>
                                  <span>{ev.flag}</span>
                                  {ev.location}{ev.attendees ? ` · ${ev.attendees}` : ""}
                                </span>
                                {!upcoming && (
                                  <span style={{ fontSize:"0.52rem", fontWeight:700,
                                    color:"#928E80", background:"rgba(20,20,16,.06)",
                                    padding:"0.1rem 0.5rem", borderRadius:100 }}>
                                    Passé
                                  </span>
                                )}
                              </div>
                              <div style={{ fontFamily:"'Fraunces', Georgia, serif",
                                fontSize:"clamp(0.92rem,1.3vw,1.05rem)", fontWeight:700,
                                color:"#141410", lineHeight:1.25 }}>
                                {ev.title}
                              </div>
                            </div>
                            <span className="ev-cta" style={{ fontSize:"0.7rem", fontWeight:800,
                              color:"#C08435", flexShrink:0,
                              borderBottom:"1.5px solid rgba(192,132,53,.3)",
                              paddingBottom:"1px", whiteSpace:"nowrap" }}>
                              {upcoming ? "S'inscrire →" : "Voir →"}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ ZONE 4 — GRILLE FILTRÉE + PAGINATION ══ */}
        <div id="ev-grid" className="nw-wrap"
          style={{ paddingTop:"1rem", paddingBottom:"5rem" }}>

          <div className="nw-grid-header">
            <div>
              <h2 className="nw-grid-title">
                {filter === "Tous" ? "Tous les événements" : filter}
              </h2>
              <span className="nw-grid-count">
                {gridTotal} événement{gridTotal !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="nw-filters">
              {(["Tous", ...TYPES] as ("Tous" | EventType)[]).map(f => {
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
              {filter !== "Tous" && (
                <button onClick={() => setFilter("Tous")} className="nw-filter-clear">
                  ✕ Effacer
                </button>
              )}
            </div>
          </div>

          {gridEvents.length === 0 ? (
            <div style={{ textAlign:"center", padding:"6rem 0" }}>
              <p style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:"1.5rem",
                color:"rgba(20,20,16,.15)", fontWeight:900 }}>—</p>
              <p style={{ color:"#928E80", fontSize:"0.88rem", marginTop:"0.5rem" }}>
                Aucun événement dans cette catégorie.
              </p>
              <button onClick={() => setFilter("Tous")} className="nw-load-btn"
                style={{ marginTop:"1.5rem" }}>
                Voir tout
              </button>
            </div>
          ) : (
            <>
              <div className="nw-grid">
                {gridEvents.map((ev, i) => {
                  const isWide = i % 7 === 0;
                  const d = parseDate(ev.event_date);
                  const upcoming = new Date(ev.event_date) >= today;
                  return (
                    <Link key={ev.id} href={`/evenements/${ev.slug}`}
                      className={isWide ? "nw-grid-col-wide" : ""}
                      style={{ textDecoration:"none" }}>
                      <article className={`nw-card ${isWide ? "nw-card--wide" : ""}`}
                        style={{ opacity: upcoming ? 1 : 0.72 }}>
                        <div className={`nw-card-img ${isWide ? "nw-card-img--wide" : ""}`}
                          style={{
                            background: ev.cover_url
                              ? `url(${ev.cover_url}) center/cover no-repeat`
                              : ev.image_gradient
                          }}>
                          <div style={{ position:"absolute", inset:0,
                            background: isWide
                              ? "linear-gradient(180deg,rgba(0,0,0,.06) 0%,rgba(0,0,0,.72) 100%)"
                              : "linear-gradient(180deg,transparent 35%,rgba(0,0,0,.6) 100%)" }}/>
                          <div style={{ position:"absolute", top:"0.85rem", left:"0.85rem" }}>
                            <TypePill type={ev.type} inverted={!isWide}/>
                          </div>
                          <div style={{ position:"absolute", bottom:"0.85rem", left:"0.85rem",
                            display:"flex", alignItems:"center", gap:"0.6rem" }}>
                            <DateBlock day={d.day} month={d.month} year={d.year}
                              gold large={isWide}/>
                            <span style={{ fontSize: isWide ? "1.8rem" : "1.3rem", lineHeight:1,
                              filter:"drop-shadow(0 2px 8px rgba(0,0,0,.45))" }}>
                              {ev.flag}
                            </span>
                          </div>
                          {!upcoming && (
                            <div style={{ position:"absolute", top:"0.85rem", right:"0.85rem",
                              fontSize:"0.52rem", fontWeight:800, letterSpacing:"0.08em",
                              textTransform:"uppercase", padding:"0.18rem 0.6rem",
                              borderRadius:100, background:"rgba(20,20,16,.65)", color:"rgba(255,255,255,.6)" }}>
                              Passé
                            </div>
                          )}
                          {isWide && (
                            <div style={{ position:"absolute", bottom:"-1rem", right:"0.75rem",
                              fontFamily:"'Fraunces', Georgia, serif", fontSize:"5rem",
                              fontWeight:900, color:"rgba(255,255,255,.06)", lineHeight:1,
                              letterSpacing:"-0.04em", pointerEvents:"none" }}>
                              {d.day}
                            </div>
                          )}
                        </div>
                        <div style={{ padding: isWide ? "1.5rem 1.75rem" : "1rem 1.2rem",
                          display:"flex", flexDirection:"column", flex:1, gap:"0.4rem" }}>
                          <div style={{ fontSize:"0.58rem", fontWeight:800,
                            letterSpacing:"0.1em", textTransform:"uppercase", color:"#C08435" }}>
                            {ev.organizer ?? ev.type}
                          </div>
                          {!isWide && <TypePill type={ev.type}/>}
                          <h3 className={`nw-card-title ${isWide ? "nw-card-title--wide" : ""}`}>
                            {ev.title}
                          </h3>
                          {isWide && ev.description && (
                            <p className="nw-card-excerpt">{ev.description}</p>
                          )}
                          {ev.tags?.length > 0 && (
                            <div style={{ display:"flex", gap:"0.28rem", flexWrap:"wrap",
                              marginTop:"0.1rem" }}>
                              {ev.tags.slice(0, isWide ? 4 : 2).map(t => (
                                <span key={t} style={{ fontSize:"0.55rem", fontWeight:600,
                                  padding:"0.15rem 0.55rem", borderRadius:100,
                                  background:"#F0EDE4", color:"#38382E",
                                  border:"1px solid rgba(20,20,16,.06)" }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          <div style={{ marginTop:"auto", paddingTop:"0.75rem",
                            borderTop:"1px solid rgba(20,20,16,.06)" }}>
                            <EventByline ev={ev}/>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>

              {/* Bouton charger plus — IMPLÉMENTÉ */}
              {hasMore && (
                <div style={{ textAlign:"center", marginTop:"4rem" }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="nw-load-btn"
                    style={{ opacity: loadingMore ? 0.6 : 1, cursor: loadingMore ? "wait" : "pointer" }}
                  >
                    {loadingMore ? (
                      <>
                        <span style={{ display:"inline-block", width:16, height:16,
                          borderRadius:"50%", border:"2px solid rgba(255,255,255,.3)",
                          borderTopColor:"#fff", animation:"spin .8s linear infinite",
                          marginRight:"0.5rem" }}/>
                        Chargement…
                      </>
                    ) : (
                      <>
                        Charger plus d&apos;événements
                        <span style={{ marginLeft:"0.75rem", fontSize:"0.6rem", fontWeight:800,
                          background:"rgba(248,246,241,.15)", padding:"0.15rem 0.6rem",
                          borderRadius:100 }}>
                          +{PAGE_SIZE}
                        </span>
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

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </>
  );
}