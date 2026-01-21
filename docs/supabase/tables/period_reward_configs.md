# Table: period_reward_configs

Configuration personnalisée des récompenses pour une période spécifique

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
| `period_type` | `character varying(20)` | Non | - | - |
| `period_identifier` | `character varying(20)` | Non | - | Identifiant de période: 2026-W04 (semaine), 2026-01 (mois), 2026 (année) |
| `custom_tiers` | `jsonb` | Oui | - | JSON: surcharge des reward_tiers par défaut pour cette période |
| `status` | `character varying(20)` | Oui | 'pending'::character varying | pending=à distribuer, scheduled=planifié, distributed=fait, cancelled=annulé |
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

- `period_reward_configs_created_by_fkey`: created_by → profiles.id
- `period_reward_configs_distributed_by_fkey`: distributed_by → profiles.id
