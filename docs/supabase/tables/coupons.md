# Table: coupons

Coupons de réduction des utilisateurs. Peut être un montant fixe ou un pourcentage.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `BIGINT` | Non | `identity` | PK auto-incrémentée |
| `created_at` | `TIMESTAMPTZ` | Non | `now()` | Date de création |
| `customer_id` | `UUID` | Non | - | FK vers profiles.id |
| `used` | `BOOLEAN` | Non | `false` | Coupon utilisé ? |
| `amount` | `INTEGER` | Oui | - | Montant fixe en centimes |
| `percentage` | `INTEGER` | Oui | - | Pourcentage de réduction |
| `template_id` | `BIGINT` | Oui | - | FK vers coupon_templates.id |
| `establishment_id` | `INTEGER` | Oui | - | Établissement valide (NULL = tous) |
| `expires_at` | `TIMESTAMPTZ` | Oui | - | Date d'expiration |
| `distribution_type` | `VARCHAR(50)` | Oui | - | Source du coupon |
| `period_identifier` | `VARCHAR(20)` | Oui | - | Période leaderboard associée |

## Clés

- **Primary Key** : `id` (BIGINT, identity)
- **Foreign Key** : `customer_id` → `profiles.id`
- **Foreign Key** : `template_id` → `coupon_templates.id`

## Types de Coupons

### Coupon Montant Fixe

```sql
-- Coupon de 3,90€
INSERT INTO coupons (customer_id, amount, percentage)
VALUES (user_id, 390, NULL);
```

### Coupon Pourcentage

```sql
-- Coupon de 5%
INSERT INTO coupons (customer_id, amount, percentage)
VALUES (user_id, NULL, 5);
```

## Types de Distribution

| Type | Description | Source |
|------|-------------|--------|
| `leaderboard` | Récompense de classement | Distribution automatique ou manuelle |
| `manual` | Coupon créé par admin | Interface admin |
| `trigger_legacy` | Ancien système (triggers) | Historique - plus utilisé |

## Sources de Création

### 1. Récompenses Leaderboard (nouveau système)

Créés via `distribute_period_rewards_v2()` selon les `reward_tiers` configurés.

| Tier | Période | Coupon |
|------|---------|--------|
| Champion | Hebdo/Mensuel/Annuel | Selon template |
| Podium | Hebdo/Mensuel/Annuel | Selon template |
| Top 10 | Hebdo/Mensuel/Annuel | Selon template |

### 2. Coupons Manuels

Créés par les administrateurs via `create_manual_coupon()`.

```sql
SELECT create_manual_coupon(
  p_customer_id := 'user-uuid',
  p_template_id := 1,
  p_notes := 'Geste commercial',
  p_admin_id := 'admin-uuid'
);
```

### 3. Coupons Legacy (historique)

Les anciens coupons créés par les triggers supprimés :
- ~~`trigger_weekly_coupon`~~ (50€/semaine → 3,90€)
- ~~`trigger_frequency_coupon`~~ (10 commandes → 5%)

Ces coupons ont `distribution_type = 'trigger_legacy'`.

## Expiration des Coupons

Les coupons peuvent avoir une date d'expiration (`expires_at`).

### Vérifier si un coupon est expiré

```typescript
const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
```

### Récupérer les coupons valides

```typescript
const { data: coupons } = await supabase
  .from('coupons')
  .select('*')
  .eq('customer_id', userId)
  .eq('used', false)
  .or('expires_at.is.null,expires_at.gt.now()');
```

## Restriction par Établissement

Un coupon peut être restreint à un établissement spécifique via `establishment_id`.

- `establishment_id = NULL` : Valide partout
- `establishment_id = X` : Valide uniquement à l'établissement X

## Utilisation d'un Coupon

Les coupons sont utilisés via `create_receipt()` :

```typescript
const result = await supabase.rpc('create_receipt', {
  p_customer_id: userId,
  p_establishment_id: 1,
  p_payment_methods: [{ method: 'card', amount: 1000 }],
  p_coupon_ids: [couponId1, couponId2]
});
```

Après utilisation, `used` passe à `true`.

## Validation des Coupons

La fonction `validate_coupons()` vérifie :

1. Le coupon existe
2. Le coupon appartient au client
3. Le coupon n'est pas déjà utilisé
4. Le coupon n'est pas expiré
5. Le coupon est valide pour l'établissement (si restreint)

```sql
SELECT validate_coupons(
  p_customer_id := '...',
  p_coupon_ids := ARRAY[1, 2, 3],
  p_establishment_id := 1
);
-- Retourne: {"valid": true, "total_amount": 780}
```

## Exemple d'Utilisation

```typescript
// Récupérer les coupons disponibles d'un utilisateur
const { data: coupons } = await supabase
  .from('coupons')
  .select(`
    *,
    template:template_id (name, validity_days)
  `)
  .eq('customer_id', userId)
  .eq('used', false)
  .or('expires_at.is.null,expires_at.gt.now()');

// Filtrer par type
const amountCoupons = coupons?.filter(c => c.amount !== null) || [];
const percentCoupons = coupons?.filter(c => c.percentage !== null) || [];

// Coupons bientôt expirés (7 jours)
const soonExpiring = coupons?.filter(c => {
  if (!c.expires_at) return false;
  const daysLeft = Math.ceil(
    (new Date(c.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return daysLeft <= 7 && daysLeft > 0;
});
```

## Notes

- Un coupon a SOIT un `amount`, SOIT un `percentage`, jamais les deux
- Les coupons ne peuvent pas être supprimés une fois utilisés (historique)
- La valeur d'un coupon pourcentage est calculée au moment de l'utilisation
- Les anciens coupons sans `distribution_type` ont été migrés vers `trigger_legacy`
- `expires_at = NULL` signifie pas d'expiration
