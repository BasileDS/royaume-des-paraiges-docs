# Vues et Vues Materialisees

## Vues Materialisees (4)

Les vues materialisees stockent les resultats et doivent etre rafraichies periodiquement.


### monthly_xp_leaderboard

Leaderboard mensuel (1er au dernier jour du mois). Joindre avec profiles pour récupérer username, nom, etc.

```sql
 SELECT r.customer_id,
    COALESCE(sum(g.xp), 0::bigint) AS monthly_xp,
    count(DISTINCT r.id) AS monthly_receipt_count,
    count(DISTINCT r.establishment_id) AS monthly_establishment_count,
    COALESCE(sum(r.amount), 0::bigint) AS monthly_total_spent,
    min(r.created_at) AS first_receipt_at,
    row_number() OVER (ORDER BY (COALESCE(sum(g.xp), 0::bigint)) DESC, (min(r.created_at))) AS rank
   FROM receipts r
     LEFT JOIN gains g ON g.receipt_id = r.id
  WHERE r.created_at >= date_trunc('month'::text, now()) AND r.created_at < (date_trunc('month'::text, now()) + '1 mon'::interval)
  GROUP BY r.customer_id
 HAVING COALESCE(sum(g.xp), 0::bigint) > 0
  ORDER BY (row_number() OVER (ORDER BY (COALESCE(sum(g.xp), 0::bigint)) DESC, (min(r.created_at))));
```


### user_stats

Vue matérialisée combinant les statistiques XP et cashback par utilisateur.
Joint directement `profiles → gains` via `customer_id` (au lieu de passer par `receipts`), ce qui permet de comptabiliser les gains avec `receipt_id = NULL` (bonus cashback directs).

```sql
 SELECT p.id AS customer_id,
    COALESCE(sum(g.xp), 0::bigint) AS total_xp,
    COALESCE(sum(g.cashback_money), 0::bigint) AS cashback_earned,
    COALESCE(( SELECT sum(rl.amount) AS sum
           FROM receipt_lines rl
             JOIN receipts r_sub ON r_sub.id = rl.receipt_id
          WHERE r_sub.customer_id = p.id AND rl.payment_method = 'cashback'::payment_method), 0::bigint) AS cashback_spent,
    COALESCE(sum(g.cashback_money), 0::bigint) - COALESCE(( SELECT sum(rl.amount) AS sum
           FROM receipt_lines rl
             JOIN receipts r_sub ON r_sub.id = rl.receipt_id
          WHERE r_sub.customer_id = p.id AND rl.payment_method = 'cashback'::payment_method), 0::bigint) AS cashback_available
   FROM profiles p
     LEFT JOIN gains g ON g.customer_id = p.id
  GROUP BY p.id;
```


### weekly_xp_leaderboard

Leaderboard hebdomadaire (lundi-dimanche). Joindre avec profiles pour récupérer username, nom, etc.

```sql
 SELECT r.customer_id,
    COALESCE(sum(g.xp), 0::bigint) AS weekly_xp,
    count(DISTINCT r.id) AS weekly_receipt_count,
    count(DISTINCT r.establishment_id) AS weekly_establishment_count,
    COALESCE(sum(r.amount), 0::bigint) AS weekly_total_spent,
    min(r.created_at) AS first_receipt_at,
    row_number() OVER (ORDER BY (COALESCE(sum(g.xp), 0::bigint)) DESC, (min(r.created_at))) AS rank
   FROM receipts r
     LEFT JOIN gains g ON g.receipt_id = r.id
  WHERE r.created_at >= date_trunc('week'::text, now()) AND r.created_at < (date_trunc('week'::text, now()) + '7 days'::interval)
  GROUP BY r.customer_id
 HAVING COALESCE(sum(g.xp), 0::bigint) > 0
  ORDER BY (row_number() OVER (ORDER BY (COALESCE(sum(g.xp), 0::bigint)) DESC, (min(r.created_at))));
```


### yearly_xp_leaderboard

Leaderboard annuel (1er janvier au 31 décembre). Joindre avec profiles pour récupérer username, nom, etc.

```sql
 SELECT r.customer_id,
    COALESCE(sum(g.xp), 0::bigint) AS yearly_xp,
    count(DISTINCT r.id) AS yearly_receipt_count,
    count(DISTINCT r.establishment_id) AS yearly_establishment_count,
    COALESCE(sum(r.amount), 0::bigint) AS yearly_total_spent,
    min(r.created_at) AS first_receipt_at,
    row_number() OVER (ORDER BY (COALESCE(sum(g.xp), 0::bigint)) DESC, (min(r.created_at))) AS rank
   FROM receipts r
     LEFT JOIN gains g ON g.receipt_id = r.id
  WHERE r.created_at >= date_trunc('year'::text, now()) AND r.created_at < (date_trunc('year'::text, now()) + '1 year'::interval)
  GROUP BY r.customer_id
 HAVING COALESCE(sum(g.xp), 0::bigint) > 0
  ORDER BY (row_number() OVER (ORDER BY (COALESCE(sum(g.xp), 0::bigint)) DESC, (min(r.created_at))));
```


## Vues (1)


### reward_distribution_stats

Pas de description.

```sql
 SELECT pc.period_type,
    pc.period_identifier,
    pc.rewards_distributed_count,
    pc.status,
    pc.distribution_duration_ms,
    pc.closed_at,
    count(DISTINCT lrd.customer_id) AS unique_winners,
    count(c.id) AS total_coupons_created,
    sum(
        CASE
            WHEN c.amount IS NOT NULL THEN c.amount
            ELSE 0
        END) AS total_euros_distributed,
    count(ub.id) AS total_badges_awarded
   FROM period_closures pc
     LEFT JOIN leaderboard_reward_distributions lrd ON pc.period_type::text = lrd.period_type::text AND pc.period_identifier::text = lrd.period_identifier::text
     LEFT JOIN coupons c ON c.id = lrd.coupon_amount_id OR c.id = lrd.coupon_percentage_id
     LEFT JOIN user_badges ub ON ub.period_type::text = pc.period_type::text AND ub.period_identifier::text = pc.period_identifier::text
  GROUP BY pc.id, pc.period_type, pc.period_identifier, pc.rewards_distributed_count, pc.status, pc.distribution_duration_ms, pc.closed_at
  ORDER BY pc.closed_at DESC;
```

