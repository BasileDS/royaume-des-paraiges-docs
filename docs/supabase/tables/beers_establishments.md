# Table: beers_establishments

## Description

Table de liaison Many-to-Many entre bieres et etablissements.

## Schema

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | bigint | Non | IDENTITY | ID auto-genere |
| `beer_id` | integer | Non | - | FK vers beers |
| `establishment_id` | integer | Non | - | FK vers establishments |
| `created_at` | timestamptz | Oui | now() | Date de creation de l'enregistrement |
| `added_at` | timestamptz | Oui | - | Date d'ajout de la biere au menu de l'etablissement |

## Cle primaire

- `id`

## Relations

### Foreign Keys sortantes

| Colonne | Reference |
|---------|-----------|
| `beer_id` | `beers.id` |
| `establishment_id` | `establishments.id` |

## RLS

RLS active: **Oui**

## Exemples de requetes

```sql
-- Bieres disponibles dans un etablissement
SELECT b.*
FROM beers b
JOIN beers_establishments be ON b.id = be.beer_id
WHERE be.establishment_id = 1;

-- Etablissements proposant une biere
SELECT e.*
FROM establishments e
JOIN beers_establishments be ON e.id = be.establishment_id
WHERE be.beer_id = 1;
```

## Statistiques

- Lignes: **43**
