# Table: quests_establishments

## Description

Table de liaison Many-to-Many entre quêtes et établissements. Permet de scoper une quête à un sous-ensemble d'établissements (« quête locale »).

**Sémantique** :
- **Aucune entrée** pour une quête donnée = **quête globale** (applicable dans tous les établissements).
- **≥ 1 entrée** = **quête locale** (restreinte aux établissements listés).

Introduite par la migration 020 (avril 2026) dans le cadre du plan de prévention des quêtes redondantes (PR#1). Les PR suivantes s'appuient sur cette table :
- **PR#2** : triggers de détection de redondance signature-équivalente (même `quest_type` + `period_type` + `consumption_type`) avec intersection d'établissements.
- **PR#3** : picker M2M dans le form création/édition de quête côté admin.

## Schema

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `quest_id` | bigint | Non | - | FK vers `quests(id)`, ON DELETE CASCADE |
| `establishment_id` | integer | Non | - | FK vers `establishments(id)`, ON DELETE CASCADE |
| `created_at` | timestamptz | Non | now() | Date d'ajout de l'établissement à la quête |

## Clé primaire

- Composite : `(quest_id, establishment_id)`

## Index

- `idx_quests_establishments_establishment` sur `establishment_id` — accélère la requête inverse (quelles quêtes sont actives pour cet établissement).

## Relations

### Foreign Keys sortantes

| Colonne | Référence | ON DELETE |
|---------|-----------|-----------|
| `quest_id` | `quests.id` | CASCADE |
| `establishment_id` | `establishments.id` | CASCADE |

## RLS

RLS active : **Oui**

| Policy | Action | Condition |
|---|---|---|
| `Authenticated users can view quest-establishment links` | SELECT | tout authentifié |
| `Admins can manage quest-establishment links` | ALL | `profiles.role = 'admin'` |

## Règle de redondance (active depuis PR#2 / migration 021)

Deux quêtes sont considérées redondantes si elles partagent la même signature fonctionnelle `(quest_type, period_type, consumption_type)` **ET** au moins un établissement en commun — ou si l'une est globale et l'autre locale (la globale couvre la locale).

Cas :

| Quête A | Quête B | Redondante ? | `conflict_kind` |
|---|---|---|---|
| globale | globale | Oui | `both_global` |
| locale {1,2} | locale {2,3} | Oui (partage établissement 2) | `locals_overlap` |
| locale {1} | locale {2} | Non | — |
| globale | locale {1} | Oui | `global_vs_local` |

**Enforcement** : 3 triggers PL/pgSQL (`trg_quests_enforce_redundancy`, `trg_qe_enforce_redundancy_insert`, `trg_qe_enforce_redundancy_delete`) bloquent toute mutation (INSERT/UPDATE de `quests`, INSERT/DELETE de `quests_establishments`) qui créerait une redondance. Voir [`check_quest_redundancy`](../functions/check_quest_redundancy.md) pour la fonction core et le format `DETAIL` JSON de l'exception `P0421`.

## Exemples de requêtes

```sql
-- Quêtes actives pour l'établissement 3 (locales + globales)
SELECT q.*
FROM quests q
LEFT JOIN quests_establishments qe ON qe.quest_id = q.id
WHERE q.is_active = true
  AND (qe.establishment_id = 3 OR NOT EXISTS (
    SELECT 1 FROM quests_establishments WHERE quest_id = q.id
  ));

-- Scoper une quête existante à 2 établissements
INSERT INTO quests_establishments (quest_id, establishment_id)
VALUES (42, 1), (42, 2);

-- Rendre une quête globale (supprimer tous les liens)
DELETE FROM quests_establishments WHERE quest_id = 42;
```

## Statistiques

- Lignes : **0** (post-migration 020 — toutes les quêtes existantes restent globales par défaut)
