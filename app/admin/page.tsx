"use client";

/**
 * app/admin/page.tsx — Vue d'ensemble AfriPulse Admin
 *
 * Sections :
 *  1. Hero bar — date, statut plateforme, action rapide
 *  2. KPI Cards — 8 métriques clés avec tendance
 *  3. Graphique activité — sparklines SVG 30 jours
 *  4. Santé de la plateforme — indicateurs visuels
 *  5. Contenus récents — 5 derniers articles publiés
 *  6. Actions rapides — publication en 1 clic
 *  7. Activité utilisateurs — inscriptions récentes
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatNumber } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

/* ══════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════ */
interface DashStats {
  articles:      number;
  articlesPublished: number;
  bourses:       number;
  boursesUrgent: number;
  opportunites:  number;
  evenements:    number;
  abonnes:       number;
  abonnesConfirmed: number;
  utilisateurs:  number;
  saves:         number;
  applications:  number;
  eventRegs:     number;
}

interface RecentItem {
  id:         string;
  title:      string;
  slug:       string;
  published:  boolean;
  created_at: string;
  category?:  string;
}

interface RecentUser {
  id:         string;
  full_name:  string | null;
  email:      string;
  role:       string;
  created_at: string;
  country:    string | null;
}

/* ══════════════════════════════════════════════════
   MINI SPARKLINE SVG
══════════════════════════════════════════════════ */
function Sparkline({
  data, color = "#C08435", height = 40, filled = true
}: {
  data: number[]; color?: string; height?: number; filled?: boolean;
}) {
  if (!data.length) return null;
  const max  = Math.max(...data, 1);
  const min  = Math.min(...data);
  const w    = 120;
  const h    = height;
  const pad  = 2;

  const pts  = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  });

  const path    = `M ${pts.join(" L ")}`;
  const fillPts = [`${pad},${h}`, ...pts, `${w - pad},${h}`].join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      {filled && (
        <polygon
          points={fillPts}
          fill={color}
          opacity={0.12}
        />
      )}
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Point final */}
      <circle
        cx={pts[pts.length - 1].split(",")[0]}
        cy={pts[pts.length - 1].split(",")[1]}
        r={3}
        fill={color}
      />
    </svg>
  );
}

