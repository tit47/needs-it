# Conditions Générales d'Utilisation (CGU) — Need's it

**Dernière mise à jour :** 14 Juin 2026

**Version :** 1.0 — document préparatoire à la mise en production

---

## Article 1 — Objet

Les présentes Conditions Générales d'Utilisation (ci-après les « **CGU** ») ont pour objet de définir les modalités d'accès et d'utilisation du site et du service **Need's it** (ci-après le « **Service** »).

Need's it est une plateforme de **mise en relation** entre des particuliers souhaitant obtenir une intervention de dépannage ou de service à domicile et des professionnels référencés par Need's it.

**Éditeur du Service :** TV computer (Entreprise individuelle)  
**Siège social :** 28 avenue Émile Zola, 47500 Fumel, France  
**Contact :** [su0r44n@gmail.com](mailto:su0r44n@gmail.com)

En utilisant le Service, l'utilisateur reconnaît avoir pris connaissance des présentes CGU et les accepter sans réserve.

---

## Article 2 — Définitions

- **« Client »** : toute personne physique utilisant le formulaire de demande sur le site pour solliciter une intervention.
- **« Professionnel »** : tout prestataire référencé par Need's it et recevant des demandes par e-mail, accédant au détail via un lien sécurisé.
- **« Candidat professionnel »** : toute personne dont la candidature est en cours d'étude par l'équipe Need's it.
- **« Administrateur »** : toute personne autorisée à accéder au back-office `/admin`.
- **« Demande »** : requête déposée par un Client via le formulaire en ligne.
- **« Code mission »** : code à 4 caractères généré par Need's it et communiqué au Client après envoi de sa demande ; il permet au Professionnel de confirmer la prise de mission.
- **« Mission »** : accord de principe entre un Client et un Professionnel formalisé par la saisie correcte du code mission sur la plateforme.

---

## Article 3 — Description du Service

### 3.1. Côté Client

Le Client peut, sans créer de compte :

1. sélectionner une catégorie de service ;
2. décrire son besoin ;
3. indiquer son nom, son numéro de téléphone et son adresse (sélection obligatoire dans les suggestions proposées par la Base Adresse Nationale) ;
4. joindre jusqu'à **5 photos** (facultatif) ;
5. recevoir un **code mission** après envoi de sa demande.

Need's it transmet ensuite la demande aux professionnels éligibles (même catégorie, distance compatible avec leur rayon d'intervention).

### 3.2. Côté Professionnel

En V1, le Professionnel :

- **ne crée pas de compte** sur le site ;
- reçoit un **e-mail** lorsqu'une demande correspond à son profil ;
- accède au détail via un **lien sécurisé** personnel (`/pro/[token]`) ;
- consulte le nom, le téléphone, la description et les photos du Client, **sans voir l'adresse complète** tant que la mission n'est pas confirmée ;
- contacte le Client par téléphone ;
- saisit le **code mission** communiqué par le Client pour confirmer la prise de mission ;
- accède alors à l'adresse complète et reçoit un e-mail de confirmation.

Le Professionnel peut, dans certains cas, **libérer** une mission qu'il a prise, rendant la demande à nouveau disponible pour d'autres professionnels.

### 3.3. Rôle de Need's it

Need's it :

- organise la **mise en relation** ;
- assure un **suivi technique** des demandes (statuts, historique, alertes) ;
- gère le **référencement** des professionnels ;
- assure un **suivi de facturation** des missions validées auprès des professionnels (V1 : suivi manuel, sans paiement en ligne).

Need's it **n'est pas partie** au contrat de prestation conclu entre le Client et le Professionnel et **n'exécute pas** l'intervention elle-même.

---

## Article 4 — Accès au Service

### 4.1. Accès public

Le formulaire client sur `/` est accessible sans inscription.

### 4.2. Espace professionnel

L'accès à `/pro/[token]` est réservé au détenteur du lien sécurisé transmis par e-mail. Le lien est personnel et ne doit pas être partagé indûment.

### 4.3. Espace administration

L'accès à `/admin` est protégé par **authentification** (e-mail et mot de passe via Supabase Auth). Les comptes administrateurs sont créés manuellement ; il n'existe pas d'inscription publique.

### 4.4. Prérequis techniques

L'utilisateur doit disposer d'un équipement et d'une connexion Internet compatibles. Les coûts de connexion restent à sa charge.

---

## Article 5 — Conditions d'utilisation par les Clients

Le Client s'engage à :

- fournir des informations **exactes et sincères** ;
- utiliser un **numéro de téléphone valide** et joignable ;
- sélectionner une **adresse réelle** dans les suggestions proposées ;
- ne déposer que des **photos pertinentes** et dont il détient les droits ;
- communiquer le **code mission** uniquement au professionnel qu'il souhaite retenir, après échange téléphonique ;
- ne pas utiliser le Service à des fins **frauduleuses, abusives ou illicites**.

