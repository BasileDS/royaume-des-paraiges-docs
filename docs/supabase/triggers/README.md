# Triggers

## Liste des triggers (1)

| Trigger | Table | Fonction |
|---------|-------|----------|
| `trigger_create_spending_on_cashback` | `receipt_lines` | `create_spending_from_cashback_payment` |

## Details

### trigger_create_spending_on_cashback

- **Table**: `receipt_lines`
- **Fonction**: `create_spending_from_cashback_payment`

```sql
CREATE TRIGGER trigger_create_spending_on_cashback AFTER INSERT ON public.receipt_lines FOR EACH ROW EXECUTE FUNCTION create_spending_from_cashback_payment()
```

## Triggers supprimés

### trigger_quest_progress_on_receipt (supprimé le 2026-01-23)

- **Raison** : Ce trigger s'exécutait lors de l'insertion du receipt, mais **avant** que les gains soient créés. Cela causait un bug où les quêtes de type `xp_earned` avaient toujours une progression de 0.
- **Solution** : La mise à jour de la progression des quêtes est maintenant appelée explicitement dans la fonction `create_receipt()` après l'insertion des gains.

