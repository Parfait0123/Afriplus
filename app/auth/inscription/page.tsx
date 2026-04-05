"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* ── Inscription Google ── */
  async function handleGoogle() {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Après le callback OAuth, on redirige vers le dashboard de complétion
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profil`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setError("Erreur lors de la connexion Google. Réessayez.");
      setGoogleLoading(false);
    }
  }

  /* ── Inscription email ── */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profil`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Créer le profil en base
    if (data.user) {
      await (supabase.from("profiles") as any).insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: "reader",
      });
    }

    setSuccess(true);
    setLoading(false);
  }

  /* ── Force du mot de passe ── */
  function getStrength(pwd: string) {
    if (!pwd) return 0;
    if (pwd.length < 8) return 1;
    const hasMix = /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
    if (pwd.length >= 12 && hasMix && hasSpecial) return 4;
    if (pwd.length >= 10 && hasMix) return 3;
    return 2;
  }
  const strength = getStrength(password);
  const strengthColor = ["", "#B8341E", "#C08435", "#1A5C40", "#1A5C40"][
    strength
  ];
  const strengthLabel = ["", "Trop court", "Moyen", "Bon", "Excellent"][
    strength
  ];

  /* ── Écran de succès ── */
  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F8F6F1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 28,
            padding: "3rem",
            maxWidth: 440,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 12px 48px rgba(20,20,16,.10)",
          }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: "1.2rem" }}>📬</div>
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#141410",
              marginBottom: "0.75rem",
            }}
          >
            Vérifiez vos emails
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#928E80",
              lineHeight: 1.75,
              marginBottom: "2rem",
            }}
          >
            Un lien de confirmation a été envoyé à{" "}
            <strong style={{ color: "#141410" }}>{email}</strong>. Cliquez
            dessus pour activer votre compte et compléter votre profil.
          </p>
          <Link
            href="/auth/connexion"
            style={{
              display: "inline-flex",
              padding: "0.82rem 1.8rem",
              borderRadius: 100,
              background: "#141410",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            Aller à la connexion →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F6F1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      {/* Grain */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E\")",
        }}
      />

      <Link
        href="/"
        style={{
          position: "fixed",
          top: "1.5rem",
          left: "2rem",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "#928E80",
          textDecoration: "none",
          transition: "color .2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#141410")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#928E80")}
      >
        ← AroMe
      </Link>

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link
            href="/"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "2rem",
              fontWeight: 900,
              color: "#141410",
              textDecoration: "none",
              letterSpacing: "-0.04em",
            }}
          >
            Afri<span style={{ color: "#C08435" }}>Pulse</span>
          </Link>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#928E80",
              marginTop: "0.5rem",
            }}
          >
            Rejoignez la communauté AroMe — c&apos;est gratuit
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 28,
            padding: "2.5rem",
            boxShadow: "0 12px 48px rgba(20,20,16,.10)",
          }}
        >
          {/* ── Bouton Google ── */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.65rem",
              padding: "0.85rem 1.25rem",
              borderRadius: 100,
              border: "1.5px solid rgba(20,20,16,.12)",
              background: "#fff",
              color: "#38382E",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: googleLoading || loading ? "not-allowed" : "pointer",
              opacity: googleLoading || loading ? 0.7 : 1,
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              if (!googleLoading && !loading) {
                e.currentTarget.style.background = "#F8F6F1";
                e.currentTarget.style.borderColor = "rgba(20,20,16,.22)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "rgba(20,20,16,.12)";
            }}
          >
            {googleLoading ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid rgba(20,20,16,.15)",
                    borderTopColor: "#C08435",
                    animation: "ap-spin .7s linear infinite",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                Connexion Google en cours…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
                    fill="#FFC107"
                  />
                  <path
                    d="M6.3 14.7l6.6 4.8C14.6 15.5 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
                    fill="#FF3D00"
                  />
                  <path
                    d="M24 44c5.5 0 10.4-2 14.1-5.3l-6.5-5.5C29.6 35.1 27 36 24 36c-5.3 0-9.7-3.2-11.3-7.8L6 33.3C9.3 39.7 16.1 44 24 44z"
                    fill="#4CAF50"
                  />
                  <path
                    d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.2l6.5 5.5C37.4 38.8 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"
                    fill="#1976D2"
                  />
                </svg>
                S&apos;inscrire avec Google
              </>
            )}
          </button>

          {/* Badge "recommandé" Google */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#1A5C40",
                background: "#EAF4EF",
                padding: "0.15rem 0.6rem",
                borderRadius: 100,
                letterSpacing: "0.04em",
              }}
            >
              ✓ Recommandé — inscription en 1 clic
            </span>
          </div>

          {/* Séparateur */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              margin: "1.5rem 0",
            }}
          >
            <div
              style={{ flex: 1, height: 1, background: "rgba(20,20,16,.07)" }}
            />
            <span
              style={{
                fontSize: "0.72rem",
                color: "#928E80",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              ou avec un email
            </span>
            <div
              style={{ flex: 1, height: 1, background: "rgba(20,20,16,.07)" }}
            />
          </div>

          {/* ── Formulaire email ── */}
          <form
            onSubmit={handleRegister}
            style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
          >
            {error && (
              <div
                style={{
                  background: "#FAEBE8",
                  border: "1px solid rgba(184,52,30,.2)",
                  borderRadius: 12,
                  padding: "0.85rem 1.1rem",
                  fontSize: "0.82rem",
                  color: "#B8341E",
                  fontWeight: 500,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <div>
              <label style={labelStyle}>Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Kofi Mensah"
                required
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C08435")}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(20,20,16,.1)")
                }
              />
            </div>

            <div>
              <label style={labelStyle}>Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C08435")}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(20,20,16,.1)")
                }
              />
            </div>

            <div>
              <label style={labelStyle}>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                required
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C08435")}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(20,20,16,.1)")
                }
              />
              {/* Barre de force */}
              {password && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 2,
                          background:
                            i <= strength ? strengthColor : "rgba(20,20,16,.1)",
                          transition: "background .3s",
                        }}
                      />
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      marginTop: "0.3rem",
                      color: strengthColor,
                      fontWeight: 500,
                    }}
                  >
                    {strengthLabel}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Répétez le mot de passe"
                required
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C08435")}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(20,20,16,.1)")
                }
              />
              {/* Indicateur de correspondance */}
              {confirm && (
                <p
                  style={{
                    fontSize: "0.7rem",
                    marginTop: "0.3rem",
                    fontWeight: 500,
                    color: confirm === password ? "#1A5C40" : "#B8341E",
                  }}
                >
                  {confirm === password
                    ? "✓ Les mots de passe correspondent"
                    : "✗ Les mots de passe ne correspondent pas"}
                </p>
              )}
            </div>

            <p
              style={{
                fontSize: "0.73rem",
                color: "#928E80",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              En vous inscrivant, vous acceptez nos{" "}
              <Link
                href="/cgu"
                style={{ color: "#C08435", textDecoration: "none" }}
              >
                CGU
              </Link>{" "}
              et notre{" "}
              <Link
                href="/confidentialite"
                style={{ color: "#C08435", textDecoration: "none" }}
              >
                politique de confidentialité
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={loading || googleLoading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "0.9rem",
                fontWeight: 700,
                padding: "0.85rem",
                borderRadius: 100,
                background: "#141410",
                color: "#fff",
                border: "none",
                cursor: loading || googleLoading ? "not-allowed" : "pointer",
                opacity: loading || googleLoading ? 0.6 : 1,
                transition: "opacity .2s",
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,.3)",
                      borderTopColor: "#fff",
                      animation: "ap-spin .7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Création du compte…
                </>
              ) : (
                "Créer mon compte →"
              )}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.85rem",
            color: "#928E80",
          }}
        >
          Déjà un compte ?{" "}
          <Link
            href="/auth/connexion"
            style={{
              color: "#C08435",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Se connecter
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes ap-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#38382E",
  marginBottom: "0.5rem",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#F8F6F1",
  border: "1.5px solid rgba(20,20,16,.1)",
  borderRadius: 12,
  padding: "0.75rem 1rem",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "0.9rem",
  color: "#141410",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .2s",
};
