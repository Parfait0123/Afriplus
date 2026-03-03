// lib/data.ts — Mock data (replace with Supabase queries later)

export type Category = "Politique" | "Économie" | "Tech" | "Sport" | "Culture" | "Santé" | "Environnement";
export type ScholarshipLevel = "Licence" | "Master" | "Doctorat" | "Postdoc" | "Toutes formations";
export type OpportunityType = "Emploi CDI" | "Stage" | "Graduate" | "Emploi" | "Freelance" | "Volontariat";
export type EventType = "Conférence" | "Forum" | "Hackathon" | "Salon" | "Atelier" | "Sommet";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  author: string;
  date: string;
  readTime: number;
  featured: boolean;
  imageGradient: string;
}

export interface Scholarship {
  id: string;
  slug: string;
  title: string;
  organization: string;
  country: string;
  flag: string;
  level: ScholarshipLevel;
  domain: string;
  deadline: string;
  urgent: boolean;
  amount?: string;
  imageGradient: string;
  tags: string[];
}

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  company: string;
  companyInitials: string;
  location: string;
  type: OpportunityType;
  imageGradient: string;
  svgPattern?: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  location: string;
  day: string;
  month: string;
  year: string;
}

// ─── ARTICLES ──────────────────────────────────────────
export const articles: Article[] = [
  {
    id: "1",
    slug: "union-africaine-accord-commerce-numerique",
    title: "L'Union Africaine signe un accord historique pour le commerce numérique panafricain",
    excerpt: "Les 55 États membres ont ratifié un cadre réglementaire commun pour les transactions numériques, une avancée majeure pour l'intégration économique du continent.",
    category: "Économie",
    author: "Kofi Mensah",
    date: "27 Fév 2026",
    readTime: 5,
    featured: true,
    imageGradient: "linear-gradient(135deg, #0a0800 0%, #1a1400 40%, #2a2000 70%, #1a1000 100%)",
  },
  {
    id: "2",
    slug: "kenya-hub-ia-africain",
    title: "Nairobi s'impose comme hub continental de l'intelligence artificielle",
    excerpt: "Avec plus de 120 startups IA en 2026, la capitale kenyane attire les investissements et les talents de tout le continent.",
    category: "Tech",
    author: "Amina Wanjiku",
    date: "26 Fév 2026",
    readTime: 4,
    featured: false,
    imageGradient: "linear-gradient(135deg, #001a0f 0%, #002e1a 50%, #004025 100%)",
  },
  {
    id: "3",
    slug: "cop31-afrique-financement-climat",
    title: "COP31 : l'Afrique obtient 40 milliards pour l'adaptation climatique",
    excerpt: "Une victoire diplomatique pour la coalition africaine lors du dernier sommet climatique à Dubaï.",
    category: "Environnement",
    author: "Fatou Diallo",
    date: "25 Fév 2026",
    readTime: 6,
    featured: false,
    imageGradient: "linear-gradient(135deg, #001018 0%, #001a28 50%, #002535 100%)",
  },
  {
    id: "4",
    slug: "nigeria-gdp-deuxieme-afrique",
    title: "Le Nigeria consolide sa position de 2ème économie africaine malgré les défis",
    excerpt: "La diversification économique porte ses fruits avec une croissance de 4,2% au T4 2025.",
    category: "Économie",
    author: "Emeka Okafor",
    date: "24 Fév 2026",
    readTime: 7,
    featured: false,
    imageGradient: "linear-gradient(135deg, #0f0800 0%, #1a1000 50%, #261800 100%)",
  },
  {
    id: "5",
    slug: "afrique-medailles-or-jeux-2025",
    title: "Les athlètes africains brillent aux Championnats du Monde d'Athlétisme 2025",
    excerpt: "L'Afrique remporte 18 médailles d'or, un record historique pour le continent.",
    category: "Sport",
    author: "Léa Mobutu",
    date: "23 Fév 2026",
    readTime: 3,
    featured: false,
    imageGradient: "linear-gradient(135deg, #0e0005 0%, #1a000a 50%, #260010 100%)",
  },
  {
    id: "6",
    slug: "panafrican-free-movement-visa",
    title: "Le passeport africain sans visa entre dans sa phase de déploiement",
    excerpt: "42 pays ont désormais signé l'accord de libre circulation — ce qui change pour les ressortissants.",
    category: "Politique",
    author: "Mamadou Sy",
    date: "22 Fév 2026",
    readTime: 5,
    featured: false,
    imageGradient: "linear-gradient(135deg, #050010 0%, #0a0020 50%, #10003a 100%)",
  },
  {
    id: "7",
    slug: "renaissance-litteraire-africaine",
    title: "La littérature africaine connaît un renouveau mondial sans précédent",
    excerpt: "Cinq auteurs africains parmi les dix plus vendus mondialement en 2025.",
    category: "Culture",
    author: "Zara Ndiaye",
    date: "21 Fév 2026",
    readTime: 4,
    featured: false,
    imageGradient: "linear-gradient(135deg, #0a0500 0%, #1a0e00 50%, #2e1800 100%)",
  },
  {
    id: "8",
    slug: "vaccin-paludisme-rdc",
    title: "La RDC déploie à grande échelle le vaccin contre le paludisme",
    excerpt: "Une campagne nationale qui pourrait sauver des centaines de milliers de vies chaque année.",
    category: "Santé",
    author: "Dr. Honoré Kabongo",
    date: "20 Fév 2026",
    readTime: 6,
    featured: false,
    imageGradient: "linear-gradient(135deg, #001005 0%, #001a0a 50%, #002814 100%)",
  },
];

