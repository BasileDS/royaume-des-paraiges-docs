# Table: reward_tiers

Paliers de récompenses pour le leaderboard (configurable par rang)

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
| `name` | `character varying(100)` | Non | - | - |
| `rank_from` | `integer` | Non | - | Rang minimum inclus (ex: 1 pour le 1er) |
| `rank_to` | `integer` | Non | - | Rang maximum inclus (ex: 3 pour les rangs 1-3) |
| `coupon_template_id` | `bigint` | Oui | - | - |
| `badge_type_id` | `bigint` | Oui | - | - |
| `period_type` | `character varying(20)` | Non | - | Type de période: weekly, monthly, yearly |
| `display_order` | `integer` | Oui | 0 | - |
| `is_active` | `boolean` | Oui | true | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |
| `updated_at` | `timestamp with time zone` | Oui | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `reward_tiers_badge_type_id_fkey`: badge_type_id → badge_types.id
- `reward_tiers_coupon_template_id_fkey`: coupon_template_id → coupon_templates.id
