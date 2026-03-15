"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import type {
  Profile,
  Save,
  Application,
  EventRegistration,
  ApplicationStatus,
  DashboardTab,
} from "@/types";
import {
  STATUS_LABEL,
  STATUS_COLOR,
  CONTENT_PATHS,
  CONTENT_LABEL,
} from "@/types";

/* ================================================================
   Constantes module-level — jamais recréées
   ================================================================ */
const DOMAINS = [
  "Finance","Tech & Numérique","Santé","Droit","Environnement",
  "Éducation","Agriculture","Entrepreneuriat","Sciences","Culture & Arts","Autre",
];
const LEVELS = [
  "Lycéen","Étudiant Licence","Étudiant Master","Doctorant",
  "Junior (0-3 ans)","Confirmé (3-7 ans)","Senior (7+ ans)","Entrepreneur",
];

/** Seuls ces champs sont envoyés à Supabase lors d'un update profil */
const PROFILE_EDITABLE: (keyof Profile)[] = [
  "full_name","avatar_url","country","city","bio",
  "domain","level","linkedin_url","website_url",
  "notify_saves","notify_news",
];

const TABS: { key: DashboardTab; label: string; Icon: () => JSX.Element }[] = [
  { key: "saves",        label: "Sauvegardes",  Icon: IcoBookmark  },
  { key: "applications", label: "Candidatures", Icon: IcoBriefcase },
  { key: "events",       label: "Événements",   Icon: IcoCalendar  },
  { key: "profile",      label: "Profil",       Icon: IcoUser      },
];

/* ================================================================
   PAGE
   ================================================================ */
