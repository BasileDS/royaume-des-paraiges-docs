# Triggers

## Liste des triggers (4)

| Trigger | Table | Événement | Fonction |
|---------|-------|-----------|----------|
| `trigger_create_spending_on_cashback` | `receipt_lines` | AFTER INSERT | `create_spending_from_cashback_payment` |
| `trg_quests_enforce_redundancy` | `quests` | AFTER INSERT/UPDATE (is_active, quest_type, period_type, consumption_type) | `enforce_quest_redundancy_on_quests` |
| `trg_qe_enforce_redundancy_insert` | `quests_establishments` | AFTER INSERT | `enforce_quest_redundancy_on_qe_insert` |
| `trg_qe_enforce_redundancy_delete` | `quests_establishments` | AFTER DELETE | `enforce_quest_redundancy_on_qe_delete` |

## Details

### trigger_create_spending_on_cashback

- **Table**: `receipt_lines`
- **Fonction**: `create_spending_from_cashback_payment`

```sql
CREATE TRIGGER trigger_create_spending_on_cashback AFTER INSERT ON public.receipt_lines FOR EACH ROW EXECUTE FUNCTION create_spending_from_cashback_payment()
```

### Triggers de prévention des quêtes redondantes (migration 021)

Trois triggers qui s'appuient sur la fonction core `check_quest_redundancy(p_quest_id BIGINT)` pour détecter les redondances de signature fonctionnelle entre quêtes actives.

**Signature fonctionnelle** : `(quest_type, period_type, consumption_type)` avec `NULL IS NOT DISTINCT FROM NULL`.

**Cas de redondance** (entre quêtes actives de même signature) :

| Cas | `conflict_kind` retourné |
|---|---|
| Deux quêtes globales (aucune entrée `quests_establishments`) | `both_global` |
| Une globale + une locale (ou inverse) | `global_vs_local` |
| Deux locales avec ≥ 1 établissement en commun | `locals_overlap` |

**Error code** : `P0421` — custom PostgreSQL errcode (plage `P0xxx` = application-defined).

**Format DETAIL JSON** (pour parsing UX admin en PR#3) :

```json
{
  "conflict_quest_id": 32,
  "conflict_quest_name": "Fidèle parmi les Fidèles",
  "conflict_kind": "both_global",
  "new_quest_id": 41,
  "new_quest_name": "TEST-T1",
  "signature": {
    "quest_type": "quest_completed",
    "period_type": "yearly",
    "consumption_type": null
  }
}
```

**Sémantique** :
- Désactiver une quête (`is_active = false`) est toujours autorisé — ne peut pas créer de conflit.
- Modifier la signature d'une quête inactive est toujours autorisé.
- Ajouter/retirer un lien `quests_establishments` d'une quête **inactive** est toujours autorisé.
- Retirer le **dernier** lien d'une quête locale active la fait basculer en globale — le trigger `AFTER DELETE` détecte ce cas et bloque si conflit.

## Triggers supprimés

### trigger_quest_progress_on_receipt (supprimé le 2026-01-23)

- **Raison** : Ce trigger s'exécutait lors de l'insertion du receipt, mais **avant** que les gains soient créés. Cela causait un bug où les quêtes de type `xp_earned` avaient toujours une progression de 0.
- **Solution** : La mise à jour de la progression des quêtes est maintenant appelée explicitement dans la fonction `create_receipt()` après l'insertion des gains.

