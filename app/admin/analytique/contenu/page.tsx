"use client";

/**
 * app/admin/analytique/contenu/page.tsx
 * Analytique détaillée par type de contenu — données Supabase réelles
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatNumber, formatDate } from "@/lib/utils";

const P = {
  gold: "#C08435", green: "#1A5C40", blue: "#1E4DA8",
  brown: "#7A4A1E", teal: "#2D6B3B", red: "#B8341E",
  muted: "#928E80", ink: "#141410", cream: "#F8F6F1",
};

const IcoArrow = ({ c = P.muted }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoBack  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IcoClock = ({ c = P.muted }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IcoAlert = ({ c = P.muted }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

/* ── Graphique barres horizontal ─────────────────────────── */
function HBarChart({ data, color }: { data: { label: string; value: number; sub?: string }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#38382E" }}>{d.label}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.9rem", fontWeight: 900, color, lineHeight: 1 }}>{d.value}</span>
                {d.sub && <span style={{ fontSize: "0.58rem", color: P.muted }}>{d.sub}</span>}
              </div>
            </div>
            <div style={{ height: 5, background: "rgba(20,20,16,.06)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 100, transition: "width .9s cubic-bezier(.34,1.56,.64,1)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Compteur ────────────────────────────────────────────── */
function Count({ n }: { n: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = Date.now(), dur = 800;
    const tick = () => { const p = Math.min((Date.now()-t0)/dur,1); setV(Math.round(n*(1-Math.pow(1-p,3)))); if(p<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [n]);
  return <>{formatNumber(v)}</>;
}

function SH({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", fontWeight: 900, color: P.ink, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.55rem", margin: 0 }}>
        <span style={{ display: "inline-block", width: 3.5, height: 16, borderRadius: 100, background: P.gold, flexShrink: 0 }} />
        {title}
      </h2>
      {sub && <p style={{ fontSize: "0.7rem", color: P.muted, margin: "0.3rem 0 0 1.2rem" }}>{sub}</p>}
    </div>
  );
}

interface ArticleRow { id:string; title:string; slug:string; category:string; published:boolean; created_at:string; read_time:number; }
interface BourseRow  { id:string; title:string; slug:string; level:string; urgent:boolean; deadline:string; organization:string; }
interface OppRow     { id:string; title:string; slug:string; type:string; company:string; }
interface EventRow   { id:string; title:string; slug:string; type:string; event_date:string; location:string; }

export default function AnalytiqueContenu() {
  const sb = createClient();
  const [tab,     setTab]     = useState<"actus"|"bourses"|"opps"|"events">("actus");
  const [articles,setArticles]= useState<ArticleRow[]>([]);
  const [bourses, setBourses] = useState<BourseRow[]>([]);
  const [opps,    setOpps]    = useState<OppRow[]>([]);
  const [events,  setEvents]  = useState<EventRow[]>([]);
  const [catStat, setCatStat] = useState<{label:string;value:number}[]>([]);
  const [levelStat,setLevel]  = useState<{label:string;value:number}[]>([]);
  const [oppType, setOppType] = useState<{label:string;value:number}[]>([]);
  const [evType,  setEvType]  = useState<{label:string;value:number}[]>([]);
  const [counts,  setCounts]  = useState({ art:0, bourse:0, opp:0, ev:0, published:0, urgent:0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aR,bR,oR,eR] = await Promise.all([
        sb.from("articles").select("id,title,slug,category,published,created_at,read_time").order("created_at",{ascending:false}).limit(20),
        sb.from("scholarships").select("id,title,slug,level,urgent,deadline,organization").order("created_at",{ascending:false}).limit(20),
        sb.from("opportunities").select("id,title,slug,type,company").order("created_at",{ascending:false}).limit(20),
        sb.from("events").select("id,title,slug,type,event_date,location").order("created_at",{ascending:false}).limit(20),
      ]);
      const aD = (aR.data ?? []) as ArticleRow[];
      const bD = (bR.data ?? []) as BourseRow[];
      const oD = (oR.data ?? []) as OppRow[];
      const eD = (eR.data ?? []) as EventRow[];

      setArticles(aD); setBourses(bD); setOpps(oD); setEvents(eD);
      setCounts({ art:aD.length, bourse:bD.length, opp:oD.length, ev:eD.length, published:aD.filter(a=>a.published).length, urgent:bD.filter(b=>b.urgent).length });

      // Stats catégories
      const cm: Record<string,number> = {};
      aD.forEach(a => { cm[a.category] = (cm[a.category]??0)+1; });
      setCatStat(Object.entries(cm).sort(([,a],[,b])=>b-a).map(([k,v])=>({label:k,value:v})));

      const lm: Record<string,number> = {};
      bD.forEach(b => { lm[b.level] = (lm[b.level]??0)+1; });
      setLevel(Object.entries(lm).sort(([,a],[,b])=>b-a).map(([k,v])=>({label:k,value:v})));

      const om: Record<string,number> = {};
      oD.forEach(o => { om[o.type] = (om[o.type]??0)+1; });
      setOppType(Object.entries(om).sort(([,a],[,b])=>b-a).map(([k,v])=>({label:k,value:v})));

      const em: Record<string,number> = {};
      eD.forEach(e => { em[e.type] = (em[e.type]??0)+1; });
      setEvType(Object.entries(em).sort(([,a],[,b])=>b-a).map(([k,v])=>({label:k,value:v})));

    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const CAT_COLORS: Record<string,string> = {
    "Politique":P.blue,"Économie":P.gold,"Tech":P.green,"Sport":P.red,"Culture":P.brown,"Santé":P.teal,"Environnement":"#4B8B3B"
  };
  const LEVEL_COLORS: Record<string,string> = {
    "Licence":P.blue,"Master":P.green,"Doctorat":P.brown,"Postdoc":P.teal,"Toutes formations":P.gold
  };
  const TYPE_COLORS: Record<string,string> = {
    "Emploi CDI":P.green,"Emploi":P.gold,"Stage":P.blue,"Graduate":P.brown,"Freelance":P.red,"Volontariat":P.muted
  };
  const EV_COLORS: Record<string,string> = {
    "Conférence":P.blue,"Forum":P.green,"Hackathon":P.red,"Salon":P.gold,"Atelier":P.brown,"Sommet":P.ink
  };

  return (
    <div className="an-page">
      <div className="an-header">
        <div className="an-header-glow" />
        <div className="an-header-inner">
          <div>
            <Link href="/admin/analytique" style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem", fontSize:"0.7rem", color:"rgba(248,246,241,.35)", textDecoration:"none", marginBottom:"0.6rem" }}>
              <IcoBack /> Analytique générale
            </Link>
            <div className="an-header-kicker">Analytique · Contenu</div>
            <h1 className="an-header-title">Performance du <em style={{fontStyle:"italic",fontWeight:200,color:P.gold}}> contenu</em></h1>
            <p className="an-header-sub">Actualités, bourses, opportunités et événements — détail et répartition</p>
          </div>
        </div>
        <div className="an-subnav">
          {[
            {href:"/admin/analytique",label:"Vue d'ensemble"},
            {href:"/admin/analytique/contenu",label:"Contenu"},
            {href:"/admin/analytique/audience",label:"Audience"},
            {href:"/admin/analytique/engagement",label:"Engagement"},
          ].map(n=>(
            <Link key={n.href} href={n.href} className={`an-subnav-link ${n.href==="/admin/analytique/contenu"?"an-subnav-link--active":""}`}>{n.label}</Link>
          ))}
        </div>
      </div>

      <div className="an-body">
        {loading ? (
          <div className="an-loading"><div className="an-loading-ring"/><span className="an-loading-text">Chargement…</span></div>
        ) : (
          <>
            {/* KPIs */}
            <div className="an-kpi-grid">
              {[
                {label:"Actualités",   v:counts.art,       sub:`${counts.published} publiées`,  color:P.gold  },
                {label:"Bourses",      v:counts.bourse,    sub:`${counts.urgent} urgentes`,      color:P.green },
                {label:"Opportunités", v:counts.opp,       sub:"toutes actives",                color:P.blue  },
                {label:"Événements",  v:counts.ev,        sub:"à venir",                       color:P.brown },
                {label:"Taux publication",v:counts.art>0?Math.round((counts.published/counts.art)*100):0, sub:"% actus publiées", color:P.teal},
                {label:"Bourses urgentes", v:counts.urgent, sub:"clôture < 14j",               color:P.red   },
              ].map(({label,v,sub,color})=>(
                <div key={label} className="an-kpi" style={{position:"relative"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:`linear-gradient(90deg,${color},${color}44)`,borderRadius:"18px 18px 0 0"}}/>
                  <div style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"1.9rem",fontWeight:900,color:P.ink,lineHeight:1,letterSpacing:"-0.04em"}}><Count n={v}/></div>
                  <div style={{fontSize:"0.7rem",color:P.muted,marginTop:"0.28rem"}}>{label}</div>
                  {sub&&<div style={{fontSize:"0.58rem",color,fontWeight:700,marginTop:"0.1rem"}}>{sub}</div>}
                </div>
              ))}
            </div>

            {/* STATS PAR TYPE */}
            <div className="an-grid-2">
              <div className="an-card">
                <SH title="Catégories d'actualités" sub="Répartition des articles publiés" />
                <HBarChart data={catStat.map(c=>({label:c.label,value:c.value,sub:`${Math.round((c.value/Math.max(catStat.reduce((s,x)=>s+x.value,0),1))*100)}%`}))} color={P.gold} />
              </div>
              <div className="an-card">
                <SH title="Niveaux des bourses" sub="Répartition par cycle d'études" />
                <HBarChart data={levelStat.map(l=>({label:l.label,value:l.value}))} color={P.green} />
              </div>
              <div className="an-card">
                <SH title="Types d'opportunités" sub="Contrats les plus représentés" />
                <HBarChart data={oppType.map(o=>({label:o.label,value:o.value}))} color={P.blue} />
              </div>
              <div className="an-card">
                <SH title="Types d'événements" sub="Formats d'événements publiés" />
                <HBarChart data={evType.map(e=>({label:e.label,value:e.value}))} color={P.brown} />
              </div>
            </div>

            {/* LISTE DÉTAILLÉE AVEC ONGLETS */}
            <div className="an-card" style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"1.25rem 1.5rem 0",borderBottom:"1px solid rgba(20,20,16,.06)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0"}}>
                  <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"1rem",fontWeight:900,color:P.ink,letterSpacing:"-0.02em",display:"flex",alignItems:"center",gap:"0.55rem",margin:0}}>
                    <span style={{display:"inline-block",width:3.5,height:16,borderRadius:100,background:P.gold,flexShrink:0}}/>
                    Contenus récents
                  </h2>
                  <div className="adm-tabs">
                    {(["actus","bourses","opps","events"] as const).map(k=>(
                      <button key={k} onClick={()=>setTab(k)} className={`adm-tab-btn ${tab===k?"adm-tab-btn--active":""}`}>
                        {k==="actus"?"Actualités":k==="bourses"?"Bourses":k==="opps"?"Opportunités":"Événements"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{padding:"0.5rem 1.5rem 1rem"}}>
                {tab==="actus" && articles.map((a,i)=>{
                  const c = CAT_COLORS[a.category]??P.muted;
                  return (
                    <div key={a.id} className="adm-list-row" style={{borderTop:i>0?"1px solid rgba(20,20,16,.05)":"none"}}>
                      <span className="adm-list-num">{String(i+1).padStart(2,"0")}</span>
                      <div style={{width:3,height:30,borderRadius:100,background:c,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="adm-list-title">{a.title}</div>
                        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginTop:"0.18rem"}}>
                          <span style={{fontSize:"0.56rem",fontWeight:800,letterSpacing:"0.07em",textTransform:"uppercase",padding:"0.1rem 0.45rem",borderRadius:100,background:`${c}14`,color:c}}>{a.category}</span>
                          <span style={{fontSize:"0.58rem",color:P.muted,display:"flex",alignItems:"center",gap:"0.25rem"}}><IcoClock c={P.muted}/>{a.read_time} min</span>
                          <span style={{fontSize:"0.58rem",color:P.muted}}>{formatDate(a.created_at,{relative:true})}</span>
                        </div>
                      </div>
                      <span className={`adm-badge ${a.published?"adm-badge--green":"adm-badge--muted"}`}>{a.published?"Publié":"Brouillon"}</span>
                    </div>
                  );
                })}
                {tab==="bourses" && bourses.map((b,i)=>{
                  const c = LEVEL_COLORS[b.level]??P.muted;
                  const days = Math.ceil((new Date(b.deadline).getTime()-Date.now())/86400000);
                  return (
                    <div key={b.id} className="adm-list-row" style={{borderTop:i>0?"1px solid rgba(20,20,16,.05)":"none"}}>
                      <span className="adm-list-num">{String(i+1).padStart(2,"0")}</span>
                      <div style={{width:3,height:30,borderRadius:100,background:c,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="adm-list-title">{b.title}</div>
                        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginTop:"0.18rem"}}>
                          <span style={{fontSize:"0.56rem",fontWeight:800,letterSpacing:"0.07em",textTransform:"uppercase",padding:"0.1rem 0.45rem",borderRadius:100,background:`${c}14`,color:c}}>{b.level}</span>
                          <span style={{fontSize:"0.58rem",color:P.muted}}>{b.organization}</span>
                          {days<=14&&days>0&&<span style={{display:"flex",alignItems:"center",gap:"0.2rem",fontSize:"0.58rem",color:P.red,fontWeight:700}}><IcoAlert c={P.red}/>{days}j restants</span>}
                        </div>
                      </div>
                      <span className={`adm-badge ${b.urgent?"adm-badge--red":"adm-badge--green"}`}>{b.urgent?"Urgent":"Ouvert"}</span>
                    </div>
                  );
                })}
                {tab==="opps" && opps.map((o,i)=>{
                  const c = TYPE_COLORS[o.type]??P.muted;
                  return (
                    <div key={o.id} className="adm-list-row" style={{borderTop:i>0?"1px solid rgba(20,20,16,.05)":"none"}}>
                      <span className="adm-list-num">{String(i+1).padStart(2,"0")}</span>
                      <div style={{width:3,height:30,borderRadius:100,background:c,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="adm-list-title">{o.title}</div>
                        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginTop:"0.18rem"}}>
                          <span style={{fontSize:"0.56rem",fontWeight:800,letterSpacing:"0.07em",textTransform:"uppercase",padding:"0.1rem 0.45rem",borderRadius:100,background:`${c}14`,color:c}}>{o.type}</span>
                          <span style={{fontSize:"0.58rem",color:P.muted}}>{o.company}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {tab==="events" && events.map((e,i)=>{
                  const c = EV_COLORS[e.type]??P.muted;
                  return (
                    <div key={e.id} className="adm-list-row" style={{borderTop:i>0?"1px solid rgba(20,20,16,.05)":"none"}}>
                      <span className="adm-list-num">{String(i+1).padStart(2,"0")}</span>
                      <div style={{width:3,height:30,borderRadius:100,background:c,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="adm-list-title">{e.title}</div>
                        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginTop:"0.18rem"}}>
                          <span style={{fontSize:"0.56rem",fontWeight:800,letterSpacing:"0.07em",textTransform:"uppercase",padding:"0.1rem 0.45rem",borderRadius:100,background:`${c}14`,color:c}}>{e.type}</span>
                          <span style={{fontSize:"0.58rem",color:P.muted}}>{e.location}</span>
                          <span style={{fontSize:"0.58rem",color:P.muted,display:"flex",alignItems:"center",gap:"0.25rem"}}><IcoClock c={P.muted}/>{new Date(e.event_date).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"})}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}