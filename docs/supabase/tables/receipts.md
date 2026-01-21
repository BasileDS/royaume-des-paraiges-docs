# Table: receipts

Pas de description disponible.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 42 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | - |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `amount` | `integer` | Non | - | - |
| `customer_id` | `uuid` | Non | - | - |
| `establishment_id` | `integer` | Non | - | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `receipts_customer_id_fkey`: customer_id → profiles.id
