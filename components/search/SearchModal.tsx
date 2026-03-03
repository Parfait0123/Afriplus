"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearch } from "@/hooks/useSearch";

const typeIcons: Record<string, string> = {
  article: "📰", bourse: "🎓", opportunite: "💼", evenement: "📅",
};
const typeLabels: Record<string, string> = {
  article: "Actualité", bourse: "Bourse", opportunite: "Opportunité", evenement: "Événement",
};

interface SearchModalProps {
  onClose: () => void;
}

export default function SearchModal({ onClose }: SearchModalProps) {
  const { query, setQuery, results, loading } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const suggestions = ["Mastercard Foundation", "Nairobi tech", "Stage Sénégal", "AfricaTech Summit", "Banque Mondiale emploi"];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(20,20,16,.6)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "12vh", left: "50%", transform: "translateX(-50%)",
        zIndex: 1001, width: "min(680px, 94vw)",
        background: "#fff",
        borderRadius: 24,
        boxShadow: "0 24px 64px rgba(20,20,16,.25), 0 4px 16px rgba(20,20,16,.12)",
        overflow: "hidden",
        border: "1px solid rgba(20,20,16,.08)",
      }}>
        {/* Search input */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", padding: "1.1rem 1.4rem", borderBottom: "1px solid rgba(20,20,16,.07)" }}>
          <span style={{ fontSize: "1.1rem", flexShrink: 0, opacity: 0.5 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des actualités, bourses, opportunités…"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "1rem", color: "#141410",
            }}
          />
          {loading && (
            <div style={{ width: 18, height: 18, border: "2px solid rgba(20,20,16,.1)", borderTopColor: "#C08435", borderRadius: "50%", animation: "spin 0.6s linear infinite", flexShrink: 0 }} />
          )}
          <button
            onClick={onClose}
            style={{ padding: "0.3rem 0.65rem", borderRadius: 8, border: "1.5px solid rgba(20,20,16,.12)", background: "transparent", fontSize: "0.72rem", fontWeight: 600, color: "#928E80", cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", flexShrink: 0 }}
          >
            ESC
          </button>
        </div>

        {/* Results or suggestions */}
        <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
          {!query && (
            <div style={{ padding: "1.2rem 1.4rem" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#928E80", marginBottom: "0.85rem" }}>
                Recherches populaires
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "0.82rem", fontWeight: 500, padding: "0.4rem 0.9rem", borderRadius: 100, cursor: "pointer", background: "#F8F6F1", color: "#38382E", border: "1px solid rgba(20,20,16,.08)", transition: "all .15s" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div style={{ padding: "3rem 1.4rem", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔎</div>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#141410", marginBottom: "0.4rem" }}>
                Aucun résultat pour &ldquo;{query}&rdquo;
              </div>
              <div style={{ fontSize: "0.85rem", color: "#928E80" }}>
                Essayez d&apos;autres termes ou parcourez les catégories.
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div>
              {/* Group by type */}
              {(["article", "bourse", "opportunite", "evenement"] as const).map((type) => {
                const group = results.filter((r) => r.type === type);
                if (!group.length) return null;
                return (
                  <div key={type}>
                    <div style={{ padding: "0.75rem 1.4rem 0.4rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#928E80", borderTop: "1px solid rgba(20,20,16,.05)" }}>
                      {typeIcons[type]} {typeLabels[type]}{group.length > 1 ? "s" : ""}
                    </div>
                    {group.map((r) => (
                      <Link
                        key={r.id}
                        href={r.href}
                        onClick={onClose}
                        style={{ textDecoration: "none" }}
                      >
                        <div style={{
                          display: "flex", alignItems: "center", gap: "1rem",
                          padding: "0.85rem 1.4rem",
                          transition: "background .12s",
                          cursor: "pointer",
                        }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#F8F6F1")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#141410", marginBottom: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {r.title}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#928E80", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {r.subtitle}
                            </div>
                          </div>
                          {r.badge && (
                            <span style={{ flexShrink: 0, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.2rem 0.6rem", borderRadius: 100, background: r.badgeBg, color: r.badgeColor }}>
                              {r.badge}
                            </span>
                          )}
                          <span style={{ flexShrink: 0, fontSize: "0.8rem", color: "#C08435" }}>→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              })}

              {/* See all results */}
              <div style={{ padding: "1rem 1.4rem", borderTop: "1px solid rgba(20,20,16,.07)", textAlign: "center" }}>
                <Link
                  href={`/recherche?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  style={{ fontSize: "0.82rem", fontWeight: 600, color: "#C08435", textDecoration: "none" }}
                >
                  Voir tous les résultats pour &ldquo;{query}&rdquo; →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "0.65rem 1.4rem", borderTop: "1px solid rgba(20,20,16,.07)", display: "flex", gap: "1.2rem", fontSize: "0.68rem", color: "#928E80" }}>
          <span>↑↓ naviguer</span>
          <span>↵ sélectionner</span>
          <span>ESC fermer</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
