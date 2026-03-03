"use client";
import { useState } from "react";

const mockSubscribers = [
  { id: "1", email: "kofi.mensah@gmail.com", confirmed: true, created_at: "2026-01-15" },
  { id: "2", email: "fatou.diallo@yahoo.fr", confirmed: true, created_at: "2026-01-18" },
  { id: "3", email: "amina.wanjiku@outlook.com", confirmed: true, created_at: "2026-01-22" },
  { id: "4", email: "emeka.okafor@proton.me", confirmed: false, created_at: "2026-02-01" },
  { id: "5", email: "zara.ndiaye@gmail.com", confirmed: true, created_at: "2026-02-10" },
];

export default function AdminNewsletterPage() {
  const [subscribers] = useState(mockSubscribers);
  const [search, setSearch] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const filtered = subscribers.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()));
  const confirmed = subscribers.filter((s) => s.confirmed).length;

  async function handleSendCampaign(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // TODO: call Resend API to send campaign
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setCampaignSubject("");
    setCampaignBody("");
  }

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.8rem", fontWeight: 900, color: "#141410", letterSpacing: "-0.04em", marginBottom: "0.3rem" }}>Newsletter</h1>
        <p style={{ fontSize: "0.85rem", color: "#928E80" }}>Gérez vos abonnés et envoyez des campagnes via Resend.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.2rem", marginBottom: "2.5rem" }}>
        {[
          { label: "Total abonnés", value: subscribers.length, color: "#C08435", bg: "#FBF4E8" },
          { label: "Confirmés", value: confirmed, color: "#1A5C40", bg: "#EAF4EF" },
          { label: "En attente", value: subscribers.length - confirmed, color: "#C08435", bg: "#FBF4E8" },
          { label: "Taux ouverture", value: "68%", color: "#1E4DA8", bg: "#EBF0FB" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 20, padding: "1.5rem", border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 3px rgba(20,20,16,.04)" }}>
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "#928E80", marginTop: "0.3rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem", alignItems: "start" }}>

        {/* Subscribers list */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#141410" }}>Abonnés</h2>
            <button style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.78rem", fontWeight: 600, padding: "0.45rem 1rem", borderRadius: 100, background: "transparent", border: "1.5px solid rgba(20,20,16,.12)", color: "#38382E", cursor: "pointer" }}>
              ↓ Exporter CSV
            </button>
          </div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un email…"
            style={{ background: "#fff", border: "1.5px solid rgba(20,20,16,.1)", borderRadius: 12, padding: "0.68rem 1.1rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.88rem", color: "#141410", outline: "none", width: "100%", marginBottom: "1rem", boxSizing: "border-box" as const }} />
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,20,16,.07)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px", gap: "1rem", padding: "0.75rem 1.3rem", background: "#F8F6F1", borderBottom: "1px solid rgba(20,20,16,.07)" }}>
              {["Email", "Statut", "Date"].map((h) => (
                <div key={h} style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#928E80" }}>{h}</div>
              ))}
            </div>
            {filtered.map((sub, i) => (
              <div key={sub.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px", gap: "1rem", padding: "0.85rem 1.3rem", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(20,20,16,.06)" : "none" }}>
                <div style={{ fontSize: "0.85rem", color: "#141410", fontWeight: 500 }}>{sub.email}</div>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, background: sub.confirmed ? "#EAF4EF" : "#FBF4E8", color: sub.confirmed ? "#1A5C40" : "#C08435", padding: "0.2rem 0.6rem", borderRadius: 100 }}>
                  {sub.confirmed ? "Confirmé" : "En attente"}
                </span>
                <div style={{ fontSize: "0.75rem", color: "#928E80" }}>{sub.created_at}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Send campaign */}
        <div style={{ background: "#fff", borderRadius: 24, padding: "1.75rem", border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 3px rgba(20,20,16,.04)", position: "sticky", top: "1.5rem" }}>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#141410", marginBottom: "1.5rem" }}>
            Envoyer une campagne
          </h2>
          <div style={{ background: "#FBF4E8", border: "1px solid rgba(192,132,53,.2)", borderRadius: 12, padding: "0.85rem 1rem", fontSize: "0.78rem", color: "#C08435", marginBottom: "1.5rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
            <span style={{ flexShrink: 0 }}>💡</span>
            <span>Connectez votre clé <strong>RESEND_API_KEY</strong> dans <code>.env.local</code> pour activer l&apos;envoi réel.</span>
          </div>
          <form onSubmit={handleSendCampaign} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {sent && <div style={{ background: "#EAF4EF", border: "1px solid rgba(26,92,64,.2)", borderRadius: 12, padding: "0.75rem 1rem", fontSize: "0.83rem", color: "#1A5C40", fontWeight: 600 }}>✓ Campagne envoyée à {confirmed} abonnés !</div>}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#38382E", marginBottom: "0.4rem" }}>Objet de l&apos;email *</label>
              <input type="text" value={campaignSubject} onChange={(e) => setCampaignSubject(e.target.value)} required placeholder="Ex: AfriPulse Newsletter #12 — Mars 2026" style={{ width: "100%", background: "#F8F6F1", border: "1.5px solid rgba(20,20,16,.1)", borderRadius: 10, padding: "0.68rem 0.9rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.87rem", color: "#141410", outline: "none", boxSizing: "border-box" as const }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#38382E", marginBottom: "0.4rem" }}>Corps du message *</label>
              <textarea value={campaignBody} onChange={(e) => setCampaignBody(e.target.value)} required placeholder="Contenu HTML ou texte de votre newsletter…" rows={8}
                style={{ width: "100%", background: "#F8F6F1", border: "1.5px solid rgba(20,20,16,.1)", borderRadius: 10, padding: "0.68rem 0.9rem", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.85rem", color: "#141410", outline: "none", resize: "vertical", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ fontSize: "0.72rem", color: "#928E80" }}>
              Sera envoyé à <strong style={{ color: "#141410" }}>{confirmed}</strong> abonnés confirmés.
            </div>
            <button type="submit" disabled={sending} style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.88rem", fontWeight: 700, padding: "0.75rem", borderRadius: 100, background: sending ? "#928E80" : "#141410", color: "#fff", border: "none", cursor: sending ? "wait" : "pointer" }}>
              {sending ? "Envoi en cours…" : "Envoyer la campagne →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
