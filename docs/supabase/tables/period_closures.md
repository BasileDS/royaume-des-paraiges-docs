# Table: period_closures

Tracking des périodes de leaderboard fermées et récompenses distribuées

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | -1 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `integer` | Non | nextval('period_closures_id_seq'::regclass) | - |
| `period_type` | `character varying(20)` | Non | - | - |
| `period_identifier` | `character varying(50)` | Non | - | - |
| `closed_at` | `timestamp with time zone` | Oui | now() | - |
| `rewards_distributed_count` | `integer` | Oui | 0 | - |
| `total_eligible_users` | `integer` | Oui | 0 | - |
| `distribution_duration_ms` | `integer` | Oui | - | Temps de traitement de la distribution en millisecondes |
| `status` | `character varying(20)` | Oui | 'success'::character varying | - |
| `error_logs` | `jsonb` | Oui | '[]'::jsonb | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
