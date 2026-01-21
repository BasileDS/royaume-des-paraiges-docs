# Table: user_badges

Collection des badges obtenus par chaque utilisateur

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | -1 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `integer` | Non | nextval('user_badges_id_seq'::regclass) | - |
| `customer_id` | `uuid` | Non | - | - |
| `badge_id` | `integer` | Non | - | - |
| `earned_at` | `timestamp with time zone` | Oui | now() | - |
| `period_type` | `character varying(20)` | Oui | - | - |
| `period_identifier` | `character varying(50)` | Oui | - | Identifiant de période (2025-W03 pour semaine, 2025-01 pour mois, 2025 pour année) |
| `rank` | `integer` | Oui | - | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `user_badges_badge_id_fkey`: badge_id → badge_types.id
- `user_badges_customer_id_fkey`: customer_id → profiles.id
