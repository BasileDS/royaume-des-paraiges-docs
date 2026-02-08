# Politiques RLS (Row Level Security) - Royaume des Paraiges

## Vue d'ensemble

Toutes les tables ont **RLS activé**. La base contient **40 politiques** réparties sur les différentes tables.

## Concepts de Base

### Rôles Supabase

| Rôle | Description |
|------|-------------|
| `anon` | Utilisateur non authentifié |
| `authenticated` | Utilisateur authentifié |
| `public` | Les deux (anon + authenticated) |

### Fonctions Utiles

```sql
-- ID de l'utilisateur connecté
auth.uid()

-- Rôle de l'utilisateur (via fonction custom)
get_current_user_role()
```

---

## Politiques par Table

### profiles (5 policies)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Users can view their own profile | SELECT | authenticated | `auth.uid() = id` |
| Users can insert their own profile | INSERT | authenticated | `auth.uid() = id` |
| Users can update their own profile | UPDATE | authenticated | `auth.uid() = id` |
| Allow read public profile info for leaderboard | SELECT | authenticated | `true` |
| Establishments and Admins can read all profiles | SELECT | authenticated | `role IN ('establishment', 'admin')` |

**Note** : La politique "leaderboard" permet de voir les profils pour les classements.

```sql
-- Exemple: Lecture du profil pour le leaderboard
CREATE POLICY "Allow read public profile info for leaderboard"
ON profiles FOR SELECT
TO authenticated
USING (true);
```

---

### receipts (3 policies)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Users can read their own receipts | SELECT | authenticated | `auth.uid() = customer_id` |
| Waiters can read all receipts | SELECT | authenticated | `role = 'establishment'` |
| Admins can view all receipts | SELECT | authenticated | `role = 'admin'` |

```sql
-- Exemple: Employees/Establishments voient tous les receipts
CREATE POLICY "Waiters can read all receipts"
ON receipts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'establishment'
  )
);

-- Admins voient tous les receipts
CREATE POLICY "Admins can view all receipts"
ON receipts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'::user_role
  )
);
```

---

### receipt_lines (3 policies)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Clients can view their own receipt_lines | SELECT | authenticated | Via receipt → customer_id |
| Establishments can view their receipt_lines | SELECT | authenticated | Via receipt → establishment_id |
| Admins can view all receipt_lines | SELECT | authenticated | `role = 'admin'` |

```sql
-- Les clients voient uniquement leurs lignes via jointure receipt
CREATE POLICY "Clients can view their own receipt_lines"
ON receipt_lines FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM receipts
    WHERE receipts.id = receipt_lines.receipt_id
    AND receipts.customer_id = auth.uid()
  )
);
```

---

### gains (3 policies)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Users can read their own gains | SELECT | authenticated | Via receipt → customer_id |
| Waiters can read all gains | SELECT | authenticated | `role = 'establishment'` |
| Admins can view all gains | SELECT | authenticated | `role = 'admin'` |

---

### spendings (3 policies)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Users can read their own spendings | SELECT | authenticated | `auth.uid() = customer_id` |
| Establishments can read all spendings | SELECT | authenticated | `role = 'establishment'` |
| Establishments can create spendings | INSERT | authenticated | `role = 'establishment'` + même establishment |

```sql
-- Les establishments ne peuvent créer que pour leur établissement
CREATE POLICY "Establishments can create spendings for their establishment only"
ON spendings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'establishment'
    AND profiles.attached_establishment_id = spendings.establishment_id
  )
);
```

---

### coupons (6 policies)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Clients can see their coupons | SELECT | authenticated | `role = 'client'` |
| Employees can see their coupons | SELECT | public | `role = 'employee'` |
| Admins can see their coupons | SELECT | authenticated | `role = 'admin'` |
| Establishments can view all coupons | SELECT | authenticated | `role = 'establishment'` |
| Establishments can create coupons | INSERT | authenticated | `role = 'establishment'` |
| Establishments can update coupons | UPDATE | authenticated | `role = 'establishment'` |

---

### likes (4 policies)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Allow users to read all likes | SELECT | anon, authenticated | `true` |
| Allow users to like a content | INSERT | authenticated | `auth.uid() = user_id` |
| Allow user to update its likes status | UPDATE | authenticated | `auth.uid() = user_id` |
| Allow users to unlike a content | DELETE | authenticated | `auth.uid() = user_id` |

---

