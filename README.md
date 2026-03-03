# AfriPulse — Next.js 14 + Supabase + Resend

Plateforme complète : actualités, bourses d'études, opportunités africaines — avec authentification, dashboard admin et newsletter intégrés.

## 🚀 Stack

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Style | Tailwind CSS + CSS Variables |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Email | Resend |
| Deploy | Vercel |

---

## ⚡ Démarrage rapide

### 1. Installation
```bash
cd afripulse
npm install
```

### 2. Variables d'environnement
```bash
cp .env.local.example .env.local
```
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxx...
RESEND_API_KEY=re_xxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Base de données Supabase
1. Créez un projet sur [supabase.com](https://supabase.com)
2. SQL Editor → copiez/exécutez `supabase/migrations/001_initial_schema.sql`
3. Donnez-vous le rôle admin :
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'votre@email.com';
   ```

### 4. Lancer
```bash
npm run dev  # → http://localhost:3000
```

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
