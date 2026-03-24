"use client";

/**
 * app/admin/bourses/page.tsx
 * Listing admin des bourses — version améliorée
 * Ajout : vues, saves_count, filtre domaine, tri enrichi
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ── Types ── */
type Level = "Licence"|"Master"|"Doctorat"|"Postdoc"|"Toutes formations";
const LEVELS: Level[] = ["Licence","Master","Doctorat","Postdoc","Toutes formations"];
const LEVEL_COLOR: Record<string, string> = {
  Licence: "#5A7FD4", Master: "#1A5C40", Doctorat: "#C08435",
  Postdoc: "#7A4A1E", "Toutes formations": "#928E80",
};
type SortField = "deadline"|"title"|"created_at"|"organization"|"views"|"saves_count";
type SortDir   = "asc"|"desc";
type FilterStatus = "all"|"published"|"draft"|"urgent";

interface ScholarshipRow {
  id: string; slug: string; title: string; organization: string;
  country: string; flag: string; level: Level; domain: string;
  deadline: string; urgent: boolean; amount: string | null;
  cover_url: string | null; image_gradient: string; tags: string[];
  published: boolean; views: number; saves_count: number;
  created_at: string; updated_at: string;
}
interface Stats { 
  total: number; published: number; draft: number; urgent: number; 
  totalViews: number; totalSaves: number;
}

/* ── Icônes ── */
const Ico = {
  Search:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Plus:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Eye:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Trash:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Export:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  ChevD:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevU:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>,
  ChevL:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevR:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
  Alert:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Trending:() => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Bookmark:() => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
  PwdShow: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  PwdHide: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
};

const PAGE_SIZE = 15;
const GRID = "20px 1fr 100px 120px 100px 90px 70px 70px 90px 120px 140px";

