import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { opportunities } from "@/lib/data";

const types = ["Tous", "Emploi CDI", "Stage", "Graduate", "Emploi", "Volontariat"];

const typeColors: Record<string, { bg: string; color: string }> = {
  "Emploi CDI": { bg: "#EAF4EF", color: "#1A5C40" },
  "Stage":      { bg: "#EBF0FB", color: "#1E4DA8" },
  "Graduate":   { bg: "#FBF4E8", color: "#C08435" },
  "Emploi":     { bg: "#FBF4E8", color: "#C08435" },
  "Freelance":  { bg: "#FAEBE8", color: "#B8341E" },
  "Volontariat":{ bg: "#F0EDE4", color: "#928E80" },
};

export default function OpportunitesPage() {
  return (
    <>
      <Navbar />

      {/* Page header */}
      <div style={{ paddingTop: "5rem", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 2.5rem 3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#EBF0FB", border: "1px solid rgba(30,77,168,.15)", borderRadius: 100, padding: "0.38rem 0.9rem", fontSize: "0.73rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1E4DA8", marginBottom: "1.5rem" }}>
            💼 Opportunités professionnelles
          </div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(2.5rem,5vw,5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: "1.2rem" }}>
            Boostez votre<br /><em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435" }}>carrière</em>
          </h1>
          <p style={{ fontSize: "1rem", fontWeight: 300, color: "#928E80", maxWidth: 520, lineHeight: 1.75, marginBottom: "2rem" }}>
            Emplois, stages, programmes graduate et appels à candidatures de premier plan sur le continent africain.
          </p>

          {/* Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {types.map((t, i) => (
              <button key={t} style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.8rem", fontWeight: 600, padding: "0.45rem 1.1rem", borderRadius: 100, cursor: "pointer", transition: "all .22s", background: i === 0 ? "#141410" : "transparent", color: i === 0 ? "#fff" : "#38382E", border: i === 0 ? "none" : "1.5px solid rgba(20,20,16,.12)" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "0 0 6rem", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.2rem" }}>
            {opportunities.map((opp, i) => {
              const tc = typeColors[opp.type] || { bg: "#FBF4E8", color: "#C08435" };
              return (
                <RevealWrapper key={opp.id} delay={0.06 * (i % 4)}>
                  <Link href={`/opportunites/${opp.slug}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: "#fff", borderRadius: 28, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden", cursor: "pointer", transition: "all .3s", boxShadow: "0 1px 3px rgba(20,20,16,.04)", display: "flex", flexDirection: "column", height: "100%" }}>
                      <div style={{ height: 140, position: "relative", overflow: "hidden", flexShrink: 0 }}>
                        <div style={{ position: "absolute", inset: 0, background: opp.imageGradient }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 10%,rgba(0,0,0,.55) 100%)" }} />
                        {/* Logo */}
                        <div style={{ position: "absolute", bottom: "0.7rem", left: "0.85rem", zIndex: 2, width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,.93)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.82rem", fontWeight: 900, color: "#C08435", boxShadow: "0 2px 10px rgba(0,0,0,.2)" }}>
                          {opp.companyInitials}
                        </div>
                        {/* Type tag */}
                        <div style={{ position: "absolute", top: "0.7rem", right: "0.7rem", zIndex: 2 }}>
                          <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.22rem 0.68rem", borderRadius: 100, ...tc }}>
                            {opp.type}
                          </span>
                        </div>
                      </div>
                      <div style={{ padding: "1.1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.48rem", flex: 1 }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#C08435" }}>{opp.company}</div>
                        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#141410", lineHeight: 1.32, flex: 1 }}>{opp.title}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.8rem", borderTop: "1px solid rgba(20,20,16,.07)" }}>
                          <span style={{ fontSize: "0.68rem", color: "#928E80" }}>📍 {opp.location}</span>
                          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#C08435" }}>Postuler →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </RevealWrapper>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <button style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.9rem", fontWeight: 600, padding: "0.82rem 2.2rem", borderRadius: 100, cursor: "pointer", background: "transparent", color: "#38382E", border: "1.5px solid rgba(20,20,16,.12)" }}>
              Voir plus d&apos;opportunités
            </button>
          </div>
        </div>
      </div>

      <NewsletterBand />
      <Footer />
    </>
  );
}
