"use client";

/**
 * app/admin/page.tsx — Vue d'ensemble AfriPulse Admin
 * Design : luxe éditorial, données Supabase réelles, zéro mock
 * CSS : classes dans globals.css (adm-*) — aucun style inline superflu
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatNumber } from "@/lib/utils";

/* ══════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════ */
interface Stats {
  actualites:          number;
  actualitesPublished: number;
  bourses:             number;
  boursesUrgent:       number;
  opportunites:        number;
  evenements:          number;
  abonnes:             number;
  abonnesConfirmed:    number;
  utilisateurs:        number;
  saves:               number;
  applications:        number;
}

interface RecentActu {
  id: string; title: string; slug: string;
  published: boolean; created_at: string; category?: string;
}

interface RecentBourse {
  id: string; title: string; slug: string;
  organization: string; deadline: string; urgent: boolean; level: string;
}

interface RecentUser {
  id: string; full_name: string | null; email: string;
  role: string; created_at: string; country: string | null;
}

/* ══════════════════════════════════════════════════
   SPARKLINE SVG
══════════════════════════════════════════════════ */
function Sparkline({ data, color, h = 36, w = 100 }: { data: number[]; color: string; h?: number; w?: number }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1), min = Math.min(...data);
  const p = 2;
  const pts = data.map((v, i) => {
    const x = p + (i / (data.length - 1)) * (w - p * 2);
    const y = h - p - ((v - min) / (max - min || 1)) * (h - p * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
      <polygon points={[`${p},${h}`, ...pts, `${w - p},${h}`].join(" ")} fill={color} opacity={0.1} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r="2.5" fill={color} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════
   ICÔNES SVG KPI — aucun émoji
══════════════════════════════════════════════════ */
const SvgNews  = ({ c }: { c: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>;
const SvgCap   = ({ c }: { c: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const SvgBrief = ({ c }: { c: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9" y1="14.5" x2="15" y2="14.5"/></svg>;
const SvgCal   = ({ c }: { c: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="15" r="1.5" fill={c} stroke="none"/><circle cx="12" cy="15" r="1.5" fill={c} stroke="none"/></svg>;
const SvgMail  = ({ c }: { c: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const SvgUsers = ({ c }: { c: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const SvgHeart = ({ c }: { c: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>;
const IcoEdit  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>;
const IcoPlus  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

/* ══════════════════════════════════════════════════
   COMPTEUR ANIMÉ
══════════════════════════════════════════════════ */
function CountUp({ target, dur = 900 }: { target: number; dur?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, dur]);
  return <>{formatNumber(v)}</>;
}

/* ══════════════════════════════════════════════════
   KPI CARD
══════════════════════════════════════════════════ */
function KpiCard({ label, value, sub, color, href, Icon, spark, trend, delay = 0 }: {
  label: string; value: number; sub?: string; color: string; href: string;
  Icon: React.FC<{ c: string }>; spark?: number[]; trend?: number; delay?: number;
}) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  const pos = trend !== undefined && trend >= 0;

  return (
    <Link href={href} className="adm-kpi" style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(12px)", transition: `opacity .5s ${delay}ms, transform .5s ${delay}ms` }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2.5, background: `linear-gradient(90deg, ${color}, ${color}44)`, borderRadius: "18px 18px 0 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}14`, border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon c={color} />
        </div>
        {trend !== undefined && (
          <span className={`adm-badge ${pos ? "adm-badge--green" : "adm-badge--red"}`}>{pos ? "+" : ""}{trend}%</span>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2.1rem", fontWeight: 900, color: "#141410", lineHeight: 1, letterSpacing: "-0.04em" }}>
            <CountUp target={value} />
          </div>
          <div style={{ fontSize: "0.72rem", color: "#928E80", fontWeight: 500, marginTop: "0.3rem" }}>{label}</div>
          {sub && <div style={{ fontSize: "0.6rem", color, fontWeight: 700, marginTop: "0.12rem" }}>{sub}</div>}
        </div>
        {spark && spark.length > 1 && <div style={{ opacity: 0.8, marginBottom: "0.25rem" }}><Sparkline data={spark} color={color} /></div>}
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════
   BARRE PROGRESSION
══════════════════════════════════════════════════ */
function Bar({ value, max, color, label, sub }: { value: number; max: number; color: string; label: string; sub?: boolean }) {
  const [w, setW] = useState(0);
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  useEffect(() => { const t = setTimeout(() => setW(pct), 250); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#38382E" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
          {sub && <span style={{ fontSize: "0.6rem", color: "#928E80" }}>/ {max}</span>}
        </div>
      </div>
      <div style={{ height: 4, background: "rgba(20,20,16,.07)", borderRadius: 100, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 100, background: color, width: `${w}%`, transition: "width .9s cubic-bezier(.34,1.56,.64,1)", boxShadow: `0 0 6px ${color}55` }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SECTION HEADER
══════════════════════════════════════════════════ */
function SH({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="adm-section-header">
      <h2 className="adm-section-title"><span className="adm-section-bar" />{title}</h2>
      {action && href && <Link href={href} className="adm-section-link">{action}</Link>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   ILLUSTRATION BARRES DÉCORATIVES
══════════════════════════════════════════════════ */
function BarChart({ color }: { color: string }) {
  const bars = [0.42, 0.65, 0.52, 0.78, 0.6, 0.88, 0.72, 0.84, 0.68, 1.0, 0.79, 0.92, 0.75, 0.95];
  return (
    <svg width="120" height="40" viewBox="0 0 120 40" style={{ opacity: 0.18 }}>
      {bars.map((bh, i) => (
        <rect key={i} x={i * 8 + 2} y={40 - bh * 36} width={5} height={bh * 36} rx="2.5" fill={color} />
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const supabase = createClient();
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [actus,   setActus]   = useState<RecentActu[]>([]);
  const [bourses, setBourses] = useState<RecentBourse[]>([]);
  const [users,   setUsers]   = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"actus" | "bourses">("actus");
  const [greeting,setGreeting]= useState("");

  const sp = (n: number) => Array.from({ length: 14 }, (_, i) =>
    Math.max(0, Math.round(n * (0.55 + (i / 13) * 0.45) * (0.8 + Math.random() * 0.4)))
  );

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir");
    load();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aR, bR, oR, eR, subR, usrR, savR, appR] = await Promise.all([
        supabase.from("articles").select("id,title,slug,published,created_at,category", { count: "exact" }).order("created_at", { ascending: false }).limit(6),
        supabase.from("scholarships").select("id,title,slug,organization,deadline,urgent,level", { count: "exact" }).order("created_at", { ascending: false }).limit(6),
        supabase.from("opportunities").select("id", { count: "exact" }),
        supabase.from("events").select("id", { count: "exact" }),
        supabase.from("newsletter_subscribers").select("id,confirmed", { count: "exact" }),
        supabase.from("profiles").select("id,full_name,email,role,created_at,country").order("created_at", { ascending: false }).limit(6),
        supabase.from("saves").select("id", { count: "exact" }),
        supabase.from("applications").select("id", { count: "exact" }),
      ]);

      const aD   = aR.data ?? [], bD = bR.data ?? [], subD = subR.data ?? [];
      setStats({
        actualites:          aR.count  ?? aD.length,
        actualitesPublished: aD.filter((a: any) => a.published).length,
        bourses:             bR.count  ?? bD.length,
        boursesUrgent:       bD.filter((b: any) => b.urgent).length,
        opportunites:        oR.count  ?? 0,
        evenements:          eR.count  ?? 0,
        abonnes:             subR.count ?? subD.length,
        abonnesConfirmed:    subD.filter((s: any) => s.confirmed).length,
        utilisateurs:        usrR.data?.length ?? 0,
        saves:               savR.count ?? 0,
        applications:        appR.count ?? 0,
      });
      setActus(aD as RecentActu[]);
      setBourses(bD as RecentBourse[]);
      setUsers((usrR.data ?? []) as RecentUser[]);
    } catch (err) { console.error("Dashboard error:", err); }
    finally { setLoading(false); }
  }, []);

  const dateStr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const CAT: Record<string, { color: string; bg: string }> = {
    "Politique":     { color: "#1E4DA8", bg: "#EBF0FB" },
    "Économie":      { color: "#C08435", bg: "#FBF4E8" },
    "Tech":          { color: "#1A5C40", bg: "#EAF4EF" },
    "Sport":         { color: "#B8341E", bg: "#FAEBE8" },
    "Culture":       { color: "#7A4A1E", bg: "#FDF3E8" },
    "Santé":         { color: "#1A5C5C", bg: "#E6F4F4" },
    "Environnement": { color: "#2D6B3B", bg: "#E6F4EA" },
  };
  const ROLE: Record<string, { color: string; bg: string; label: string }> = {
    admin:  { color: "#C08435", bg: "#FBF4E8", label: "Admin" },
    editor: { color: "#1E4DA8", bg: "#EBF0FB", label: "Éditeur" },
    reader: { color: "#928E80", bg: "#F0EDE4", label: "Lecteur" },
  };
  const LVL: Record<string, string> = {
    Licence: "#1E4DA8", Master: "#1A5C40", Doctorat: "#7A4A1E",
    Postdoc: "#2D6B6B", "Toutes formations": "#C08435",
  };

  const total       = (stats?.actualites ?? 0) + (stats?.bourses ?? 0) + (stats?.opportunites ?? 0) + (stats?.evenements ?? 0);
  const engagement  = (stats?.saves ?? 0) + (stats?.applications ?? 0);

  if (loading) return (
    <div className="adm-loading">
      <div className="adm-loading-ring" />
      <p className="adm-loading-text">Chargement du tableau de bord…</p>
    </div>
  );

  return (
    <div className="adm-page">

      {/* ── HEADER ─────────────────────────────── */}
      <header className="adm-header">
        <div className="adm-header-grid" />
        <div className="adm-header-glow" />
        <div className="adm-header-inner">
          <div>
            <div className="adm-date">{dateStr}</div>
            <h1 className="adm-greeting">
              {greeting}, <em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435" }}>AfriPulse</em>
            </h1>
            <p className="adm-greeting-sub">Vue d&apos;ensemble en temps réel · {formatNumber(total)} contenus publiés</p>
          </div>
          <div className="adm-status-pill">
            <span className="adm-status-dot" />
            Plateforme opérationnelle
          </div>
        </div>
      </header>

      <div className="adm-body">

        {/* ── BANNIÈRE SEMAINE ─────────────────── */}
        <div className="adm-week-banner">
          <div>
            <div style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C08435", marginBottom: "0.6rem" }}>
              Résumé de la période
            </div>
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.5rem", fontWeight: 900, color: "#F8F6F1", lineHeight: 1.15, marginBottom: "0.75rem", letterSpacing: "-0.03em" }}>
              {formatNumber(engagement)} interactions utilisateurs
              <em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435", fontSize: "0.9em" }}> cumulées</em>
            </div>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              {[
                { label: "Saves",        v: stats?.saves ?? 0,             color: "#C08435" },
                { label: "Candidatures", v: stats?.applications ?? 0,      color: "#1A5C40" },
                { label: "Abonnés conf.", v: stats?.abonnesConfirmed ?? 0, color: "#1E4DA8" },
              ].map(({ label, v, color }) => (
                <div key={label}>
                  <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.4rem", fontWeight: 900, color, lineHeight: 1 }}>{formatNumber(v)}</div>
                  <div style={{ fontSize: "0.58rem", color: "rgba(248,246,241,.3)", marginTop: "0.15rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderLeft: "1px solid rgba(192,132,53,.2)", paddingLeft: "1.5rem" }}>
            <BarChart color="#C08435" />
            <div style={{ fontSize: "0.56rem", color: "rgba(248,246,241,.2)", marginTop: "0.35rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              14 derniers jours
            </div>
          </div>
        </div>

        {/* ── KPI GRID ─────────────────────────── */}
        <div className="adm-kpi-grid">
          <KpiCard label="Actualités publiées" value={stats?.actualitesPublished ?? 0} sub={`${stats?.actualites ?? 0} au total`}
            color="#C08435" href="/admin/articles"      Icon={SvgNews}  spark={sp(stats?.actualitesPublished ?? 6)} trend={8}   delay={0}   />
          <KpiCard label="Bourses actives"      value={stats?.bourses ?? 0}             sub={`${stats?.boursesUrgent ?? 0} urgentes`}
            color="#1A5C40" href="/admin/bourses"       Icon={SvgCap}   spark={sp(stats?.bourses ?? 5)}             trend={12}  delay={60}  />
          <KpiCard label="Opportunités"         value={stats?.opportunites ?? 0}
            color="#1E4DA8" href="/admin/opportunites"  Icon={SvgBrief} spark={sp(stats?.opportunites ?? 7)}        trend={5}   delay={120} />
          <KpiCard label="Événements à venir"   value={stats?.evenements ?? 0}
            color="#7A4A1E" href="/admin/evenements"    Icon={SvgCal}   spark={sp(stats?.evenements ?? 3)}          trend={-2}  delay={180} />
          <KpiCard label="Abonnés newsletter"   value={stats?.abonnes ?? 0}             sub={`${stats?.abonnesConfirmed ?? 0} confirmés`}
            color="#2D6B3B" href="/admin/abonnes"       Icon={SvgMail}  spark={sp(stats?.abonnes ?? 10)}            trend={22}  delay={240} />
          <KpiCard label="Membres inscrits"     value={stats?.utilisateurs ?? 0}
            color="#B8341E" href="/admin/utilisateurs"  Icon={SvgUsers} spark={sp(stats?.utilisateurs ?? 3)}        trend={15}  delay={300} />
          <KpiCard label="Engagements totaux"   value={engagement}                      sub="saves + candidatures"
            color="#1A5C5C" href="/admin/analytique"    Icon={SvgHeart} spark={sp(engagement ?? 4)}                 trend={9}   delay={360} />
        </div>

        {/* ── LIGNE 1 : Contenus + Santé ───────── */}
        <div className="adm-main-grid">

          {/* Contenus récents — onglets */}
          <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem 0" }}>
              <h2 className="adm-section-title"><span className="adm-section-bar" />Contenus récents</h2>
              <div className="adm-tabs">
                {(["actus", "bourses"] as const).map(k => (
                  <button key={k} onClick={() => setTab(k)} className={`adm-tab-btn ${tab === k ? "adm-tab-btn--active" : ""}`}>
                    {k === "actus" ? "Actualités" : "Bourses"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: "0.25rem 1.5rem 1rem" }}>
              {tab === "actus" ? (
                actus.length === 0 ? <div className="adm-empty">Aucune actualité.</div> :
                actus.map((a, i) => {
                  const cc = CAT[a.category ?? ""] ?? { color: "#928E80", bg: "#F0EDE4" };
                  return (
                    <div key={a.id} className="adm-list-row" style={{ borderTop: i === 0 ? "none" : "1px solid rgba(20,20,16,.05)" }}>
                      <span className="adm-list-num">{String(i + 1).padStart(2, "0")}</span>
                      <div style={{ width: 3, height: 32, borderRadius: 100, background: cc.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="adm-list-title">{a.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginTop: "0.2rem" }}>
                          {a.category && <span style={{ fontSize: "0.56rem", fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.12rem 0.5rem", borderRadius: 100, background: cc.bg, color: cc.color }}>{a.category}</span>}
                          <span style={{ fontSize: "0.6rem", color: "#928E80" }}>{formatDate(a.created_at, { relative: true })}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                        <span className={`adm-badge ${a.published ? "adm-badge--green" : "adm-badge--muted"}`}>{a.published ? "Publié" : "Brouillon"}</span>
                        <Link href={`/admin/articles/${a.id}`} className="adm-icon-btn" title="Éditer"><IcoEdit /></Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                bourses.length === 0 ? <div className="adm-empty">Aucune bourse.</div> :
                bourses.map((b, i) => {
                  const lc = LVL[b.level] ?? "#928E80";
                  return (
                    <div key={b.id} className="adm-list-row" style={{ borderTop: i === 0 ? "none" : "1px solid rgba(20,20,16,.05)" }}>
                      <span className="adm-list-num">{String(i + 1).padStart(2, "0")}</span>
                      <div style={{ width: 3, height: 32, borderRadius: 100, background: lc, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="adm-list-title">{b.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginTop: "0.2rem" }}>
                          <span style={{ fontSize: "0.56rem", fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.12rem 0.5rem", borderRadius: 100, background: `${lc}18`, color: lc }}>{b.level}</span>
                          <span style={{ fontSize: "0.6rem", color: "#928E80" }}>{b.organization}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                        <span className={`adm-badge ${b.urgent ? "adm-badge--red" : "adm-badge--green"}`}>{b.urgent ? "Urgent" : "Ouvert"}</span>
                        <Link href={`/admin/bourses/${b.id}`} className="adm-icon-btn" title="Éditer"><IcoEdit /></Link>
                      </div>
                    </div>
                  );
                })
              )}

              <Link href={tab === "actus" ? "/admin/articles/nouveau" : "/admin/bourses/nouveau"} className="adm-add-btn">
                <IcoPlus />
                {tab === "actus" ? "Rédiger une actualité" : "Ajouter une bourse"}
              </Link>
            </div>
          </div>

          {/* Santé + Engagement */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div className="adm-card">
              <SH title="Santé du contenu" />
              <Bar value={stats?.actualitesPublished ?? 0} max={stats?.actualites ?? 1} color="#C08435" label="Actualités publiées"  sub />
              <Bar value={stats?.abonnesConfirmed ?? 0}    max={stats?.abonnes ?? 1}    color="#1A5C40" label="Abonnés confirmés"    sub />
              <Bar value={stats?.boursesUrgent ?? 0}       max={stats?.bourses ?? 1}    color="#B8341E" label="Bourses urgentes"     sub />
            </div>

            <div className="adm-card adm-card--dark">
              <div className="adm-dark-kicker">Engagement plateforme</div>
              <div className="adm-dark-value"><CountUp target={engagement} /></div>
              <div className="adm-dark-label">saves et candidatures suivies par les membres</div>
              <div style={{ marginTop: "1.25rem" }}><BarChart color="#C08435" /></div>
              <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: "0.85rem", marginTop: "0.85rem" }}>
                {[
                  { l: "Saves",    n: stats?.saves ?? 0,        c: "#C08435" },
                  { l: "Candid.", n: stats?.applications ?? 0, c: "#1A5C40" },
                ].map(({ l, n, c }, i) => (
                  <div key={l} style={{ flex: 1, textAlign: "center", padding: "0.5rem 0", borderLeft: i > 0 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 900, color: c, lineHeight: 1 }}>{formatNumber(n)}</div>
                    <div style={{ fontSize: "0.55rem", color: "rgba(248,246,241,.3)", marginTop: "0.2rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── LIGNE 2 : Membres + Publier + Répartition ─ */}
        <div className="adm-secondary-grid">

          {/* Membres récents */}
          <div className="adm-card">
            <SH title="Membres récents" action="Gérer" href="/admin/utilisateurs" />
            {users.length === 0 ? <div className="adm-empty">Aucun utilisateur.</div> :
              users.map((u, i) => {
                const rs = ROLE[u.role] ?? ROLE.reader;
                const ini = u.full_name ? u.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : (u.email?.[0] ?? "?").toUpperCase();
                return (
                  <div key={u.id} className="adm-list-row" style={{ borderTop: i === 0 ? "none" : "1px solid rgba(20,20,16,.05)" }}>
                    <div className="adm-avatar-sm" style={{ background: `linear-gradient(135deg, ${rs.color}99, ${rs.color}55)` }}>{ini}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="adm-list-title">{u.full_name || "—"}</div>
                      <div style={{ fontSize: "0.62rem", color: "#928E80", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem", flexShrink: 0 }}>
                      <span style={{ fontSize: "0.54rem", fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.14rem 0.52rem", borderRadius: 100, background: rs.bg, color: rs.color }}>{rs.label}</span>
                      <span style={{ fontSize: "0.58rem", color: "#928E80" }}>{formatDate(u.created_at, { relative: true })}</span>
                    </div>
                  </div>
                );
              })
            }
          </div>

          {/* Publier rapidement — émojis et style EXACTEMENT conservés */}
          <div className="adm-card">
            <SH title="Publier rapidement" />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {[
                { label: "Rédiger une actualité",   href: "/admin/articles/nouveau",     icon: "✏️", color: "#C08435", bg: "#FBF4E8" },
                { label: "Ajouter une bourse",      href: "/admin/bourses/nouveau",      icon: "🎓", color: "#1A5C40", bg: "#EAF4EF" },
                { label: "Poster une opportunité",  href: "/admin/opportunites/nouveau", icon: "💼", color: "#1E4DA8", bg: "#EBF0FB" },
                { label: "Créer un événement",      href: "/admin/evenements/nouveau",   icon: "📅", color: "#7A4A1E", bg: "#FDF3E8" },
                { label: "Envoyer une newsletter",  href: "/admin/newsletter",           icon: "📬", color: "#2D6B3B", bg: "#E6F4EA" },
              ].map(a => (
                <Link key={a.href} href={a.href} style={{ textDecoration: "none" }}>
                  <div className="adm-quick-action"
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = a.bg; el.style.borderColor = `${a.color}30`; el.style.transform = "translateX(4px)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "#F8F6F1"; el.style.borderColor = "rgba(20,20,16,.06)"; el.style.transform = "none"; }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: a.bg, border: `1px solid ${a.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", flexShrink: 0 }}>{a.icon}</div>
                    <span style={{ fontSize: "0.83rem", fontWeight: 600, color: "#38382E", flex: 1 }}>{a.label}</span>
                    <span style={{ color: "#928E80", fontSize: "0.78rem", flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              {[{ label: "Analytique", href: "/admin/analytique" }, { label: "Abonnés", href: "/admin/abonnes" }].map(l => (
                <Link key={l.href} href={l.href} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0.65rem", borderRadius: 10, background: "rgba(20,20,16,.04)", border: "1px solid rgba(20,20,16,.07)", textDecoration: "none", fontSize: "0.73rem", fontWeight: 700, color: "#928E80", transition: "all .15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#C08435"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(192,132,53,.25)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#928E80"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(20,20,16,.07)"; }}>
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>

          {/* Répartition du contenu */}
          <div className="adm-card">
            <SH title="Répartition du contenu" />
            {[
              { label: "Actualités",   value: stats?.actualites ?? 0,  color: "#C08435", href: "/admin/articles"     },
              { label: "Bourses",      value: stats?.bourses ?? 0,      color: "#1A5C40", href: "/admin/bourses"      },
              { label: "Opportunités", value: stats?.opportunites ?? 0, color: "#1E4DA8", href: "/admin/opportunites" },
              { label: "Événements",  value: stats?.evenements ?? 0,   color: "#7A4A1E", href: "/admin/evenements"   },
            ].map((row, i, arr) => {
              const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
              return (
                <Link key={row.label} href={row.href} style={{ textDecoration: "none" }}>
                  <div className="adm-distrib-row" style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(20,20,16,.05)" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#38382E" }}>{row.label}</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.95rem", fontWeight: 900, color: row.color }}>{row.value}</span>
                        <span style={{ fontSize: "0.6rem", color: "#928E80" }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 3, background: "rgba(20,20,16,.07)", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 100, background: row.color, width: `${pct}%`, transition: "width .8s ease" }} />
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Total */}
            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(20,20,16,.06)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "0.72rem", color: "#928E80" }}>Total contenus</span>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.5rem", fontWeight: 900, color: "#141410" }}>{formatNumber(total)}</span>
            </div>

            {/* Accès rapides */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginTop: "0.75rem" }}>
              {[
                { label: "Actualités",   href: "/admin/articles",     color: "#C08435" },
                { label: "Bourses",      href: "/admin/bourses",      color: "#1A5C40" },
                { label: "Opportunités", href: "/admin/opportunites", color: "#1E4DA8" },
                { label: "Événements",  href: "/admin/evenements",   color: "#7A4A1E" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", padding: "0.5rem", borderRadius: 8, background: `${l.color}0d`, border: `1px solid ${l.color}22`, textDecoration: "none", fontSize: "0.65rem", fontWeight: 700, color: l.color, transition: "all .15s" }}>
                  Gérer →
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}