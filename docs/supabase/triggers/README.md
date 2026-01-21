# Triggers

## Liste des triggers (2)

| Trigger | Table | Fonction |
|---------|-------|----------|
| `trigger_create_spending_on_cashback` | `receipt_lines` | `create_spending_from_cashback_payment` |
| `trigger_quest_progress_on_receipt` | `receipts` | `trigger_update_quest_progress` |

## Details


### trigger_create_spending_on_cashback

- **Table**: `receipt_lines`
- **Fonction**: `create_spending_from_cashback_payment`

```sql
CREATE TRIGGER trigger_create_spending_on_cashback AFTER INSERT ON public.receipt_lines FOR EACH ROW EXECUTE FUNCTION create_spending_from_cashback_payment()
```


### trigger_quest_progress_on_receipt

- **Table**: `receipts`
- **Fonction**: `trigger_update_quest_progress`

```sql
CREATE TRIGGER trigger_quest_progress_on_receipt AFTER INSERT ON public.receipts FOR EACH ROW EXECUTE FUNCTION trigger_update_quest_progress()
```

