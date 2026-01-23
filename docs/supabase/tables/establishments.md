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
| `updated_at` | timestamptz | Oui | now() | Date de derniere modification (auto via trigger) |

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

## Foreign Keys entrantes

| Table | Colonne | ON DELETE |
|-------|---------|-----------|
| `receipts` | `establishment_id` | RESTRICT |
| `gains` | `establishment_id` | RESTRICT |
| `spendings` | `establishment_id` | RESTRICT |
| `coupon_templates` | `establishment_id` | RESTRICT |
| `comments` | `establishment_id` | CASCADE |
| `beers_establishments` | `establishment_id` | CASCADE |
| `news_establishments` | `establishment_id` | CASCADE |

## Triggers

| Trigger | Event | Description |
|---------|-------|-------------|
| `set_establishments_updated_at` | BEFORE UPDATE | Met a jour `updated_at` automatiquement |

## Ameliorations futures

### Geolocalisation (PostGIS)

Ajout prevu de coordonnees GPS pour permettre :
- Recherche de proximite ("etablissements a moins de X km")
- Affichage sur carte
- Tri par distance

```sql
-- Structure prevue
ALTER TABLE establishments
  ADD COLUMN latitude DECIMAL(10, 8),
  ADD COLUMN longitude DECIMAL(11, 8),
  ADD COLUMN location GEOGRAPHY(POINT, 4326);

CREATE INDEX idx_establishments_location
  ON establishments USING GIST(location);
```

```sql
-- Exemple de requete de proximite
SELECT *, ST_Distance(location, ST_MakePoint(6.175, 49.119)::geography) as distance
FROM establishments
WHERE ST_DWithin(location, ST_MakePoint(6.175, 49.119)::geography, 1000)
ORDER BY distance;
```
