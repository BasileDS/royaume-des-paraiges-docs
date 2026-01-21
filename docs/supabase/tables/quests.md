# Table: quests

Definition des quetes periodiques disponibles

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
| `name` | `character varying(255)` | Non | - | - |
| `description` | `text` | Oui | - | - |
| `slug` | `character varying(100)` | Non | - | - |
| `quest_type` | `quest_type` (enum) | Non | - | Type de quête: `xp_earned` (gagner X XP), `amount_spent` (dépenser X centimes), `establishments_visited` (visiter X établissements), `orders_count` (passer X commandes) |
| `target_value` | `integer` | Non | - | Objectif a atteindre (nombre de tickets, XP, ou etablissements) |
| `period_type` | `character varying(20)` | Non | - | - |
| `coupon_template_id` | `bigint` | Oui | - | - |
| `badge_type_id` | `bigint` | Oui | - | - |
| `bonus_xp` | `integer` | Non | 0 | XP bonus attribue en plus des gains normaux |
| `bonus_cashback` | `integer` | Non | 0 | Cashback bonus en centimes attribue en plus |
| `is_active` | `boolean` | Non | true | - |
| `display_order` | `integer` | Non | 0 | - |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `updated_at` | `timestamp with time zone` | Non | now() | - |
| `created_by` | `uuid` | Oui | - | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `quests_badge_type_id_fkey`: badge_type_id → badge_types.id
- `quests_coupon_template_id_fkey`: coupon_template_id → coupon_templates.id
- `quests_created_by_fkey`: created_by → profiles.id
