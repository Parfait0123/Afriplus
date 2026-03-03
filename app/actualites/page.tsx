import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { articles, type Category } from "@/lib/data";

const categories: Category[] = ["Politique", "Économie", "Tech", "Sport", "Culture", "Santé", "Environnement"];

const tagColors: Record<string, { bg: string; color: string }> = {
  "Politique":     { bg: "#EBF0FB", color: "#1E4DA8" },
  "Économie":      { bg: "#FBF4E8", color: "#C08435" },
  "Tech":          { bg: "#EAF4EF", color: "#1A5C40" },
  "Sport":         { bg: "#FAEBE8", color: "#B8341E" },
  "Culture":       { bg: "#FBF4E8", color: "#C08435" },
  "Santé":         { bg: "#EAF4EF", color: "#1A5C40" },
  "Environnement": { bg: "#EAF4EF", color: "#1A5C40" },
};

export default function ActualitesPage() {
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <>
      <Navbar />

      {/* Page header */}
      <div style={{ paddingTop: "5rem", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 2.5rem 3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#fff", border: "1px solid rgba(192,132,53,.2)", borderRadius: 100, padding: "0.38rem 0.9rem", fontSize: "0.73rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#C08435", marginBottom: "1.5rem" }}>
            <span className="dot-live" />
            Mis à jour en continu
          </div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(2.5rem,5vw,5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: "1.2rem" }}>
            Actualités<br /><em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435" }}>africaines</em>
          </h1>
          <p style={{ fontSize: "1rem", fontWeight: 300, color: "#928E80", maxWidth: 500, lineHeight: 1.75 }}>
            L&apos;information vérifiée, les analyses approfondies et les décryptages sur 55 pays africains.
          </p>

          {/* Category filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "2rem" }}>
            <button style={{ ...filterBtn, background: "#141410", color: "#fff", border: "none" }}>Tout</button>
            {categories.map((cat) => (
              <button key={cat} style={{ ...filterBtn, background: "transparent", color: "#38382E", border: "1.5px solid rgba(20,20,16,.12)" }}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles grid */}
      <div style={{ padding: "0 0 6rem", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2.5rem" }}>

          {/* Featured */}
          <RevealWrapper>
            <Link href={`/actualites/${featured.slug}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fff", borderRadius: 28, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden", marginBottom: "2rem", display: "grid", gridTemplateColumns: "1fr 1.2fr", boxShadow: "0 4px 16px rgba(20,20,16,.07)" }}>
                <div style={{ height: 340, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: featured.imageGradient }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent 50%,rgba(0,0,0,.3))" }} />
                  <div style={{ position: "absolute", top: "1.2rem", left: "1.2rem", zIndex: 2, background: "#B8341E", color: "#fff", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.3rem 0.8rem", borderRadius: 100 }}>
                    À LA UNE
                  </div>
                </div>
                <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.22rem 0.68rem", borderRadius: 100, ...(tagColors[featured.category] || {}), marginBottom: "1rem", width: "fit-content" }}>
                    {featured.category}
                  </span>
                  <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem", color: "#141410" }}>{featured.title}</h2>
                  <p style={{ fontSize: "0.9rem", fontWeight: 300, color: "#928E80", lineHeight: 1.75, marginBottom: "1.5rem" }}>{featured.excerpt}</p>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.72rem", color: "#928E80" }}>
                    <span>{featured.author}</span><span>{featured.date}</span><span>{featured.readTime} min de lecture</span>
                  </div>
                </div>
              </div>
            </Link>
          </RevealWrapper>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.4rem" }}>
            {rest.map((art, i) => (
              <RevealWrapper key={art.id} delay={0.06 * (i % 3)}>
                <Link href={`/actualites/${art.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 28, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden", cursor: "pointer", transition: "all .3s", boxShadow: "0 1px 3px rgba(20,20,16,.04)", display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ height: 200, position: "relative", overflow: "hidden", flexShrink: 0 }}>
                      <div style={{ position: "absolute", inset: 0, background: art.imageGradient }} />
                      <div style={{ position: "absolute", top: "0.85rem", left: "0.85rem", zIndex: 2 }}>
                        <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.22rem 0.68rem", borderRadius: 100, ...(tagColors[art.category] || {}) }}>
                          {art.category}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: "1.4rem 1.6rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, color: "#141410", lineHeight: 1.28, fontSize: "0.97rem", flex: 1 }}>{art.title}</h3>
                      <p style={{ fontSize: "0.82rem", fontWeight: 300, color: "#928E80", lineHeight: 1.72, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{art.excerpt}</p>
                      <div style={{ fontSize: "0.67rem", color: "#928E80", marginTop: "auto", display: "flex", gap: "1rem" }}>
                        <span>{art.author}</span><span>{art.date}</span><span>{art.readTime} min</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </RevealWrapper>
            ))}
          </div>

          {/* Load more */}
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <button style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.9rem", fontWeight: 600, padding: "0.82rem 2.2rem", borderRadius: 100, cursor: "pointer", background: "transparent", color: "#38382E", border: "1.5px solid rgba(20,20,16,.12)", transition: "all .22s" }}>
              Charger plus d&apos;articles
            </button>
          </div>
        </div>
      </div>

      <NewsletterBand />
      <Footer />
    </>
  );
}

const filterBtn: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "0.8rem",
  fontWeight: 600,
  padding: "0.45rem 1.1rem",
  borderRadius: 100,
  cursor: "pointer",
  transition: "all .22s",
};
