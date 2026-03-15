// lib/data.ts — Mock data (replace with Supabase queries later)

export type Category = "Politique" | "Économie" | "Tech" | "Sport" | "Culture" | "Santé" | "Environnement";
export type ScholarshipLevel = "Licence" | "Master" | "Doctorat" | "Postdoc" | "Postdoc / Recherche" | "Toutes formations";
export type OpportunityType = "Emploi CDI" | "Stage" | "Graduate" | "Emploi" | "Freelance" | "Volontariat";
export type EventType = "Conférence" | "Forum" | "Hackathon" | "Salon" | "Atelier" | "Sommet";

/* ══════════════════════════════════════════════════════════
   SYSTÈME DE BLOCS — le cœur du CMS
   Chaque bloc représente un élément visuel dans la rédaction.
   Compatible Supabase JSON column.
══════════════════════════════════════════════════════════ */

export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level?: 2 | 3 }
  | { type: "image"; url: string; caption?: string; alt: string; credit?: string }
  | { type: "video"; url: string; caption?: string; platform?: "youtube" | "vimeo" | "other" }
  | { type: "pullquote"; text: string; author?: string; role?: string }
  | { type: "factbox"; title: string; facts: string[] }
  | { type: "related"; slug: string; label?: string }
  | { type: "external"; url: string; label: string; description?: string; favicon?: string }
  | { type: "alert"; message: string; variant?: "info" | "warning" | "tip" }
  | { type: "download"; url: string; label: string; size?: string }
  | { type: "divider" }
  | { type: "checklist"; title?: string; items: { label: string; detail?: string }[] }
  | { type: "steps"; title?: string; items: { label: string; desc: string }[] }
  | { type: "benefits"; title?: string; items: { icon: string; label: string; value: string; highlight?: boolean }[] }
  | { type: "profile"; title?: string; traits: { icon: string; label: string; description: string }[] }
  | { type: "compare"; title?: string; columns: { label: string; color?: string }[]; rows: { label: string; values: string[] }[] }
  | { type: "location"; label: string; address?: string; lat?: number; lng?: number; mapUrl?: string }
  | { type: "apply"; label: string; url: string; note?: string; deadline?: string }
  | { type: "agenda"; title?: string; sessions: { time: string; title: string; speaker?: string; tag?: string; highlight?: boolean }[] }
  | { type: "speakers"; title?: string; people: { name: string; role: string; org?: string; avatar?: string; emoji?: string }[] }

export interface ArticleContent {
  intro: string;
  blocks: Block[];
}

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
  content: ArticleContent;
}

export interface Scholarship {
  id: string;
  slug: string;
  title: string;
  organization: string;
  country: string;
  applyUrl ?: string | "#";
  flag: string;
  level: ScholarshipLevel;
  domain: string;
  deadline: string;
  urgent: boolean;
  amount?: string;
  imageGradient: string;
  tags: string[];
  blocks: Block[];
}



export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  company: string;
  applyUrl ?: string | "#";
  companyInitials: string;
  location: string;
  country: string;
  flag: string;
  type: OpportunityType;
  sector: string;
  description: string;
  skills: string[];
  deadline: string;
  postedAt: string;
  salary?: string;
  remote: boolean;
  imageGradient: string;
  featured?: boolean;
  blocks: Block[];
}


export interface Event {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  location: string;
  country: string;
  eventUrl ?: string | "#";
  flag: string;
  day: string;
  month: string;
  year: string;
  dateISO: string;
  excerpt: string;
  organizer: string;
  attendees: string;
  imageGradient: string;
  tags: string[];
  featured?: boolean;
  blocks?: Block[];
}

