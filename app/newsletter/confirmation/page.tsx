"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Navbar />
     
      <main style={{ background: "#F5F3EE", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 500, padding: "2rem" }}>
             <div style={{ margin: '3vh 0' }}></div>
          {success ? (
            <>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 900, marginBottom: "0.5rem" }}>
                Inscription confirmée !
              </h1>
              <p style={{ color: "#928E80", marginBottom: "2rem" }}>
                Merci de faire partie de la communauté AfriPulse. Vous recevrez bientôt nos actualités.
              </p>
              <Link href="/" style={{ display: "inline-flex", background: "#141410", color: "#fff", padding: ".75rem 1.5rem", borderRadius: 100, textDecoration: "none" }}>
                Découvrir le site
              </Link>
            </>
          ) : (
            <>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 900, marginBottom: "0.5rem" }}>
                Lien invalide
              </h1>
              <p style={{ color: "#928E80", marginBottom: "2rem" }}>
                Le lien de confirmation est invalide ou a expiré.
              </p>
              <Link href="/newsletter" style={{ display: "inline-flex", background: "#141410", color: "#fff", padding: ".75rem 1.5rem", borderRadius: 100, textDecoration: "none" }}>
                S'inscrire à nouveau
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}