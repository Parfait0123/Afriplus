"use client";

/**
 * app/admin/opportunites/page.tsx
 * Design : même structure que admin/evenements (header sombre, CSS classes)
 * Fonctionnalités : tri, filtres, bulk, suppression MDP, export CSV, remote, secteurs
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ── Types ── */
type OpportunityType = "Emploi CDI" | "Stage" | "Graduate" | "Emploi" | "Freelance" | "Volontariat";
const OPP_TYPES: OpportunityType[] = ["Emploi CDI", "Stage", "Graduate", "Emploi", "Freelance", "Volontariat"];
const TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  "Emploi CDI":  { color: "#1A5C40", bg: "#EAF4EF" },
  "Stage":       { color: "#1E4DA8", bg: "#EBF0FB" },
  "Graduate":    { color: "#C08435", bg: "#FBF4E8" },
  "Emploi":      { color: "#2E7D4F", bg: "#E6F4EC" },
  "Freelance":   { color: "#7A4A1E", bg: "#F9F0E8" },
  "Volontariat": { color: "#928E80", bg: "#F0EDE4" },
};

type SortField = "deadline" | "title" | "company" | "created_at" | "views" | "saves_count";
type SortDir   = "asc" | "desc";
type FilterStatus = "all" | "published" | "draft" | "featured" | "remote";

interface OpportunityRow {
  id: string; slug: string; title: string; company: string;
  company_initials: string; location: string; country: string;
  flag: string; type: OpportunityType; sector: string;
  deadline: string | null; posted_at: string;
  salary: string | null; remote: boolean; featured: boolean;
  cover_url: string | null; image_gradient: string;
  skills: string[]; published: boolean;
  views: number; saves_count: number;
  created_at: string; updated_at: string;
}
interface Stats {
  total: number; published: number; draft: number;
  featured: number; remote: number;
  totalViews: number; totalSaves: number;
}

/* ── Icônes ── */
const IcoPlus     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoRefresh  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.78"/></svg>;
const IcoSearch   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoEdit     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoEye      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoTrash    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IcoExport   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IcoStar     = ({ filled }: { filled?: boolean }) => <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoChevD    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoChevU    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>;
const IcoChevL    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoChevR    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoPwdShow  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoPwdHide  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

/* ── Pill type ── */
function TypePill({ type }: { type: string }) {
  const s = TYPE_STYLE[type] ?? { color: "#928E80", bg: "#F0EDE4" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: ".3rem",
      fontSize: ".58rem", fontWeight: 800, letterSpacing: ".1em",
      textTransform: "uppercase", padding: ".2rem .7rem",
      borderRadius: 100, background: s.bg, color: s.color, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {type}
    </span>
  );
}

const PAGE_SIZE = 15;

