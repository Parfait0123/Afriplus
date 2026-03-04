import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterBand from "@/components/sections/NewsletterBand";
import { scholarships } from "@/lib/data";

export async function generateStaticParams() {
  return scholarships.map((s) => ({ slug: s.slug }));
}

const LEVEL_STYLE: Record<string, { color: string; bg: string }> = {
  "Licence":           { color: "#1E4DA8", bg: "#EBF0FB" },
  "Master":            { color: "#1A5C40", bg: "#EAF4EF" },
  "Doctorat":          { color: "#7A1E4A", bg: "#F9EBF3" },
  "Postdoc":           { color: "#9B6B1A", bg: "#FBF4E8" },
  "Toutes formations": { color: "#141410", bg: "#F0EDE4" },
};

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between",
      alignItems:"baseline", gap:"1rem", padding:"0.88rem 0",
      borderBottom:"1px solid rgba(20,20,16,.07)" }}>
      <span style={{ fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.1em",
        textTransform:"uppercase", color:"#928E80", flexShrink:0 }}>
        {label}
      </span>
      <span style={{ fontSize:"0.88rem", fontWeight:600, textAlign:"right",
        color: accent ? "#1A5C40" : "#141410" }}>
        {value}
      </span>
    </div>
  );
}

function CheckItem({ text, icon = "✓", color = "#1A5C40" }:
  { text: string; icon?: string; color?: string }) {
  return (
    <li style={{ display:"flex", gap:"0.75rem", alignItems:"flex-start",
      fontSize:"0.9rem", fontWeight:300, color:"#38382E", lineHeight:1.65 }}>
      <span style={{ fontFamily:"'Fraunces', Georgia, serif", fontWeight:900,
        color, flexShrink:0, marginTop:"0.08rem", fontSize:"0.88rem" }}>
        {icon}
      </span>
      {text}
    </li>
  );
}

