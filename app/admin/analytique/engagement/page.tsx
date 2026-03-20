"use client";

/**
 * app/admin/analytique/engagement/page.tsx
 * Analyse engagement — saves, candidatures, inscriptions événements
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatNumber, formatDate } from "@/lib/utils";

const P = {
  gold: "#C08435", green: "#1A5C40", blue: "#1E4DA8",
  brown: "#7A4A1E", teal: "#2D6B3B", red: "#B8341E",
  muted: "#928E80", ink: "#141410",
};

const IcoBack = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;

function Count({ n }: { n: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = Date.now(), dur = 800;
    const tick = () => { const p=Math.min((Date.now()-t0)/dur,1); setV(Math.round(n*(1-Math.pow(1-p,3)))); if(p<1) requestAnimationFrame(tick); };
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

/* ── Graphique camembert simplifié ─────────────────────── */
function PieSegments({ segs }: { segs: { label: string; value: number; color: string }[] }) {
  const total = segs.reduce((s,x)=>s+x.value,0)||1;
  let cum = 0;
  const circles = segs.map(s => {
    const pct = s.value/total;
    const start = cum;
    cum += pct;
    return { ...s, pct, start };
  });
  const r=45, cx=60, cy=60, circ=2*Math.PI*r;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {circles.map((c,i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={c.value>0?c.color:"transparent"}
          strokeWidth={24} strokeDasharray={`${c.pct*circ} ${circ}`}
          strokeDashoffset={-c.start*circ + circ/4} strokeLinecap="round" />
      ))}
      <text x={cx} y={cy-5} textAnchor="middle" fontSize="14" fontWeight="900" fill={P.ink} fontFamily="Fraunces,Georgia,serif">{formatNumber(total)}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="8" fill={P.muted} fontFamily="DM Sans,system-ui,sans-serif">total</text>
    </svg>
  );
}

interface SaveRow { id:string; content_type:string; content_slug:string; content_title:string|null; created_at:string; }
interface AppRow  { id:string; content_type:string; content_title:string|null; status:string; created_at:string; }
interface RegRow  { id:string; event_slug:string; event_title:string|null; event_date:string|null; created_at:string; }

