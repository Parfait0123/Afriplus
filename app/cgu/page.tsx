"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const LAST_UPDATE = "15 mars 2025";

const SECTIONS = [
  {
    id: "objet",
    title: "1. Objet et acceptation",
    content: [
      {
        subtitle: "1.1 Objet des présentes CGU",
        text: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme AfriPulse, accessible à l'adresse afripulse.com, ainsi que de tous ses sous-domaines et applications mobiles associées. AfriPulse est une plateforme d'information et d'opportunités dédiée aux Africains, proposant : la publication et la consultation d'actualités africaines, un répertoire de bourses d'études internationales et continentales, un annuaire d'opportunités professionnelles et de stages, un agenda d'événements (conférences, forums, hackathons, sommets), un outil de suivi de candidatures personnalisé, et un service de newsletter thématique.`,
      },
      {
        subtitle: "1.2 Acceptation",
        text: `L'utilisation de la plateforme AfriPulse implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez cesser d'utiliser notre service. AfriPulse se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs sont informés de toute modification substantielle par email et/ou notification sur la plateforme. L'utilisation continue du service après notification vaut acceptation des nouvelles conditions.`,
      },
    ],
  },
  {
    id: "compte",
    title: "2. Création et gestion du compte",
    content: [
      {
        subtitle: "2.1 Création d'un compte",
        text: `La création d'un compte est gratuite et ouverte à toute personne physique âgée de 16 ans ou plus. Vous vous engagez à fournir des informations exactes lors de l'inscription et à les maintenir à jour. Un seul compte est autorisé par personne. La création de comptes multiples ou de faux comptes est strictement interdite et peut entraîner la suspension immédiate de tous les comptes concernés.`,
      },
      {
        subtitle: "2.2 Sécurité du compte",
        text: `Vous êtes seul responsable de la confidentialité de vos identifiants de connexion. Toute activité effectuée depuis votre compte est présumée réalisée par vous. En cas d'utilisation non autorisée de votre compte, vous devez immédiatement en informer AfriPulse à security@afripulse.com. AfriPulse ne peut être tenu responsable des dommages résultant de l'utilisation non autorisée de votre compte.`,
      },
      {
        subtitle: "2.3 Suspension et résiliation",
        text: `AfriPulse se réserve le droit de suspendre ou résilier tout compte en cas de : violation des présentes CGU, comportement abusif envers d'autres utilisateurs ou l'équipe AfriPulse, tentative de manipulation des contenus ou des systèmes de la plateforme, fourniture d'informations manifestement fausses. Vous pouvez clôturer votre compte à tout moment depuis vos paramètres. La clôture entraîne la suppression définitive de toutes vos données dans un délai de 30 jours.`,
      },
    ],
  },
  {
    id: "candidatures",
    title: "3. Suivi des candidatures",
    content: [
      {
        subtitle: "3.1 Nature de l'outil",
        text: `AfriPulse propose un outil de suivi de candidatures permettant aux utilisateurs de gérer leurs démarches pour des bourses et opportunités. Cet outil est un outil personnel de gestion et de mémorisation. Il ne constitue pas un service de candidature officiel : AfriPulse n'envoie pas vos candidatures aux organisateurs et n'agit pas en tant qu'intermédiaire officiel entre vous et ces organisateurs.`,
      },
      {
        subtitle: "3.2 Responsabilité des données de candidature",
        text: `Les données que vous enregistrez dans l'outil de suivi (statuts, notes personnelles, liste de documents) sont strictement personnelles et privées. AfriPulse ne les consulte jamais et ne les transmet à aucun tiers. Vous êtes seul responsable de l'exactitude des informations que vous y enregistrez. AfriPulse ne saurait être tenu responsable d'une candidature manquée ou refusée en raison d'informations erronées enregistrées dans l'outil.`,
      },
      {
        subtitle: "3.3 Vérification des opportunités publiées",
        text: `AfriPulse s'efforce de vérifier l'exactitude et l'actualité de chaque bourse, opportunité ou événement publié. Cependant, les informations (dates limites, montants, conditions d'éligibilité) peuvent évoluer sans que nous en soyons informés. Il vous appartient de vérifier les informations directement auprès des organisateurs avant de soumettre une candidature. AfriPulse ne peut être tenu responsable d'une candidature fondée sur des informations devenues obsolètes.`,
      },
    ],
  },
  {
    id: "newsletter",
    title: "4. Newsletter et communications",
    content: [
      {
        subtitle: "4.1 Abonnement",
        text: `L'abonnement à la newsletter AfriPulse est facultatif. En vous abonnant, vous acceptez de recevoir des emails selon vos préférences (types de contenu, fréquence). Vous pouvez modifier vos préférences ou vous désabonner à tout moment depuis votre espace personnel ou via le lien de désabonnement présent dans chaque email.`,
      },
      {
        subtitle: "4.2 Contenu et fréquence",
        text: `La newsletter peut contenir : des actualités africaines sélectionnées par notre équipe, des bourses et opportunités correspondant à vos préférences déclarées, des rappels d'échéances pour les programmes que vous avez sauvegardés, et des annonces d'événements. La fréquence d'envoi dépend de vos préférences et de l'actualité. AfriPulse ne garantit pas un rythme d'envoi fixe.`,
      },
      {
        subtitle: "4.3 Absence de contenu commercial",
        text: `AfriPulse ne vend aucun espace publicitaire dans sa newsletter. Le contenu éditorial n'est jamais influencé par des considérations commerciales. Toute mise en avant éditoriale rémunérée (contenu sponsorisé) est explicitement signalée comme telle. AfriPulse ne transmet jamais vos coordonnées email à des annonceurs.`,
      },
    ],
  },
  {
    id: "contenu",
    title: "5. Contenu et propriété intellectuelle",
    content: [
      {
        subtitle: "5.1 Propriété du contenu AfriPulse",
        text: `L'ensemble des contenus produits par AfriPulse (articles, analyses, fiches de bourses, descriptions d'opportunités, code source de la plateforme, design, logos, marques) est protégé par le droit d'auteur et appartient exclusivement à AfriPulse ou à ses partenaires. Toute reproduction, même partielle, sans autorisation écrite préalable est interdite. Pour toute demande de reproduction ou de partenariat éditorial, contactez editorial@afripulse.com.`,
      },
      {
        subtitle: "5.2 Utilisation autorisée",
        text: `Vous êtes autorisé à consulter, télécharger et imprimer les contenus AfriPulse pour un usage personnel et non commercial. Vous pouvez partager des liens vers nos articles et fiches de bourses sur vos réseaux sociaux ou par email. Vous ne pouvez pas reproduire nos contenus sur d'autres sites web, bases de données ou publications sans autorisation.`,
      },
      {
        subtitle: "5.3 Signalement de violations",
        text: `Si vous estimez qu'un contenu publié sur AfriPulse porte atteinte à vos droits ou contient des informations erronées, contactez-nous à editorial@afripulse.com en précisant l'URL concernée et la nature du problème. Nous traitons chaque signalement sérieusement et dans les meilleurs délais.`,
      },
    ],
  },
  {
    id: "responsabilite",
    title: "6. Responsabilités et limitations",
    content: [
      {
        subtitle: "6.1 Limitation de responsabilité",
        text: `AfriPulse fournit ses services "en l'état" et ne garantit pas : l'exhaustivité des bourses, opportunités et événements publiés, l'absence d'interruption ou d'erreur dans le service, la réussite de vos candidatures basées sur nos informations. AfriPulse ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme, d'une candidature fondée sur des informations incorrectes ou obsolètes, ou de la perte de données dues à un événement technique indépendant de notre volonté.`,
      },
      {
        subtitle: "6.2 Liens externes",
        text: `AfriPulse peut contenir des liens vers des sites tiers (sites d'universités, d'entreprises, d'organisations). Ces liens sont fournis à titre informatif. AfriPulse n'exerce aucun contrôle sur ces sites et n'est pas responsable de leur contenu ou de leurs pratiques de confidentialité. Nous vous recommandons de consulter les CGU et politique de confidentialité de chaque site tiers que vous visitez.`,
      },
    ],
  },
  {
    id: "droit",
    title: "7. Droit applicable et litiges",
    content: [
      {
        subtitle: "7.1 Droit applicable",
        text: `Les présentes CGU sont soumises au droit sénégalais, pays du siège social d'AfriPulse. En cas de litige, les parties s'engagent à rechercher une solution amiable dans un délai de 30 jours avant tout recours judiciaire. À défaut de résolution amiable, le litige sera porté devant les tribunaux compétents de Dakar, Sénégal.`,
      },
      {
        subtitle: "7.2 Réclamations",
        text: `Pour toute réclamation relative à l'utilisation de la plateforme, contactez notre service client à contact@afripulse.com. Nous accusons réception sous 48 heures et traitons chaque réclamation dans un délai maximum de 15 jours ouvrés. En cas d'insatisfaction avec notre réponse, vous pouvez saisir les autorités de protection des consommateurs compétentes dans votre pays.`,
      },
    ],
  },
];

