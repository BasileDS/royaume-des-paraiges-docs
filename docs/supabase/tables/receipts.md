# Table: receipts

Tickets de caisse des utilisateurs. Représente une transaction dans un établissement.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `BIGINT` | ❌ | `identity` | PK auto-incrémentée |
| `created_at` | `TIMESTAMPTZ` | ❌ | `now()` | Date de création |
| `amount` | `INTEGER` | ❌ | - | Montant total en centimes |
| `customer_id` | `UUID` | ❌ | - | FK vers profiles.id |
| `establishment_id` | `INTEGER` | ❌ | - | ID établissement (Directus) |

## Clés

- **Primary Key** : `id` (BIGINT, identity)
- **Foreign Key** : `customer_id` → `profiles.id`

## Relations

### Référence

| Table | Colonne |
|-------|---------|
| `profiles` | `customer_id` |

### Référencé par

| Table | Colonne | Relation |
|-------|---------|----------|
| `receipt_lines` | `receipt_id` | 1:N |
| `gains` | `receipt_id` | 1:1 |
| `spendings` | `receipt_id` | 1:N |

## Triggers Associés

### trigger_weekly_coupon

Après chaque insertion, vérifie si le client a dépassé 50€ de dépenses hebdomadaires pour créer un coupon de 3,90€.

```sql
CREATE TRIGGER trigger_weekly_coupon
  AFTER INSERT ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION check_and_create_weekly_coupon();
```

### trigger_frequency_coupon

Après chaque insertion, vérifie si le client a passé au moins 10 commandes cette semaine pour créer un coupon de 5%.

```sql
CREATE TRIGGER trigger_frequency_coupon
  AFTER INSERT ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION check_and_create_frequency_coupon();
```

## Flux de Création

Les receipts ne sont **jamais** créés directement. Utilisez la fonction `create_receipt()` :

```sql
SELECT create_receipt(
  p_customer_id := '123e4567-e89b-12d3-a456-426614174000'::UUID,
  p_establishment_id := 1,
  p_payment_methods := '[{"method": "card", "amount": 1500}]'::JSONB,
  p_coupon_ids := ARRAY[]::BIGINT[]
);
```

## Exemple d'Utilisation

```typescript
// Récupérer les receipts d'un utilisateur avec gains
const { data: receipts } = await supabase
  .from('receipts')
  .select(`
    *,
    gains (*),
    receipt_lines (*)
  `)
  .eq('customer_id', userId)
  .order('created_at', { ascending: false });

// Calcul des dépenses hebdomadaires
const { data } = await supabase
  .from('receipts')
  .select('amount')
  .eq('customer_id', userId)
  .gte('created_at', weekStart)
  .lte('created_at', weekEnd);

const weeklyTotal = data?.reduce((sum, r) => sum + r.amount, 0) || 0;
```

## Notes

- Le `establishment_id` fait référence à Directus (CMS externe), pas à une table Supabase
- Le montant (`amount`) est la somme de toutes les `receipt_lines`
- Un seul `gain` est créé par receipt
