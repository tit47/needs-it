# Politique de confidentialité — Need's it

**Dernière mise à jour :** [À COMPLÉTER : date de publication]

**Version :** 1.0 — document préparatoire à la mise en production

---

## 1. Qui sommes-nous ?

Need's it est une plateforme de mise en relation entre **particuliers** qui formulent une demande de dépannage ou de service à domicile et **professionnels** référencés par l'équipe Need's it.

**Responsable du traitement :** [À COMPLÉTER : raison sociale ou nom de l'éditeur]

**Adresse :** [À COMPLÉTER : adresse postale complète]

**Contact pour les données personnelles :** [À COMPLÉTER : adresse e-mail dédiée, ex. `privacy@needs-it.fr` ou `contact@needs-it.fr`]

**Délégué à la protection des données (DPO) :** [À COMPLÉTER : nom et coordonnées, ou indiquer « non désigné » si le responsable du traitement a conclu qu'un DPO n'est pas obligatoire]

---

## 2. Objet de cette politique

Cette politique explique **quelles données personnelles** Need's it collecte, **pourquoi**, **avec qui elles sont partagées**, **combien de temps** elles sont conservées et **quels sont vos droits**.

Elle s'applique à :

- toute personne utilisant le **formulaire de demande** sur le site (`/`) ;
- les **professionnels** référencés et sollicités via la plateforme ;
- les personnes accédant à l'**espace professionnel** via un lien sécurisé (`/pro/[token]`) ;
- les **administrateurs** du back-office (`/admin`).

> **Important :** en version actuelle (V1), Need's it ne propose **pas de compte client** ni de **compte professionnel** avec inscription en ligne. Les professionnels sont référencés par l'équipe Need's it après validation d'une candidature.

---

## 3. Données collectées et finalités

### 3.1. Demandes clients (formulaire sur `/`)

Lorsque vous déposez une demande, Need's it collecte les informations suivantes :

| Donnée | Obligatoire | Finalité |
|--------|-------------|----------|
| Catégorie de service | Oui | Identifier le type d'intervention et trouver des professionnels compatibles |
| Description du besoin | Oui | Permettre aux professionnels d'évaluer la demande |
| Nom complet | Oui | Permettre la prise de contact par un professionnel |
| Numéro de téléphone (format français) | Oui | Permettre la prise de contact et la validation de mission par code |
| Adresse (sélection obligatoire dans la liste proposée) | Oui | Géolocaliser la demande, calculer la distance avec les professionnels et, après confirmation de mission, permettre l'intervention |
| Ville, coordonnées géographiques (latitude / longitude) | Oui (dérivées de l'adresse) | Matching géographique avec les professionnels |
| Photos (jusqu'à 5 images, compressées côté navigateur) | Non | Illustrer le besoin auprès des professionnels |
| Code mission (généré par Need's it) | — | Sécuriser la mise en relation : l'adresse complète n'est dévoilée au professionnel qu'après validation de ce code lors d'un échange téléphonique |

**Base légale :** exécution de mesures précontractuelles et du service de mise en relation demandé par l'utilisateur (article 6.1.b du RGPD), et intérêt légitime de Need's it à organiser une mise en relation fiable et sécurisée (article 6.1.f).

**Fonctionnement particulier :** avant confirmation de mission, le professionnel voit le **nom**, le **téléphone**, la **description** et les **photos**, mais **pas l'adresse complète**. L'adresse est communiquée après saisie correcte du code mission.

### 3.2. Professionnels référencés

Pour chaque professionnel actif sur la plateforme, Need's it traite notamment :

| Donnée | Finalité |
|--------|----------|
| Nom complet | Identification et communication |
| Adresse e-mail | Envoi des notifications de nouvelles demandes et du suivi de mission |
| Numéro de téléphone | Contact opérationnel |
| Adresse professionnelle, ville | Géolocalisation et calcul de distance |
| Coordonnées géographiques | Matching avec les demandes |
| Numéro SIREN | Identification de l'activité professionnelle |
| Catégories d'intervention | Matching par métier |
| Rayon d'intervention (km) | Déterminer l'éligibilité aux demandes |
| Historique de missions, facturation mensuelle | Suivi de l'activité et facturation des missions validées |

**Base légale :** exécution du contrat ou des mesures précontractuelles liant le professionnel à Need's it (article 6.1.b), et obligations légales en matière comptable pour la facturation (article 6.1.c).

### 3.3. Candidatures professionnelles

Les candidatures de professionnels (`candidate_professionals`) contiennent des données similaires à celles des professionnels actifs (identité, coordonnées, SIREN, catégories, zone d'intervention).

**Finalité :** étudier et valider (ou refuser) l'entrée d'un nouveau professionnel sur la plateforme.

**Base légale :** mesures précontractuelles (article 6.1.b) et intérêt légitime de Need's it à gérer son réseau de professionnels (article 6.1.f).

> **Note :** en V1, l'application ne propose pas de formulaire public d'inscription professionnelle. Les candidatures sont gérées via le back-office administrateur.

### 3.4. Espace professionnel (`/pro/[token]`)

L'accès se fait via un **lien sécurisé unique** envoyé par e-mail, sans création de compte.

Need's it enregistre notamment :

- l'ouverture du lien (`link_opened_at`) ;
- les actions de prise ou de libération de mission ;
- les événements associés dans l'historique de la demande.

**Finalité :** sécuriser l'accès, tracer le déroulement de la mise en relation et envoyer les notifications appropriées.

**Base légale :** exécution du service (article 6.1.b) et intérêt légitime en matière de sécurité et de traçabilité (article 6.1.f).

### 3.5. Administration (`/admin`)

Les administrateurs se connectent avec un **e-mail et un mot de passe** via **Supabase Auth**.

Données traitées :

- identifiant de connexion (e-mail) ;
- données de session d'authentification (cookies sécurisés gérés par Supabase).

**Finalité :** protéger l'accès au back-office (gestion des demandes, professionnels, candidats, alertes, facturation, paramètres).

**Base légale :** intérêt légitime de Need's it à sécuriser ses outils internes (article 6.1.f).

> **Note :** en V1, tout utilisateur Supabase Auth valide peut accéder à l'administration. Les comptes sont créés manuellement dans Supabase ; il n'existe pas d'inscription publique.

### 3.6. Données techniques et de journalisation

Need's it conserve également :

- un **historique d'événements** par demande (`request_created`, `email_sent`, `link_opened`, `mission_claimed`, etc.) ;
- des **alertes de couverture** (ville, catégorie, niveau rouge/orange/vert) ;
- des **statistiques agrégées** pour le pilotage du service.

**Finalité :** assurer le bon fonctionnement, la sécurité, le support et l'amélioration du service.

**Base légale :** intérêt légitime (article 6.1.f).

---

## 4. Destinataires des données

Vos données peuvent être communiquées aux catégories de destinataires suivantes :

| Destinataire | Rôle | Données concernées |
|--------------|------|-------------------|
| Professionnels éligibles | Consultation d'une demande et prise de contact | Nom, téléphone, description, photos ; adresse après validation du code mission |
| Équipe administrative Need's it | Gestion de la plateforme | Ensemble des données nécessaires au back-office |
| **Supabase** | Hébergement de la base de données, du stockage des photos et de l'authentification admin | Données stockées par l'application |
| **Resend** | Envoi des e-mails transactionnels | Coordonnées des destinataires, contenu des e-mails (description, liens, etc.) |
| **Telegram** (si activé) | Notifications internes d'alertes couverture | Ville, catégorie, message d'alerte (pas de données client directes dans la notification) |
| **API BAN** (Base Adresse Nationale — `api-adresse.data.gouv.fr`) | Autocomplétion et vérification d'adresse lors de la saisie | Texte de recherche d'adresse transmis lors de la saisie |

Need's it **ne vend pas** vos données personnelles.

---

## 5. Transferts hors Union européenne

Certains sous-traitants techniques peuvent traiter des données en dehors de l'Union européenne, notamment :

- **Resend** (prestataire d'e-mails) ;
- **Telegram** (si les notifications sont activées) ;
- **Supabase** (selon la région du projet configuré dans le tableau de bord Supabase).

**[À COMPLÉTER : région d'hébergement du projet Supabase (ex. `eu-west-1`, `eu-central-1`)]**

Lorsque des transferts hors UE ont lieu, Need's it s'assure que des garanties appropriées sont mises en place (clauses contractuelles types, mesures complémentaires), conformément au chapitre V du RGPD.

**[À COMPLÉTER : liste des garanties contractuelles signées avec chaque sous-traitant concerné]**

---

## 6. Durées de conservation

Le schéma technique de Need's it est conçu **sans suppression automatique** des enregistrements. Les durées ci-dessous constituent une **politique de conservation cible** à valider avant la mise en production :

| Catégorie de données | Durée de conservation proposée |
|---------------------|--------------------------------|
| Demandes clients et photos associées | [À COMPLÉTER : ex. 3 ans après la dernière activité sur la demande, sauf obligation contraire] |
| Historique d'événements liés aux demandes | Même durée que la demande associée |
| Données professionnels actifs | Durée du partenariat, puis [À COMPLÉTER : ex. 3 ans] après fin de collaboration |
| Candidatures refusées ou suspendues | [À COMPLÉTER : ex. 1 an après la décision] |
| Données de facturation (`invoices`) | **10 ans** (obligation comptable en France) |
| Comptes administrateurs (Supabase Auth) | Durée d'activité du compte, puis suppression sur demande ou à la fin du contrat du collaborateur |
| Journaux techniques / alertes | [À COMPLÉTER : ex. 2 ans] ou durée nécessaire au pilotage du service |
| E-mails transactionnels (chez Resend) | Selon la politique de conservation de Resend et les réglages du compte |

À l'issue de ces durées, les données seront **supprimées ou anonymisées**, sauf obligation légale de conservation plus longue.

---

## 7. Cookies et traceurs

### 7.1. Cookies strictement nécessaires

Lors de la connexion à l'administration (`/admin`), des **cookies de session** sont déposés par **Supabase Auth** pour maintenir la connexion et sécuriser l'accès. Ces cookies sont indispensables au fonctionnement du back-office.

### 7.2. Stockage local (navigateur)

Sur le site client, Need's it enregistre dans le **stockage local du navigateur** (`localStorage`, clé `needs-it-theme`) votre préférence d'affichage **clair / sombre**. Cette information n'est pas transmise au serveur.

### 7.3. Absence de cookies publicitaires ou d'analyse

En l'état du code (V1), Need's it **n'utilise pas** de solution d'analyse d'audience (type Google Analytics) ni de cookies publicitaires.

**[À COMPLÉTER : si un outil de mesure d'audience est ajouté avant le lancement, mettre à jour cette section et, le cas échéant, afficher un bandeau de consentement conforme]**

---

## 8. Sécurité

Need's it met en œuvre des mesures techniques et organisationnelles adaptées, notamment :

- accès professionnel par **lien sécurisé** (token unique) plutôt que par compte ouvert ;
- **masquage de l'adresse** client jusqu'à validation du code mission ;
- authentification admin par **mot de passe** et protection des routes `/admin` ;
- stockage des données dans **Supabase** avec accès serveur sécurisé (clé de service côté serveur uniquement) ;
- compression des photos côté client avant envoi (max. 5 photos, 8 Mo chacune avant compression).

Aucune mesure de sécurité n'étant infaillible, Need's it ne peut garantir une sécurité absolue.

---

## 9. Vos droits

Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi « Informatique et Libertés », vous disposez des droits suivants :

| Droit | Description |
|-------|-------------|
| **Accès** | Obtenir la confirmation que vos données sont traitées et en recevoir une copie |
| **Rectification** | Faire corriger des données inexactes ou incomplètes |
| **Effacement** | Demander la suppression de vos données, sous réserve des obligations légales de conservation |
| **Limitation** | Demander la limitation du traitement dans certains cas |
| **Opposition** | Vous opposer au traitement fondé sur l'intérêt légitime |
| **Portabilité** | Recevoir vos données dans un format structuré (lorsque le traitement est automatisé et fondé sur le contrat ou le consentement) |
| **Retrait du consentement** | Lorsque le traitement est fondé sur le consentement (ex. photos facultatives), retirer ce consentement à tout moment |

Pour exercer vos droits, contactez : **[À COMPLÉTER : adresse e-mail de contact]**

Need's it pourra vous demander une **pièce d'identité** en cas de doute raisonnable sur votre identité.

Vous pouvez également introduire une réclamation auprès de la **CNIL** :

- Site : [https://www.cnil.fr](https://www.cnil.fr)
- Adresse : 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07

---

## 10. Données des mineurs

Need's it s'adresse à des **personnes majeures**. Le service n'est pas destiné aux mineurs. Si vous pensez qu'un mineur nous a transmis des données, contactez-nous pour demander leur suppression.

---

## 11. Modifications de cette politique

Need's it peut modifier cette politique pour refléter l'évolution du service ou des obligations légales. La date de dernière mise à jour sera indiquée en tête du document.

En cas de modification substantielle, Need's it informera les utilisateurs par un moyen approprié **[À COMPLÉTER : préciser le mode d'information prévu, ex. bandeau sur le site, e-mail aux professionnels référencés]**.

---

## 12. Contact

Pour toute question relative à cette politique ou à vos données personnelles :

**[À COMPLÉTER : raison sociale]**  
**[À COMPLÉTER : adresse postale]**  
**[À COMPLÉTER : e-mail de contact]**

---

*Document établi sur la base du fonctionnement réel de l'application Need's it (V1). Les champs marqués « À COMPLÉTER » doivent être renseignés avant la mise en production publique.*
