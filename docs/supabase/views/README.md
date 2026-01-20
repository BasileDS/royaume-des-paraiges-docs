# Vues et Vues Matérialisées - Royaume des Paraiges

## Vue d'ensemble

La base contient **4 vues matérialisées** et **1 vue standard**.

## Vues Matérialisées

Les vues matérialisées stockent les résultats de requêtes complexes pour de meilleures performances. Elles doivent être **rafraîchies** pour être à jour.

### user_stats

**But** : Statistiques globales de chaque utilisateur (XP total, cashback).

```sql
CREATE MATERIALIZED VIEW user_stats AS
SELECT
  p.id AS customer_id,
  COALESCE(SUM(g.xp), 0) AS total_xp,
  COALESCE(SUM(g.cashback_money), 0) AS cashback_earned,
  COALESCE((
    SELECT SUM(rl.amount)
    FROM receipt_lines rl
    JOIN receipts r_sub ON r_sub.id = rl.receipt_id
    WHERE r_sub.customer_id = p.id
    AND rl.payment_method = 'cashback'
  ), 0) AS cashback_spent,
  (cashback_earned - cashback_spent) AS cashback_available
FROM profiles p
LEFT JOIN receipts r ON r.customer_id = p.id
LEFT JOIN gains g ON g.receipt_id = r.id
GROUP BY p.id;
```

**Colonnes** :

| Colonne | Type | Description |
|---------|------|-------------|
| `customer_id` | UUID | ID du profil |
| `total_xp` | BIGINT | XP total gagné |
| `cashback_earned` | BIGINT | Cashback total gagné (centimes) |
| `cashback_spent` | BIGINT | Cashback total dépensé (centimes) |
| `cashback_available` | BIGINT | Cashback disponible (centimes) |

**Utilisation** :

```typescript
const { data } = await supabase.rpc('get_user_cashback_balance', {
  p_customer_id: userId
});
```

---

### weekly_xp_leaderboard

**But** : Classement hebdomadaire des utilisateurs par XP.

```sql
CREATE MATERIALIZED VIEW weekly_xp_leaderboard AS
SELECT
  r.customer_id,
  COALESCE(SUM(g.xp), 0) AS weekly_xp,
  COUNT(DISTINCT r.id) AS weekly_receipt_count,
  COUNT(DISTINCT r.establishment_id) AS weekly_establishment_count,
  COALESCE(SUM(r.amount), 0) AS weekly_total_spent,
  MIN(r.created_at) AS first_receipt_at,
  ROW_NUMBER() OVER (
    ORDER BY COALESCE(SUM(g.xp), 0) DESC, MIN(r.created_at)
  ) AS rank
FROM receipts r
LEFT JOIN gains g ON g.receipt_id = r.id
WHERE r.created_at >= date_trunc('week', now())
  AND r.created_at < date_trunc('week', now()) + INTERVAL '7 days'
GROUP BY r.customer_id
HAVING COALESCE(SUM(g.xp), 0) > 0
ORDER BY rank;
```

**Colonnes** :

| Colonne | Type | Description |
|---------|------|-------------|
| `customer_id` | UUID | ID du profil |
| `weekly_xp` | BIGINT | XP gagné cette semaine |
| `weekly_receipt_count` | BIGINT | Nombre de receipts cette semaine |
| `weekly_establishment_count` | BIGINT | Établissements visités |
| `weekly_total_spent` | BIGINT | Total dépensé (centimes) |
| `first_receipt_at` | TIMESTAMPTZ | Premier receipt de la semaine |
| `rank` | BIGINT | Position dans le classement |

**Règle de départage** : En cas d'égalité d'XP, le premier à avoir fait un receipt gagne.

---

### monthly_xp_leaderboard

**But** : Classement mensuel des utilisateurs par XP.

```sql
CREATE MATERIALIZED VIEW monthly_xp_leaderboard AS
SELECT
  r.customer_id,
  COALESCE(SUM(g.xp), 0) AS monthly_xp,
  COUNT(DISTINCT r.id) AS monthly_receipt_count,
  COUNT(DISTINCT r.establishment_id) AS monthly_establishment_count,
  COALESCE(SUM(r.amount), 0) AS monthly_total_spent,
  MIN(r.created_at) AS first_receipt_at,
  ROW_NUMBER() OVER (
    ORDER BY COALESCE(SUM(g.xp), 0) DESC, MIN(r.created_at)
  ) AS rank
FROM receipts r
LEFT JOIN gains g ON g.receipt_id = r.id
WHERE r.created_at >= date_trunc('month', now())
  AND r.created_at < date_trunc('month', now()) + INTERVAL '1 month'
GROUP BY r.customer_id
HAVING COALESCE(SUM(g.xp), 0) > 0
ORDER BY rank;
```

