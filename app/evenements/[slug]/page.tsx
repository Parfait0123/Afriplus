"use client";

/**
 * app/evenements/[slug]/page.tsx
 * - Support événements (dates day/month/year)
 * - Inscription → RegisterEventButton (Supabase event_registrations)
 * - Sauvegarde → Supabase saves
 * - Partage → Web Share API + copie URL
 * - Responsive mobile-first (classes ev-*)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import RegisterEventButton from "@/components/ui/RegisterEventButton";
import {
  BlockRenderer,
  SaveShareBar,
  CountdownBadge,
  SidebarInfoRow,
  SidebarCTAButton,
  TagsPill,
  RelatedSection,
  type ThemeColors,
  type RelatedItem,
} from "@/components/ui/DetailPageShared";
import type { Block } from "@/types/blocks";

/* ── Types ── */
type EventType = "Conférence" | "Forum" | "Hackathon" | "Salon" | "Atelier" | "Sommet";

interface Event {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  location: string;
  country: string;
  flag: string;
  day: string;
  month: string;
  year: string;
  event_date: string;
  excerpt: string | null;
  organizer: string;
  attendees: string;
  event_url: string | null;
  cover_url: string | null;
  image_gradient: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  views: number;
  saves_count: number;
  content: Block[];
  meta_title: string | null;
  meta_desc: string | null;
  created_at: string;
  updated_at: string;
}

/* ── Couleurs par type ── */
const TYPE_COLOR: Record<string, ThemeColors> = {
  "Conférence": { color: "#1E4DA8", bg: "#EBF0FB", dark: "#102860" },
  "Forum":      { color: "#1A5C40", bg: "#EAF4EF", dark: "#0F3828" },
  "Hackathon":  { color: "#B8341E", bg: "#FAEBE8", dark: "#7A2010" },
  "Salon":      { color: "#C08435", bg: "#FBF4E8", dark: "#7A5220" },
  "Atelier":    { color: "#7A1E4A", bg: "#F9EBF3", dark: "#52123A" },
  "Sommet":     { color: "#141410", bg: "#F0EDE4", dark: "#000" },
};

function formatDate(event: Event): string {
  return `${event.day} ${event.month} ${event.year}`;
}

