# Sous-traitants et transferts de donnees

Le RGPD encadre strictement le recours aux sous-traitants (article 28) et les transferts de donnees hors UE (chapitre V).

## Definition

Un **sous-traitant** est une entite qui traite des donnees personnelles pour le compte du responsable de traitement.

## Liste des sous-traitants

### 1. Supabase Inc.

| Information | Detail |
|-------------|--------|
| **Raison sociale** | Supabase Inc. |
| **Siege social** | San Francisco, USA |
| **Service fourni** | Backend-as-a-Service (BDD, Auth, Storage) |
| **Donnees traitees** | Toutes les donnees de l'application |
| **Localisation des donnees** | AWS eu-west-1 (Irlande, UE) |
| **Garanties transfert** | Clauses Contractuelles Types (CCT) |
| **Certifications** | SOC 2 Type II |
| **DPA** | [Data Processing Agreement](https://supabase.com/legal/dpa) |
| **Politique confidentialite** | [Privacy Policy](https://supabase.com/legal/privacy) |

**Sous-traitants ulterieurs de Supabase** :
- Amazon Web Services (AWS) - Hebergement
- Cloudflare - CDN et protection DDoS

---

### 2. Vercel (si applicable)

| Information | Detail |
|-------------|--------|
| **Raison sociale** | Vercel Inc. |
| **Siege social** | San Francisco, USA |
| **Service fourni** | Hebergement frontend (admin) |
| **Donnees traitees** | Logs de connexion, cookies de session |
| **Localisation des donnees** | Edge global, donnees UE en UE |
| **Garanties transfert** | Clauses Contractuelles Types (CCT) |
| **DPA** | [Data Processing Addendum](https://vercel.com/legal/dpa) |

---

### 3. Expo / EAS (si applicable)

| Information | Detail |
|-------------|--------|
| **Raison sociale** | Expo |
| **Service fourni** | Build et distribution de l'app mobile |
| **Donnees traitees** | Metriques de build (pas de donnees utilisateurs) |
| **Garanties transfert** | Clauses Contractuelles Types |

---

## Transferts hors Union Europeenne

### Cartographie des transferts

| Destinataire | Pays | Donnees | Mecanisme de transfert |
|--------------|------|---------|----------------------|
| Supabase | USA | Toutes | CCT + hebergement UE |
| AWS (via Supabase) | Irlande (UE) | Toutes | Pas de transfert hors UE |
| Vercel | USA | Logs | CCT |

### Mecanismes de protection

1. **Clauses Contractuelles Types (CCT)** : Contrats standards approuves par la Commission Europeenne
2. **Hebergement en UE** : Les donnees restent physiquement en Europe (AWS eu-west-1)
3. **Chiffrement** : Donnees chiffrees en transit et au repos

---

## Obligations contractuelles

### Clauses obligatoires (article 28.3 RGPD)

Chaque contrat de sous-traitance doit inclure :

- [ ] Objet et duree du traitement
- [ ] Nature et finalite du traitement
- [ ] Types de donnees traitees
- [ ] Categories de personnes concernees
- [ ] Obligations et droits du responsable
- [ ] Instructions documentees
- [ ] Confidentialite du personnel
- [ ] Mesures de securite (article 32)
- [ ] Conditions de sous-traitance ulterieure
- [ ] Assistance pour les droits des personnes
- [ ] Assistance pour les obligations de securite
- [ ] Suppression ou restitution des donnees
- [ ] Audits et inspections

### Verification des DPA

| Sous-traitant | DPA signe | Derniere verification | Conforme |
|---------------|-----------|----------------------|----------|
| Supabase | Oui (CGU) | 2026-01-23 | Oui |
| Vercel | Oui (CGU) | *A verifier* | *A verifier* |

---

## Registre des sous-traitants

| Sous-traitant | Date debut | Donnees | Contact DPO |
|---------------|------------|---------|-------------|
| Supabase | 2025 | Toutes | privacy@supabase.io |
| Vercel | 2025 | Logs | privacy@vercel.com |

---

## Actions a realiser

### Priorite haute

- [ ] Verifier la signature des DPA avec chaque sous-traitant
- [ ] S'assurer que les donnees sont hebergees en UE
- [ ] Documenter les garanties de transfert

### Priorite moyenne

- [ ] Mettre en place une revue annuelle des sous-traitants
- [ ] Verifier les certifications de securite
- [ ] Evaluer les nouveaux sous-traitants avant integration

---

## Information des utilisateurs

La politique de confidentialite doit informer les utilisateurs :

1. De l'existence de sous-traitants
2. Des categories de sous-traitants (hebergement, analytics, etc.)
3. Des transferts hors UE et des garanties
4. De leur droit d'obtenir la liste des sous-traitants

**Exemple de formulation** :

> Vos donnees sont hebergees par Supabase sur des serveurs situes en Union Europeenne (Irlande).
> Supabase est soumis aux Clauses Contractuelles Types approuvees par la Commission Europeenne
> pour garantir un niveau de protection adequat de vos donnees.

---

**Derniere mise a jour** : 2026-01-23
