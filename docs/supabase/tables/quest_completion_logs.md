# Table: quest_completion_logs

Historique detaille de toutes les completions de quetes avec recompenses

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
| `quest_id` | `bigint` | Non | - | - |
| `quest_progress_id` | `bigint` | Non | - | - |
| `customer_id` | `uuid` | Non | - | - |
| `period_type` | `character varying(20)` | Non | - | - |
| `period_identifier` | `character varying(20)` | Non | - | - |
| `coupon_id` | `bigint` | Oui | - | - |
| `coupon_template_id` | `bigint` | Oui | - | - |
| `badge_awarded_id` | `bigint` | Oui | - | - |
| `bonus_xp_awarded` | `integer` | Non | 0 | - |
| `bonus_cashback_awarded` | `integer` | Non | 0 | - |
| `final_value` | `integer` | Non | - | - |
| `target_value` | `integer` | Non | - | - |
| `completed_at` | `timestamp with time zone` | Non | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `quest_completion_logs_badge_awarded_id_fkey`: badge_awarded_id → user_badges.id
- `quest_completion_logs_coupon_id_fkey`: coupon_id → coupons.id
- `quest_completion_logs_coupon_template_id_fkey`: coupon_template_id → coupon_templates.id
- `quest_completion_logs_customer_id_fkey`: customer_id → profiles.id
- `quest_completion_logs_quest_id_fkey`: quest_id → quests.id
- `quest_completion_logs_quest_progress_id_fkey`: quest_progress_id → quest_progress.id
