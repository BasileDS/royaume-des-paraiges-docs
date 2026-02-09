# Function: create_manual_coupon

Cree un coupon manuellement pour un client. Si le coupon est a montant fixe, il est automatiquement converti en bonus cashback (credite immediatement au solde du client).

## Signature

```sql
CREATE FUNCTION create_manual_coupon(
  p_customer_id UUID,
  p_template_id BIGINT DEFAULT NULL,
  p_amount INTEGER DEFAULT NULL,
  p_percentage INTEGER DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_validity_days INTEGER DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_admin_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
```

## Parametres

| Parametre | Type | Requis | Default | Description |
|-----------|------|--------|---------|-------------|
| `p_customer_id` | `UUID` | Oui | - | ID du client (profiles.id) |
| `p_template_id` | `BIGINT` | Non | `NULL` | ID du template a utiliser |
| `p_amount` | `INTEGER` | Non | `NULL` | Montant en centimes (si pas de template) |
| `p_percentage` | `INTEGER` | Non | `NULL` | Pourcentage (si pas de template) |
| `p_expires_at` | `TIMESTAMPTZ` | Non | `NULL` | Date d'expiration explicite |
| `p_validity_days` | `INTEGER` | Non | `NULL` | Jours de validite (alternative a expires_at) |
| `p_notes` | `TEXT` | Non | `NULL` | Notes admin (logguees dans distribution_logs) |
| `p_admin_id` | `UUID` | Non | `NULL` | ID de l'admin qui cree le coupon |

## Retour

Retourne un objet `JSONB` :

```json
{
  "success": true,
  "coupon_id": 123,
  "customer_id": "uuid",
  "amount": 500,
  "percentage": null,
  "expires_at": null,
  "is_bonus_cashback": true,
  "gain_id": 456
}
```

## Logique

1. Verifie que le customer existe
2. Si `p_template_id` fourni, charge le template et utilise ses valeurs (amount/percentage/validity_days)
3. Sinon, utilise `p_amount` ou `p_percentage` (l'un ou l'autre, pas les deux)
4. Determine si c'est un bonus cashback : `amount IS NOT NULL AND percentage IS NULL`
5. Cree le coupon :
   - **Bonus cashback** : `used=true`, `expires_at=NULL`
   - **Pourcentage** : `used=false`, avec expiration calculee
6. Si bonus cashback, appelle `credit_bonus_cashback()` avec `source_type='bonus_cashback_manual'`
7. Log dans `coupon_distribution_logs` avec `distribution_type='manual'`

## Exemple

```sql
-- Via template
SELECT create_manual_coupon(
  '123e4567-e89b-12d3-a456-426614174000'::UUID,
  p_template_id := 5,
  p_notes := 'Geste commercial',
  p_admin_id := 'admin-uuid'::UUID
);

-- Via montant fixe (bonus cashback)
SELECT create_manual_coupon(
  '123e4567-e89b-12d3-a456-426614174000'::UUID,
  p_amount := 500,  -- 5 EUR
  p_notes := 'Compensation',
  p_admin_id := 'admin-uuid'::UUID
);

-- Via pourcentage
SELECT create_manual_coupon(
  '123e4567-e89b-12d3-a456-426614174000'::UUID,
  p_percentage := 10,
  p_validity_days := 30,
  p_notes := 'Reduction 10%',
  p_admin_id := 'admin-uuid'::UUID
);
```

## Notes

- Appelee depuis l'admin via `couponService.ts`
- Les coupons montant fixe sont immediatement convertis en bonus cashback
- Les coupons pourcentage restent des coupons classiques utilisables sur commande
