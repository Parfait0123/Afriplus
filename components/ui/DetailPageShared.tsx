"use client";

/**
 * components/ui/DetailPageShared.tsx
 *
 * Composants partagés entre les pages détail bourse et opportunité :
 *   - ChecklistBlock   : checklist cochable, état persisté localStorage
 *   - BlockRenderer    : rendu de tous les types de blocs rich content
 *   - SaveShareBar     : barre sauvegarder / partager / copier lien
 *   - SidebarInfoRow   : ligne d'info dans la sidebar
 *   - CountdownBadge   : compteur jours avant clôture
 *   - RelatedSection   : section "autres X" en bas de page
 *   - RelatedCard      : carte générique pour bourses et opportunités
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import RevealWrapper from "@/components/ui/RevealWrapper";
import type { Block } from "@/lib/data";
import { createBrowserClient } from "@supabase/ssr";
import type { ContentType } from "@/types";

/* Supabase client singleton pour les composants partagés */
let _supabase: ReturnType<typeof createBrowserClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

/* ================================================================
   Types partagés
   ================================================================ */
export type ThemeColors = {
  color: string; // couleur principale
  bg:    string; // fond clair
  dark:  string; // couleur sombre (hover CTA)
};

export type RelatedItem = {
  id:            string;
  slug:          string;
  title:         string;
  imageGradient: string;
  deadline:      string;
  // Bourse
  flag?:         string;
  country?:      string;
  organization?: string;
  level?:        string;
  amount?:       string;
  urgent?:       boolean;
  // Opportunité
  company?:        string;
  companyInitials?: string;
  type?:           string;
  sector?:         string;
  location?:       string;
  salary?:         string;
};

/* ================================================================
   Icônes
   ================================================================ */
