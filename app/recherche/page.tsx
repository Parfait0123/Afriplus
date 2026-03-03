"use client";
import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { articles, scholarships, opportunities, events } from "@/lib/data";

type ResultType = "all" | "articles" | "bourses" | "opportunites" | "evenements";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [activeType, setActiveType] = useState<ResultType>("all");

  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const matches = (text: string) => normalize(text).includes(normalize(q));

  const results = useMemo(() => {
    if (!q.trim()) return { articles: [], scholarships: [], opportunities: [], events: [] };
    return {
      articles: articles.filter((a) => matches(a.title) || matches(a.excerpt) || matches(a.category)),
      scholarships: scholarships.filter((s) => matches(s.title) || matches(s.organization) || matches(s.country) || matches(s.domain)),
      opportunities: opportunities.filter((o) => matches(o.title) || matches(o.company) || matches(o.location) || matches(o.type)),
      events: events.filter((e) => matches(e.title) || matches(e.location) || matches(e.type)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const total = results.articles.length + results.scholarships.length + results.opportunities.length + results.events.length;

  const tabs: { key: ResultType; label: string; count: number }[] = [
    { key: "all", label: "Tout", count: total },
    { key: "articles", label: "Actualités", count: results.articles.length },
    { key: "bourses", label: "Bourses", count: results.scholarships.length },
    { key: "opportunites", label: "Opportunités", count: results.opportunities.length },
    { key: "evenements", label: "Événements", count: results.events.length },
  ];

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "5rem", minHeight: "100vh", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "3rem 2.5rem 5rem" }}>

          {/* Header */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#141410", marginBottom: "0.5rem" }}>
              {q ? (
                <>{total} résultat{total > 1 ? "s" : ""} pour{" "}
                  <em style={{ fontStyle: "italic", color: "#C08435", fontWeight: 200 }}>&ldquo;{q}&rdquo;</em>
                </>
              ) : "Recherche"}
            </h1>
            {!q && <p style={{ color: "#928E80" }}>Entrez un terme de recherche dans la barre de navigation.</p>}
          </div>

          {q && (
            <>
              {/* Tabs */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
                {tabs.map((tab) => (
                  <button key={tab.key} onClick={() => setActiveType(tab.key)}
                    style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.8rem", fontWeight: 600, padding: "0.45rem 1.1rem", borderRadius: 100, cursor: "pointer", transition: "all .22s", background: activeType === tab.key ? "#141410" : "transparent", color: activeType === tab.key ? "#fff" : "#38382E", border: activeType === tab.key ? "none" : "1.5px solid rgba(20,20,16,.12)" }}>
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {total === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 0", color: "#928E80" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                  <p style={{ fontSize: "1rem" }}>Aucun résultat trouvé pour &ldquo;{q}&rdquo;</p>
                  <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Essayez avec d&apos;autres mots-clés.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>

                  {/* Articles */}
                  {(activeType === "all" || activeType === "articles") && results.articles.length > 0 && (
                    <section>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#141410" }}>Actualités</h2>
                        <Link href="/actualites" style={{ fontSize: "0.78rem", color: "#C08435", textDecoration: "none", fontWeight: 600 }}>Voir toutes →</Link>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {results.articles.map((a) => (
                          <Link key={a.id} href={`/actualites/${a.slug}`} style={{ textDecoration: "none" }}>
                            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(20,20,16,.07)", padding: "1.2rem 1.5rem", display: "flex", gap: "1.5rem", alignItems: "center", transition: "box-shadow .2s" }}>
                              <div style={{ width: 64, height: 64, borderRadius: 12, background: a.imageGradient, flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#C08435", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>{a.category}</div>
                                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.97rem", fontWeight: 700, color: "#141410", lineHeight: 1.3, marginBottom: "0.3rem" }}>{a.title}</div>
                                <div style={{ fontSize: "0.72rem", color: "#928E80" }}>{a.author} · {a.date}</div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Scholarships */}
                  {(activeType === "all" || activeType === "bourses") && results.scholarships.length > 0 && (
                    <section>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#141410" }}>Bourses d&apos;études</h2>
                        <Link href="/bourses" style={{ fontSize: "0.78rem", color: "#C08435", textDecoration: "none", fontWeight: 600 }}>Voir toutes →</Link>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {results.scholarships.map((s) => (
                          <Link key={s.id} href={`/bourses/${s.slug}`} style={{ textDecoration: "none" }}>
                            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(20,20,16,.07)", padding: "1.2rem 1.5rem", display: "flex", gap: "1.5rem", alignItems: "center" }}>
                              <div style={{ width: 64, height: 64, borderRadius: 12, background: s.imageGradient, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>{s.flag}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#C08435", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>{s.organization}</div>
                                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.97rem", fontWeight: 700, color: "#141410", lineHeight: 1.3, marginBottom: "0.3rem" }}>{s.title}</div>
                                <div style={{ fontSize: "0.72rem", color: s.urgent ? "#B8341E" : "#928E80", fontWeight: s.urgent ? 600 : 400 }}>📅 {s.deadline} · {s.level}</div>
                              </div>
                              {s.urgent && <span style={{ fontSize: "0.6rem", fontWeight: 700, background: "#FAEBE8", color: "#B8341E", padding: "0.2rem 0.6rem", borderRadius: 100, flexShrink: 0 }}>URGENT</span>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Opportunities */}
                  {(activeType === "all" || activeType === "opportunites") && results.opportunities.length > 0 && (
                    <section>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#141410" }}>Opportunités</h2>
                        <Link href="/opportunites" style={{ fontSize: "0.78rem", color: "#C08435", textDecoration: "none", fontWeight: 600 }}>Voir toutes →</Link>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {results.opportunities.map((o) => (
                          <Link key={o.id} href={`/opportunites/${o.slug}`} style={{ textDecoration: "none" }}>
                            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(20,20,16,.07)", padding: "1.2rem 1.5rem", display: "flex", gap: "1.5rem", alignItems: "center" }}>
                              <div style={{ width: 44, height: 44, borderRadius: 12, background: o.imageGradient, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.85rem", fontWeight: 900, color: "#C08435" }}>{o.companyInitials}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#C08435", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>{o.company}</div>
                                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.97rem", fontWeight: 700, color: "#141410", lineHeight: 1.3, marginBottom: "0.3rem" }}>{o.title}</div>
                                <div style={{ fontSize: "0.72rem", color: "#928E80" }}>📍 {o.location} · {o.type}</div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Events */}
                  {(activeType === "all" || activeType === "evenements") && results.events.length > 0 && (
                    <section>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#141410" }}>Événements</h2>
                        <Link href="/evenements" style={{ fontSize: "0.78rem", color: "#C08435", textDecoration: "none", fontWeight: 600 }}>Voir tous →</Link>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {results.events.map((ev) => (
                          <Link key={ev.id} href={`/evenements/${ev.slug}`} style={{ textDecoration: "none" }}>
                            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(20,20,16,.07)", padding: "1.2rem 1.5rem", display: "flex", gap: "1.5rem", alignItems: "center" }}>
                              <div style={{ width: 64, height: 64, borderRadius: 12, background: "#FBF4E8", border: "1px solid rgba(192,132,53,.2)", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.4rem", fontWeight: 900, color: "#C08435", lineHeight: 1 }}>{ev.day}</span>
                                <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase" }}>{ev.month}</span>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#C08435", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>{ev.type}</div>
                                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.97rem", fontWeight: 700, color: "#141410", lineHeight: 1.3, marginBottom: "0.3rem" }}>{ev.title}</div>
                                <div style={{ fontSize: "0.72rem", color: "#928E80" }}>📍 {ev.location}</div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function RecherchePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#F8F6F1", paddingTop: "62px" }} />}>
      <SearchResults />
    </Suspense>
  );
}
