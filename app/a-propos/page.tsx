"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";

/* ── Données équipe ── */
const TEAM = [
  {
    initials: "AK",
    name: "Ama Kofi",
    role: "Fondatrice & Rédactrice en chef",
    bio: "Journaliste d'investigation, 12 ans couvrant l'éducation et l'économie africaine depuis Accra.",
    color: "#1E4DA8",
  },
  {
    initials: "MD",
    name: "Moussa Diallo",
    role: "Directeur des Opportunités",
    bio: "Ex-conseiller carrières à l'UA. Construit le réseau de partenaires depuis Dakar.",
    color: "#1A5C40",
  },
  {
    initials: "FN",
    name: "Fatima Nkosi",
    role: "Responsable Bourses",
    bio: "Ancienne boursière Mastercard Foundation. Vérifie chaque programme avant publication.",
    color: "#C08435",
  },
  {
    initials: "OA",
    name: "Olumide Adeyemi",
    role: "Ingénieur principal",
    bio: "Full-stack depuis Lagos. Construit la plateforme de suivi des candidatures.",
    color: "#7A1E4A",
  },
];

const STATS = [
  { value: "4 200+", label: "Bourses publiées" },
  { value: "180k+", label: "Utilisateurs actifs" },
  { value: "54", label: "Pays africains couverts" },
  { value: "98%", label: "Opportunités vérifiées" },
];

const VALUES = [
  {
    icon: "🔍",
    title: "Vérification systématique",
    text: "Chaque bourse, opportunité ou événement publié est vérifié par notre équipe avant mise en ligne. Nous contactons directement les organisateurs.",
  },
  {
    icon: "🌍",
    title: "Panafricanisme actif",
    text: "Nous couvrons les 54 pays du continent avec la même rigueur. Aucune région n'est privilégiée. L'Afrique, dans sa totalité.",
  },
  {
    icon: "📖",
    title: "Accès libre",
    text: "L'information change des vies. Toutes nos publications sont accessibles gratuitement, sans abonnement payant ni mur publicitaire.",
  },
  {
    icon: "🤝",
    title: "Accompagnement réel",
    text: "Au-delà de l'information, nous offrons des outils : suivi de candidature, liste de contrôle, notes personnelles — pour aller jusqu'au bout.",
  },
];

