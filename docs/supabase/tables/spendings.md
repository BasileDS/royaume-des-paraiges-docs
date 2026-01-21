# Table: spendings

Pas de description disponible.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | -1 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | - |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `amount` | `integer` | Non | - | - |
| `customer_id` | `uuid` | Non | - | - |
| `establishment_id` | `integer` | Non | - | - |
| `receipt_id` | `bigint` | Oui | - | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `spendings_customer_id_fkey`: customer_id → profiles.id
- `spendings_receipt_id_fkey`: receipt_id → receipts.id
