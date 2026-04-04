import Link from "next/link";

const socialLinks = [
  {
    name: "Twitter/X", href: "#",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  },
  {
    name: "LinkedIn", href: "#",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
  },
  {
    name: "Instagram", href: "#",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
  },
];

const footerCols = [
  {
    title: "Explorer",
    links: [
      { href: "/actualites", label: "Actualités" },
      { href: "/bourses", label: "Bourses d'études" },
      { href: "/opportunites", label: "Opportunités" },
      { href: "/evenements", label: "Événements" },
    ],
  },
  {
    title: "Plateforme",
    links: [
      { href: "#", label: "Soumettre un contenu" },
      { href: "#", label: "Devenir partenaire" },
      { href: "#", label: "Publicité" },
      { href: "#", label: "API" },
    ],
  },
  {
    title: "Infos",
    links: [
      { href: "/a-propos", label: "À propos" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/cgu", label: "CGU" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      {/* Decorative background */}
      <div className="footer-glow" />

      <div className="container footer-inner">
        {/* Top grid */}
        <div className="footer-grid">
          {/* Brand column */}
          <div>
            <Link href="/" className="footer-logo">
              Afri<span>Pulse</span>
            </Link>
            <p className="footer-tagline">
              La plateforme de référence pour l&apos;actualité africaine, les bourses d&apos;études et les opportunités du continent.
            </p>

            {/* Social icons — hover via CSS only */}
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {socialLinks.map((s) => (
                <a key={s.name} href={s.href} aria-label={s.name} className="footer-social">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {footerCols.map((col) => (
            <div key={col.title}>
              <div className="footer-col-title">{col.title}</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="footer-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 AfriPulse. Tous droits réservés.</span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className="footer-meta">Construit pour l&apos;Afrique</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