export default function DashboardPage() {
  const router = useRouter();

  /**
   * Une seule instance Supabase pour tout le cycle de vie du composant.
   * useMemo garantit qu'elle ne sera jamais recrée lors d'un re-render.
   */
  const supabase = useMemo(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
  []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── État ── */
  const [mounted, setMounted]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState<DashboardTab>("saves");
  const [profile, setProfile]         = useState<Profile | null>(null);
  const profileRef                    = useRef<Profile | null>(null); // toujours à jour, pas de stale closure
  const [saves, setSaves]             = useState<Save[]>([]);
  const [applications, setApps]       = useState<Application[]>([]);
  const [events, setEvents]           = useState<EventRegistration[]>([]);
  const [saveFilter, setSaveFilter]   = useState("all");
  const [appFilter, setAppFilter]     = useState("all");

  /* Profil form */
  const [profileForm, setProfileForm] = useState<Partial<Profile>>({});
  const profileFormRef                = useRef<Partial<Profile>>({}); // idem pour le form
  const [saving, setSaving]           = useState(false);
  const [savedOk, setSavedOk]         = useState(false);
  const [saveError, setSaveError]     = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  /* Hydratation SSR */
  useEffect(() => { setMounted(true); }, []);

  /* ── Fetch données ── */
  useEffect(() => {
    if (!mounted) return;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }

      const uid = data.user.id;
      const [p, s, a, e] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).single(),
        supabase.from("saves").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("applications").select("*").eq("user_id", uid).order("deadline", { ascending: true, nullsFirst: false }),
        supabase.from("event_registrations").select("*").eq("user_id", uid).order("event_date", { ascending: true }),
      ]);

      setProfile(p.data ?? null);
      setSaves(s.data ?? []);
      setApps(a.data ?? []);
      setEvents(e.data ?? []);
      setLoading(false);
    });
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Sync form quand le profil est chargé */
  useEffect(() => {
    if (profile) setProfileForm({ ...profile });
  }, [profile]);

  /* ── Actions données ── */
  const deleteSave = async (id: string) => {
    await supabase.from("saves").delete().eq("id", id);
    setSaves(p => p.filter(x => x.id !== id));
  };

  const deleteApp = async (id: string) => {
    await supabase.from("applications").delete().eq("id", id);
    setApps(p => p.filter(x => x.id !== id));
  };

  const updateAppStatus = async (id: string, status: ApplicationStatus) => {
    await supabase.from("applications").update({ status }).eq("id", id);
    setApps(p => p.map(a => a.id === id ? { ...a, status } : a));
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("event_registrations").delete().eq("id", id);
    setEvents(p => p.filter(x => x.id !== id));
  };

  const exportICS = (r: EventRegistration) => {
    if (!r.event_date) return;
    const dt  = r.event_date.replace(/-/g, "");
    const ics = [
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//AfriPulse//FR",
      "BEGIN:VEVENT",
      `UID:${r.event_slug}@afripulse.com`,
      `DTSTART;VALUE=DATE:${dt}`,
      `DTEND;VALUE=DATE:${dt}`,
      `SUMMARY:${r.event_title ?? r.event_slug}`,
      r.event_location ? `LOCATION:${r.event_location}` : "",
      `URL:https://afripulse.com/evenements/${r.event_slug}`,
      "END:VEVENT","END:VCALENDAR",
    ].filter(Boolean).join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    Object.assign(document.createElement("a"), { href: url, download: `${r.event_slug}.ics` }).click();
    URL.revokeObjectURL(url);
  };

  /* ── Sauvegarde profil ── */
  const saveProfile = async () => {
    // Guards explicites avec feedback immédiat
    if (!profile) { setSaveError("Profil non chargé, rechargez la page."); return; }
    if (!profile.id) { setSaveError("ID profil manquant."); return; }

    setSaving(true);
    setSaveError(null);

    try {
      // N'envoyer QUE les champs avec une vraie valeur (pas les undefined)
      // Les champs vides/null sont envoyés explicitement pour effacer
      const payload: Record<string, unknown> = {};
      for (const key of PROFILE_EDITABLE) {
        const val = profileForm[key];
        // On envoie undefined → on skip / on envoie null ou string → on l'inclut
        if (val !== undefined) {
          payload[key] = val === "" ? null : val;
        }
      }

      const { data, error, status } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", profile.id)
        .select()
        .single();

      console.log("saveProfile →", { status, error, data });

      if (error) {
        setSaveError(`Erreur Supabase (${error.code}) : ${error.message}`);
        setSaving(false);
        return;
      }

      // Mettre à jour l'état local avec la réponse de la base
      const updated = data as Profile;
      setProfile(updated);
      setProfileForm({ ...updated });
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);

    } catch (err) {
      console.error("saveProfile exception:", err);
      setSaveError("Erreur inattendue. Vérifiez la console.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Upload photo ── */
  const uploadAvatar = async (file: File) => {
    if (!profile?.id) return;
    setAvatarUploading(true);
    setSaveError(null);

    const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${profile.id}/avatar.${ext}`;

    const { error: storageError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (storageError) {
      console.error("uploadAvatar error:", storageError);
      setSaveError("Upload échoué. Vérifiez que le bucket 'avatars' existe et est public.");
      setAvatarUploading(false);
      return;
    }

    /* URL publique + cache-bust pour forcer le rechargement */
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: dbError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", profile.id);

    if (dbError) {
      setSaveError(`Erreur mise à jour photo : ${dbError.message}`);
      setAvatarUploading(false);
      return;
    }

    setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
    setProfileForm(prev => ({ ...prev, avatar_url: avatarUrl }));
    setAvatarUploading(false);
  };

  /* ── Computed ── */
  const filteredSaves = saveFilter === "all"
    ? saves
    : saves.filter(s => s.content_type === saveFilter);

  const filteredApps = appFilter === "all"
    ? applications
    : applications.filter(a => a.status === appFilter);

  const counts: Record<DashboardTab, number | null> = {
    saves:        saves.length,
    applications: applications.length,
    events:       events.length,
    profile:      null,
  };

  /* ── Renders conditionnels ── */
  if (!mounted) return null;

  if (loading) return (
    <>
      <Navbar />
      <div className="db-page" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div className="db-spinner" />
          <p style={{ fontFamily:"'Fraunces',serif", fontSize:"0.95rem", color:"#928E80", margin:0 }}>
            Chargement…
          </p>
        </div>
      </div>
      <Footer />
    </>
  );

  /* ================================================================
     RENDU
     ================================================================ */
  return (
    <>
      <Navbar />
      <div className="db-page">

        {/* ── Header ── */}
        <header className="db-header">
          <div className="db-header-grid" />
          <div className="db-header-glow" />
          <div className="db-header-inner">
            <div className="db-avatar">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <span>{profile?.full_name?.[0]?.toUpperCase() ?? "A"}</span>
              }
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="db-header-name">{profile?.full_name ?? "Mon espace"}</div>
              <div className="db-header-sub">
                {[profile?.domain, profile?.country].filter(Boolean).join(" · ") || "Complétez votre profil"}
              </div>
            </div>
            <div className="db-stats">
              {([
                { n: saves.length,        l:"Saves"   },
                { n: applications.length, l:"Candid." },
                { n: events.length,       l:"Events"  },
              ] as const).map(s => (
                <div key={s.l} className="db-stat">
                  <div className="db-stat-n">{s.n}</div>
                  <div className="db-stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── Tabs desktop ── */}
        <div className="db-tabs">
          <div className="db-tabs-inner">
            {TABS.map(t => {
              const active = tab === t.key;
              const count  = counts[t.key];
              return (
                <button key={t.key} className="db-tab-btn" onClick={() => setTab(t.key)}
                  style={{ borderBottom:`2.5px solid ${active?"#C08435":"transparent"}`, color:active?"#141410":"#928E80", fontWeight:active?700:500 }}>
                  <t.Icon />
                  {t.label}
                  {count !== null && count > 0 && (
                    <span className="db-tab-badge" style={{ background:active?"#C08435":"#EAE7DE", color:active?"#fff":"#928E80" }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Corps ── */}
        <main className="db-body">

          {/* ══ SAUVEGARDES ══ */}
          {tab === "saves" && (
            <section style={{ animation:"db-rise .3s ease both" }}>
              <ChipsRow
                items={[
                  { k:"all",         l:"Tout",         n:saves.length },
                  { k:"article",     l:"Articles",     n:saves.filter(s=>s.content_type==="article").length },
                  { k:"scholarship", l:"Bourses",      n:saves.filter(s=>s.content_type==="scholarship").length },
                  { k:"opportunity", l:"Opportunités", n:saves.filter(s=>s.content_type==="opportunity").length },
                  { k:"event",       l:"Événements",   n:saves.filter(s=>s.content_type==="event").length },
                ].filter(f => f.k==="all" || f.n>0)}
                active={saveFilter} onChange={setSaveFilter}
              />
              {filteredSaves.length === 0
                ? <EmptyState icon="☆" title="Aucune sauvegarde" desc="Appuyez sur ☆ sur n'importe quelle fiche pour la retrouver ici." />
                : (
                  <div className="db-saves-grid">
                    {filteredSaves.map((s,i) => <SaveCard key={s.id} save={s} delay={i*55} onDelete={deleteSave} />)}
                  </div>
                )
              }
            </section>
          )}

          {/* ══ CANDIDATURES ══ */}
          {tab === "applications" && (
            <section style={{ animation:"db-rise .3s ease both" }}>
              <ChipsRow
                items={[
                  { k:"all", l:"Toutes", n:applications.length },
                  ...(Object.keys(STATUS_LABEL) as ApplicationStatus[])
                    .filter(s => applications.some(a => a.status===s))
                    .map(s => ({ k:s, l:STATUS_LABEL[s], n:applications.filter(a=>a.status===s).length, color:STATUS_COLOR[s].color, bg:STATUS_COLOR[s].bg })),
                ]}
                active={appFilter} onChange={setAppFilter}
              />
              {filteredApps.length === 0
                ? <EmptyState icon="📋" title="Aucune candidature" desc="Suivez vos dossiers depuis les fiches bourses et opportunités." />
                : (
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.8rem" }}>
                    {filteredApps.map((app,i) => {
                      const sc       = STATUS_COLOR[app.status];
                      const daysLeft = app.deadline ? Math.ceil((new Date(app.deadline).getTime()-Date.now())/86400000) : null;
                      const urgent   = daysLeft!==null && daysLeft>0 && daysLeft<=14;
                      const past     = daysLeft!==null && daysLeft<=0;
                      return (
                        <div key={app.id} className="db-card-sm" style={{ padding:"1.15rem 1.25rem", animationDelay:`${i*55}ms` }}>
                          <div className="db-app-row">
                            <div style={{ width:9, height:9, borderRadius:"50%", background:sc.color, flexShrink:0, marginTop:"0.35rem" }} />
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", gap:"0.35rem", flexWrap:"wrap", marginBottom:"0.35rem" }}>
                                <Tag>{app.content_type==="scholarship"?"Bourse":"Opportunité"}</Tag>
                                {urgent && <Tag color="#B8341E" bg="#FAEBE8">⏳ {daysLeft}j restants</Tag>}
                                {past   && <Tag>Deadline passée</Tag>}
                              </div>
                              <div style={{ fontFamily:"'Fraunces',serif", fontSize:"0.94rem", fontWeight:800, color:"#141410", lineHeight:1.3, marginBottom:"0.3rem" }}>
                                {app.content_title ?? app.content_slug}
                              </div>
                              {app.notes && <p style={{ fontSize:"0.72rem", color:"#928E80", margin:"0 0 0.4rem", lineHeight:1.5 }}>{app.notes}</p>}
                              <Link href={`${CONTENT_PATHS[app.content_type]}/${app.content_slug}`}
                                style={{ display:"inline-flex", alignItems:"center", gap:"0.25rem", fontSize:"0.7rem", fontWeight:700, color:"#C08435", textDecoration:"none" }}>
                                Voir la fiche <IcoArrow />
                              </Link>
                            </div>
                            <div className="db-app-actions">
                              <select value={app.status} onChange={e => updateAppStatus(app.id, e.target.value as ApplicationStatus)}
                                style={{ padding:"0.38rem 0.6rem", borderRadius:10, border:`1.5px solid ${sc.color}45`, background:sc.bg, color:sc.color, fontWeight:700, fontSize:"0.72rem", outline:"none", fontFamily:"inherit", cursor:"pointer" }}>
                                {(Object.keys(STATUS_LABEL) as ApplicationStatus[]).map(s => (
                                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                                ))}
                              </select>
                              <button onClick={() => deleteApp(app.id)}
                                style={{ padding:"0.42rem 0.55rem", borderRadius:9, background:"#FAEBE8", border:"none", color:"#B8341E", cursor:"pointer", display:"flex" }}>
                                <IcoTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              }
            </section>
          )}

          {/* ══ ÉVÉNEMENTS ══ */}
          {tab === "events" && (
            <section style={{ animation:"db-rise .3s ease both" }}>
              {events.length === 0
                ? <EmptyState icon="📅" title="Aucun événement" desc="Inscrivez-vous à des événements pour les retrouver ici avec export .ics." />
                : (
                  <div className="db-events-grid">
                    {events.map((r,i) => {
                      const isPast  = !!r.event_date && new Date(r.event_date) < new Date();
                      const dateObj = r.event_date ? new Date(r.event_date) : null;
                      return (
                        <div key={r.id} className="db-card" style={{ overflow:"hidden", opacity:isPast?0.72:1, animationDelay:`${i*60}ms` }}>
                          <div style={{ background:isPast?"#EAE7DE":"linear-gradient(135deg,#FBF4E8 0%,#F5EDD8 100%)", borderBottom:"1px solid rgba(192,132,53,.1)", padding:"1rem 1.25rem", display:"flex", alignItems:"center", gap:"1rem" }}>
                            <div style={{ fontFamily:"'Fraunces',serif", fontSize:"2rem", fontWeight:900, color:isPast?"#928E80":"#C08435", lineHeight:1 }}>
                              {dateObj ? dateObj.getDate() : "—"}
                            </div>
                            <div>
                              <div style={{ fontSize:"0.62rem", fontWeight:700, color:"#928E80", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                                {dateObj ? dateObj.toLocaleDateString("fr-FR",{month:"long",year:"numeric"}) : "Date TBD"}
                              </div>
                              {isPast && <div style={{ fontSize:"0.52rem", fontWeight:800, color:"#928E80", textTransform:"uppercase", marginTop:"0.1rem" }}>Passé</div>}
                            </div>
                          </div>
                          <div style={{ padding:"1rem 1.25rem" }}>
                            <div style={{ fontFamily:"'Fraunces',serif", fontSize:"0.92rem", fontWeight:800, color:"#141410", lineHeight:1.3, marginBottom:"0.4rem" }}>
                              {r.event_title ?? r.event_slug}
                            </div>
                            {r.event_location && <p style={{ fontSize:"0.65rem", color:"#928E80", margin:"0 0 0.85rem" }}>📍 {r.event_location}</p>}
                            <div style={{ display:"flex", gap:"0.5rem" }}>
                              <Link href={`/evenements/${r.event_slug}`}
                                style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"0.3rem", fontSize:"0.72rem", fontWeight:700, color:"#C08435", padding:"0.6rem", borderRadius:11, background:"#FBF4E8", textDecoration:"none" }}>
                                Voir <IcoArrow />
                              </Link>
                              {!isPast && r.event_date && (
                                <button onClick={() => exportICS(r)}
                                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"0.3rem", fontSize:"0.72rem", fontWeight:700, color:"#1E4DA8", padding:"0.6rem", borderRadius:11, background:"#EBF0FB", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
                                  <IcoICS /> .ics
                                </button>
                              )}
                              <button onClick={() => deleteEvent(r.id)}
                                style={{ padding:"0.6rem 0.75rem", borderRadius:11, background:"#FAEBE8", border:"none", color:"#B8341E", cursor:"pointer", display:"flex" }}>
                                <IcoTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              }
            </section>
          )}

          {/* ══ PROFIL ══ */}
          {tab === "profile" && (
            <section className="db-profile-wrap" style={{ animation:"db-rise .3s ease both" }}>
              <div className="db-card" style={{ padding:"1.75rem" }}>

                {/* Avatar + identité */}
                <div style={{ display:"flex", alignItems:"center", gap:"1.25rem", paddingBottom:"1.5rem", borderBottom:"1px solid rgba(20,20,16,.06)", marginBottom:"1.75rem" }}>
                  <AvatarUpload
                    url={profile?.avatar_url ?? null}
                    initials={profile?.full_name?.[0]?.toUpperCase() ?? "A"}
                    uploading={avatarUploading}
                    onFile={uploadAvatar}
                  />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.05rem", fontWeight:900, color:"#141410", lineHeight:1.2 }}>
                      {profile?.full_name ?? "—"}
                    </div>
                    <div style={{ fontSize:"0.7rem", color:"#928E80", marginTop:"0.2rem" }}>
                      {[profile?.domain, profile?.country].filter(Boolean).join(" · ") || "Domaine non renseigné"}
                    </div>
                    {/* Lien vers profil public */}
                    {profile?.id && (
                      <Link href={`/profil/${profile.id}`} target="_blank"
                        style={{ display:"inline-flex", alignItems:"center", gap:"0.25rem", fontSize:"0.65rem", fontWeight:700, color:"#C08435", textDecoration:"none", marginTop:"0.4rem" }}>
                        Voir mon profil public <IcoArrow />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Formulaire */}
                <FormSection title="Informations">
                  {([
                    { k:"full_name",    l:"Nom complet", t:"text", ph:"Votre nom" },
                    { k:"country",      l:"Pays",        t:"text", ph:"Ex : Sénégal" },
                    { k:"city",         l:"Ville",       t:"text", ph:"Ex : Dakar" },
                    { k:"linkedin_url", l:"LinkedIn",    t:"url",  ph:"https://linkedin.com/in/…" },
                    { k:"website_url",  l:"Site web",    t:"url",  ph:"https://…" },
                  ] as const).map(f => (
                    <Field key={f.k} label={f.l}>
                      <input type={f.t} placeholder={f.ph} className="db-inp"
                        value={(profileForm as Record<string,unknown>)[f.k] as string ?? ""}
                        onChange={e => setProfileForm(p => ({ ...p, [f.k]: e.target.value }))}
                      />
                    </Field>
                  ))}
                  <Field label="Bio courte">
                    <textarea rows={3} placeholder="Quelques mots sur vous…" className="db-inp"
                      value={profileForm.bio ?? ""}
                      onChange={e => setProfileForm(p => ({ ...p, bio:e.target.value }))}
                      style={{ resize:"vertical" }}
                    />
                  </Field>
                  <div className="db-domain-grid">
                    {([
                      { k:"domain", l:"Domaine",         opts:DOMAINS },
                      { k:"level",  l:"Niveau / Profil", opts:LEVELS  },
                    ] as const).map(f => (
                      <Field key={f.k} label={f.l}>
                        <select className="db-inp"
                          value={(profileForm as Record<string,unknown>)[f.k] as string ?? ""}
                          onChange={e => setProfileForm(p => ({ ...p, [f.k]:e.target.value }))}>
                          <option value="">— Choisir —</option>
                          {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </Field>
                    ))}
                  </div>
                </FormSection>

                <FormSection title="Préférences">
                  {([
                    { k:"notify_saves", l:"Rappels deadlines", d:"Email avant l'expiration de vos sauvegardes" },
                    { k:"notify_news",  l:"Newsletter hebdo",  d:"Le récap AfriPulse chaque semaine" },
                  ] as const).map(pref => {
                    const on = !!(profileForm as Record<string,unknown>)[pref.k];
                    return (
                      <div key={pref.k} style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"0.9rem 0", borderBottom:"1px solid rgba(20,20,16,.05)" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:"0.88rem", fontWeight:600, color:"#141410" }}>{pref.l}</div>
                          <div style={{ fontSize:"0.68rem", color:"#928E80", marginTop:"0.1rem" }}>{pref.d}</div>
                        </div>
                        <Toggle on={on} onToggle={() => setProfileForm(p => ({ ...p, [pref.k]:!on }))} />
                      </div>
                    );
                  })}
                </FormSection>

                {/* Message d'erreur */}
                {saveError && (
                  <div style={{ margin:"0 0 1rem", padding:"0.75rem 1rem", borderRadius:12, background:"#FAEBE8", border:"1px solid rgba(184,52,30,.15)", fontSize:"0.78rem", color:"#B8341E", fontWeight:600 }}>
                    {saveError}
                  </div>
                )}

                <button
                  type="button"
                  disabled={saving || avatarUploading}
                  onClick={() => { saveProfile().catch(err => { console.error(err); setSaveError("Erreur inattendue."); setSaving(false); }); }}
                  style={{
                    width: "100%",
                    padding: "0.95rem",
                    borderRadius: 14,
                    background: savedOk ? "#1A5C40" : saving ? "#a0732e" : "#C08435",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    cursor: (saving || avatarUploading) ? "not-allowed" : "pointer",
                    transition: "background .2s",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    opacity: (saving || avatarUploading) ? 0.85 : 1,
                  }}
                >
                  {saving ? (
                    <>
                      <span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,.35)", borderTopColor:"#fff", borderRadius:"50%", animation:"db-spin .7s linear infinite", display:"inline-block", flexShrink:0 }} />
                      Enregistrement…
                    </>
                  ) : savedOk ? (
                    <><IcoCheck /> Profil mis à jour !</>
                  ) : (
                    "Enregistrer le profil"
                  )}
                </button>
              </div>
            </section>
          )}

        </main>
      </div>

      {/* ── Bottom nav mobile ── */}
      <nav className="db-bnav">
        {TABS.map(t => {
          const active = tab === t.key;
          const count  = counts[t.key];
          return (
            <button key={t.key} className="db-bnav-btn" onClick={() => setTab(t.key)}
              style={{ color:active?"#C08435":"rgba(255,255,255,.4)" }}>
              <div className="db-bnav-icon" style={{ background:active?"rgba(192,132,53,.15)":"transparent" }}>
                <t.Icon />
                {count!==null && count>0 && (
                  <span className="db-bnav-dot">{count>9?"9+":count}</span>
                )}
              </div>
              <span className="db-bnav-label" style={{ color:active?"#C08435":"rgba(255,255,255,.35)", fontWeight:active?700:500 }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>

      <Footer />
    </>
  );
}

/* ================================================================
   COMPOSANTS UI
   ================================================================ */

/** Avatar cliquable avec overlay "modifier" */
function AvatarUpload({ url, initials, uploading, onFile }: {
  url: string | null;
  initials: string;
  uploading: boolean;
  onFile: (f: File) => void;
}) {
  return (
    <label style={{ position:"relative", cursor:"pointer", flexShrink:0 }}>
      <div style={{ width:68, height:68, borderRadius:"50%", background:"linear-gradient(135deg,#C08435,#7a5220)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Fraunces',serif", fontSize:"1.6rem", fontWeight:900, color:"#fff", overflow:"hidden", boxShadow:"0 4px 18px rgba(192,132,53,.25)", border:"3px solid rgba(192,132,53,.3)" }}>
        {uploading
          ? <div style={{ width:24, height:24, border:"2.5px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"db-spin .8s linear infinite" }} />
          : url
            ? <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            : initials
        }
      </div>
      {/* Overlay crayon au hover */}
      {!uploading && (
        <div className="db-avatar-overlay">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
      )}
      <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display:"none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
      />
    </label>
  );
}

function ChipsRow({ items, active, onChange }: {
  items: { k:string; l:string; n:number; color?:string; bg?:string }[];
  active: string;
  onChange: (k:string) => void;
}) {
  return (
    <div className="db-chips">
      {items.map(f => {
        const isActive = active === f.k;
        return (
          <button key={f.k} className="db-chip" onClick={() => onChange(f.k)}
            style={{ background:isActive?(f.bg??"#FBF4E8"):"#fff", color:isActive?(f.color??"#C08435"):"#928E80", borderColor:isActive?(f.color??"#C08435"):"rgba(20,20,16,.1)" }}>
            {f.l} · {f.n}
          </button>
        );
      })}
    </div>
  );
}

function SaveCard({ save, delay, onDelete }: { save:Save; delay:number; onDelete:(id:string)=>void }) {
  const meta  = save.content_meta;
  const label = CONTENT_LABEL[save.content_type as keyof typeof CONTENT_LABEL] ?? save.content_type;
  return (
    <div className="db-card-sm" style={{ padding:"1.2rem 1.3rem", display:"flex", flexDirection:"column", gap:"0.6rem", animationDelay:`${delay}ms` }}>
      <div style={{ display:"flex", alignItems:"center" }}>
        <Tag>{label}</Tag>
        <button onClick={() => onDelete(save.id)}
          style={{ marginLeft:"auto", background:"none", border:"none", color:"#C8C4BC", cursor:"pointer", padding:"0.2rem", display:"flex" }}>
          <IcoTrash />
        </button>
      </div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:"0.93rem", fontWeight:800, color:"#141410", lineHeight:1.3, flex:1 }}>
        {save.content_title ?? save.content_slug}
      </div>
      {meta?.deadline as string && (
        <div style={{ fontSize:"0.68rem", color:"#B8341E", fontWeight:700 }}>⏳ Deadline : {String(meta?.deadline)}</div>
      )}
      <Link href={`${CONTENT_PATHS[save.content_type]}/${save.content_slug}`}
        style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem", fontSize:"0.72rem", fontWeight:700, color:"#C08435", textDecoration:"none" }}>
        Voir la fiche <IcoArrow />
      </Link>
    </div>
  );
}

function FormSection({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:"1.5rem" }}>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:"0.9rem", fontWeight:900, color:"#141410", marginBottom:"1rem" }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:"1rem" }}>
      <label style={{ fontSize:"0.58rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#928E80", display:"block", marginBottom:"0.38rem" }}>{label}</label>
      {children}
    </div>
  );
}

function Tag({ children, color="#928E80", bg="#EAE7DE" }: { children:React.ReactNode; color?:string; bg?:string }) {
  return (
    <span style={{ fontSize:"0.56rem", fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", padding:"0.15rem 0.55rem", borderRadius:100, background:bg, color }}>
      {children}
    </span>
  );
}

function Toggle({ on, onToggle }: { on:boolean; onToggle:()=>void }) {
  return (
    <button onClick={onToggle}
      style={{ width:46, height:27, borderRadius:100, border:"none", cursor:"pointer", flexShrink:0, position:"relative", background:on?"#1A5C40":"rgba(20,20,16,.12)", transition:"background .2s" }}>
      <div style={{ width:21, height:21, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:on?22:3, transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.18)" }} />
    </button>
  );
}

function EmptyState({ icon, title, desc }: { icon:string; title:string; desc:string }) {
  return (
    <div className="db-empty">
      <div style={{ fontSize:"2.4rem", marginBottom:"0.9rem" }}>{icon}</div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1rem", fontWeight:800, color:"#141410", marginBottom:"0.4rem" }}>{title}</div>
      <div style={{ fontSize:"0.82rem", color:"#928E80", maxWidth:300, margin:"0 auto", lineHeight:1.65 }}>{desc}</div>
    </div>
  );
}

/* ================================================================
   ICÔNES (module-level — jamais recréées)
   ================================================================ */
function IcoBookmark()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>; }
function IcoBriefcase() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>; }
function IcoCalendar()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IcoUser()      { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function IcoTrash()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }
function IcoArrow()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function IcoICS()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="12 14 12 18 16 16"/></svg>; }
function IcoCheck()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }