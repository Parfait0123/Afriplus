"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import SearchModal from "@/components/search/SearchModal";

const navLinks = [
  { href: "/actualites", label: "Actualités" },
  { href: "/bourses", label: "Bourses" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/evenements", label: "Événements" },
];

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const close = (e: MouseEvent) => {
      const drawer = document.getElementById("mobile-drawer");
      const hamburger = document.getElementById("hamburger-btn");
      if (drawer && !drawer.contains(e.target as Node) && hamburger && !hamburger.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [mobileOpen]);

  return (
    <>
      <nav style={{
        position: "fixed",
        inset: "0 0 auto",
        zIndex: 900,
        height: scrolled ? 58 : 64,
        padding: "0 max(1.5rem, env(safe-area-inset-left))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(248,246,241,.97)" : "rgba(248,246,241,.88)",
        backdropFilter: "blur(24px) saturate(1.6)",
        borderBottom: "1px solid rgba(20,20,16,.07)",
        transition: "height .3s ease, background .3s ease",
        boxShadow: scrolled ? "0 2px 20px rgba(20,20,16,.06)" : "none",
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: "1.45rem",
          fontWeight: 900,
          color: "#141410",
          textDecoration: "none",
          letterSpacing: "-0.04em",
          flexShrink: 0,
        }}>
          Afri<span style={{ color: "#C08435" }}>Pulse</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-desktop-links">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="nav-desktop-actions">
          <button onClick={() => setSearchOpen(true)} className="nav-search-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span>Rechercher</span>
            <span className="nav-kbd">⌘K</span>
          </button>

          {!loading && (
            <>
              {user ? (
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  {(profile?.role === "admin" || profile?.role === "editor") && (
                    <Link href="/admin" className="nav-btn-admin">Admin</Link>
                  )}
                  <Link href="/dashboard" style={{ textDecoration: "none", display: "block" }}>
  <div 
    style={{
      width: 34, 
      height: 34, 
      borderRadius: "50%",
      overflow: "hidden", // Important pour l'image
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      // Style "Luxe" par défaut (bordure fine dorée)
      border: "1.5px solid #C08435",
      boxShadow: "0 4px 12px rgba(192, 132, 53, 0.15)",
      background: "#141410", // Fond noir profond pour le luxe
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.08)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
    title={profile?.full_name || "Tableau de bord"}
  >
    {profile?.avatar_url ? (
      <img 
        src={profile.avatar_url} 
        alt="Avatar" 
        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
      />
    ) : (
      <span style={{
        fontFamily: "'Fraunces', serif",
        fontSize: "0.85rem",
        fontWeight: 800,
        color: "#C08435", // Texte doré sur fond noir
        letterSpacing: "0.02em"
      }}>
        {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
      </span>
    )}
  </div>
</Link>

                  <button onClick={signOut} className="nav-btn-ghost">Déconnexion</button>
                </div>
              ) : (
                <>
                  <Link href="/auth/connexion" className="nav-btn-outline">Connexion</Link>
                  <Link href="/auth/inscription" className="nav-btn-solid">S&apos;inscrire</Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="nav-mobile-actions">
          <button onClick={() => setSearchOpen(true)} className="nav-icon-btn" aria-label="Rechercher">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button
            id="hamburger-btn"
            onClick={() => setMobileOpen(v => !v)}
            className="nav-hamburger"
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <span style={{ transform: mobileOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ transform: mobileOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div id="mobile-drawer" className="mobile-drawer" style={{
        maxHeight: mobileOpen ? "420px" : "0",
        paddingTop: mobileOpen ? "1.25rem" : "0",
        paddingBottom: mobileOpen ? "1.5rem" : "0",
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.75rem", paddingTop: "1rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
          {!loading && !user && (
            <>
              <Link href="/auth/connexion" className="mobile-btn-outline" onClick={() => setMobileOpen(false)}>Connexion</Link>
              <Link href="/auth/inscription" className="mobile-btn-solid" onClick={() => setMobileOpen(false)}>S&apos;inscrire</Link>
            </>
          )}
          {!loading && user && (
            <button onClick={() => { signOut(); setMobileOpen(false); }} className="mobile-btn-ghost">Déconnexion</button>
          )}
        </div>
      </div>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      <SearchKeyboardShortcut onOpen={() => setSearchOpen(true)} />
    </>
  );
}

function SearchKeyboardShortcut({ onOpen }: { onOpen: () => void }) {
  if (typeof window !== "undefined") {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); onOpen(); }
    };
    window.addEventListener("keydown", handler);
  }
  return null;
}