export const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const IcoBookmark = ({ on }: { on: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24"
    fill={on ? "currentColor" : "none"} stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const IcoShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const IcoLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

export const IcoExternal = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

/* ================================================================
   ChecklistBlock
   Persistance double :
     1. localStorage  → immédiat, fonctionne sans compte
     2. Supabase       → si connecté, sync cross-device
   La clé Supabase est stockée dans applications.content_meta
   ================================================================ */
export function ChecklistBlock({ block, color, bg, storageKey }: {
  block: { title?: string; items: { label: string; detail?: string }[] };
  color: string;
  bg:    string;
  storageKey: string; // ex: "checklist-scholarship-slug-0"
}) {
  const [checked, setChecked] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Charger : localStorage d'abord (rapide), puis Supabase si connecté */
  useEffect(() => {
    // 1. localStorage — immédiat
    try {
      const local = localStorage.getItem(storageKey);
      if (local) setChecked(JSON.parse(local));
    } catch {}
    setHydrated(true);

    // 2. Supabase — async, écrase si trouvé
    const supabase = getSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: app } = await supabase
        .from("applications")
        .select("content_meta")
        .eq("user_id", data.user.id)
        .eq("content_slug", storageKey.split("-").slice(2, -1).join("-"))
        .maybeSingle();
      if (app?.content_meta) {
        const remote = (app.content_meta as Record<string, unknown>)[storageKey] as number[] | undefined;
        if (remote) {
          setChecked(remote);
          try { localStorage.setItem(storageKey, JSON.stringify(remote)); } catch {}
        }
      }
    });
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const syncToSupabase = useCallback(async (next: number[]) => {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    // Upsert dans content_meta de l'application existante (si elle existe)
    await supabase
      .from("applications")
      .update({ content_meta: { [storageKey]: next } })
      .eq("user_id", data.user.id)
      .eq("content_slug", storageKey.split("-").slice(2, -1).join("-"));
  }, [storageKey]);

  const toggle = (j: number) => {
    setChecked(prev => {
      const next = prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j];
      // 1. localStorage immédiat
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      // 2. Supabase avec debounce (évite trop d'appels)
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
      syncTimeout.current = setTimeout(() => syncToSupabase(next), 1200);
      return next;
    });
  };

  const total = block.items.length;
  const done  = checked.length;

  if (!hydrated) return null; // évite le flash SSR

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {block.title && (
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#928E80",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
          {block.title}
        </div>
      )}
      {/* Barre de progression */}
      {total > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
          <div style={{ flex: 1, height: 5, background: "rgba(20,20,16,.08)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 100, background: color,
              width: `${(done / total) * 100}%`,
              transition: "width .3s cubic-bezier(.34,1.56,.64,1)",
            }} />
          </div>
          <span style={{ fontSize: "0.62rem", fontWeight: 700, color, flexShrink: 0 }}>
            {done}/{total}
          </span>
        </div>
      )}
      {/* Items */}
      {block.items.map((item, j) => {
        const isChecked = checked.includes(j);
        return (
          <div key={j} onClick={() => toggle(j)}
            className="cl-item"
            style={{
              display: "flex", gap: "0.85rem", alignItems: "flex-start",
              padding: "0.9rem 1.1rem",
              background: isChecked ? bg : "#fff",
              borderRadius: 14,
              border: `1px solid ${isChecked ? color : "rgba(20,20,16,.07)"}`,
              cursor: "pointer", transition: "all .18s",
              boxShadow: isChecked ? "none" : "0 1px 6px rgba(20,20,16,.04)",
            }}>
            {/* Checkbox */}
            <div style={{
              width: 22, height: 22, borderRadius: 7, flexShrink: 0,
              transition: "all .18s",
              background: isChecked ? color : "transparent",
              border: `2px solid ${isChecked ? color : "rgba(20,20,16,.2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}>
              {isChecked && <IcoCheck />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: "0.88rem", fontWeight: 600,
                color: isChecked ? color : "#141410",
                textDecoration: isChecked ? "line-through" : "none",
                textDecorationColor: color,
                lineHeight: 1.4,
                marginBottom: item.detail ? "0.25rem" : 0,
              }}>
                {item.label}
              </div>
              {item.detail && (
                <div style={{ fontSize: "0.72rem", color: "#928E80", lineHeight: 1.5 }}>
                  {item.detail}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {/* Message dossier complet */}
      {done === total && total > 1 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.65rem",
          padding: "0.85rem 1.1rem", background: bg,
          border: `1.5px solid ${color}`, borderRadius: 14, marginTop: "0.25rem",
        }}>
          <span style={{ fontSize: "1rem" }}>✅</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color }}>
            Dossier complet — vous pouvez postuler !
          </span>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   BlockRenderer — rendu de tous les types de blocs
   ================================================================ */
export function BlockRenderer({ blocks, color, bg, dark, contentSlug }: {
  blocks:      Block[];
  color:       string;
  bg:          string;
  dark:        string;
  contentSlug: string; // pour les clés localStorage des checklists
}) {
  let checklistIndex = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "2rem" }}>
      {blocks.map((block, i) => {
        switch (block.type) {

          case "paragraph":
            return <p key={i} className="bs-p">{block.text}</p>;

          case "heading":
            return block.level === 3
              ? <h3 key={i} style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 900, color: "#141410", marginTop: "0.5rem" }}>{block.text}</h3>
              : (
                <div key={i} style={{ paddingTop: "1rem" }}>
                  <h2 className="bs-h2">{block.text}</h2>
                  <div style={{ width: "2.8rem", height: 3, background: color, borderRadius: 100, marginTop: "0.75rem" }} />
                </div>
              );

          case "pullquote":
            return (
              <blockquote key={i} style={{ margin: "0.5rem 0", padding: "1.5rem 2rem", borderLeft: `4px solid ${color}`, background: bg, borderRadius: "0 16px 16px 0" }}>
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, fontStyle: "italic", color: "#141410", lineHeight: 1.5, marginBottom: block.author ? "0.75rem" : 0 }}>
                  « {block.text} »
                </p>
                {block.author && (
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    — {block.author}{block.role ? `, ${block.role}` : ""}
                  </div>
                )}
              </blockquote>
            );

          case "factbox":
            return (
              <div key={i} style={{ padding: "1.5rem 1.75rem", background: "#141410", borderRadius: 20, border: "1px solid rgba(248,246,241,.06)" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C08435", marginBottom: "1rem" }}>
                  💡 {block.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {block.facts.map((fact, j) => (
                    <div key={j} style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
                      <span style={{ color: "#C08435", fontWeight: 700, fontSize: "0.7rem", flexShrink: 0, marginTop: "0.15rem" }}>→</span>
                      <span style={{ fontSize: "0.82rem", color: "rgba(248,246,241,.65)", lineHeight: 1.6 }}>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "alert": {
            const alertStyles = {
              info:    { bg: "#EBF0FB", border: "#1E4DA8", icon: "ℹ️", color: "#1E4DA8" },
              warning: { bg: "#FFF4EB", border: "#C08435", icon: "⚠️", color: "#C08435" },
              tip:     { bg: "#EAF4EF", border: "#1A5C40", icon: "💡", color: "#1A5C40" },
            };
            const as = alertStyles[block.variant ?? "info"];
            return (
              <div key={i} style={{ display: "flex", gap: "0.85rem", padding: "1rem 1.25rem", background: as.bg, border: `1.5px solid ${as.border}40`, borderRadius: 14 }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{as.icon}</span>
                <p style={{ fontSize: "0.85rem", color: "#141410", lineHeight: 1.6, margin: 0 }}>{block.message}</p>
              </div>
            );
          }

          case "divider":
            return <hr key={i} style={{ border: "none", borderTop: "1px solid rgba(20,20,16,.08)", margin: "0.5rem 0" }} />;

          case "benefits":
            return (
              <div key={i} className="bs-benefits-grid">
                {block.items.map((b, j) => (
                  <div key={j} className={`bs-benefit-card ${b.highlight ? "bs-benefit-card--highlight" : ""}`}
                    style={b.highlight ? { borderColor: color, background: bg } : {}}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.6rem" }}>{b.icon}</div>
                    <div style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: b.highlight ? color : "#928E80", marginBottom: "0.3rem" }}>{b.label}</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#141410", lineHeight: 1.4 }}>{b.value}</div>
                  </div>
                ))}
              </div>
            );

          case "checklist": {
            const key = `checklist-${contentSlug}-${checklistIndex++}`;
            return (
              <ChecklistBlock
                key={i}
                block={block}
                color={color}
                bg={bg}
                storageKey={key}
              />
            );
          }

          case "steps":
            return (
              <div key={i}>
                {block.title && (
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
                    {block.title}
                  </div>
                )}
                <div className="bs-steps">
                  {block.items.map((step, j) => (
                    <div key={j} className="bs-step">
                      {j < block.items.length - 1 && (
                        <div style={{ position: "absolute", left: 18, top: 40, width: 2, height: "calc(100% - 20px)", background: `linear-gradient(180deg, ${color}40, transparent)` }} />
                      )}
                      <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${color}, ${dark})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.78rem", fontWeight: 900, color: "#fff", boxShadow: `0 4px 12px ${color}44` }}>
                        {j + 1}
                      </div>
                      <div style={{ flex: 1, paddingTop: "0.4rem" }}>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#141410", marginBottom: "0.3rem" }}>{step.label}</div>
                        <div style={{ fontSize: "0.8rem", color: "#928E80", lineHeight: 1.6 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "external":
            return (
              <a key={i} href={block.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "#fff", border: "1px solid rgba(20,20,16,.08)", borderRadius: 14, textDecoration: "none", boxShadow: "0 1px 6px rgba(20,20,16,.04)" }}>
                {block.favicon && <img src={block.favicon} alt="" width={16} height={16} style={{ borderRadius: 4 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#141410" }}>{block.label}</div>
                  {block.description && <div style={{ fontSize: "0.72rem", color: "#928E80", marginTop: "0.15rem" }}>{block.description}</div>}
                </div>
                <IcoExternal />
              </a>
            );

          case "download":
            return (
              <a key={i} href={block.url} download
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: bg, border: `1.5px solid ${color}30`, borderRadius: 14, textDecoration: "none" }}>
                <span style={{ fontSize: "1.2rem" }}>📥</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color }}>{block.label}</div>
                  {block.size && <div style={{ fontSize: "0.7rem", color: "#928E80", marginTop: "0.1rem" }}>{block.size}</div>}
                </div>
              </a>
            );

          case "profile":
            return (
              <div key={i}>
                {block.title && (
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>{block.title}</div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
                  {block.traits.map((t, j) => (
                    <div key={j} style={{ padding: "1.1rem 1.25rem", background: "#fff", borderRadius: 16, border: "1px solid rgba(20,20,16,.07)", boxShadow: "0 1px 8px rgba(20,20,16,.05)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div style={{ fontSize: "1.4rem" }}>{t.icon}</div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#141410", letterSpacing: "0.02em" }}>{t.label}</div>
                      <div style={{ fontSize: "0.72rem", color: "#928E80", lineHeight: 1.55 }}>{t.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "compare":
            return (
              <div key={i}>
                {block.title && (
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#928E80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>{block.title}</div>
                )}
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(20,20,16,.08)", boxShadow: "0 1px 8px rgba(20,20,16,.04)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: `1.5fr ${block.columns.map(() => "1fr").join(" ")}`, background: "#141410" }}>
                    <div style={{ padding: "0.75rem 1rem" }} />
                    {block.columns.map((col, j) => (
                      <div key={j} style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", fontWeight: 800, color: col.color ?? color, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", borderLeft: "1px solid rgba(255,255,255,.06)" }}>
                        {col.label}
                      </div>
                    ))}
                  </div>
                  {block.rows.map((row, j) => (
                    <div key={j} style={{ display: "grid", gridTemplateColumns: `1.5fr ${block.columns.map(() => "1fr").join(" ")}`, background: j % 2 === 0 ? "#fff" : "#F8F6F1", borderTop: "1px solid rgba(20,20,16,.06)" }}>
                      <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", fontWeight: 600, color: "#38382E" }}>{row.label}</div>
                      {row.values.map((val, k) => (
                        <div key={k} style={{ padding: "0.75rem 1rem", fontSize: "0.78rem", color: "#928E80", textAlign: "center", borderLeft: "1px solid rgba(20,20,16,.06)", lineHeight: 1.45 }}>{val}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );

          case "location":
            return (
              <div key={i} style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(20,20,16,.08)", boxShadow: "0 2px 12px rgba(20,20,16,.06)" }}>
                {block.mapUrl ? (
                  <iframe src={block.mapUrl} width="100%" height="220"
                    style={{ display: "block", border: "none" }}
                    loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={block.label} />
                ) : (
                  <div style={{ height: 180, background: `linear-gradient(135deg, ${bg} 0%, #E8E4DA 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ fontSize: "2rem" }}>📍</div>
                    <div style={{ fontSize: "0.75rem", color: "#928E80", fontWeight: 600 }}>{block.label}</div>
                  </div>
                )}
                <div style={{ padding: "0.9rem 1.1rem", background: "#fff", display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0 }}>📍</div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#141410" }}>{block.label}</div>
                    {block.address && <div style={{ fontSize: "0.72rem", color: "#928E80", marginTop: "0.1rem" }}>{block.address}</div>}
                  </div>
                </div>
              </div>
            );

          case "apply":
            return (
              <div key={i} style={{ padding: "1.75rem", background: `linear-gradient(135deg, ${dark} 0%, #141410 100%)`, borderRadius: 20, border: `1px solid ${color}30`, boxShadow: `0 4px 24px ${color}18` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {block.deadline && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color }}>
                      <span>⏳</span> Date limite : {block.deadline}
                    </div>
                  )}
                  <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.2rem", fontWeight: 900, color: "#F8F6F1", lineHeight: 1.3 }}>
                    {block.label}
                  </div>
                  {block.note && (
                    <div style={{ fontSize: "0.78rem", color: "rgba(248,246,241,.5)", lineHeight: 1.6 }}>{block.note}</div>
                  )}
                  <a href={block.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", padding: "0.85rem 1.5rem", background: color, color: "#fff", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: "0.88rem", boxShadow: `0 4px 16px ${color}55`, alignSelf: "flex-start" }}>
                    Postuler maintenant →
                  </a>
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

/* ================================================================
   SaveShareBar
   - Sauvegarder : Supabase (table saves) si connecté, localStorage sinon
   - Partager    : Web Share API sur mobile, copie URL sinon
   - La sauvegarde Supabase apparaît dans le dashboard utilisateur
   ================================================================ */
export function SaveShareBar({ contentType, contentSlug, contentTitle, contentMeta, color, bg }: {
  contentType:  ContentType;
  contentSlug:  string;
  contentTitle: string;
  contentMeta?: Record<string, unknown>;
  color:        string;
  bg:           string;
}) {
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState(false);
  const lsKey = `saved-${contentType}-${contentSlug}`;

  /* Charger état initial : Supabase si connecté, localStorage sinon */
  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        // Non connecté → localStorage
        try {
          const local = localStorage.getItem(lsKey);
          if (local) setSaved(JSON.parse(local));
        } catch {}
        return;
      }
      // Connecté → Supabase
      const { data: row } = await supabase
        .from("saves")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("content_type", contentType)
        .eq("content_slug", contentSlug)
        .maybeSingle();
      setSaved(!!row);
    });
  }, [contentSlug, contentType, lsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSave = async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Non connecté : localStorage uniquement
      const next = !saved;
      setSaved(next);
      try { localStorage.setItem(lsKey, JSON.stringify(next)); } catch {}
      setLoading(false);
      return;
    }

    if (saved) {
      // Supprimer
      setSaved(false);
      await supabase
        .from("saves")
        .delete()
        .eq("user_id", user.id)
        .eq("content_type", contentType)
        .eq("content_slug", contentSlug);
    } else {
      // Sauvegarder
      setSaved(true);
      await supabase.from("saves").insert({
        user_id:       user.id,
        content_type:  contentType,
        content_slug:  contentSlug,
        content_title: contentTitle,
        content_meta:  contentMeta ?? null,
      });
    }
    setLoading(false);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ url, title: document.title }); } catch {}
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.65rem",
      padding: "2rem 0 1.75rem",
      borderBottom: "1px solid rgba(20,20,16,.07)",
      flexWrap: "wrap",
    }}>
      <button
        onClick={toggleSave}
        disabled={loading}
        className="bs-btn"
        style={saved ? { background: bg, color, borderColor: color } : {}}>
        <IcoBookmark on={saved} />
        {loading ? "…" : saved ? "Sauvegardé" : "Sauvegarder"}
      </button>

      <button onClick={handleShare} className="bs-btn">
        {copied ? <IcoLink /> : <IcoShare />}
        {copied ? "Lien copié !" : "Partager"}
      </button>
    </div>
  );
}

