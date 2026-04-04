# 📰 AfriPulse

> **Plateforme digitale africaine** pour découvrir les actualités, opportunités et ressources du continent.

**AfriPulse** est une plateforme moderne et complète offrant un accès centralisé aux actualités africaines, bourses d'études, opportunités de carrière, événements et ressources professionnelles. Avec un système d'authentification robuste, un tableau de bord administrateur puissant et une newsletter intégrée, AfriPulse permet aux utilisateurs de rester informés et connectés aux meilleures opportunités en Afrique.

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture du projet](#️-architecture-du-projet)
- [Démarrage rapide](#-démarrage-rapide)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Gestion des contenu](#-gestion-des-contenus)
- [Guide du développeur](#-guide-du-développeur)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)

---

## ✨ Fonctionnalités

### 🌍 Pour les utilisateurs

- **📰 Actualités africaines** : Parcourez, recherchez et lisez des articles catégorisés (Politique, Économie, Tech, Sport, Culture, Santé, Environnement)
- **🎓 Bourses d'études** : Découvrez les programmes de bourses par niveau (Licence, Master, Doctorat, Postdoc)
- **💼 Opportunités professionnelles** : Emplois, stages, volontariats et projets freelance
- **🎪 Événements** : Conférences, forums, hackathons, salons et ateliers
- **🔍 Recherche avancée** : Moteur de recherche intégré avec filtres multiples
- **📧 Newsletter** : Abonnement et confirmation par email avec Resend
- **👤 Authentification sécurisée** : Inscription, connexion via Supabase Auth
- **📊 Tableau de bord personnel** : Suivi des candidatures et préférences

### 👨‍💼 Pour les administrateurs

- **🎛️ Tableau de bord complet** : Vue d'ensemble des statistiques et contenus
- **✏️ Editeur de contenu** : Interface WYSIWYG avec blocks personnalisables
  - Paragraphes, images, vidéos, citations, boîtes de faits
  - Étapes, checklists, comparaisons, agendas
  - Blocs spécialisés (candidature, localisation, profils, avantages)
- **📈 Gestion multi-ressources** :
  - Articles et actualités
  - Bourses d'études
  - Opportunités professionnelles
  - Événements
- **👥 Gestion des utilisateurs** : Administration des rôles et permissions
- **📊 Analytics** : Suivi de l'audience, engagement, stratégie de contenu
- **📬 Newsletter** : Gestion des abonnés

### 🔐 Sécurité

- **Row Level Security (RLS)** : Protection au niveau base de données
- **Authentification JWT** : Via Supabase Auth
- **Middleware de protection** : Restriction des routes admin
- **Rôles et permissions** : Admin, Éditeur, Lecteur

---

## 🔧 Stack technique

| Aspect               | Technologie                      |
| -------------------- | -------------------------------- |
| **Framework**        | Next.js 14 (App Router)          |
| **Langage**          | TypeScript 5                     |
| **Styling**          | Tailwind CSS 3.4 + CSS Variables |
| **Backend**          | Supabase (PostgreSQL 15)         |
| **Authentification** | Supabase Auth + JWT              |
| **Base données**     | PostgreSQL + RLS                 |
| **Email**            | Resend                           |
| **Déploiement**      | Vercel                           |
| **Package manager**  | npm                              |

### Dépendances principales

```json
{
  "next": "14.2.5",
  "react": "^18",
  "typescript": "^5",
  "tailwindcss": "^3.4.1",
  "@supabase/supabase-js": "^2.100.0",
  "@supabase/auth-helpers-nextjs": "^0.15.0",
  "@supabase/ssr": "^0.4.1",
  "resend": "^6.9.4"
}
```

---

## 🏗️ Architecture du projet

### Arborescence

```
afripulse/
├── app/                          # Next.js App Router
│   ├── (routes publiques)/
│   │   ├── page.tsx             # Accueil
│   │   ├── actualites/          # Listing & détails articles
│   │   ├── bourses/             # Listing & détails bourses
│   │   ├── opportunites/        # Listing & détails opportunités
│   │   ├── evenements/          # Listing & détails événements
│   │   ├── recherche/           # Page de recherche
│   │   └── contact/, cgu/, confidentialite/, a-propos/
│   │
│   ├── admin/                    # Routes protégées (admin/éditeur)
│   │   ├── page.tsx             # Dashboard principal
│   │   ├── articles/            # CRUD articles
│   │   ├── bourses/             # CRUD bourses
│   │   ├── opportunites/        # CRUD opportunités
│   │   ├── evenements/          # CRUD événements
│   │   ├── newsletter/          # Gestion newsletter
│   │   ├── utilisateurs/        # Gestion utilisateurs
│   │   ├── analytique/          # Dashboard analytics
│   │   │   ├── audience/
│   │   │   ├── contenu/
│   │   │   └── engagement/
│   │   └── layout.tsx           # Layout admin protégé
│   │
│   ├── auth/                     # Authentification
│   │   ├── connexion/           # Page de connexion
│   │   ├── inscription/         # Page d'inscription
│   │   ├── deconnexion/         # Logout
│   │   ├── callback/            # OAuth callback
│   │   └── route.ts
│   │
│   ├── api/                      # Routes API
│   │   ├── newsletter/
│   │   │   ├── route.ts         # Subscription
│   │   │   └── confirm/         # Confirmation
│   │   └── ...
│   │
│   ├── dashboard/               # Tableau de bord utilisateur
│   └── layout.tsx, page.tsx
│
├── components/                   # Composants React
│   ├── layout/
│   │   ├── Navbar.tsx           # Navigation principale
│   │   └── Footer.tsx           # Pied de page
│   │
│   ├── sections/
│   │   ├── NewsletterBand.tsx   # Section newsletter
│   │   ├── Ticker.tsx           # Actualités en temps réel
│   │   └── ...
│   │
│   ├── admin/
│   │   ├── AdminTable.tsx       # Tableaux CRUD
│   │   ├── BlockBuilder.tsx     # Éditeur de blocks
│   │   └── AdminModal.tsx
│   │
│   ├── illustrations/
│   │   └── (composants SVG)
│   │
│   ├── search/
│   │   └── SearchModal.tsx      # Modal de recherche
│   │
│   └── ui/
│       ├── DetailPageShared.tsx # Layout détail partagé
│       ├── RevealWrapper.tsx    # Animation reveal
│       ├── Toast.tsx
│       ├── Spinner.tsx
│       └── ...
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Client Supabase côté client
│   │   └── server.ts            # Client Supabase côté serveur
│   │
│   ├── utils.ts                 # Utilitaires généraux
│   ├── user-actions.ts          # Server Actions utilisateur
│   ├── data.ts                  # Helpers de données
│   ├── constants/
│   │   └── categories.ts        # Énumérations
│   └── countries.json           # Data statique pays
│
├── types/
│   ├── database.ts              # Types Supabase + Types métier
│   ├── blocks.ts                # Types system de blocks
│   ├── index.ts
│   └── supabase-analytics.ts
│
├── hooks/
│   ├── useAuth.ts               # Hook authentification
│   ├── useSearch.ts             # Hook recherche
│   └── useToast.ts              # Hook notifications
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── insert_data.sql
│
├── scripts/
│   └── seed-articles.ts         # Script de seed données
│
├── middleware.ts                # Middleware Next.js (RLS)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Architecture des données

**Tables principales (Supabase PostgreSQL):**

- `profiles` : Profils utilisateurs (rôles, authentification)
- `articles` : Actualités et contenus
- `scholarships` : Bourses d'études
- `opportunities` : Opportunités professionnelles
- `events` : Événements et conférences
- `newsletter_subscribers` : Abonnés newsletter
- `user_applications` : Candidatures utilisateurs
- `analytics_events` : Suivi analytique

### Système de blocks éditeur

Le système est extensible et supporte 20+ types de blocks :

- **Contenu** : Paragraphes, titres, images, vidéos
- **Mise en forme** : Citations, boîtes de faits, alertes
- **Navigation** : Contenu associé, liens externes
- **Interactif** : Checklists, étapes, comparaisons
- **Spécialisé** : Agendas, profils, avantages, candidatures

Chaque bloc est storable en JSONB pour une flexibilité maximale.

---

## ⚡ Démarrage rapide

### 1. Installation des dépendances

```bash
cd afripulse
npm install
```

### 2. Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Récupérez votre `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Générez une `SUPABASE_SERVICE_ROLE_KEY` depuis Project Settings → API

### 3. Variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
# ──── Supabase ────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ──── Resend (Email) ────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxx

# ──── Site ────
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Configuration base de données

Execute le schéma initial :

```bash
# Via Supabase Studio SQL Editor
# Copier/coller le contenu de supabase/migrations/001_initial_schema.sql
```

Puis promettez-vous admin :

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'votre@email.com';
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## ⚙️ Configuration

### Variables d'environnement essentielles

| Variable                        | Description                   | Exemple                   |
| ------------------------------- | ----------------------------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL du projet Supabase        | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase         | JWT token                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clé de service (côté serveur) | JWT token                 |
| `RESEND_API_KEY`                | Clé API Resend pour emails    | `re_xxxxx`                |
| `NEXT_PUBLIC_SITE_URL`          | URL du site                   | `http://localhost:3000`   |

### Tailwind CSS & Styling

- Configuration : [tailwind.config.ts](tailwind.config.ts)
- CSS global : [app/globals.css](app/globals.css)
- Supports des variables CSS personnalisées pour les thèmes

### TypeScript

- Configuration stricte : [tsconfig.json](tsconfig.json)
- Types metier : [types/database.ts](types/database.ts)

---

## 🚀 Utilisation

### Pour les utilisateurs

**Accueil**

- Parcourez les actualités, bourses et opportunités en vedette
- Consultez la ticker d'actualités en temps réel
- Abonnez-vous à la newsletter

**Articles**

```
/actualites              → Liste paginée
/actualites/[slug]     → Détail article avec système de blocks
```

**Ressources**

```
/bourses/[slug]         → Détail bourse
/opportunites/[slug]    → Détail opportunité
/evenements/[slug]      → Détail événement
```

**Recherche**

```
/recherche?q=keyword    → Recherche tous les contenus
```

**Authentification**

```
/auth/connexion         → Connexion
/auth/inscription       → Création compte
/dashboard              → Tableau de bord personnel
```

### Pour les administrateurs

**Accès admin**

- URL : http://localhost:3000/admin
- Requires : compte avec rôle `admin` ou `editor`

**Articles**

```
POST   /admin/articles/nouveau     → Créer
PATCH  /admin/articles/[id]        → Éditer
DELETE /admin/articles/[id]        → Supprimer
```

**Dashboard**

- Vue d'ensemble des contenus
- Statistiques d'engagement
- Analyse du public par contenu type

**Analytics**

- `/admin/analytique/audience` : Démographie et source de trafic
- `/admin/analytique/contenu` : Performance par article/ressource
- `/admin/analytique/engagement` : Taux interaction, temps de lecture

---

## 📝 Gestion des contenus

### Système d'édition

L'éditeur utilise un **système de blocks modulaires** stockés en JSONB :

```typescript
type Block =
  | { type: "paragraph"; text: string }
  | { type: "image"; url: string; alt: string; caption?: string }
  | { type: "heading"; text: string; level: 2 | 3 }
  | { type: "video"; url: string; platform: "youtube" | "vimeo" }
  | { type: "pullquote"; text: string; author?: string }
  | { type: "checklist"; items: { label: string; detail?: string }[] }
  | { type: "steps"; items: { label: string; desc: string }[] }
  | { type: "apply"; url: string; deadline?: string };
// ... 20+ autres types
```

### Créer un article

1. Admin → Actualités → Nouveau
2. Remplir : Titre, Description, Catégorie, Couverture
3. Construire le contenu avec les blocks disponibles
4. Configurer : Auteur, Temps de lecture, Tags
5. Publier ou brouillon

### Types de contenu

**Actualités**

- Catégories : Politique, Économie, Tech, Sport, Culture, Santé, Environnement
- Rich editor avec blocks
- Métadonnées : auteur, temps de lecture, couverture

**Bourses**

- Niveaux : Licence, Master, Doctorat, Postdoc
- Champs : Région, Deadline, Montant, Éligibilité
- Description en blocks

**Opportunités**

- Types : Emploi CDI, Stage, Graduate, Freelance, Volontariat
- Champs : Secteur, Localisation, Deadline, Salaire indicatif
- Détails en blocks

**Événements**

- Types : Conférence, Forum, Hackathon, Salon, Atelier
- Dates/heures, Localisation, Inscription
- Agenda et speakers avec blocks spécialisés

---

## 👨‍💻 Guide du développeur

### Créer un hook personnalisé

```typescript
// hooks/useCustom.ts
"use client";

import { useState, useEffect } from "react";

export function useCustom() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Logic
  }, []);

  return { data };
}
```

### Ajouter une API route

```typescript
// app/api/exemple/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();

  const { data, error } = await supabase.from("table").select("*");

  return NextResponse.json(data);
}
```

### Server Actions

```typescript
// lib/user-actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateProfile(userId: string, updates: any) {
  const supabase = createClient();

  return await supabase.from("profiles").update(updates).eq("id", userId);
}
```

### Utiliser Supabase côté client

```typescript
// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

export function createClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Usage dans un composant
const supabase = createClient();
const { data } = await supabase.from("articles").select("*");
```

### Protection des routes admin

Le `middleware.ts` protège automatiquement `/admin/*` :

- Vérifie l'authentification
- Vérifie le rôle utilisateur (`admin` ou `editor`)
- Redirige les non-autorisés

### Gestion des erreurs et notifications

```typescript
import { useToast } from "@/hooks/useToast";

const { toast } = useToast();

// Utilisation
toast("Succès !", "success");
toast("Une erreur s'est produite", "error");
```

---

## 🚢 Déploiement

### Sur Vercel (recommandé)

1. **Préparation**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connexion Vercel**

- Allez sur [vercel.com](https://vercel.com)
- Cliquez "New Project" → sélectionnez le repo
- Vercel détecte Next.js automatiquement

3. **Variables d'environnement**
   Settings → Environment Variables

- Ajoutez toutes les clés de `.env.local`

4. **Déploiement**
   Vercel déploie automatiquement à chaque `push` sur `main`

### Sur un serveur custom

```bash
# Build
npm run build

# Start
npm start
```

L'app écouta sur http://localhost:3000

---

## 📊 Scripts disponibles

```bash
npm run dev      # Développement (hot reload)
npm run build    # Build production
npm start        # Démarrer production
npm run lint     # Linter le code
```

---

## 🤝 Contribution

### Workflow recommandé

1. **Feature branch**

```bash
git checkout -b feature/ma-fonctionnalite
```

2. **Développement et tests**

```bash
npm run dev
npm run lint
```

3. **Commit**

```bash
git add .
git commit -m "feat: description de la feature"
git push origin feature/ma-fonctionnalite
```

4. **Pull Request**

- Décrivez les changements
- Testez avant de proposer

### Conventions de code

- **TypeScript** : Types stricts, `noImplicitAny: true`
- **Components** : Functional components avec hooks
- **Naming** : camelCase pour les variables, PascalCase pour les composants
- **Styles** : Tailwind CSS (pas de CSS-in-JS)
- **Formatage** : ESLint Next.js

---

## 📄 Licence

Propriétaire - AfriPulse © 2024

---

## 📧 Support & Contact

Pour toute question ou bug report :

- Email : support@afripulse.com
- Issues : GitHub Issues
- Discord : [Serveur communauté]

---

**Dernière mise à jour** : Avril 2026  
**Version** : 0.2.0

---

## 📁 Structure

```
app/
├── page.tsx                    # Accueil
├── actualites/[slug]           # Articles
├── bourses/[slug]              # Bourses d'études
├── opportunites/[slug]         # Opportunités
├── evenements/[slug]           # Événements
├── about/                      # À propos
├── recherche/                  # Recherche globale
├── auth/connexion              # Login (email + Google OAuth)
├── auth/inscription            # Inscription
├── admin/                      # Dashboard admin (protégé)
│   ├── articles/[id]           # Éditeur article
│   ├── bourses/
│   ├── opportunites/
│   ├── evenements/
│   └── newsletter/             # Gestion abonnés + campagnes
└── api/newsletter/             # POST → Resend

hooks/
├── useAuth.ts                  # Session + profil
└── useSearch.ts                # Filtrage client

lib/supabase/
├── client.ts                   # Client navigateur
└── server.ts                   # Client serveur

supabase/migrations/
└── 001_initial_schema.sql      # Schéma + RLS + triggers
```

---

## 🔐 Auth & Rôles

- **Email/Password** + **Google OAuth**
- Rôles : `reader` · `editor` · `admin`
- Middleware protège automatiquement `/admin`

## 📬 Newsletter (Resend)

Le endpoint `POST /api/newsletter` :

1. Vérifie + sauvegarde l'email dans Supabase
2. Envoie un email HTML de bienvenue via Resend

## 🔍 Recherche globale

`/recherche?q=terme` — recherche en temps réel dans articles, bourses, opportunités et événements.

## 🔄 Passer des mock data à Supabase

```typescript
// Dans chaque page server component, remplacer :
import { articles } from "@/lib/data";

// Par :
import { createClient } from "@/lib/supabase/server";
const supabase = createClient();
const { data: articles } = await supabase
  .from("articles")
  .select("*")
  .eq("published", true)
  .order("date", { ascending: false });
```

## 🚀 Déploiement Vercel

```bash
vercel
# Configurer les variables d'environnement dans le dashboard Vercel
```

---

Construit pour l'Afrique · Next.js 14 · Supabase · Resend
