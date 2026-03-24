"use client";

/**
 * app/bourses/[slug]/page.tsx
 * Page détail bourse — données réelles Supabase
 * Support preview brouillon, vues, saves, blocs de contenu
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
type Level = "Licence" | "Master" | "Doctorat" | "Postdoc" | "Toutes formations";

interface Scholarship {
  id: string;
  slug: string;
  title: string;
  organization: string;
  country: string;
  flag: string;
  level: Level;
  domain: string;
  deadline: string;
  urgent: boolean;
  amount: string | null;
  content: Block[];
  cover_url: string | null;
  image_gradient: string;
  tags: string[];
  published: boolean;
  views: number;
  saves_count: number;
  meta_title: string | null;
  meta_desc: string | null;
  apply_url: string | null;  // ← AJOUTÉ
  created_at: string;
  updated_at: string;
}

// Type pour la réponse brute de Supabase
interface SupabaseScholarship {
  id: string;
  slug: string;
  title: string;
  organization: string;
  country: string;
  flag: string;
  level: Level;
  domain: string;
  deadline: string;
  urgent: boolean;
  amount: string | null;
  content: string | Block[] | null;
  cover_url: string | null;
  image_gradient: string | null;
  tags: string[] | null;
  published: boolean;
  views: number | null;
  saves_count: number | null;
  meta_title: string | null;
  meta_desc: string | null;
  apply_url: string | null;  // ← AJOUTÉ
  created_at: string;
  updated_at: string;
}

/* ── Couleurs par niveau ── */
const LEVEL_COLOR: Record<string, ThemeColors> = {
  Licence: { color: "#1E4DA8", bg: "#EBF0FB", dark: "#152F6B" },
  Master: { color: "#1A5C40", bg: "#EAF4EF", dark: "#0F3828" },
  Doctorat: { color: "#7A4A1E", bg: "#FDF3E8", dark: "#5C3212" },
  Postdoc: { color: "#2D6B6B", bg: "#E6F4F4", dark: "#0F3838" },
  "Toutes formations": { color: "#C08435", bg: "#FBF4E8", dark: "#7A4F0E" },
};

/* ── Icône retour ── */
const IcoArrow = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

/* ════════════════════════════════════════════════════════
   EXPORT PAGE
════════════════════════════════════════════════════════ */
export default function BourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return <BourseClient slug={params.slug} />;
}

