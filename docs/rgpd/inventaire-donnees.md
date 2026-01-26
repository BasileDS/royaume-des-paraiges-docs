# Inventaire des donnees personnelles

Ce document recense l'ensemble des donnees personnelles collectees par l'application Royaume des Paraiges.

## Definition

Une **donnee personnelle** est toute information se rapportant a une personne physique identifiee ou identifiable (article 4 RGPD).

## Cartographie par table

### 1. Table `profiles` - Donnees d'identite

| Colonne | Type | Donnee personnelle | Sensibilite | Description |
|---------|------|-------------------|-------------|-------------|
| `id` | UUID | Oui | Faible | Identifiant unique (lie a auth.users) |
| `email` | TEXT | Oui | Moyenne | Adresse email de l'utilisateur |
| `first_name` | TEXT | Oui | Faible | Prenom |
| `last_name` | TEXT | Oui | Faible | Nom de famille |
| `username` | TEXT | Oui | Faible | Pseudonyme choisi |
| `phone` | TEXT | Oui | Moyenne | Numero de telephone |
| `birthdate` | DATE | Oui | Moyenne | Date de naissance |
| `avatar_url` | TEXT | Oui | Faible | Photo de profil |
| `created_at` | TIMESTAMP | Oui | Faible | Date d'inscription |
| `role` | ENUM | Non | - | Role applicatif |
| `xp_coefficient` | INTEGER | Non | - | Parametre de jeu |
| `cashback_coefficient` | INTEGER | Non | - | Parametre de jeu |
| `attached_establishment_id` | INTEGER | Non | - | Liaison etablissement |

**Finalite** : Gestion des comptes utilisateurs et personnalisation de l'experience.

---

### 2. Table `receipts` - Historique d'achats

| Colonne | Type | Donnee personnelle | Sensibilite | Description |
|---------|------|-------------------|-------------|-------------|
| `customer_id` | UUID | Oui | Moyenne | Lien vers le profil client |
| `amount` | INTEGER | Oui | Moyenne | Montant de l'achat (centimes) |
| `establishment_id` | INTEGER | Indirecte | Faible | Lieu de l'achat |
| `created_at` | TIMESTAMP | Oui | Faible | Date et heure de l'achat |

**Finalite** : Suivi des achats pour attribution de points de fidelite et cashback.

---

### 3. Table `receipt_lines` - Details des paiements

| Colonne | Type | Donnee personnelle | Sensibilite | Description |
|---------|------|-------------------|-------------|-------------|
| `receipt_id` | BIGINT | Indirecte | Moyenne | Lien vers le ticket |
| `amount` | INTEGER | Indirecte | Moyenne | Montant de la ligne |
| `payment_method` | TEXT | Oui | Moyenne | Moyen de paiement utilise |

**Finalite** : Tracabilite des modes de paiement pour le programme de fidelite.

---

### 4. Table `coupons` - Coupons de reduction

| Colonne | Type | Donnee personnelle | Sensibilite | Description |
|---------|------|-------------------|-------------|-------------|
| `customer_id` | UUID | Oui | Faible | Beneficiaire du coupon |
| `amount` | INTEGER | Non | - | Valeur du coupon |
| `used` | BOOLEAN | Indirecte | Faible | Statut d'utilisation |
| `expires_at` | TIMESTAMP | Non | - | Date d'expiration |
| `distribution_type` | VARCHAR | Non | - | Origine du coupon |

**Finalite** : Gestion des avantages fidelite.

---

### 5. Table `gains` - Gains XP et cashback

| Colonne | Type | Donnee personnelle | Sensibilite | Description |
|---------|------|-------------------|-------------|-------------|
| `receipt_id` | BIGINT | Indirecte | Faible | Lien vers l'achat |
| `xp` | INTEGER | Indirecte | Faible | Points d'experience gagnes |
| `cashback_money` | INTEGER | Indirecte | Faible | Cashback gagne |

**Finalite** : Calcul et attribution des recompenses.

---

### 6. Table `spendings` - Utilisation du cashback

| Colonne | Type | Donnee personnelle | Sensibilite | Description |
|---------|------|-------------------|-------------|-------------|
| `customer_id` | UUID | Oui | Faible | Utilisateur |
| `amount` | INTEGER | Oui | Faible | Montant depense |
| `establishment_id` | INTEGER | Indirecte | Faible | Lieu d'utilisation |

**Finalite** : Suivi de l'utilisation des avantages.

---

### 7. Table `likes` - Preferences utilisateur

| Colonne | Type | Donnee personnelle | Sensibilite | Description |
|---------|------|-------------------|-------------|-------------|
| `user_id` | UUID | Oui | Faible | Utilisateur |
| `beer_id` | INTEGER | Indirecte | Faible | Biere aimee |
| `news_id` | INTEGER | Indirecte | Faible | Actualite aimee |

**Finalite** : Personnalisation des recommandations.

---

### 8. Table `user_badges` - Badges obtenus

| Colonne | Type | Donnee personnelle | Sensibilite | Description |
|---------|------|-------------------|-------------|-------------|
| `user_id` | UUID | Oui | Faible | Utilisateur |
| `badge_type_id` | BIGINT | Non | - | Type de badge |
| `earned_at` | TIMESTAMP | Indirecte | Faible | Date d'obtention |

**Finalite** : Gamification et recompenses.

---

### 9. Table `quest_progress` / `quest_completion_logs` - Progression quetes

| Colonne | Type | Donnee personnelle | Sensibilite | Description |
|---------|------|-------------------|-------------|-------------|
| `user_id` | UUID | Oui | Faible | Utilisateur |
| `progress` | INTEGER | Indirecte | Faible | Avancement |

**Finalite** : Suivi des defis et recompenses.

---

## Donnees sensibles (Article 9 RGPD)

L'application ne collecte **pas** de donnees sensibles au sens de l'article 9 :
- Pas de donnees de sante
- Pas de donnees biometriques
- Pas d'opinions politiques/religieuses
- Pas de donnees sur l'orientation sexuelle

## Donnees de mineurs

- La date de naissance est collectee
- **Action requise** : Verifier l'age minimum requis et implementer un controle

## Geolocalisation

- **Non collectee actuellement** via l'application
- L'etablissement visite est enregistre (geolocalisation indirecte)

## Synthese des volumes

| Table | Donnees personnelles | Volume actuel |
|-------|---------------------|---------------|
| profiles | Directes | ~18 utilisateurs |
| receipts | Directes | ~42 tickets |
| coupons | Directes | ~4 coupons |
| gains | Indirectes | ~42 gains |
| spendings | Directes | Variable |
| likes | Directes | 0 |

---

**Derniere mise a jour** : 2026-01-23
