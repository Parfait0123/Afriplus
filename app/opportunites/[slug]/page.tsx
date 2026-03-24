"use client";

/**
 * app/opportunites/[slug]/page.tsx
 * Page détail opportunité — données réelles Supabase
 * Design identique à l'original
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
import {
  BlockRenderer,
  SaveShareBar,
  CountdownBadge,
  SidebarInfoRow,
  SidebarCTAButton,
  TagsPill,
  RelatedSection,
  daysUntil,
  type ThemeColors,
  type RelatedItem,
} from "@/components/ui/DetailPageShared";
import ApplyButton from "@/components/ui/ApplyButton";
import type { Block } from "@/types/blocks";

/* ── Types ── */
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
  description: string | null;
  mission: string | null;
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

/* ── Couleurs par type d'opportunité ── */
const TYPE_COLOR: Record<string, ThemeColors> = {
  "Emploi CDI":  { color: "#1A5C40", bg: "#EAF4EF", dark: "#0F3828" },
  "Emploi":      { color: "#9B6B1A", bg: "#FBF4E8", dark: "#6B4A10" },
  "Stage":       { color: "#1E4DA8", bg: "#EBF0FB", dark: "#152F6B" },
  "Graduate":    { color: "#7A1E4A", bg: "#F9EBF3", dark: "#52122F" },
  "Freelance":   { color: "#B8341E", bg: "#FAEBE8", dark: "#8A2112" },
  "Volontariat": { color: "#928E80", bg: "#F0EDE4", dark: "#5C5A52" },
};

/* ── Icône retour ── */
const IcoArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

/* ════════════════════════════════════════════════════════
   EXPORT PAGE
════════════════════════════════════════════════════════ */
export default function OpportuniteDetailPage({ params }: { params: { slug: string } }) {
  return <OppClient slug={params.slug} />;
}

