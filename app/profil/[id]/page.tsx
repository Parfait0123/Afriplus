import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/* ================================================================
   Type — uniquement les champs publics du profil
   ================================================================ */
type PublicProfile = {
  id:           string;
  full_name:    string | null;
  avatar_url:   string | null;
  bio:          string | null;
  domain:       string | null;
  level:        string | null;
  country:      string | null;
  city:         string | null;
  linkedin_url: string | null;
  website_url:  string | null;
};

const SELECT_FIELDS =
  "id,full_name,avatar_url,bio,domain,level,country,city,linkedin_url,website_url";

/* ================================================================
   Supabase côté serveur
   ================================================================ */
function getSupabase() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get:    (name: string) => store.get(name)?.value,
        set:    () => {},
        remove: () => {},
      },
    }
  );
}

/* ================================================================
   Metadata Open Graph
   ================================================================ */
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const { data } = await getSupabase()
    .from("profiles")
    .select("full_name,bio,avatar_url")
    .eq("id", params.id)
    .single();

  if (!data) return { title: "Profil introuvable — AfriPulse" };

  const name = data.full_name ?? "Utilisateur AfriPulse";
  return {
    title:       `${name} — AfriPulse`,
    description: data.bio ?? `Découvrez le profil de ${name} sur AfriPulse.`,
    openGraph: {
      title:       `${name} sur AfriPulse`,
      description: data.bio ?? "",
      images:      data.avatar_url ? [{ url: data.avatar_url }] : [],
    },
  };
}

/* ================================================================
   PAGE
   ================================================================ */
export default async function PublicProfilePage(
  { params }: { params: { id: string } }
) {
  const { data: profile } = await getSupabase()
    .from("profiles")
    .select(SELECT_FIELDS)
    .eq("id", params.id)
    .single<PublicProfile>();

  if (!profile) notFound();

  const initials = profile.full_name?.[0]?.toUpperCase() ?? "A";
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const metaLine = [profile.domain, profile.level, location].filter(Boolean).join(" · ");
  const hasInfo  = profile.domain || profile.level || profile.country || profile.city;
  const hasLinks = profile.linkedin_url || profile.website_url;

  return (
    <>
      <Navbar />

      <div className="pp-page">

        {/* ════ HERO ════ */}
        <section className="pp-hero">
          <div className="pp-hero-grid" />
          <div className="pp-hero-glow-l" />
          <div className="pp-hero-glow-r" />

          <div className="pp-hero-inner">

            {/* Avatar */}
            <div className="pp-avatar">
              {profile.avatar_url
                ? <img
                    src={profile.avatar_url}
                    alt={profile.full_name ?? "Avatar"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                : initials
              }
            </div>

            {/* Nom + meta */}
            <div>
              <h1 className="pp-name">
                {profile.full_name ?? "Utilisateur AfriPulse"}
              </h1>
              {metaLine && (
                <p className="pp-meta" style={{ marginTop: "0.6rem" }}>
                  {metaLine}
                </p>
              )}
            </div>

            {/* Badge domaine */}
            {profile.domain && (
              <div className="pp-domain-badge">
                <span className="pp-domain-dot" />
                {profile.domain}
              </div>
            )}

            {/* Boutons LinkedIn / Site dans le hero */}
            {hasLinks && (
              <div className="pp-hero-links">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pp-link-btn pp-link-btn--gold"
                  >
                    <IcoLinkedIn /> LinkedIn
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pp-link-btn pp-link-btn--ghost"
                  >
                    <IcoGlobe /> Site web
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ════ CORPS ════ */}
        <div className="pp-body">

          {/* Bio */}
          {profile.bio && (
            <div className="pp-card" style={{ animationDelay: "0ms" }}>
              <span className="pp-card-label">À propos</span>
              <p className="pp-bio-text">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Informations */}
          {hasInfo && (
            <div className="pp-card" style={{ animationDelay: "60ms" }}>
              <span className="pp-card-label">Informations</span>
              <div className="pp-info-grid">
                {[
                  { k: "Domaine", v: profile.domain  },
                  { k: "Niveau",  v: profile.level   },
                  { k: "Pays",    v: profile.country },
                  { k: "Ville",   v: profile.city    },
                ].filter(i => i.v).map(item => (
                  <div key={item.k}>
                    <div className="pp-info-key">{item.k}</div>
                    <div className="pp-info-val">{item.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liens détaillés */}
          {hasLinks && (
            <div className="pp-card" style={{ animationDelay: "120ms" }}>
              <span className="pp-card-label">Retrouver sur le web</span>
              <div className="pp-links-list">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pp-link-row"
                  >
                    <div className="pp-link-icon pp-link-icon--linkedin">
                      <IcoLinkedIn color="#fff" size={18} />
                    </div>
                    <div className="pp-link-text">
                      <div className="pp-link-name">LinkedIn</div>
                      <div className="pp-link-url">
                        {profile.linkedin_url.replace(/^https?:\/\/(www\.)?/, "")}
                      </div>
                    </div>
                    <IcoArrow className="pp-link-arrow" />
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pp-link-row"
                  >
                    <div className="pp-link-icon pp-link-icon--dark">
                      <IcoGlobe color="#fff" size={18} />
                    </div>
                    <div className="pp-link-text">
                      <div className="pp-link-name">Site web</div>
                      <div className="pp-link-url">
                        {profile.website_url.replace(/^https?:\/\/(www\.)?/, "")}
                      </div>
                    </div>
                    <IcoArrow className="pp-link-arrow" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Encart CTA AfriPulse */}
          <div className="pp-card pp-card--dark" style={{ animationDelay: "180ms" }}>
            <div className="pp-cta-inner">
              <div className="pp-cta-text">
                <div className="pp-cta-title">Rejoins la communauté AfriPulse</div>
                <div className="pp-cta-desc">
                  Bourses, opportunités, événements — tout ce qu'il faut pour avancer.
                </div>
              </div>
              <Link href="/inscription" className="pp-cta-btn">
                S'inscrire gratuitement <IcoArrow color="#141410" />
              </Link>
            </div>
          </div>

          {/* Retour */}
          <div className="pp-back">
            <Link href="/" className="pp-back-link">
              ← Retour sur AfriPulse
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}

/* ================================================================
   ICÔNES SVG
   ================================================================ */
function IcoLinkedIn({ color = "currentColor", size = 14 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function IcoGlobe({ color = "currentColor", size = 14 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function IcoArrow({ color = "currentColor", className }: { color?: string; className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}