/* ================================================================
   CountdownBadge — compteur jours avant clôture (sidebar)
   ================================================================ */
export function CountdownBadge({ daysLeft, isUrgent, color, bg, label }: {
  daysLeft: number;
  isUrgent: boolean;
  color:    string;
  bg:       string;
  label:    string; // flag ou initiales à afficher à droite
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: "1.25rem", padding: "0.85rem 1rem",
      background: isUrgent ? "#FFF4F2" : bg,
      borderRadius: 12,
      border: `1px solid ${isUrgent ? "#FFD0C8" : "rgba(20,20,16,.08)"}`,
    }}>
      <div>
        <div style={{ fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: isUrgent ? "#B8341E" : "#928E80", marginBottom: "0.2rem" }}>
          Clôture dans
        </div>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.5rem", fontWeight: 900, color: isUrgent ? "#B8341E" : color, lineHeight: 1 }}>
          {daysLeft > 0 ? `${daysLeft}j` : "Expiré"}
        </div>
      </div>
      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.5rem", fontWeight: 900, color: "rgba(20,20,16,.08)" }}>
        {label}
      </div>
    </div>
  );
}

/* ================================================================
   SidebarInfoRow — ligne label / valeur dans la sidebar
   ================================================================ */
export function SidebarInfoRow({ label, value, bold, color, last }: {
  label: string;
  value: string;
  bold?:  boolean;
  color?: string;
  last?:  boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "flex-start", gap: "1rem", padding: "0.8rem 0",
      borderBottom: last ? "none" : "1px solid rgba(20,20,16,.07)",
    }}>
      <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#928E80", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: "0.85rem", fontWeight: bold ? 800 : 500, color: color ?? "#38382E", textAlign: "right", lineHeight: 1.3 }}>
        {value}
      </span>
    </div>
  );
}

