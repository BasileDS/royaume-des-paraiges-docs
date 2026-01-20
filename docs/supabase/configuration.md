# Documentation Supabase - Royaume des Paraiges

## Informations Projet

| Propriete | Valeur |
|-----------|--------|
| **Project ID** | `uflgfsoekkgegdgecubb` |
| **Region** | - |
| **URL API** | `https://uflgfsoekkgegdgecubb.supabase.co` |

## Vue d'ensemble

Cette documentation decrit la configuration complete de la base de donnees Supabase pour l'application Royaume des Paraiges.

## Structure de la Documentation

```
supabase/docs/
├── SUPABASE-CONFIG.md           # Ce fichier
├── tables/                      # Structure des tables
│   ├── README.md               # Vue d'ensemble des tables
│   ├── profiles.md             # Table profiles
│   ├── receipts.md             # Table receipts
│   ├── gains.md                # Table gains
│   ├── coupons.md              # Table coupons
│   ├── coupon_templates.md     # Table coupon_templates (nouveau)
│   ├── reward_tiers.md         # Table reward_tiers (nouveau)
│   ├── period_reward_configs.md # Table period_reward_configs (nouveau)
│   ├── coupon_distribution_logs.md # Table coupon_distribution_logs (nouveau)
│   └── ...
├── functions/                   # Fonctions PostgreSQL
│   ├── README.md               # Index des fonctions
│   ├── create_receipt.md       # Fonction principale
│   └── ...
├── triggers/                    # Triggers
│   └── README.md
├── policies/                    # Politiques RLS
│   └── README.md
├── views/                       # Vues et vues materialisees
│   └── README.md
├── storage/                     # Buckets et policies storage
│   └── README.md
└── edge-functions/             # Edge Functions
    └── README.md
```

## Resume de la Base de Donnees

### Tables (18)

#### Tables existantes

| Table | Lignes | RLS | Description |
|-------|--------|-----|-------------|
| `profiles` | 18 | Oui | Profils utilisateurs |
| `receipts` | 55 | Oui | Tickets de caisse |
| `receipt_lines` | 55 | Oui | Lignes de paiement |
| `gains` | 55 | Oui | XP et cashback gagnes |
| `spendings` | 5 | Oui | Depenses cashback |
| `coupons` | 4 | Oui | Coupons de reduction |
| `likes` | 8 | Oui | Likes sur contenus |
| `comments` | 2 | Oui | Commentaires |
| `notes` | 0 | Oui | Notes/evaluations |
| `badge_types` | 9 | Oui | Definitions badges |
| `user_badges` | 2 | Oui | Badges obtenus |
| `leaderboard_reward_distributions` | 1 | Oui | Historique recompenses |
| `period_closures` | 1 | Oui | Clotures periodes |
| `constants` | 2 | Oui | Constantes config |

#### Nouvelles tables (Systeme de Coupons Administrable)

| Table | Lignes | RLS | Description |
|-------|--------|-----|-------------|
| `coupon_templates` | 5 | Oui | Modeles de coupons reutilisables |
| `reward_tiers` | 9 | Oui | Paliers de recompenses leaderboard |
| `period_reward_configs` | 0 | Oui | Config personnalisee par periode |
| `coupon_distribution_logs` | 0 | Oui | Historique des distributions |

### Types Personnalises (Enums)

| Enum | Valeurs |
|------|---------|
| `user_role` | `client`, `employee`, `establishment`, `admin` |
| `payment_method` | `card`, `cash`, `cashback`, `coupon` |

### Fonctions (~27)

Fonctions principales :
- `create_receipt` - Creation de recu avec paiements et gains
- `calculate_gains` - Calcul XP et cashback
- `distribute_leaderboard_rewards` - Distribution auto des recompenses (legacy)

Nouvelles fonctions (Systeme de Coupons Administrable) :
- `distribute_period_rewards_v2` - Distribution configurable des recompenses
- `create_manual_coupon` - Creation de coupon manuel
- `get_period_preview` - Previsualisation des distributions
- `get_coupon_stats` - Statistiques des coupons
- `get_period_identifier` - Calcul identifiant de periode

### Triggers (1)

| Trigger | Table | Description |
|---------|-------|-------------|
| `trigger_create_spending_on_cashback` | `receipt_lines` | Cree spending sur paiement cashback |

> **Note** : Les triggers `trigger_weekly_coupon` et `trigger_frequency_coupon` ont ete supprimes et remplaces par le systeme de coupons administrable.

### Jobs pg_cron (3)

