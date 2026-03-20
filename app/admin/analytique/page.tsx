"use client";

/**
 * app/admin/analytique/page.tsx
 * Vue d'ensemble analytique — graphiques SVG purs, données Supabase réelles
 * Design : luxe éditorial sombre, Fraunces + DM Sans, zéro mock, zéro émoji dans KPIs
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatNumber, formatDate } from "@/lib/utils";

/* ══ TYPES ══════════════════════════════════════════════════ */
interface GlobalStats {
  totalContent:     number;
  totalUsers:       number;
  totalAbonnes:     number;
  totalSaves:       number;
  totalApps:        number;
  totalEventRegs:   number;
  published:        number;
  unpublished:      number;
  urgent:           number;
  confirmedAbonnes: number;
}

interface TimePoint { date: string; value: number; }

interface ContentBreak {
  label: string; count: number; published: number; color: string;
}

interface TopItem {
  id: string; title: string; slug: string; type: string; saves: number; views?: number;
}

/* ══ PALETTE COULEURS ═══════════════════════════════════════ */
const PALETTE = {
  gold:   "#C08435",
  green:  "#1A5C40",
  blue:   "#1E4DA8",
  brown:  "#7A4A1E",
  teal:   "#2D6B3B",
  red:    "#B8341E",
  muted:  "#928E80",
  ink:    "#141410",
  cream:  "#F8F6F1",
};

