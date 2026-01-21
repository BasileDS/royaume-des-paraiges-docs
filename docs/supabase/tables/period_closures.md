# Table: period_closures

Clotures de periodes

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 1 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `integer` | Non | - | - |
| `period_type` | `varchar` | Non | - | - |
| `period_identifier` | `varchar` | Non | - | - |
| `closed_at` | `timestamp with time zone` | Oui | now() | - |
| `rewards_distributed_count` | `integer` | Oui | 0 | - |
| `total_eligible_users` | `integer` | Oui | 0 | - |
| `distribution_duration_ms` | `integer` | Oui | - | Temps de traitement en ms |
| `status` | `varchar` | Oui | 'success'::varchar | - |
| `error_logs` | `jsonb` | Oui | '[]'::jsonb | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
