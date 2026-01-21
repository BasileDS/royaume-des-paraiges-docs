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

