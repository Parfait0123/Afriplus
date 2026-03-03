"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const sidebarItems = [
  { href: "/admin", label: "Vue d'ensemble", icon: "📊", exact: true },
  { href: "/admin/articles", label: "Actualités", icon: "📰" },
  { href: "/admin/bourses", label: "Bourses d'études", icon: "🎓" },
  { href: "/admin/opportunites", label: "Opportunités", icon: "💼" },
  { href: "/admin/evenements", label: "Événements", icon: "📅" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "📬" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F0EDE4" }}>
      <aside style={{ width: 260, flexShrink: 0, background: "#141410", display: "flex", flexDirection: "column", position: "fixed", inset: "0 auto 0 0", zIndex: 100, overflowY: "auto" }}>
        <div style={{ padding: "1.5rem 1.75rem", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <Link href="/" style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.3rem", fontWeight: 900, color: "#fff", textDecoration: "none", letterSpacing: "-0.04em" }}>
            Afri<span style={{ color: "#C08435" }}>Pulse</span>
          </Link>
          <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,.3)", marginTop: "0.2rem" }}>
            Dashboard Admin
          </div>
        </div>

        <nav style={{ flex: 1, padding: "1rem 0.75rem" }}>
          <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,.25)", padding: "0 1rem", marginBottom: "0.6rem", marginTop: "0.4rem" }}>Contenu</div>
          {sidebarItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1rem", borderRadius: 10, marginBottom: "0.15rem", fontSize: "0.83rem", fontWeight: active ? 600 : 400, color: active ? "#fff" : "rgba(255,255,255,.45)", background: active ? "rgba(192,132,53,.18)" : "transparent", textDecoration: "none", border: `1px solid ${active ? "rgba(192,132,53,.25)" : "transparent"}` }}>
                <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,.25)", padding: "0 1rem", marginBottom: "0.6rem", marginTop: "1.5rem" }}>Navigation</div>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1rem", borderRadius: 10, fontSize: "0.83rem", fontWeight: 400, color: "rgba(255,255,255,.45)", textDecoration: "none" }}>
            <span>🌍</span> Voir le site
          </Link>
          <button onClick={signOut} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1rem", borderRadius: 10, width: "100%", fontSize: "0.83rem", fontWeight: 400, color: "rgba(255,120,80,.7)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <span>🚪</span> Déconnexion
          </button>
        </nav>

        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #C08435, #E09B48)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.85rem", fontWeight: 900, color: "#fff", flexShrink: 0 }}>
            {profile?.full_name?.[0]?.toUpperCase() || "A"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.full_name || "Administrateur"}</div>
            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,.3)" }}>{profile?.role || "admin"}</div>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: 260, minHeight: "100vh" }}>{children}</main>
    </div>
  );
}