export default function AProposPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ background: "#F0EDE4" }}>
        {/* ── HERO ── */}
        <section style={{
          background: "#141410",
          paddingTop: "clamp(4rem,8vh,8rem)",
          paddingBottom: 0,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, opacity: 0.35, pointerEvents: "none",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
          }} />

          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1rem,5vw,4rem)" }}>
            <div style={{ maxWidth: 700 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: ".5rem",
                fontSize: ".6rem", fontWeight: 800, letterSpacing: ".18em",
                textTransform: "uppercase", color: "#C08435", marginBottom: "1.5rem",
              }}>
                <span style={{ width: 20, height: 1, background: "#C08435", display: "inline-block" }} />
                Notre mission
              </div>
              <h1 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(2rem,7vw,4.5rem)",
                fontWeight: 900,
                color: "#F8F6F1",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                marginBottom: "1.5rem",
              }}>
                L'Afrique mérite<br />
                <span style={{ color: "#C08435", fontStyle: "italic", fontWeight: 200 }}>
                  mieux qu'un algorithme.
                </span>
              </h1>
              <p style={{
                fontSize: "clamp(0.9rem,2vw,1.15rem)",
                color: "rgba(248,246,241,.65)",
                lineHeight: 1.7,
                maxWidth: 580,
                marginBottom: "clamp(2rem,5vw,3rem)",
              }}>
                AfriPulse est un média d'information et une plateforme d'opportunités conçus pour les Africains qui veulent étudier, travailler, entreprendre et s'engager sur leur continent et dans le monde.
              </p>
            </div>
          </div>

          <div style={{ height: 3, background: "linear-gradient(90deg,#C08435 0%,#E8B86D 50%,#C08435 100%)" }} />
        </section>

        {/* ── STATS ── */}
        <section style={{ background: "#fff", padding: "clamp(2rem,5vw,3.5rem) 0", borderBottom: "1px solid rgba(20,20,16,.07)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1rem,5vw,4rem)" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
              gap: "clamp(1rem,3vw,2rem)"
            }}>
              {STATS.map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: "clamp(1.5rem,5vw,3rem)",
                    fontWeight: 900,
                    color: "#C08435",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    marginBottom: ".3rem",
                  }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: ".7rem", fontWeight: 600, color: "#928E80", letterSpacing: ".04em" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HISTOIRE ── */}
        <section style={{ padding: "clamp(2.5rem,6vw,5rem) 0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1rem,5vw,4rem)" }}>
            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "2rem" : "5rem",
              alignItems: "flex-start"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: ".6rem", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "#C08435", marginBottom: "1rem" }}>
                  Notre histoire
                </div>
                <h2 style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "clamp(1.5rem,4vw,2.5rem)",
                  fontWeight: 900, color: "#141410", lineHeight: 1.15,
                  letterSpacing: "-0.03em", marginBottom: "1.25rem",
                }}>
                  Né d'une frustration,<br />construit avec intention.
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", color: "#5A5A4A", fontSize: ".88rem", lineHeight: 1.75 }}>
                  <p>
                    AfriPulse est né d'un constat simple : les informations vitales pour les jeunes Africains — bourses d'études, offres d'emploi, événements professionnels — sont dispersées, souvent fausses, et rarement accessibles à ceux qui en ont le plus besoin.
                  </p>
                  <p>
                    Nous avons commencé par un newsletter envoyé à 200 abonnés depuis Dakar. Aujourd'hui, la plateforme compte plus de 180 000 utilisateurs actifs dans 54 pays, et notre équipe de vérification traite chaque publication manuellement.
                  </p>
                  <p>
                    Notre promesse reste la même : <strong style={{ color: "#141410" }}>une information vérifiée, gratuite, et utile dès la première lecture.</strong>
                  </p>
                </div>
              </div>

              {/* Timeline responsive */}
              <div style={{ flex: 1, width: "100%" }}>
                {[
                  { year: "2021", title: "Le premier newsletter", desc: "200 abonnés, une équipe de deux personnes, un engagement : ne publier que ce qui est vérifié." },
                  { year: "2022", title: "La plateforme bourses", desc: "Lancement du module dédié aux bourses avec 340 programmes référencés dès le premier mois." },
                  { year: "2023", title: "Suivi de candidature", desc: "Les utilisateurs peuvent désormais gérer toute leur démarche directement sur AfriPulse." },
                  { year: "2024", title: "180 000 utilisateurs", desc: "La communauté dépasse les 180 000 membres actifs. Expansion vers les opportunités et événements." },
                ].map((item, i, arr) => (
                  <div key={item.year} style={{ display: "flex", gap: "1rem", paddingBottom: i < arr.length - 1 ? "1.5rem" : 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{
                        width: isMobile ? 36 : 44,
                        height: isMobile ? 36 : 44,
                        borderRadius: "50%",
                        background: i === arr.length - 1 ? "#C08435" : "#F0EDE4",
                        border: `2px solid ${i === arr.length - 1 ? "#C08435" : "rgba(20,20,16,.12)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: isMobile ? ".6rem" : ".65rem",
                        fontWeight: 900,
                        color: i === arr.length - 1 ? "#fff" : "#928E80",
                        flexShrink: 0,
                      }}>
                        {item.year.slice(2)}
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ width: 1, flex: 1, background: "rgba(20,20,16,.1)", marginTop: ".35rem" }} />
                      )}
                    </div>
                    <div style={{ paddingTop: ".4rem", flex: 1 }}>
                      <div style={{ fontSize: ".55rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#C08435", marginBottom: ".25rem" }}>
                        {item.year}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: ".88rem", color: "#141410", marginBottom: ".25rem" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: ".78rem", color: "#928E80", lineHeight: 1.6 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── VALEURS ── */}
        <section style={{ background: "#fff", padding: "clamp(2.5rem,6vw,5rem) 0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1rem,5vw,4rem)" }}>
            <div style={{ textAlign: "center", marginBottom: "clamp(2rem,5vw,3.5rem)" }}>
              <div style={{ fontSize: ".6rem", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "#C08435", marginBottom: "0.8rem" }}>
                Ce qui nous guide
              </div>
              <h2 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(1.5rem,4vw,2.5rem)",
                fontWeight: 900, color: "#141410", letterSpacing: "-0.03em",
              }}>
                Quatre principes, pas un de plus.
              </h2>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)",
              gap: "1.25rem"
            }}>
              {VALUES.map((v) => (
                <div key={v.title} style={{
                  background: "#F8F6F1", borderRadius: 16,
                  padding: "clamp(1.25rem,4vw,2rem)",
                  border: "1px solid rgba(20,20,16,.07)",
                }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "0.8rem" }}>{v.icon}</div>
                  <h3 style={{ fontWeight: 800, fontSize: ".9rem", color: "#141410", marginBottom: ".5rem" }}>
                    {v.title}
                  </h3>
                  <p style={{ fontSize: ".8rem", color: "#928E80", lineHeight: 1.65 }}>
                    {v.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ÉQUIPE ── */}
        <section style={{ padding: "clamp(2.5rem,6vw,5rem) 0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1rem,5vw,4rem)" }}>
            <div style={{ marginBottom: "clamp(1.5rem,4vw,3rem)" }}>
              <div style={{ fontSize: ".6rem", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "#C08435", marginBottom: "0.8rem" }}>
                L'équipe
              </div>
              <h2 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(1.5rem,4vw,2.5rem)",
                fontWeight: 900, color: "#141410", letterSpacing: "-0.03em",
              }}>
                Des humains derrière chaque ligne.
              </h2>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)",
              gap: "1.25rem"
            }}>
              {TEAM.map((m) => (
                <div key={m.name} style={{
                  background: "#fff", borderRadius: 16,
                  padding: "clamp(1.25rem,4vw,1.75rem)",
                  border: "1px solid rgba(20,20,16,.08)",
                  display: "flex", flexDirection: "column", gap: ".6rem",
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `linear-gradient(135deg, ${m.color}22, ${m.color}44)`,
                    border: `2px solid ${m.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: "1rem", fontWeight: 900, color: m.color,
                  }}>
                    {m.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: ".9rem", color: "#141410" }}>{m.name}</div>
                    <div style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#C08435", marginTop: ".1rem" }}>
                      {m.role}
                    </div>
                  </div>
                  <p style={{ fontSize: ".78rem", color: "#928E80", lineHeight: 1.6 }}>{m.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{
          background: "#141410", padding: "clamp(2.5rem,6vw,5rem) 0",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: .3, pointerEvents: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")" }} />
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 clamp(1rem,5vw,4rem)", textAlign: "center", position: "relative" }}>
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(1.5rem,5vw,3rem)",
              fontWeight: 900, color: "#F8F6F1",
              lineHeight: 1.15, letterSpacing: "-0.03em",
              marginBottom: "1rem",
            }}>
              Une question ? Une idée ?<br />
              <span style={{ color: "#C08435", fontStyle: "italic", fontWeight: 200 }}>On vous répond.</span>
            </h2>
            <p style={{ fontSize: ".88rem", color: "rgba(248,246,241,.55)", marginBottom: "1.5rem", lineHeight: 1.65 }}>
              Partenariats, signalement d'erreur, suggestion de bourse — notre équipe lit chaque message.
            </p>
            <Link href="/contact">
              <button style={{
                padding: ".8rem 2rem", borderRadius: 12, border: "none",
                background: "#C08435", color: "#fff",
                fontSize: ".85rem", fontWeight: 800, letterSpacing: ".04em",
                cursor: "pointer", transition: "background .2s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#a8722d")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#C08435")}
              >
                Nous contacter →
              </button>
            </Link>
          </div>
        </section>
      </main>
      <NewsletterBand />
      <Footer />
    </>
  );
}