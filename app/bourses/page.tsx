import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { scholarships } from "@/lib/data";

const levels = ["Toutes formations", "Licence", "Master", "Doctorat", "Postdoc"];

export default function BoursesPage() {
  return (
    <>
      <Navbar />

      {/* Page header */}
      <div style={{ paddingTop: "5rem", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 2.5rem 3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#EAF4EF", border: "1px solid rgba(26,92,64,.15)", borderRadius: 100, padding: "0.38rem 0.9rem", fontSize: "0.73rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1A5C40", marginBottom: "1.5rem" }}>
            🎓 Bourses d&apos;études
          </div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(2.5rem,5vw,5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: "1.2rem" }}>
            Financez vos<br /><em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435" }}>ambitions</em>
          </h1>
          <p style={{ fontSize: "1rem", fontWeight: 300, color: "#928E80", maxWidth: 520, lineHeight: 1.75, marginBottom: "2rem" }}>
            {scholarships.length}+ bourses d&apos;études vérifiées pour les étudiants africains — Masters, Doctorats, programmes de formation internationale.
          </p>

          {/* Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {levels.map((l, i) => (
              <button key={l} style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.8rem", fontWeight: 600, padding: "0.45rem 1.1rem", borderRadius: 100, cursor: "pointer", transition: "all .22s", background: i === 0 ? "#141410" : "transparent", color: i === 0 ? "#fff" : "#38382E", border: i === 0 ? "none" : "1.5px solid rgba(20,20,16,.12)" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "0 0 6rem", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.3rem" }}>
            {scholarships.map((sc, i) => (
              <RevealWrapper key={sc.id} delay={0.06 * (i % 3)}>
                <Link href={`/bourses/${sc.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 28, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden", cursor: "pointer", transition: "all .3s", boxShadow: "0 1px 3px rgba(20,20,16,.04)", display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ height: 160, position: "relative", overflow: "hidden", flexShrink: 0 }}>
                      <div style={{ position: "absolute", inset: 0, background: sc.imageGradient }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 20%,rgba(0,0,0,.52) 100%)" }} />
                      {/* Flag */}
                      <div style={{ position: "absolute", bottom: "0.75rem", left: "0.9rem", zIndex: 2, display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)", padding: "0.22rem 0.65rem 0.22rem 0.42rem", borderRadius: 100, fontSize: "0.65rem", fontWeight: 700, color: "#141410", boxShadow: "0 2px 10px rgba(0,0,0,.18)" }}>
                        <span style={{ fontSize: "1rem" }}>{sc.flag}</span>
                        {sc.country}
                      </div>
                      {/* Urgency */}
                      <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", zIndex: 2, display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.22rem 0.65rem", borderRadius: 100, fontSize: "0.6rem", fontWeight: 700, background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)", color: "#141410" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.urgent ? "#B8341E" : "#1A5C40" }} />
                        {sc.urgent ? "Urgent" : "Ouvert"}
                      </div>
                      {/* Level badge */}
                      <div style={{ position: "absolute", top: "0.75rem", left: "0.9rem", zIndex: 2 }}>
                        <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.22rem 0.68rem", borderRadius: 100, background: "#EBF0FB", color: "#1E4DA8" }}>
                          {sc.level}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: "1.15rem 1.3rem", display: "flex", flexDirection: "column", gap: "0.55rem", flex: 1 }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#C08435" }}>{sc.organization}</div>
                      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#141410", lineHeight: 1.32, flex: 1 }}>{sc.title}</div>
                      {sc.amount && (
                        <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1A5C40", background: "#EAF4EF", padding: "0.25rem 0.7rem", borderRadius: 100, width: "fit-content" }}>
                          💰 {sc.amount}
                        </div>
                      )}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.32rem" }}>
                        {sc.tags.map((t) => (
                          <span key={t} style={{ fontSize: "0.6rem", fontWeight: 500, padding: "0.18rem 0.6rem", borderRadius: 100, background: "#F8F6F1", color: "#38382E", border: "1px solid rgba(20,20,16,.07)" }}>{t}</span>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.85rem", borderTop: "1px solid rgba(20,20,16,.07)" }}>
                        <span style={{ fontSize: "0.67rem", color: sc.urgent ? "#B8341E" : "#928E80", fontWeight: sc.urgent ? 600 : 400 }}>📅 {sc.deadline}</span>
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#C08435" }}>Voir la bourse →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </div>

      <NewsletterBand />
      <Footer />
    </>
  );
}
