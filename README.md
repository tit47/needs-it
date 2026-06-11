# Need's it

Plateforme de mise en relation entre **particuliers** et **professionnels** du dépannage et des services à domicile.

**État du projet : étapes 01, 02, 03, 04 et 05 terminées.**  
Le code existant est la source de vérité — réutiliser composants, services et types avant d'en créer de nouveaux.

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Emails | Resend |
| Notifications | Telegram (alertes couverture, si configuré + activé en admin) |
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
| `NEXT_PUBLIC_APP_URL` | Oui | URL de l'app (liens emails pro, liens dans alertes, ex. `http://localhost:3000`) |
| `RESEND_API_KEY` | Recommandé | Envoi des emails transactionnels et alertes admin |
| `RESEND_FROM_EMAIL` | Recommandé | Expéditeur par défaut des emails pro (surchargeable dans Paramètres admin pour les alertes) |
| `CRON_SECRET` | Optionnel | Sécurise `GET /api/cron/reminders` |
| `TELEGRAM_BOT_TOKEN` | Optionnel | Bot Telegram pour les alertes couverture |
| `TELEGRAM_CHAT_ID` | Optionnel | Canal / chat Telegram de destination |

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

**Fichiers clés :**

- `app/admin/*/page.tsx`
- `components/admin/*`
- `app/actions/admin.ts`
- `services/dashboard.service.ts`, `settings.service.ts`
- `utils/admin-labels.ts`, `utils/datetime.ts`

### Étape 05 — Alertes et opportunités ✅

- **Génération automatique** des alertes et agrégats couverture à chaque nouvelle demande
- **Niveaux de couverture** (selon le nombre de pros éligibles au matching) :
  - Rouge : aucun professionnel
  - Orange : 1 ou 2 professionnels
  - Vert : 3 professionnels ou plus