/* ================================================================
   SidebarCTAButton — bouton postuler dans la sidebar
   ================================================================ */
export function SidebarCTAButton({ href, color, dark, label = "Postuler maintenant", note }: {
  href:   string;
  color:  string;
  dark:   string;
  label?: string;
  note?:  string;
}) {
  return (
    <>
      <a href={href} target="_blank" rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "0.5rem", width: "100%", textAlign: "center",
          background: color, color: "#fff",
          padding: "1rem", borderRadius: 100,
          fontWeight: 800, fontSize: "0.9rem",
          textDecoration: "none",
          boxShadow: `0 6px 24px ${color}44`,
          transition: "all .25s", marginTop: "1.5rem",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.background    = dark;
          el.style.transform     = "translateY(-2px)";
          el.style.boxShadow     = `0 12px 32px ${color}55`;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.background    = color;
          el.style.transform     = "none";
          el.style.boxShadow     = `0 6px 24px ${color}44`;
        }}
      >
        {label} <IcoExternal />
      </a>
      {note && (
        <div style={{ textAlign: "center", marginTop: "0.65rem", fontSize: "0.65rem", color: "#928E80" }}>
          {note}
        </div>
      )}
    </>
  );
}

/* ================================================================
   TagsPill — groupe de tags / skills dans la sidebar
   ================================================================ */