export default function BourseDetailPage({ params }: { params: { slug: string } }) {
  const sc = scholarships.find((s) => s.slug === params.slug);
  if (!sc) notFound();

  const related = scholarships
    .filter((s) => s.id !== sc.id && s.level === sc.level)
    .slice(0, 3)
    .concat(scholarships.filter((s) => s.id !== sc.id))
    .slice(0, 3);

  const ls = LEVEL_STYLE[sc.level] ?? LEVEL_STYLE["Toutes formations"];

  return (
    <>
      <Navbar />

      {/* ══════════════════════════════════════════════
          HERO pleine largeur
      ══════════════════════════════════════════════ */}
      <div style={{ paddingTop:62 }}>
        <div style={{ position:"relative",
          height:"clamp(340px,45vh,500px)", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background: sc.imageGradient }}/>
          <div style={{ position:"absolute", inset:0,
            background:"linear-gradient(160deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.78) 100%)" }}/>

          {/* Flag décoratif fantôme */}
          <div style={{ position:"absolute", top:"-1rem", right:"-0.5rem",
            fontSize:"clamp(10rem,22vw,18rem)", lineHeight:1,
            opacity:0.07, pointerEvents:"none", userSelect:"none" }}>
            {sc.flag}
          </div>

          {/* Contenu */}
          <div style={{ position:"absolute", inset:0, display:"flex",
            flexDirection:"column", justifyContent:"flex-end",
            padding:"clamp(1.5rem,4vw,3rem) clamp(1.5rem,5vw,4rem)",
            maxWidth:1380, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>

            {/* Breadcrumb */}
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem",
              fontSize:"0.62rem", color:"rgba(255,255,255,.4)",
              fontWeight:600, letterSpacing:"0.06em", marginBottom:"1.25rem" }}>
              <Link href="/" style={{ color:"rgba(255,255,255,.4)",
                textDecoration:"none" }}>Accueil</Link>
              <span>/</span>
              <Link href="/bourses" style={{ color:"rgba(255,255,255,.4)",
                textDecoration:"none" }}>Bourses</Link>
              <span>/</span>
              <span style={{ color:"rgba(255,255,255,.65)" }}>{sc.organization}</span>
            </div>

            {/* Badges */}
            <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap",
              marginBottom:"1rem" }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem",
                fontSize:"0.55rem", fontWeight:800, letterSpacing:"0.12em",
                textTransform:"uppercase", padding:"0.25rem 0.75rem", borderRadius:100,
                background: ls.bg, color: ls.color }}>
                <span style={{ width:5, height:5, borderRadius:"50%",
                  background: ls.color, flexShrink:0 }}/>
                {sc.level}
              </span>
              <span style={{ display:"inline-flex", alignItems:"center", gap:"0.35rem",
                fontSize:"0.55rem", fontWeight:800, letterSpacing:"0.1em",
                textTransform:"uppercase", padding:"0.25rem 0.75rem", borderRadius:100,
                background: sc.urgent ? "#B8341E" : "rgba(26,92,64,.9)",
                color:"#fff" }}>
                <span style={{ width:5, height:5, borderRadius:"50%",
                  background:"rgba(255,255,255,.6)", flexShrink:0 }}/>
                {sc.urgent ? "Clôture imminente" : "Candidatures ouvertes"}
              </span>
            </div>

            {/* Titre */}
            <h1 style={{ fontFamily:"'Fraunces', Georgia, serif",
              fontSize:"clamp(1.7rem,3.5vw,3rem)", fontWeight:900,
              letterSpacing:"-0.035em", lineHeight:1.05, color:"#fff",
              margin:"0 0 1rem", maxWidth:780 }}>
              {sc.title}
            </h1>

            {/* Méta */}
            <div style={{ display:"flex", alignItems:"center",
              gap:"1.25rem", flexWrap:"wrap" }}>
              <span style={{ display:"flex", alignItems:"center", gap:"0.5rem",
                fontSize:"0.72rem", fontWeight:700,
                color:"rgba(255,255,255,.85)" }}>
                <span style={{ fontSize:"1.1rem" }}>{sc.flag}</span>
                {sc.country}
              </span>
              <span style={{ width:3, height:3, borderRadius:"50%",
                background:"rgba(255,255,255,.25)" }}/>
              <span style={{ fontSize:"0.72rem", fontWeight:500,
                color:"rgba(255,255,255,.6)" }}>
                {sc.organization}
              </span>
              {sc.amount && <>
                <span style={{ width:3, height:3, borderRadius:"50%",
                  background:"rgba(255,255,255,.25)" }}/>
                <span style={{ fontSize:"0.72rem", fontWeight:700, color:"#E8B86D" }}>
                  💰 {sc.amount}
                </span>
              </>}
            </div>
          </div>

          {/* Ligne or */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
            background:"linear-gradient(90deg,#C08435 0%,#E8B86D 50%,#C08435 100%)" }}/>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          CORPS 2 colonnes (classes sl-*)
      ══════════════════════════════════════════════ */}
      <div style={{ background:"#F8F6F1", padding:"3.5rem 0 5rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto",
          padding:"0 clamp(1.5rem,5vw,3rem)" }}>
          <div className="sl-layout">

            {/* ── COLONNE PRINCIPALE ── */}
            <div className="sl-main">

              {/* Chapô */}
              <p className="sl-lead">
                La {sc.title} est une opportunité proposée par {sc.organization} pour
                soutenir des étudiants africains ambitieux dans un parcours de{" "}
                {sc.level.toLowerCase()} en {sc.domain}, au {sc.country}.
              </p>

              {/* Actions */}
              <div style={{ display:"flex", gap:"0.5rem", marginTop:"1.75rem",
                paddingBottom:"1.75rem",
                borderBottom:"1px solid rgba(20,20,16,.08)" }}>
                <button className="sl-btn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
                  </svg>
                  Partager
                </button>
                <button className="sl-btn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                  </svg>
                  Sauvegarder
                </button>
              </div>

              <div className="sl-body">

                <h2 className="sl-h2">À propos de cette bourse</h2>
                <p className="sl-p">
                  La {sc.title} est proposée par {sc.organization} pour soutenir des étudiants
                  africains ambitieux dans leurs projets académiques à l&apos;international.
                  Couvrant le niveau {sc.level.toLowerCase()}, ce programme se distingue par
                  son accompagnement complet et l&apos;accès à un réseau mondial d&apos;anciens
                  boursiers actifs dans tous les secteurs.
                </p>
                <p className="sl-p">
                  Les candidats retenus bénéficient non seulement d&apos;un financement complet,
                  mais aussi d&apos;un mentorat personnalisé, d&apos;ateliers de développement
                  professionnel et d&apos;opportunités de networking avec des partenaires
                  institutionnels et privés de premier plan en {sc.country}.
                </p>

                {/* Chiffres clés */}
                <div className="sl-keyfacts"
                  style={{ borderColor: ls.color, background: ls.bg + "66" }}>
                  <div style={{ fontSize:"0.6rem", fontWeight:800, letterSpacing:"0.15em",
                    textTransform:"uppercase", color: ls.color, marginBottom:"1.25rem" }}>
                    Chiffres clés
                  </div>
                  <div className="sl-facts-grid">
                    {[
                      { label:"Niveau",        val: sc.level },
                      { label:"Pays d'accueil",val: `${sc.flag} ${sc.country}` },
                      { label:"Domaine",        val: sc.domain },
                      { label:"Date limite",    val: sc.deadline },
                      ...(sc.amount ? [{ label:"Financement", val: sc.amount }] : []),
                      { label:"Statut",         val: sc.urgent ? "⚠ Urgent" : "✓ Ouvert" },
                    ].map(item => (
                      <div key={item.label} style={{ display:"flex",
                        flexDirection:"column", gap:"0.25rem" }}>
                        <span style={{ fontSize:"0.58rem", fontWeight:700,
                          letterSpacing:"0.1em", textTransform:"uppercase",
                          color:"#928E80" }}>
                          {item.label}
                        </span>
                        <span style={{ fontSize:"0.92rem", fontWeight:700,
                          color:"#141410", lineHeight:1.3 }}>
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <h2 className="sl-h2">Critères d&apos;éligibilité</h2>
                <ul style={{ listStyle:"none", padding:0, margin:"0 0 0.5rem",
                  display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                  <CheckItem text="Être ressortissant d'un pays africain (55 pays éligibles)"/>
                  <CheckItem text={`Niveau académique requis : ${sc.level}`}/>
                  <CheckItem text={`Domaine d'études : ${sc.domain}`}/>
                  <CheckItem text="Moins de 35 ans au moment du dépôt de candidature"/>
                  <CheckItem text="Excellents résultats (moyenne ≥ 14/20 ou équivalent)"/>
                  <CheckItem text="Maîtrise de la langue d'enseignement (anglais ou français)"/>
                </ul>

                {/* Citation */}
                <div className="sl-quote" style={{ borderColor: ls.color }}>
                  <p style={{ fontFamily:"'Fraunces', Georgia, serif",
                    fontSize:"clamp(1rem,1.6vw,1.2rem)", fontStyle:"italic",
                    fontWeight:500, color:"#141410", lineHeight:1.65,
                    margin:"0 0 0.85rem" }}>
                    « Ce programme représente bien plus qu&apos;un financement — c&apos;est
                    l&apos;accès à un réseau mondial et à des opportunités de carrière
                    qui transforment des parcours de vie. »
                  </p>
                  <p style={{ fontSize:"0.72rem", fontWeight:700, color:"#928E80", margin:0 }}>
                    — {sc.organization}, Programme {sc.level}
                  </p>
                </div>

                <h2 className="sl-h2">Documents requis</h2>
                <ul style={{ listStyle:"none", padding:0, margin:"0 0 2rem",
                  display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                  <CheckItem text="CV complet en anglais ou français (2 pages max.)"
                    icon="→" color="#C08435"/>
                  <CheckItem
                    text="Lettre de motivation détaillant votre projet académique (1 500 mots)"
                    icon="→" color="#C08435"/>
                  <CheckItem text="Relevés de notes officiels des 3 dernières années"
                    icon="→" color="#C08435"/>
                  <CheckItem text="Deux lettres de recommandation académique ou professionnelle"
                    icon="→" color="#C08435"/>
                  <CheckItem text="Projet de recherche ou Statement of Purpose"
                    icon="→" color="#C08435"/>
                  <CheckItem text="Passeport en cours de validité (copie certifiée)"
                    icon="→" color="#C08435"/>
                </ul>

                {/* Tags */}
                <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap",
                  paddingTop:"1.75rem", borderTop:"1px solid rgba(20,20,16,.07)" }}>
                  <span style={{ fontSize:"0.6rem", fontWeight:700, color:"#928E80",
                    letterSpacing:"0.08em", textTransform:"uppercase",
                    marginRight:"0.25rem" }}>
                    Tags :
                  </span>
                  {sc.tags.map(t => (
                    <span key={t} style={{ display:"inline-block", fontSize:"0.62rem",
                      fontWeight:600, padding:"0.22rem 0.72rem", borderRadius:100,
                      background:"#F0EDE4", color:"#38382E",
                      border:"1px solid rgba(20,20,16,.08)" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <aside className="sl-sidebar">

              {/* CTA principal */}
              <div className="sl-card" style={{
                background: sc.urgent ? "#141410" : "#fff",
                border: sc.urgent
                  ? "1px solid rgba(184,52,30,.25)"
                  : "1px solid rgba(20,20,16,.08)" }}>
                {sc.urgent && (
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem",
                    marginBottom:"1rem", padding:"0.6rem 0.85rem",
                    background:"rgba(184,52,30,.18)", borderRadius:10 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%",
                      background:"#E8704A", flexShrink:0 }}/>
                    <span style={{ fontSize:"0.62rem", fontWeight:800,
                      letterSpacing:"0.1em", textTransform:"uppercase",
                      color:"#E8704A" }}>
                      Clôture imminente
                    </span>
                  </div>
                )}
                <div style={{ fontSize:"0.58rem", fontWeight:800, letterSpacing:"0.15em",
                  textTransform:"uppercase",
                  color: sc.urgent ? "rgba(248,246,241,.35)" : "#928E80",
                  marginBottom:"0.35rem" }}>
                  Date limite
                </div>
                <div style={{ fontFamily:"'Fraunces', Georgia, serif",
                  fontSize:"1.65rem", fontWeight:900, letterSpacing:"-0.03em",
                  color: sc.urgent ? "#E8B86D" : "#141410",
                  marginBottom:"1.5rem", lineHeight:1.05 }}>
                  {sc.deadline}
                </div>
                <a href="#" style={{ display:"block", width:"100%",
                  textAlign:"center", background:"#C08435", color:"#fff",
                  padding:"0.95rem", borderRadius:100, fontWeight:700,
                  fontSize:"0.88rem", textDecoration:"none",
                  fontFamily:"'DM Sans', system-ui, sans-serif",
                  boxShadow:"0 8px 28px rgba(192,132,53,.38)",
                  letterSpacing:"0.02em" }}>
                  Postuler maintenant →
                </a>
                <div style={{ marginTop:"0.75rem", fontSize:"0.65rem",
                  color: sc.urgent ? "rgba(248,246,241,.3)" : "#928E80",
                  textAlign:"center", lineHeight:1.5 }}>
                  Lien officiel · Candidature externe
                </div>
              </div>

              {/* Fiche récap */}
              <div className="sl-card">
                <div className="sl-card-label">Fiche bourse</div>
                <InfoRow label="Niveau"    value={sc.level}/>
                <InfoRow label="Organisme" value={sc.organization}/>
                <InfoRow label="Pays"      value={`${sc.flag} ${sc.country}`}/>
                <InfoRow label="Domaine"   value={sc.domain}/>
                {sc.amount && (
                  <InfoRow label="Financement" value={sc.amount} accent/>
                )}
                <div style={{ padding:"0.9rem 0 0" }}>
                  <span style={{ fontSize:"0.62rem", fontWeight:700,
                    letterSpacing:"0.1em", textTransform:"uppercase",
                    color:"#928E80", display:"block", marginBottom:"0.5rem" }}>
                    Tags
                  </span>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.3rem" }}>
                    {sc.tags.map(t => (
                      <span key={t} style={{ fontSize:"0.57rem", fontWeight:600,
                        padding:"0.18rem 0.6rem", borderRadius:100,
                        background:"#F0EDE4", color:"#38382E",
                        border:"1px solid rgba(20,20,16,.07)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Conseil */}
              <div className="sl-card" style={{ background:"#FAF8F3" }}>
                <div className="sl-card-label">Conseil candidature</div>
                <p style={{ fontSize:"0.82rem", fontWeight:300, color:"#38382E",
                  lineHeight:1.75, margin:"0 0 0.85rem" }}>
                  Préparez votre dossier au moins{" "}
                  <strong style={{ fontWeight:700 }}>6 semaines avant</strong> la
                  date limite. La lettre de motivation est souvent le facteur décisif.
                </p>
                <a href="#" style={{ fontSize:"0.72rem", fontWeight:700, color:"#C08435",
                  textDecoration:"none", display:"inline-flex",
                  alignItems:"center", gap:"0.3rem",
                  borderBottom:"1.5px solid rgba(192,132,53,.3)",
                  paddingBottom:"1px" }}>
                  Guide de candidature →
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          BOURSES SIMILAIRES
      ══════════════════════════════════════════════ */}
      <div style={{ background:"#EEEADE", padding:"4rem 0 5rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto",
          padding:"0 clamp(1.5rem,5vw,3rem)" }}>
          <div style={{ display:"flex", alignItems:"flex-end",
            justifyContent:"space-between", flexWrap:"wrap",
            gap:"1rem", marginBottom:"2rem" }}>
            <div>
              <div className="sh-kicker">Voir aussi</div>
              <h2 style={{ fontFamily:"'Fraunces', Georgia, serif",
                fontSize:"clamp(1.6rem,3vw,2.2rem)", fontWeight:900,
                letterSpacing:"-0.035em", color:"#141410", margin:0 }}>
                Autres{" "}
                <em style={{ fontStyle:"italic", color:"#C08435", fontWeight:200 }}>
                  bourses
                </em>
                {" "}· {sc.level}
              </h2>
            </div>
            <Link href="/bourses" style={{ fontSize:"0.78rem", fontWeight:700,
              color:"#C08435", textDecoration:"none", padding:"0.5rem 1.1rem",
              borderRadius:100, border:"1.5px solid rgba(192,132,53,.25)",
              background:"#FBF4E8", whiteSpace:"nowrap" }}>
              Toutes les bourses
            </Link>
          </div>

          <div className="sl-related-grid">
            {related.map((r) => {
              const rs = LEVEL_STYLE[r.level] ?? LEVEL_STYLE["Toutes formations"];
              return (
                <Link key={r.id} href={`/bourses/${r.slug}`}
                  style={{ textDecoration:"none" }}>
                  <article className="sl-related-card">
                    <div style={{ height:130, position:"relative",
                      overflow:"hidden", flexShrink:0 }}>
                      <div style={{ position:"absolute", inset:0,
                        background: r.imageGradient }}/>
                      <div style={{ position:"absolute", inset:0,
                        background:"linear-gradient(180deg,transparent 30%,rgba(0,0,0,.65) 100%)" }}/>
                      <span style={{ position:"absolute", top:"0.75rem", left:"0.75rem",
                        display:"inline-flex", alignItems:"center", gap:"0.3rem",
                        fontSize:"0.52rem", fontWeight:800, letterSpacing:"0.1em",
                        textTransform:"uppercase", padding:"0.2rem 0.65rem",
                        borderRadius:100, background: rs.bg, color: rs.color }}>
                        <span style={{ width:4, height:4, borderRadius:"50%",
                          background: rs.color, flexShrink:0 }}/>
                        {r.level}
                      </span>
                      <div style={{ position:"absolute", bottom:"0.7rem", left:"0.75rem",
                        display:"flex", alignItems:"center", gap:"0.35rem",
                        background:"rgba(255,255,255,.92)", backdropFilter:"blur(8px)",
                        padding:"0.18rem 0.58rem 0.18rem 0.38rem",
                        borderRadius:100, fontSize:"0.6rem", fontWeight:700,
                        color:"#141410" }}>
                        <span style={{ fontSize:"0.9rem" }}>{r.flag}</span>
                        {r.country}
                      </div>
                      {r.amount && (
                        <div style={{ position:"absolute", bottom:"0.7rem", right:"0.75rem",
                          fontSize:"0.57rem", fontWeight:800,
                          padding:"0.2rem 0.6rem", borderRadius:100,
                          background:"#1A5C40", color:"#fff" }}>
                          {r.amount}
                        </div>
                      )}
                    </div>
                    <div style={{ padding:"1rem 1.25rem", flex:1,
                      display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                      <div style={{ fontSize:"0.6rem", fontWeight:800,
                        letterSpacing:"0.1em", textTransform:"uppercase",
                        color:"#C08435" }}>
                        {r.organization}
                      </div>
                      <h3 style={{ fontFamily:"'Fraunces', Georgia, serif",
                        fontSize:"0.95rem", fontWeight:700, color:"#141410",
                        lineHeight:1.28, margin:0, flex:1,
                        display:"-webkit-box" as never,
                        WebkitLineClamp:3, WebkitBoxOrient:"vertical" as never,
                        overflow:"hidden" }}>
                        {r.title}
                      </h3>
                      <div style={{ display:"flex", alignItems:"center",
                        justifyContent:"space-between",
                        paddingTop:"0.75rem", borderTop:"1px solid rgba(20,20,16,.07)",
                        marginTop:"auto" }}>
                        <span style={{ fontSize:"0.6rem",
                          color: r.urgent ? "#B8341E" : "#928E80",
                          fontWeight: r.urgent ? 700 : 400 }}>
                          📅 {r.deadline}
                        </span>
                        <span style={{ fontSize:"0.68rem", fontWeight:700,
                          color:"#C08435" }}>
                          Voir →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <NewsletterBand />
      <Footer />
    </>
  );
}