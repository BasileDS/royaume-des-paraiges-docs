# Table: beers

## Description

Catalogue des bieres (migre depuis Directus).

## Schema

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | integer | Non | - | ID (identique a Directus) |
| `title` | varchar | Non | - | Nom de la biere |
| `description` | text | Oui | - | Description de la biere |
| `featured_image` | text | Oui | - | URL de l'image |
| `ibu` | integer | Oui | - | International Bitterness Units (amertume) |
| `abv` | numeric | Oui | - | Alcohol By Volume (degre alcool) |
| `brewery_id` | integer | Oui | - | FK vers breweries |
| `created_at` | timestamptz | Oui | now() | Date de creation |
| `updated_at` | timestamptz | Oui | now() | Date de derniere modification (auto via trigger) |

## Cle primaire

- `id`

## Relations

### Foreign Keys sortantes

| Colonne | Reference |
|---------|-----------|
| `brewery_id` | `breweries.id` |

### Tables liees

| Table | Colonne |
|-------|---------|
| `beers_establishments` | `beer_id` |
| `beers_beer_styles` | `beer_id` |

## RLS

RLS active: **Oui**

## Exemples de requetes

```sql
-- Recuperer toutes les bieres avec leur brasserie
SELECT b.*, br.title as brewery_name
FROM beers b
LEFT JOIN breweries br ON b.brewery_id = br.id;

-- Bieres par etablissement
SELECT b.*
FROM beers b
JOIN beers_establishments be ON b.id = be.beer_id
WHERE be.establishment_id = 1;

-- Bieres par style
SELECT b.*
FROM beers b
JOIN beers_beer_styles bbs ON b.id = bbs.beer_id
WHERE bbs.beer_style_id = 1;
```

## Foreign Keys entrantes

| Table | Colonne | ON DELETE |
|-------|---------|-----------|
| `comments` | `beer_id` | CASCADE |
| `likes` | `beer_id` | CASCADE |
| `beers_establishments` | `beer_id` | CASCADE |
| `beers_beer_styles` | `beer_id` | CASCADE |

## Triggers

| Trigger | Event | Description |
|---------|-------|-------------|
| `set_beers_updated_at` | BEFORE UPDATE | Met a jour `updated_at` automatiquement |

## Statistiques

- Lignes: **196**