/* ══════════════════════════════════════════════════════════
   ARTICLES — rédactions complètes avec blocs riches
══════════════════════════════════════════════════════════ */
export const articles: Article[] = [
  {
    id: "1",
    slug: "union-africaine-accord-commerce-numerique",
    title: "L'Union Africaine signe un accord historique pour le commerce numérique panafricain",
    excerpt: "Les 55 États membres ont ratifié un cadre réglementaire commun pour les transactions numériques, ouvrant une nouvelle ère pour l'intégration économique et les paiements transfrontaliers sur le continent.",
    category: "Économie",
    author: "Kofi Mensah",
    date: "27 Fév 2026",
    readTime: 5,
    featured: true,
    imageGradient: "linear-gradient(135deg, #0a0800 0%, #1a1400 40%, #2a2000 70%, #1a1000 100%)",
    content: {
      intro: "Les 55 États membres de l'Union Africaine ont ratifié, lors du sommet d'Addis-Abeba, un cadre réglementaire commun pour les transactions numériques. Un tournant historique pour l'intégration économique du continent — et le signal d'une Afrique qui prend enfin en main son destin numérique.",
      blocks: [
        {
          type: "heading",
          text: "Un accord vingt ans dans la gestation",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Il aura fallu deux décennies de négociations, trois présidences tournantes de l'UA et une pandémie qui a brutalement révélé le coût de la fragmentation numérique africaine pour que l'accord soit enfin signé. Le texte ratifié à Addis-Abeba le 24 février 2026 établit un espace commun de paiements numériques, un passeport digital pour les entreprises tech et un régime fiscal harmonisé pour les transactions transfrontalières.",
        },
        {
          type: "paragraph",
          text: "Concrètement, un entrepreneur sénégalais pourra désormais vendre ses services en ligne à un client kényan, recevoir son paiement via Mobile Money sans frais de conversion prohibitifs, et facturer selon un régime TVA unifié. Ce qui relevait de l'exploit bureaucratique devient une transaction ordinaire.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=1200&q=80",
          alt: "Sommet de l'Union Africaine à Addis-Abeba",
          caption: "La salle plénière du sommet de l'UA à Addis-Abeba, lors de la signature historique du 24 février 2026.",
          credit: "© UA / Service de presse",
        },
        {
          type: "heading",
          text: "La ZLECAf numérique prend forme",
          level: 2,
        },
        {
          type: "paragraph",
          text: "L'accord s'inscrit dans la logique de la Zone de Libre-Échange Continentale Africaine (ZLECAf), opérationnelle depuis 2021 pour les biens physiques mais toujours lacunaire pour les services numériques. Ce texte comble ce vide. Il crée notamment l'APDS — African Payment and Digital Services Authority — une agence supranationale chargée de réguler les acteurs tech panafricains.",
        },
        {
          type: "pullquote",
          text: "Ce n'est pas un simple accord commercial. C'est l'acte de naissance d'une économie numérique africaine souveraine.",
          author: "Moussa Faki Mahamat",
          role: "Président de la Commission de l'Union Africaine",
        },
        {
          type: "paragraph",
          text: "L'APDS disposera d'un budget propre de 240 millions de dollars sur cinq ans, alimenté par une micro-taxe de 0,05 % sur les transactions numériques transfrontalières. Un mécanisme jugé élégant par les économistes : la régulation se finance elle-même via l'activité qu'elle génère.",
        },
        {
          type: "factbox",
          title: "L'accord en chiffres",
          facts: [
            "55 États signataires — unanimité historique",
            "3,2 Md$ de transactions numériques transfrontalières/an actuellement",
            "Objectif : 40 Md$ d'ici 2030 avec le cadre unifié",
            "APDS : 240 M$ de budget sur 5 ans",
            "Entrée en vigueur progressive : 18 mois de transition",
          ],
        },
        {
          type: "heading",
          text: "Les gagnants : les startups et les PME",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Les grandes entreprises tech avaient déjà trouvé des contournements — coûteux mais efficaces. Les vraies bénéficiaires de l'accord sont les petites structures : une startup ivoirienne de e-commerce qui peinait à se faire payer par ses clients angolais, un freelance tunisien bloqué par les restrictions de change, une coopérative agricole ghanéenne incapable d'exporter ses données de traçabilité vers ses partenaires européens.",
        },
        {
          type: "related",
          slug: "tech-fintech-mouvance-francophone",
          label: "À lire aussi : La fintech francophone lève 2 milliards en 2025",
        },
        {
          type: "paragraph",
          text: "Flutterwave, Wave, M-Pesa, Chipper Cash — les grands acteurs de la fintech africaine ont salué unanimement l'accord, tout en soulignant les défis d'implémentation. \"L'harmonisation réglementaire ne suffit pas\", nuance Olugbenga Agboola, CEO de Flutterwave. \"Il faut maintenant que chaque État adapte ses lois nationales dans les 18 mois impartis. C'est là que les choses se compliqueront.\"",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80",
          alt: "Paiement mobile en Afrique",
          caption: "Le paiement mobile, déjà dominant dans plusieurs pays africains, bénéficiera directement du cadre unifié.",
          credit: "© AFP",
        },
        {
          type: "heading",
          text: "Les défis qui restent",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Plusieurs économistes tempèrent l'enthousiasme. La connectivité reste inégale : 38 % des Africains n'ont toujours pas accès à internet. Un accord numérique sans infrastructure numérique risque de creuser davantage les inégalités entre métropoles connectées et zones rurales enclavées. L'UA a promis un fonds complémentaire de 800 millions de dollars pour l'infrastructure — dont le financement reste à préciser.",
        },
        {
          type: "alert",
          message: "⚠️ Mise en garde : L'accord exclut pour l'instant les cryptomonnaies et les actifs numériques. Un groupe de travail spécifique a été mandaté pour y répondre d'ici fin 2026.",
          variant: "warning",
        },
        {
          type: "paragraph",
          text: "La question de la souveraineté des données est également au cœur des débats. Où seront hébergées les données de l'APDS ? Sur des serveurs africains — mais lesquels, dans quels pays, selon quelles lois ? Des questions qui devront trouver des réponses concrètes avant l'entrée en vigueur complète du dispositif en août 2027.",
        },
        {
          type: "external",
          url: "https://au.int",
          label: "Lire le texte intégral de l'accord sur le site de l'UA",
          description: "Accéder au document officiel de 184 pages ratifié lors du sommet d'Addis-Abeba.",
          favicon: "🌐",
        },
        {
          type: "divider",
        },
        {
          type: "paragraph",
          text: "Malgré ces réserves légitimes, la portée symbolique de l'accord ne saurait être minimisée. Pour la première fois depuis la création de l'Organisation de l'Unité Africaine en 1963, les 55 États du continent ont adopté à l'unanimité un texte contraignant sur l'économie numérique. C'est, dit-on en coulisses à Addis-Abeba, \"le moment Bretton Woods de l'Afrique digitale\".",
        },
      ],
    },
  },

  {
    id: "2",
    slug: "kenya-hub-ia-africain",
    title: "Nairobi s'impose comme hub continental de l'intelligence artificielle",
    excerpt: "Avec plus de 120 startups IA actives en 2026, la Silicon Savannah kenyane attire capitaux-risqueurs mondiaux et ingénieurs de pointe, redéfinissant la carte technologique du continent.",
    category: "Tech",
    author: "Amina Wanjiku",
    date: "26 Fév 2026",
    readTime: 4,
    featured: false,
    imageGradient: "linear-gradient(135deg, #001a0f 0%, #002e1a 50%, #004025 100%)",
    content: {
      intro: "Avec plus de 120 startups IA actives en 2026, la Silicon Savannah kenyane attire capitaux-risqueurs mondiaux et ingénieurs de pointe, redéfinissant la carte technologique du continent. Nairobi n'est plus seulement le berceau de M-Pesa — c'est désormais la capitale africaine de l'intelligence artificielle.",
      blocks: [
        {
          type: "heading",
          text: "De la Silicon Savannah à la capitale africaine de l'IA",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Il y a dix ans, la \"Silicon Savannah\" de Nairobi était surtout un slogan marketing. Aujourd'hui, c'est une réalité mesurable : 127 startups travaillant explicitement sur des solutions d'intelligence artificielle, 4 200 ingénieurs IA déclarés, et 1,3 milliard de dollars levés auprès de fonds internationaux en 2025 seulement. La transformation est vertigineuse.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1200&q=80",
          alt: "Hub technologique de Nairobi",
          caption: "iHub, incubateur historique de Nairobi, est devenu un pôle d'excellence en IA avec 40 startups résidentes en 2026.",
          credit: "© iHub Nairobi",
        },
        {
          type: "paragraph",
          text: "Ce qui distingue Nairobi des autres hubs africains, c'est la densité de son écosystème. En un rayon de 5 kilomètres autour de Westlands, on trouve Google for Startups Africa, Microsoft Africa Development Centre, le nouveau campus d'Amazon Web Services, et des dizaines d'incubateurs privés. Cette concentration crée des effets de réseau puissants : les ingénieurs circulent entre startups, les investisseurs se retrouvent dans les mêmes espaces, les idées se pollinisent.",
        },
        {
          type: "pullquote",
          text: "Nairobi a ce que Bangalore avait dans les années 90 : une masse critique de talents, une infrastructure qui rattrape son retard, et une énergie collective impossible à fabriquer artificiellement.",
          author: "Ciira wa Maina",
          role: "Directeur du Centre for Data Science & AI, Université Dedan Kimathi",
        },
        {
          type: "heading",
          text: "Des solutions IA pour des problèmes africains",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Ce qui rend l'IA kenyane particulièrement intéressante, c'est qu'elle ne cherche pas à répliquer des modèles occidentaux. Les startups les plus prometteuses s'attaquent à des problèmes spécifiquement africains : diagnostic médical par smartphone pour zones rurales, prédiction des rendements agricoles par analyse satellite, détection précoce des crues pour les zones inondables du lac Victoria.",
        },
        {
          type: "factbox",
          title: "Startups IA kenyanes à surveiller",
          facts: [
            "Zydii — apprentissage adaptatif en 12 langues africaines",
            "Apollo Agriculture — prédiction de récoltes par satellite + ML",
            "Ilara Health — diagnostic médical IA pour cliniques rurales",
            "Pezesha — scoring crédit alternatif pour non-bancarisés",
            "Marketforce — optimisation distribution B2B par IA",
          ],
        },
        {
          type: "related",
          slug: "tech-fintech-mouvance-francophone",
          label: "La fintech francophone attire aussi 2 milliards d'investissements",
        },
        {
          type: "paragraph",
          text: "Le gouvernement kenyan a joué un rôle catalyseur en adoptant une Stratégie Nationale d'IA en 2024 — l'une des premières du continent. Le texte prévoit des exonérations fiscales pour les startups IA pendant cinq ans, la création d'un Fonds Souverain Tech de 150 millions de dollars, et l'obligation pour les agences gouvernementales d'acquérir en priorité des solutions locales.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
          alt: "Intelligence artificielle Afrique",
          caption: "Les chercheurs kenyans en IA publient désormais dans les grandes conférences internationales comme NeurIPS et ICML.",
          credit: "© Unsplash",
        },
        {
          type: "external",
          url: "https://ihub.co.ke",
          label: "iHub Nairobi — le cœur battant de la Silicon Savannah",
          description: "Découvrir les startups résidentes et le programme d'accompagnement de l'incubateur historique.",
          favicon: "🚀",
        },
      ],
    },
  },

  {
    id: "3",
    slug: "cop31-afrique-financement-climat",
    title: "COP31 : l'Afrique arrache 40 milliards pour l'adaptation climatique",
    excerpt: "Une victoire diplomatique sans précédent pour la coalition africaine réunie à Dubaï. Ces fonds financeront des infrastructures résilientes au Sahel, des digues côtières et l'agriculture régénérative.",
    category: "Environnement",
    author: "Fatou Diallo",
    date: "25 Fév 2026",
    readTime: 6,
    featured: false,
    imageGradient: "linear-gradient(135deg, #001018 0%, #001a28 50%, #002535 100%)",
    content: {
      intro: "C'était la demande la plus ambitieuse jamais portée par la coalition africaine dans une COP. Et pour la première fois, elle a été entendue. 40 milliards de dollars engagés spécifiquement pour l'adaptation climatique du continent — un résultat que beaucoup jugeaient impossible il y a encore six mois.",
      blocks: [
        {
          type: "heading",
          text: "Comment l'Afrique a retourné la table",
          level: 2,
        },
        {
          type: "paragraph",
          text: "La stratégie africaine à la COP31 a rompu avec les habituelles postures défensives. Sous la coordination du négociateur en chef Tanguy Gahouma-Bekale (Gabon), la délégation continentale est arrivée à Dubaï avec un dossier béton : 847 milliards de dollars de pertes économiques liées au changement climatique entre 2000 et 2025, une liste précise de 340 projets d'adaptation shovel-ready, et une coalition de 134 pays du Sud global prête à bloquer tout accord final.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80",
          alt: "Négociations climatiques COP",
          caption: "La délégation africaine en session plénière à la COP31, Dubaï. Une cohésion diplomatique sans précédent.",
          credit: "© UNFCCC / Kiara Worth",
        },
        {
          type: "paragraph",
          text: "La stratégie a fonctionné. Après 72 heures de négociations nocturnes, l'Union Européenne, les États-Unis et le Japon ont accepté un mécanisme de financement dédié à l'adaptation africaine — distinct du Fonds Vert pour le Climat, avec des décaissements garantis et vérifiables. 40 milliards de dollars sur cinq ans, dont 60 % sous forme de dons non remboursables.",
        },
        {
          type: "pullquote",
          text: "Nous ne sommes pas venus à Dubaï pour négocier. Nous sommes venus pour obtenir. Et nous avons obtenu.",
          author: "Tanguy Gahouma-Bekale",
          role: "Coordinateur en chef des négociateurs africains, COP31",
        },
        {
          type: "factbox",
          title: "Les 40 milliards : à quoi ça sert ?",
          facts: [
            "14 Md$ — Infrastructures résilientes au Sahel (digues, routes surélevées)",
            "9 Md$ — Agriculture régénérative et sécurité alimentaire",
            "8 Md$ — Protection côtière (golfe de Guinée, côte est-africaine)",
            "6 Md$ — Systèmes d'alerte précoce et météorologie",
            "3 Md$ — Transferts de technologie énergétique propre",
          ],
        },
        {
          type: "heading",
          text: "Le Sahel en première ligne",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Le Sahel recevra la plus grande enveloppe : 14 milliards de dollars sur cinq ans. La région, qui concentre les pays les plus vulnérables aux effets du changement climatique, verra financer des projets d'une ampleur inédite. La Grande Muraille Verte — cette ceinture de végétation de 8 000 km traversant le continent d'ouest en est — recevra à elle seule 3,2 milliards.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80",
          alt: "Sahel Afrique désertification",
          caption: "Le lac Tchad a perdu 90 % de sa superficie depuis 1960. Les fonds de la COP31 financeront des projets de revitalisation.",
          credit: "© NASA Earth Observatory",
        },
        {
          type: "related",
          slug: "maroc-energie-solaire-exportateur",
          label: "Le Maroc exporte déjà son énergie solaire vers l'Europe",
        },
        {
          type: "alert",
          message: "💡 À suivre : La première réunion du Comité de Gouvernance du fonds est prévue en juin 2026 à Nairobi. Les organisations africaines de la société civile réclament d'y être représentées.",
          variant: "info",
        },
        {
          type: "paragraph",
          text: "Les ONG environnementales africaines, si elles saluent le résultat, appellent à la vigilance sur les délais de décaissement. \"L'histoire des engagements climatiques non tenus est longue\", rappelle Hindou Oumarou Ibrahim, militante tchadienne et co-présidente du Forum International des Peuples Autochtones sur les Changements Climatiques. \"Nous surveillerons chaque dollar.\"",
        },
        {
          type: "external",
          url: "https://unfccc.int",
          label: "Texte officiel de l'accord COP31 sur le site UNFCCC",
          description: "Consulter les documents de la décision et les mécanismes de vérification du fonds.",
          favicon: "🌍",
        },
      ],
    },
  },

  {
    id: "4",
    slug: "nigeria-gdp-deuxieme-afrique",
    title: "Le Nigeria consolide sa position de 2ème économie africaine malgré les turbulences",
    excerpt: "La diversification économique porte ses fruits avec une croissance de 4,2 % au T4 2025. L'agriculture, le pétrole raffiné et les services numériques tirent l'expansion dans un contexte mondial incertain.",
    category: "Économie",
    author: "Emeka Okafor",
    date: "24 Fév 2026",
    readTime: 7,
    featured: false,
    imageGradient: "linear-gradient(135deg, #0f0800 0%, #1a1000 50%, #261800 100%)",
    content: {
      intro: "Deux ans après la crise du naira et les émeutes de la faim qui avaient fait douter de sa trajectoire, le Nigeria affiche une croissance de 4,2 % au quatrième trimestre 2025. La diversification économique engagée sous l'administration Tinubu commence à produire des résultats tangibles — au prix d'ajustements sociaux douloureux.",
      blocks: [
        {
          type: "heading",
          text: "Une croissance tirée par trois moteurs",
          level: 2,
        },
        {
          type: "paragraph",
          text: "L'agriculture contribue désormais à 26 % du PIB nigérian, contre 22 % en 2022. La politique de substitution aux importations alimentaires — critiquée au départ — a réussi à structurer une filière locale de transformation agroalimentaire. Le secteur du pétrole raffiné, longtemps paralysé par des infrastructures défaillantes, repart grâce à la raffinerie de Dangote (650 000 barils/jour) pleinement opérationnelle depuis septembre 2025.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1200&q=80",
          alt: "Lagos Nigeria économie",
          caption: "Lagos, moteur économique du Nigeria avec 25 millions d'habitants et un PIB supérieur à celui de nombreux États africains.",
          credit: "© AFP / Pius Utomi Ekpei",
        },
        {
          type: "pullquote",
          text: "Le Nigeria souffre moins de manque de ressources que de manque de transformation. Nous corrigeons cela.",
          author: "Wale Edun",
          role: "Ministre des Finances du Nigeria",
        },
        {
          type: "factbox",
          title: "Nigeria : indicateurs T4 2025",
          facts: [
            "Croissance PIB : +4,2 % (vs +1,9 % T4 2024)",
            "Inflation : 22,4 % (en baisse depuis 34 % en 2024)",
            "Naira : 1 580 NGN/USD (stable depuis 6 mois)",
            "Exportations non-pétrolières : +38 %",
            "Taux de chômage : 4,2 % (officiel, Lagos uniquement)",
          ],
        },
        {
          type: "related",
          slug: "union-africaine-accord-commerce-numerique",
          label: "L'accord numérique de l'UA : une opportunité pour les startups nigérianes",
        },
        {
          type: "paragraph",
          text: "Le troisième moteur est celui des services numériques. Lagos abrite désormais la plus forte concentration de startups tech d'Afrique subsaharienne après Nairobi. La scène fintech nigériane — Flutterwave, Paystack, PiggyVest, Moniepoint — continue d'attirer des capitaux étrangers malgré un environnement macroéconomique encore fragile.",
        },
        {
          type: "alert",
          message: "⚠️ Nuance : Les chiffres officiels excluent l'économie informelle, qui représente entre 40 et 65 % de l'activité réelle selon les estimations. La croissance ressentie par la population reste très inégale.",
          variant: "warning",
        },
      ],
    },
  },

  {
    id: "5",
    slug: "afrique-medailles-or-jeux-2025",
    title: "Record absolu : 18 médailles d'or africaines aux Mondiaux d'Athlétisme",
    excerpt: "L'Afrique réécrit l'histoire du sport mondial à Tokyo. L'Éthiopie, le Kenya et le Maroc dominent le fond, tandis que le Nigeria émerge sur le sprint.",
    category: "Sport",
    author: "Léa Mobutu",
    date: "23 Fév 2026",
    readTime: 3,
    featured: false,
    imageGradient: "linear-gradient(135deg, #0e0005 0%, #1a000a 50%, #260010 100%)",
    content: {
      intro: "Dix-huit médailles d'or. Un record absolu, un continent au sommet, et une domination qui ne doit plus rien au hasard. Aux Championnats du Monde d'Athlétisme de Tokyo, l'Afrique a écrit une nouvelle page de sa légende sportive.",
      blocks: [
        {
          type: "heading",
          text: "La nuit où l'Afrique a dominé le monde",
          level: 2,
        },
        {
          type: "paragraph",
          text: "La soirée du 18 août restera dans les annales. En l'espace de quatre heures, le Kenya décrochait l'or sur le 1 500m, le 5 000m et le 10 000m hommes, l'Éthiopie raflait le marathon féminin et le 3 000m steeple, le Maroc s'imposait sur le 800m. Six médailles d'or en une soirée. Le stade olympique de Tokyo n'avait jamais autant entendu les hymnes du continent.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&q=80",
          alt: "Athlétisme course africain",
          caption: "Podium du 5 000m hommes aux Mondiaux de Tokyo : trois athlètes africains, trois drapeaux différents.",
          credit: "© World Athletics / Getty",
        },
        {
          type: "pullquote",
          text: "On ne court pas pour battre les autres. On court pour montrer ce que l'Afrique peut faire quand elle est préparée, financée et respectée.",
          author: "Faith Kipyegon",
          role: "Triple championne du monde du 1 500m, Kenya",
        },
        {
          type: "factbox",
          title: "Le palmarès africain à Tokyo",
          facts: [
            "🇰🇪 Kenya : 7 or, 5 argent, 3 bronze",
            "🇪🇹 Éthiopie : 5 or, 3 argent, 2 bronze",
            "🇲🇦 Maroc : 3 or, 2 argent, 1 bronze",
            "🇳🇬 Nigeria : 2 or (100m et 200m) — surprise historique",
            "🇿🇦 Afrique du Sud : 1 or (longueur femmes)",
          ],
        },
        {
          type: "related",
          slug: "afrique-sport-e-sport-generation",
          label: "L'e-sport africain : une autre génération qui gagne",
        },
        {
          type: "paragraph",
          text: "La surprise venue du Nigeria mérite une attention particulière. Favour Ofili, 23 ans, a décroché l'or sur le 100m féminin avec un temps de 10\"78, détrônant la Jamaïque qui dominait cette discipline depuis vingt ans. Une performance qui illustre l'émergence du sprint africain — longtemps l'angle mort du continent sur la piste.",
        },
      ],
    },
  },

  {
    id: "6",
    slug: "panafrican-free-movement-visa",
    title: "Le passeport africain sans visa entre dans sa phase de déploiement",
    excerpt: "42 pays ont signé l'accord de libre circulation. Dès juillet 2026, leurs ressortissants pourront voyager sans visa dans toute la zone.",
    category: "Politique",
    author: "Mamadou Sy",
    date: "22 Fév 2026",
    readTime: 5,
    featured: false,
    imageGradient: "linear-gradient(135deg, #050010 0%, #0a0020 50%, #10003a 100%)",
    content: {
      intro: "Un Ivoirien qui prend l'avion pour Accra sans visa. Un Sénégalais qui traverse la frontière du Mali avec sa carte d'identité. Un Rwandais qui s'installe à Nairobi sans permis de travail. À partir de juillet 2026, ce sera la réalité pour les ressortissants des 42 pays signataires du Protocole de Libre Circulation de l'UA.",
      blocks: [
        {
          type: "heading",
          text: "Le rêve panafricain devient concret",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Le Protocole sur la Libre Circulation des Personnes, adopté en 2018 mais jamais ratifié en masse, franchit enfin le seuil critique. 42 pays sur 55 ont déposé leurs instruments de ratification avant la deadline du 31 janvier 2026. C'est suffisant pour l'entrée en vigueur — et suffisant pour que l'accord change concrètement la vie de centaines de millions d'Africains.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
          alt: "Aéroport Afrique passeport",
          caption: "L'aéroport international d'Abidjan, l'un des plus fréquentés d'Afrique de l'Ouest, où les contrôles aux frontières évolueront dès juillet.",
          credit: "© AERIA",
        },
        {
          type: "pullquote",
          text: "Un Africain qui ne peut pas voyager librement en Afrique, c'est une contradiction fondamentale avec l'idée même de continent uni.",
          author: "Nkosazana Dlamini Zuma",
          role: "Ancienne Présidente de la Commission de l'UA",
        },
        {
          type: "factbox",
          title: "Ce que change l'accord",
          facts: [
            "Suppression des visas entre les 42 pays signataires",
            "Carte de résident africain : 5 ans renouvelables",
            "Droit au travail sans permis spécifique",
            "Accès aux soins dans le pays d'accueil",
            "13 pays absents : Algérie, Érythrée, Libye, Somalie et 9 autres",
          ],
        },
        {
          type: "alert",
          message: "💡 Calendrier : Déploiement en trois phases. Phase 1 (juillet 2026) : suppression des visas. Phase 2 (jan 2027) : droit de résidence. Phase 3 (jan 2028) : droit au travail harmonisé.",
          variant: "info",
        },
        {
          type: "related",
          slug: "union-africaine-accord-commerce-numerique",
          label: "L'accord numérique de l'UA : l'autre révolution de l'intégration",
        },
        {
          type: "paragraph",
          text: "Les économistes estiment que la pleine mise en œuvre de l'accord pourrait ajouter 3,4 % au PIB continental d'ici 2035, par les seuls effets de mobilité du travail et de réduction des coûts logistiques. \"C'est l'équivalent du marché unique européen pour l'Afrique\", résume l'économiste sénégalaise Rokhaya Gueye. \"Il a fallu 30 ans à l'Europe. Nous essayons de le faire en 10.\"",
        },
      ],
    },
  },

  {
    id: "7",
    slug: "renaissance-litteraire-africaine",
    title: "La littérature africaine conquiert le monde — et les classements",
    excerpt: "Cinq auteurs africains figurent parmi les dix best-sellers mondiaux en 2025. De Chimamanda à Boubacar Boris Diop, une génération transcontinentale impose ses récits.",
    category: "Culture",
    author: "Zara Ndiaye",
    date: "21 Fév 2026",
    readTime: 4,
    featured: false,
    imageGradient: "linear-gradient(135deg, #0a0500 0%, #1a0e00 50%, #2e1800 100%)",
    content: {
      intro: "Pour la première fois de l'histoire du classement mondial des ventes de livres, cinq des dix titres les plus vendus en 2025 sont signés par des auteurs africains. Ce n'est pas une mode — c'est l'aboutissement d'une renaissance littéraire silencieuse qui couvait depuis une décennie.",
      blocks: [
        {
          type: "heading",
          text: "Quand l'Afrique s'impose dans les librairies du monde",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Le phénomène dépasse les frontières traditionnelles de la littérature africaine anglophone ou francophone. Des voix arabophones (Maroc, Égypte, Algérie), swahiliphones (Kenya, Tanzanie), lusophones (Mozambique, Angola) s'imposent simultanément sur la scène mondiale, dans une polyphonie qui reflète la richesse et la diversité du continent.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80",
          alt: "Livres littérature africaine",
          caption: "Les rayons \"Littérature africaine\" des librairies parisiennes et londoniennes ont doublé de surface en trois ans.",
          credit: "© Unsplash / Thought Catalog",
        },
        {
          type: "pullquote",
          text: "Nous n'écrivons pas pour expliquer l'Afrique aux Occidentaux. Nous écrivons pour nous-mêmes, pour nos lecteurs africains d'abord — et le reste du monde suit.",
          author: "Boubacar Boris Diop",
          role: "Romancier sénégalais, Prix du Roman Africain 2025",
        },
        {
          type: "factbox",
          title: "5 auteurs africains dans le Top 10 mondial 2025",
          facts: [
            "Chimamanda Ngozi Adichie (Nigeria) — Notes on Grief II",
            "Leïla Slimani (Maroc/France) — Les Jardins de la Mémoire",
            "Ngugi wa Thiong'o (Kenya) — The Perfect Nine (édition mondiale)",
            "Scholastique Mukasonga (Rwanda) — La Vierge du Nil",
            "Mohamed Mbougar Sarr (Sénégal) — L'Énigme du Retour",
          ],
        },
        {
          type: "paragraph",
          text: "Le succès de ces auteurs n'est pas tombé du ciel. Il est le fruit d'un écosystème littéraire africain qui s'est structuré : des maisons d'édition comme Cassava Republic (Nigeria) ou Présence Africaine (Sénégal/France) qui ont négocié des accords de distribution mondiale, des prix littéraires africains — Caine Prize, Prix du Roman Africain — qui créent de la visibilité, et des plateformes numériques qui permettent aux lecteurs africains d'accéder aux œuvres de leurs écrivains.",
        },
        {
          type: "related",
          slug: "afrobeats-industrie-milliard",
          label: "L'Afrobeats franchit aussi le milliard de dollars — la culture africaine en conquête",
        },
        {
          type: "alert",
          message: "📚 À noter : Le FESPACO Littéraire, pendant du célèbre festival de cinéma, sera lancé à Ouagadougou en septembre 2026. Une première continentale.",
          variant: "tip",
        },
      ],
    },
  },

  {
    id: "8",
    slug: "vaccin-paludisme-rdc",
    title: "La RDC déploie à grande échelle le vaccin contre le paludisme",
    excerpt: "La campagne nationale cible 14 millions d'enfants. Si les projections se confirment, le pays pourrait diviser sa mortalité paludéenne par trois d'ici 2028.",
    category: "Santé",
    author: "Dr. Honoré Kabongo",
    date: "20 Fév 2026",
    readTime: 6,
    featured: false,
    imageGradient: "linear-gradient(135deg, #001005 0%, #001a0a 50%, #002814 100%)",
    content: {
      intro: "La République Démocratique du Congo lance la plus grande campagne de vaccination antipaludéenne de son histoire. 14 millions d'enfants de moins de cinq ans dans 26 provinces seront vaccinés avec le RTS,S — le premier vaccin efficace contre le paludisme — entre mars et décembre 2026.",
      blocks: [
        {
          type: "heading",
          text: "Un défi logistique colossal",
          level: 2,
        },
        {
          type: "paragraph",
          text: "La RDC est le deuxième pays le plus touché par le paludisme au monde : 12 millions de cas déclarés et 23 000 décès en 2025, dont 80 % chez des enfants de moins de cinq ans. Vacciner 14 millions d'enfants dans un pays de 2,3 millions de km² — soit quatre fois la France — avec des infrastructures sanitaires défaillantes représente un défi logistique sans précédent en Afrique.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&q=80",
          alt: "Vaccination enfants RDC",
          caption: "Un agent de santé communautaire vaccine un enfant dans la province du Kasaï. La chaîne du froid est assurée par des frigos solaires financés par Gavi.",
          credit: "© MSF / Alexis Huguet",
        },
        {
          type: "paragraph",
          text: "Pour relever ce défi, le Ministère de la Santé congolais a déployé une stratégie en trois niveaux : vaccination en centre de santé dans les zones urbaines, vaccination mobile par équipes itinérantes dans les zones semi-rurales, et vaccination communautaire par agents formés dans les zones enclavées. 48 000 agents de santé communautaires ont été formés et équipés.",
        },
        {
          type: "pullquote",
          text: "Chaque enfant qui reçoit ce vaccin a 40 % de chances de plus de survivre à ses cinq premières années. C'est une révolution de santé publique tranquille.",
          author: "Dr. Honorine Musinde",
          role: "Directrice du Programme National de Lutte contre le Paludisme, RDC",
        },
        {
          type: "factbox",
          title: "Le vaccin RTS,S en chiffres",
          facts: [
            "Efficacité : 39 % contre le paludisme grave (30 mois de suivi)",
            "4 doses nécessaires (0, 1, 2 mois + rappel à 18 mois)",
            "Prix : 9,3 $ par dose (subventionné par Gavi à 2 $ pour la RDC)",
            "Déjà déployé dans : Ghana, Kenya, Malawi avec succès",
            "Objectif RDC : réduire la mortalité paludéenne de 60 % d'ici 2028",
          ],
        },
        {
          type: "related",
          slug: "sante-mpox-vaccin-africain",
          label: "Le Rwanda produit son propre vaccin contre le Mpox — la souveraineté sanitaire avance",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80",
          alt: "Centre de santé Afrique",
          caption: "Centre de santé de référence dans la province du Nord-Kivu, l'une des zones prioritaires de la campagne.",
          credit: "© OMS / Lindsay Mackenzie",
        },
        {
          type: "paragraph",
          text: "Le financement est assuré par un consortium : Gavi (Alliance du Vaccin) pour 340 millions de dollars, l'OMS pour l'appui technique, la Banque Mondiale pour les infrastructures de chaîne du froid, et l'État congolais pour 15 % du coût total — un engagement budgétaire inédit pour Kinshasa.",
        },
        {
          type: "external",
          url: "https://www.who.int/fr/news/item/06-10-2021-who-recommends-groundbreaking-malaria-vaccine-for-children-at-risk",
          label: "OMS — Recommandation officielle du vaccin RTS,S",
          description: "La recommandation historique de l'OMS d'octobre 2021 qui a ouvert la voie au déploiement mondial.",
          favicon: "🏥",
        },
      ],
    },
  },

  {
    id: "9",
    slug: "maroc-energie-solaire-exportateur",
    title: "Le Maroc devient le premier exportateur africain d'énergie solaire vers l'Europe",
    excerpt: "Le câble sous-marin Xlinks entre Guelmim et Devon est opérationnel. Le Maroc injecte 3,6 GW dans le réseau britannique.",
    category: "Environnement",
    author: "Ibtissam Alaoui",
    date: "19 Fév 2026",
    readTime: 5,
    featured: false,
    imageGradient: "linear-gradient(135deg, #1a0800 0%, #2e1200 50%, #3e1c00 100%)",
    content: {
      intro: "Le câble sous-marin de 3 800 kilomètres qui relie les champs solaires et éoliens de Guelmim-Oued Noun (Maroc) au Devon (Royaume-Uni) est désormais pleinement opérationnel. Une prouesse d'ingénierie qui fait du Maroc le premier exportateur africain d'énergie propre vers l'Europe.",
      blocks: [
        {
          type: "heading",
          text: "Xlinks : l'infrastructure du siècle",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Le projet Xlinks, annoncé en 2021 et longtemps considéré comme trop ambitieux, a été mis en service commercialement le 1er février 2026. Le câble HVDC (haute tension courant continu) transporte 3,6 gigawatts d'électricité — de quoi alimenter 7 millions de foyers britanniques — depuis les 1 500 km² de panneaux solaires et turbines éoliennes déployés dans le désert marocain.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
          alt: "Centrale solaire Maroc désert",
          caption: "Les champs solaires de Noor Ouarzazate, complétés par le parc de Guelmim, alimentent désormais directement le réseau britannique.",
          credit: "© MASEN / Ministère de l'Énergie du Maroc",
        },
        {
          type: "pullquote",
          text: "Nous exportions du phosphate depuis cent ans. Nous exportons maintenant du soleil. La valeur ajoutée n'est plus du tout la même.",
          author: "Leila Benali",
          role: "Ministre de la Transition Énergétique, Maroc",
        },
        {
          type: "factbox",
          title: "Xlinks : les chiffres du projet",
          facts: [
            "Longueur du câble : 3 800 km (record mondial en HVDC)",
            "Capacité : 3,6 GW (7 millions de foyers alimentés)",
            "Investissement total : 16,8 Md$",
            "Revenus annuels pour le Maroc : 1,8 Md$",
            "Durée du contrat d'achat : 25 ans garanti",
          ],
        },
        {
          type: "related",
          slug: "algerie-hydrogene-vert-europe",
          label: "L'Algérie prépare aussi l'exportation d'hydrogène vert vers l'Europe",
        },
        {
          type: "paragraph",
          text: "L'accord commercial signé avec le gouvernement britannique garantit un prix d'achat fixe de 48 £/MWh pendant 25 ans — bien en-dessous du prix de marché actuel (85 £/MWh), mais suffisant pour que le projet soit rentable. Pour le Maroc, 1,8 milliard de dollars de revenus annuels sécurisés représente une transformation structurelle de sa balance des paiements.",
        },
        {
          type: "alert",
          message: "🌍 Impact régional : L'excédent de production (estimé à 600 MW) sera redistribué dans le réseau électrique maghrébin, permettant à terme d'alimenter la Mauritanie, le Sénégal et le Mali.",
          variant: "tip",
        },
      ],
    },
  },

  {
    id: "10",
    slug: "senegal-petrole-boom-economique",
    title: "Le Sénégal face au boom pétrolier : entre espoir et vigilance",
    excerpt: "Avec 100 000 barils par jour extraits depuis Sangomar, le PIB sénégalais bondit de 8,3 %. La société civile appelle à un fonds souverain transparent.",
    category: "Économie",
    author: "Rokhaya Faye",
    date: "18 Fév 2026",
    readTime: 8,
    featured: false,
    imageGradient: "linear-gradient(135deg, #1a0a00 0%, #2c1400 50%, #3e2000 100%)",
    content: {
      intro: "Le premier baril de pétrole sénégalais a quitté le champ de Sangomar en juin 2024. Moins de deux ans plus tard, la production atteint 100 000 barils par jour, et le PIB du pays bondit de 8,3 % — la plus forte croissance d'Afrique de l'Ouest en 2025. Mais la question qui agite Dakar n'est pas \"combien ?\", c'est \"pour qui ?\"",
      blocks: [
        {
          type: "heading",
          text: "Un boom qui change tout — sur le papier",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Les chiffres sont spectaculaires. 8,3 % de croissance, des réserves de change qui ont triplé en 18 mois, un déficit budgétaire ramené à 3,2 % du PIB. Le Sénégal, qui importait 100 % de ses besoins en hydrocarbures il y a trois ans, est en passe de devenir exportateur net d'énergie d'ici 2027. Les institutions financières internationales n'avaient pas prévu une telle rapidité de transition.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80",
          alt: "Plateforme pétrolière offshore Sénégal",
          caption: "La plateforme FPSO Léopold Sédar Senghor, opérée par Woodside Energy, extrait 100 000 barils/jour depuis le champ de Sangomar.",
          credit: "© Woodside Energy / Petrosen",
        },
        {
          type: "pullquote",
          text: "Le pétrole peut être notre meilleure chance ou notre pire malédiction. Tout dépend d'une seule chose : la transparence.",
          author: "Birahim Seck",
          role: "Coordinateur du Forum Civil, Sénégal",
        },
        {
          type: "factbox",
          title: "Le pétrole sénégalais en chiffres",
          facts: [
            "Production actuelle : 100 000 barils/jour (objectif : 150 000 en 2027)",
            "Réserves prouvées : 2,7 milliards de barils (Sangomar + Saint-Louis)",
            "Part de l'État (Petrosen) : 18 % des revenus bruts",
            "Part dédiée au Fonds Intergénérationnel : 30 %",
            "Durée de vie estimée des gisements : 20-25 ans",
          ],
        },
        {
          type: "heading",
          text: "Le spectre du \"syndrome hollandais\"",
          level: 2,
        },
        {
          type: "paragraph",
          text: "La société civile sénégalaise est particulièrement vigilante au risque de syndrome hollandais — ce phénomène par lequel l'afflux de revenus pétroliers détruit la compétitivité des autres secteurs de l'économie. La surévaluation du franc CFA, la négligence de l'agriculture et de la pêche, les importations massives qui écrasent l'industrie locale : ces scénarios sont bien documentés par l'histoire économique africaine.",
        },
        {
          type: "related",
          slug: "nigeria-gdp-deuxieme-afrique",
          label: "Le Nigeria, laboratoire des succès et des échecs de l'économie pétrolière",
        },
        {
          type: "alert",
          message: "⚠️ Enjeu : Le Fonds Intergénérationnel prévu dans la loi pétrolière est opérationnel depuis janvier 2026, mais son conseil d'administration reste dominé par des représentants gouvernementaux. Les ONG réclament une majorité de membres indépendants.",
          variant: "warning",
        },
        {
          type: "paragraph",
          text: "Le gouvernement de Bassirou Diomaye Faye, élu en 2024 sur un programme explicitement anti-corruption, a fait de la transparence pétrolière sa priorité. La plateforme ITIE (Initiative pour la Transparence dans les Industries Extractives) est désormais intégrée dans la loi sénégalaise, et les contrats avec Woodside Energy, bp et Total Energies sont publics. Une avancée inédite en Afrique de l'Ouest.",
        },
        {
          type: "external",
          url: "https://eiti.org/sénégal",
          label: "ITIE Sénégal — tous les contrats pétroliers en accès libre",
          description: "Consulter les contrats signés, les revenus déclarés et les audits indépendants sur la plateforme ITIE.",
          favicon: "📄",
        },
      ],
    },
  },

  {
    id: "11",
    slug: "afrobeats-industrie-milliard",
    title: "L'Afrobeats franchit le cap du milliard de dollars de revenus mondiaux",
    excerpt: "Burna Boy, Tems, Davido et la nouvelle garde panafricaine font de la musique africaine une industrie mondiale.",
    category: "Culture",
    author: "Chinwe Adeyemi",
    date: "17 Fév 2026",
    readTime: 4,
    featured: false,
    imageGradient: "linear-gradient(135deg, #1a0010 0%, #2e001e 50%, #40002c 100%)",
    content: {
      intro: "1,04 milliard de dollars. C'est le chiffre d'affaires combiné de l'industrie Afrobeats en 2025, selon le rapport annuel de PwC Africa Entertainment. Un cap symbolique franchi pour une musique qui, il y a quinze ans, peinait à obtenir du temps d'antenne hors de Lagos.",
      blocks: [
        {
          type: "heading",
          text: "De Lagos au monde entier",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Le succès de l'Afrobeats n'est pas le fruit du hasard. Il est le résultat d'une stratégie délibérée : des artistes qui ont refusé de diluer leur son pour séduire les marchés occidentaux, des managers qui ont négocié des contrats d'égal à égal avec Universal, Sony et Warner, et des plateformes de streaming — Boomplay en tête — qui ont créé une base d'écoute africaine massive avant la percée internationale.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
          alt: "Concert Afrobeats performance",
          caption: "Burna Boy au O2 Arena de Londres, 2025. La salle de 20 000 places affichait complet trois mois à l'avance.",
          credit: "© Live Nation / Getty Images",
        },
        {
          type: "pullquote",
          text: "Je n'ai jamais adapté ma musique pour plaire à un public occidental. Ce sont eux qui se sont adaptés à moi. Voilà la différence.",
          author: "Burna Boy",
          role: "Artiste, Nigeria — Grammy Award 2021, 2024",
        },
        {
          type: "factbox",
          title: "L'industrie Afrobeats en 2025",
          facts: [
            "1,04 Md$ de revenus mondiaux (streaming + concerts + droits)",
            "+240 % de streams Afrobeats sur Spotify en 3 ans",
            "Burna Boy : 2ème artiste africain le plus écouté de l'histoire Spotify",
            "Boomplay : 120 millions d'utilisateurs actifs en Afrique",
            "15 artistes africains dans les Top 100 Spotify Global en 2025",
          ],
        },
        {
          type: "related",
          slug: "ghana-mode-africaine-capitale-mondiale",
          label: "Accra cartonne aussi en mode — la créativité africaine tous azimuts",
        },
        {
          type: "paragraph",
          text: "L'Amapiano, né en Afrique du Sud, l'Afrohouse de l'Angola, le Bongo Flava tanzanien, le Coupé-Décalé ivoirien — la révolution musicale africaine n'est pas monolithique. Elle est polyphonique, continentale, et en train d'inspirer des producteurs de Los Angeles à Tokyo qui intègrent des percussions et des samples africains dans leurs productions.",
        },
      ],
    },
  },

  {
    id: "12",
    slug: "ethiopie-grand-barrage-renaissance",
    title: "Le Grand Barrage de la Renaissance : l'Éthiopie tient ses promesses",
    excerpt: "Après des années de tensions avec l'Égypte et le Soudan, le GERD produit 5 150 MW et fait de l'Éthiopie un exportateur d'électricité.",
    category: "Politique",
    author: "Yonas Haile",
    date: "16 Fév 2026",
    readTime: 7,
    featured: false,
    imageGradient: "linear-gradient(135deg, #000f1a 0%, #001828 50%, #002438 100%)",
    content: {
      intro: "Le Grand Barrage de la Renaissance Éthiopien (GERD) est pleinement opérationnel depuis janvier 2026. Avec 5 150 mégawatts de capacité installée, il est désormais le plus grand barrage d'Afrique — et la source d'une recomposition géopolitique majeure dans la région du Nil.",
      blocks: [
        {
          type: "heading",
          text: "La plus grande infrastructure africaine du siècle",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Le chantier a duré quinze ans, coûté 4,8 milliards de dollars financés à 100 % par l'Éthiopie sans prêt étranger — une décision de souveraineté revendiquée dès le départ — et surmonté une crise diplomatique majeure avec l'Égypte et le Soudan qui ont menacé à plusieurs reprises d'actions militaires. Le GERD est aujourd'hui opérationnel, et il change la donne pour les 120 millions d'Éthiopiens.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1200&q=80",
          alt: "Barrage hydraulique Afrique",
          caption: "Le GERD vu du ciel : 1 800 mètres de long, 145 mètres de hauteur, un réservoir de 74 milliards de m³.",
          credit: "© Ministère de l'Eau et de l'Énergie, Éthiopie",
        },
        {
          type: "pullquote",
          text: "Ce barrage n'appartient pas au gouvernement. Il appartient au peuple éthiopien qui l'a financé avec ses propres deniers.",
          author: "Abiy Ahmed",
          role: "Premier ministre d'Éthiopie",
        },
        {
          type: "factbox",
          title: "GERD : impact énergétique régional",
          facts: [
            "Capacité installée : 5 150 MW (= toute la capacité installée du Nigeria en 2010)",
            "Taux d'électrification éthiopien : 55 % → objectif 90 % en 2027",
            "Pays alimentés : Kenya, Djibouti, Soudan, Rwanda, Tanzanie",
            "Revenus d'exportation électrique : 600 M$/an estimés",
            "Remplissage du réservoir : 94 % atteint en novembre 2025",
          ],
        },
        {
          type: "related",
          slug: "union-africaine-accord-commerce-numerique",
          label: "L'interconnexion électrique continentale, prochain chantier de l'UA",
        },
        {
          type: "alert",
          message: "⚠️ Tension persistante : L'Égypte n'a toujours pas signé d'accord de partage des eaux avec l'Éthiopie. Les négociations, médiées par l'UA, reprennent en mars 2026 à Khartoum.",
          variant: "warning",
        },
      ],
    },
  },

  {
    id: "13",
    slug: "tech-fintech-mouvance-francophone",
    title: "La fintech francophone africaine attire 2 milliards d'investissements en 2025",
    excerpt: "Wave, Julaya, Semoa, FlosCash — la nouvelle génération fintech d'Afrique francophone redessine l'accès aux services financiers pour 400 millions de personnes non bancarisées.",
    category: "Tech",
    author: "Modibo Traoré",
    date: "15 Fév 2026",
    readTime: 5,
    featured: false,
    imageGradient: "linear-gradient(135deg, #001a10 0%, #002a1e 50%, #003a2a 100%)",
    content: {
      intro: "Longtemps dominée par ses homologues anglophones (Lagos, Nairobi, Accra), la scène fintech d'Afrique francophone connaît une explosion sans précédent. 2 milliards de dollars investis en 2025, des licornes qui émergent, et surtout des modèles business profondément adaptés aux réalités économiques locales.",
      blocks: [
        {
          type: "heading",
          text: "Wave : comment une startup sénégalaise a tout changé",
          level: 2,
        },
        {
          type: "paragraph",
          text: "L'histoire de Wave résume à elle seule la transformation en cours. Lancée en 2018 au Sénégal, valorisée 1,7 milliard de dollars en 2021, la startup de mobile money a choisi de se distinguer par une stratégie radicale : frais de transaction à 1 % contre 10-15 % pour Orange Money ou la concurrence bancaire. En cassant les prix, Wave a démocratisé l'accès aux transferts d'argent pour des millions de Sénégalais, Ivoiriens et Maliens.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80",
          alt: "Mobile money paiement Afrique francophone",
          caption: "Un marchand de Dakar utilise Wave pour encaisser ses clients. La solution a capté 60 % du marché sénégalais en 5 ans.",
          credit: "© Wave / Unsplash",
        },
        {
          type: "pullquote",
          text: "Le problème de l'Afrique francophone n'était pas technologique. C'était un problème de prix. Dès qu'on le résout, tout le marché se débloque.",
          author: "Drew Durbin",
          role: "CEO de Wave",
        },
        {
          type: "factbox",
          title: "Fintech francophone : qui lève quoi en 2025",
          facts: [
            "Wave (Sénégal/CI) — 400 M$ en série C (valorisation : 3 Md$)",
            "Julaya (Côte d'Ivoire) — 40 M$ pour l'expansion B2B",
            "Semoa (Bénin) — 22 M$ pour le crédit PME",
            "FlosCash (Cameroun) — 18 M$ pour les transferts diaspora",
            "KiiraVest (Burkina Faso) — 8 M$ en microcrédit digital",
          ],
        },
        {
          type: "related",
          slug: "kenya-hub-ia-africain",
          label: "Pendant ce temps, Nairobi domine l'IA africaine — les deux scènes se rapprochent-elles ?",
        },
        {
          type: "paragraph",
          text: "L'un des atouts méconnus de la fintech francophone est la régulation de la BCEAO — la Banque Centrale des États de l'Afrique de l'Ouest. Contrairement à d'autres banques centrales africaines, la BCEAO a adopté dès 2020 un cadre réglementaire sandbox qui permet aux fintechs de tester leurs produits en conditions réelles avant l'obtention d'une licence complète. Ce pragmatisme réglementaire est un facteur clé de l'essor observé.",
        },
      ],
    },
  },

  {
    id: "14",
    slug: "afrique-du-sud-renaissance-tourisme",
    title: "L'Afrique du Sud retrouve son rang de première destination touristique continentale",
    excerpt: "Avec 14,2 millions de visiteurs en 2025, le Cap et le Kruger captent à nouveau les grands flux mondiaux.",
    category: "Économie",
    author: "Thandi Dlamini",
    date: "14 Fév 2026",
    readTime: 4,
    featured: false,
    imageGradient: "linear-gradient(135deg, #100015 0%, #1e0028 50%, #2c003a 100%)",
    content: {
      intro: "Après cinq années difficiles marquées par la pandémie, les troubles de juillet 2021 et la crise du rand, l'Afrique du Sud renoue avec son statut de première destination touristique du continent. 14,2 millions de visiteurs en 2025, des recettes de 9,8 milliards de dollars et une industrie de l'hospitalité qui a retrouvé son élan.",
      blocks: [
        {
          type: "heading",
          text: "Le Cap et le Kruger retrouvent leur attractivité",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Deux facteurs expliquent le rebond spectaculaire. Le premier est monétaire : le rand, qui a perdu 40 % de sa valeur face au dollar depuis 2019, rend l'Afrique du Sud exceptionnellement bon marché pour les visiteurs étrangers. Un safari de luxe au Kruger coûte désormais 40 % moins cher qu'en 2019 en dollars constants. Le deuxième facteur est politique : la simplification radicale des visas, notamment la suppression des exigences de biométrie préalable pour 50 pays.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80",
          alt: "Safari Kruger Afrique du Sud faune",
          caption: "Le Parc National Kruger, l'une des plus grandes réserves naturelles au monde, a accueilli 2,1 millions de visiteurs en 2025.",
          credit: "© South African Tourism",
        },
        {
          type: "pullquote",
          text: "Le tourisme est notre industrie la plus inclusive. Il emploie directement et indirectement 1,5 million de Sud-Africains dans tout le pays.",
          author: "Patricia de Lille",
          role: "Ministre du Tourisme, Afrique du Sud",
        },
        {
          type: "factbox",
          title: "Tourisme sud-africain 2025",
          facts: [
            "14,2 millions de visiteurs internationaux (+38 % vs 2024)",
            "Revenus : 9,8 Md$ (record historique)",
            "Marchés principaux : Europe (42 %), Afrique intra-continentale (28 %), Amériques (18 %)",
            "Occupation hôtelière au Cap : 84 % (vs 61 % en 2024)",
            "Emplois soutenus : 1,5 million",
          ],
        },
        {
          type: "related",
          slug: "panafrican-free-movement-visa",
          label: "Libre circulation en Afrique : un accélérateur pour le tourisme continental",
        },
      ],
    },
  },

  {
    id: "15",
    slug: "sport-can-2026-senegal-maroc-finale",
    title: "CAN 2026 : le Sénégal et le Maroc s'offrent une finale nord-ouest mémorable",
    excerpt: "Dakar accueille la finale continentale la plus attendue depuis vingt ans. Les Lions de la Téranga et les Lions de l'Atlas promettent un choc tactique.",
    category: "Sport",
    author: "Ibrahima Cissé",
    date: "13 Fév 2026",
    readTime: 3,
    featured: false,
    imageGradient: "linear-gradient(135deg, #0a1a00 0%, #162a00 50%, #223800 100%)",
    content: {
      intro: "Une finale de la Coupe d'Afrique des Nations entre le Sénégal et le Maroc, à Dakar, devant 80 000 spectateurs. C'est la rencontre que tout le continent attendait — et elle aura bien lieu le 12 avril 2026 au stade Abdoulaye Wade.",
      blocks: [
        {
          type: "heading",
          text: "Le choc des Lions",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Les deux équipes ont dominé la compétition avec une maîtrise collective remarquable. Le Sénégal de Sadio Mané — revenu d'Europe à 34 ans pour terminer sa carrière à Dakar — a encaissé un seul but en six matchs. Le Maroc de Hakim Ziyech a alterné jeu de possession et transitions rapides dévastatrices. Deux philosophies de jeu, deux Lions, une seule couronne possible.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
          alt: "Football stade Afrique CAN",
          caption: "Le Stade Abdoulaye Wade de Dakar, inauguré en 2022 avec une capacité de 50 000 places, sera étendu à 80 000 pour la finale.",
          credit: "© CAF Media",
        },
        {
          type: "pullquote",
          text: "C'est la finale que j'ai rêvée depuis que j'ai commencé le football. Jouer une finale de CAN à Dakar, devant mon peuple. Je donnerai tout.",
          author: "Sadio Mané",
          role: "Capitaine des Lions de la Téranga",
        },
        {
          type: "factbox",
          title: "Les deux finalistes en chiffres",
          facts: [
            "🇸🇳 Sénégal : 6J - 5V - 1N - 0D | 14 buts marqués, 1 encaissé",
            "🇲🇦 Maroc : 6J - 5V - 1N - 0D | 12 buts marqués, 2 encaissés",
            "Dernier face-à-face : Maroc 1-0 Sénégal (CAN 2021, quarts)",
            "Audience TV estimée : 1,4 milliard de spectateurs mondiaux",
            "Billetterie : 80 000 places vendues en 47 minutes",
          ],
        },
        {
          type: "related",
          slug: "afrique-medailles-or-jeux-2025",
          label: "L'Afrique domine aussi l'athlétisme mondial — la puissance sportive continentale est totale",
        },
        {
          type: "alert",
          message: "📺 Diffusion : La finale sera retransmise gratuitement en clair dans les 55 pays de l'UA, une décision de la CAF pour maximiser l'audience continentale.",
          variant: "info",
        },
      ],
    },
  },

  {
    id: "16",
    slug: "sante-mpox-vaccin-africain",
    title: "Un vaccin africain contre le Mpox fabriqué au Rwanda — une première historique",
    excerpt: "L'Institut Rwandais de Biosécurité annonce la production locale du premier vaccin Mpox entièrement conçu et manufacturé sur sol africain.",
    category: "Santé",
    author: "Dr. Aline Uwimana",
    date: "12 Fév 2026",
    readTime: 5,
    featured: false,
    imageGradient: "linear-gradient(135deg, #001510 0%, #002218 50%, #003022 100%)",
    content: {
      intro: "L'Institut Rwandais de Biosécurité (RIB) vient d'annoncer la production réussie du premier vaccin contre le Mpox entièrement conçu, testé et fabriqué sur sol africain. Un tournant dans l'histoire de la souveraineté sanitaire continentale — et une réponse directe aux leçons amères de la pandémie de Covid-19.",
      blocks: [
        {
          type: "heading",
          text: "De la Covid-19 à la souveraineté vaccinale",
          level: 2,
        },
        {
          type: "paragraph",
          text: "La genèse de cette avancée remonte à 2021. Lors de la pandémie de Covid-19, l'Afrique avait reçu en dernier les vaccins développés en Occident — parfois des mois après les pays riches. Cette humiliation scientifique et humanitaire avait déclenché une prise de conscience : l'Afrique devait produire ses propres vaccins. Le Rwanda, avec son écosystème de santé le plus avancé du continent, s'était porté volontaire pour accélérer.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&q=80",
          alt: "Laboratoire recherche vaccin Afrique",
          caption: "Les équipes de l'Institut Rwandais de Biosécurité à Kigali, où le vaccin RwaMPX a été développé en 18 mois.",
          credit: "© Rwanda Biomedical Centre",
        },
        {
          type: "pullquote",
          text: "L'Afrique a la science. L'Afrique a les chercheurs. Ce qui nous a manqué jusqu'ici, c'est la confiance en nos propres capacités.",
          author: "Dr. Sabin Nsanzimana",
          role: "Directeur général, Rwanda Biomedical Centre",
        },
        {
          type: "factbox",
          title: "RwaMPX : le vaccin africain en bref",
          facts: [
            "Développé en 18 mois (record pour un vaccin homologué)",
            "Efficacité : 82 % (essais de phase III, 4 200 participants)",
            "Prix de production : 4,2 $ par dose (vs 100 $ pour Jynneos)",
            "Capacité de production : 5 millions de doses/an dès 2027",
            "Homologué par l'Africa CDC le 8 février 2026",
          ],
        },
        {
          type: "related",
          slug: "vaccin-paludisme-rdc",
          label: "La RDC vaccine aussi massivement contre le paludisme — l'Afrique prend sa santé en main",
        },
        {
          type: "paragraph",
          text: "La capacité de production — 5 millions de doses par an à partir de 2027 — couvre les besoins estimés du continent. Le prix de production de 4,2 dollars par dose, contre 100 dollars pour le Jynneos occidental, est une rupture structurelle : pour la première fois, un vaccin africain sera exportable à grande échelle vers d'autres pays à faibles revenus.",
        },
      ],
    },
  },

  {
    id: "17",
    slug: "ghana-mode-africaine-capitale-mondiale",
    title: "Accra, nouvelle capitale mondiale de la mode africaine contemporaine",
    excerpt: "Le Ghana Fashion Week dépasse Lagos et Abidjan. Des créateurs comme Christie Brown reçoivent des commandes de maisons parisiennes et milanaises.",
    category: "Culture",
    author: "Ama Asante",
    date: "11 Fév 2026",
    readTime: 4,
    featured: false,
    imageGradient: "linear-gradient(135deg, #1a0a05 0%, #2e1600 50%, #421e00 100%)",
    content: {
      intro: "Accra a toujours eu du style. Mais depuis deux ans, la capitale ghanéenne est devenue quelque chose de plus : un pôle mondial de la mode qui fait plier le genou aux grandes maisons européennes. Comment une ville ouest-africaine de 5 millions d'habitants s'est imposée à Milan, Paris et New York.",
      blocks: [
        {
          type: "heading",
          text: "Le Ghana Fashion Week : de l'événement local au phénomène mondial",
          level: 2,
        },
        {
          type: "paragraph",
          text: "La 15ème édition du Ghana Fashion Week, tenue en novembre 2025, a réuni pour la première fois des acheteurs de 23 pays, des directeurs artistiques de Dior, Valentino et Net-a-Porter, et une couverture Vogue internationale. 48 créateurs ghanéens ont présenté des collections qui mêlent kente traditionnel, batik contemporain et coupes minimalistes — un dialogue entre héritage et modernité qui séduit le marché mondial du luxe.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
          alt: "Mode africaine défilé Accra",
          caption: "Défilé Christie Brown à la Ghana Fashion Week 2025. La créatrice a reçu des commandes de Net-a-Porter et Nordstrom dans la foulée.",
          credit: "© Ghana Fashion Week / Getty",
        },
        {
          type: "pullquote",
          text: "Je n'utilise pas de wax parce que c'est africain. Je l'utilise parce que c'est beau, parce que ça tient, parce que ça raconte quelque chose.",
          author: "Christie Brown",
          role: "Créatrice de mode, Accra",
        },
        {
          type: "factbox",
          title: "La mode africaine en chiffres 2025",
          facts: [
            "Marché de la mode africaine : 31 Md$ (projection 2030 : 58 Md$)",
            "15 créateurs africains dans les Fashion Weeks mondiales",
            "Christie Brown : commandes de 14 boutiques de luxe internationales",
            "Exportations de textiles ghanéens : +85 % en 2 ans",
            "Okayafrica Fashion : 8 millions d'abonnés (1ère plateforme mode africaine)",
          ],
        },
        {
          type: "related",
          slug: "afrobeats-industrie-milliard",
          label: "L'Afrobeats à 1 milliard de dollars — la culture africaine impose sa valeur",
        },
      ],
    },
  },

  {
    id: "18",
    slug: "algerie-hydrogene-vert-europe",
    title: "L'Algérie lance son programme hydrogène vert — 15 milliards d'euros d'investissement",
    excerpt: "Alger signe avec l'UE le plus grand accord d'hydrogène vert de son histoire. Les premières livraisons via le gazoduc Medgaz sont prévues pour 2029.",
    category: "Environnement",
    author: "Sofiane Belkacem",
    date: "10 Fév 2026",
    readTime: 6,
    featured: false,
    imageGradient: "linear-gradient(135deg, #000a1a 0%, #001228 50%, #001c38 100%)",
    content: {
      intro: "L'Algérie, longtemps dépendante de ses revenus gaziers, engage une reconversion stratégique majeure. Un accord de 15 milliards d'euros signé avec l'Union Européenne pour la production et l'exportation d'hydrogène vert marque l'entrée du pays dans l'ère de l'énergie propre — et positionne l'Algérie comme fournisseur stratégique pour une Europe en quête de souveraineté énergétique.",
      blocks: [
        {
          type: "heading",
          text: "Pourquoi l'Algérie est idéalement placée",
          level: 2,
        },
        {
          type: "paragraph",
          text: "L'hydrogène vert est produit par électrolyse de l'eau grâce à de l'électricité renouvelable. L'Algérie dispose de deux atouts décisifs : un potentiel solaire parmi les plus élevés au monde (entre 2 500 et 3 500 heures d'ensoleillement par an dans le Sahara), et une infrastructure gazière déjà connectée à l'Europe via les gazoducs Medgaz (vers l'Espagne) et Transmed (vers l'Italie). Convertir ces pipelines à l'hydrogène coûte 40 % moins cher que de construire de nouvelles infrastructures.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80",
          alt: "Énergie solaire Algérie Sahara",
          caption: "Les immenses étendues du Sahara algérien offrent un potentiel solaire estimé à 169 000 TWh/an — soit 300 fois la consommation électrique mondiale.",
          credit: "© Sonatrach / Ministère de l'Énergie algérien",
        },
        {
          type: "pullquote",
          text: "Nous avons alimenté l'Europe en gaz naturel pendant 50 ans. Nous allons l'alimenter en hydrogène propre pendant les 50 prochaines années.",
          author: "Mohamed Arkab",
          role: "Ministre de l'Énergie et des Mines, Algérie",
        },
        {
          type: "factbox",
          title: "Le programme algérien en chiffres",
          facts: [
            "Investissement total : 15 Md€ (UE + Algérie + partenaires privés)",
            "Capacité visée : 10 GW d'électrolyse d'ici 2035",
            "Première livraison via Medgaz : 2029",
            "Emplois créés : 200 000 directs et indirects",
            "Réduction CO₂ pour l'Europe : 40 Mt/an à pleine capacité",
          ],
        },
        {
          type: "related",
          slug: "maroc-energie-solaire-exportateur",
          label: "Le Maroc exporte déjà de l'électricité solaire vers le Royaume-Uni — la course est lancée",
        },
        {
          type: "alert",
          message: "💡 Enjeu géopolitique : L'accord algéro-européen réduit la dépendance de l'UE au gaz russe et crée un partenariat stratégique durable avec le Maghreb. La Commission européenne le qualifie de \"pilier de la transition énergétique sudiste\".",
          variant: "info",
        },
      ],
    },
  },

  {
    id: "19",
    slug: "rwanda-modele-gouvernance-numerique",
    title: "Le Rwanda, modèle mondial de gouvernance numérique pour pays émergents",
    excerpt: "L'ONU désigne Kigali comme laboratoire mondial d'e-gouvernement. Services publics dématérialisés, IA dans la justice, drones médicaux.",
    category: "Tech",
    author: "Jean-Baptiste Hakizimana",
    date: "9 Fév 2026",
    readTime: 5,
    featured: false,
    imageGradient: "linear-gradient(135deg, #0f0018 0%, #1a0028 50%, #280038 100%)",
    content: {
      intro: "L'ONU vient de désigner Kigali comme \"Laboratoire Mondial de Gouvernance Numérique\" pour la période 2026-2030. Une distinction qui consacre trente ans d'investissement dans la technologie et une vision radicalement pragmatique : utiliser le numérique non comme une fin, mais comme un outil de justice sociale et d'efficacité de l'État.",
      blocks: [
        {
          type: "heading",
          text: "Comment le Rwanda a numérisé son État en une décennie",
          level: 2,
        },
        {
          type: "paragraph",
          text: "En 2015, 40 % des Rwandais n'avaient pas de carte d'identité. En 2026, 99,7 % en ont une — numérique, biométrique, interopérable avec tous les services de l'État. Cette transformation n'est pas tombée du ciel : elle est le fruit d'une stratégie gouvernementale délibérée, soutenue par un investissement public de 3 % du PIB dans les infrastructures numériques pendant dix ans consécutifs.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
          alt: "Technologies numériques Kigali Rwanda",
          caption: "Le Kigali Innovation City, campus technologique de 60 hectares qui accueille 200 startups et les centres R&D d'Alibaba, Mastercard et Volkswagen.",
          credit: "© Kigali Innovation City / RDB",
        },
        {
          type: "pullquote",
          text: "Le numérique n'est pas un luxe pour les riches. C'est l'outil le plus puissant pour réduire les inégalités quand on l'utilise correctement.",
          author: "Paula Ingabire",
          role: "Ministre des TIC et de l'Innovation, Rwanda",
        },
        {
          type: "factbox",
          title: "Rwanda numérique : les réussites concrètes",
          facts: [
            "99,7 % des citoyens avec identité numérique (1er en Afrique)",
            "Drones médicaux Zipline : 800 livraisons/jour dans 5 pays",
            "Irembo : 118 services gouvernementaux en ligne 24h/24",
            "IA justice : réduction des délais de jugement de 64 %",
            "Couverture 4G : 98 % du territoire (meilleur d'Afrique subsaharienne)",
          ],
        },
        {
          type: "related",
          slug: "kenya-hub-ia-africain",
          label: "Nairobi l'IA et Kigali l'e-gov : deux visions complémentaires de la tech africaine",
        },
        {
          type: "paragraph",
          text: "23 pays africains ont envoyé des délégations gouvernementales à Kigali en 2025 pour étudier le modèle. Le Sénégal, la Côte d'Ivoire et la Tanzanie ont signé des accords de transfert de technologie pour répliquer Irembo — la plateforme de services gouvernementaux — dans leurs propres contextes. Ce \"Rwanda Effect\" est peut-être la contribution la plus durable du pays à la modernisation de l'État africain.",
        },
      ],
    },
  },

  {
    id: "20",
    slug: "cote-ivoire-cacao-transformation-locale",
    title: "La Côte d'Ivoire transforme enfin son cacao sur place — la fin d'un paradoxe",
    excerpt: "Plus de 30 % du cacao ivoirien est transformé localement avant exportation. Cette montée en gamme génère 4 fois plus de valeur ajoutée.",
    category: "Économie",
    author: "Adjoua Kouamé",
    date: "8 Fév 2026",
    readTime: 6,
    featured: false,
    imageGradient: "linear-gradient(135deg, #1a0500 0%, #2c0a00 50%, #3e1000 100%)",
    content: {
      intro: "Le paradoxe durait depuis des décennies : la Côte d'Ivoire, premier producteur mondial de cacao (40 % de la production mondiale), exportait 80 % de ses fèves brutes, laissant à la Suisse, la Belgique et les Pays-Bas le soin de les transformer en chocolat à haute valeur ajoutée. Ce paradoxe est en train de prendre fin.",
      blocks: [
        {
          type: "heading",
          text: "La révolution chocolatière ivoirienne",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Pour la première fois de son histoire, la Côte d'Ivoire transforme localement plus de 30 % de sa production de cacao avant exportation — contre 13 % en 2020. Des usines de broyage, de fabrication de beurre de cacao et de poudre de cacao ont été construites à Abidjan, San-Pédro et Soubré. Et depuis 2024, les premières tablettes de chocolat \"made in Côte d'Ivoire\" sont exportées vers les marchés européens et asiatiques.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1200&q=80",
          alt: "Cacao chocolat transformation Côte d'Ivoire",
          caption: "Usine de transformation du cacao à Abidjan. Une fève à 2$ en fèves brutes devient un produit à 12$ en beurre de cacao transformé.",
          credit: "© Conseil Café-Cacao / Abidjan",
        },
        {
          type: "pullquote",
          text: "Nous avons nourri le monde en chocolat pendant cent ans sans en manger nous-mêmes. Cela change.",
          author: "Kobenan Kouassi Adjoumani",
          role: "Ministre de l'Agriculture, Côte d'Ivoire",
        },
        {
          type: "factbox",
          title: "La transformation : un multiplicateur de valeur",
          facts: [
            "Fève brute exportée : 2,8 $/kg",
            "Beurre de cacao : 11,2 $/kg (+300 %)",
            "Poudre de cacao : 8,5 $/kg (+200 %)",
            "Chocolat fin : 45 $/kg (+1 500 %)",
            "120 000 emplois industriels créés depuis 2022",
          ],
        },
        {
          type: "related",
          slug: "union-africaine-accord-commerce-numerique",
          label: "L'accord numérique de l'UA facilite aussi les transactions chocolatières panafricaines",
        },
        {
          type: "alert",
          message: "💡 Enjeu stratégique : L'UE a adopté en 2023 un règlement anti-déforestation qui impose la traçabilité de toute fève importée. La Côte d'Ivoire a transformé cette contrainte en opportunité : ses chocolats tracés sont désormais vendus 20 % plus cher comme \"cacao durable certifié\".",
          variant: "tip",
        },
      ],
    },
  },

  {
    id: "21",
    slug: "tanzanie-montagne-kilimanjaro-tourisme-eco",
    title: "Le Kilimandjaro adopte le tourisme zéro émission carbone",
    excerpt: "La Tanzanie interdit les groupes moteurs thermiques dans le parc et impose des porteurs certifiés et des équipements électriques.",
    category: "Environnement",
    author: "Aisha Mwangi",
    date: "7 Fév 2026",
    readTime: 4,
    featured: false,
    imageGradient: "linear-gradient(135deg, #001a08 0%, #002c12 50%, #003e1e 100%)",
    content: {
      intro: "À partir du 1er mars 2026, toute source d'énergie thermique sera interdite dans le Parc National du Kilimandjaro. Groupes électrogènes, réchauds à gaz, véhicules diesel : exit. La plus haute montagne d'Afrique devient le premier grand espace naturel du continent à atteindre le zéro émission carbone opérationnel.",
      blocks: [
        {
          type: "heading",
          text: "Une décision radicale, une réponse nécessaire",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Le glacier Furtwängler au sommet du Kilimandjaro a perdu 85 % de sa superficie depuis 1912. Les scientifiques estiment qu'il aura entièrement disparu d'ici 2035 si les tendances actuelles de réchauffement se poursuivent. Pour les autorités tanzaniennes, interdire les émissions de carbone dans le parc est à la fois un acte symbolique fort et une mesure de préservation concrète.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1200&q=80",
          alt: "Kilimandjaro sommet glacier Tanzanie",
          caption: "Le glacier Furtwängler au sommet du Kilimandjaro (5 895 m). Il a perdu 85 % de sa superficie en un siècle.",
          credit: "© National Geographic / Cory Richards",
        },
        {
          type: "pullquote",
          text: "Si le Kilimandjaro perd sa neige, il perd son âme. Et la Tanzanie perd son symbole le plus puissant.",
          author: "Pindi Chana",
          role: "Ministre du Tourisme, Tanzanie",
        },
        {
          type: "factbox",
          title: "La transition zéro carbone : les mesures",
          facts: [
            "Réchauds à gaz → induction solaire (fournis par le TANAPA)",
            "Groupes électrogènes → batteries lithium chargées en vallée",
            "Porteurs certifiés : formation obligatoire en 3 jours",
            "Véhicules électriques : 45 4x4 électriques commandés",
            "Compensation obligatoire : 15 $/touriste versés au Fonds Kilimanjaro",
          ],
        },
        {
          type: "related",
          slug: "cop31-afrique-financement-climat",
          label: "COP31 : l'Afrique a obtenu 40 Md$ pour financer ces transitions",
        },
      ],
    },
  },

  {
    id: "22",
    slug: "nigeria-nollywood-oscar-film-africain",
    title: "Nollywood à l'assaut des Oscars : un film nigérian finaliste pour la première fois",
    excerpt: "'Ife' de Kunle Afolayan entre dans la shortlist des Oscars meilleur film international.",
    category: "Culture",
    author: "Ngozi Okonkwo",
    date: "6 Fév 2026",
    readTime: 4,
    featured: false,
    imageGradient: "linear-gradient(135deg, #1a0008 0%, #2e0012 50%, #42001e 100%)",
    content: {
      intro: "'Ife' — qui signifie \"amour\" en langue yoruba — est entré dans la shortlist des Oscars du meilleur film international le 17 janvier 2026. Un film nigérian de Nollywood parmi les quinze présélectionnés pour la plus haute distinction du cinéma mondial. Une première qui n'est pas le fruit du hasard.",
      blocks: [
        {
          type: "heading",
          text: "\"Ife\" : l'œuvre qui a changé le regard sur Nollywood",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Tourné avec un budget de 2,8 millions de dollars — un record pour Nollywood — \"Ife\" raconte l'histoire d'un amour impossible entre une Igbo chrétienne et un Hausa musulman dans le Lagos de 2025, sur fond de tensions intercommunautaires et de montée en puissance des mouvements féministes. Un film qui touche à l'universel par le particulier, avec une photographie signée Yinka Edward qui a bluffé la presse internationale à Sundance.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80",
          alt: "Cinéma film africain tournage",
          caption: "Kunle Afolayan sur le tournage de 'Ife' à Lagos. Le réalisateur a refusé une offre de Netflix pour conserver les droits africains.",
          credit: "© Kunle Afolayan Productions",
        },
        {
          type: "pullquote",
          text: "Je ne fais pas des films pour les Oscars. Mais si les Oscars viennent à Nollywood, c'est que nous avons réussi à raconter l'humanité dans toute sa complexité.",
          author: "Kunle Afolayan",
          role: "Réalisateur de 'Ife', Nigeria",
        },
        {
          type: "factbox",
          title: "Nollywood en 2025",
          facts: [
            "2 500 films produits par an — 3ème industrie mondiale",
            "Valeur économique : 1,5 Md$ (revenus directs)",
            "Audience : 500 millions de spectateurs en Afrique + diaspora",
            "Netflix Afrique : 120 productions originales nigérianes en 2025",
            "Export : 45 pays diffusent du contenu Nollywood en 2025",
          ],
        },
        {
          type: "related",
          slug: "renaissance-litteraire-africaine",
          label: "La littérature africaine conquiert aussi le monde — la culture continentale est en marche",
        },
      ],
    },
  },

  {
    id: "23",
    slug: "mali-burkina-niger-alliance-sahel-forces",
    title: "L'Alliance des États du Sahel : quel bilan après un an d'existence ?",
    excerpt: "Le Mali, le Burkina Faso et le Niger ont formé une confédération qui redessine l'architecture sécuritaire du Sahel.",
    category: "Politique",
    author: "Abdoulaye Maïga",
    date: "5 Fév 2026",
    readTime: 9,
    featured: false,
    imageGradient: "linear-gradient(135deg, #0a0800 0%, #181200 50%, #241a00 100%)",
    content: {
      intro: "Un an après la proclamation de l'Alliance des États du Sahel (AES) par le Mali, le Burkina Faso et le Niger, le bilan est celui d'une ambition qui se heurte aux réalités d'un territoire en crise. Entre souveraineté affirmée et défis humanitaires qui s'aggravent, AfriPulse fait le point sur une alliance qui redessine la géopolitique continentale.",
      blocks: [
        {
          type: "heading",
          text: "Ce qui a changé en un an",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Sur le plan diplomatique, l'AES a réussi à s'imposer comme interlocuteur incontournable dans la région. La Confédération a ouvert des ambassades propres dans 12 pays, développé des accords de coopération avec la Russie, la Turquie et la Chine, et signé en décembre 2025 un accord de défense mutuelle qui prévoit une réponse collective en cas d'agression d'un des trois pays.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=1200&q=80",
          alt: "Sahel Mali Burkina Niger politique",
          caption: "Sommet des chefs d'État de l'AES à Bamako, décembre 2025. Ibrahim Traoré (Burkina), Assimi Goïta (Mali), Abdourahamane Tiani (Niger).",
          credit: "© AES / Service de presse",
        },
        {
          type: "pullquote",
          text: "L'AES n'est pas une rupture avec l'Afrique. C'est une rupture avec les tutelles qui ont maintenu l'Afrique dans la dépendance.",
          author: "Ibrahim Traoré",
          role: "Chef d'État du Burkina Faso",
        },
        {
          type: "factbox",
          title: "AES : un an de bilan",
          facts: [
            "✅ Retrait complété des forces françaises des 3 pays",
            "✅ Accord de défense mutuelle signé (déc. 2025)",
            "✅ Monnaie commune AES en préparation (2027)",
            "⚠️ Groupes jihadistes : pertes territoriales des armées AES au T3 2025",
            "❌ Crise humanitaire : 4,2 millions de déplacés dans les 3 pays",
          ],
        },
        {
          type: "alert",
          message: "⚠️ Situation humanitaire critique : Le PAM estime que 9,4 millions de personnes dans les trois pays de l'AES sont en situation d'insécurité alimentaire grave. Les corridors humanitaires sont partiellement bloqués.",
          variant: "warning",
        },
        {
          type: "heading",
          text: "Les défis qui subsistent",
          level: 2,
        },
        {
          type: "paragraph",
          text: "La situation sécuritaire reste le principal point d'échec relatif. Malgré la rhétorique de souveraineté, les groupes jihadistes affiliés à al-Qaïda et à l'État islamique contrôlent encore de larges pans des territoires burkinabè et malien. Les armées nationales, renforcées mais encore sous-équipées, ont certes enregistré des succès tactiques, mais sans réussir à inverser durablement la tendance.",
        },
        {
          type: "related",
          slug: "panafrican-free-movement-visa",
          label: "Le passeport africain sans visa — l'AES en est actuellement exclue",
        },
        {
          type: "paragraph",
          text: "Le verdict sur l'AES reste donc suspendu. Pour ses partisans, elle incarne une rupture nécessaire avec un modèle de dépendance qui a échoué. Pour ses détracteurs, elle a fragilisé une architecture sécuritaire régionale imparfaite sans en proposer une qui fonctionne. La vérité, comme souvent en politique, se situe probablement entre les deux.",
        },
        {
          type: "external",
          url: "https://www.acaps.org",
          label: "ACAPS — Rapport humanitaire Sahel (janvier 2026)",
          description: "Analyse indépendante de la situation humanitaire dans les pays de l'AES.",
          favicon: "📊",
        },
      ],
    },
  },

  {
    id: "24",
    slug: "afrique-sport-e-sport-generation",
    title: "L'e-sport africain : une génération qui joue et gagne en dollars",
    excerpt: "Lagos, Nairobi et Le Caire accueillent des arènes d'e-sport qui attirent des millions. Des jeunes Africains gagnent parfois six chiffres en dollars.",
    category: "Tech",
    author: "Kévin Otieno",
    date: "4 Fév 2026",
    readTime: 4,
    featured: false,
    imageGradient: "linear-gradient(135deg, #080018 0%, #10002c 50%, #180040 100%)",
    content: {
      intro: "En 2025, le marché mondial de l'e-sport a généré 4,2 milliards de dollars de revenus. L'Afrique en capte encore moins de 5 % — mais cette part est en train d'exploser. Lagos, Nairobi et Le Caire sont devenues des capitales mondiales d'un sport qui n'exigeait ni stades ni subventions gouvernementales pour naître.",
      blocks: [
        {
          type: "heading",
          text: "Quand le gaming devient métier",
          level: 2,
        },
        {
          type: "paragraph",
          text: "Emmanuel \"Flash\" Okafor, 22 ans, gagne 8 000 dollars par mois en jouant à FIFA et en streamant ses parties sur Twitch depuis un appartement de Lagos. Une somme qui représente 25 fois le salaire minimum nigérian. Flash n'est pas une exception : au Nigeria, au Kenya et en Égypte, des centaines de jeunes gamers profitent d'une confluence unique — connexion internet améliorée, accès aux smartphones, et un marché mondial du streaming qui paie en dollars.",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
          alt: "E-sport gaming Afrique jeunesse",
          caption: "L'arène e-sport Mara Arena de Nairobi, ouverte en 2024, accueille 5 000 spectateurs et des tournois retransmis dans 40 pays.",
          credit: "© Mara Arena / Nairobi",
        },
        {
          type: "pullquote",
          text: "Je n'ai pas besoin d'un visa pour concourir à Londres ou Tokyo. Mon jeu, mon ordinateur et ma connexion suffisent. L'e-sport a aboli les frontières.",
          author: "Emmanuel 'Flash' Okafor",
          role: "Pro gamer, Lagos — 180 000 abonnés Twitch",
        },
        {
          type: "factbox",
          title: "E-sport africain : état des lieux 2025",
          facts: [
            "200 M$ de revenus e-sport africains en 2025 (+85 % vs 2023)",
            "12 arènes e-sport professionnelles sur le continent",
            "Egypte : équipe nationale d'e-sport subventionnée par l'État",
            "Africa Cup of Gaming : 4 millions de téléspectateurs en 2025",
            "Top jeux : FIFA, PUBG Mobile, Free Fire, League of Legends",
          ],
        },
        {
          type: "related",
          slug: "kenya-hub-ia-africain",
          label: "Nairobi hub IA et hub e-sport : la jeunesse kenyane double la mise tech",
        },
        {
          type: "paragraph",
          text: "Les gouvernements africains commencent à prendre la mesure du phénomène. L'Égypte a lancé en 2025 la première équipe nationale d'e-sport du continent, financée par le Ministère de la Jeunesse. Le Sénégal et le Ghana préparent des réglementations pour encadrer et stimuler l'industrie. Et plusieurs universités africaines ont ouvert des filières \"Game Design & E-sport Management\" — une discipline qui n'existait pas il y a cinq ans.",
        },
      ],
    },
  },
];

