"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/* ── Sujets ── */
const SUBJECTS = [
  { value: "partenariat", label: "🤝 Partenariat / Collaboration" },
  { value: "bourse",      label: "🎓 Signaler ou proposer une bourse" },
  { value: "opportunite", label: "💼 Proposer une opportunité" },
  { value: "evenement",   label: "📅 Proposer un événement" },
  { value: "erreur",      label: "⚠️ Signaler une erreur" },
  { value: "presse",      label: "📰 Demande presse / média" },
  { value: "technique",   label: "🔧 Problème technique" },
  { value: "autre",       label: "💬 Autre" },
];

const CONTACT_INFO = [
  { icon: "✉️", label: "Email général", value: "contact@afripulse.com" },
  { icon: "📰", label: "Presse", value: "presse@afripulse.com" },
  { icon: "🤝", label: "Partenariats", value: "partners@afripulse.com" },
  { icon: "📍", label: "Siège", value: "Dakar, Sénégal" },
];

export default function ContactPage() {
  const sb = createClient();

  const [form, setForm] = useState({
    name: "", email: "", subject: "", message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject || !form.message.trim()) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    try {
      const { error } = await (sb.from("contact_messages") as any).insert({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        subject: form.subject,
        message: form.message.trim(),
        created_at: new Date().toISOString(),
        read: false,
      });
      if (error) throw error;
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message ?? "Une erreur est survenue. Réessayez.");
    }
  };

  /* ── Styles partagés ── */
  const inp: React.CSSProperties = {
    width: "100%", padding: ".75rem 1rem", borderRadius: 10,
    border: "1.5px solid rgba(20,20,16,.12)", background: "#F8F6F1",
    fontSize: ".88rem", color: "#141410", fontFamily: "inherit",
    outline: "none", transition: "border-color .18s", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: ".62rem", fontWeight: 700,
    letterSpacing: ".1em", textTransform: "uppercase",
    color: "#928E80", marginBottom: ".4rem",
  };

  return (
    <>
      <Navbar />
      <main style={{ background: "#F0EDE4" }}>

        {/* ── HERO ── */}
        <section style={{
          background: "#141410",
          paddingTop: "clamp(5rem,10vh,8rem)",
          paddingBottom: "4rem",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: .3, pointerEvents: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")" }} />
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(192,132,53,.07)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,4rem)", position: "relative" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: ".5rem",
              fontSize: ".6rem", fontWeight: 800, letterSpacing: ".18em",
              textTransform: "uppercase", color: "#C08435", marginBottom: "1.5rem",
            }}>
              <span style={{ width: 20, height: 1, background: "#C08435", display: "inline-block" }} />
              Nous écrire
            </div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(2.5rem,6vw,4rem)",
              fontWeight: 900, color: "#F8F6F1",
              lineHeight: 1.05, letterSpacing: "-0.04em",
              marginBottom: "1.25rem",
            }}>
              On lit<br />
              <span style={{ color: "#C08435", fontStyle: "italic", fontWeight: 200 }}>
                chaque message.
              </span>
            </h1>
            <p style={{ fontSize: ".95rem", color: "rgba(248,246,241,.55)", maxWidth: 500, lineHeight: 1.75 }}>
              Partenariat, erreur à signaler, bourse à proposer ou simple question — notre équipe vous répond généralement sous 48 heures.
            </p>
          </div>
          <div style={{ height: 3, background: "linear-gradient(90deg,#C08435 0%,#E8B86D 50%,#C08435 100%)", marginTop: "4rem" }} />
        </section>

        {/* ── CORPS ── */}
        <section style={{ padding: "5rem 0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,4rem)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "4rem", alignItems: "start" }}>

              {/* Formulaire */}
              <div>
                {status === "success" ? (
                  <div style={{
                    background: "#EAF4EF", border: "1px solid rgba(26,92,64,.2)",
                    borderRadius: 16, padding: "3rem 2.5rem", textAlign: "center",
                  }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1.25rem" }}>✅</div>
                    <h2 style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: "1.5rem", fontWeight: 900, color: "#141410",
                      marginBottom: ".75rem",
                    }}>
                      Message envoyé !
                    </h2>
                    <p style={{ fontSize: ".88rem", color: "#1A5C40", lineHeight: 1.7, marginBottom: "2rem" }}>
                      Merci de nous avoir écrit. Notre équipe vous répond sous 48 heures ouvrées.
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      style={{
                        padding: ".7rem 2rem", borderRadius: 10, border: "none",
                        background: "#1A5C40", color: "#fff",
                        fontSize: ".82rem", fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={lbl}>Votre nom *</label>
                        <input
                          style={inp} value={form.name}
                          placeholder="Kofi Mensah"
                          onChange={set("name")}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#C08435")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(20,20,16,.12)")}
                        />
                      </div>
                      <div>
                        <label style={lbl}>Adresse e-mail *</label>
                        <input
                          type="email" style={inp} value={form.email}
                          placeholder="vous@exemple.com"
                          onChange={set("email")}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#C08435")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(20,20,16,.12)")}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={lbl}>Sujet *</label>
                      <select
                        style={{ ...inp, appearance: "auto", cursor: "pointer" }}
                        value={form.subject}
                        onChange={set("subject")}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#C08435")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(20,20,16,.12)")}
                      >
                        <option value="">Choisir un sujet…</option>
                        {SUBJECTS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={lbl}>Votre message *</label>
                      <textarea
                        style={{ ...inp, minHeight: 180, resize: "vertical" }}
                        value={form.message}
                        placeholder="Décrivez votre demande avec autant de détails que possible…"
                        onChange={set("message")}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#C08435")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(20,20,16,.12)")}
                      />
                    </div>

                    {errorMsg && (
                      <div style={{
                        background: "#FAEBE8", border: "1px solid rgba(184,52,30,.15)",
                        borderRadius: 10, padding: ".75rem 1rem",
                        fontSize: ".8rem", color: "#B8341E",
                      }}>
                        ⚠️ {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      style={{
                        padding: ".9rem 2.5rem", borderRadius: 12, border: "none",
                        background: status === "sending" ? "#928E80" : "#C08435",
                        color: "#fff", fontSize: ".88rem", fontWeight: 800,
                        letterSpacing: ".04em", cursor: status === "sending" ? "not-allowed" : "pointer",
                        transition: "background .2s", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: ".5rem",
                        alignSelf: "flex-start",
                      }}
                    >
                      {status === "sending" ? (
                        <>
                          <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite", display: "inline-block" }} />
                          Envoi en cours…
                        </>
                      ) : "Envoyer le message →"}
                    </button>

                    <p style={{ fontSize: ".68rem", color: "#928E80", lineHeight: 1.6 }}>
                      Vos données sont utilisées uniquement pour traiter votre demande. Consultez notre{" "}
                      <Link href="/confidentialite" style={{ color: "#C08435", textDecoration: "none" }}>
                        politique de confidentialité
                      </Link>.
                    </p>
                  </form>
                )}
              </div>

              {/* Sidebar infos */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Coords */}
                <div style={{
                  background: "#fff", borderRadius: 16,
                  border: "1px solid rgba(20,20,16,.08)",
                  padding: "1.75rem",
                }}>
                  <h3 style={{ fontWeight: 800, fontSize: ".88rem", color: "#141410", marginBottom: "1.25rem", paddingBottom: ".75rem", borderBottom: "1px solid rgba(20,20,16,.07)" }}>
                    Coordonnées
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
                    {CONTACT_INFO.map((c) => (
                      <div key={c.label} style={{ display: "flex", alignItems: "flex-start", gap: ".75rem" }}>
                        <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: ".05rem" }}>{c.icon}</span>
                        <div>
                          <div style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#928E80", marginBottom: ".15rem" }}>
                            {c.label}
                          </div>
                          <div style={{ fontSize: ".82rem", fontWeight: 600, color: "#141410" }}>
                            {c.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Délais */}
                <div style={{
                  background: "#FDF4E7", borderRadius: 16,
                  border: "1px solid rgba(192,132,53,.15)",
                  padding: "1.5rem",
                }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: ".75rem" }}>⏱️</div>
                  <h3 style={{ fontWeight: 800, fontSize: ".88rem", color: "#141410", marginBottom: ".5rem" }}>
                    Délais de réponse
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                    {[
                      { label: "Questions générales", time: "48h" },
                      { label: "Signalement erreur", time: "24h" },
                      { label: "Partenariats", time: "5 jours" },
                      { label: "Presse", time: "24h" },
                    ].map((r) => (
                      <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".78rem" }}>
                        <span style={{ color: "#928E80" }}>{r.label}</span>
                        <span style={{ fontWeight: 700, color: "#C08435", background: "rgba(192,132,53,.1)", padding: ".15rem .6rem", borderRadius: 100, fontSize: ".68rem" }}>
                          {r.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Liens utiles */}
                <div style={{
                  background: "#fff", borderRadius: 16,
                  border: "1px solid rgba(20,20,16,.08)",
                  padding: "1.5rem",
                }}>
                  <h3 style={{ fontWeight: 800, fontSize: ".85rem", color: "#141410", marginBottom: "1rem" }}>
                    Peut-être utile aussi
                  </h3>
                  {[
                    { href: "/bourses", label: "Parcourir les bourses", icon: "🎓" },
                    { href: "/opportunites", label: "Voir les opportunités", icon: "💼" },
                    { href: "/a-propos", label: "En savoir plus sur nous", icon: "👋" },
                    { href: "/cgu", label: "Conditions d'utilisation", icon: "📋" },
                  ].map((l) => (
                    <Link key={l.href} href={l.href} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: ".6rem", padding: ".5rem 0", borderBottom: "1px solid rgba(20,20,16,.06)", fontSize: ".82rem", color: "#38382E", fontWeight: 500, transition: "color .15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#C08435")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#38382E")}
                    >
                      <span>{l.icon}</span>
                      {l.label}
                      <span style={{ marginLeft: "auto", color: "#C4C0B6", fontSize: ".7rem" }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </>
  );
}