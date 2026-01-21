# Table: badge_types

Définitions des badges disponibles dans le système

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | -1 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `integer` | Non | nextval('badge_types_id_seq'::regclass) | - |
| `slug` | `character varying(100)` | Non | - | Identifiant unique du badge (ex: weekly_champion) |
| `name` | `character varying(200)` | Non | - | - |
| `description` | `text` | Oui | - | - |
| `icon` | `character varying(50)` | Oui | - | - |
| `rarity` | `character varying(20)` | Oui | - | Rareté du badge (common, rare, epic, legendary) |
| `category` | `character varying(50)` | Oui | - | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