/* ── SCHOLARSHIPS ──────────────────────────────────────── */
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
    blocks: [
      { type: "paragraph", text: "Le Mastercard Foundation Scholars Program est l'une des bourses les plus complètes et les plus sélectives du monde. Elle couvre l'intégralité des frais de scolarité, du logement, du transport et de la vie quotidienne pour des études de Master dans des universités partenaires à travers le monde." },
      { type: "paragraph", text: "Au-delà du financement, le programme investit dans le développement du leadership : chaque boursier est accompagné par un mentor, participe à des retraites de leadership et intègre un réseau mondial d'alumni africains engagés dans la transformation de leur continent." },
      { type: "heading", text: "Ce que couvre la bourse", level: 2 },
      { type: "benefits", items: [
        { icon: "🎓", label: "Frais de scolarité", value: "100 % pris en charge", highlight: true },
        { icon: "🏠", label: "Logement", value: "Allocation mensuelle incluse", highlight: false },
        { icon: "✈️", label: "Transport", value: "Billet aller-retour international", highlight: false },
        { icon: "💰", label: "Allocation mensuelle", value: "Frais de subsistance couverts", highlight: true },
        { icon: "🌐", label: "Réseau alumni", value: "Accès à vie au réseau mondial", highlight: false },
        { icon: "📚", label: "Mentorat", value: "Accompagnement personnalisé", highlight: false },
      ]},
      { type: "heading", text: "Critères d'éligibilité", level: 2 },
      { type: "checklist", items: [
        { label: "Nationalité africaine subsaharienne ou d'Afrique du Nord" },
        { label: "Niveau Master — toutes disciplines" },
        { label: "Moins de 35 ans au moment du dépôt du dossier" },
        { label: "Top 15 % de sa promotion — excellence académique requise" },
        { label: "Engagement démontré en service communautaire ou leadership" },
        { label: "Maîtrise de la langue d'enseignement (certificat requis)" },
      ]},
      { type: "alert", message: "Les candidatures sont examinées sur dossier puis par entretien. La compétition est internationale — commencez votre dossier au moins 8 semaines à l'avance.", variant: "tip" },
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "CV académique et professionnel", detail: "Format PDF, maximum 3 pages, en anglais ou français" },
        { label: "Lettre de motivation", detail: "1 500 mots maximum — préciser votre projet et votre impact attendu" },
        { label: "Relevés de notes officiels", detail: "Tous les diplômes depuis le baccalauréat, traduits si nécessaire" },
        { label: "2 lettres de recommandation", detail: "Académique + professionnel, sur papier en-tête officiel" },
        { label: "Projet de recherche / Statement of Purpose", detail: "2 000 mots maximum selon votre discipline" },
        { label: "Certificat de langue", detail: "IELTS ≥ 6.5 ou TOEFL ≥ 90 / DALF C1 selon le programme" },
        { label: "Passeport en cours de validité", detail: "Minimum 18 mois de validité restante" },
      ]},
      { type: "heading", text: "Comment postuler", level: 2 },
      { type: "steps", items: [
        { label: "Préparez votre dossier", desc: "Rassemblez tous les documents requis. Faites traduire ceux qui ne sont pas dans la langue du programme." },
        { label: "Créez votre compte", desc: "Inscrivez-vous sur le portail officiel de candidature Mastercard Foundation Scholars." },
        { label: "Remplissez le formulaire", desc: "Complétez soigneusement chaque section. Faites relire votre lettre de motivation par un tiers." },
        { label: "Soumettez avant la deadline", desc: "Date limite : 31 Mars 2026. Aucun dossier tardif ne sera accepté." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Commencez votre dossier au moins 6 semaines avant la deadline",
        "Personnalisez votre projet en lien avec les valeurs du programme (retour en Afrique, impact communautaire)",
        "Contactez d'anciens boursiers via LinkedIn pour des conseils de première main",
        "La lettre de motivation est l'élément le plus décisif — travaillez-la en profondeur",
      ]},

      { type: "apply", label: "Candidatez au Mastercard Foundation Scholars Program 2026", url: "https://mastercardfdn.org/all/scholars/", note: "Soumission uniquement via le portail officiel. Aucun dossier papier ou email accepté.", deadline: "31 Mars 2026" },
    ],
  },
  {
    id: "2",
    slug: "bourse-excellence-allemagne-daad",
    title: "Bourse d'Excellence Allemagne DAAD 2026",
    organization: "DAAD",
    country: "Allemagne",
    flag: "🇩🇪",
    level: "Master",
    domain: "Ingénierie & Sciences",
    deadline: "15 Avr 2026",
    urgent: false,
    amount: "Financement total",
    imageGradient: "linear-gradient(135deg, #0d0000 0%, #1e0000 50%, #300000 100%)",
    tags: ["Allemagne", "Sciences", "Ingénierie"],
    blocks: [
      { type: "paragraph", text: "La bourse DAAD (Deutscher Akademischer Austauschdienst) est l'une des aides à la mobilité internationale les plus reconnues au monde. Elle finance des études de Master en Allemagne dans les domaines de l'ingénierie, des sciences exactes et appliquées, avec un accent particulier sur l'innovation et la recherche." },
      { type: "paragraph", text: "Au-delà du financement académique, le DAAD offre une immersion totale dans l'écosystème de recherche allemand, réputé pour ses laboratoires de pointe et ses partenariats industriels. Les boursiers bénéficient également d'un accompagnement à l'intégration culturelle et d'un accès au réseau international des alumni DAAD." },
      { type: "heading", text: "Ce que couvre la bourse", level: 2 },
      { type: "benefits", items: [
        { icon: "🎓", label: "Frais de scolarité", value: "100 % pris en charge", highlight: true },
        { icon: "💶", label: "Allocation mensuelle", value: "934 € / mois (montant 2025)", highlight: true },
        { icon: "✈️", label: "Transport", value: "Indemnité voyage aller-retour", highlight: false },
        { icon: "🏥", label: "Assurance maladie", value: "Couverture santé incluse", highlight: false },
        { icon: "🌐", label: "Cours d'allemand", value: "Préparation linguistique offerte", highlight: false },
        { icon: "📚", label: "Bourses supplémentaires", value: "Frais d'études + frais de thèse", highlight: false },
      ]},
      { type: "heading", text: "Critères d'éligibilité", level: 2 },
      { type: "checklist", items: [
        { label: "Nationalité africaine (priorité Afrique subsaharienne)" },
        { label: "Niveau Master — Ingénierie ou Sciences" },
        { label: "Moins de 36 ans au moment du dépôt" },
        { label: "Licence avec mention bien ou très bien" },
        { label: "Niveau B2 minimum en allemand ou C1 en anglais (selon programme)" },
        { label: "Lettre d'admission ou pré-accord d'une université allemande fortement recommandé" },
      ]},
      { type: "alert", message: "Certains programmes DAAD nécessitent que vous ayez préalablement été accepté par une université allemande. Vérifiez les conditions spécifiques de votre programme cible.", variant: "warning" },
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Formulaire de candidature DAAD", detail: "À remplir en ligne sur le portail officiel daad.de" },
        { label: "CV académique en allemand ou anglais", detail: "Format Europass recommandé, 2 pages maximum" },
        { label: "Lettre de motivation", detail: "2 pages maximum — expliquer le projet académique et l'intérêt pour l'Allemagne" },
        { label: "Relevés de notes et diplômes", detail: "Avec traduction certifiée en allemand ou anglais" },
        { label: "2 lettres de recommandation de professeurs", detail: "Sur papier en-tête, signées et cachetées" },
        { label: "Preuve de niveau linguistique", detail: "Certificat DAAD, TestDaF, Goethe, IELTS ou TOEFL selon le programme" },
      ]},
      { type: "heading", text: "Comment postuler", level: 2 },
      { type: "steps", items: [
        { label: "Choisissez votre programme", desc: "Parcourez les programmes Master disponibles en Allemagne sur daad.de et identifiez votre université cible." },
        { label: "Prenez contact avec l'université", desc: "Envoyez un email à votre futur directeur de thèse ou au bureau des admissions pour obtenir un accord de principe." },
        { label: "Constituez votre dossier", desc: "Rassemblez tous les documents, faites-les traduire si nécessaire et préparez votre lettre de motivation." },
        { label: "Soumettez en ligne", desc: "Déposez votre candidature via le portail DAAD avant le 15 Avril 2026." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Un niveau d'allemand — même débutant — est toujours valorisé dans votre dossier. Des cours en ligne gratuits existent (Goethe Institut).",
        "Contactez directement les professeurs de l'université visée avant de candidater — un email personnalisé peut faire la différence.",
        "Soulignez dans votre lettre votre projet de retour au pays et l'impact que vous comptez avoir dans votre domaine en Afrique.",
      ]},
    ],
  },
  {
    id: "3",
    slug: "commonwealth-scholarship-uk",
    title: "Commonwealth Scholarship — Royaume-Uni 2026",
    organization: "Commonwealth",
    country: "Royaume-Uni",
    flag: "🇬🇧",
    level: "Master",
    domain: "Développement international",
    deadline: "20 Avr 2026",
    urgent: false,
    amount: "Financement total",
    imageGradient: "linear-gradient(135deg, #06000a 0%, #0e0014 50%, #180020 100%)",
    tags: ["Commonwealth", "UK", "Développement"],
    blocks: [
      { type: "paragraph", text: "Le Commonwealth Scholarship Commission (CSC) finance des études de Master et de Doctorat au Royaume-Uni pour des ressortissants des pays membres du Commonwealth. En Afrique, ce programme cible des profils à fort potentiel de leadership capables de contribuer au développement de leurs pays." },
      { type: "alert", message: "Cette bourse est accessible uniquement aux ressortissants des pays membres du Commonwealth. Vérifiez l'éligibilité de votre pays sur le site officiel avant de candidater.", variant: "info" },
      { type: "heading", text: "Ce que couvre la bourse", level: 2 },
      { type: "benefits", items: [
        { icon: "🎓", label: "Frais de scolarité", value: "100 % pris en charge", highlight: true },
        { icon: "✈️", label: "Vol international", value: "Aller-retour économique pris en charge", highlight: false },
        { icon: "💷", label: "Allocation mensuelle", value: "Frais de subsistance au taux UK", highlight: true },
        { icon: "🏥", label: "Santé", value: "Exemption des frais NHS (National Health Service)", highlight: false },
        { icon: "📦", label: "Indemnité arrivée", value: "Allocation unique à l'arrivée au Royaume-Uni", highlight: false },
        { icon: "👨‍👩‍👦", label: "Supplément familial", value: "Possible pour conjoint et enfants à charge", highlight: false },
      ]},
      { type: "heading", text: "Critères d'éligibilité", level: 2 },
      { type: "checklist", items: [
        { label: "Nationalité d'un pays africain membre du Commonwealth" },
        { label: "Licence avec mention bien ou très bien (First Class ou Upper Second)" },
        { label: "Engagement démontré dans le développement de votre pays" },
        { label: "Ne pas être résident permanent au Royaume-Uni" },
        { label: "Maîtrise de l'anglais (IELTS ≥ 6.5 ou équivalent)" },
      ]},
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Formulaire de candidature CSC en ligne", detail: "Via le portail officiel cscuk.fcdo.gov.uk" },
        { label: "Personal Statement", detail: "500 mots — projet d'études, impact attendu au retour dans votre pays" },
        { label: "Relevés de notes et diplômes", detail: "Traduits et certifiés en anglais" },
        { label: "2 références académiques", detail: "Envoyées directement par vos référents via le portail" },
        { label: "Preuve d'anglais", detail: "IELTS, TOEFL ou équivalent académique reconnu" },
      ]},
      { type: "steps", items: [
        { label: "Identifiez votre programme UK", desc: "Choisissez votre université et votre programme Master cible sur le site du CSC." },
        { label: "Candidatez à l'université", desc: "Déposez simultanément une candidature à l'université UK visée — requis pour la plupart des programmes." },
        { label: "Soumettez votre dossier CSC", desc: "Complétez et soumettez votre candidature sur le portail CSC avant le 20 Avril 2026." },
        { label: "Entretien de sélection", desc: "Les candidats présélectionnés sont convoqués pour un entretien, parfois organisé dans le pays d'origine." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Le Personal Statement doit être centré sur votre projet de retour et l'impact concret que vous comptez avoir dans votre pays — c'est le cœur de la sélection CSC.",
        "Identifiez un supervisor potentiel au Royaume-Uni et contactez-le avant de candidater — cela renforce considérablement votre dossier.",
        "Le CSC valorise les profils avec une expérience professionnelle post-licence : si vous en avez une, mettez-la en avant.",
      ]},
    ],
  },
  {
    id: "4",
    slug: "bourses-doctorales-orange-afrique",
    title: "Bourses Doctorales Orange Afrique 2026",
    organization: "Fondation Orange",
    country: "France / Afrique",
    flag: "🇫🇷",
    level: "Doctorat",
    domain: "Numérique & Télécoms",
    deadline: "10 Mai 2026",
    urgent: false,
    amount: "Financement partiel",
    imageGradient: "linear-gradient(135deg, #180800 0%, #2c1200 50%, #441c00 100%)",
    tags: ["Numérique", "Doctorat", "Télécoms"],
    blocks: [
      { type: "paragraph", text: "La Fondation Orange soutient des doctorants africains travaillant sur des sujets liés au numérique, aux télécommunications et à l'impact des technologies sur le développement en Afrique. Ce programme de financement partiel cible des recherches à fort potentiel d'impact continental." },
      { type: "paragraph", text: "Les boursiers bénéficient non seulement d'un soutien financier mais aussi d'un accès privilégié aux laboratoires de recherche d'Orange, à ses experts techniques et à son réseau africain de partenaires académiques et industriels." },
      { type: "heading", text: "Ce que couvre la bourse", level: 2 },
      { type: "benefits", items: [
        { icon: "💰", label: "Allocation mensuelle", value: "Financement partiel selon le projet", highlight: true },
        { icon: "🔬", label: "Accès labo", value: "Laboratoires de recherche Orange", highlight: true },
        { icon: "🧑‍🏫", label: "Encadrement", value: "Co-direction par un expert Orange", highlight: false },
        { icon: "🌍", label: "Mobilité", value: "Frais de déplacement pour conférences", highlight: false },
        { icon: "📡", label: "Infrastructure", value: "Accès aux données et plateformes Orange", highlight: false },
      ]},
      { type: "heading", text: "Critères d'éligibilité", level: 2 },
      { type: "checklist", items: [
        { label: "Être inscrit en Doctorat dans une université africaine ou française" },
        { label: "Sujet de thèse en lien avec le numérique, les télécoms ou l'impact tech en Afrique" },
        { label: "Master avec mention bien ou très bien" },
        { label: "Accord d'un directeur de thèse académique en cours" },
        { label: "Maîtrise du français (langue principale du programme)" },
      ]},
      { type: "alert", message: "Ce financement est partiel : il vient en complément d'un financement doctoral existant (contrat doctoral, allocation universitaire…). Vérifiez votre situation de financement avant de candidater.", variant: "warning" },
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Résumé de thèse", detail: "4 à 6 pages — problématique, méthodologie, résultats attendus et impact" },
        { label: "CV académique", detail: "Publications, conférences, expériences de recherche" },
        { label: "Lettre du directeur de thèse", detail: "Attestant l'encadrement et la qualité du projet doctoral" },
        { label: "Relevés de notes de Master", detail: "Avec mention explicite" },
        { label: "Lettre de motivation", detail: "Expliquer le lien entre votre recherche et les enjeux numériques africains" },
      ]},
      { type: "steps", items: [
        { label: "Vérifiez l'éligibilité de votre sujet", desc: "Assurez-vous que votre thèse entre dans les thématiques ciblées (numérique, télécoms, impact tech en Afrique)." },
        { label: "Obtenez le soutien de votre directeur", desc: "Discutez du projet avec votre directeur de thèse — sa lettre est indispensable au dossier." },
        { label: "Rédigez le résumé de thèse", desc: "C'est la pièce centrale du dossier. Soyez précis sur la méthodologie et l'impact attendu." },
        { label: "Soumettez avant le 10 Mai 2026", desc: "Via le portail de la Fondation Orange. Dossier incomplet = dossier rejeté." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Montrez clairement en quoi votre recherche bénéficiera concrètement à des populations africaines — Orange cherche un impact mesurable, pas seulement une contribution théorique.",
        "Si possible, proposez une collaboration avec un laboratoire Orange dans votre résumé de thèse — cela valorise fortement votre dossier.",
        "Préparez un résumé vulgarisé de 1 page pour les évaluateurs non-spécialistes de votre domaine.",
      ]},
    ],
  },
  {
    id: "5",
    slug: "afdb-fellowship-programme",
    title: "AfDB Fellowship Programme — Économie du Développement",
    organization: "Banque Africaine de Développement",
    country: "Côte d'Ivoire / International",
    flag: "🇨🇮",
    level: "Postdoc / Recherche",
    domain: "Économie du développement",
    deadline: "28 Avr 2026",
    urgent: false,
    amount: "Financement total",
    imageGradient: "linear-gradient(135deg, #080400 0%, #160c00 50%, #241400 100%)",
    tags: ["BAD", "Économie", "Recherche"],
    blocks: [
      { type: "paragraph", text: "Le Fellowship Programme de la Banque Africaine de Développement s'adresse aux économistes et chercheurs africains souhaitant approfondir leurs travaux sur les enjeux de développement du continent. Les fellows sont accueillis au siège de la BAD à Abidjan pour une période de 6 à 12 mois." },
      { type: "paragraph", text: "Ce programme permet à des chercheurs de haut niveau d'accéder aux données économiques exclusives de la BAD, de collaborer avec ses équipes d'experts et de contribuer directement à la production de rapports influençant les politiques de développement africaines." },
      { type: "heading", text: "Ce que couvre le fellowship", level: 2 },
      { type: "benefits", items: [
        { icon: "💰", label: "Stipende mensuel", value: "Financement total selon le barème BAD", highlight: true },
        { icon: "✈️", label: "Transport", value: "Billet aller-retour et frais de réinstallation", highlight: false },
        { icon: "🏠", label: "Logement", value: "Allocation logement à Abidjan", highlight: false },
        { icon: "📊", label: "Données exclusives", value: "Accès aux bases de données économiques de la BAD", highlight: true },
        { icon: "🤝", label: "Réseau", value: "Collaboration directe avec des économistes senior BAD", highlight: false },
        { icon: "📝", label: "Publication", value: "Opportunités de co-publication avec des experts BAD", highlight: false },
      ]},
      { type: "heading", text: "Critères d'éligibilité", level: 2 },
      { type: "checklist", items: [
        { label: "Nationalité africaine (pays membre de la BAD)" },
        { label: "Doctorat en économie, statistique, politiques publiques ou domaine connexe" },
        { label: "Publication dans des revues à comité de lecture (minimum 1 article publié)" },
        { label: "Projet de recherche clair en lien avec les priorités de la BAD" },
        { label: "Maîtrise du français et/ou de l'anglais (les deux est un plus)" },
      ]},
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Formulaire de candidature BAD", detail: "Disponible sur le portail afdb.org" },
        { label: "Proposition de recherche", detail: "10 pages maximum — question de recherche, données utilisées, méthodologie et contribution attendue" },
        { label: "CV académique complet", detail: "Avec liste de publications et présentations en conférences" },
        { label: "2 lettres de recommandation", detail: "D'académiciens ou d'experts en politiques de développement" },
        { label: "Copie du diplôme de Doctorat", detail: "Avec relevé de notes si récent" },
      ]},
      { type: "steps", items: [
        { label: "Préparez votre proposition de recherche", desc: "C'est la pièce maîtresse du dossier. Elle doit être alignée avec les thèmes prioritaires de la BAD : croissance inclusive, transition énergétique, intégration régionale." },
        { label: "Soumettez votre candidature en ligne", desc: "Via le portail carrières de la BAD avant le 28 Avril 2026." },
        { label: "Évaluation par le comité", desc: "Votre dossier est évalué par des économistes senior BAD sur la pertinence et la faisabilité de votre projet." },
        { label: "Entretien et sélection", desc: "Les candidats retenus sont conviés à un entretien avec le comité de sélection du programme." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Lisez les derniers rapports phares de la BAD avant de rédiger votre proposition — alignez votre question de recherche avec leurs priorités stratégiques.",
        "La proposition doit être concrète : précisez les données que vous utilisez et comment vous y accéderez (y compris les données BAD que vous demandez).",
        "Un email préalable à un économiste BAD travaillant sur votre thématique peut vous donner des indications précieuses sur les besoins actuels de l'institution.",
      ]},
    ],
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
    blocks: [
      { type: "paragraph", text: "La Gates Cambridge Scholarship est l'une des distinctions académiques les plus prestigieuses au monde. Elle finance des études de Doctorat (et dans certains cas de Master) à l'Université de Cambridge pour des candidats d'exception démontrant une excellence académique et un engagement profond envers l'amélioration du monde." },
      { type: "pullquote", text: "Gates Cambridge ne cherche pas seulement les meilleurs académiciens — elle cherche des leaders qui utiliseront leur formation pour transformer des vies.", author: "Gates Cambridge Trust" },
      { type: "heading", text: "Ce que couvre la bourse", level: 2 },
      { type: "benefits", items: [
        { icon: "🎓", label: "Frais de scolarité", value: "100 % pris en charge (Université de Cambridge)", highlight: true },
        { icon: "💷", label: "Allocation annuelle", value: "Frais de subsistance au taux Cambridge", highlight: true },
        { icon: "✈️", label: "Transport", value: "Billet aller-retour et frais de visa", highlight: false },
        { icon: "🏥", label: "Santé", value: "Exemption NHS et assurance complémentaire", highlight: false },
        { icon: "🌐", label: "Réseau Gates", value: "Accès à la communauté mondiale Gates Cambridge (2 000+ scholars)", highlight: false },
        { icon: "📚", label: "Conférences", value: "Budget pour conférences et déplacements de recherche", highlight: false },
      ]},
      { type: "heading", text: "Critères d'éligibilité", level: 2 },
      { type: "checklist", items: [
        { label: "Nationalité non-britannique (toutes nationalités hors UK)" },
        { label: "Candidat à un programme de recherche à l'Université de Cambridge (Doctorat MPhil ou MSc)" },
        { label: "Excellence académique exceptionnelle — les meilleurs dossiers mondiaux" },
        { label: "Leadership démontré dans un domaine avec impact social, scientifique ou culturel" },
        { label: "Engagement envers l'amélioration du monde — au cœur de la sélection" },
      ]},
      { type: "alert", message: "Vous devez d'abord postuler à Cambridge et obtenir une offre conditionnelle ou inconditionnelle d'admission AVANT de soumettre votre candidature Gates Cambridge.", variant: "warning" },
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Candidature Cambridge complète", detail: "Admissions et Gates Cambridge se font simultanément via le même portail" },
        { label: "Personal Statement Gates Cambridge", detail: "1 500 mots — leadership, projet de recherche, vision du changement dans le monde" },
        { label: "Références académiques (x3)", detail: "Dont au minimum 2 académiques — envoyées directement par vos référents" },
        { label: "Transcripts complets", detail: "Tous les diplômes universitaires, avec traduction certifiée si nécessaire" },
        { label: "Proposition de recherche", detail: "Obligatoire pour le Doctorat — longueur selon les exigences du département Cambridge" },
      ]},
      { type: "steps", items: [
        { label: "Choisissez votre superviseur à Cambridge", desc: "Contactez un Professeur à Cambridge dans votre domaine et obtenez un accord de supervision avant de postuler." },
        { label: "Soumettez votre candidature Cambridge", desc: "Postulez à Cambridge via le portail officiel — la candidature Gates Cambridge est intégrée dans ce processus." },
        { label: "Sélection par Gates Cambridge Trust", desc: "Après présélection par Cambridge, votre dossier est transmis au Trust pour évaluation du leadership et de la vision." },
        { label: "Entretien final", desc: "Les candidats shortlistés sont convoqués pour un entretien panel (souvent en janvier pour la session d'automne)." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Le Personal Statement Gates Cambridge est différent de celui pour Cambridge — il doit parler de vous en tant qu'acteur de changement, pas seulement d'académicien.",
        "Contactez votre superviseur Cambridge bien en avance (6-12 mois) — c'est une relation clé et les professeurs ont souvent un quota de doctorants.",
        "Explorez les profils des Gates Scholars africains précédents sur le site du Trust — cela vous donnera une idée précise du profil recherché.",
        "La bourse valorise explicitement l'intention de contribuer à l'Afrique — si c'est votre cas, soyez direct et concret à ce sujet dans votre statement.",
      ]},
    ],
  },
];


