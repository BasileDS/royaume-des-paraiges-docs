# Table: establishments

## Description

Etablissements partenaires (migre depuis Directus).

## Schema

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | integer | Non | - | ID (identique a Directus) |
| `title` | varchar | Non | - | Nom de l'etablissement |
| `line_address_1` | varchar | Oui | - | Adresse ligne 1 |
| `line_address_2` | varchar | Oui | - | Adresse ligne 2 |
| `zipcode` | varchar | Oui | - | Code postal |
| `city` | varchar | Oui | - | Ville |
| `country` | varchar | Oui | - | Pays |
| `short_description` | text | Oui | - | Description courte |
| `description` | text | Oui | - | Description complete |
| `featured_image` | text | Oui | - | URL de l'image principale |
| `logo` | text | Oui | - | URL du logo |
| `anniversary` | date | Oui | - | Date anniversaire |
| `created_at` | timestamptz | Oui | now() | Date de creation |

## Cle primaire

- `id`

## Relations

### Tables liees

| Table | Colonne |
|-------|---------|
| `beers_establishments` | `establishment_id` |
| `news_establishments` | `establishment_id` |
| `receipts` | `establishment_id` |
| `gains` | `establishment_id` |
| `spendings` | `establishment_id` |

## RLS

RLS active: **Oui**

## Exemples de requetes

```sql
-- Tous les etablissements avec leurs bieres
SELECT e.*,
       array_agg(b.title) as beers
FROM establishments e
LEFT JOIN beers_establishments be ON e.id = be.establishment_id
LEFT JOIN beers b ON be.beer_id = b.id
GROUP BY e.id;

-- Etablissements par ville
SELECT * FROM establishments
WHERE city = 'Metz';
```

## Statistiques

- Lignes: **7**
