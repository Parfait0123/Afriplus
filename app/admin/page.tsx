"use client";
import Link from "next/link";
import { articles, scholarships, opportunities, events } from "@/lib/data";

const stats = [
  { label: "Articles publiés", value: articles.length, icon: "📰", href: "/admin/articles", color: "#C08435", bg: "#FBF4E8" },
  { label: "Bourses actives", value: scholarships.length, icon: "🎓", href: "/admin/bourses", color: "#1A5C40", bg: "#EAF4EF" },
  { label: "Opportunités", value: opportunities.length, icon: "💼", href: "/admin/opportunites", color: "#1E4DA8", bg: "#EBF0FB" },
  { label: "Événements", value: events.length, icon: "📅", href: "/admin/evenements", color: "#B8341E", bg: "#FAEBE8" },
];

const quickActions = [
  { label: "Rédiger un article", href: "/admin/articles/nouveau", icon: "✏️" },
  { label: "Ajouter une bourse", href: "/admin/bourses/nouvelle", icon: "🎓" },
  { label: "Poster une opportunité", href: "/admin/opportunites/nouvelle", icon: "💼" },
  { label: "Créer un événement", href: "/admin/evenements/nouveau", icon: "📅" },
];

export default function AdminPage() {
  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2rem", fontWeight: 900, color: "#141410", letterSpacing: "-0.04em", marginBottom: "0.4rem" }}>
          Bienvenue 👋
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#928E80" }}>Voici l&apos;aperçu de votre plateforme AfriPulse.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.2rem", marginBottom: "2.5rem" }}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "1.5rem", border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 3px rgba(20,20,16,.04)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>{s.icon}</div>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: s.color }}>Voir →</span>
              </div>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2.4rem", fontWeight: 700, color: "#141410", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "0.78rem", color: "#928E80", marginTop: "0.3rem" }}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>

        {/* Recent articles table */}
        <div style={{ background: "#fff", borderRadius: 24, padding: "1.75rem", border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 3px rgba(20,20,16,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#141410" }}>Articles récents</h2>
            <Link href="/admin/articles" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#C08435", textDecoration: "none" }}>Tout gérer →</Link>
          </div>
          {articles.slice(0, 5).map((art, i) => (
            <div key={art.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 0", borderBottom: i < 4 ? "1px solid rgba(20,20,16,.06)" : "none" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: art.imageGradient, flexShrink: 0 }} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#141410", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{art.title}</div>
                <div style={{ fontSize: "0.7rem", color: "#928E80", marginTop: "0.2rem" }}>{art.category} · {art.date}</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "0.58rem", fontWeight: 700, background: "#EAF4EF", color: "#1A5C40", padding: "0.2rem 0.55rem", borderRadius: 100 }}>Publié</span>
                <Link href={`/actualites/${art.slug}`} target="_blank" style={{ fontSize: "0.68rem", fontWeight: 600, color: "#928E80", textDecoration: "none" }}>↗</Link>
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

          {/* Quick actions */}
          <div style={{ background: "#fff", borderRadius: 24, padding: "1.75rem", border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 3px rgba(20,20,16,.04)" }}>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#141410", marginBottom: "1.2rem" }}>Actions rapides</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.9rem", borderRadius: 12, background: "#F8F6F1", textDecoration: "none", border: "1px solid rgba(20,20,16,.07)" }}>
                  <span style={{ fontSize: "1rem" }}>{action.icon}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#38382E" }}>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter stats */}
          <div style={{ background: "#141410", borderRadius: 24, padding: "1.75rem" }}>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>Newsletter</h2>
            <div style={{ marginBottom: "1.2rem" }}>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2.5rem", fontWeight: 700, color: "#C08435", lineHeight: 1 }}>1 284</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,.35)", marginTop: "0.3rem" }}>abonnés actifs</div>
            </div>
            <div style={{ display: "flex", gap: "1.2rem", marginBottom: "1.5rem" }}>
              {[{ n: "+47", l: "cette semaine" }, { n: "68%", l: "taux d'ouverture" }].map((s) => (
                <div key={s.l}>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff" }}>{s.n}</div>
                  <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,.3)" }}>{s.l}</div>
                </div>
              ))}
            </div>
            <Link href="/admin/newsletter" style={{ display: "block", textAlign: "center", background: "#C08435", color: "#fff", padding: "0.65rem", borderRadius: 100, fontWeight: 700, fontSize: "0.82rem", textDecoration: "none", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              Gérer la newsletter →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
