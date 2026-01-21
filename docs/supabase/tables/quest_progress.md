# Table: quest_progress

Suivi de la progression des utilisateurs sur les quetes

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
| `customer_id` | `uuid` | Non | - | - |
| `period_type` | `character varying(20)` | Non | - | - |
| `period_identifier` | `character varying(20)` | Non | - | - |
| `current_value` | `integer` | Non | 0 | - |
| `target_value` | `integer` | Non | - | - |
| `status` | `character varying(20)` | Non | 'in_progress'::character varying | in_progress: en cours, completed: objectif atteint mais pas encore recompense, rewarded: recompenses distribuees |
| `completed_at` | `timestamp with time zone` | Oui | - | - |
| `rewarded_at` | `timestamp with time zone` | Oui | - | - |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `updated_at` | `timestamp with time zone` | Non | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `quest_progress_customer_id_fkey`: customer_id → profiles.id
- `quest_progress_quest_id_fkey`: quest_id → quests.id
