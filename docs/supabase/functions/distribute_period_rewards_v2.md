# Function: distribute_period_rewards_v2

Distribue les recompenses du leaderboard pour une periode donnee. Supporte la previsualisation, les paliers configurables et le systeme bonus cashback.

## Signature

```sql
CREATE FUNCTION distribute_period_rewards_v2(
  p_period_type VARCHAR,
  p_period_identifier VARCHAR DEFAULT NULL,
  p_preview_only BOOLEAN DEFAULT false,
  p_force BOOLEAN DEFAULT false,
  p_admin_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
```

## Parametres

| Parametre | Type | Requis | Default | Description |
|-----------|------|--------|---------|-------------|
| `p_period_type` | `VARCHAR` | Oui | - | Type de periode: weekly, monthly, yearly |
| `p_period_identifier` | `VARCHAR` | Non | `NULL` | Identifiant de periode (ex: 2026-W06). Si NULL, utilise la periode courante |
| `p_preview_only` | `BOOLEAN` | Non | `false` | Si true, retourne un apercu sans distribuer |
| `p_force` | `BOOLEAN` | Non | `false` | Si true, force la distribution meme si deja effectuee |
| `p_admin_id` | `UUID` | Non | `NULL` | ID de l'admin qui declenche la distribution |

## Retour

### Mode preview (`p_preview_only = true`)

```json
{
  "success": true,
  "preview": true,
  "period_type": "weekly",
  "period_identifier": "2026-W06",
  "rewards_to_distribute": 3,
  "data": [
    {
      "customer_id": "uuid",
      "rank": 1,
      "xp": 150,
      "tier_name": "Top 1",
      "coupon_amount": 500,
      "coupon_percentage": null,
      "badge_type_id": 1
    }
  ]
}
```

### Mode distribution

```json
{
  "success": true,
  "period_type": "weekly",
  "period_identifier": "2026-W06",
  "rewards_distributed": 3,
  "duration_ms": 125,
  "errors": []
}
```

## Logique

1. Valide le `period_type` (weekly/monthly/yearly)
2. Determine le `period_identifier` si non fourni
3. Verifie l'idempotence : rejette si deja distribue (sauf `p_force=true`)
4. Charge les paliers : `period_reward_configs.custom_tiers` ou `reward_tiers` par defaut
5. Parcourt le leaderboard (vue materialisee) et associe chaque utilisateur a un palier
6. Pour chaque recompense :
   - Cree un coupon (amount ou percentage depuis le template)
   - Si montant fixe (bonus cashback) : `used=true`, appelle `credit_bonus_cashback()` avec `period_identifier`
   - Si badge configure : insere dans `user_badges`
   - Log dans `coupon_distribution_logs`
7. Met a jour `period_reward_configs` avec `status='distributed'`

## Vues materialisees utilisees

| period_type | Vue |
|-------------|-----|
| weekly | `weekly_xp_leaderboard` |
| monthly | `monthly_xp_leaderboard` |
| yearly | `yearly_xp_leaderboard` |

## Exemple

```sql
-- Previsualisation
SELECT distribute_period_rewards_v2(
  'weekly',
  '2026-W06',
  p_preview_only := true
);

-- Distribution
SELECT distribute_period_rewards_v2(
  'weekly',
  '2026-W06',
  p_admin_id := 'admin-uuid'::UUID
);

-- Force re-distribution
SELECT distribute_period_rewards_v2(
  'weekly',
  '2026-W06',
  p_force := true,
  p_admin_id := 'admin-uuid'::UUID
);
```

## Notes

- Remplace `distribute_leaderboard_rewards()` (legacy)
- Idempotente par defaut via `period_reward_configs`
- Les erreurs individuelles n'arretent pas la distribution globale
- Les coupons montant fixe sont immediatement convertis en bonus cashback
