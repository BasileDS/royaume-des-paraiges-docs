# Table: coupon_distribution_logs

Historique des distributions

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 2 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | - |
| `distribution_type` | `varchar` | Non | - | Type de distribution |
| `period_identifier` | `varchar` | Oui | - | - |
| `customer_id` | `uuid` | Non | - | - |
| `coupon_id` | `bigint` | Oui | - | - |
| `coupon_template_id` | `bigint` | Oui | - | - |
| `coupon_amount` | `integer` | Oui | - | - |
| `coupon_percentage` | `integer` | Oui | - | - |
| `coupon_establishment_id` | `integer` | Oui | - | - |
| `coupon_expires_at` | `timestamp with time zone` | Oui | - | - |
| `rank` | `integer` | Oui | - | - |
| `tier_id` | `bigint` | Oui | - | - |
| `tier_name` | `varchar` | Oui | - | - |
| `xp_at_distribution` | `integer` | Oui | - | - |
| `badge_id` | `bigint` | Oui | - | - |
| `user_badge_id` | `bigint` | Oui | - | - |
| `distributed_at` | `timestamp with time zone` | Oui | now() | - |
| `distributed_by` | `uuid` | Oui | - | UUID admin si manuel |
| `notes` | `text` | Oui | - | - |
| `status` | `varchar` | Oui | 'success'::varchar | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
