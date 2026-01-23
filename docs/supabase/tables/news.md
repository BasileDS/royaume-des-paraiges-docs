# Table: news

## Description

Actualites (migre depuis Directus).

## Schema

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | integer | Non | - | ID (identique a Directus) |
| `title` | varchar | Non | - | Titre de l'actualite |
| `content` | text | Oui | - | Contenu de l'actualite |
| `featured_image` | text | Oui | - | URL de l'image principale |
| `created_at` | timestamptz | Oui | now() | Date de creation |
| `updated_at` | timestamptz | Oui | now() | Date de derniere modification (auto via trigger) |

## Cle primaire

- `id`

## Relations

### Tables liees

| Table | Colonne |
|-------|---------|
| `news_establishments` | `news_id` |
| `likes` | `news_id` |
| `comments` | `news_id` |

## RLS

RLS active: **Oui**

## Exemples de requetes

```sql
-- Actualites recentes
SELECT * FROM news
ORDER BY created_at DESC
LIMIT 10;

-- Actualites avec les etablissements concernes
SELECT n.*,
       array_agg(e.title) as establishments
FROM news n
LEFT JOIN news_establishments ne ON n.id = ne.news_id
LEFT JOIN establishments e ON ne.establishment_id = e.id
GROUP BY n.id;
```

## Triggers

| Trigger | Event | Description |
|---------|-------|-------------|
| `set_news_updated_at` | BEFORE UPDATE | Met a jour `updated_at` automatiquement |

## Statistiques

- Lignes: **2**
