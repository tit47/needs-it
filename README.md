# Need's it

Plateforme de mise en relation entre **particuliers** et **professionnels** du dépannage et des services à domicile.

**État du projet : étapes 01, 02, 03, 04, 05, 06 et 07 terminées.**  
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

### Assets graphiques

Les logos officiels sont dans `public/` :

- `logo.png` — logo clair (fond turquoise, page client, espace pro)
- `logo-dark.png` — logo sombre (fond crème, interface admin)

Pour recopier depuis le dossier `Images` du projet :

```bash
node scripts/copy-brand-assets.js
```

---

## Avancement par étape

### Étape 01 — Architecture ✅

- Structure Next.js App Router, design system Tailwind (mobile first — voir étape 07 pour l'harmonisation visuelle complète)
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
- **Professionnels** : tableau, modification, suspension/réactivation, fiche (montant dû, historique missions, historique paiements — voir étape 06)
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

**Fichiers clés :**

- `services/coverage.service.ts`, `services/alerts.service.ts` (extensions)
- `utils/coverage.ts`
- `emails/templates/coverage-alert.ts`
- `components/admin/opportunities-panel.tsx`, `category-coverage-grid.tsx`
- `components/admin/alerts-panel.tsx` (détail alerte)
- Branchements dans `services/pro-workflow.service.ts`, `app/actions/create-request.ts`

### Étape 06 — Facturation ✅

- **Principe V1** : chaque mission validée (prise via code) génère un montant dû par le professionnel ; le prix unitaire est celui des **Paramètres** (`mission_price_eur`, 5 € par défaut)
- **Enregistrement automatique** à la prise de mission : incrément mensuel dans `invoices` (branché à l'étape 03 via `prepareMissionBilling`)
- **Facturation manuelle** : pas d'envoi automatique de facture ni de paiement en ligne
- **Page Facturation** (`/admin/facturation`) :
  - Tableau : professionnel, mois, missions, montant dû, état, facture envoyée, payée
  - Filtres : mois, payé / non payé, nom du professionnel
  - Actions : marquer facture envoyée, marquer payée, annuler paiement
- **États de facture** : non envoyée → envoyée → payée
- **Fiche professionnel** enrichie : historique des paiements (factures mensuelles avec état)

**Non implémenté dans cette étape :**

- Paiement automatique, Stripe, abonnements, envoi automatique de factures

**Fichiers clés :**

- `app/admin/facturation/page.tsx`
- `components/admin/invoices-panel.tsx`
- `services/invoices.service.ts`
- `utils/invoices.ts`
- `app/actions/admin.ts` (`markInvoiceSentAction`, `markInvoicePaidAction`)
- `components/admin/professionals-panel.tsx` (historique paiements)
- `components/admin/status-badges.tsx` (`InvoiceStatusBadge`)

### Étape 07 — Design et UX ✅

Harmonisation visuelle de **toute** l'application (client, pro, admin). **Aucune nouvelle fonctionnalité métier** — uniquement cohérence, lisibilité, espacements, états visuels et transitions.

**Objectif :** moderniser l'interface (mobile first, inspirée Uber / Airbnb / Doctolib) en conservant l'identité Need's it et les logos officiels du dossier `Images`.

**Design system** (`app/globals.css`) :

| Token / élément | Light | Dark |
|-----------------|-------|------|
| Fond | `#7CC9D4` | `#121212` |
| Texte principal | `#F8F6EE` | `#F8F6EE` |
| Cartes | `#F8F6EE` | `#1D1D1D` |
| Boutons | `#0C2F3D` | `#FF9A4A` |
| Accent | `#E9CB72` | `#7CC9D4` |
| Police | Inter (via `next/font`) | idem |
| Boutons | très arrondis (`--radius-button`), grande taille, ombre légère | idem |
| Inputs | coins arrondis (`--radius-input`), hauteur 56 px, focus bleu foncé | idem |

Classes utilitaires réutilisables : `.card-surface`, `.input-field`, `.input-field-error`, `.photo-thumbnail`, `.dropdown-panel`, `.alert-banner`, `.alert-banner-error`, `.alert-banner-info`, `.nav-item-active`, `.stat-icon-wrap`.

**Composants UI affinés** (`components/ui/`) :

- `Button` — ombre, transition, feedback au clic
- `Input` / `Textarea` — basés sur `.input-field`
- `Table` — en-têtes lisibles, survol des lignes, scroll horizontal mobile
- `Badge`, `Modal` (animation d'entrée), `Card`

**Identité graphique** :

- `AppLogo` — variante `on-brand` (logo clair sur fond turquoise) ou `on-surface` (logo sombre sur fond crème)
- Assets dans `public/logo.png` et `public/logo-dark.png`
- Favicon via `metadata.icons` dans `app/layout.tsx` (pointe vers `/logo.png`)
- Script `scripts/copy-brand-assets.js` pour recopier depuis `../Images`

**Layouts harmonisés** (`components/layout/`) :

| Composant | Usage |
|-----------|-------|
| `ClientShell` | Enveloppe `/` : navbar + bascule clair/sombre (`ThemeProvider`) |
| `Navbar` | Barre sticky partagée (logo + thème) |
| `AdminShell` + `Sidebar` | Back-office : logo sombre, navigation active cohérente |
| `ProPageHeader` | En-tête uniforme `/pro/[token]` |

**Par zone :**

- **Client** — formulaire avec titre « Décrivez votre besoin », champs catégorie/adresse unifiés (`.input-field`, `.dropdown-panel`), grilles photos (`.photo-thumbnail`), messages d'erreur (`.alert-banner-error`)
- **Pro** — en-tête avec logo, cartes et galerie photos alignées sur le design system
- **Admin** — cartes stats avec icônes en pastille, tableaux modernisés, modales animées, espacements revus

**Non implémenté dans cette étape :**

- Nouvelles pages ou parcours métier
- Refonte complète de l'architecture (composants et services existants réutilisés)

**Fichiers clés :**

- `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (via `ClientShell`)
- `components/ui/*`
- `components/layout/app-logo.tsx`, `client-shell.tsx`, `pro-page-header.tsx`, `navbar.tsx`, `sidebar.tsx`, `admin-shell.tsx`
- `components/providers/theme-provider.tsx`
- `components/client/landing-hero.tsx`, `client-request-flow.tsx`, `photo-upload-grid.tsx`
- `components/client/category-search-field.tsx`, `address-autocomplete-field.tsx`
- `components/admin/stat-cards.tsx`, `admin-page-header.tsx`
- `public/logo.png`, `public/logo-dark.png`
- `scripts/copy-brand-assets.js`

---

## Fonctionnalités disponibles

### Côté client (`/`)

| Fonctionnalité | Statut |
|----------------|--------|
| Formulaire de demande complet | ✅ |
| Upload photos | ✅ |
| Autocomplete adresse BAN | ✅ |
| Code mission affiché après envoi | ✅ |
| Barre de navigation + bascule clair/sombre | ✅ |
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
| Interface harmonisée (design system étape 07) | ✅ |

### Côté admin (`/admin/*`)

| Route | Statut |
|-------|--------|
| `/admin` | ✅ Dashboard (stats, activité, alertes importantes) |
| `/admin/demandes` | ✅ Liste + détail demande |
| `/admin/professionnels` | ✅ Liste, fiche (missions + paiements), modification, suspension |
| `/admin/candidats` | ✅ Liste, validation / refus / suspension |
| `/admin/alertes` | ✅ Liste filtrable, détail, résolution |
| `/admin/opportunites` | ✅ Couverture par catégorie + tableau zones à développer |
| `/admin/parametres` | ✅ Prix mission, email, Telegram (flag), catégories |
| `/admin/facturation` | ✅ Suivi mensuel, filtres, marquer envoyée / payée / annuler paiement |
| Interface harmonisée (design system étape 07) | ✅ |
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
Pro saisit le code → mission « claimed » → compteur « satisfaites » + facture mensuelle mise à jour
        ↓
Adresse dévoilée + email « Mission confirmée »
        ↓
Autres pros désactivés + email « Mission déjà attribuée »
        ↓
(option) Pro libère → demande repending + emails « Demande disponible »
        ↓
(option) Cron 30 min → email « Rappel » + alerte « Aucune réponse » si toujours pending
        ↓
Admin pilote via /admin (demandes, pros, candidats, alertes, opportunités, facturation, paramètres)
```

---

## Structure du projet

```
app/
  page.tsx                    → Landing + formulaire client (via ClientShell)
  layout.tsx                  → Layout racine, metadata, ThemeProvider
  globals.css                 → Design system (tokens CSS, utilitaires)
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
  ui/                         → Design system (Button, Card, Input, Table…)
  layout/                     → AppLogo, ClientShell, AdminShell, Sidebar, Navbar, ProPageHeader
  providers/                  → ThemeProvider (clair / sombre)

services/                     → Couche données + orchestration métier
  matching.service.ts         → Recherche pros par catégorie/distance
  pro-links.service.ts        → Liens sécurisés /pro/[token]
  pro-workflow.service.ts     → Matching, claim, release, emails, rappels, couverture
  coverage.service.ts         → Alertes auto, opportunités, notifications couverture
  alerts.service.ts           → CRUD alertes unitaires et coverage_alerts
  email.service.ts            → Envoi via Resend
  dashboard.service.ts        → Stats et activité admin
  settings.service.ts         → Paramètres app_settings
  invoices.service.ts         → Facturation mensuelle (liste, statuts envoyée/payée)
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
                              coverage, invoices, admin-labels, datetime…

supabase/migrations/          → Migrations SQL
public/                       → logo.png, logo-dark.png, logo.svg (legacy)
scripts/                      → copy-brand-assets.js
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
| `invoices` | Facturation mensuelle par pro (`mission_count`, `amount`, `invoice_sent`, `paid`) |
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

### États de facture (V1, suivi manuel)

| État | Condition en base |
|------|-------------------|
| Non envoyée | `invoice_sent = false` et `paid = false` |
| Envoyée | `invoice_sent = true` et `paid = false` |
| Payée | `paid = true` (force `invoice_sent = true`) |

Une ligne `invoices` par couple `(professional_id, month)` ; le montant = `mission_count × mission_price_eur`.

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
5. **Design system** — réutiliser `components/ui/*` et les tokens/utilitaires dans `app/globals.css` (`--color-*`, `--radius-*`, `--shadow-*`, classes `.input-field`, `.card-surface`, etc.). Logos via `AppLogo` (`on-brand` sur fond turquoise, `on-surface` sur fond crème).
6. **Services** — toute requête Supabase passe par `services/*.service.ts`, pas d'appels directs dans les composants.
7. **Historique** — tracer les actions significatives via `eventsService.log()`.
8. **Professionnels en base** — le matching exige `latitude`/`longitude`, `categories` (noms exacts, ex. `"Plombier"`), `active = true`, et `radius_km`.
9. **Composants admin** — réutiliser `components/admin/*` et `AdminPageHeader` avant d'en créer de nouveaux.
10. **Photos** — `ProPhotoGallery` ignore les URLs vides ou invalides (ne jamais passer une URL non valide à `next/image`).
11. **Couverture** — toute logique alertes/opportunités passe par `coverage.service.ts` et `utils/coverage.ts` ; ne pas dupliquer les seuils rouge/orange/vert ailleurs.
12. **Facturation** — toute lecture/écriture `invoices` passe par `invoices.service.ts` et `utils/invoices.ts` ; les montants sont recalculés à la prise via `prepareMissionBilling` (prix lu dans `settingsService`).
13. **Design (étape 07)** — ne pas créer de styles ad hoc : étendre `app/globals.css` et `components/ui/*`. Champs custom (autocomplete, catégorie) utilisent `.input-field` et `.dropdown-panel`. Logos via `AppLogo`, jamais de nouvelle identité visuelle.

---

## Limites connues (V1)

- **Authentification admin** — accès `/admin` non protégé par login (middleware Supabase préparé)
- **Emails pro** — utilisent `RESEND_FROM_EMAIL` / défaut Resend, pas `app_settings.sender_email`
- **Extension de recherche** — pas de `search_extended` si aucun pro trouvé
- **Clôture de mission** — statut `completed` prévu en schéma, pas encore exposé dans l'UI pro ou admin
- **Paiement en ligne** — pas de Stripe, abonnements ni envoi automatique de factures

---

## Prochaines étapes (non implémentées)

- Authentification admin (Supabase Auth + protection `/admin`)
- Utilisation de l'email expéditeur stocké en `app_settings` pour les emails transactionnels pro
- Extension de recherche (`search_extended`) si aucun pro trouvé
- Statut `completed` / clôture de mission côté pro ou admin
- Paiement automatique, Stripe, abonnements, facturation automatique

---

## Scripts

```bash
npm run dev      # Développement
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # ESLint

node scripts/copy-brand-assets.js   # Recopie logo.png et logo-dark.png depuis ../Images
```
