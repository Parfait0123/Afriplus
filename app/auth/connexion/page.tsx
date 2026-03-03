"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      router.push(redirect);
      router.refresh();
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6F1", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      {/* Back */}
      <Link href="/" style={{ position: "fixed", top: "1.5rem", left: "2rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "#928E80", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        ← AfriPulse
      </Link>

      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2rem", fontWeight: 900, color: "#141410", textDecoration: "none", letterSpacing: "-0.04em" }}>
            Afri<span style={{ color: "#C08435" }}>Pulse</span>
          </Link>
          <p style={{ fontSize: "0.9rem", color: "#928E80", marginTop: "0.5rem" }}>
            Connectez-vous à votre compte
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: 28, padding: "2.5rem", boxShadow: "0 12px 40px rgba(20,20,16,.10)" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

            {error && (
              <div style={{ background: "#FAEBE8", border: "1px solid rgba(184,52,30,.2)", borderRadius: 12, padding: "0.85rem 1.1rem", fontSize: "0.85rem", color: "#B8341E", fontWeight: 500 }}>
                {error}
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
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Mot de passe</label>
                <Link href="#" style={{ fontSize: "0.75rem", color: "#C08435", textDecoration: "none" }}>Mot de passe oublié ?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...btnPrimary, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Connexion en cours…" : "Se connecter →"}
            </button>

          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.8rem 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(20,20,16,.07)" }} />
            <span style={{ fontSize: "0.75rem", color: "#928E80" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "rgba(20,20,16,.07)" }} />
          </div>

          {/* Google OAuth */}
          <button
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              });
            }}
            style={{ ...btnOutline, width: "100%", justifyContent: "center", gap: "0.6rem" }}
          >
            <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
              <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" fill="#FFC107"/>
              <path d="M6.3 14.7l6.6 4.8C14.6 15.5 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" fill="#FF3D00"/>
              <path d="M24 44c5.5 0 10.4-2 14.1-5.3l-6.5-5.5C29.6 35.1 27 36 24 36c-5.3 0-9.7-3.2-11.3-7.8L6 33.3C9.3 39.7 16.1 44 24 44z" fill="#4CAF50"/>
              <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.2l6.5 5.5C37.4 38.8 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" fill="#1976D2"/>
            </svg>
            Continuer avec Google
          </button>

        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "#928E80" }}>
          Pas encore de compte ?{" "}
          <Link href="/auth/inscription" style={{ color: "#C08435", fontWeight: 600, textDecoration: "none" }}>
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </div>
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
  transition: "border-color .2s",
  boxSizing: "border-box",
};

const btnPrimary: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "0.9rem",
  fontWeight: 700,
  padding: "0.85rem",
  borderRadius: 100,
  background: "#141410",
  color: "#fff",
  border: "none",
};

const btnOutline: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "0.85rem",
  fontWeight: 600,
  padding: "0.75rem 1.2rem",
  borderRadius: 100,
  background: "transparent",
  color: "#38382E",
  border: "1.5px solid rgba(20,20,16,.12)",
  cursor: "pointer",
  transition: "all .22s",
};
