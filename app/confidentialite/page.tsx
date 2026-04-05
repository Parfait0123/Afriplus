"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const LAST_UPDATE = "15 mars 2025";

/* ── Sections ── */
const SECTIONS = [
  {
    id: "collecte",
    title: "1. Données collectées",
    content: [
      {
        subtitle: "1.1 Lors de la création d'un compte",
        text: `Lorsque vous créez un compte sur AroMe, nous collectons : votre adresse e-mail, votre nom complet (facultatif), votre pays de résidence (facultatif) et votre domaine d'intérêt (facultatif). Ces informations sont nécessaires pour personnaliser votre expérience et vous envoyer des notifications pertinentes.`,
      },
      {
        subtitle: "1.2 Lors de l'utilisation des services",
        text: `En utilisant notre plateforme, nous enregistrons : les bourses et opportunités que vous sauvegardez, vos candidatures et leur statut de suivi, les notes et commentaires que vous ajoutez à vos dossiers, vos préférences de notification newsletter, ainsi que vos inscriptions aux événements.`,
      },
      {
        subtitle: "1.3 Lors de vos candidatures",
        text: `La fonctionnalité de suivi de candidature vous permet de stocker : le statut de chaque candidature (intéressé, en cours, soumis, entretien, accepté, refusé), des notes personnelles sur chaque opportunité ou bourse, la liste des documents que vous avez déjà préparés. Ces données ne sont accessibles que par vous et ne sont jamais partagées avec les organisateurs des programmes concernés.`,
      },
      {
        subtitle: "1.4 Données techniques",
        text: `Nous collectons automatiquement des données techniques : adresse IP (anonymisée après 24h), type de navigateur et système d'exploitation, pages consultées et durée des sessions. Ces données sont agrégées et ne permettent pas de vous identifier individuellement.`,
      },
    ],
  },
  {
    id: "utilisation",
    title: "2. Utilisation des données",
    content: [
      {
        subtitle: "2.1 Fourniture du service",
        text: `Vos données sont utilisées pour : afficher et personnaliser votre tableau de bord de candidatures, enregistrer vos bourses et opportunités sauvegardées, vous permettre de reprendre là où vous en étiez lors de votre dernière connexion, et vous notifier des échéances importantes pour vos candidatures actives.`,
      },
      {
        subtitle: "2.2 Newsletter et communications",
        text: `Si vous êtes abonné à notre newsletter, nous utilisons vos préférences (types de contenu, fréquence) pour vous envoyer des emails ciblés. Chaque email contient un lien de désabonnement en un clic. Vous pouvez modifier vos préférences à tout moment depuis votre espace personnel. Nous ne vendons ni ne louons vos données à des tiers à des fins marketing.`,
      },
      {
        subtitle: "2.3 Amélioration de la plateforme",
        text: `Les données agrégées et anonymisées nous permettent de comprendre quelles bourses ou opportunités suscitent le plus d'intérêt, d'améliorer nos algorithmes de recommandation, et de prioriser les types de contenus à publier. Aucune décision automatisée ayant un impact sur vous n'est prise sur la base de vos données individuelles.`,
      },
    ],
  },
  {
    id: "conservation",
    title: "3. Conservation des données",
    content: [
      {
        subtitle: "3.1 Durées de conservation",
        text: `Données de compte : conservées tant que votre compte est actif, puis supprimées dans les 30 jours suivant la clôture. Données de candidature et notes personnelles : conservées selon vos paramètres (vous pouvez supprimer chaque entrée individuellement). Données newsletter : supprimées immédiatement lors du désabonnement. Données techniques : anonymisées sous 24 heures, conservées sous forme agrégée pendant 12 mois.`,
      },
      {
        subtitle: "3.2 Suppression du compte",
        text: `Vous pouvez supprimer votre compte à tout moment depuis vos paramètres. La suppression efface définitivement : vos informations personnelles, votre historique de candidatures, vos sauvegardes, vos notes et votre abonnement newsletter. Certaines données peuvent être conservées temporairement pour satisfaire à nos obligations légales (maximum 30 jours).`,
      },
    ],
  },
  {
    id: "partage",
    title: "4. Partage des données",
    content: [
      {
        subtitle: "4.1 Aucune vente de données",
        text: `AroMe ne vend, ne loue et ne monétise jamais vos données personnelles à des tiers. Nos revenus proviennent exclusivement de partenariats institutionnels et de la mise en avant éditoriale de contenus vérifiés.`,
      },
      {
        subtitle: "4.2 Sous-traitants techniques",
        text: `Nous faisons appel à des sous-traitants pour l'hébergement (Supabase/AWS, serveurs en Europe), l'envoi d'emails transactionnels (prestataire conforme RGPD), et l'analyse anonymisée du trafic. Chaque sous-traitant est lié par un contrat de traitement des données garantissant un niveau de protection équivalent au nôtre.`,
      },
      {
        subtitle: "4.3 Obligations légales",
        text: `AroMe peut être amené à communiquer vos données aux autorités compétentes si la loi l'exige, notamment dans le cadre d'une décision judiciaire ou d'une enquête officielle. Nous notifions les utilisateurs concernés dans les limites permises par la loi.`,
      },
    ],
  },
  {
    id: "droits",
    title: "5. Vos droits",
    content: [
      {
        subtitle: "5.1 Droits RGPD et législations africaines applicables",
        text: `Conformément au Règlement Général sur la Protection des Données (RGPD) et aux législations nationales applicables dans les pays africains couverts par AroMe, vous disposez des droits suivants : droit d'accès à vos données, droit de rectification, droit à l'effacement ("droit à l'oubli"), droit à la portabilité de vos données, droit d'opposition au traitement, droit de retirer votre consentement à tout moment.`,
      },
      {
        subtitle: "5.2 Exercer vos droits",
        text: `Pour exercer l'un de ces droits, envoyez un email à privacy@afripulse.com avec le sujet "Exercice de droits" et votre demande détaillée. Nous accusons réception sous 72 heures et traitons votre demande dans un délai maximum de 30 jours. Aucun justificatif n'est requis sauf en cas de doute sur l'identité du demandeur.`,
      },
    ],
  },
  {
    id: "cookies",
    title: "6. Cookies et traceurs",
    content: [
      {
        subtitle: "6.1 Cookies strictement nécessaires",
        text: `Nous utilisons uniquement des cookies strictement nécessaires au fonctionnement du service : session d'authentification (durée : 30 jours, ou jusqu'à déconnexion), préférences d'interface (thème, langue). Ces cookies ne peuvent pas être désactivés sans compromettre le fonctionnement de la plateforme.`,
      },
      {
        subtitle: "6.2 Absence de cookies publicitaires",
        text: `AroMe n'utilise aucun cookie publicitaire, aucun tracker tiers, et n'est intégré à aucun réseau publicitaire. Nous n'utilisons pas Google Analytics ni aucun outil de profilage comportemental.`,
      },
    ],
  },
  {
    id: "securite",
    title: "7. Sécurité",
    content: [
      {
        subtitle: "7.1 Mesures techniques",
        text: `Nous appliquons les meilleures pratiques de sécurité : chiffrement des données en transit (TLS 1.3), chiffrement des données sensibles au repos, authentification sécurisée avec hachage des mots de passe (bcrypt), contrôle d'accès strict basé sur les rôles (Row Level Security Supabase), et audits de sécurité réguliers.`,
      },
      {
        subtitle: "7.2 Notification en cas de violation",
        text: `En cas de violation de données vous concernant, nous vous notifions dans les 72 heures par email, conformément aux exigences du RGPD. La notification précise la nature de la violation, les données concernées, les mesures prises et les actions que vous pouvez entreprendre pour vous protéger.`,
      },
    ],
  },
];

