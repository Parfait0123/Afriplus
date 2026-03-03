import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";

const team = [
  { name: "Kofi Asante", role: "Fondateur & Éditeur en chef", country: "🇬🇭 Ghana", initials: "KA" },
  { name: "Fatou Diallo", role: "Directrice contenu & Bourses", country: "🇸🇳 Sénégal", initials: "FD" },
  { name: "Amina Wanjiku", role: "Responsable Tech & IA", country: "🇰🇪 Kenya", initials: "AW" },
  { name: "Emeka Okafor", role: "Correspondant Afrique de l'Ouest", country: "🇳🇬 Nigeria", initials: "EO" },
];

const values = [
  { icon: "🌍", title: "Panafricanisme", desc: "Nous couvrons l'ensemble des 55 pays africains avec le même niveau d'attention et de rigueur." },
  { icon: "🎯", title: "Exactitude", desc: "Chaque information publiée est vérifiée par notre équipe éditoriale avant toute diffusion." },
  { icon: "🚀", title: "Opportunité", desc: "Nous croyons que chaque Africain mérite d'accéder aux meilleures opportunités mondiales." },
  { icon: "🤝", title: "Communauté", desc: "AfriPulse est construit avec et pour la communauté africaine à travers le monde." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <div style={{ paddingTop: "62px" }}>
        <div style={{
          background: "linear-gradient(135deg, #0a0800 0%, #1a1400 40%, #261e00 70%, #0a0800 100%)",
          padding: "6rem 2.5rem 5rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 800px 500px at 60% 50%, rgba(192,132,53,.1) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(192,132,53,.15)", border: "1px solid rgba(192,132,53,.25)", borderRadius: 100, padding: "0.38rem 0.9rem", fontSize: "0.73rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#E09B48", marginBottom: "2rem" }}>
              Notre mission
            </div>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(2.5rem,6vw,5.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, color: "#fff", marginBottom: "2rem" }}>
              Informer, connecter,{" "}
              <em style={{ fontStyle: "italic", fontWeight: 200, color: "#E09B48" }}>élever</em>
            </h1>
            <p style={{ fontSize: "1.1rem", fontWeight: 300, color: "rgba(255,255,255,.55)", lineHeight: 1.8, maxWidth: 620, margin: "0 auto" }}>
              AfriPulse est né de la conviction que chaque Africain, où qu&apos;il se trouve, doit avoir accès aux meilleures informations, bourses et opportunités du continent.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "#F8F6F1", padding: "4rem 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem" }}>
            {[
              { n: "12K+", l: "Lecteurs actifs", desc: "Communauté en croissance constante" },
              { n: "340+", l: "Bourses publiées", desc: "Opportunités d'études vérifiées" },
              { n: "55", l: "Pays couverts", desc: "Toute l'Afrique, sans exception" },
              { n: "2021", l: "Année de création", desc: "5 ans au service de l'Afrique" },
            ].map((s) => (
              <RevealWrapper key={s.l}>
                <div style={{ background: "#fff", borderRadius: 28, padding: "2rem", border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 3px rgba(20,20,16,.04)", textAlign: "center" }}>
                  <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2.8rem", fontWeight: 700, lineHeight: 1, color: "#C08435", display: "block", marginBottom: "0.3rem" }}>{s.n}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#141410", display: "block", marginBottom: "0.4rem" }}>{s.l}</span>
                  <span style={{ fontSize: "0.75rem", color: "#928E80" }}>{s.desc}</span>
                </div>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div style={{ background: "#F0EDE4", padding: "6rem 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2.5rem" }}>
          <RevealWrapper>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div className="sh-kicker" style={{ justifyContent: "center" }}>Nos valeurs</div>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginTop: "0.5rem" }}>
                Ce qui nous <em style={{ fontStyle: "italic", color: "#C08435", fontWeight: 200 }}>guide</em>
              </h2>
            </div>
          </RevealWrapper>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.3rem" }}>
            {values.map((v, i) => (
              <RevealWrapper key={v.title} delay={0.08 * i}>
                <div style={{ background: "#fff", borderRadius: 28, padding: "2.2rem", border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 3px rgba(20,20,16,.04)" }}>
                  <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "1.2rem" }}>{v.icon}</span>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.15rem", fontWeight: 700, color: "#141410", marginBottom: "0.75rem" }}>{v.title}</h3>
                  <p style={{ fontSize: "0.87rem", fontWeight: 300, color: "#928E80", lineHeight: 1.75 }}>{v.desc}</p>
                </div>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div style={{ background: "#F8F6F1", padding: "6rem 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2.5rem" }}>
          <RevealWrapper>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div className="sh-kicker" style={{ justifyContent: "center" }}>L&apos;équipe</div>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginTop: "0.5rem" }}>
                Construit <em style={{ fontStyle: "italic", color: "#C08435", fontWeight: 200 }}>pour l&apos;Afrique</em>
              </h2>
              <p style={{ fontSize: "1rem", fontWeight: 300, color: "#928E80", maxWidth: 500, margin: "1rem auto 0", lineHeight: 1.75 }}>
                Une équipe diverse, africaine et passionnée par la valorisation du continent.
              </p>
            </div>
          </RevealWrapper>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.3rem" }}>
            {team.map((member, i) => (
              <RevealWrapper key={member.name} delay={0.08 * i}>
                <div style={{ background: "#fff", borderRadius: 28, padding: "2rem", border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 3px rgba(20,20,16,.04)", textAlign: "center" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #0a0800, #261e00)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.2rem", fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.4rem", fontWeight: 900, color: "#C08435" }}>
                    {member.initials}
                  </div>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: "#141410", marginBottom: "0.35rem" }}>{member.name}</h3>
                  <div style={{ fontSize: "0.8rem", fontWeight: 400, color: "#928E80", marginBottom: "0.5rem" }}>{member.role}</div>
                  <div style={{ fontSize: "0.75rem", color: "#C08435" }}>{member.country}</div>
                </div>
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
