import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import { articles } from "@/lib/data";

const tagColors: Record<string, { bg: string; color: string }> = {
  "Politique":     { bg: "#EBF0FB", color: "#1E4DA8" },
  "Économie":      { bg: "#FBF4E8", color: "#C08435" },
  "Tech":          { bg: "#EAF4EF", color: "#1A5C40" },
  "Sport":         { bg: "#FAEBE8", color: "#B8341E" },
  "Culture":       { bg: "#FBF4E8", color: "#C08435" },
  "Santé":         { bg: "#EAF4EF", color: "#1A5C40" },
  "Environnement": { bg: "#EAF4EF", color: "#1A5C40" },
};

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) notFound();

  const related = articles.filter((a) => a.id !== article.id).slice(0, 3);
  const tc = tagColors[article.category] || {};

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div style={{ paddingTop: "62px" }}>
        <div style={{ height: 480, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: article.imageGradient }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.1) 0%, rgba(0,0,0,.7) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", padding: "3rem", zIndex: 1 }}>
            <div style={{ maxWidth: 780 }}>
              <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.22rem 0.68rem", borderRadius: 100, ...tc, marginBottom: "1rem" }}>
                {article.category}
              </span>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#fff", marginBottom: "1rem" }}>
                {article.title}
              </h1>
              <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.78rem", color: "rgba(255,255,255,.7)" }}>
                <span>Par {article.author}</span>
                <span>{article.date}</span>
                <span>{article.readTime} min de lecture</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: "#F8F6F1", padding: "4rem 0" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 2.5rem" }}>
          
          {/* Breadcrumb */}
          <div style={{ fontSize: "0.75rem", color: "#928E80", marginBottom: "2rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Link href="/" style={{ color: "#928E80", textDecoration: "none" }}>Accueil</Link>
            <span>/</span>
            <Link href="/actualites" style={{ color: "#928E80", textDecoration: "none" }}>Actualités</Link>
            <span>/</span>
            <span style={{ color: "#141410" }}>{article.category}</span>
          </div>

          {/* Article body */}
          <div style={{ background: "#fff", borderRadius: 28, padding: "3rem", boxShadow: "0 4px 16px rgba(20,20,16,.07)" }}>
            <p style={{ fontSize: "1.15rem", fontWeight: 400, color: "#38382E", lineHeight: 1.85, marginBottom: "1.5rem", fontStyle: "italic", borderLeft: "3px solid #C08435", paddingLeft: "1.5rem" }}>
              {article.excerpt}
            </p>
            <p style={{ fontSize: "0.95rem", fontWeight: 300, color: "#38382E", lineHeight: 1.9, marginBottom: "1.5rem" }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p style={{ fontSize: "0.95rem", fontWeight: 300, color: "#38382E", lineHeight: 1.9, marginBottom: "1.5rem" }}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: "#141410", margin: "2rem 0 1rem", lineHeight: 1.2 }}>
              Contexte et enjeux
            </h2>
            <p style={{ fontSize: "0.95rem", fontWeight: 300, color: "#38382E", lineHeight: 1.9, marginBottom: "1.5rem" }}>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
            <p style={{ fontSize: "0.95rem", fontWeight: 300, color: "#38382E", lineHeight: 1.9 }}>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            </p>
          </div>

          {/* Tags & share */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(20,20,16,.07)" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.22rem 0.68rem", borderRadius: 100, ...tc }}>{article.category}</span>
              <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.22rem 0.68rem", borderRadius: 100, background: "#F0EDE4", color: "#928E80" }}>Afrique</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "#928E80" }}>
              Partagez cet article →
            </div>
          </div>
        </div>
      </div>

      {/* Related articles */}
      <div style={{ padding: "4rem 0", background: "#F0EDE4" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2.5rem" }}>
          <div className="sh-kicker" style={{ marginBottom: "0.5rem" }}>Lire aussi</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.035em", marginBottom: "2rem" }}>
            Articles <em style={{ fontStyle: "italic", color: "#C08435", fontWeight: 200 }}>similaires</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.3rem" }}>
            {related.map((art) => {
              const rtc = tagColors[art.category] || {};
              return (
                <Link key={art.id} href={`/actualites/${art.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 28, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden", boxShadow: "0 1px 3px rgba(20,20,16,.04)" }}>
                    <div style={{ height: 180, position: "relative" }}>
                      <div style={{ position: "absolute", inset: 0, background: art.imageGradient }} />
                      <div style={{ position: "absolute", top: "0.85rem", left: "0.85rem", zIndex: 2 }}>
                        <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.22rem 0.68rem", borderRadius: 100, ...rtc }}>{art.category}</span>
                      </div>
                    </div>
                    <div style={{ padding: "1.2rem 1.4rem" }}>
                      <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.3, color: "#141410", marginBottom: "0.5rem" }}>{art.title}</h3>
                      <div style={{ fontSize: "0.67rem", color: "#928E80" }}>{art.date} · {art.readTime} min</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <NewsletterBand />
      <Footer />
    </>
  );
}
