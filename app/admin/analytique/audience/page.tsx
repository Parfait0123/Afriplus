"use client";

/**
 * app/admin/analytique/audience/page.tsx
 * Analyse audience — membres, abonnés, pays, rôles
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

const IcoBack  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;

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

interface UserRow { id:string; full_name:string|null; email:string; role:string; country:string|null; domain:string|null; created_at:string; }
interface SubRow  { id:string; email:string; confirmed:boolean; created_at:string; }

export default function AnalytiqueAudience() {
  const sb = createClient();
  const [users,     setUsers]     = useState<UserRow[]>([]);
  const [subs,      setSubs]      = useState<SubRow[]>([]);
  const [countries, setCountries] = useState<{label:string;value:number}[]>([]);
  const [domains,   setDomains]   = useState<{label:string;value:number}[]>([]);
  const [roles,     setRoles]     = useState<{label:string;value:number;color:string}[]>([]);
  const [growth,    setGrowth]    = useState<{label:string;value:number}[]>([]);
  const [counts,    setCounts]    = useState({users:0,subs:0,confirmed:0,withCountry:0,withDomain:0});
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uR, sR] = await Promise.all([
        sb.from("profiles").select("id,full_name,email,role,country,domain,created_at").order("created_at",{ascending:false}).limit(30),
        sb.from("newsletter_subscribers").select("id,email,confirmed,created_at").order("created_at",{ascending:false}).limit(30),
      ]);

      const uD = (uR.data ?? []) as UserRow[];
      const sD = (sR.data ?? []) as SubRow[];
      setUsers(uD); setSubs(sD);

      // Stats
      const countryMap: Record<string,number> = {};
      uD.forEach(u => { if(u.country) countryMap[u.country]=(countryMap[u.country]??0)+1; });
      setCountries(Object.entries(countryMap).sort(([,a],[,b])=>b-a).slice(0,8).map(([k,v])=>({label:k,value:v})));

      const domainMap: Record<string,number> = {};
      uD.forEach(u => { if(u.domain) domainMap[u.domain]=(domainMap[u.domain]??0)+1; });
      setDomains(Object.entries(domainMap).sort(([,a],[,b])=>b-a).map(([k,v])=>({label:k,value:v})));

      const roleMap: Record<string,number> = {};
      uD.forEach(u => { roleMap[u.role]=(roleMap[u.role]??0)+1; });
      const roleColors: Record<string,string> = { admin:P.gold, editor:P.blue, reader:P.muted };
      setRoles(Object.entries(roleMap).map(([k,v])=>({label:k,value:v,color:roleColors[k]??P.muted})));

      // Croissance abonnés par mois (6 derniers mois)
      const monthMap: Record<string,number> = {};
      sD.forEach(s => {
        const d = new Date(s.created_at);
        const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        monthMap[k]=(monthMap[k]??0)+1;
      });
      const months: {label:string;value:number}[] = [];
      for(let i=5;i>=0;i--) {
        const d=new Date(); d.setMonth(d.getMonth()-i);
        const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        const label=d.toLocaleDateString("fr-FR",{month:"short"});
        months.push({label,value:monthMap[k]??0});
      }
      setGrowth(months);

      setCounts({
        users: uD.length,
        subs: sD.length,
        confirmed: sD.filter(s=>s.confirmed).length,
        withCountry: uD.filter(u=>u.country).length,
        withDomain: uD.filter(u=>u.domain).length,
      });

    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ROLE_LABEL: Record<string,string> = { admin:"Administrateur", editor:"Éditeur", reader:"Lecteur" };
  const ROLE_COLOR: Record<string,{color:string;bg:string}> = {
    admin:{color:P.gold,bg:"#FBF4E8"}, editor:{color:P.blue,bg:"#EBF0FB"}, reader:{color:P.muted,bg:"#F0EDE4"}
  };

  return (
    <div className="an-page">
      <div className="an-header">
        <div className="an-header-glow" />
        <div className="an-header-inner">
          <div>
            <Link href="/admin/analytique" style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",fontSize:"0.7rem",color:"rgba(248,246,241,.35)",textDecoration:"none",marginBottom:"0.6rem"}}>
              <IcoBack /> Analytique générale
            </Link>
            <div className="an-header-kicker">Analytique · Audience</div>
            <h1 className="an-header-title">Profil de l&apos;<em style={{fontStyle:"italic",fontWeight:200,color:P.gold}}>audience</em></h1>
            <p className="an-header-sub">Membres inscrits, abonnés newsletter, pays et domaines d&apos;intérêt</p>
          </div>
        </div>
        <div className="an-subnav">
          {[{href:"/admin/analytique",label:"Vue d'ensemble"},{href:"/admin/analytique/contenu",label:"Contenu"},{href:"/admin/analytique/audience",label:"Audience"},{href:"/admin/analytique/engagement",label:"Engagement"}].map(n=>(
            <Link key={n.href} href={n.href} className={`an-subnav-link ${n.href==="/admin/analytique/audience"?"an-subnav-link--active":""}`}>{n.label}</Link>
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
                {label:"Membres inscrits",   v:counts.users,    sub:"comptes créés",                            color:P.blue },
                {label:"Abonnés newsletter", v:counts.subs,     sub:`${counts.confirmed} confirmés`,            color:P.green},
                {label:"Taux confirmation",  v:counts.subs>0?Math.round((counts.confirmed/counts.subs)*100):0, sub:"% confirmés",    color:P.teal },
                {label:"Profils complets",   v:counts.withDomain, sub:`sur ${counts.users} membres`,            color:P.gold },
                {label:"Pays représentés",   v:countries.length,  sub:"dans les profils",                       color:P.brown},
                {label:"Taux renseigné",    v:counts.users>0?Math.round((counts.withCountry/counts.users)*100):0, sub:"% avec pays", color:P.red},
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

              {/* Répartition rôles */}
              <div className="an-card">
                <SH title="Rôles des membres" />
                <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginTop:"0.5rem"}}>
                  {roles.map(r=>{
                    const total=roles.reduce((s,x)=>s+x.value,0)||1;
                    const pct=Math.round((r.value/total)*100);
                    return(
                      <div key={r.label}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.3rem"}}>
                          <span style={{fontSize:"0.75rem",fontWeight:600,color:"#38382E"}}>{ROLE_LABEL[r.label]??r.label}</span>
                          <div style={{display:"flex",alignItems:"baseline",gap:"0.35rem"}}>
                            <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"0.9rem",fontWeight:900,color:r.color}}>{r.value}</span>
                            <span style={{fontSize:"0.58rem",color:P.muted}}>{pct}%</span>
                          </div>
                        </div>
                        <div style={{height:5,background:"rgba(20,20,16,.06)",borderRadius:100,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:r.color,borderRadius:100,transition:"width .9s ease"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Donut mini */}
                <div style={{marginTop:"1.25rem",paddingTop:"1rem",borderTop:"1px solid rgba(20,20,16,.06)"}}>
                  <div style={{display:"flex",gap:"0",justifyContent:"center"}}>
                    {roles.map(r=>(
                      <div key={r.label} style={{flex:1,textAlign:"center",padding:"0.5rem 0",borderLeft:roles.indexOf(r)>0?"1px solid rgba(20,20,16,.06)":"none"}}>
                        <div style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"1.25rem",fontWeight:900,color:r.color,lineHeight:1}}>{r.value}</div>
                        <div style={{fontSize:"0.55rem",color:P.muted,marginTop:"0.2rem",textTransform:"uppercase",letterSpacing:"0.07em"}}>{ROLE_LABEL[r.label]?.slice(0,5)??r.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top pays */}
              <div className="an-card">
                <SH title="Pays les plus représentés" sub="D'après les profils membres" />
                {countries.length===0 ? (
                  <div style={{textAlign:"center",padding:"2rem",fontSize:"0.8rem",color:P.muted}}>Aucun pays renseigné</div>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:"0.65rem",marginTop:"0.5rem"}}>
                    {countries.map((c,i)=>{
                      const max=countries[0].value||1;
                      const pct=Math.round((c.value/max)*100);
                      return(
                        <div key={i}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.25rem"}}>
                            <span style={{fontSize:"0.75rem",fontWeight:600,color:"#38382E"}}>{c.label}</span>
                            <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"0.85rem",fontWeight:900,color:P.blue}}>{c.value}</span>
                          </div>
                          <div style={{height:4,background:"rgba(20,20,16,.06)",borderRadius:100,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:P.blue,borderRadius:100,transition:"width .8s ease"}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Domaines d'intérêt */}
              <div className="an-card">
                <SH title="Domaines d'intérêt" sub="D'après les profils membres" />
                {domains.length===0 ? (
                  <div style={{textAlign:"center",padding:"2rem",fontSize:"0.8rem",color:P.muted}}>Aucun domaine renseigné</div>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:"0.65rem",marginTop:"0.5rem"}}>
                    {domains.slice(0,8).map((d,i)=>{
                      const max=domains[0].value||1;
                      const pct=Math.round((d.value/max)*100);
                      return(
                        <div key={i}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.25rem"}}>
                            <span style={{fontSize:"0.72rem",fontWeight:600,color:"#38382E",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,marginRight:"0.5rem"}}>{d.label}</span>
                            <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:"0.85rem",fontWeight:900,color:P.teal,flexShrink:0}}>{d.value}</span>
                          </div>
                          <div style={{height:4,background:"rgba(20,20,16,.06)",borderRadius:100,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:P.teal,borderRadius:100,transition:"width .8s ease"}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Croissance abonnés + liste membres récents */}
            <div className="an-grid-2">
              {/* Croissance newsletter 6 mois */}
              <div className="an-card">
                <SH title="Croissance newsletter" sub="Nouvelles inscriptions par mois (6 derniers mois)" />
                <div style={{display:"flex",alignItems:"flex-end",gap:"0.5rem",height:100,marginTop:"1rem",paddingTop:"0.5rem",borderTop:"1px solid rgba(20,20,16,.06)"}}>
                  {growth.map((g,i)=>{
                    const max=Math.max(...growth.map(x=>x.value),1);
                    const h=Math.max(4,(g.value/max)*80);
                    return(
                      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"0.35rem"}}>
                        <span style={{fontSize:"0.62rem",fontWeight:700,color:P.green,opacity:g.value>0?1:0}}>{g.value}</span>
                        <div style={{width:"100%",height:h,background:P.green,borderRadius:"4px 4px 0 0",opacity:0.85,transition:"height .8s ease"}}/>
                        <span style={{fontSize:"0.58rem",color:P.muted,textTransform:"uppercase",letterSpacing:"0.05em"}}>{g.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Membres récents */}
              <div className="an-card">
                <SH title="Membres récents" />
                {users.slice(0,8).map((u,i)=>{
                  const rs=ROLE_COLOR[u.role]??{color:P.muted,bg:"#F0EDE4"};
                  const ini=u.full_name?u.full_name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase():(u.email?.[0]??"?").toUpperCase();
                  return(
                    <div key={u.id} className="adm-list-row" style={{borderTop:i>0?"1px solid rgba(20,20,16,.05)":"none"}}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${rs.color}99,${rs.color}55)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Fraunces',Georgia,serif",fontSize:"0.72rem",fontWeight:900,color:"#fff",flexShrink:0}}>{ini}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="adm-list-title">{u.full_name||"—"}</div>
                        <div style={{fontSize:"0.62rem",color:P.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.18rem",flexShrink:0}}>
                        <span style={{fontSize:"0.54rem",fontWeight:800,letterSpacing:"0.07em",textTransform:"uppercase",padding:"0.14rem 0.52rem",borderRadius:100,background:rs.bg,color:rs.color}}>{ROLE_LABEL[u.role]??u.role}</span>
                        <span style={{fontSize:"0.58rem",color:P.muted}}>{formatDate(u.created_at,{relative:true})}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Abonnés récents */}
            <div className="an-card">
              <SH title="Abonnés newsletter récents" sub="Dernières inscriptions" />
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"0.5rem"}}>
                {subs.slice(0,12).map((s,i)=>(
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.65rem 0.85rem",borderRadius:10,background:"rgba(20,20,16,.02)",border:"1px solid rgba(20,20,16,.05)"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:s.confirmed?`${P.green}22`:`${P.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem",fontWeight:900,color:s.confirmed?P.green:P.gold,flexShrink:0}}>
                      {s.email[0].toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"0.78rem",fontWeight:600,color:P.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.email}</div>
                      <div style={{fontSize:"0.58rem",color:P.muted}}>{formatDate(s.created_at,{relative:true})}</div>
                    </div>
                    <span style={{fontSize:"0.54rem",fontWeight:800,padding:"0.12rem 0.48rem",borderRadius:100,background:s.confirmed?"#EAF4EF":"#FBF4E8",color:s.confirmed?P.green:P.gold,flexShrink:0}}>
                      {s.confirmed?"Confirmé":"En attente"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}