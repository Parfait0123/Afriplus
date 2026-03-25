"use client";

/**
 * app/admin/utilisateurs/page.tsx
 * Gestion avancée des utilisateurs — version modernisée
 * Fonctionnalités :
 * - Liste avec actions bulk (changement de rôle, suppression, bannissement)
 * - Analyse : répartition pays/domaine, évolution inscriptions (période personnalisable)
 * - Vue détail d'un utilisateur (modale moderne avec onglets, export JSON)
 * - Confirmation par mot de passe pour les actions critiques
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/* ── Types ── */
type Role = "admin" | "editor" | "reader";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  country: string | null;
  domain: string | null;
  banned: boolean;
  created_at: string;
}

interface SaveActivity {
  id: string;
  content_type: "article" | "scholarship" | "opportunity" | "event";
  content_title: string | null;
  content_slug: string;
  created_at: string;
}

interface ApplicationActivity {
  id: string;
  content_type: "scholarship" | "opportunity";
  content_title: string | null;
  content_slug: string;
  status: string;
  created_at: string;
}

interface RegistrationActivity {
  id: string;
  event_slug: string;
  event_title: string | null;
  event_date: string | null;
  created_at: string;
}

const ROLES: { value: Role; label: string; color: string }[] = [
  { value: "admin", label: "Admin", color: "#B8341E" },
  { value: "editor", label: "Éditeur", color: "#C08435" },
  { value: "reader", label: "Lecteur", color: "#1A5C40" },
];

const PAGE_SIZE = 20;

/* ── Icônes SVG ── */
const IcoSearch = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const IcoRefresh = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.78"/></svg>);
const IcoPlus = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const IcoEdit = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const IcoEye = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const IcoTrash = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>);
const IcoChevronDown = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>);
const IcoClose = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const IcoBan = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>);
const IcoUnban = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>);
const IcoDownload = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);

/* ── Composants réutilisables ── */
const Spinner = () => (
  <div style={{ textAlign: "center", padding: "4rem 0" }}>
    <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(20,20,16,.08)", borderTopColor: "#C08435", animation: "aev-spin .8s linear infinite", margin: "0 auto 1rem" }} />
    <p style={{ color: "#928E80", fontSize: ".8rem" }}>Chargement…</p>
  </div>
);