/* ── OPPORTUNITIES ─────────────────────────────────────── */
export const opportunities: Opportunity[] = [
  {
    id: "1",
    slug: "world-bank-analyste-financier",
    title: "Analyste Financier Junior — Afrique Subsaharienne",
    company: "Banque Mondiale",
    companyInitials: "WB",
    location: "Nairobi",
    country: "Kenya",
    flag: "🇰🇪",
    type: "Emploi",
    sector: "Finance & Développement",
    description: "Rejoignez l'équipe Afrique subsaharienne de la Banque Mondiale pour contribuer à l'analyse des projets de développement économique.",
    skills: ["Modélisation financière", "Excel / Python", "Économétrie", "Rapport d'analyse", "Anglais courant"],
    deadline: "30 Avr 2026",
    postedAt: "12 Mar 2026",
    salary: "85 000 – 110 000 USD / an",
    remote: false,
    imageGradient: "linear-gradient(135deg, #000c18 0%, #001428 50%, #001e3a 100%)",
    featured: true,
    blocks: [
      { type: "paragraph", text: "La Banque Mondiale recrute un Analyste Financier Junior pour renforcer son équipe Afrique subsaharienne. Vous contribuerez directement à l'évaluation et au suivi de projets de développement économique au Kenya, en Éthiopie, en Tanzanie et en Ouganda." },
      { type: "paragraph", text: "Vous produirez des rapports d'analyse destinés aux équipes régionales et aux gouvernements partenaires, et participerez aux missions de terrain sur les projets en cours." },
      { type: "heading", text: "Avantages & conditions", level: 2 },
      { type: "benefits", items: [
        { icon: "💰", label: "Rémunération", value: "85 000 – 110 000 USD / an", highlight: true },
        { icon: "🌍", label: "Mobilité", value: "Missions terrain en Afrique subsaharienne", highlight: false },
        { icon: "🏥", label: "Couverture santé", value: "Couverture médicale internationale complète", highlight: false },
        { icon: "🎓", label: "Mentorat", value: "Encadrement par des économistes seniors", highlight: true },
        { icon: "📚", label: "Formation", value: "Programme de développement World Bank Group", highlight: false },
      ]},
      { type: "heading", text: "Critères de sélection", level: 2 },
      { type: "checklist", items: [
        { label: "Master en Finance, Économie ou discipline connexe" },
        { label: "Minimum 2 ans d'expérience en analyse financière ou économique" },
        { label: "Maîtrise avancée de la modélisation financière (Excel, Python ou R)" },
        { label: "Excellente maîtrise de l'anglais écrit et oral" },
        { label: "Sensibilité aux enjeux de développement en Afrique subsaharienne" },
      ]},
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Curriculum Vitae", detail: "Format PDF, maximum 3 pages, en anglais" },
        { label: "Lettre de motivation", detail: "1 page en anglais, adressée au Hiring Manager Africa" },
        { label: "Relevés de notes universitaires", detail: "Master et Licence, traduits en anglais si nécessaire" },
        { label: "Références professionnelles", detail: "2 références avec coordonnées" },
      ]},
      { type: "heading", text: "Comment postuler", level: 2 },
      { type: "steps", items: [
        { label: "Dépôt du dossier en ligne", desc: "Créez votre profil sur careers.worldbank.org et soumettez avant la date limite." },
        { label: "Présélection sur dossier", desc: "L'équipe RH examine les candidatures dans un délai de 3 à 4 semaines." },
        { label: "Entretien RH + test technique", desc: "Entretien vidéo suivi d'un exercice de modélisation financière à réaliser en 48h." },
        { label: "Entretien final", desc: "Panel avec le manager direct et un représentant senior de l'équipe Afrique." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Citez des projets Banque Mondiale spécifiques à la région subsaharienne dans votre lettre de motivation.",
        "Préparez des exemples concrets de modèles financiers construits : soyez précis sur les méthodes utilisées.",
        "Consultez le World Bank Open Data pour maîtriser les indicateurs clés de la région avant les entretiens.",
      ]},
      { type: "location", label: "Nairobi, Kenya", address: "Banque Mondiale — Upperhill, Nairobi", mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.819!2d36.8219!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zWorld+Bank+Nairobi!5e0!3m2!1sfr!2sfr!4v1" },
      { type: "apply", label: "Postulez au poste d'Analyste Financier Junior — Banque Mondiale", url: "https://careers.worldbank.org", note: "Créez votre profil sur careers.worldbank.org et soumettez votre candidature avant le 30 Avril 2026.", deadline: "30 Avr 2026" },
    ],
  },
  {
    id: "2",
    slug: "un-jpo-programme-afrique",
    title: "Junior Professional Officer — Programme Afrique",
    company: "Nations Unies",
    companyInitials: "UN",
    location: "Plusieurs pays",
    country: "International",
    flag: "🌍",
    type: "Emploi",
    sector: "Relations internationales",
    description: "Le programme JPO des Nations Unies offre une expérience professionnelle unique au sein des agences onusiennes opérant en Afrique.",
    skills: ["Gestion de projet", "Rédaction de rapports", "Langues onusiennes", "Coordination inter-agences"],
    deadline: "15 Mai 2026",
    postedAt: "05 Mar 2026",
    remote: false,
    imageGradient: "linear-gradient(135deg, #080e18 0%, #0e1a2c 50%, #162a44 100%)",
    featured: false,
    blocks: [
      { type: "paragraph", text: "Le Programme JPO (Junior Professional Officer) des Nations Unies est une passerelle privilégiée vers une carrière internationale. Deux ans d'immersion dans les opérations onusiennes en Afrique, avec une responsabilisation réelle dès le premier jour." },
      { type: "alert", message: "Ce programme est accessible uniquement aux ressortissants des pays qui le financent. Vérifiez l'éligibilité de votre nationalité sur le site du PNUD avant de candidater.", variant: "info" },
      { type: "heading", text: "Avantages & conditions", level: 2 },
      { type: "benefits", items: [
        { icon: "🌐", label: "Expérience", value: "2 ans au sein d'une agence onusienne en Afrique", highlight: true },
        { icon: "💰", label: "Rémunération", value: "Barème international ONU (P1/P2)", highlight: false },
        { icon: "🏥", label: "Couverture santé", value: "Assurance médicale internationale + indemnité logement", highlight: false },
        { icon: "🚀", label: "Débouchés", value: "Accès facilité aux postes permanents onusiens", highlight: true },
        { icon: "🌍", label: "Déploiement", value: "Dans un pays africain selon les besoins", highlight: false },
      ]},
      { type: "heading", text: "Critères de sélection", level: 2 },
      { type: "checklist", items: [
        { label: "Nationalité d'un pays membre finançant le programme JPO" },
        { label: "Master en Relations Internationales, Développement, Droit ou Économie" },
        { label: "Maximum 32 ans à la date de prise de poste" },
        { label: "Maîtrise de deux langues onusiennes (français et anglais au minimum)" },
        { label: "Minimum 2 ans d'expérience dans le secteur humanitaire ou du développement" },
      ]},
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Formulaire P.11 de l'ONU", detail: "À télécharger sur careers.un.org — remplace le CV standard" },
        { label: "Lettre de motivation", detail: "Maximum 1 page en anglais ou français, adressée au coordinateur JPO" },
        { label: "Copies des diplômes certifiées", detail: "Avec traduction officielle si nécessaire" },
        { label: "Justificatif de nationalité", detail: "Passeport en cours de validité" },
        { label: "2 lettres de recommandation", detail: "De superviseurs ou professeurs" },
      ]},
      { type: "steps", items: [
        { label: "Vérifiez l'éligibilité", desc: "Confirmez que votre pays finance le programme JPO et que vous remplissez les critères d'âge." },
        { label: "Candidature sur careers.un.org", desc: "Soumettez votre dossier en sélectionnant le poste JPO correspondant à votre profil." },
        { label: "Entretien de compétences", desc: "Entretien structuré (Competency-Based Interview — méthode STAR) avec un panel onusien." },
        { label: "Déploiement", desc: "Briefing pré-déploiement et prise de poste dans le pays africain assigné." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Le formulaire P.11 onusien est exigeant — détaillez chaque expérience, même les stages.",
        "Les entretiens onusiens sont très codifiés (méthode STAR) — entraînez-vous spécifiquement à cette technique avant.",
        "Identifiez en amont l'agence et le pays de déploiement souhaité pour cibler votre lettre de motivation.",
      ]},
    ],
  },
  {
    id: "3",
    slug: "afdb-graduate-economics",
    title: "Graduate Programme — Économie du développement",
    company: "Banque Africaine de Développement",
    companyInitials: "ADB",
    location: "Abidjan",
    country: "Côte d'Ivoire",
    flag: "🇨🇮",
    type: "Graduate",
    sector: "Finance africaine",
    description: "Programme graduate de 2 ans au sein de la BAD, l'institution financière de référence du continent.",
    skills: ["Économie du développement", "Analyse de données", "French/English", "Politique publique"],
    deadline: "01 Jun 2026",
    postedAt: "01 Mar 2026",
    salary: "55 000 – 70 000 USD / an",
    remote: false,
    imageGradient: "linear-gradient(135deg, #120a00 0%, #261400 50%, #402200 100%)",
    featured: true,
    blocks: [
      { type: "paragraph", text: "Le Graduate Programme de la Banque Africaine de Développement est l'un des programmes de formation les plus sélectifs du continent. Pendant deux ans, vous tournerez dans plusieurs départements de la BAD avec un mentor senior dédié à chaque rotation." },
      { type: "heading", text: "Avantages & conditions", level: 2 },
      { type: "benefits", items: [
        { icon: "💰", label: "Rémunération", value: "55 000 – 70 000 USD / an + indemnités", highlight: true },
        { icon: "🏦", label: "Institution", value: "La banque de développement de référence du continent", highlight: true },
        { icon: "🔄", label: "Rotations", value: "4 rotations de 6 mois dans des départements différents", highlight: false },
        { icon: "👨‍🏫", label: "Mentorat", value: "Mentor senior dédié pendant toute la durée", highlight: false },
        { icon: "📈", label: "Évolution", value: "Priorité aux postes permanents à l'issue du programme", highlight: false },
      ]},
      { type: "heading", text: "Critères de sélection", level: 2 },
      { type: "checklist", items: [
        { label: "Nationalité d'un pays membre de la BAD" },
        { label: "Master en Économie, Finance, Statistique ou Politiques publiques" },
        { label: "Moins de 30 ans à la date de clôture" },
        { label: "Résultats académiques excellents (mention Bien recommandée)" },
        { label: "Maîtrise du français ET de l'anglais (les deux langues officielles de la BAD)" },
      ]},
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Curriculum Vitae", detail: "Maximum 2 pages, en anglais ou français, format PDF" },
        { label: "Lettre de motivation", detail: "1 page expliquant votre intérêt pour le développement africain et la BAD" },
        { label: "Relevés de notes complets", detail: "Master et Licence avec mentions obtenues" },
        { label: "Attestation de nationalité", detail: "Passeport d'un pays membre de la BAD" },
        { label: "2 lettres de recommandation", detail: "D'un professeur et d'un encadrant professionnel" },
      ]},
      { type: "steps", items: [
        { label: "Candidature sur afdb.org", desc: "Soumettez votre dossier sur le portail de recrutement de la BAD avant la date de clôture." },
        { label: "Test analytique en ligne", desc: "Les présélectionnés passent un test de raisonnement analytique et de connaissances économiques." },
        { label: "Entretien RH + technique", desc: "Entretien axé sur vos motivations puis discussion approfondie avec un économiste senior BAD." },
        { label: "Intégration à Abidjan", desc: "Session d'intégration au siège avec présentation des équipes et des premiers projets." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Lisez les Perspectives économiques en Afrique et l'African Development Report avant vos entretiens.",
        "Le bilinguisme français-anglais est vraiment testé — préparez-vous à switcher de langue pendant l'entretien.",
        "Mettez en avant tout engagement, même bénévole, qui démontre votre intérêt pour le développement du continent.",
      ]},
    ],
  },
  {
    id: "4",
    slug: "safaricom-product-manager",
    title: "Product Manager — FinTech Afrique de l'Ouest",
    company: "Safaricom",
    companyInitials: "SF",
    location: "Accra",
    country: "Ghana",
    flag: "🇬🇭",
    type: "Emploi CDI",
    sector: "Tech & FinTech",
    description: "Pilotez le développement de produits financiers mobiles pour le marché ouest-africain au sein de l'équipe M-Pesa.",
    skills: ["Product Management", "Agile / Scrum", "Analyse de données", "Mobile money", "UX Research"],
    deadline: "20 Avr 2026",
    postedAt: "10 Mar 2026",
    salary: "70 000 – 95 000 USD / an",
    remote: false,
    imageGradient: "linear-gradient(135deg, #001410 0%, #002820 50%, #003e30 100%)",
    featured: false,
    blocks: [
      { type: "paragraph", text: "Safaricom étend son produit M-Pesa en Afrique de l'Ouest. Vous rejoindrez l'équipe produit d'Accra pour piloter le développement de fonctionnalités adaptées aux marchés ghanéen et régional, de la définition du besoin jusqu'au lancement en production." },
      { type: "heading", text: "Avantages & conditions", level: 2 },
      { type: "benefits", items: [
        { icon: "💰", label: "Rémunération", value: "70 000 – 95 000 USD / an", highlight: true },
        { icon: "📱", label: "Impact produit", value: "Millions d'utilisateurs M-Pesa affectés par vos décisions", highlight: true },
        { icon: "✈️", label: "Mobilité", value: "Déplacements entre Accra et Nairobi", highlight: false },
        { icon: "🏥", label: "Avantages sociaux", value: "Assurance santé, transport, bonus annuel", highlight: false },
      ]},
      { type: "heading", text: "Critères de sélection", level: 2 },
      { type: "checklist", items: [
        { label: "3 à 5 ans d'expérience en Product Management, idéalement fintech ou mobile money" },
        { label: "Expérience Agile/Scrum en tant que Product Owner" },
        { label: "Capacité à lire et interpréter des données produit (SQL apprécié)" },
        { label: "Compréhension des enjeux UX/UI et collaboration avec les designers" },
        { label: "Maîtrise de l'anglais courant (langue de travail)" },
      ]},
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Curriculum Vitae", detail: "PDF 2 pages en anglais — mettez en avant les produits lancés et leurs métriques" },
        { label: "Lettre de motivation", detail: "1 page avec un exemple de produit géré de A à Z" },
        { label: "Portfolio ou case study", detail: "Optionnel mais fortement recommandé" },
      ]},
      { type: "steps", items: [
        { label: "Candidature via LinkedIn ou portail Safaricom", desc: "Personnalisez votre lettre pour le poste West Africa." },
        { label: "Screening RH", desc: "Appel de 20 minutes pour valider votre expérience et vos attentes." },
        { label: "Entretien produit + case study à domicile", desc: "60 min avec le Head of Product puis exercice de 48h : concevoir une fonctionnalité M-Pesa pour le Ghana." },
        { label: "Panel final", desc: "Présentation de votre case study devant Head of Product, CTO et équipe commerciale." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Étudiez les produits concurrents actifs au Ghana (Wave, MTN MoMo) pour proposer une perspective différenciante.",
        "Préparez des métriques précises : taux d'adoption, rétention, NPS — les chiffres font la différence.",
        "Le case study est l'élément le plus déterminant — soignez la présentation visuelle et la clarté du raisonnement.",
      ]},
    ],
  },
  {
    id: "5",
    slug: "mckinsey-consultant-junior",
    title: "Consultant Junior — Stratégie & Transformation",
    company: "McKinsey Africa",
    companyInitials: "MC",
    location: "Johannesburg",
    country: "Afrique du Sud",
    flag: "🇿🇦",
    type: "Emploi CDI",
    sector: "Conseil en stratégie",
    description: "McKinsey Africa recrute des consultants juniors pour accompagner les plus grandes organisations africaines dans leurs projets de transformation.",
    skills: ["Problem solving", "Communication executive", "Analyse financière", "PowerPoint", "Frameworks stratégiques"],
    deadline: "10 Mai 2026",
    postedAt: "15 Mar 2026",
    salary: "Compétitif + bonus",
    remote: false,
    imageGradient: "linear-gradient(135deg, #0c0c18 0%, #181828 50%, #262640 100%)",
    featured: true,
    blocks: [
      { type: "paragraph", text: "McKinsey Africa recrute des consultants juniors pour intervenir sur des missions de transformation stratégique dans des secteurs variés à travers tout le continent. Vous rejoindrez des équipes pluridisciplinaires sur des projets de 4 à 8 semaines, avec une formation de classe mondiale." },
      { type: "heading", text: "Avantages & conditions", level: 2 },
      { type: "benefits", items: [
        { icon: "💰", label: "Rémunération", value: "Package compétitif + bonus de performance", highlight: true },
        { icon: "✈️", label: "Mobilité", value: "Missions dans toute l'Afrique subsaharienne et à l'international", highlight: true },
        { icon: "📚", label: "Formation", value: "McKinsey Academy — formation de classe mondiale", highlight: false },
        { icon: "🤝", label: "Réseau", value: "Accès au réseau mondial des alumni McKinsey", highlight: false },
      ]},
      { type: "heading", text: "Critères de sélection", level: 2 },
      { type: "checklist", items: [
        { label: "Diplôme d'une grande école ou université de premier plan (MBA, Master ou équivalent)" },
        { label: "Excellence académique démontrée tout au long du parcours" },
        { label: "Capacité analytique exceptionnelle et aisance avec les chiffres" },
        { label: "Leadership démontré dans des activités extraprofessionnelles ou associatives" },
        { label: "Excellent anglais et français (langue de travail selon le bureau)" },
      ]},
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Curriculum Vitae", detail: "1 page maximum, format McKinsey (sobre, factuel, résultats chiffrés)" },
        { label: "Relevés de notes complets", detail: "Depuis le baccalauréat" },
        { label: "Lettre de motivation", detail: "Optionnelle — axée sur vos motivations spécifiques pour McKinsey Africa" },
      ]},
      { type: "steps", items: [
        { label: "Candidature sur mckinsey.com/careers", desc: "Soignez particulièrement la présentation de votre CV — c'est la première impression." },
        { label: "Problem Solving Test", desc: "Test de raisonnement logique et analytique (PST ou McKinsey Digital Assessment)." },
        { label: "Deux tours d'entretiens de cas", desc: "4 case interviews au total avec consultants, managers puis partners senior." },
        { label: "Offre et onboarding", desc: "Négociation salariale et intégration dans la cohorte de consultants juniors." },
      ]},
      { type: "alert", message: "Les case interviews McKinsey sont très spécifiques — préparez-vous avec au moins 30 à 50 cas pratiques avant les entretiens réels. Utilisez PrepLounge et les ressources officielles McKinsey.", variant: "tip" },
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Mettez des réalisations chiffrées sur votre CV : McKinsey recrute des profils orientés résultats mesurables.",
        "Renseignez-vous sur les secteurs prioritaires de McKinsey Africa (énergie, finance, télécoms) pour contextualiser vos réponses.",
        "Le network McKinsey est un asset pour toute la vie — même si vous partez après 2-3 ans, la valeur reste immense.",
      ]},
      { type: "compare", title: "McKinsey vs BCG vs Bain (Africa offices)", columns: [
        { label: "McKinsey", color: "#1E4DA8" },
        { label: "BCG", color: "#1A5C40" },
        { label: "Bain", color: "#B8341E" },
      ], rows: [
        { label: "Bureaux africains", values: ["Joburg, Lagos, Nairobi, Casablanca", "Joburg, Casablanca, Lagos", "Joburg, Nairobi"] },
        { label: "Salaire junior", values: ["Compétitif + bonus", "Compétitif + bonus", "Compétitif + bonus"] },
        { label: "Secteurs phares", values: ["Énergie, Finance, Public", "Industrie, Tech", "Private Equity, Retail"] },
        { label: "Mobilité internationale", values: ["Forte", "Forte", "Modérée"] },
        { label: "Processus recrutement", values: ["PST + 4 cases", "Online + 3-4 cases", "Online + 3-4 cases"] },
      ]},
      { type: "apply", label: "Postulez chez McKinsey Africa — Consultant Junior", url: "https://www.mckinsey.com/careers/search-jobs", note: "Candidatez via le portail officiel McKinsey. Le recrutement est continu — plus tôt vous postulez, mieux c'est.", deadline: "10 Mai 2026" },
    ],
  },
  {
    id: "6",
    slug: "google-for-startups-africa",
    title: "Startup Accelerator Program — Africa Cohort 2026",
    company: "Google for Startups",
    companyInitials: "GS",
    location: "Remote / Lagos",
    country: "Nigeria",
    flag: "🇳🇬",
    type: "Graduate",
    sector: "Tech & Innovation",
    description: "Intégrez la cohorte africaine 2026 du programme d'accélération de Google. 6 mois de mentorat intensif et accès aux ressources cloud GCP.",
    skills: ["Entrepreneuriat", "Cloud GCP", "Growth hacking", "Pitch", "English"],
    deadline: "28 Avr 2026",
    postedAt: "08 Mar 2026",
    remote: true,
    imageGradient: "linear-gradient(135deg, #001018 0%, #001e28 50%, #003040 100%)",
    featured: false,
    blocks: [
      { type: "paragraph", text: "Google for Startups Africa ouvre sa cohorte 2026 aux startups africaines les plus prometteuses. Ce programme d'accélération de 6 mois offre un accès direct aux ressources, technologies et experts de Google pour scaler à l'échelle continentale." },
      { type: "heading", text: "Ce que couvre le programme", level: 2 },
      { type: "benefits", items: [
        { icon: "☁️", label: "Crédits cloud", value: "Jusqu'à 200 000 $ de crédits Google Cloud Platform", highlight: true },
        { icon: "🧑‍🏫", label: "Mentorat", value: "Experts Google en ingénierie, produit et growth", highlight: true },
        { icon: "💼", label: "Investisseurs", value: "Mise en relation avec les principaux VC africains", highlight: false },
        { icon: "📍", label: "Format", value: "100% remote avec sessions en présentiel à Lagos", highlight: false },
      ]},
      { type: "heading", text: "Critères de sélection", level: 2 },
      { type: "checklist", items: [
        { label: "Startup africaine early-stage à growth-stage avec MVP fonctionnel" },
        { label: "Équipe fondatrice d'au moins 2 personnes dont un profil technique" },
        { label: "Marché adressable clairement identifié sur le continent africain" },
        { label: "Disponibilité de l'équipe fondatrice pour les sessions hebdomadaires" },
        { label: "Maîtrise de l'anglais (langue principale du programme)" },
      ]},
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Formulaire de candidature en ligne", detail: "Via le portail Google for Startups Africa" },
        { label: "Pitch deck", detail: "10 à 15 slides : problème, solution, marché, traction, équipe" },
        { label: "Démonstration produit", detail: "Lien vers le produit ou vidéo démo de 3 minutes maximum" },
        { label: "Métriques de traction", detail: "Utilisateurs actifs, revenus, croissance MoM" },
      ]},
      { type: "steps", items: [
        { label: "Candidature sur le portail GfS Africa", desc: "Remplissez le formulaire avant la date limite." },
        { label: "Présélection sur dossier", desc: "L'équipe Google évalue la qualité du produit, la traction et le potentiel de croissance." },
        { label: "Entretien de sélection", desc: "Session vidéo de 30 minutes avec l'équipe Google for Startups." },
        { label: "Programme & Demo Day", desc: "6 mois de programme intensif, clôturés par un Demo Day face aux investisseurs partenaires." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Google valorise la traction réelle — mettez vos métriques de croissance en avant, même modestes.",
        "L'équipe compte autant que l'idée : montrez la complémentarité de vos cofondateurs.",
        "Si vous avez déjà utilisé GCP, mentionnez-le — cela montre une affinité avec l'écosystème Google.",
      ]},
    ],
  },
  {
    id: "7",
    slug: "total-energies-stage-ingenieur",
    title: "Stage Ingénieur — Énergies Renouvelables",
    company: "TotalEnergies Afrique",
    companyInitials: "TE",
    location: "Dakar",
    country: "Sénégal",
    flag: "🇸🇳",
    type: "Stage",
    sector: "Énergie & Environnement",
    description: "Stage de fin d'études au sein de la direction développement durable de TotalEnergies Afrique. Projets solaires et éoliens au Sénégal, Côte d'Ivoire et Mali.",
    skills: ["Génie civil / électrique", "AutoCAD", "Gestion de projet", "Français courant", "Excel avancé"],
    deadline: "05 Avr 2026",
    postedAt: "02 Mar 2026",
    salary: "Indemnité + logement",
    remote: false,
    imageGradient: "linear-gradient(135deg, #0e0500 0%, #1e0d00 50%, #2e1500 100%)",
    featured: false,
    blocks: [
      { type: "paragraph", text: "TotalEnergies Afrique recrute un stagiaire ingénieur pour rejoindre sa direction développement durable au Sénégal. Ce stage de 6 mois vous plonge dans des projets d'énergies renouvelables concrets en cours de déploiement sur le continent." },
      { type: "heading", text: "Avantages & conditions", level: 2 },
      { type: "benefits", items: [
        { icon: "💰", label: "Indemnité", value: "Indemnité de stage + logement pris en charge", highlight: true },
        { icon: "🌱", label: "Impact", value: "Contribution directe à la transition énergétique africaine", highlight: true },
        { icon: "✈️", label: "Mobilité", value: "Déplacements possibles au Sénégal, Côte d'Ivoire et Mali", highlight: false },
        { icon: "📋", label: "Suite possible", value: "Possibilité de CDI à l'issue selon les besoins", highlight: false },
      ]},
      { type: "heading", text: "Critères de sélection", level: 2 },
      { type: "checklist", items: [
        { label: "Étudiant en dernière année d'école d'ingénieurs ou Master (génie civil, électrique ou environnemental)" },
        { label: "Connaissances en énergie renouvelable (solaire, éolien) souhaitées" },
        { label: "Maîtrise d'AutoCAD ou d'un logiciel de conception technique" },
        { label: "Bonne maîtrise du français oral et écrit (langue de travail principale)" },
        { label: "Permis de conduire recommandé pour les déplacements sur site" },
      ]},
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Curriculum Vitae", detail: "PDF, 1 à 2 pages en français — mentionnez vos projets liés à l'énergie" },
        { label: "Lettre de motivation", detail: "1 page en français, sur votre intérêt pour les ENR en Afrique" },
        { label: "Relevés de notes récents", detail: "Dernières années de cursus ingénieur ou Master" },
        { label: "Convention de stage", detail: "Document fourni par votre école, après acceptation" },
      ]},
      { type: "steps", items: [
        { label: "Candidature sur le portail TotalEnergies", desc: "Ou envoi direct à la DRH Afrique selon les instructions de l'offre." },
        { label: "Présélection et entretien combiné", desc: "45 minutes : motivation, présentation d'un projet technique et questions de mise en situation." },
        { label: "Validation et convention", desc: "Signature de la convention de stage avec votre établissement et TotalEnergies Afrique." },
        { label: "Prise de poste à Dakar", desc: "Accueil sur site, briefing sécurité et intégration dans l'équipe développement durable." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Mentionnez tout projet académique ou personnel lié aux ENR — même un projet d'école compte.",
        "TotalEnergies valorise la sensibilité environnementale : montrez que vous comprenez les enjeux de la transition énergétique en Afrique.",
        "La connaissance du terrain africain est un vrai plus — mentionnez toute expérience sur le continent.",
      ]},
    ],
  },
  {
    id: "8",
    slug: "boa-data-scientist",
    title: "Data Scientist — Analyse & IA Bancaire",
    company: "Bank of Africa",
    companyInitials: "BA",
    location: "Casablanca",
    country: "Maroc",
    flag: "🇲🇦",
    type: "Emploi CDI",
    sector: "Data & Banque",
    description: "Rejoignez l'équipe Data & IA de Bank of Africa pour développer des modèles de scoring crédit, détection de fraude et analyse comportementale client.",
    skills: ["Python / R", "Machine Learning", "SQL", "Spark / Databricks", "Visualisation de données"],
    deadline: "25 Avr 2026",
    postedAt: "11 Mar 2026",
    salary: "60 000 – 80 000 MAD / an",
    remote: false,
    imageGradient: "linear-gradient(135deg, #080010 0%, #100020 50%, #1a0030 100%)",
    featured: false,
    applyUrl: "https://www.bankofafrica.ma/careers/data-scientist",
    blocks: [
      { type: "paragraph", text: "Bank of Africa recrute un Data Scientist pour son équipe Data & IA à Casablanca. Vous développerez des modèles à fort impact opérationnel — scoring crédit, détection de fraude, analyse comportementale — au service de 5 millions de clients sur le continent." },
      { type: "heading", text: "Avantages & conditions", level: 2 },
      { type: "benefits", items: [
        { icon: "💰", label: "Rémunération", value: "60 000 – 80 000 MAD / an", highlight: true },
        { icon: "🤖", label: "Stack technique", value: "Spark, Databricks, Python, cloud Azure", highlight: true },
        { icon: "📊", label: "Impact", value: "Modèles en production, 5 millions de clients", highlight: false },
        { icon: "📚", label: "Formation", value: "Budget formation annuel + certifications cloud", highlight: false },
      ]},
      { type: "heading", text: "Critères de sélection", level: 2 },
      { type: "checklist", items: [
        { label: "Master en Data Science, Statistique, Mathématiques Appliquées ou Informatique" },
        { label: "Minimum 2 ans d'expérience en modélisation prédictive ou machine learning" },
        { label: "Maîtrise de Python ou R (pandas, scikit-learn, XGBoost…)" },
        { label: "Bonne connaissance de SQL et des bases de données relationnelles" },
        { label: "Expérience Spark / Databricks appréciée" },
        { label: "Capacité à vulgariser les résultats pour des interlocuteurs non techniques" },
      ]},
      { type: "heading", text: "Documents requis", level: 2 },
      { type: "checklist", items: [
        { label: "Curriculum Vitae", detail: "PDF 2 pages — listez explicitement vos projets data et technologies utilisées" },
        { label: "Lettre de motivation", detail: "Avec un exemple de modèle développé et déployé en production" },
        { label: "Lien GitHub ou portfolio", detail: "Fortement recommandé — des projets publics démontrant votre niveau technique" },
      ]},
      { type: "steps", items: [
        { label: "Candidature via le site carrières BOA ou LinkedIn", desc: "Assurez-vous d'inclure un lien GitHub actif dans votre CV." },
        { label: "Screening RH + test technique à domicile", desc: "Exercice data science de 3 à 4 heures : nettoyage, modélisation et interprétation." },
        { label: "Entretien technique", desc: "Discussion de 60 minutes avec le Lead Data Scientist sur votre test et vos choix méthodologiques." },
        { label: "Entretien manager", desc: "Rencontre avec le Directeur Data & IA pour valider l'adéquation culturelle et les perspectives." },
      ]},
      { type: "factbox", title: "Conseils AfriPulse", facts: [
        "Un portfolio GitHub à jour parle plus qu'un long paragraphe de compétences — soignez vos READMEs.",
        "Préparez-vous à justifier vos choix de modèle : pourquoi XGBoost ? Les recruteurs testent votre esprit critique.",
        "La capacité à vulgariser est très valorisée dans le secteur bancaire — entraînez-vous à expliquer vos modèles sans jargon.",
        "Le contexte africain compte : données manquantes, bancarisation partielle — montrez que vous comprenez ces spécificités.",
      ]},
    ],
  },
];


