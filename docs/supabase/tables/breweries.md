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
| `updated_at` | timestamptz | Oui | now() | Date de derniere modification (auto via trigger) |

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

## Triggers

| Trigger | Event | Description |
|---------|-------|-------------|
| `set_breweries_updated_at` | BEFORE UPDATE | Met a jour `updated_at` automatiquement |

## Statistiques

- Lignes: **66**
