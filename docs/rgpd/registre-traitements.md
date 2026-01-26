# Registre des traitements

Le registre des traitements est une obligation pour tout organisme traitant des donnees personnelles (article 30 RGPD).

## Traitement 1 : Gestion des comptes utilisateurs

| Element | Description |
|---------|-------------|
| **Nom du traitement** | Gestion des comptes utilisateurs |
| **Responsable** | *A completer* |
| **Finalite** | Creation et gestion des comptes clients pour le programme de fidelite |
| **Base legale** | Execution du contrat (article 6.1.b RGPD) |
| **Categories de personnes** | Clients de l'application |
| **Categories de donnees** | Identite (nom, prenom, email), coordonnees (telephone), date de naissance |
| **Destinataires** | Personnel habilite, Supabase (hebergeur) |
| **Transferts hors UE** | Oui - Supabase (AWS eu-west-1) - Clauses contractuelles types |
| **Duree de conservation** | Duree de la relation + 3 ans |
| **Mesures de securite** | Authentification, RLS, chiffrement |

---

## Traitement 2 : Programme de fidelite

| Element | Description |
|---------|-------------|
| **Nom du traitement** | Gestion du programme de fidelite et cashback |
| **Responsable** | *A completer* |
| **Finalite** | Attribution et gestion des points XP, cashback et coupons |
| **Base legale** | Execution du contrat (article 6.1.b RGPD) |
| **Categories de personnes** | Clients participants au programme |
| **Categories de donnees** | Historique d'achats, montants, points accumules, coupons |
| **Destinataires** | Personnel habilite, etablissements partenaires |
| **Transferts hors UE** | Oui - Supabase |
| **Duree de conservation** | Duree de la relation + 3 ans (comptabilite) |
| **Mesures de securite** | RLS, journalisation |

---

## Traitement 3 : Historique des transactions

| Element | Description |
|---------|-------------|
| **Nom du traitement** | Enregistrement des achats (receipts) |
| **Responsable** | *A completer* |
| **Finalite** | Tracabilite des achats pour calcul des avantages fidelite |
| **Base legale** | Execution du contrat + Obligation legale (comptabilite) |
| **Categories de personnes** | Clients ayant effectue des achats |
| **Categories de donnees** | Montants, dates, etablissements, moyens de paiement |
| **Destinataires** | Personnel habilite, etablissements |
| **Transferts hors UE** | Oui - Supabase |
| **Duree de conservation** | 10 ans (obligation comptable) |
| **Mesures de securite** | RLS, logs |

---

## Traitement 4 : Classements et gamification

| Element | Description |
|---------|-------------|
| **Nom du traitement** | Leaderboards et systeme de badges |
| **Responsable** | *A completer* |
| **Finalite** | Classement des utilisateurs et attribution de recompenses |
| **Base legale** | Interet legitime (article 6.1.f RGPD) |
| **Categories de personnes** | Tous les utilisateurs actifs |
| **Categories de donnees** | XP, rang, badges obtenus |
| **Destinataires** | Tous les utilisateurs (classements publics) |
| **Transferts hors UE** | Oui - Supabase |
| **Duree de conservation** | Duree de la relation |
| **Mesures de securite** | Donnees anonymisees/pseudonymisees dans les classements |

---

## Traitement 5 : Preferences utilisateur

| Element | Description |
|---------|-------------|
| **Nom du traitement** | Gestion des likes et preferences |
| **Responsable** | *A completer* |
| **Finalite** | Personnalisation de l'experience utilisateur |
| **Base legale** | Consentement (article 6.1.a RGPD) |
| **Categories de personnes** | Utilisateurs ayant exprime des preferences |
| **Categories de donnees** | Bieres aimees, actualites aimees |
| **Destinataires** | Personnel habilite |
| **Transferts hors UE** | Oui - Supabase |
| **Duree de conservation** | Jusqu'au retrait du consentement |
| **Mesures de securite** | RLS |

---

## Traitement 6 : Statistiques et analytics

| Element | Description |
|---------|-------------|
| **Nom du traitement** | Analyse des usages et statistiques |
| **Responsable** | *A completer* |
| **Finalite** | Amelioration du service et reporting |
| **Base legale** | Interet legitime (article 6.1.f RGPD) |
| **Categories de personnes** | Tous les utilisateurs |
| **Categories de donnees** | Donnees d'usage agregees et anonymisees |
| **Destinataires** | Personnel habilite |
| **Transferts hors UE** | Oui - Supabase |
| **Duree de conservation** | 25 mois (analytics) |
| **Mesures de securite** | Anonymisation, agregation |

---

## Resume des bases legales

| Traitement | Base legale | Justification |
|------------|-------------|---------------|
| Comptes utilisateurs | Contrat | Necessaire a la fourniture du service |
| Programme fidelite | Contrat | Objet du service |
| Transactions | Contrat + Obligation legale | Comptabilite |
| Classements | Interet legitime | Gamification du service |
| Preferences | Consentement | Fonctionnalite optionnelle |
| Analytics | Interet legitime | Amelioration du service |

---

**Derniere mise a jour** : 2026-01-23
