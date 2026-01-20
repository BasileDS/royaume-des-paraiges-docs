# Functions PostgreSQL - Royaume des Paraiges

## Vue d'ensemble

La base de données contient **~27 fonctions** dans le schéma `public`.

## Index des Fonctions

### Fonctions Principales (Transactions)

| Fonction | Description | Sécurité |
|----------|-------------|----------|
| [create_receipt](./create_receipt.md) | Crée un reçu complet avec paiements et gains | SECURITY DEFINER |
| [calculate_gains](./calculate_gains.md) | Calcule XP et cashback pour un montant | - |
| [validate_coupons](./validate_coupons.md) | Valide les coupons avant utilisation | - |
| [validate_payment_methods](./validate_payment_methods.md) | Valide les méthodes de paiement | - |
| [check_cashback_balance](./check_cashback_balance.md) | Vérifie le solde cashback | - |

### Fonctions Système de Coupons Administrable (nouveau)

| Fonction | Description | Sécurité |
|----------|-------------|----------|
| `distribute_period_rewards_v2` | Distribue les récompenses leaderboard | SECURITY DEFINER |
| `create_manual_coupon` | Crée un coupon manuellement | SECURITY DEFINER |
| `get_period_preview` | Prévisualise une distribution | SECURITY DEFINER |
| `get_coupon_stats` | Statistiques des coupons | SECURITY DEFINER |

### Fonctions Leaderboard et Badges

| Fonction | Description | Sécurité |
|----------|-------------|----------|
| [distribute_leaderboard_rewards](./distribute_leaderboard_rewards.md) | Distribue récompenses aux TOP 10 (legacy) | SECURITY DEFINER |
| [award_user_badge](./award_user_badge.md) | Attribue un badge à un utilisateur | SECURITY DEFINER |
| [get_user_badges](./get_user_badges.md) | Récupère les badges d'un utilisateur | - |
| `get_period_identifier` | Calcule l'identifiant de période | IMMUTABLE |
| [check_period_closed](./check_period_closed.md) | Vérifie si période fermée | - |

### Fonctions Statistiques Utilisateur

| Fonction | Description | Sécurité |
|----------|-------------|----------|
| [get_user_cashback_balance](./get_user_cashback_balance.md) | Retourne le solde cashback | STABLE |
| [get_user_xp_stats](./get_user_xp_stats.md) | Retourne les stats XP | STABLE |
| [get_user_complete_stats](./get_user_complete_stats.md) | Retourne toutes les stats | STABLE |
| [get_user_info](./get_user_info.md) | Infos utilisateurs par IDs | SECURITY DEFINER |

### Fonctions Utilisateurs/Auth

| Fonction | Description | Sécurité |
|----------|-------------|----------|
| [handle_new_user](./handle_new_user.md) | Trigger: crée profil à l'inscription | SECURITY DEFINER |
| [handle_user_delete](./handle_user_delete.md) | Trigger: supprime profil | SECURITY DEFINER |
| [sync_auth_to_profiles](./sync_auth_to_profiles.md) | Synchronise auth.users → profiles | SECURITY DEFINER |
| [update_profile_from_auth](./update_profile_from_auth.md) | Met à jour profil depuis auth | SECURITY DEFINER |
| [get_current_user_role](./get_current_user_role.md) | Retourne le rôle de l'utilisateur | SECURITY DEFINER |
| [check_email_exists](./check_email_exists.md) | Vérifie si email existe | SECURITY DEFINER |

### Fonctions Trigger

| Fonction | Description | Retour |
|----------|-------------|--------|
| [create_spending_from_cashback_payment](./create_spending_from_cashback_payment.md) | Trigger: crée spending | TRIGGER |

### Fonctions Supprimées

| Fonction | Raison |
|----------|--------|
| ~~`check_and_create_weekly_coupon`~~ | Remplacé par système administrable |
| ~~`check_and_create_frequency_coupon`~~ | Remplacé par système administrable |
| ~~`create_weekly_coupon`~~ | Remplacé par système administrable |
| ~~`create_frequency_coupon`~~ | Remplacé par système administrable |

---

## Nouvelles Fonctions (Système de Coupons Administrable)

### get_period_identifier

Calcule l'identifiant de période pour un type et une date donnés.

```sql
SELECT get_period_identifier('weekly', '2026-01-20');
-- Retourne: '2026-W04'

SELECT get_period_identifier('monthly', '2026-01-20');
-- Retourne: '2026-01'

SELECT get_period_identifier('yearly', '2026-01-20');
-- Retourne: '2026'
```

### distribute_period_rewards_v2

Distribue les récompenses du leaderboard selon les `reward_tiers` configurés.

```sql
-- Distribution automatique (utilisé par pg_cron)
SELECT distribute_period_rewards_v2('weekly');

-- Distribution avec période spécifique
SELECT distribute_period_rewards_v2('weekly', '2026-W04');

-- Forcer une redistribution
SELECT distribute_period_rewards_v2('weekly', '2026-W04', true);

-- Mode prévisualisation (sans créer de coupons)
SELECT distribute_period_rewards_v2('weekly', '2026-W04', false, true);

-- Distribution manuelle par admin
SELECT distribute_period_rewards_v2('weekly', '2026-W04', false, false, 'admin-uuid');
```

**Retourne** : JSONB avec le résumé de la distribution

```json
{
  "success": true,
  "period_type": "weekly",
  "period_identifier": "2026-W04",
  "distributions": [
    {"rank": 1, "customer_id": "...", "coupon_id": 123, "tier": "Champion Hebdo"},
    {"rank": 2, "customer_id": "...", "coupon_id": 124, "tier": "Podium Hebdo"}
  ],
  "total_distributed": 10
}
```

### create_manual_coupon

Crée un coupon manuellement pour un utilisateur.

```sql
-- Depuis un template
SELECT create_manual_coupon(
  p_customer_id := 'user-uuid',
  p_template_id := 1,
  p_notes := 'Geste commercial',
  p_admin_id := 'admin-uuid'
);

-- Avec valeurs personnalisées
SELECT create_manual_coupon(
  p_customer_id := 'user-uuid',
  p_amount := 500,  -- 5€
  p_expires_at := now() + interval '30 days',
  p_notes := 'Compensation incident',
  p_admin_id := 'admin-uuid'
);
```

**Retourne** : JSONB avec le coupon créé

```json
{
  "success": true,
  "coupon_id": 125,
  "amount": 500,
  "expires_at": "2026-02-19T00:00:00Z"
}
```

### get_period_preview

Prévisualise qui recevrait quoi pour une période, sans créer de coupons.

```sql
SELECT get_period_preview('weekly', '2026-W04');
```

**Retourne** : JSONB avec la prévisualisation

```json
{
  "period_type": "weekly",
  "period_identifier": "2026-W04",
  "preview": [
    {
      "rank": 1,
      "customer_id": "...",
      "username": "john_doe",
      "xp": 1500,
      "tier": "Champion Hebdo",
      "reward": {"amount": 1000, "percentage": null}
    }
  ],
  "total_winners": 10
}
```

### get_coupon_stats

Retourne les statistiques des coupons pour le dashboard admin.

```sql
SELECT get_coupon_stats();
```

**Retourne** : JSONB avec les statistiques

```json
{
  "total_coupons": 150,
  "active_coupons": 45,
  "used_coupons": 100,
  "expired_coupons": 5,
  "total_value_distributed": 50000,
  "total_value_used": 35000,
  "by_distribution_type": {
    "leaderboard": 80,
    "manual": 20,
    "trigger_legacy": 50
  }
}
```

---

## Flux de la Fonction Principale

```
create_receipt()
├── 1. Vérification permissions (role)
├── 2. Récupération coefficients profil
├── 3. validate_coupons() ────────────────► Validation coupons
├── 4. validate_payment_methods() ────────► Validation paiements
├── 5. check_cashback_balance() ──────────► Vérification solde
├── 6. Calcul montant total
├── 7. INSERT receipts
├── 8. INSERT receipt_lines (paiements)
│      └── TRIGGER: create_spending_from_cashback_payment()
├── 9. INSERT receipt_lines (coupons)
├── 10. calculate_gains() ────────────────► Calcul XP/cashback
├── 11. INSERT gains
├── 12. UPDATE coupons (used = true)
└── 13. REFRESH MATERIALIZED VIEW
        ├── user_stats
        ├── weekly_xp_leaderboard
        └── monthly_xp_leaderboard
```

> **Note** : Les anciens triggers `trigger_weekly_coupon` et `trigger_frequency_coupon` ont été supprimés. Les coupons sont maintenant gérés via le système administrable.

## SECURITY DEFINER vs Standard

### SECURITY DEFINER

La fonction s'exécute avec les privilèges du **créateur** (généralement `postgres`), pas de l'appelant. Utilisé pour :

- Accéder à `auth.users` (table protégée)
- Bypass RLS pour certaines opérations
- Opérations administratives

```sql
CREATE FUNCTION my_func()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Important pour la sécurité
AS $$
BEGIN
  -- Peut accéder à auth.users
END;
$$;
```

### Fonction Standard

La fonction s'exécute avec les privilèges de l'**appelant**. RLS s'applique normalement.

## Bonnes Pratiques

1. **Toujours** utiliser `SET search_path = 'public'` avec SECURITY DEFINER
2. Valider les entrées utilisateur
3. Utiliser les transactions implicites (tout ou rien)
4. Retourner des objets JSON pour les erreurs

```sql
-- Pattern de retour d'erreur
RETURN jsonb_build_object(
  'success', false,
  'error', 'Message d''erreur'
);
```
