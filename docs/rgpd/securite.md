# Mesures de securite

Le RGPD impose de mettre en oeuvre des mesures techniques et organisationnelles appropriees pour garantir la securite des donnees (article 32).

## Mesures actuellement en place

### Authentification et controle d'acces

| Mesure | Statut | Description |
|--------|--------|-------------|
| Authentification Supabase Auth | Actif | Gestion des identites |
| Mots de passe hashes | Actif | bcrypt via Supabase Auth |
| Row Level Security (RLS) | Actif | Politiques d'acces par ligne |
| Roles utilisateurs | Actif | client, employee, establishment, admin |

### Chiffrement

| Mesure | Statut | Description |
|--------|--------|-------------|
| HTTPS/TLS | Actif | Chiffrement en transit |
| Chiffrement au repos | Actif | AES-256 (Supabase/AWS) |
| Chiffrement BDD | Actif | PostgreSQL encryption |

### Infrastructure

| Mesure | Statut | Description |
|--------|--------|-------------|
| Hebergement AWS | Actif | Region eu-west-1 (Irlande) |
| Sauvegardes automatiques | Actif | Daily backups Supabase |
| Isolation des environnements | Partiel | Prod/Dev a separer |

---

## Mesures a implementer

### Priorite haute

| Mesure | Statut | Action requise |
|--------|--------|----------------|
| Journalisation des acces | A faire | Activer les logs d'audit |
| Politique de mots de passe | A renforcer | Longueur min, complexite |
| Double authentification (2FA) | A faire | Pour les admins |
| Revue des politiques RLS | A faire | Audit de securite |

### Priorite moyenne

| Mesure | Statut | Action requise |
|--------|--------|----------------|
| Tests de penetration | A faire | Audit externe |
| Gestion des vulnerabilites | A faire | Scan regulier des dependances |
| Plan de continuite | A faire | Documentation PCA/PRA |
| Formation securite | A faire | Sensibilisation equipe |

---

## Politiques RLS existantes

### Table `profiles`

```sql
-- Les utilisateurs ne peuvent voir que leur propre profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (is_admin());
```

### Table `receipts`

```sql
-- Les clients voient leurs propres tickets
CREATE POLICY "Customers view own receipts"
ON receipts FOR SELECT
USING (auth.uid() = customer_id);
```

### Table `coupons`

```sql
-- Les clients voient leurs propres coupons
CREATE POLICY "Customers view own coupons"
ON coupons FOR SELECT
USING (auth.uid() = customer_id);
```

---

## Gestion des incidents

### Classification des incidents

| Niveau | Description | Exemple | Delai notification CNIL |
|--------|-------------|---------|------------------------|
| Critique | Fuite massive de donnees | BDD exposee | 72h |
| Majeur | Acces non autorise | Compte admin compromis | 72h |
| Mineur | Erreur de configuration | RLS mal configuree | A evaluer |
| Negligeable | Tentative echouee | Attaque bloquee | Non requis |

### Procedure en cas d'incident

```
1. Detection et qualification
   - Identifier la nature de l'incident
   - Evaluer l'impact sur les donnees

2. Containment
   - Isoler les systemes affectes
   - Bloquer les acces compromis

3. Investigation
   - Analyser les logs
   - Identifier la cause racine

4. Notification (si necessaire)
   - CNIL sous 72h si risque pour les personnes
   - Personnes concernees si risque eleve

5. Remediation
   - Corriger la vulnerabilite
   - Renforcer les controles

6. Documentation
   - Rapport d'incident
   - Mise a jour des procedures
```

### Registre des violations

| Date | Description | Impact | Notification CNIL | Actions |
|------|-------------|--------|-------------------|---------|
| - | Aucun incident a ce jour | - | - | - |

---

## Audits et controles

### Audits internes

| Type | Frequence | Responsable |
|------|-----------|-------------|
| Revue des acces | Mensuel | *A designer* |
| Verification RLS | Trimestriel | Developpeur |
| Mise a jour dependencies | Mensuel | Developpeur |

### Audits externes

| Type | Frequence | Dernier audit |
|------|-----------|---------------|
| Pentest | Annuel | *Non realise* |
| Audit RGPD | Annuel | *Non realise* |

---

## Sous-traitants et securite

Voir [Sous-traitants](./sous-traitants.md) pour les mesures de securite des prestataires.

---

## Checklist de securite

### Developpement

- [x] Utilisation de requetes parametrees (protection injection SQL)
- [x] Validation des entrees cote serveur
- [x] RLS active sur toutes les tables sensibles
- [ ] Scan de vulnerabilites des dependances
- [ ] Revue de code securite

### Infrastructure

- [x] HTTPS obligatoire
- [x] Chiffrement au repos
- [ ] WAF (Web Application Firewall)
- [ ] Monitoring des anomalies
- [ ] Alertes de securite

### Organisationnel

- [ ] Politique de securite documentee
- [ ] Gestion des habilitations
- [ ] Procedure de depart (revocation acces)
- [ ] Formation securite equipe

---

**Derniere mise a jour** : 2026-01-23
