# Tables - Royaume des Paraiges

## Vue d'ensemble

La base de données contient **18 tables** dans le schéma `public`. Toutes les tables ont **RLS activé**.

## Diagramme des Relations

```
┌─────────────────┐
│   auth.users    │
└────────┬────────┘
         │ 1:1
         ▼
┌─────────────────┐     ┌─────────────────┐
│    profiles     │◄────│     likes       │
│                 │◄────│    comments     │
│                 │◄────│     notes       │
│                 │◄────│    coupons      │
│                 │◄────│   user_badges   │
│                 │◄────│   spendings     │
└────────┬────────┘     └─────────────────┘
         │ 1:N
         ▼
┌─────────────────┐     ┌─────────────────┐
│    receipts     │────►│     gains       │
│                 │────►│  receipt_lines  │
│                 │────►│   spendings     │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│   badge_types   │────►│   user_badges   │
└─────────────────┘     └─────────────────┘

┌─────────────────────────────────────────┐
│   leaderboard_reward_distributions      │
│   ├── customer_id → profiles            │
│   ├── coupon_amount_id → coupons        │
│   └── coupon_percentage_id → coupons    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   Système de Coupons Administrable      │
├─────────────────────────────────────────┤
│   coupon_templates ──► reward_tiers     │
│          │                   │          │
│          ▼                   ▼          │
│       coupons    coupon_distribution_logs│
│                                         │
│   period_reward_configs                 │
└─────────────────────────────────────────┘
```

## Liste des Tables

### Tables Principales

| Table | Description | FK vers |
|-------|-------------|---------|
| [profiles](./profiles.md) | Profils utilisateurs | auth.users |
| [receipts](./receipts.md) | Tickets de caisse | profiles |
| [receipt_lines](./receipt_lines.md) | Lignes de paiement | receipts |
| [gains](./gains.md) | XP et cashback gagnés | receipts |

### Tables de Dépenses et Récompenses

| Table | Description | FK vers |
|-------|-------------|---------|
| [spendings](./spendings.md) | Dépenses de cashback | profiles, receipts |
| [coupons](./coupons.md) | Coupons de réduction | profiles, coupon_templates |

### Tables d'Interaction Sociale

| Table | Description | FK vers |
|-------|-------------|---------|
| [likes](./likes.md) | Likes sur contenus | profiles |
| [comments](./comments.md) | Commentaires | profiles |
| [notes](./notes.md) | Notes/évaluations | profiles |

### Tables de Badges et Leaderboard

| Table | Description | FK vers |
|-------|-------------|---------|
| [badge_types](./badge_types.md) | Définitions des badges | - |
| [user_badges](./user_badges.md) | Badges obtenus | profiles, badge_types |
| [leaderboard_reward_distributions](./leaderboard_reward_distributions.md) | Historique récompenses | profiles, coupons |
| [period_closures](./period_closures.md) | Clôtures de périodes | - |

### Tables du Système de Coupons Administrable (nouveau)

| Table | Description | FK vers |
|-------|-------------|---------|
| [coupon_templates](./coupon_templates.md) | Modèles de coupons réutilisables | profiles |
| [reward_tiers](./reward_tiers.md) | Paliers de récompenses leaderboard | coupon_templates, badge_types |
| [period_reward_configs](./period_reward_configs.md) | Config personnalisée par période | profiles |
| [coupon_distribution_logs](./coupon_distribution_logs.md) | Historique des distributions | profiles, coupons, coupon_templates, reward_tiers |

### Tables de Configuration

| Table | Description |
|-------|-------------|
| [constants](./constants.md) | Constantes de configuration |

## Types Personnalisés (Enums)

### user_role

Rôles des utilisateurs dans l'application.

```sql
CREATE TYPE user_role AS ENUM (
  'client',       -- Utilisateur standard
  'employee',     -- Employé d'établissement
  'establishment', -- Compte établissement
  'admin'         -- Administrateur
);
```

### payment_method

Méthodes de paiement acceptées.

```sql
CREATE TYPE payment_method AS ENUM (
  'card',     -- Carte bancaire
  'cash',     -- Espèces
  'cashback', -- Utilisation du solde cashback
  'coupon'    -- Utilisation d'un coupon
);
```

## Contraintes Uniques

| Table | Contrainte | Colonnes |
|-------|------------|----------|
| `profiles` | `profiles_username_key` | `username` |
| `badge_types` | `badge_types_slug_key` | `slug` |
| `user_badges` | `user_badges_customer_id_badge_id_period_identifier_key` | `customer_id`, `badge_id`, `period_identifier` |
| `leaderboard_reward_distributions` | `leaderboard_reward_distributi_customer_id_period_type_perio_key` | `customer_id`, `period_type`, `period_identifier` |
| `period_closures` | `period_closures_period_type_period_identifier_key` | `period_type`, `period_identifier` |
| `period_reward_configs` | `period_reward_configs_period_type_period_identifier_key` | `period_type`, `period_identifier` |

## Notes sur les Montants

**Important** : Tous les montants monétaires sont stockés en **centimes** (INTEGER).

- `amount = 100` → 1,00€
- `amount = 390` → 3,90€
- `amount = 5000` → 50,00€

Cela évite les problèmes de précision des nombres à virgule flottante.
