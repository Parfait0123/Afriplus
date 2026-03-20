/**
 * scripts/seed-articles.ts
 * Migre les données de lib/data.ts vers Supabase
 *
 * Usage :
 *   npx ts-node --project tsconfig.json scripts/seed-articles.ts
 *
 * Prérequis :
 *   NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role pour bypass RLS
  { auth: { persistSession: false } }
);

// ── Helpers ────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseDate(dateStr: string): string {
  // "27 Fév 2026" → ISO string
  const months: Record<string, number> = {
    "Jan": 0, "Fév": 1, "Mar": 2, "Avr": 3, "Mai": 4, "Jun": 5,
    "Jul": 6, "Aoû": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Déc": 11,
  };
  const parts = dateStr.split(" ");
  if (parts.length === 3) {
    const day   = parseInt(parts[0]);
    const month = months[parts[1]] ?? 0;
    const year  = parseInt(parts[2]);
    return new Date(year, month, day).toISOString();
  }
  return new Date().toISOString();
}

// ── Import inline des données (évite les imports de modules TS) ─
// Copie simplifiée — dans la pratique, importer depuis lib/data.ts
// avec ts-node résout les alias @/

async function seedArticles() {
  console.log("🌱 Début du seed articles...\n");

  // Importer dynamiquement (ts-node doit résoudre les paths)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { articles } = require("../lib/data") as { articles: any[] };

  const rows = articles.map((a) => ({
    slug:           a.slug,
    title:          a.title,
    excerpt:        a.excerpt,
    content:        a.content,              // JSONB — objet direct
    category:       a.category,
    author_name:    a.author,
    reading_time:   a.readTime,
    featured:       a.featured,
    image_gradient: a.imageGradient,
    cover_url:      null,
    tags:           [],
    published:      true,
    published_at:   parseDate(a.date),
    views:          0,
    saves_count:    0,
    shares_count:   0,
  }));

  const { data, error } = await sb
    .from("articles")
    .upsert(rows, { onConflict: "slug", ignoreDuplicates: false })
    .select("id, slug");

  if (error) {
    console.error("❌ Erreur articles :", error.message);
    return;
  }
  console.log(`✅ ${data?.length ?? 0} articles insérés/mis à jour`);
}

async function seedScholarships() {
  console.log("\n🌱 Seed bourses...");
  const { scholarships } = require("../lib/data") as { scholarships: any[] };

  const rows = scholarships.map((s) => ({
    slug:           s.slug,
    title:          s.title,
    organization:   s.organization,
    country:        s.country,
    flag:           s.flag,
    level:          s.level,
    domain:         s.domain,
    deadline:       s.deadline,
    urgent:         s.urgent,
    amount:         s.amount ?? null,
    image_gradient: s.imageGradient,
    tags:           s.tags ?? [],
    content:        { intro: "", blocks: s.blocks ?? [] },
    apply_url:      s.applyUrl ?? null,
    published:      true,
    published_at:   new Date().toISOString(),
  }));

  const { data, error } = await sb
    .from("scholarships")
    .upsert(rows, { onConflict: "slug" })
    .select("id, slug");

  if (error) {
    console.error("❌ Erreur bourses :", error.message);
    return;
  }
  console.log(`✅ ${data?.length ?? 0} bourses insérées/mises à jour`);
}

async function seedOpportunities() {
  console.log("\n🌱 Seed opportunités...");
  const { opportunities } = require("../lib/data") as { opportunities: any[] };

  const rows = opportunities.map((o) => ({
    slug:             o.slug,
    title:            o.title,
    company:          o.company,
    company_initials: o.companyInitials,
    location:         o.location,
    country:          o.country ?? "",
    flag:             o.flag ?? "🌍",
    type:             o.type,
    sector:           o.sector ?? "",
    description:      o.description ?? null,
    skills:           o.skills ?? [],
    deadline:         o.deadline ?? null,
    posted_at:        o.postedAt ?? null,
    salary:           o.salary ?? null,
    remote:           o.remote ?? false,
    featured:         o.featured ?? false,
    image_gradient:   o.imageGradient,
    apply_url:        o.applyUrl ?? null,
    content:          { intro: "", blocks: o.blocks ?? [] },
    published:        true,
    published_at:     new Date().toISOString(),
  }));

  const { data, error } = await sb
    .from("opportunities")
    .upsert(rows, { onConflict: "slug" })
    .select("id, slug");

  if (error) {
    console.error("❌ Erreur opportunités :", error.message);
    return;
  }
  console.log(`✅ ${data?.length ?? 0} opportunités insérées/mises à jour`);
}

async function seedEvents() {
  console.log("\n🌱 Seed événements...");
  const { events } = require("../lib/data") as { events: any[] };

  const rows = events.map((e) => ({
    slug:           e.slug,
    title:          e.title,
    type:           e.type,
    location:       e.location,
    country:        e.country ?? "",
    flag:           e.flag ?? "🌍",
    event_date:     e.dateISO,
    excerpt:        e.excerpt ?? null,
    organizer:      e.organizer ?? null,
    attendees:      e.attendees ?? null,
    image_gradient: e.imageGradient,
    tags:           e.tags ?? [],
    featured:       e.featured ?? false,
    event_url:      e.eventUrl ?? null,
    content:        { intro: "", blocks: e.blocks ?? [] },
    published:      true,
    published_at:   new Date().toISOString(),
  }));

  const { data, error } = await sb
    .from("events")
    .upsert(rows, { onConflict: "slug" })
    .select("id, slug");

  if (error) {
    console.error("❌ Erreur événements :", error.message);
    return;
  }
  console.log(`✅ ${data?.length ?? 0} événements insérés/mis à jour`);
}

// ── Main ────────────────────────────────────────────────────
(async () => {
  await seedArticles();
  await seedScholarships();
  await seedOpportunities();
  await seedEvents();
  console.log("\n✨ Seed terminé !");
})();