Le Client est informé que Need's it **ne garantit pas** qu'un professionnel sera disponible pour chaque demande (notamment en cas d'absence de professionnel éligible dans sa zone).

---

## Article 6 — Conditions d'utilisation par les Professionnels

Le Professionnel référencé s'engage à :

- disposer d'un **numéro SIREN valide** et d'une activité conforme aux catégories déclarées ;
- répondre avec **diligence** aux demandes qui lui sont transmises ;
- contacter le Client par téléphone **avant** de confirmer une mission ;
- ne confirmer une mission qu'après accord avec le Client et saisie correcte du code mission ;
- traiter les données du Client avec **confidentialité** et uniquement pour les besoins de la mission ;
- ne pas transmettre son lien sécurisé à des tiers non autorisés ;
- respecter la réglementation applicable à son activité professionnelle (assurances, devis, facturation au Client, etc.).

### 6.1. Facturation Need's it → Professionnel

En V1, chaque mission validée via la saisie correcte du code mission génère une redevance fixe de 5 € TTC due par le Professionnel à Need's it.

Une facture récapitulative est émise mensuellement par Need's it.

Les sommes dues sont payables par virement bancaire dans un délai de trente (30) jours à compter de l'émission de la facture.

En cas de non-paiement, Need's it pourra suspendre ou supprimer le référencement du Professionnel jusqu'à régularisation de sa situation.

---

## Article 7 — Candidatures professionnelles

En V1, Need's it ne propose pas de formulaire public d'inscription professionnelle.

Les professionnels sont référencés manuellement par Need's it après prise de contact et validation de leur candidature par l'équipe administrative.

L'équipe Need's it peut notamment vérifier les informations d'identité, les coordonnées, le numéro SIREN, les catégories d'intervention et la zone géographique d'activité du professionnel avant son référencement.

Need's it se réserve le droit d'accepter ou de refuser toute candidature sans avoir à motiver sa décision.

---

## Article 8 — Données personnelles

Le traitement des données personnelles est décrit dans la **[Politique de confidentialité](./POLITIQUE_DE_CONFIDENTIALITE.md)**.

En utilisant le Service, le Client accepte que ses coordonnées soient transmises aux professionnels éligibles dans le cadre de la mise en relation.

L'adresse complète n'est transmise au professionnel retenu qu'**après confirmation de la mission** par code.

---

## Article 9 — Propriété intellectuelle

Le Service, son code, sa structure, ses textes, graphismes et logos sont protégés par le droit de la propriété intellectuelle.

Toute reproduction ou exploitation non autorisée est interdite.

Vigié Titouan, exploitant de TnV computer

Les contenus (textes, photos) fournis par les utilisateurs restent leur propriété. En déposant une demande, le Client accorde à Need's it une **licence non exclusive** permettant de transmettre ces contenus aux professionnels éligibles et de les stocker pour le fonctionnement du Service.

---

## Article 10 — Disponibilité et maintenance

Need's it s'efforce d'assurer la disponibilité du Service mais peut interrompre l'accès pour maintenance, mise à jour ou en cas de force majeure.

Need's it peut faire évoluer le Service (fonctionnalités, interface, processus) sans que cela n'ouvre droit à indemnisation, sous réserve des dispositions légales impératives.

---

## Article 11 — Responsabilité

### 11.1. Rôle d'intermédiaire

Need's it agit en qualité d'**intermédiaire technique de mise en relation**. La responsabilité de l'exécution de la prestation incombe au Professionnel et, le cas échéant, aux dispositions contractuelles entre le Client et le Professionnel.

### 11.2. Limites

Need's it ne saurait être tenue responsable notamment :

- de l'absence de professionnel disponible (statut `no_match`) ;
- de la qualité, du prix ou du délai d'intervention du Professionnel ;
- des dommages résultant d'un usage non conforme du Service ;
- des interruptions liées à des tiers (hébergeur, messagerie, réseau) ;
- de la perte de données imputable à un cas de force majeure, dans les limites autorisées par la loi.

### 11.3. Force majeure

Aucune partie ne sera responsable d'un manquement dû à un événement de force majeure au sens de la jurisprudence française.

---

## Article 12 — Suspension et résiliation

Need's it se réserve le droit de :

- **suspendre ou désactiver** un professionnel référencé en cas de manquement aux présentes CGU ;
- **refuser ou supprimer** une demande manifestement abusive ou illicite ;
- **restreindre l'accès** à tout utilisateur en cas de fraude ou d'atteinte au Service.
- Sauf urgence ou obligation légale, Need's it pourra informer préalablement le professionnel concerné avant toute suspension ou suppression définitive de son référencement.

---

## Article 13 — Réclamations et contact

Pour toute question ou réclamation relative au Service :

**TnV computer (entreprise individuelle)**  
28 avenue Émile Zola, 47500 Fumel

**[su0r44n@gmail.com](mailto:su0r44n@gmail.com)**

**Médiateur de la consommation :** [À COMPLÉTER : coordonnées du médiateur, si applicable]

---

## Article 14 — Modifications des CGU

En cas de modification substantielle des présentes CGU, les utilisateurs seront informés par publication sur le site et, pour les professionnels référencés, par courrier électronique.

---

## Article 15 — Droit applicable et litiges

Les présentes CGU sont soumises au droit français. En cas de litige, compétence est attribuée aux juridictions françaises compétentes, sous réserve des dispositions impératives applicables aux consommateurs.

---

## Article 16 — Documents annexes

Les documents suivants font partie intégrante du cadre juridique du Service :

- [Politique de confidentialité](./POLITIQUE_DE_CONFIDENTIALITE.md)
- [Mentions légales](./MENTIONS_LEGALES.md)

---