**Colonnes** : Similaires à `weekly_xp_leaderboard` (préfixe `monthly_`).

---

### yearly_xp_leaderboard

**But** : Classement annuel des utilisateurs par XP.

```sql
CREATE MATERIALIZED VIEW yearly_xp_leaderboard AS
SELECT
  r.customer_id,
  COALESCE(SUM(g.xp), 0) AS yearly_xp,
  COUNT(DISTINCT r.id) AS yearly_receipt_count,
  COUNT(DISTINCT r.establishment_id) AS yearly_establishment_count,
  COALESCE(SUM(r.amount), 0) AS yearly_total_spent,
  MIN(r.created_at) AS first_receipt_at,
  ROW_NUMBER() OVER (
    ORDER BY COALESCE(SUM(g.xp), 0) DESC, MIN(r.created_at)
  ) AS rank
FROM receipts r
LEFT JOIN gains g ON g.receipt_id = r.id
WHERE r.created_at >= date_trunc('year', now())
  AND r.created_at < date_trunc('year', now()) + INTERVAL '1 year'
GROUP BY r.customer_id
HAVING COALESCE(SUM(g.xp), 0) > 0
ORDER BY rank;
```

---

## Rafraîchissement des Vues

### Automatique (dans create_receipt)

```sql
-- Dans create_receipt(), après création du gain
REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;
REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_xp_leaderboard;
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_xp_leaderboard;
```

### Manuel

```sql
-- Rafraîchir une vue spécifique
REFRESH MATERIALIZED VIEW user_stats;

-- Rafraîchir sans bloquer les lectures (nécessite un index unique)
REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;
```

### Via Cron Job (recommandé)

Pour un rafraîchissement périodique, utiliser pg_cron ou un service externe.

---

## Vue Standard

### reward_distribution_stats

**But** : Statistiques des distributions de récompenses leaderboard.

```sql
CREATE VIEW reward_distribution_stats AS
SELECT
  pc.period_type,
  pc.period_identifier,
  pc.rewards_distributed_count,
  pc.status,
  pc.distribution_duration_ms,
  pc.closed_at,
  COUNT(DISTINCT lrd.customer_id) AS unique_winners,
  COUNT(c.id) AS total_coupons_created,
  SUM(CASE WHEN c.amount IS NOT NULL THEN c.amount ELSE 0 END) AS total_euros_distributed,
  COUNT(ub.id) AS total_badges_awarded
FROM period_closures pc
LEFT JOIN leaderboard_reward_distributions lrd
  ON pc.period_type = lrd.period_type
  AND pc.period_identifier = lrd.period_identifier
LEFT JOIN coupons c
  ON c.id = lrd.coupon_amount_id OR c.id = lrd.coupon_percentage_id
LEFT JOIN user_badges ub
  ON ub.period_type = pc.period_type
  AND ub.period_identifier = pc.period_identifier
GROUP BY pc.id, pc.period_type, pc.period_identifier,
         pc.rewards_distributed_count, pc.status,
         pc.distribution_duration_ms, pc.closed_at
ORDER BY pc.closed_at DESC;
```

**Colonnes** :

| Colonne | Description |
|---------|-------------|
| `period_type` | weekly/monthly/yearly |
| `period_identifier` | Ex: 2025-W03 |
| `rewards_distributed_count` | Nombre de récompenses |
| `status` | success/partial/failed |
| `unique_winners` | Nombre de gagnants uniques |
| `total_coupons_created` | Coupons créés |
| `total_euros_distributed` | Total en centimes |
| `total_badges_awarded` | Badges attribués |

---

## Utilisation dans l'Application

### Leaderboard

```typescript
// Récupérer le leaderboard hebdomadaire avec profils
const { data: leaderboard } = await supabase
  .from('weekly_xp_leaderboard')
  .select(`
    *,
    profiles:customer_id (
      username,
      avatar_url,
      first_name,
      last_name
    )
  `)
  .order('rank')
  .limit(10);
```

### Stats Utilisateur

```typescript
// Via fonction RPC (recommandé)
const { data: stats } = await supabase.rpc('get_user_complete_stats', {
  p_customer_id: userId
});

// Ou directement depuis la vue
const { data } = await supabase
  .from('user_stats')
  .select('*')
  .eq('customer_id', userId)
  .single();
```

---

## Notes

- Les vues matérialisées ne sont **pas** mises à jour automatiquement
- `CONCURRENTLY` permet de rafraîchir sans bloquer les lectures
- Les utilisateurs avec 0 XP ne sont pas dans les leaderboards
- Le rang est recalculé à chaque rafraîchissement
