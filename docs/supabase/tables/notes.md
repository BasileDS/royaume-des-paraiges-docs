# Table: notes

Notes/evaluations

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 0 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | - |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `customer_id` | `uuid` | Non | auth.uid() | - |
| `note` | `integer` | Non | - | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
