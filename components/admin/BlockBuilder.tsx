"use client";

/**
 * components/admin/BlockBuilder.tsx
 * Composant bloc builder réutilisable — actualités, bourses, opportunités, événements
 *
 * Usage :
 *   <BlockBuilder
 *     blocks={blocks}
 *     onChange={setBlocks}
 *     allowedTypes={["paragraph","heading","image","pullquote","factbox"]}  // optionnel — filtre les types disponibles
 *   />
 */

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Block } from "@/types/database";

/* ── Tous les types disponibles ─────────────────────────── */
export const ALL_BLOCK_TYPES: {
  type: string;
  label: string;
  icon: string;
  desc: string;
}[] = [
  { type: "paragraph", label: "Paragraphe", icon: "¶", desc: "Texte courant" },
  { type: "heading", label: "Titre", icon: "H", desc: "H2 ou H3" },
  { type: "image", label: "Image", icon: "🖼", desc: "Avec légende et crédit" },
  { type: "video", label: "Vidéo", icon: "▶", desc: "YouTube, Vimeo…" },
  { type: "pullquote", label: "Citation", icon: '"', desc: "Mise en exergue" },
  {
    type: "factbox",
    label: "Encadré chiffres",
    icon: "□",
    desc: "Faits clés en liste",
  },
  {
    type: "checklist",
    label: "Liste à cocher",
    icon: "✓",
    desc: "Critères, items",
  },
  { type: "steps", label: "Étapes", icon: "①", desc: "Processus numéroté" },
  { type: "benefits", label: "Avantages", icon: "★", desc: "Icône + valeur" },
  { type: "compare", label: "Comparatif", icon: "⇆", desc: "Tableau colonnes" },
  {
    type: "profile",
    label: "Profil",
    icon: "👤",
    desc: "Traits caractéristiques",
  },
  {
    type: "agenda",
    label: "Programme",
    icon: "📅",
    desc: "Sessions horodatées",
  },
  {
    type: "speakers",
    label: "Intervenants",
    icon: "🎤",
    desc: "Liste de personnes",
  },
  { type: "location", label: "Lieu", icon: "📍", desc: "Adresse + carte" },
  {
    type: "apply",
    label: "CTA Candidature",
    icon: "→",
    desc: "Bouton d'action",
  },
  { type: "alert", label: "Alerte", icon: "!", desc: "Info, warning, conseil" },
  {
    type: "external",
    label: "Lien externe",
    icon: "↗",
    desc: "Ressource externe",
  },
  { type: "related", label: "Lire aussi", icon: "↩", desc: "Article lié" },
  {
    type: "download",
    label: "Téléchargement",
    icon: "↓",
    desc: "Fichier à télécharger",
  },
  {
    type: "divider",
    label: "Séparateur",
    icon: "—",
    desc: "Ligne horizontale",
  },
];

/* ── Présets par contexte ────────────────────────────────── */
export const BLOCK_PRESETS: Record<string, string[]> = {
  article: [
    "paragraph",
    "heading",
    "image",
    "video",
    "pullquote",
    "factbox",
    "alert",
    "external",
    "related",
    "download",
    "divider",
  ],
  scholarship: [
    "paragraph",
    "heading",
    "benefits",
    "checklist",
    "steps",
    "factbox",
    "alert",
    "apply",
    "external",
    "download",
  ],
  opportunity: [
    "paragraph",
    "heading",
    "benefits",
    "checklist",
    "steps",
    "compare",
    "location",
    "apply",
    "alert",
    "external",
  ],
  event: [
    "paragraph",
    "heading",
    "agenda",
    "speakers",
    "benefits",
    "location",
    "apply",
    "alert",
    "factbox",
    "compare",
  ],
  full: ALL_BLOCK_TYPES.map((b) => b.type),
};

/* ── makeBlock ───────────────────────────────────────────── */
export function makeBlock(type: string): Block {
  switch (type) {
    case "paragraph":
      return { type: "paragraph", text: "" };
    case "heading":
      return { type: "heading", text: "", level: 2 };
    case "image":
      return { type: "image", url: "", alt: "", caption: "", credit: "" };
    case "video":
      return { type: "video", url: "", caption: "", platform: "youtube" };
    case "pullquote":
      return { type: "pullquote", text: "", author: "", role: "" };
    case "factbox":
      return { type: "factbox", title: "En chiffres", facts: [""] };
    case "checklist":
      return {
        type: "checklist",
        title: "",
        items: [{ label: "", detail: "" }],
      };
    case "steps":
      return { type: "steps", title: "", items: [{ label: "", desc: "" }] };
    case "benefits":
      return {
        type: "benefits",
        title: "",
        items: [{ icon: "✓", label: "", value: "", highlight: false }],
      };
    case "compare":
      return {
        type: "compare",
        title: "",
        columns: [{ label: "Option A" }, { label: "Option B" }],
        rows: [{ label: "Critère", values: ["", ""] }],
      };
    case "profile":
      return {
        type: "profile",
        title: "",
        traits: [{ icon: "✦", label: "", description: "" }],
      };
    case "agenda":
      return {
        type: "agenda",
        title: "Programme",
        sessions: [
          { time: "09:00", title: "", speaker: "", tag: "", highlight: false },
        ],
      };
    case "speakers":
      return {
        type: "speakers",
        title: "Intervenants",
        people: [{ name: "", role: "", org: "", emoji: "👤" }],
      };
    case "location":
      return { type: "location", label: "", address: "" };
    case "apply":
      return {
        type: "apply",
        label: "Postuler maintenant",
        url: "",
        note: "",
        deadline: "",
      };
    case "alert":
      return { type: "alert", message: "", variant: "info" };
    case "external":
      return {
        type: "external",
        url: "",
        label: "",
        description: "",
        favicon: "",
      };
    case "related":
      return { type: "related", slug: "", label: "" };
    case "download":
      return { type: "download", url: "", label: "", size: "" };
    case "divider":
      return { type: "divider" };
    default:
      return { type: "paragraph", text: "" };
  }
}

