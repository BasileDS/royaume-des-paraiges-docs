# Table: leaderboard_reward_distributions

Historique des récompenses distribuées aux gagnants du leaderboard

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | -1 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `integer` | Non | nextval('leaderboard_reward_distributions_id_seq'::regclass) | - |
| `customer_id` | `uuid` | Non | - | - |
| `period_type` | `character varying(20)` | Non | - | - |
| `period_identifier` | `character varying(50)` | Non | - | - |
| `rank` | `integer` | Non | - | - |
| `coupon_amount_id` | `integer` | Oui | - | - |
| `coupon_percentage_id` | `integer` | Oui | - | - |
| `badge_ids` | `integer[]` | Oui | ARRAY[]::integer[] | Array des IDs de badges attribués lors de cette distribution |
| `distributed_at` | `timestamp with time zone` | Oui | now() | - |
| `distribution_status` | `character varying(20)` | Oui | 'success'::character varying | - |
| `error_message` | `text` | Oui | - | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `leaderboard_reward_distributions_coupon_amount_id_fkey`: coupon_amount_id → coupons.id
- `leaderboard_reward_distributions_coupon_percentage_id_fkey`: coupon_percentage_id → coupons.id
- `leaderboard_reward_distributions_customer_id_fkey`: customer_id → profiles.id