/* ── Icônes ── */
const Ico = {
  Arrow:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Pin:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Users:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Share:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Link:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Bookmark: ({ on }: { on: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
};

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */
export default function EventDetailPage({ params }: { params: { slug: string } }) {
  return <EventClient slug={params.slug} />;
}

function EventClient({ slug }: { slug: string }) {
  const sb = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";

  const [event, setEvent] = useState<Event | null>(null);
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingLoad, setSavingLoad] = useState(false);
  const [copied, setCopied] = useState(false);
  const viewsIncremented = useRef(false);

  useEffect(() => { requestAnimationFrame(() => setHeroVisible(true)); }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1. Récupérer l'événement
        let query = sb.from("events").select("*").eq("slug", slug);
        if (!isPreview) {
          query = query.eq("published", true);
        }
        const { data: ev, error } = await query.single() as { data: any; error: any };

        if (error || !ev) {
          console.error("Erreur chargement événement:", error);
          setLoading(false);
          return;
        }

        // Parser les blocks
        let parsedBlocks: Block[] = [];
        if (ev.content) {
          try {
            parsedBlocks = typeof ev.content === "string" ? JSON.parse(ev.content) : ev.content;
          } catch { parsedBlocks = []; }
        }

        const eventData: Event = {
          id: ev.id,
          slug: ev.slug,
          title: ev.title,
          type: ev.type,
          location: ev.location || "",
          country: ev.country || "",
          flag: ev.flag || "🌍",
          day: ev.day || "",
          month: ev.month || "",
          year: ev.year || "",
          event_date: ev.event_date || "",
          excerpt: ev.excerpt || null,
          organizer: ev.organizer || "",
          attendees: ev.attendees || "",
          event_url: ev.event_url || null,
          cover_url: ev.cover_url || null,
          image_gradient: ev.image_gradient || `linear-gradient(135deg,${TYPE_COLOR[ev.type]?.color || "#C08435"}22,#0a0800)`,
          tags: ev.tags || [],
          featured: ev.featured || false,
          published: ev.published,
          views: ev.views || 0,
          saves_count: ev.saves_count || 0,
          content: parsedBlocks,
          meta_title: ev.meta_title || null,
          meta_desc: ev.meta_desc || null,
          created_at: ev.created_at,
          updated_at: ev.updated_at,
        };

        setEvent(eventData);

        // 2. Incrémenter les vues (une seule fois, hors preview)
        if (!isPreview && !viewsIncremented.current) {
          viewsIncremented.current = true;
          ((await sb.from("events") as any).update({ views: (ev.views ?? 0) + 1 } ).eq("id", ev.id)).then(() => {});
        }

        // 3. Récupérer les événements similaires (même type)
        let relatedQuery = sb
          .from("events")
          .select("id,slug,title,type,location,country,flag,day,month,year,event_date,image_gradient")
          .eq("published", true)
          .neq("id", ev.id)
          .limit(4)
          .order("event_date", { ascending: true });

        if (ev.type) {
          relatedQuery = relatedQuery.eq("type", ev.type);
        }

        const { data: relatedData } = await relatedQuery;

        if (relatedData) {
          setRelated(
            relatedData.map((r: any) => ({
              id: r.id,
              slug: r.slug,
              title: r.title,
              imageGradient: r.image_gradient,
              deadline: `${r.day} ${r.month} ${r.year}`,
              flag: r.flag,
              country: r.country,
              location: r.location,
              type: r.type,
            }))
          );
        }

        // 4. Vérifier si sauvegardé
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          const { data: saveData } = await sb.from("saves")
            .select("id")
            .eq("user_id", user.id)
            .eq("content_type", "event")
            .eq("content_slug", slug)
            .maybeSingle();
          setSaved(!!saveData);
        } else {
          try { const l = localStorage.getItem(`saved-event-${slug}`); if (l) setSaved(JSON.parse(l)); } catch {}
        }
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, isPreview, sb]);

  const toggleSave = async () => {
    setSavingLoad(true);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { const n = !saved; setSaved(n); try { localStorage.setItem(`saved-event-${slug}`, JSON.stringify(n)); } catch {} setSavingLoad(false); return; }
    if (saved) {
      setSaved(false);
      await sb.from("saves").delete().eq("user_id", user.id).eq("content_type", "event").eq("content_slug", slug);
    } else {
      setSaved(true);
await (sb.from("saves") as any).insert({
  user_id: user.id,
  content_type: "event",
  content_slug: slug,
  content_title: event?.title,
  content_meta: { date: event ? formatDate(event) : "", location: event?.location },
});
    }
    setSavingLoad(false);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) { try { await navigator.share({ url, title: event?.title }); } catch {} }
    else navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ background: "#F0EDE4", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(20,20,16,.08)", borderTopColor: "#C08435", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ color: "#928E80" }}>Chargement de l'événement...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
        <Footer />
      </>
    );
  }

  if (!event) notFound();

  const ev = event;
  const tc = TYPE_COLOR[ev.type] ?? TYPE_COLOR["Conférence"];
  const blocks = ev.content ?? [];
  const dateStr = formatDate(ev);

  return (
    <>
      {/* Bandeau aperçu brouillon */}
      {isPreview && !ev.published && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9998, background: "#C08435", color: "#fff", textAlign: "center", padding: "0.5rem 1rem", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em" }}>
          👁 MODE APERÇU — Cet événement est un brouillon, non visible du public
          <Link href={`/admin/evenements/${ev.id}`} style={{ marginLeft: "1.5rem", color: "#fff", textDecoration: "underline", fontSize: "0.72rem" }}>← Retour à l&apos;éditeur</Link>
        </div>
      )}

      <Navbar />

      <main style={{ paddingTop: isPreview && !ev.published ? 34 : 0 }}>

        {/* ════ HERO ════ */}
        <div style={{ paddingTop: "62px" }}>
          <div className="ev-hero" style={{ background: ev.image_gradient }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(${tc.color}08 1px,transparent 1px),linear-gradient(90deg,${tc.color}08 1px,transparent 1px)`, backgroundSize:"72px 72px", pointerEvents:"none" }} />
            <div className="ev-hero-circles">
              <div style={{ position:"absolute", top:"-15%", right:"-8%", width:"55vw", height:"55vw", borderRadius:"50%", border:`1px solid ${tc.color}18`, pointerEvents:"none" }} />
              <div style={{ position:"absolute", top:"-5%", right:"2%",  width:"35vw", height:"35vw", borderRadius:"50%", border:`1px solid ${tc.color}12`, pointerEvents:"none" }} />
            </div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"65%", background:"linear-gradient(transparent,rgba(0,0,0,.8))", pointerEvents:"none" }} />

            <div className="ev-hero-inner" style={{ opacity:heroVisible?1:0, transform:heroVisible?"none":"translateY(20px)", transition:"all .8s cubic-bezier(.16,1,.3,1)" }}>
              <div className="ev-breadcrumb">
                <Link href="/" style={{ color:"rgba(255,255,255,.4)", textDecoration:"none" }}>Accueil</Link>
                <span style={{ color:"rgba(255,255,255,.2)" }}>/</span>
                <Link href="/evenements" style={{ color:"rgba(255,255,255,.4)", textDecoration:"none" }}>Événements</Link>
                <span style={{ color:"rgba(255,255,255,.2)" }}>/</span>
                <span style={{ color:"rgba(255,255,255,.65)" }}>{ev.type}</span>
              </div>

              <div className="ev-badges">
                <div style={{ display:"inline-flex", alignItems:"center", fontSize:"0.6rem", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", padding:"0.3rem 0.85rem", borderRadius:100, background:tc.color, color:"#fff" }}>{ev.type}</div>
                {ev.tags?.map((tag: string) => <div key={tag} style={{ fontSize:"0.58rem", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", padding:"0.25rem 0.7rem", borderRadius:100, background:"rgba(255,255,255,.1)", color:"rgba(255,255,255,.65)", backdropFilter:"blur(4px)", border:"1px solid rgba(255,255,255,.12)" }}>{tag}</div>)}
              </div>

              <h1 className="ev-title">{ev.title}</h1>

              <div className="ev-meta-strip">
                <div className="ev-meta-item"><Ico.Calendar /> {dateStr}</div>
                <div className="ev-meta-item"><Ico.Pin /> {ev.location}{ev.flag?` ${ev.flag}`:""}</div>
                <div className="ev-meta-item"><Ico.Users /> {ev.attendees}</div>
                <span className="ev-meta-sep" />
                <div style={{ fontSize:"0.75rem", color:"rgba(255,255,255,.5)" }}>par <span style={{ color:"rgba(255,255,255,.8)", fontWeight:600 }}>{ev.organizer}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* ════ BARRE ACTIONS ════ */}
        <div style={{ background:"#fff", borderBottom:"1px solid rgba(20,20,16,.07)", position:"sticky", top:62, zIndex:40 }}>
          <div className="ev-action-bar">
            <Link href="/evenements" className="ev-back-btn"><Ico.Arrow /> <span className="ev-back-label">Retour</span></Link>
            <div style={{ flex:1 }} />
            <button onClick={toggleSave} disabled={savingLoad} className="ev-bar-btn" style={{ background:saved?tc.bg:"transparent", color:saved?tc.color:"#928E80", borderColor:saved?tc.color:"rgba(20,20,16,.1)" }}>
              <Ico.Bookmark on={saved} /><span className="ev-btn-label">{savingLoad?"…":saved?"Sauvegardé":"Sauvegarder"}</span>
            </button>
            <button onClick={handleShare} className="ev-bar-btn">
              {copied?<Ico.Link />:<Ico.Share />}<span className="ev-btn-label">{copied?"Copié !":"Partager"}</span>
            </button>
            <a href={ev.event_url || "#inscription"} className="ev-register-pill" style={{ background:tc.color, boxShadow:`0 2px 10px ${tc.color}40` }}>S'inscrire</a>
          </div>
        </div>

        {/* ════ CORPS ════ */}
        <div style={{ background:"#F8F6F1", padding:"2.5rem 0 4rem" }}>
          <div className="ev-body-wrapper">
            <div className="ev-layout">

              <div className="ev-main">
                {/* <RevealWrapper>
                  <div className="ev-excerpt-card" style={{ borderTopColor:tc.color }}>
                    <p style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"1.05rem", fontWeight:400, fontStyle:"italic", color:"#38382E", lineHeight:1.7, margin:0 }}>{ev.excerpt}</p>
                  </div>
                </RevealWrapper> */}

                <div className="ev-blocks-card">
                  {blocks && blocks.length > 0
                    ? <RevealWrapper><BlockRenderer blocks={blocks} color={tc.color} bg={tc.bg} dark={tc.dark} contentSlug={ev.slug} /></RevealWrapper>
                    : <div style={{ padding:"2rem 0", textAlign:"center" }}><div style={{ fontSize:"2rem", marginBottom:"0.75rem" }}>📋</div><div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"1rem", fontWeight:700, color:"#141410", marginBottom:"0.5rem" }}>Détails à venir</div><div style={{ fontSize:"0.82rem", color:"#928E80" }}>Le programme complet sera publié prochainement.</div></div>
                  }
                </div>
              </div>

              {/* Sidebar */}
              <aside className="ev-sidebar" id="inscription">
                <div className="ev-cta-card" style={{ borderTopColor:tc.color }}>

                  <div className="ev-date-block" style={{ borderBottomColor:"rgba(20,20,16,.07)" }}>
                    <span style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"4rem", fontWeight:900, color:tc.color, lineHeight:1, display:"block" }}>{ev.day}</span>
                    <span style={{ fontSize:"0.85rem", fontWeight:700, color:"#928E80", letterSpacing:"0.06em", textTransform:"uppercase" }}>{ev.month} {ev.year}</span>
                  </div>

                  <div className="ev-info-list">
                    {[
                      { icon:"🏷️", label:"Type",         value:ev.type },
                      { icon:"📍", label:"Lieu",         value:`${ev.location}${ev.flag?` ${ev.flag}`:""}` },
                      { icon:"👥", label:"Participants", value:ev.attendees },
                      { icon:"🏛️", label:"Organisateur", value:ev.organizer },
                    ].map(item => (
                      <div key={item.label} style={{ display:"flex", gap:"0.75rem", alignItems:"flex-start" }}>
                        <span style={{ fontSize:"0.9rem", flexShrink:0 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize:"0.58rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#928E80", marginBottom:"0.1rem" }}>{item.label}</div>
                          <div style={{ fontSize:"0.85rem", color:"#38382E", fontWeight:500 }}>{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {ev.tags?.length > 0 && (
                  <div className="ev-tags-card">
                    <div className="ev-tags-label">Thématiques</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                      {ev.tags.map((tag: string) => <div key={tag} style={{ fontSize:"0.68rem", fontWeight:700, padding:"0.3rem 0.75rem", borderRadius:100, background:tc.bg, color:tc.color, border:`1px solid ${tc.color}20` }}>{tag}</div>)}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>

        {/* ════ ÉVÉNEMENTS LIÉS ════ */}
        {related.length > 0 && (
          <div style={{ padding:"4rem 0", background:"#F0EDE4" }}>
            <div className="ev-related-wrapper">
              <div style={{ fontSize:"0.6rem", fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", color:"#928E80", marginBottom:"0.5rem" }}>À ne pas manquer</div>
              <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(1.5rem,3vw,1.9rem)", fontWeight:900, letterSpacing:"-0.035em", marginBottom:"2rem", color:"#141410" }}>
                Autres <em style={{ fontStyle:"italic", color:tc.color, fontWeight:200 }}>événements</em>
              </h2>
              <div className="ev-related-grid">
                {related.map((r: any) => {
                  const rc = TYPE_COLOR[r.type] ?? TYPE_COLOR["Conférence"];
                  return (
                    <Link key={r.id} href={`/evenements/${r.slug}`} style={{ textDecoration:"none" }}>
                      <div className="ev-related-card"
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(-3px)"; el.style.boxShadow="0 8px 24px rgba(20,20,16,.1)"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="none"; el.style.boxShadow="0 1px 4px rgba(20,20,16,.05)"; }}>
                        <div style={{ background:rc.bg, borderBottom:`1px solid ${rc.color}20`, padding:"0.85rem 1.1rem" }}>
                          <div style={{ display:"flex", alignItems:"baseline", gap:"0.4rem" }}>
                            <span style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"2rem", fontWeight:900, color:rc.color, lineHeight:1 }}>{r.day}</span>
                            <div style={{ fontSize:"0.55rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#928E80", lineHeight:1.5 }}>{r.month}<br/>{r.year}</div>
                          </div>
                        </div>
                        <div style={{ padding:"0.9rem 1.1rem" }}>
                          <div style={{ fontSize:"0.56rem", fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:rc.color, marginBottom:"0.3rem" }}>{r.type}</div>
                          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"0.86rem", fontWeight:800, lineHeight:1.3, marginBottom:"0.5rem", color:"#141410" }}>{r.title}</div>
                          <div style={{ fontSize:"0.62rem", color:"#928E80" }}>📍 {r.location} {r.flag}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <NewsletterBand />
        <Footer />
      </main>
    </>
  );
}