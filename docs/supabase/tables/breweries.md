# Table: breweries

## Description

Brasseries (migre depuis Directus).

## Schema

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | integer | Non | - | ID (identique a Directus) |
| `title` | varchar | Non | - | Nom de la brasserie |
| `country` | varchar | Oui | - | Pays d'origine |
| `created_at` | timestamptz | Oui | now() | Date de creation |

## Cle primaire

- `id`

## Relations

### Tables liees

| Table | Colonne |
|-------|---------|
| `beers` | `brewery_id` |

## RLS

RLS active: **Oui**

## Exemples de requetes

```sql
-- Toutes les brasseries avec le nombre de bieres
SELECT br.*, COUNT(b.id) as beer_count
FROM breweries br
LEFT JOIN beers b ON br.id = b.brewery_id
GROUP BY br.id
ORDER BY beer_count DESC;

-- Brasseries par pays
SELECT * FROM breweries
WHERE country = 'France';
```

## Statistiques

- Lignes: **66**
