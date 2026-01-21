# Table: gains

XP et cashback gagnes

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
| `receipt_id` | `bigint` | Oui | - | - |
| `xp` | `integer` | Oui | - | - |
| `cashback_money` | `integer` | Oui | - | - |
| `establishment_id` | `integer` | Non | - | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
