"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ToastProvider } from "@/components/ui/Toast";
import { useState, useEffect } from "react";

/* ══════════════════════════════════════════════
   NAV ITEMS
══════════════════════════════════════════════ */
const NAV = [
  {
    section: "Tableau de bord",
    items: [
      { href: "/admin",             label: "Vue d'ensemble",   icon: IcoGrid,      exact: true  },
      { href: "/admin/analytique",  label: "Analytique",       icon: IcoChart,     exact: false },
    ],
  },
  {
    section: "Contenu",
    items: [
      { href: "/admin/articles",    label: "Actualités",       icon: IcoNews,      exact: false },
      { href: "/admin/bourses",     label: "Bourses",          icon: IcoGrad,      exact: false },
      { href: "/admin/opportunites",label: "Opportunités",     icon: IcoBrief,     exact: false },
      { href: "/admin/evenements",  label: "Événements",       icon: IcoCal,       exact: false },
    ],
  },
  {
    section: "Communauté",
    items: [
      { href: "/admin/utilisateurs",label: "Utilisateurs",     icon: IcoUsers,     exact: false },
      { href: "/admin/newsletter",  label: "Newsletter",       icon: IcoMail,      exact: false },
      { href: "/admin/abonnes",     label: "Abonnés",          icon: IcoPeople,    exact: false },
    ],
  },
];

