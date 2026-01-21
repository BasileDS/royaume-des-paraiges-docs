# Table: receipts

Tickets de caisse

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 55 |

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

Aucune relation definie.
