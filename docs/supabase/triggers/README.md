# Triggers - Royaume des Paraiges

## Vue d'ensemble

La base de données contient **1 trigger** actif dans le schéma `public`, plus des triggers sur `auth.users`.

> **Note** : Les triggers de création automatique de coupons (`trigger_weekly_coupon` et `trigger_frequency_coupon`) ont été supprimés et remplacés par le système de coupons administrable via l'interface admin.

## Liste des Triggers

### Triggers sur receipt_lines

| Trigger | Table | Événement | Timing | Fonction |
|---------|-------|-----------|--------|----------|
| `trigger_create_spending_on_cashback` | `receipt_lines` | INSERT | AFTER | `create_spending_from_cashback_payment()` |

### Triggers sur auth.users (schéma auth)

| Trigger | Table | Événement | Timing | Fonction |
|---------|-------|-----------|--------|----------|
| `on_auth_user_created` | `auth.users` | INSERT | AFTER | `handle_new_user()` |
| `on_auth_user_deleted` | `auth.users` | DELETE | BEFORE | `handle_user_delete()` |

---

## trigger_create_spending_on_cashback

**But** : Créer automatiquement un enregistrement `spending` lorsqu'un paiement en cashback est effectué.

### Définition

```sql
CREATE TRIGGER trigger_create_spending_on_cashback
  AFTER INSERT ON receipt_lines
  FOR EACH ROW
  EXECUTE FUNCTION create_spending_from_cashback_payment();
```

### Fonction Associée

```sql
CREATE FUNCTION create_spending_from_cashback_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
  v_establishment_id BIGINT;
BEGIN
  -- Vérifier si la méthode de paiement est 'cashback'
  IF NEW.payment_method = 'cashback' THEN

    -- Récupérer le customer_id et establishment_id depuis le receipt
    SELECT customer_id, establishment_id
    INTO v_customer_id, v_establishment_id
    FROM receipts
    WHERE id = NEW.receipt_id;

    -- Créer un spending correspondant
    INSERT INTO spendings (
      created_at,
      amount,
      customer_id,
      establishment_id,
      receipt_id
    ) VALUES (
      NEW.created_at,
      NEW.amount,
      v_customer_id,
      v_establishment_id,
      NEW.receipt_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Flux

```
INSERT receipt_line (payment_method = 'cashback')
         │
         ▼
  Trigger déclenché
         │
         ▼
  Récupération infos receipt
         │
         ▼
  INSERT spendings
```

---

## Triggers Supprimés (Migration vers Interface Admin)

Les triggers suivants ont été supprimés dans le cadre de la refonte du système de coupons :

### ~~trigger_weekly_coupon~~ (supprimé)

**Ancien comportement** : Créait automatiquement un coupon de 3,90€ lorsqu'un utilisateur dépensait plus de 50€ dans la semaine.

**Nouveau système** : Les récompenses sont maintenant gérées via :
- La table `coupon_templates` pour définir les modèles
- La table `reward_tiers` pour les paliers de récompenses
- La fonction `distribute_period_rewards_v2()` pour la distribution
- Les jobs pg_cron pour l'automatisation

### ~~trigger_frequency_coupon~~ (supprimé)

**Ancien comportement** : Créait automatiquement un coupon de 5% lorsqu'un utilisateur passait 10+ commandes dans la semaine.

**Nouveau système** : Idem que ci-dessus.

### Fonctions Supprimées

- ~~`check_and_create_weekly_coupon()`~~
- ~~`check_and_create_frequency_coupon()`~~

### Migration des Données

Les coupons existants créés par les anciens triggers ont été migrés avec `distribution_type = 'trigger_legacy'` pour conserver l'historique.

---

## Ordre d'Exécution

Lors d'un `INSERT` sur `receipts` via `create_receipt()` :

```
1. INSERT receipt
         │
2. INSERT receipt_lines (boucle)
         │
         └── Si payment_method = 'cashback':
             └── trigger_create_spending_on_cashback
```

## Notes

- Les triggers utilisent `SECURITY DEFINER` pour avoir les permissions d'insertion
- Les triggers sont **AFTER** pour s'assurer que la ligne principale est bien insérée
- Le système de coupons est maintenant géré via l'interface admin et les jobs cron (voir documentation pg_cron)
