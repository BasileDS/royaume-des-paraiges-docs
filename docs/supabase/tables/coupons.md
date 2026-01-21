# Table: coupons

Pas de description disponible.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 4 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | - |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `customer_id` | `uuid` | Non | - | - |
| `used` | `boolean` | Non | false | - |
| `amount` | `integer` | Oui | - | - |
| `percentage` | `integer` | Oui | - | - |
| `template_id` | `bigint` | Oui | - | Référence au template utilisé pour créer ce coupon |
| `expires_at` | `timestamp with time zone` | Oui | - | Date d'expiration du coupon. NULL = pas d'expiration |
| `distribution_type` | `character varying(50)` | Oui | - | Type de distribution: leaderboard_weekly, leaderboard_monthly, manual, trigger_legacy |
| `period_identifier` | `character varying(20)` | Oui | - | Identifiant de période pour traçabilité (ex: 2026-W04) |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `coupons_customer_id_fkey`: customer_id → profiles.id
- `coupons_template_id_fkey`: template_id → coupon_templates.id