export default function ConfidentialitePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        <section
          style={{
            background: "#141410",
            paddingTop: "clamp(5rem,10vh,8rem)",
            paddingBottom: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.3,
              pointerEvents: "none",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
            }}
          />
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0 clamp(1rem,5vw,4rem)",
              position: "relative",
            }}
          >
            <div
              style={{ maxWidth: 700, paddingBottom: "clamp(2rem,5vw,4rem)" }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: ".5rem",
                  fontSize: ".6rem",
                  fontWeight: 800,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "#C08435",
                  marginBottom: "1.5rem",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 1,
                    background: "#C08435",
                    display: "inline-block",
                  }}
                />
                Vos données
              </div>
              <h1
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "clamp(1.8rem,6vw,3.5rem)",
                  fontWeight: 900,
                  color: "#F8F6F1",
                  lineHeight: 1.08,
                  letterSpacing: "-0.04em",
                  marginBottom: "1.25rem",
                }}
              >
                Politique de
                <br />
                <span
                  style={{
                    color: "#C08435",
                    fontStyle: "italic",
                    fontWeight: 200,
                  }}
                >
                  confidentialité
                </span>
              </h1>
              <p
                style={{
                  fontSize: ".85rem",
                  color: "rgba(248,246,241,.45)",
                  lineHeight: 1.7,
                }}
              >
                Dernière mise à jour :{" "}
                <strong style={{ color: "rgba(248,246,241,.65)" }}>
                  {LAST_UPDATE}
                </strong>
                &ensp;·&ensp; Applicable à tous les services AroMe
              </p>
            </div>
          </div>
          <div
            style={{
              height: 3,
              background:
                "linear-gradient(90deg,#C08435 0%,#E8B86D 50%,#C08435 100%)",
            }}
          />
        </section>

        {/* ── CORPS ── */}
        <section
          style={{ padding: "clamp(2rem,5vw,4rem) 0 clamp(3rem,8vw,6rem)" }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0 clamp(1rem,5vw,4rem)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "2rem" : "4rem",
                alignItems: "flex-start",
              }}
            >
              {/* Sommaire - Version mobile : dropdown */}
              {isMobile ? (
                <div style={{ width: "100%" }}>
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem 1.25rem",
                      background: "#fff",
                      border: "1px solid rgba(20,20,16,.08)",
                      borderRadius: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: ".82rem",
                      fontWeight: 700,
                      color: "#141410",
                    }}
                  >
                    Sommaire
                    <span
                      style={{
                        transform: isMobileMenuOpen ? "rotate(180deg)" : "none",
                        transition: "transform .2s",
                      }}
                    >
                      ▼
                    </span>
                  </button>
                  {isMobileMenuOpen && (
                    <div
                      style={{
                        marginTop: ".5rem",
                        background: "#fff",
                        borderRadius: 12,
                        border: "1px solid rgba(20,20,16,.08)",
                        padding: ".5rem",
                      }}
                    >
                      {SECTIONS.map((s) => (
                        <a
                          key={s.id}
                          href={`#${s.id}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          style={{
                            display: "block",
                            fontSize: ".75rem",
                            fontWeight: 600,
                            color: "#928E80",
                            textDecoration: "none",
                            padding: ".6rem .75rem",
                            borderRadius: 8,
                            transition: "all .15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#141410";
                            e.currentTarget.style.background = "#F0EDE4";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#928E80";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {s.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    position: "sticky",
                    top: 100,
                    width: 220,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 14,
                      border: "1px solid rgba(20,20,16,.08)",
                      padding: "1.25rem",
                      boxShadow: "0 1px 8px rgba(20,20,16,.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: ".58rem",
                        fontWeight: 800,
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        color: "#928E80",
                        marginBottom: "1rem",
                        paddingBottom: ".6rem",
                        borderBottom: "1px solid rgba(20,20,16,.07)",
                      }}
                    >
                      Sommaire
                    </div>
                    <nav
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: ".2rem",
                      }}
                    >
                      {SECTIONS.map((s) => (
                        <a
                          key={s.id}
                          href={`#${s.id}`}
                          style={{
                            fontSize: ".72rem",
                            fontWeight: 600,
                            color: "#928E80",
                            textDecoration: "none",
                            padding: ".35rem .5rem",
                            borderRadius: 7,
                            transition: "all .15s",
                            lineHeight: 1.4,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#141410";
                            e.currentTarget.style.background = "#F0EDE4";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#928E80";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {s.title}
                        </a>
                      ))}
                    </nav>
                    <div
                      style={{
                        marginTop: "1.25rem",
                        paddingTop: "1rem",
                        borderTop: "1px solid rgba(20,20,16,.07)",
                      }}
                    >
                      <Link
                        href="/contact"
                        style={{
                          textDecoration: "none",
                          display: "block",
                          background: "#F0EDE4",
                          borderRadius: 8,
                          padding: ".6rem .75rem",
                          fontSize: ".7rem",
                          fontWeight: 700,
                          color: "#C08435",
                        }}
                      >
                        Une question ? →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenu */}
              <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                {/* Résumé */}
                <div
                  style={{
                    background: "#FDF4E7",
                    border: "1px solid rgba(192,132,53,.2)",
                    borderRadius: 14,
                    padding: "1.5rem",
                  }}
                >
                  <h2
                    style={{
                      fontWeight: 800,
                      fontSize: ".95rem",
                      color: "#141410",
                      marginBottom: ".75rem",
                    }}
                  >
                    En résumé
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: ".5rem",
                    }}
                  >
                    {[
                      "✅ Nous ne vendons jamais vos données",
                      "✅ Vos candidatures et notes sont privées et chiffrées",
                      "✅ Newsletter désactivable en un clic",
                      "✅ Suppression du compte complète et immédiate",
                      "✅ Aucun cookie publicitaire ni tracker tiers",
                    ].map((item) => (
                      <p
                        key={item}
                        style={{
                          fontSize: ".8rem",
                          color: "#7A4A1E",
                          lineHeight: 1.5,
                        }}
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>

                {SECTIONS.map((section) => (
                  <div
                    key={section.id}
                    id={section.id}
                    style={{ scrollMarginTop: "80px" }}
                  >
                    <h2
                      style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: "clamp(1.1rem,4vw,1.6rem)",
                        fontWeight: 900,
                        color: "#141410",
                        letterSpacing: "-0.02em",
                        marginTop: "2rem",
                        marginBottom: "1rem",
                        paddingBottom: ".75rem",
                        borderBottom: "2px solid rgba(192,132,53,.2)",
                      }}
                    >
                      {section.title}
                    </h2>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.25rem",
                      }}
                    >
                      {section.content.map((block) => (
                        <div key={block.subtitle}>
                          <h3
                            style={{
                              fontSize: ".85rem",
                              fontWeight: 800,
                              color: "#141410",
                              marginBottom: ".5rem",
                            }}
                          >
                            {block.subtitle}
                          </h3>
                          <p
                            style={{
                              fontSize: ".85rem",
                              color: "#5A5A4A",
                              lineHeight: 1.85,
                            }}
                          >
                            {block.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Contact DPO */}
                <div
                  style={{
                    background: "#141410",
                    borderRadius: 16,
                    padding: "1.5rem",
                    marginTop: "2rem",
                  }}
                >
                  <h2
                    style={{
                      fontWeight: 800,
                      fontSize: ".9rem",
                      color: "#F8F6F1",
                      marginBottom: ".6rem",
                    }}
                  >
                    Délégué à la protection des données
                  </h2>
                  <p
                    style={{
                      fontSize: ".8rem",
                      color: "rgba(248,246,241,.55)",
                      lineHeight: 1.7,
                      marginBottom: "1rem",
                    }}
                  >
                    Pour toute question relative à cette politique ou pour
                    exercer vos droits, contactez notre délégué à la protection
                    des données.
                  </p>
                  <a
                    href="mailto:privacy@afripulse.com"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: ".4rem",
                      padding: ".6rem 1.25rem",
                      borderRadius: 9,
                      background: "#C08435",
                      color: "#fff",
                      fontSize: ".75rem",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    ✉️ privacy@afripulse.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
