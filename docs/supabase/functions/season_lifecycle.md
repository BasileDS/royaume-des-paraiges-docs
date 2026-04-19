# Cycle de vie d'une saison

Migration de référence : `supabase/migrations/007_season_lifecycle.sql` (avril 2026).

Le cycle annuel se compose de **3 étapes idempotentes** + 1 helper de preview. Toutes les fonctions sont `SECURITY DEFINER`.

## Vue d'ensemble

```
                ┌─────────────────────┐
                │ preview_season_clo… │  (dry-run, lecture seule)
                └──────────┬──────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────────┐  ┌─────────────┐
│ snapshot_    │→ │ award_season_    │→ │ reset_      │
│ season(year) │  │ rank_badges(yr)  │  │ season(yr)  │
└──────────────┘  └──────────────────┘  └─────────────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           ▼
                  season_closure_log
                  (PK = year+step → idempotence)
```

## Fonctions

### `preview_season_closure(p_year integer) → jsonb`

**Stable, sans effet de bord.** Retourne :

```json
{
  "year": 2026,
  "total_profiles": 73,
  "rank_distribution": { "Écuyer": 66, "Soldat": 6, "Sergent": 1 },
  "total_pdb_earned_cents": 52374,
  "snapshot_done": false,
  "badges_done": false,
  "reset_done": false
}
```

Utilisée par l'UI admin `/rewards/season` pour le dry-run.

### `snapshot_season(p_year integer, p_source text default 'manual') → jsonb`

**Étape 1/3.** Insère une ligne dans `season_snapshots` pour chaque profil `role = 'client'` non supprimé. Lit le total XP de l'année via `gains.created_at >= make_timestamptz(p_year, 1, 1, 0, 0, 0, 'UTC')`.

Idempotente. Renvoie `{success, year, snapshotted, duration_ms}` ou `{success, skipped, reason: 'snapshot_already_done'}`.

### `award_season_rank_badges(p_year integer, p_source text default 'manual') → jsonb`

**Étape 2/3.** Garde : le snapshot doit exister. Garde : les 6 badges `season_rank_*` doivent exister dans `badge_types`.

Insère dans `user_badges (customer_id, badge_id, period_type='yearly', period_identifier=year, earned_at=NOW())`. ON CONFLICT DO NOTHING grâce à la contrainte UNIQUE `(customer_id, badge_id, period_identifier)`.

Idempotente. Renvoie `{success, year, badges_awarded, duration_ms}`.

### `reset_season(p_year integer, p_source text default 'manual') → jsonb`

**Étape 3/3.** Garde : les badges doivent avoir été distribués.

Met `profiles.cashback_coefficient = 100` pour tous les profils non supprimés où `cashback_coefficient <> 100`. **Ne touche PAS** :
- au `xp_coefficient` (réservé promos admin)
- aux `gains` (PdB conservées)
- aux `user_badges` (badges conservés)
- aux `season_snapshots` (mémoire conservée)

Le « niveau » se réinitialise implicitement car `get_season_xp` filtre par année courante.

Idempotente. Renvoie `{success, year, profiles_reset, duration_ms}`.

## Sources autorisées (`p_source`)

- `manual` : déclenché depuis l'UI admin `/rewards/season`
- `cron` : déclenché par pg_cron à l'heure principale (an 2+, à mettre en place)
- `cron_fallback` : déclenché par pg_cron de fallback (en cas d'échec du principal)
- `dry_run_aborted` : à n'utiliser que si on annule volontairement une simulation

## Ordre attendu

```sql
SELECT preview_season_closure(2026);  -- vérifier l'état avant
SELECT snapshot_season(2026);          -- 1/3
SELECT award_season_rank_badges(2026); -- 2/3 (échoue si 1 pas fait)
SELECT reset_season(2026);             -- 3/3 (échoue si 2 pas fait)
```

## An 1 vs an 2+

- **An 1 (décembre 2026)** : exécution **manuelle uniquement** depuis l'UI admin `/rewards/season`. Décision Basile : on observe le comportement réel avant d'automatiser.
- **An 2+ (décembre 2027)** : à automatiser via pg_cron — 3 crons principaux + 3 fallbacks (cf. `animation/01-fonctionnel/changelog-anticipe.md` § « Spec cron pour an 2+ »).

## Tables liées

- `season_snapshots` (cf. doc dédiée)
- `season_closure_log` (cf. doc dédiée — moteur d'idempotence)
- `level_thresholds` (lue par `compute_level_from_xp` indirectement)
- `gains` (lue pour calculer le XP de saison)
- `profiles` (modifiée par `reset_season`)
- `user_badges` (modifiée par `award_season_rank_badges`)
- `badge_types` (lue par `award_season_rank_badges`)
