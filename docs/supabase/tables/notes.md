# Table: notes

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
| `customer_id` | `uuid` | Non | auth.uid() | - |
| `note` | `integer` | Non | - | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `notes_customer_id_fkey`: customer_id → profiles.id
