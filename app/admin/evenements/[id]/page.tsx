"use client";

/**
 * app/admin/evenements/[id]/page.tsx
 * Éditeur événement — données réelles Supabase
 * Route /admin/evenements/nouveau pour créer
 * Route /admin/evenements/:id pour éditer
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BlockBuilder from "@/components/admin/BlockBuilder";
import type { Block } from "@/types/blocks";

/* ── Types ── */
type EventType =
  | "Conférence"
  | "Forum"
  | "Hackathon"
  | "Salon"
  | "Atelier"
  | "Sommet";

interface EventForm {
  slug: string;
  title: string;
  type: EventType;
  location: string;
  country: string;
  flag: string;
  event_date: string;
  description: string;
  organizer: string;
  attendees: string;
  register_url: string;
  cover_url: string;
  image_gradient: string;
  grad_color1: string;
  grad_color2: string;
  grad_angle: number;
  meta_title: string;
  meta_desc: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  content: Block[];
}

/* ── Config ── */
const EVENT_TYPES: EventType[] = [
  "Conférence",
  "Forum",
  "Hackathon",
  "Salon",
  "Atelier",
  "Sommet",
];

const TYPE_GRADIENT: Record<
  EventType,
  { g: string; c1: string; c2: string; angle: number }
> = {
  Conférence: {
    g: "linear-gradient(135deg,#001420 0%,#003a58 100%)",
    c1: "#001420",
    c2: "#003a58",
    angle: 135,
  },
  Forum: {
    g: "linear-gradient(135deg,#0f1a00 0%,#2c4c00 100%)",
    c1: "#0f1a00",
    c2: "#2c4c00",
    angle: 135,
  },
  Hackathon: {
    g: "linear-gradient(135deg,#001a10 0%,#004830 100%)",
    c1: "#001a10",
    c2: "#004830",
    angle: 135,
  },
  Salon: {
    g: "linear-gradient(135deg,#1a0a00 0%,#481e00 100%)",
    c1: "#1a0a00",
    c2: "#481e00",
    angle: 135,
  },
  Atelier: {
    g: "linear-gradient(135deg,#0a0a1a 0%,#1e1e3c 100%)",
    c1: "#0a0a1a",
    c2: "#1e1e3c",
    angle: 135,
  },
  Sommet: {
    g: "linear-gradient(135deg,#1a0818 0%,#481848 100%)",
    c1: "#1a0818",
    c2: "#481848",
    angle: 135,
  },
};

const TYPE_COLOR: Record<string, string> = {
  Conférence: "#1E4DA8",
  Forum: "#1A5C40",
  Hackathon: "#7A1E4A",
  Salon: "#9B6B1A",
  Atelier: "#2D6B6B",
  Sommet: "#141410",
};

