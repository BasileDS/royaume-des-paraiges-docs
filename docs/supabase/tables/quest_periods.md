# Table: quest_periods

Table de liaison pour assigner des quêtes à des périodes spécifiques (ex: 2026-W05, 2026-01, 2026)

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
| `quest_id` | `bigint` | Non | - | - |
| `period_identifier` | `character varying(20)` | Non | - | Identifiant de période au format YYYY-Www (weekly), YYYY-MM (monthly), ou YYYY (yearly) |
| `created_at` | `timestamp with time zone` | Oui | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `quest_periods_quest_id_fkey`: quest_id → quests.id
