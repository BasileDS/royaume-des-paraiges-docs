# Durees de conservation des donnees

Le principe de limitation de la conservation (article 5.1.e RGPD) impose de ne pas conserver les donnees au-dela de la duree necessaire aux finalites du traitement.

## Principes generaux

1. **Minimisation temporelle** : conserver uniquement le temps necessaire
2. **Archivage intermediaire** : donnees non utilisees mais conservees pour obligations legales
3. **Suppression definitive** : a l'issue de la duree de conservation

## Durees par categorie de donnees

### Donnees de compte utilisateur

| Donnee | Duree en base active | Archivage | Total | Justification |
|--------|---------------------|-----------|-------|---------------|
| Email | Relation client | +3 ans | Relation + 3 ans | Prescription civile |
| Nom, prenom | Relation client | +3 ans | Relation + 3 ans | Prescription civile |
| Telephone | Relation client | - | Relation | Pas d'obligation |
| Date de naissance | Relation client | +3 ans | Relation + 3 ans | Prescription civile |
| Avatar | Relation client | - | Relation | Suppression immediate |
| Username | Relation client | - | Relation | Suppression immediate |

### Donnees transactionnelles

| Donnee | Duree en base active | Archivage | Total | Justification |
|--------|---------------------|-----------|-------|---------------|
| Tickets (receipts) | 3 ans | +7 ans | 10 ans | Obligation comptable |
| Lignes de paiement | 3 ans | +7 ans | 10 ans | Obligation comptable |
| Gains (XP, cashback) | 3 ans | +7 ans | 10 ans | Obligation comptable |
| Depenses cashback | 3 ans | +7 ans | 10 ans | Obligation comptable |

### Donnees de fidelite

| Donnee | Duree en base active | Archivage | Total | Justification |
|--------|---------------------|-----------|-------|---------------|
| Coupons actifs | Jusqu'a utilisation/expiration | - | Variable | Execution contrat |
| Coupons utilises | 3 ans | +7 ans | 10 ans | Tracabilite comptable |
| Points XP | Relation client | +3 ans | Relation + 3 ans | Prescription |
| Badges | Relation client | - | Relation | Gamification |

### Donnees de preferences

| Donnee | Duree en base active | Archivage | Total | Justification |
|--------|---------------------|-----------|-------|---------------|
| Likes (bieres, news) | Jusqu'au retrait | - | Variable | Consentement |
| Progression quetes | Fin de la quete | - | Variable | Execution |

### Donnees de classement

| Donnee | Duree en base active | Archivage | Total | Justification |
|--------|---------------------|-----------|-------|---------------|
| Leaderboard hebdo | 1 semaine active + historique | - | 1 an | Interet legitime |
| Leaderboard mensuel | 1 mois actif + historique | - | 2 ans | Interet legitime |
| Leaderboard annuel | 1 an actif + historique | - | 3 ans | Interet legitime |

### Logs et traces techniques

| Donnee | Duree en base active | Archivage | Total | Justification |
|--------|---------------------|-----------|-------|---------------|
| Logs d'authentification | 6 mois | +6 mois | 1 an | Securite |
| Logs d'erreur | 3 mois | - | 3 mois | Debug |
| Distribution logs | 3 ans | +7 ans | 10 ans | Tracabilite |

---

## Cas particuliers

### Suppression de compte

Lorsqu'un utilisateur demande la suppression de son compte :

| Action | Delai | Donnees concernees |
|--------|-------|-------------------|
| Suppression immediate | J+0 | Avatar, preferences, likes |
| Anonymisation | J+0 | Donnees de classement |
| Archivage | J+0 | Donnees transactionnelles |
| Suppression complete | +10 ans | Donnees archivees |

### Inactivite prolongee

| Duree d'inactivite | Action |
|-------------------|--------|
| 2 ans | Email de reactivation |
| 3 ans | Notification avant suppression |
| 3 ans + 1 mois | Suppression du compte (si pas de reponse) |

---

## Implementation technique

### Actions a realiser

- [ ] Ajouter un champ `deleted_at` sur la table `profiles` (soft delete)
- [ ] Creer une procedure d'archivage automatique
- [ ] Mettre en place un job de purge des donnees expirees
- [ ] Documenter la procedure de suppression de compte

### Requetes SQL d'archivage (exemple)

```sql
-- Identifier les comptes inactifs depuis 3 ans
SELECT id, email, last_activity_at
FROM profiles
WHERE last_activity_at < NOW() - INTERVAL '3 years'
AND deleted_at IS NULL;

-- Anonymiser les donnees de classement
UPDATE leaderboard_entries
SET user_id = NULL, display_name = 'Utilisateur supprime'
WHERE user_id = 'uuid-du-compte-supprime';
```

---

## Tableau de synthese

| Categorie | Duree standard | Reference legale |
|-----------|----------------|------------------|
| Identite client | Relation + 3 ans | Prescription civile |
| Transactions | 10 ans | Code de commerce L123-22 |
| Preferences | Retrait consentement | RGPD art. 7.3 |
| Logs securite | 1 an | Recommandation CNIL |
| Analytics | 25 mois | Recommandation CNIL cookies |

---

**Derniere mise a jour** : 2026-01-23
