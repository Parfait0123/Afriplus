import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import { opportunities } from "@/lib/data";

export async function generateStaticParams() {
  return opportunities.map((o) => ({ slug: o.slug }));
}

export default function OpportunityDetailPage({ params }: { params: { slug: string } }) {
  const opp = opportunities.find((o) => o.slug === params.slug);
  if (!opp) notFound();

  const related = opportunities.filter((o) => o.id !== opp.id).slice(0, 4);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div style={{ paddingTop: "62px" }}>
        <div style={{ height: 340, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: opp.imageGradient }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.1) 0%, rgba(0,0,0,.75) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", padding: "3rem", zIndex: 1 }}>
            <div>
              <div style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.22rem 0.68rem", borderRadius: 100, background: "#FBF4E8", color: "#C08435", marginBottom: "1rem" }}>
                {opp.type}
              </div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#fff", marginBottom: "0.75rem" }}>
                {opp.title}
              </h1>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,.7)" }}>
                {opp.company} · 📍 {opp.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: "#F8F6F1", padding: "4rem 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem", display: "grid", gridTemplateColumns: "1fr 320px", gap: "2.5rem", alignItems: "start" }}>
          
          {/* Main */}
          <div>
            <div style={{ fontSize: "0.75rem", color: "#928E80", marginBottom: "2rem", display: "flex", gap: "0.5rem" }}>
              <Link href="/" style={{ color: "#928E80", textDecoration: "none" }}>Accueil</Link>
              <span>/</span>
              <Link href="/opportunites" style={{ color: "#928E80", textDecoration: "none" }}>Opportunités</Link>
              <span>/</span>
              <span style={{ color: "#141410" }}>{opp.company}</span>
            </div>

            <div style={{ background: "#fff", borderRadius: 28, padding: "2.5rem", boxShadow: "0 4px 16px rgba(20,20,16,.07)" }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem", color: "#141410" }}>Description du poste</h2>
              <p style={{ fontSize: "0.95rem", fontWeight: 300, color: "#38382E", lineHeight: 1.9, marginBottom: "1.2rem" }}>
                {opp.company} recrute un(e) {opp.title} pour renforcer ses équipes en Afrique. Ce poste offre une opportunité unique de travailler au cœur du développement africain dans un environnement international et stimulant.
              </p>
              <p style={{ fontSize: "0.95rem", fontWeight: 300, color: "#38382E", lineHeight: 1.9, marginBottom: "1.2rem" }}>
                Vous serez amené(e) à collaborer avec des équipes pluridisciplinaires et à contribuer directement aux projets stratégiques de l&apos;organisation sur le continent.
              </p>

              <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", marginTop: "2rem", color: "#141410" }}>Responsabilités principales</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {["Analyser les données et produire des rapports stratégiques", "Collaborer avec les partenaires régionaux et internationaux", "Coordonner les projets et suivre les indicateurs de performance", "Contribuer au développement des outils et processus internes", "Représenter l'organisation lors d'événements sectoriels"].map((item) => (
                  <li key={item} style={{ fontSize: "0.9rem", color: "#38382E", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#C08435", fontWeight: 700, flexShrink: 0 }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>

              <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", marginTop: "2rem", color: "#141410" }}>Profil recherché</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {["Diplôme Bac+4/5 dans un domaine pertinent", "Expérience de 2 à 5 ans minimum", "Maîtrise de l'anglais et du français", "Excellentes capacités analytiques", "Connaissance du contexte africain"].map((item) => (
                  <li key={item} style={{ fontSize: "0.9rem", color: "#38382E", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#1A5C40", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: "80px" }}>
            <div style={{ background: "#fff", borderRadius: 28, padding: "2rem", boxShadow: "0 4px 16px rgba(20,20,16,.07)", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(20,20,16,.07)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(20,20,16,.06)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", fontWeight: 900, color: "#C08435" }}>
                  {opp.companyInitials}
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#141410" }}>{opp.company}</div>
                  <div style={{ fontSize: "0.72rem", color: "#928E80" }}>Employeur vérifié</div>
                </div>
              </div>

              {[
                { label: "Type de contrat", value: opp.type },
                { label: "Localisation", value: `📍 ${opp.location}` },
              ].map((item) => (
                <div key={item.label} style={{ marginBottom: "1.2rem" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.3rem" }}>{item.label}</div>
                  <div style={{ fontSize: "0.9rem", color: "#38382E", fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}

              <a href="#" style={{ display: "block", width: "100%", textAlign: "center", background: "#C08435", color: "#fff", padding: "0.9rem", borderRadius: 100, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", fontFamily: "'DM Sans', system-ui, sans-serif", marginTop: "0.5rem" }}>
                Postuler maintenant →
              </a>
              <div style={{ marginTop: "0.75rem", fontSize: "0.72rem", color: "#928E80", textAlign: "center" }}>
                Redirection vers le site officiel
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      <div style={{ padding: "4rem 0", background: "#F0EDE4" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2.5rem" }}>
          <div className="sh-kicker" style={{ marginBottom: "0.5rem" }}>Voir aussi</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.035em", marginBottom: "2rem" }}>
            Autres <em style={{ fontStyle: "italic", color: "#C08435", fontWeight: 200 }}>opportunités</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.2rem" }}>
            {related.map((r) => (
              <Link key={r.id} href={`/opportunites/${r.slug}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#fff", borderRadius: 28, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden", boxShadow: "0 1px 3px rgba(20,20,16,.04)" }}>
                  <div style={{ height: 110, position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, background: r.imageGradient }} />
                    <div style={{ position: "absolute", bottom: "0.6rem", left: "0.75rem", zIndex: 2, width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.72rem", fontWeight: 900, color: "#C08435" }}>
                      {r.companyInitials}
                    </div>
                  </div>
                  <div style={{ padding: "1rem 1.15rem" }}>
                    <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#C08435", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>{r.company}</div>
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.3, color: "#141410", marginBottom: "0.5rem" }}>{r.title}</div>
                    <div style={{ fontSize: "0.67rem", color: "#928E80" }}>📍 {r.location}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <NewsletterBand />
      <Footer />
    </>
  );
}
