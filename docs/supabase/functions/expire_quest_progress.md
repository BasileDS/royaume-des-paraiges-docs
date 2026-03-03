# Function: expire_quest_progress

Expire les `quest_progress` encore en `in_progress` dont la periode est terminee. Executee automatiquement chaque jour a minuit via pg_cron.

## Signature

```sql
CREATE FUNCTION expire_quest_progress()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
```

## Parametres

Aucun parametre.

## Retour

```json
{
  "success": true,
  "expired_count": 42
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Toujours `true` |
| `expired_count` | `integer` | Nombre de quest_progress passes en `expired` |

## Logique

1. Identifie les `quest_progress` avec `status = 'in_progress'`
2. Joint avec `available_periods` via `period_type + period_identifier`
3. Verifie que `end_date < CURRENT_DATE` (la periode est terminee)
4. Passe le `status` a `expired` et met a jour `updated_at`

## Job pg_cron

| Job | Schedule | Description |
|-----|----------|-------------|
| `expire-quest-progress` | `0 0 * * *` | Tous les jours a minuit |

Ce job couvre toutes les periodicites (weekly, monthly, yearly) en une seule execution.

## Exemple d'utilisation

```sql
-- Execution manuelle
SELECT expire_quest_progress();
-- Resultat: {"success": true, "expired_count": 111}
```

## Notes

- `quest_progress.status` est un `VARCHAR(20)` avec CHECK constraint incluant `expired`
- La fonction utilise `SECURITY DEFINER` pour bypasser RLS
- Le job pg_cron s'execute quotidiennement, ce qui est suffisant car les periodes se terminent a la fin d'un jour