// ─── SCHOLARSHIPS ──────────────────────────────────────
export const scholarships: Scholarship[] = [
  {
    id: "1",
    slug: "mastercard-foundation-scholars-2026",
    title: "Mastercard Foundation Scholars Program 2026",
    organization: "Mastercard Foundation",
    country: "Canada / Afrique",
    flag: "🇨🇦",
    level: "Master",
    domain: "Toutes disciplines",
    deadline: "31 Mars 2026",
    urgent: true,
    amount: "Financement total",
    imageGradient: "linear-gradient(135deg, #0a0800 0%, #1c1400 50%, #2e2000 100%)",
    tags: ["Financement total", "Master", "Leadership"],
  },
  {
    id: "2",
    slug: "bourse-excellence-allemagne-daad",
    title: "Bourse d'Excellence Allemagne DAAD 2026",
    organization: "DAAD",
    country: "Allemagne",
    flag: "🇩🇪",
    level: "Master",
    domain: "Sciences, Tech, Ingénierie",
    deadline: "15 Avr 2026",
    urgent: false,
    amount: "1 200 €/mois",
    imageGradient: "linear-gradient(135deg, #08000a 0%, #140012 50%, #20001e 100%)",
    tags: ["Sciences", "Tech", "Bourse complète"],
  },
  {
    id: "3",
    slug: "commonwealth-scholarship-2026",
    title: "Commonwealth Scholarship — Royaume-Uni 2026",
    organization: "Commonwealth",
    country: "Royaume-Uni",
    flag: "🇬🇧",
    level: "Master",
    domain: "Sciences sociales, Développement",
    deadline: "22 Fév 2026",
    urgent: true,
    amount: "Financement total",
    imageGradient: "linear-gradient(135deg, #000010 0%, #000820 50%, #001035 100%)",
    tags: ["Développement", "Anglophone", "Master"],
  },
  {
    id: "4",
    slug: "orange-bourses-doctorales-afrique",
    title: "Bourses Doctorales Orange Afrique 2026",
    organization: "Fondation Orange",
    country: "France",
    flag: "🇫🇷",
    level: "Doctorat",
    domain: "Numérique, IA, Télécommunications",
    deadline: "30 Avr 2026",
    urgent: false,
    amount: "1 800 €/mois",
    imageGradient: "linear-gradient(135deg, #0f0500 0%, #1e0a00 50%, #2e1000 100%)",
    tags: ["Numérique", "IA", "Doctorat"],
  },
  {
    id: "5",
    slug: "afdb-fellowship-economics",
    title: "AfDB Fellowship Programme — Économie du Développement",
    organization: "Banque Africaine de Développement",
    country: "Côte d'Ivoire",
    flag: "🇨🇮",
    level: "Postdoc",
    domain: "Économie, Finance",
    deadline: "10 Mai 2026",
    urgent: false,
    amount: "Stipend + logement",
    imageGradient: "linear-gradient(135deg, #050800 0%, #0e1400 50%, #182000 100%)",
    tags: ["Économie", "Recherche", "Postdoc"],
  },
  {
    id: "6",
    slug: "gates-cambridge-scholarship",
    title: "Gates Cambridge Scholarship 2026",
    organization: "Gates Foundation / Cambridge",
    country: "Royaume-Uni",
    flag: "🇬🇧",
    level: "Doctorat",
    domain: "Toutes disciplines",
    deadline: "5 Juin 2026",
    urgent: false,
    amount: "Financement total",
    imageGradient: "linear-gradient(135deg, #001005 0%, #001a0a 50%, #002814 100%)",
    tags: ["Excellence", "Leadership", "Toutes disciplines"],
  },
];