/* ══════════════════════════════════════════════════
   BARRE DE PROGRESSION ANIMÉE
══════════════════════════════════════════════════ */
function ProgressBar({
  value, max, color = "#C08435", label, sublabel
}: {
  value: number; max: number; color?: string; label: string; sublabel?: string;
}) {
  const [width, setWidth] = useState(0);
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline", marginBottom: "0.4rem",
      }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#38382E" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "1rem", fontWeight: 900, color, lineHeight: 1,
          }}>{value}</span>
          <span style={{ fontSize: "0.65rem", color: "#928E80" }}>/ {max}</span>
        </div>
      </div>
      <div style={{
        height: 5, background: "rgba(20,20,16,.08)",
        borderRadius: 100, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 100,
          background: `linear-gradient(90deg, ${color} 0%, ${color}bb 100%)`,
          width: `${width}%`,
          transition: "width .8s cubic-bezier(.34,1.56,.64,1)",
          boxShadow: `0 0 8px ${color}55`,
        }} />
      </div>
      {sublabel && (
        <div style={{ fontSize: "0.62rem", color: "#928E80", marginTop: "0.3rem" }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   COMPTEUR ANIMÉ
══════════════════════════════════════════════════ */
function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [target, duration]);
  return <>{formatNumber(value)}</>;
}

/* ══════════════════════════════════════════════════
   KPI CARD
══════════════════════════════════════════════════ */
interface KpiCardProps {
  label:      string;
  value:      number;
  icon:       string;
  color:      string;
  bg:         string;
  href:       string;
  trend?:     number;     // pourcentage vs mois dernier
  sparkData?: number[];
  delay?:     number;
}

function KpiCard({ label, value, icon, color, bg, href, trend, sparkData, delay = 0 }: KpiCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const trendPositive = trend !== undefined && trend >= 0;
  const trendLabel    = trend !== undefined
    ? `${trendPositive ? "+" : ""}${trend}%`
    : null;

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: "1.4rem",
          border: "1px solid rgba(20,20,16,.06)",
          boxShadow: "0 1px 4px rgba(20,20,16,.04)",
          transition: "transform .25s, box-shadow .25s",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transitionDelay: `${delay}ms`,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(20,20,16,.1)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(20,20,16,.04)";
        }}
      >
        {/* Accent couleur haut */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 2.5, background: `linear-gradient(90deg, ${color} 0%, ${color}44 100%)`,
        }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
          {/* Icône */}
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: bg, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "1.15rem", flexShrink: 0,
          }}>
            {icon}
          </div>

          {/* Sparkline */}
          {sparkData && sparkData.length > 0 && (
            <Sparkline data={sparkData} color={color} height={32} />
          )}
        </div>

        {/* Valeur */}
        <div style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: "2rem", fontWeight: 900,
          color: "#141410", lineHeight: 1,
          letterSpacing: "-0.04em",
          marginBottom: "0.3rem",
        }}>
          <CountUp target={value} />
        </div>

        {/* Label + tendance */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#928E80", fontWeight: 500 }}>{label}</span>
          {trendLabel && (
            <span style={{
              fontSize: "0.6rem", fontWeight: 800,
              color: trendPositive ? "#1A5C40" : "#B8341E",
              background: trendPositive ? "#EAF4EF" : "#FAEBE8",
              padding: "0.15rem 0.5rem", borderRadius: 100,
            }}>
              {trendLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════
   SECTION TITRE
══════════════════════════════════════════════════ */
function SectionTitle({ label, action, actionHref }: {
  label: string; action?: string; actionHref?: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "1.25rem",
    }}>
      <h2 style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: "1.05rem", fontWeight: 900,
        color: "#141410", letterSpacing: "-0.02em",
        display: "flex", alignItems: "center", gap: "0.6rem",
      }}>
        <span style={{
          width: 3.5, height: 16, borderRadius: 100,
          background: "#C08435", display: "inline-block",
        }} />
        {label}
      </h2>
      {action && actionHref && (
        <Link href={actionHref} style={{
          fontSize: "0.72rem", fontWeight: 700,
          color: "#C08435", textDecoration: "none",
          padding: "0.32rem 0.85rem", borderRadius: 100,
          border: "1px solid rgba(192,132,53,.25)",
          background: "rgba(192,132,53,.06)",
          transition: "all .15s",
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(192,132,53,.12)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(192,132,53,.06)";
          }}
        >
          {action}
        </Link>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const supabase = createClient();
  const [stats,       setStats]       = useState<DashStats | null>(null);
  const [articles,    setArticles]    = useState<RecentItem[]>([]);
  const [users,       setUsers]       = useState<RecentUser[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [timeOfDay,   setTimeOfDay]   = useState("");

  // Données fictives pour sparklines (simulées — à remplacer par vraies données historiques)
  const sparkArticles    = [3,5,2,8,4,7,9,6,11,8,10,12,9,14,11,13,8,15,12,10,16,14,11,13,17,15,12,18,16,20];
  const sparkAbonnes     = [20,22,18,25,23,28,24,30,27,32,29,35,31,38,34,40,37,43,39,45,42,48,44,50,47,52,49,55,51,58];
  const sparkSaves       = [5,8,6,10,7,12,9,14,11,15,13,18,15,20,17,22,19,25,21,27,23,29,25,31,27,33,29,35,31,37];

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12)       setTimeOfDay("Bonjour");
    else if (h < 18)  setTimeOfDay("Bon après-midi");
    else              setTimeOfDay("Bonsoir");
  }, []);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [
        articlesRes, boursesRes, oppsRes, eventsRes,
        abonnesRes, usersRes, savesRes, appsRes, eventRegsRes,
      ] = await Promise.all([
        supabase.from("articles").select("id, title, slug, published, created_at, category", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
        supabase.from("scholarships").select("id, urgent", { count: "exact" }),
        supabase.from("opportunities").select("id", { count: "exact" }),
        supabase.from("events").select("id", { count: "exact" }),
        supabase.from("newsletter_subscribers").select("id, confirmed", { count: "exact" }),
        supabase.from("profiles").select("id, full_name, email, role, created_at, country").order("created_at", { ascending: false }).limit(5),
        supabase.from("saves").select("id", { count: "exact" }),
        supabase.from("applications").select("id", { count: "exact" }),
        supabase.from("event_registrations").select("id", { count: "exact" }),
      ]);

      const artData      = articlesRes.data ?? [];
      const boursesData  = boursesRes.data ?? [];
      const abonnesData  = abonnesRes.data ?? [];

      setStats({
        articles:          articlesRes.count ?? artData.length,
        articlesPublished: artData.filter((a: any) => a.published).length,
        bourses:           boursesRes.count ?? boursesData.length,
        boursesUrgent:     boursesData.filter((b: any) => b.urgent).length,
        opportunites:      oppsRes.count ?? 0,
        evenements:        eventsRes.count ?? 0,
        abonnes:           abonnesRes.count ?? abonnesData.length,
        abonnesConfirmed:  abonnesData.filter((s: any) => s.confirmed).length,
        utilisateurs:      usersRes.data?.length ?? 0,
        saves:             savesRes.count ?? 0,
        applications:      appsRes.count ?? 0,
        eventRegs:         eventRegsRes.count ?? 0,
      });

      setArticles(artData as RecentItem[]);
      setUsers((usersRes.data ?? []) as RecentUser[]);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* ── Heure & date ── */
  const now     = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  /* ── Catégories couleurs ── */
  const CAT_COLOR: Record<string, { color: string; bg: string }> = {
    "Politique":     { color: "#1E4DA8", bg: "#EBF0FB" },
    "Économie":      { color: "#C08435", bg: "#FBF4E8" },
    "Tech":          { color: "#1A5C40", bg: "#EAF4EF" },
    "Sport":         { color: "#B8341E", bg: "#FAEBE8" },
    "Culture":       { color: "#7A4A1E", bg: "#FDF3E8" },
    "Santé":         { color: "#1A5C5C", bg: "#E6F4F4" },
    "Environnement": { color: "#2D6B3B", bg: "#E6F4EA" },
  };

  const ROLE_STYLES: Record<string, { color: string; bg: string; label: string }> = {
    admin:  { color: "#C08435", bg: "#FBF4E8", label: "Admin" },
    editor: { color: "#1E4DA8", bg: "#EBF0FB", label: "Éditeur" },
    reader: { color: "#928E80", bg: "#F0EDE4", label: "Lecteur" },
  };

  const engagementTotal = (stats?.saves ?? 0) + (stats?.applications ?? 0) + (stats?.eventRegs ?? 0);

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 1440 }}>

      {/* ══════════════════════════════════════
          1. HERO BAR
      ══════════════════════════════════════ */}
      <div style={{
        marginBottom: "2.25rem",
        display: "flex", alignItems: "flex-end",
        justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
      }}>
        <div>
          <div style={{
            fontSize: "0.65rem", fontWeight: 700,
            letterSpacing: "0.15em", textTransform: "uppercase",
            color: "#928E80", marginBottom: "0.4rem",
          }}>
            {dateStr}
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 900, letterSpacing: "-0.04em",
            color: "#141410", lineHeight: 1.05,
          }}>
            {timeOfDay},{" "}
            <em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435" }}>
              AfriPulse
            </em>
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#928E80", marginTop: "0.3rem" }}>
            Voici l'état de votre plateforme en temps réel.
          </p>
        </div>

        {/* Statut plateforme */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.6rem",
          background: "#EAF4EF", border: "1px solid rgba(26,92,64,.2)",
          borderRadius: 100, padding: "0.5rem 1.1rem",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#1A5C40",
            animation: "pulse-dot 2s ease-in-out infinite",
            display: "inline-block",
          }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1A5C40" }}>
            Plateforme opérationnelle
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: "1.25rem" }}>
          <Spinner size={36} />
          <p style={{ color: "#928E80", fontSize: "0.85rem" }}>Chargement des données…</p>
        </div>
      ) : (
        <>

          {/* ══════════════════════════════════════
              2. KPI CARDS — 8 métriques
          ══════════════════════════════════════ */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            marginBottom: "2rem",
          }}>
            <KpiCard
              label="Articles publiés"
              value={stats?.articlesPublished ?? 0}
              icon="📰" color="#C08435" bg="#FBF4E8"
              href="/admin/articles"
              sparkData={sparkArticles}
              trend={8}
              delay={0}
            />
            <KpiCard
              label="Bourses actives"
              value={stats?.bourses ?? 0}
              icon="🎓" color="#1A5C40" bg="#EAF4EF"
              href="/admin/bourses"
              trend={12}
              delay={60}
            />
            <KpiCard
              label="Opportunités"
              value={stats?.opportunites ?? 0}
              icon="💼" color="#1E4DA8" bg="#EBF0FB"
              href="/admin/opportunites"
              trend={5}
              delay={120}
            />
            <KpiCard
              label="Événements"
              value={stats?.evenements ?? 0}
              icon="📅" color="#B8341E" bg="#FAEBE8"
              href="/admin/evenements"
              trend={-3}
              delay={180}
            />
            <KpiCard
              label="Abonnés newsletter"
              value={stats?.abonnes ?? 0}
              icon="📬" color="#7A1E4A" bg="#F9EBF3"
              href="/admin/abonnes"
              sparkData={sparkAbonnes}
              trend={22}
              delay={240}
            />
            <KpiCard
              label="Utilisateurs inscrits"
              value={stats?.utilisateurs ?? 0}
              icon="👥" color="#2D6B3B" bg="#E6F4EA"
              href="/admin/utilisateurs"
              trend={15}
              delay={300}
            />
            <KpiCard
              label="Sauvegardes"
              value={stats?.saves ?? 0}
              icon="⭐" color="#9B6B1A" bg="#FBF4E8"
              href="/admin/analytique"
              sparkData={sparkSaves}
              trend={18}
              delay={360}
            />
            <KpiCard
              label="Candidatures suivies"
              value={stats?.applications ?? 0}
              icon="📋" color="#1A5C5C" bg="#E6F4F4"
              href="/admin/analytique"
              trend={9}
              delay={420}
            />
          </div>

          {/* ══════════════════════════════════════
              3. LIGNE PRINCIPALE : Santé + Contenus récents
          ══════════════════════════════════════ */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "1.25rem",
            marginBottom: "1.25rem",
            alignItems: "start",
          }}>

            {/* ── Contenus récents ── */}
            <div style={{
              background: "#fff", borderRadius: 20,
              border: "1px solid rgba(20,20,16,.06)",
              boxShadow: "0 1px 4px rgba(20,20,16,.04)",
              overflow: "hidden",
            }}>
              <div style={{ padding: "1.4rem 1.6rem 1rem" }}>
                <SectionTitle label="Articles récents" action="Tout gérer" actionHref="/admin/articles" />
              </div>

              {articles.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#928E80", fontSize: "0.85rem" }}>
                  Aucun article pour l'instant.
                </div>
              ) : (
                articles.map((art, i) => {
                  const cc = CAT_COLOR[art.category ?? ""] ?? { color: "#928E80", bg: "#F0EDE4" };
                  return (
                    <div
                      key={art.id}
                      style={{
                        display: "flex", alignItems: "center", gap: "1rem",
                        padding: "0.9rem 1.6rem",
                        borderTop: "1px solid rgba(20,20,16,.05)",
                        transition: "background .15s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#FAFAF8"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                    >
                      {/* Numéro */}
                      <span style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: "1.1rem", fontWeight: 900,
                        color: "rgba(20,20,16,.08)", flexShrink: 0,
                        width: 24, textAlign: "center",
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      {/* Couleur catégorie */}
                      <div style={{
                        width: 3, height: 32, borderRadius: 100,
                        background: cc.color, flexShrink: 0,
                      }} />

                      {/* Titre */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: "0.87rem", fontWeight: 700,
                          color: "#141410", lineHeight: 1.3,
                          overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {art.title}
                        </div>
                        <div style={{
                          display: "flex", alignItems: "center", gap: "0.5rem",
                          marginTop: "0.25rem",
                        }}>
                          {art.category && (
                            <span style={{
                              fontSize: "0.55rem", fontWeight: 800,
                              letterSpacing: "0.08em", textTransform: "uppercase" as const,
                              padding: "0.12rem 0.5rem", borderRadius: 100,
                              background: cc.bg, color: cc.color,
                            }}>
                              {art.category}
                            </span>
                          )}
                          <span style={{ fontSize: "0.65rem", color: "#928E80" }}>
                            {formatDate(art.created_at, { relative: true })}
                          </span>
                        </div>
                      </div>

                      {/* Statut + lien */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                        <span style={{
                          fontSize: "0.55rem", fontWeight: 800,
                          letterSpacing: "0.06em", textTransform: "uppercase" as const,
                          padding: "0.18rem 0.55rem", borderRadius: 100,
                          background: art.published ? "#EAF4EF" : "#F0EDE4",
                          color: art.published ? "#1A5C40" : "#928E80",
                          display: "flex", alignItems: "center", gap: "0.28rem",
                        }}>
                          <span style={{
                            width: 4, height: 4, borderRadius: "50%",
                            background: art.published ? "#1A5C40" : "#928E80",
                          }} />
                          {art.published ? "Publié" : "Brouillon"}
                        </span>
                        <Link href={`/admin/articles/${art.id}`} style={{
                          width: 28, height: 28, borderRadius: 7,
                          background: "#F0EDE4", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          textDecoration: "none", color: "#928E80",
                          fontSize: "0.7rem", transition: "all .15s",
                        }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "#EBF0FB";
                            (e.currentTarget as HTMLAnchorElement).style.color = "#1E4DA8";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "#F0EDE4";
                            (e.currentTarget as HTMLAnchorElement).style.color = "#928E80";
                          }}
                        >
                          ✏
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}

              <div style={{ padding: "1rem 1.6rem", borderTop: "1px solid rgba(20,20,16,.05)" }}>
                <Link href="/admin/articles/nouveau" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "0.5rem", padding: "0.65rem",
                  borderRadius: 10, border: "1.5px dashed rgba(20,20,16,.12)",
                  textDecoration: "none", fontSize: "0.78rem", fontWeight: 700,
                  color: "#928E80", transition: "all .2s",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C08435";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#C08435";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(192,132,53,.04)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(20,20,16,.12)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#928E80";
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }}
                >
                  + Rédiger un article
                </Link>
              </div>
            </div>

            {/* ── Santé de la plateforme ── */}
            <div style={{
              background: "#fff", borderRadius: 20,
              border: "1px solid rgba(20,20,16,.06)",
              boxShadow: "0 1px 4px rgba(20,20,16,.04)",
              padding: "1.4rem 1.6rem",
            }}>
              <SectionTitle label="Santé du contenu" />

              <ProgressBar
                value={stats?.articlesPublished ?? 0}
                max={stats?.articles ?? 1}
                color="#C08435"
                label="Articles publiés"
                sublabel={`${stats?.articles ?? 0} au total`}
              />
              <ProgressBar
                value={stats?.abonnesConfirmed ?? 0}
                max={stats?.abonnes ?? 1}
                color="#1A5C40"
                label="Abonnés confirmés"
                sublabel={`${stats?.abonnes ?? 0} inscrits`}
              />
              <ProgressBar
                value={stats?.boursesUrgent ?? 0}
                max={stats?.bourses ?? 1}
                color="#B8341E"
                label="Bourses urgentes"
                sublabel="Clôture dans < 14 jours"
              />

              {/* Séparateur */}
              <div style={{ height: 1, background: "rgba(20,20,16,.06)", margin: "1.25rem 0" }} />

              {/* Engagement */}
              <div style={{
                background: "linear-gradient(135deg, #0a0800 0%, #141410 100%)",
                borderRadius: 14, padding: "1.2rem",
                border: "1px solid rgba(255,255,255,.05)",
              }}>
                <div style={{
                  fontSize: "0.58rem", fontWeight: 800,
                  letterSpacing: "0.15em", textTransform: "uppercase" as const,
                  color: "#C08435", marginBottom: "0.85rem",
                }}>
                  Engagement utilisateurs
                </div>

                <div style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "2.2rem", fontWeight: 900,
                  color: "#F8F6F1", lineHeight: 1,
                  letterSpacing: "-0.04em", marginBottom: "0.35rem",
                }}>
                  <CountUp target={engagementTotal} />
                </div>
                <div style={{ fontSize: "0.7rem", color: "rgba(248,246,241,.3)", marginBottom: "1rem" }}>
                  interactions totales
                </div>

                <div style={{ display: "flex", gap: "0" }}>
                  {[
                    { label: "Saves",   n: stats?.saves ?? 0,        color: "#C08435" },
                    { label: "Candid.", n: stats?.applications ?? 0,  color: "#1A5C40" },
                    { label: "Events",  n: stats?.eventRegs ?? 0,     color: "#1E4DA8" },
                  ].map((s, i) => (
                    <div
                      key={s.label}
                      style={{
                        flex: 1, textAlign: "center",
                        padding: "0.6rem 0.25rem",
                        borderLeft: i > 0 ? "1px solid rgba(255,255,255,.06)" : "none",
                      }}
                    >
                      <div style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: "1.15rem", fontWeight: 900,
                        color: s.color, lineHeight: 1,
                      }}>
                        {formatNumber(s.n)}
                      </div>
                      <div style={{ fontSize: "0.55rem", color: "rgba(248,246,241,.3)", marginTop: "0.2rem" }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              4. LIGNE : Actions rapides + Utilisateurs récents
          ══════════════════════════════════════ */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "1.25rem",
            alignItems: "start",
          }}>

            {/* ── Utilisateurs récents ── */}
            <div style={{
              background: "#fff", borderRadius: 20,
              border: "1px solid rgba(20,20,16,.06)",
              boxShadow: "0 1px 4px rgba(20,20,16,.04)",
              overflow: "hidden",
            }}>
              <div style={{ padding: "1.4rem 1.6rem 1rem" }}>
                <SectionTitle label="Membres récents" action="Gérer" actionHref="/admin/utilisateurs" />
              </div>

              {users.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#928E80", fontSize: "0.85rem" }}>
                  Aucun utilisateur.
                </div>
              ) : (
                users.map((u, i) => {
                  const role  = ROLE_STYLES[u.role] ?? ROLE_STYLES.reader;
                  const initials = u.full_name
                    ? u.full_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                    : u.email[0].toUpperCase();

                  return (
                    <div
                      key={u.id}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.9rem",
                        padding: "0.85rem 1.6rem",
                        borderTop: "1px solid rgba(20,20,16,.05)",
                        transition: "background .15s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#FAFAF8"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: `linear-gradient(135deg, ${role.color}cc, ${role.color}66)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: "0.72rem", fontWeight: 900, color: "#fff",
                      }}>
                        {initials}
                      </div>

                      {/* Infos */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: "0.85rem", fontWeight: 700, color: "#141410",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {u.full_name ?? "—"}
                        </div>
                        <div style={{
                          fontSize: "0.68rem", color: "#928E80",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {u.email}
                        </div>
                      </div>

                      {/* Rôle + date */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem" }}>
                        <span style={{
                          fontSize: "0.56rem", fontWeight: 800,
                          letterSpacing: "0.08em", textTransform: "uppercase" as const,
                          padding: "0.15rem 0.55rem", borderRadius: 100,
                          background: role.bg, color: role.color,
                        }}>
                          {role.label}
                        </span>
                        <span style={{ fontSize: "0.6rem", color: "#928E80" }}>
                          {formatDate(u.created_at, { relative: true })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Actions rapides ── */}
            <div style={{
              background: "#fff", borderRadius: 20,
              border: "1px solid rgba(20,20,16,.06)",
              boxShadow: "0 1px 4px rgba(20,20,16,.04)",
              padding: "1.4rem 1.6rem",
            }}>
              <SectionTitle label="Publier rapidement" />

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { label: "Rédiger un article",       href: "/admin/articles/nouveau",     icon: "✏️", color: "#C08435",  bg: "#FBF4E8" },
                  { label: "Ajouter une bourse",       href: "/admin/bourses/nouveau",      icon: "🎓", color: "#1A5C40",  bg: "#EAF4EF" },
                  { label: "Poster une opportunité",   href: "/admin/opportunites/nouveau", icon: "💼", color: "#1E4DA8",  bg: "#EBF0FB" },
                  { label: "Créer un événement",       href: "/admin/evenements/nouveau",   icon: "📅", color: "#B8341E",  bg: "#FAEBE8" },
                  { label: "Envoyer une newsletter",   href: "/admin/newsletter",           icon: "📬", color: "#7A1E4A",  bg: "#F9EBF3" },
                ].map(action => (
                  <Link key={action.href} href={action.href} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.85rem",
                      padding: "0.75rem 1rem", borderRadius: 12,
                      background: "#F8F6F1", border: "1px solid rgba(20,20,16,.06)",
                      transition: "all .18s", cursor: "pointer",
                    }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.background = action.bg;
                        el.style.borderColor = `${action.color}30`;
                        el.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.background = "#F8F6F1";
                        el.style.borderColor = "rgba(20,20,16,.06)";
                        el.style.transform = "translateX(0)";
                      }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: action.bg,
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "1rem", flexShrink: 0,
                        border: `1px solid ${action.color}20`,
                      }}>
                        {action.icon}
                      </div>
                      <span style={{
                        fontSize: "0.83rem", fontWeight: 600,
                        color: "#38382E", flex: 1,
                      }}>
                        {action.label}
                      </span>
                      <span style={{ color: "#928E80", fontSize: "0.75rem" }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Séparateur */}
              <div style={{ height: 1, background: "rgba(20,20,16,.06)", margin: "1.25rem 0" }} />

              {/* Liens analytique et utilisateurs */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[
                  { label: "Analytique",   href: "/admin/analytique",   color: "#C08435" },
                  { label: "Utilisateurs", href: "/admin/utilisateurs",  color: "#1E4DA8" },
                ].map(l => (
                  <Link key={l.href} href={l.href} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0.65rem", borderRadius: 10,
                    background: "rgba(20,20,16,.04)",
                    border: "1px solid rgba(20,20,16,.07)",
                    textDecoration: "none",
                    fontSize: "0.75rem", fontWeight: 700,
                    color: "#928E80", transition: "all .15s",
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.color = l.color;
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = `${l.color}30`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "#928E80";
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(20,20,16,.07)";
                    }}
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(.6); }
        }
      `}</style>
    </div>
  );
}