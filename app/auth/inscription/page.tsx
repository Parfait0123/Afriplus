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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Créer le profil
    if (data.user) {
      await (supabase.from("profiles") as any ).insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: "reader",
      });
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F6F1", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ background: "#fff", borderRadius: 28, padding: "3rem", maxWidth: 440, width: "100%", textAlign: "center", boxShadow: "0 12px 40px rgba(20,20,16,.10)" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1.2rem" }}>📬</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 700, color: "#141410", marginBottom: "0.75rem" }}>
            Vérifiez vos emails
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#928E80", lineHeight: 1.75, marginBottom: "2rem" }}>
            Un lien de confirmation a été envoyé à <strong style={{ color: "#141410" }}>{email}</strong>. Cliquez dessus pour activer votre compte.
          </p>
          <Link href="/auth/connexion" style={{ display: "inline-flex", padding: "0.82rem 1.8rem", borderRadius: 100, background: "#141410", color: "#fff", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            Aller à la connexion →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6F1", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <Link href="/" style={{ position: "fixed", top: "1.5rem", left: "2rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "#928E80", textDecoration: "none" }}>
        ← AfriPulse
      </Link>

      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2rem", fontWeight: 900, color: "#141410", textDecoration: "none", letterSpacing: "-0.04em" }}>
            Afri<span style={{ color: "#C08435" }}>Pulse</span>
          </Link>
          <p style={{ fontSize: "0.9rem", color: "#928E80", marginTop: "0.5rem" }}>
            Rejoignez la communauté AfriPulse
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: 28, padding: "2.5rem", boxShadow: "0 12px 40px rgba(20,20,16,.10)" }}>
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

            {error && (
              <div style={{ background: "#FAEBE8", border: "1px solid rgba(184,52,30,.2)", borderRadius: 12, padding: "0.85rem 1.1rem", fontSize: "0.85rem", color: "#B8341E", fontWeight: 500 }}>
                {error}
              </div>
            )}

            <div>
              <label style={labelStyle}>Nom complet</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Kofi Mensah" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Adresse email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 caractères minimum" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Répétez le mot de passe" required style={inputStyle} />
            </div>

            {/* Password strength */}
            {password && (
              <div style={{ display: "flex", gap: "4px" }}>
                {[1, 2, 3, 4].map((i) => {
                  const strength = password.length >= 8 ? (password.length >= 12 ? (/[^a-zA-Z0-9]/.test(password) ? 4 : 3) : 2) : 1;
                  return (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? (strength <= 1 ? "#B8341E" : strength <= 2 ? "#C08435" : "#1A5C40") : "rgba(20,20,16,.1)" }} />
                  );
                })}
              </div>
            )}

            <p style={{ fontSize: "0.75rem", color: "#928E80", lineHeight: 1.6, margin: 0 }}>
              En vous inscrivant, vous acceptez nos{" "}
              <Link href="#" style={{ color: "#C08435" }}>CGU</Link> et notre{" "}
              <Link href="#" style={{ color: "#C08435" }}>politique de confidentialité</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.9rem", fontWeight: 700, padding: "0.85rem", borderRadius: 100, background: "#141410", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Création du compte…" : "Créer mon compte →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "#928E80" }}>
          Déjà un compte ?{" "}
          <Link href="/auth/connexion" style={{ color: "#C08435", fontWeight: 600, textDecoration: "none" }}>
            Se connecter
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
  boxSizing: "border-box",
};