export function TagsPill({ items, color, bg, label = "Tags" }: {
  items:  string[];
  color:  string;
  bg:     string;
  label?: string;
}) {
  if (!items.length) return null;
  return (
    <div className="bs-sidebar-block">
      <div className="bs-sidebar-label">{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {items.map(s => (
          <span key={s} style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.28rem 0.75rem", borderRadius: 100, background: bg, color }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   RelatedSection — section "Autres bourses / opportunités"
   ================================================================ */
export function RelatedSection({ items, basePath, singularLabel, pluralLabel, themeMap }: {
  items:        RelatedItem[];
  basePath:     string;       // "/bourses" ou "/opportunites"
  singularLabel: string;
  pluralLabel:  string;
  themeMap:     (item: RelatedItem) => ThemeColors;
}) {
  if (!items.length) return null;

  return (
    <section style={{ background: "#F0EDE4", padding: "5rem 0" }}>
      <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(1rem, 5vw, 4rem)" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          flexWrap: "wrap", gap: "1rem", marginBottom: "2.25rem",
          paddingBottom: "1.25rem", borderBottom: "2px solid #141410",
        }}>
          <div>
            <div style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C08435", marginBottom: "0.45rem" }}>
              Continuer à explorer
            </div>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.035em", color: "#141410", margin: 0 }}>
              Autres{" "}
              <em style={{ fontStyle: "italic", fontWeight: 200, color: "#C08435" }}>
                {pluralLabel}
              </em>
            </h2>
          </div>
          <Link href={basePath} style={{ fontSize: "0.78rem", fontWeight: 700, color: "#C08435", textDecoration: "none", padding: "0.5rem 1.25rem", borderRadius: 100, border: "1.5px solid rgba(192,132,53,.3)", background: "rgba(192,132,53,.06)" }}>
            Toutes les {pluralLabel} →
          </Link>
        </div>

        {/* Cartes */}
        <div className="bs-related-grid">
          {items.map((item, ri) => {
            const tc = themeMap(item);
            const rdaysLeft = daysUntil(item.deadline);
            const rUrgent   = rdaysLeft !== null && rdaysLeft <= 14;

            return (
              <RevealWrapper key={item.id} delay={ri * 0.1}>
                <Link href={`${basePath}/${item.slug}`}
                  style={{ textDecoration: "none", display: "block", height: "100%" }}>
                  <div className="bs-related-card">
                    {/* Image */}
                    <div style={{ height: 160, position: "relative", overflow: "hidden", flexShrink: 0 }}>
                      <div style={{ position: "absolute", inset: 0, background: item.imageGradient }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 30%,rgba(0,0,0,.75) 100%)" }} />

                      {/* Déco fantôme */}
                      {(item.companyInitials || item.flag) && (
                        <div aria-hidden="true" style={{ position: "absolute", bottom: "-0.5rem", right: "0.75rem", fontFamily: "'Fraunces', Georgia, serif", fontSize: "4rem", fontWeight: 900, lineHeight: 1, color: "rgba(255,255,255,.07)", letterSpacing: "-0.04em", pointerEvents: "none" }}>
                          {item.companyInitials ?? item.flag}
                        </div>
                      )}

                      {/* Badge localisation */}
                      <div style={{ position: "absolute", bottom: "0.8rem", left: "0.9rem", display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.65rem", fontWeight: 700, color: "#fff", background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)", padding: "0.3rem 0.7rem", borderRadius: 100 }}>
                        {item.company
                          ? <><div style={{ width: 18, height: 18, borderRadius: 5, background: `linear-gradient(135deg,${tc.color},${tc.dark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.45rem", fontWeight: 900, color: "#fff", flexShrink: 0 }}>{item.companyInitials}</div>{item.company}</>
                          : <>{item.flag} {item.country}</>
                        }
                      </div>

                      {/* Badge urgent */}
                      {(rUrgent || item.urgent) && (
                        <div style={{ position: "absolute", top: "0.8rem", right: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", background: "#B8341E", padding: "0.25rem 0.65rem", borderRadius: 100 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,.7)", animation: "blink 1.4s ease-in-out infinite", display: "inline-block" }} />
                          Urgent
                        </div>
                      )}

                      {/* Trait coloré bas */}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: tc.color }} />
                    </div>

                    {/* Corps */}
                    <div style={{ padding: "1.25rem 1.4rem", display: "flex", flexDirection: "column", flex: 1 }}>
                      <div style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: tc.color, marginBottom: "0.4rem" }}>
                        {item.organization ?? item.sector ?? item.type}
                      </div>
                      <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "0.97rem", fontWeight: 700, color: "#141410", lineHeight: 1.3, flex: 1, marginBottom: "0.75rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                        {item.title}
                      </h3>
                      {/* Badges secondaires */}
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "0.55rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 100, background: tc.bg, color: tc.color }}>
                          {item.level ?? item.type}
                        </span>
                        {(item.amount ?? item.salary) && (
                          <span style={{ fontSize: "0.55rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 100, background: "#EAF4EF", color: "#1A5C40" }}>
                            {item.amount ?? item.salary}
                          </span>
                        )}
                      </div>
                      {/* Pied de carte */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid rgba(20,20,16,.07)", marginTop: "auto" }}>
                        <span style={{ fontSize: "0.6rem", color: "#928E80" }}>
                          {item.flag && <>{item.flag} </>}
                          {item.location ?? item.country} · <b style={{ color: rUrgent ? "#B8341E" : "#38382E" }}>{item.deadline}</b>
                        </span>
                        {rdaysLeft !== null && rdaysLeft > 0 && (
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: rdaysLeft < 15 ? "#B8341E" : "#928E80" }}>
                            {rdaysLeft}j →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </RevealWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   Utilitaire partagé : calcul jours restants
   ================================================================ */
export function daysUntil(deadline: string): number | null {
  const months: Record<string, number> = {
    "Jan": 0, "Fév": 1, "Mar": 2, "Avr": 3, "Mai": 4, "Jun": 5,
    "Juil": 6, "Aoû": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Déc": 11,
  };
  const parts = deadline.split(" ");
  if (parts.length < 3) return null;
  const day   = parseInt(parts[0]);
  const month = months[parts[1]];
  const year  = parseInt(parts[2]);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  return Math.ceil((new Date(year, month, day).getTime() - Date.now()) / 86400000);
}