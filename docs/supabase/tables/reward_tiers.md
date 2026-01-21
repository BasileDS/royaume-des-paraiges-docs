# Table: reward_tiers

Paliers de recompenses leaderboard

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 6 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | - |
| `name` | `varchar` | Non | - | - |
| `rank_from` | `integer` | Non | - | Rang minimum inclus |
| `rank_to` | `integer` | Non | - | Rang maximum inclus |
| `coupon_template_id` | `bigint` | Oui | - | - |
| `badge_type_id` | `bigint` | Oui | - | - |
| `period_type` | `varchar` | Non | - | Type de periode: weekly, monthly, yearly |
| `display_order` | `integer` | Oui | 0 | - |
| `is_active` | `boolean` | Oui | true | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |
| `updated_at` | `timestamp with time zone` | Oui | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