/* ── EVENTS ────────────────────────────────────────────── */
export const events: Event[] = [
  {
    id: "1",
    slug: "africatech-summit-2026",
    title: "AfricaTech Summit 2026",
    eventUrl : "https://non-stop-chat.vercel.app/", 
    type: "Conférence",
    location: "Nairobi",
    country: "Kenya",
    flag: "🇰🇪",
    day: "15",
    month: "Avr",
    year: "2026",
    dateISO: "2026-04-15",
    excerpt: "Le plus grand rendez-vous tech du continent réunit startups, investisseurs et décideurs pour définir l'agenda numérique africain des cinq prochaines années.",
    organizer: "AfricaTech Foundation",
    attendees: "5 000+",
    imageGradient: "linear-gradient(135deg, #001420 0%, #002840 40%, #003a58 70%, #001e30 100%)",
    tags: ["IA", "Startups", "Fintech", "Cloud"],
    featured: true,
    blocks: [
      { type: "paragraph", text: "AfricaTech Summit est le plus grand rendez-vous technologique du continent africain. Chaque année, il rassemble à Nairobi les fondateurs de startups les plus prometteuses, les investisseurs les plus actifs et les décideurs institutionnels qui façonnent l'agenda numérique africain." },
      { type: "paragraph", text: "En 2026, le sommet se concentre sur trois axes majeurs : l'intelligence artificielle appliquée aux défis africains, la fintech et l'inclusion financière, et les infrastructures cloud nécessaires à la souveraineté numérique du continent." },
      { type: "heading", text: "Programme", level: 2 },
      { type: "agenda", sessions: [
        { time: "08:30", title: "Accueil & enregistrement", tag: "Networking" },
        { time: "09:30", title: "Cérémonie d'ouverture — L'Afrique numérique en 2030", speaker: "Keynote · Directeur AfricaTech Foundation", highlight: true, tag: "Keynote" },
        { time: "10:30", title: "Panel : IA africaine — souveraineté et adoption", speaker: "4 intervenants senior" },
        { time: "12:00", title: "Déjeuner & networking", tag: "Networking" },
        { time: "14:00", title: "Ateliers parallèles — Fintech · Cloud · IA santé" },
        { time: "16:00", title: "Pitches startups — finale des 20 sélectionnés", highlight: true, tag: "Live" },
        { time: "18:00", title: "Annonce des lauréats & cocktail de clôture", tag: "Remise de prix" },
      ]},
      { type: "heading", text: "Intervenants confirmés", level: 2 },
      { type: "speakers", people: [
        { name: "Amina Diallo", role: "CEO & Fondatrice", org: "PayAfrika", emoji: "👩🏾‍💼" },
        { name: "Kwame Asante", role: "Partner", org: "Novastar Ventures", emoji: "👨🏿‍💼" },
        { name: "Nadia Benkhalil", role: "Directrice IA", org: "Orange Digital Center", emoji: "👩🏽‍💻" },
        { name: "Olumide Soyombo", role: "Co-fondateur", org: "Voltron Capital", emoji: "👨🏾‍🚀" },
        { name: "Fatou Mbaye", role: "Ministre du Numérique", org: "Gouvernement du Sénégal", emoji: "🏛️" },
        { name: "David Lubega", role: "CTO", org: "Flutterwave", emoji: "👨🏿‍🔬" },
      ]},
      { type: "heading", text: "Pourquoi participer ?", level: 2 },
      { type: "benefits", items: [
        { icon: "🤝", label: "Networking", value: "5 000+ décideurs tech africains", highlight: true },
        { icon: "💡", label: "Insights", value: "40+ panels et keynotes", highlight: false },
        { icon: "🚀", label: "Startups", value: "150 startups en Demo Zone", highlight: false },
        { icon: "💰", label: "Deals", value: "Salle deal-flow investisseurs", highlight: true },
        { icon: "📡", label: "Live stream", value: "Sessions en streaming gratuit", highlight: false },
        { icon: "🏆", label: "Prix", value: "AfricaTech Awards — 50 000 $", highlight: false },
      ]},
      { type: "alert", message: "Les places en présentiel sont limitées à 5 000 participants. L'édition 2025 a affiché complet 6 semaines avant l'événement — inscrivez-vous tôt.", variant: "warning" },
      { type: "location", label: "Nairobi, Kenya", address: "Kenyatta International Convention Centre (KICC), City Square, Nairobi" },
      { type: "apply", label: "Réservez votre place à AfricaTech Summit 2026", url: "https://africatechsummit.com/register", note: "Tarif early-bird disponible jusqu'au 15 mars 2026. Réductions disponibles pour les étudiants et startups.", deadline: "15 Avr 2026" },
    ],
  },
  {
    id: "2",
    slug: "forum-panafricain-jeunesse-2026",
    title: "Forum Panafricain de la Jeunesse",
    type: "Forum",
    location: "Dakar",
    country: "Sénégal",
    flag: "🇸🇳",
    day: "22",
    month: "Avr",
    year: "2026",
    dateISO: "2026-04-22",
    excerpt: "Trois jours de dialogues, ateliers et networking pour les jeunes leaders africains. Emploi, entrepreneuriat et engagement civique au cœur des débats.",
    organizer: "Union Africaine · Jeunesse",
    attendees: "1 200+",
    imageGradient: "linear-gradient(135deg, #0f1a00 0%, #1e3400 40%, #2c4c00 70%, #182800 100%)",
    tags: ["Jeunesse", "Leadership", "Emploi"],
    featured: false,
    blocks: [
      { type: "paragraph", text: "Le Forum Panafricain de la Jeunesse est la plateforme de référence des jeunes leaders africains âgés de 18 à 35 ans. Organisé sous l'égide de l'Union Africaine, il rassemble chaque année à Dakar des milliers de participants pour trois jours de débats, d'ateliers pratiques et de networking intensif." },
      { type: "paragraph", text: "L'édition 2026 place l'employabilité et l'entrepreneuriat au centre, avec une attention particulière sur l'économie numérique, l'agritech et les métiers d'avenir sur le continent." },
      { type: "heading", text: "Programme des 3 jours", level: 2 },
      { type: "agenda", sessions: [
        { time: "Jour 1", title: "Ouverture officielle & plénière : Jeunesse africaine en 2030", highlight: true, tag: "Plénière" },
        { time: "Jour 1", title: "Panels thématiques : Emploi, Tech, Engagement civique" },
        { time: "Jour 2", title: "Ateliers pratiques — Entrepreneuriat, CV, Pitch", tag: "Workshop" },
        { time: "Jour 2", title: "Speed networking — 500 jeunes leaders en simultané", highlight: true, tag: "Networking" },
        { time: "Jour 3", title: "Hackathon jeunesse — solutions aux défis locaux", tag: "Hackathon" },
        { time: "Jour 3", title: "Clôture & remise des Prix Jeunes Leaders UA", highlight: true, tag: "Cérémonie" },
      ]},
      { type: "heading", text: "Intervenants & mentors", level: 2 },
      { type: "speakers", people: [
        { name: "Mariama Kouyaté", role: "Commissaire Jeunesse", org: "Union Africaine", emoji: "🌍" },
        { name: "Idrissa Fall", role: "Fondateur", org: "AfriJobs.com", emoji: "👨🏿‍💻" },
        { name: "Aïssatou Sy", role: "CEO", org: "Dakar Incubator", emoji: "👩🏾‍🚀" },
        { name: "Cheikh Tidiane", role: "Directeur", org: "ANPEJ Sénégal", emoji: "🏛️" },
      ]},
      { type: "benefits", items: [
        { icon: "🎓", label: "Formation", value: "20 ateliers certifiants sur 3 jours", highlight: true },
        { icon: "🤝", label: "Réseau", value: "1 200+ jeunes leaders de 54 pays", highlight: false },
        { icon: "💼", label: "Emploi", value: "Job fair avec 80 recruteurs africains", highlight: true },
        { icon: "🏆", label: "Compétition", value: "Prix Jeunes Leaders UA — bourses et mentorat", highlight: false },
      ]},
      { type: "apply", label: "Participez au Forum Panafricain de la Jeunesse 2026", url: "https://au.int/fpj2026", note: "Participation gratuite pour les ressortissants des pays membres de l'UA. Transport et hébergement à la charge du participant.", deadline: "22 Avr 2026" },
    ],
  },
  {
    id: "3",
    slug: "africa-ceo-forum-2026",
    title: "Africa CEO Forum 2026",
    type: "Salon",
    location: "Abidjan",
    country: "Côte d'Ivoire",
    flag: "🇨🇮",
    day: "08",
    month: "Mai",
    year: "2026",
    dateISO: "2026-05-08",
    excerpt: "Le rendez-vous incontournable des dirigeants d'entreprises opérant en Afrique — deals, panels de haut niveau et networking d'élite sur fond de croissance continentale.",
    organizer: "Jeune Afrique Media Group",
    attendees: "2 500+",
    imageGradient: "linear-gradient(135deg, #1a0a00 0%, #301500 40%, #481e00 70%, #281000 100%)",
    tags: ["Business", "Investissement", "Dirigeants"],
    featured: true,
    blocks: [
      { type: "paragraph", text: "L'Africa CEO Forum est le Davos africain. Réunissant les 2 500 dirigeants les plus influents d'Afrique et du monde, il est le lieu où se concluent les plus grandes transactions et partenariats stratégiques du continent. L'édition 2026 se tient à Abidjan, symbole de la renaissance économique ouest-africaine." },
      { type: "heading", text: "Programme (Jour 1)", level: 2 },
      { type: "agenda", sessions: [
        { time: "09:00", title: "Ouverture — L'Afrique dans l'économie mondiale 2026", highlight: true, tag: "Keynote" },
        { time: "10:30", title: "Panel : Investissements étrangers directs — nouvelle donne", speaker: "CEOs · Banquiers · Ministres" },
        { time: "12:30", title: "Déjeuner d'affaires — tables rondes sectorielles", tag: "Networking" },
        { time: "14:30", title: "Roundtables CEO — sessions fermées par secteur", tag: "Invite only" },
        { time: "17:00", title: "Annonces & MOU signing ceremony", highlight: true },
        { time: "19:30", title: "Dîner de gala officiel", tag: "Gala" },
      ]},
      { type: "heading", text: "Profils attendus", level: 2 },
      { type: "benefits", items: [
        { icon: "🏦", label: "Banques & Finance", value: "400+ DG de banques et fonds", highlight: true },
        { icon: "⚡", label: "Énergie", value: "Leaders du pétrole, gaz et ENR", highlight: false },
        { icon: "📡", label: "Télécoms & Tech", value: "CEOs des majors africains", highlight: false },
        { icon: "🏗️", label: "Infrastructure", value: "BTP, ports, routes, immobilier", highlight: false },
        { icon: "🌾", label: "Agro-industrie", value: "Transformateurs et exportateurs", highlight: false },
        { icon: "🏛️", label: "Gouvernements", value: "Ministres et régulateurs", highlight: true },
      ]},
      { type: "alert", message: "L'accès à l'Africa CEO Forum est sur invitation ou accréditation presse. Soumettez votre candidature avant le 1er avril 2026.", variant: "info" },
      { type: "location", label: "Abidjan, Côte d'Ivoire", address: "Sofitel Abidjan Hôtel Ivoire, Boulevard Hassan II, Cocody" },
      { type: "apply", label: "Demandez votre accréditation — Africa CEO Forum 2026", url: "https://africaceoforum.com/register", note: "Accréditation sous réserve de validation par le comité organisateur. Réponse sous 10 jours ouvrés.", deadline: "01 Avr 2026" },
    ],
  },
  {
    id: "4",
    slug: "panafrican-hackathon-ia-climat",
    title: "Pan-African Hackathon — IA & Climat",
    type: "Hackathon",
    location: "Accra",
    country: "Ghana",
    flag: "🇬🇭",
    day: "20",
    month: "Jun",
    year: "2026",
    dateISO: "2026-06-20",
    excerpt: "72 heures pour concevoir des solutions d'IA face aux défis climatiques africains. 500 développeurs et designers en compétition pour 150 000 $.",
    organizer: "GreenTech Africa",
    attendees: "500",
    imageGradient: "linear-gradient(135deg, #001a10 0%, #003020 40%, #004830 70%, #002418 100%)",
    tags: ["IA", "Climat", "Dev", "Prix 150k$"],
    featured: false,
    blocks: [
      { type: "paragraph", text: "Le Pan-African Hackathon IA & Climat est la plus grande compétition d'innovation technologique du continent centrée sur la crise climatique. En 72 heures non-stop, 500 développeurs, designers et data scientists construisent des solutions concrètes aux défis climatiques africains : sécheresse, déforestation, agriculture résiliente, mobilité durable." },
      { type: "heading", text: "Déroulement des 72h", level: 2 },
      { type: "agenda", sessions: [
        { time: "Vendredi 20h", title: "Kick-off — briefing des challenges & formation des équipes", highlight: true, tag: "Ouverture" },
        { time: "Samedi", title: "72h de hacking continu — mentors disponibles 24h/24", tag: "Build" },
        { time: "Dimanche 18h", title: "Soumission des projets — deadline stricte" },
        { time: "Dimanche 20h", title: "Pitches finaux — 6 équipes sélectionnées", highlight: true, tag: "Finale" },
        { time: "Dimanche 22h", title: "Remise des prix — 150 000 $ à partager", highlight: true, tag: "Remise de prix" },
      ]},
      { type: "heading", text: "Défis proposés", level: 2 },
      { type: "factbox", title: "Les 4 challenges 2026", facts: [
        "🌾 AgriClimat — IA pour la résilience agricole face aux sécheresses en Sahel",
        "🌊 EauAfrique — systèmes prédictifs de gestion des ressources hydriques",
        "🌳 ForêtsData — détection déforestation par satellite + ML en temps réel",
        "🚗 MobilitéVerte — optimisation des transports urbains à faible émission",
      ]},
      { type: "benefits", items: [
        { icon: "💰", label: "Prix total", value: "150 000 $ à remporter", highlight: true },
        { icon: "🚀", label: "Accélération", value: "Top 3 : accès à un programme d'incubation", highlight: true },
        { icon: "🌍", label: "Participants", value: "500 talents de 30+ pays africains", highlight: false },
        { icon: "🧑‍🏫", label: "Mentors", value: "60 experts IA, climat et entrepreneuriat", highlight: false },
      ]},
      { type: "checklist", title: "Ce que vous devez apporter", items: [
        { label: "Ordinateur portable chargé", detail: "Prises disponibles sur place mais limitées" },
        { label: "Accès GitHub ou GitLab actif", detail: "La soumission finale se fait via un repo public" },
        { label: "Compte Hugging Face ou GCP", detail: "Des crédits cloud sont distribués au kick-off" },
        { label: "Votre stack de prédilection", detail: "Python / JS / Rust — tout est accepté" },
      ]},
      { type: "apply", label: "Inscrivez votre équipe au Hackathon IA & Climat 2026", url: "https://greentech-africa.com/hackathon", note: "Inscriptions par équipes de 3 à 5 personnes. Solo possible — des équipes se forment également au kick-off.", deadline: "20 Jun 2026" },
    ],
  },
  {
    id: "5",
    slug: "sommet-entrepreneurs-africains",
    title: "Sommet des Entrepreneurs Africains",
    type: "Sommet",
    location: "Lagos",
    country: "Nigeria",
    flag: "🇳🇬",
    day: "12",
    month: "Jul",
    year: "2026",
    dateISO: "2026-07-12",
    excerpt: "Les 300 entrepreneurs africains les plus influents se réunissent pour définir les priorités de l'écosystème — annonces de fonds et partenariats stratégiques.",
    organizer: "African Entrepreneurs Network",
    attendees: "800+",
    imageGradient: "linear-gradient(135deg, #1a0010 0%, #300020 40%, #480030 70%, #280018 100%)",
    tags: ["Entrepreneuriat", "Scale-up", "Levées de fonds"],
    featured: true,
    blocks: [
      { type: "paragraph", text: "Le Sommet des Entrepreneurs Africains réunit chaque année à Lagos les 300 fondateurs les plus influents du continent pour deux jours de discussions à huis clos, d'annonces stratégiques et de networking de très haut niveau. C'est ici que se décident les grandes alliances et levées de fonds de l'écosystème africain." },
      { type: "heading", text: "Programme", level: 2 },
      { type: "agenda", sessions: [
        { time: "Jour 1 matin", title: "État de l'écosystème — baromètre annuel AEN", highlight: true, tag: "Plénière" },
        { time: "Jour 1 après-midi", title: "Tables rondes founders — sessions Chatham House" },
        { time: "Jour 1 soir", title: "African Founders Dinner — 300 invités", tag: "Gala" },
        { time: "Jour 2 matin", title: "Annonces de fonds & closing ceremony", highlight: true, tag: "Annonces" },
        { time: "Jour 2 après-midi", title: "Speed meetings investisseurs-startups", tag: "Deal flow" },
      ]},
      { type: "heading", text: "Intervenants", level: 2 },
      { type: "speakers", people: [
        { name: "Tope Awotona", role: "Founder & CEO", org: "Calendly", emoji: "👨🏿‍💻" },
        { name: "Iyinoluwa Aboyeji", role: "GP", org: "Future Africa", emoji: "🚀" },
        { name: "Odunayo Eweniyi", role: "Co-fondatrice & COO", org: "PiggyVest", emoji: "👩🏾‍💼" },
        { name: "Sim Shagaya", role: "Founder", org: "uLesson", emoji: "👨🏾‍🏫" },
      ]},
      { type: "compare", title: "Sommet AEN vs autres grands forums africains", columns: [
        { label: "Sommet AEN", color: "#7A1E4A" },
        { label: "Africa CEO Forum", color: "#C08435" },
        { label: "AfricaTech Summit", color: "#1E4DA8" },
      ], rows: [
        { label: "Public cible", values: ["Founders uniquement", "C-Suite tout secteur", "Tech & investissement"] },
        { label: "Format", values: ["Huis clos", "Ouvert (accréditation)", "Ouvert (inscription)"] },
        { label: "Participants", values: ["800", "2 500+", "5 000+"] },
        { label: "Focus deals", values: ["★★★", "★★★", "★★"] },
      ]},
      { type: "apply", label: "Postulez au Sommet des Entrepreneurs Africains 2026", url: "https://african-entrepreneurs.net/sommet2026", note: "Accès sur candidature uniquement. Profil minimum : fondateur d'une startup ayant levé 500k$ ou générant 1M$ de revenus annuels.", deadline: "12 Jul 2026" },
    ],
  },
  {
    id: "6",
    slug: "atelier-fintech-innovation",
    title: "Atelier Innovation FinTech — BAD",
    type: "Atelier",
    location: "Abidjan",
    country: "Côte d'Ivoire",
    flag: "🇨🇮",
    day: "03",
    month: "Aoû",
    year: "2026",
    dateISO: "2026-08-03",
    excerpt: "La BAD réunit régulateurs, banquiers et fintechs pour co-construire le cadre réglementaire de la finance numérique panafricaine.",
    organizer: "Banque Africaine de Développement",
    attendees: "250",
    imageGradient: "linear-gradient(135deg, #0a0a1a 0%, #141428 40%, #1e1e3c 70%, #0e0e22 100%)",
    tags: ["Fintech", "Régulation", "Paiements"],
    featured: false,
    blocks: [
      { type: "paragraph", text: "Organisé par la Banque Africaine de Développement, cet atelier de haut niveau réunit régulateurs, banques centrales et leaders de la fintech africaine pour un exercice unique : co-construire ensemble les recommandations réglementaires de la finance numérique panafricaine." },
      { type: "paragraph", text: "Format délibérément restreint à 250 participants pour favoriser des échanges approfondis. Les conclusions alimenteront directement le rapport politique de la BAD présenté aux chefs d'État lors du prochain Sommet de l'UA." },
      { type: "heading", text: "Agenda de l'atelier", level: 2 },
      { type: "agenda", sessions: [
        { time: "09:00", title: "Ouverture — Vice-Président BAD Finance", highlight: true },
        { time: "09:45", title: "Présentation : état de la régulation fintech sur le continent" },
        { time: "11:00", title: "Atelier 1 — Interopérabilité des paiements mobiles", tag: "Workshop" },
        { time: "12:30", title: "Déjeuner de travail" },
        { time: "14:00", title: "Atelier 2 — KYC, AML et inclusion financière", tag: "Workshop" },
        { time: "15:30", title: "Atelier 3 — Open Banking : standards communs", tag: "Workshop" },
        { time: "17:00", title: "Synthèse & adoption des recommandations", highlight: true },
      ]},
      { type: "heading", text: "Intervenants", level: 2 },
      { type: "speakers", people: [
        { name: "Dr. Akinwumi Adesina", role: "Président", org: "Banque Africaine de Développement", emoji: "🏦" },
        { name: "Leila Kamara", role: "Gouverneure", org: "BCEAO", emoji: "🏛️" },
        { name: "Tosin Eniolorunda", role: "CEO", org: "Moniepoint", emoji: "👨🏿‍💼" },
        { name: "Raphael Afaedor", role: "Co-fondateur", org: "Zeepay", emoji: "👨🏾‍💻" },
      ]},
      { type: "alert", message: "Cet atelier est sur invitation uniquement. Les candidatures externes sont examinées par le comité BAD. Seuls les profils régulateurs, banquiers centraux et CEO fintech sont éligibles.", variant: "info" },
      { type: "apply", label: "Soumettez votre candidature à l'Atelier FinTech BAD", url: "https://afdb.org/events/fintech-workshop-2026", note: "Invitation ou candidature avec lettre de motivation. Réponse de la BAD sous 3 semaines.", deadline: "03 Aoû 2026" },
    ],
  },
  {
    id: "7",
    slug: "african-women-leadership-forum",
    title: "African Women Leadership Forum",
    type: "Forum",
    location: "Kigali",
    country: "Rwanda",
    flag: "🇷🇼",
    day: "18",
    month: "Sep",
    year: "2026",
    dateISO: "2026-09-18",
    excerpt: "Un espace dédié aux femmes leaders africaines — politiques, entrepreneures, militantes — pour partager, inspirer et tisser des réseaux d'influence durables.",
    organizer: "WomenAfrica Initiative",
    attendees: "600+",
    imageGradient: "linear-gradient(135deg, #1a0818 0%, #301030 40%, #481848 70%, #280c28 100%)",
    tags: ["Femmes", "Leadership", "Réseau"],
    featured: false,
    blocks: [
      { type: "paragraph", text: "L'African Women Leadership Forum est le rendez-vous annuel des femmes qui font bouger l'Afrique. Politiques, entrepreneures, scientifiques, militantes : 600 femmes d'exception se retrouvent à Kigali — ville symbole d'une Afrique qui place les femmes au cœur de son développement." },
      { type: "heading", text: "Programme", level: 2 },
      { type: "agenda", sessions: [
        { time: "Matin J1", title: "Plénière d'ouverture — Women shaping Africa 2026", highlight: true, tag: "Keynote" },
        { time: "Après-midi J1", title: "Panels sectoriels — Tech, Finance, Politique, Sciences" },
        { time: "Soir J1", title: "Dîner de mentorat — 60 tables de 10", tag: "Networking" },
        { time: "Matin J2", title: "Ateliers leadership — Négociation, Prise de parole, Fundraising", tag: "Workshop" },
        { time: "Après-midi J2", title: "AWLF Awards — 10 Prix Leadership Féminin Africain", highlight: true, tag: "Cérémonie" },
      ]},
      { type: "heading", text: "Intervenantes", level: 2 },
      { type: "speakers", people: [
        { name: "Dr. Ngozi Okonjo-Iweala", role: "Directrice Générale", org: "OMC", emoji: "🌍" },
        { name: "Strive Masiyiwa", role: "Fondateur", org: "Econet Group", emoji: "👨🏿‍💼" },
        { name: "Rebecca Enonchong", role: "CEO", org: "AppsTech", emoji: "👩🏿‍💻" },
        { name: "Bethlehem Tilahun", role: "Fondatrice", org: "soleRebels", emoji: "👩🏾‍🏭" },
      ]},
      { type: "pullquote", text: "Quand les femmes africaines se réunissent, le continent avance. Ce forum est un accélérateur d'histoire.", author: "Fondatrice, WomenAfrica Initiative" },
      { type: "apply", label: "Participez à l'African Women Leadership Forum 2026", url: "https://womenafrica.org/forum2026", note: "Forum ouvert à toutes les femmes leaders africaines. Candidature recommandée pour les sessions VIP et tables de mentorat.", deadline: "18 Sep 2026" },
    ],
  },
  {
    id: "8",
    slug: "africa-climate-week-2026",
    title: "Africa Climate Week 2026",
    type: "Conférence",
    location: "Le Caire",
    country: "Égypte",
    flag: "🇪🇬",
    day: "05",
    month: "Oct",
    year: "2026",
    dateISO: "2026-10-05",
    excerpt: "Scientifiques, ministres et ONG évaluent les engagements climatiques du continent et accélèrent les financements verts lors de cette semaine annuelle.",
    organizer: "PNUE · Nations Unies",
    attendees: "3 000+",
    imageGradient: "linear-gradient(135deg, #001810 0%, #003020 40%, #004830 70%, #002010 100%)",
    tags: ["Climat", "COP", "Financement vert"],
    featured: true,
    blocks: [
      { type: "paragraph", text: "Africa Climate Week est l'événement climatique de référence du continent africain, organisé chaque année par le PNUE en préparation de la COP mondiale. Il réunit scientifiques du GIEC, ministres de l'environnement, ONG, et secteur privé pour mesurer les progrès, identifier les lacunes et mobiliser les financements verts." },
      { type: "paragraph", text: "L'édition 2026 au Caire intervient à un moment critique : l'Afrique, responsable de seulement 4 % des émissions mondiales, subit de plein fouet les impacts du dérèglement climatique. Le financement des pertes et dommages sera au cœur des négociations." },
      { type: "heading", text: "Programme de la semaine", level: 2 },
      { type: "agenda", sessions: [
        { time: "Jour 1", title: "Rapport GIEC Afrique 2026 — présentation officielle", highlight: true, tag: "Rapport" },
        { time: "Jour 2", title: "Négociations techniques — pertes, dommages et adaptation" },
        { time: "Jour 3", title: "Finance verte — mobilisation des 100 milliards promis", highlight: true, tag: "Finance" },
        { time: "Jour 4", title: "Journée secteur privé — entreprises et transition bas carbone", tag: "Business" },
        { time: "Jour 5", title: "Adoption de la Déclaration du Caire & clôture", highlight: true, tag: "Clôture" },
      ]},
      { type: "heading", text: "Intervenants clés", level: 2 },
      { type: "speakers", people: [
        { name: "Sameh Shoukri", role: "Ministre des AE & Président COP27", org: "Gouvernement Égyptien", emoji: "🌿" },
        { name: "Inger Andersen", role: "Directrice Exécutive", org: "PNUE", emoji: "🌍" },
        { name: "Ambroise Fayolle", role: "Vice-Président", org: "BEI", emoji: "🏦" },
        { name: "Hindou Ibrahim", role: "Militante climatique", org: "IPACC Tchad", emoji: "👩🏾‍🌾" },
      ]},
      { type: "factbox", title: "Chiffres clés Africa Climate Week 2025", facts: [
        "3 000+ participants de 54 pays africains",
        "120+ sessions plénières, panels et ateliers techniques",
        "8,5 milliards $ d'engagements de financement vert annoncés",
        "54 délégations gouvernementales officielles représentées",
      ]},
      { type: "location", label: "Le Caire, Égypte", address: "Cairo International Convention Centre (CICC), Nasr City, Le Caire" },
      { type: "apply", label: "Accréditation Africa Climate Week 2026", url: "https://unfccc.int/acw2026", note: "Accréditation gratuite pour les représentants gouvernementaux, ONG accréditées et institutions de recherche. Secteur privé : formulaire spécifique.", deadline: "05 Oct 2026" },
    ],
  },
];