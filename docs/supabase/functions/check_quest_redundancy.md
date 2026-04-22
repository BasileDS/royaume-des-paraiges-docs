# check_quest_redundancy

Fonction core de détection des quêtes redondantes. Introduite par la migration 021 (avril 2026) dans le cadre du plan de prévention des quêtes redondantes (PR#2).

## Signature

```sql
check_quest_redundancy(p_quest_id BIGINT)
RETURNS TABLE (
  conflict_quest_id   BIGINT,
  conflict_quest_name TEXT,
  conflict_kind       TEXT
)
```

**Volatilité** : `STABLE` (lecture seule, pas de side-effect).

## Comportement

Retourne la liste des quêtes actives en conflit de **signature fonctionnelle** avec la quête `p_quest_id`, en tenant compte du scoping M2M via `quests_establishments`.

Si `p_quest_id` n'est pas actif (`is_active = false`) ou n'existe pas : retourne vide.

### Signature fonctionnelle

Deux quêtes partagent la même signature si :

```
q1.quest_type      = q2.quest_type
q1.period_type     = q2.period_type
q1.consumption_type IS NOT DISTINCT FROM q2.consumption_type  -- NULL = NULL
```

### Règle de conflit (couplée au scoping établissement)

| Cas | Conflit ? | `conflict_kind` |
|---|---|---|
| A globale + B globale | Oui | `both_global` |
| A globale + B locale (ou inverse) | Oui | `global_vs_local` |
| A locale + B locale, ≥ 1 établissement en commun | Oui | `locals_overlap` |
| A locale + B locale, établissements disjoints | Non | — |

« Globale » = aucune entrée dans `quests_establishments` pour cette quête.

## Utilisation

### Appel direct (debug, dashboard)

```sql
-- Conflits pour la quête 42
SELECT * FROM check_quest_redundancy(42);

-- Audit : paires redondantes dans toute la BDD active
SELECT q.id, q.name, c.*
FROM quests q
CROSS JOIN LATERAL check_quest_redundancy(q.id) c
WHERE q.is_active = true
  AND q.id < c.conflict_quest_id; -- évite doublons A↔B
```

### Trigger

Utilisée en interne par 3 trigger functions :

| Trigger function | Table déclenchante |
|---|---|
| `enforce_quest_redundancy_on_quests` | `quests` (AFTER INSERT/UPDATE) |
| `enforce_quest_redundancy_on_qe_insert` | `quests_establishments` (AFTER INSERT) |
| `enforce_quest_redundancy_on_qe_delete` | `quests_establishments` (AFTER DELETE) |

Les triggers appellent `check_quest_redundancy` et, si conflit, lèvent `RAISE EXCEPTION USING ERRCODE = 'P0421'` avec un DETAIL JSON structuré.

## Cas pris en charge

### Désactivation

Désactiver une quête active (`UPDATE quests SET is_active = false`) : aucun check, toujours autorisé.

### Bascule locale → globale via DELETE

Retirer le dernier lien d'une quête locale active la rend globale. Le trigger `AFTER DELETE` sur `quests_establishments` appelle `check_quest_redundancy(OLD.quest_id)` — si la quête est toujours active et devient globale, tout conflit avec d'autres quêtes actives de même signature sera détecté.

### Bascule globale → locale via INSERT

Ajouter un premier lien à une quête globale active la rend locale. Le trigger `AFTER INSERT` sur `quests_establishments` vérifie que le nouveau scope n'entre pas en conflit avec d'autres quêtes locales actives de même signature.

## Performance

- Fonction `STABLE` : le planner peut cacher le résultat dans une même requête.
- Index utilisés : PK de `quests`, PK composite de `quests_establishments`, `idx_quests_establishments_establishment`.
- Complexité attendue : O(n × m) où n = nb de quêtes actives de même signature, m = nb d'établissements dans le scope. Négligeable vu les volumes (< 100 quêtes actives attendues).

## Limitations connues

- **Isolation concurrente** : deux transactions concurrentes qui activent simultanément des quêtes de même signature peuvent passer le check côté chacune et créer une redondance. En pratique, les mutations de quêtes sont rares et admin-only (un seul utilisateur à la fois). Si besoin, ajouter un advisory lock sur la signature dans les trigger functions.
- **Pre-existing data** : la migration 021 n'audit pas l'état existant — si des quêtes redondantes sont en BDD au moment de l'activation, les triggers ne les purgent pas rétroactivement. Vérification manuelle faite avant migration : 0 redondance au 22/04/2026.