// ─── OPPORTUNITIES ──────────────────────────────────────
export const opportunities: Opportunity[] = [
  {
    id: "1",
    slug: "world-bank-analyste-financier",
    title: "Analyste Financier Junior — Afrique Subsaharienne",
    company: "Banque Mondiale",
    companyInitials: "WB",
    location: "Nairobi, Kenya",
    type: "Emploi",
    imageGradient: "linear-gradient(135deg, #000c18 0%, #001428 50%, #001e3a 100%)",
  },
  {
    id: "2",
    slug: "un-jpo-programme-afrique",
    title: "Junior Professional Officer — Programme Afrique",
    company: "Nations Unies",
    companyInitials: "UN",
    location: "Plusieurs pays",
    type: "Emploi",
    imageGradient: "linear-gradient(135deg, #080e18 0%, #0e1a2c 50%, #162a44 100%)",
  },
  {
    id: "3",
    slug: "afdb-graduate-economics",
    title: "Graduate Programme — Économie du développement",
    company: "Banque Africaine de Développement",
    companyInitials: "ADB",
    location: "Abidjan, Côte d'Ivoire",
    type: "Graduate",
    imageGradient: "linear-gradient(135deg, #120a00 0%, #261400 50%, #402200 100%)",
  },
  {
    id: "4",
    slug: "safaricom-product-manager",
    title: "Product Manager — FinTech Afrique de l'Ouest",
    company: "Safaricom",
    companyInitials: "SF",
    location: "Accra, Ghana",
    type: "Emploi CDI",
    imageGradient: "linear-gradient(135deg, #001410 0%, #002820 50%, #003e30 100%)",
  },
  {
    id: "5",
    slug: "mckinsey-consultant-junior",
    title: "Consultant Junior — Stratégie & Transformation",
    company: "McKinsey Africa",
    companyInitials: "MC",
    location: "Johannesburg, ZA",
    type: "Emploi CDI",
    imageGradient: "linear-gradient(135deg, #0c0c18 0%, #181828 50%, #262640 100%)",
  },
  {
    id: "6",
    slug: "google-for-startups-africa",
    title: "Startup Accelerator Program — Africa Cohort 2026",
    company: "Google for Startups",
    companyInitials: "GS",
    location: "Remote / Lagos",
    type: "Graduate",
    imageGradient: "linear-gradient(135deg, #001018 0%, #001e28 50%, #003040 100%)",
  },
  {
    id: "7",
    slug: "total-energies-stage-ingenieur",
    title: "Stage Ingénieur — Énergies Renouvelables",
    company: "TotalEnergies Afrique",
    companyInitials: "TE",
    location: "Dakar, Sénégal",
    type: "Stage",
    imageGradient: "linear-gradient(135deg, #0e0500 0%, #1e0d00 50%, #2e1500 100%)",
  },
  {
    id: "8",
    slug: "boa-data-scientist",
    title: "Data Scientist — Analyse & IA Bancaire",
    company: "Bank of Africa",
    companyInitials: "BA",
    location: "Casablanca, Maroc",
    type: "Emploi CDI",
    imageGradient: "linear-gradient(135deg, #080010 0%, #100020 50%, #1a0030 100%)",
  },
];

// ─── EVENTS ──────────────────────────────────────────────
export const events: Event[] = [
  {
    id: "1",
    slug: "africatech-summit-2026",
    title: "AfricaTech Summit 2026",
    type: "Conférence",
    location: "Nairobi, Kenya",
    day: "15",
    month: "Avr",
    year: "2026",
  },
  {
    id: "2",
    slug: "forum-panafricain-jeunesse-2026",
    title: "Forum Panafricain de la Jeunesse",
    type: "Forum",
    location: "Dakar, Sénégal",
    day: "22",
    month: "Avr",
    year: "2026",
  },
  {
    id: "3",
    slug: "africa-ceo-forum-2026",
    title: "Africa CEO Forum 2026",
    type: "Salon",
    location: "Abidjan, Côte d'Ivoire",
    day: "08",
    month: "Mai",
    year: "2026",
  },
  {
    id: "4",
    slug: "panafrican-hackathon-ia-climat",
    title: "Pan-African Hackathon — IA & Climat",
    type: "Hackathon",
    location: "Accra, Ghana",
    day: "20",
    month: "Jun",
    year: "2026",
  },
  {
    id: "5",
    slug: "sommet-entrepreneurs-africains",
    title: "Sommet des Entrepreneurs Africains",
    type: "Sommet",
    location: "Lagos, Nigeria",
    day: "12",
    month: "Jul",
    year: "2026",
  },
  {
    id: "6",
    slug: "atelier-fintech-innovation",
    title: "Atelier Innovation FinTech — BAD",
    type: "Atelier",
    location: "Abidjan, Côte d'Ivoire",
    day: "03",
    month: "Aoû",
    year: "2026",
  },
  {
    id: "7",
    slug: "african-women-leadership-forum",
    title: "African Women Leadership Forum",
    type: "Forum",
    location: "Kigali, Rwanda",
    day: "18",
    month: "Sep",
    year: "2026",
  },
  {
    id: "8",
    slug: "africa-climate-week-2026",
    title: "Africa Climate Week 2026",
    type: "Conférence",
    location: "Cairo, Égypte",
    day: "05",
    month: "Oct",
    year: "2026",
  },
];
