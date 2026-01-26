# Droits des utilisateurs

Le RGPD confere aux personnes concernees un ensemble de droits sur leurs donnees personnelles (articles 12 a 22).

## Liste des droits

| Droit | Article | Description | Delai de reponse |
|-------|---------|-------------|------------------|
| Information | 13-14 | Etre informe des traitements | Au moment de la collecte |
| Acces | 15 | Obtenir une copie de ses donnees | 1 mois |
| Rectification | 16 | Corriger des donnees inexactes | 1 mois |
| Effacement | 17 | Supprimer ses donnees | 1 mois |
| Limitation | 18 | Geler le traitement | 1 mois |
| Portabilite | 20 | Recevoir ses donnees dans un format structure | 1 mois |
| Opposition | 21 | S'opposer a un traitement | 1 mois |

---

## Droit d'information (articles 13-14)

### Informations obligatoires a fournir

- [ ] Identite du responsable de traitement
- [ ] Coordonnees du DPO (si designe)
- [ ] Finalites et bases legales des traitements
- [ ] Destinataires des donnees
- [ ] Transferts hors UE
- [ ] Durees de conservation
- [ ] Droits de la personne
- [ ] Droit de reclamation aupres de la CNIL

### Implementation

**Lieu** : Politique de confidentialite accessible dans l'application
**Format** : Langage clair et simple
**Moment** : Avant la collecte des donnees (inscription)

---

## Droit d'acces (article 15)

### Ce que l'utilisateur peut demander

1. Confirmation que ses donnees sont traitees
2. Copie de l'ensemble de ses donnees
3. Informations sur les traitements

### Procedure a implementer

```
1. L'utilisateur envoie une demande (email, formulaire)
2. Verification de l'identite du demandeur
3. Extraction des donnees (profil, transactions, coupons, etc.)
4. Envoi dans un delai de 1 mois
```

### Donnees a fournir

| Table | Donnees a extraire |
|-------|-------------------|
| profiles | Toutes les colonnes |
| receipts | Tous les tickets du client |
| coupons | Tous les coupons du client |
| gains | Tous les gains du client |
| spendings | Toutes les depenses du client |
| likes | Toutes les preferences |
| user_badges | Tous les badges |
| quest_progress | Toute la progression |

### Implementation technique

```sql
-- Exemple de requete d'extraction
SELECT
  p.*,
  (SELECT json_agg(r) FROM receipts r WHERE r.customer_id = p.id) as receipts,
  (SELECT json_agg(c) FROM coupons c WHERE c.customer_id = p.id) as coupons,
  (SELECT json_agg(l) FROM likes l WHERE l.user_id = p.id) as likes
FROM profiles p
WHERE p.id = 'user-uuid';
```

---

## Droit de rectification (article 16)

### Donnees rectifiables par l'utilisateur

Dans l'application (self-service) :
- Prenom, nom
- Telephone
- Avatar
- Username

### Donnees necessitant une demande

- Email (lie a l'authentification)
- Date de naissance

### Procedure

1. Modification directe dans l'app (si possible)
2. Ou demande au support
3. Mise a jour dans un delai de 1 mois

---

## Droit a l'effacement (article 17)

### Conditions d'application

L'effacement est possible si :
- Les donnees ne sont plus necessaires
- L'utilisateur retire son consentement
- L'utilisateur s'oppose au traitement
- Le traitement est illicite

### Exceptions

L'effacement peut etre refuse pour :
- Obligations legales (conservation comptable)
- Constatation/exercice de droits en justice

### Procedure de suppression de compte

```
1. Demande de l'utilisateur (dans l'app ou par email)
2. Confirmation de l'identite
3. Information sur les consequences
4. Suppression/anonymisation des donnees
   - Immediate : preferences, avatar, likes
   - Anonymisation : classements, badges
   - Archivage : transactions (10 ans)
5. Confirmation de la suppression
```

### Implementation technique

```sql
-- Soft delete du profil
UPDATE profiles
SET deleted_at = NOW(),
    email = 'deleted-' || id || '@deleted.local',
    first_name = NULL,
    last_name = NULL,
    phone = NULL,
    avatar_url = NULL
WHERE id = 'user-uuid';

-- Suppression des likes
DELETE FROM likes WHERE user_id = 'user-uuid';
```

---

## Droit a la portabilite (article 20)

### Applicable pour

- Donnees fournies par l'utilisateur
- Traitements fondes sur le consentement ou le contrat
- Traitements automatises

### Format de restitution

**Format** : JSON ou CSV
**Contenu** :
- Donnees de profil
- Historique des achats
- Coupons
- Preferences

### Exemple de fichier d'export

```json
{
  "export_date": "2026-01-23",
  "user": {
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "phone": "+33612345678",
    "birthdate": "1990-05-15",
    "created_at": "2025-06-01"
  },
  "receipts": [...],
  "coupons": [...],
  "likes": [...]
}
```

---

## Droit d'opposition (article 21)

### Applicable pour

- Traitements fondes sur l'interet legitime
- Prospection commerciale (opposition absolue)

### Traitements concernes

| Traitement | Opposition possible | Consequence |
|------------|--------------------|-|
| Classements | Oui | Retrait des leaderboards |
| Analytics | Oui | Exclusion des statistiques |
| Newsletters | Oui (absolu) | Desinscription immediate |

---

## Contact et procedures

### Canaux de demande

| Canal | Adresse | Delai de prise en charge |
|-------|---------|-------------------------|
| Email | *rgpd@domaine.com* | 48h |
| Formulaire in-app | *A implementer* | 48h |
| Courrier | *Adresse postale* | 1 semaine |

### Verification d'identite

Pour traiter une demande, verifier :
- Email de contact = email du compte
- Ou piece d'identite si demande par courrier

### Modele de reponse

```
Objet : Reponse a votre demande d'exercice de droits

Madame, Monsieur,

Nous avons bien recu votre demande de [droit exerce] en date du [date].

[Action realisee / Motif de refus]

Vous disposez d'un droit de reclamation aupres de la CNIL (www.cnil.fr).

Cordialement,
[Signature]
```

---

## Actions a implementer

### Priorite haute
- [ ] Rediger la politique de confidentialite
- [ ] Creer un formulaire de contact RGPD
- [ ] Implementer l'export des donnees (portabilite)
- [ ] Implementer la suppression de compte

### Priorite moyenne
- [ ] Automatiser les extractions de donnees
- [ ] Mettre en place le suivi des demandes
- [ ] Former le support aux procedures RGPD

---

**Derniere mise a jour** : 2026-01-23
