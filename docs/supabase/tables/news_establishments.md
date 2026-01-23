# Table: news_establishments

## Description

Table de liaison Many-to-Many entre actualites et etablissements.

## Schema

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | bigint | Non | IDENTITY | ID auto-genere |
| `news_id` | integer | Non | - | FK vers news |
| `establishment_id` | integer | Non | - | FK vers establishments |
| `created_at` | timestamptz | Oui | now() | Date de creation |

## Cle primaire

- `id`

## Relations

### Foreign Keys sortantes

| Colonne | Reference |
|---------|-----------|
| `news_id` | `news.id` |
| `establishment_id` | `establishments.id` |

## RLS

RLS active: **Oui**

## Exemples de requetes

```sql
-- Etablissements lies a une actualite
SELECT e.*
FROM establishments e
JOIN news_establishments ne ON e.id = ne.establishment_id
WHERE ne.news_id = 1;

-- Actualites d'un etablissement
SELECT n.*
FROM news n
JOIN news_establishments ne ON n.id = ne.news_id
WHERE ne.establishment_id = 1;
```

## Statistiques

- Lignes: **3**