/* ── Icônes SVG ─────────────────────────────────────────── */
const IcoUp = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const IcoDown = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IcoTrash = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);
const IcoPlus = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IcoSearch = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IcoLink = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

/* ══════════════════════════════════════════════════════════
   BLOC : "RELATED" avec recherche d'article
══════════════════════════════════════════════════════════ */
function RelatedBlockEditor({
  block,
  onChange,
}: {
  block: Extract<Block, { type: "related" }>;
  onChange: (b: Block) => void;
}) {
  const sb = createClient();
  const [query, setQuery] = useState(block.label ?? "");
  const [results, setResults] = useState<
    { id: string; title: string; slug: string; category: string }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(""); // entrée URL/slug directe
  const [mode, setMode] = useState<"search" | "url">("search");
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Recherche debounced */
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      setSearching(true);
      const { data } = await (sb.from("articles") as any)
        .select("id,title,slug,category")
        .ilike("title", `%${query}%`)
        .eq("published", true)
        .limit(6);
      setResults(data ?? []);
      setSearching(false);
      setOpen(true);
    }, 280);
    return () => {
      if (debRef.current) clearTimeout(debRef.current);
    };
  }, [query]);

  /* Extraire le slug depuis une URL */
  const extractSlug = (raw: string): string => {
    try {
      const url = new URL(
        raw.startsWith("http") ? raw : `https://x.com/${raw}`,
      );
      const parts = url.pathname.split("/").filter(Boolean);
      return parts[parts.length - 1] ?? raw;
    } catch {
      return (
        raw
          .replace(/^\/+|\/+$/g, "")
          .split("/")
          .pop() ?? raw
      );
    }
  };

  const selectArticle = (a: { title: string; slug: string }) => {
    setQuery(a.title);
    onChange({
      ...block,
      slug: a.slug,
      label: block.label || `À lire aussi : ${a.title}`,
    });
    setOpen(false);
    setResults([]);
  };

  const applyUrl = () => {
    const slug = extractSlug(urlInput.trim());
    onChange({ ...block, slug });
    setUrlInput("");
    setMode("search");
  };

  return (
    <div className="aa-block-body">
      {/* Switcher mode */}
      <div className="bb-related-modes">
        <button
          className={`bb-related-mode-btn ${mode === "search" ? "bb-related-mode-btn--active" : ""}`}
          onClick={() => setMode("search")}
        >
          <IcoSearch /> Recherche par titre
        </button>
        <button
          className={`bb-related-mode-btn ${mode === "url" ? "bb-related-mode-btn--active" : ""}`}
          onClick={() => setMode("url")}
        >
          <IcoLink /> Coller un lien ou slug
        </button>
      </div>

      {/* Mode : recherche */}
      {mode === "search" && (
        <div className="bb-related-search-wrap">
          <label className="aa-field-label">Rechercher un article *</label>
          <div className="bb-related-input-wrap">
            <span className="bb-related-search-icon">
              <IcoSearch />
            </span>
            <input
              className="aa-field bb-related-input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => query.length >= 2 && setOpen(true)}
              placeholder="Tapez le titre de l'article…"
            />
            {searching && <span className="bb-related-spinner" />}
          </div>

          {/* Résultats */}
          {open && results.length > 0 && (
            <div className="bb-related-results">
              {results.map((a) => (
                <button
                  key={a.id}
                  className="bb-related-result-row"
                  onMouseDown={() => selectArticle(a)}
                >
                  <span className="bb-related-result-cat">{a.category}</span>
                  <span className="bb-related-result-title">{a.title}</span>
                  <span className="bb-related-result-slug">/{a.slug}</span>
                </button>
              ))}
            </div>
          )}

          {open && !searching && query.length >= 2 && results.length === 0 && (
            <div className="bb-related-no-result">
              Aucun article trouvé pour « {query} »
            </div>
          )}
        </div>
      )}

      {/* Mode : URL directe */}
      {mode === "url" && (
        <div>
          <label className="aa-field-label">
            URL ou slug de l&apos;article
          </label>
          <div className="bb-related-url-row">
            <input
              className="aa-field"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://afripulse.com/actualites/mon-article  ou  mon-article"
            />
            <button className="bb-related-apply-btn" onClick={applyUrl}>
              Extraire
            </button>
          </div>
          <p className="aa-field-hint">
            Collez l&apos;URL complète ou juste le slug — on extrait
            automatiquement.
          </p>
        </div>
      )}

      {/* Slug sélectionné */}
      {block.slug && (
        <div className="bb-related-selected">
          <span className="bb-related-selected-label">Slug sélectionné :</span>
          <code className="bb-related-selected-slug">{block.slug}</code>
          <button
            className="bb-related-clear"
            onClick={() => {
              onChange({ ...block, slug: "", label: "" });
              setQuery("");
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Label */}
      <div style={{ marginTop: ".75rem" }}>
        <label className="aa-field-label">Label affiché (optionnel)</label>
        <input
          className="aa-field"
          value={block.label ?? ""}
          onChange={(e) => onChange({ ...block, label: e.target.value })}
          placeholder="À lire aussi : titre personnalisé…"
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ÉDITEUR D'UN BLOC
══════════════════════════════════════════════════════════ */
export function BlockEditor({
  block,
  idx,
  total,
  onChange,
  onDelete,
  onMove,
}: {
  block: Block;
  idx: number;
  total: number;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const meta = ALL_BLOCK_TYPES.find((b) => b.type === block.type);

  const header = (
    <div className="aa-block-header">
      <div className="aa-block-header-left">
        <span className="aa-block-header-icon">{meta?.icon ?? "?"}</span>
        <span className="aa-block-type-label">{meta?.label ?? block.type}</span>
        {meta?.desc && <span className="aa-block-type-desc">{meta.desc}</span>}
      </div>
      <div className="aa-block-controls">
        <button
          className="aa-block-ctrl-btn"
          onClick={() => onMove("up")}
          disabled={idx === 0}
          title="Monter"
        >
          <IcoUp />
        </button>
        <button
          className="aa-block-ctrl-btn"
          onClick={() => onMove("down")}
          disabled={idx === total - 1}
          title="Descendre"
        >
          <IcoDown />
        </button>
        <button
          className="aa-block-ctrl-btn aa-block-ctrl-btn--del"
          onClick={onDelete}
          title="Supprimer"
        >
          <IcoTrash />
        </button>
      </div>
    </div>
  );

  const body = (() => {
    switch (block.type) {
      case "paragraph":
        return (
          <div className="aa-block-body">
            <textarea
              className="aa-field aa-field--textarea"
              value={block.text}
              rows={4}
              placeholder="Rédigez votre paragraphe…"
              onChange={(e) => onChange({ ...block, text: e.target.value })}
            />
          </div>
        );

      case "heading":
        return (
          <div className="aa-block-body aa-block-grid2">
            <div>
              <label className="aa-field-label">Texte du titre</label>
              <input
                className="aa-field"
                value={block.text}
                placeholder="Titre de section…"
                onChange={(e) => onChange({ ...block, text: e.target.value })}
              />
            </div>
            <div>
              <label className="aa-field-label">Niveau</label>
              <select
                className="aa-field aa-field--select"
                value={block.level ?? 2}
                onChange={(e) =>
                  onChange({
                    ...block,
                    level: parseInt(e.target.value) as 2 | 3,
                  })
                }
              >
                <option value={2}>H2 — Titre principal</option>
                <option value={3}>H3 — Sous-titre</option>
              </select>
            </div>
          </div>
        );

      case "image":
        return (
          <div className="aa-block-body">
            <label className="aa-field-label">URL de l&apos;image *</label>
            <input
              className="aa-field"
              value={block.url}
              placeholder="https://images.unsplash.com/…"
              onChange={(e) => onChange({ ...block, url: e.target.value })}
            />
            {block.url && (
              <img
                src={block.url}
                alt="aperçu"
                className="aa-block-img-preview"
              />
            )}
            <div className="aa-block-grid2" style={{ marginTop: ".6rem" }}>
              <div>
                <label className="aa-field-label">Texte alternatif *</label>
                <input
                  className="aa-field"
                  value={block.alt}
                  placeholder="Description accessible"
                  onChange={(e) => onChange({ ...block, alt: e.target.value })}
                />
              </div>
              <div>
                <label className="aa-field-label">Crédit photo</label>
                <input
                  className="aa-field"
                  value={block.credit ?? ""}
                  placeholder="© Auteur / Source"
                  onChange={(e) =>
                    onChange({ ...block, credit: e.target.value })
                  }
                />
              </div>
            </div>
            <div style={{ marginTop: ".6rem" }}>
              <label className="aa-field-label">Légende</label>
              <input
                className="aa-field"
                value={block.caption ?? ""}
                placeholder="Légende visible sous l'image…"
                onChange={(e) =>
                  onChange({ ...block, caption: e.target.value })
                }
              />
            </div>
          </div>
        );

      case "video":
        return (
          <div className="aa-block-body">
            <label className="aa-field-label">URL d&apos;embed</label>
            <input
              className="aa-field"
              value={block.url}
              placeholder="https://www.youtube.com/embed/…"
              onChange={(e) => onChange({ ...block, url: e.target.value })}
            />
            <div className="aa-block-grid2" style={{ marginTop: ".6rem" }}>
              <div>
                <label className="aa-field-label">Plateforme</label>
                <select
                  className="aa-field aa-field--select"
                  value={block.platform ?? "youtube"}
                  onChange={(e) =>
                    onChange({ ...block, platform: e.target.value as any })
                  }
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="aa-field-label">Légende</label>
                <input
                  className="aa-field"
                  value={block.caption ?? ""}
                  placeholder="Description de la vidéo"
                  onChange={(e) =>
                    onChange({ ...block, caption: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );

      case "pullquote":
        return (
          <div className="aa-block-body">
            <label className="aa-field-label">Citation *</label>
            <textarea
              className="aa-field aa-field--textarea"
              rows={3}
              value={block.text}
              placeholder="La citation mise en exergue…"
              onChange={(e) => onChange({ ...block, text: e.target.value })}
            />
            <div className="aa-block-grid2" style={{ marginTop: ".6rem" }}>
              <div>
                <label className="aa-field-label">Auteur</label>
                <input
                  className="aa-field"
                  value={block.author ?? ""}
                  placeholder="Nom de la personne"
                  onChange={(e) =>
                    onChange({ ...block, author: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="aa-field-label">Titre / Rôle</label>
                <input
                  className="aa-field"
                  value={block.role ?? ""}
                  placeholder="Fonction, organisation…"
                  onChange={(e) => onChange({ ...block, role: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case "factbox":
        return (
          <div className="aa-block-body">
            <label className="aa-field-label">Titre de l&apos;encadré</label>
            <input
              className="aa-field"
              value={block.title}
              placeholder="En chiffres / Points clés"
              onChange={(e) => onChange({ ...block, title: e.target.value })}
            />
            <label className="aa-field-label" style={{ marginTop: ".6rem" }}>
              Faits — un par ligne
            </label>
            <textarea
              className="aa-field aa-field--textarea"
              rows={5}
              value={block.facts.join("\n")}
              placeholder={
                "55 États signataires\n3,2 Md$ de transactions\nObjectif 2030 : 40 Md$"
              }
              onChange={(e) =>
                onChange({ ...block, facts: e.target.value.split("\n") })
              }
            />
          </div>
        );

      case "checklist":
        return (
          <div className="aa-block-body">
            <label className="aa-field-label">Titre (optionnel)</label>
            <input
              className="aa-field"
              value={block.title ?? ""}
              placeholder="Critères d'éligibilité…"
              onChange={(e) => onChange({ ...block, title: e.target.value })}
            />
            <div className="aa-repeater-list" style={{ marginTop: ".6rem" }}>
              {block.items.map((item, i) => (
                <div key={i} className="aa-repeater-row">
                  <div className="aa-repeater-row-inner">
                    <input
                      className="aa-field aa-repeater-main"
                      value={item.label}
                      placeholder="Élément"
                      onChange={(e) => {
                        const items = [...block.items];
                        items[i] = { ...items[i], label: e.target.value };
                        onChange({ ...block, items });
                      }}
                    />
                    <input
                      className="aa-field aa-repeater-detail"
                      value={item.detail ?? ""}
                      placeholder="Détail (optionnel)"
                      onChange={(e) => {
                        const items = [...block.items];
                        items[i] = { ...items[i], detail: e.target.value };
                        onChange({ ...block, items });
                      }}
                    />
                  </div>
                  <button
                    className="aa-repeater-del"
                    onClick={() =>
                      onChange({
                        ...block,
                        items: block.items.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <IcoTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="aa-repeater-add"
              onClick={() =>
                onChange({
                  ...block,
                  items: [...block.items, { label: "", detail: "" }],
                })
              }
            >
              <IcoPlus /> Ajouter un élément
            </button>
          </div>
        );

      case "steps":
        return (
          <div className="aa-block-body">
            <label className="aa-field-label">Titre (optionnel)</label>
            <input
              className="aa-field"
              value={block.title ?? ""}
              placeholder="Comment postuler…"
              onChange={(e) => onChange({ ...block, title: e.target.value })}
            />
            <div className="aa-repeater-list" style={{ marginTop: ".6rem" }}>
              {block.items.map((item, i) => (
                <div key={i} className="aa-step-row">
                  <div className="aa-step-num">{i + 1}</div>
                  <div className="aa-step-fields">
                    <input
                      className="aa-field"
                      value={item.label}
                      placeholder="Titre de l'étape"
                      onChange={(e) => {
                        const items = [...block.items];
                        items[i] = { ...items[i], label: e.target.value };
                        onChange({ ...block, items });
                      }}
                    />
                    <textarea
                      className="aa-field aa-field--textarea"
                      rows={2}
                      value={item.desc}
                      placeholder="Description…"
                      onChange={(e) => {
                        const items = [...block.items];
                        items[i] = { ...items[i], desc: e.target.value };
                        onChange({ ...block, items });
                      }}
                    />
                  </div>
                  <button
                    className="aa-repeater-del"
                    onClick={() =>
                      onChange({
                        ...block,
                        items: block.items.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <IcoTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="aa-repeater-add"
              onClick={() =>
                onChange({
                  ...block,
                  items: [...block.items, { label: "", desc: "" }],
                })
              }
            >
              <IcoPlus /> Ajouter une étape
            </button>
          </div>
        );

      case "benefits":
        return (
          <div className="aa-block-body">
            <label className="aa-field-label">Titre (optionnel)</label>
            <input
              className="aa-field"
              value={block.title ?? ""}
              placeholder="Ce que comprend…"
              onChange={(e) => onChange({ ...block, title: e.target.value })}
            />
            <div className="aa-repeater-list" style={{ marginTop: ".6rem" }}>
              {block.items.map((item, i) => (
                <div key={i} className="aa-benefit-row">
                  <input
                    className="aa-field aa-field--icon"
                    value={item.icon}
                    placeholder="🎓"
                    maxLength={4}
                    onChange={(e) => {
                      const items = [...block.items];
                      items[i] = { ...items[i], icon: e.target.value };
                      onChange({ ...block, items });
                    }}
                  />
                  <input
                    className="aa-field aa-benefit-label"
                    value={item.label}
                    placeholder="Label"
                    onChange={(e) => {
                      const items = [...block.items];
                      items[i] = { ...items[i], label: e.target.value };
                      onChange({ ...block, items });
                    }}
                  />
                  <input
                    className="aa-field aa-benefit-value"
                    value={item.value}
                    placeholder="Valeur"
                    onChange={(e) => {
                      const items = [...block.items];
                      items[i] = { ...items[i], value: e.target.value };
                      onChange({ ...block, items });
                    }}
                  />
                  <label className="aa-benefit-highlight">
                    <input
                      type="checkbox"
                      checked={item.highlight ?? false}
                      onChange={(e) => {
                        const items = [...block.items];
                        items[i] = { ...items[i], highlight: e.target.checked };
                        onChange({ ...block, items });
                      }}
                    />
                    Vedette
                  </label>
                  <button
                    className="aa-repeater-del"
                    onClick={() =>
                      onChange({
                        ...block,
                        items: block.items.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <IcoTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="aa-repeater-add"
              onClick={() =>
                onChange({
                  ...block,
                  items: [
                    ...block.items,
                    { icon: "✓", label: "", value: "", highlight: false },
                  ],
                })
              }
            >
              <IcoPlus /> Ajouter un avantage
            </button>
          </div>
        );

      case "profile":
        return (
          <div className="aa-block-body">
            <label className="aa-field-label">Titre (optionnel)</label>
            <input
              className="aa-field"
              value={block.title ?? ""}
              placeholder="Profil du candidat idéal…"
              onChange={(e) => onChange({ ...block, title: e.target.value })}
            />
            <div className="aa-repeater-list" style={{ marginTop: ".6rem" }}>
              {block.traits.map((t, i) => (
                <div key={i} className="aa-benefit-row">
                  <input
                    className="aa-field aa-field--icon"
                    value={t.icon}
                    placeholder="✦"
                    maxLength={4}
                    onChange={(e) => {
                      const traits = [...block.traits];
                      traits[i] = { ...traits[i], icon: e.target.value };
                      onChange({ ...block, traits });
                    }}
                  />
                  <input
                    className="aa-field aa-benefit-label"
                    value={t.label}
                    placeholder="Trait"
                    onChange={(e) => {
                      const traits = [...block.traits];
                      traits[i] = { ...traits[i], label: e.target.value };
                      onChange({ ...block, traits });
                    }}
                  />
                  <input
                    className="aa-field aa-benefit-value"
                    value={t.description}
                    placeholder="Description"
                    onChange={(e) => {
                      const traits = [...block.traits];
                      traits[i] = { ...traits[i], description: e.target.value };
                      onChange({ ...block, traits });
                    }}
                  />
                  <button
                    className="aa-repeater-del"
                    onClick={() =>
                      onChange({
                        ...block,
                        traits: block.traits.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <IcoTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="aa-repeater-add"
              onClick={() =>
                onChange({
                  ...block,
                  traits: [
                    ...block.traits,
                    { icon: "✦", label: "", description: "" },
                  ],
                })
              }
            >
              <IcoPlus /> Ajouter un trait
            </button>
          </div>
        );

      case "compare":
        return (
          <div className="aa-block-body">
            <label className="aa-field-label">Titre du tableau</label>
            <input
              className="aa-field"
              value={block.title ?? ""}
              placeholder="Comparaison…"
              onChange={(e) => onChange({ ...block, title: e.target.value })}
            />
            <label className="aa-field-label" style={{ marginTop: ".6rem" }}>
              Colonnes
            </label>
            <div className="aa-compare-cols">
              {block.columns.map((col, ci) => (
                <div key={ci} className="aa-compare-col-row">
                  <input
                    className="aa-field"
                    value={col.label}
                    placeholder={`Colonne ${ci + 1}`}
                    onChange={(e) => {
                      const cols = [...block.columns];
                      cols[ci] = { ...cols[ci], label: e.target.value };
                      onChange({ ...block, columns: cols });
                    }}
                  />
                  <input
                    className="aa-field aa-field--color"
                    type="color"
                    value={col.color ?? "#141410"}
                    onChange={(e) => {
                      const cols = [...block.columns];
                      cols[ci] = { ...cols[ci], color: e.target.value };
                      onChange({ ...block, columns: cols });
                    }}
                  />
                  {block.columns.length > 2 && (
                    <button
                      className="aa-repeater-del"
                      onClick={() => {
                        const cols = block.columns.filter((_, j) => j !== ci);
                        const rows = block.rows.map((r) => ({
                          ...r,
                          values: r.values.filter((_, j) => j !== ci),
                        }));
                        onChange({ ...block, columns: cols, rows });
                      }}
                    >
                      <IcoTrash />
                    </button>
                  )}
                </div>
              ))}
              <button
                className="aa-repeater-add"
                onClick={() =>
                  onChange({
                    ...block,
                    columns: [
                      ...block.columns,
                      { label: `Col ${block.columns.length + 1}` },
                    ],
                    rows: block.rows.map((r) => ({
                      ...r,
                      values: [...r.values, ""],
                    })),
                  })
                }
              >
                <IcoPlus /> Ajouter une colonne
              </button>
            </div>
            <label className="aa-field-label" style={{ marginTop: ".6rem" }}>
              Lignes
            </label>
            {block.rows.map((row, ri) => (
              <div key={ri} className="aa-compare-row">
                <input
                  className="aa-field aa-compare-row-label"
                  value={row.label}
                  placeholder="Critère"
                  onChange={(e) => {
                    const rows = [...block.rows];
                    rows[ri] = { ...rows[ri], label: e.target.value };
                    onChange({ ...block, rows });
                  }}
                />
                {row.values.map((val, vi) => (
                  <input
                    key={vi}
                    className="aa-field aa-compare-row-val"
                    value={val}
                    placeholder={block.columns[vi]?.label ?? `Col${vi + 1}`}
                    onChange={(e) => {
                      const rows = [...block.rows];
                      const values = [...rows[ri].values];
                      values[vi] = e.target.value;
                      rows[ri] = { ...rows[ri], values };
                      onChange({ ...block, rows });
                    }}
                  />
                ))}
                <button
                  className="aa-repeater-del"
                  onClick={() =>
                    onChange({
                      ...block,
                      rows: block.rows.filter((_, j) => j !== ri),
                    })
                  }
                >
                  <IcoTrash />
                </button>
              </div>
            ))}
            <button
              className="aa-repeater-add"
              onClick={() =>
                onChange({
                  ...block,
                  rows: [
                    ...block.rows,
                    { label: "", values: block.columns.map(() => "") },
                  ],
                })
              }
            >
              <IcoPlus /> Ajouter une ligne
            </button>
          </div>
        );

      case "agenda":
        return (
          <div className="aa-block-body">
            <label className="aa-field-label">Titre du programme</label>
            <input
              className="aa-field"
              value={block.title ?? ""}
              placeholder="Programme de la journée…"
              onChange={(e) => onChange({ ...block, title: e.target.value })}
            />
            <div className="aa-repeater-list" style={{ marginTop: ".6rem" }}>
              {block.sessions.map((s, i) => (
                <div key={i} className="aa-agenda-row">
                  <input
                    className="aa-field aa-agenda-time"
                    value={s.time}
                    placeholder="09:00"
                    onChange={(e) => {
                      const sessions = [...block.sessions];
                      sessions[i] = { ...sessions[i], time: e.target.value };
                      onChange({ ...block, sessions });
                    }}
                  />
                  <div className="aa-agenda-right">
                    <div className="aa-block-grid2">
                      <input
                        className="aa-field"
                        value={s.title}
                        placeholder="Titre de la session"
                        onChange={(e) => {
                          const sessions = [...block.sessions];
                          sessions[i] = {
                            ...sessions[i],
                            title: e.target.value,
                          };
                          onChange({ ...block, sessions });
                        }}
                      />
                      <input
                        className="aa-field"
                        value={s.speaker ?? ""}
                        placeholder="Intervenant"
                        onChange={(e) => {
                          const sessions = [...block.sessions];
                          sessions[i] = {
                            ...sessions[i],
                            speaker: e.target.value,
                          };
                          onChange({ ...block, sessions });
                        }}
                      />
                    </div>
                    <div
                      className="aa-block-grid2"
                      style={{ marginTop: ".4rem" }}
                    >
                      <input
                        className="aa-field"
                        value={s.tag ?? ""}
                        placeholder="Tag (ex: Keynote)"
                        onChange={(e) => {
                          const sessions = [...block.sessions];
                          sessions[i] = { ...sessions[i], tag: e.target.value };
                          onChange({ ...block, sessions });
                        }}
                      />
                      <label className="aa-inline-check">
                        <input
                          type="checkbox"
                          checked={s.highlight ?? false}
                          onChange={(e) => {
                            const sessions = [...block.sessions];
                            sessions[i] = {
                              ...sessions[i],
                              highlight: e.target.checked,
                            };
                            onChange({ ...block, sessions });
                          }}
                        />
                        Session en avant
                      </label>
                    </div>
                  </div>
                  <button
                    className="aa-repeater-del"
                    onClick={() =>
                      onChange({
                        ...block,
                        sessions: block.sessions.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <IcoTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="aa-repeater-add"
              onClick={() =>
                onChange({
                  ...block,
                  sessions: [
                    ...block.sessions,
                    {
                      time: "",
                      title: "",
                      speaker: "",
                      tag: "",
                      highlight: false,
                    },
                  ],
                })
              }
            >
              <IcoPlus /> Ajouter une session
            </button>
          </div>
        );

      case "speakers":
        return (
          <div className="aa-block-body">
            <label className="aa-field-label">Titre</label>
            <input
              className="aa-field"
              value={block.title ?? ""}
              placeholder="Intervenants confirmés…"
              onChange={(e) => onChange({ ...block, title: e.target.value })}
            />
            <div className="aa-repeater-list" style={{ marginTop: ".6rem" }}>
              {block.people.map((p, i) => (
                <div key={i} className="aa-speaker-row">
                  <input
                    className="aa-field aa-field--icon"
                    value={p.emoji ?? "👤"}
                    placeholder="👤"
                    maxLength={4}
                    onChange={(e) => {
                      const people = [...block.people];
                      people[i] = { ...people[i], emoji: e.target.value };
                      onChange({ ...block, people });
                    }}
                  />
                  <div className="aa-speaker-fields">
                    <div className="aa-block-grid3">
                      <input
                        className="aa-field"
                        value={p.name}
                        placeholder="Nom"
                        onChange={(e) => {
                          const people = [...block.people];
                          people[i] = { ...people[i], name: e.target.value };
                          onChange({ ...block, people });
                        }}
                      />
                      <input
                        className="aa-field"
                        value={p.role}
                        placeholder="Rôle"
                        onChange={(e) => {
                          const people = [...block.people];
                          people[i] = { ...people[i], role: e.target.value };
                          onChange({ ...block, people });
                        }}
                      />
                      <input
                        className="aa-field"
                        value={p.org ?? ""}
                        placeholder="Organisation"
                        onChange={(e) => {
                          const people = [...block.people];
                          people[i] = { ...people[i], org: e.target.value };
                          onChange({ ...block, people });
                        }}
                      />
                    </div>
                  </div>
                  <button
                    className="aa-repeater-del"
                    onClick={() =>
                      onChange({
                        ...block,
                        people: block.people.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <IcoTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="aa-repeater-add"
              onClick={() =>
                onChange({
                  ...block,
                  people: [
                    ...block.people,
                    { name: "", role: "", org: "", emoji: "👤" },
                  ],
                })
              }
            >
              <IcoPlus /> Ajouter un intervenant
            </button>
          </div>
        );

      case "location":
        return (
          <div className="aa-block-body">
            <div className="aa-block-grid2">
              <div>
                <label className="aa-field-label">Nom du lieu *</label>
                <input
                  className="aa-field"
                  value={block.label}
                  placeholder="Nairobi, Kenya"
                  onChange={(e) =>
                    onChange({ ...block, label: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="aa-field-label">Adresse complète</label>
                <input
                  className="aa-field"
                  value={block.address ?? ""}
                  placeholder="Avenue Jomo Kenyatta, Nairobi"
                  onChange={(e) =>
                    onChange({ ...block, address: e.target.value })
                  }
                />
              </div>
            </div>
            <div style={{ marginTop: ".6rem" }}>
              <label className="aa-field-label">
                URL Google Maps embed (optionnel)
              </label>
              <input
                className="aa-field"
                value={block.mapUrl ?? ""}
                placeholder="https://www.google.com/maps/embed?pb=…"
                onChange={(e) => onChange({ ...block, mapUrl: e.target.value })}
              />
            </div>
          </div>
        );

      case "apply":
        return (
          <div className="aa-block-body">
            <div className="aa-block-grid2">
              <div>
                <label className="aa-field-label">Label du bouton *</label>
                <input
                  className="aa-field"
                  value={block.label}
                  placeholder="Postuler maintenant"
                  onChange={(e) =>
                    onChange({ ...block, label: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="aa-field-label">URL cible *</label>
                <input
                  className="aa-field"
                  value={block.url}
                  placeholder="https://…"
                  onChange={(e) => onChange({ ...block, url: e.target.value })}
                />
              </div>
            </div>
            <div className="aa-block-grid2" style={{ marginTop: ".6rem" }}>
              <div>
                <label className="aa-field-label">Date limite</label>
                <input
                  className="aa-field"
                  value={block.deadline ?? ""}
                  placeholder="31 Mars 2026"
                  onChange={(e) =>
                    onChange({ ...block, deadline: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="aa-field-label">Note complémentaire</label>
                <input
                  className="aa-field"
                  value={block.note ?? ""}
                  placeholder="Dossier uniquement via portail…"
                  onChange={(e) => onChange({ ...block, note: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case "alert":
        return (
          <div className="aa-block-body">
            <div className="aa-block-grid2">
              <div>
                <label className="aa-field-label">Variante</label>
                <select
                  className="aa-field aa-field--select"
                  value={block.variant ?? "info"}
                  onChange={(e) =>
                    onChange({ ...block, variant: e.target.value as any })
                  }
                >
                  <option value="info">ℹ Info — bleu teal</option>
                  <option value="warning">⚠ Avertissement — orange</option>
                  <option value="tip">💡 Conseil — vert</option>
                </select>
              </div>
              <div />
            </div>
            <label className="aa-field-label" style={{ marginTop: ".6rem" }}>
              Message
            </label>
            <textarea
              className="aa-field aa-field--textarea"
              rows={3}
              value={block.message}
              placeholder="Message d'alerte ou de conseil…"
              onChange={(e) => onChange({ ...block, message: e.target.value })}
            />
          </div>
        );

      case "external":
        return (
          <div className="aa-block-body">
            <div className="aa-block-grid2">
              <div>
                <label className="aa-field-label">URL *</label>
                <input
                  className="aa-field"
                  value={block.url}
                  placeholder="https://…"
                  onChange={(e) => onChange({ ...block, url: e.target.value })}
                />
              </div>
              <div>
                <label className="aa-field-label">Label du lien *</label>
                <input
                  className="aa-field"
                  value={block.label}
                  placeholder="Lire le rapport complet"
                  onChange={(e) =>
                    onChange({ ...block, label: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="aa-block-grid2" style={{ marginTop: ".6rem" }}>
              <div>
                <label className="aa-field-label">Description courte</label>
                <input
                  className="aa-field"
                  value={block.description ?? ""}
                  placeholder="Contenu de la ressource…"
                  onChange={(e) =>
                    onChange({ ...block, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="aa-field-label">Favicon / Emoji</label>
                <input
                  className="aa-field"
                  value={block.favicon ?? ""}
                  placeholder="🌐 ou 📄"
                  maxLength={4}
                  onChange={(e) =>
                    onChange({ ...block, favicon: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );

      /* ── Related : composant spécialisé avec recherche ── */
      case "related":
        return <RelatedBlockEditor block={block} onChange={onChange} />;

      case "download":
        return (
          <div className="aa-block-body">
            <div className="aa-block-grid3">
              <div>
                <label className="aa-field-label">URL du fichier *</label>
                <input
                  className="aa-field"
                  value={block.url}
                  placeholder="https://…/fichier.pdf"
                  onChange={(e) => onChange({ ...block, url: e.target.value })}
                />
              </div>
              <div>
                <label className="aa-field-label">Label du bouton *</label>
                <input
                  className="aa-field"
                  value={block.label}
                  placeholder="Télécharger le rapport"
                  onChange={(e) =>
                    onChange({ ...block, label: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="aa-field-label">Taille du fichier</label>
                <input
                  className="aa-field"
                  value={block.size ?? ""}
                  placeholder="2,4 Mo"
                  onChange={(e) => onChange({ ...block, size: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case "divider":
        return (
          <div className="aa-block-body aa-divider-preview">
            <div className="aa-divider-line" />
            <span className="aa-divider-label">Séparateur horizontal</span>
          </div>
        );

      default:
        return (
          <div className="aa-block-body">
            <p className="aa-block-unknown">
              Type non géré : {(block as any).type}
            </p>
          </div>
        );
    }
  })();

  return (
    <div className="aa-block-wrap">
      {header}
      {body}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BLOC BUILDER COMPLET (wrapper avec menu + liste)
══════════════════════════════════════════════════════════ */
export default function BlockBuilder({
  blocks,
  onChange,
  allowedTypes,
  preset = "full",
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  allowedTypes?: string[];
  preset?: keyof typeof BLOCK_PRESETS;
}) {
  const [addMenu, setAddMenu] = useState(false);
  const [searchBloc, setSearchBloc] = useState("");

  const allowed = allowedTypes ?? BLOCK_PRESETS[preset] ?? BLOCK_PRESETS.full;
  const typeList = ALL_BLOCK_TYPES.filter((b) => allowed.includes(b.type));
  const filtered = searchBloc
    ? typeList.filter(
        (b) =>
          b.label.toLowerCase().includes(searchBloc.toLowerCase()) ||
          b.desc.toLowerCase().includes(searchBloc.toLowerCase()),
      )
    : typeList;

  const addBlock = (type: string) => {
    onChange([...blocks, makeBlock(type)]);
    setAddMenu(false);
    setSearchBloc("");
  };
  const updateBlock = (idx: number, b: Block) =>
    onChange(blocks.map((x, i) => (i === idx ? b : x)));
  const deleteBlock = (idx: number) =>
    onChange(blocks.filter((_, i) => i !== idx));
  const moveBlock = (idx: number, dir: "up" | "down") => {
    const arr = [...blocks];
    const t = dir === "up" ? idx - 1 : idx + 1;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    onChange(arr);
  };

  return (
    <div className="bb-wrap">
      {/* En-tête */}
      <div className="aa-blocks-header">
        <span className="aa-section-label" style={{ margin: 0 }}>
          Corps du contenu
        </span>
        <span className="aa-blocks-count">
          {blocks.length} bloc{blocks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Vide */}
      {blocks.length === 0 && (
        <div className="aa-blocks-empty">
          <div className="aa-blocks-empty-icon">✦</div>
          <div className="aa-blocks-empty-label">
            Ajoutez votre premier bloc de contenu
          </div>
        </div>
      )}

      {/* Liste */}
      {blocks.map((block, idx) => (
        <BlockEditor
          key={`${block.type}-${idx}`}
          block={block}
          idx={idx}
          total={blocks.length}
          onChange={(b) => updateBlock(idx, b)}
          onDelete={() => deleteBlock(idx)}
          onMove={(dir) => moveBlock(idx, dir)}
        />
      ))}

      {/* Ajout */}
      <div className="bb-add-wrap">
        <button
          className={`aa-add-block-btn${addMenu ? " open" : ""}`}
          onClick={() => setAddMenu((v) => !v)}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {addMenu ? "Fermer" : "Ajouter un bloc"}
        </button>

        {addMenu && (
          <div className="bb-block-menu-inline">
            <div className="bb-block-menu-search-row">
              <input
                className="aa-field bb-block-menu-search"
                placeholder="Rechercher un type de bloc…"
                value={searchBloc}
                onChange={(e) => setSearchBloc(e.target.value)}
                autoFocus
              />
            </div>
            <div className="bb-block-menu-grid">
              {filtered.map((bt) => (
                <button
                  key={bt.type}
                  className="bb-block-menu-item"
                  onClick={() => addBlock(bt.type)}
                >
                  <span className="bb-menu-icon">{bt.icon}</span>
                  <span className="bb-menu-label">{bt.label}</span>
                  <span className="bb-menu-desc">{bt.desc}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="bb-menu-empty">Aucun résultat</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
