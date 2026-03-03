import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import { scholarships } from "@/lib/data";

export async function generateStaticParams() {
  return scholarships.map((s) => ({ slug: s.slug }));
}

export default function BourseDetailPage({ params }: { params: { slug: string } }) {
  const sc = scholarships.find((s) => s.slug === params.slug);
  if (!sc) notFound();

  const related = scholarships.filter((s) => s.id !== sc.id).slice(0, 3);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div style={{ paddingTop: "62px" }}>
        <div style={{ height: 380, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: sc.imageGradient }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.2) 0%, rgba(0,0,0,.75) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", padding: "3rem", zIndex: 1 }}>
            <div style={{ maxWidth: 780 }}>
              <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem", alignItems: "center" }}>
                <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.22rem 0.68rem", borderRadius: 100, background: "#EBF0FB", color: "#1E4DA8" }}>{sc.level}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.22rem 0.65rem", borderRadius: 100, fontSize: "0.6rem", fontWeight: 700, background: "rgba(255,255,255,.9)", color: "#141410" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.urgent ? "#B8341E" : "#1A5C40" }} />
                  {sc.urgent ? "Clôture imminente" : "Ouvert"}
                </span>
              </div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#fff", marginBottom: "0.75rem" }}>
                {sc.title}
              </h1>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,.7)" }}>
                {sc.flag} {sc.country} · {sc.organization}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: "#F8F6F1", padding: "4rem 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem", display: "grid", gridTemplateColumns: "1fr 340px", gap: "2.5rem", alignItems: "start" }}>
          
          {/* Main content */}
          <div>
            <div style={{ fontSize: "0.75rem", color: "#928E80", marginBottom: "2rem", display: "flex", gap: "0.5rem" }}>
              <Link href="/" style={{ color: "#928E80", textDecoration: "none" }}>Accueil</Link>
              <span>/</span>
              <Link href="/bourses" style={{ color: "#928E80", textDecoration: "none" }}>Bourses</Link>
              <span>/</span>
              <span style={{ color: "#141410" }}>{sc.organization}</span>
            </div>

            <div style={{ background: "#fff", borderRadius: 28, padding: "2.5rem", boxShadow: "0 4px 16px rgba(20,20,16,.07)", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem", color: "#141410" }}>À propos de cette bourse</h2>
              <p style={{ fontSize: "0.95rem", fontWeight: 300, color: "#38382E", lineHeight: 1.9, marginBottom: "1.2rem" }}>
                La {sc.title} est une opportunité exceptionnelle pour les étudiants africains souhaitant poursuivre leurs études à l&apos;international. Ce programme offre un financement complet incluant les frais de scolarité, le logement et une allocation mensuelle.
              </p>
              <p style={{ fontSize: "0.95rem", fontWeight: 300, color: "#38382E", lineHeight: 1.9, marginBottom: "1.2rem" }}>
                Les candidats sélectionnés bénéficieront d&apos;un accompagnement personnalisé tout au long de leur parcours académique, ainsi que d&apos;un accès au réseau des anciens boursiers dans le monde entier.
              </p>

              <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", marginTop: "2rem", color: "#141410" }}>Critères d&apos;éligibilité</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {["Être ressortissant d'un pays africain", `Niveau requis : ${sc.level}`, `Domaine : ${sc.domain}`, "Moins de 35 ans au moment du dépôt", "Excellents résultats académiques"].map((c) => (
                  <li key={c} style={{ fontSize: "0.9rem", color: "#38382E", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#1A5C40", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {c}
                  </li>
                ))}
              </ul>

              <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", marginTop: "2rem", color: "#141410" }}>Documents requis</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {["CV et lettre de motivation (en anglais)", "Relevés de notes officiels", "Lettre de recommandation (x2)", "Projet de recherche / statement of purpose", "Passeport en cours de validité"].map((d) => (
                  <li key={d} style={{ fontSize: "0.9rem", color: "#38382E", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#C08435", fontWeight: 700, flexShrink: 0 }}>→</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: "80px" }}>
            <div style={{ background: "#fff", borderRadius: 28, padding: "2rem", boxShadow: "0 4px 16px rgba(20,20,16,.07)", marginBottom: "1.2rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.4rem" }}>Date limite</div>
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: sc.urgent ? "#B8341E" : "#141410" }}>
                  {sc.deadline}
                </div>
              </div>
              {sc.amount && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.4rem" }}>Montant</div>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "#1A5C40" }}>{sc.amount}</div>
                </div>
              )}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.4rem" }}>Domaine</div>
                <div style={{ fontSize: "0.9rem", color: "#38382E" }}>{sc.domain}</div>
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.4rem" }}>Pays d&apos;accueil</div>
                <div style={{ fontSize: "0.9rem", color: "#38382E" }}>{sc.flag} {sc.country}</div>
              </div>
              <a
                href="#"
                style={{ display: "block", width: "100%", textAlign: "center", background: "#C08435", color: "#fff", padding: "0.9rem", borderRadius: 100, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                Postuler maintenant →
              </a>
              <div style={{ marginTop: "0.75rem", fontSize: "0.72rem", color: "#928E80", textAlign: "center" }}>
                Lien officiel · Candidature externe
              </div>
            </div>
            {sc.tags.map((t) => (
              <span key={t} style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 500, padding: "0.22rem 0.68rem", borderRadius: 100, background: "#F0EDE4", color: "#38382E", border: "1px solid rgba(20,20,16,.07)", marginRight: "0.4rem", marginBottom: "0.4rem" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      <div style={{ padding: "4rem 0", background: "#F0EDE4" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2.5rem" }}>
          <div className="sh-kicker" style={{ marginBottom: "0.5rem" }}>Voir aussi</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.035em", marginBottom: "2rem" }}>
            Autres <em style={{ fontStyle: "italic", color: "#C08435", fontWeight: 200 }}>bourses</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.3rem" }}>
            {related.map((r) => (
              <Link key={r.id} href={`/bourses/${r.slug}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#fff", borderRadius: 28, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden", boxShadow: "0 1px 3px rgba(20,20,16,.04)" }}>
                  <div style={{ height: 120, position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, background: r.imageGradient }} />
                    <div style={{ position: "absolute", bottom: "0.6rem", left: "0.8rem", zIndex: 2, display: "flex", alignItems: "center", gap: "0.3rem", background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)", padding: "0.2rem 0.55rem", borderRadius: 100, fontSize: "0.62rem", fontWeight: 700 }}>
                      <span>{r.flag}</span> {r.country}
                    </div>
                  </div>
                  <div style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#C08435", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>{r.organization}</div>
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.92rem", fontWeight: 700, lineHeight: 1.3, color: "#141410" }}>{r.title}</div>
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
