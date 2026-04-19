# Table: season_snapshots

Photographie immuable du rang/XP/coefficient de chaque Compagnon à la fin d'une saison. Multi-saisons. Créée par la migration `007_season_lifecycle.sql` (avril 2026).

## Description

Au moment de la clôture annuelle (31/12), la fonction `snapshot_season(year)` insère une ligne par profil dans cette table. Elle sert ensuite de **source de vérité** pour la distribution des badges « mémoire de saison » (`award_season_rank_badges`) et reste consultable plusieurs années après.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Hérite des règles |
| **PK composite** | `(year, customer_id)` |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `year` | integer | Non | - | Année de la saison (ex. 2026) |
| `customer_id` | uuid | Non | - | FK → `profiles(id)` ON DELETE CASCADE |
| `max_level` | integer | Non | - | Niveau max atteint dans la saison (1-25) |
| `max_xp` | integer | Non | - | XP cumulé sur l'année |
| `max_coefficient` | integer | Non | - | Coefficient atteint (×100, 100-580) |
| `rank_name` | text | Non | - | Nom du rang (`Écuyer`, `Soldat`, ..., `Chevalier de la Table Ronde`) |
| `rank_slug` | text | Non | - | Slug aligné sur les badges (`ecuyer`, `chevalier_table_ronde`, ...) |
| `snapshotted_at` | timestamptz | Non | now() | Date de figement |

## Index

- PK : `(year, customer_id)`
- `idx_season_snapshots_year (year)`
- `idx_season_snapshots_customer (customer_id)`

## Idempotence

La PK composite garantit qu'on ne peut pas insérer deux snapshots pour le même profil dans la même année. La fonction `snapshot_season` utilise `ON CONFLICT DO NOTHING`.

## Exemples

```sql
-- Tous les Chevaliers de la Table Ronde de toutes les saisons
SELECT s.year, p.username, s.max_xp
FROM season_snapshots s
JOIN profiles p ON p.id = s.customer_id
WHERE s.rank_slug = 'chevalier_table_ronde'
ORDER BY s.year DESC, s.max_xp DESC;

-- Évolution d'un Compagnon sur plusieurs saisons
SELECT year, rank_name, max_level, max_xp
FROM season_snapshots
WHERE customer_id = 'uuid-customer'::uuid
ORDER BY year ASC;
```
