# Function: create_receipt

Fonction principale pour créer un reçu avec paiements, coupons et gains.

## Signature

```sql
CREATE FUNCTION create_receipt(
  p_customer_id UUID,
  p_establishment_id BIGINT,
  p_payment_methods JSONB,
  p_coupon_ids BIGINT[] DEFAULT ARRAY[]::BIGINT[]
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
```

## Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `p_customer_id` | `UUID` | ✅ | ID du client (profiles.id) |
| `p_establishment_id` | `BIGINT` | ✅ | ID de l'établissement (Directus) |
| `p_payment_methods` | `JSONB` | ✅ | Tableau des méthodes de paiement |
| `p_coupon_ids` | `BIGINT[]` | ❌ | IDs des coupons à utiliser |

### Format de p_payment_methods

```json
[
  {"method": "card", "amount": 1500},
  {"method": "cash", "amount": 500},
  {"method": "cashback", "amount": 300}
]
```

| Méthode | Description | Génère des gains |
|---------|-------------|------------------|
| `card` | Carte bancaire | ✅ |
| `cash` | Espèces | ✅ |
| `cashback` | Solde cashback | ❌ |
| `coupon` | Coupon (ajouté automatiquement) | ❌ |

## Retour

### Succès

```json
{
  "success": true,
  "receipt_id": 123,
  "total_amount": 2300,
  "payment_amount": 2000,
  "coupon_amount": 300,
  "gains": {
    "gain_id": 456,
    "xp_base": 150,
    "xp_coefficient": 100,
    "xp_gained": 150,
    "cashback_base": 75,
    "cashback_coefficient": 100,
    "cashback_gained": 75,
    "amount_for_gains": 1500
  },
  "cashback_balance": {
    "available_before": 1000,
    "spent": 300,
    "earned": 75,
    "available_after": 775
  },
  "coupons_used": 1
}
```

### Erreur

```json
{
  "success": false,
  "error": "Message d'erreur",
  "error_detail": "CODE_ERREUR"
}
```

## Étapes d'Exécution

1. **Vérification des permissions** - Seuls `employee`, `establishment`, `admin` peuvent créer
2. **Récupération des coefficients** - `xp_coefficient` et `cashback_coefficient` du profil
3. **Validation des coupons** - Via `validate_coupons()`
4. **Validation des paiements** - Via `validate_payment_methods()`
5. **Vérification du solde cashback** - Via `check_cashback_balance()`
6. **Calcul du montant total**
7. **Création du receipt**
8. **Création des receipt_lines** (paiements)
9. **Création des receipt_lines** (coupons)
10. **Calcul des gains** - Via `calculate_gains()`
11. **Création du gain**
12. **Mise à jour de la progression des quêtes** - Via `update_quest_progress_for_receipt()`
13. **Marquage des coupons utilisés**
14. **Rafraîchissement des vues matérialisées**

> **Note** : La mise à jour des quêtes (étape 12) est appelée explicitement après la création des gains pour garantir que les quêtes de type `xp_earned` puissent calculer correctement la progression XP.

## Exemple d'Utilisation

### TypeScript/JavaScript

```typescript
// Paiement simple en carte
const { data, error } = await supabase.rpc('create_receipt', {
  p_customer_id: customerId,
  p_establishment_id: 1,
  p_payment_methods: [
    { method: 'card', amount: 2500 }
  ]
});

// Paiement mixte avec cashback et coupon
const { data, error } = await supabase.rpc('create_receipt', {
  p_customer_id: customerId,
  p_establishment_id: 1,
  p_payment_methods: [
    { method: 'card', amount: 1500 },
    { method: 'cashback', amount: 500 }
  ],
  p_coupon_ids: [42]
});

if (data?.success) {
  console.log('XP gagnés:', data.gains.xp_gained);
  console.log('Cashback gagné:', data.gains.cashback_gained);
} else {
  console.error('Erreur:', data?.error);
}
```

### SQL Direct

```sql
SELECT create_receipt(
  p_customer_id := '123e4567-e89b-12d3-a456-426614174000'::UUID,
  p_establishment_id := 1,
  p_payment_methods := '[{"method": "card", "amount": 2500}]'::JSONB,
  p_coupon_ids := ARRAY[42]::BIGINT[]
);
```

## Triggers Déclenchés

Après l'insertion du receipt, deux triggers peuvent créer des coupons :

1. **trigger_weekly_coupon** - Si total semaine > 50€ → coupon 3,90€
2. **trigger_frequency_coupon** - Si ≥10 commandes semaine → coupon 5%

## Erreurs Possibles

| Erreur | Cause |
|--------|-------|
| `Permissions insuffisantes` | L'utilisateur n'est pas employee/admin/establishment |
| `Profil client non trouvé` | Le `customer_id` n'existe pas |
| `Coupon invalide` | Un coupon n'existe pas ou n'appartient pas au client |
| `Coupon déjà utilisé` | Un coupon a déjà été utilisé |
| `Solde cashback insuffisant` | Pas assez de cashback disponible |
| `Le montant total doit être positif` | Montant ≤ 0 |
| `Aucune méthode de paiement fournie` | Tableau de paiements vide |

## Notes

- La fonction est **transactionnelle** : en cas d'erreur, tout est annulé
- Les vues matérialisées sont rafraîchies **CONCURRENTLY** (non-bloquant)
- Les gains sont calculés uniquement sur les paiements `card` et `cash`
