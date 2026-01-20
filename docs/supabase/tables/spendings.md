# Table: spendings

Dépenses de cashback des utilisateurs. Créée automatiquement lors d'un paiement en cashback.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `BIGINT` | ❌ | `identity` | PK auto-incrémentée |
| `created_at` | `TIMESTAMPTZ` | ❌ | `now()` | Date de création |
| `amount` | `INTEGER` | ❌ | - | Montant dépensé en centimes |
| `customer_id` | `UUID` | ❌ | - | FK vers profiles.id |
| `establishment_id` | `INTEGER` | ❌ | - | ID établissement (Directus) |
| `receipt_id` | `BIGINT` | ✅ | - | FK vers receipts.id |

## Clés

- **Primary Key** : `id` (BIGINT, identity)
- **Foreign Keys** :
  - `customer_id` → `profiles.id`
  - `receipt_id` → `receipts.id`

## Création Automatique

Les spendings sont créés automatiquement par le trigger `trigger_create_spending_on_cashback` sur `receipt_lines` :

```sql
-- Quand une receipt_line avec payment_method = 'cashback' est insérée
CREATE TRIGGER trigger_create_spending_on_cashback
  AFTER INSERT ON receipt_lines
  FOR EACH ROW
  EXECUTE FUNCTION create_spending_from_cashback_payment();
```

## Calcul du Solde Cashback

Le solde cashback disponible est calculé ainsi :

```sql
cashback_available = SUM(gains.cashback_money) - SUM(spendings.amount)
```

Cette logique est implémentée dans :
- `check_cashback_balance()` - Vérification avant paiement
- `user_stats` - Vue matérialisée

## Exemple d'Utilisation

```typescript
// Récupérer l'historique des dépenses cashback
const { data: spendings } = await supabase
  .from('spendings')
  .select(`
    *,
    receipts (
      amount,
      establishment_id
    )
  `)
  .eq('customer_id', userId)
  .order('created_at', { ascending: false });

// Calculer le total dépensé
const totalSpent = spendings?.reduce((sum, s) => sum + s.amount, 0) || 0;
```

## Calcul du Solde Disponible

```typescript
// Via la fonction RPC
const { data } = await supabase.rpc('get_user_cashback_balance', {
  p_customer_id: userId
});

console.log(data);
// {
//   customer_id: "...",
//   cashback_earned: 7500,
//   cashback_spent: 2000,
//   cashback_available: 5500
// }
```

## Notes

- Cette table ne doit **jamais** être insérée manuellement
- Elle est créée automatiquement par le trigger
- Le `receipt_id` permet de tracer quelle transaction a consommé le cashback