/* ════════════════════════════════════════════════════════
   COMPOSANT CLIENT
════════════════════════════════════════════════════════ */
function OppClient({ slug }: { slug: string }) {
  const sb = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const viewsIncremented = useRef(false);

  useEffect(() => {
    requestAnimationFrame(() => setHeroVisible(true));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Récupérer l'opportunité (avec gestion preview)
      let query = sb.from("opportunities").select("*").eq("slug", slug) as any;
      if (!isPreview) {
        query = query.eq("published", true);
      }
      const { data: opp, error: oppError } = await query.single();

      if (oppError || !opp) {
        console.error("Erreur chargement opportunité:", oppError);
        setError("Opportunité non trouvée");
        setLoading(false);
        return;
      }

      // Parser le contenu (JSONB stocké dans content)
      let parsedContent: Block[] = [];
      if (opp.content) {
        try {
          parsedContent = typeof opp.content === "string"
            ? JSON.parse(opp.content)
            : opp.content;
        } catch {
          parsedContent = [];
        }
      }

      const opportunityData: Opportunity = {
        id: opp.id,
        slug: opp.slug,
        title: opp.title,
        company: opp.company,
        company_initials: opp.company_initials || opp.company.slice(0, 2).toUpperCase(),
        location: opp.location || "",
        country: opp.country || "",
        flag: opp.flag || "🌍",
        type: opp.type as OpportunityType,
        sector: opp.sector || "",
        deadline: opp.deadline,
        remote: opp.remote || false,
        salary: opp.salary,
        description: opp.description,
        mission: opp.mission,
        content: parsedContent,
        cover_url: opp.cover_url,
        image_gradient: opp.image_gradient || `linear-gradient(135deg,${TYPE_COLOR[opp.type as OpportunityType]?.color || "#C08435"}22,#0a0800)`,
        skills: opp.skills || [],
        published: opp.published,
        views: opp.views || 0,
        apply_url: opp.apply_url,
        posted_at: opp.posted_at || opp.created_at,
        created_at: opp.created_at,
        updated_at: opp.updated_at,
      };

      setOpportunity(opportunityData);

      // 2. Incrémenter les vues (une seule fois, hors preview)
      if (!isPreview && !viewsIncremented.current) {
        viewsIncremented.current = true;
        try {
          const { error: rpcError } = await (sb as any).rpc(
            "increment_opportunity_views",
            { opportunity_id: opp.id }
          );
          if (rpcError) {
            await (sb as any)
              .from("opportunities")
              .update({ views: (opp.views || 0) + 1 })
              .eq("id", opp.id);
          }
        } catch (err) {
          console.error("Erreur incrémentation vues:", err);
        }
      }

      // 3. Récupérer les opportunités similaires (même type ou même secteur)
      let relatedQuery = sb
        .from("opportunities")
        .select("id,slug,title,type,sector,deadline,remote,salary,company,company_initials,location,country,flag,cover_url,image_gradient")
        .neq("id", opp.id)
        .or(`type.eq.${opp.type},sector.eq.${opp.sector}`)
        .limit(4)
        .order("created_at", { ascending: false });

      if (!isPreview) {
        relatedQuery = relatedQuery.eq("published", true);
      }

      const { data: relatedData } = await relatedQuery;

      if (relatedData) {
        setRelated(
          relatedData.map((s: any) => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            imageGradient: s.image_gradient,
            deadline: s.deadline,
            company: s.company,
            companyInitials: s.company_initials,
            type: s.type,
            sector: s.sector,
            location: s.location,
            flag: s.flag,
            salary: s.salary,
          }))
        );
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, [slug, isPreview, sb]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // État de chargement
  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ background: "#F0EDE4", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(20,20,16,.08)", borderTopColor: "#C08435", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ color: "#928E80" }}>Chargement de l'opportunité...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
        <Footer />
      </>
    );
  }

  // Erreur ou opportunité non trouvée
  if (error || !opportunity) {
    notFound();
  }

  const opp = opportunity;
  const tc = TYPE_COLOR[opp.type] ?? TYPE_COLOR["Emploi"];
  const blocks = opp.content ?? [];
  const daysLeft = daysUntil(opp.deadline);
  const isUrgent = daysLeft !== null && daysLeft <= 14;

  return (
    <>
      {/* Bandeau aperçu brouillon */}
      {isPreview && !opp.published && (
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
          👁 MODE APERÇU — Cette opportunité est un brouillon, non visible du public
          <Link
            href={`/admin/opportunites/${opp.id}`}
            style={{
              marginLeft: "1.5rem",
              color: "#fff",
              textDecoration: "underline",
              fontSize: "0.72rem",
            }}
          >
            ← Retour à l&apos;éditeur
          </Link>
        </div>
      )}

      <Navbar />

      <main style={{ paddingTop: isPreview && !opp.published ? 34 : 0 }}>
        {/* ════ HERO ════ */}
        <section style={{ position: "relative", overflow: "hidden", height: "clamp(460px, 64vh, 620px)", paddingTop: 64 }}>
          {/* Fond */}
          <div style={{ position: "absolute", inset: 0, background: opp.image_gradient, transform: heroVisible ? "scale(1)" : "scale(1.05)", transition: "transform 1.4s cubic-bezier(.25,.46,.45,.94)" }} />
          {/* Grain */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")" }} />
          {/* Overlays */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.65) 72%, rgba(0,0,0,.95) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, rgba(0,0,0,.55) 0%, transparent 55%)" }} />
          {/* Initiales déco */}
          <div aria-hidden="true" style={{ position: "absolute", top: "15%", right: "5%", fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(8rem,18vw,15rem)", fontWeight: 900, lineHeight: 1, color: "rgba(255,255,255,.04)", letterSpacing: "-0.06em", pointerEvents: "none", userSelect: "none" }}>
            {opp.company_initials}
          </div>
          {/* Cercles déco */}
          {[320, 180].map((size, i) => (
            <div key={i} style={{ position: "absolute", top: `${10 + i * 10}%`, right: `${8 + i * 6}%`, width: size, height: size, borderRadius: "50%", border: `1px solid rgba(255,255,255,${i === 0 ? .04 : .06})`, pointerEvents: "none" }} />
          ))}

          {/* Contenu hero */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(1.5rem, 5.5vw, 5rem)", maxWidth: 1100, margin: "0 auto", left: "50%", transform: "translateX(-50%)", width: "100%" }}>

            {/* Fil d'Ariane */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem", opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateY(8px)", transition: "opacity .7s .1s, transform .7s .1s" }}>
              <Link href="/opportunites" style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.45)"}>
                <IcoArrow /> Opportunités
              </Link>
              <span style={{ color: "rgba(255,255,255,.2)" }}>›</span>
              <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: tc.color }}>{opp.type}</span>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.35rem", opacity: heroVisible ? 1 : 0, transition: "opacity .7s .2s" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.28rem 0.85rem", borderRadius: 100, background: tc.color, color: "#fff" }}>{opp.type}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.28rem 0.85rem", borderRadius: 100, background: "rgba(255,255,255,.92)", color: isUrgent ? "#B8341E" : "#1A5C40" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: isUrgent ? "#B8341E" : "#1A5C40", animation: isUrgent ? "blink 1.4s ease-in-out infinite" : "none" }} />
                {isUrgent ? "Clôture imminente" : "Candidatures ouvertes"}
              </span>
              <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.28rem 0.85rem", borderRadius: 100, background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.16)", backdropFilter: "blur(8px)" }}>{opp.sector}</span>
              {opp.remote && (
                <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.28rem 0.85rem", borderRadius: 100, background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.16)", backdropFilter: "blur(8px)" }}>Remote possible</span>
              )}
            </div>

            {/* Titre */}
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(1.7rem, 4.5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08, color: "#F8F6F1", maxWidth: "22ch", marginBottom: "1.5rem", opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateY(20px)", transition: "opacity .9s .25s, transform .9s .25s" }}>
              {opp.title}
            </h1>

            {/* Méta */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", opacity: heroVisible ? 1 : 0, transition: "opacity .8s .4s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${tc.color}, ${tc.dark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 900, color: "#fff" }}>
                  {opp.company_initials}
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#F8F6F1" }}>{opp.company}</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,.42)" }}>{opp.flag} {opp.location}, {opp.country}</div>
                </div>
              </div>
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.14)", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,.38)", marginBottom: "0.15rem" }}>Date limite</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 800, color: isUrgent ? "#FF8A75" : "#F8F6F1" }}>
                  {new Date(opp.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  {daysLeft !== null && daysLeft > 0 && <span style={{ fontSize: "0.6rem", fontWeight: 600, color: daysLeft < 15 ? "#FF8A75" : "rgba(255,255,255,.45)", marginLeft: "0.6rem" }}>({daysLeft}j restants)</span>}
                  {daysLeft !== null && daysLeft <= 0 && <span style={{ fontSize: "0.6rem", color: "#FF8A75", marginLeft: "0.5rem" }}>Expiré</span>}
                </div>
              </div>
              {opp.salary && (
                <>
                  <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.14)", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,.38)", marginBottom: "0.15rem" }}>Rémunération</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#C08435" }}>{opp.salary}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ════ CORPS 2 colonnes ════ */}
        <div style={{ background: "#F8F6F1" }}>
          <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(1rem, 5vw, 4rem)" }}>
            <div className="bs-layout">

              {/* ── Contenu principal ── */}
              <div className="bs-main">
                <SaveShareBar
                  contentType="opportunity"
                  contentSlug={opp.slug}
                  contentTitle={opp.title}
                  contentMeta={{ deadline: opp.deadline, salary: opp.salary }}
                  color={tc.color}
                  bg={tc.bg}
                />
                <RevealWrapper>
                  <BlockRenderer blocks={blocks} color={tc.color} bg={tc.bg} dark={tc.dark} contentSlug={opp.slug} />
                </RevealWrapper>
              </div>

              {/* ── Sidebar ── */}
              <aside className="bs-sidebar">
                <div className="bs-cta-card" style={{ borderTopColor: tc.color }}>

                  {/* Compte à rebours */}
                  {daysLeft !== null && (
                    <CountdownBadge daysLeft={daysLeft} isUrgent={isUrgent} color={tc.color} bg={tc.bg} label={opp.company_initials} />
                  )}

                  {/* Infos clés */}
                  {[
                    { label: "Date limite",  value: new Date(opp.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }), bold: isUrgent, color: isUrgent ? "#B8341E" : tc.color },
                    { label: "Salaire",      value: opp.salary ?? "Non précisé",           bold: !!opp.salary, color: "#1A5C40" },
                    { label: "Type",         value: opp.type,                              bold: false },
                    { label: "Secteur",      value: opp.sector,                            bold: false },
                    { label: "Lieu",         value: `${opp.location}, ${opp.country}`,     bold: false },
                    { label: "Remote",       value: opp.remote ? "Possible" : "Sur site",  bold: false },
                    { label: "Publié le",    value: new Date(opp.posted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }), bold: false, color: "#928E80" },
                  ].map((row, i, arr) => (
                    <SidebarInfoRow key={row.label} label={row.label} value={row.value} bold={row.bold} color={row.color} last={i === arr.length - 1} />
                  ))}

                  {/* Bouton postuler */}
                  <SidebarCTAButton
                    href={opp.apply_url ? (opp.apply_url.startsWith("http") ? opp.apply_url : `https://${opp.apply_url}`) : "#"}
                    color={tc.color}
                    dark={tc.dark}
                    note="Candidature externe · Site officiel"
                  />
                </div>

                {/* Suivre sa candidature */}
                <div className="bs-sidebar-block">
                  <div className="bs-sidebar-label">Mon dossier</div>
                  <ApplyButton
                    contentType="opportunity"
                    contentSlug={opp.slug}
                    contentTitle={opp.title}
                    deadline={opp.deadline}
                    color={tc.color}
                  />
                </div>

                {/* Compétences */}
                <TagsPill items={opp.skills ?? []} color={tc.color} bg={tc.bg} label="Compétences clés" />
              </aside>
            </div>
          </div>
        </div>

        {/* ════ OFFRES SIMILAIRES ════ */}
        <RelatedSection
          items={related}
          basePath="/opportunites"
          singularLabel="opportunité"
          pluralLabel="opportunités"
          themeMap={item => TYPE_COLOR[item.type ?? "Emploi"] ?? TYPE_COLOR["Emploi"]}
        />

      </main>
      <NewsletterBand />
      <Footer />

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>
    </>
  );
}