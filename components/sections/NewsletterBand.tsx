"use client";
import { useState } from "react";

export default function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "already">("idle");
  const subscribed = status === "success";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); return; }
      if (data.message === "already_subscribed") setStatus("already");
      else setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        background: "#141410",
        padding: "6rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Mesh bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 700px 500px at 80% 50%, rgba(192,132,53,.12) 0%, transparent 65%), radial-gradient(ellipse 500px 400px at 10% 50%, rgba(26,92,64,.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 2.5rem",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "4rem",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#E09B48",
              marginBottom: "1rem",
            }}
          >
            Newsletter hebdomadaire
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(2rem,4vw,3.6rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#fff",
              lineHeight: 1.05,
              marginBottom: "0.9rem",
            }}
          >
            Ne manquez<br />
            rien{" "}
            <em style={{ fontStyle: "italic", color: "#E09B48", fontWeight: 200 }}>
              d&apos;essentiel
            </em>
          </h2>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 300,
              color: "rgba(255,255,255,.45)",
              maxWidth: 480,
              lineHeight: 1.75,
            }}
          >
            Les meilleures opportunités, bourses et actualités africaines — chaque semaine dans votre boîte mail.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
            alignItems: "flex-end",
          }}
        >
          {subscribed ? (
            <div
              style={{
                background: "rgba(26,92,64,.3)",
                border: "1.5px solid rgba(26,92,64,.5)",
                borderRadius: 14,
                padding: "1.2rem 2rem",
                color: "#4ade80",
                fontWeight: 600,
                fontSize: "0.9rem",
                textAlign: "center",
                minWidth: 360,
              }}
            >
              ✓ Inscription confirmée — bienvenue dans la communauté AfriPulse !
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "flex",
                  borderRadius: 100,
                  overflow: "hidden",
                  boxShadow: "0 8px 36px rgba(0,0,0,.35)",
                  minWidth: 360,
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,.07)",
                    border: "1.5px solid rgba(255,255,255,.1)",
                    borderRight: "none",
                    borderRadius: "100px 0 0 100px",
                    color: "#fff",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "0.87rem",
                    padding: "0.82rem 1.4rem",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    background: "#C08435",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0 100px 100px 0",
                    padding: "0.82rem 1.6rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  S&apos;abonner
                </button>
              </div>
            </form>
          )}
          <div
            style={{
              fontSize: "0.72rem",
              color: "rgba(255,255,255,.3)",
              textAlign: "right",
            }}
          >
            Pas de spam. Désabonnement en un clic.
          </div>
        </div>
      </div>
    </div>
  );
}