export default function AdminBoursesPage() {
  const sb     = createClient();
  const router = useRouter();

  const [items,    setItems]    = useState<ScholarshipRow[]>([]);
  const [stats,    setStats]    = useState<Stats>({ total:0, published:0, draft:0, urgent:0, totalViews:0, totalSaves:0 });
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [searchQ,  setSearchQ]  = useState("");
  const [level,    setLevel]    = useState<Level|"">("");
  const [domain,   setDomain]   = useState("");
  const [domains,  setDomains]  = useState<string[]>([]);
  const [status,   setStatus]   = useState<FilterStatus>("all");
  const [sort,     setSort]     = useState<SortField>("created_at");
  const [dir,      setDir]      = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState<{msg:string;ok:boolean}|null>(null);

  /* ── Modal suppression MDP ── */
  const [delModal,   setDelModal]   = useState<string[]|null>(null);
  const [delPwd,     setDelPwd]     = useState("");
  const [delErr,     setDelErr]     = useState("");
  const [delLoading, setDelLoading] = useState(false);
  const [delShow,    setDelShow]    = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const showToast = (msg:string, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3500); };

  /* ── Chargement des domaines distincts ── */
  useEffect(() => {
    sb.from("scholarships").select("domain").then(({ data }) => {
      if (data) {
        const uniqueDomains = [...new Set(data.map((d: any) => d.domain ? d.domain : "").filter(Boolean))];
        setDomains(uniqueDomains.sort());
      }
    });
  }, []);

  /* ── Stats améliorées ── */
  const loadStats = useCallback(async () => {
    const [{ count: tot }, { count: pub }, { count: urg }, viewsRes, savesRes] = await Promise.all([
      sb.from("scholarships").select("id", { count:"exact", head:true }),
      sb.from("scholarships").select("id", { count:"exact", head:true }).eq("published", true),
      sb.from("scholarships").select("id", { count:"exact", head:true }).eq("urgent", true),
      sb.from("scholarships").select("views"),
      sb.from("scholarships").select("saves_count"),
    ]);
    const totalViews = (viewsRes.data ?? []).reduce((s: number, a: any) => s + (a.views || 0), 0);
    const totalSaves = (savesRes.data ?? []).reduce((s: number, a: any) => s + (a.saves_count || 0), 0);
    setStats({ 
      total: tot??0, published: pub??0, 
      draft:(tot??0)-(pub??0), urgent: urg??0,
      totalViews, totalSaves 
    });
  }, []);

  /* ── Bourses (CORRIGÉE : les brouillons s'affichent maintenant) ── */
  const load = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    
    let q = sb
      .from("scholarships")
      .select("id,slug,title,organization,country,flag,level,domain,deadline,urgent,amount,cover_url,image_gradient,tags,published,views,saves_count,created_at,updated_at", { count: "exact" })
      .order(sort, { ascending: dir === "asc" })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    // Recherche textuelle
    if (search) {
      q = q.or(`title.ilike.%${search}%,organization.ilike.%${search}%`);
    }
    
    // Niveau
    if (level) {
      q = q.eq("level", level);
    }
    
    // Domaine
    if (domain) {
      q = q.eq("domain", domain);
    }
    
    // Statut : attention, "all" ne doit filtrer ni sur published ni sur draft
    if (status === "published") {
      q = q.eq("published", true);
    } else if (status === "draft") {
      q = q.eq("published", false);
    } else if (status === "urgent") {
      q = q.eq("urgent", true);
    }
    // "all" : aucun filtre sur published → affiche tous (publiés ET brouillons)

    const { data, count, error } = await q;

    if (error) {
      console.error("Erreur chargement bourses :", error);
      showToast("Erreur de chargement", false);
    } else {
      setItems((data ?? []) as ScholarshipRow[]);
      setTotal(count ?? 0);
    }
    
    setLoading(false);
  }, [page, search, level, domain, status, sort, dir]);

  useEffect(() => { load(); loadStats(); }, [load, loadStats]);

  const toggleSort = (f: SortField) => {
    if (sort===f) setDir(d => d==="asc"?"desc":"asc");
    else { setSort(f); setDir(f==="deadline"?"asc":"desc"); }
    setPage(1);
  };

  const toggleSelect = (id:string, e:React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selected.size===items.length) setSelected(new Set());
    else setSelected(new Set(items.map(i=>i.id)));
  };

  /* ── Toggle publié ── */
  const togglePublished = async (id:string, cur:boolean, e:React.MouseEvent) => {
    e.stopPropagation();
    await (sb.from("scholarships") as any).update({ published:!cur }).eq("id",id);
    setItems(prev=>prev.map(i=>i.id===id?{...i,published:!cur}:i));
    loadStats();
    showToast(cur?"Bourse dépubliée":"Bourse publiée");
  };

  /* ── Toggle urgent ── */
  const toggleUrgent = async (id:string, cur:boolean, e:React.MouseEvent) => {
    e.stopPropagation();
    await (sb.from("scholarships") as any).update({ urgent:!cur }).eq("id",id);
    setItems(prev=>prev.map(i=>i.id===id?{...i,urgent:!cur}:i));
    showToast(cur?"Urgence retirée":"Marqué urgent");
  };

  /* ── Bulk publish ── */
  const bulkPublish = async (ids:string[], pub:boolean) => {
    await (sb.from("scholarships") as any).update({ published:pub }).in("id",ids);
    setItems(prev=>prev.map(i=>ids.includes(i.id)?{...i,published:pub}:i));
    setSelected(new Set()); loadStats();
    showToast(`${ids.length} bourse${ids.length>1?"s":""} ${pub?"publiées":"dépubliées"}`);
  };

  /* ── Suppression avec MDP ── */
  const confirmDelete = async () => {
    if (!delPwd) { setDelErr("Entrez votre mot de passe."); return; }
    setDelLoading(true); setDelErr("");
    const { data:{ user } } = await sb.auth.getUser();
    const { error } = await sb.auth.signInWithPassword({ email: user?.email??"", password: delPwd });
    if (error) { setDelLoading(false); setDelErr("Mot de passe incorrect."); setDelPwd(""); return; }
    const ids = delModal!;
    await (sb.from("scholarships") as any).delete().in("id", ids);
    setItems(prev=>prev.filter(i=>!ids.includes(i.id)));
    loadStats(); setDelModal(null); setDelPwd(""); setDelLoading(false);
    showToast(`${ids.length} bourse${ids.length>1?"s":""} supprimée${ids.length>1?"s":""}`);
  };

  /* ── Export CSV amélioré ── */
  const exportCSV = async () => {
    let q = sb.from("scholarships")
      .select("title,organization,level,domain,deadline,country,urgent,published,views,saves_count")
      .order(sort, { ascending: dir==="asc" });
    if (search) q = q.or(`title.ilike.%${search}%,organization.ilike.%${search}%`);
    if (level) q = q.eq("level", level);
    if (domain) q = q.eq("domain", domain);
    if (status==="published") q = q.eq("published", true);
    if (status==="draft") q = q.eq("published", false);
    if (status==="urgent") q = q.eq("urgent", true);
    const { data } = await q;
    if (!data) return;
    const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const rows = [
      ["Titre","Organisation","Niveau","Domaine","Date limite","Pays","Urgent","Statut","Vues","Saves"].join(","),
      ...data.map((b: any) => [
        escape(b.title), escape(b.organization), b.level, b.domain || "", b.deadline,
        escape(b.country || ""), b.urgent?"Oui":"Non", b.published?"Publié":"Brouillon",
        b.views, b.saves_count
      ].join(",")),
    ].join("\n");
    const blob = new Blob([rows], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="bourses.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const fmtDate = (iso:string|null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" });
  };
  
  const daysLeft = (deadline:string) => {
    const d = Math.ceil((new Date(deadline).getTime()-Date.now())/(86400000));
    if (d<0) return <span style={{color:"#B8341E",fontWeight:700,fontSize:".65rem"}}>Expirée</span>;
    if (d<=7) return <span style={{color:"#B8341E",fontWeight:700,fontSize:".65rem"}}>{d}j</span>;
    if (d<=30) return <span style={{color:"#C08435",fontWeight:700,fontSize:".65rem"}}>{d}j</span>;
    return <span style={{color:"#928E80",fontSize:".65rem"}}>{d}j</span>;
  };

  const SortIcon = ({f}:{f:SortField}) =>
    sort===f ? (dir==="asc"?<Ico.ChevU/>:<Ico.ChevD/>) : <span style={{opacity:.2}}><Ico.ChevD/></span>;

  const fmtNum = (n: number) => n?.toLocaleString("fr-FR") || "0";

  return (
    <div style={{ padding:"2.5rem 3rem", minHeight:"100vh", background:"var(--bg2, #F0EDE4)" }}>
      <style>{`
        @keyframes bs-slide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes bs-modal { from{opacity:0;transform:scale(.93) translateY(14px)} to{opacity:1;transform:none} }
        @keyframes bs-back  { from{opacity:0} to{opacity:1} }
        @keyframes bs-spin  { to{transform:rotate(360deg)} }
        @keyframes bs-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
        .bs-tr { transition:background .12s; cursor:pointer; }
        .bs-tr:hover { background:#FAFAF8 !important; }
        .bs-act { transition:all .15s; }
        .bs-act:hover { opacity:.85; }
        .bs-sort:hover { color:#141410 !important; }
        .bs-pwd:focus { border-color:rgba(192,132,53,.7)!important; box-shadow:0 0 0 3px rgba(192,132,53,.12)!important; outline:none; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:9999,
          background:toast.ok?"#141410":"#B8341E", color:"#F8F6F1",
          padding:".85rem 1.4rem", borderRadius:14, fontSize:".82rem", fontWeight:600,
          boxShadow:"0 8px 32px rgba(20,20,16,.3)", animation:"bs-slide .25s ease" }}>
          {toast.ok?"✓":"✕"} {toast.msg}
        </div>
      )}

      {/* Modal suppression MDP (design luxe) */}
      {delModal !== null && (
        <div style={{ position:"fixed", inset:0, zIndex:9900, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", animation:"bs-back .18s ease" }}
          onClick={e=>{if(e.target===e.currentTarget){setDelModal(null);setDelPwd("");setDelErr("");}}}>
          <div style={{ position:"absolute", inset:0, background:"rgba(14,13,10,.75)", backdropFilter:"blur(10px)" }}/>
          <div style={{ position:"relative", background:"#18170F", borderRadius:28, padding:"2.5rem",
            maxWidth:420, width:"100%", border:"1px solid rgba(248,246,241,.08)",
            boxShadow:"0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(248,246,241,.04)",
            animation:"bs-modal .28s cubic-bezier(.34,1.4,.64,1)" }}>
            <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:2,
              background:"linear-gradient(90deg,transparent,#B8341E,transparent)", borderRadius:100 }}/>
            <div style={{ width:56, height:56, borderRadius:18, marginBottom:"1.4rem",
              background:"rgba(184,52,30,.12)", border:"1px solid rgba(184,52,30,.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 8px 24px rgba(184,52,30,.15)" }}>
              <Ico.Trash/>
            </div>
            <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"1.3rem", fontWeight:900,
              color:"#F8F6F1", marginBottom:".45rem", letterSpacing:"-.03em" }}>
              Supprimer {delModal.length>1?`${delModal.length} bourses`:"cette bourse"} ?
            </div>
            <p style={{ fontSize:".82rem", color:"rgba(248,246,241,.45)", lineHeight:1.7, marginBottom:"1.8rem" }}>
              Action <span style={{color:"#F8F6F1",fontWeight:600}}>irréversible</span>. Confirmez votre identité.
            </p>
            <div style={{ marginBottom:"1.25rem" }}>
              <label style={{ fontSize:".58rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase",
                color:"rgba(248,246,241,.35)", display:"block", marginBottom:".5rem" }}>Mot de passe</label>
              <div style={{ position:"relative", animation:delErr?"bs-shake .35s ease":"none" }}>
                <input className="bs-pwd" type={delShow?"text":"password"} value={delPwd}
                  onChange={e=>{setDelPwd(e.target.value);setDelErr("");}}
                  onKeyDown={e=>{if(e.key==="Enter")confirmDelete();}}
                  placeholder="••••••••••••" autoFocus
                  style={{ width:"100%", padding:".75rem 3rem .75rem 1.1rem", borderRadius:14,
                    fontSize:".9rem", color:"#F8F6F1", fontFamily:"inherit", boxSizing:"border-box",
                    border:`1.5px solid ${delErr?"rgba(184,52,30,.6)":"rgba(248,246,241,.1)"}`,
                    background:delErr?"rgba(184,52,30,.06)":"rgba(248,246,241,.05)",
                    transition:"all .15s" }}/>
                <button type="button" onClick={()=>setDelShow(v=>!v)}
                  style={{ position:"absolute", right:".9rem", top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", cursor:"pointer",
                    color:"rgba(248,246,241,.35)", display:"flex", alignItems:"center", padding:0 }}>
                  {delShow?<Ico.PwdHide/>:<Ico.PwdShow/>}
                </button>
              </div>
              {delErr && <div style={{ marginTop:".4rem", fontSize:".72rem", color:"#F4866A", fontWeight:600,
                display:"flex", alignItems:"center", gap:".35rem" }}>
                ⚠ {delErr}
              </div>}
            </div>
            <div style={{ display:"flex", gap:".6rem" }}>
              <button onClick={()=>{setDelModal(null);setDelPwd("");setDelErr("");}}
                style={{ flex:1, padding:".72rem", borderRadius:12, cursor:"pointer", fontFamily:"inherit",
                  fontSize:".82rem", fontWeight:600, background:"rgba(248,246,241,.06)",
                  color:"rgba(248,246,241,.6)", border:"1px solid rgba(248,246,241,.08)", transition:"all .15s" }}
                onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background="rgba(248,246,241,.1)"}
                onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="rgba(248,246,241,.06)"}>
                Annuler
              </button>
              <button onClick={confirmDelete} disabled={delLoading||!delPwd}
                style={{ flex:1, padding:".72rem", borderRadius:12,
                  cursor:delLoading||!delPwd?"default":"pointer",
                  fontFamily:"inherit", fontSize:".82rem", fontWeight:700, border:"none",
                  background:delLoading||!delPwd?"rgba(184,52,30,.3)":"linear-gradient(135deg,#C0392B,#922B21)",
                  color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:".45rem",
                  boxShadow:delLoading||!delPwd?"none":"0 4px 16px rgba(184,52,30,.35)", transition:"all .15s" }}>
                {delLoading
                  ? <><div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(255,255,255,.3)",
                      borderTopColor:"#fff", animation:"bs-spin .7s linear infinite" }}/> Vérification…</>
                  : "Supprimer définitivement"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
        flexWrap:"wrap", gap:"1rem", marginBottom:"2rem" }}>
        <div>
          <div style={{ fontSize:".58rem", fontWeight:700, letterSpacing:".2em",
            textTransform:"uppercase", color:"#C08435", marginBottom:".4rem" }}>AfriPulse Admin</div>
          <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"2rem", fontWeight:900,
            letterSpacing:"-.04em", color:"#141410", margin:0 }}>Bourses</h1>
          <p style={{ fontSize:".78rem", color:"#928E80", marginTop:".25rem" }}>
            {stats.total.toLocaleString("fr-FR")} bourses ·{" "}
            <span style={{color:"#1A5C40",fontWeight:600}}>{stats.published} publiées</span>
            {" · "}
            <span style={{color:"#C08435",fontWeight:600}}>{stats.draft} brouillons</span>
            {stats.urgent > 0 && <> · <span style={{color:"#B8341E",fontWeight:600}}>{stats.urgent} urgentes</span></>}
            {" · "}
            <span style={{color:"#5A7FD4",fontWeight:600}}>{fmtNum(stats.totalViews)} vues</span>
            {" · "}
            <span style={{color:"#4A9E6F",fontWeight:600}}>{fmtNum(stats.totalSaves)} saves</span>
          </p>
        </div>
        <div style={{ display:"flex", gap:".6rem", flexWrap:"wrap" }}>
          <button onClick={exportCSV}
            style={{ display:"inline-flex", alignItems:"center", gap:".4rem",
              fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:".78rem", fontWeight:600,
              padding:".55rem 1.1rem", borderRadius:100, cursor:"pointer",
              background:"transparent", color:"#38382E", border:"1.5px solid rgba(20,20,16,.15)" }}>
            <Ico.Export/> Exporter CSV
          </button>
          <Link href="/admin/bourses/nouveau"
            style={{ display:"inline-flex", alignItems:"center", gap:".45rem",
              fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:".82rem", fontWeight:700,
              padding:".6rem 1.3rem", borderRadius:100, background:"#141410",
              color:"#fff", textDecoration:"none" }}>
            <Ico.Plus/> Nouvelle bourse
          </Link>
        </div>
      </div>

      {/* STATS améliorées (5 cartes) */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"1rem", marginBottom:"1.75rem" }}>
        {[
          { label:"Total",     value:stats.total,     color:"#141410", sub:"bourses"   },
          { label:"Publiées",  value:stats.published, color:"#1A5C40", sub:"en ligne"   },
          { label:"Brouillons",value:stats.draft,     color:"#C08435", sub:"en attente" },
          { label:"Urgentes",  value:stats.urgent,    color:"#B8341E", sub:"deadline < 7j" },
          { label:"Vues totales",value:stats.totalViews,color:"#5A7FD4", sub:"impressions" },
        ].map((s,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:16, padding:"1.1rem 1.3rem",
            border:"1px solid rgba(20,20,16,.08)", boxShadow:"0 1px 4px rgba(20,20,16,.06)",
            borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontSize:".58rem", fontWeight:700, letterSpacing:".14em",
              textTransform:"uppercase", color:"#928E80", marginBottom:".3rem" }}>{s.label}</div>
            <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:"1.6rem", fontWeight:900,
              color:s.color, letterSpacing:"-.04em", lineHeight:1 }}>
              {fmtNum(s.value)}
            </div>
            <div style={{ fontSize:".6rem", color:"#928E80", marginTop:".2rem" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* FILTRES améliorés (ajout du domaine) */}
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid rgba(20,20,16,.08)",
        padding:"1.1rem 1.4rem", marginBottom:"1.25rem",
        boxShadow:"0 1px 4px rgba(20,20,16,.06)",
        display:"flex", gap:"1rem", flexWrap:"wrap", alignItems:"center" }}>
        {/* Recherche */}
        <div style={{ display:"flex", alignItems:"center", gap:".5rem", background:"#F8F6F1",
          border:"1.5px solid rgba(20,20,16,.09)", borderRadius:100,
          padding:".42rem .42rem .42rem 1rem", flex:"0 0 260px" }}>
          <span style={{color:"#928E80",display:"flex",flexShrink:0}}><Ico.Search/></span>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"){setSearch(searchQ);setPage(1);}}}
            placeholder="Rechercher une bourse…"
            style={{ border:"none", background:"transparent",
              fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:".82rem",
              color:"#141410", outline:"none", width:"100%" }}/>
          {searchQ && <button onClick={()=>{setSearchQ("");setSearch("");setPage(1);}}
            style={{ background:"rgba(20,20,16,.08)", border:"none", borderRadius:"50%",
              width:20, height:20, cursor:"pointer", fontSize:".65rem", color:"#928E80",
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>✕</button>}
        </div>

        {/* Statut */}
        <div style={{display:"flex",gap:".35rem"}}>
          {([{k:"all",l:"Tout"},{k:"published",l:"Publiées"},{k:"draft",l:"Brouillons"},{k:"urgent",l:"Urgentes"}] as {k:FilterStatus;l:string}[]).map(f=>(
            <button key={f.k} onClick={()=>{setStatus(f.k);setPage(1);}}
              style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:".72rem", fontWeight:600,
                padding:".38rem .85rem", borderRadius:100, cursor:"pointer", transition:"all .15s",
                background:status===f.k?"#141410":"transparent",
                color:status===f.k?"#fff":"#38382E",
                border:status===f.k?"none":"1.5px solid rgba(20,20,16,.12)" }}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Niveau */}
        <select value={level} onChange={e=>{setLevel(e.target.value as Level|"");setPage(1);}}
          style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:".78rem", fontWeight:500,
            padding:".42rem .9rem", borderRadius:100, border:"1.5px solid rgba(20,20,16,.12)",
            background:"#fff", color:level?"#141410":"#928E80", cursor:"pointer",
            appearance:"none", outline:"none" }}>
          <option value="">Tous niveaux</option>
          {LEVELS.map(l=><option key={l} value={l}>{l}</option>)}
        </select>

        {/* Domaine (dynamique) */}
        {domains.length > 0 && (
          <select value={domain} onChange={e=>{setDomain(e.target.value);setPage(1);}}
            style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:".78rem", fontWeight:500,
              padding:".42rem .9rem", borderRadius:100, border:"1.5px solid rgba(20,20,16,.12)",
              background:"#fff", color:domain?"#141410":"#928E80", cursor:"pointer",
              appearance:"none", outline:"none" }}>
            <option value="">Tous domaines</option>
            {domains.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        )}

        <div style={{marginLeft:"auto",fontSize:".72rem",color:"#928E80",fontWeight:500}}>
          {total.toLocaleString("fr-FR")} résultat{total!==1?"s":""}
        </div>
      </div>

      {/* BULK BAR */}
      {selected.size > 0 && (
        <div style={{ background:"#141410", borderRadius:12, padding:".85rem 1.4rem",
          marginBottom:"1rem", display:"flex", alignItems:"center", gap:"1rem",
          boxShadow:"0 4px 16px rgba(20,20,16,.2)", animation:"bs-slide .2s ease" }}>
          <span style={{fontSize:".78rem",fontWeight:700,color:"#C08435"}}>
            {selected.size} sélectionnée{selected.size>1?"s":""}
          </span>
          <div style={{width:1,height:18,background:"rgba(255,255,255,.1)"}}/>
          <button onClick={()=>bulkPublish(Array.from(selected),true)}
            style={{fontFamily:"inherit",fontSize:".75rem",fontWeight:600,color:"#4A9E6F",background:"rgba(74,158,111,.12)",border:"none",padding:".38rem .85rem",borderRadius:100,cursor:"pointer"}}>Publier tout</button>
          <button onClick={()=>bulkPublish(Array.from(selected),false)}
            style={{fontFamily:"inherit",fontSize:".75rem",fontWeight:600,color:"#C08435",background:"rgba(192,132,53,.12)",border:"none",padding:".38rem .85rem",borderRadius:100,cursor:"pointer"}}>Dépublier tout</button>
          <button onClick={()=>{setDelModal(Array.from(selected));setDelPwd("");setDelErr("");}}
            style={{fontFamily:"inherit",fontSize:".75rem",fontWeight:600,color:"#C25B3F",background:"rgba(194,91,63,.12)",border:"none",padding:".38rem .85rem",borderRadius:100,cursor:"pointer"}}>Supprimer</button>
          <button onClick={()=>setSelected(new Set())}
            style={{marginLeft:"auto",fontFamily:"inherit",fontSize:".72rem",color:"rgba(255,255,255,.4)",background:"none",border:"none",cursor:"pointer"}}>Annuler</button>
        </div>
      )}

      {/* TABLE avec colonnes vues et saves */}
      <div style={{ background:"#fff", borderRadius:20, border:"1px solid rgba(20,20,16,.08)",
        boxShadow:"0 2px 12px rgba(20,20,16,.08)", overflow:"auto" }}>
        <div style={{minWidth:"max-content"}}>
          <div style={{ display:"grid", gridTemplateColumns:GRID, gap:"0 .75rem",
            padding:".75rem 1.4rem", background:"#F8F6F1", borderBottom:"1px solid rgba(20,20,16,.08)" }}>
            <div style={{display:"flex",alignItems:"center"}}>
              <input type="checkbox"
                checked={selected.size>0&&selected.size===items.length}
                ref={el=>{if(el)el.indeterminate=selected.size>0&&selected.size<items.length;}}
                onChange={toggleAll}
                style={{width:15,height:15,cursor:"pointer",accentColor:"#C08435"}}/>
            </div>
            {([
              {label:"Bourse",  field:"title"        as SortField},
              {label:"Niv.",    field:null},
              {label:"Org.",    field:"organization" as SortField},
              {label:"Domaine", field:null},
              {label:"Deadline",field:"deadline"     as SortField},
              {label:"Vues",    field:"views"        as SortField},
              {label:"Saves",   field:"saves_count"  as SortField},
              {label:"Statut",  field:null},
              {label:"Créé",    field:"created_at"   as SortField},
              {label:"Actions", field:null},
            ]).map(col=>(
              <div key={col.label}
                onClick={()=>col.field&&toggleSort(col.field)}
                className={col.field?"bs-sort":""}
                style={{ display:"flex", alignItems:"center", gap:".35rem", fontSize:".6rem",
                  fontWeight:700, letterSpacing:".1em", textTransform:"uppercase",
                  color:"#928E80", cursor:col.field?"pointer":"default", userSelect:"none" }}>
                {col.label}
                {col.field && <SortIcon f={col.field}/>}
              </div>
            ))}
          </div>

          {/* Lignes */}
          {loading ? (
            <div style={{padding:"5rem",textAlign:"center"}}>
              <div style={{width:32,height:32,borderRadius:"50%",border:"3px solid rgba(20,20,16,.08)",
                borderTopColor:"#C08435",animation:"bs-spin .8s linear infinite",margin:"0 auto"}}/>
            </div>
          ) : items.length === 0 ? (
            <div style={{padding:"5rem",textAlign:"center"}}>
              <div style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"1.2rem",fontWeight:700,
                color:"#141410",marginBottom:".5rem"}}>Aucune bourse</div>
              <p style={{fontSize:".82rem",color:"#928E80",marginBottom:"1.5rem"}}>
                {search||level||domain||status!=="all"?"Aucun résultat pour ces filtres.":"Ajoutez votre première bourse."}
              </p>
              <Link href="/admin/bourses/nouveau"
                style={{display:"inline-flex",alignItems:"center",gap:".4rem",
                  fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:".82rem",fontWeight:700,
                  padding:".6rem 1.3rem",borderRadius:100,background:"#141410",color:"#fff",textDecoration:"none"}}>
                <Ico.Plus/> Ajouter une bourse
              </Link>
            </div>
          ) : items.map((item, i) => {
            const isSel = selected.has(item.id);
            const lc    = LEVEL_COLOR[item.level] ?? "#928E80";
            return (
              <div key={item.id} className="bs-tr"
                onClick={()=>router.push(`/admin/bourses/${item.id}`)}
                style={{ display:"grid", gridTemplateColumns:GRID, gap:"0 .75rem",
                  padding:".9rem 1.4rem", alignItems:"center",
                  borderBottom:i<items.length-1?"1px solid rgba(20,20,16,.05)":"none",
                  background:isSel?"rgba(192,132,53,.03)":"transparent" }}>

                <div onClick={e=>toggleSelect(item.id,e)} style={{display:"flex",alignItems:"center"}}>
                  <input type="checkbox" checked={isSel} onChange={()=>{}}
                    style={{width:15,height:15,cursor:"pointer",accentColor:"#C08435"}}/>
                </div>

                {/* Bourse */}
                <div style={{display:"flex",alignItems:"center",gap:".85rem",minWidth:0}}>
                  <div style={{width:44,height:44,borderRadius:10,flexShrink:0,overflow:"hidden",position:"relative"}}>
                    {item.cover_url
                      ? <img src={item.cover_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : <div style={{position:"absolute",inset:0,background:item.image_gradient}}/>
                    }
                    {item.urgent && (
                      <div style={{position:"absolute",top:2,right:2,width:8,height:8,
                        borderRadius:"50%",background:"#B8341E",
                        border:"1.5px solid #fff",boxShadow:"0 0 4px rgba(184,52,30,.5)"}}/>
                    )}
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:".84rem",fontWeight:700,color:"#141410",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                      letterSpacing:"-.01em",marginBottom:".15rem"}}>
                      {item.title}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:".4rem"}}>
                      <span style={{fontSize:".6rem",color:"#928E80"}}>{item.flag} {item.country}</span>
                    </div>
                  </div>
                </div>

                {/* Niveau */}
                <span style={{display:"inline-block",fontSize:".56rem",fontWeight:800,
                  letterSpacing:".08em",textTransform:"uppercase",
                  color:lc,background:`${lc}14`,padding:".22rem .65rem",borderRadius:100}}>
                  {item.level === "Toutes formations" ? "Tout" : item.level}
                </span>

                {/* Organisation */}
                <span style={{fontSize:".75rem",color:"#38382E",fontWeight:500,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {item.organization}
                </span>

                {/* Domaine */}
                <span style={{fontSize:".72rem",color:"#928E80",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {item.domain}
                </span>

                {/* Deadline */}
                <div style={{display:"flex",flexDirection:"column",gap:".15rem"}}>
                  <span style={{fontSize:".72rem",color:"#38382E",fontWeight:500}}>
                    {fmtDate(item.deadline)}
                  </span>
                  {daysLeft(item.deadline)}
                </div>

                {/* Vues */}
                <div style={{display:"flex",alignItems:"center",gap:".35rem",
                  fontFamily:"'Fraunces',Georgia,serif",fontSize:".8rem",fontWeight:700,color:"#5A7FD4"}}>
                  <Ico.Trending/> {fmtNum(item.views)}
                </div>

                {/* Saves */}
                <div style={{display:"flex",alignItems:"center",gap:".35rem",
                  fontFamily:"'Fraunces',Georgia,serif",fontSize:".8rem",fontWeight:700,color:"#4A9E6F"}}>
                  <Ico.Bookmark/> {fmtNum(item.saves_count)}
                </div>

                {/* Statut */}
                <div style={{display:"inline-flex",alignItems:"center",gap:".35rem",
                  fontSize:".62rem",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",
                  padding:".28rem .7rem",borderRadius:100,
                  background:item.published?"rgba(26,92,64,.1)":"rgba(20,20,16,.06)",
                  color:item.published?"#1A5C40":"#928E80"}}>
                  <span style={{width:6,height:6,borderRadius:"50%",
                    background:item.published?"#4A9E6F":"#D0CCBF"}}/>
                  {item.published?"Publiée":"Brouillon"}
                </div>

                {/* Date */}
                <span style={{fontSize:".72rem",color:"#928E80",whiteSpace:"nowrap"}}>
                  {fmtDate(item.created_at)}
                </span>

                {/* Actions */}
                <div onClick={e=>e.stopPropagation()}
                  style={{display:"flex",alignItems:"center",gap:".3rem",justifyContent:"flex-end"}}>
                  <button title={item.urgent?"Retirer urgence":"Marquer urgent"}
                    onClick={e=>toggleUrgent(item.id,item.urgent,e)} className="bs-act"
                    style={{width:28,height:28,borderRadius:8,border:"none",display:"flex",
                      alignItems:"center",justifyContent:"center",cursor:"pointer",
                      background:item.urgent?"rgba(184,52,30,.1)":"rgba(20,20,16,.06)",
                      color:item.urgent?"#B8341E":"#928E80"}}>
                    <Ico.Alert/>
                  </button>
                  <Link href={`/bourses/${item.slug}${!item.published?"?preview=1":""}`}
                    target="_blank" title="Voir" onClick={e=>e.stopPropagation()} className="bs-act"
                    style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",
                      justifyContent:"center",background:"rgba(20,20,16,.06)",color:"#928E80",textDecoration:"none"}}>
                    <Ico.Eye/>
                  </Link>
                  <Link href={`/admin/bourses/${item.id}`} title="Éditer"
                    onClick={e=>e.stopPropagation()} className="bs-act"
                    style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",
                      justifyContent:"center",background:"rgba(30,77,168,.08)",color:"#1E4DA8",textDecoration:"none"}}>
                    <Ico.Edit/>
                  </Link>
                  <button title="Supprimer" className="bs-act"
                    onClick={e=>{e.stopPropagation();setDelModal([item.id]);setDelPwd("");setDelErr("");}}
                    style={{width:28,height:28,borderRadius:8,border:"none",display:"flex",
                      alignItems:"center",justifyContent:"center",cursor:"pointer",
                      background:"rgba(184,52,30,.08)",color:"#B8341E"}}>
                    <Ico.Trash/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div style={{marginTop:"1.5rem",display:"flex",alignItems:"center",
          justifyContent:"space-between",flexWrap:"wrap",gap:"1rem"}}>
          <span style={{fontSize:".75rem",color:"#928E80"}}>
            Page {page} sur {totalPages} · {total} bourses
          </span>
          <div style={{display:"flex",gap:".4rem"}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{display:"flex",alignItems:"center",gap:".3rem",fontFamily:"inherit",
                fontSize:".75rem",fontWeight:600,padding:".45rem .9rem",borderRadius:100,
                cursor:page===1?"not-allowed":"pointer",background:"transparent",
                color:page===1?"#D0CCBF":"#38382E",border:"1.5px solid",
                borderColor:page===1?"#E8E4DC":"rgba(20,20,16,.15)"}}>
              <Ico.ChevL/> Précédent
            </button>
            {Array.from({length:Math.min(totalPages,7)},(_,i)=>{
              const p=totalPages<=7?i+1:page<=4?i+1:page>=totalPages-3?totalPages-6+i:page-3+i;
              return (
                <button key={p} onClick={()=>setPage(p)}
                  style={{width:34,height:34,borderRadius:"50%",cursor:"pointer",
                    fontFamily:"inherit",fontSize:".75rem",fontWeight:600,
                    background:page===p?"#141410":"transparent",
                    color:page===p?"#fff":"#38382E",
                    border:page===p?"none":"1.5px solid rgba(20,20,16,.12)",transition:"all .15s"}}>
                  {p}
                </button>
              );
            })}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{display:"flex",alignItems:"center",gap:".3rem",fontFamily:"inherit",
                fontSize:".75rem",fontWeight:600,padding:".45rem .9rem",borderRadius:100,
                cursor:page===totalPages?"not-allowed":"pointer",background:"transparent",
                color:page===totalPages?"#D0CCBF":"#38382E",border:"1.5px solid",
                borderColor:page===totalPages?"#E8E4DC":"rgba(20,20,16,.15)"}}>
              Suivant <Ico.ChevR/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}