function AvatarThumb({ url, name }: { url: string | null; name: string | null }) {
  if (url) return <img src={url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #C08435, #E09B48)" }}>
      {initial}
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percent = (value / max) * 100;
  return (
    <div style={{ background: "rgba(20,20,16,.08)", borderRadius: 6, overflow: "hidden", height: 6 }}>
      <div style={{ width: `${percent}%`, background: color, height: "100%", transition: "width .3s" }} />
    </div>
  );
}

/* ── Modale de confirmation par mot de passe ── */
function PasswordConfirmModal({ isOpen, onClose, onConfirm, title, message, actionLabel }: { isOpen: boolean; onClose: () => void; onConfirm: (password: string) => Promise<void>; title: string; message: string; actionLabel: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirm = async () => {
    if (!password) { setError("Mot de passe requis"); return; }
    setLoading(true);
    setError("");
    try {
      await onConfirm(password);
      setPassword("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="aev-modal-overlay" onClick={onClose}>
      <div className="aev-pwd-modal" onClick={e => e.stopPropagation()}>
        <div className="aev-modal-header">
          <div className="aev-modal-title">{title}</div>
          <button className="aev-modal-close" onClick={onClose}><IcoClose /></button>
        </div>
        <p className="aev-modal-desc">{message}</p>
        <div className="aev-pwd-field">
          <label>Mot de passe administrateur</label>
          <input
    type="email"
    name="fake-email"
    autoComplete="email"
    style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
  />
  <input
    type="password"
    name="fake-password"
    autoComplete="current-password"
    style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
  />
          <div className="aev-pwd-input-wrapper">
            <input type={showPassword ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" autoFocus   autoComplete="new-password"
  name="new-password"/>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="aev-pwd-toggle">
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {error && <div className="aev-pwd-error">{error}</div>}
        </div>
        <div className="aev-modal-actions">
          <button className="aev-btn aev-btn-ghost" onClick={onClose}>Annuler</button>
          <button className="aev-btn aev-btn-danger" onClick={handleConfirm} disabled={loading}>
            {loading ? "Vérification..." : actionLabel}
          </button>
        </div>
      </div>
      <style jsx>{`
        .aev-pwd-modal {
          background: #fff;
          border-radius: 24px;
          padding: 2rem;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 24px 64px rgba(20,20,16,.18);
        }
        .aev-modal-desc {
          font-size: .82rem;
          color: #928E80;
          line-height: 1.65;
          margin-bottom: 1.5rem;
        }
        .aev-pwd-field label {
          font-size: .6rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #928E80;
          display: block;
          margin-bottom: .45rem;
        }
        .aev-pwd-input-wrapper {
          position: relative;
        }
        .aev-pwd-input-wrapper input {
          width: 100%;
          padding: .7rem 3rem .7rem 1rem;
          border-radius: 12px;
          font-size: .88rem;
          border: 1.5px solid rgba(20,20,16,.14);
          background: #F8F6F1;
          outline: none;
        }
        .aev-pwd-toggle {
          position: absolute;
          right: .85rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #928E80;
        }
        .aev-pwd-error {
          margin-top: .45rem;
          font-size: .72rem;
          color: #B8341E;
        }
        .aev-modal-actions {
          display: flex;
          gap: .75rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function AdminUtilisateursPage() {
  const sb = createClient();
  const { profile: currentUser, loading: authLoading } = useAuth();

  // États généraux
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"Tout" | Role>("Tout");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [tab, setTab] = useState<"list" | "analytics">("list");

  // États pour les analyses
  const [topCountries, setTopCountries] = useState<{ country: string; count: number }[]>([]);
  const [topDomains, setTopDomains] = useState<{ domain: string; count: number }[]>([]);
  const [monthlySignups, setMonthlySignups] = useState<{ month: string; count: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [signupsStartDate, setSignupsStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 11); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [signupsEndDate, setSignupsEndDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // Modal détail utilisateur
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userSaves, setUserSaves] = useState<SaveActivity[]>([]);
  const [userApplications, setUserApplications] = useState<ApplicationActivity[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<RegistrationActivity[]>([]);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [userDetailTab, setUserDetailTab] = useState<"profile" | "saves" | "applications" | "events">("profile");
  const [userMonthlyActivity, setUserMonthlyActivity] = useState<{ month: string; saves: number; apps: number; regs: number }[]>([]);

  // Modale mot de passe
  const [pwdModal, setPwdModal] = useState<{ action: "delete" | "ban" | "bulkDelete" | "bulkBan" | "changeRole" | "bulkChangeRole"; userId?: string; userIds?: string[]; newBanState?: boolean; newRole?: Role } | null>(null);
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Chargement des utilisateurs (liste) ── */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      let query = sb
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
      }
      if (filterRole !== "Tout") {
        query = query.eq("role", filterRole);
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = page * PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (!error && data) {
        setUsers(data as any as Profile[]);
        setTotal(count ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [sb, search, filterRole, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /* ── Chargement des analyses ── */
  const loadAnalytics = useCallback(async () => {
    // Répartition par pays
    const { data: countries } = await sb
      .from("profiles")
      .select("country")
      .not("country", "is", null)
      .not("country", "eq", "");
    if (countries) {
      const counts = countries.reduce((acc: Record<string, number>, { country }) => {
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});
      const sorted = Object.entries(counts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setTopCountries(sorted);
    }

    // Répartition par domaine
    const { data: domains } = await sb
      .from("profiles")
      .select("domain")
      .not("domain", "is", null)
      .not("domain", "eq", "");
    if (domains) {
      const counts = domains.reduce((acc: Record<string, number>, { domain }) => {
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      }, {});
      const sorted = Object.entries(counts)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setTopDomains(sorted);
    }

    // Évolution mensuelle des inscriptions (période personnalisable)
    if (signupsStartDate && signupsEndDate) {
      const { data: signups } = await sb
        .from("profiles")
        .select("created_at")
        .gte("created_at", signupsStartDate)
        .lt("created_at", signupsEndDate);
      if (signups) {
        const months: Record<string, number> = {};
        const start = new Date(signupsStartDate);
        const end = new Date(signupsEndDate);
        let current = new Date(start.getFullYear(), start.getMonth(), 1);
        while (current < end) {
          const key = current.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
          months[key] = 0;
          current.setMonth(current.getMonth() + 1);
        }
        (signups as any[]).forEach(({ created_at }) => {
          const d = new Date(created_at);
          const key = d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
          if (months[key] !== undefined) months[key]++;
        });
        const sortedMonths = Object.entries(months)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
        setMonthlySignups(sortedMonths);
      }
    }

    // Activité récente : union des saves, applications, event_registrations (limite 20)
    const { data: saves } = await sb
      .from("saves")
      .select("id, content_type, content_title, content_slug, created_at, user_id, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(10);
    const { data: apps } = await sb
      .from("applications")
      .select("id, content_type, content_title, content_slug, status, created_at, user_id, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(10);
    const { data: regs } = await sb
      .from("event_registrations")
      .select("id, event_slug, event_title, event_date, created_at, user_id, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(10);
    const activities = [
      ...(saves?.map(s => ({ ...(s as any), type: "save" })) || []),
      ...(apps?.map(a => ({ ...(a as any), type: "application" })) || []),
      ...(regs?.map(r => ({ ...(r as any), type: "registration" })) || []),
    ];
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setRecentActivity(activities.slice(0, 15));
  }, [sb, signupsStartDate, signupsEndDate]);

  useEffect(() => {
    if (tab === "analytics") loadAnalytics();
  }, [tab, loadAnalytics]);

  /* ── Vérification mot de passe ── */
  const verifyPassword = async (password: string): Promise<void> => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("Non authentifié");
    const { error } = await sb.auth.signInWithPassword({ email: user.email!, password });
    if (error) throw new Error("Mot de passe incorrect");
  };

  const executeWithPassword = async (action: () => Promise<void>, actionName: string) => {
    try {
      await action();
      showToast(`${actionName} effectué avec succès.`);
    } catch (err: any) {
      showToast(err.message || "Erreur", false);
    }
  };

  /* ── Actions individuelles avec mot de passe ── */
  const changeRole = async (userId: string, newRole: Role) => {
    if (userId === currentUser?.id) { showToast("Vous ne pouvez pas modifier votre propre rôle.", false); return; }
    setPwdModal({ action: "changeRole", userId, newRole });
  };
  const confirmChangeRole = async (password: string, userId: string, newRole: Role) => {
    await verifyPassword(password);
    const { error } = await (sb.from("profiles") as any).update({ role: newRole }).eq("id", userId);
    if (error) throw error;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const banUser = async (userId: string, ban: boolean) => {
    if (userId === currentUser?.id) { showToast("Vous ne pouvez pas vous bannir vous-même.", false); return; }
    setPwdModal({ action: "ban", userId, newBanState: ban });
  };
  const confirmBan = async (password: string, userId: string, ban: boolean) => {
    await verifyPassword(password);
    const { error } = await (sb.from("profiles") as any).update({ banned: ban }).eq("id", userId);
    if (error) throw error;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: ban } : u));
  };

  const deleteUser = async (userId: string) => {
    if (userId === currentUser?.id) { showToast("Vous ne pouvez pas vous supprimer vous-même.", false); return; }
    setPwdModal({ action: "delete", userId });
  };
  const confirmDelete = async (password: string, userId: string) => {
    await verifyPassword(password);
    const { error } = await (sb.from("profiles") as any).delete().eq("id", userId);
    if (error) throw error;
    setUsers(prev => prev.filter(u => u.id !== userId));
    setTotal(t => t - 1);
  };

  /* ── Actions bulk avec mot de passe ── */
  const bulkChangeRole = async (userIds: string[], newRole: Role) => {
    if (userIds.some(id => id === currentUser?.id)) { showToast("Vous ne pouvez pas modifier votre propre rôle.", false); return; }
    setPwdModal({ action: "bulkChangeRole", userIds, newRole });
  };
  const confirmBulkChangeRole = async (password: string, userIds: string[], newRole: Role) => {
    await verifyPassword(password);
    const { error } = await (sb.from("profiles") as any).update({ role: newRole }).in("id", userIds);
    if (error) throw error;
    setUsers(prev => prev.map(u => userIds.includes(u.id) ? { ...u, role: newRole } : u));
    setSelected(new Set());
    showToast(`${userIds.length} utilisateur(s) modifié(s) en ${ROLES.find(r => r.value === newRole)?.label}.`);
  };

  const bulkBan = async (userIds: string[], ban: boolean) => {
    setPwdModal({ action: "bulkBan", userIds, newBanState: ban });
  };
  const confirmBulkBan = async (password: string, userIds: string[], ban: boolean) => {
    await verifyPassword(password);
    const { error } = await (sb.from("profiles") as any).update({ banned: ban }).in("id", userIds);
    if (error) throw error;
    setUsers(prev => prev.map(u => userIds.includes(u.id) ? { ...u, banned: ban } : u));
    setSelected(new Set());
  };

  const bulkDelete = async (userIds: string[]) => {
    setPwdModal({ action: "bulkDelete", userIds });
  };
  const confirmBulkDelete = async (password: string, userIds: string[]) => {
    await verifyPassword(password);
    const { error } = await (sb.from("profiles") as any).delete().in("id", userIds);
    if (error) throw error;
    setUsers(prev => prev.filter(u => !userIds.includes(u.id)));
    setTotal(t => t - userIds.length);
    setSelected(new Set());
  };

  /* ── Détails utilisateur ── */
  const loadUserDetails = async (userId: string) => {
    setLoadingUserDetails(true);
    try {
      const [savesRes, appsRes, regsRes] = await Promise.all([
        sb.from("saves").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
        sb.from("applications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
        sb.from("event_registrations").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      ]);
      setUserSaves(savesRes.data as any as SaveActivity[] || []);
      setUserApplications(appsRes.data as any as ApplicationActivity[] || []);
      setUserRegistrations(regsRes.data as any as RegistrationActivity[] || []);

      // Évolution mensuelle des activités
      const startDate = new Date(); startDate.setMonth(startDate.getMonth() - 11); startDate.setDate(1);
      const endDate = new Date(); endDate.setDate(endDate.getDate() + 1);
      const months: Record<string, { saves: number; apps: number; regs: number }> = {};
      let current = new Date(startDate);
      while (current < endDate) {
        const key = current.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
        months[key] = { saves: 0, apps: 0, regs: 0 };
        current.setMonth(current.getMonth() + 1);
      }
      savesRes.data?.forEach((s: any) => {
        const d = new Date(s.created_at);
        const key = d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
        if (months[key]) months[key].saves++;
      });
      appsRes.data?.forEach((a: any) => {
        const d = new Date(a.created_at);
        const key = d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
        if (months[key]) months[key].apps++;
      });
      regsRes.data?.forEach((r: any) => {
        const d = new Date(r.created_at);
        const key = d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
        if (months[key]) months[key].regs++;
      });
      const activity = Object.entries(months)
        .map(([month, counts]) => ({ month, ...counts }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
      setUserMonthlyActivity(activity);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const openUserModal = (user: Profile) => {
    setSelectedUser(user);
    setUserDetailTab("profile");
    loadUserDetails(user.id);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserSaves([]);
    setUserApplications([]);
    setUserRegistrations([]);
  };

  const exportUserData = () => {
    if (!selectedUser) return;
    const data = {
      profile: selectedUser,
      saves: userSaves,
      applications: userApplications,
      registrations: userRegistrations,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `utilisateur_${selectedUser.id}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Données exportées");
  };

  /* ── Utilitaires ── */
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === users.length) setSelected(new Set());
    else setSelected(new Set(users.map(u => u.id)));
  };
  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  const formatDateTime = (d: string) => new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === "admin").length;
  const totalEditors = users.filter(u => u.role === "editor").length;
  const totalReaders = users.filter(u => u.role === "reader").length;

  // Gestionnaire pour la modal de mot de passe
  const handlePasswordConfirm = async (password: string) => {
    if (!pwdModal) return;
    const { action, userId, userIds, newBanState, newRole } = pwdModal;
    try {
      await verifyPassword(password);
      if (action === "delete" && userId) await confirmDelete(password, userId);
      else if (action === "ban" && userId && newBanState !== undefined) await confirmBan(password, userId, newBanState);
      else if (action === "changeRole" && userId && newRole) await confirmChangeRole(password, userId, newRole);
      else if (action === "bulkDelete" && userIds) await confirmBulkDelete(password, userIds);
      else if (action === "bulkBan" && userIds && newBanState !== undefined) await confirmBulkBan(password, userIds, newBanState);
      else if (action === "bulkChangeRole" && userIds && newRole) await confirmBulkChangeRole(password, userIds, newRole);
      else throw new Error("Action non reconnue");
      setPwdModal(null);
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <>
      <style>{`
        .aev-wrap { max-width: 1380px; margin: 0 auto; padding: 0 clamp(1rem,3vw,2.5rem); }
        .aev-btn {
          display:inline-flex; align-items:center; gap:.4rem;
          padding:.55rem 1.1rem; border-radius:10px; border:none; cursor:pointer;
          font-size:.72rem; font-weight:700; letter-spacing:.04em; transition:all .18s;
        }
        .aev-btn:disabled { opacity:.5; cursor:not-allowed; }
        .aev-btn-primary { background:#141410; color:#F8F6F1; }
        .aev-btn-primary:hover:not(:disabled) { background:#2a2a20; }
        .aev-btn-ghost {
          background:transparent; color:#928E80;
          border:1px solid rgba(20,20,16,.12);
        }
        .aev-btn-ghost:hover:not(:disabled) { background:rgba(20,20,16,.05); color:#38382E; }
        .aev-btn-danger { background:#FAEBE8; color:#B8341E; }
        .aev-btn-danger:hover:not(:disabled) { background:#f5d5cf; }
        .aev-input {
          width:100%; padding:.6rem .9rem; border-radius:10px;
          border:1px solid rgba(20,20,16,.12); background:#fff;
          font-size:.8rem; color:#38382E; outline:none;
          transition:border .18s;
        }
        .aev-input:focus { border-color:#C08435; }
        .aev-select {
          padding:.55rem .85rem; border-radius:10px;
          border:1px solid rgba(20,20,16,.12); background:#fff;
          font-size:.75rem; color:#38382E; outline:none; cursor:pointer;
          transition:border .18s;
        }
        .aev-select:focus { border-color:#C08435; }
        .aev-table-wrap {
          background:#fff; border-radius:16px;
          border:1px solid rgba(20,20,16,.08);
          overflow:auto;
          box-shadow:0 2px 24px rgba(20,20,16,.05);
        }
        .aev-table { width:100%; border-collapse:collapse; min-width:800px; }
        .aev-th {
          padding:.75rem 1rem; text-align:left;
          font-size:.58rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase;
          color:#928E80; background:#FAFAF8;
          border-bottom:1px solid rgba(20,20,16,.07);
          white-space:nowrap;
        }
        .aev-td {
          padding:.85rem 1rem; vertical-align:middle;
          border-bottom:1px solid rgba(20,20,16,.055);
          font-size:.78rem; color:#38382E;
        }
        .aev-row { transition:background .15s; cursor:pointer; }
        .aev-row:hover { background:#FAFAF8; }
        .aev-row:last-child .aev-td { border-bottom:none; }
        .aev-action-btn {
          display:inline-flex; align-items:center; justify-content:center;
          width:30px; height:30px; border-radius:8px; border:1px solid rgba(20,20,16,.1);
          background:transparent; cursor:pointer; transition:all .18s; color:#928E80;
        }
        .aev-action-btn:hover { background:rgba(20,20,16,.06); color:#38382E; }
        .aev-action-btn:disabled { opacity:.4; cursor:not-allowed; }
        .aev-page-btn {
          display:inline-flex; align-items:center; justify-content:center;
          min-width:32px; height:32px; padding:0 .4rem; border-radius:8px;
          border:1px solid rgba(20,20,16,.12); background:transparent;
          font-size:.72rem; font-weight:600; color:#38382E; cursor:pointer;
          transition:all .15s;
        }
        .aev-page-btn:hover { background:rgba(20,20,16,.06); }
        .aev-page-btn.active { background:#141410; color:#fff; border-color:#141410; }
        .aev-page-btn:disabled { opacity:.35; cursor:not-allowed; }
        .aev-stat-card {
          background:#fff; border-radius:14px; padding:1.5rem;
          border:1px solid rgba(20,20,16,.08); flex:1;
          box-shadow:0 1px 8px rgba(20,20,16,.04);
        }
        .aev-empty {
          text-align:center; padding:5rem 2rem;
        }
        .aev-spinner {
          width:36px; height:36px; border-radius:50%;
          border:3px solid rgba(20,20,16,.08); border-top-color:#C08435;
          animation:aev-spin .8s linear infinite; margin:0 auto 1rem;
        }
        @keyframes aev-spin { to { transform:rotate(360deg); } }
        .aev-gradient-thumb {
          width:44px; height:44px; border-radius:10px; flex-shrink:0;
          overflow:hidden; position:relative;
        }
        .aev-tabs {
          display:flex; gap:0; margin:1rem 0 1.5rem;
          border-bottom:1px solid rgba(20,20,16,.1);
        }
        .aev-tab {
          padding:.6rem 1.2rem; font-size:.78rem; font-weight:600;
          color:#928E80; cursor:pointer; border-bottom:2px solid transparent;
          transition:all .15s;
        }
        .aev-tab.active {
          color:#141410; border-bottom-color:#C08435;
        }
        .aev-bulk-bar {
          background:#141410; border-radius:12px; padding:.85rem 1.4rem;
          margin-bottom:1rem; display:flex; align-items:center; gap:1rem;
          box-shadow:0 4px 16px rgba(20,20,16,.2);
        }
        .aev-bulk-count { font-size:.78rem; font-weight:700; color:#C08435; }
        .aev-bulk-divider { width:1px; height:18px; background:rgba(255,255,255,.1); }
        .aev-bulk-btn {
          font-family:inherit; font-size:.75rem; font-weight:600; padding:.38rem .85rem;
          border-radius:100px; cursor:pointer; border:none;
        }
        .aev-bulk-cancel {
          margin-left:auto; background:none; border:none; font-size:.72rem;
          color:rgba(255,255,255,.4); cursor:pointer;
        }
        .aev-modal-overlay {
          position:fixed; inset:0; background:rgba(20,20,16,.6);
          backdrop-filter:blur(4px); z-index:9900; display:flex;
          align-items:center; justify-content:center; padding:1rem;
        }
        .aev-modal {
          background:#fff; border-radius:24px; padding:2rem;
          max-width:800px; width:100%; max-height:90vh; overflow-y:auto;
          box-shadow:0 24px 64px rgba(20,20,16,.18);
          animation:aev-modal-in .22s cubic-bezier(.34,1.56,.64,1);
        }
        .aev-modal-header {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:1.2rem; padding-bottom:.8rem; border-bottom:1px solid rgba(20,20,16,.08);
        }
        .aev-modal-title {
          font-family:'Fraunces',Georgia,serif; font-size:1.2rem; font-weight:900;
          color:#141410;
        }
        .aev-modal-close {
          background:none; border:none; cursor:pointer; color:#928E80;
        }
        .aev-section-title {
          font-size:.7rem; font-weight:800; letter-spacing:.1em;
          text-transform:uppercase; color:#928E80; margin:1.2rem 0 .6rem;
        }
        .aev-user-tabs {
          display:flex; gap:.5rem; border-bottom:1px solid rgba(20,20,16,.1);
          margin-bottom:1rem;
        }
        .aev-user-tab {
          padding:.5rem 1rem; font-size:.7rem; font-weight:600;
          color:#928E80; cursor:pointer; border-bottom:2px solid transparent;
        }
        .aev-user-tab.active {
          color:#C08435; border-bottom-color:#C08435;
        }
        .aev-activity-grid {
          display:grid; grid-template-columns:repeat(3,1fr); gap:1rem;
          margin-bottom:1rem;
        }
        .aev-activity-card {
          background:#F8F6F1; border-radius:12px; padding:.75rem;
          text-align:center;
        }
        .aev-activity-number {
          font-size:1.4rem; font-weight:900; font-family:'Fraunces',Georgia,serif;
        }
        .aev-activity-label {
          font-size:.6rem; color:#928E80;
        }
        @keyframes aev-modal-in {
          from { opacity:0; transform:scale(.94) translateY(8px); }
          to   { opacity:1; transform:none; }
        }
        @media(max-width:900px) {
          .aev-col-hide { display:none; }
          .aev-col-hide-md { display:none; }
        }
        @media(max-width:600px) {
          .aev-col-hide-sm { display:none; }
        }
      `}</style>

      <div style={{ background: "#F5F3EE", minHeight: "100vh", paddingBottom: "4rem" }}>
        {/* ── En-tête ── */}
        <div style={{ background: "#141410", borderBottom: "3px solid #C08435", padding: "2rem 0 1.75rem" }}>
          <div className="aev-wrap">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: ".5rem" }}>
                  <Link href="/admin" style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(248,246,241,.35)", textDecoration: "none", transition: "color .2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(248,246,241,.7)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248,246,241,.35)")}>Admin</Link>
                  <span style={{ color: "rgba(248,246,241,.2)" }}>›</span>
                  <span style={{ fontSize: ".6rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#C08435" }}>Utilisateurs</span>
                </div>
                <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 900, color: "#F8F6F1", letterSpacing: "-0.03em", margin: 0 }}>
                  Gestion des Utilisateurs
                </h1>
                <p style={{ fontSize: ".75rem", color: "rgba(248,246,241,.4)", marginTop: ".35rem" }}>
                  {total} utilisateur{total !== 1 ? "s" : ""} au total
                </p>
              </div>
              <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
                <button className="aev-btn aev-btn-ghost" style={{ color: "rgba(248,246,241,.6)", borderColor: "rgba(248,246,241,.15)" }} onClick={() => loadUsers()}>
                  <IcoRefresh /> Actualiser
                </button>
              </div>
            </div>
            {/* Stats rapides */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
              {[
                { label: "Total", value: totalUsers, color: "#F8F6F1", sub: "utilisateurs" },
                { label: "Admins", value: totalAdmins, color: "#B8341E", sub: "superviseurs" },
                { label: "Éditeurs", value: totalEditors, color: "#C08435", sub: "rédacteurs" },
                { label: "Lecteurs", value: totalReaders, color: "#1A5C40", sub: "abonnés" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(248,246,241,.06)", border: "1px solid rgba(248,246,241,.1)", borderRadius: 12, padding: ".75rem 1.25rem" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: s.color, fontFamily: "'Fraunces', Georgia, serif", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: ".58rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(248,246,241,.35)", marginTop: ".2rem" }}>{s.label} · {s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Barre de filtres (uniquement pour l'onglet liste) ── */}
        <div style={{ background: "#fff", borderBottom: "1px solid rgba(20,20,16,.07)", padding: "1rem 0", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 12px rgba(20,20,16,.05)" }}>
          <div className="aev-wrap">
            <div className="aev-tabs">
              <div className={`aev-tab ${tab === "list" ? "active" : ""}`} onClick={() => setTab("list")}>Liste des utilisateurs</div>
              <div className={`aev-tab ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>Analyse & activité</div>
            </div>

            {tab === "list" && (
              <div style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1", minWidth: "220px", maxWidth: "380px" }}>
                  <span style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: "#928E80", pointerEvents: "none" }}><IcoSearch /></span>
                  <input className="aev-input" style={{ paddingLeft: "2.2rem" }} placeholder="Rechercher par nom ou email" value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }} autoComplete="off" name="search-query" />
                </div>
                <select className="aev-select" value={filterRole} onChange={(e) => { setFilterRole(e.target.value as typeof filterRole); setPage(1); }}>
                  <option value="Tout">Tous les rôles</option>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                {(search || filterRole !== "Tout") && (
                  <button className="aev-btn aev-btn-ghost" onClick={() => { setSearch(""); setFilterRole("Tout"); setPage(1); }}>✕ Réinitialiser</button>
                )}
                <div style={{ marginLeft: "auto", fontSize: ".72rem", color: "#928E80", whiteSpace: "nowrap" }}>{total} résultat{total !== 1 ? "s" : ""}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Contenu selon onglet ── */}
        <div className="aev-wrap" style={{ paddingTop: "1.75rem" }}>
          {tab === "list" && (
            <>
              {/* Barre d'actions bulk */}
              {selected.size > 0 && (
                <div className="aev-bulk-bar">
                  <span className="aev-bulk-count">{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</span>
                  <div className="aev-bulk-divider" />
                  <button className="aev-bulk-btn" onClick={() => bulkChangeRole(Array.from(selected), "admin")} style={{ background: "rgba(184,52,30,.12)", color: "#B8341E" }}>Admin</button>
                  <button className="aev-bulk-btn" onClick={() => bulkChangeRole(Array.from(selected), "editor")} style={{ background: "rgba(192,132,53,.12)", color: "#C08435" }}>Éditeur</button>
                  <button className="aev-bulk-btn" onClick={() => bulkChangeRole(Array.from(selected), "reader")} style={{ background: "rgba(26,92,64,.12)", color: "#1A5C40" }}>Lecteur</button>
                  <button className="aev-bulk-btn" onClick={() => bulkBan(Array.from(selected), true)} style={{ background: "rgba(184,52,30,.12)", color: "#B8341E" }}>Bannir</button>
                  <button className="aev-bulk-btn" onClick={() => bulkBan(Array.from(selected), false)} style={{ background: "rgba(26,92,64,.12)", color: "#1A5C40" }}>Débannir</button>
                  <button className="aev-bulk-btn" onClick={() => bulkDelete(Array.from(selected))} style={{ background: "rgba(184,52,30,.12)", color: "#B8341E" }}>Supprimer</button>
                  <button className="aev-bulk-cancel" onClick={() => setSelected(new Set())}>Annuler</button>
                </div>
              )}

              {loading ? (
                <Spinner />
              ) : users.length === 0 ? (
                <div className="aev-empty">
                  <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "3rem", color: "rgba(20,20,16,.1)", marginBottom: ".5rem" }}>👥</div>
                  <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.4rem", color: "rgba(20,20,16,.2)", fontWeight: 900 }}>Aucun utilisateur trouvé</p>
                  <p style={{ color: "#928E80", fontSize: ".8rem", marginTop: ".4rem" }}>{search || filterRole !== "Tout" ? "Essayez de modifier vos filtres." : "Aucun utilisateur n'est encore inscrit."}</p>
                </div>
              ) : (
                <div className="aev-table-wrap">
                  <table className="aev-table">
                    <thead>
                      <tr>
                        <th className="aev-th" style={{ width: 40 }}><input type="checkbox" checked={selected.size === users.length && users.length > 0}
                          ref={el => { if (el) el.indeterminate = selected.size > 0 && selected.size < users.length; }}
                          onChange={toggleAll} style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#C08435" }} /></th>
                        <th className="aev-th" style={{ width: 52 }}></th>
                        <th className="aev-th">Utilisateur</th>
                        <th className="aev-th aev-col-hide">Email</th>
                        <th className="aev-th">Rôle</th>
                        <th className="aev-th aev-col-hide-md">Statut</th>
                        <th className="aev-th aev-col-hide-md">Pays</th>
                        <th className="aev-th aev-col-hide">Domaine</th>
                        <th className="aev-th aev-col-hide-md">Inscrit le</th>
                        <th className="aev-th" style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const isSelf = user.id === currentUser?.id;
                        const isUpdating = updating === user.id;
                        const isDeleting = deleting === user.id;
                        const roleColor = ROLES.find(r => r.value === user.role)?.color || "#928E80";
                        return (
                          <tr key={user.id} className="aev-row" onClick={() => openUserModal(user)}>
                            <td className="aev-td" onClick={e => e.stopPropagation()}>
                              <input type="checkbox" checked={selected.has(user.id)} onChange={() => toggleSelect(user.id)} style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#C08435" }} />
                            </td>
                            <td className="aev-td" style={{ paddingRight: 0 }}>
                              <div className="aev-gradient-thumb" style={{ background: "linear-gradient(135deg, #C08435, #E09B48)" }}>
                                <AvatarThumb url={user.avatar_url} name={user.full_name} />
                              </div>
                            </td>
                            <td className="aev-td">
                              <div style={{ fontWeight: 700, color: "#141410", fontSize: ".82rem", lineHeight: 1.35 }}>
                                {user.full_name || "—"}
                              </div>
                              <div style={{ fontSize: ".62rem", color: "#928E80", marginTop: ".1rem" }}>ID: {user.id.slice(0, 8)}…</div>
                            </td>
                            <td className="aev-td aev-col-hide">
                              <a href={`mailto:${user.email}`} style={{ color: "#38382E", textDecoration: "none", borderBottom: "1px dotted rgba(20,20,16,.2)" }}>{user.email}</a>
                            </td>
                            <td className="aev-td" onClick={e => e.stopPropagation()}>
                              <select
                                value={user.role}
                                onChange={(e) => changeRole(user.id, e.target.value as Role)}
                                disabled={isSelf || isUpdating}
                                style={{
                                  fontSize: ".7rem", fontWeight: 700, padding: ".3rem .6rem", borderRadius: 100,
                                  border: `1.5px solid ${roleColor}40`, background: `${roleColor}10`, color: roleColor,
                                  cursor: isSelf ? "not-allowed" : "pointer", fontFamily: "inherit", outline: "none", minWidth: "85px"
                                }}
                              >
                                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                              </select>
                              {isSelf && <div style={{ fontSize: ".6rem", color: "#928E80", marginTop: ".2rem" }}>Vous</div>}
                            </td>
                            <td className="aev-td aev-col-hide-md">
                              {user.banned ? (
                                <span style={{ color: "#B8341E", fontWeight: 700, fontSize: ".65rem", background: "#FAEBE8", padding: ".2rem .6rem", borderRadius: 100 }}>Banni</span>
                              ) : (
                                <span style={{ color: "#1A5C40", fontSize: ".65rem", background: "#EAF4EF", padding: ".2rem .6rem", borderRadius: 100 }}>Actif</span>
                              )}
                            </td>
                            <td className="aev-td aev-col-hide-md">{user.country || "—"}</td>
                            <td className="aev-td aev-col-hide">{user.domain || "—"}</td>
                            <td className="aev-td aev-col-hide-md">{formatDate(user.created_at)}</td>
                            <td className="aev-td" style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                              <div style={{ display: "flex", gap: ".4rem", justifyContent: "flex-end" }}>
                                <Link href={`/profil/${user.id}`} target="_blank" rel="noopener noreferrer">
                                  <button className="aev-action-btn" title="Voir le profil public"><IcoEye /></button>
                                </Link>
                                <button className="aev-action-btn" title={user.banned ? "Débannir" : "Bannir"} disabled={isSelf}
                                  onClick={() => banUser(user.id, !user.banned)}
                                  style={{ color: user.banned ? "#1A5C40" : "#B8341E", borderColor: "rgba(184,52,30,.2)", background: "rgba(184,52,30,.05)" }}>
                                  {user.banned ? <IcoUnban /> : <IcoBan />}
                                </button>
                                <button className="aev-action-btn" title="Supprimer" disabled={isSelf || isDeleting} onClick={() => deleteUser(user.id)}
                                  style={{ color: "#B8341E", borderColor: "rgba(184,52,30,.2)", background: "rgba(184,52,30,.05)" }}>
                                  {isDeleting ? <span style={{ width: 10, height: 10, border: "2px solid rgba(184,52,30,.3)", borderTopColor: "#B8341E", borderRadius: "50%", display: "inline-block", animation: "aev-spin .7s linear infinite" }} /> : <IcoTrash />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                  <span style={{ fontSize: ".72rem", color: "#928E80" }}>Page {page} sur {totalPages} — {total} résultat{total !== 1 ? "s" : ""}</span>
                  <div style={{ display: "flex", gap: ".35rem" }}>
                    <button className="aev-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const pg = i + 1;
                      return <button key={pg} className={`aev-page-btn ${page === pg ? "active" : ""}`} onClick={() => setPage(pg)}>{pg}</button>;
                    })}
                    {totalPages > 7 && (
                      <>
                        <span style={{ padding: "0 .2rem", color: "#928E80" }}>…</span>
                        <button className={`aev-page-btn ${page === totalPages ? "active" : ""}`} onClick={() => setPage(totalPages)}>{totalPages}</button>
                      </>
                    )}
                    <button className="aev-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* Répartition par pays */}
              <div className="aev-stat-card">
                <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", fontWeight: 900, marginBottom: "1rem" }}>🌍 Répartition par pays</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                  {topCountries.map(({ country, count }) => {
                    const max = topCountries[0]?.count || 1;
                    return (
                      <div key={country}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", marginBottom: ".2rem" }}>
                          <span>{country}</span>
                          <span style={{ fontWeight: 600 }}>{count}</span>
                        </div>
                        <ProgressBar value={count} max={max} color="#C08435" />
                      </div>
                    );
                  })}
                  {topCountries.length === 0 && <p style={{ color: "#928E80" }}>Aucune donnée pays disponible.</p>}
                </div>
              </div>

              {/* Répartition par domaine */}
              <div className="aev-stat-card">
                <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", fontWeight: 900, marginBottom: "1rem" }}>📚 Domaines d'intérêt</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                  {topDomains.map(({ domain, count }) => {
                    const max = topDomains[0]?.count || 1;
                    return (
                      <div key={domain}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", marginBottom: ".2rem" }}>
                          <span>{domain}</span>
                          <span style={{ fontWeight: 600 }}>{count}</span>
                        </div>
                        <ProgressBar value={count} max={max} color="#1A5C40" />
                      </div>
                    );
                  })}
                  {topDomains.length === 0 && <p style={{ color: "#928E80" }}>Aucune donnée domaine disponible.</p>}
                </div>
              </div>

              {/* Évolution des inscriptions (période personnalisable) */}
              <div className="aev-stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", fontWeight: 900, margin: 0 }}>📈 Inscriptions mensuelles</h3>
                  <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                    <input type="date" value={signupsStartDate} onChange={e => setSignupsStartDate(e.target.value)} className="aev-input" style={{ width: "auto", padding: ".3rem .6rem", fontSize: ".7rem" }} />
                    <span>—</span>
                    <input type="date" value={signupsEndDate} onChange={e => setSignupsEndDate(e.target.value)} className="aev-input" style={{ width: "auto", padding: ".3rem .6rem", fontSize: ".7rem" }} />
                    <button className="aev-btn aev-btn-ghost" onClick={loadAnalytics} style={{ padding: ".3rem .8rem" }}>Appliquer</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "flex-end", height: "160px", marginTop: "1rem" }}>
                  {monthlySignups.map(({ month, count }) => {
                    const max = Math.max(...monthlySignups.map(m => m.count), 1);
                    const height = (count / max) * 140;
                    return (
                      <div key={month} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ background: "#C08435", width: "100%", height: `${height}px`, borderRadius: "4px 4px 0 0", transition: "height .3s" }} />
                        <div style={{ fontSize: ".6rem", marginTop: ".4rem", color: "#928E80", transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>{month}</div>
                      </div>
                    );
                  })}
                </div>
                {monthlySignups.length === 0 && <p style={{ color: "#928E80" }}>Aucune donnée disponible pour cette période.</p>}
              </div>

              {/* Activité récente */}
              <div className="aev-stat-card">
                <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", fontWeight: 900, marginBottom: "1rem" }}>⚡ Activité récente</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {recentActivity.map((act, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px solid rgba(20,20,16,.05)", paddingBottom: ".6rem" }}>
                      <span style={{ fontSize: "1.2rem" }}>
                        {act.type === "save" && "🔖"}
                        {act.type === "application" && "📝"}
                        {act.type === "registration" && "🎫"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: ".78rem", fontWeight: 500 }}>
                          {act.type === "save" && `${act.profiles?.full_name || "Utilisateur"} a sauvegardé "${act.content_title || act.content_slug}"`}
                          {act.type === "application" && `${act.profiles?.full_name || "Utilisateur"} a postulé pour "${act.content_title || act.content_slug}"`}
                          {act.type === "registration" && `${act.profiles?.full_name || "Utilisateur"} s'est inscrit à "${act.event_title || act.event_slug}"`}
                        </div>
                        <div style={{ fontSize: ".6rem", color: "#928E80" }}>{formatDateTime(act.created_at)}</div>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && <p style={{ color: "#928E80" }}>Aucune activité récente.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal détail utilisateur */}
      {selectedUser && (
        <div className="aev-modal-overlay" onClick={closeModal}>
          <div className="aev-modal" onClick={e => e.stopPropagation()}>
            <div className="aev-modal-header">
              <div className="aev-modal-title">{selectedUser.full_name || selectedUser.email}</div>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button className="aev-action-btn" onClick={exportUserData} title="Exporter les données (JSON)"><IcoDownload /></button>
                <button className="aev-modal-close" onClick={closeModal}><IcoClose /></button>
              </div>
            </div>
            <div className="aev-user-tabs">
              <div className={`aev-user-tab ${userDetailTab === "profile" ? "active" : ""}`} onClick={() => setUserDetailTab("profile")}>Profil</div>
              <div className={`aev-user-tab ${userDetailTab === "saves" ? "active" : ""}`} onClick={() => setUserDetailTab("saves")}>Sauvegardes</div>
              <div className={`aev-user-tab ${userDetailTab === "applications" ? "active" : ""}`} onClick={() => setUserDetailTab("applications")}>Candidatures</div>
              <div className={`aev-user-tab ${userDetailTab === "events" ? "active" : ""}`} onClick={() => setUserDetailTab("events")}>Événements</div>
            </div>

            {userDetailTab === "profile" && (
              <div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #C08435, #E09B48)" }}>
                    <AvatarThumb url={selectedUser.avatar_url} name={selectedUser.full_name} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div><strong>Email :</strong> {selectedUser.email}</div>
                    <div><strong>Rôle :</strong> {ROLES.find(r => r.value === selectedUser.role)?.label}</div>
                    <div><strong>Statut :</strong> {selectedUser.banned ? <span style={{ color: "#B8341E" }}>Banni</span> : <span style={{ color: "#1A5C40" }}>Actif</span>}</div>
                    <div><strong>Pays :</strong> {selectedUser.country || "Non renseigné"}</div>
                    <div><strong>Domaine :</strong> {selectedUser.domain || "Non renseigné"}</div>
                    <div><strong>Inscrit le :</strong> {formatDate(selectedUser.created_at)}</div>
                  </div>
                </div>
                <div className="aev-section-title">Activités mensuelles</div>
                {loadingUserDetails ? <Spinner /> : (
                  <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: ".5rem" }}>
                    {userMonthlyActivity.map(({ month, saves, apps, regs }) => (
                      <div key={month} style={{ minWidth: "80px", textAlign: "center" }}>
                        <div style={{ fontSize: ".6rem", color: "#928E80", marginBottom: ".2rem" }}>{month}</div>
                        <div style={{ display: "flex", gap: ".2rem", justifyContent: "center" }}>
                          <span title="Sauvegardes" style={{ background: "#C08435", width: "16px", height: `${Math.max(4, saves * 2)}px`, borderRadius: "2px", display: "inline-block" }} />
                          <span title="Candidatures" style={{ background: "#1A5C40", width: "16px", height: `${Math.max(4, apps * 2)}px`, borderRadius: "2px", display: "inline-block" }} />
                          <span title="Inscriptions" style={{ background: "#1E4DA8", width: "16px", height: `${Math.max(4, regs * 2)}px`, borderRadius: "2px", display: "inline-block" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {userDetailTab === "saves" && (
              loadingUserDetails ? <Spinner /> : userSaves.length === 0 ? <p style={{ color: "#928E80" }}>Aucune sauvegarde.</p> : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {userSaves.map(save => (
                    <li key={save.id} style={{ padding: ".4rem 0", borderBottom: "1px solid rgba(20,20,16,.05)" }}>
                      <Link href={`/${save.content_type}s/${save.content_slug}`} style={{ textDecoration: "none", color: "#141410" }}>
                        {save.content_title || save.content_slug} — <span style={{ fontSize: ".7rem", color: "#928E80" }}>{formatDate(save.created_at)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            )}

            {userDetailTab === "applications" && (
              loadingUserDetails ? <Spinner /> : userApplications.length === 0 ? <p style={{ color: "#928E80" }}>Aucune candidature.</p> : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {userApplications.map(app => (
                    <li key={app.id} style={{ padding: ".4rem 0", borderBottom: "1px solid rgba(20,20,16,.05)" }}>
                      <Link href={`/${app.content_type}s/${app.content_slug}`} style={{ textDecoration: "none", color: "#141410" }}>
                        {app.content_title || app.content_slug} — <span style={{ fontSize: ".7rem", color: "#928E80" }}>{app.status} · {formatDate(app.created_at)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            )}

            {userDetailTab === "events" && (
              loadingUserDetails ? <Spinner /> : userRegistrations.length === 0 ? <p style={{ color: "#928E80" }}>Aucune inscription.</p> : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {userRegistrations.map(reg => (
                    <li key={reg.id} style={{ padding: ".4rem 0", borderBottom: "1px solid rgba(20,20,16,.05)" }}>
                      <Link href={`/evenements/${reg.event_slug}`} style={{ textDecoration: "none", color: "#141410" }}>
                        {reg.event_title || reg.event_slug} — <span style={{ fontSize: ".7rem", color: "#928E80" }}>{reg.event_date ? formatDate(reg.event_date) : ""} · {formatDate(reg.created_at)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmation par mot de passe */}
      <PasswordConfirmModal
        isOpen={!!pwdModal}
        onClose={() => setPwdModal(null)}
        onConfirm={handlePasswordConfirm}
        title={
          pwdModal?.action === "delete" ? "Supprimer cet utilisateur ?" :
          pwdModal?.action === "ban" ? (pwdModal.newBanState ? "Bannir cet utilisateur ?" : "Débannir cet utilisateur ?") :
          pwdModal?.action === "changeRole" ? `Changer le rôle en ${ROLES.find(r => r.value === pwdModal.newRole)?.label} ?` :
          pwdModal?.action === "bulkDelete" ? `Supprimer ${pwdModal.userIds?.length} utilisateur(s) ?` :
          pwdModal?.action === "bulkBan" ? (pwdModal.newBanState ? `Bannir ${pwdModal.userIds?.length} utilisateur(s) ?` : `Débannir ${pwdModal.userIds?.length} utilisateur(s) ?`) :
          pwdModal?.action === "bulkChangeRole" ? `Changer le rôle de ${pwdModal.userIds?.length} utilisateur(s) en ${ROLES.find(r => r.value === pwdModal.newRole)?.label} ?` :
          "Confirmation"
        }
        message={
          pwdModal?.action?.includes("delete") ? "Cette action est irréversible. Confirmez votre mot de passe administrateur." :
          "Confirmez votre identité pour effectuer cette action."
        }
        actionLabel="Confirmer"
      />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999,
          background: toast.ok ? "#141410" : "#B8341E", color: "#F8F6F1",
          padding: ".85rem 1.4rem", borderRadius: 12, fontSize: ".82rem", fontWeight: 600,
          boxShadow: "0 8px 32px rgba(20,20,16,.25)",
          animation: "aev-slide-up .25s ease",
        }}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes aev-slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </>
  );
}