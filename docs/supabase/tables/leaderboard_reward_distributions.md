# Table: leaderboard_reward_distributions

Historique recompenses leaderboard

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 0 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `integer` | Non | - | - |
| `customer_id` | `uuid` | Non | - | - |
| `period_type` | `varchar` | Non | - | - |
| `period_identifier` | `varchar` | Non | - | - |
| `rank` | `integer` | Non | - | - |
| `coupon_amount_id` | `integer` | Oui | - | - |
| `coupon_percentage_id` | `integer` | Oui | - | - |
| `badge_ids` | `integer[]` | Oui | ARRAY[]::integer[] | IDs de badges attribues |
| `distributed_at` | `timestamp with time zone` | Oui | now() | - |
| `distribution_status` | `varchar` | Oui | 'success'::varchar | - |
| `error_message` | `text` | Oui | - | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