- **Statut `no_match`** si aucun pro trouvé à la création de demande
- **Alerte « Aucune réponse »** (orange) lors du rappel cron 30 min si la demande est toujours en attente
- **Mise à jour des opportunités** : compteur de demandes satisfaites à chaque prise de mission
- **Notifications** (alertes rouge/orange uniquement) :
  - Dashboard (alertes importantes + activité récente)
  - Telegram (si `TELEGRAM_*` configuré **et** flag activé dans Paramètres)
  - Email admin (vers l'email expéditeur des Paramètres, si Resend configuré)
- **Page Alertes** enrichie : bouton « Voir détails » (demande liée, code mission, statut)
- **Page Opportunités** (`/admin/opportunites`) :
  - Grille couverture par catégorie (nombre de pros actifs, badge couleur)
  - Tableau ville × catégorie : demandes, satisfaites, taux, couverture, priorité, résolution

**Non implémenté dans cette étape :**

- Page **Facturation** (`/admin/facturation`) — coquille UI
- Authentification admin (accès `/admin` non protégé par login)
- Extension de recherche (`search_extended`) si aucun pro trouvé
- Les emails transactionnels pro utilisent toujours `RESEND_FROM_EMAIL` / défaut Resend (pas `app_settings.sender_email`)
- Statut `completed` / clôture de mission côté pro ou admin

**Fichiers clés :**

- `services/coverage.service.ts`, `services/alerts.service.ts` (extensions)
- `utils/coverage.ts`
- `emails/templates/coverage-alert.ts`
- `components/admin/opportunities-panel.tsx`, `category-coverage-grid.tsx`
- `components/admin/alerts-panel.tsx` (détail alerte)
- Branchements dans `services/pro-workflow.service.ts`, `app/actions/create-request.ts`

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
| `/admin/alertes` | ✅ Liste filtrable, détail, résolution |
| `/admin/opportunites` | ✅ Couverture par catégorie + tableau zones à développer |
| `/admin/parametres` | ✅ Prix mission, email, Telegram (flag), catégories |
| `/admin/facturation` | ❌ Coquille UI |
| Authentification admin | ❌ (middleware Supabase préparé, login à venir) |

### API

| Route | Rôle |
|-------|------|
| `GET /api/cron/reminders` | Rappels 30 min + alerte « Aucune réponse » (header `Authorization: Bearer CRON_SECRET` si défini) |

---

## Parcours métier (résumé)

```
Client remplit le formulaire (/)
        ↓
Demande créée + code mission généré
        ↓
Matching → pros éligibles (catégorie + distance ≤ rayon)
        ↓
Analyse couverture → alertes + opportunités mises à jour
        ↓
(si 0 pro) statut no_match + alerte rouge
        ↓
(si 1–2 pros) alerte orange
        ↓
(si rouge/orange) notifications dashboard + Telegram/email (si configuré)
        ↓
Email « Nouvelle demande » + lien /pro/[token] par pro (si matching > 0)
        ↓
Pro ouvre le lien → voit nom/tél, pas l'adresse
        ↓
Pro appelle le client → client donne le code mission
        ↓
Pro saisit le code → mission « claimed » → compteur « satisfaites » mis à jour
        ↓
Adresse dévoilée + email « Mission confirmée »
        ↓
Autres pros désactivés + email « Mission déjà attribuée »
        ↓
(option) Pro libère → demande repending + emails « Demande disponible »
        ↓
(option) Cron 30 min → email « Rappel » + alerte « Aucune réponse » si toujours pending
        ↓
Admin pilote via /admin (demandes, pros, candidats, alertes, opportunités, paramètres)
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
  pro-workflow.service.ts     → Matching, claim, release, emails, rappels, couverture
  coverage.service.ts         → Alertes auto, opportunités, notifications couverture
  alerts.service.ts           → CRUD alertes unitaires et coverage_alerts
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
  pro-workflow.ts             → Emails pro
  coverage-alert.ts           → Email alerte couverture admin

hooks/                        → useCategorySearch, usePhotoUpload, useAddressAutocomplete

types/                        → database.ts (schéma), index.ts (réexports + SupabaseDbClient)

utils/                        → validation, geocoding, distance, mission-code, phone,
                              coverage, admin-labels, datetime…

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
| `requests` | Demandes clients (statut, code mission, claimed_by, professional_count) |
| `request_photos` | Photos liées à une demande |
| `request_professional_links` | Token sécurisé par demande/pro + distance |
| `claims` | Historique prises / libérations |
| `request_events` | Journal d'événements |
| `invoices` | Facturation mensuelle par pro (montant = missions × prix paramétré) |
| `alerts` | Alertes unitaires par événement (créées automatiquement, résolvables en admin) |
| `coverage_alerts` | Agrégats couverture par ville + catégorie (page Opportunités + dashboard) |
| `app_settings` | Paramètres applicatifs (prix mission, email expéditeur, flag Telegram) |

### Statuts demande (`request_status`)

`pending` → `claimed` → `completed` | `cancelled` | `no_match`

(`no_match` : aucun pro trouvé au matching ; `completed` : prévu schéma, pas encore exposé dans l'UI)

### Niveaux d'alerte (`alert_level`)

| Niveau | Règle (pros éligibles au matching) |
|--------|-------------------------------------|
| `red` | 0 professionnel |
| `orange` | 1 ou 2 professionnels |
| `green` | 3 professionnels ou plus |

### Événements (`request_event_type`)

`request_created`, `email_sent`, `link_opened`, `mission_claimed`, `mission_released`, `mission_completed`

---

## Emails (Resend)

| Template | Déclencheur |
|----------|-------------|
| `new-request` | Demande créée, matching OK |
| `mission-confirmed` | Code mission validé |
| `mission-taken` | Autre pro notifié après prise |
| `demand-available` | Mission libérée |
| `reminder-30min` | Cron 30 min, demande toujours pending |
| `coverage-alert` | Alerte couverture rouge/orange (email vers expéditeur Paramètres) |

Templates HTML : `emails/templates/pro-workflow.ts`, `emails/templates/coverage-alert.ts`  
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
11. **Couverture** — toute logique alertes/opportunités passe par `coverage.service.ts` et `utils/coverage.ts` ; ne pas dupliquer les seuils rouge/orange/vert ailleurs.

---

## Prochaines étapes (non implémentées)

- Page **Facturation** (`/admin/facturation`) — suivi factures, envoi, paiement
- Authentification admin (Supabase Auth + protection `/admin`)
- Utilisation de l'email expéditeur stocké en `app_settings` pour les emails transactionnels pro
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
