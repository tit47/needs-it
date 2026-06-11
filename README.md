# Need's it

Plateforme de mise en relation entre **particuliers** et **professionnels** du dépannage et des services à domicile.

**État du projet : étapes 01 à 08 terminées + authentification admin (étape supplémentaire).**  
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

### Compte administrateur (Supabase Auth)

L'accès au back-office nécessite un utilisateur **Supabase Auth** (email + mot de passe) :

1. Dans le dashboard Supabase : **Authentication → Providers** → activer **Email** (mot de passe).
2. **Authentication → Users** → créer un utilisateur admin (l'app ne propose pas d'inscription).
3. Se connecter sur `/admin/login`.

Tout utilisateur Auth valide peut accéder à l'admin (pas de liste blanche d'emails dans l'app pour l'instant).

---

## Avancement par étape

### Étape 01 — Architecture ✅

- Structure Next.js App Router, design system Tailwind (mobile first — harmonisation visuelle étapes 07 et 08)
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

Classes utilitaires réutilisables : `.card-surface`, `.input-field`, `.input-field-error`, `.photo-thumbnail`, `.dropdown-panel`, `.alert-banner`, `.alert-banner-error`, `.alert-banner-info`, `.alert-banner-success` (étape 08), `.field-hint`, `.field-success` (étape 08), `.nav-item-active`, `.stat-icon-wrap`.

**Composants UI affinés** (`components/ui/`) :

