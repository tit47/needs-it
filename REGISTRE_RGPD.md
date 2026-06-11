# Registre des activités de traitement — Need's it

**Document interne — conformité RGPD (article 30)**

**Responsable du traitement :** [À COMPLÉTER : raison sociale]  
**Dernière mise à jour :** [À COMPLÉTER : date]  
**Version :** 1.0  
**Référent données / DPO :** [À COMPLÉTER : nom et contact]

> Ce registre décrit les traitements de données personnelles réalisés par Need's it tels qu'implémentés dans l'application (V1). Il doit être tenu à jour à chaque évolution significative du service ou des sous-traitants.

---

## Synthèse de l'architecture technique

| Composant | Rôle | Données concernées |
|-----------|------|-------------------|
| **Next.js 15** (application web) | Interface client, pro, admin ; server actions | Données transitant via les formulaires et API internes |
| **Supabase** (PostgreSQL) | Stockage principal | Demandes, professionnels, candidats, factures, événements, alertes, paramètres |
| **Supabase Storage** (bucket `request-photos`, public) | Stockage des photos de demandes | Images uploadées par les clients |
| **Supabase Auth** | Authentification admin | E-mail et session des administrateurs |
| **Resend** | E-mails transactionnels | E-mails pros et alertes admin |
| **Telegram** (optionnel) | Notifications internes couverture | Alertes agrégées (ville, catégorie, message) |
| **API BAN** (`api-adresse.data.gouv.fr`) | Autocomplétion et vérification d'adresse | Requêtes de recherche d'adresse |
| **Hébergeur applicatif** | Déploiement Next.js | [À COMPLÉTER : ex. Vercel, OVH, etc.] |

**Philosophie base de données (V1) :** pas de suppression automatique des enregistrements ; conservation par statuts et historique (`request_events`, `claims`).

---

## Traitement n° 1 — Gestion des demandes clients

