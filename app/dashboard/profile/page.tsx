"use client";
/**
 * app/dashboard/profil/page.tsx
 *
 * Page de complétion de profil — affichée après :
 *   - Inscription via Google (nouvel utilisateur)
 *   - Confirmation email (nouvel utilisateur email/password)
 *
 * L'utilisateur peut définir / modifier :
 *   - Nom complet
 *   - Mot de passe (uniquement pour les comptes Google qui n'en ont pas)
 *   - Pays de résidence
 *   - Domaine d'intérêt
 *   - Avatar (upload ou URL)
 */
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

/* ── Données ── */
const COUNTRIES = [
  "Afrique du Sud","Algérie","Angola","Bénin","Botswana","Burkina Faso",
  "Burundi","Cabo Verde","Cameroun","Centrafrique","Comores","Congo (Brazzaville)",
  "Congo (Kinshasa)","Côte d'Ivoire","Djibouti","Égypte","Érythrée","Éthiopie",
  "Gabon","Gambie","Ghana","Guinée","Guinée-Bissau","Guinée équatoriale",
  "Kenya","Lesotho","Liberia","Libye","Madagascar","Malawi","Mali","Maroc",
  "Maurice","Mauritanie","Mozambique","Namibie","Niger","Nigeria","Ouganda",
  "Rwanda","São Tomé-et-Príncipe","Sénégal","Seychelles","Sierra Leone",
  "Somalie","Soudan","Soudan du Sud","Swaziland","Tanzanie","Tchad","Togo",
  "Tunisie","Zambie","Zimbabwe",
  // Hors Afrique
  "France","Belgique","Suisse","Canada","États-Unis","Royaume-Uni","Allemagne",
  "Espagne","Portugal","Italie","Pays-Bas","Autre",
];

const DOMAINS = [
  "Toutes disciplines","Tech & Informatique","Finance & Économie",
  "Sciences & Ingénierie","Santé & Médecine","Droit & Gouvernance",
  "Agriculture & Environnement","Arts & Culture","Éducation",
  "Entrepreneuriat & Startup","Humanitaire & ONG","Communication & Médias",
  "Architecture & Design","Sciences sociales",
];

/* ── Étapes ── */
const STEPS = [
  { id: 1, label: "Votre identité",    icon: "👤" },
  { id: 2, label: "Vos préférences",   icon: "🎯" },
  { id: 3, label: "Sécurité",          icon: "🔒" },
];

function ProfilCompletionForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isNew        = searchParams.get("new") === "1";
  const supabase     = createClient();

  const [step, setStep]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);

  // Données utilisateur
  const [userId,    setUserId]    = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isGoogle,  setIsGoogle]  = useState(false); // compte Google = pas de mot de passe natif

  // Form fields
  const [fullName,   setFullName]   = useState("");
  const [avatarUrl,  setAvatarUrl]  = useState("");
  const [country,    setCountry]    = useState("");
  const [domain,     setDomain]     = useState("");
  const [newPwd,     setNewPwd]     = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Charger l'utilisateur courant ── */
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/connexion");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email ?? "");

      // Déterminer si c'est un compte Google (identities)
      const googleIdentity = user.identities?.find(i => i.provider === "google");
      setIsGoogle(!!googleIdentity);

      // Charger le profil existant
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name ?? user.user_metadata?.full_name ?? "");
        setAvatarUrl(profile.avatar_url ?? user.user_metadata?.avatar_url ?? "");
        setCountry(profile.country ?? "");
        setDomain(profile.domain ?? "");
      } else {
        // Fallback sur les metadata Google
        setFullName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "");
        setAvatarUrl(user.user_metadata?.avatar_url ?? "");
      }

      setLoading(false);
    })();
  }, []);

  /* ── Upload avatar ── */
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (!upErr) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    }
    setUploadingAvatar(false);
  }

  /* ── Sauvegarde finale ── */
  async function handleSave() {
    setError("");
    setSaving(true);

    // Validation mot de passe (uniquement si l'utilisateur en saisit un)
    if (newPwd || !isGoogle) {
      if (newPwd.length < 8) {
        setError("Le mot de passe doit comporter au moins 8 caractères.");
        setSaving(false);
        return;
      }
      if (newPwd !== confirmPwd) {
        setError("Les mots de passe ne correspondent pas.");
        setSaving(false);
        return;
      }
    }

    try {
      // 1. Mettre à jour le profil en base
      const { error: profileErr } = await (supabase.from("profiles") as any)
        .upsert({
          id:         userId,
          email:      userEmail,
          full_name:  fullName,
          avatar_url: avatarUrl || null,
          country:    country || null,
          domain:     domain  || null,
          updated_at: new Date().toISOString(),
        });

      if (profileErr) throw profileErr;

      // 2. Mettre à jour le mot de passe si fourni
      if (newPwd) {
        const { error: pwdErr } = await supabase.auth.updateUser({ password: newPwd });
        if (pwdErr) throw pwdErr;
      }

      setSuccess(true);
      // Redirection vers le dashboard principal après 1,5 secondes
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue. Réessayez.");
      setSaving(false);
    }
  }

  /* ── Validation par étape ── */
  function canGoNext() {
    if (step === 1) return fullName.trim().length >= 2;
    if (step === 2) return country !== "" && domain !== "";
    return true;
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#F8F6F1",
        display: "flex", alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid rgba(20,20,16,.08)",
            borderTopColor: "#C08435",
            animation: "ap-spin .8s linear infinite",
            margin: "0 auto 1rem",
          }} />
          <p style={{ color: "#928E80", fontSize: ".85rem" }}>Chargement de votre profil…</p>
        </div>
        <style>{`@keyframes ap-spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Succès ── */
  if (success) {
    return (
      <div style={{
        minHeight: "100vh", background: "#F8F6F1",
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: "2rem",
      }}>
        <div style={{
          background: "#fff", borderRadius: 28,
          padding: "3rem", maxWidth: 440, width: "100%",
          textAlign: "center",
          boxShadow: "0 12px 48px rgba(20,20,16,.10)",
        }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎉</div>
          <h2 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "1.75rem", fontWeight: 700,
            color: "#141410", marginBottom: ".6rem",
          }}>
            Votre profil est prêt !
          </h2>
          <p style={{ fontSize: ".9rem", color: "#928E80", lineHeight: 1.7 }}>
            Bienvenue sur AfriPulse. Vous allez être redirigé vers votre tableau de bord…
          </p>
          <div style={{
            marginTop: "1.5rem",
            width: "100%", height: 3, borderRadius: 2,
            background: "rgba(20,20,16,.07)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 2,
              background: "#C08435",
              animation: "ap-progress 1.5s linear forwards",
            }} />
          </div>
        </div>
        <style>{`
          @keyframes ap-spin { to { transform:rotate(360deg); } }
          @keyframes ap-progress { from { width:0 } to { width:100% } }
        `}</style>
      </div>
    );
  }

  /* ── Interface principale ── */
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={{
      minHeight: "100vh", background: "#F8F6F1",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem",
    }}>
      {/* Bouton passer */}
      {isNew && (
        <Link href="/dashboard" style={{
          position: "fixed", top: "1.5rem", right: "2rem",
          fontSize: ".78rem", color: "#928E80", textDecoration: "none",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          transition: "color .2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "#141410")}
          onMouseLeave={e => (e.currentTarget.style.color = "#928E80")}
        >
          Passer pour l&apos;instant →
        </Link>
      )}

      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* En-tête */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "1.8rem", fontWeight: 900,
            color: "#141410", textDecoration: "none",
            letterSpacing: "-0.04em",
          }}>
            Afri<span style={{ color: "#C08435" }}>Pulse</span>
          </Link>

          {isNew && (
            <div style={{
              marginTop: ".75rem",
              display: "inline-flex", alignItems: "center", gap: ".4rem",
              background: "#EAF4EF", borderRadius: 100,
              padding: ".25rem .85rem",
              fontSize: ".75rem", fontWeight: 700, color: "#1A5C40",
            }}>
              ✓ Compte créé avec succès
            </div>
          )}

          <p style={{ fontSize: ".88rem", color: "#928E80", marginTop: ".6rem" }}>
            {isNew
              ? "Complétez votre profil pour personnaliser votre expérience"
              : "Gérez les informations de votre profil"}
          </p>
        </div>

        {/* Barre de progression */}
        <div style={{ marginBottom: "2rem" }}>
          {/* Étapes */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".75rem" }}>
            {STEPS.map(s => (
              <div key={s.id} style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: ".3rem",
                flex: 1,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: step >= s.id ? "#141410" : "#fff",
                  border: `2px solid ${step >= s.id ? "#141410" : "rgba(20,20,16,.15)"}`,
                  display: "flex", alignItems: "center",
                  justifyContent: "center",
                  fontSize: step > s.id ? ".75rem" : "1rem",
                  transition: "all .3s",
                  color: step >= s.id ? "#fff" : "#928E80",
                }}>
                  {step > s.id ? "✓" : s.icon}
                </div>
                <span style={{
                  fontSize: ".62rem", fontWeight: 600,
                  color: step >= s.id ? "#141410" : "#928E80",
                  letterSpacing: ".03em", textAlign: "center",
                }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          {/* Ligne de progression */}
          <div style={{
            height: 3, background: "rgba(20,20,16,.08)",
            borderRadius: 2, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 2,
              background: "#C08435",
              width: `${progress}%`,
              transition: "width .4s cubic-bezier(.4,0,.2,1)",
            }} />
          </div>
        </div>

        {/* Carte principale */}
        <div style={{
          background: "#fff", borderRadius: 28,
          padding: "2.5rem",
          boxShadow: "0 12px 48px rgba(20,20,16,.10)",
        }}>

          {/* ── ÉTAPE 1 : Identité ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <h2 style={{ ...headingStyle }}>Votre identité</h2>
                <p style={subStyle}>Ces informations s&apos;affichent sur votre profil public.</p>
              </div>

              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: avatarUrl ? `url(${avatarUrl}) center/cover` : "linear-gradient(135deg,#141410,#38382E)",
                    border: "3px solid rgba(20,20,16,.1)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                    position: "relative", overflow: "hidden",
                    transition: "border-color .2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#C08435")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(20,20,16,.1)")}
                >
                  {!avatarUrl && (
                    <span style={{ fontSize: "1.75rem" }}>
                      {fullName ? fullName.slice(0, 1).toUpperCase() : "?"}
                    </span>
                  )}
                  {/* Overlay au hover */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "rgba(0,0,0,.45)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center",
                    opacity: 0, transition: "opacity .2s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
                  >
                    <span style={{ fontSize: ".7rem", color: "#fff", fontWeight: 700 }}>
                      {uploadingAvatar ? "⏳" : "Changer"}
                    </span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: ".82rem", fontWeight: 600, color: "#38382E", marginBottom: ".25rem" }}>
                    Photo de profil
                  </p>
                  <p style={{ fontSize: ".72rem", color: "#928E80", lineHeight: 1.5 }}>
                    JPG ou PNG · max 2 Mo<br />
                    {isGoogle && "Photo Google importée automatiquement"}
                  </p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingAvatar}
                    style={{
                      marginTop: ".5rem",
                      fontSize: ".72rem", fontWeight: 600,
                      color: "#C08435", background: "none",
                      border: "none", cursor: "pointer",
                      padding: 0, fontFamily: "inherit",
                    }}
                  >
                    {uploadingAvatar ? "Upload en cours…" : "Changer la photo →"}
                  </button>
                </div>
                <input
                  ref={fileRef} type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  style={{ display: "none" }}
                />
              </div>

              {/* Nom complet */}
              <div>
                <label style={labelStyle}>Nom complet *</label>
                <input
                  type="text" value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Kofi Mensah" required
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = "#C08435")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(20,20,16,.1)")}
                />
              </div>

              {/* Email (lecture seule) */}
              <div>
                <label style={labelStyle}>Adresse email</label>
                <div style={{
                  padding: ".75rem 1rem", borderRadius: 12,
                  background: "rgba(20,20,16,.04)",
                  border: "1.5px solid rgba(20,20,16,.07)",
                  fontSize: ".9rem", color: "#928E80",
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <span>{userEmail}</span>
                  {isGoogle && (
                    <span style={{
                      fontSize: ".65rem", fontWeight: 700,
                      background: "#EBF0FB", color: "#1E4DA8",
                      padding: ".15rem .55rem", borderRadius: 100,
                    }}>
                      Google
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : Préférences ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <h2 style={headingStyle}>Vos préférences</h2>
                <p style={subStyle}>Nous personnalisons votre fil d&apos;actualités en fonction de ces informations.</p>
              </div>

              <div>
                <label style={labelStyle}>Pays de résidence *</label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  style={{ ...inputStyle, appearance: "auto", cursor: "pointer" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#C08435")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(20,20,16,.1)")}
                >
                  <option value="">Sélectionnez votre pays…</option>
                  {COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Domaine d&apos;intérêt principal *</label>
                <select
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  style={{ ...inputStyle, appearance: "auto", cursor: "pointer" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#C08435")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(20,20,16,.1)")}
                >
                  <option value="">Sélectionnez un domaine…</option>
                  {DOMAINS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div style={{
                background: "#F8F6F1", borderRadius: 14,
                padding: "1rem 1.2rem",
                border: "1px solid rgba(20,20,16,.07)",
              }}>
                <p style={{ fontSize: ".78rem", fontWeight: 600, color: "#38382E", marginBottom: ".4rem" }}>
                  À quoi servent ces informations ?
                </p>
                <ul style={{ fontSize: ".72rem", color: "#928E80", lineHeight: 1.8, paddingLeft: "1rem", margin: 0 }}>
                  <li>Newsletter adaptée à votre région et votre domaine</li>
                  <li>Bourses et opportunités filtrées selon votre profil</li>
                  <li>Recommandations d&apos;événements à proximité</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : Sécurité ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <h2 style={headingStyle}>Sécurité du compte</h2>
                <p style={subStyle}>
                  {isGoogle
                    ? "Vous pouvez définir un mot de passe pour accéder à votre compte sans Google."
                    : "Renforcez la sécurité de votre compte."}
                </p>
              </div>

              {/* Badge Google */}
              {isGoogle && (
                <div style={{
                  background: "#EBF0FB", borderRadius: 12,
                  padding: ".85rem 1rem",
                  border: "1px solid rgba(30,77,168,.15)",
                  display: "flex", alignItems: "flex-start", gap: ".75rem",
                }}>
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, marginTop: ".1rem" }}>
                    <path d="M43.6 20.5H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" fill="#1976D2"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: ".78rem", fontWeight: 700, color: "#1E4DA8", marginBottom: ".2rem" }}>
                      Compte connecté via Google
                    </p>
                    <p style={{ fontSize: ".72rem", color: "#5A7BC4", lineHeight: 1.5 }}>
                      Votre compte est déjà sécurisé par Google. Vous pouvez ajouter un mot de passe supplémentaire ci-dessous (optionnel).
                    </p>
                  </div>
                </div>
              )}

              {/* Champs mot de passe */}
              <div>
                <label style={labelStyle}>
                  {isGoogle ? "Nouveau mot de passe (optionnel)" : "Nouveau mot de passe *"}
                </label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="8 caractères minimum"
                  required={!isGoogle}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = "#C08435")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(20,20,16,.1)")}
                />
                {/* Force */}
                {newPwd && (
                  <div style={{ marginTop: ".5rem" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[1, 2, 3, 4].map(i => {
                        const s = newPwd.length >= 8
                          ? (newPwd.length >= 12 && /[^a-zA-Z0-9]/.test(newPwd) ? 4
                            : newPwd.length >= 10 ? 3 : 2)
                          : 1;
                        return (
                          <div key={i} style={{
                            flex: 1, height: 3, borderRadius: 2,
                            background: i <= s
                              ? s === 1 ? "#B8341E" : s === 2 ? "#C08435" : "#1A5C40"
                              : "rgba(20,20,16,.1)",
                            transition: "background .3s",
                          }} />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>
                  {isGoogle ? "Confirmer le mot de passe (optionnel)" : "Confirmer le mot de passe *"}
                </label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  required={!isGoogle}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = "#C08435")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(20,20,16,.1)")}
                />
                {confirmPwd && (
                  <p style={{
                    fontSize: ".7rem", marginTop: ".3rem", fontWeight: 500,
                    color: confirmPwd === newPwd ? "#1A5C40" : "#B8341E",
                  }}>
                    {confirmPwd === newPwd ? "✓ Correspond" : "✗ Ne correspond pas"}
                  </p>
                )}
              </div>

              {/* Erreur finale */}
              {error && (
                <div style={{
                  background: "#FAEBE8",
                  border: "1px solid rgba(184,52,30,.2)",
                  borderRadius: 12, padding: ".85rem 1.1rem",
                  fontSize: ".82rem", color: "#B8341E", fontWeight: 500,
                }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div style={{
            display: "flex", gap: ".75rem",
            marginTop: "2rem", justifyContent: "space-between",
          }}>
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  padding: ".75rem 1.5rem", borderRadius: 100,
                  border: "1.5px solid rgba(20,20,16,.12)",
                  background: "transparent", color: "#38382E",
                  fontSize: ".88rem", fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all .2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F8F6F1")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                ← Retour
              </button>
            ) : <div />}

            {step < STEPS.length ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canGoNext()}
                style={{
                  padding: ".75rem 2rem", borderRadius: 100,
                  border: "none",
                  background: canGoNext() ? "#141410" : "rgba(20,20,16,.12)",
                  color: canGoNext() ? "#fff" : "#928E80",
                  fontSize: ".88rem", fontWeight: 700,
                  cursor: canGoNext() ? "pointer" : "not-allowed",
                  fontFamily: "inherit", transition: "all .2s",
                }}
              >
                Continuer →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: ".75rem 2rem", borderRadius: 100,
                  border: "none",
                  background: saving ? "#928E80" : "#C08435",
                  color: "#fff",
                  fontSize: ".88rem", fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: ".5rem",
                  transition: "background .2s",
                }}
              >
                {saving ? (
                  <>
                    <span style={{
                      width: 14, height: 14, borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,.3)",
                      borderTopColor: "#fff",
                      animation: "ap-spin .7s linear infinite",
                      display: "inline-block",
                    }} />
                    Enregistrement…
                  </>
                ) : "Terminer et accéder au dashboard →"}
              </button>
            )}
          </div>
        </div>

        {/* Indication confidentialité */}
        <p style={{
          textAlign: "center", marginTop: "1.25rem",
          fontSize: ".72rem", color: "#928E80", lineHeight: 1.6,
        }}>
          🔒 Vos données sont chiffrées et ne sont jamais partagées.{" "}
          <Link href="/confidentialite" style={{ color: "#C08435", textDecoration: "none" }}>
            Politique de confidentialité
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes ap-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#F8F6F1" }} />}>
      <ProfilCompletionForm />
    </Suspense>
  );
}

/* ── Styles partagés ── */
const headingStyle: React.CSSProperties = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: "1.3rem", fontWeight: 700,
  color: "#141410", letterSpacing: "-0.02em",
  marginBottom: ".35rem",
};
const subStyle: React.CSSProperties = {
  fontSize: ".82rem", color: "#928E80", lineHeight: 1.6,
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: ".8rem",
  fontWeight: 600, color: "#38382E", marginBottom: ".5rem",
};
const inputStyle: React.CSSProperties = {
  width: "100%", background: "#F8F6F1",
  border: "1.5px solid rgba(20,20,16,.1)",
  borderRadius: 12, padding: ".75rem 1rem",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: ".9rem", color: "#141410",
  outline: "none", boxSizing: "border-box",
  transition: "border-color .2s",
};