export default function AnalytiqueEngagement() {
  const sb = createClient();
  const [saves,   setSaves]   = useState<SaveRow[]>([]);
  const [apps,    setApps]    = useState<AppRow[]>([]);
  const [regs,    setRegs]    = useState<RegRow[]>([]);
  const [saveByType,  setSaveByType]  = useState<{label:string;value:number;color:string}[]>([]);
  const [appByStatus, setAppByStatus] = useState<{label:string;value:number;color:string}[]>([]);
  const [counts,  setCounts]  = useState({saves:0,apps:0,regs:0,accepted:0,submitted:0});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sR,aR,rR] = await Promise.all([
        sb.from("saves").select("id,content_type,content_slug,content_title,created_at").order("created_at",{ascending:false}).limit(30),
        sb.from("applications").select("id,content_type,content_title,status,created_at").order("created_at",{ascending:false}).limit(30),
        sb.from("event_registrations").select("id,event_slug,event_title,event_date,created_at").order("created_at",{ascending:false}).limit(20),
      ]);
      const sD=(sR.data??[]) as SaveRow[];
      const aD=(aR.data??[]) as AppRow[];
      const rD=(rR.data??[]) as RegRow[];
      setSaves(sD); setApps(aD); setRegs(rD);

      // Saves by type
      const stm: Record<string,number>={};
      sD.forEach(s=>{ stm[s.content_type]=(stm[s.content_type]??0)+1; });
      const typeColors: Record<string,string>={article:P.gold,scholarship:P.green,opportunity:P.blue,event:P.brown};
      const typeLabels: Record<string,string>={article:"Actualités",scholarship:"Bourses",opportunity:"Opportunités",event:"Événements"};
      setSaveByType(Object.entries(stm).sort(([,a],[,b])=>b-a).map(([k,v])=>({label:typeLabels[k]??k,value:v,color:typeColors[k]??P.muted})));

      // Apps by status
      const asm: Record<string,number>={};
      aD.forEach(a=>{ asm[a.status]=(asm[a.status]??0)+1; });
      const statusColors: Record<string,string>={interested:P.muted,in_progress:P.blue,submitted:P.gold,interview:P.brown,accepted:P.green,rejected:P.red,withdrawn:P.muted};
      const statusLabels: Record<string,string>={interested:"Intéressé",in_progress:"En cours",submitted:"Soumis",interview:"Entretien",accepted:"Accepté",rejected:"Refusé",withdrawn:"Retiré"};
      setAppByStatus(Object.entries(asm).sort(([,a],[,b])=>b-a).map(([k,v])=>({label:statusLabels[k]??k,value:v,color:statusColors[k]??P.muted})));

      setCounts({
        saves: sD.length, apps: aD.length, regs: rD.length,
        accepted: aD.filter(a=>a.status==="accepted").length,
        submitted: aD.filter(a=>a.status==="submitted"||a.status==="in_progress").length,
      });
    } catch(err){ console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ctLabel: Record<string,string>={article:"Actualité",scholarship:"Bourse",opportunity:"Opportunité",event:"Événement"};
  const ctColor: Record<string,string>={article:P.gold,scholarship:P.green,opportunity:P.blue,event:P.brown};
  const stLabel: Record<string,string>={interested:"Intéressé",in_progress:"En cours",submitted:"Soumis",interview:"Entretien",accepted:"Accepté",rejected:"Refusé",withdrawn:"Retiré"};
  const stColor: Record<string,{c:string;bg:string}>={
    interested:{c:P.muted,bg:"#F0EDE4"},in_progress:{c:P.blue,bg:"#EBF0FB"},
    submitted:{c:P.gold,bg:"#FBF4E8"},interview:{c:P.brown,bg:"#FDF3E8"},
    accepted:{c:P.green,bg:"#EAF4EF"},rejected:{c:P.red,bg:"#FAEBE8"},withdrawn:{c:P.muted,bg:"#F0EDE4"},
  };

  const totalEng = counts.saves + counts.apps + counts.regs;

  return (
    <div className="an-page">
      <div className="an-header">
        <div className="an-header-glow" />
        <div className="an-header-inner">
          <div>
            <Link href="/admin/analytique" style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",fontSize:"0.7rem",color:"rgba(248,246,241,.35)",textDecoration:"none",marginBottom:"0.6rem"}}>
              <IcoBack /> Analytique générale
            </Link>
            <div className="an-header-kicker">Analytique · Engagement</div>
            <h1 className="an-header-title">Analyse de l&apos;<em style={{fontStyle:"italic",fontWeight:200,color:P.gold}}>engagement</em></h1>
            <p className="an-header-sub">Sauvegardes, candidatures et inscriptions aux événements — interactions réelles</p>
          </div>
        </div>
        <div className="an-subnav">
          {[{href:"/admin/analytique",label:"Vue d'ensemble"},{href:"/admin/analytique/contenu",label:"Contenu"},{href:"/admin/analytique/audience",label:"Audience"},{href:"/admin/analytique/engagement",label:"Engagement"}].map(n=>(
            <Link key={n.href} href={n.href} className={`an-subnav-link ${n.href==="/admin/analytique/engagement"?"an-subnav-link--active":""}`}>{n.label}</Link>
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
                {label:"Engagement total",  v:totalEng,          sub:"saves + candid. + inscrip.",   color:P.gold },
                {label:"Sauvegardes",       v:counts.saves,      sub:"contenus mis en favoris",       color:P.teal },
                {label:"Candidatures",      v:counts.apps,       sub:"dossiers suivis",               color:P.blue },
                {label:"Inscriptions évèn.",v:counts.regs,       sub:"participants enregistrés",      color:P.brown},
                {label:"Candidatures accept.",v:counts.accepted, sub:`sur ${counts.apps} total`,      color:P.green},
                {label:"Taux succès",       v:counts.apps>0?Math.round((counts.accepted/counts.apps)*100):0, sub:"% acceptées", color:P.red},
              ].map(({label,v,sub,color})=>(
                <div key={label} className="an-kpi" style={{position:"relative"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:`linear-gradient(90deg,${color},${color}44)`,borderRadius:"18px 18px 0 0"}}/>
                  <div style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"1.9rem",fontWeight:900,color:P.ink,lineHeight:1,letterSpacing:"-0.04em"}}><Count n={v}/></div>
                  <div style={{fontSize:"0.7rem",color:P.muted,marginTop:"0.28rem"}}>{label}</div>
                  {sub&&<div style={{fontSize:"0.58rem",color,fontWeight:700,marginTop:"0.1rem"}}>{sub}</div>}
                </div>
              ))}
            </div>

            <div className="an-grid-3">

              {/* Sauvegardes par type */}
              <div className="an-card">
                <SH title="Sauvegardes par type" />
                <div style={{display:"flex",alignItems:"center",gap:"1.25rem",marginTop:"0.5rem"}}>
                  <PieSegments segs={saveByType.length>0?saveByType:[{label:"Aucune",value:1,color:"rgba(20,20,16,.08)"}]} />
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:"0.55rem"}}>
                    {saveByType.map(s=>{
                      const total=saveByType.reduce((acc,x)=>acc+x.value,0)||1;
                      return(
                        <div key={s.label}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.22rem"}}>
                            <span style={{fontSize:"0.72rem",fontWeight:600,color:"#38382E",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                              <span style={{width:7,height:7,borderRadius:2,background:s.color,display:"inline-block"}}/>
                              {s.label}
                            </span>
                            <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"0.82rem",fontWeight:900,color:s.color}}>{s.value}</span>
                          </div>
                          <div style={{height:3,background:"rgba(20,20,16,.06)",borderRadius:100,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${(s.value/total)*100}%`,background:s.color,borderRadius:100}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Statuts candidatures */}
              <div className="an-card">
                <SH title="Statuts des candidatures" />
                <div style={{display:"flex",alignItems:"center",gap:"1.25rem",marginTop:"0.5rem"}}>
                  <PieSegments segs={appByStatus.length>0?appByStatus:[{label:"Aucune",value:1,color:"rgba(20,20,16,.08)"}]} />
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:"0.55rem"}}>
                    {appByStatus.map(s=>{
                      const total=appByStatus.reduce((acc,x)=>acc+x.value,0)||1;
                      return(
                        <div key={s.label}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.22rem"}}>
                            <span style={{fontSize:"0.72rem",fontWeight:600,color:"#38382E",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                              <span style={{width:7,height:7,borderRadius:"50%",background:s.color,display:"inline-block"}}/>
                              {s.label}
                            </span>
                            <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"0.82rem",fontWeight:900,color:s.color}}>{s.value}</span>
                          </div>
                          <div style={{height:3,background:"rgba(20,20,16,.06)",borderRadius:100,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${(s.value/total)*100}%`,background:s.color,borderRadius:100}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Synthèse sombre */}
              <div className="an-card an-card--dark">
                <div className="an-dark-kicker">Synthèse engagement</div>
                <div style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"2.6rem",fontWeight:900,color:"#F8F6F1",lineHeight:1,letterSpacing:"-0.04em",margin:"0.5rem 0 0.25rem"}}><Count n={totalEng}/></div>
                <div style={{fontSize:"0.7rem",color:"rgba(248,246,241,.3)",marginBottom:"1.5rem"}}>interactions totales</div>
                {[
                  {l:"Sauvegardes", v:counts.saves,  c:P.gold},
                  {l:"Candidatures",v:counts.apps,   c:P.green},
                  {l:"Inscriptions",v:counts.regs,   c:P.blue},
                ].map(({l,v,c})=>{
                  const pct=totalEng>0?Math.round((v/totalEng)*100):0;
                  return(
                    <div key={l} style={{marginBottom:"0.75rem"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.3rem"}}>
                        <span style={{fontSize:"0.7rem",color:"rgba(248,246,241,.45)"}}>{l}</span>
                        <div style={{display:"flex",gap:"0.5rem",alignItems:"baseline"}}>
                          <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"0.9rem",fontWeight:900,color:c}}>{formatNumber(v)}</span>
                          <span style={{fontSize:"0.58rem",color:"rgba(248,246,241,.22)"}}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{height:3,background:"rgba(248,246,241,.08)",borderRadius:100,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${pct}%`,background:c,borderRadius:100}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Listes détaillées */}
            <div className="an-grid-2">

              {/* Sauvegardes récentes */}
              <div className="an-card">
                <SH title="Sauvegardes récentes" />
                {saves.slice(0,10).map((s,i)=>{
                  const c=ctColor[s.content_type]??P.muted;
                  return(
                    <div key={s.id} className="adm-list-row" style={{borderTop:i>0?"1px solid rgba(20,20,16,.05)":"none"}}>
                      <span className="adm-list-num">{String(i+1).padStart(2,"0")}</span>
                      <div style={{width:3,height:28,borderRadius:100,background:c,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="adm-list-title">{s.content_title||s.content_slug}</div>
                        <div style={{display:"flex",alignItems:"center",gap:"0.4rem",marginTop:"0.18rem"}}>
                          <span style={{fontSize:"0.56rem",fontWeight:800,letterSpacing:"0.07em",textTransform:"uppercase",padding:"0.1rem 0.45rem",borderRadius:100,background:`${c}14`,color:c}}>{ctLabel[s.content_type]??s.content_type}</span>
                          <span style={{fontSize:"0.58rem",color:P.muted}}>{formatDate(s.created_at,{relative:true})}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Candidatures récentes */}
              <div className="an-card">
                <SH title="Candidatures récentes" />
                {apps.slice(0,10).map((a,i)=>{
                  const sc=stColor[a.status]??{c:P.muted,bg:"#F0EDE4"};
                  return(
                    <div key={a.id} className="adm-list-row" style={{borderTop:i>0?"1px solid rgba(20,20,16,.05)":"none"}}>
                      <span className="adm-list-num">{String(i+1).padStart(2,"0")}</span>
                      <div style={{width:3,height:28,borderRadius:100,background:sc.c,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="adm-list-title">{a.content_title||"—"}</div>
                        <div style={{display:"flex",alignItems:"center",gap:"0.4rem",marginTop:"0.18rem"}}>
                          <span style={{fontSize:"0.56rem",fontWeight:800,letterSpacing:"0.07em",textTransform:"uppercase",padding:"0.1rem 0.45rem",borderRadius:100,background:sc.bg,color:sc.c}}>{stLabel[a.status]??a.status}</span>
                          <span style={{fontSize:"0.58rem",color:P.muted}}>{formatDate(a.created_at,{relative:true})}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inscriptions événements */}
            {regs.length>0&&(
              <div className="an-card">
                <SH title="Inscriptions événements récentes" />
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"0.6rem"}}>
                  {regs.slice(0,12).map((r,i)=>(
                    <div key={r.id} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.7rem 0.9rem",borderRadius:12,background:"rgba(20,20,16,.02)",border:"1px solid rgba(20,20,16,.05)"}}>
                      <div style={{width:36,height:36,borderRadius:10,background:`${P.brown}14`,border:`1px solid ${P.brown}22`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"0.85rem",fontWeight:900,color:P.brown,lineHeight:1}}>
                          {r.event_date?new Date(r.event_date).getDate():"?"}
                        </span>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:"0.78rem",fontWeight:700,color:P.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.event_title||r.event_slug}</div>
                        <div style={{fontSize:"0.6rem",color:P.muted}}>{r.event_date?new Date(r.event_date).toLocaleDateString("fr-FR",{day:"numeric",month:"long"}):"Date TBD"}</div>
                      </div>
                      <span style={{fontSize:"0.58rem",color:P.muted,flexShrink:0}}>{formatDate(r.created_at,{relative:true})}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}