/* ══ ICÔNES SVG ═════════════════════════════════════════════ */
const IcoTrend  = ({ c = PALETTE.muted }: { c?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcoUsers  = ({ c = PALETTE.muted }: { c?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IcoFile   = ({ c = PALETTE.muted }: { c?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcoHeart  = ({ c = PALETTE.muted }: { c?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>;
const IcoMail   = ({ c = PALETTE.muted }: { c?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoBrief  = ({ c = PALETTE.muted }: { c?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
const IcoArrow  = ({ c = PALETTE.muted }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

/* ══ GRAPHIQUE LIGNE SVG PUR ════════════════════════════════ */
function LineChart({
  data, color, height = 120, width = 400, gradient = true, label,
}: {
  data: TimePoint[]; color: string; height?: number; width?: number;
  gradient?: boolean; label?: string;
}) {
  if (!data || data.length < 2) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.75rem", color: PALETTE.muted }}>Données insuffisantes</span>
      </div>
    );
  }
  const values = data.map(d => d.value);
  const max    = Math.max(...values, 1);
  const min    = Math.min(...values, 0);
  const range  = max - min || 1;
  const pad    = { t: 8, r: 8, b: 24, l: 36 };
  const w      = width  - pad.l - pad.r;
  const h      = height - pad.t - pad.b;

  const pts = data.map((d, i) => ({
    x: pad.l + (i / (data.length - 1)) * w,
    y: pad.t + h - ((d.value - min) / range) * h,
    d,
  }));

  const pathD    = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillPath = `${pathD} L${pts[pts.length - 1].x},${pad.t + h} L${pts[0].x},${pad.t + h} Z`;

  // Grilles horizontales
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: pad.t + h - f * h,
    val: Math.round(min + f * range),
  }));

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grilles */}
      {gridLines.map((g, i) => (
        <g key={i}>
          <line x1={pad.l} y1={g.y} x2={pad.l + w} y2={g.y} stroke="rgba(20,20,16,.06)" strokeWidth="1" strokeDasharray={i > 0 ? "4 4" : "none"} />
          <text x={pad.l - 6} y={g.y + 4} textAnchor="end" fontSize="9" fill={PALETTE.muted} fontFamily="DM Sans, system-ui, sans-serif">
            {formatNumber(g.val)}
          </text>
        </g>
      ))}

      {/* Étiquettes X */}
      {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((d, i, arr) => {
        const idx = data.indexOf(d);
        const x   = pad.l + (idx / (data.length - 1)) * w;
        const lbl = new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
        return (
          <text key={i} x={x} y={pad.t + h + 16} textAnchor="middle" fontSize="9" fill={PALETTE.muted} fontFamily="DM Sans, system-ui, sans-serif">{lbl}</text>
        );
      })}

      {/* Aire remplie */}
      {gradient && <path d={fillPath} fill={`url(#grad-${color.replace("#","")})`} />}

      {/* Ligne principale */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="#fff" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/* ══ GRAPHIQUE BARRES SVG ═══════════════════════════════════ */
function BarChart({
  data, color, height = 100,
}: { data: { label: string; value: number }[]; color: string; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.floor(280 / data.length) - 4;

  return (
    <svg width="100%" viewBox={`0 0 ${data.length * (barW + 4)} ${height + 24}`} style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const barH = ((d.value / max) * height);
        const x    = i * (barW + 4);
        const y    = height - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={color} opacity={0.85} />
            <text x={x + barW / 2} y={height + 16} textAnchor="middle" fontSize="9" fill={PALETTE.muted} fontFamily="DM Sans, system-ui, sans-serif">
              {d.label}
            </text>
            {d.value > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="8" fill={color} fontFamily="DM Sans, system-ui, sans-serif" fontWeight="700">
                {d.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ══ GRAPHIQUE DONUT SVG ════════════════════════════════════ */
function DonutChart({
  segments, size = 120, thickness = 22,
}: { segments: { value: number; color: string; label: string }[]; size?: number; thickness?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r     = (size - thickness) / 2;
  const cx    = size / 2, cy = size / 2;
  const circ  = 2 * Math.PI * r;

  let offset = -circ / 4; // start at top

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {total === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(20,20,16,.08)" strokeWidth={thickness} />
      ) : segments.map((seg, i) => {
        const dash    = (seg.value / total) * circ;
        const gap     = circ - dash;
        const start   = offset;
        offset += dash;
        return (
          <circle
            key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.value > 0 ? seg.color : "transparent"}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-start}
            strokeLinecap="round"
          />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="16" fontWeight="900" fill={PALETTE.ink} fontFamily="Fraunces, Georgia, serif">
        {formatNumber(total)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill={PALETTE.muted} fontFamily="DM Sans, system-ui, sans-serif">
        total
      </text>
    </svg>
  );
}

/* ══ COMPTEUR ANIMÉ ════════════════════════════════════════ */
function CountUp({ n, dur = 800 }: { n: number; dur?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setV(Math.round(n * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [n, dur]);
  return <>{formatNumber(v)}</>;
}

/* ══ KPI MINI ═══════════════════════════════════════════════ */
function KpiMini({ label, value, sub, color, Icon, delta }: {
  label: string; value: number; sub?: string; color: string;
  Icon: React.FC<{ c: string }>; delta?: number;
}) {
  const pos = delta !== undefined && delta >= 0;
  return (
    <div className="an-kpi">
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2.5, background: `linear-gradient(90deg,${color},${color}44)`, borderRadius: "18px 18px 0 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}14`, border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon c={color} />
        </div>
        {delta !== undefined && (
          <span style={{ fontSize: "0.58rem", fontWeight: 800, padding: "0.15rem 0.5rem", borderRadius: 100, background: pos ? "#EAF4EF" : "#FAEBE8", color: pos ? "#1A5C40" : "#B8341E" }}>
            {pos ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.9rem", fontWeight: 900, color: PALETTE.ink, lineHeight: 1, letterSpacing: "-0.04em" }}>
        <CountUp n={value} />
      </div>
      <div style={{ fontSize: "0.7rem", color: PALETTE.muted, marginTop: "0.28rem" }}>{label}</div>
      {sub && <div style={{ fontSize: "0.58rem", color, fontWeight: 700, marginTop: "0.1rem" }}>{sub}</div>}
    </div>
  );
}

/* ══ SECTION HEADER ══════════════════════════════════════════ */
function SH({ title, sub, action, href }: { title: string; sub?: string; action?: string; href?: string }) {
  return (
    <div className="an-sh">
      <div>
        <h2 className="an-sh-title"><span className="an-sh-bar" />{title}</h2>
        {sub && <p className="an-sh-sub">{sub}</p>}
      </div>
      {action && href && <Link href={href} className="an-sh-link">{action}</Link>}
    </div>
  );
}

/* ══ PAGE PRINCIPALE ════════════════════════════════════════ */
export default function AnalytiquePage() {
  const sb = createClient();
  const [stats,    setStats]   = useState<GlobalStats | null>(null);
  const [breaking, setBreaking]= useState<ContentBreak[]>([]);
  const [topSaves, setTopSaves]= useState<TopItem[]>([]);
  const [regByDay, setRegByDay]= useState<TimePoint[]>([]);
  const [savesByDay,setSavesByDay]= useState<TimePoint[]>([]);
  const [catDist,  setCatDist] = useState<{ label: string; value: number; color: string }[]>([]);
  const [loading,  setLoading] = useState(true);
  const [period,   setPeriod]  = useState<30 | 60 | 90>(30);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - period);
      const sinceISO = since.toISOString();

      const [
        artR, bsR, opR, evR, subR, usrR, savR, appR, regR,
        savTimeline, regTimeline, artCat,
        topSavesR,
      ] = await Promise.all([
        sb.from("articles").select("id,published", { count: "exact" }),
        sb.from("scholarships").select("id,urgent", { count: "exact" }),
        sb.from("opportunities").select("id", { count: "exact" }),
        sb.from("events").select("id", { count: "exact" }),
        sb.from("newsletter_subscribers").select("id,confirmed", { count: "exact" }),
        sb.from("profiles").select("id", { count: "exact" }),
        sb.from("saves").select("id", { count: "exact" }),
        sb.from("applications").select("id", { count: "exact" }),
        sb.from("event_registrations").select("id", { count: "exact" }),
        // Timeline saves sur la période
        sb.from("saves").select("created_at").gte("created_at", sinceISO).order("created_at"),
        // Timeline abonnés sur la période
        sb.from("newsletter_subscribers").select("created_at").gte("created_at", sinceISO).order("created_at"),
        // Répartition catégories articles
        sb.from("articles").select("category").eq("published", true),
        // Top contenus sauvegardés
        sb.from("saves").select("content_type,content_slug,content_title").gte("created_at", sinceISO),
      ]);

      const artData = artR.data ?? [];
      const bsData  = bsR.data ?? [];
      const subData = subR.data ?? [];

      setStats({
        totalContent:     (artR.count ?? 0) + (bsR.count ?? 0) + (opR.count ?? 0) + (evR.count ?? 0),
        totalUsers:       usrR.count ?? 0,
        totalAbonnes:     subR.count ?? 0,
        totalSaves:       savR.count ?? 0,
        totalApps:        appR.count ?? 0,
        totalEventRegs:   regR.count ?? 0,
        published:        artData.filter((a: any) => a.published).length,
        unpublished:      artData.filter((a: any) => !a.published).length,
        urgent:           bsData.filter((b: any) => b.urgent).length,
        confirmedAbonnes: subData.filter((s: any) => s.confirmed).length,
      });

      // Timeline saves : agréger par jour
      const savMap: Record<string, number> = {};
      for (const s of (savTimeline.data ?? [])) {
        const day = s.created_at.slice(0, 10);
        savMap[day] = (savMap[day] ?? 0) + 1;
      }
      setRegByDay(buildTimeline(regTimeline.data ?? [], period));
      setSavesByDay(buildTimeline(savTimeline.data ?? [], period));

      // Répartition catégories
      const catMap: Record<string, number> = {};
      for (const a of (artCat.data ?? [])) {
        catMap[a.category] = (catMap[a.category] ?? 0) + 1;
      }
      const catColors: Record<string, string> = {
        "Politique": PALETTE.blue, "Économie": PALETTE.gold, "Tech": PALETTE.green,
        "Sport": PALETTE.red, "Culture": PALETTE.brown, "Santé": PALETTE.teal,
        "Environnement": "#4B8B3B",
      };
      setCatDist(
        Object.entries(catMap)
          .sort(([, a], [, b]) => b - a)
          .map(([k, v]) => ({ label: k, value: v, color: catColors[k] ?? PALETTE.muted }))
      );

      // Répartition du contenu
      setBreaking([
        { label: "Actualités",   count: artR.count ?? 0,  published: artData.filter((a:any)=>a.published).length, color: PALETTE.gold  },
        { label: "Bourses",      count: bsR.count ?? 0,   published: bsData.filter((b:any)=>!b.urgent).length,   color: PALETTE.green },
        { label: "Opportunités", count: opR.count ?? 0,   published: opR.count ?? 0,                             color: PALETTE.blue  },
        { label: "Événements",  count: evR.count ?? 0,   published: evR.count ?? 0,                             color: PALETTE.brown },
      ]);

      // Top contenus par sauvegardes
      const slugMap: Record<string, { title: string; type: string; count: number }> = {};
      for (const s of (topSavesR.data ?? [])) {
        const k = s.content_slug;
        if (!slugMap[k]) slugMap[k] = { title: s.content_title ?? s.content_slug, type: s.content_type, count: 0 };
        slugMap[k].count++;
      }
      setTopSaves(
        Object.entries(slugMap)
          .sort(([, a], [, b]) => b.count - a.count)
          .slice(0, 8)
          .map(([slug, v], i) => ({ id: String(i), slug, title: v.title, type: v.type, saves: v.count }))
      );

    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  // ── Helpers ──────────────────────────────────────────────
  function buildTimeline(rows: { created_at: string }[], days: number): TimePoint[] {
    const map: Record<string, number> = {};
    for (const r of rows) { const d = r.created_at.slice(0, 10); map[d] = (map[d] ?? 0) + 1; }
    const result: TimePoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, value: map[key] ?? 0 });
    }
    return result;
  }

  const typeColor: Record<string, string> = {
    article: PALETTE.gold, scholarship: PALETTE.green,
    opportunity: PALETTE.blue, event: PALETTE.brown,
  };
  const typeLabel: Record<string, string> = {
    article: "Actualité", scholarship: "Bourse",
    opportunity: "Opportunité", event: "Événement",
  };

  const totalContent = stats?.totalContent ?? 0;
  const engagement   = (stats?.totalSaves ?? 0) + (stats?.totalApps ?? 0) + (stats?.totalEventRegs ?? 0);

  /* ─ Nav sous-pages ──────────────────────────────────────── */
  const subNav = [
    { href: "/admin/analytique",          label: "Vue d'ensemble", exact: true  },
    { href: "/admin/analytique/contenu",  label: "Contenu"                      },
    { href: "/admin/analytique/audience", label: "Audience"                     },
    { href: "/admin/analytique/engagement", label: "Engagement"                 },
  ];

  return (
    <div className="an-page">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="an-header">
        <div className="an-header-glow" />
        <div className="an-header-inner">
          <div>
            <div className="an-header-kicker">Analytique</div>
            <h1 className="an-header-title">
              Tableau de bord
              <em style={{ fontStyle: "italic", fontWeight: 200, color: PALETTE.gold }}> analytique</em>
            </h1>
            <p className="an-header-sub">Performance, audience et engagement — données en temps réel</p>
          </div>
          {/* Sélecteur période */}
          <div className="an-period-sel">
            {([30, 60, 90] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`an-period-btn ${period === p ? "an-period-btn--active" : ""}`}>
                {p}j
              </button>
            ))}
          </div>
        </div>

        {/* Sous-navigation */}
        <div className="an-subnav">
          {subNav.map(n => (
            <Link key={n.href} href={n.href} className="an-subnav-link an-subnav-link--active">
              {n.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="an-body">

        {loading ? (
          <div className="an-loading">
            <div className="an-loading-ring" />
            <span className="an-loading-text">Chargement des données…</span>
          </div>
        ) : (
          <>

            {/* ── KPI GRID ─────────────────────────────────── */}
            <div className="an-kpi-grid">
              <KpiMini label="Contenus publiés"   value={stats?.totalContent ?? 0}  sub={`${stats?.published ?? 0} actifs`}           color={PALETTE.gold}  Icon={IcoFile}  delta={8}  />
              <KpiMini label="Membres inscrits"   value={stats?.totalUsers ?? 0}    sub="comptes actifs"                               color={PALETTE.blue}  Icon={IcoUsers} delta={15} />
              <KpiMini label="Abonnés newsletter" value={stats?.totalAbonnes ?? 0}  sub={`${stats?.confirmedAbonnes ?? 0} confirmés`}  color={PALETTE.green} Icon={IcoMail}  delta={22} />
              <KpiMini label="Sauvegardes"        value={stats?.totalSaves ?? 0}    sub="contenus mis en favoris"                      color={PALETTE.teal}  Icon={IcoHeart} delta={9}  />
              <KpiMini label="Candidatures"       value={stats?.totalApps ?? 0}     sub="dossiers suivis"                              color={PALETTE.brown} Icon={IcoBrief} delta={12} />
              <KpiMini label="Inscriptions évèn." value={stats?.totalEventRegs ?? 0} sub="participants enregistrés"                   color={PALETTE.red}   Icon={IcoTrend} delta={6}  />
            </div>

            {/* ── TIMELINES ────────────────────────────────── */}
            <div className="an-grid-2">

              {/* Saves dans le temps */}
              <div className="an-card">
                <SH title="Sauvegardes" sub={`Évolution sur ${period} jours`} />
                <div style={{ marginTop: "0.5rem" }}>
                  <LineChart data={savesByDay} color={PALETTE.gold} height={140} width={520} />
                </div>
                <div className="an-chart-footer">
                  <span className="an-chip" style={{ background: `${PALETTE.gold}14`, color: PALETTE.gold }}>
                    {formatNumber(stats?.totalSaves ?? 0)} total
                  </span>
                  <span style={{ fontSize: "0.65rem", color: PALETTE.muted }}>Période de {period} jours</span>
                </div>
              </div>

              {/* Abonnés dans le temps */}
              <div className="an-card">
                <SH title="Nouvelles inscriptions newsletter" sub={`Évolution sur ${period} jours`} />
                <div style={{ marginTop: "0.5rem" }}>
                  <LineChart data={regByDay} color={PALETTE.green} height={140} width={520} />
                </div>
                <div className="an-chart-footer">
                  <span className="an-chip" style={{ background: `${PALETTE.green}14`, color: PALETTE.green }}>
                    {formatNumber(stats?.totalAbonnes ?? 0)} abonnés
                  </span>
                  <span style={{ fontSize: "0.65rem", color: PALETTE.muted }}>Taux de confirmation : {stats?.totalAbonnes ? Math.round(((stats?.confirmedAbonnes ?? 0) / stats.totalAbonnes) * 100) : 0}%</span>
                </div>
              </div>
            </div>

            {/* ── RÉPARTITION + TOP CONTENUS ───────────────── */}
            <div className="an-grid-3">

              {/* Donut répartition contenu */}
              <div className="an-card">
                <SH title="Répartition du contenu" />
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "1rem" }}>
                  <DonutChart
                    segments={breaking.map(b => ({ value: b.count, color: b.color, label: b.label }))}
                    size={130} thickness={24}
                  />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {breaking.map(b => {
                      const pct = totalContent > 0 ? Math.round((b.count / totalContent) * 100) : 0;
                      return (
                        <div key={b.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#38382E", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ width: 8, height: 8, borderRadius: 2, background: b.color, display: "inline-block" }} />
                              {b.label}
                            </span>
                            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.85rem", fontWeight: 900, color: b.color }}>{b.count}</span>
                          </div>
                          <div style={{ height: 3, background: "rgba(20,20,16,.06)", borderRadius: 100, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: b.color, borderRadius: 100 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Répartition catégories articles */}
              <div className="an-card">
                <SH title="Catégories d'actualités" />
                <div style={{ marginTop: "0.75rem" }}>
                  {catDist.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", fontSize: "0.8rem", color: PALETTE.muted }}>Aucune donnée</div>
                  ) : catDist.map((c, i) => {
                    const max = catDist[0].value;
                    return (
                      <div key={i} style={{ marginBottom: "0.7rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#38382E" }}>{c.label}</span>
                          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.82rem", fontWeight: 900, color: c.color }}>{c.value}</span>
                        </div>
                        <div style={{ height: 4, background: "rgba(20,20,16,.06)", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(c.value / max) * 100}%`, background: c.color, borderRadius: 100, transition: "width .8s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Engagement synthèse */}
              <div className="an-card an-card--dark">
                <div className="an-dark-kicker">Engagement total</div>
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2.8rem", fontWeight: 900, color: PALETTE.cream, lineHeight: 1, letterSpacing: "-0.04em", margin: "0.5rem 0 0.25rem" }}>
                  <CountUp n={engagement} />
                </div>
                <div style={{ fontSize: "0.7rem", color: "rgba(248,246,241,.35)", marginBottom: "1.5rem" }}>interactions cumulées</div>

                {[
                  { label: "Sauvegardes",  v: stats?.totalSaves ?? 0,    c: PALETTE.gold,  pct: engagement > 0 ? Math.round(((stats?.totalSaves ?? 0) / engagement) * 100) : 0 },
                  { label: "Candidatures", v: stats?.totalApps ?? 0,     c: PALETTE.green, pct: engagement > 0 ? Math.round(((stats?.totalApps ?? 0) / engagement) * 100) : 0 },
                  { label: "Évènements",  v: stats?.totalEventRegs ?? 0, c: PALETTE.blue,  pct: engagement > 0 ? Math.round(((stats?.totalEventRegs ?? 0) / engagement) * 100) : 0 },
                ].map(({ label, v, c, pct }) => (
                  <div key={label} style={{ marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "0.7rem", color: "rgba(248,246,241,.5)" }}>{label}</span>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
                        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.9rem", fontWeight: 900, color: c }}>{formatNumber(v)}</span>
                        <span style={{ fontSize: "0.58rem", color: "rgba(248,246,241,.25)" }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 3, background: "rgba(248,246,241,.08)", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 100 }} />
                    </div>
                  </div>
                ))}

                <Link href="/admin/analytique/engagement" className="an-dark-link">
                  Voir l&apos;analytique engagement <IcoArrow c={PALETTE.gold} />
                </Link>
              </div>
            </div>

            {/* ── TOP CONTENUS SAUVEGARDÉS ─────────────────── */}
            <div className="an-card">
              <SH title="Contenus les plus sauvegardés" sub={`Top sur ${period} jours`} action="Voir l'analytique contenu" href="/admin/analytique/contenu" />
              <div className="an-top-grid">
                {topSaves.length === 0 ? (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2.5rem", fontSize: "0.85rem", color: PALETTE.muted }}>
                    Aucune sauvegarde sur cette période.
                  </div>
                ) : topSaves.map((item, i) => {
                  const maxSaves = topSaves[0]?.saves || 1;
                  const c = typeColor[item.type] ?? PALETTE.muted;
                  return (
                    <div key={item.id} className="an-top-row">
                      <span className="an-top-num">{String(i + 1).padStart(2, "0")}</span>
                      <div style={{ width: 3, height: 28, borderRadius: 100, background: c, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.84rem", fontWeight: 700, color: PALETTE.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                        <span style={{ fontSize: "0.56rem", fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.1rem 0.45rem", borderRadius: 100, background: `${c}14`, color: c }}>
                          {typeLabel[item.type] ?? item.type}
                        </span>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.05rem", fontWeight: 900, color: c, lineHeight: 1 }}>{item.saves}</div>
                        <div style={{ height: 3, width: 60, background: "rgba(20,20,16,.07)", borderRadius: 100, marginTop: "0.3rem", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(item.saves / maxSaves) * 100}%`, background: c, borderRadius: 100 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── NAVIGATION SOUS-SECTIONS ─────────────────── */}
            <div className="an-subnav-cards">
              {[
                { href: "/admin/analytique/contenu",    title: "Analytique Contenu",   desc: "Performance des actualités, bourses, opportunités et événements par catégorie.",  color: PALETTE.gold,  Icon: IcoFile  },
                { href: "/admin/analytique/audience",   title: "Analytique Audience",  desc: "Profil des membres, répartition géographique et croissance des abonnés.",         color: PALETTE.blue,  Icon: IcoUsers },
                { href: "/admin/analytique/engagement", title: "Analytique Engagement",desc: "Sauvegardes, candidatures, inscriptions événements et taux de conversion.",        color: PALETTE.green, Icon: IcoHeart },
              ].map(({ href, title, desc, color, Icon }) => (
                <Link key={href} href={href} style={{ textDecoration: "none" }}>
                  <div className="an-nav-card">
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}14`, border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <Icon c={color} />
                    </div>
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", fontWeight: 900, color: PALETTE.ink, marginBottom: "0.4rem", letterSpacing: "-0.02em" }}>{title}</div>
                    <p style={{ fontSize: "0.75rem", color: PALETTE.muted, lineHeight: 1.6, margin: "0 0 1rem" }}>{desc}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", fontWeight: 700, color }}>
                      Voir l&apos;analyse <IcoArrow c={color} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </>
        )}
      </div>
    </div>
  );
}