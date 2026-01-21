# Table: spendings

Depenses cashback

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 5 |

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

Aucune relation definie.
