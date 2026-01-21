# Table: period_reward_configs

Config personnalisee par periode

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 0 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | - |
| `period_type` | `varchar` | Non | - | - |
| `period_identifier` | `varchar` | Non | - | Identifiant de periode |
| `custom_tiers` | `jsonb` | Oui | - | Surcharge des reward_tiers |
| `status` | `varchar` | Oui | 'pending'::varchar | pending, scheduled, distributed, cancelled |
| `scheduled_at` | `timestamp with time zone` | Oui | - | - |
| `distributed_at` | `timestamp with time zone` | Oui | - | - |
| `distributed_by` | `uuid` | Oui | - | - |
| `notes` | `text` | Oui | - | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |
| `updated_at` | `timestamp with time zone` | Oui | now() | - |
| `created_by` | `uuid` | Oui | - | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