| Job | Cron | Description |
|-----|------|-------------|
| `distribute-weekly-rewards` | `5 0 * * 1` | Distribution hebdo (Lundi 00:05 UTC) |
| `distribute-monthly-rewards` | `10 0 1 * *` | Distribution mensuelle (1er du mois 00:10 UTC) |
| `distribute-yearly-rewards` | `15 0 1 1 *` | Distribution annuelle (1er janvier 00:15 UTC) |

### Vues Materialisees (4)

- `user_stats` - Statistiques utilisateur (XP, cashback)
- `weekly_xp_leaderboard` - Classement hebdomadaire
- `monthly_xp_leaderboard` - Classement mensuel
- `yearly_xp_leaderboard` - Classement annuel

### Vues (1)

- `reward_distribution_stats` - Statistiques des distributions

### Storage Buckets (1)

- `avatars` - Photos de profil (public)

### Edge Functions (1)

- `send-contact-email` - Envoi d'emails de contact via Brevo

## Extensions Installees

| Extension | Description |
|-----------|-------------|
| `uuid-ossp` | Generation UUIDs |
| `pgcrypto` | Fonctions cryptographiques |
| `pg_graphql` | Support GraphQL |
| `pg_stat_statements` | Statistiques SQL |
| `supabase_vault` | Vault Supabase |
| `pg_cron` | Jobs cron PostgreSQL (nouveau) |

## Schema Relationnel

```
auth.users
    │
    └──► profiles (id = auth.uid())
            │
            ├──► likes (user_id)
            ├──► comments (customer_id)
            ├──► notes (customer_id)
            ├──► coupons (customer_id)
            ├──► user_badges (customer_id)
            ├──► leaderboard_reward_distributions (customer_id)
            ├──► spendings (customer_id)
            ├──► coupon_distribution_logs (customer_id, distributed_by)
            ├──► coupon_templates (created_by)
            ├──► period_reward_configs (distributed_by)
            │
            └──► receipts (customer_id)
                    │
                    ├──► receipt_lines (receipt_id)
                    ├──► gains (receipt_id)
                    └──► spendings (receipt_id)

badge_types ──► user_badges (badge_id)
            └──► reward_tiers (badge_type_id)

coupons ◄── leaderboard_reward_distributions (coupon_amount_id, coupon_percentage_id)
        ◄── coupon_distribution_logs (coupon_id)

coupon_templates ──► coupons (template_id)
                 └──► reward_tiers (coupon_template_id)
                 └──► coupon_distribution_logs (coupon_template_id)

reward_tiers ──► coupon_distribution_logs (tier_id)
```

## Flux de Donnees Principal

```
1. Client scanne ticket
         │
         ▼
2. create_receipt() appelee
         │
         ├──► Validation coupons (validate_coupons)
         ├──► Validation paiements (validate_payment_methods)
         ├──► Verification cashback (check_cashback_balance)
         │
         ▼
3. Creation receipt + receipt_lines
         │
         └──► Trigger: Si cashback → creation spending
         │
         ▼
4. Calcul gains (calculate_gains)
         │
         ├──► Application coefficients profil (xp_coefficient, cashback_coefficient)
         │
         ▼
5. Creation gain (XP + cashback)
         │
         ▼
6. Refresh vues materialisees
         │
         └──► user_stats, weekly/monthly_xp_leaderboard
```

## Flux de Distribution des Recompenses (nouveau)

```
1. Job pg_cron declenche (ou admin manuel)
         │
         ▼
2. distribute_period_rewards_v2() appelee
         │
         ├──► Recuperation leaderboard de la periode
         ├──► Recuperation reward_tiers actifs
         ├──► Verification period_reward_configs (custom_tiers ?)
         │
         ▼
3. Pour chaque utilisateur du TOP 10
         │
         ├──► Trouver le tier correspondant au rang
         ├──► Creer coupon depuis le template
         ├──► Calculer date d'expiration
         │
         ▼
4. Logging dans coupon_distribution_logs
         │
         ▼
5. Mise a jour period_reward_configs (status = 'distributed')
```

## Derniere mise a jour

- **Date** : 2026-01-20
- **Version** : 2.0.0
- **Changements** :
  - Ajout du systeme de coupons administrable
  - 4 nouvelles tables (coupon_templates, reward_tiers, period_reward_configs, coupon_distribution_logs)
  - 5 nouvelles colonnes sur la table coupons
  - Suppression des triggers automatiques de creation de coupons
  - Ajout de pg_cron pour les distributions automatiques
  - 4 nouvelles fonctions PostgreSQL
  - 4 nouvelles politiques RLS
