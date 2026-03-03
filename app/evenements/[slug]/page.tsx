import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import { events } from "@/lib/data";

export async function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const ev = events.find((e) => e.slug === params.slug);
  if (!ev) notFound();

  const related = events.filter((e) => e.id !== ev.id).slice(0, 4);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div style={{ paddingTop: "62px" }}>
        <div style={{
          background: "linear-gradient(135deg, #0e0800 0%, #1a1000 40%, #261800 70%, #0e0800 100%)",
          padding: "5rem 2.5rem 4rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(192,132,53,.04) 1px,transparent 1px), linear-gradient(90deg,rgba(192,132,53,.04) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,.4)", marginBottom: "2rem", display: "flex", gap: "0.5rem" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Accueil</Link>
              <span>/</span>
              <Link href="/evenements" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Événements</Link>
              <span>/</span>
              <span style={{ color: "rgba(255,255,255,.7)" }}>{ev.type}</span>
            </div>

            <div style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.22rem 0.68rem", borderRadius: 100, background: "#FBF4E8", color: "#C08435", marginBottom: "1.2rem" }}>
              {ev.type}
            </div>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#fff", marginBottom: "1.5rem" }}>
              {ev.title}
            </h1>
            <div style={{ display: "flex", gap: "2rem", fontSize: "0.85rem", color: "rgba(255,255,255,.6)" }}>
              <span>📅 {ev.day} {ev.month} {ev.year}</span>
              <span>📍 {ev.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: "#F8F6F1", padding: "4rem 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "2.5rem", alignItems: "start" }}>
          
          {/* Main */}
          <div style={{ background: "#fff", borderRadius: 28, padding: "2.5rem", boxShadow: "0 4px 16px rgba(20,20,16,.07)" }}>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem", color: "#141410" }}>À propos</h2>
            <p style={{ fontSize: "0.95rem", fontWeight: 300, color: "#38382E", lineHeight: 1.9, marginBottom: "1.2rem" }}>
              {ev.title} est l&apos;un des événements phares du calendrier africain. Cet événement rassemble chaque année des acteurs clés du continent pour des échanges de haut niveau sur les enjeux actuels.
            </p>
            <p style={{ fontSize: "0.95rem", fontWeight: 300, color: "#38382E", lineHeight: 1.9, marginBottom: "1.5rem" }}>
              Décideurs, entrepreneurs, investisseurs et experts se réunissent pour explorer les opportunités, partager les meilleures pratiques et bâtir des partenariats durables.
            </p>

            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", marginTop: "2rem", color: "#141410" }}>Programme</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { time: "08:30", title: "Accueil et enregistrement" },
                { time: "09:30", title: "Cérémonie d'ouverture" },
                { time: "10:30", title: "Panel : L'Afrique en 2030" },
                { time: "12:00", title: "Déjeuner réseau" },
                { time: "14:00", title: "Ateliers thématiques" },
                { time: "16:30", title: "Pitches startups" },
                { time: "18:00", title: "Cocktail de clôture" },
              ].map((item) => (
                <div key={item.time} style={{ display: "flex", gap: "1.2rem", alignItems: "flex-start", padding: "0.75rem", borderRadius: 12, background: "#F8F6F1" }}>
                  <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.85rem", fontWeight: 700, color: "#C08435", flexShrink: 0, minWidth: 44 }}>{item.time}</span>
                  <span style={{ fontSize: "0.9rem", color: "#38382E" }}>{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: "80px" }}>
            <div style={{ background: "#fff", borderRadius: 28, padding: "2rem", boxShadow: "0 4px 16px rgba(20,20,16,.07)", marginBottom: "1rem" }}>
              <div style={{ textAlign: "center", padding: "1.5rem 0", borderBottom: "1px solid rgba(20,20,16,.07)", marginBottom: "1.5rem" }}>
                <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "4rem", fontWeight: 900, color: "#C08435", lineHeight: 1, display: "block" }}>{ev.day}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#928E80", letterSpacing: "0.05em", textTransform: "uppercase" }}>{ev.month} {ev.year}</span>
              </div>
              {[
                { label: "Type", value: ev.type },
                { label: "Lieu", value: ev.location },
              ].map((item) => (
                <div key={item.label} style={{ marginBottom: "1.2rem" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.3rem" }}>{item.label}</div>
                  <div style={{ fontSize: "0.9rem", color: "#38382E", fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
              <a href="#" style={{ display: "block", width: "100%", textAlign: "center", background: "#C08435", color: "#fff", padding: "0.9rem", borderRadius: 100, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", fontFamily: "'DM Sans', system-ui, sans-serif", marginTop: "0.5rem" }}>
                S&apos;inscrire →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      <div style={{ padding: "4rem 0", background: "#F0EDE4" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2.5rem" }}>
          <div className="sh-kicker" style={{ marginBottom: "0.5rem" }}>Voir aussi</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.035em", marginBottom: "2rem" }}>
            Autres <em style={{ fontStyle: "italic", color: "#C08435", fontWeight: 200 }}>événements</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.2rem" }}>
            {related.map((r) => (
              <Link key={r.id} href={`/evenements/${r.slug}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#fff", borderRadius: 28, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden", boxShadow: "0 1px 3px rgba(20,20,16,.04)" }}>
                  <div style={{ background: "#FBF4E8", borderBottom: "1px solid rgba(192,132,53,.2)", padding: "0.85rem 1.1rem", display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                    <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2rem", fontWeight: 900, color: "#C08435", lineHeight: 1 }}>{r.day}</span>
                    <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#928E80", lineHeight: 1.5 }}>{r.month}<br />{r.year}</div>
                  </div>
                  <div style={{ padding: "0.9rem 1.1rem" }}>
                    <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#C08435", marginBottom: "0.3rem" }}>{r.type}</div>
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.88rem", fontWeight: 700, lineHeight: 1.3, marginBottom: "0.5rem", color: "#141410" }}>{r.title}</div>
                    <div style={{ fontSize: "0.65rem", color: "#928E80" }}>📍 {r.location}</div>
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
