// lib/data.ts — Mock data (replace with Supabase queries later)

export type Category = "Politique" | "Économie" | "Tech" | "Sport" | "Culture" | "Santé" | "Environnement";
export type ScholarshipLevel = "Licence" | "Master" | "Doctorat" | "Postdoc" | "Toutes formations";
export type OpportunityType = "Emploi CDI" | "Stage" | "Graduate" | "Emploi" | "Freelance" | "Volontariat";
export type EventType = "Conférence" | "Forum" | "Hackathon" | "Salon" | "Atelier" | "Sommet";

/* ══════════════════════════════════════════════════════════
   SYSTÈME DE BLOCS — le cœur du CMS
   Chaque bloc représente un élément visuel dans la rédaction.
   Compatible Supabase JSON column.
══════════════════════════════════════════════════════════ */

export type Block =
  | { type: "paragraph";  text: string }
  | { type: "heading";    text: string; level?: 2 | 3 }
  | { type: "image";      url: string; caption?: string; alt: string; credit?: string }
  | { type: "video";      url: string; caption?: string; platform?: "youtube" | "vimeo" | "other" }
  | { type: "pullquote";  text: string; author?: string; role?: string }
  | { type: "factbox";    title: string; facts: string[] }
  | { type: "related";    slug: string; label?: string }
  | { type: "external";   url: string; label: string; description?: string; favicon?: string }
  | { type: "alert";      message: string; variant?: "info" | "warning" | "tip" }
  | { type: "download";   url: string; label: string; size?: string }
  | { type: "divider" }

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

/* ── OPPORTUNITIES ─────────────────────────────────────── */
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

/* ── EVENTS ────────────────────────────────────────────── */
export const events: Event[] = [
  { id: "1", slug: "africatech-summit-2026", title: "AfricaTech Summit 2026", type: "Conférence", location: "Nairobi, Kenya", day: "15", month: "Avr", year: "2026" },
  { id: "2", slug: "forum-panafricain-jeunesse-2026", title: "Forum Panafricain de la Jeunesse", type: "Forum", location: "Dakar, Sénégal", day: "22", month: "Avr", year: "2026" },
  { id: "3", slug: "africa-ceo-forum-2026", title: "Africa CEO Forum 2026", type: "Salon", location: "Abidjan, Côte d'Ivoire", day: "08", month: "Mai", year: "2026" },
  { id: "4", slug: "panafrican-hackathon-ia-climat", title: "Pan-African Hackathon — IA & Climat", type: "Hackathon", location: "Accra, Ghana", day: "20", month: "Jun", year: "2026" },
  { id: "5", slug: "sommet-entrepreneurs-africains", title: "Sommet des Entrepreneurs Africains", type: "Sommet", location: "Lagos, Nigeria", day: "12", month: "Jul", year: "2026" },
  { id: "6", slug: "atelier-fintech-innovation", title: "Atelier Innovation FinTech — BAD", type: "Atelier", location: "Abidjan, Côte d'Ivoire", day: "03", month: "Aoû", year: "2026" },
  { id: "7", slug: "african-women-leadership-forum", title: "African Women Leadership Forum", type: "Forum", location: "Kigali, Rwanda", day: "18", month: "Sep", year: "2026" },
  { id: "8", slug: "africa-climate-week-2026", title: "Africa Climate Week 2026", type: "Conférence", location: "Cairo, Égypte", day: "05", month: "Oct", year: "2026" },
];