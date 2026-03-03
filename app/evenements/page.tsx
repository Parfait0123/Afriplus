import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { events } from "@/lib/data";

const types = ["Tous", "Conférence", "Forum", "Hackathon", "Salon", "Atelier", "Sommet"];

export default function EvenementsPage() {
  return (
    <>
      <Navbar />

      {/* Header */}
      <div style={{ paddingTop: "5rem", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 2.5rem 3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#FBF4E8", border: "1px solid rgba(192,132,53,.2)", borderRadius: 100, padding: "0.38rem 0.9rem", fontSize: "0.73rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#C08435", marginBottom: "1.5rem" }}>
            📅 Agenda africain
          </div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(2.5rem,5vw,5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: "1.2rem" }}>
            À ne pas<br /><em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435" }}>manquer</em>
          </h1>
          <p style={{ fontSize: "1rem", fontWeight: 300, color: "#928E80", maxWidth: 520, lineHeight: 1.75, marginBottom: "2rem" }}>
            Conférences, forums, hackathons et sommets qui façonnent l&apos;avenir de l&apos;Afrique.
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
            {events.map((ev, i) => (
              <RevealWrapper key={ev.id} delay={0.06 * (i % 4)}>
                <Link href={`/evenements/${ev.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 28, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden", cursor: "pointer", transition: "all .3s", boxShadow: "0 1px 3px rgba(20,20,16,.04)" }}>
                    <div style={{ background: "#FBF4E8", borderBottom: "1px solid rgba(192,132,53,.2)", padding: "1rem 1.25rem", display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                      <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2.8rem", fontWeight: 900, color: "#C08435", lineHeight: 1 }}>{ev.day}</span>
                      <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#928E80", lineHeight: 1.5 }}>{ev.month}<br />{ev.year}</div>
                    </div>
                    <div style={{ padding: "1.2rem 1.25rem" }}>
                      <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#C08435", marginBottom: "0.38rem" }}>{ev.type}</div>
                      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.97rem", fontWeight: 700, lineHeight: 1.32, marginBottom: "0.65rem", color: "#141410" }}>{ev.title}</div>
                      <div style={{ fontSize: "0.68rem", color: "#928E80" }}>📍 {ev.location}</div>
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
