"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      router.push(redirect);
      router.refresh();
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        queryParams: {
          // Force la sélection du compte Google à chaque fois
          prompt: "select_account",
        },
      },
    });
    if (error) {
      setError("Erreur lors de la connexion Google. Réessayez.");
      setGoogleLoading(false);
    }
    // La redirection OAuth est gérée par Supabase — pas besoin de setLoading(false)
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
      {/* Grain subtil */}
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
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
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
            Connectez-vous à votre compte
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
              background: googleLoading ? "#F8F6F1" : "#fff",
              color: "#38382E",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: googleLoading || loading ? "not-allowed" : "pointer",
              transition: "all .2s",
              opacity: googleLoading || loading ? 0.7 : 1,
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
                {/* Google SVG officiel */}
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
                Continuer avec Google
              </>
            )}
          </button>

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
              ou par email
            </span>
            <div
              style={{ flex: 1, height: 1, background: "rgba(20,20,16,.07)" }}
            />
          </div>

          {/* ── Formulaire email ── */}
          <form
            onSubmit={handleLogin}
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
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                ⚠️ {error}
              </div>
            )}

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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  Mot de passe
                </label>
                <Link
                  href="/auth/mot-de-passe-oublie"
                  style={{
                    fontSize: "0.75rem",
                    color: "#C08435",
                    textDecoration: "none",
                    transition: "opacity .2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C08435")}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(20,20,16,.1)")
                }
              />
            </div>

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
                  Connexion en cours…
                </>
              ) : (
                "Se connecter →"
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
          Pas encore de compte ?{" "}
          <Link
            href="/auth/inscription"
            style={{
              color: "#C08435",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes ap-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense
      fallback={<div style={{ minHeight: "100vh", background: "#F8F6F1" }} />}
    >
      <ConnexionForm />
    </Suspense>
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