- `Button` — ombre, transition, feedback au clic
- `Input` / `Textarea` — basés sur `.input-field`, erreurs via `FieldError` + attributs ARIA (étape 08)
- `Table` — en-têtes lisibles, survol des lignes, scroll horizontal mobile ; `TableEmpty` avec état vide (étape 08)
- `Badge`, `Modal` (animation d'entrée), `Card`
- `AlertBanner`, `Spinner`, `LoadingState`, `FieldError` (étape 08)

**Identité graphique** :

- `AppLogo` — variante `on-brand` (logo clair sur fond turquoise) ou `on-surface` (logo sombre sur fond crème)
- Assets dans `public/logo.png` et `public/logo-dark.png`
- Favicon via `metadata.icons` dans `app/layout.tsx` (pointe vers `/logo.png`)
- Script `scripts/copy-brand-assets.js` pour recopier depuis `../Images`

**Layouts harmonisés** (`components/layout/`) :

| Composant | Usage |
|-----------|-------|
| `ClientShell` | Enveloppe `/` : navbar + bascule clair/sombre (`ThemeProvider`), `SkipLink` |
| `Navbar` | Barre sticky partagée (logo + thème) |
| `AdminShell` + `Sidebar` | Back-office : logo sombre, navigation active cohérente, `SkipLink` |
| `ProPageHeader` | En-tête uniforme `/pro/[token]` |
| `SkipLink` | Lien « Aller au contenu principal » (navigation clavier, étape 08) |

**Par zone :**

- **Client** — formulaire avec titre « Décrivez votre besoin », champs catégorie/adresse unifiés (`.input-field`, `.dropdown-panel`), grilles photos (`.photo-thumbnail`), retours via `AlertBanner` / `FieldError`
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

### Étape 08 — Finitions ✅

Consolidation et qualité globale. **Aucune nouvelle fonctionnalité métier** — cohérence des retours utilisateur, accessibilité, corrections mineures et factorisation des patterns répétés.

**Composants UI ajoutés** (`components/ui/`) :

| Composant | Rôle |
|-----------|------|
| `AlertBanner` | Messages d'erreur, succès et info (classes `.alert-banner-*`) |
| `Spinner` | Animation de chargement unifiée |
| `LoadingState` | Bloc « chargement » avec texte (modales admin, etc.) |
| `FieldError` + `fieldErrorId()` | Erreurs sous les champs, liées via `aria-describedby` |

**Accessibilité et navigation** :

- `SkipLink` (`components/layout/skip-link.tsx`) sur client, admin et espace pro → `#main-content`
- `Input` / `Textarea` : `aria-invalid`, `aria-describedby` quand une erreur est affichée
- Champs custom (catégorie, adresse) : labels, listbox, `aria-selected` sur les suggestions
- Case Telegram (paramètres admin) : `aria-label` explicite

**Design system** (`app/globals.css`) — extensions étape 08 :

- `.alert-banner-success` — confirmation (ex. paramètre enregistré)
- `.field-hint` — textes d'aide sous les champs
- `.field-success` — confirmation de sélection (ex. adresse validée)

**Harmonisation appliquée** :

- Client, pro et admin : `AlertBanner` et `Spinner` remplacent les styles ad hoc (`text-red-500`, bannières inline)
- Tableaux admin vides : `TableEmpty` avec icône et message centré
- Modales admin (demandes, alertes, professionnels) : `LoadingState`, effacement du contenu précédent à l'ouverture d'un autre élément
- Validation serveur : format d'email pour l'expéditeur dans `updateSenderEmailAction` (`utils/validation.ts` → `isValidEmail`)

**Non implémenté dans cette étape** :

- Nouvelles pages, parcours ou règles métier
- Tests automatiques
- Audit des emails dans tous les clients mail

**Fichiers clés** :

- `components/ui/alert-banner.tsx`, `spinner.tsx`, `loading-state.tsx`, `field-error.tsx`
- `components/layout/skip-link.tsx`
- `app/globals.css` (`.alert-banner-success`, `.field-hint`, `.field-success`)
- `components/ui/input.tsx`, `textarea.tsx`, `table.tsx` (`TableEmpty`)
- `components/client/*`, `components/pro/*`, `components/admin/*` (retours utilisateur unifiés)
- `utils/validation.ts` (`isValidEmail`)

### Étape supplémentaire — Authentification admin ✅

Protection du back-office via **Supabase Auth**. **Aucune modification des workflows métier** (client, pro, matching, facturation, etc.).

**Fonctionnement** :

- Page `/admin/login` — formulaire email + mot de passe (`AdminLoginForm`, design system étapes 07–08)
- **Middleware** (`middleware.ts` + `lib/supabase/middleware.ts`) sur `/admin` et `/admin/*` :
  - non connecté → redirection vers `/admin/login`
  - déjà connecté sur `/admin/login` → redirection vers `/admin`
- **Déconnexion** — bouton dans la sidebar admin (`signOutAdminAction`)
- **Server actions admin** (`app/actions/admin.ts`) — chaque mutation vérifie la session via `requireAdminSession()` (`lib/auth/admin-session.ts`)

**Structure des routes admin** :

| Chemin | Layout | Accès |
|--------|--------|-------|
| `app/admin/login/page.tsx` | Racine admin (pas de sidebar) | Public |
| `app/admin/(dashboard)/*` | `AdminShell` (sidebar + navbar) | Session requise |

**Fichiers clés** :

- `app/admin/login/page.tsx`, `components/admin/admin-login-form.tsx`
- `app/admin/(dashboard)/layout.tsx`, `app/admin/layout.tsx` (racine sans shell)
- `app/actions/auth.ts` (`signInAdminAction`, `signOutAdminAction`)
- `lib/auth/admin-session.ts`, `lib/supabase/middleware.ts`, `middleware.ts`
- `components/layout/sidebar.tsx` (bouton Déconnexion)

**Non implémenté** :

- Création de comptes admin depuis l'app
- Liste blanche d'emails admin
- Rôles / permissions granulaires
- Réinitialisation de mot de passe dans l'UI

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
| Interface harmonisée (design system étapes 07–08) | ✅ |

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
| `/admin/login` | ✅ Connexion Supabase Auth (email + mot de passe) |
| Interface harmonisée (design system étapes 07–08) | ✅ |
| Authentification admin | ✅ Session Supabase Auth + middleware + protection des server actions |
| Déconnexion | ✅ Bouton dans la sidebar admin |

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
Admin se connecte sur /admin/login (Supabase Auth)
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
    admin.ts                  → Actions back-office (session admin requise)
    auth.ts                   → Connexion / déconnexion admin
  pro/[token]/page.tsx        → Page professionnelle
  api/cron/reminders/route.ts → Rappels 30 min
  admin/
    login/page.tsx            → Connexion admin (publique)
    (dashboard)/              → Pages admin protégées (AdminShell)
      layout.tsx              → Shell sidebar + navbar
      page.tsx, demandes/, …  → Dashboard et sections

middleware.ts                 → Protection /admin/* (redirection login)

components/
  client/                     → Parcours client (formulaire, confirmation…)
  pro/                        → Parcours pro (claim, contact, photos…)
  admin/                      → Panneaux admin (tableaux, stats, paramètres…)
  ui/                         → Design system (Button, Card, Input, Table, AlertBanner, Spinner…)
  layout/                     → AppLogo, ClientShell, AdminShell, Sidebar, Navbar, ProPageHeader, SkipLink
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
  auth/
    admin-session.ts          → requireAdminSession() pour server actions admin
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
4. **Server actions + admin client** — les mutations métier passent par `createAdminClient()` côté serveur, jamais la clé service role côté client. Les actions dans `app/actions/admin.ts` appellent `requireAdminSession()` en premier ; connexion/déconnexion via `app/actions/auth.ts`.
5. **Admin protégé** — routes `/admin/*` (sauf `/admin/login`) via `middleware.ts` ; ne pas exposer le shell admin (`AdminShell`) sur la page de login (groupe `(dashboard)`).
6. **Design system** — réutiliser `components/ui/*` et les tokens/utilitaires dans `app/globals.css` (`--color-*`, `--radius-*`, `--shadow-*`, classes `.input-field`, `.card-surface`, etc.). Messages utilisateur : `AlertBanner` (pas de `text-red-500` ad hoc). Chargements : `Spinner` / `LoadingState`. Erreurs de champ : `FieldError`. Logos via `AppLogo` (`on-brand` sur fond turquoise, `on-surface` sur fond crème).
7. **Services** — toute requête Supabase passe par `services/*.service.ts`, pas d'appels directs dans les composants.
8. **Historique** — tracer les actions significatives via `eventsService.log()`.
9. **Professionnels en base** — le matching exige `latitude`/`longitude`, `categories` (noms exacts, ex. `"Plombier"`), `active = true`, et `radius_km`.
10. **Composants admin** — réutiliser `components/admin/*` et `AdminPageHeader` avant d'en créer de nouveaux.
11. **Photos** — `ProPhotoGallery` ignore les URLs vides ou invalides (ne jamais passer une URL non valide à `next/image`).
12. **Couverture** — toute logique alertes/opportunités passe par `coverage.service.ts` et `utils/coverage.ts` ; ne pas dupliquer les seuils rouge/orange/vert ailleurs.
13. **Facturation** — toute lecture/écriture `invoices` passe par `invoices.service.ts` et `utils/invoices.ts` ; les montants sont recalculés à la prise via `prepareMissionBilling` (prix lu dans `settingsService`).
14. **Design (étapes 07–08)** — ne pas créer de styles ad hoc : étendre `app/globals.css` et `components/ui/*`. Champs custom (autocomplete, catégorie) utilisent `.input-field`, `.dropdown-panel` et `FieldError` pour les erreurs. Retours globaux : `AlertBanner`. Logos via `AppLogo`, jamais de nouvelle identité visuelle.
15. **Accessibilité** — `SkipLink` sur les layouts principaux ; champs avec label + `aria-invalid` / `aria-describedby` quand pertinent ; listbox avec `aria-label` et `aria-selected` sur les options.

---

## Limites connues (V1)

- **Comptes admin** — création manuelle dans Supabase Auth uniquement ; pas d'inscription, pas de réinitialisation mot de passe dans l'app ; tout utilisateur Auth valide peut accéder à l'admin (pas de liste blanche)
- **Emails pro** — utilisent `RESEND_FROM_EMAIL` / défaut Resend, pas `app_settings.sender_email`
- **Extension de recherche** — pas de `search_extended` si aucun pro trouvé
- **Clôture de mission** — statut `completed` prévu en schéma, pas encore exposé dans l'UI pro ou admin
- **Paiement en ligne** — pas de Stripe, abonnements ni envoi automatique de factures
- **Tests automatiques** — pas de suite de tests (lint + build manuels)
- **Emails** — templates HTML en place, non validés dans tous les clients mail

---

## Prochaines étapes (non implémentées)

- Liste blanche d'emails admin, rôles ou permissions granulaires
- Réinitialisation / changement de mot de passe admin dans l'UI
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
