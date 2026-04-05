"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import SearchModal from "@/components/search/SearchModal";

const NAV_LINKS = [
  { href: "/actualites",  label: "Actualités"   },
  { href: "/bourses",     label: "Bourses"       },
  { href: "/opportunites",label: "Opportunités"  },
  { href: "/evenements",  label: "Événements"    },
];

/* ── Icônes ── */
const IcoSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcoDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IcoAdmin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>
);
const IcoClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Navbar() {
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();

  const isAdmin  = profile?.role === "admin" || profile?.role === "editor";
  const initials = ((profile?.full_name || user?.email || "U").charAt(0)).toUpperCase();

  /* Fermer le drawer quand la route change */
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  /* Bloquer le scroll body quand le drawer est ouvert */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  /* Raccourci clavier ⌘K */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* ═══════════════════════════════════
          BARRE PRINCIPALE
      ═══════════════════════════════════ */}
      <nav className="nb-bar">

        {/* Logo */}
        <Link href="/" className="nb-logo">
          Aro<span style={{ color: "#C08435" }}>Me</span>
        </Link>

        {/* Liens desktop */}
        <div className="nb-links">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={`nb-link ${pathname?.startsWith(l.href) ? "nb-link--active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions desktop */}
        <div className="nb-actions">
          {/* Recherche */}
          <button onClick={() => setSearchOpen(true)} className="nb-search-btn">
            <IcoSearch />
            <span className="nb-search-label">Rechercher</span>
            <span className="nb-kbd">⌘K</span>
          </button>

          {!loading && (
            <>
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="nb-btn-admin">Admin</Link>
                  )}
                  <Link href="/dashboard" className="nb-avatar" title={profile?.full_name || user.email}>
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile?.full_name || user.email} 
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                      />
                    ) : (
                      initials
                    )}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/connexion" className="nb-btn-outline">Connexion</Link>
                  <Link href="/auth/inscription" className="nb-btn-solid">S'inscrire</Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Actions mobile */}
        <div className="nb-mobile-actions">
          {/* Bouton recherche mobile */}
          <button onClick={() => setSearchOpen(true)} className="nb-icon-btn" aria-label="Rechercher">
            <IcoSearch />
          </button>

          {/* Avatar / dashboard (si connecté) */}
          {!loading && user && (
            <Link href="/dashboard" className="nb-avatar nb-avatar--sm" title="Mon dashboard">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile?.full_name || user.email} 
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              ) : (
                initials
              )}
            </Link>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={`nb-hamburger ${drawerOpen ? "nb-hamburger--open" : ""}`}
            aria-label="Menu"
          >
            {drawerOpen ? <IcoClose /> : (
              <>
                <span /><span /><span />
              </>
            )}
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════
          DRAWER MOBILE
      ═══════════════════════════════════ */}
      {/* Overlay */}
      {drawerOpen && (
        <div className="nb-overlay" onClick={() => setDrawerOpen(false)} />
      )}

      <div className={`nb-drawer ${drawerOpen ? "nb-drawer--open" : ""}`}>
        <div className="nb-drawer-inner">

          {/* Si connecté : encart profil */}
          {!loading && user && (
            <div className="nb-drawer-profile">
              <div className="nb-drawer-avatar">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile?.full_name || user.email} 
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="nb-drawer-profile-info">
                <div className="nb-drawer-profile-name">
                  {profile?.full_name || "Mon compte"}
                </div>
                <div className="nb-drawer-profile-email">{user.email}</div>
              </div>
            </div>
          )}

          {/* Liens nav */}
          <nav className="nb-drawer-nav">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href}
                className={`nb-drawer-link ${pathname?.startsWith(l.href) ? "nb-drawer-link--active" : ""}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="nb-drawer-divider" />

          {/* Actions selon état connexion */}
          {!loading && (
            user ? (
              <div className="nb-drawer-user-actions">
                {/* Dashboard */}
                <Link href="/dashboard" className="nb-drawer-cta nb-drawer-cta--primary">
                  <IcoDashboard />
                  Mon dashboard
                </Link>

                {/* Admin si droit */}
                {isAdmin && (
                  <Link href="/admin" className="nb-drawer-cta nb-drawer-cta--gold">
                    <IcoAdmin />
                    Administration
                  </Link>
                )}

                {/* Déconnexion */}
                <button onClick={signOut} className="nb-drawer-cta nb-drawer-cta--ghost">
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="nb-drawer-auth">
                <Link href="/auth/connexion"  className="nb-drawer-cta nb-drawer-cta--outline">
                  Se connecter
                </Link>
                <Link href="/auth/inscription" className="nb-drawer-cta nb-drawer-cta--solid">
                  S'inscrire gratuitement
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      {/* Search modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}