| Élément | Description |
|---------|-------------|
| **Finalité** | Recueillir une demande d'intervention, générer un code mission, effectuer le matching géographique et mettre en relation avec des professionnels |
| **Catégories de personnes concernées** | Clients (particuliers) |
| **Catégories de données** | Identité (nom), coordonnées (téléphone, adresse, ville), description du besoin, catégorie de service, coordonnées GPS (lat/lon), photos (jusqu'à 5), code mission, métadonnées de matching (distance, nombre de pros), statut de la demande, horodatages |
| **Source des données** | Saisie directe par le client via le formulaire `/` |
| **Destinataires internes** | Équipe administrative (back-office `/admin`) |
| **Destinataires externes** | Professionnels éligibles (nom, tél, description, photos ; adresse après claim), Supabase, Resend (contenu des e-mails), API BAN (vérification adresse) |
| **Transferts hors UE** | Possible via Supabase et Resend — [À COMPLÉTER : garanties] |
| **Durée de conservation** | [À COMPLÉTER : ex. 3 ans après dernière activité] — voir politique de confidentialité |
| **Mesures de sécurité** | Validation serveur, adresse obligatoirement sélectionnée dans BAN, masquage adresse avant claim, code mission, accès admin protégé, stockage Supabase |
| **Base légale** | Art. 6.1.b RGPD (mesures précontractuelles / exécution du service demandé) ; art. 6.1.f (sécurisation de la mise en relation) |
| **Droits des personnes** | Accès, rectification, effacement, limitation, opposition — contact : [À COMPLÉTER] |
| **Référence technique** | `app/actions/create-request.ts`, tables `requests`, `request_photos`, bucket `request-photos` |

---

## Traitement n° 2 — Mise en relation et workflow professionnel

| Élément | Description |
|---------|-------------|
| **Finalité** | Transmettre les demandes aux professionnels, permettre la consultation via lien sécurisé, la prise/libération de mission et les notifications associées |
| **Catégories de personnes concernées** | Clients et professionnels |
| **Catégories de données** | Données de la demande (cf. traitement 1), e-mail professionnel, token de lien sécurisé, distance calculée, horodatages (`email_sent_at`, `link_opened_at`, `reminder_sent_at`), historique `claims` et `request_events` |
| **Source** | Génération automatique à la création de demande ; actions du professionnel sur `/pro/[token]` |
| **Destinataires** | Professionnels concernés, Resend (e-mails : `new-request`, `mission-confirmed`, `mission-taken`, `demand-available`, `reminder-30min`) |
| **Transferts hors UE** | Resend — [À COMPLÉTER] |
| **Durée de conservation** | Liée à la durée de conservation des demandes et des liens associés |
| **Mesures de sécurité** | Token unique par couple demande/pro, adresse masquée avant claim, validation code mission par téléphone, désactivation des autres liens après claim |
| **Base légale** | Art. 6.1.b RGPD ; art. 6.1.f (traçabilité, sécurité) |
| **Référence technique** | `services/pro-workflow.service.ts`, `services/pro-links.service.ts`, table `request_professional_links`, `emails/templates/pro-workflow.ts` |

### Détail des e-mails transactionnels (Resend)

| Template | Destinataire | Données incluses |
|----------|--------------|------------------|
| `new-request` | Professionnel | Catégorie, distance, description, photos, lien `/pro/[token]` — **sans adresse client** |
| `mission-confirmed` | Professionnel ayant pris la mission | Nom, téléphone, adresse, ville, description, photos |
| `mission-taken` | Autres professionnels | Catégorie, lien pro |
| `demand-available` | Professionnels réactivés | Catégorie, distance, description, lien pro |
| `reminder-30min` | Professionnel n'ayant pas répondu | Catégorie, distance, description, lien pro (cron 30 min) |

**Expéditeur par défaut :** variable `RESEND_FROM_EMAIL` (défaut dans `.env.example` : `Need's it <noreply@needs-it.fr>`).  
**Note :** les e-mails pro n'utilisent pas encore l'e-mail configuré dans `app_settings.sender_email` (réservé aux alertes admin).

---

## Traitement n° 3 — Gestion du réseau de professionnels

| Élément | Description |
|---------|-------------|
| **Finalité** | Référencer les professionnels, gérer leurs catégories et zone d'intervention, assurer le matching |
| **Catégories de personnes concernées** | Professionnels référencés |
| **Catégories de données** | Nom, e-mail, téléphone, adresse, ville, coordonnées GPS, SIREN, catégories (tableau), rayon km, statut actif/suspendu, statistiques (`completed_jobs`, `rating`, `response_rate` si renseignés), date de création |
| **Source** | Saisie administrative ; conversion depuis candidature validée |
| **Destinataires** | Équipe admin ; professionnel (e-mails de notification) |
| **Durée de conservation** | Durée du partenariat + [À COMPLÉTER : délai post-fin] |
| **Base légale** | Art. 6.1.b RGPD (relation contractuelle avec le professionnel) |
| **Référence technique** | Table `professionals`, `services/professionals.service.ts`, `components/admin/professionals-panel.tsx` |

---

## Traitement n° 4 — Gestion des candidatures professionnelles

| Élément | Description |
|---------|-------------|
| **Finalité** | Examiner les candidatures, accepter (création d'un professionnel), refuser ou suspendre |
| **Catégories de personnes concernées** | Candidats professionnels |
| **Catégories de données** | Nom, e-mail, téléphone, adresse, ville, coordonnées GPS, SIREN, catégories, rayon km, statut (`pending`, `accepted`, `refused`, `suspended`), date de création |
| **Source** | [À COMPLÉTER : canal de collecte des candidatures — non implémenté en formulaire public V1] |
| **Destinataires** | Équipe admin uniquement |
| **Durée de conservation** | [À COMPLÉTER : ex. 1 an après refus ; durée du partenariat si accepté] |
| **Base légale** | Art. 6.1.b RGPD ; art. 6.1.f |
| **Référence technique** | Table `candidate_professionals`, `services/candidates.service.ts`, `app/admin/(dashboard)/candidats/` |

---

## Traitement n° 5 — Facturation des professionnels

| Élément | Description |
|---------|-------------|
| **Finalité** | Suivre le nombre de missions validées par mois et le montant dû par professionnel |
| **Catégories de personnes concernées** | Professionnels référencés |
| **Catégories de données** | Identifiant professionnel, mois, nombre de missions, montant (€), statuts `invoice_sent` / `paid`, horodatages |
| **Source** | Incrément automatique à chaque prise de mission (`prepareMissionBilling`) ; prix unitaire lu dans `app_settings.mission_price_eur` (5 € par défaut) |
| **Destinataires** | Équipe admin |
| **Durée de conservation** | **10 ans** (obligation comptable — art. L123-22 du Code de commerce) |
| **Base légale** | Art. 6.1.b RGPD (exécution du contrat) ; art. 6.1.c (obligation comptable) |
| **Référence technique** | Table `invoices`, `services/invoices.service.ts`, `app/admin/(dashboard)/facturation/` |

**Note V1 :** pas de paiement en ligne (Stripe non implémenté) ; envoi et encaissement des factures gérés manuellement.

---

## Traitement n° 6 — Pilotage, alertes et opportunités

| Élément | Description |
|---------|-------------|
| **Finalité** | Détecter les zones/catégories sous-couvertes, alerter l'équipe, piloter le développement du réseau |
| **Catégories de personnes concernées** | Clients (indirectement — via métadonnées de demande : ville, catégorie) ; pas de nom client dans les notifications Telegram |
| **Catégories de données** | Ville, catégorie, niveau d'alerte (rouge/orange/vert), messages d'alerte, compteurs agrégés (`request_count`, `success_count`), lien vers pages admin, identifiant de demande lié (`request_id`) |
| **Source** | Calcul automatique à chaque nouvelle demande et à la prise de mission ; cron 30 min pour alerte « Aucune réponse » |
| **Destinataires** | Administrateurs (dashboard, e-mail, Telegram si activé) |
| **Notifications** | Telegram (si `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` et flag `telegram_notifications_enabled` dans Paramètres) ; e-mail vers `sender_email` des Paramètres |
| **Durée de conservation** | [À COMPLÉTER : ex. 2 ans] ou durée opérationnelle |
| **Base légale** | Art. 6.1.f RGPD (pilotage et amélioration du service) |
| **Référence technique** | `services/coverage.service.ts`, `services/alerts.service.ts`, tables `alerts`, `coverage_alerts`, `emails/templates/coverage-alert.ts`, `app/api/cron/reminders/route.ts` |

### Règles de couverture (seuils implémentés)

| Niveau | Condition (pros éligibles au matching) |
|--------|----------------------------------------|
| Rouge | 0 professionnel |
| Orange | 1 ou 2 professionnels |
| Vert | 3 professionnels ou plus |

---

## Traitement n° 7 — Authentification et accès administration

| Élément | Description |
|---------|-------------|
| **Finalité** | Protéger l'accès au back-office et aux actions de gestion |
| **Catégories de personnes concernées** | Administrateurs / collaborateurs Need's it |
| **Catégories de données** | Adresse e-mail, mot de passe (hashé par Supabase Auth), cookies de session, identifiant utilisateur Auth |
| **Source** | Création manuelle dans Supabase Auth ; connexion sur `/admin/login` |
| **Destinataires** | Supabase Auth |
| **Durée de conservation** | Durée du compte collaborateur |
| **Mesures de sécurité** | Middleware sur `/admin/*`, `requireAdminSession()` sur les server actions, HTTPS [À COMPLÉTER : confirmer TLS en production] |
| **Base légale** | Art. 6.1.f RGPD (sécurité des systèmes d'information) |
| **Limites V1** | Pas de liste blanche d'e-mails ; pas de rôles granulaires ; pas de réinitialisation mot de passe dans l'UI |
| **Référence technique** | `middleware.ts`, `lib/auth/admin-session.ts`, `app/actions/auth.ts`, Supabase Auth |

---

## Traitement n° 8 — Historique et journalisation des événements

| Élément | Description |
|---------|-------------|
| **Finalité** | Tracer le cycle de vie des demandes pour support, audit et amélioration |
| **Catégories de données** | Type d'événement (`request_created`, `email_sent`, `link_opened`, `mission_claimed`, `mission_released`, `mission_completed`), détails JSON (ville, code postal, nombre de photos, identifiant pro, template e-mail…), horodatage |
| **Personnes concernées** | Clients et professionnels (identifiants indirects via `request_id` / `professional_id`) |
| **Durée de conservation** | Alignée sur la demande associée |
| **Base légale** | Art. 6.1.f RGPD |
| **Référence technique** | Table `request_events`, `services/events.service.ts` |

---

## Traitement n° 9 — Préférences d'affichage (thème clair/sombre)

| Élément | Description |
|---------|-------------|
| **Finalité** | Mémoriser le choix d'affichage de l'interface client |
| **Données** | Valeur `light` ou `dark` stockée en `localStorage` (clé `needs-it-theme`) |
| **Personnes concernées** | Visiteurs du site client |
| **Transfert serveur** | Non — stockage local uniquement |
| **Base légale** | Intérêt légitime / consentement implicite pour cookie équivalent non essentiel — [À COMPLÉTER : valider avec conseil juridique si bandeau cookies requis] |
| **Référence technique** | `components/providers/theme-provider.tsx` |

---

## Traitement n° 10 — Géocodage via API BAN

| Élément | Description |
|---------|-------------|
| **Finalité** | Proposer l'autocomplétion d'adresse et vérifier l'adresse sélectionnée |
| **Données transmises** | Texte de recherche saisi par l'utilisateur ; identifiant BAN de l'adresse sélectionnée |
| **Personnes concernées** | Clients |
| **Sous-traitant / tiers** | État français — API Base Adresse Nationale (`api-adresse.data.gouv.fr`) |
| **Stockage côté BAN** | Need's it ne contrôle pas la politique de l'API ; les requêtes sont envoyées en temps réel |
| **Base légale** | Art. 6.1.b RGPD |
| **Référence technique** | `utils/geocoding.ts`, `components/client/address-autocomplete-field.tsx` |

---

## Registre des sous-traitants (article 28 RGPD)

| Sous-traitant | Service fourni | Données traitées | Localisation / transferts | Contact DPO / privacy | Contrat / DPA |
|---------------|----------------|------------------|---------------------------|----------------------|---------------|
| **Supabase, Inc.** | BDD PostgreSQL, Storage, Auth | Toutes données stockées | [À COMPLÉTER : région projet] | [https://supabase.com/privacy](https://supabase.com/privacy) | [À COMPLÉTER : DPA signé] |
| **Resend** | Envoi d'e-mails transactionnels | E-mails, contenu des messages | USA — [À COMPLÉTER : garanties SCC] | [https://resend.com/legal/privacy-policy](https://resend.com/legal/privacy-policy) | [À COMPLÉTER : DPA signé] |
| **Telegram** (optionnel) | Notifications internes | Alertes agrégées | [À COMPLÉTER] | [https://telegram.org/privacy](https://telegram.org/privacy) | [À COMPLÉTER] |
| **[Hébergeur Next.js]** | Hébergement application | Données en transit, logs serveur | [À COMPLÉTER] | [À COMPLÉTER] | [À COMPLÉTER] |
| **API BAN** | Géocodage | Requêtes d'adresse | France (service public) | [https://adresse.data.gouv.fr](https://adresse.data.gouv.fr) | N/A (API publique) |

---

## Analyse d'impact (AIPD / DPIA)

| Traitement | AIPD requise ? | Commentaire |
|------------|----------------|-------------|
| Demandes clients + photos | [À COMPLÉTER : évaluer] | Données de localisation précises ; photos potentiellement sensibles (intérieur domicile) |
| Workflow pro + masquage adresse | [À COMPLÉTER : évaluer] | Mesure de protection intégrée (code mission) |
| Stockage photos (bucket public) | **À évaluer en priorité** | Les URLs de photos sont publiquement accessibles via Supabase Storage — risque de confidentialité à documenter et mitiger |
| Facturation | Non attendu | Données limitées, finalité claire |
| Auth admin | Non attendu | Accès restreint |

**Action recommandée :** documenter la justification du bucket `request-photos` public et les mesures compensatoires (URLs non listées publiquement, tokens pro pour l'accès métier).

---

## Mesures de sécurité transverses (état V1)

- Accès base de données via clé **service role** côté serveur uniquement (`createAdminClient()`)
- Row Level Security activée sur les tables (politiques détaillées à compléter selon configuration Supabase)
- Protection routes admin par middleware et session Supabase Auth
- Validation des entrées (téléphone FR, description min. 10 caractères, max 5 photos, 8 Mo avant compression)
- Compression images côté client (max 1200 px, JPEG 82 %)
- Cron rappels sécurisé par `CRON_SECRET` (optionnel)
- Pas de suppression automatique — procédure manuelle de purge à définir

---

## Procédures à formaliser avant production

| Procédure | Statut |
|-----------|--------|
| Exercice des droits RGPD (accès, rectification, suppression) | [À COMPLÉTER : processus interne + délai de réponse 1 mois] |
| Notification de violation de données (art. 33-34 RGPD) | [À COMPLÉTER : procédure et contacts CNIL] |
| Politique de conservation et purge | [À COMPLÉTER : durées validées + scripts/outils de suppression] |
| Registre des sous-traitants et DPAs | [À COMPLÉTER] |
| Information des personnes (politique de confidentialité publiée + lien dans le footer) | [À COMPLÉTER : intégration UI] |
| Analyse du bucket photos public | [À COMPLÉTER : décision sécurité] |
| Médiateur de la consommation (si B2C) | [À COMPLÉTER] |
| CGU acceptées / accessibles depuis le site | [À COMPLÉTER : intégration UI] |

---

## Historique des révisions

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 1.0 | [À COMPLÉTER] | [À COMPLÉTER] | Création initiale basée sur le code V1 |

---

*Document interne confidentiel. Ne pas publier tel quel sur le site public. Les champs « À COMPLÉTER » doivent être renseignés avant la mise en production.*
