# Need's it

Plateforme de mise en relation entre **particuliers** et **professionnels** du dépannage et des services à domicile.

**État du projet : étapes 01, 02, 03 et 04 terminées.**  
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
| `SUPABASE_SERVICE_ROLE_KEY` | Oui | Opérations serveur (actions, matching, workflow pro, admin) |
| `NEXT_PUBLIC_APP_URL` | Oui | URL de l'app (liens emails pro, ex. `http://localhost:3000`) |
| `RESEND_API_KEY` | Recommandé | Envoi des emails transactionnels |
| `RESEND_FROM_EMAIL` | Recommandé | Expéditeur par défaut (surchargeable dans Paramètres admin) |
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
4. `20250610000001_app_settings.sql` — paramètres applicatifs (`app_settings`)

---

## Avancement par étape

### Étape 01 — Architecture ✅

- Structure Next.js App Router, design system Tailwind (mobile first)
- Schéma PostgreSQL Supabase (UUID, pas de suppression, statuts + historique)
- Clients Supabase (`lib/supabase/`), services de données, types TypeScript
- Shell admin (layout, sidebar, navbar)
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

### Étape 04 — Dashboard admin ✅

- **Dashboard** (`/admin`) : stats du jour, activité récente, alertes importantes (rouge/orange)
- **Demandes** : tableau + détail (description, photos, client, distance, historique)
- **Professionnels** : tableau, modification, suspension/réactivation, fiche (montant dû, historique missions)
- **Candidats** : validation (crée un pro), refus, suspension
- **Alertes** : liste avec filtres (ville, catégorie, dates, résolu) + marquer comme résolu
- **Paramètres** : prix mission, email expéditeur, flag Telegram, gestion des catégories
- **Actions serveur** : `app/actions/admin.ts` (mutations admin + revalidation des pages)
- **Services** : `dashboard.service.ts`, `settings.service.ts` (+ extensions des services existants)

**Non implémenté dans cette étape :**

- `/admin/opportunites` et `/admin/facturation` restent des coquilles UI
- Authentification admin (accès `/admin` non protégé par login)
- Envoi Telegram et création automatique d'alertes métier non branchés
- L'email expéditeur en base (`app_settings`) n'est pas encore utilisé par `email.service` (Resend utilise toujours `RESEND_FROM_EMAIL` / défaut)

**Fichiers clés :**

- `app/admin/*/page.tsx`
- `components/admin/*`
- `app/actions/admin.ts`
- `services/dashboard.service.ts`, `settings.service.ts`
- `utils/admin-labels.ts`, `utils/datetime.ts`

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
| `/admin` | ✅ Dashboard (stats, activité, alertes importantes) |
| `/admin/demandes` | ✅ Liste + détail demande |
| `/admin/professionnels` | ✅ Liste, fiche, modification, suspension |
| `/admin/candidats` | ✅ Liste, validation / refus / suspension |
| `/admin/alertes` | ✅ Liste filtrable + résolution |
| `/admin/parametres` | ✅ Prix mission, email, Telegram (flag), catégories |
| `/admin/opportunites` | ❌ Coquille UI |
| `/admin/facturation` | ❌ Coquille UI |
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
        ↓
Admin pilote via /admin (demandes, pros, candidats, alertes, paramètres)
```

---

## Structure du projet

```
app/
  page.tsx                    → Landing + formulaire client
  actions/
    create-request.ts         → Création demande (server action)
    pro-workflow.ts           → Prise / libération mission (server actions)
    admin.ts                  → Actions back-office (server actions)
  pro/[token]/page.tsx        → Page professionnelle
  api/cron/reminders/route.ts → Rappels 30 min
  admin/                      → Back-office admin

components/
  client/                     → Parcours client (formulaire, confirmation…)
  pro/                        → Parcours pro (claim, contact, photos…)
  admin/                      → Panneaux admin (tableaux, stats, paramètres…)
  ui/                         → Design system (Button, Card, Input…)
  layout/                     → AdminShell, Sidebar, Navbar

services/                     → Couche données + orchestration métier
  matching.service.ts         → Recherche pros par catégorie/distance
  pro-links.service.ts        → Liens sécurisés /pro/[token]
  pro-workflow.service.ts     → Matching, claim, release, emails, rappels
  email.service.ts            → Envoi via Resend
  dashboard.service.ts        → Stats et activité admin
  settings.service.ts         → Paramètres app_settings
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

types/                        → database.ts (schéma), index.ts (réexports + SupabaseDbClient)

utils/                        → validation, geocoding, distance, mission-code, phone,
                              admin-labels, datetime…

supabase/migrations/          → Migrations SQL
public/                       → Assets statiques
```

---

## Tables principales

| Table | Rôle |
|-------|------|
| `categories` | Métiers (Plombier, Électricien…) |
| `professionals` | Pros actifs (catégories[], rayon_km, lat/lon) |
| `candidate_professionals` | Candidatures pro (validation admin) |
| `requests` | Demandes clients (statut, code mission, claimed_by) |
| `request_photos` | Photos liées à une demande |
| `request_professional_links` | Token sécurisé par demande/pro + distance |
| `claims` | Historique prises / libérations |
| `request_events` | Journal d'événements |
| `invoices` | Facturation mensuelle par pro (montant = missions × prix paramétré) |
| `alerts` | Alertes unitaires (consultables et résolvables en admin) |
| `coverage_alerts` | Alertes agrégées couverture (affichées sur le dashboard, pas de page dédiée) |
| `app_settings` | Paramètres applicatifs (prix mission, email expéditeur, flag Telegram) |

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

1. **Mobile first** — l'expérience pro et client est pensée téléphone d'abord ; l'admin est utilisable sur mobile mais optimisé desktop.
2. **Pas de compte pro** — accès uniquement via lien sécurisé reçu par email.
3. **Le téléphone + code mission** garantissent un échange réel avant dévoilement de l'adresse.
4. **Server actions + admin client** — les mutations métier passent par `createAdminClient()` côté serveur, jamais la clé service role côté client.
5. **Design system** — réutiliser `components/ui/*`, tokens CSS dans `app/globals.css` (`--color-primary`, `--radius-card`, etc.).
6. **Services** — toute requête Supabase passe par `services/*.service.ts`, pas d'appels directs dans les composants.
7. **Historique** — tracer les actions significatives via `eventsService.log()`.
8. **Professionnels en base** — le matching exige `latitude`/`longitude`, `categories` (noms exacts, ex. `"Plombier"`), `active = true`, et `radius_km`.
9. **Composants admin** — réutiliser `components/admin/*` et `AdminPageHeader` avant d'en créer de nouveaux.
10. **Photos** — `ProPhotoGallery` ignore les URLs vides ou invalides (ne jamais passer une URL non valide à `next/image`).

---

## Prochaines étapes (non implémentées)

- Page **Opportunités** (`/admin/opportunites`) — tableau couverture ville/catégorie
- Page **Facturation** (`/admin/facturation`) — suivi factures, envoi, paiement
- Authentification admin (Supabase Auth + protection `/admin`)
- Génération automatique des alertes et opportunités (couverture géographique)
- Notifications Telegram branchées au métier
- Utilisation de l'email expéditeur stocké en `app_settings` dans `email.service`
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
