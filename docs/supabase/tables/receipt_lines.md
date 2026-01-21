# Table: receipt_lines

Lignes de paiement des tickets

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
| `payment_method` | `payment_method` | Non | - | - |
| `receipt_id` | `bigint` | Non | - | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
