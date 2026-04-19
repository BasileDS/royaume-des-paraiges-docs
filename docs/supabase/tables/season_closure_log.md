# Table: season_closure_log

Journal des étapes de clôture annuelle. Créée par la migration `007_season_lifecycle.sql` (avril 2026).

## Description

Chaque appel à `snapshot_season`, `award_season_rank_badges` ou `reset_season` insère une ligne ici. La PK composite `(year, step)` garantit qu'**une étape ne s'exécute qu'une seule fois** par année — c'est le moteur de l'idempotence du cycle.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Hérite des règles |
| **PK composite** | `(year, step)` |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `year` | integer | Non | - | Année de la saison |
| `step` | text | Non | - | `snapshot` / `award_badges` / `reset` (CHECK) |
| `executed_at` | timestamptz | Non | now() | Date d'exécution |
| `source` | text | Non | - | `cron` / `cron_fallback` / `manual` / `dry_run_aborted` (CHECK) |
| `affected_rows` | integer | Oui | - | Nombre de lignes impactées par l'étape |
| `duration_ms` | integer | Oui | - | Durée d'exécution en millisecondes |
| `notes` | text | Oui | - | Texte libre (généré par les fonctions) |

## Contraintes CHECK

- `step` ∈ `{snapshot, award_badges, reset}`
- `source` ∈ `{cron, cron_fallback, manual, dry_run_aborted}`

## Pattern d'idempotence

Chaque fonction commence par :

```sql
IF EXISTS (SELECT 1 FROM season_closure_log WHERE year = p_year AND step = '<step>') THEN
  RETURN jsonb_build_object('success', true, 'skipped', true, ...);
END IF;
```

…et termine par un INSERT du log. Conséquence : un appel à `snapshot_season(2026)` deux fois ne crée qu'une ligne et ne refait pas le travail.

## Pattern de garde sur prérequis

`award_season_rank_badges` exige qu'une ligne `(year, 'snapshot')` existe ; `reset_season` exige qu'une ligne `(year, 'award_badges')` existe. Sinon, exception.

## UI admin

La page `/rewards/season` lit cette table pour afficher l'état d'avancement (« Snapshot ✅ / Badges ⏳ / Reset ❌ ») et le journal détaillé en bas de page.

## Exemples

```sql
-- État de la clôture pour une saison
SELECT step, executed_at, source, affected_rows, duration_ms
FROM season_closure_log
WHERE year = 2026
ORDER BY executed_at;

-- Détecter les saisons partiellement clôturées
SELECT year, COUNT(*) AS steps_done
FROM season_closure_log
GROUP BY year
HAVING COUNT(*) < 3;
```
