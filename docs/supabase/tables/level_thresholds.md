# Table: level_thresholds

## Description

Seuils de niveaux utilisateur (migre depuis Directus).

## Schema

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | integer | Non | - | ID (identique a Directus) |
| `level` | integer | Non | - | Numero du niveau |
| `xp_required` | integer | Non | - | XP requis pour atteindre ce niveau |
| `name` | varchar | Non | - | Nom du niveau |
| `description` | text | Oui | - | Description du niveau |
| `sort_order` | integer | Oui | 0 | Ordre de tri |
| `created_at` | timestamptz | Oui | now() | Date de creation |

## Cle primaire

- `id`

## RLS

RLS active: **Oui**

## Exemples de requetes

```sql
-- Tous les niveaux ordonnes
SELECT * FROM level_thresholds
ORDER BY level ASC;

-- Determiner le niveau d'un utilisateur avec 5000 XP
SELECT * FROM level_thresholds
WHERE xp_required <= 5000
ORDER BY xp_required DESC
LIMIT 1;

-- Prochain niveau pour un utilisateur
SELECT * FROM level_thresholds
WHERE xp_required > 5000
ORDER BY xp_required ASC
LIMIT 1;
```

## Statistiques

- Lignes: **30**
