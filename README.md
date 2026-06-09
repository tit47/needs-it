# Need's it — Architecture (Étape 01)

Plateforme de mise en relation entre particuliers et professionnels.

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Emails | Resend |
| Notifications | Telegram |

## Démarrage

```bash
cp .env.example .env.local
# Renseigner les clés Supabase, Resend, Telegram

npm install
npm run dev
```

## Structure

```
app/          → Pages (App Router)
components/   → Composants UI et layout
lib/          → Clients Supabase, Resend, Telegram
services/     → Accès données Supabase
types/        → Types TypeScript (tables)
hooks/        → Hooks React (à compléter)
emails/       → Templates emails (à compléter)
utils/        → Utilitaires
supabase/     → Migrations SQL
public/       → Assets statiques
```

## Base de données

Appliquer la migration initiale :

```bash
supabase db push
# ou exécuter supabase/migrations/20250609000000_initial_schema.sql
```

## Pages disponibles

| Route | Description |
|-------|-------------|
| `/` | Accueil (landing) |
| `/pro/[token]` | Page professionnelle |
| `/admin` | Dashboard admin |
| `/admin/demandes` | Demandes |
| `/admin/professionnels` | Professionnels |
| `/admin/candidats` | Candidats |
| `/admin/alertes` | Alertes |
| `/admin/opportunites` | Opportunités |
| `/admin/facturation` | Facturation |
| `/admin/parametres` | Paramètres |

## Étape suivante

Les fonctionnalités métier (formulaire client, matching, emails, etc.) seront implémentées aux étapes suivantes.
