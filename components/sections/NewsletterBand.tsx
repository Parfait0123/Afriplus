"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "already">("idle");
  const [isVisible, setIsVisible] = useState(false);
  
  const subscribed = status === "success";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    const element = document.getElementById("newsletter-band");
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.status === 409 || data.message === "already_subscribed") {
        setStatus("already");
      } else if (!res.ok) {
        setStatus("error");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      id="newsletter-band"
      style={{
        background: "linear-gradient(135deg, #0c0b08 0%, #141410 50%, #1a1812 100%)",
        padding: "clamp(3rem, 8vw, 6rem) 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Effet de grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.4,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Cercles lumineux animés */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          right: "-10%",
          width: "clamp(300px, 50vw, 600px)",
          height: "clamp(300px, 50vw, 600px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(192,132,53,.15) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "pulse 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-10%",
          width: "clamp(400px, 60vw, 700px)",
          height: "clamp(400px, 60vw, 700px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,92,64,.1) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "pulse 12s ease-in-out infinite reverse",
        }}
      />

      {/* Grille décorative */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(192,132,53,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(192,132,53,.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 clamp(1rem, 5vw, 2.5rem)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* En-tête avec animation */}
        <div
          style={{
            textAlign: "center",
            maxWidth: 680,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(192,132,53,.12)",
              border: "1px solid rgba(192,132,53,.25)",
              borderRadius: "100px",
              padding: "0.3rem 1rem",
              marginBottom: "1.25rem",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#C08435",
                display: "inline-block",
                animation: "pulse-dot 1.5s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#C08435",
              }}
            >
              Rejoignez +2 500 abonnés
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(2rem, 5vw, 3.8rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#fff",
              lineHeight: 1.05,
              marginBottom: "1rem",
            }}
          >
            Ne manquez{" "}
            <em style={{ fontStyle: "italic", color: "#E09B48", fontWeight: 200 }}>
              rien d&apos;essentiel
            </em>
          </h2>
          <p
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1rem)",
              fontWeight: 300,
              color: "rgba(255,255,255,.5)",
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            Les meilleures opportunités, bourses et actualités africaines —
            chaque semaine dans votre boîte mail.
          </p>
        </div>

        {/* Formulaire */}
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(15px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}
        >
          {subscribed ? (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(26,92,64,.2), rgba(26,92,64,.05))",
                border: "1px solid rgba(26,92,64,.4)",
                borderRadius: 20,
                padding: "1.5rem 2rem",
                textAlign: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✨</div>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#4ade80",
                  marginBottom: "0.3rem",
                }}
              >
                Inscription confirmée !
              </div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,.5)" }}>
                Bienvenue dans la communauté AfriPulse
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  borderRadius: 100,
                  overflow: "hidden",
                  boxShadow: "0 12px 40px rgba(0,0,0,.4)",
                  background: "rgba(255,255,255,.05)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,.1)",
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  disabled={status === "loading"}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "clamp(0.85rem, 3vw, 0.9rem)",
                    padding: "clamp(0.8rem, 2.5vw, 1rem) clamp(1rem, 4vw, 1.5rem)",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "clamp(0.75rem, 2.5vw, 0.85rem)",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #C08435, #E09B48)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "100px",
                    margin: "0.35rem",
                    padding: "clamp(0.5rem, 1.5vw, 0.7rem) clamp(1rem, 3vw, 1.8rem)",
                    cursor: status === "loading" ? "wait" : "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (status !== "loading") {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(192,132,53,.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {status === "loading" ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,.3)",
                          borderTopColor: "#fff",
                          animation: "spin 0.7s linear infinite",
                          display: "inline-block",
                        }}
                      />
                      Envoi...
                    </span>
                  ) : (
                    "S'abonner →"
                  )}
                </button>
              </div>

              {/* Messages d'état */}
              {status === "error" && (
                <div
                  style={{
                    marginTop: "0.8rem",
                    fontSize: "0.75rem",
                    color: "#F4866A",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.3rem",
                  }}
                >
                  ⚠️ Email invalide — vérifiez votre adresse
                </div>
              )}
              {status === "already" && (
                <div
                  style={{
                    marginTop: "0.8rem",
                    fontSize: "0.75rem",
                    color: "#C08435",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.3rem",
                  }}
                >
                  ✨ Cet email est déjà inscrit — vous recevez déjà nos actualités !
                </div>
              )}
            </form>
          )}

          <div
            style={{
              fontSize: "0.7rem",
              color: "rgba(255,255,255,.3)",
              textAlign: "center",
              marginTop: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <span>🔒 Aucun spam</span>
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: "rgba(255,255,255,.2)",
              }}
            />
            <span>📧 Désabonnement en un clic</span>
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: "rgba(255,255,255,.2)",
              }}
            />
            <span>⭐ Newsletter hebdomadaire</span>
          </div>
        </div>

        {/* Badges de confiance */}
        <div
          style={{
            display: "flex",
            gap: "clamp(1rem, 4vw, 2rem)",
            flexWrap: "wrap",
            justifyContent: "center",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
            marginTop: "0.5rem",
          }}
        >
          {[
            { icon: "📰", text: "Actus vérifiées" },
            { icon: "🎓", text: "Bourses exclusives" },
            { icon: "💼", text: "Opportunités pro" },
            { icon: "📅", text: "Événements à venir" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.05)",
                borderRadius: 100,
                padding: "0.4rem 1rem",
              }}
            >
              <span style={{ fontSize: "0.9rem" }}>{item.icon}</span>
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,.5)" }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          form {
            width: 100%;
          }
          input, button {
            white-space: normal !important;
          }
        }
      `}</style>
    </div>
  );
}