# Table: beers_beer_styles

## Description

Table de liaison Many-to-Many entre bieres et styles.

## Schema

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | bigint | Non | IDENTITY | ID auto-genere |
| `beer_id` | integer | Non | - | FK vers beers |
| `beer_style_id` | integer | Non | - | FK vers beer_styles |
| `created_at` | timestamptz | Oui | now() | Date de creation |

## Cle primaire

- `id`

## Relations

### Foreign Keys sortantes

| Colonne | Reference |
|---------|-----------|
| `beer_id` | `beers.id` |
| `beer_style_id` | `beer_styles.id` |

## RLS

RLS active: **Oui**

## Exemples de requetes

```sql
-- Styles d'une biere
SELECT bs.*
FROM beer_styles bs
JOIN beers_beer_styles bbs ON bs.id = bbs.beer_style_id
WHERE bbs.beer_id = 1;

-- Bieres d'un style
SELECT b.*
FROM beers b
JOIN beers_beer_styles bbs ON b.id = bbs.beer_id
WHERE bbs.beer_style_id = 1;
```

## Statistiques

- Lignes: **285**
