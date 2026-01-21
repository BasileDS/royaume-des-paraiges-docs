# Table: user_badges

Badges obtenus par utilisateur

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 2 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `integer` | Non | - | - |
| `customer_id` | `uuid` | Non | - | - |
| `badge_id` | `integer` | Non | - | - |
| `earned_at` | `timestamp with time zone` | Oui | now() | - |
| `period_type` | `varchar` | Oui | - | - |
| `period_identifier` | `varchar` | Oui | - | Identifiant de periode |
| `rank` | `integer` | Oui | - | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
