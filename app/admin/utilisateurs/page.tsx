"use client";

/**
 * app/admin/utilisateurs/page.tsx
 * Gestion des utilisateurs — lit depuis Supabase profiles.
 * Permet de changer le rôle, voir les stats d'activité.
 */

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";

const sb = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Profile = {
  id:         string;
  email:      string;
  full_name:  string | null;
  role:       string;
  country:    string | null;
  domain:     string | null;
  created_at: string;
  saves_count?:    number;
  apps_count?:     number;
  events_count?:   number;
};

const ROLES = ["reader", "editor", "admin"] as const;
type Role = typeof ROLES[number];

const ROLE_STYLE: Record<Role, { color: string; bg: string; label: string }> = {
  reader: { color: "#928E80", bg: "#F0EDE4",  label: "Lecteur"       },
  editor: { color: "#1E4DA8", bg: "#EBF0FB",  label: "Éditeur"       },
  admin:  { color: "#B8341E", bg: "#FAEBE8",  label: "Administrateur"},
};

export default function AdminUtilisateursPage() {
  const [profiles,  setProfiles]  = useState<Profile[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [roleFilter,setRoleFilter]= useState<"all" | Role>("all");
  const [updating,  setUpdating]  = useState<string | null>(null);
  const [toast,     setToast]     = useState<string | null>(null);

  /* ── Charger les profils avec compteurs ── */
  const load = useCallback(async () => {
    setLoading(true);

    const { data: profs } = await sb
      .from("profiles")
      .select("id, email, full_name, role, country, domain, created_at")
      .order("created_at", { ascending: false });

    if (!profs) { setLoading(false); return; }

    /* Compteurs par user en parallèle */
    const enriched = await Promise.all(profs.map(async p => {
      const [saves, apps, events] = await Promise.all([
        sb.from("saves").select("id", { count: "exact", head: true }).eq("user_id", p.id),
        sb.from("applications").select("id", { count: "exact", head: true }).eq("user_id", p.id),
        sb.from("event_registrations").select("id", { count: "exact", head: true }).eq("user_id", p.id),
      ]);
      return {
        ...p,
        saves_count:  saves.count  ?? 0,
        apps_count:   apps.count   ?? 0,
        events_count: events.count ?? 0,
      } as Profile;
    }));

    setProfiles(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Changer le rôle ── */
  const changeRole = async (userId: string, role: Role) => {
    setUpdating(userId);
    const { error } = await sb.from("profiles").update({ role }).eq("id", userId);
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role } : p));
      showToast(`Rôle mis à jour → ${ROLE_STYLE[role].label}`);
    }
    setUpdating(null);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  /* ── Filtres ── */
  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || (p.full_name ?? "").toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.country ?? "").toLowerCase().includes(q);
    const matchRole   = roleFilter === "all" || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  /* ── Stats globales ── */
  const total   = profiles.length;
  const readers = profiles.filter(p => p.role === "reader").length;
  const editors = profiles.filter(p => p.role === "editor").length;
  const admins  = profiles.filter(p => p.role === "admin").length;

  return (
    <div style={{ padding: "2rem 2rem 4rem" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", background: "#141410", color: "#fff", padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.82rem", fontWeight: 600, zIndex: 999, boxShadow: "0 8px 32px rgba(20,20,16,.3)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ✓ {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "1.9rem", fontWeight: 900, color: "#141410", letterSpacing: "-0.04em", marginBottom: "0.3rem" }}>
          👥 Utilisateurs
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#928E80" }}>{total} comptes enregistrés</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total",          value: total,   color: "#141410", bg: "#F0EDE4" },
          { label: "Lecteurs",       value: readers, color: "#928E80", bg: "#F0EDE4" },
          { label: "Éditeurs",       value: editors, color: "#1E4DA8", bg: "#EBF0FB" },
          { label: "Administrateurs",value: admins,  color: "#B8341E", bg: "#FAEBE8" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 16, padding: "1.1rem 1.25rem", border: "1px solid rgba(20,20,16,.07)" }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: "2rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: "#928E80", marginTop: "0.25rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un utilisateur…"
          style={{ flex: 1, minWidth: 220, padding: "0.6rem 1rem", borderRadius: 10, border: "1.5px solid rgba(20,20,16,.1)", background: "#fff", fontSize: "0.85rem", color: "#141410", fontFamily: "inherit", outline: "none" }}
        />
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {(["all", ...ROLES] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              style={{ padding: "0.5rem 1rem", borderRadius: 100, border: "1.5px solid", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                borderColor: roleFilter === r ? (r === "all" ? "#141410" : ROLE_STYLE[r as Role].color) : "rgba(20,20,16,.12)",
                background:  roleFilter === r ? (r === "all" ? "#141410" : ROLE_STYLE[r as Role].bg) : "transparent",
                color:       roleFilter === r ? (r === "all" ? "#fff" : ROLE_STYLE[r as Role].color) : "#928E80",
              }}>
              {r === "all" ? "Tous" : ROLE_STYLE[r as Role].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden", boxShadow: "0 2px 12px rgba(20,20,16,.05)" }}>

        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 120px 80px 80px 80px 160px", padding: "0.7rem 1.25rem", borderBottom: "1px solid rgba(20,20,16,.07)", background: "#F8F6F1" }}>
          {["Utilisateur", "Localisation", "Rôle actuel", "Sauv.", "Candid.", "Évèn.", "Changer le rôle"].map(h => (
            <div key={h} style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#928E80" }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#928E80", fontSize: "0.85rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>⏳</div>
            Chargement des utilisateurs…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#928E80", fontSize: "0.85rem" }}>
            Aucun utilisateur trouvé.
          </div>
        ) : (
          filtered.map((p, i) => {
            const rs = ROLE_STYLE[p.role as Role] ?? ROLE_STYLE.reader;
            return (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 120px 80px 80px 80px 160px", padding: "0.85rem 1.25rem", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(20,20,16,.06)" : "none", transition: "background .15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#FAFAF8")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

                {/* Identité */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#C08435,#E09B48)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces',serif", fontSize: "0.85rem", fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                    {(p.full_name || p.email).charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#141410", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.full_name || "—"}</div>
                    <div style={{ fontSize: "0.68rem", color: "#928E80", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.email}</div>
                  </div>
                </div>

                {/* Localisation */}
                <div style={{ fontSize: "0.78rem", color: "#928E80" }}>
                  {[p.country, p.domain].filter(Boolean).join(" · ") || "—"}
                </div>

                {/* Rôle badge */}
                <div>
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "0.2rem 0.7rem", borderRadius: 100, background: rs.bg, color: rs.color }}>
                    {rs.label}
                  </span>
                </div>

                {/* Compteurs */}
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#C08435", textAlign: "center" }}>{p.saves_count}</div>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1A5C40", textAlign: "center" }}>{p.apps_count}</div>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1E4DA8", textAlign: "center" }}>{p.events_count}</div>

                {/* Changer le rôle */}
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  {ROLES.map(r => (
                    <button key={r} onClick={() => changeRole(p.id, r)} disabled={p.role === r || updating === p.id}
                      style={{ padding: "0.28rem 0.65rem", borderRadius: 8, border: "1.5px solid", fontSize: "0.62rem", fontWeight: 700, cursor: p.role === r ? "default" : "pointer", fontFamily: "inherit", transition: "all .15s", opacity: updating === p.id ? 0.5 : 1,
                        borderColor: p.role === r ? ROLE_STYLE[r].color : "rgba(20,20,16,.1)",
                        background:  p.role === r ? ROLE_STYLE[r].bg : "transparent",
                        color:       p.role === r ? ROLE_STYLE[r].color : "#928E80",
                      }}>
                      {r === "reader" ? "Lect." : r === "editor" ? "Édit." : "Admin"}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Légende */}
      <div style={{ marginTop: "1.25rem", fontSize: "0.72rem", color: "#928E80", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <span>Sauv. = contenus sauvegardés</span>
        <span>Candid. = candidatures suivies</span>
        <span>Évèn. = inscriptions événements</span>
      </div>
    </div>
  );
}