// app/auth/ban/page.tsx
// Page affichée aux utilisateurs bannis
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function BanPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier l'état de l'utilisateur
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // Pas d'utilisateur connecté, rediriger vers l'accueil
        router.push("/");
        return;
      }

      // Vérifier si l'utilisateur est vraiment banni
      const { data: profile } = (await supabase
        .from("profiles")
        .select("banned, email")
        .eq("id", user.id)
        .single()) as any;

      if (!profile || profile.banned !== true) {
        // L'utilisateur n'est pas banni, rediriger
        router.push("/");
        return;
      }

      setUserEmail(profile.email || user.email);
    };

    checkUser();
  }, [supabase, router]);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F3EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: 500,
          width: "100%",
          background: "#fff",
          borderRadius: 24,
          padding: "2.5rem",
          textAlign: "center",
          boxShadow: "0 24px 64px rgba(20,20,16,.12)",
          border: "1px solid rgba(20,20,16,.08)",
        }}
      >
        {/* Icône d'avertissement */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            background: "rgba(184,52,30,.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B8341E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "1.8rem",
            fontWeight: 900,
            color: "#141410",
            marginBottom: "0.75rem",
            letterSpacing: "-0.03em",
          }}
        >
          Compte suspendu
        </h1>

        <p
          style={{
            fontSize: "0.9rem",
            color: "#928E80",
            lineHeight: 1.6,
            marginBottom: "1rem",
          }}
        >
          Votre compte a été suspendu par l'équipe d'administration.
        </p>

        {userEmail && (
          <p
            style={{
              fontSize: "0.8rem",
              color: "#B8341E",
              background: "rgba(184,52,30,.08)",
              padding: "0.5rem 1rem",
              borderRadius: 12,
              marginBottom: "1.5rem",
              display: "inline-block",
            }}
          >
            {userEmail}
          </p>
        )}

        <p
          style={{
            fontSize: "0.8rem",
            color: "#928E80",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          Si vous pensez qu'il s'agit d'une erreur, veuillez contacter
          l'administrateur du site.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/">
            <button
              style={{
                padding: "0.7rem 1.5rem",
                borderRadius: 12,
                border: "1.5px solid rgba(20,20,16,.12)",
                background: "transparent",
                color: "#38382E",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .18s",
              }}
            >
              Retour à l'accueil
            </button>
          </Link>
          <button
            onClick={handleLogout}
            disabled={loading}
            style={{
              padding: "0.7rem 1.5rem",
              borderRadius: 12,
              border: "none",
              background: "#141410",
              color: "#fff",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "all .18s",
            }}
          >
            {loading ? "Déconnexion..." : "Se déconnecter"}
          </button>
        </div>

        <p
          style={{
            fontSize: "0.65rem",
            color: "#D0CCBF",
            marginTop: "2rem",
          }}
        >
          Conformément aux conditions d'utilisation d'AroMe
        </p>
      </div>
    </div>
  );
}
