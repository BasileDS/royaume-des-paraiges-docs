# Table: coupon_distribution_logs

Historique détaillé de toutes les distributions de coupons. Permet le suivi et l'analyse des récompenses distribuées.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `BIGINT` | Non | `identity` | PK auto-incrémentée |
| `distribution_type` | `VARCHAR(50)` | Non | - | Type de distribution |
| `period_identifier` | `VARCHAR(20)` | Oui | - | Identifiant de période (si leaderboard) |
| `customer_id` | `UUID` | Non | - | FK vers profiles.id (bénéficiaire) |
| `coupon_id` | `BIGINT` | Oui | - | FK vers coupons.id (coupon créé) |
| `coupon_template_id` | `BIGINT` | Oui | - | FK vers coupon_templates.id |
| `rank` | `INTEGER` | Oui | - | Rang au moment de la distribution |
| `tier_id` | `BIGINT` | Oui | - | FK vers reward_tiers.id |
| `xp_at_distribution` | `INTEGER` | Oui | - | XP du joueur au moment de la distribution |
| `distributed_at` | `TIMESTAMPTZ` | Non | `now()` | Date de distribution |
| `distributed_by` | `UUID` | Oui | - | FK vers profiles.id (admin, NULL si auto) |
| `notes` | `TEXT` | Oui | - | Notes/commentaires |

## Clés

- **Primary Key** : `id` (BIGINT, identity)
- **Foreign Key** : `customer_id` → `profiles.id`
- **Foreign Key** : `coupon_id` → `coupons.id`
- **Foreign Key** : `coupon_template_id` → `coupon_templates.id`
- **Foreign Key** : `tier_id` → `reward_tiers.id`
- **Foreign Key** : `distributed_by` → `profiles.id`

## Types de Distribution

| Type | Description | Automatique |
|------|-------------|-------------|
| `leaderboard_weekly` | Récompense classement hebdomadaire | Oui (cron) |
| `leaderboard_monthly` | Récompense classement mensuel | Oui (cron) |
| `leaderboard_yearly` | Récompense classement annuel | Oui (cron) |
| `manual` | Coupon créé manuellement par admin | Non |
| `trigger_legacy` | Ancien système (triggers supprimés) | Historique |

## Utilisation

### Récupérer l'historique d'un utilisateur

```typescript
const { data: history } = await supabase
  .from('coupon_distribution_logs')
  .select(`
    *,
    coupon:coupon_id (
      amount,
      percentage,
      used,
      expires_at
    ),
    template:coupon_template_id (
      name
    ),
    tier:tier_id (
      name
    )
  `)
  .eq('customer_id', userId)
  .order('distributed_at', { ascending: false });
```

### Statistiques par période

```sql
SELECT
  period_identifier,
  COUNT(*) as total_distributions,
  COUNT(DISTINCT customer_id) as unique_winners,
  SUM(CASE WHEN rank = 1 THEN 1 ELSE 0 END) as champions
FROM coupon_distribution_logs
WHERE distribution_type = 'leaderboard_weekly'
GROUP BY period_identifier
ORDER BY period_identifier DESC;
```

### Récupérer les distributions d'une période

```typescript
const { data: logs } = await supabase
  .from('coupon_distribution_logs')
  .select(`
    *,
    customer:customer_id (
      username,
      first_name,
      last_name
    )
  `)
  .eq('distribution_type', 'leaderboard_weekly')
  .eq('period_identifier', '2026-W04')
  .order('rank');
```

### Distributions manuelles récentes

```typescript
const { data: manualLogs } = await supabase
  .from('coupon_distribution_logs')
  .select(`
    *,
    admin:distributed_by (username),
    customer:customer_id (username)
  `)
  .eq('distribution_type', 'manual')
  .order('distributed_at', { ascending: false })
  .limit(20);
```

## Relations

```
profiles ──────────► coupon_distribution_logs (customer_id)
profiles ──────────► coupon_distribution_logs (distributed_by)
coupons ───────────► coupon_distribution_logs (coupon_id)
coupon_templates ──► coupon_distribution_logs (coupon_template_id)
reward_tiers ──────► coupon_distribution_logs (tier_id)
```

## Politiques RLS

| Policy | Opération | Condition |
|--------|-----------|-----------|
| Admin read access | SELECT | `role = 'admin'` |

Seuls les administrateurs peuvent consulter les logs de distribution.

## Cas d'Usage Analytics

### Top gagnants par nombre de récompenses

```sql
SELECT
  p.username,
  COUNT(*) as total_rewards,
  COUNT(DISTINCT period_identifier) as periods_won
FROM coupon_distribution_logs cdl
JOIN profiles p ON p.id = cdl.customer_id
WHERE distribution_type LIKE 'leaderboard_%'
GROUP BY p.id, p.username
ORDER BY total_rewards DESC
LIMIT 10;
```

### Évolution des distributions par mois

```sql
SELECT
  DATE_TRUNC('month', distributed_at) as month,
  distribution_type,
  COUNT(*) as count
FROM coupon_distribution_logs
GROUP BY 1, 2
ORDER BY 1 DESC, 2;
```

## Notes

- `distributed_by = NULL` indique une distribution automatique (cron)
- `xp_at_distribution` permet de tracer l'XP au moment de la récompense
- Les logs ne sont jamais supprimés (historique complet)
- Table en lecture seule pour les analyses (pas de mise à jour manuelle)
