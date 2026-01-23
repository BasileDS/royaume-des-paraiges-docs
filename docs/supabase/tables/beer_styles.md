# Table: beer_styles

## Description

Styles de bieres (migre depuis Directus, anciennement "styles").

## Schema

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | integer | Non | - | ID (identique a Directus) |
| `title` | varchar | Non | - | Nom du style |
| `description` | text | Oui | - | Description du style |
| `created_at` | timestamptz | Oui | now() | Date de creation |

## Cle primaire

- `id`

## Relations

### Tables liees

| Table | Colonne |
|-------|---------|
| `beers_beer_styles` | `beer_style_id` |

## RLS

RLS active: **Oui**

## Exemples de requetes

```sql
-- Tous les styles avec le nombre de bieres
SELECT bs.*, COUNT(bbs.beer_id) as beer_count
FROM beer_styles bs
LEFT JOIN beers_beer_styles bbs ON bs.id = bbs.beer_style_id
GROUP BY bs.id
ORDER BY beer_count DESC;

-- Bieres d'un style specifique
SELECT b.*
FROM beers b
JOIN beers_beer_styles bbs ON b.id = bbs.beer_id
JOIN beer_styles bs ON bbs.beer_style_id = bs.id
WHERE bs.title = 'IPA';
```

## Statistiques

- Lignes: **47**