export default function AdminOpportunitesPage() {
  const sb     = createClient();
  const router = useRouter();

  const [items,    setItems]    = useState<OpportunityRow[]>([]);
  const [stats,    setStats]    = useState<Stats>({ total:0, published:0, draft:0, featured:0, remote:0, totalViews:0, totalSaves:0 });
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [searchQ,  setSearchQ]  = useState("");
  const [oppType,  setOppType]  = useState<OpportunityType | "">("");
  const [sector,   setSector]   = useState("");
  const [sectors,  setSectors]  = useState<string[]>([]);
  const [status,   setStatus]   = useState<FilterStatus>("all");
  const [sort,     setSort]     = useState<SortField>("created_at");
  const [dir,      setDir]      = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState<{msg:string;ok:boolean}|null>(null);

  /* ── Modal suppression MDP ── */
  const [delModal,   setDelModal]   = useState<string[] | null>(null);
  const [delPwd,     setDelPwd]     = useState("");
  const [delErr,     setDelErr]     = useState("");
  const [delLoading, setDelLoading] = useState(false);
  const [delShow,    setDelShow]    = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  /* ── Secteurs ── */
  useEffect(() => {
    sb.from("opportunities").select("sector").then(({ data }) => {
      if (data) {
        const unique = [...new Set(data.map((d: any) => d.sector).filter(Boolean))];
        setSectors((unique as string[]).sort());
      }
    });
  }, []);

  /* ── Stats ── */
  const loadStats = useCallback(async () => {
    const [
      { count: tot }, { count: pub }, { count: feat }, { count: rem },
      viewsRes, savesRes,
    ] = await Promise.all([
      sb.from("opportunities").select("id", { count: "exact", head: true }),
      sb.from("opportunities").select("id", { count: "exact", head: true }).eq("published", true),
      sb.from("opportunities").select("id", { count: "exact", head: true }).eq("featured", true),
      sb.from("opportunities").select("id", { count: "exact", head: true }).eq("remote", true),
      sb.from("opportunities").select("views"),
      sb.from("opportunities").select("saves_count"),
    ]);
    const totalViews = (viewsRes.data ?? []).reduce((s: number, a: any) => s + (a.views || 0), 0);
    const totalSaves = (savesRes.data ?? []).reduce((s: number, a: any) => s + (a.saves_count || 0), 0);
    setStats({ total: tot ?? 0, published: pub ?? 0, draft: (tot ?? 0) - (pub ?? 0), featured: feat ?? 0, remote: rem ?? 0, totalViews, totalSaves });
  }, []);

  /* ── Chargement ── */
  const load = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    let q = sb.from("opportunities")
      .select("id,slug,title,company,company_initials,location,country,flag,type,sector,deadline,posted_at,salary,remote,featured,cover_url,image_gradient,skills,published,views,saves_count,created_at,updated_at", { count: "exact" })
      .order(sort, { ascending: dir === "asc" })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (search)                    q = q.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
    if (oppType)                   q = q.eq("type", oppType);
    if (sector)                    q = q.eq("sector", sector);
    if (status === "published")    q = q.eq("published", true);
    else if (status === "draft")   q = q.eq("published", false);
    else if (status === "featured")q = q.eq("featured", true);
    else if (status === "remote")  q = q.eq("remote", true);
    const { data, count, error } = await q;
    if (error) { showToast("Erreur de chargement", false); }
    else { setItems((data ?? []) as OpportunityRow[]); setTotal(count ?? 0); }
    setLoading(false);
  }, [page, search, oppType, sector, status, sort, dir]);

  useEffect(() => { load(); loadStats(); }, [load, loadStats]);

  const toggleSort = (f: SortField) => {
    if (sort === f) setDir(d => d === "asc" ? "desc" : "asc");
    else { setSort(f); setDir(f === "deadline" ? "asc" : "desc"); }
    setPage(1);
  };
  const SortIcon = ({ f }: { f: SortField }) =>
    sort === f ? (dir === "asc" ? <IcoChevU /> : <IcoChevD />) : <span style={{ opacity: .2 }}><IcoChevD /></span>;

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map(i => i.id)));
  };

  const togglePublished = async (id: string, cur: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    await (sb.from("opportunities") as any).update({ published: !cur }).eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, published: !cur } : i));
    loadStats();
    showToast(cur ? "Opportunité dépubliée" : "Opportunité publiée");
  };

  const toggleFeatured = async (id: string, cur: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    await (sb.from("opportunities") as any).update({ featured: !cur }).eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, featured: !cur } : i));
    showToast(cur ? "Mise en avant retirée" : "Mise en avant activée");
  };

  const bulkPublish = async (ids: string[], pub: boolean) => {
    await (sb.from("opportunities") as any).update({ published: pub }).in("id", ids);
    setItems(prev => prev.map(i => ids.includes(i.id) ? { ...i, published: pub } : i));
    setSelected(new Set()); loadStats();
    showToast(`${ids.length} opportunité${ids.length > 1 ? "s" : ""} ${pub ? "publiées" : "dépubliées"}`);
  };

  const confirmDelete = async () => {
    if (!delPwd) { setDelErr("Entrez votre mot de passe."); return; }
    setDelLoading(true); setDelErr("");
    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.auth.signInWithPassword({ email: user?.email ?? "", password: delPwd });
    if (error) { setDelLoading(false); setDelErr("Mot de passe incorrect."); setDelPwd(""); return; }
    const ids = delModal!;
    await (sb.from("opportunities") as any).delete().in("id", ids);
    setItems(prev => prev.filter(i => !ids.includes(i.id)));
    loadStats(); setDelModal(null); setDelPwd(""); setDelLoading(false);
    showToast(`${ids.length} opportunité${ids.length > 1 ? "s" : ""} supprimée${ids.length > 1 ? "s" : ""}`);
  };

  const exportCSV = async () => {
    let q = sb.from("opportunities")
      .select("title,company,type,sector,location,country,remote,featured,deadline,published,views,saves_count")
      .order(sort, { ascending: dir === "asc" });
    if (search)  q = q.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
    if (oppType) q = q.eq("type", oppType);
    if (sector)  q = q.eq("sector", sector);
    if (status === "published") q = q.eq("published", true);
    if (status === "draft")     q = q.eq("published", false);
    if (status === "featured")  q = q.eq("featured", true);
    if (status === "remote")    q = q.eq("remote", true);
    const { data } = await q;
    if (!data) return;
    const esc = (s: string) => `"${String(s).replace(/"/g,'""')}"`;
    const rows = [
      ["Titre","Entreprise","Type","Secteur","Localisation","Pays","Remote","Vedette","Deadline","Statut","Vues","Saves"].join(","),
      ...data.map((o: any) => [esc(o.title),esc(o.company),o.type,o.sector||"",esc(o.location||""),esc(o.country||""),o.remote?"Oui":"Non",o.featured?"Oui":"Non",o.deadline||"",o.published?"Publié":"Brouillon",o.views,o.saves_count].join(",")),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "opportunites.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };
  const daysLeft = (deadline: string | null) => {
    if (!deadline) return <span style={{ color:"#928E80", fontSize:".65rem" }}>—</span>;
    const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (d < 0)   return <span style={{ color:"#B8341E", fontWeight:700, fontSize:".65rem" }}>Expirée</span>;
    if (d <= 7)  return <span style={{ color:"#B8341E", fontWeight:700, fontSize:".65rem" }}>{d}j</span>;
    if (d <= 30) return <span style={{ color:"#C08435", fontWeight:700, fontSize:".65rem" }}>{d}j</span>;
    return <span style={{ color:"#928E80", fontSize:".65rem" }}>{d}j</span>;
  };
  const fmtNum = (n: number) => n?.toLocaleString("fr-FR") || "0";

  return (
    <>
      {/* ── CSS (même structure que événements) ── */}
      <style>{`
        .aop-wrap { max-width:1380px; margin:0 auto; padding:0 clamp(1rem,3vw,2.5rem); }
        .aop-btn {
          display:inline-flex; align-items:center; gap:.4rem;
          padding:.55rem 1.1rem; border-radius:10px; border:none; cursor:pointer;
          font-size:.72rem; font-weight:700; letter-spacing:.04em; transition:all .18s;
          font-family:inherit;
        }
        .aop-btn:disabled { opacity:.5; cursor:not-allowed; }
        .aop-btn-primary { background:#141410; color:#F8F6F1; }
        .aop-btn-primary:hover:not(:disabled) { background:#2a2a20; }
        .aop-btn-gold { background:#C08435; color:#fff; }
        .aop-btn-gold:hover:not(:disabled) { background:#a8702b; }
        .aop-btn-ghost { background:transparent; color:#928E80; border:1px solid rgba(20,20,16,.12); }
        .aop-btn-ghost:hover:not(:disabled) { background:rgba(20,20,16,.05); color:#38382E; }
        .aop-btn-ghost-light { background:transparent; color:rgba(248,246,241,.6); border:1px solid rgba(248,246,241,.15); }
        .aop-btn-ghost-light:hover:not(:disabled) { background:rgba(248,246,241,.08); color:#F8F6F1; }
        .aop-input {
          width:100%; padding:.6rem .9rem; border-radius:10px;
          border:1px solid rgba(20,20,16,.12); background:#fff;
          font-size:.8rem; color:#38382E; outline:none; font-family:inherit;
          transition:border .18s;
        }
        .aop-input:focus { border-color:#C08435; }
        .aop-select {
          padding:.55rem .85rem; border-radius:10px;
          border:1px solid rgba(20,20,16,.12); background:#fff;
          font-size:.75rem; color:#38382E; outline:none; cursor:pointer; font-family:inherit;
          transition:border .18s;
        }
        .aop-select:focus { border-color:#C08435; }
        .aop-table-wrap {
          background:#fff; border-radius:16px;
          border:1px solid rgba(20,20,16,.08);
          overflow-x:auto; box-shadow:0 2px 24px rgba(20,20,16,.05);
        }
        .aop-table { width:100%; border-collapse:collapse; min-width:900px; }
        .aop-th {
          padding:.75rem 1rem; text-align:left;
          font-size:.58rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase;
          color:#928E80; background:#FAFAF8;
          border-bottom:1px solid rgba(20,20,16,.07);
          white-space:nowrap; cursor:default; user-select:none;
        }
        .aop-th.sortable { cursor:pointer; }
        .aop-th.sortable:hover { color:#141410; }
        .aop-td {
          padding:.85rem 1rem; vertical-align:middle;
          border-bottom:1px solid rgba(20,20,16,.055);
          font-size:.78rem; color:#38382E;
        }
        .aop-row { transition:background .15s; cursor:pointer; }
        .aop-row:hover { background:#FAFAF8; }
        .aop-row:last-child .aop-td { border-bottom:none; }
        .aop-action-btn {
          display:inline-flex; align-items:center; justify-content:center;
          width:30px; height:30px; border-radius:8px; border:1px solid rgba(20,20,16,.1);
          background:transparent; cursor:pointer; transition:all .18s; color:#928E80;
        }
        .aop-action-btn:hover { background:rgba(20,20,16,.06); color:#38382E; }
        .aop-action-btn:disabled { opacity:.4; cursor:not-allowed; }
        .aop-toggle {
          position:relative; display:inline-flex; align-items:center;
          width:38px; height:22px; border-radius:100px;
          border:none; cursor:pointer; transition:background .2s; flex-shrink:0;
        }
        .aop-toggle-thumb {
          position:absolute; width:16px; height:16px; border-radius:50%;
          background:#fff; transition:transform .2s;
          box-shadow:0 1px 4px rgba(0,0,0,.2);
        }
        .aop-page-btn {
          display:inline-flex; align-items:center; justify-content:center;
          min-width:32px; height:32px; padding:0 .4rem; border-radius:8px;
          border:1px solid rgba(20,20,16,.12); background:transparent;
          font-size:.72rem; font-weight:600; color:#38382E; cursor:pointer; font-family:inherit;
          transition:all .15s;
        }
        .aop-page-btn:hover { background:rgba(20,20,16,.06); }
        .aop-page-btn.active { background:#141410; color:#fff; border-color:#141410; }
        .aop-page-btn:disabled { opacity:.35; cursor:not-allowed; }
        .aop-spinner {
          width:36px; height:36px; border-radius:50%;
          border:3px solid rgba(20,20,16,.08); border-top-color:#C08435;
          animation:aop-spin .8s linear infinite; margin:0 auto 1rem;
        }
        .aop-gradient-thumb {
          width:44px; height:44px; border-radius:10px; flex-shrink:0;
          overflow:hidden; position:relative;
        }
        @keyframes aop-spin { to { transform:rotate(360deg); } }
        @keyframes aop-slide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes aop-modal { from{opacity:0;transform:scale(.93) translateY(14px)} to{opacity:1;transform:none} }
        @keyframes aop-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
        @keyframes aop-back { from{opacity:0} to{opacity:1} }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:9999,
          background: toast.ok ? "#141410" : "#B8341E", color:"#F8F6F1",
          padding:".85rem 1.4rem", borderRadius:14, fontSize:".82rem", fontWeight:600,
          boxShadow:"0 8px 32px rgba(20,20,16,.3)", animation:"aop-slide .25s ease",
        }}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* ── Modal suppression MDP ── */}
      {delModal !== null && (
        <div
          style={{ position:"fixed", inset:0, zIndex:9900, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", animation:"aop-back .18s ease" }}
          onClick={e => { if (e.target === e.currentTarget) { setDelModal(null); setDelPwd(""); setDelErr(""); } }}
        >
          <div style={{ position:"absolute", inset:0, background:"rgba(14,13,10,.75)", backdropFilter:"blur(10px)" }} />
          <div style={{
            position:"relative", background:"#18170F", borderRadius:28, padding:"2.5rem",
            maxWidth:420, width:"100%", border:"1px solid rgba(248,246,241,.08)",
            boxShadow:"0 40px 100px rgba(0,0,0,.6)",
            animation:"aop-modal .28s cubic-bezier(.34,1.4,.64,1)",
          }}>
            <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:2, background:"linear-gradient(90deg,transparent,#B8341E,transparent)", borderRadius:100 }} />
            <div style={{ width:48, height:48, borderRadius:16, marginBottom:"1.25rem", background:"rgba(184,52,30,.12)", border:"1px solid rgba(184,52,30,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#B8341E" }}>
              <IcoTrash />
            </div>
            <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"1.25rem", fontWeight:900, color:"#F8F6F1", marginBottom:".4rem", letterSpacing:"-.03em" }}>
              Supprimer {delModal.length > 1 ? `${delModal.length} opportunités` : "cette opportunité"} ?
            </div>
            <p style={{ fontSize:".82rem", color:"rgba(248,246,241,.45)", lineHeight:1.7, marginBottom:"1.75rem" }}>
              Action <span style={{ color:"#F8F6F1", fontWeight:600 }}>irréversible</span>. Confirmez votre identité.
            </p>
            <div style={{ marginBottom:"1.25rem" }}>
              <label style={{ fontSize:".58rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(248,246,241,.35)", display:"block", marginBottom:".5rem" }}>Mot de passe</label>
              <div style={{ position:"relative", animation: delErr ? "aop-shake .35s ease" : "none" }}>
                <input
                  type={delShow ? "text" : "password"}
                  value={delPwd}
                  onChange={e => { setDelPwd(e.target.value); setDelErr(""); }}
                  onKeyDown={e => { if (e.key === "Enter") confirmDelete(); }}
                  placeholder="••••••••••••"
                  autoFocus
                  style={{
                    width:"100%", padding:".75rem 3rem .75rem 1.1rem", borderRadius:14,
                    fontSize:".9rem", color:"#F8F6F1", fontFamily:"inherit", boxSizing:"border-box",
                    border:`1.5px solid ${delErr ? "rgba(184,52,30,.6)" : "rgba(248,246,241,.1)"}`,
                    background: delErr ? "rgba(184,52,30,.06)" : "rgba(248,246,241,.05)", outline:"none",
                  }}
                />
                <button type="button" onClick={() => setDelShow(v => !v)}
                  style={{ position:"absolute", right:".9rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(248,246,241,.35)", display:"flex", alignItems:"center", padding:0 }}>
                  {delShow ? <IcoPwdHide /> : <IcoPwdShow />}
                </button>
              </div>
              {delErr && <div style={{ marginTop:".4rem", fontSize:".72rem", color:"#F4866A", fontWeight:600 }}>⚠ {delErr}</div>}
            </div>
            <div style={{ display:"flex", gap:".6rem" }}>
              <button onClick={() => { setDelModal(null); setDelPwd(""); setDelErr(""); }}
                style={{ flex:1, padding:".72rem", borderRadius:12, cursor:"pointer", fontFamily:"inherit", fontSize:".82rem", fontWeight:600, background:"rgba(248,246,241,.06)", color:"rgba(248,246,241,.6)", border:"1px solid rgba(248,246,241,.08)" }}>
                Annuler
              </button>
              <button onClick={confirmDelete} disabled={delLoading || !delPwd}
                style={{ flex:1, padding:".72rem", borderRadius:12, cursor: delLoading || !delPwd ? "default":"pointer", fontFamily:"inherit", fontSize:".82rem", fontWeight:700, border:"none", background: delLoading || !delPwd ? "rgba(184,52,30,.3)":"linear-gradient(135deg,#C0392B,#922B21)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:".45rem" }}>
                {delLoading
                  ? <><div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", animation:"aop-spin .7s linear infinite" }} /> Vérification…</>
                  : "Supprimer définitivement"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background:"#F5F3EE", minHeight:"100vh", paddingBottom:"4rem" }}>

        {/* ══ HEADER SOMBRE (style événements) ══ */}
        <div style={{ background:"#141410", borderBottom:"3px solid #1A5C40", padding:"2rem 0 1.75rem" }}>
          <div className="aop-wrap">
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"1.5rem", flexWrap:"wrap" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:".65rem", marginBottom:".5rem" }}>
                  <Link href="/admin" style={{ fontSize:".6rem", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(248,246,241,.35)", textDecoration:"none" }}>
                    Admin
                  </Link>
                  <span style={{ color:"rgba(248,246,241,.2)" }}>›</span>
                  <span style={{ fontSize:".6rem", fontWeight:800, letterSpacing:".1em", textTransform:"uppercase", color:"#1A5C40" }}>
                    Opportunités
                  </span>
                </div>
                <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:900, color:"#F8F6F1", letterSpacing:"-.03em", margin:0 }}>
                  Gestion des Opportunités
                </h1>
                <p style={{ fontSize:".75rem", color:"rgba(248,246,241,.4)", marginTop:".35rem" }}>
                  {stats.total} opportunité{stats.total !== 1 ? "s" : ""} au total
                </p>
              </div>
              <div style={{ display:"flex", gap:".75rem", flexWrap:"wrap" }}>
                <button className="aop-btn aop-btn-ghost-light" onClick={() => { load(); loadStats(); }}>
                  <IcoRefresh /> Actualiser
                </button>
                <button className="aop-btn aop-btn-ghost-light" onClick={exportCSV}>
                  <IcoExport /> Exporter CSV
                </button>
                <Link href="/admin/opportunites/nouveau">
                  <button className="aop-btn" style={{ background:"#1A5C40", color:"#fff" }}>
                    <IcoPlus /> Nouvelle opportunité
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats dans le header */}
            <div style={{ display:"flex", gap:"1rem", marginTop:"1.5rem", flexWrap:"wrap" }}>
              {[
                { label:"Total",       value: stats.total,      color:"#F8F6F1", sub:"opportunités" },
                { label:"Publiées",    value: stats.published,  color:"#6FCF97", sub:"en ligne" },
                { label:"Brouillons",  value: stats.draft,      color:"#928E80", sub:"non publiés" },
                { label:"En vedette",  value: stats.featured,   color:"#C08435", sub:"mis en avant" },
                { label:"Remote",      value: stats.remote,     color:"#5A7FD4", sub:"à distance" },
                { label:"Vues totales",value: stats.totalViews, color:"#4A9E6F", sub:"impressions" },
              ].map(s => (
                <div key={s.label} style={{ background:"rgba(248,246,241,.06)", border:"1px solid rgba(248,246,241,.1)", borderRadius:12, padding:".75rem 1.25rem" }}>
                  <div style={{ fontSize:"1.5rem", fontWeight:900, color:s.color, fontFamily:"'Fraunces',Georgia,serif", lineHeight:1 }}>
                    {fmtNum(s.value)}
                  </div>
                  <div style={{ fontSize:".58rem", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"rgba(248,246,241,.35)", marginTop:".2rem" }}>
                    {s.label} · {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ FILTRES (sticky, style événements) ══ */}
        <div style={{ background:"#fff", borderBottom:"1px solid rgba(20,20,16,.07)", padding:"1rem 0", position:"sticky", top:0, zIndex:10, boxShadow:"0 2px 12px rgba(20,20,16,.05)" }}>
          <div className="aop-wrap">
            <div style={{ display:"flex", gap:".75rem", alignItems:"center", flexWrap:"wrap" }}>
              {/* Recherche */}
              <div style={{ position:"relative", flex:"1", minWidth:"220px", maxWidth:"380px" }}>
                <span style={{ position:"absolute", left:".8rem", top:"50%", transform:"translateY(-50%)", color:"#928E80", pointerEvents:"none" }}>
                  <IcoSearch />
                </span>
                <input className="aop-input" style={{ paddingLeft:"2.2rem" }}
                  placeholder="Rechercher titre, entreprise…"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { setSearch(searchQ); setPage(1); } }}
                />
              </div>

              {/* Type */}
              <select className="aop-select" value={oppType} onChange={e => { setOppType(e.target.value as OpportunityType | ""); setPage(1); }}>
                <option value="">Tous les types</option>
                {OPP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {/* Secteur */}
              {sectors.length > 0 && (
                <select className="aop-select" value={sector} onChange={e => { setSector(e.target.value); setPage(1); }}>
                  <option value="">Tous secteurs</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}

              {/* Statut */}
              <select className="aop-select" value={status} onChange={e => { setStatus(e.target.value as FilterStatus); setPage(1); }}>
                <option value="all">Tous les statuts</option>
                <option value="published">Publiées</option>
                <option value="draft">Brouillons</option>
                <option value="featured">En vedette</option>
                <option value="remote">Remote</option>
              </select>

              {(search || oppType || sector || status !== "all") && (
                <button className="aop-btn aop-btn-ghost" onClick={() => { setSearch(""); setSearchQ(""); setOppType(""); setSector(""); setStatus("all"); setPage(1); }}>
                  ✕ Réinitialiser
                </button>
              )}

              <div style={{ marginLeft:"auto", fontSize:".72rem", color:"#928E80", whiteSpace:"nowrap" }}>
                {total} résultat{total !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* ══ CORPS ══ */}
        <div className="aop-wrap" style={{ paddingTop:"1.75rem" }}>

          {/* Raccourcis types */}
          <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap", marginBottom:"1.25rem" }}>
            {(["" , ...OPP_TYPES] as (OpportunityType | "")[]).map(t => {
              const active = oppType === t;
              const s = TYPE_STYLE[t as string];
              const count = t === "" ? stats.total : items.filter(i => i.type === t).length;
              return (
                <button key={t || "all"} onClick={() => { setOppType(t); setPage(1); }}
                  style={{
                    padding:".3rem .85rem", borderRadius:100, cursor:"pointer",
                    border: active ? "none" : "1px solid rgba(20,20,16,.12)",
                    background: active ? (s?.color ?? "#141410") : "#fff",
                    color: active ? "#fff" : "#928E80",
                    fontSize:".6rem", fontWeight:700, letterSpacing:".08em",
                    textTransform:"uppercase", fontFamily:"inherit", transition:"all .18s",
                  }}>
                  {t || "Tout"}{" "}
                  <span style={{ opacity:.6, fontWeight:400, fontSize:".55rem" }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Bulk bar */}
          {selected.size > 0 && (
            <div style={{ background:"#141410", borderRadius:12, padding:".85rem 1.4rem", marginBottom:"1rem", display:"flex", alignItems:"center", gap:"1rem", boxShadow:"0 4px 16px rgba(20,20,16,.2)", animation:"aop-slide .2s ease" }}>
              <span style={{ fontSize:".78rem", fontWeight:700, color:"#1A5C40" }}>{selected.size} sélectionnée{selected.size > 1 ? "s" : ""}</span>
              <div style={{ width:1, height:18, background:"rgba(255,255,255,.1)" }} />
              <button onClick={() => bulkPublish(Array.from(selected), true)} style={{ fontFamily:"inherit", fontSize:".75rem", fontWeight:600, color:"#4A9E6F", background:"rgba(74,158,111,.12)", border:"none", padding:".38rem .85rem", borderRadius:100, cursor:"pointer" }}>Publier tout</button>
              <button onClick={() => bulkPublish(Array.from(selected), false)} style={{ fontFamily:"inherit", fontSize:".75rem", fontWeight:600, color:"#C08435", background:"rgba(192,132,53,.12)", border:"none", padding:".38rem .85rem", borderRadius:100, cursor:"pointer" }}>Dépublier tout</button>
              <button onClick={() => { setDelModal(Array.from(selected)); setDelPwd(""); setDelErr(""); }} style={{ fontFamily:"inherit", fontSize:".75rem", fontWeight:600, color:"#C25B3F", background:"rgba(194,91,63,.12)", border:"none", padding:".38rem .85rem", borderRadius:100, cursor:"pointer" }}>Supprimer</button>
              <button onClick={() => setSelected(new Set())} style={{ marginLeft:"auto", fontFamily:"inherit", fontSize:".72rem", color:"rgba(255,255,255,.4)", background:"none", border:"none", cursor:"pointer" }}>Annuler</button>
            </div>
          )}

          {/* Tableau */}
          {loading ? (
            <div style={{ textAlign:"center", padding:"4rem 0" }}>
              <div className="aop-spinner" />
              <p style={{ color:"#928E80", fontSize:".8rem" }}>Chargement des opportunités…</p>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign:"center", padding:"5rem 2rem" }}>
              <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"3rem", color:"rgba(20,20,16,.1)", marginBottom:".5rem" }}>💼</div>
              <p style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"1.4rem", color:"rgba(20,20,16,.2)", fontWeight:900 }}>
                Aucune opportunité trouvée
              </p>
              <p style={{ color:"#928E80", fontSize:".8rem", marginTop:".4rem" }}>
                {search || oppType || sector || status !== "all" ? "Essayez de modifier vos filtres." : "Créez votre première opportunité."}
              </p>
              {!search && !oppType && !sector && status === "all" && (
                <Link href="/admin/opportunites/nouveau">
                  <button className="aop-btn" style={{ marginTop:"1.5rem", background:"#1A5C40", color:"#fff" }}>
                    <IcoPlus /> Créer une opportunité
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="aop-table-wrap">
              <table className="aop-table">
                <thead>
                  <tr>
                    <th className="aop-th" style={{ width:40 }}>
                      <input type="checkbox"
                        checked={selected.size > 0 && selected.size === items.length}
                        ref={el => { if (el) el.indeterminate = selected.size > 0 && selected.size < items.length; }}
                        onChange={toggleAll}
                        style={{ width:14, height:14, cursor:"pointer", accentColor:"#1A5C40" }}
                      />
                    </th>
                    <th className="aop-th sortable" onClick={() => toggleSort("title")}>
                      <span style={{ display:"flex", alignItems:"center", gap:".3rem" }}>Opportunité <SortIcon f="title" /></span>
                    </th>
                    <th className="aop-th">Type</th>
                    <th className="aop-th sortable" onClick={() => toggleSort("company")}>
                      <span style={{ display:"flex", alignItems:"center", gap:".3rem" }}>Entreprise <SortIcon f="company" /></span>
                    </th>
                    <th className="aop-th">Secteur</th>
                    <th className="aop-th sortable" onClick={() => toggleSort("deadline")}>
                      <span style={{ display:"flex", alignItems:"center", gap:".3rem" }}>Deadline <SortIcon f="deadline" /></span>
                    </th>
                    <th className="aop-th sortable" onClick={() => toggleSort("views")}>
                      <span style={{ display:"flex", alignItems:"center", gap:".3rem" }}>Vues <SortIcon f="views" /></span>
                    </th>
                    <th className="aop-th" style={{ textAlign:"center" }}>En ligne</th>
                    <th className="aop-th" style={{ textAlign:"center" }}>Vedette</th>
                    <th className="aop-th" style={{ textAlign:"right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const isSel = selected.has(item.id);
                    return (
                      <tr key={item.id} className="aop-row"
                        onClick={() => router.push(`/admin/opportunites/${item.id}`)}
                        style={{ background: isSel ? "rgba(26,92,64,.03)" : undefined }}>

                        {/* Checkbox */}
                        <td className="aop-td" onClick={e => toggleSelect(item.id, e)}>
                          <input type="checkbox" checked={isSel} onChange={() => {}}
                            style={{ width:14, height:14, cursor:"pointer", accentColor:"#1A5C40" }} />
                        </td>

                        {/* Opportunité */}
                        <td className="aop-td" style={{ maxWidth:260 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
                            <div className="aop-gradient-thumb" style={{ background: item.image_gradient || "#0a0800" }}>
                              {item.cover_url
                                ? <img src={item.cover_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", position:"absolute", inset:0 }} />
                                : <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Fraunces',Georgia,serif", fontSize:".72rem", fontWeight:900, color:"#fff", opacity:.85 }}>
                                    {item.company_initials || item.company?.slice(0,2).toUpperCase()}
                                  </div>
                              }
                              {item.featured && (
                                <div style={{ position:"absolute", top:2, right:2, width:8, height:8, borderRadius:"50%", background:"#C08435", border:"1.5px solid #fff" }} />
                              )}
                            </div>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontWeight:700, color:"#141410", fontSize:".82rem", lineHeight:1.35, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:".18rem" }}>
                                {item.title}
                              </div>
                              <div style={{ fontSize:".62rem", color:"#928E80", display:"flex", alignItems:"center", gap:".4rem" }}>
                                <span>{item.flag} {item.location || item.country}</span>
                                {item.remote && <span style={{ fontSize:".55rem", fontWeight:700, color:"#5A7FD4", background:"rgba(90,127,212,.1)", padding:".1rem .4rem", borderRadius:100 }}>Remote</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="aop-td"><TypePill type={item.type} /></td>

                        {/* Entreprise */}
                        <td className="aop-td">
                          <span style={{ fontSize:".78rem", color:"#38382E", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block", maxWidth:120 }}>
                            {item.company}
                          </span>
                        </td>

                        {/* Secteur */}
                        <td className="aop-td">
                          <span style={{ fontSize:".72rem", color:"#928E80" }}>{item.sector || "—"}</span>
                        </td>

                        {/* Deadline */}
                        <td className="aop-td">
                          <div style={{ fontSize:".72rem", color:"#38382E", fontWeight:500 }}>{fmtDate(item.deadline)}</div>
                          {daysLeft(item.deadline)}
                        </td>

                        {/* Vues */}
                        <td className="aop-td">
                          <span style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:".82rem", fontWeight:700, color:"#141410" }}>
                            {fmtNum(item.views)}
                          </span>
                        </td>

                        {/* Toggle publié */}
                        <td className="aop-td" style={{ textAlign:"center" }} onClick={e => e.stopPropagation()}>
                          <button className="aop-toggle" title={item.published ? "Dépublier" : "Publier"}
                            onClick={e => togglePublished(item.id, item.published, e)}
                            style={{ background: item.published ? "#1A5C40" : "rgba(20,20,16,.15)" }}>
                            <span className="aop-toggle-thumb" style={{ transform: item.published ? "translateX(18px)" : "translateX(3px)" }} />
                          </button>
                        </td>

                        {/* Toggle vedette */}
                        <td className="aop-td" style={{ textAlign:"center" }} onClick={e => e.stopPropagation()}>
                          <button className="aop-action-btn" title={item.featured ? "Retirer vedette" : "Mettre en vedette"}
                            onClick={e => toggleFeatured(item.id, item.featured, e)}
                            style={{ color: item.featured ? "#C08435":"#928E80", background: item.featured ? "#FDF4E7":"transparent", borderColor: item.featured ? "rgba(192,132,53,.25)":"rgba(20,20,16,.1)" }}>
                            <IcoStar filled={item.featured} />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="aop-td" onClick={e => e.stopPropagation()}>
                          <div style={{ display:"flex", gap:".35rem", justifyContent:"flex-end" }}>
                            <Link href={`/opportunites/${item.slug}${!item.published ? "?preview=1":""}`} target="_blank" rel="noopener noreferrer">
                              <button className="aop-action-btn" title="Prévisualiser"><IcoEye /></button>
                            </Link>
                            <Link href={`/admin/opportunites/${item.id}`}>
                              <button className="aop-action-btn" title="Modifier"
                                style={{ color:"#1A5C40", borderColor:"rgba(26,92,64,.2)", background:"rgba(26,92,64,.05)" }}>
                                <IcoEdit />
                              </button>
                            </Link>
                            <button className="aop-action-btn" title="Supprimer"
                              onClick={() => { setDelModal([item.id]); setDelPwd(""); setDelErr(""); }}
                              style={{ color:"#B8341E", borderColor:"rgba(184,52,30,.2)", background:"rgba(184,52,30,.05)" }}>
                              <IcoTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
              <span style={{ fontSize:".72rem", color:"#928E80" }}>
                Page {page} sur {totalPages} — {total} résultat{total !== 1 ? "s" : ""}
              </span>
              <div style={{ display:"flex", gap:".35rem" }}>
                <button className="aop-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><IcoChevL /></button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pg = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                  return (
                    <button key={pg} className={`aop-page-btn${page === pg ? " active" : ""}`} onClick={() => setPage(pg)}>
                      {pg}
                    </button>
                  );
                })}
                {totalPages > 7 && (
                  <>
                    <span style={{ padding:"0 .2rem", color:"#928E80" }}>…</span>
                    <button className={`aop-page-btn${page === totalPages ? " active" : ""}`} onClick={() => setPage(totalPages)}>
                      {totalPages}
                    </button>
                  </>
                )}
                <button className="aop-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><IcoChevR /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}