/* ══════════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════════ */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname           = usePathname();
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Fermer le drawer mobile si on resize vers desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  const sidebarW = collapsed ? 68 : 240;

  return (
    <ToastProvider>
      <div style={{
        display: "flex", minHeight: "100vh",
        background: "#F0EDE4",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>

        {/* ── OVERLAY MOBILE ── */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 199,
              background: "rgba(10,8,0,.7)",
              backdropFilter: "blur(6px)",
              animation: "fadein .2s ease",
            }}
          />
        )}

        {/* ══════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════ */}
        <aside style={{
          width: sidebarW,
          flexShrink: 0,
          background: "#0a0800",
          position: "fixed",
          top: 0, bottom: 0, left: 0,
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          overflowX: "hidden",
          transition: "width .25s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1)",
          transform: mobileOpen ? "translateX(0)" : undefined,
          scrollbarWidth: "none",
          /* Mobile : masquée par défaut */
          ...(mounted && window.innerWidth < 1024 && !mobileOpen
            ? { transform: "translateX(-100%)" }
            : {}),
        }}>

          {/* Grain texture overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
            opacity: 0.4,
            zIndex: 0,
          }} />

          {/* Glow doré en haut */}
          <div style={{
            position: "absolute", top: -60, left: -60,
            width: 200, height: 200,
            background: "radial-gradient(circle, rgba(192,132,53,.12) 0%, transparent 65%)",
            pointerEvents: "none", zIndex: 0,
          }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

            {/* Logo + toggle collapse */}
            <div style={{
              padding: collapsed ? "1.5rem 0" : "1.5rem 1.25rem",
              borderBottom: "1px solid rgba(255,255,255,.06)",
              display: "flex", alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              gap: "0.5rem", flexShrink: 0,
            }}>
              {!collapsed && (
                <Link href="/" style={{ textDecoration: "none" }}>
                  <div style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: "1.25rem", fontWeight: 900,
                    letterSpacing: "-0.04em", color: "#F8F6F1",
                    lineHeight: 1,
                  }}>
                    Afri<span style={{ color: "#C08435" }}>Pulse</span>
                  </div>
                  <div style={{
                    fontSize: "0.52rem", fontWeight: 700,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "rgba(255,255,255,.2)", marginTop: "0.2rem",
                  }}>
                    Administration
                  </div>
                </Link>
              )}

              <button
                onClick={() => setCollapsed(c => !c)}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(255,255,255,.08)",
                  color: "rgba(255,255,255,.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0, transition: "all .15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(192,132,53,.15)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#C08435";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.06)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,.35)";
                }}
              >
                {collapsed ? <IcoChevRight /> : <IcoChevLeft />}
              </button>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto", scrollbarWidth: "none" }}>
              {NAV.map((group) => (
                <div key={group.section} style={{ marginBottom: "1.5rem" }}>
                  {!collapsed && (
                    <div style={{
                      fontSize: "0.48rem", fontWeight: 800,
                      letterSpacing: "0.2em", textTransform: "uppercase",
                      color: "rgba(255,255,255,.18)",
                      padding: "0 0.75rem", marginBottom: "0.4rem",
                    }}>
                      {group.section}
                    </div>
                  )}

                  {group.items.map((item) => {
                    const active = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.7rem",
                          padding: collapsed ? "0.65rem 0" : "0.6rem 0.75rem",
                          justifyContent: collapsed ? "center" : "flex-start",
                          borderRadius: 10,
                          marginBottom: "0.1rem",
                          textDecoration: "none",
                          position: "relative",
                          overflow: "hidden",
                          transition: "all .15s",
                          background: active
                            ? "linear-gradient(90deg, rgba(192,132,53,.2) 0%, rgba(192,132,53,.08) 100%)"
                            : "transparent",
                          border: active
                            ? "1px solid rgba(192,132,53,.2)"
                            : "1px solid transparent",
                        }}
                        onMouseEnter={e => {
                          if (!active)
                            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,.05)";
                        }}
                        onMouseLeave={e => {
                          if (!active)
                            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                        }}
                      >
                        {/* Trait doré à gauche si actif */}
                        {active && !collapsed && (
                          <div style={{
                            position: "absolute", left: 0, top: "20%", bottom: "20%",
                            width: 2.5, borderRadius: 100,
                            background: "#C08435",
                            boxShadow: "0 0 8px #C08435",
                          }} />
                        )}

                        <span style={{
                          color: active ? "#C08435" : "rgba(255,255,255,.38)",
                          flexShrink: 0, transition: "color .15s",
                          display: "flex",
                        }}>
                          <Icon />
                        </span>

                        {!collapsed && (
                          <span style={{
                            fontSize: "0.82rem",
                            fontWeight: active ? 700 : 400,
                            color: active ? "#F8F6F1" : "rgba(255,255,255,.45)",
                            transition: "color .15s",
                            whiteSpace: "nowrap",
                          }}>
                            {item.label}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Bas de sidebar : profil + actions */}
            <div style={{
              borderTop: "1px solid rgba(255,255,255,.06)",
              padding: collapsed ? "1rem 0" : "1rem 0.75rem",
              flexShrink: 0,
            }}>
              {/* Voir le site */}
              <Link
                href="/"
                target="_blank"
                style={{
                  display: "flex", alignItems: "center",
                  gap: "0.7rem",
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "0.6rem 0" : "0.6rem 0.75rem",
                  borderRadius: 10, marginBottom: "0.25rem",
                  color: "rgba(255,255,255,.3)",
                  textDecoration: "none", fontSize: "0.78rem",
                  transition: "all .15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.65)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,.04)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.3)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                }}
              >
                <IcoExternalLink />
                {!collapsed && <span>Voir le site</span>}
              </Link>

              {/* Déconnexion */}
              <button
                onClick={signOut}
                style={{
                  display: "flex", alignItems: "center",
                  gap: "0.7rem",
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "0.6rem 0" : "0.6rem 0.75rem",
                  borderRadius: 10, marginBottom: "0.75rem",
                  color: "rgba(200,80,60,.55)",
                  background: "transparent", border: "none",
                  cursor: "pointer", width: "100%",
                  fontSize: "0.78rem",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  transition: "all .15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#E05A3A";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,80,60,.07)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,80,60,.55)";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <IcoLogout />
                {!collapsed && <span>Déconnexion</span>}
              </button>

              {/* Profil */}
              <div style={{
                display: "flex", alignItems: "center",
                gap: "0.75rem",
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "0.5rem 0" : "0.65rem 0.75rem",
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.06)",
                borderRadius: 12,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #C08435 0%, #7a5220 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "0.8rem", fontWeight: 900, color: "#fff",
                  border: "1.5px solid rgba(192,132,53,.4)",
                }}>
                  {initials}
                </div>
                {!collapsed && (
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.78rem", fontWeight: 700,
                      color: "#F8F6F1", whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {profile?.full_name ?? "Administrateur"}
                    </div>
                    <div style={{
                      fontSize: "0.58rem", color: "rgba(255,255,255,.28)",
                      letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>
                      {profile?.role ?? "admin"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* ══════════════════════════════════════
            TOPBAR MOBILE
        ══════════════════════════════════════ */}
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0,
          height: 56, zIndex: 150,
          background: "rgba(10,8,0,.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          display: "flex", alignItems: "center",
          padding: "0 1.25rem", gap: "1rem",
        }}
          className="admin-topbar-mobile"
        >
          <button
            onClick={() => setMobileOpen(m => !m)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.1)",
              color: "rgba(255,255,255,.65)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <IcoMenu />
          </button>

          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "1.1rem", fontWeight: 900,
              letterSpacing: "-0.04em", color: "#F8F6F1",
            }}>
              Afri<span style={{ color: "#C08435" }}>Pulse</span>
            </span>
          </Link>
        </div>

        {/* ══════════════════════════════════════
            CONTENU PRINCIPAL
        ══════════════════════════════════════ */}
        <main style={{
          flex: 1,
          marginLeft: sidebarW,
          minHeight: "100vh",
          transition: "margin-left .25s cubic-bezier(.4,0,.2,1)",
          background: "#F0EDE4",
        }}
          className="admin-main"
        >
          {children}
        </main>
      </div>

      {/* CSS global admin */}
      <style>{`
        @keyframes fadein { from{opacity:0} to{opacity:1} }
        @keyframes slideup { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }

        /* Mobile : sidebar cachée, topbar visible, pas de margin */
        @media (max-width: 1023px) {
          .admin-topbar-mobile { display: flex !important; }
          .admin-main {
            margin-left: 0 !important;
            padding-top: 56px;
          }
        }
        @media (min-width: 1024px) {
          .admin-topbar-mobile { display: none !important; }
        }

        /* Scrollbar sidebar */
        aside::-webkit-scrollbar { width: 0; }
        nav::-webkit-scrollbar { width: 0; }
      `}</style>
    </ToastProvider>
  );
}

/* ══════════════════════════════════════════════
   ICÔNES SVG
══════════════════════════════════════════════ */
function IcoGrid() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>; }
function IcoChart() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function IcoNews() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>; }
function IcoGrad() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>; }
function IcoBrief() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>; }
function IcoCal() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IcoUsers() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function IcoMail() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function IcoPeople() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>; }
function IcoChevLeft() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function IcoChevRight() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function IcoExternalLink() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>; }
function IcoLogout() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function IcoMenu() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }