# Table: gains

XP et cashback gagnés par les utilisateurs. Un gain est créé pour chaque receipt.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `BIGINT` | ❌ | `identity` | PK auto-incrémentée |
| `created_at` | `TIMESTAMPTZ` | ❌ | `now()` | Date de création |
| `receipt_id` | `BIGINT` | ✅ | - | FK vers receipts.id |
| `xp` | `INTEGER` | ✅ | - | Points d'expérience gagnés |
| `cashback_money` | `INTEGER` | ✅ | - | Cashback gagné en centimes |
| `establishment_id` | `INTEGER` | ❌ | - | ID établissement (Directus) |

## Clés

- **Primary Key** : `id` (BIGINT, identity)
- **Foreign Key** : `receipt_id` → `receipts.id`

## Calcul des Gains

Les gains sont calculés par la fonction `calculate_gains()` :

```sql
-- Récupérer les taux depuis constants
SELECT value INTO v_xp_rate FROM constants WHERE key = 'xp_gains';
SELECT value INTO v_cashback_rate FROM constants WHERE key = 'cashback_percentage';

-- Calculs
v_xp_gained := ROUND((amount_in_cents / 100) * v_xp_rate);
v_cashback_gained := ROUND(amount_in_cents * v_cashback_rate / 100);
```

### Avec Coefficients Profil

Les gains de base sont multipliés par les coefficients du profil :

```sql
-- Exemple avec coefficient 150 (1.5x)
v_xp_final := ROUND(v_xp_base * xp_coefficient / 100);
v_cashback_final := ROUND(v_cashback_base * cashback_coefficient / 100);
```

## Exemple

Pour un paiement de 15€ (1500 centimes) avec :
- `xp_gains = 10` (10 XP par euro)
- `cashback_percentage = 5` (5% de cashback)
- `xp_coefficient = 150` (1.5x)
- `cashback_coefficient = 100` (1x)

```
XP base = 15 * 10 = 150 XP
XP final = 150 * 150 / 100 = 225 XP

Cashback base = 1500 * 5 / 100 = 75 centimes (0,75€)
Cashback final = 75 * 100 / 100 = 75 centimes (0,75€)
```

## Vues Matérialisées Associées

Les gains alimentent plusieurs vues :

- `user_stats` - Total XP et cashback par utilisateur
- `weekly_xp_leaderboard` - Classement XP hebdomadaire
- `monthly_xp_leaderboard` - Classement XP mensuel
- `yearly_xp_leaderboard` - Classement XP annuel

Ces vues sont rafraîchies automatiquement après chaque `create_receipt()`.

## Exemple d'Utilisation

```typescript
// Récupérer les gains d'un utilisateur
const { data: gains } = await supabase
  .from('gains')
  .select(`
    *,
    receipts!inner (
      amount,
      created_at,
      establishment_id
    )
  `)
  .eq('receipts.customer_id', userId);

// Calculer le total XP
const totalXp = gains?.reduce((sum, g) => sum + (g.xp || 0), 0) || 0;

// Calculer le cashback disponible
const totalCashback = gains?.reduce((sum, g) => sum + (g.cashback_money || 0), 0) || 0;
```

## Notes

- Un seul gain par receipt (relation 1:1)
- Les gains sont créés automatiquement par `create_receipt()`
- Le cashback gagné n'est pas immédiatement disponible (voir `user_stats`)
