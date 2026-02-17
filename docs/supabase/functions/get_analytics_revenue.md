# Function: get_analytics_revenue

Retourne le breakdown des recettes (paiements euros et PdB depenses) pour une periode donnee, avec filtres optionnels.

## Signature

```sql
CREATE FUNCTION get_analytics_revenue(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_establishment_id BIGINT DEFAULT NULL,
  p_employee_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
```

## Parametres

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `p_start_date` | `TIMESTAMPTZ` | Oui | Debut de la periode (inclus) |
| `p_end_date` | `TIMESTAMPTZ` | Oui | Fin de la periode (exclu) |
| `p_establishment_id` | `BIGINT` | Non | Filtre par etablissement |
| `p_employee_id` | `UUID` | Non | Filtre par employe (via receipts.employee_id) |

## Retour

```json
{
  "sales_count": 42,
  "total_euros": 125000,
  "card_total": 100000,
  "cash_total": 20000,
  "cashback_spent_total": 5000
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `sales_count` | INTEGER | Nombre de receipts sur la periode |
| `total_euros` | INTEGER | Total carte + especes (centimes) |
| `card_total` | INTEGER | Total paiements carte (centimes) |
| `cash_total` | INTEGER | Total paiements especes (centimes) |
| `cashback_spent_total` | INTEGER | Total PdB depenses par les clients (centimes) |

## Logique

1. Compte les receipts correspondant aux filtres (periode + etablissement + employe)
2. Joint `receipt_lines` aux receipts filtres
3. Agrege les montants par `payment_method` (card, cash, cashback)

## Exemple

```typescript
const { data } = await (supabase.rpc as any)('get_analytics_revenue', {
  p_start_date: '2026-02-01T00:00:00Z',
  p_end_date: '2026-02-18T00:00:00Z',
  p_establishment_id: 1,
});
```
