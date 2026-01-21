# Table: comments

Commentaires

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 2 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | - |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `customer_id` | `uuid` | Non | - | - |
| `beer_id` | `integer` | Oui | - | - |
| `news_id` | `integer` | Oui | - | - |
| `quest_id` | `integer` | Oui | - | - |
| `establishment_id` | `integer` | Oui | - | - |
| `hidden` | `boolean` | Non | false | - |
| `content` | `text` | Oui | - | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