### comments (4 policies)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Allow everyone to read visible comments | SELECT | public | `hidden = false` |
| Allow users to create their own comments | INSERT | authenticated | `auth.uid() = customer_id` |
| Allow users to edit their own comments | UPDATE | authenticated | `auth.uid() = customer_id` |
| Allow users to delete their own comments | DELETE | authenticated | `auth.uid() = customer_id` |

**Note** : Les commentaires masqués (`hidden = true`) ne sont pas visibles.

---

### badge_types (1 policy)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Badge types are viewable by everyone | SELECT | public | `true` |

---

### user_badges (2 policies)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Users can view their own badges | SELECT | public | `auth.uid() = customer_id` |
| Users can view others' badges | SELECT | public | `true` |

---

### leaderboard_reward_distributions (1 policy)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Users can view their own reward history | SELECT | public | `auth.uid() = customer_id` |

---

### period_closures (1 policy)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Period closures are viewable by everyone | SELECT | public | `true` |

---

## Nouvelles Politiques (Système de Coupons Administrable)

### coupon_templates (1 policy)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Admin full access on coupon_templates | ALL | authenticated | `role = 'admin'` |

```sql
CREATE POLICY "Admin full access on coupon_templates"
ON coupon_templates FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

---

### reward_tiers (1 policy)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Admin full access on reward_tiers | ALL | authenticated | `role = 'admin'` |

```sql
CREATE POLICY "Admin full access on reward_tiers"
ON reward_tiers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

---

### period_reward_configs (1 policy)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Admin full access on period_reward_configs | ALL | authenticated | `role = 'admin'` |

```sql
CREATE POLICY "Admin full access on period_reward_configs"
ON period_reward_configs FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

---

### coupon_distribution_logs (1 policy)

| Policy | Opération | Rôles | Condition |
|--------|-----------|-------|-----------|
| Admin read access on coupon_distribution_logs | SELECT | authenticated | `role = 'admin'` |

```sql
CREATE POLICY "Admin read access on coupon_distribution_logs"
ON coupon_distribution_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

**Note** : Les logs de distribution sont en lecture seule, même pour les admins.

---

## Matrice des Permissions par Rôle

### client

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | own | own | own | ❌ |
| receipts | own | ❌ | ❌ | ❌ |
| gains | own | ❌ | ❌ | ❌ |
| coupons | own | ❌ | ❌ | ❌ |
| likes | all | own | own | own |
| comments | visible | own | own | own |
| badges | all | ❌ | ❌ | ❌ |
| coupon_templates | ❌ | ❌ | ❌ | ❌ |
| reward_tiers | ❌ | ❌ | ❌ | ❌ |

### employee

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | all (leaderboard) | ❌ | own | ❌ |
| receipts | all* | ✅ (via RPC) | ❌ | ❌ |
| coupons | own | ❌ | ❌ | ❌ |
| coupon_templates | ❌ | ❌ | ❌ | ❌ |
| reward_tiers | ❌ | ❌ | ❌ | ❌ |

### establishment

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | all | ❌ | ❌ | ❌ |
| receipts | all | ✅ (via RPC) | ❌ | ❌ |
| coupons | all | ✅ | ✅ | ❌ |
| spendings | all | own estab | ❌ | ❌ |
| coupon_templates | ❌ | ❌ | ❌ | ❌ |
| reward_tiers | ❌ | ❌ | ❌ | ❌ |

### admin

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| * | all | varies | varies | varies |
| receipts | ✅ | ❌ | ❌ | ❌ |
| gains | ✅ | ❌ | ❌ | ❌ |
| receipt_lines | ✅ | ❌ | ❌ | ❌ |
| coupon_templates | ✅ | ✅ | ✅ | ✅ |
| reward_tiers | ✅ | ✅ | ✅ | ✅ |
| period_reward_configs | ✅ | ✅ | ✅ | ✅ |
| coupon_distribution_logs | ✅ | ❌ | ❌ | ❌ |

---

## Tester les Politiques

```sql
-- Se connecter en tant qu'utilisateur spécifique
SET request.jwt.claims = '{"sub": "user-uuid-here"}';

-- Vérifier ce que l'utilisateur peut voir
SELECT * FROM profiles;
SELECT * FROM receipts;
```

## Notes Importantes

1. **RLS Bypass** : Les fonctions `SECURITY DEFINER` bypasse RLS
2. **Performance** : Les sous-requêtes dans les policies peuvent impacter les performances
3. **Jointures** : Certaines policies utilisent des jointures pour vérifier la propriété
4. **Rôles internes** : Le rôle (`user_role`) est dans `profiles`, pas dans Supabase Auth
5. **Nouvelles tables** : Les tables du système de coupons administrable sont réservées aux admins
