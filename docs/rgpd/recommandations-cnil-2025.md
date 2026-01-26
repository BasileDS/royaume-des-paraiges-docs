# Recommandations CNIL 2025 - Applications mobiles

La CNIL a publie des recommandations specifiques pour les applications mobiles (mise a jour avril 2025) et mene une campagne de controles depuis le printemps 2025.

## Contexte

- **Publication initiale** : 24 septembre 2024
- **Mise a jour** : 8 avril 2025
- **Controles** : Campagne active depuis printemps 2025
- **Cibles** : Editeurs d'applications, developpeurs, fournisseurs de SDK

## Acteurs concernes

| Acteur | Responsabilites |
|--------|----------------|
| **Editeur d'application** | Responsable de traitement principal |
| **Developpeur** | Mise en oeuvre technique conforme |
| **Fournisseur de SDK** | Co-responsable ou sous-traitant |
| **Fournisseur d'OS** | Systemes de permissions |
| **Store (App Store, Play Store)** | Verification des declarations |

## Obligations cles

### 1. Information de l'utilisateur

**Exigences** :
- Information claire, accessible, comprehensible
- Presentee au moment opportun (avant la collecte)
- Explication des permissions demandees

**Application a Royaume des Paraiges** :
- [ ] Rediger une politique de confidentialite claire
- [ ] Afficher les informations avant inscription
- [ ] Expliquer pourquoi chaque permission est necessaire

---

### 2. Consentement

**Principes CNIL** :
> "Le consentement doit etre eclaire et n'est pas contraint"

**Exigences** :
- Consentement prealable a toute collecte
- Possibilite de refuser aussi facilement qu'accepter
- Retrait du consentement simplifie
- Distinction entre permissions techniques et finalites

**Application a Royaume des Paraiges** :
- [ ] Implementer un ecran de consentement au premier lancement
- [ ] Permettre de refuser sans bloquer l'utilisation de base
- [ ] Proposer un acces facile aux parametres de consentement

---

### 3. Permissions et acces aux donnees

**Donnees a sensibilite elevee** :
- Geolocalisation en temps reel
- Photographies / camera
- Microphone
- Carnet de contacts
- Donnees de sante

**Principe de minimisation** :
- Ne demander que les permissions strictement necessaires
- Justifier chaque permission dans l'application

**Application a Royaume des Paraiges** :

| Permission | Utilisee | Justification | Obligatoire |
|------------|----------|---------------|-------------|
| Camera | Oui (avatar) | Photo de profil | Non |
| Stockage | Oui | Sauvegarde images | Non |
| Notifications | Oui | Alertes fidelite | Non |
| Geolocalisation | Non | - | - |
| Contacts | Non | - | - |

---

### 4. SDK et traceurs

**Points de controle CNIL** :
- Configuration des SDK integres
- Acces aux donnees via les permissions
- Transferts de donnees vers les SDK tiers

**Bonnes pratiques** :
- Auditer les SDK utilises et leurs finalites
- Verifier la conformite RGPD des SDK
- Minimiser le nombre de SDK integres
- Documenter les donnees transmises

**Application a Royaume des Paraiges** :
- [ ] Lister tous les SDK utilises
- [ ] Verifier leur conformite RGPD
- [ ] Documenter les donnees partagees

---

### 5. Privacy by design / Privacy by default

**Privacy by design** :
- Integrer la protection des donnees des la conception
- Evaluer l'impact sur la vie privee avant developpement

**Privacy by default** :
- Parametres les plus protecteurs par defaut
- L'utilisateur doit activer le partage, pas le desactiver

**Application a Royaume des Paraiges** :
- [ ] Revoir les parametres par defaut
- [ ] Desactiver le partage optionnel par defaut
- [ ] Documenter les choix de conception

---

## Points de controle CNIL

La CNIL verifiera notamment :

| Point de controle | Statut actuel | Action requise |
|-------------------|---------------|----------------|
| Information utilisateur | Non conforme | Rediger politique |
| Recueil consentement | Non conforme | Implementer bandeau |
| Gestion permissions | Partiel | Documenter |
| Configuration SDK | A verifier | Audit SDK |
| Exercice des droits | Non conforme | Implementer procedures |
| Durees de conservation | Non defini | Definir et appliquer |
| Securite des donnees | Partiel | Renforcer |

---

## Plan de mise en conformite

### Phase 1 : Documentation (prioritaire)

1. Finaliser le registre des traitements
2. Rediger la politique de confidentialite
3. Documenter les SDK utilises

### Phase 2 : Implementation technique

1. Implementer l'ecran de consentement
2. Ajouter l'acces aux parametres de confidentialite
3. Creer les fonctions d'export/suppression

### Phase 3 : Procedures

1. Mettre en place le traitement des demandes
2. Former l'equipe support
3. Tester les procedures

### Phase 4 : Audit

1. Revue interne de conformite
2. Tests des fonctionnalites RGPD
3. Audit externe si necessaire

---

## Sanctions encourues

| Type | Montant maximum |
|------|-----------------|
| Avertissement | - |
| Mise en demeure | - |
| Amende administrative | 20 M EUR ou 4% CA mondial |
| Publication de la sanction | Atteinte a l'image |

**Exemples de sanctions CNIL (applications mobiles)** :
- Non-conformite consentement
- Defaut d'information
- Collecte excessive de donnees
- Securite insuffisante

---

## Ressources officielles

- [Recommandations CNIL applications mobiles](https://www.cnil.fr/fr/recommandations-applications-mobiles)
- [Guide pratique pour les professionnels](https://www.cnil.fr/fr/smartphones-et-applications-professionnels)
- [Controles CNIL 2025](https://www.cnil.fr/fr/les-controles-de-la-cnil-en-2025)
- [Guide RGPD du developpeur](https://www.cnil.fr/fr/guide-rgpd-du-developpeur)
- [Modeles de mentions d'information](https://www.cnil.fr/fr/modeles/mention)

---

**Derniere mise a jour** : 2026-01-23
