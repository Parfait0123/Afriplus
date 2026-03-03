import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div style={{
        minHeight: "100vh",
        paddingTop: "62px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8F6F1",
      }}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "8rem", fontWeight: 900, color: "rgba(20,20,16,.06)", lineHeight: 1, display: "block" }}>404</span>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#141410", marginTop: "-2rem", marginBottom: "1rem" }}>
            Page introuvable
          </h1>
          <p style={{ fontSize: "1rem", fontWeight: 300, color: "#928E80", maxWidth: 400, margin: "0 auto 2rem", lineHeight: 1.75 }}>
            Cette page n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil pour continuer votre exploration.
          </p>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 600, padding: "0.82rem 1.8rem", borderRadius: 100, textDecoration: "none", background: "#141410", color: "#fff" }}>
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
