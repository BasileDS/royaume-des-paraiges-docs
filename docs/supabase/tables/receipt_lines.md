# Table: receipt_lines

Lignes de paiement d'un ticket de caisse. Chaque ligne représente une méthode de paiement utilisée.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `BIGINT` | ❌ | `identity` | PK auto-incrémentée |
| `created_at` | `TIMESTAMPTZ` | ❌ | `now()` | Date de création |
| `amount` | `INTEGER` | ❌ | - | Montant en centimes |
| `payment_method` | `payment_method` | ❌ | - | Méthode de paiement |
| `receipt_id` | `BIGINT` | ❌ | - | FK vers receipts.id |

## Clés

- **Primary Key** : `id` (BIGINT, identity)
- **Foreign Key** : `receipt_id` → `receipts.id`

## Type payment_method

```sql
CREATE TYPE payment_method AS ENUM (
  'card',     -- Carte bancaire
  'cash',     -- Espèces
  'cashback', -- Utilisation du solde cashback
  'coupon'    -- Utilisation d'un coupon
);
```

## Triggers Associés

### trigger_create_spending_on_cashback

Lorsqu'une `receipt_line` avec `payment_method = 'cashback'` est insérée, un `spending` est automatiquement créé.

```sql
CREATE TRIGGER trigger_create_spending_on_cashback
  AFTER INSERT ON receipt_lines
  FOR EACH ROW
  EXECUTE FUNCTION create_spending_from_cashback_payment();
```

## Calcul des Gains

Seuls les paiements en `card` ou `cash` génèrent des gains (XP et cashback). Les paiements en `cashback` ou `coupon` ne génèrent pas de gains.

```sql
-- Dans validate_payment_methods()
IF v_payment_method IN ('card', 'cash') THEN
  v_amount_for_gains := v_amount_for_gains + v_payment_amount_item;
END IF;
```

## Exemple de Receipt Multi-Paiement

Un client paie 25€ avec :
- 15€ en carte
- 5€ en cashback
- 5€ avec un coupon

```json
[
  {"method": "card", "amount": 1500},
  {"method": "cashback", "amount": 500},
  {"method": "coupon", "amount": 500}
]
```

**Gains calculés sur** : 1500 centimes (15€) uniquement

## Exemple d'Utilisation

```typescript
// Récupérer les lignes d'un receipt
const { data: lines } = await supabase
  .from('receipt_lines')
  .select('*')
  .eq('receipt_id', receiptId);

// Calculer le total par méthode de paiement
const totals = lines?.reduce((acc, line) => {
  acc[line.payment_method] = (acc[line.payment_method] || 0) + line.amount;
  return acc;
}, {});
```

## Notes

- Cette table ne doit pas être insérée directement, utilisez `create_receipt()`
- Un receipt peut avoir plusieurs lignes (paiement mixte)
- Le total des lignes doit correspondre au `amount` du receipt