/* ══════════════════════════════════════════════════════════
   LISTE COMPLÈTE DES PAYS DU MONDE + DRAPEAUX AUTO
══════════════════════════════════════════════════════════ */
const COUNTRIES: { name: string; flag: string }[] = [
  { name: "Afghanistan", flag: "🇦🇫" },
  { name: "Afrique du Sud", flag: "🇿🇦" },
  { name: "Albanie", flag: "🇦🇱" },
  { name: "Algérie", flag: "🇩🇿" },
  { name: "Allemagne", flag: "🇩🇪" },
  { name: "Andorre", flag: "🇦🇩" },
  { name: "Angola", flag: "🇦🇴" },
  { name: "Arabie saoudite", flag: "🇸🇦" },
  { name: "Argentine", flag: "🇦🇷" },
  { name: "Arménie", flag: "🇦🇲" },
  { name: "Australie", flag: "🇦🇺" },
  { name: "Autriche", flag: "🇦🇹" },
  { name: "Azerbaïdjan", flag: "🇦🇿" },
  { name: "Bahamas", flag: "🇧🇸" },
  { name: "Bahreïn", flag: "🇧🇭" },
  { name: "Bangladesh", flag: "🇧🇩" },
  { name: "Belgique", flag: "🇧🇪" },
  { name: "Belize", flag: "🇧🇿" },
  { name: "Bénin", flag: "🇧🇯" },
  { name: "Bhoutan", flag: "🇧🇹" },
  { name: "Biélorussie", flag: "🇧🇾" },
  { name: "Bolivie", flag: "🇧🇴" },
  { name: "Bosnie-Herzégovine", flag: "🇧🇦" },
  { name: "Botswana", flag: "🇧🇼" },
  { name: "Brésil", flag: "🇧🇷" },
  { name: "Bulgarie", flag: "🇧🇬" },
  { name: "Burkina Faso", flag: "🇧🇫" },
  { name: "Burundi", flag: "🇧🇮" },
  { name: "Cabo Verde", flag: "🇨🇻" },
  { name: "Cambodge", flag: "🇰🇭" },
  { name: "Cameroun", flag: "🇨🇲" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Centrafrique", flag: "🇨🇫" },
  { name: "Chili", flag: "🇨🇱" },
  { name: "Chine", flag: "🇨🇳" },
  { name: "Chypre", flag: "🇨🇾" },
  { name: "Colombie", flag: "🇨🇴" },
  { name: "Comores", flag: "🇰🇲" },
  { name: "Congo (Brazzaville)", flag: "🇨🇬" },
  { name: "Congo (Kinshasa)", flag: "🇨🇩" },
  { name: "Corée du Nord", flag: "🇰🇵" },
  { name: "Corée du Sud", flag: "🇰🇷" },
  { name: "Costa Rica", flag: "🇨🇷" },
  { name: "Côte d'Ivoire", flag: "🇨🇮" },
  { name: "Croatie", flag: "🇭🇷" },
  { name: "Cuba", flag: "🇨🇺" },
  { name: "Danemark", flag: "🇩🇰" },
  { name: "Djibouti", flag: "🇩🇯" },
  { name: "Égypte", flag: "🇪🇬" },
  { name: "Émirats arabes unis", flag: "🇦🇪" },
  { name: "Équateur", flag: "🇪🇨" },
  { name: "Érythrée", flag: "🇪🇷" },
  { name: "Espagne", flag: "🇪🇸" },
  { name: "Eswatini", flag: "🇸🇿" },
  { name: "Estonie", flag: "🇪🇪" },
  { name: "Éthiopie", flag: "🇪🇹" },
  { name: "Fidji", flag: "🇫🇯" },
  { name: "Finlande", flag: "🇫🇮" },
  { name: "France", flag: "🇫🇷" },
  { name: "Gabon", flag: "🇬🇦" },
  { name: "Gambie", flag: "🇬🇲" },
  { name: "Géorgie", flag: "🇬🇪" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Grèce", flag: "🇬🇷" },
  { name: "Guatemala", flag: "🇬🇹" },
  { name: "Guinée", flag: "🇬🇳" },
  { name: "Guinée-Bissau", flag: "🇬🇼" },
  { name: "Guinée équatoriale", flag: "🇬🇶" },
  { name: "Guyana", flag: "🇬🇾" },
  { name: "Haïti", flag: "🇭🇹" },
  { name: "Honduras", flag: "🇭🇳" },
  { name: "Hongrie", flag: "🇭🇺" },
  { name: "Inde", flag: "🇮🇳" },
  { name: "Indonésie", flag: "🇮🇩" },
  { name: "Irak", flag: "🇮🇶" },
  { name: "Iran", flag: "🇮🇷" },
  { name: "Irlande", flag: "🇮🇪" },
  { name: "Islande", flag: "🇮🇸" },
  { name: "Israël", flag: "🇮🇱" },
  { name: "Italie", flag: "🇮🇹" },
  { name: "Jamaïque", flag: "🇯🇲" },
  { name: "Japon", flag: "🇯🇵" },
  { name: "Jordanie", flag: "🇯🇴" },
  { name: "Kazakhstan", flag: "🇰🇿" },
  { name: "Kenya", flag: "🇰🇪" },
  { name: "Kirghizistan", flag: "🇰🇬" },
  { name: "Kosovo", flag: "🇽🇰" },
  { name: "Koweït", flag: "🇰🇼" },
  { name: "Laos", flag: "🇱🇦" },
  { name: "Lesotho", flag: "🇱🇸" },
  { name: "Lettonie", flag: "🇱🇻" },
  { name: "Liban", flag: "🇱🇧" },
  { name: "Liberia", flag: "🇱🇷" },
  { name: "Libye", flag: "🇱🇾" },
  { name: "Liechtenstein", flag: "🇱🇮" },
  { name: "Lituanie", flag: "🇱🇹" },
  { name: "Luxembourg", flag: "🇱🇺" },
  { name: "Madagascar", flag: "🇲🇬" },
  { name: "Malaisie", flag: "🇲🇾" },
  { name: "Malawi", flag: "🇲🇼" },
  { name: "Maldives", flag: "🇲🇻" },
  { name: "Mali", flag: "🇲🇱" },
  { name: "Malte", flag: "🇲🇹" },
  { name: "Maroc", flag: "🇲🇦" },
  { name: "Maurice", flag: "🇲🇺" },
  { name: "Mauritanie", flag: "🇲🇷" },
  { name: "Mexique", flag: "🇲🇽" },
  { name: "Moldavie", flag: "🇲🇩" },
  { name: "Monaco", flag: "🇲🇨" },
  { name: "Mongolie", flag: "🇲🇳" },
  { name: "Monténégro", flag: "🇲🇪" },
  { name: "Mozambique", flag: "🇲🇿" },
  { name: "Myanmar", flag: "🇲🇲" },
  { name: "Namibie", flag: "🇳🇦" },
  { name: "Népal", flag: "🇳🇵" },
  { name: "Nicaragua", flag: "🇳🇮" },
  { name: "Niger", flag: "🇳🇪" },
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "Norvège", flag: "🇳🇴" },
  { name: "Nouvelle-Zélande", flag: "🇳🇿" },
  { name: "Oman", flag: "🇴🇲" },
  { name: "Ouganda", flag: "🇺🇬" },
  { name: "Ouzbékistan", flag: "🇺🇿" },
  { name: "Pakistan", flag: "🇵🇰" },
  { name: "Panama", flag: "🇵🇦" },
  { name: "Paraguay", flag: "🇵🇾" },
  { name: "Pays-Bas", flag: "🇳🇱" },
  { name: "Pérou", flag: "🇵🇪" },
  { name: "Philippines", flag: "🇵🇭" },
  { name: "Pologne", flag: "🇵🇱" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Qatar", flag: "🇶🇦" },
  { name: "République dominicaine", flag: "🇩🇴" },
  { name: "Roumanie", flag: "🇷🇴" },
  { name: "Royaume-Uni", flag: "🇬🇧" },
  { name: "Russie", flag: "🇷🇺" },
  { name: "Rwanda", flag: "🇷🇼" },
  { name: "Salvador", flag: "🇸🇻" },
  { name: "Sénégal", flag: "🇸🇳" },
  { name: "Serbie", flag: "🇷🇸" },
  { name: "Seychelles", flag: "🇸🇨" },
  { name: "Sierra Leone", flag: "🇸🇱" },
  { name: "Singapour", flag: "🇸🇬" },
  { name: "Slovaquie", flag: "🇸🇰" },
  { name: "Slovénie", flag: "🇸🇮" },
  { name: "Somalie", flag: "🇸🇴" },
  { name: "Soudan", flag: "🇸🇩" },
  { name: "Soudan du Sud", flag: "🇸🇸" },
  { name: "Sri Lanka", flag: "🇱🇰" },
  { name: "Suède", flag: "🇸🇪" },
  { name: "Suisse", flag: "🇨🇭" },
  { name: "Suriname", flag: "🇸🇷" },
  { name: "Syrie", flag: "🇸🇾" },
  { name: "Tadjikistan", flag: "🇹🇯" },
  { name: "Tanzanie", flag: "🇹🇿" },
  { name: "Tchad", flag: "🇹🇩" },
  { name: "Tchéquie", flag: "🇨🇿" },
  { name: "Thaïlande", flag: "🇹🇭" },
  { name: "Togo", flag: "🇹🇬" },
  { name: "Tunisie", flag: "🇹🇳" },
  { name: "Turkménistan", flag: "🇹🇲" },
  { name: "Turquie", flag: "🇹🇷" },
  { name: "Ukraine", flag: "🇺🇦" },
  { name: "Uruguay", flag: "🇺🇾" },
  { name: "États-Unis", flag: "🇺🇸" },
  { name: "Venezuela", flag: "🇻🇪" },
  { name: "Viêt Nam", flag: "🇻🇳" },
  { name: "Yémen", flag: "🇾🇪" },
  { name: "Zambie", flag: "🇿🇲" },
  { name: "Zimbabwe", flag: "🇿🇼" },
  { name: "International / En ligne", flag: "🌍" },
];

/* ── Icônes ── */
const IcoArrow = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const IcoSave = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const IcoEye = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcoPlus = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
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
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const IcoUpload = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

/* ── Helpers ── */
function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function buildGradient(c1: string, c2: string, angle: number) {
  return `linear-gradient(${angle}deg,${c1} 0%,${c2} 100%)`;
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE — ÉDITEUR
══════════════════════════════════════════════════════════ */
export default function AdminEventEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const isNew = params.id === "nouveau";
  const sb = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">(
    "content",
  );
  const [countrySearch, setCountrySearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<EventForm>({
    slug: "",
    title: "",
    type: "Conférence",
    location: "",
    country: "",
    flag: "🌍",
    event_date: "",
    description: "",
    organizer: "",
    attendees: "",
    register_url: "",
    cover_url: "",
    image_gradient: TYPE_GRADIENT["Conférence"].g,
    grad_color1: TYPE_GRADIENT["Conférence"].c1,
    grad_color2: TYPE_GRADIENT["Conférence"].c2,
    grad_angle: 135,
    meta_title: "",
    meta_desc: "",
    tags: [],
    featured: false,
    published: false,
    content: [],
  });

  /* ── Fermer suggestions pays au clic extérieur ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        countryRef.current &&
        !countryRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Chargement ── */
  useEffect(() => {
    if (isNew) return;
    (async () => {
      setLoading(true);
      const { data, error } = (await sb
        .from("events")
        .select("*")
        .eq("id", params.id)
        .single()) as { data: any; error: any };
      if (!error && data) {
        let parsedContent: Block[] = [];
        if (data.content) {
          try {
            parsedContent =
              typeof data.content === "string"
                ? JSON.parse(data.content)
                : data.content;
          } catch {
            parsedContent = [];
          }
        }
        const tg =
          TYPE_GRADIENT[data.type as EventType] ?? TYPE_GRADIENT["Conférence"];
        setForm({
          slug: data.slug ?? "",
          title: data.title ?? "",
          type: (data.type as EventType) ?? "Conférence",
          location: data.location ?? "",
          country: data.country ?? "",
          flag: data.flag ?? "🌍",
          event_date: data.event_date ?? "",
          description: data.description ?? "",
          organizer: data.organizer ?? "",
          attendees: data.attendees ?? "",
          register_url: data.register_url ?? "",
          cover_url: data.cover_url ?? "",
          image_gradient: data.image_gradient ?? tg.g,
          grad_color1: tg.c1,
          grad_color2: tg.c2,
          grad_angle: tg.angle,
          meta_title: data.meta_title ?? "",
          meta_desc: data.meta_desc ?? "",
          tags: data.tags ?? [],
          featured: data.featured ?? false,
          published: data.published ?? false,
          content: parsedContent,
        });
        setCountrySearch(data.country ?? "");
      }
      setLoading(false);
    })();
  }, [params.id, isNew, sb]);

  const handleTitleChange = (val: string) =>
    setForm((f) => ({ ...f, title: val, slug: isNew ? slugify(val) : f.slug }));

  const handleTypeChange = (type: EventType) => {
    const tg = TYPE_GRADIENT[type];
    setForm((f) => ({
      ...f,
      type,
      image_gradient: tg.g,
      grad_color1: tg.c1,
      grad_color2: tg.c2,
      grad_angle: tg.angle,
    }));
  };

  const handleCountrySelect = (c: { name: string; flag: string }) => {
    setForm((f) => ({ ...f, country: c.name, flag: c.flag }));
    setCountrySearch(c.name);
    setShowSuggestions(false);
  };

  const handleGradientChange = (c1: string, c2: string, angle: number) =>
    setForm((f) => ({
      ...f,
      grad_color1: c1,
      grad_color2: c2,
      grad_angle: angle,
      image_gradient: buildGradient(c1, c2, angle),
    }));

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await sb.storage
        .from("events")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = sb.storage.from("events").getPublicUrl(path);
      setForm((f) => ({ ...f, cover_url: urlData.publicUrl }));
    } catch {
      setSaveMsg({ type: "error", text: "Erreur upload image." });
    } finally {
      setUploadingCover(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t))
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };
  const removeTag = (tag: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  /* ── Sauvegarde ── */
  const save = async (publishOverride?: boolean) => {
    if (publishOverride !== undefined) setPublishing(true);
    else setSaving(true);
    setSaveMsg(null);

    let day = "",
      month = "",
      year = "";
    if (form.event_date) {
      const d = new Date(form.event_date);
      day = String(d.getDate()).padStart(2, "0");
      month = d.toLocaleDateString("fr-FR", { month: "short" });
      year = String(d.getFullYear());
    }

    const payload: Record<string, any> = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      type: form.type,
      location: form.location,
      country: form.country,
      flag: form.flag,
      event_date: form.event_date || null,
      day,
      month,
      year,
      description: form.description || null,
      organizer: form.organizer || null,
      attendees: form.attendees || null,
      register_url: form.register_url || null,
      cover_url: form.cover_url || null,
      image_gradient: form.image_gradient,
      tags: form.tags,
      featured: form.featured,
      published:
        publishOverride !== undefined ? publishOverride : form.published,
      meta_title: form.meta_title || null,
      meta_desc: form.meta_desc || null,
      content: form.content,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isNew) {
        payload.created_at = new Date().toISOString();
        const { data, error } = await (sb.from("events") as any)
          .insert(payload as any)
          .select("id")
          .single();
        if (error) throw error;
        setSaveMsg({ type: "success", text: "Événement créé !" });
        setTimeout(() => router.push(`/admin/evenements/${data.id}`), 900);
      } else {
        if (publishOverride !== undefined)
          setForm((f) => ({ ...f, published: publishOverride }));
        const { error } = await (sb.from("events") as any)
          .update(payload)
          .eq("id", params.id);
        if (error) throw error;
        setSaveMsg({
          type: "success",
          text:
            publishOverride !== undefined
              ? publishOverride
                ? "Publié !"
                : "Dépublié !"
              : "Sauvegardé !",
        });
      }
    } catch (err: any) {
      setSaveMsg({
        type: "error",
        text: err.message ?? "Erreur lors de la sauvegarde.",
      });
    } finally {
      setSaving(false);
      setPublishing(false);
      setTimeout(() => setSaveMsg(null), 3500);
    }
  };

  /* ── Styles partagés ── */
  const inp: React.CSSProperties = {
    width: "100%",
    padding: ".7rem .95rem",
    borderRadius: 10,
    border: "1.5px solid rgba(20,20,16,.12)",
    background: "#F8F6F1",
    fontSize: ".85rem",
    color: "#141410",
    outline: "none",
    fontFamily: "inherit",
    transition: "border .18s",
    boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    display: "block",
    fontSize: ".63rem",
    fontWeight: 700,
    letterSpacing: ".1em",
    textTransform: "uppercase",
    color: "#928E80",
    marginBottom: ".38rem",
  };
  const section: React.CSSProperties = {
    background: "#fff",
    borderRadius: 14,
    border: "1px solid rgba(20,20,16,.08)",
    padding: "1.6rem",
    marginBottom: "1.25rem",
    boxShadow: "0 1px 8px rgba(20,20,16,.04)",
  };
  const sectionTitle: React.CSSProperties = {
    fontSize: ".63rem",
    fontWeight: 800,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    color: "#928E80",
    marginBottom: "1.1rem",
    paddingBottom: ".6rem",
    borderBottom: "1px solid rgba(20,20,16,.07)",
  };

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()),
  ).slice(0, 7);

  const typeColor = TYPE_COLOR[form.type] ?? "#141410";

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F5F3EE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "3px solid rgba(20,20,16,.08)",
              borderTopColor: "#C08435",
              animation: "spin .8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "#928E80", fontSize: ".85rem" }}>
            Chargement de l'événement…
          </p>
          <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .aee-input:focus { border-color:#C08435 !important; }
        .aee-tab {
          padding:.55rem 1.1rem; border:none; background:none; cursor:pointer;
          font-size:.8rem; font-weight:700; letter-spacing:.04em;
          border-bottom:2px solid transparent; transition:all .18s; color:rgba(248,246,241,.4);
        }
        .aee-tab.active { color:#F8F6F1; border-bottom-color:#C08435; }
        .aee-tab:hover:not(.active) { color:rgba(248,246,241,.7); }
        .aee-btn {
          display:inline-flex; align-items:center; gap:.45rem;
          padding:.65rem 1.25rem; border-radius:10px; border:none; cursor:pointer;
          font-size:.82rem; font-weight:700; letter-spacing:.04em; transition:all .18s;
        }
        .aee-btn:disabled { opacity:.55; cursor:not-allowed; }
        @keyframes aee-spin { to { transform:rotate(360deg); } }
        .aee-spinner {
          width:14px; height:14px; border-radius:50%;
          border:2px solid rgba(255,255,255,.3); border-top-color:#fff;
          animation:aee-spin .7s linear infinite; display:inline-block;
        }
        .aee-toast {
          position:fixed; bottom:1.5rem; right:1.5rem; z-index:9999;
          padding:.8rem 1.35rem; border-radius:12px; font-size:.85rem; font-weight:700;
          box-shadow:0 8px 32px rgba(0,0,0,.18); animation:aee-toast-in .25s ease;
        }
        @keyframes aee-toast-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .aee-cover-zone {
          border:2px dashed rgba(20,20,16,.15); border-radius:12px;
          cursor:pointer; transition:border-color .2s,background .2s; text-align:center;
        }
        .aee-cover-zone:hover { border-color:#C08435; background:rgba(192,132,53,.03); }
        .aee-country-opt {
          display:flex; align-items:center; gap:.65rem;
          padding:.58rem .9rem; cursor:pointer; border-radius:8px;
          transition:background .12s; font-size:.85rem; color:#141410;
        }
        .aee-country-opt:hover { background:#F0EDE4; }
        .aee-swatch {
          width:30px; height:30px; border-radius:8px; cursor:pointer; flex-shrink:0;
          border:2.5px solid transparent; transition:border-color .15s,box-shadow .15s;
        }
        .aee-swatch:hover { border-color:#C08435; }
        .aee-swatch.active { border-color:#C08435; box-shadow:0 0 0 2px rgba(192,132,53,.3); }
        .aee-header-title {
          width:100%; padding:.55rem 0; background:transparent; border:none;
          border-bottom:1.5px solid rgba(248,246,241,.12); border-radius:0;
          color:#F8F6F1; font-weight:900; letter-spacing:-.03em;
          font-family:"Fraunces",Georgia,serif; outline:none;
          transition:border-color .2s; box-sizing:border-box;
          font-size:clamp(1.4rem,2.5vw,1.85rem);
        }
        .aee-header-title:focus { border-bottom-color:#C08435; }
        .aee-header-title::placeholder { color:rgba(248,246,241,.3); }
        .aee-header-desc {
          width:100%; padding:.5rem 0; background:transparent; border:none;
          border-bottom:1.5px solid rgba(248,246,241,.08); border-radius:0;
          color:rgba(248,246,241,.55); font-size:.95rem; font-family:inherit;
          outline:none; resize:none; transition:border-color .2s; box-sizing:border-box;
        }
        .aee-header-desc:focus { border-bottom-color:#C08435; }
        .aee-header-desc::placeholder { color:rgba(248,246,241,.25); }
      `}</style>

      {/* Toast */}
      {saveMsg && (
        <div
          className="aee-toast"
          style={{
            background: saveMsg.type === "success" ? "#1A5C40" : "#B8341E",
            color: "#fff",
          }}
        >
          {saveMsg.type === "success" ? "✓" : "✕"} {saveMsg.text}
        </div>
      )}

      <div style={{ background: "#F5F3EE", minHeight: "100vh" }}>
        {/* ══ BARRE SUPÉRIEURE STICKY ══ */}
        <div
          style={{
            background: "#141410",
            borderBottom: "3px solid #C08435",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: 1380,
              margin: "0 auto",
              padding: "0 clamp(1rem,3vw,2.5rem)",
            }}
          >
            {/* Ligne 1 : fil d'Ariane + actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem 0 .6rem",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/admin/evenements"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".4rem",
                  fontSize: ".78rem",
                  fontWeight: 700,
                  color: "rgba(248,246,241,.4)",
                  textDecoration: "none",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(248,246,241,.75)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(248,246,241,.4)")
                }
              >
                <IcoArrow /> Événements
              </Link>
              <span style={{ color: "rgba(248,246,241,.2)" }}>›</span>
              <span
                style={{
                  fontSize: ".75rem",
                  fontWeight: 800,
                  color: "#C08435",
                  letterSpacing: ".06em",
                }}
              >
                {isNew
                  ? "Nouvel événement"
                  : form.title.slice(0, 40) || "Éditer"}
              </span>
              <span
                style={{
                  fontSize: ".6rem",
                  fontWeight: 800,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  padding: ".2rem .7rem",
                  borderRadius: 100,
                  background: form.published
                    ? "rgba(26,92,64,.4)"
                    : "rgba(248,246,241,.1)",
                  color: form.published ? "#6FCF97" : "rgba(248,246,241,.45)",
                }}
              >
                {form.published ? "● Publié" : "○ Brouillon"}
              </span>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  gap: ".6rem",
                  flexWrap: "wrap",
                }}
              >
                {!isNew && (
                  <Link
                    href={`/evenements/${form.slug}?preview=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button
                      className="aee-btn"
                      style={{
                        background: "rgba(248,246,241,.1)",
                        color: "rgba(248,246,241,.7)",
                        border: "1px solid rgba(248,246,241,.15)",
                      }}
                    >
                      <IcoEye /> Prévisualiser
                    </button>
                  </Link>
                )}
                <button
                  className="aee-btn"
                  disabled={saving || publishing}
                  onClick={() => save()}
                  style={{
                    background: "rgba(248,246,241,.12)",
                    color: "#F8F6F1",
                    border: "1px solid rgba(248,246,241,.18)",
                  }}
                >
                  {saving ? <span className="aee-spinner" /> : <IcoSave />}
                  {saving ? "Sauvegarde…" : "Sauvegarder"}
                </button>
                <button
                  className="aee-btn"
                  disabled={saving || publishing}
                  onClick={() => save(!form.published)}
                  style={{
                    background: form.published ? "#B8341E" : "#C08435",
                    color: "#fff",
                  }}
                >
                  {publishing ? <span className="aee-spinner" /> : null}
                  {publishing
                    ? "En cours…"
                    : form.published
                      ? "Dépublier"
                      : "Publier"}
                </button>
              </div>
            </div>

            {/* ── Titre & description — toujours visibles quelque soit l'onglet ── */}
            <div
              style={{
                padding: ".6rem 0 .85rem",
                borderTop: "1px solid rgba(248,246,241,.07)",
              }}
            >
              <input
                className="aee-header-title"
                value={form.title}
                placeholder="Titre de l'événement…"
                onChange={(e) => handleTitleChange(e.target.value)}
              />
              <textarea
                className="aee-header-desc"
                value={form.description}
                placeholder="Description courte affiché dans les listes et cartes…"
                rows={2}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                style={{ marginTop: ".45rem" }}
              />
            </div>

            {/* Onglets */}
            <div style={{ display: "flex" }}>
              {(["content", "seo", "settings"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`aee-tab${activeTab === tab ? " active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "content"
                    ? "Contenu"
                    : tab === "seo"
                      ? "SEO & Meta"
                      : "Paramètres"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══ CORPS ══ */}
        <div
          style={{
            maxWidth: 1380,
            margin: "0 auto",
            padding: "2rem clamp(1rem,3vw,2.5rem)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: "1.5rem",
              alignItems: "start",
            }}
          >
            {/* ── Colonne principale ── */}
            <div>
              {/* ════ CONTENU ════ */}
              {activeTab === "content" && (
                <>
                  <div style={section}>
                    <p style={sectionTitle}>Informations générales</p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.1rem",
                      }}
                    >
                      {/* Type + Date */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "1rem",
                        }}
                      >
                        <div>
                          <label style={lbl}>Type d'événement *</label>
                          <select
                            className="aee-input"
                            style={{ ...inp, appearance: "auto" }}
                            value={form.type}
                            onChange={(e) =>
                              handleTypeChange(e.target.value as EventType)
                            }
                          >
                            {EVENT_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}>Date de l'événement *</label>
                          <input
                            type="date"
                            className="aee-input"
                            style={inp}
                            value={form.event_date}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                event_date: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Pays — sélecteur avec drapeau automatique */}
                      <div ref={countryRef} style={{ position: "relative" }}>
                        <label style={lbl}>
                          Pays — le drapeau est généré automatiquement
                        </label>
                        <div
                          style={{
                            display: "flex",
                            gap: ".65rem",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 10,
                              background: "#F0EDE4",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.6rem",
                              flexShrink: 0,
                              border: "1.5px solid rgba(20,20,16,.1)",
                            }}
                          >
                            {form.flag}
                          </div>
                          <input
                            className="aee-input"
                            style={{ ...inp, flex: 1 }}
                            value={countrySearch}
                            placeholder="Tapez le nom d'un pays…"
                            autoComplete="off"
                            onChange={(e) => {
                              setCountrySearch(e.target.value);
                              setForm((f) => ({
                                ...f,
                                country: e.target.value,
                              }));
                              setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                          />
                        </div>
                        {showSuggestions &&
                          countrySearch.length > 0 &&
                          filteredCountries.length > 0 && (
                            <div
                              style={{
                                position: "absolute",
                                top: "calc(100% + .3rem)",
                                left: 52,
                                right: 0,
                                zIndex: 50,
                                background: "#fff",
                                borderRadius: 12,
                                border: "1px solid rgba(20,20,16,.1)",
                                boxShadow: "0 8px 28px rgba(20,20,16,.12)",
                                padding: ".4rem",
                              }}
                            >
                              {filteredCountries.map((c) => (
                                <div
                                  key={c.name}
                                  className="aee-country-opt"
                                  onMouseDown={() => handleCountrySelect(c)}
                                >
                                  <span style={{ fontSize: "1.3rem" }}>
                                    {c.flag}
                                  </span>
                                  <span>{c.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      {/* Ville + Participants */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "1rem",
                        }}
                      >
                        <div>
                          <label style={lbl}>Ville / Lieu *</label>
                          <input
                            className="aee-input"
                            style={inp}
                            value={form.location}
                            placeholder="ex : Nairobi"
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                location: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label style={lbl}>Participants attendus</label>
                          <input
                            className="aee-input"
                            style={inp}
                            value={form.attendees}
                            placeholder="ex : 5 000+"
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                attendees: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Organisateur + URL inscription */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "1rem",
                        }}
                      >
                        <div>
                          <label style={lbl}>Organisateur</label>
                          <input
                            className="aee-input"
                            style={inp}
                            value={form.organizer}
                            placeholder="ex : AfricaTech Foundation"
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                organizer: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label style={lbl}>URL d'inscription directe</label>
                          <input
                            className="aee-input"
                            style={inp}
                            value={form.register_url}
                            placeholder="https://…"
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                register_url: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blocs via BlockBuilder — exactement comme les pages bourses */}
                  <div style={section}>
                    <p style={sectionTitle}>Contenu éditorial</p>
                    <BlockBuilder
                      blocks={form.content}
                      onChange={(blocks) =>
                        setForm((f) => ({ ...f, content: blocks }))
                      }
                      preset="event"
                    />
                  </div>
                </>
              )}

              {/* ════ SEO — le slug est ici ════ */}
              {activeTab === "seo" && (
                <div style={section}>
                  <p style={sectionTitle}>SEO & Métadonnées</p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.1rem",
                    }}
                  >
                    {/* Slug */}
                    <div>
                      <label style={lbl}>Slug URL</label>
                      <div style={{ position: "relative" }}>
                        <span
                          style={{
                            position: "absolute",
                            left: ".9rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#928E80",
                            fontSize: ".78rem",
                            pointerEvents: "none",
                          }}
                        >
                          /evenements/
                        </span>
                        <input
                          className="aee-input"
                          style={{ ...inp, paddingLeft: "8.2rem" }}
                          value={form.slug}
                          placeholder="slug-url"
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              slug: slugify(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <p
                        style={{
                          fontSize: ".65rem",
                          color: "#928E80",
                          marginTop: ".3rem",
                        }}
                      >
                        Auto-généré depuis le titre. Un changement de slug après
                        publication casse les liens existants.
                      </p>
                    </div>

                    {/* Meta title */}
                    <div>
                      <label style={lbl}>Meta Title</label>
                      <input
                        className="aee-input"
                        style={inp}
                        value={form.meta_title}
                        placeholder={`${form.title || "Titre"} | AroMe`}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, meta_title: e.target.value }))
                        }
                      />
                      <p
                        style={{
                          fontSize: ".65rem",
                          color:
                            form.meta_title.length > 60 ? "#B8341E" : "#928E80",
                          marginTop: ".3rem",
                        }}
                      >
                        {form.meta_title.length} / 60 caractères recommandés
                      </p>
                    </div>

                    {/* Meta desc */}
                    <div>
                      <label style={lbl}>Meta Description</label>
                      <textarea
                        className="aee-input"
                        style={{ ...inp, minHeight: 90, resize: "vertical" }}
                        value={form.meta_desc}
                        placeholder={
                          form.description
                            ? form.description.slice(0, 155)
                            : "Description pour les moteurs de recherche…"
                        }
                        onChange={(e) =>
                          setForm((f) => ({ ...f, meta_desc: e.target.value }))
                        }
                      />
                      <p
                        style={{
                          fontSize: ".65rem",
                          color:
                            form.meta_desc.length > 155 ? "#B8341E" : "#928E80",
                          marginTop: ".3rem",
                        }}
                      >
                        {form.meta_desc.length} / 155 caractères recommandés
                      </p>
                    </div>

                    {/* Aperçu SERP */}
                    <div>
                      <label style={lbl}>Aperçu Google (SERP)</label>
                      <div
                        style={{
                          background: "#FAFAF8",
                          border: "1px solid rgba(20,20,16,.1)",
                          borderRadius: 10,
                          padding: "1rem 1.25rem",
                        }}
                      >
                        <div
                          style={{
                            fontSize: ".72rem",
                            color: "#928E80",
                            marginBottom: ".2rem",
                          }}
                        >
                          afripulse.com › evenements › {form.slug || "slug-url"}
                        </div>
                        <div
                          style={{
                            fontSize: ".95rem",
                            color: "#1a0dab",
                            fontWeight: 700,
                            marginBottom: ".25rem",
                            lineHeight: 1.3,
                          }}
                        >
                          {form.meta_title ||
                            form.title ||
                            "Titre de l'événement"}{" "}
                          | AroMe
                        </div>
                        <div
                          style={{
                            fontSize: ".82rem",
                            color: "#545454",
                            lineHeight: 1.55,
                          }}
                        >
                          {form.meta_desc ||
                            form.description ||
                            "Description de l'événement qui apparaîtra dans les résultats de recherche."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ PARAMÈTRES ════ */}
              {activeTab === "settings" && (
                <>
                  {/* Image + Gradient — réunis */}
                  <div style={section}>
                    <p style={sectionTitle}>Image & Fond visuel</p>

                    <label style={{ ...lbl, marginBottom: ".5rem" }}>
                      Image de couverture
                    </label>
                    {form.cover_url ? (
                      <div
                        style={{
                          position: "relative",
                          borderRadius: 10,
                          overflow: "hidden",
                          marginBottom: "1rem",
                        }}
                      >
                        <img
                          src={form.cover_url}
                          alt="Cover"
                          style={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <button
                          onClick={() =>
                            setForm((f) => ({ ...f, cover_url: "" }))
                          }
                          style={{
                            position: "absolute",
                            top: ".5rem",
                            right: ".5rem",
                            background: "rgba(0,0,0,.65)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: ".3rem .75rem",
                            fontSize: ".75rem",
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          ✕ Supprimer
                        </button>
                      </div>
                    ) : (
                      <div
                        className="aee-cover-zone"
                        style={{ padding: "2rem 1rem", marginBottom: ".75rem" }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadingCover ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: ".5rem",
                            }}
                          >
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                border: "3px solid rgba(192,132,53,.2)",
                                borderTopColor: "#C08435",
                                animation: "aee-spin .8s linear infinite",
                              }}
                            />
                            <span
                              style={{ fontSize: ".78rem", color: "#928E80" }}
                            >
                              Upload en cours…
                            </span>
                          </div>
                        ) : (
                          <>
                            <div
                              style={{
                                color: "#C4C0B6",
                                marginBottom: ".5rem",
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <IcoUpload />
                            </div>
                            <p
                              style={{
                                fontSize: ".85rem",
                                fontWeight: 700,
                                color: "#38382E",
                                marginBottom: ".2rem",
                              }}
                            >
                              Cliquez pour uploader une image
                            </p>
                            <p style={{ fontSize: ".7rem", color: "#928E80" }}>
                              JPG, PNG ou WebP · max 5 Mo · 1200×628 recommandé
                            </p>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      className="aee-input"
                      style={{ ...inp, marginBottom: "1.5rem" }}
                      value={form.cover_url}
                      placeholder="Ou collez une URL d'image externe…"
                      onChange={(e) =>
                        setForm((f) => ({ ...f, cover_url: e.target.value }))
                      }
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleCoverUpload}
                    />

                    {/* ── Constructeur de gradient ── */}
                    <div
                      style={{
                        borderTop: "1px solid rgba(20,20,16,.07)",
                        paddingTop: "1.25rem",
                      }}
                    >
                      <label style={{ ...lbl, marginBottom: ".5rem" }}>
                        Couleur de fond (visible sans image)
                      </label>
                      <p
                        style={{
                          fontSize: ".72rem",
                          color: "#928E80",
                          marginBottom: "1rem",
                          lineHeight: 1.55,
                        }}
                      >
                        Choisissez deux couleurs et une direction — le dégradé
                        est calculé automatiquement.
                      </p>

                      {/* Présets rapides */}
                      <div style={{ marginBottom: "1.1rem" }}>
                        <div style={{ ...lbl, marginBottom: ".5rem" }}>
                          Présets par type d'événement
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: ".45rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {EVENT_TYPES.map((t) => {
                            const tg = TYPE_GRADIENT[t];
                            const isActive =
                              form.grad_color1 === tg.c1 &&
                              form.grad_color2 === tg.c2;
                            return (
                              <button
                                key={t}
                                title={t}
                                onClick={() =>
                                  handleGradientChange(tg.c1, tg.c2, tg.angle)
                                }
                                className={`aee-swatch${isActive ? " active" : ""}`}
                                style={{ background: tg.g }}
                              >
                                <span style={{ display: "none" }}>{t}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Couleurs + angle */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: ".85rem",
                          alignItems: "end",
                        }}
                      >
                        <div>
                          <label style={lbl}>Couleur 1</label>
                          <div
                            style={{
                              display: "flex",
                              gap: ".5rem",
                              alignItems: "center",
                            }}
                          >
                            <input
                              type="color"
                              value={form.grad_color1}
                              onChange={(e) =>
                                handleGradientChange(
                                  e.target.value,
                                  form.grad_color2,
                                  form.grad_angle,
                                )
                              }
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 8,
                                border: "1.5px solid rgba(20,20,16,.12)",
                                cursor: "pointer",
                                padding: 2,
                              }}
                            />
                            <input
                              className="aee-input"
                              style={{
                                ...inp,
                                fontFamily: "monospace",
                                fontSize: ".75rem",
                              }}
                              value={form.grad_color1}
                              onChange={(e) =>
                                handleGradientChange(
                                  e.target.value,
                                  form.grad_color2,
                                  form.grad_angle,
                                )
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label style={lbl}>Couleur 2</label>
                          <div
                            style={{
                              display: "flex",
                              gap: ".5rem",
                              alignItems: "center",
                            }}
                          >
                            <input
                              type="color"
                              value={form.grad_color2}
                              onChange={(e) =>
                                handleGradientChange(
                                  form.grad_color1,
                                  e.target.value,
                                  form.grad_angle,
                                )
                              }
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 8,
                                border: "1.5px solid rgba(20,20,16,.12)",
                                cursor: "pointer",
                                padding: 2,
                              }}
                            />
                            <input
                              className="aee-input"
                              style={{
                                ...inp,
                                fontFamily: "monospace",
                                fontSize: ".75rem",
                              }}
                              value={form.grad_color2}
                              onChange={(e) =>
                                handleGradientChange(
                                  form.grad_color1,
                                  e.target.value,
                                  form.grad_angle,
                                )
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label style={lbl}>
                            Direction — {form.grad_angle}°
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={360}
                            step={15}
                            value={form.grad_angle}
                            onChange={(e) =>
                              handleGradientChange(
                                form.grad_color1,
                                form.grad_color2,
                                Number(e.target.value),
                              )
                            }
                            style={{
                              width: "100%",
                              accentColor: "#C08435",
                              marginBottom: ".25rem",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: ".62rem",
                              color: "#928E80",
                            }}
                          >
                            <span>0°</span>
                            <span>180°</span>
                            <span>360°</span>
                          </div>
                        </div>
                      </div>

                      {/* Aperçu gradient live */}
                      <div
                        style={{
                          marginTop: "1rem",
                          height: 64,
                          borderRadius: 10,
                          background: form.image_gradient,
                          border: "1px solid rgba(20,20,16,.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: ".65rem",
                            fontWeight: 700,
                            color: "rgba(255,255,255,.5)",
                            letterSpacing: ".1em",
                            textTransform: "uppercase",
                          }}
                        >
                          Aperçu du fond
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Publication & paramètres */}
                  <div style={section}>
                    <p style={sectionTitle}>Publication & Paramètres</p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.1rem",
                      }}
                    >
                      {[
                        {
                          key: "published",
                          label: "Publication",
                          desc: "Rendre cet événement visible sur le site",
                          activeColor: "#1A5C40",
                        },
                        {
                          key: "featured",
                          label: "Événement vedette ★",
                          desc: "Mis en avant dans la section principale",
                          activeColor: "#C08435",
                        },
                      ].map(({ key, label, desc, activeColor }) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: ".9rem 1rem",
                            background: "#FAFAF8",
                            borderRadius: 10,
                            border: "1px solid rgba(20,20,16,.08)",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: ".88rem",
                                color: "#141410",
                              }}
                            >
                              {label}
                            </div>
                            <div
                              style={{ fontSize: ".7rem", color: "#928E80" }}
                            >
                              {desc}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setForm((f: any) => ({ ...f, [key]: !f[key] }))
                            }
                            style={{
                              position: "relative",
                              width: 44,
                              height: 26,
                              borderRadius: 100,
                              border: "none",
                              cursor: "pointer",
                              background: (form as any)[key]
                                ? activeColor
                                : "rgba(20,20,16,.2)",
                              transition: "background .2s",
                              flexShrink: 0,
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: "#fff",
                                top: 3,
                                transition: "transform .2s",
                                transform: (form as any)[key]
                                  ? "translateX(21px)"
                                  : "translateX(3px)",
                                boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                              }}
                            />
                          </button>
                        </div>
                      ))}

                      {/* Tags */}
                      <div>
                        <label style={lbl}>Tags</label>
                        <div
                          style={{
                            display: "flex",
                            gap: ".5rem",
                            flexWrap: "wrap",
                            marginBottom: ".6rem",
                          }}
                        >
                          {form.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: ".3rem",
                                padding: ".25rem .8rem",
                                borderRadius: 100,
                                background: "#F0EDE4",
                                color: "#38382E",
                                fontSize: ".72rem",
                                fontWeight: 700,
                              }}
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#928E80",
                                  padding: 0,
                                  lineHeight: 1,
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: ".5rem" }}>
                          <input
                            className="aee-input"
                            style={{ ...inp, flex: 1 }}
                            value={tagInput}
                            placeholder="Ajouter un tag…"
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addTag();
                              }
                            }}
                          />
                          <button
                            className="aee-btn"
                            onClick={addTag}
                            style={{
                              background: "#F0EDE4",
                              color: "#38382E",
                              border: "1px solid rgba(20,20,16,.12)",
                              flexShrink: 0,
                            }}
                          >
                            <IcoPlus /> Ajouter
                          </button>
                        </div>
                      </div>

                      {/* Danger zone */}
                      {!isNew && (
                        <div
                          style={{
                            padding: "1rem",
                            background: "#FAEBE8",
                            borderRadius: 10,
                            border: "1px solid rgba(184,52,30,.15)",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: ".85rem",
                              color: "#B8341E",
                              marginBottom: ".4rem",
                            }}
                          >
                            Zone dangereuse
                          </div>
                          <p
                            style={{
                              fontSize: ".72rem",
                              color: "#B8341E",
                              marginBottom: ".75rem",
                              opacity: 0.85,
                            }}
                          >
                            Cette action est irréversible. L'événement et tout
                            son contenu seront définitivement supprimés.
                          </p>
                          <button
                            className="aee-btn"
                            style={{ background: "#B8341E", color: "#fff" }}
                            onClick={async () => {
                              if (
                                !confirm(
                                  `Supprimer définitivement « ${form.title} » ? Cette action est irréversible.`,
                                )
                              )
                                return;
                              const { error } = await sb
                                .from("events")
                                .delete()
                                .eq("id", params.id);
                              if (!error) router.push("/admin/evenements");
                            }}
                          >
                            <IcoTrash /> Supprimer définitivement
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Sidebar droite (sticky) ── */}
            <div style={{ position: "sticky", top: 200 }}>
              {/* Aperçu carte live */}
              <div
                style={{
                  ...section,
                  padding: 0,
                  overflow: "hidden",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    height: 130,
                    background: form.image_gradient,
                    position: "relative",
                  }}
                >
                  {form.cover_url && (
                    <img
                      src={form.cover_url}
                      alt=""
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,.78) 0%, transparent 65%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: ".9rem",
                      left: ".9rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: ".58rem",
                        fontWeight: 800,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        padding: ".22rem .68rem",
                        borderRadius: 100,
                        background: typeColor,
                        color: "#fff",
                      }}
                    >
                      {form.type}
                    </span>
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      top: ".75rem",
                      right: ".85rem",
                      fontSize: "1.6rem",
                    }}
                  >
                    {form.flag}
                  </span>
                </div>
                <div style={{ padding: "1rem 1.1rem" }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: ".9rem",
                      color: "#141410",
                      marginBottom: ".35rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {form.title || (
                      <span style={{ color: "#C4C0B6" }}>
                        Titre de l'événement
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: ".68rem",
                      color: "#928E80",
                      display: "flex",
                      flexDirection: "column",
                      gap: ".2rem",
                    }}
                  >
                    {form.event_date && (
                      <span>
                        📅{" "}
                        {new Date(form.event_date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {(form.location || form.country) && (
                      <span>
                        📍{" "}
                        {[form.location, form.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                    {form.organizer && <span>🏛️ {form.organizer}</span>}
                    {form.attendees && (
                      <span>👥 {form.attendees} participants</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Publication rapide */}
              <div style={section}>
                <p style={sectionTitle}>Publication</p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ".72rem",
                  }}
                >
                  {[
                    {
                      label: "Statut",
                      val: form.published ? "● Publié" : "○ Brouillon",
                      col: form.published ? "#1A5C40" : "#928E80",
                    },
                    {
                      label: "Vedette",
                      val: form.featured ? "★ Oui" : "Non",
                      col: form.featured ? "#C08435" : "#928E80",
                    },
                    {
                      label: "Blocs",
                      val: `${form.content.length} bloc${form.content.length !== 1 ? "s" : ""}`,
                      col: "#38382E",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: ".8rem",
                      }}
                    >
                      <span style={{ color: "#928E80" }}>{row.label}</span>
                      <span style={{ fontWeight: 700, color: row.col }}>
                        {row.val}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      height: 1,
                      background: "rgba(20,20,16,.07)",
                      margin: ".1rem 0",
                    }}
                  />
                  <button
                    className="aee-btn"
                    disabled={saving || publishing}
                    onClick={() => save()}
                    style={{
                      background: "#F0EDE4",
                      color: "#38382E",
                      width: "100%",
                      justifyContent: "center",
                      border: "1px solid rgba(20,20,16,.1)",
                    }}
                  >
                    {saving ? (
                      <span
                        className="aee-spinner"
                        style={{ borderTopColor: "#38382E" }}
                      />
                    ) : (
                      <IcoSave />
                    )}
                    {saving ? "Sauvegarde…" : "Sauvegarder"}
                  </button>
                  <button
                    className="aee-btn"
                    disabled={saving || publishing}
                    onClick={() => save(!form.published)}
                    style={{
                      background: form.published ? "#B8341E" : "#C08435",
                      color: "#fff",
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    {publishing ? <span className="aee-spinner" /> : null}
                    {publishing
                      ? "En cours…"
                      : form.published
                        ? "Dépublier"
                        : "Publier l'événement"}
                  </button>
                </div>
              </div>

              {/* Conseils */}
              <div style={{ ...section, fontSize: ".75rem", color: "#928E80" }}>
                <p style={{ ...sectionTitle, marginBottom: ".75rem" }}>
                  Conseils éditoriaux
                </p>
                <ul
                  style={{ margin: 0, padding: "0 0 0 1rem", lineHeight: 1.9 }}
                >
                  <li>
                    Bloc <strong style={{ color: "#38382E" }}>Programme</strong>{" "}
                    pour le planning détaillé
                  </li>
                  <li>
                    <strong style={{ color: "#38382E" }}>Intervenants</strong>{" "}
                    pour les speakers
                  </li>
                  <li>
                    <strong style={{ color: "#38382E" }}>
                      Inscription CTA
                    </strong>{" "}
                    pour le bouton d'appel
                  </li>
                  <li>
                    <strong style={{ color: "#38382E" }}>Lieu</strong> pour la
                    carte intégrée
                  </li>
                  <li>
                    Le slug se configure dans l'onglet{" "}
                    <strong style={{ color: "#38382E" }}>SEO & Meta</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
