# Table: coupon_distribution_logs

Historique complet de toutes les distributions de coupons

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
| `distribution_type` | `character varying(50)` | Non | - | Type: leaderboard_weekly, leaderboard_monthly, leaderboard_yearly, manual |
| `period_identifier` | `character varying(20)` | Oui | - | - |
| `customer_id` | `uuid` | Non | - | - |
| `coupon_id` | `bigint` | Oui | - | - |
| `coupon_template_id` | `bigint` | Oui | - | - |
| `coupon_amount` | `integer` | Oui | - | - |
| `coupon_percentage` | `integer` | Oui | - | - |
| `coupon_establishment_id` | `integer` | Oui | - | - |
| `coupon_expires_at` | `timestamp with time zone` | Oui | - | - |
| `rank` | `integer` | Oui | - | - |
| `tier_id` | `bigint` | Oui | - | - |
| `tier_name` | `character varying(100)` | Oui | - | - |
| `xp_at_distribution` | `integer` | Oui | - | - |
| `badge_id` | `bigint` | Oui | - | - |
| `user_badge_id` | `bigint` | Oui | - | - |
| `distributed_at` | `timestamp with time zone` | Oui | now() | - |
| `distributed_by` | `uuid` | Oui | - | UUID admin si manuel, NULL si automatique (cron) |
| `notes` | `text` | Oui | - | - |
| `status` | `character varying(20)` | Oui | 'success'::character varying | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `coupon_distribution_logs_badge_id_fkey`: badge_id → badge_types.id
- `coupon_distribution_logs_coupon_id_fkey`: coupon_id → coupons.id
- `coupon_distribution_logs_coupon_template_id_fkey`: coupon_template_id → coupon_templates.id
- `coupon_distribution_logs_customer_id_fkey`: customer_id → profiles.id
- `coupon_distribution_logs_distributed_by_fkey`: distributed_by → profiles.id
- `coupon_distribution_logs_tier_id_fkey`: tier_id → reward_tiers.id
- `coupon_distribution_logs_user_badge_id_fkey`: user_badge_id → user_badges.id
