# Need's it

Plateforme de mise en relation entre **particuliers** et **professionnels** du dépannage et des services à domicile.

**État du projet : étapes 01, 02 et 03 terminées.**  
Le code existant est la source de vérité — réutiliser composants, services et types avant d'en créer de nouveaux.

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Emails | Resend |
| Notifications | Telegram (lib prête, usage métier à venir) |
| Géocodage | API BAN (adresse.data.gouv.fr) |

---

## Démarrage

```bash
cp .env.example .env.local
# Renseigner les variables (voir ci-dessous)

npm install
npm run dev
```

### Variables d'environnement

| Variable | Obligatoire | Rôle |
|----------|-------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui | Opérations serveur (actions, matching, workflow pro) |
| `NEXT_PUBLIC_APP_URL` | Oui | URL de l'app (liens emails pro, ex. `http://localhost:3000`) |
| `RESEND_API_KEY` | Recommandé | Envoi des emails transactionnels |
| `RESEND_FROM_EMAIL` | Recommandé | Expéditeur (défaut : `Need's it <noreply@needs-it.fr>`) |
| `CRON_SECRET` | Optionnel | Sécurise `GET /api/cron/reminders` |
| `TELEGRAM_BOT_TOKEN` | Optionnel | Alertes Telegram (étape future) |
| `TELEGRAM_CHAT_ID` | Optionnel | Canal Telegram (étape future) |

### Base de données

Appliquer toutes les migrations :

```bash
supabase db push
```

