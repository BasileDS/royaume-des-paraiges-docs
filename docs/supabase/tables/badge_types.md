# Table: badge_types

Definitions des badges

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 9 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `integer` | Non | - | - |
| `slug` | `varchar` | Non | - | Identifiant unique du badge |
| `name` | `varchar` | Non | - | - |
| `description` | `text` | Oui | - | - |
| `icon` | `varchar` | Oui | - | - |
| `rarity` | `varchar` | Oui | - | common, rare, epic, legendary |
| `category` | `varchar` | Oui | - | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