export default function CGUPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: "#F0EDE4" }}>

        {/* ── HERO ── */}
        <section style={{
          background: "#141410",
          paddingTop: "clamp(5rem,10vh,8rem)",
          paddingBottom: 0,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: .3, pointerEvents: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")" }} />

          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,4rem)", position: "relative" }}>
            <div style={{ maxWidth: 700, paddingBottom: "4rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", fontSize: ".6rem", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "#C08435", marginBottom: "1.5rem" }}>
                <span style={{ width: 20, height: 1, background: "#C08435", display: "inline-block" }} />
                Utilisation du service
              </div>
              <h1 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(2.2rem,5vw,3.5rem)",
                fontWeight: 900, color: "#F8F6F1",
                lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: "1.25rem",
              }}>
                Conditions générales<br />
                <span style={{ color: "#C08435", fontStyle: "italic", fontWeight: 200 }}>d'utilisation</span>
              </h1>
              <p style={{ fontSize: ".88rem", color: "rgba(248,246,241,.45)", lineHeight: 1.7 }}>
                Dernière mise à jour : <strong style={{ color: "rgba(248,246,241,.65)" }}>{LAST_UPDATE}</strong>
                &ensp;·&ensp; Version 2.1
              </p>
            </div>
          </div>
          <div style={{ height: 3, background: "linear-gradient(90deg,#C08435 0%,#E8B86D 50%,#C08435 100%)" }} />
        </section>

        {/* ── CORPS ── */}
        <section style={{ padding: "4rem 0 6rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,4rem)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "4rem", alignItems: "start" }}>

              {/* Sommaire sticky */}
              <div style={{ position: "sticky", top: 100 }}>
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(20,20,16,.08)", padding: "1.25rem", boxShadow: "0 1px 8px rgba(20,20,16,.04)" }}>
                  <div style={{ fontSize: ".58rem", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#928E80", marginBottom: "1rem", paddingBottom: ".6rem", borderBottom: "1px solid rgba(20,20,16,.07)" }}>
                    Sommaire
                  </div>
                  <nav style={{ display: "flex", flexDirection: "column", gap: ".2rem" }}>
                    {SECTIONS.map((s) => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        style={{
                          fontSize: ".72rem", fontWeight: 600, color: "#928E80",
                          textDecoration: "none", padding: ".35rem .5rem", borderRadius: 7,
                          transition: "all .15s", lineHeight: 1.4,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#141410"; e.currentTarget.style.background = "#F0EDE4"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#928E80"; e.currentTarget.style.background = "transparent"; }}
                      >
                        {s.title}
                      </a>
                    ))}
                  </nav>
                  <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(20,20,16,.07)" }}>
                    <Link href="/confidentialite" style={{ textDecoration: "none", display: "block", background: "#F0EDE4", borderRadius: 8, padding: ".6rem .75rem", fontSize: ".7rem", fontWeight: 700, color: "#C08435", marginBottom: ".5rem" }}>
                      Confidentialité →
                    </Link>
                    <Link href="/contact" style={{ textDecoration: "none", display: "block", background: "#F0EDE4", borderRadius: 8, padding: ".6rem .75rem", fontSize: ".7rem", fontWeight: 700, color: "#928E80" }}>
                      Une question ? →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>

                {/* Résumé */}
                <div style={{ background: "#EAF4EF", border: "1px solid rgba(26,92,64,.15)", borderRadius: 14, padding: "1.75rem" }}>
                  <h2 style={{ fontWeight: 800, fontSize: ".95rem", color: "#141410", marginBottom: ".75rem" }}>
                    Ce que vous devez retenir
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
                    {[
                      "📖 AfriPulse est gratuit — pas d'abonnement, pas de frais cachés",
                      "🎓 L'outil de suivi est un outil personnel, pas un service de candidature officiel",
                      "✅ Vérifiez toujours les informations directement auprès des organisateurs",
                      "📧 Désabonnement newsletter possible à tout moment en un clic",
                      "🔒 Vos données de candidature restent strictement privées",
                    ].map((item) => (
                      <p key={item} style={{ fontSize: ".82rem", color: "#1A5C40", lineHeight: 1.5 }}>{item}</p>
                    ))}
                  </div>
                </div>

                {SECTIONS.map((section) => (
                  <div key={section.id} id={section.id}>
                    <h2 style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: "clamp(1.2rem,2vw,1.6rem)",
                      fontWeight: 900, color: "#141410",
                      letterSpacing: "-0.02em", marginBottom: "1.5rem",
                      paddingBottom: ".75rem",
                      borderBottom: "2px solid rgba(20,20,16,.1)",
                    }}>
                      {section.title}
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      {section.content.map((block) => (
                        <div key={block.subtitle}>
                          <h3 style={{ fontSize: ".88rem", fontWeight: 800, color: "#141410", marginBottom: ".6rem" }}>
                            {block.subtitle}
                          </h3>
                          <p style={{ fontSize: ".88rem", color: "#5A5A4A", lineHeight: 1.85 }}>
                            {block.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Contact */}
                <div style={{ background: "#141410", borderRadius: 16, padding: "2rem" }}>
                  <h2 style={{ fontWeight: 800, fontSize: ".95rem", color: "#F8F6F1", marginBottom: ".6rem" }}>
                    Questions sur ces CGU ?
                  </h2>
                  <p style={{ fontSize: ".82rem", color: "rgba(248,246,241,.55)", lineHeight: 1.7, marginBottom: "1rem" }}>
                    Pour toute question relative aux présentes conditions d'utilisation, notre équipe vous répond sous 48 heures.
                  </p>
                  <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", padding: ".6rem 1.25rem", borderRadius: 9, background: "#C08435", color: "#fff", fontSize: ".78rem", fontWeight: 700, textDecoration: "none" }}>
                    Nous contacter →
                  </Link>
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