Fichiers (dans l'ordre) :

1. `20250609000000_initial_schema.sql` — schéma complet V1
2. `20250609000001_public_categories_read.sql` — lecture publique des catégories actives
3. `20250610000000_pro_workflow.sql` — liens sécurisés pro (`request_professional_links`)

---

## Avancement par étape

### Étape 01 — Architecture ✅

- Structure Next.js App Router, design system Tailwind (mobile first)
- Schéma PostgreSQL Supabase (UUID, pas de suppression, statuts + historique)
- Clients Supabase (`lib/supabase/`), services de données, types TypeScript
- Shell admin (layout, sidebar, navbar) — **pages admin en coquille**
- Intégrations Resend et Telegram préparées

### Étape 02 — Workflow client ✅

- Landing + formulaire de demande sur `/`
- Recherche de catégorie, description, upload photos (max 5, compression)
- Autocomplete adresse BAN (sélection obligatoire, pas de saisie libre)
- Validation client (téléphone FR, champs requis)
- Création de demande + code mission unique (4 caractères)
- Écran de confirmation avec code mission (copie auto)
- Événement `request_created` enregistré

**Fichiers clés :**

- `app/page.tsx`, `components/client/*`
- `app/actions/create-request.ts`
- `hooks/use-category-search.ts`, `use-photo-upload.ts`, `use-address-autocomplete.ts`

### Étape 03 — Workflow professionnel ✅

- **Matching** à la création de demande : catégorie + distance + rayon d'intervention
- **Liens sécurisés** uniques par couple demande/pro (`/pro/[token]`)
- **Emails** : nouvelle demande, mission confirmée, mission déjà attribuée, demande disponible, rappel 30 min
- **Page pro** : catégorie, distance, description, photos, nom/téléphone client — **adresse masquée** avant validation
- **Prise de mission** via code communiqué par téléphone
- **Libération de mission** + réactivation des autres pros
- **Historique d'événements** (`request_events`)
- **Préparation facturation** (incrément `invoices` + `completed_jobs` à la prise)
- **Cron rappel 30 min** : `GET /api/cron/reminders`

**Fichiers clés :**

- `app/pro/[token]/page.tsx`, `components/pro/*`
- `app/actions/pro-workflow.ts`
- `services/matching.service.ts`, `pro-links.service.ts`, `pro-workflow.service.ts`, `email.service.ts`
- `emails/templates/pro-workflow.ts`

---

## Fonctionnalités disponibles

### Côté client (`/`)

| Fonctionnalité | Statut |
|----------------|--------|
| Formulaire de demande complet | ✅ |
| Upload photos | ✅ |
| Autocomplete adresse BAN | ✅ |
| Code mission affiché après envoi | ✅ |
| Compte client | ❌ (non prévu V1) |

### Côté professionnel (`/pro/[token]`)

| Fonctionnalité | Statut |
|----------------|--------|
| Accès par lien sécurisé (sans compte) | ✅ |
| Consultation demande (sans adresse) | ✅ |
| Appel client + saisie code mission | ✅ |
| Adresse complète après confirmation | ✅ |
| Libération de mission | ✅ |
| Emails transactionnels | ✅ (si Resend configuré) |

### Côté admin (`/admin/*`)

| Route | Statut |
|-------|--------|
| `/admin` | Coquille (stats placeholder) |
| `/admin/demandes` | Coquille |
| `/admin/professionnels` | Coquille |
| `/admin/candidats` | Coquille |
| `/admin/alertes` | Coquille |
| `/admin/opportunites` | Coquille |
| `/admin/facturation` | Coquille |
| `/admin/parametres` | Coquille |
| Authentification admin | ❌ (middleware Supabase préparé, login à venir) |

### API

| Route | Rôle |
|-------|------|
| `GET /api/cron/reminders` | Envoie les rappels 30 min (header `Authorization: Bearer CRON_SECRET` si défini) |

---

## Parcours métier (résumé)

```
Client remplit le formulaire (/)
        ↓
Demande créée + code mission généré
        ↓
Matching → pros éligibles (catégorie + distance ≤ rayon)
        ↓
Email « Nouvelle demande » + lien /pro/[token] par pro
        ↓
Pro ouvre le lien → voit nom/tél, pas l'adresse
        ↓
Pro appelle le client → client donne le code mission
        ↓
Pro saisit le code → mission « claimed »
        ↓
Adresse dévoilée + email « Mission confirmée »
        ↓
Autres pros désactivés + email « Mission déjà attribuée »
        ↓
(option) Pro libère → demande repending + emails « Demande disponible »
        ↓
(option) Cron 30 min → email « Rappel » si toujours pending
```

---

## Structure du projet

```
app/
  page.tsx                    → Landing + formulaire client
  actions/
    create-request.ts         → Création demande (server action)
    pro-workflow.ts           → Prise / libération mission (server actions)
  pro/[token]/page.tsx        → Page professionnelle
  api/cron/reminders/route.ts → Rappels 30 min
  admin/                      → Back-office (coquilles UI)

components/
  client/                     → Parcours client (formulaire, confirmation…)
  pro/                        → Parcours pro (claim, contact, photos…)
  ui/                         → Design system (Button, Card, Input…)
  layout/                     → AdminShell, Sidebar, Navbar

services/                     → Couche données + orchestration métier
  matching.service.ts         → Recherche pros par catégorie/distance
  pro-links.service.ts        → Liens sécurisés /pro/[token]
  pro-workflow.service.ts     → Matching, claim, release, emails, rappels
  email.service.ts            → Envoi via Resend
  requests.service.ts         → Demandes
  claims.service.ts           → Prises de mission
  events.service.ts           → Historique request_events
  photos.service.ts           → Upload Storage
  …

lib/
  supabase/                   → client, server, admin, middleware, storage
  resend.ts                   → Client Resend
  telegram.ts                 → Notifications Telegram

emails/templates/             → Templates HTML transactionnels

hooks/                        → useCategorySearch, usePhotoUpload, useAddressAutocomplete

types/                        → database.ts (schéma), index.ts (réexports)

utils/                        → validation, geocoding, distance, mission-code, phone…

supabase/migrations/          → Migrations SQL
public/                       → Assets statiques
```

---

## Tables principales

| Table | Rôle |
|-------|------|
| `categories` | Métiers (Plombier, Électricien…) |
| `professionals` | Pros actifs (catégories[], rayon_km, lat/lon) |
| `candidate_professionals` | Candidatures pro (admin futur) |
| `requests` | Demandes clients (statut, code mission, claimed_by) |
| `request_photos` | Photos liées à une demande |
| `request_professional_links` | Token sécurisé par demande/pro + distance |
| `claims` | Historique prises / libérations |
| `request_events` | Journal d'événements |
| `invoices` | Facturation mensuelle par pro |
| `alerts`, `coverage_alerts` | Alertes couverture (admin futur) |

### Statuts demande (`request_status`)

`pending` → `claimed` → `completed` | `cancelled` | `no_match`

### Événements (`request_event_type`)

`request_created`, `email_sent`, `link_opened`, `mission_claimed`, `mission_released`, `mission_completed`

---

## Emails (Resend)

| Template ID | Déclencheur |
|-------------|-------------|
| `new-request` | Demande créée, matching OK |
| `mission-confirmed` | Code mission validé |
| `mission-taken` | Autre pro notifié après prise |
| `demand-available` | Mission libérée |
| `reminder-30min` | Cron 30 min, demande toujours pending |

Templates HTML : `emails/templates/pro-workflow.ts`  
Si `RESEND_API_KEY` est absent, les envois sont ignorés (log warning, pas de crash).

---

## Conventions pour les prochains développements

1. **Mobile first** — l'expérience pro et client est pensée téléphone d'abord.
2. **Pas de compte pro** — accès uniquement via lien sécurisé reçu par email.
3. **Le téléphone + code mission** garantissent un échange réel avant dévoilement de l'adresse.
4. **Server actions + admin client** — les mutations métier passent par `createAdminClient()` côté serveur, jamais la clé service role côté client.
5. **Design system** — réutiliser `components/ui/*`, tokens CSS dans `app/globals.css` (`--color-primary`, `--radius-card`, etc.).
6. **Services** — toute requête Supabase passe par `services/*.service.ts`, pas d'appels directs dans les composants.
7. **Historique** — tracer les actions significatives via `eventsService.log()`.
8. **Professionnels en base** — le matching exige `latitude`/`longitude`, `categories` (noms exacts, ex. `"Plombier"`), `active = true`, et `radius_km`.

---

## Prochaines étapes (non implémentées)

- Back-office admin fonctionnel (listes, filtres, actions)
- Authentification admin (Supabase Auth + protection `/admin`)
- Alertes et opportunités (couverture géographique)
- Notifications Telegram branchées au métier
- Facturation avancée (montants, envoi factures)
- Extension de recherche (`search_extended`) si aucun pro trouvé
- Statut `completed` / clôture de mission côté pro ou admin

---

## Scripts

```bash
npm run dev      # Développement
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # ESLint
```