/* ════════════════════════════════════════════════════════
   COMPOSANT CLIENT
════════════════════════════════════════════════════════ */
function BourseClient({ slug }: { slug: string }) {
  const sb = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
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
      // 1. Récupérer la bourse (avec gestion preview)
      let query = sb.from("scholarships").select("*").eq("slug", slug) as any;
      if (!isPreview) {
        query = query.eq("published", true);
      }
      const { data: bourse, error: bourseError } = await query.single();

      if (bourseError || !bourse) {
        console.error("Erreur chargement bourse:", bourseError);
        setError("Bourse non trouvée");
        setLoading(false);
        return;
      }

      // Parser le contenu (JSONB stocké dans content)
      let parsedContent: Block[] = [];
      if (bourse.content) {
        try {
          parsedContent =
            typeof bourse.content === "string"
              ? JSON.parse(bourse.content)
              : bourse.content;
        } catch {
          parsedContent = [];
        }
      }

      const scholarshipData: Scholarship = {
        id: bourse.id,
        slug: bourse.slug,
        title: bourse.title,
        organization: bourse.organization,
        country: bourse.country || "",
        flag: bourse.flag || "🌍",
        level: bourse.level,
        domain: bourse.domain || "Toutes disciplines",
        deadline: bourse.deadline,
        urgent: bourse.urgent || false,
        amount: bourse.amount,
        content: parsedContent,
        cover_url: bourse.cover_url,
        image_gradient:
          bourse.image_gradient ||
          `linear-gradient(135deg,${LEVEL_COLOR[bourse.level]?.color || "#C08435"}22,#0a0800)`,
        tags: bourse.tags || [],
        published: bourse.published,
        views: bourse.views || 0,
        saves_count: bourse.saves_count || 0,
        meta_title: bourse.meta_title,
        meta_desc: bourse.meta_desc,
        apply_url: bourse.apply_url,  // ← AJOUTÉ
        created_at: bourse.created_at,
        updated_at: bourse.updated_at,
      };

      setScholarship(scholarshipData);

      // 2. Incrémenter les vues (une seule fois, hors preview)
      if (!isPreview && !viewsIncremented.current) {
        viewsIncremented.current = true;
        try {
          // Essayer d'utiliser la RPC si elle existe
          const { error: rpcError } = await (sb as any).rpc(
            "increment_scholarship_views",
            { scholarship_id: bourse.id }
          );
          if (rpcError) {
            // Fallback: mise à jour directe
            await (sb as any)
              .from("scholarships")
              .update({ views: ((bourse as any).views ?? 0) + 1 })
              .eq("id", bourse.id);
          }
        } catch (err) {
          console.error("Erreur incrémentation vues:", err);
        }
      }

      // 3. Récupérer les bourses similaires (même niveau ou même domaine)
      let relatedQuery = sb
        .from("scholarships")
        .select(
          "id,slug,title,level,domain,deadline,urgent,amount,country,flag,organization,cover_url,image_gradient"
        )
        .neq("id", bourse.id)
        .or(`level.eq.${bourse.level},domain.eq.${bourse.domain}`)
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
            flag: s.flag,
            country: s.country,
            organization: s.organization,
            level: s.level,
            amount: s.amount,
            urgent: s.urgent,
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
        <main
          style={{
            background: "#F0EDE4",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid rgba(20,20,16,.08)",
                borderTopColor: "#C08435",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 1rem",
              }}
            />
            <p style={{ color: "#928E80" }}>Chargement de la bourse...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
        <Footer />
      </>
    );
  }

  // Erreur ou bourse non trouvée
  if (error || !scholarship) {
    notFound();
  }

  const sc = scholarship;
  const lc = LEVEL_COLOR[sc.level] ?? LEVEL_COLOR["Master"];
  const blocks = sc.content ?? [];
  const daysLeft = daysUntil(sc.deadline);
  const isUrgent = sc.urgent ?? (daysLeft !== null && daysLeft <= 14);
  const urgentColor = isUrgent ? "#B8341E" : "#1A5C40";

  return (
    <>
      {/* Bandeau aperçu brouillon */}
      {isPreview && !sc.published && (
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
          👁 MODE APERÇU — Cette bourse est un brouillon, non visible du public
          <Link
            href={`/admin/bourses/${sc.id}`}
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

      <main style={{ paddingTop: isPreview && !sc.published ? 34 : 0 }}>
        {/* ════ HERO ════ */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            height: "clamp(460px, 64vh, 620px)",
            paddingTop: 64,
          }}
        >
          {/* Fond */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: sc.image_gradient,
              transform: heroVisible ? "scale(1)" : "scale(1.05)",
              transition: "transform 1.4s cubic-bezier(.25,.46,.45,.94)",
            }}
          />
          {/* Grain */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.5,
              pointerEvents: "none",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
            }}
          />
          {/* Overlays */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.65) 72%, rgba(0,0,0,.95) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(100deg, rgba(0,0,0,.55) 0%, transparent 55%)",
            }}
          />
          {/* Cercles déco */}
          {[320, 180].map((size, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${10 + i * 10}%`,
                right: `${8 + i * 6}%`,
                width: size,
                height: size,
                borderRadius: "50%",
                border: `1px solid rgba(255,255,255,${i === 0 ? 0.04 : 0.06})`,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Contenu hero */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "clamp(1.5rem, 5.5vw, 5rem)",
              maxWidth: 1100,
              margin: "0 auto",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
            }}
          >
            {/* Fil d'Ariane */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.75rem",
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "none" : "translateY(8px)",
                transition: "opacity .7s .1s, transform .7s .1s",
              }}
            >
              <Link
                href="/bourses"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.45)",
                  textDecoration: "none",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,.45)")
                }
              >
                <IcoArrow /> Bourses
              </Link>
              <span style={{ color: "rgba(255,255,255,.2)" }}>›</span>
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: lc.color,
                }}
              >
                {sc.level}
              </span>
            </div>

            {/* Badges */}
            <div
              style={{
                display: "flex",
                gap: "0.6rem",
                flexWrap: "wrap",
                marginBottom: "1.35rem",
                opacity: heroVisible ? 1 : 0,
                transition: "opacity .7s .2s",
              }}
            >
              <span
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "0.28rem 0.85rem",
                  borderRadius: 100,
                  background: lc.color,
                  color: "#fff",
                }}
              >
                {sc.level}
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "0.28rem 0.85rem",
                  borderRadius: 100,
                  background: "rgba(255,255,255,.92)",
                  color: urgentColor,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: urgentColor,
                    flexShrink: 0,
                    animation: isUrgent
                      ? "blink 1.4s ease-in-out infinite"
                      : "none",
                  }}
                />
                {isUrgent ? "Clôture imminente" : "Candidatures ouvertes"}
              </span>
              <span
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "0.28rem 0.85rem",
                  borderRadius: 100,
                  background: "rgba(255,255,255,.12)",
                  color: "rgba(255,255,255,.8)",
                  border: "1px solid rgba(255,255,255,.16)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {sc.domain}
              </span>
            </div>

            {/* Titre */}
            <h1
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(1.7rem, 4.5vw, 3.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1.08,
                color: "#F8F6F1",
                maxWidth: "22ch",
                marginBottom: "1.5rem",
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "none" : "translateY(20px)",
                transition: "opacity .9s .25s, transform .9s .25s",
              }}
            >
              {sc.title}
            </h1>

            {/* Méta */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                flexWrap: "wrap",
                opacity: heroVisible ? 1 : 0,
                transition: "opacity .8s .4s",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: `linear-gradient(135deg, ${lc.color}, ${lc.dark})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 900,
                    color: "#fff",
                  }}
                >
                  {sc.organization.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#F8F6F1",
                    }}
                  >
                    {sc.organization}
                  </div>
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color: "rgba(255,255,255,.42)",
                    }}
                  >
                    {sc.flag} {sc.country}
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: 1,
                  height: 28,
                  background: "rgba(255,255,255,.14)",
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.38)",
                    marginBottom: "0.15rem",
                  }}
                >
                  Date limite
                </div>
                <div
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 800,
                    color: isUrgent ? "#FF8A75" : "#F8F6F1",
                  }}
                >
                  {new Date(sc.deadline).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {daysLeft !== null && daysLeft > 0 && (
                    <span
                      style={{
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        color:
                          daysLeft < 15 ? "#FF8A75" : "rgba(255,255,255,.45)",
                        marginLeft: "0.6rem",
                      }}
                    >
                      ({daysLeft}j restants)
                    </span>
                  )}
                  {daysLeft !== null && daysLeft <= 0 && (
                    <span
                      style={{
                        fontSize: "0.6rem",
                        color: "#FF8A75",
                        marginLeft: "0.5rem",
                      }}
                    >
                      Expiré
                    </span>
                  )}
                </div>
              </div>
              {sc.amount && (
                <>
                  <div
                    style={{
                      width: 1,
                      height: 28,
                      background: "rgba(255,255,255,.14)",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,.38)",
                        marginBottom: "0.15rem",
                      }}
                    >
                      Financement
                    </div>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 800,
                        color: "#C08435",
                      }}
                    >
                      {sc.amount}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ════ CORPS 2 colonnes ════ */}
        <div style={{ background: "#F8F6F1" }}>
          <div
            style={{
              maxWidth: 1340,
              margin: "0 auto",
              padding: "0 clamp(1rem, 5vw, 4rem)",
            }}
          >
            <div className="bs-layout">
              {/* ── Contenu principal ── */}
              <div className="bs-main">
                <SaveShareBar
                  contentType="scholarship"
                  contentSlug={sc.slug}
                  contentTitle={sc.title}
                  contentMeta={{ deadline: sc.deadline, amount: sc.amount }}
                  color={lc.color}
                  bg={lc.bg}
                />
                <RevealWrapper>
                  <BlockRenderer
                    blocks={blocks}
                    color={lc.color}
                    bg={lc.bg}
                    dark={lc.dark}
                    contentSlug={sc.slug}
                  />
                </RevealWrapper>
              </div>

              {/* ── Sidebar ── */}
              <aside className="bs-sidebar">
                <div
                  className="bs-cta-card"
                  style={{ borderTopColor: lc.color }}
                >
                  {/* Compte à rebours */}
                  {daysLeft !== null && (
                    <CountdownBadge
                      daysLeft={daysLeft}
                      isUrgent={isUrgent}
                      color={lc.color}
                      bg={lc.bg}
                      label={sc.flag}
                    />
                  )}

                  {/* Infos clés */}
                  {[
                    {
                      label: "Date limite",
                      value: new Date(sc.deadline).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }),
                      bold: isUrgent,
                      color: isUrgent ? "#B8341E" : lc.color,
                    },
                    {
                      label: "Financement",
                      value: sc.amount ?? "Non précisé",
                      bold: true,
                      color: "#1A5C40",
                    },
                    { label: "Niveau", value: sc.level, bold: false },
                    { label: "Domaine", value: sc.domain, bold: false },
                    {
                      label: "Destination",
                      value: `${sc.flag} ${sc.country}`,
                      bold: false,
                    },
                    {
                      label: "Organisateur",
                      value: sc.organization,
                      bold: false,
                    },
                  ].map((row, i, arr) => (
                    <SidebarInfoRow
                      key={row.label}
                      label={row.label}
                      value={row.value}
                      bold={row.bold}
                      color={row.color}
                      last={i === arr.length - 1}
                    />
                  ))}

                  {/* Bouton postuler — URL réelle depuis la base */}
                  <SidebarCTAButton
                    href={sc.apply_url || `/candidature?bourse=${sc.slug}`}
                    color={lc.color}
                    dark={lc.dark}
                    note="Candidature en ligne · Dossier à constituer"
                  />
                </div>

                {/* Suivre sa candidature */}
                <div className="bs-sidebar-block">
                  <div className="bs-sidebar-label">Mon dossier</div>
                  <ApplyButton
                    contentType="scholarship"
                    contentSlug={sc.slug}
                    contentTitle={sc.title}
                    deadline={sc.deadline}
                    color={lc.color}
                  />
                </div>

                {/* Tags */}
                {sc.tags && sc.tags.length > 0 && (
                  <TagsPill
                    items={sc.tags}
                    color={lc.color}
                    bg={lc.bg}
                    label="Tags"
                  />
                )}
              </aside>
            </div>
          </div>
        </div>
        <div style={{ height: 24 }} /> {/* Espace avant related */}
        {/* ════ BOURSES SIMILAIRES ════ */}
        {related.length > 0 && (
          <RelatedSection
            items={related}
            basePath="/bourses"
            singularLabel="bourse"
            pluralLabel="bourses"
            themeMap={(item) =>
              LEVEL_COLOR[item.level ?? "Master"] ?? LEVEL_COLOR["Master"]
            }
          />
        )}
      </main>
      <NewsletterBand />
      <Footer />

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>
    </>
  );
}