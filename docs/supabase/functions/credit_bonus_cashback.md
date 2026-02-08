# Function: credit_bonus_cashback

Credite un bonus cashback directement au solde d'un utilisateur via la table `gains`.

## Signature

```sql
CREATE FUNCTION credit_bonus_cashback(
  p_customer_id UUID,
  p_amount INTEGER,
  p_coupon_id BIGINT,
  p_source_type VARCHAR DEFAULT 'bonus_cashback_manual'
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
```

## Parametres

| Parametre | Type | Requis | Default | Description |
|-----------|------|--------|---------|-------------|
| `p_customer_id` | `UUID` | Oui | - | ID du client (profiles.id) |
| `p_amount` | `INTEGER` | Oui | - | Montant en centimes |
| `p_coupon_id` | `BIGINT` | Oui | - | ID du coupon source (tracabilite) |
| `p_source_type` | `VARCHAR` | Non | `'bonus_cashback_manual'` | Type de source |

## Valeurs de p_source_type

| Valeur | Utilise par |
|--------|-------------|
| `bonus_cashback_manual` | `create_manual_coupon()` |
| `bonus_cashback_leaderboard` | `distribute_period_rewards_v2()` |
| `bonus_cashback_quest` | `distribute_quest_reward()` |
| `bonus_cashback_trigger` | `create_weekly_coupon()` |
| `bonus_cashback_migration` | Migration des anciens coupons |

## Retour

Retourne l'`id` du gain cree (`BIGINT`).

## Actions

1. Insere un `gains` avec `receipt_id=NULL`, `establishment_id=NULL`, `xp=0`, `cashback_money=p_amount`
2. Rafraichit la vue materialisee `user_stats` (CONCURRENTLY)

## Exemple

```sql
SELECT credit_bonus_cashback(
  '123e4567-e89b-12d3-a456-426614174000'::UUID,
  500,  -- 5 EUR
  42,   -- coupon_id
  'bonus_cashback_manual'
);
```

## Notes

- Appelee automatiquement par les fonctions de distribution quand un coupon a un montant fixe
- Le coupon associe doit etre cree au prealable avec `used=true`
